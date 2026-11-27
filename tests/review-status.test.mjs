import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { readApprovals, writeApprovals, reviewFingerprint, reviewStatus, reviewSummary } from '../scripts/review-status.mjs';

const row = {
  id: 'sample', reviewStatus: 'pending',
  prompt: { original: 'A complete prompt' },
  sourcePreview: { images: [{ url: 'https://example.com/image.png', role: 'output' }] },
  provenance: { originalSource: { url: 'https://example.com/post', postId: 'sample' }, collectedFrom: [{ sourceId: 'prompthero' }] },
  rights: { prompt: 'unknown', media: 'unknown' },
  sourceMeta: { review: { qualityStatus: 'recommended' } },
};

test('only three content review states; recommended text alone is not approval', () => {
  assert.equal(reviewStatus(row), 'pending');
  const approvals = { sample: reviewFingerprint(row) };
  assert.equal(reviewStatus(row, approvals), 'approved');
  assert.equal(reviewStatus({ ...row, reviewStatus: 'rejected' }, approvals), 'rejected');
  assert.equal(reviewStatus({ ...row, prompt: { original: 'Changed' } }, approvals), 'pending');
  assert.equal(reviewStatus({ ...row, featured: true }, approvals), 'approved');
  assert.equal(reviewStatus({ ...row, sourcePreview: { images: [{ url: 'https://example.com/other.png', role: 'output' }] } }, approvals), 'pending');
  assert.deepEqual(reviewSummary([row], approvals), { pending: 0, approved: 1, rejected: 0 });
});

test('approval persists independently of source data shards', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'prompt-review-'));
  try {
    assert.deepEqual(readApprovals(root), {});
    const approved = { sample: reviewFingerprint(row) };
    writeApprovals(approved, root);
    assert.deepEqual(readApprovals(root), approved);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
