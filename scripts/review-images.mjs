// Local-only reviewer. No external model calls, no source data mutation.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { govern } from './governance.mjs';
import { readApprovals, writeApprovals, reviewStatus, reviewFingerprint } from './review-status.mjs';
import { readCatalog, readQueue } from './audit-prompt-similarity.mjs';
import { readExclusions, writeExclusions, exclusionMatches, makeExclusion } from './review-exclusions.mjs';

import { readFeatured, writeFeatured } from './review-featured.mjs';
import { readLocalReviewQueues } from './review-local-queues.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
let queuePath,port=4178;
for(let i=0;i<args.length;i++){
 if(args[i]==='--queue')queuePath=args[++i];
 else if(args[i]==='--port')port=Number(args[++i]);
 else throw Error('Usage: npm run review:images -- [--queue /path/to/V3.jsonl] [--port 4178]');
}
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid port');
const catalog=readCatalog(root),baseline=govern(catalog);
const published=baseline.rows.filter(r=>r.reviewStatus!=='rejected');
const known=new Set(catalog.map(r=>r.id));
const queue=queuePath?readQueue(path.resolve(queuePath)).filter(r=>r.next_action==='visual_review'&&r.text_status==='advance'):[];
const candidates=[];
for(const r of queue){
 if(!/^[a-f0-9]{11}$/.test(r.case_id)||typeof r.prompt!=='string'||!Array.isArray(r.image_urls))throw Error('Invalid queue row');
 const id='prompthero-'+r.case_id;
 if(known.has(id))continue;known.add(id);
 candidates.push({id,title:{en:r.category+' · '+r.case_id},prompt:{original:r.prompt},category:r.category,inputMode:r.input_mode,
  type:r.input_mode==='image-editing'?'editing':'generation',sourcePreview:{images:r.image_urls.map(url=>({url,role:'source-media'}))},
  provenance:{originalSource:{postId:r.case_id,url:r.source_url,author:r.author||null},collectedFrom:[{sourceId:'prompthero',url:r.source_url}]},
  sourceMeta:{model:r.model},candidate:true});
}
candidates.push(...readLocalReviewQueues(root,known));
const all=[...catalog,...candidates],display=[...published,...candidates];
const displayIds=new Set(display.map(r=>r.id));
const byId=new Map(published.map(r=>[r.id,r]));
const safeUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}};
const cards=display.map(r=>{
 const images=r.sourcePreview.images.filter(m=>m.role!=='input');
 const ranked=[...images.filter(m=>m.role==='output'),...images.filter(m=>m.role!=='output')];
 const source=r.provenance.collectedFrom[0];
 return {id:r.id,title:r.title.en||r.title.zh||r.id,category:r.category,inputMode:r.inputMode,source:source.sourceId,
  model:r.sourceMeta?.model||r.models?.map(x=>typeof x==='string'?x:x.name||x.id).filter(Boolean).join(', ')||'Unknown',
  candidate:!!r.candidate,images:[...new Set(ranked.map(m=>safeUrl(m.url)).filter(Boolean))],
  sourceUrl:safeUrl(r.provenance.originalSource.url||source.url),author:r.provenance.originalSource.author||null,
  prompt:r.prompt.original};
});
const token=randomBytes(32).toString('hex'),host='127.0.0.1:'+port;
const html=fs.readFileSync(path.join(root,'scripts/review-images.html'),'utf8');
const revision=e=>createHash('sha256').update(JSON.stringify(e)).digest('hex');
function state(){
 const entries=readExclusions(root),matched=exclusionMatches(all,entries),featured=readFeatured(root);
 const approvals=readApprovals(root);
 const statuses=Object.fromEntries(display.map(r=>[r.id,matched.has(r.id)?'rejected':r.candidate?'pending':reviewStatus(r,approvals)]));
 return {entries,featured,statuses,revision:revision({entries,featured,approvals}),excluded:Object.fromEntries([...matched].filter(([id])=>displayIds.has(id)))};
}
function send(res,status,value,contentType='application/json'){
 res.writeHead(status,{'Content-Type':contentType+'; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"});
 res.end(contentType==='application/json'?JSON.stringify(value):value);
}
const server=http.createServer(async(req,res)=>{
 try{
  if(req.headers.host!==host){send(res,403,{error:'Invalid host; use the printed URL'});return;}
  if(req.method==='GET'&&req.url==='/'){send(res,200,html.replace('__REVIEW_TOKEN__',token),'text/html');return;}
  if(req.method==='GET'&&req.url==='/api/data'){send(res,200,{cards,...state()});return;}
  if(req.method==='GET'&&req.url==='/api/state'){send(res,200,state());return;}
  if(req.method==='POST'&&req.url==='/api/review'){
   if(req.headers.origin!=='http://'+host||req.headers['x-review-token']!==token||!req.headers['content-type']?.startsWith('application/json')){send(res,403,{error:'Invalid origin/token'});return;}
   let body='';for await(const chunk of req){body+=chunk;if(body.length>200000){send(res,413,{error:'Too many changes'});return;}}
   const {action,ids,expectedRevision}=JSON.parse(body),before=state();
   if(expectedRevision!==before.revision){send(res,409,{error:'Review file changed; refresh and retry'});return;}
   if(!['exclude','restore','feature','unfeature','approve'].includes(action)||!Array.isArray(ids)||ids.length<1||ids.length>500||ids.some(id=>!displayIds.has(id)))throw Error('Invalid review action');
   if(action==='approve'){
    if(ids.some(id=>before.excluded[id]||!byId.has(id)))throw Error('Restore or import the case before approval');
    const approvals=readApprovals(root);
    for(const id of ids) approvals[id]=reviewFingerprint(byId.get(id));
    writeApprovals(approvals,root);send(res,200,state());return;
   }
   if(action==='feature'||action==='unfeature'){
    if(action==='feature'&&ids.some(id=>before.excluded[id]))throw Error('Restore excluded cases before featuring');
    const selected=new Set(before.featured??[]);
    for(const id of ids){if(action==='feature')selected.add(id);else selected.delete(id);}
    writeFeatured([...selected],root);send(res,200,state());return;
   }
   let entries=before.entries;
   if(action==='exclude'){
    const seen=new Set(entries.map(e=>e.id));
    for(const id of new Set(ids))if(!seen.has(id)&&!before.excluded[id]){entries.push(makeExclusion(id,all));seen.add(id);}
   }else{
    const restore=new Set(ids.flatMap(id=>before.excluded[id]||[]));
    entries=entries.filter(e=>!restore.has(e.id));
   }
   // No await between reading revision and atomically replacing the file.
   writeExclusions(entries,root);send(res,200,state());return;
  }
  send(res,404,{error:'Not found'});
 }catch(e){send(res,400,{error:e.message});}
});
server.listen(port,'127.0.0.1',()=>console.log('Review: http://'+host+' | '+published.length+' gallery cases + '+candidates.length+' pending candidates\nChanges save to data/review/ (approvals, exclusions, featured); run npm run build && npm run check after review.'));
