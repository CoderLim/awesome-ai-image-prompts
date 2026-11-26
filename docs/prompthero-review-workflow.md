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

Start with a stratified 50-case calibration across model families and prompt lengths; then process every remaining candidate in batches of 20–30. Read the full source prompt, not the preview. Decide advance (eligible for visual review), hold (uncertainty, missing context, possible near-duplicate), or reject (no usable prompt, simple prompt-free utility, video-only, or out of scope). Record category, input mode, reason, reviewer/version and evidence; use the existing taxonomy. Do not reject a good concise prompt solely for its length or a model for its age. Preserve negative prompts and model-specific parameter requirements. Keep generative and reference galleries separate; editing tasks map to the reference gallery.

## 3. Visual, duplicate and source verification

For each surviving case inspect actual source media. Record fetch status separately from visual quality, image-prompt match, actual input/output role and review evidence. Missing reference assets stay unknown. No invented images, prompt completion, model or creator. Use the creator/profile URL to investigate missing author names; do not treat opaque account IDs as verified handles. Similar prompts or media hashes are review candidates, not automatic deletions. Recheck exact duplicates against latest main immediately before import.

## 4. Persistence and release gate

Keep durable decisions keyed by stable case_id and original prompt fingerprint (plus reviewer/version and evidence); stale decisions must be re-reviewed if the original prompt changes. Preserve the preflight audit. Do not overwrite prior decisions on restart. The current preflight only creates the queue; a human or separately configured semantic/vision reviewer supplies decisions. It does not call a model or inspect images. For visual reviews record actual quality and match, not default numerical scores. A full quality score can be calculated only when all dimensions have evidence; proposed calibration weights: prompt 25, visual 25, match 20, usefulness 20, novelty 10. Scores cannot override a hard exclusion or unknown rights.

For new material, text and media rights evidence are separate mandatory publication gates; if permission is uncertain, keep local review or source-link-only discovery, per AGENTS.md. A text advance or visual pass is not permission. Do not import the raw queue or publish candidate prompts/media. Any later import must use the existing schema, governance and build pipeline and run npm run check, with link audit where feasible.

## 5. Snapshot reconstruction (2026-11-26)

Original export SHA-256: 5b6ec3ba2250eeed1e839b3070b829e07609396f2c3da9710a0262e196571854. The original had 3,133 records; 1,280 existing PromptHero IDs were reconciled to that source snapshot. Reconstructing from the original prompt strings removes 135 duplicates of imported prompts and 136 additional duplicates within the remainder, leaving 1,582 unique prompts before new eligibility decisions. The previous 9 exclusions and 470 deferred cases were not persisted by ID, so 1,103 cannot safely be reconstructed by arithmetic alone. The 1,582 is a reconstructed queue, not a final approved count. None of these numbers establishes visual verification or rights clearance.
