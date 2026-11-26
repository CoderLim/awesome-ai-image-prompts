# AGENTS.md — Repository instructions

This is the authoritative operating guide for AI coding agents and contributors. Apply it to collection, import, classification, deduplication, content review, and gallery changes. Preserve the existing user-facing layout unless the owner requests a change. Read [content policy](docs/content-policy.md) and [sources](SOURCES.md) before importing third-party material.

## 1. Product scope and collection rules

Build a curated, model-independent library of useful image prompts, with actual source images and traceable creator attribution. Prioritize reusable prompts that meaningfully affect the result, not generic image utilities or sheer case count.

- Collect text-to-image prompts and prompts that require one or more input/reference images.
- Prefer high-quality photography, illustration, avatars, product scenes, posters, character design, identity-preserving portraits, style transformations, creative compositions, and meaningful prompt-driven outfit/hair/background changes.
- **Do not intentionally collect simple utility operations that do not need a reusable natural-language prompt:** background removal, person removal, routine object removal, watermark removal, basic cropping/resizing, generic upscaling or denoising, etc. A dedicated tool can perform these tasks. Do not expand such categories just to increase case counts.
- Distinguish background removal (out of scope) from creative background replacement with a specific scene, lighting, composition, and constraints (in scope). The same distinction applies to a generic removal command versus a substantive prompt-driven creative transformation.
- Existing imported utility cases are legacy records. The current parser/governance pipeline does not automatically enforce this new collection exclusion. Do not interpret their presence as permission to collect more. When touching the import pipeline, implement and test the exclusion explicitly; retain audit metadata rather than silently deleting raw source records.
- Do not generate substitute images, invent examples, fill in missing original prompts, or fabricate before/after pairs. Use original upstream media only. Do not label a source example as independently reproduced or visually verified without actual evidence.
- Prefer primary creator sources. Existing importers use freestylefly/awesome-gpt-image-2 and Evolink-AI/awesome-gpt-image-2-6-prompts-and-api; PromptHero uses a manually supplied collector export; do not scrape or sync it automatically. Check current source terms and permissions before adding a source.
- Third-party prompts and images retain their owners' rights. Public availability, attribution, an upstream repository license, or external linking alone does not establish redistribution permission. For new imports, record evidence separately for prompt text and media; use source-link-only records when permission is uncertain and do not republish full text or embed media without an applicable basis. Existing full-text records have unresolved rights and require review; do not describe them as licensed or commercially reusable.
- Missing original prompt (including placeholders such as 原文未公开) or missing source image URL is not a normal browsable example. Keep source metadata and flag it for review.

## 2. Classification

User-facing navigation has exactly two top-level groups:

| Gallery | Directory | Meaning |
|---|---|---|
| Image Generation | `generation/` | Text-to-image; unresolved input requirements provisionally remain here |
| Reference Image Generation | `reference/` | Any prompt-driven task requiring an input/reference image, including image editing |

Never restore a separate public Image Editing group or duplicate a case across both galleries. Internally, retain operation type and input mode for filtering and future use. The existing taxonomy in `data/taxonomy.json` still has internal generation/editing/unclassified categories.

Classification order:
1. Read the complete original prompt and explicit input requirements; prefer these over titles, collector categories or image appearance alone.
2. Identify whether the task is text-to-image, reference-to-image, image-editing, or unknown. A reference portrait creating a new scene is reference-to-image, while a targeted modification preserving the original scene is image-editing; both display under Reference Image Generation.
3. Choose a single best-fit category based on the intended output or transformation. Use the taxonomy keys, not arbitrary folder names. Generation categories include portraits, avatars, illustrations, products, posters, characters, architecture, infographics, logos, travel, ui-mockups, comics-storyboards, creative-art, other. Reference cases reuse these plus transformation categories such as restyle, outfit-change, hair-makeup, portrait-editing, background-change and composition.
4. Attach descriptive tags (e.g. cinematic, ccd, film, photorealistic, anime, watercolor, 3d, minimalist, identity-preserving, template). Tags are secondary metadata, not duplicate gallery entries.
5. Do not invent input requirements. Preserve unknown/low-confidence states and review flags; the current general generation gallery includes unknown input modes. Use explicit, tested overrides when justified by source evidence.
6. Generic or misleading upstream titles are review candidates. Improve them only based on actual source content; keep original attribution intact.

`scripts/governance.mjs` implements the current heuristic classification and `galleryView()` maps internal types to public galleries. Heuristics are not full LLM or visual review. Update tests with any rule change.

