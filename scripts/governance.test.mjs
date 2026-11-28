import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classifyContent,govern,governanceFiles,selectCanonical,galleryView,reviewStatus,firstPassFingerprint} from './governance.mjs';
const make=(id,p,title='Generic')=>({id,title:{en:title},prompt:{original:p},inputMode:'unknown',sourcePreview:{images:[{url:'https://example.com/'+id+'.jpg'}]},provenance:{originalSource:{url:'https://x.com/test/status/123',postId:'123'},collectedFrom:[{path:'docs/gallery-part-1.md',url:'https://example.com/source'}]},rights:{prompt:'unknown',media:'unknown'}});
test('actual prompt outranks misleading generic title',()=>{assert.equal(classifyContent(make('a','Create a UI/UX landing page mockup','Portrait')).category,'ui-mockups');});
test('reference portraits are generation rather than local edits',()=>{const c=classifyContent(make('a','Create a fashion editorial portrait using the uploaded face reference image. Preserve the facial identity.'));assert.equal(c.type,'generation');assert.equal(c.inputMode,'reference-to-image');});
test('explicit removal is editing',()=>{const c=classifyContent(make('a',"Remove the flower from man's hand. Do not change anything else."));assert.equal(c.category,'object-removal');assert.equal(c.inputMode,'image-editing');});
test('reference restyle is editing',()=>{const c=classifyContent(make('a','Transform the uploaded photo into a watercolor illustration.'));assert.equal(c.category,'restyle');});
test('unpublished prompts and duplicate records are withheld',()=>{const a=make('a','Create a cinematic portrait'),b=make('b','Create a cinematic portrait'),c=make('c','原文未公开，案例目标是网页设计。');const g=govern([a,b,c]);assert.equal(g.rows.length,3);assert.equal(g.rows.filter(x=>x.visible).length,1);assert(g.duplicates.some(x=>x.kind==='exact-prompt'));assert.equal(g.metadata.a.quality.rights,'pending-review');const report=JSON.parse(governanceFiles(g)['data/governance/report.json']);assert.equal(report.published,report.approved);assert.equal(report.rejected,2);});

test('deduplicate both post and prompt transitively, prefer complete case, leave prefix-only matches',()=>{
 const a=make('a','Create a cinematic portrait'),b=make('b','Create a different portrait'),c=make('c','Create a different portrait'),d=make('d','Create a distinct landscape');
 c.provenance.originalSource={url:'https://x.com/test/status/456',postId:'456'};
 d.provenance.originalSource={url:'https://x.com/test/status/789',postId:'789'};
 a.sourcePreview.images=[];
 const result=govern([a,b,c,d]);
 assert.equal(result.rows.filter(r=>r.visible).length,2);
 assert.equal(result.metadata.a.duplicateOf,'b');
 assert.equal(result.metadata.c.duplicateOf,'b');
 assert.equal(result.dedup.removed.length,2);
 const long='Create a portrait '+ 'with warm lighting '.repeat(15);
 const e=make('e',long+'red'),f=make('f',long+'blue');
 e.provenance.originalSource={postId:'111'};f.provenance.originalSource={postId:'222'};
 assert.equal(govern([e,f]).rows.filter(r=>r.visible).length,2);
});
test('retained selection independent of source order',()=>{
 const a=make('a','Create a portrait'),b=make('b','Create a portrait');
 assert.deepEqual(govern([a,b]).dedup,govern([b,a]).dedup);
});

test('reference generation and editing share one gallery without losing operation metadata',()=>{
 const rows=[{id:'text',type:'generation',inputMode:'text-to-image',category:'portraits',visible:true,sourceMeta:{review:{qualityStatus:'recommended'}}},{id:'ref',type:'generation',inputMode:'reference-to-image',category:'portraits',visible:true,sourceMeta:{review:{qualityStatus:'recommended'}}},{id:'edit',type:'editing',inputMode:'image-editing',category:'restyle',visible:true,sourceMeta:{review:{qualityStatus:'recommended'}}},{id:'unknown',type:'generation',inputMode:'unknown',category:'other',visible:true,sourceMeta:{review:{qualityStatus:'recommended'}}},{id:'hidden',type:'editing',inputMode:'image-editing',category:'restyle',visible:false}];
 const view=galleryView(rows,{generation:['portraits','other'],editing:['restyle','other']});
 assert.deepEqual(view.rows.map(r=>[r.id,r.type,r.operationType]),[['text','generation','generation'],['ref','reference','generation'],['edit','reference','editing'],['unknown','generation','generation']]);
 assert.deepEqual(view.taxonomy.reference,['portraits','other','restyle']);
});

