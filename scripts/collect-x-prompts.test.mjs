import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {resolveRange} from '../.claude/skills/collect-x-prompts/scripts/resolve-range.mjs';
import {collectSlices} from '../.claude/skills/collect-x-prompts/scripts/collect-posts.mjs';
import {verifyPair} from '../.claude/skills/collect-x-prompts/scripts/pair-posts.mjs';
import {makeRecords,saveQueue} from '../.claude/skills/collect-x-prompts/scripts/build-index-shard.mjs';
import {preflight} from '../.claude/skills/collect-x-prompts/scripts/preflight.mjs';
import {planImport} from '../.claude/skills/collect-x-prompts/scripts/stage-import.mjs';
import {xSourceId,validateXRecord,hasXPermission} from './x-source.mjs';
import {fingerprint} from './review-exclusions.mjs';
import {classifyContent} from './governance.mjs';

const taxonomy={generation:['posters','illustrations'],editing:['restyle']};
const url=id=>'https://x.com/foo_bar/status/'+id,media=id=>'https://pbs.twimg.com/media/Example'+id+'.jpg';
const text='Design a cinematic double exposure travel poster with a miniature city and a hand painted moon.';
const row=(id,prompt=text,extra={})=>({id,variants:[{id,username:'foo_bar',full_text:prompt,media_urls:[media(id)],created_at:'2026-11-26T12:00:00Z',...extra}]});
const snapshot={version:1,username:'foo_bar',posts:[row('101','Examples'),row('102',text,{in_reply_to_status_id_str:'101'}),row('103',text),row('104','Examples again')]};
const intermediate={title:'Double exposure',category:'posters',inputMode:'text-to-image',prompt:text,images:[media('101')],url:url('101'),promptPostUrl:url('102'),textReview:'complete',utilityReview:'reusable'};
const sha='a'.repeat(64),opts={snapshotSha256:sha,collectedAt:'2026-11-26T13:00:00Z'};
const record=()=>makeRecords([intermediate],snapshot,taxonomy,opts).records[0];
const variant=(r,id,prompt,postId)=>({...r,id,prompt:{original:prompt},sourcePreview:{...r.sourcePreview,images:[{url:media(postId),role:'source-media'}]},provenance:{...r.provenance,originalSource:{...r.provenance.originalSource,url:url(postId),postId,promptPostId:undefined,promptPostUrl:undefined}}});
const permission={status:'cleared',basis:'test fixture permission',evidence:'fixture only'};

test('UTC inclusive end, invalid calendar dates and reversed dates',()=>{
 const range=resolveRange('2026-11-26..2026-11-26','2026-11-26T12:00:00Z');
 assert.equal(range.since,'2026-11-26');assert.equal(range.until,'2026-11-27');
 assert.equal(resolveRange('week','2026-11-26T12:00:00Z').since,'2026-11-20');
 assert.throws(()=>resolveRange('2026-02-30','2026-11-26'),/Invalid calendar/);
 assert.throws(()=>resolveRange('2026-11-26..2026-11-25','2026-11-26'),/Reversed/);
});

test('saturated ranges split; single-day cap and failed slices are reported, raw variants retained',()=>{
 const range=resolveRange('2026-11-25..2026-11-26','2026-11-26T12:00:00Z');
 const r=collectSlices('foo_bar',range,(q)=>{
  if(q.includes('提示词'))throw Error('mock failure');
  if(q.includes('since:2026-11-25 until:2026-11-27'))return [{id:'101',created_at:'2026-11-25'},{id:'102',created_at:'2026-11-26'}];
  if(q.includes('since:2026-11-25'))return [{id:'101',created_at:'2026-11-25',full_text:'full'}];
  return [{id:'102',created_at:'2026-11-26'},{id:'103',created_at:'2026-11-26'}];
 },{limit:2,days:30});
 assert.equal(r.posts.length,3);assert.equal(r.posts.find(p=>p.id==='101').variants.length,2);
 assert(r.coverage.some(c=>c.status==='split'));assert(r.unresolved.some(c=>c.status==='saturated-day'));assert(r.unresolved.some(c=>c.status==='failed'));
 assert.equal(r.absoluteCompleteness,'not-established');
});

test('only proven pairs and verbatim source text/media; no timestamp-only matching',()=>{
 assert.equal(verifyPair(intermediate,snapshot).evidence,'explicit-reply-or-quote');
 assert.throws(()=>verifyPair({...intermediate,promptPostUrl:url('103')},snapshot),/Ambiguous pair/);
 assert.throws(()=>verifyPair({...intermediate,prompt:text+' invented'},snapshot),/verbatim/);
 assert.throws(()=>verifyPair({...intermediate,images:[media('104')]},snapshot),/not present/);
 assert.equal(verifyPair({...intermediate,url:url('103'),images:[media('103')],promptPostUrl:undefined},snapshot).evidence,'same-post');
});

