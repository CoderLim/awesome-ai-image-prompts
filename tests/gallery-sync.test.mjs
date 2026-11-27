import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { exportGallery, eligible } from '../scripts/export-gallery.mjs';
import { runSync, deletionPlan } from '../scripts/sync-gallery.mjs';

const record=(id,extra={})=>({id,media_type:'image',media:[{type:'image',role:'output',originalUrl:'https://raw.githubusercontent.com/example/'+id+'.png'}],...extra});
const existing=(id,type='image')=>({id,media_type:type,media:JSON.stringify([{originalUrl:'https://raw.githubusercontent.com/example/'+id+'.png',key:'old/'+id}])});
const snapshot=(records,restricted=[])=>({mediaType:'image',records,restricted,excluded:[]});
function fake(rows=[],{failMedia=false,failWrite=false}={}){
  const data=new Map(rows.map(r=>[r.id,r])),calls=[];
  const io={
    async list(t){return [...data.values()].filter(r=>r.media_type===t);},
    async assertNoCollisions(rs,t){if(rs.some(r=>data.has(r.id)&&data.get(r.id).media_type!==t))throw Error('collision');},
    async remove(ids,t){calls.push(['delete',ids]);for(const id of ids)if(data.get(id)?.media_type===t)data.delete(id);},
    async purgeWithdrawn(rs){calls.push(['purge',rs.map(r=>r.id)]);},
    async prepare(m,old,force){calls.push(['media',m.originalUrl,Boolean(old),force]);if(failMedia)throw Error('download failed');return {...m,key:old?.key??'new/'+m.originalUrl,thumbnailKey:'thumb',width:10,height:20};},
    async upsert(rs){calls.push(['upsert',rs.map(r=>r.id)]);if(failWrite)throw Error('D1 failed');for(const r of rs)data.set(r.id,{...r,media:JSON.stringify(r.media)});}
  };
  return {data,calls,io};
}
test('real source export partitions canonical cases and publishes eligible approved content',()=>{
  const result=exportGallery();
  const ids=new Set(result.records.map(r=>r.id));
  assert.equal(ids.size,result.records.length);
  assert.equal(result.records.length+result.excluded.length+result.pending.length+result.sourceUnavailable.length,result.canonical);
  const raw=fs.readdirSync('data/index').filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync('data/index/'+f,'utf8')));
  const byId=new Map(raw.map(r=>[r.id,r]));
  for(const r of result.records){
    assert(eligible(byId.get(r.id)));
    assert.equal(r.author.publicationStatus,'cleared');
    assert.equal(r.prompt,byId.get(r.id).prompt.original);
    assert.equal(r.media_type,'image');
    assert(r.media.length);
  }
  assert.equal(result.reviewCounts.approved+result.reviewCounts.pending+result.reviewCounts.rejected,result.total);
  assert(!eligible({rights:{prompt:'unknown',media:'unknown'}}));
});
test('migration supports image and video and rejects invalid JSON',()=>{
  const db=new DatabaseSync(':memory:');
  db.exec(fs.readFileSync('migrations/0001_prompts.sql','utf8'));
  const insert=db.prepare('INSERT INTO prompts(id,media_type,slug,title,prompt,category,input_mode,source_url,updated_at) VALUES(?,?,?,?,?,?,?,?,?)');
  for(const type of ['image','video'])insert.run(type,type,type,type,'p','other','unknown','https://example.com',1);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM prompts').get().n,2);
  assert.throws(()=>db.exec("UPDATE prompts SET media='invalid'"));
  db.close();
});
test('upsert, update, restore and delete; other media type is untouched; repeat converges',async()=>{
  const {data,calls,io}=fake([existing('old'),existing('keep'),existing('video','video')]);
  const s=snapshot([record('keep',{featured:1}),record('new')]);
  await runSync(s,io,{allowLarge:true});
  assert(!data.has('old'));assert.equal(data.get('keep').featured,1);assert(data.has('new'));assert(data.has('video'));
  assert(calls.findIndex(c=>c[0]==='upsert')<calls.findIndex(c=>c[0]==='delete'&&c[1].includes('old')));
  await runSync(s,io);
  assert.equal(data.size,3);
  await runSync(snapshot([...s.records,record('old')]),io);
  assert(data.has('old'));
});
test('media and D1 errors never perform ordinary stale deletion',async()=>{
  for(const opts of [{failMedia:true},{failWrite:true}]){
    const {data,io}=fake([existing('old'),existing('keep')],opts);
    await assert.rejects(runSync(snapshot([record('keep')]),io,{allowLarge:true}));
    assert(data.has('old'));
  }
});
test('dry-run has no write or media processing; mass deletion protected',async()=>{
  const {data,calls,io}=fake([existing('old')]);
  await runSync(snapshot([]),io,{dryRun:true});
  assert.equal(calls.length,0);
  await assert.rejects(runSync(snapshot([]),io),/Large ordinary deletion/);
  assert(data.has('old'));
  assert(deletionPlan([existing('old')],[],[],false).blocked);
});
test('known rights withdrawal is removed before unrelated media failure',async()=>{
  const {data,calls,io}=fake([existing('revoked'),existing('keep')],{failMedia:true});
  await assert.rejects(runSync(snapshot([record('keep')],['revoked']),io));
  assert(!data.has('revoked'));assert(data.has('keep'));
  assert(calls.some(c=>c[0]==='purge'&&c[1].includes('revoked')));
});
test('cross-type ID collision rejected before writes',async()=>{
  const {data,calls,io}=fake([existing('collision','video')]);
  await assert.rejects(runSync(snapshot([record('collision')]),io),/collision/);
  assert.equal(calls.length,0);assert.equal(data.get('collision').media_type,'video');
});

test('pending private records are rejected before cloud writes',async()=>{
  const {calls,io}=fake();
  await assert.rejects(runSync(snapshot([record('pending',{author:{publicationStatus:'pending-review'}})]),io),/Pending records/);
  assert.equal(calls.length,0);
});
test('loss of clearance removes hosted media without retaining pending row',async()=>{
  const {data,calls,io}=fake([existing('pending')]);
  await runSync({...snapshot([]),unlicensed:['pending']},io);
  assert(calls.some(c=>c[0]==='purge'&&c[1].includes('pending')));
  assert(!data.has('pending'));
});
