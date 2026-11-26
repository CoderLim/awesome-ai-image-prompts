---
name: collect-x-prompts
description: Collect AI image prompts from an X/Twitter account into awesome-ai-image-prompts catalog shards shaped like data/index/aweniai-001.json. Use when the user asks to scrape/collect prompts from an X user (@handle), with a time range (week/month/year/2y or dates), and wants complete prompts plus generated images as index-ready JSON. Triggers include collect-x-prompts, 采集 X 提示词, 从推特收集 prompt, AWENIAI-style import prep.
---

# Collect X prompts → catalog shard

Collect **complete reusable prompts + source images** from one X account into records matching `data/index/aweniai-001.json`.

## Inputs

| Arg | Required | Examples |
|---|---|---|
| `username` | yes | `AWENIAI` / `@AWENIAI` |
| `range` | yes | `week` `month` `year` `2y` `2024-11-26` `2024-11-26..2026-11-26` |

Optional: `sourceId` (default = lowercased handle without `@`), `outDir` (default `data/index` or a temp dir until user confirms import).

Resolve dates first:

```bash
node .claude/skills/collect-x-prompts/scripts/resolve-range.mjs <range>
```

## Hard rules (this repo)

Read root `AGENTS.md` before writing into `data/index`. Especially:

- Do **not** invent prompts, OCR image text into prompts, or fabricate media URLs.
- Missing full prompt → keep as discovery/link-only or drop; never fake `prompt.original`.
- Rights default `unknown`. Public X posts ≠ redistribution clearance.
- Do not run `npm run sync` unless asked. Catalog write is manual / owner-directed.
- Prefer writing a review queue under `.cache/review-queues/` first; only copy into `data/index` after the user confirms import.

Schema details: [references/record-schema.md](references/record-schema.md).

## Workflow

### 1. Browser / auth

```bash
opencli doctor
opencli twitter whoami -f json
```

Need logged-in cookie session. If not: `opencli twitter login`.

### 2. Fetch posts in range

Strip leading `@`. Use `since` / `until` from `resolve-range.mjs`.

```bash
# Image posts (primary media candidates)
opencli twitter search "since:<SINCE> until:<UNTIL>" --from <USER> --has images --exclude replies --exclude retweets --product live --limit 200 -f json > /tmp/x-<user>-images.json

# Prompt-keyword sweep (catches text-only prompt follow-ups)
opencli twitter search "提示词 OR prompt since:<SINCE> until:<UNTIL>" --from <USER> --product live --limit 200 -f json > /tmp/x-<user>-promptkw.json

# Timeline backfill if account volume is modest
opencli twitter tweets <USER> --limit 500 --page-delay 2 -f json > /tmp/x-<user>-timeline.json
```

Merge by tweet `id`. Ignore retweets.

### 3. Eligibility: complete prompt + images

Keep a case only when **both** exist (same post or reliably paired nearby posts):

**Reusable prompt body** (after stripping `提示词：` / arrow lines / trailing promo links):

- Length typically ≥200, and ≥2 instruction signals such as: `将上传` `上传照片` `生成一张` `上半` `下半` `3:4` `竖版` `最终只输出` `Transform the uploaded` …
- Reject Day marketing blurbs that only say “附绝美提示词” without instructions.
- If text says `完整提示词地址` / points to paywalled library and body is a short teaser → **incomplete** (do not treat as full).
- Drop truncated bodies ending mid-clause (`：` / `提示词地址：` / unfinished sentence).

**Images**: `has_media` with `media_urls` on X (`pbs.twimg.com`).

**Pairing** (common for Day series):

- Image post: examples / Day card
- Prompt post: same author within ~2–3 hours, starts with `提示词`
- Gallery media URL/postId from **image post**; store `promptPostUrl` / `promptPostId` when paired

Optional cleanup: strip branding prefixes like `阿文提示词｜` / `阿文提示词 V3.0｜` from `prompt.original` when the user wants clean prompts—record that you changed formatting.

### 4. Classify

Pick one best-fit `category` from `data/taxonomy.json`.

- Photo→poster / diptych creative transforms: often `posters` or `illustrations` / `creative-art` with `inputMode: "reference-to-image"`.
- If category is `restyle`, set `type: "editing"`.
- Prefer prompt text over fancy titles.

### 5. Emit intermediate JSON → shard

Write `/tmp/x-<user>-cases.json` as an array of intermediate objects (`title`, `category`, `inputMode`, `prompt`, `images`, `url`, `postId`, `publishedAt`, `author`, optional pairing fields). Then:

```bash
node .claude/skills/collect-x-prompts/scripts/build-index-shard.mjs \
  /tmp/x-<user>-cases.json \
  /tmp/x-<user>-out \
  <sourceId>
```

Output files look like `aweniai-001.json`: pretty-printed array, 80 cases per shard, with `snapshotSha256`, `rights.unknown`, and `sourceMeta.review`.

### 6. Deliver to user

Return:

1. Path(s) to generated shard JSON
2. Counts: fetched / eligible / incomplete teasers
3. Date window used
4. Note: rights unverified; not auto-imported

If the user asks to **入库**:

1. Copy shard(s) → `data/index/`
2. Register source in `data/sources.json` (`mode: manual-collector-export`, `snapshotSha256`)
3. Extend `scripts/validate.mjs` image-host allowlist for `pbs.twimg.com` if this is a new X source pattern (aweniai already allowed)
4. Update `SOURCES.md` / `AGENTS.md` additional source notes
5. `npm run build && npm run check`

## Quality checklist

- [ ] Every record has nonempty `prompt.original` and ≥1 https image
- [ ] `type`/`category` valid in taxonomy
- [ ] `promptExcerpt` ≤100 Unicode characters
- [ ] No duplicate `id` against existing `data/index`
- [ ] No fabricated prompts from screenshots
- [ ] User told rights remain unknown
