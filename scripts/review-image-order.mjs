// Recover first appearance on the checked-out branch, not the latest shard edit.
// Read each changed shard once per relevant first-parent commit. No Git writes.
import {execFileSync} from 'node:child_process';
export function firstImportTimes(root, wanted){
 const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8',maxBuffer:32*1024*1024,stdio:['ignore','pipe','pipe']});
 const times=new Map();
 try{
  // Do not accidentally inspect a parent repository when running from an exported fixture.
  if(git('rev-parse','--show-prefix').trim())return times;
  const log=git('log','--first-parent','--reverse','--format=%H%x09%ct','--','data/index').trim();
  let previous=null;
  for(const line of log.split('\n').filter(Boolean)){
   const [sha,seconds]=line.split('\t'),time=Number(seconds)*1000;
   const files=(previous?git('diff','--name-only','--diff-filter=ACMR',previous,sha,'--','data/index'):git('ls-tree','-r','--name-only',sha,'--','data/index')).split('\n').filter(p=>/^data\/index\/[^/]+\.json$/.test(p));
   for(const file of files){
    const rows=JSON.parse(git('show',sha+':'+file));
    if(!Array.isArray(rows))continue;
    for(const r of rows)if(wanted.has(r.id)&&!times.has(r.id)&&Number.isFinite(time)&&time>0)times.set(r.id,time);
   }
   previous=sha;
   if(times.size===wanted.size)break;
  }
 }catch(e){
  // A ZIP export, shallow checkout, or missing historical object may lack history.
  // Retain known times; callers fall back to recorded collection dates.
  if(e.status!==128)console.warn('Review history incomplete: '+e.message);
 }
 return times;
}
export function reviewTime(r,times){
 const first=times.get(r.id);
 if(first)return first;
 const dates=(r.provenance?.collectedFrom??[]).map(s=>Date.parse(s.collectedAt??'')).filter(t=>Number.isFinite(t)&&t>0);
 return dates.length?Math.min(...dates):0;
}
export function sortReviewCards(cards){
 return [...cards].sort((a,b)=>b.reviewTime-a.reviewTime||a.id.localeCompare(b.id,'en'));
}
