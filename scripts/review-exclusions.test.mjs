import test from 'node:test';
import assert from 'node:assert/strict';
import {makeExclusion,exclusionMatches,validateExclusions} from './review-exclusions.mjs';
const row=(id,prompt,postId)=>({id,prompt:{original:prompt},provenance:{originalSource:{postId}}});
test('exclude exact duplicate components and survive source ID changes',()=>{
 const a=row('a',' A  portrait ','123'),b=row('b','different','123'),c=row('c','different','456'),d=row('d','other','789');
 const e=makeExclusion('a',[a,b,c,d]);
 assert.deepEqual([...exclusionMatches([a,b,c,d],[e]).keys()].sort(),['a','b','c']);
 assert(exclusionMatches([row('new-id',' DIFFERENT ','999')],[e]).has('new-id'));
 assert.equal(exclusionMatches([a,b,c,d],[]).size,0);
 validateExclusions([e]);
});
test('similar but nonidentical prompt is not excluded',()=>{
 const a=row('a','red cat','1'),b=row('b','blue cat','2');
 assert.deepEqual([...exclusionMatches([a,b],[makeExclusion('a',[a,b])]).keys()],['a']);
});
test('malformed exclusion data fails closed',()=>{
 assert.throws(()=>validateExclusions([{id:'a',keys:['id:b']}]));
});
