import test from 'node:test';
import assert from 'node:assert/strict';
import {audit} from './audit-prompt-similarity.mjs';
const q=(id,prompt,next_action='visual_review')=>({case_id:id,prompt,next_action,text_status:'advance'});
const c=(id,prompt,post=null)=>({id,prompt:{original:prompt},provenance:{originalSource:{postId:post},collectedFrom:[{sourceId:'other'}]}});
test('exact prompt and post match are independent',()=>{
  const r=audit([q('a',' Ａ   B '),q('b','different'),q('c','ignore','exclude')],[c('x','a b'),c('y','unrelated','b')]);
  assert.equal(r.candidates,2);assert.equal(r.pairs.filter(p=>p.exact_prompt).length,1);assert.equal(r.pairs.filter(p=>p.same_post).length,1);
});
test('near text is flagged without automatic rejection',()=>{
  const p='Photograph of a ceramic sculpture under soft morning light on a wooden table. Detailed textures and warm neutral palette.';
  const r=audit([q('a',p)],[c('x',p.replace('wooden','marble'))],.75);
  assert.equal(r.pairs[0].status,'needs_pair_review');
});
test('same prompt within candidates is reported once even for short text',()=>{
  const r=audit([q('a','猫'),q('b','猫')],[]);
  assert.equal(r.pairs.length,1);assert.equal(r.pairs[0].exact_prompt,true);
});
