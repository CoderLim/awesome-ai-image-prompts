import fs from 'node:fs';
import {parse,merge} from './core.mjs';
const sources=JSON.parse(fs.readFileSync('data/sources.json','utf8')).filter(s=>s.repository);
const headers={'User-Agent':'awesome-ai-image-prompts',Accept:'application/vnd.github+json'};
if(process.env.GITHUB_TOKEN)headers.Authorization='Bearer '+process.env.GITHUB_TOKEN;
async function get(url, options){const res=await fetch(url,options);if(!res.ok)throw Error(res.status+' '+url);return res;}
const incoming=[];
for(const s of sources){const commit=await (await get('https://api.github.com/repos/'+s.repository+'/commits/'+encodeURIComponent(s.ref),{headers})).json();for(const path of s.paths){const raw=await (await get('https://raw.githubusercontent.com/'+s.repository+'/'+commit.sha+'/'+path)).text();const parsed=parse(s,path,commit.sha,raw);if(!parsed.length)throw Error('No records: '+path);incoming.push(...parsed);}}
const all=merge(incoming);
for(const s of sources){const rows=all.filter(r=>r.provenance.collectedFrom[0].sourceId===s.id);const p='data/index/'+s.id+'.json';const old=JSON.parse(fs.readFileSync(p,'utf8'));if(rows.length<old.length*.8)throw Error('Unexpected source shrink: '+s.id);}
for(const s of sources){const p='data/index/'+s.id+'.json';fs.writeFileSync(p,JSON.stringify(all.filter(r=>r.provenance.collectedFrom[0].sourceId===s.id),null,2)+'\n');}
console.log('Indexed '+all.length+' source cases; no third-party prompts or media mirrored.');
