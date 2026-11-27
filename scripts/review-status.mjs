import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

export const reviewPath = 'data/review/approvals.json';

// A change to the actual prompt, image URLs/roles or source invalidates an
// approval. Classification and featured order are independent of approval.
export function reviewFingerprint(row) {
  return createHash('sha256').update(JSON.stringify([
    row.prompt.original,
    row.sourcePreview.images.map(m => [m.url, m.role]),
    row.provenance.originalSource.url ?? null,
    row.provenance.originalSource.postId ?? null,
  ])).digest('hex');
}

export function readApprovals(root = '.') {
  const file = path.join(root, reviewPath);
  if (!fs.existsSync(file)) return {};
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.entries(value).some(([id, hash]) => !/^[a-z0-9-]+$/.test(id) || typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash))) {
    throw Error('Invalid review approvals');
  }
  return value;
}

export function writeApprovals(approvals, root = '.') {
  const file = path.join(root, reviewPath);
  const tmp = file + '.' + randomUUID() + '.tmp';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  try {
    fs.writeFileSync(tmp, JSON.stringify(Object.fromEntries(Object.entries(approvals).sort()), null, 2) + '\n', { flag: 'wx' });
    fs.renameSync(tmp, file);
  } finally { fs.rmSync(tmp, { force: true }); }
}

export function reviewStatus(row, approvals = {}) {
  if (row.reviewStatus === 'rejected') return 'rejected';
  if (Object.hasOwn(approvals, row.id)) {
    // A stale explicit approval must return to pending.
    return approvals[row.id] === reviewFingerprint(row) ? 'approved' : 'pending';
  }
  // First-pass AI decisions are persisted by content fingerprint. Never auto-approve a new or changed source record solely from a mutable import flag.
  return 'pending';
}

export function reviewSummary(rows, approvals = {}) {
  const counts = { pending: 0, approved: 0, rejected: 0 };
  for (const row of rows) counts[reviewStatus(row, approvals)]++;
  return counts;
}
