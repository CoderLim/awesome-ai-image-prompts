# Legacy first-pass review — 2026-11-27

Base commit: 479765ad001db485fde04bb826850ab3ed28345f. Scope: 643 previously pending canonical cases (184 Evolink and 459 freestylefly). Existing approvals and exclusions are retained.

- Reviewed original prompt text through automated completeness/source-image-reference screening and targeted reading of short and flagged prompts. Classification is inherited from existing deterministic governance; no independent visual review or image HTTP verification was performed.
- Exact post/prompt deduplication was retained. An additional variable-normalized skeleton comparison and word/character trigram Jaccard scan (0.72 threshold) against the 1,907 canonical candidates found no new pairs involving pending cases at those thresholds. A broader scan timed out; semantic/template duplicates below the thresholds remain possible.
- Six low-information prompts were explicitly rejected: freestylefly-case-189, freestylefly-case-191, freestylefly-case-204, freestylefly-case-225, freestylefly-case-228, freestylefly-case-332. One case (freestylefly-case-468) remains pending because its visual presentation is ambiguous from text alone. No requirement for routine human re-approval is added.
- Approved 636 cases: {"evolink":184,"freestylefly":452}. These are first-pass content decisions, not verification of actual image appearance or redistribution permission.
- Counts: 1900 approved/published, 1 pending, 231 rejected; 2132 raw records.
- Original data is unchanged. The existing exclusion file and separate fingerprinted approvals are durable across source sync. Rebuild using npm run build and npm run check. This branch does not itself update Cloudflare.
