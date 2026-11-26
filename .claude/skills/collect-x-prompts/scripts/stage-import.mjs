#!/usr/bin/env node
// Generate a non-destructive import plan; never mutate the working catalog or publish.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readCatalog} from '../../../../scripts/audit-prompt-similarity.mjs';
import {readExclusions,fingerprint} from '../../../../scripts/review-exclusions.mjs';
import {readTemplateDecisions} from '../../../../scripts/review-templates.mjs';
import {readFeatured} from '../../../../scripts/review-featured.mjs';
import {validateXRecord,xSourceId,xPost} from '../../../../scripts/x-source.mjs';
import {preflight} from './preflight.mjs';
const evidence=x=>typeof x==='string'&&x.trim().length>0;
const cleared=x=>x?.status==='cleared'&&evidence(x.basis)&&evidence(x.evidence);
export function planImport(queue,catalog,sources,filenames,reviews,options={}){
 const byReview=new Map(reviews.map(r=>[r.id,r])),blocked=[],eligible=[];
 const registry=structuredClone(sources),bySource=new Map(registry.map(s=>[s.id,s]));
 for(const r of queue){
  const d=byReview.get(r.id),o=r.provenance.originalSource,sourceId=r.provenance.collectedFrom[0].sourceId,urls=r.sourcePreview.images.filter(m=>m.role!=='input').map(m=>m.url);
  const source=bySource.get(sourceId),user=xPost(o.url).handle;
  const reasons=[];
  if(sourceId!==xSourceId(user)||(source&& (source.platform!=='x'||String(source.username).toLowerCase()!==user)))reasons.push('source-conflict');
  if(!d||d.promptHash!==fingerprint(r.prompt.original)||!evidence(d.reviewer))reasons.push('missing-or-stale-review');
  if(r.sourceMeta?.textReview!=='complete'||!r.sourceMeta?.pairing||d?.text!=='complete'||d?.visual?.status!=='pass'||!Array.isArray(d?.visual?.outputUrls)||!urls.length||!urls.every(u=>d.visual.outputUrls.includes(u))||!evidence(d?.visual?.evidence))reasons.push('visual-or-text-unverified');
  if(r.inputMode!=='text-to-image'&&(d?.reference?.status!=='verified'||!evidence(d?.reference?.evidence)))reasons.push('reference-unverified');
  if(d?.duplicate?.status!=='cleared'||!evidence(d?.duplicate?.evidence))reasons.push('template-review-unverified');
  if(!cleared(d?.rights?.prompt)||!Array.isArray(d?.rights?.media)||!r.sourcePreview.images.every(m=>d.rights.media.some(x=>x.url===m.url&&cleared(x))))reasons.push('separate-rights-evidence-required');
  if(reasons.length){blocked.push({id:r.id,reasons});continue;}
  const registration=source??{id:sourceId,platform:'x',username:user,url:'https://x.com/'+user,mode:'manual-collector-export',license:'Per creator / documented evidence'};
  validateXRecord(r,registration);
  const p={...r,sourcePreview:{...r.sourcePreview,images:r.sourcePreview.images.map(m=>({...m,role:m.role==='input'?'input':'output'}))},rights:{prompt:'permission-documented',media:'permission-documented',evidence:d.rights},sourceMeta:{...r.sourceMeta,visualReview:'pass',imageVerification:d.visual.evidence,review:{...r.sourceMeta.review,qualityStatus:'recommended'},publicationReview:{reviewer:d.reviewer,promptHash:d.promptHash,reference:d.reference??null,duplicate:d.duplicate}}};
  delete p.candidate;eligible.push(p);
 }
 const gate=preflight(eligible,catalog,options);
 const pendingDrops=new Set(gate.template.applied.flatMap(d=>d.affectedIds));
 const added=gate.accepted.filter(r=>{if(pendingDrops.has(r.id)){blocked.push({id:r.id,reasons:['reviewed-template-decision-pending']});return false;}return true;});
 // A similarity result requires review of the specific pair, not a global "cleared" flag.
 const unresolved=new Set();
 for(const pair of gate.near){
  const id=pair.case_id,other=pair.match_id,d=byReview.get(id);
  const otherRow=[...catalog,...eligible].find(r=>r.id===other);
  if(!otherRow||!Array.isArray(d?.duplicate?.pairs)||!d.duplicate.pairs.some(x=>x.id===other&&x.promptHash===fingerprint(otherRow.prompt.original)&&x.status==='distinct'&&evidence(x.evidence)))unresolved.add(id);
 }
 for(const match of gate.imageMatches)for(const id of match.ids.filter(id=>added.some(r=>r.id===id))){
  const d=byReview.get(id);
  if(!Array.isArray(d?.duplicate?.imageMatches)||!d.duplicate.imageMatches.some(x=>x.url===match.url&&x.status==='distinct'&&evidence(x.evidence)))unresolved.add(id);
 }
 const final=added.filter(r=>{if(!unresolved.has(r.id))return true;blocked.push({id:r.id,reasons:['unresolved-similarity-or-image-match']});return false;});
 const updates={};
 for(const sourceId of new Set(final.map(r=>r.provenance.collectedFrom[0].sourceId))){
  const rows=final.filter(r=>r.provenance.collectedFrom[0].sourceId===sourceId).sort((a,b)=>a.id.localeCompare(b.id));
  const user=xPost(rows[0].provenance.originalSource.url).handle;
  let source=bySource.get(sourceId);
  if(!source){source={id:sourceId,platform:'x',username:user,url:'https://x.com/'+user,mode:'manual-collector-export',license:'Per creator / documented evidence'};registry.push(source);bySource.set(sourceId,source);}
  const prefix=sourceId+'-';
  const nums=filenames.filter(f=>f.startsWith(prefix)&&/^\d+\.json$/.test(f.slice(prefix.length))).map(f=>Number(f.slice(prefix.length,-5)));
  let next=Math.max(0,...nums)+1;
  for(let i=0;i<rows.length;i+=80){const f=prefix+String(next++).padStart(3,'0')+'.json';if(filenames.includes(f))throw Error('Shard already exists: '+f);updates['data/index/'+f]=rows.slice(i,i+80);}
  source.snapshotSha256=rows.at(-1).provenance.collectedFrom[0].snapshotSha256;
  source.snapshotSha256s=[...new Set([...(source.snapshotSha256s??[]),...catalog.filter(r=>r.provenance.collectedFrom[0].sourceId===sourceId).map(r=>r.provenance.collectedFrom[0].snapshotSha256).filter(Boolean),...rows.map(r=>r.provenance.collectedFrom[0].snapshotSha256)])];
 }
 if(final.length)updates['data/sources.json']=registry;
 return {updates,added:final.map(r=>r.id),blocked,rejected:gate.rejected,near:gate.near,imageMatches:gate.imageMatches,template:gate.template};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [queueFile,reviewFile,out]=process.argv.slice(2);
 if(!queueFile||!reviewFile||!out)throw Error('Usage: stage-import.mjs QUEUE.json REVIEWS.json NEW_LOCAL_DIRECTORY');
 const root=process.cwd(),dest=path.resolve(out),cache=path.resolve(root,'.cache');
 if(execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim())throw Error('Stage only from a clean checkout; commit prior changes first');
 if(!dest.startsWith(cache+path.sep))throw Error('Stage only under .cache/');
 if(fs.existsSync(dest))throw Error('Output must be new');
 const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
 const result=planImport(read(queueFile),readCatalog(),read('data/sources.json'),fs.readdirSync('data/index'),read(reviewFile),{exclusions:readExclusions(),decisions:readTemplateDecisions(),featured:readFeatured()??[]});
 fs.mkdirSync(dest,{recursive:true});
 for(const [file,value] of Object.entries(result.updates)){const p=path.join(dest,file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(value,null,2)+'\n',{flag:'wx'});}
 const {updates,...report}=result;
 const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const files=Object.keys(updates).map(file=>({path:file,sha256:createHash('sha256').update(fs.readFileSync(path.join(dest,file))).digest('hex')}));
 fs.writeFileSync(path.join(dest,'report.json'),JSON.stringify({...report,head,files},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({added:result.added.length,blocked:result.blocked.length,duplicates:result.rejected.length,output:dest},null,2));
}