## 3. Deduplication (mandatory)

Retain exactly one canonical case whenever **either** of these conditions holds:
- Same nonempty original post ID, even if the prompt or image differs.
- Same complete prompt after normalization, even if the author/post/source differs.

The current normalization is Unicode NFKC, lowercase, collapse whitespace to one space, then trim. Compare full original prompts, not the 100-character preview. Treat connected groups transitively: if A shares a post with B and B shares a prompt with C, keep one representative for A/B/C.

Use `selectCanonical()` in `scripts/governance.mjs`. Its deterministic selection prioritizes eligible/complete cases, rights-review status, original source URL, author/non-generic title, explicit output image, available image URL and completeness score, with stable ID ordering as final tie-breaker. Missing post IDs are not a dedup key. Do not treat matching prefixes, similar prompts, or identical image URLs alone as sufficient for deletion. Flag these as candidates for review.

Keep raw imported records for auditing; exclude duplicates from canonical IDs and all rendered galleries. Preserve excluded-to-kept mappings and source links. Do not reintroduce duplicates through new sources, manual additions, or sync. Check that canonical cases have no repeated nonempty original post ID and no repeated normalized full prompt.

## 4. Data model and source of truth

| Path | Purpose |
|---|---|
| `data/sources.json` | Registered source configuration, repository/ref/path and license notes |
| `data/index/*.json` | Raw source case records, sharded (currently up to 80 records per shard) |
| `data/taxonomy.json` | Internal category vocabulary |
| `schemas/prompt.schema.json` | Source record schema |
| `scripts/core.mjs` | Source parsing, preliminary merge, image selection and Markdown rendering |
| `scripts/governance.mjs` | Classification, tags, quality flags, canonical dedup and gallery view |
| `scripts/sync.mjs` | Fetch upstream snapshots and rewrite index shards |
| `scripts/build.mjs` | Deterministically regenerate galleries and governance outputs |
| `scripts/validate.mjs` | Source record and structural validation |
| `scripts/audit-links.mjs` | Optional image URL HTTP audit |
| `data/governance/canonical.json` | Browsable canonical case IDs; use this to select cases, not all raw rows |
| `data/governance/cases.json` | Classification, tags, quality, visibility and duplicate mappings |
| `data/governance/deduplication.json` | Retained/excluded case mappings |
| `data/governance/duplicates.json` | Duplicate and similarity groups |
| `data/governance/report.json` | Machine-readable counts and review status |
| `docs/governance-report.md` | Generated human-readable governance report |

Preserve stable case IDs, full original prompt formatting in `prompt.original`, original author, original post URL/ID, upstream repository/ref/commit SHA/path/anchor, and source image URLs/roles. Preserve separate rights metadata; leave unknown fields unknown. The current source schema expects full prompts and an upstream image preview structure, so source-link-only support for new uncleared records requires a schema/parser/renderer update before import. Do not work around that limitation by inserting fake prompts or falsely asserting permission.

Source index and taxonomy are inputs. Governance JSON, README.md, README.zh-CN.md, category Markdown and governance report are generated outputs. Do not manually patch generated pages or counts. Fix scripts or input data and rebuild instead.

The existing sync rewrites configured source shards from fetched upstream snapshots; do not place irreplaceable manual corrections in those shards. If implementing manual review/overrides, use a durable input keyed by stable case ID, apply it during governance, and test that sync does not erase it. Do not claim an override store already exists.

## 5. User-facing presentation

- README: actual upstream source images only, two gallery groups, curated image grid and category links. Keep the existing compact three-column featured layout.
- Category pages: vertically arranged cases (not a metadata table), title, one representative original image, complete eligible prompt in a single-line fenced `text` code block, compact linked creator attribution.
- Prefer a source-labelled output image; retain two images only for a clearly identified original/edited pair. Never guess before/after roles. Default single image width 480 px, paired images 240 px each. Current pagination is 20 cases per page.
- Keep full prompt text intact in JSON. For Markdown presentation only, collapse line breaks into spaces. Do not truncate or add ellipses to a complete displayed prompt. Use a safe fence length for prompts containing backticks; GitHub provides native horizontal scrolling and copy controls. If a prompt cannot be republished, link to its source instead.
- Keep author attribution visible as a single link to the original post when known; otherwise use the upstream case link. Store collection source and other provenance in data rather than adding noisy metadata rows to every case.
- Do not add independent Gallery web apps, databases, model comparison, generated assets or unrelated features unless explicitly requested.

## 6. Script usage

