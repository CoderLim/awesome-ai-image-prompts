import {keysFor,exclusionMatches,fingerprint} from '../../../../scripts/review-exclusions.mjs';
import {audit} from '../../../../scripts/audit-prompt-similarity.mjs';
import {planTemplateExclusions} from '../../../../scripts/review-templates.mjs';

// Keep historical catalog and queued IDs; use transitive exact components for new cases.
// Image matches and semantic similarity are review hints, not deletion keys.
export function preflight(incoming,existing,{exclusions=[],decisions=[],featured=[],similarity=true}={}){
 const historical=new Map(),unique=[],seen=new Map(),rejected=[];
 for(const r of existing){if(!historical.has(r.id)){historical.set(r.id,r);unique.push(r);}}
 for(const r of incoming){
  const old=historical.get(r.id)??seen.get(r.id);
  if(old){
   rejected.push({id:r.id,reason:fingerprint(old.prompt.original)===fingerprint(r.prompt.original)?'existing-id':'id-conflict',keptId:old.id});
   continue;
  }
  seen.set(r.id,r);unique.push(r);
 }
 const excluded=exclusionMatches(unique,exclusions),parent=unique.map((_,i)=>i),byKey=new Map();
 const root=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
 for(let i=0;i<unique.length;i++)for(const k of keysFor(unique[i])){
  if(byKey.has(k))parent[root(i)]=root(byKey.get(k));else byKey.set(k,i);
 }
 const groups=new Map();
 unique.forEach((r,i)=>{const k=root(i),arr=groups.get(k)??[];arr.push(r);groups.set(k,arr);});
 const accepted=[];
 for(const group of groups.values()){
  const old=group.find(r=>historical.has(r.id)),blocked=group.some(r=>excluded.has(r.id));
  const fresh=group.filter(r=>seen.has(r.id));
  if(!fresh.length)continue;
  // Prefer output-confirmed, more complete records; stable ID breaks ties.
  fresh.sort((a,b)=>Number(b.sourcePreview.images.some(m=>m.role==='output'))-Number(a.sourcePreview.images.some(m=>m.role==='output'))||b.sourcePreview.images.length-a.sourcePreview.images.length||b.prompt.original.length-a.prompt.original.length||a.id.localeCompare(b.id));
  if(!old&&!blocked)accepted.push(fresh[0]);
  for(const r of fresh)if(blocked||old||r!==fresh[0])rejected.push({id:r.id,reason:blocked?'manual-exclusion':'exact-component-duplicate',keptId:blocked?null:(old??fresh[0]).id});
 }
 const imageOwners=new Map(),imageMatches=[];
 for(const r of unique)for(const m of r.sourcePreview.images){
  const u=new URL(m.url),k=u.hostname==='pbs.twimg.com'?u.origin+u.pathname:m.url;
  const ids=imageOwners.get(k)??new Set();ids.add(r.id);imageOwners.set(k,ids);
 }
 const acceptedIds=new Set(accepted.map(r=>r.id));
 for(const [url,ids] of imageOwners)if(ids.size>1&&[...ids].some(id=>acceptedIds.has(id)))imageMatches.push({url,ids:[...ids].sort()});
 const historicalRows=[...historical.values()];
 const near=similarity&&accepted.length?audit([],historicalRows,0.83,{templateRecall:true,fullRecords:accepted}).pairs:[];
 // Restoring a case is intentional: report unapplied decisions, never silently reapply them.
 const template=planTemplateExclusions(unique.map(r=>r.candidate||seen.has(r.id)?{...r,templateStatus:'visual_review'}:r),decisions,exclusions,{featured});
 return {accepted,rejected,imageMatches,near,template:{applied:template.applied,skipped:template.skipped}};
}
