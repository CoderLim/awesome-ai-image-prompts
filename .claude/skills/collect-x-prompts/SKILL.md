---
name: collect-x-prompts
description: Collect complete reusable AI image prompts and corresponding generated examples from an X/Twitter account over a specified date range. Use for collect-x-prompts, 采集 X 提示词, 从推特收集 prompt, or repeated X author imports. Stages local review queues before any publication.
---

# Collect X prompts

Read root AGENTS.md and [record schema / review contract](references/record-schema.md). Use one verified X handle and a time range (week/month/year/2y or YYYY-MM-DD[..YYYY-MM-DD]). Do not intentionally collect simple utility operations (background/person removal, basic cropping/resizing, etc.). Do not create link-only records as substitutes for incomplete gallery cases. Discard or keep a local rejection report instead. Preserve complete original prompt text and attribution; never invent missing text or image URLs.

## 1. Collect raw posts and measure coverage

Check `opencli doctor`, `opencli twitter whoami -f json`, and installed `opencli twitter search --help`. Use the existing authenticated browser only. Do not export cookies, bypass access controls or commit raw snapshots.

```bash
node .claude/skills/collect-x-prompts/scripts/collect-posts.mjs AWENIAI year .cache/x-raw/aweniai-20261126.json
```

Collector runs all-post, image and multilingual prompt-keyword searches per 30-day UTC slice, recursively splits saturated slices down to days, keeps every raw representation keyed by string tweet ID, records failed, empty, saturated and out-of-range slices. No exclusion of replies. Explicit date end is inclusive, X until is exclusive. Inspect coverage, rerun unresolved slices in new snapshot files if feasible; do not claim full historical coverage from a below-limit search. X indexing, deleted/private posts and adapter behavior may limit discovery. If a saturated single day cannot be paginated with the installed adapter, report the gap. Timeline/thread/detail backfill may be needed; check installed commands and preserve raw returned posts before using them. Do not silently overwrite raw files.

## 2. Semantic review of raw posts

Read the collected variants. Use the longest actual full-text representation, expand long posts where available and record raw detail evidence. Extract the exact verbatim reusable body, stripping only separable marketing prefixes/suffixes. No minimum length or language bias; do not discard an otherwise complete body just because a separate promo line ends in a colon. Reject truncated, teaser-only, image-only or external-link-only material. Never OCR a screenshot to invent prompt text.

Images must be source-reported and belong to the selected original post. Separate input reference images, output examples and unknown source media. Never label an unknown role as verified. Check extra required reference attachments, source access and image matching separately. Pairing precedence:
- same post;
- explicit reply/quote relationship or explicit post link recorded in raw variants;
- otherwise explicit semantic review using shared series identifier, thread and topic, or actual visual match. Record reviewer and concrete evidence. Timing proximity is only a discovery hint. Ambiguous many-to-many cases remain unpaired.

Create a local intermediate JSON array, one object per proposed case (see contract). For every accepted candidate supply `textReview: "complete"` and `utilityReview: "reusable"` based on actual content review, taxonomy and input mode. Do not treat these as default values.

## 3. Preflight and local queue

```bash
node .claude/skills/collect-x-prompts/scripts/build-index-shard.mjs .cache/x-cases/aweniai.json .cache/x-raw/aweniai-20261126.json
npm run review:images
```

The historical filename is retained for compatibility of the entry point, but its interface now writes only a full-record local queue at `.cache/review-queues/<sourceId>.json`. It verifies raw text/media association and pairing evidence, preserves stable prompt-post IDs, never overwrites an existing row, and uses the full catalog and all local queues for transitive exact deduplication and manual exclusions. It produces a separate report with invalid cases, exact conflicts, image matches, near/template similarity and existing reviewed template decisions. Read it; near matches need human/AI semantic review, never auto-delete by score. User exclusions and featured selections are preserved. Apply verified template decisions via the existing explicit `npm run review:templates -- --apply` workflow only; a restored case is not silently re-excluded. Local queues are Git-ignored.

## 4. Import only approved cases

Do not copy arbitrary shards to data/index or modify generated pages manually. Use the review evidence contract in the reference file. The owner-directed historical AWENIAI import is not authorization for future sources; record prompt and media rights separately. A source being public or requested by the owner alone does not establish redistribution rights. Keep uncertain cases local; do not generate public link-only fallback records.

```bash
node .claude/skills/collect-x-prompts/scripts/stage-import.mjs .cache/review-queues/aweniai.json .cache/x-reviews/aweniai.json .cache/x-import/aweniai-001
# Inspect report.json and staged files. On a clean current checkout, after explicit import request:
node .claude/skills/collect-x-prompts/scripts/apply-import.mjs .cache/x-import/aweniai-001
git status
```

Staging rechecks current catalog, exact duplicates, exclusions, template decisions, specific similarity/media-match review, visual/reference evidence and separate rights basis. It allocates NEW shard numbers after the existing ones, at most 80 rows per shard, and prepares registry changes. Applying rejects stale HEAD, dirty working tree, modified plan bytes and any existing shard destination. It runs build/check; inspect diff and commit source data, registry, generated pages and governance together only after success. Never run sync as part of this workflow. New X authors use `platform: "x"`, `username` and the common validator/classifier; no author-specific code changes.

## 5. Report

Return date range (UTC, exclusive until), coverage gaps, fetched unique posts, accepted/rejected reasons, queue path, actual exact/near/image match results, image/rights evidence status, and any import/test/commit result. Do not claim a complete crawl, visual approval, rights clearance or successful tests without evidence.
