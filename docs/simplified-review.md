# Simplified content review

The operational content review now has three states: pending, approved, rejected.
Featured remains an independent presentation setting. Exclusion and exact dedup
rules still take precedence. Approvals are durable, content-fingerprinted records
in data/review/approvals.json, not fields in replaceable source shards.

## Review workflow

- Run `npm run review:images` for the local reviewer. Filter by review state,
  inspect the image and full prompt, approve or exclude individually or in batches.
  Featured does not imply approval. Unimported candidates must be imported first.
- `node scripts/review-status-cli.mjs summary` reports the three content states.
- `node scripts/review-status-cli.mjs pending` emits local review candidates.
- After actually inspecting the complete prompt and source images, an agent can
  record approval with `node scripts/review-status-cli.mjs approve ID ...`.
  Do not approve unseen images or merely text-reviewed cases in bulk.
- Existing exclusions and dedup remain effective. Existing recommended text
  reviews are reused for classification but do not prove visual approval.
  Exactly nine previously publishable VCL cases are migrated as explicit
  fingerprinted approvals; this is a compatibility decision, not new visual
  verification. New cases always start pending.
- A changed prompt, image URL/role or original source identity invalidates an
  explicit approval. Keep raw data and source metadata for traceability.

Source publication conditions are enforced centrally by the exporter, not a
second manual review status or an AI-generated permission claim. Unknown
permission is not permission to redistribute. An approved content case with
no applicable source permission remains local; the export summary counts
these separately as sourceUnavailable, not another content review status.

## D1 migration

The exporter now produces only approved, publishable records. The old
private catalog in D1 contains 1,898 pending-review rows per the owner's
2026-11-27 report; verify the actual count on the live database before cleanup.
Keep the current D1 schema and compatibility author.publicationStatus=cleared
so the consumer stays secure before, during and after migration. The sync
rejects pending records. Existing ordinary deletion protection remains intact.

Before merging: run npm run check and inspect the export summary. After merge,
run the production workflow with dry_run=true, inspect the exact deletion plan,
and explicitly confirm allow_large_delete=true for the one-time cleanup only
if the verified plan matches expectations. Do not bypass large deletion
protection or create new cloud resources. Retain the existing publication
filter in the consumer until the public-only dataset has been verified.

## Generated catalog and gallery

- data/governance/cases.json has exactly one content review state per case:
  reviewStatus. reviewReasons are diagnostic explanations, not state machines.
- data/governance/canonical.json lists non-rejected canonical candidates
  (pending and approved). Use it for internal review and deduplication, not
  as a public publication list.
- README and category pages use the same approval and source-publication
  predicate as cloud export. Unapproved records and obsolete generated pages
  are not included. Source shards, exclusions, featured selections and
  duplicate mappings are retained.
- After review changes run npm run build and npm run check before committing.
  The 2026-11-27 migration rebuild retained 1,907 canonical IDs: 1,898 pending,
  9 approved, 225 rejected out of 2,132 source records. This is a baseline
  compatibility migration, not a new visual review of the pending records.
