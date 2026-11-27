# 提示词数据同步技术方案（最终简化版）

> Review model update (2026-11-27): see [simplified review](simplified-review.md). The new exporter sends only approved, publishable records; the previous private D1 catalog model described below is historical. First run a verified dry-run and explicitly confirm the one-time large deletion. The schema and consumer clearance filter remain compatible during migration.

> 状态：设计已确认，尚未实施。本文替代之前包含多表、版本快照、发布指针、分布式锁的设计。
> 范围：只负责 GitHub → Cloudflare D1 / R2 的单向数据同步。不涉及网站 API、页面、SEO、生成器或用户行为数据。

## 1. 目标与原则

- GitHub 是唯一内容源；沿用现有采集、分类、去重和本地人工审核，不再建设另一套内容管理系统。
- D1 保存结构化提示词，R2 保存获准分发的媒体及缩略图。
- 图片、视频共用一张 `prompts` 表；当前只实现图片同步，预留视频数据结构。
- 全量读取有效源数据、批量 UPSERT、最后删除失效记录；R2 仅同步新增或变更媒体。
- 接受同步期间短暂的数据不一致，不需要原子版本发布；失败后重新执行完整同步即可。
- 不引入 gallery_state、版本号、发布指针、快照表、资产登记表、运行记录表、分布式锁、租约、状态机、独立对账任务或自动媒体垃圾回收。

## 2. 数据来源与导出

从当前 main 的完整工作树读取数据，而非逐个调用 GitHub Raw。

- `data/index/*.json`：原始案例及完整 `prompt.original`、`sourcePreview.images`、来源和权利信息。
- `data/governance/canonical.json`：最终 canonical ID 集合。
- `data/governance/cases.json`：治理后的分类、可见性和重复映射。
- `data/taxonomy.json`：分类定义。
- `data/review/exclusions.json`、`data/review/featured.json`：持久化人工排除与精选选择。
- 以现有 build/governance 输出及其实际规则为准，复用现有逻辑；不要另写一套去重、分类或精选规则。精选 null、空数组及有序数组的语义沿用现有实现。

执行现有 build/check，确认输入分片完整、canonical ID 唯一且可解析，再导出目标数据。保留完整原始 Prompt 格式、作者和原始来源；缺失作者可为空，不编造模型、描述、图片角色或输入要求。不得将原始未审核数据、排除数据、重复案例直接同步。

**内部同步与公开发布分离**：按最新要求，将全部有效 canonical 案例（不含已删除、淘汰或明确禁止/撤回的记录）同步到私有 D1 目录，保留原始 Prompt、分类、精选、来源及实际权利证据。D1 不等于公开发布集合。`author.publicationStatus` 为 `cleared` 或 `pending-review`；仅 `cleared` 可进入公开发布候选，待审核记录的媒体只存原始 URL 和角色，不下载、不上传 R2、不使用 R2 key。禁止公开访问待审核记录的文本或媒体，不得将其视作已有商业再发布许可。保持 D1 私有，后续上层应用须独立实施发布资格过滤。

## 3. D1：一张表

使用独立的公共内容数据库（建议名称 `prompts-db`，实际 ID 和名称配置时确定），不与订单、积分等业务表混用。

```sql
CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(tags)),
  input_mode TEXT NOT NULL,
  model TEXT,
  media TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(media)),
  author TEXT CHECK (author IS NULL OR json_valid(author)),
  source_url TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  featured_rank INTEGER,
  updated_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS prompts_type_slug
  ON prompts(media_type, slug);
CREATE INDEX IF NOT EXISTS prompts_type_category
  ON prompts(media_type, category);
CREATE INDEX IF NOT EXISTS prompts_type_featured
  ON prompts(media_type, featured, featured_rank);
```

- ID 沿用当前图片案例的稳定 ID；未来视频 ID 使用不冲突的命名空间（例如 video- 前缀），禁止跨类型覆盖。slug 默认使用稳定 ID，不因标题/分类变化而改变。
- media_type 表示最终输出类型，当前固定 image。input_mode 保留现有 text-to-image、reference-to-image、image-editing、unknown；未来扩展 text-to-video、image-to-video、video-to-video、reference-to-video。
- category 是治理后的分类 key；一级图片分组沿用现有 input_mode 与 galleryView 的映射（包括 unknown），不再冗余保存 gallery 字段。
- tags、media、author 为 JSON 序列化后的 TEXT。featured 为 0/1；featured_rank 可空，人工精选顺序按现有规则。updated_at 为 Unix 毫秒时间，表示同步写入时间（不是原帖发布日期）。
- UPSERT 按 id；执行前校验同 ID 不得属于其他 media_type，SQL 再以 WHERE prompts.media_type = excluded.media_type 防止跨类型更新。
- 不增加业务表、版本字段、content_hash 字段。允许每次重复写入约两千条记录。索引只保留必要的几个。

