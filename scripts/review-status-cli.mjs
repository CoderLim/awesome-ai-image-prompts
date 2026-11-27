import fs from 'node:fs';
import { govern } from './governance.mjs';
import { readExclusions } from './review-exclusions.mjs';
import { readApprovals, writeApprovals, reviewFingerprint, reviewStatus, reviewSummary } from './review-status.mjs';

const raw = fs.readdirSync('data/index').filter(f=>f.endsWith('.json')).sort()
  .flatMap(f=>JSON.parse(fs.readFileSync('data/index/'+f,'utf8')));
const { rows } = govern(raw, readExclusions());
const approvals = readApprovals();
const [action='summary', ...ids] = process.argv.slice(2);
if (action === 'summary') {
  console.log(JSON.stringify(reviewSummary(rows, approvals), null, 2));
} else if (action === 'pending') {
  for (const r of rows.filter(r=>reviewStatus(r, approvals)==='pending'))
    console.log(JSON.stringify({ id:r.id, title:r.title, category:r.category, prompt:r.prompt.original, images:r.sourcePreview.images, source:r.provenance.originalSource }));
} else if (action === 'approve') {
  if (!ids.length) throw Error('Pass reviewed case IDs explicitly');
  const byId = new Map(rows.map(r=>[r.id,r]));
  for (const id of ids) {
    const row = byId.get(id);
    if (!row || row.reviewStatus==='rejected') throw Error('Unknown or rejected case: '+id);
    approvals[id] = reviewFingerprint(row);
  }
  writeApprovals(approvals);
  console.log(JSON.stringify(reviewSummary(rows, approvals), null, 2));
} else throw Error('Usage: node scripts/review-status-cli.mjs [summary|pending|approve ID...]');
