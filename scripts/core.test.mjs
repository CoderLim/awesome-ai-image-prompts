import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parse,merge,render} from './core.mjs';
const source={id:'freestylefly',repository:'owner/repo',ref:'main'},sha='a'.repeat(40);
const fixture='<a name="case-1"></a>\n### 例 1：人像\n\n![Preview](../data/images/case1.jpg)\n\n**来源：** [@example](https://x.com/example/status/123)\n\n```text\nA prompt\n```\n';
test('extract image, prompt preview and attribution',()=>{const [r]=parse(source,'docs/gallery-part-1.md',sha,fixture);assert.equal(r.provenance.originalSource.postId,'123');assert.equal(r.sourcePreview.images[0].url,'https://raw.githubusercontent.com/owner/repo/'+sha+'/data/images/case1.jpg');assert.equal(r.sourcePreview.promptExcerpt,'A prompt');assert.equal(r.prompt,null);});
test('merge matching post and prompt but retain distinct prompts',()=>{const a=parse(source,'docs/gallery-part-1.md',sha,fixture),b=parse({...source,id:'other'},'docs/gallery-part-1.md',sha,fixture),c=parse({...source,id:'third'},'docs/gallery-part-1.md',sha,fixture.replace('A prompt','Another prompt'));assert.equal(merge([...a,...b,...c]).length,2);});
test('render image-first case',()=>{const rows=merge(parse(source,'docs/gallery-part-1.md',sha,fixture));const out=render([],rows,{generation:['portraits'],editing:[],unclassified:[]});assert(out['generation/portraits.md'].includes('<img src='));assert(out['generation/portraits.md'].includes('A prompt'));assert(out['generation/portraits.md'].includes('https://x.com/example/status/123'));assert(!out['generation/portraits.md'].includes('| Case |'));});
