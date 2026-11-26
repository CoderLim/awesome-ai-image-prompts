import fs from 'node:fs';
import {parse,merge} from './core.mjs';
const sources=JSON.parse(fs.readFileSync('data/sources.json','utf8')).filter(s=>s.repository&&(!s.mode||s.mode==='automatic'));
const headers={'User-Agent':'awesome-ai-image-prompts',Accept:'application/vnd.github+json'};
if(process.env.GITHUB_TOKEN)headers.Authorization='Bearer '+process.env.GITHUB_TOKEN;
async function get(url, options){const res=await fetch(url,options);if(!res.ok)throw Error(res.status+' '+url);return res;}
const incoming=[];
for(const s of sources){const commit=await (await get('https://api.github.com/repos/'+s.repository+'/commits/'+encodeURIComponent(s.ref),{headers})).json();for(const path of s.paths){const raw=await (await get('https://raw.githubusercontent.com/'+s.repository+'/'+commit.sha+'/'+path)).text();const parsed=parse(s,path,commit.sha,raw);if(!parsed.length)throw Error('No records: '+path);incoming.push(...parsed);}}
const all=merge(incoming);
const dir='data/index',existing=fs.readdirSync(dir).filter(f=>f.endsWith('.json'));
const updates=new Map(),obsolete=[];
for(const s of sources){
 const rows=all.filter(r=>r.provenance.collectedFrom[0].sourceId===s.id);
 const previous=existing.filter(f=>f===s.id+'.json'||f.startsWith(s.id+'-'));
 const oldCount=previous.reduce((n,f)=>n+JSON.parse(fs.readFileSync(dir+'/'+f,'utf8')).length,0);
 if(rows.length<oldCount*.8)throw Error('Unexpected source shrink: '+s.id);
 if(rows.some(r=>!r.prompt?.original?.trim()))throw Error('Missing full prompt: '+s.id);
 for(let i=0;i<rows.length;i+=80){
  const name=s.id+'-'+String(i/80+1).padStart(3,'0')+'.json';
  updates.set(name,JSON.stringify(rows.slice(i,i+80),null,2)+'\n');
 }
 for(const f of previous)if(!updates.has(f))obsolete.push(f);
}
for(const [name,content] of updates)fs.writeFileSync(dir+'/'+name,content);
for(const name of obsolete)fs.unlinkSync(dir+'/'+name);
console.log('Indexed '+all.length+' source cases with original prompt text and upstream image links.');