### 3.1 通用媒体 JSON

```ts
type PromptMedia = {
  type: 'image' | 'video';
  role: 'input' | 'output' | 'source-media';
  originalUrl: string;
  key?: string; // 待审核记录无 R2 key
  thumbnailKey?: string;
  width?: number;
  height?: number;
  duration?: number; // 视频秒数
};
```

数组顺序保留原始来源顺序及已有治理结果，角色未知时保留 source-media；不要将示例结果误标为输入图。获准上传的图片处理成功后应记录实际尺寸和缩略图 key；待审核记录不处理图片。未来视频案例可以同时包含参考图片、视频结果及封面，媒体的 type 与提示词 media_type 不必相同。暂不实现视频采集、处理或上传。

## 4. R2：增量媒体同步

生产工作流固定 bucket 名为 `prompt-media`。对象结构：

```text
images/originals/<sha256>.<ext>
images/thumbnails/v1/<sha256>.webp
videos/originals/<sha256>.<ext>   # 预留
videos/thumbnails/v1/<sha256>.webp # 预留
```

- 先读取 D1 当前同类型案例的媒体映射；按原始 URL 复用已有且有效的 R2 key。确认原图与缩略图对象存在（可按 key 去重检查）。
- URL 新增、变化、对象缺失或显式 force-media-refresh 时，下载源文件，校验实际格式、大小、尺寸及可解码性，计算原文件 SHA-256。使用实际文件格式确定扩展名；生成保持宽高比的 WebP 缩略图（建议最长边 640px、不放大，作为实现默认值）。
- 相同内容使用相同 key，已存在的对象不重复上传。缩略图策略变化时调整路径版本；此 v1 是图片处理规则版本，不是数据发布版本。
- URL 不变但内容改变的情况默认不主动检测，可通过手动刷新解决；不要声称 URL 相同必然内容相同。
- 上传完成并确认对象存在后，才能将该媒体引用写入 D1。下载/上传失败的新增案例跳过，已有案例保留旧记录；本次同步标记失败且不得执行普通批量删除。下次全量重跑。
- 普通下架只删除 D1 记录，不自动删除 R2 对象；存储治理以后按需增加。涉及权利撤回的案例立即下架，若媒体不再有合法引用，应及时清理对应 R2 对象及已知缓存；共享对象先核对其他合法引用，不能误删。

## 5. 同步流程

```ts
async function sync(mediaType = 'image') {
  const records = await exportGallery(mediaType);
  validateCompleteExport(records, mediaType);
  const existing = await loadExistingPrompts(mediaType);
  const sourceIds = new Set(records.map(r => r.id));

  // 明确的权利撤回独立处理，不等待普通媒体下载成功。
  await applyExplicitRightsWithdrawals(existing, records);

  // 新增/修改媒体先准备，失败记录保留旧值。
  const { ready, failures } = await syncMedia(records, existing);
  await upsertPromptsInBatches(ready, mediaType);

  if (failures.length) throw new Error('Media sync incomplete');

  // 仅完整导出且全部 UPSERT 成功后才能执行普通删除。
  // 自动任务若发现空集合或异常大规模删除，拒绝普通删除，
  // 检查原因后由同一 workflow 显式确认；不能把部分导出当完整导出。
  const staleIds = existing.filter(r => !sourceIds.has(r.id)).map(r => r.id);
  await checkDeletionSafety(staleIds, existing);
  await deletePromptsInBatches(staleIds, mediaType);
}
```

以上为逻辑示意；实现时删除计划及其安全检查尽量在普通写入前完成。权利撤回需要可信明确的治理/权限记录，不能凭下载失败推断，也不能因普通删除保护而延迟。