Run from the repository root with Node.js 22 or newer. The current scripts use Node built-ins and have no declared npm dependencies.

```bash
# Rebuild all generated pages and governance metadata from current local data.
npm run build

# Validate source records.
npm run validate

# Run unit tests.
npm test

# Required final check: generated files current, validation, unit tests.
npm run check

# Optional: check upstream image HTTP availability, writes reports/image-links.json.
npm run audit:links

# Fetch upstream sources and update index shards (network required).
# GITHUB_TOKEN is optional for GitHub API authentication; never commit credentials.
npm run sync
npm run build
npm run check
```

Do not run sync for documentation-only, layout-only or local classification work unless fresh upstream data is explicitly needed. Sync resolves upstream commits and rejects unexpected source shrink (currently below 80% of the prior source record count) or missing full prompt text; it is not a complete quality or rights gate. It may replace upstream shards, so review diffs before committing.

The image audit checks URL reachability and image content type (HEAD with a limited GET fallback for some statuses); it does not verify visual matching, original-post availability, model reproducibility, or rights. Treat inconclusive results separately from missing images. It is not part of deterministic builds.

GitHub Actions `validate.yml` runs `npm run check`. `sync.yml` is scheduled daily and supports manual dispatch, runs sync/build/check and attempts to open a review PR. Do not silently enable auto-merge or claim scheduled PRs work without verifying repository permissions and a successful run. Note that the current sync workflow is not a complete per-asset rights approval gate.

## 7. Required acceptance checks

For content or code changes:
- Inspect latest main, existing sources, classification and governance state before editing. Keep scope limited to the requested work.
- If adding data, verify source eligibility, prompt authenticity, image role/URL, attribution, and rights basis. Do not collect prompt-free utility cases.
- Run build and check; add or update targeted tests for parser, classification, deduplication or rendering changes. Review generated diff and removed stale pages.
- Verify each browsable canonical ID appears exactly once in category galleries, and only in its correct top-level group. Check original post IDs and normalized prompts for duplicates. Ensure counts and pagination links match generated data.
- For changes affecting media, run the optional link audit when feasible; record actual results, not assumed reachability. Visual prompt matching, perceptual hash, semantic similarity and rights clearance require separate evidence.
- Preserve existing layout and original images. Review sample generation/reference pages and a long prompt to ensure one-line, copyable display without truncation.
- Report files changed, retained/excluded counts if relevant, test results and known blockers. Distinguish checks actually run from scripts merely added. Never say rights, CI, or image verification passed without evidence.

For documentation-only changes, inspect the current code and verify the instructions match it; avoid regenerating unrelated files. Keep this file current when commands, policies or directory structure change. Other AI entry files point here rather than maintaining conflicting copies of the rules.

## Additional source modes

VCL is an explicitly licensed, manually imported pinned snapshot. The automatic GitHub sync skips sources with a manual mode; keep manually imported shards intact. The owner-directed 2026-11-26 PromptHero export contains 1,280 reviewed records in data/index/prompthero-*.json (627 first batch, 166 Phase A secondary review, 487 Phase B priority). Rights are still unknown; no rights clearance or image verification is claimed. This batch-specific import decision does not authorize other imports. Remaining link-only discovery candidates live in data/discovery/prompthero.json and docs/prompthero-discovery.md; do not count those links as imported full prompts. For licensed cases preserve per-case attribution, license evidence, and formatting-change notices.

## Local PromptHero candidate review

For collector exports follow [the local review workflow](docs/prompthero-review-workflow.md). Use `node scripts/prompthero-preflight.mjs <collector.jsonl> <new-local-output-dir>` from the repository root to reconstruct the queue across all current index shards, with exact duplicate mappings. Keep raw exports and review decisions outside the public repository. Preflight flags are not semantic or visual verdicts; never auto-publish candidates. Record separate text, visual, source and rights evidence, preserve stable IDs and review versions, and apply the existing import/build/check and rights gates before publishing. CLAUDE.md delegates to this authoritative guide.

## Local visual curation

Use [the local image reviewer](docs/local-image-review.md) via `npm run review:images` (optional `-- --queue /absolute/path/to/V3.jsonl`). The explicitly owner-requested local-only reviewer writes `data/review/exclusions.json`. Keep this durable input separate from source shards; build and future import plans honor exclusions across exact post/prompt components. Do not silently reset it during sync. Raw records remain for audit. Rebuild and check after changing exclusions; retaining an item is not visual or rights approval. Do not commit private queues, image caches or credentials.
