import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const load=p=>fs.readdirSync(p).filter(x=>x.endsWith('.json')).flatMap(x=>read(p+'/'+x));
const tax=read('data/taxonomy.json'), ids=new Set();
const cases=[...load('data/cases'),...load('data/index')];
for(const r of cases){assert.match(r.id,/^[a-z0-9-]+$/);assert(!ids.has(r.id),'Duplicate '+r.id);ids.add(r.id);assert(tax[r.type]?.includes(r.category),'Bad taxonomy '+r.id);assert(r.title.en||r.title.zh);assert(['text-to-image','reference-to-image','image-editing','unknown'].includes(r.inputMode));assert(r.provenance.originalSource);assert(Array.isArray(r.provenance.collectedFrom));assert(Array.isArray(r.models));assert(Array.isArray(r.media));if(r.status==='index-only'){assert.equal(r.prompt,null);assert.equal(r.media.length,0);assert(r.provenance.collectedFrom.length);for(const s of r.provenance.collectedFrom){assert.match(s.commitSha,/^[a-f0-9]{40}$/);assert(s.url.startsWith('https://github.com/'));}}else{assert.equal(r.status,'original-untested');assert(r.prompt.original);assert.equal(r.rights.prompt,'CC0-1.0');for(const m of r.media){assert(m.path.startsWith('assets/examples/'));assert(fs.existsSync(m.path));assert.equal(m.kind,'illustrative-fixture');assert.equal(m.license,'CC0-1.0');}if(r.type==='editing')assert(r.media.some(m=>m.role==='input')&&r.media.some(m=>m.role==='output'));}}
console.log('Validated '+ids.size+' unique cases');
