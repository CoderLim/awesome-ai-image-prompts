import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

export const exclusionPath='data/review/exclusions.json';
export const fingerprint=p=>createHash('sha256').update(String(p??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim()).digest('hex');
const nonempty=s=>typeof s==='string'&&s.trim()!=='';
export function keysFor(r){
 const keys=['id:'+r.id],post=r.provenance?.originalSource?.postId,p=r.prompt?.original;
 if(nonempty(post))keys.push('post:'+post);
 if(nonempty(p))keys.push('prompt:'+fingerprint(p));
 return keys;
}
export function validateExclusions(entries){
 if(!Array.isArray(entries))throw Error('Exclusions must be an array');
 const ids=new Set();
 for(const e of entries){
  if(!e||typeof e.id!=='string'||!/^[a-z0-9-]+$/.test(e.id)||ids.has(e.id)||!Array.isArray(e.keys)||!e.keys.includes('id:'+e.id)||e.keys.some(k=>typeof k!=='string'||! /^(?:id:[a-z0-9-]+|post:[A-Za-z0-9_-]+|prompt:[a-f0-9]{64})$/.test(k)))throw Error('Invalid exclusion entry');
  ids.add(e.id);
 }
 return entries;
}
export function readExclusions(root='.'){
 const f=path.join(root,exclusionPath);
 return fs.existsSync(f)?validateExclusions(JSON.parse(fs.readFileSync(f,'utf8'))):[];
}
export function writeExclusions(entries,root='.'){
 validateExclusions(entries);
 const f=path.join(root,exclusionPath);fs.mkdirSync(path.dirname(f),{recursive:true});
 const tmp=f+'.'+randomUUID()+'.tmp';
 try{fs.writeFileSync(tmp,JSON.stringify([...entries].sort((a,b)=>a.id.localeCompare(b.id)),null,2)+'\n',{flag:'wx'});fs.renameSync(tmp,f);}finally{fs.rmSync(tmp,{force:true});}
}
// Each exclusion traverses exact post / full-prompt edges, not similar prompts or image URL edges.
export function exclusionMatches(records,entries){
 const byKey=new Map(), byId=new Map();
 for(const r of records){
  const keys=keysFor(r);byId.set(r.id,keys);
  for(const k of keys){if(!byKey.has(k))byKey.set(k,[]);byKey.get(k).push(r.id);}
 }
 const matched=new Map();
 for(const e of entries){
  const pending=[...e.keys], visited=new Set(), seen=new Set();
  for(let i=0;i<pending.length;i++){
   const k=pending[i];if(visited.has(k))continue;visited.add(k);
   for(const id of byKey.get(k)??[]){
    if(seen.has(id))continue;seen.add(id);
    if(!matched.has(id))matched.set(id,[]);
    matched.get(id).push(e.id);pending.push(...byId.get(id));
   }
  }
 }
 return matched;
}
export function makeExclusion(id,records){
 const record=records.find(r=>r.id===id);if(!record)throw Error('Unknown case '+id);
 const e={id,keys:keysFor(record)},matched=exclusionMatches(records,[e]);
 e.keys=[...new Set(records.filter(r=>matched.has(r.id)).flatMap(keysFor))].sort();
 return e;
}