| 源数据操作 | 同步行为 |
| --- | --- |
| 新增案例 | 准备媒体，UPSERT 新记录 |
| 修改 Prompt、标题、分类、标签、精选 | UPSERT 同 ID，复用媒体 |
| 替换/新增媒体 | 上传新资源，更新 media |
| 人工删除、去重淘汰 | 完整同步后删除目标类型失效 ID |
| 恢复案例 | 再次 UPSERT，已有 R2 资源可复用 |
| 重复执行 | 主键 UPSERT、内容寻址资源复用，不产生重复数据 |
| 执行失败 | 已完成的普通写入允许保留，下次从头重跑 |

所有读取及删除按 media_type 隔离。即使当前全部是图片，也不得使用全表 TRUNCATE 或未限定类型的 DELETE。删除 ID 从完整有效导出集合与现有同类型 ID 的差集计算，不能从本次图片上传成功的子集计算。未来不同类型独立同步时不会互相删数据。

D1 使用参数化 SQL、分批执行；按实际 D1 请求、SQL 参数和批处理限制控制批大小，不能构造一个包含所有案例的巨型 SQL。网络暂时错误有限次重试，永久错误记录并退出非零。相同输入重跑最终内容一致（同步时间字段可更新）。无断点续传、事务跨 R2/D1、版本回滚、软删除或历史修订管理；需要恢复内容时恢复 GitHub 数据并重跑。

## 6. GitHub Actions 与文件结构

```text
scripts/export-gallery.mjs
scripts/sync-gallery.mjs
migrations/0001_prompts.sql
.github/workflows/sync-gallery.yml
```

- export-gallery：基于现有本地数据和治理逻辑导出、校验、记录资格排除；不自动重新抓取第三方来源。
- sync-gallery：读取 D1、同步 R2、批量 UPSERT、普通失效删除、日志；支持 dry-run（只读，不写 D1/R2）、force-media-refresh。
- migration：初始化一张表及索引，由人工配置数据库时执行；不在每次同步中自动进行破坏性迁移。
- workflow：main 上相关数据、治理、同步代码变化时触发；支持 workflow_dispatch 手动重跑、dry-run、媒体刷新及明确允许大规模普通删除的选项。
- 所有生产同步走同一个 concurrency group，cancel-in-progress: false。获得执行资格后 checkout 最新 main，避免排队旧提交覆盖新数据。运行期间若 main 再次变化，允许本轮完成，下一轮同步最新内容；不要部署其他并行写入脚本。
- 使用 Node.js 22+，复用现有 npm run build / npm run check。媒体工具和 Cloudflare 客户端按实现需要选择；不新增独立后台服务。
- Cloudflare account ID、D1 database ID 等非密钥配置使用 Actions Variables；R2 bucket 名在工作流中固定为 `prompt-media`；D1 API token 和 R2 凭据使用最小权限 Secrets（限制目标资源，能限制时按 bucket 限制）。不提交凭据、不打印签名或密钥。
- 现有 upstream sync.yml 的采集与 PR 流程保持不变；只同步已进入 main 的内容。

日志至少记录源 commit、媒体类型、导出/排除数量、待删除数量、UPSERT/DELETE 数量、复用/上传/失败媒体数量与错误原因。GitHub Actions 日志足够，无需数据库任务记录表。异常普通删除保护默认可设为超过现有同类型记录的 20% 或非空变空，需要手动确认；首次空数据库导入不受比例影响。明确权利撤回不受此保护阻塞。没有自动定期对账；手动重跑本身就是对账。

## 7. 实施与验收

1. 确认现有治理、审核、精选及权利数据的具体 schema，完成导出器及测试。
2. 配置独立 D1 / R2、最小权限凭据，执行迁移；先 dry-run 查看资格排除和差异。
3. 完成 R2 处理与 D1 批量同步；使用隔离测试资源跑集成测试。
4. 配置 main 自动触发；确认首次实际同步结果，不假定全部仓库案例都可发布。

必测场景：

- 新增、修改完整 Prompt、分类调整、精选排序、取消精选、人工删除、去重淘汰及恢复均能同步。
- 重复执行同一输入不增加重复记录或重复 R2 对象；图片 URL 未变时复用，URL 变化及强制刷新可更新。
- 部分图片失败、D1 批次失败、源分片缺失、空/异常缩小导出时，不执行普通失效删除；重跑可恢复。
- 无权利依据的记录仅进入私有 D1 内部目录，不进入公开发布集合，媒体不上传 R2；明确撤回能及时下架。
- 模拟 video 数据后运行 image 同步，不改变 video 记录；跨类型 ID 碰撞必须拒绝。
- 同一 workflow 连续提交与手动重跑不导致旧任务覆盖最新 main；dry-run 不写入任何云资源。
- 最终 D1 指定类型的 ID 集合与完整有效导出一致，已授权媒体 key 对应真实 R2 对象，待审核媒体无 R2 key；核对完整 Prompt、分类、作者、精选和媒体角色。

