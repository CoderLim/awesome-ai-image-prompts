// Optional network audit, not part of deterministic builds. Run npm run audit:links.
import fs from 'node:fs';
const dir='data/index';
const rows=fs.readdirSync(dir).filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync(dir+'/'+f,'utf8')));
const links=new Map();for(const r of rows)for(const m of r.sourcePreview.images){const ids=links.get(m.url)??[];ids.push(r.id);links.set(m.url,ids);}
const queue=[...links],results=[];let cursor=0;
async function check(url){for(let attempt=0;attempt<2;attempt++){try{let res=await fetch(url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(12000)});if([403,405,429].includes(res.status)){res=await fetch(url,{headers:{Range:'bytes=0-1023'},redirect:'follow',signal:AbortSignal.timeout(12000)});await res.body?.cancel();}const mime=res.headers.get('content-type')??'';return {status:res.status,result:res.ok&&mime.startsWith('image/')?'reachable':res.status===404||res.status===410?'missing':'inconclusive',contentType:mime};}catch(e){if(attempt===1)return {result:'inconclusive',error:String(e)};}}}
await Promise.all(Array.from({length:8},async()=>{while(cursor<queue.length){const [url,caseIds]=queue[cursor++];results.push({url,caseIds,...await check(url)});}}));
results.sort((a,b)=>a.url.localeCompare(b.url));const summary=results.reduce((m,r)=>(m[r.result]=(m[r.result]??0)+1,m),{});fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/image-links.json',JSON.stringify({checkedAt:new Date().toISOString(),summary,results},null,2)+'\n');console.log(summary);
