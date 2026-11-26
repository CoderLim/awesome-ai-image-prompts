// Reviewed template decisions: never use similarity alone to remove cases.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { readCatalog,readQueue } from './audit-prompt-similarity.mjs';
import { govern } from './governance.mjs';
import { readFeatured } from './review-featured.mjs';
import { readLocalReviewQueues } from './review-local-queues.mjs';
import { keysFor,readExclusions,writeExclusions } from './review-exclusions.mjs';
export const templateDecisionPath='data/review/template-decisions.json';
export function readTemplateDecisions(root='.'){
 const file=path.join(root,templateDecisionPath);
 return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[];
}
export function queueRecords(queue){
 return queue.map(r=>({id:'prompthero-'+r.case_id,prompt:{original:r.prompt},provenance:{originalSource:{postId:r.case_id}},templateStatus:r.next_action}));
}
export function planTemplateExclusions(records,decisions,existing=[],options={}){
 const byId=new Map(),byKey=new Map(),keys=new Map(),seenDrops=new Set();
 for(const r of records){
  if(byId.has(r.id))throw Error('Duplicate record ID '+r.id);
  byId.set(r.id,r);const ks=keysFor(r);keys.set(r.id,ks);
  for(const k of ks){if(!byKey.has(k))byKey.set(k,[]);byKey.get(k).push(r.id);}
 }
 for(const d of decisions){
  if(!d||!d.keepId||!d.dropId||d.keepId===d.dropId||seenDrops.has(d.dropId)||![d.keepHash,d.dropHash].every(x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x)))throw Error('Invalid or conflicting template decision');
  seenDrops.add(d.dropId);
 }
 const component=ks=>{
  const pending=[...ks],visited=new Set(),ids=new Set();
  for(let i=0;i<pending.length;i++){
   const k=pending[i];if(visited.has(k))continue;visited.add(k);
   for(const id of byKey.get(k)??[]){if(ids.has(id))continue;ids.add(id);pending.push(...keys.get(id));}
  }
  return {ids,keys:[...visited].sort()};
 };
 const excluded=new Set();for(const e of existing)for(const id of component(e.keys).ids)excluded.add(id);
 const featured=new Set(options.featured??[]),keepers=new Set(decisions.map(d=>d.keepId));
 const available=options.available?new Set(options.available):null;
 const entries=[...existing],applied=[],skipped=[];
 for(const d of decisions){
  const {keepId,dropId}=d,k=byId.get(keepId),r=byId.get(dropId);
  const skip=reason=>skipped.push({keepId,dropId,reason});
  if(!k||!r){skip('missing_record');continue;}
  if(!keys.get(keepId).includes('prompt:'+d.keepHash)||!keys.get(dropId).includes('prompt:'+d.dropHash)){skip('stale_prompt');continue;}
  if(excluded.has(dropId)){skip('already_excluded');continue;}
  if(excluded.has(keepId)||(available&&!available.has(keepId))||k.templateStatus==='exclude'||(!r.templateStatus&&k.templateStatus)||(r.templateStatus==='visual_review'&&k.templateStatus&&k.templateStatus!=='visual_review')){skip('keeper_unavailable');continue;}
  const group=component(keys.get(dropId));
  if([...group.ids].some(id=>featured.has(id)||keepers.has(id))){skip('protected_featured_or_keeper');continue;}
  entries.push({id:dropId,keys:group.keys,reason:'template-duplicate',keepId,reviewSource:d.reviewSource??'reviewed'});
  for(const id of group.ids)excluded.add(id);
  applied.push({keepId,dropId,affectedIds:[...group.ids].sort(),scope:d.scope});
 }
 return {entries,applied,skipped};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const args=process.argv.slice(2);let queueFile,apply=false,report;
 for(let i=0;i<args.length;i++){
  if(args[i]==='--apply')apply=true;
  else if(args[i]==='--queue')queueFile=args[++i];
  else if(args[i]==='--report')report=args[++i];
  else throw Error('Usage: npm run review:templates -- [--queue V3.jsonl] [--apply] [--report FILE]');
 }
 const catalog=readCatalog(),existing=readExclusions(),known=new Set(catalog.map(r=>r.id));
 const queue=(queueFile?queueRecords(readQueue(queueFile)):[]).filter(r=>{if(known.has(r.id))return false;known.add(r.id);return true;});
 queue.push(...readLocalReviewQueues('.',known).map(r=>({...r,templateStatus:'visual_review'})));
 const available=[...govern(catalog,existing).rows.filter(r=>r.visible).map(r=>r.id),...queue.filter(r=>r.templateStatus!=='exclude').map(r=>r.id)];
 const result=planTemplateExclusions([...catalog,...queue],readTemplateDecisions(),existing,{featured:readFeatured()??[],available});
 if(apply)writeExclusions(result.entries);
 const out={applied:result.applied,skipped:result.skipped};
 if(report)fs.writeFileSync(report,JSON.stringify(out,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({mode:apply?'applied':'dry-run',applied:result.applied.length,skipped:result.skipped.length,details:out},null,2));
}
