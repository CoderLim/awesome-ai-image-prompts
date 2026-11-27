import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { govern, galleryView } from './governance.mjs';
import { render } from './core.mjs';
import { readFeatured } from './review-featured.mjs';
import { readExclusions } from './review-exclusions.mjs';
import { hasXPermission } from './x-source.mjs';

export function eligible(r) {
  return Boolean((r.rights?.prompt === 'CC-BY-4.0' &&
    r.rights?.media === 'CC-BY-4.0' &&
    typeof r.rights.evidence === 'string' && r.rights.evidence.trim()) ||
    hasXPermission(r));
}

export function withdrawn(r) {
  return ['revoked','withdrawn','denied','prohibited'].some(status=>[r.rights?.prompt,r.rights?.media].includes(status));
}

export function exportGallery(root = '.') {
  const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
  const raw = fs.readdirSync(path.join(root,'data/index')).filter(x=>x.endsWith('.json')).sort()
    .flatMap(f=>{const rows=read('data/index/'+f); if(!Array.isArray(rows)) throw Error('Invalid shard '+f); return rows;});
  const ids = new Set(raw.map(r=>r.id));
  if (!raw.length || ids.size!==raw.length) throw Error('Empty or duplicate source records');
  const result = govern(raw,readExclusions(root));
  const view = galleryView(result.rows,read('data/taxonomy.json'));
  const canonical = read('data/governance/canonical.json');
  const report = read('data/governance/report.json');
  const actual = new Set(view.rows.map(r=>r.id));
  if (!Array.isArray(canonical) || new Set(canonical).size!==canonical.length ||
      actual.size!==canonical.length || canonical.some(id=>!actual.has(id)) ||
      report.total!==raw.length || report.visible!==actual.size)
    throw Error('Incomplete or stale governance snapshot; run build/check');
  const manual = readFeatured(root);
  // Use the existing renderer for legacy automatic selection; manual selections
  // preserve the full list, not the README's presentation-only 30-card cap.
  const featured = manual ?? [...render([],view.rows,view.taxonomy,null)['README.md']
    .matchAll(/<td[^>]*><a href="[^"#]+#([a-z0-9-]+)"/g)].map(m=>m[1]);
  const ranks=new Map(featured.map((id,i)=>[id,i+1]));
  const records=[], excluded=[], pending=[];
  for(const r of view.rows) {
    if(withdrawn(r)){excluded.push(r.id);continue;}
    const cleared=eligible(r);
    if(!cleared)pending.push(r.id);
    const o=r.provenance.originalSource, source=o.url??r.provenance.collectedFrom[0]?.url;
    if(!r.prompt.original.trim() || !source || !r.sourcePreview.images.length)
      throw Error('Incomplete eligible case '+r.id);
    records.push({
      id:r.id, media_type:'image', slug:r.id, title:r.title.en??r.title.zh??r.id,
      description:null, prompt:r.prompt.original, category:r.category,tags:r.tags??[],
      input_mode:r.inputMode, model:typeof r.sourceMeta?.model==='string'?r.sourceMeta.model:null,
      media:r.sourcePreview.images.map(m=>({type:'image',role:m.role,originalUrl:m.url})),
      author:{name:o.author??null, sourceUrl:source, rights:r.rights,
        publicationStatus:cleared?'cleared':'pending-review',
        modifications:cleared?'Original prompt retained; thumbnail resized/re-encoded':'Original source retained for internal review only'},
      source_url:source,featured:ranks.has(r.id)?1:0,featured_rank:ranks.get(r.id)??null
    });
  }
  // A formerly published record that now lacks clearance must be removed
  // even if another case's media fails. Explicit revoked records also qualify.
  const restricted=raw.filter(withdrawn).map(r=>r.id);
  const unlicensed=raw.filter(r=>!eligible(r)).map(r=>r.id);
  return {mediaType:'image',records,excluded,pending,restricted,unlicensed,total:raw.length,canonical:canonical.length};
}

if (process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  const result=exportGallery();
  console.log(JSON.stringify({mediaType:result.mediaType,total:result.total,canonical:result.canonical,
    catalog:result.records.length,cleared:result.records.length-result.pending.length,pending:result.pending.length,excluded:result.excluded.length},null,2));
}
