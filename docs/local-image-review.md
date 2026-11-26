# Local image review

Run from a current checkout with Node.js 22+; no npm packages or API key needed.

~~~bash
npm run review:images
# Include the 1,184 text-advanced PromptHero V3 candidates:
npm run review:images -- --queue /absolute/path/prompthero-review-queue-v3.jsonl
~~~

Open http://127.0.0.1:4178 (the command prints the actual URL). Use --port 4179 if occupied. The default view includes current canonical gallery examples; pass the original private V3 JSONL to also browse pending candidates. The queue is not committed to the public repository. Images load directly from source URLs in your browser; failed loads are labeled and never automatically deleted. Close the server with Ctrl+C. Restart after a sync or changing the queue.

Filter by source, gallery/candidate scope, generation type, category, model, search, or deleted state. Browse the masonry grid, click images to enlarge, expand full prompts, delete one case or select a page/multiple cases for batch deletion. Default is retain, not a positive visual review. Restore from the deleted filter or undo the last deletion in the current page session. Multiple selected aliases can share an exclusion group: restoring one restores all exclusion entries affecting that group.

Changes immediately persist in data/review/exclusions.json, with no prompt text or image bytes. Export the file for a backup. Do not run multiple reviewer server processes against the same checkout. The server only binds to loopback; never expose it to the internet.

After review:

~~~bash
npm run build
npm run check
git status
~~~

Inspect generated diffs, then commit exclusions and generated gallery/governance changes together. Raw source shards and discovery records are intentionally preserved. Builds exclude the exact connected group, not just the selected row. Stable case IDs, original post IDs and SHA-256 of normalized full prompts prevent known duplicates from resurfacing after source sync/ID change; changed IDs AND changed prompts/posts with no remaining matching key cannot be recognized automatically. Similar prompts or matching image URLs alone are not deletion keys. Candidate staging plans also respect exclusions. Existing discovery rows remain as historical source links, not browsable gallery records.

This tool records removal preferences only. It does not automatically approve image quality, input/output roles, model reproduction, or rights. The existing release gates still apply.
