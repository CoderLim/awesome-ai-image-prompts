import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { stage } from './import-reviewed-cases.mjs';
import { normalize } from './prompthero-preflight.mjs';
const make=(prompt='Detailed watercolor portrait of a sailor')=>({case_id:'abcdef01234',source_url:'https://prompthero.com/prompt/abcdef01234-example',prompt,prompt_sha256:createHash('sha256').update(normalize(prompt)).digest('hex'),category:'portraits',input_mode:'text-to-image',next_action:'visual_review',text_status:'advance',author:null,image_urls:['https://cdn.prompthero.com/example.jpg']});
test('unverified candidate becomes link-only; no author required',()=>{
  const r=stage([make()],[]);
  assert.equal(r.eligible,0);assert.equal(r.added.length,1);assert.equal(r.added[0].author,null);assert.equal(r.added[0].prompt,undefined);
  assert.ok(r.audit[0].reasons.includes('near_duplicate_review_unverified'));
});
test('already staged link is not added again',()=>{
  const r=stage([make()],[],[{id:'prompthero-abcdef01234'}]);
  assert.equal(r.added.length,0);assert.equal(r.audit.length,1);
});
test('exact match, stale fingerprint and utility are blocked',()=>{
  const q=make();
  const c={id:'other',prompt:{original:q.prompt},provenance:{originalSource:{postId:'another'}}};
  assert.equal(stage([q],[c]).audit[0].status,'excluded');
  assert.equal(stage([{...q,prompt_sha256:'0'.repeat(64)}],[]).added.length,0);
  assert.equal(stage([make('Remove background')],[]).audit[0].status,'excluded');
});
test('content and duplicate review allow gallery eligibility without visual, reference or rights evidence',()=>{
  const q=make();
  const d={case_id:q.case_id,prompt_sha256:q.prompt_sha256,duplicate:{status:'cleared',evidence:'pair audit',reviewer:'reviewer'}};
  assert.equal(stage([q],[],[],[d]).eligible,1);
  assert.equal(stage([{...q,input_mode:'reference-to-image'}],[],[],[d]).eligible,1);
  assert.equal(stage([{...q,image_urls:[]}],[],[],[d]).eligible,0);
  assert.equal(stage([q],[],[],[{...d,prompt_sha256:'stale'}]).eligible,0);
});
test('manual candidate exclusion blocks a future import plan',()=>{
 const q=make();
 const result=stage([q],[],[],[],[{id:'prompthero-'+q.case_id,keys:['id:prompthero-'+q.case_id]}]);
 assert.equal(result.eligible,0);
 assert.equal(result.added.length,0);
 assert.deepEqual(result.audit[0].reasons,['manual_exclusion']);
});