test('builder requires reviewed content and valid output candidates; handle mapping and stable prompt ID',()=>{
 const r=record();assert(r);assert.equal(r.id,'foo-bar-102');assert.equal(r.provenance.originalSource.postId,'101');
 assert.notEqual(xSourceId('foo_bar'),xSourceId('foobar'));
 assert.equal(makeRecords([{...intermediate,textReview:'pending'}],snapshot,taxonomy,opts).records.length,0);
 assert.equal(makeRecords([{...intermediate,images:[{url:media('101'),role:'input'}]}],snapshot,taxonomy,opts).records.length,0);
 assert.equal(makeRecords([{...intermediate,images:[...Array.from({length:5},(_,i)=>media(String(i))), 'http://bad.test/a.jpg']}],snapshot,taxonomy,opts).records.length,0);
 assert.equal(r.sourceMeta.review.qualityStatus,'candidate');
});

test('transitive cross-source post/prompt dedup and exclusion alias protection',()=>{
 const r=record(),a=variant(r,'other-1','Different source body','101'),b=variant(r,'other-2',text,'301');
 const result=preflight([r,b],[a],{similarity:false});
 assert.equal(result.accepted.length,0);assert.equal(result.rejected.length,2);
 const exclusion={id:'legacy-102',keys:['id:legacy-102','post:102']};
 assert.equal(preflight([r],[],{exclusions:[exclusion],similarity:false}).rejected[0].reason,'manual-exclusion');
 const similar=variant(r,'other-3',text.replace('moon','sun'),'303');
 assert.equal(preflight([r,similar],[],{similarity:false}).accepted.length,2);
});

test('repeated queue build appends new records and never overwrites old',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'x-queue-'));
 try{
  fs.mkdirSync(path.join(root,'data/index'),{recursive:true});
  const r=record(),b=variant(r,'foo-bar-303','An entirely different macro photograph of a yellow butterfly on a flower','303');
  assert.equal(saveQueue(root,'foo-bar',[r]).accepted.length,1);
  assert.equal(saveQueue(root,'foo-bar',[r,b]).accepted.length,1);
  const file=path.join(root,'.cache/review-queues/foo-bar.json'),rows=JSON.parse(fs.readFileSync(file,'utf8'));
  assert.equal(rows.length,2);assert.deepEqual(rows[0],r);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('new X platform validator and classification are generic, not author-specific',()=>{
 const r=record(),source={id:'foo-bar',platform:'x',username:'foo_bar',url:'https://x.com/foo_bar',mode:'manual-collector-export'};
 assert.doesNotThrow(()=>validateXRecord(r,source));
 assert.throws(()=>validateXRecord(r,{...source,username:'other'}),/source mismatch/);
 const approved={...r,sourceMeta:{...r.sourceMeta,review:{...r.sourceMeta.review,qualityStatus:'recommended'}}};
 assert.equal(classifyContent(approved).category,'posters');assert.equal(classifyContent(approved).reason,'reviewed-collector-export');
});

test('stage publication checks review, append-only new shard numbers and source registration',()=>{
 const r=record(),source={id:'foo-bar',platform:'x',username:'foo_bar',url:'https://x.com/foo_bar',mode:'manual-collector-export'};
 const d={id:r.id,promptHash:fingerprint(r.prompt.original),reviewer:'fixture',text:'complete',visual:{status:'pass',outputUrls:[media('101')],evidence:'fixture only'},duplicate:{status:'cleared',evidence:'fixture only'},rights:{prompt:permission,media:[{...permission,url:media('101')}]}};
 assert.equal(planImport([r],[],[],[],[],{similarity:false}).added.length,0);
 assert.equal(planImport([r],[],[],[],[{...d,rights:undefined}],{similarity:false}).added.length,0);
 const result=planImport([r],[],[source],['foo-bar-001.json','foo-bar-003.json'],[d],{similarity:false});
 assert.deepEqual(result.added,[r.id]);assert(result.updates['data/index/foo-bar-004.json']);assert(!result.updates['data/index/foo-bar-001.json']);
 assert(hasXPermission(result.updates['data/index/foo-bar-004.json'][0]));
 assert.equal(result.updates['data/sources.json'][0].platform,'x');
 assert.equal(planImport([r],[],[],[],[d],{similarity:false}).updates['data/sources.json'][0].username,'foo_bar');
});
