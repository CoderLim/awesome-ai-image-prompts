// P1 staging. Full galleries remain unchanged until the publication gate is satisfied.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { readQueue, readCatalog } from './audit-prompt-similarity.mjs';
import { normalize } from './prompthero-preflight.mjs';

import { readExclusions, exclusionMatches } from './review-exclusions.mjs';
const hash=p=>createHash('sha256').update(normalize(p)).digest('hex');
const evidence=x=>x&&typeof x.evidence==='string'&&x.evidence.trim()&&typeof x.reviewer==='string'&&x.reviewer.trim();
const right=x=>evidence(x)&&x.status==='cleared'&&typeof x.basis==='string'&&x.basis.trim();
const simpleUtility=p=>/^(?:(?:please\s+)?(?:remove|erase|delete)\s+(?:the\s+)?(?:background|watermark|person|object|logo)|(?:upscale|resize|denoise|crop)(?:\s+(?:the\s+)?(?:image|photo))?|(?:去除|移除|删除)(?:背景|水印|人物)|抠图|图片放大)[.!。！\s]*$/i.test(p.trim());

export function stage(queue,catalog,discovery=[],decisions=[],exclusions=[]){
  const manual=exclusionMatches([...catalog,...queue.map(r=>({id:'prompthero-'+r.case_id,prompt:{original:r.prompt},provenance:{originalSource:{postId:r.case_id}}}))],exclusions);
  const existingIds=new Set(catalog.map(r=>r.id));
  const posts=new Set(catalog.map(r=>r.provenance.originalSource.postId).filter(Boolean));
  const prompts=new Set(catalog.map(r=>normalize(r.prompt.original)));
  const seen=new Set(discovery.map(r=>r.id)), added=[], audit=[];
  const records=new Map(decisions.map(r=>[r.case_id,r]));
  for(const r of queue){
    const id='prompthero-'+r.case_id, reasons=[];
    if(r.next_action!=='visual_review'||r.text_status!=='advance')continue;
    if(manual.has(id)){audit.push({id,status:'excluded',reasons:['manual_exclusion']});continue;}
    const url=new URL(r.source_url);
    if(!/^[a-f0-9]{11}$/.test(r.case_id)||url.origin!=='https://prompthero.com'||url.username||url.password||!new RegExp('^/prompt/'+r.case_id+'(?:-|/|$)').test(url.pathname))throw Error('Invalid source URL: '+id);
    if(!/^[a-z0-9-]+$/.test(r.category)||!['text-to-image','reference-to-image','image-editing'].includes(r.input_mode))throw Error('Invalid classification: '+id);
    if(typeof r.prompt!=='string'||!normalize(r.prompt)||hash(r.prompt)!==r.prompt_sha256){audit.push({id,status:'blocked',reasons:['prompt_fingerprint_mismatch']});continue;}
    if(simpleUtility(r.prompt)){audit.push({id,status:'excluded',reasons:['simple_utility']});continue;}
    if(existingIds.has(id)||posts.has(r.case_id)||prompts.has(normalize(r.prompt))){audit.push({id,status:'excluded',reasons:['exact_catalog_or_candidate_duplicate']});continue;}
    existingIds.add(id);posts.add(r.case_id);prompts.add(normalize(r.prompt));
    if(!seen.has(id)){
      seen.add(id);
      added.push({id,title:r.category.replaceAll('-',' ')+' · '+r.case_id,author:r.author||null,category:r.category,inputMode:r.input_mode,model:r.model||null,url:r.source_url,status:'link-only',rights:'unverified',textReview:'advance',visualReview:'pending',reviewVersion:'v3'});
    }
    const d=records.get(r.case_id);
    if(!d||d.prompt_sha256!==r.prompt_sha256)reasons.push('missing_or_stale_review_evidence');
    if(!evidence(d?.visual)||d.visual.quality!=='pass'||d.visual.match!=='pass'||d.visual.role!=='output'||!r.image_urls?.includes(d.visual.url)||!(/^[a-f0-9]{64}$/.test(d.visual.image_sha256??'')))reasons.push('visual_or_output_role_unverified');
    if(r.input_mode!=='text-to-image'&&(!evidence(d?.reference)||d.reference.status!=='verified'))reasons.push('reference_role_unverified');
    if(!evidence(d?.duplicate)||d.duplicate.status!=='cleared')reasons.push('near_duplicate_review_unverified');
    if(!right(d?.rights?.prompt)||!right(d?.rights?.media)||d.rights.media.url!==d?.visual?.url)reasons.push('separate_prompt_and_media_rights_required');
    audit.push({id,status:reasons.length?'link_only':'eligible_for_gallery_adapter',reasons});
  }
  return {added,audit,eligible:audit.filter(r=>r.status==='eligible_for_gallery_adapter').length};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const [queue,output,reviewEvidence]=process.argv.slice(2);
  if(!queue||!output)throw Error('Usage: node scripts/import-reviewed-cases.mjs QUEUE.jsonl NEW_OUTPUT.json [REVIEW_EVIDENCE.jsonl]');
  const discovery=JSON.parse(fs.readFileSync('data/discovery/prompthero.json','utf8'));
  const result=stage(readQueue(queue),readCatalog(),discovery,reviewEvidence?readQueue(reviewEvidence):[],readExclusions());
  fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({newLinks:result.added.length,eligible:result.eligible,checked:result.audit.length}));
}
