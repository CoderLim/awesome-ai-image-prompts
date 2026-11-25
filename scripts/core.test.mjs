import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parse,merge,render} from './core.mjs';
const source={id:'evolink',repository:'owner/repo',ref:'main'};
const sha='a'.repeat(40);
const fixture='<a id="portraits-case-1"></a>\n### Case 1: [Portrait](https://x.com/example/status/123) (by [@example](https://x.com/example))\n\n**Input:** No external input is specified\n\n```\nA prompt\n```\n';
test('extract source without mirroring prompt or image',()=>{const [r]=parse(source,'cases/portraits.md',sha,fixture);assert.equal(r.provenance.originalSource.postId,'123');assert.equal(r.inputMode,'text-to-image');assert.equal(r.prompt,null);assert.deepEqual(r.media,[]);});
test('merge matching post and prompt; retain different prompts in same post',()=>{const a=parse(source,'cases/portraits.md',sha,fixture);const b=parse({...source,id:'other'},'cases/portraits.md',sha,fixture);const c=parse({...source,id:'third'},'cases/portraits.md',sha,fixture.replace('A prompt','Another prompt'));const result=merge([...a,...b,...c]);assert.equal(result.length,2);assert(result.some(r=>r.provenance.collectedFrom.length===2));});
test('render links to original source',()=>{const rows=merge(parse(source,'cases/portraits.md',sha,fixture));const out=render([],rows,{generation:['portraits'],editing:[],unclassified:[]});assert(out['generation/portraits.md'].includes('https://x.com/example/status/123'));});
