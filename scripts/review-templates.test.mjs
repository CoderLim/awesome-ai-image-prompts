import test from 'node:test';
import assert from 'node:assert/strict';
import {fingerprint} from './review-exclusions.mjs';
import {planTemplateExclusions} from './review-templates.mjs';
const make=(id,prompt,postId)=>({id,prompt:{original:prompt},provenance:{originalSource:{postId}}});
const a=make('a','red cat','1'),b=make('b','blue cat','2'),c=make('c','blue cat','3');
const decision={keepId:'a',dropId:'b',keepHash:fingerprint(a.prompt.original),dropHash:fingerprint(b.prompt.original),scope:'catalog'};
test('reviewed template excludes loser exact component only and is idempotent',()=>{
 const r=planTemplateExclusions([a,b,c],[decision]);
 assert.equal(r.applied.length,1);assert.deepEqual(r.applied[0].affectedIds,['b','c']);
 assert.equal(r.entries[0].reason,'template-duplicate');assert(!r.entries[0].keys.includes('id:a'));
 assert.equal(planTemplateExclusions([a,b,c],[decision],r.entries).applied.length,0);
});
test('stale prompt, featured alias, absent keeper, and keeper exclusion block removal',()=>{
 assert.equal(planTemplateExclusions([a,{...b,prompt:{original:'green cat'}}],[decision]).skipped[0].reason,'stale_prompt');
 assert.equal(planTemplateExclusions([a,b,c],[decision],[],{featured:['c']}).skipped[0].reason,'protected_featured_or_keeper');
 assert.equal(planTemplateExclusions([b],[decision]).skipped[0].reason,'missing_record');
 assert.equal(planTemplateExclusions([a,b],[decision],[{id:'a',keys:['id:a']}]).skipped[0].reason,'keeper_unavailable');
});
test('a pending or held candidate cannot displace a published or advanced case',()=>{
 assert.equal(planTemplateExclusions([{...a,templateStatus:'visual_review'},b],[decision]).applied.length,0);
 assert.equal(planTemplateExclusions([{...a,templateStatus:'text_recheck'},{...b,templateStatus:'visual_review'}],[decision]).applied.length,0);
});
test('do not merge chain or shared exact component blindly',()=>{
 const d={keepId:'b',dropId:'c',keepHash:fingerprint('blue cat'),dropHash:fingerprint('blue cat')};
 assert.equal(planTemplateExclusions([a,b,c],[decision,d]).applied.length,0);
});
