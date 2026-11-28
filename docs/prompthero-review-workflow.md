# PromptHero review workflow (local only)

Do not use the preflight queue as an import package. It is a worklist, not a curated catalog. It never changes data/index or generated pages.

## 1. Reconstruct a queue

From a checkout of the current main, run Node.js 22+:
```bash
node scripts/prompthero-preflight.mjs /absolute/path/collector.jsonl /absolute/path/new-review-directory
node --test scripts/prompthero-preflight.test.mjs
```

The output directory must not exist. Keep the original export and review files outside the public repository. The command reads every data/index shard, checks existing case IDs, original post IDs and normalized complete prompts, groups remaining exact duplicates and records excluded-to-kept mappings. It produces queue.jsonl, audit.jsonl and summary.json, including a source SHA-256. The queue representative prefers attribution, image URL availability, source-reported engagement and a stable ID tie-break. This is only a preflight ranking, not evidence of quality or rights.

Heuristic flags are hints, not approval/rejection. Do not infer input mode from a nonempty referenceImageUrls array (it may contain output thumbnails). The historic ordinary/deferred split cannot be recovered from counts alone. If the old per-ID decision file is unavailable, re-review the reconstructed queue and label the historical bucket unrecovered.

## 2. Text review

Start with a stratified 50-case calibration across model families and prompt lengths; then process every remaining candidate in batches of 20–30. Read the full source prompt, not the preview. Decide advance (eligible for content import review), hold (uncertainty, missing context, possible near-duplicate), or reject (no usable prompt, simple prompt-free utility, video-only, or out of scope). Record category, input mode, reason, reviewer/version and evidence; use the existing taxonomy. Do not reject a good concise prompt solely for its length or a model for its age. Preserve negative prompts and model-specific parameter requirements. Keep generative and reference galleries separate; editing tasks map to the reference gallery.

## 3. Visual, duplicate and source verification

Actual source media inspection is optional for surviving cases; when performed, Record fetch status separately from visual quality, image-prompt match, actual input/output role and review evidence. Missing reference assets stay unknown. No invented images, prompt completion, model or creator. Missing author names remain null for this PromptHero batch; do not perform additional author lookup or treat opaque account IDs as verified handles. Similar prompts or media hashes are review candidates, not automatic deletions. Recheck exact duplicates against latest main immediately before import.

## 4. Persistence and release gate

Keep durable decisions keyed by stable case_id and original prompt fingerprint (plus reviewer/version and evidence); stale decisions must be re-reviewed if the original prompt changes. Preserve the preflight audit. Do not overwrite prior decisions on restart. The current preflight only creates the queue; a human or separately configured semantic/vision reviewer supplies decisions. It does not call a model or inspect images. For visual reviews record actual quality and match, not default numerical scores. A full quality score can be calculated only when all dimensions have evidence; proposed calibration weights: prompt 25, visual 25, match 20, usefulness 20, novelty 10. Scores cannot override a hard content exclusion.

Visual/reference and rights review are optional metadata, not mandatory publication gates. A text advance is not proof of permission or visual quality; keep unverified rights and image roles unknown. Do not import the raw queue or publish candidate prompts/media. Any later import must use the existing schema, governance and build pipeline and run npm run check, with link audit where feasible.

## 5. Snapshot reconstruction (2026-11-26)

Original export SHA-256: 5b6ec3ba2250eeed1e839b3070b829e07609396f2c3da9710a0262e196571854. The original had 3,133 records; 1,280 existing PromptHero IDs were reconciled to that source snapshot. Reconstructing from the original prompt strings removes 135 duplicates of imported prompts and 136 additional duplicates within the remainder, leaving 1,582 unique prompts before new eligibility decisions. The previous 9 exclusions and 470 deferred cases were not persisted by ID, so 1,103 cannot safely be reconstructed by arithmetic alone. The 1,582 is a reconstructed queue, not a final approved count. None of these numbers establishes visual verification or rights clearance.

## 6. P0/P1 execution (2026-11-26)

- V3: 1,184 text-reviewed candidates advanced to visual review. Cross-source character-trigram TF-IDF cosine screening against all 823 non-PromptHero index records at 0.83 returned zero matches, including zero exact normalized prompts. This is lexical retrieval, not proof against translated or paraphrased prompts.
- 1,183 new candidates were staged in `data/discovery/prompthero.json`; one of the 1,184 was already present there. Seven pre-existing discovery records were retained. Discovery is source-link-only, not part of the generated gallery or gallery case counts. No candidate prompt or image was published. Missing author stays null.
- CDN DNS is unavailable in the review environment. Image fetch, visual assessment, image hash and rights remain unverified. No full-gallery imports have been approved. Existing catalog data and generated pages are unchanged.

### Local execution

Run from a current checkout; put the V3 JSONL and all outputs outside the repository. Python 3.10+ and Pillow are needed for media decoding.

```bash
node scripts/audit-prompt-similarity.mjs /path/to/prompthero-review-queue-v3.jsonl /path/to/similarity.json
python3 -m venv /path/to/review-venv
/path/to/review-venv/bin/pip install Pillow
/path/to/review-venv/bin/python scripts/audit-review-media.py /path/to/prompthero-review-queue-v3.jsonl /path/to/media-review --limit 10
# Remove --limit for all candidates; --catalog . adds one representative non-input image per existing case.
node scripts/import-reviewed-cases.mjs /path/to/prompthero-review-queue-v3.jsonl /path/to/import-plan.json
npm run check
```

Media audit writes media.jsonl, image-pairs.json and local cache. Decoding and SHA-256/dHash checks are not visual judgments; dHash distance <=5 and exact bytes are review hints, not deletion criteria. Run one process per work directory. Failed downloads are retried on a later invocation. This does not verify every source asset or reference image.

Optional paid vision calls require explicit `--vision`, an HTTPS OpenAI-compatible chat-completions endpoint, and environment variables `REVIEW_VISION_ENDPOINT`, `REVIEW_VISION_MODEL`, `REVIEW_VISION_KEY`. First run with `--limit 10` and inspect results/cost. The provider receives the candidate prompt and resized image. No calls occur by default. Model verdicts are advisory and cached against prompt hash, actual image hash and model name; they cannot verify rights, exact identity or source image roles. Keep keys and images local; do not commit them.

The import plan script is a dry-run only: it checks exact duplicates against current shards, a narrow simple-utility exclusion, prompt hash and review evidence, and proposes link-only records. It never writes source data or galleries. Optional third argument is a JSONL file of reviewed content evidence keyed by case_id and prompt_sha256, with duplicate {status,evidence,reviewer}. A valid source image URL is still required; visual/reference and rights evidence are not gates. A positive plan means eligible for the future gallery adapter, not automatically published. Recheck current main, review near-text and image pairs as duplicate candidates, and run build/check before actual import.
