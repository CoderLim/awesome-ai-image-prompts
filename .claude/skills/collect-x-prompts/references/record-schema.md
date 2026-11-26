# X collection contract

## Raw snapshot (collect-posts.mjs)

Version 1: username (canonical handle), range (UTC since / exclusive until), posts (array of {id: string, variants: raw OpenCLI objects}), coverage, unresolved, coverageStatus, absoluteCompleteness. Store locally. Keep full raw variants; do not truncate or coerce snowflake IDs to numbers. If the installed adapter does not expose full text/media/reply fields, obtain actual detail/thread data and keep the raw evidence; do not manufacture fields.

## Intermediate cases (local array)

```json
[
  {
    "title": {"en": "Example", "zh": null},
    "category": "posters",
    "type": "generation",
    "inputMode": "reference-to-image",
    "prompt": "Exact verbatim reusable prompt body from the source",
    "images": [{"url": "https://pbs.twimg.com/media/Example.jpg", "role": "source-media"}],
    "url": "https://x.com/example/status/123",
    "postId": "123",
    "promptPostUrl": "https://x.com/example/status/124",
    "promptPostId": "124",
    "textReview": "complete",
    "utilityReview": "reusable",
    "pairReview": {"status": "verified", "kind": "shared-series-identifier", "reviewer": "reviewer-id", "evidence": "Specific source evidence, not just time proximity"}
  }
]
```

Illustrative placeholders only. Do not ingest this sample. Pair fields omitted for same-post examples; pairReview needed if no explicit raw relation or link. Allowed manual kinds: shared-series-identifier, thread-and-topic, visual-semantic-match. Evidence must identify the actual relation. Text and image URLs are checked against the raw snapshot. Optional publishedAt, model, models, classificationConfidence. Taxonomy from data/taxonomy.json; restyle uses type editing, all image-conditioned prompts map to the reference gallery. All stored URLs must be HTTPS X status or pbs.twimg.com/media URLs respectively. No more than four explicitly selected distinct media per record; at least one possible output. Unknown role stays source-media pending review.

## Full record local queue

Matches schemas/prompt.schema.json, with stable ID <canonical-source-id>-<prompt-post-id> (same-post uses that post ID), title, type/category/inputMode, status index-only, prompt.original, empty media, sourcePreview (1–4 image URL/role pairs and <=100 Unicode character excerpt), provenance, rights and sourceMeta. Author handle underscores are encoded as hyphens (no X handle contains hyphens). Existing historical IDs are preserved by exact post/prompt matching, not rewritten. OriginalSource postId/url refers to the image post, paired promptPostId/Url refers to the text. collectedFrom contains sourceId, mode collector-export, raw snapshot SHA-256, URL and collection time. rights unknown/unknown until separate evidence is supplied. SourceMeta contains pairing and review state. Local queue is ignored by Git.

## Publication evidence (local array; one record per case)

```json
[
  {
    "id": "example-124",
    "promptHash": "<SHA-256 of NFKC/lowercase/whitespace-normalized full prompt>",
    "reviewer": "reviewer-id",
    "text": "complete",
    "visual": {"status": "pass", "outputUrls": ["https://pbs.twimg.com/media/Example.jpg"], "evidence": "Actual visual inspection and source match"},
    "reference": {"status": "verified", "evidence": "Required reference inputs verified; omit for text-to-image"},
    "duplicate": {
      "status": "cleared",
      "evidence": "Reviewed the current similarity report",
      "pairs": [{"id": "existing-case-id", "promptHash": "<normalized hash of the other prompt>", "status": "distinct", "evidence": "Explain substantive concept/style/composition difference"}],
      "imageMatches": [{"url": "https://pbs.twimg.com/media/Example.jpg", "status": "distinct", "evidence": "Explain distinct reusable task despite media match"}]
    },
    "rights": {
      "prompt": {"status": "cleared", "basis": "Applicable permission or license", "evidence": "Specific evidence"},
      "media": [{"url": "https://pbs.twimg.com/media/Example.jpg", "status": "cleared", "basis": "Applicable permission or license", "evidence": "Specific evidence"}]
    }
  }
]
```

Require real evidence, not the literal sample or an assertion that the post is public. Each included image, including input images, requires separate rights evidence. A non-input example must have confirmed output role. Each retrieved similarity or media-match pair must be resolved or excluded; do not apply unreviewed similarity. Staging reports blocked records, never overwrites old shards, and registers X authors generically. Build/check are deterministic checks, not substitutes for visual/rights review.