## 8. 明确不做

上层网站调用、页面、搜索、SEO、用户数据；视频实际处理；发布快照和 gallery_state；增量记录修订、任务数据库、复杂分布式协调；自动 R2 GC 和定期对账。

最终交付是可重复执行的单向数据发布脚本、一张 D1 表和一个自动化 workflow。接受同步期间短暂缺失或新旧混合；不接受误删全表、跨类型覆盖、无资格发布或引用未上传资源。

## 9. 实施配置与操作

代码已在本仓库实现；云端首次执行仍需配置资源并完成验证。

1. 在 Cloudflare 创建独立 D1（建议 prompts-db）及 R2 bucket（建议 prompt-media）。用 D1 控制台执行 `migrations/0001_prompts.sql`，不要在业务数据库执行。
2. 仓库 Settings → Secrets and variables → Actions：
   - Variables：`CLOUDFLARE_ACCOUNT_ID`、`GALLERY_D1_DATABASE_ID`。R2 bucket 已固定为 `prompt-media`，无需配置额外变量。
   - Secrets：`GALLERY_D1_API_TOKEN`（目标 D1 读写）、`GALLERY_R2_ACCESS_KEY_ID`、`GALLERY_R2_SECRET_ACCESS_KEY`（目标 bucket 对象读写）。
   - 无需额外启用变量。创建资源、执行迁移并配置上述两项 Variables 和三项 Secrets 后，main 上数据、脚本或迁移文件变化将自动触发正式同步。仅修改工作流或文档不会触发同步；首次请手动执行 dry_run=true。如需暂停自动同步，直接 Disable workflow。
3. 手动运行 Sync prompt gallery，保持 dry_run=true，核对数量和删除计划；此模式仅查询 D1，不下载媒体或写入 D1/R2。首次确认后手动关闭 dry_run 正式同步。
4. 同步失败可直接重跑。需要重新下载媒体时开启 force_media_refresh；大规模普通删除必须检查计划后显式开启 allow_large_delete。
5. 本地只检查导出：`node scripts/export-gallery.mjs` 或 `node scripts/sync-gallery.mjs --export-only`，均不需要云端凭据。生产写入仅走同一 Actions workflow。

实现说明：
- D1 使用参数化 REST SQL，每次最多 5 条 UPSERT；R2 使用 AWS CLI S3 兼容 API，图片通过 Pillow 11.3.0 校验、缩略图压缩。不新增 npm 运行时依赖。
- 手工精选完整列表全部同步，README 的 30 条展示上限不限制 D1；legacy null 自动精选沿用现有 README 选择逻辑。缺失描述/模型时为空。
- 目前仅将仓库已有明确 CC BY 4.0 双项授权证据或 X 逐资产许可的案例标为 cleared 并同步媒体到 R2；其他有效案例标为 pending-review，仅同步内部目录数据和原始媒体地址到私有 D1。授权及归属元数据保留在 author JSON 中。明确撤回的记录排除；实际可导出数量以运行结果为准。
- 权利撤回先下架已知失去许可的记录并检查 D1 图片/视频引用再清理 R2。如果撤回删除失败，Actions 日志保存候选对象 key；人工再次检查两种类型全部引用后重试 R2 删除，必要时清理已知 CDN 缓存。普通下架不做 R2 清理。
- 目前可处理 JPEG、PNG、WebP 和 GIF，单文件上限 25 MiB，缩略图最长边 640px；其他格式明确报错，不会将失败当成已同步。
- `npm test` 包含同步流程的模拟适配器测试和 SQLite 迁移测试；真实 D1/R2 集成验证需配置隔离测试资源。不能把模拟测试当作生产同步成功。

### 私有目录同步后的数量核查

```sql
SELECT json_extract(author, '$.publicationStatus') AS publication_status, COUNT(*) AS total
FROM prompts WHERE media_type = 'image' GROUP BY publication_status;
```

该 SQL 仅用于私有 D1 运维核查；不要将整个表直接作为公开内容源。
