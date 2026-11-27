import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { govern, galleryView, reviewStatus } from './governance.mjs';
import { render } from './core.mjs';
import { readFeatured } from './review-featured.mjs';
import { readExclusions } from './review-exclusions.mjs';

/** @deprecated Use reviewStatus(r) === 'approved'. Kept for callers that still import eligible. */
export function eligible(r) {
  return reviewStatus(r) === 'approved';
}

export function exportGallery(root = '.') {
  const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
  const raw = fs.readdirSync(path.join(root, 'data/index')).filter(x => x.endsWith('.json')).sort()
    .flatMap(f => { const rows = read('data/index/' + f); if (!Array.isArray(rows)) throw Error('Invalid shard ' + f); return rows; });
  const ids = new Set(raw.map(r => r.id));
  if (!raw.length || ids.size !== raw.length) throw Error('Empty or duplicate source records');
  const result = govern(raw, readExclusions(root));
  const view = galleryView(result.rows, read('data/taxonomy.json'));
  const publicView = galleryView(result.rows, read('data/taxonomy.json'), { publicOnly: true });
  const canonical = read('data/governance/canonical.json');
  const report = read('data/governance/report.json');
  const actual = new Set(view.rows.map(r => r.id));
  if (!Array.isArray(canonical) || new Set(canonical).size !== canonical.length ||
      actual.size !== canonical.length || canonical.some(id => !actual.has(id)) ||
      report.total !== raw.length || report.visible !== actual.size ||
      report.published !== report.approved ||
      report.published !== publicView.rows.length)
    throw Error('Incomplete or stale governance snapshot; run build/check');
  const manual = readFeatured(root);
  // Use the existing renderer for legacy automatic selection; manual selections
  // preserve the full list, not the README's presentation-only 30-card cap.
  const featured = manual ?? [...render([], publicView.rows, publicView.taxonomy, null)['README.md']
    .matchAll(/<td[^>]*><a href="[^"#]+#([a-z0-9-]+)"/g)].map(m => m[1]);
  const ranks = new Map(featured.map((id, i) => [id, i + 1]));
  const records = [], pending = [];
  for (const r of view.rows) {
    if (reviewStatus(r) !== 'approved') {
      pending.push(r.id);
      continue;
    }
    const o = r.provenance.originalSource, source = o.url ?? r.provenance.collectedFrom[0]?.url;
    if (!r.prompt.original.trim() || !source || !r.sourcePreview.images.some(m => m.role !== 'input'))
      throw Error('Incomplete approved case ' + r.id);
    records.push({
      id: r.id, media_type: 'image', slug: r.id, title: r.title.en ?? r.title.zh ?? r.id,
      description: null, prompt: r.prompt.original, category: r.category, tags: r.tags ?? [],
      input_mode: r.inputMode, model: typeof r.sourceMeta?.model === 'string' ? r.sourceMeta.model : null,
      media: r.sourcePreview.images.map(m => ({ type: 'image', role: m.role, originalUrl: m.url })),
      author: {
        name: o.author ?? null, sourceUrl: source, rights: r.rights,
        // Consumer (AI Photo Editor) still filters on publicationStatus=cleared.
        publicationStatus: 'cleared',
        modifications: 'Original prompt retained; thumbnail resized/re-encoded',
      },
      source_url: source, featured: ranks.has(r.id) ? 1 : 0, featured_rank: ranks.get(r.id) ?? null,
    });
  }
  return {
    mediaType: 'image',
    records,
    pending,
    total: raw.length,
    canonical: canonical.length,
    approved: records.length,
    published: records.length,
    rejected: report.rejected ?? (raw.length - view.rows.length),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = exportGallery();
  console.log(JSON.stringify({
    mediaType: result.mediaType,
    total: result.total,
    canonical: result.canonical,
    approved: result.approved,
    published: result.published,
    pending: result.pending.length,
    rejected: result.rejected,
  }, null, 2));
}
