# Catalog record schema (aweniai-001.json style)

Output must be a JSON **array** of catalog records. Shard naming: `data/index/<sourceId>-001.json` (80 records per shard max).

## Required fields per record

| Field | Rules |
|---|---|
| `id` | `^[a-z0-9-]+$`, prefer `<sourceId>-<tweetId>` |
| `title` | `{ en, zh }` — at least one nonempty |
| `type` | `generation` \| `editing` \| `unclassified` |
| `category` | Must exist under that `type` in `data/taxonomy.json` |
| `inputMode` | `text-to-image` \| `reference-to-image` \| `image-editing` \| `unknown` |
| `status` | always `index-only` |
| `prompt.original` | Full reusable prompt; never invent / OCR-fabricate |
| `media` | always `[]` |
| `sourcePreview.images` | 1–4 items; `https` URLs; roles `source-media` \| `input` \| `output` |
| `sourcePreview.promptExcerpt` | ≤100 Unicode chars |
| `sourcePreview.excerptTruncated` | boolean |
| `provenance.originalSource` | platform, author (`@handle`), url, postId, publishedAt, verification |
| `provenance.collectedFrom[0]` | `sourceId`, `mode: "collector-export"`, `snapshotSha256`, `url`, `collectedAt` |
| `rights` | `{ prompt: "unknown", media: "unknown" }` unless cleared evidence exists |

## Taxonomy gotchas

- `restyle` lives under **`editing`**, not `generation`.
- Reference-to-image poster transforms may stay `type: generation` + `category: posters` with `inputMode: reference-to-image` when that is the intended public category.
- Public gallery maps `editing` and `reference-to-image` into **Reference Image Generation**.

## Image hosts for X

Use `https://pbs.twimg.com/media/...` URLs from the tweet. Prefer `?name=large` only for local inspection; store the canonical media URL without inventing hosts.

## Minimal example

```json
{
  "id": "aweniai-2105661058765770857",
  "title": { "en": null, "zh": "橡胶印章旅行海报" },
  "type": "generation",
  "category": "posters",
  "inputMode": "reference-to-image",
  "status": "index-only",
  "prompt": { "original": "为每张上传照片分别生成一张独立的…" },
  "media": [],
  "models": [],
  "sourcePreview": {
    "images": [{ "url": "https://pbs.twimg.com/media/….jpg", "role": "source-media" }],
    "promptExcerpt": "为每张上传照片分别生成一张独立的…",
    "excerptTruncated": true
  },
  "provenance": {
    "originalSource": {
      "platform": "x",
      "author": "@AWENIAI",
      "url": "https://x.com/AWENIAI/status/2105661058765770857",
      "postId": "2105661058765770857",
      "publishedAt": "2026-10-01T12:00:00.000Z",
      "verification": "reported-by-collector"
    },
    "collectedFrom": [{
      "sourceId": "aweniai",
      "mode": "collector-export",
      "snapshotSha256": "<sha256 of source snapshot or output array>",
      "url": "https://x.com/AWENIAI/status/2105661058765770857",
      "collectedAt": "2026-11-26T13:58:26.919Z"
    }]
  },
  "rights": { "prompt": "unknown", "media": "unknown" },
  "sourceMeta": {
    "model": null,
    "textReview": "appears-complete",
    "visualReview": "pending",
    "pairing": "same-post-reported",
    "imageVerification": "source-reported-output; HTTP and visual match unchecked",
    "review": {
      "qualityStatus": "recommended",
      "classificationConfidence": "medium",
      "classificationMethod": "owner-directed-collector-import",
      "inputMode": "reference-to-image",
      "category": "posters"
    }
  }
}
```

## Optional provenance extras

When prompt text and example images are on different nearby posts:

- `originalSource.promptPostUrl`
- `originalSource.promptPostId`
- Prefer `originalSource.url` / `postId` = **image post** (gallery media)
- `sourceMeta.pairing`: `same-post-reported` \| `prompt_post_paired_with_nearby_image_post`
