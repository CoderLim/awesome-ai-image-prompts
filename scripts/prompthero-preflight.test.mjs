import test from 'node:test';
import assert from 'node:assert/strict';
import {preflight, normalize} from './prompthero-preflight.mjs';
const raw=(id,prompt,extra={})=>({id,prompt,imageUrls:['https://example.com/image.jpg'],...extra});
const index=(id,prompt,postId)=>({id,prompt:{original:prompt},provenance:{originalSource:{postId}}});
test('normalization matches catalog rules',()=>assert.equal(normalize(' Ａ\n  B '),'a b'));
test('exclude existing IDs, posts and full prompts across sources',()=>{
  const {queue,audit}=preflight([raw('a','changed'),raw('b','new'),raw('c',' SAME   PROMPT '),raw('d','different')],[index('prompthero-a','old','a'),index('other-b','original','b'),index('other-c','same prompt','x')]);
  assert.deepEqual(queue.map(r=>r.case_id),['d']);
  assert.equal(audit.find(r=>r.case_id==='c').status,'exact_duplicate');
  assert.equal(audit.find(r=>r.case_id==='b').canonical_id,'other-b');
});
test('prefer attributed duplicate and preserve excluded mapping',()=>{
  const {queue,audit}=preflight([raw('a','same',{likes:99}),raw('b','same',{author:'creator'}),raw('c','same',{author:'creator'})],[]);
  assert.equal(queue.length,1);assert.equal(queue[0].case_id,'c');
  assert.equal(audit.find(x=>x.case_id==='a').canonical_id,'c');
});
test('flags are not semantic or visual verdicts',()=>{
 const {queue}=preflight([raw('a','remove background',{imageUrls:[]})],[]);
 assert.ok(queue[0].flags.includes('possible_utility_review'));
 assert.ok(queue[0].flags.includes('image_url_missing'));
 assert.equal(queue[0].text_status,'pending');
 assert.equal(queue[0].visual_status,'pending');
 assert.equal(queue[0].publication_status,'blocked');
});
test('empty prompts are excluded and duplicate IDs fail closed',()=>{
 assert.equal(preflight([raw('a',' ')],[]).audit[0].status,'missing_prompt');
 assert.throws(()=>preflight([raw('a','one'),raw('a','two')],[]),/repeated collector ID/);
});
