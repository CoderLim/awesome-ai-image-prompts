import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const tax=read('data/taxonomy.json'),ids=new Set();
for(const f of fs.readdirSync('data/index').filter(x=>x.endsWith('.json')))for(const r of read('data/index/'+f)){assert.match(r.id,/^[a-z0-9-]+$/);assert(!ids.has(r.id),'Duplicate '+r.id);ids.add(r.id);assert(tax[r.type]?.includes(r.category));assert(r.title.en||r.title.zh);assert.equal(r.status,'index-only');assert.equal(r.prompt,null);assert.equal(r.media.length,0);assert(r.provenance.originalSource);assert(r.provenance.collectedFrom.length);for(const s of r.provenance.collectedFrom){assert.match(s.commitSha,/^[a-f0-9]{40}$/);assert(s.url.startsWith('https://github.com/'));}assert(Array.from(r.sourcePreview.promptExcerpt).length<=100);assert(r.sourcePreview.images.length<=4);for(const m of r.sourcePreview.images){const u=new URL(m.url);assert.equal(u.protocol,'https:');assert(['raw.githubusercontent.com','pub-62cf7640cd0f4066b60933bd2e9b85ef.r2.dev'].includes(u.hostname));assert(['input','output','source-media'].includes(m.role));}}
console.log('Validated '+ids.size+' unique cases');
