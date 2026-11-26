// Local-only exact and near-text audit. Similarity is a review hint, never deletion.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { normalize } from './prompthero-preflight.mjs';

// Variable normalization is only a recall hint, not a verdict.
export function templateSkeleton(prompt){
 return normalize(prompt)
  .replace(/--(?:ar|aspect|v|version|niji|s|stylize|seed|q|quality|chaos|c|w|weird|style|personalize|profile|p|stop)\s+\S+/g,' ')
  .replace(/<lora:[^>]+>/g,' ')
  .replace(/\b(?:red|blue|green|yellow|pink|purple|orange|black|white|cyan|magenta|coral|burgundy|golden|silver|brown|grey|gray|blonde|ivory|beige)\b/g,'<color>')
  .replace(/\b(?:woman|man|female|male|girl|boy|women|men|princess|prince|queen|king)\b/g,'<subject>')
  .replace(/\s+/g,' ').trim();
}
export function audit(queue, catalog, threshold=0.83,{includeCatalog=false,templateRecall=false,fullRecords=[]}={}) {
  if (!(threshold>0&&threshold<=1)) throw Error('Invalid similarity threshold');
  const candidates=queue.filter(r=>r.next_action==='visual_review'&&r.text_status==='advance');
  const pending=[...candidates.map(r=>({id:'prompthero-'+r.case_id,prompt:r.prompt,post:r.case_id,source:'candidate',caseId:r.case_id})),...fullRecords.map(r=>({id:r.id,prompt:r.prompt.original,post:r.provenance.originalSource.postId,source:r.provenance.collectedFrom[0].sourceId,caseId:r.id}))];
  const all=[...pending,
    ...catalog.map(r=>({id:r.id,prompt:r.prompt.original,post:r.provenance.originalSource.postId,source:r.provenance.collectedFrom[0].sourceId}))];
  const normalized=all.map(r=>normalize(r.prompt));
  const skeletons=templateRecall?all.map(r=>templateSkeleton(r.prompt)):[];
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
  for(let i=0;i<(includeCatalog?all.length:pending.length);i++){
    const scores=new Float64Array(all.length);
    for(const [k,w] of vectors[i])for(const [j,v] of index.get(k)||[])if(j>i)scores[j]+=w*v;
    for(let j=i+1;j<all.length;j++){
      const exact=normalized[i]!==''&&normalized[i]===normalized[j];
      const samePost=Boolean(all[i].post)&&all[i].post===all[j].post;
      const templateHint=templateRecall&&skeletons[i].length>=60&&skeletons[i]===skeletons[j];
      if(exact||samePost||templateHint||scores[j]+1e-12>=threshold)pairs.push({
        case_id:i<pending.length?pending[i].caseId:all[i].id,case_source:all[i].source,match_id:all[j].id,match_source:all[j].source,template_hint:templateHint,
        similarity:+Math.min(1,scores[j]).toFixed(6),exact_prompt:exact,same_post:samePost,
        status:exact||samePost?'exact_conflict':'needs_pair_review'
      });
    }
  }
  pairs.sort((a,b)=>Number(b.exact_prompt||b.same_post)-Number(a.exact_prompt||a.same_post)||b.similarity-a.similarity||a.case_id.localeCompare(b.case_id)||a.match_id.localeCompare(b.match_id));
  return {algorithm:'unicode-char-trigram-tfidf-cosine-v1',threshold,candidates:pending.length,catalog:catalog.length,pairs};
}
export function readQueue(file){return fs.readFileSync(file,'utf8').split(/\r?\n/).filter(s=>s.trim()).map(JSON.parse);}
export function readCatalog(root='.'){return fs.readdirSync(path.join(root,'data/index')).filter(f=>f.endsWith('.json')).sort().flatMap(f=>JSON.parse(fs.readFileSync(path.join(root,'data/index',f),'utf8')));}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const [queue,out,threshold='0.83',...flags]=process.argv.slice(2);
  if(!queue||!out)throw Error('Usage: node scripts/audit-prompt-similarity.mjs QUEUE.jsonl OUTPUT.json [threshold]');
  const report=audit(queue==='-'?[]:readQueue(queue),readCatalog(),Number(threshold),{includeCatalog:flags.includes('--all'),templateRecall:flags.includes('--templates')});
  fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({candidates:report.candidates,catalog:report.catalog,pairs:report.pairs.length},null,2));
}
