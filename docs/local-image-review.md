# Local image review

Run from a current checkout with Node.js 22+; no npm packages or API key needed.

~~~bash
npm run review:images
# Include the 1,184 text-advanced PromptHero V3 candidates:
npm run review:images -- --queue /absolute/path/prompthero-review-queue-v3.jsonl
~~~

Open http://127.0.0.1:4178 (the command prints the actual URL). Use --port 4179 if occupied. The default view includes current canonical candidates; pass the original private V3 JSONL to also browse pending candidates. The queue is not committed to the public repository. Images load directly from source URLs in your browser; failed loads are labeled and never automatically deleted. Close the server with Ctrl+C. Restart after a sync or changing the queue.

Filter by source, gallery/candidate scope, generation type, category, model, search, or pending/approved/rejected status. Browse the masonry grid, jump to a page with the footer page selector, click images to enlarge, expand full prompts, delete one case or select a page/multiple cases for batch deletion. Click 通过 or 通过选中 only after inspecting the full prompt and source image(s). Default is pending, not a positive review. Restore from the deleted filter or undo the last deletion in the current page session. Multiple selected aliases can share an exclusion group: restoring one restores all exclusion entries affecting that group.

Approvals persist as fingerprints in data/review/approvals.json; removals persist in data/review/exclusions.json. Neither stores prompt text or image bytes. Export the file for a backup. Do not run multiple reviewer server processes against the same checkout. The server only binds to loopback; never expose it to the internet.

After review:

~~~bash
npm run build
npm run check
git status
~~~

Inspect generated diffs, then commit approvals, exclusions and generated gallery/governance changes together. Raw source shards and discovery records are intentionally preserved. Builds exclude the exact connected group, not just the selected row. Stable case IDs, original post IDs and SHA-256 of normalized full prompts prevent known duplicates from resurfacing after source sync/ID change; changed IDs AND changed prompts/posts with no remaining matching key cannot be recognized automatically. Similar prompts or matching image URLs alone are not deletion keys. Candidate staging plans also respect exclusions. Existing discovery rows remain as historical source links, not browsable gallery records.

This tool records explicit human approval and exclusions. It does not automatically approve unseen images or infer publication permission. Source publication conditions apply in the shared gallery/export predicate.

## Additional local source queues

The reviewer automatically loads full-record JSON arrays in `.cache/review-queues/*.json`, in filename order. The directory is ignored by Git. Each record uses the catalog schema (stable ID, title, full prompt, category, input mode, source image URLs, provenance and rights). Records are marked as pending candidates, never as published gallery examples. Existing catalog and explicit PromptHero queue IDs take precedence. Invalid rows fail with a filename and case ID rather than disappearing silently.

Keep collector files and uncertain-rights material local. The full-record queue supports source filtering, image inspection, prompt expansion, deletion/restoration and featured selection through the same reviewer. It does not approve or publish records. Restart the server to reload changed queues.

## README featured examples

Click ☆ 精选 on a card or in the enlarged image, or use the batch feature/unfeature controls. Use the featured filter to review your picks. Selections are saved immediately in data/review/featured.json, in selection order. Initial null keeps the existing automatic README previews until the first selection; after that only manual selections are shown, including when the list is empty. Both READMEs use the same list and retain the existing three-column layout in one unified featured grid (at most 30 previews; no separate generation/reference featured headings) plus category navigation.

Pending queue candidates can be marked now but will not appear in README until actually published and canonical. Deleted, duplicate-excluded and otherwise unavailable cases are also omitted. Restoring a deleted case can make its saved selection visible again; unfeature to remove the selection itself. No rights or visual approval is implied by selection. Build and check after reviewing, then commit the featured file with the generated README changes.

## Template-level deduplication

Run `node scripts/audit-prompt-similarity.mjs - /tmp/template-audit.json 0.83 --all --templates` for the whole published/raw catalog; replace - with the private queue path to include advanced candidates. Similarity and variable skeletons are candidate hints, not deletion verdicts. Reviewed decisions in data/review/template-decisions.json identify a specific retained template and redundant variant, with normalized prompt fingerprints. Run `npm run review:templates` to preview unapplied reviewed decisions; `npm run review:templates -- --queue /path/V3.jsonl --apply` applies the available verified pairs to the existing exclusion file. Without a queue only catalog decisions can apply. Rebuild and check afterward. Existing manual exclusions and featured choices are protected. Restoring a variant does not change its historical decision; remove that decision before explicitly reapplying if you want to retain both. No unseen similarity pair is automatically deleted.
