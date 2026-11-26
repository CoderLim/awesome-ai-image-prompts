import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parse,merge,render,displayImages} from './core.mjs';
const source={id:'freestylefly',repository:'owner/repo',ref:'main'},sha='a'.repeat(40);
const fixture='<a name="case-1"></a>\n### 例 1：人像\n\n![Preview](../data/images/case1.jpg)\n\n**来源：** [@example](https://x.com/example/status/123)\n\n```text\nA prompt\n```\n';
test('extract image, prompt preview and attribution',()=>{const [r]=parse(source,'docs/gallery-part-1.md',sha,fixture);assert.equal(r.provenance.originalSource.postId,'123');assert.equal(r.sourcePreview.images[0].url,'https://raw.githubusercontent.com/owner/repo/'+sha+'/data/images/case1.jpg');assert.equal(r.sourcePreview.promptExcerpt,'A prompt');assert.equal(r.prompt.original,'A prompt');});
test('merge matching post and prompt but retain distinct prompts',()=>{const a=parse(source,'docs/gallery-part-1.md',sha,fixture),b=parse({...source,id:'other'},'docs/gallery-part-1.md',sha,fixture),c=parse({...source,id:'third'},'docs/gallery-part-1.md',sha,fixture.replace('A prompt','Another prompt'));assert.equal(merge([...a,...b,...c]).length,2);});
test('render image-first case',()=>{const rows=merge(parse(source,'docs/gallery-part-1.md',sha,fixture));const out=render([],rows,{generation:['portraits'],editing:[],unclassified:[]});assert(out['generation/portraits.md'].includes('<img src='));assert(out['generation/portraits.md'].includes('A prompt'));assert(out['generation/portraits.md'].includes('https://x.com/example/status/123'));assert(!out['generation/portraits.md'].includes('| Case |'));});

test('show one output for generation and ambiguous editing; show two only for verified editing pairs',()=>{
 const images=[{role:'source-media',url:'https://example.com/a.jpg'},{role:'source-media',url:'https://example.com/b.jpg'}];
 const pair=[{role:'input',url:'https://example.com/before.jpg'},{role:'output',url:'https://example.com/after.jpg'}];
 assert.deepEqual(displayImages({type:'generation',sourcePreview:{images}}),[images[0]]);
 assert.deepEqual(displayImages({type:'editing',sourcePreview:{images}}),[images[0]]);
 assert.deepEqual(displayImages({type:'generation',sourcePreview:{images:pair}}),[pair[1]]);
 assert.deepEqual(displayImages({type:'editing',sourcePreview:{images:pair}}),pair);
 assert.deepEqual(displayImages({type:'editing',sourcePreview:{images:[pair[0]]}}),[]);
});
test('compact attribution and conditional full prompt link',()=>{
 const rows=merge(parse(source,'docs/gallery-part-1.md',sha,fixture));
 let page=render([],rows,{generation:['portraits'],editing:[],unclassified:[]})['generation/portraits.md'];
 assert(page.includes('By [@example](https://x.com/example/status/123)'));
 assert(!page.includes('Collected from:'));
 assert(!page.includes('Original post]'));
 assert(!page.includes('[Full prompt]'));
 assert(page.includes('```text\nA prompt\n```'));
 rows[0].prompt.original='First line\n'+ 'Long prompt '.repeat(80)+'END';
 page=render([],rows,{generation:['portraits'],editing:[],unclassified:[]})['generation/portraits.md'];
 assert(page.includes('```text\nFirst line '+ 'Long prompt '.repeat(80)+'END\n```'));
 assert(!page.includes('[Full prompt]'));
 assert(!page.includes('<blockquote>'));
 assert(rows[0].prompt.original.includes('\n'));
});

test('manual README features replace automatic previews, preserve order and category navigation',()=>{
 const [base]=merge(parse(source,'docs/gallery-part-1.md',sha,fixture));
 const mk=(id,type)=>({...base,id,type,category:'portraits',title:{en:id},sourcePreview:{...base.sourcePreview,images:[{role:'output',url:'https://example.com/'+id+'.jpg'}]}});
 const rows=[mk('a','generation'),mk('b','generation'),mk('c','reference')];
 const taxonomy={generation:['portraits'],reference:['portraits']};
 const auto=render([],rows,taxonomy,null);
 assert(auto['README.md'].includes('https://example.com/a.jpg'));
 const manual=render([],rows,taxonomy,['c','b','missing','b']);
 for(const name of ['README.md','README.zh-CN.md']){
  assert(!manual[name].includes('https://example.com/a.jpg'));
  assert(manual[name].includes('https://example.com/b.jpg'));
  assert(manual[name].includes('https://example.com/c.jpg'));
  assert(manual[name].includes('generation/portraits.md#b'));
  assert(manual[name].includes('reference/portraits.md#c'));
  assert(!manual[name].includes('#missing'));
  assert.equal(manual[name].split('https://example.com/b.jpg').length-1,1);
 }
 assert.equal(manual['generation/portraits.md'],auto['generation/portraits.md']);
 const reordered=render([],rows,taxonomy,['b','a'])['README.md'];
 assert(reordered.indexOf('#b')<reordered.indexOf('#a'));
 const empty=render([],rows,taxonomy,[])['README.md'];
 assert(!empty.includes('<table>'));assert(empty.includes('## Browse by category'));
});
