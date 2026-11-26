// Local-only exact and near-text audit. Similarity is a review hint, never deletion.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { normalize } from './prompthero-preflight.mjs';

export function audit(queue, catalog, threshold=0.83) {
  if (!(threshold>0&&threshold<=1)) throw Error('Invalid similarity threshold');
  const candidates=queue.filter(r=>r.next_action==='visual_review'&&r.text_status==='advance');
  const all=[...candidates.map(r=>({id:'prompthero-'+r.case_id,prompt:r.prompt,post:r.case_id,source:'candidate'})),
    ...catalog.map(r=>({id:r.id,prompt:r.prompt.original,post:r.provenance.originalSource.postId,source:r.provenance.collectedFrom[0].sourceId}))];
  const normalized=all.map(r=>normalize(r.prompt));
  const df=new Map();
  const vectors=normalized.map(s=>{
    const chars=Array.from(s), counts=new Map();
    for(let i=0;i<=chars.length-3;i++){const k=chars.slice(i,i+3).join('');counts.set(k,(counts.get(k)||0)+1);}
    for(const k of counts.keys())df.set(k,(df.get(k)||0)+1);
    return counts;
  });
  const index=new Map();
  for(let i=0;i<vectors.length;i++){
    const v=vectors[i];let sq=0;
    for(const [k,n] of v){const w=(1+Math.log(n))*(1+Math.log((all.length+1)/(df.get(k)+1)));v.set(k,w);sq+=w*w;}
    for(const [k,w] of v){if(!index.has(k))index.set(k,[]);index.get(k).push([i,w/Math.sqrt(sq)]);}
    for(const [k,w] of v)v.set(k,w/Math.sqrt(sq));
  }
  const pairs=[];
  for(let i=0;i<candidates.length;i++){
    const scores=new Float64Array(all.length);
    for(const [k,w] of vectors[i])for(const [j,v] of index.get(k)||[])if(j>i)scores[j]+=w*v;
    for(let j=i+1;j<all.length;j++){
      const exact=normalized[i]!==''&&normalized[i]===normalized[j];
      const samePost=Boolean(all[i].post)&&all[i].post===all[j].post;
      if(exact||samePost||scores[j]+1e-12>=threshold)pairs.push({
        case_id:candidates[i].case_id,match_id:all[j].id,match_source:all[j].source,
        similarity:+Math.min(1,scores[j]).toFixed(6),exact_prompt:exact,same_post:samePost,
        status:exact||samePost?'exact_conflict':'needs_pair_review'
      });
    }
  }
  pairs.sort((a,b)=>Number(b.exact_prompt||b.same_post)-Number(a.exact_prompt||a.same_post)||b.similarity-a.similarity||a.case_id.localeCompare(b.case_id)||a.match_id.localeCompare(b.match_id));
  return {algorithm:'unicode-char-trigram-tfidf-cosine-v1',threshold,candidates:candidates.length,catalog:catalog.length,pairs};
}
export function readQueue(file){return fs.readFileSync(file,'utf8').split(/\r?\n/).filter(s=>s.trim()).map(JSON.parse);}
export function readCatalog(root='.'){return fs.readdirSync(path.join(root,'data/index')).filter(f=>f.endsWith('.json')).sort().flatMap(f=>JSON.parse(fs.readFileSync(path.join(root,'data/index',f),'utf8')));}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const [queue,out,threshold='0.83']=process.argv.slice(2);
  if(!queue||!out)throw Error('Usage: node scripts/audit-prompt-similarity.mjs QUEUE.jsonl OUTPUT.json [threshold]');
  const report=audit(readQueue(queue),readCatalog(),Number(threshold));
  fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({candidates:report.candidates,catalog:report.catalog,pairs:report.pairs.length},null,2));
}
