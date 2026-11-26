// Local-only candidate preflight. Never writes catalog shards or generated galleries.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const normalize = s => String(s ?? '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
const hash = s => createHash('sha256').update(s).digest('hex');
const idOf = r => String(r.id ?? '').trim();
const textOf = r => typeof r.prompt === 'string' ? r.prompt : r.prompt?.original;
const compare = (a,b) => Number(Boolean(b.author))-Number(Boolean(a.author)) ||
  Number(Boolean(b.imageUrls?.length))-Number(Boolean(a.imageUrls?.length)) ||
  (Number(b.likes)||0)-(Number(a.likes)||0) || (Number(b.views)||0)-(Number(a.views)||0) ||
  (idOf(a)>idOf(b)?-1:idOf(a)<idOf(b)?1:0);

export function preflight(raw, catalog) {
  const ids=new Set(), existingIds=new Map(), existingPrompts=new Map(), existingPosts=new Map(), groups=new Map(), audit=[];
  for(const c of catalog) {
    if(c.id) existingIds.set(c.id,c.id);
    const p=normalize(textOf(c)); if(p&&!existingPrompts.has(p)) existingPrompts.set(p,c.id);
    const post=c.provenance?.originalSource?.postId;
    if(post&&!existingPosts.has(String(post))) existingPosts.set(String(post),c.id);
  }
  for(const r of raw) {
    const id=idOf(r); if(!id||ids.has(id)) throw new Error('Missing or repeated collector ID: '+id);
    ids.add(id);
    const p=normalize(textOf(r));
    const existing=existingIds.get('prompthero-'+id)||existingIds.get(id)||existingPosts.get(id);
    if(existing) {audit.push({case_id:id,status:'already_imported',canonical_id:existing});continue;}
    if(!p) {audit.push({case_id:id,status:'missing_prompt',canonical_id:null});continue;}
    if(existingPrompts.has(p)) {audit.push({case_id:id,status:'exact_duplicate',canonical_id:existingPrompts.get(p)});continue;}
    if(!groups.has(p)) groups.set(p,[]);
    groups.get(p).push(r);
  }
  const queue=[];
  for(const [p,group] of groups) {
    group.sort(compare);
    const [r,...dups]=group, id=idOf(r);
    audit.push({case_id:id,status:'review_queue',canonical_id:id});
    for(const d of dups) audit.push({case_id:idOf(d),status:'exact_duplicate',canonical_id:id});
    const flags=[];
    if(!r.author)flags.push('author_missing');
    if(!r.model)flags.push('model_missing');
    if(!r.imageUrls?.length)flags.push('image_url_missing');
    if(p.length<30)flags.push('short_prompt_review');
    if(r.referenceImageUrls?.length)flags.push('reference_roles_unverified');
    if(/\b(?:reference (?:image|photo)|uploaded (?:image|photo)|same face|input image)\b|参考图|上传的/i.test(p))flags.push('reference_intent_hint');
    if(/<lora:|--(?:ar|v|stylize|s|iw)\b/i.test(p))flags.push('model_specific_syntax');
    if(/\b(?:video|first frame|last frame|camera rotates|frame rate)\b|视频/i.test(p))flags.push('possible_video_review');
    if(/\b(?:remove|erase|delete|upscale|resize|crop|denoise)\b|移除|去除|抠图|删除/i.test(p))flags.push('possible_utility_review');
    queue.push({case_id:id,source_url:r.sourceUrl,model:r.model??null,author:r.author??null,author_url:r.authorUrl??null,
      prompt:r.prompt,negative_prompt:r.negativePrompt??null,image_urls:r.imageUrls??[],reference_candidates:r.referenceImageUrls??[],
      prompt_sha256:hash(p),flags,text_status:'pending',category:null,input_mode:null,text_reason:null,
      review_method:'not_reviewed',visual_status:'pending',image_match:'unverified',rights_status:'unverified',
      publication_status:'blocked',historical_bucket:'unrecovered'});
  }
  return {queue,audit};
}

export function run(input, output, repo=process.cwd()) {
  const buf=readFileSync(input);
  const raw=buf.toString('utf8').split(/\r?\n/).filter(s=>s.trim()).map((s,i)=>{try{return JSON.parse(s)}catch{throw new Error('Invalid JSONL record '+(i+1))}});
  const index=join(repo,'data/index');
  const catalog=readdirSync(index).filter(f=>f.endsWith('.json')).sort().flatMap(f=>JSON.parse(readFileSync(join(index,f),'utf8')));
  const {queue,audit}=preflight(raw,catalog);
  if(existsSync(output)) throw new Error('Output directory already exists; choose a new path to protect previous review decisions.');
  mkdirSync(output,{recursive:true});
  const write=(file,rows)=>writeFileSync(join(output,file),rows.map(r=>JSON.stringify(r)).join('\n')+'\n');
  write('queue.jsonl',queue);write('audit.jsonl',audit);
  const counts={}; for(const a of audit)counts[a.status]=(counts[a.status]??0)+1;
  const summary={version:'preflight-v1',source_sha256:hash(buf),raw_count:raw.length,catalog_count:catalog.length,counts,visual_verified_count:0,semantic_reviewed_count:0,rights_cleared_count:0};
  writeFileSync(join(output,'summary.json'),JSON.stringify(summary,null,2)+'\n');return summary;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const [input,output]=process.argv.slice(2);
  if(!input||!output)throw new Error('Usage: node scripts/prompthero-preflight.mjs <collector.jsonl> <new-local-output-dir>');
  console.log(JSON.stringify(run(input,output),null,2));
}
