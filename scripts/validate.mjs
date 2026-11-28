import fs from 'node:fs';
import assert from 'node:assert/strict';
import {isXCollector,validateXRecord,hasXPermission} from './x-source.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const tax=read('data/taxonomy.json'),ids=new Set(),sources=new Map(read('data/sources.json').map(s=>[s.id,s]));
const imageHosts={
  prompthero:['cdn.prompthero.com','img.prompthero.com'],
  default:['raw.githubusercontent.com','pub-62cf7640cd0f4066b60933bd2e9b85ef.r2.dev'],
};
for(const f of fs.readdirSync('data/index').filter(x=>x.endsWith('.json')))for(const r of read('data/index/'+f)){
  assert.match(r.id,/^[a-z0-9-]+$/);
  assert(!ids.has(r.id),'Duplicate '+r.id);
  ids.add(r.id);
  assert(tax[r.type]?.includes(r.category));
  assert(r.title.en||r.title.zh);
  assert.equal(r.status,'index-only');
  assert.equal(typeof r.prompt.original,'string');
  assert(r.prompt.original.trim());
  assert.equal(r.media.length,0);
  assert(r.provenance.originalSource);
  assert(r.provenance.collectedFrom.length);
  const sourceId=r.provenance.collectedFrom[0].sourceId;
  for(const s of r.provenance.collectedFrom){
    if(s.sourceId==='prompthero'){
      assert.equal(s.mode,'collector-export');
      assert.match(s.snapshotSha256,/^[a-f0-9]{64}$/);
      assert.equal(s.url,r.provenance.originalSource.url);
      const u=new URL(s.url);
      assert.equal(u.origin,'https://prompthero.com');
      assert(u.pathname.startsWith('/prompt/'+r.provenance.originalSource.postId));
      assert.equal(r.rights.prompt,'unknown');
      assert.equal(r.rights.media,'unknown');
    }else if(s.mode==='collector-export'&&sources.get(s.sourceId)?.platform==='x'){
      assert.equal(s.mode,'collector-export');
      assert.match(s.snapshotSha256,/^[a-f0-9]{64}$/);
      assert.equal(s.url,r.provenance.originalSource.url);
      validateXRecord(r,sources.get(s.sourceId));
      assert((r.rights.prompt==='unknown'&&r.rights.media==='unknown')||hasXPermission(r),'Invalid X rights evidence: '+r.id);
    }else if(s.mode==='manual-owner-supplied'){
      assert.equal(sources.get(s.sourceId)?.mode,'manual-owner-supplied');
      assert.match(s.snapshotSha256,/^[a-f0-9]{64}$/);
      assert(s.url.startsWith('https://github.com/'));
      assert.equal(r.rights.prompt,'unknown');
      assert.equal(r.rights.media,'unknown');
    }else{
      assert.match(s.commitSha,/^[a-f0-9]{40}$/);
      assert(s.url.startsWith('https://github.com/'));
    }
  }
  assert(Array.from(r.sourcePreview.promptExcerpt).length<=100);
  assert(r.sourcePreview.images.length<=4);
  const hosts=isXCollector(r)&&sources.get(sourceId)?.platform==='x'?['pbs.twimg.com']:imageHosts[sourceId]??imageHosts.default;
  for(const m of r.sourcePreview.images){
    const u=new URL(m.url);
    assert.equal(u.protocol,'https:');
    assert(hosts.includes(u.hostname),'Unexpected image host '+u.hostname+' for '+sourceId);
    assert(['input','output','source-media'].includes(m.role));
  }
}
console.log('Validated '+ids.size+' unique cases');