test('public gallery includes only approved reviewStatus cases',()=>{
 const rows=[
  {id:'ok',type:'generation',inputMode:'text-to-image',category:'portraits',visible:true,sourceMeta:{review:{qualityStatus:'recommended'}},provenance:{collectedFrom:[{sourceId:'aweniai'}]}},
  {id:'wait',type:'generation',inputMode:'text-to-image',category:'portraits',visible:true,sourceMeta:{},provenance:{collectedFrom:[{sourceId:'evolink'}]}},
  {id:'no',type:'generation',inputMode:'text-to-image',category:'portraits',visible:false,sourceMeta:{review:{qualityStatus:'recommended'}},provenance:{collectedFrom:[{sourceId:'aweniai'}]}},
  {id:'vcl-ok',type:'generation',inputMode:'text-to-image',category:'infographics',visible:true,sourceMeta:{},provenance:{collectedFrom:[{sourceId:'vcl'}]}},
 ];
 assert.equal(reviewStatus(rows[0]),'approved');
 assert.equal(reviewStatus(rows[1]),'pending');
 assert.equal(reviewStatus(rows[2]),'rejected');
 assert.equal(reviewStatus(rows[3]),'approved');
 const pub=galleryView(rows,{generation:['portraits','infographics'],editing:[]},{publicOnly:true});
 assert.deepEqual(pub.rows.map(r=>r.id),['ok','vcl-ok']);
 const a=make('a','Create a cinematic portrait');
 a.sourceMeta={review:{qualityStatus:'recommended'}};
 a.provenance.collectedFrom=[{sourceId:'aweniai',path:'x',url:'https://example.com'}];
 const b=make('b','Create another cinematic portrait');
 b.provenance.collectedFrom=[{sourceId:'evolink',path:'x',url:'https://example.com'}];
 const report=JSON.parse(governanceFiles(govern([a,b]))['data/governance/report.json']);
 assert.equal(report.published,report.approved);
 assert.equal(report.approved+report.pending+report.rejected,report.total);
});

test('PromptHero reviewed export preserves approved provisional classification',()=>{
 const r=make('prompthero-abc','A cinematic portrait with a detailed poster layout');
 r.type='generation';r.category='posters';r.inputMode='text-to-image';
 r.provenance.collectedFrom=[{sourceId:'prompthero',url:'https://prompthero.com/prompt/abc'}];
 r.sourceMeta={review:{qualityStatus:'recommended',classificationConfidence:'medium'}};
 assert.deepEqual(classifyContent(r),{type:'generation',category:'posters',inputMode:'text-to-image',confidence:'medium',reason:'reviewed-collector-export'});
 assert.equal(govern([r]).metadata[r.id].quality.rights,'pending-review');
});

test('AWENIAI reviewed collector export preserves approved provisional classification',()=>{
 const r=make('aweniai-123','Transform the uploaded photo into a 3:4 diptych poster with giant typography.');
 r.type='generation';r.category='posters';r.inputMode='reference-to-image';
 r.provenance.collectedFrom=[{sourceId:'aweniai',url:'https://x.com/AWENIAI/status/123'}];
 r.sourceMeta={review:{qualityStatus:'recommended',classificationConfidence:'medium'}};
 assert.deepEqual(classifyContent(r),{type:'generation',category:'posters',inputMode:'reference-to-image',confidence:'medium',reason:'reviewed-collector-export'});
});

test('owner-supplied manual import preserves approved provisional classification',()=>{
 const r=make('manual-beijing-whimsical-travel-illustration','Create an exceptionally charming, whimsical travel illustration featuring BeiJing, China.');
 r.type='generation';r.category='travel';r.inputMode='text-to-image';
 r.provenance.collectedFrom=[{sourceId:'manual',mode:'manual-owner-supplied',url:'https://github.com/CoderLim/awesome-ai-image-prompts'}];
 r.sourceMeta={review:{qualityStatus:'recommended',classificationConfidence:'high'}};
 assert.deepEqual(classifyContent(r),{type:'generation',category:'travel',inputMode:'text-to-image',confidence:'high',reason:'reviewed-owner-supplied'});
 assert.equal(reviewStatus(govern([r]).rows[0]),'approved');
});

test('manual exclusion withholds the entire duplicate component from canonical gallery',()=>{
 const a=make('a','Create a cinematic portrait'),b=make('b','Create a cinematic portrait');
 const result=govern([a,b],[{id:'a',keys:['id:a']}]);
 assert.equal(result.rows.filter(r=>r.visible).length,0);
 assert.equal(result.metadata.a.quality.status,'manual-excluded');
 assert.equal(result.metadata.b.quality.status,'manual-excluded');
 assert.deepEqual(JSON.parse(governanceFiles(result)['data/governance/canonical.json']),[]);
 assert.equal(JSON.parse(governanceFiles(result)['data/governance/report.json']).manualExcluded,2);
 assert.equal(govern([a,b]).rows.filter(r=>r.visible).length,1);
});

test('durable first-pass decisions are content-bound and exclusions take precedence',()=>{
 const r=make('reviewed','A detailed cinematic portrait with side lighting');
 const approvals={reviewed:firstPassFingerprint(r)};
 assert.equal(reviewStatus(govern([r],[],approvals).rows[0]),'approved');
 assert.equal(reviewStatus(govern([{...r,prompt:{original:'Changed prompt'}}],[],approvals).rows[0]),'pending');
 assert.equal(reviewStatus(govern([r],[{id:r.id,keys:['id:'+r.id]}],approvals).rows[0]),'rejected');
});
