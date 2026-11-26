#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {handle} from '../../../../scripts/x-source.mjs';
import {dateMs,ymd,resolveRange} from './resolve-range.mjs';
const DAY=86400000;
export function tweetId(r){
 const id=r?.id??r?.tweet_id??r?.tweetId??r?.rest_id;
 if(typeof id!=='string'||!/^[1-9]\d*$/.test(id))throw Error('Missing or non-string tweet ID (unsafe numeric IDs rejected)');
 return id;
}
function dayOf(r){
 const raw=r.created_at??r.createdAt??r.publishedAt??r.timestamp??r.time??r.date;
 if(raw!=null){const t=typeof raw==='number'?(raw<1e12?raw*1000:raw):Date.parse(raw);if(Number.isFinite(t))return ymd(t);}
 const id=tweetId(r);if(id.length<17)return null;
 const t=Number((BigInt(id)>>22n)+1288834974657n);return Number.isFinite(t)?ymd(t):null;
}
export function collectSlices(username,range,run,{limit=100,days=30}={}){
 const user=handle(username),start=dateMs(range.since),end=dateMs(range.until);
 if(!Number.isInteger(limit)||limit<1||!Number.isInteger(days)||days<1||start>=end)throw Error('Invalid slice configuration');
 const posts=new Map(),coverage=[];
 function visit(a,b,kind){
  const since=ymd(a),until=ymd(b),query='from:'+user+' since:'+since+' until:'+until+(kind==='images'?' filter:images':kind==='keywords'?' (提示词 OR prompt OR プロンプト)':'');
  let raw;try{
   raw=run(query,limit);
   if(!Array.isArray(raw))throw Error('Expected array from OpenCLI');
   for(const r of raw)tweetId(r);
  }catch(e){coverage.push({since,until,kind,status:'failed',error:String(e.message||e)});return;}
  // Keep all variants; short timeline rows must not overwrite richer results.
  let outOfRange=0,unknownDate=0;
  for(const r of raw){
   if(r.is_retweet===true||r.isRetweet===true||r.retweeted_status||r.retweetedStatus)continue;
   const d=dayOf(r);if(d&&(d<since||d>=until)){outOfRange++;continue;}if(!d)unknownDate++;
   const id=tweetId(r),item=posts.get(id)??{id,variants:[]};
   if(!item.variants.some(v=>JSON.stringify(v)===JSON.stringify(r)))item.variants.push(r);
   posts.set(id,item);
  }
  const saturated=raw.length>=limit;
  coverage.push({since,until,kind,count:raw.length,outOfRange,unknownDate,status:saturated?(b-a>DAY?'split':'saturated-day'):raw.length===0?'empty-unverified':'below-limit'});
  if(saturated&&b-a>DAY){const mid=a+Math.floor((b-a)/DAY/2)*DAY;visit(a,mid,kind);visit(mid,b,kind);}
 }
 for(let a=start;a<end;a+=days*DAY)for(const kind of ['all','images','keywords'])visit(a,Math.min(a+days*DAY,end),kind);
 const unresolved=coverage.filter(r=>['failed','saturated-day','empty-unverified'].includes(r.status)||r.outOfRange||r.unknownDate);
 return {version:1,username:user,range,posts:[...posts.values()],coverage,unresolved,coverageStatus:unresolved.length?'gaps-or-unverified':'no-cap-detected',absoluteCompleteness:'not-established'};
}
export function opencliSearch(query,limit){
 const r=spawnSync('opencli',['twitter','search',query,'--product','live','--limit',String(limit),'-f','json'],{encoding:'utf8',maxBuffer:32*1024*1024,timeout:180000});
 if(r.error||r.status!==0)throw Error(r.error?.message||r.stderr||'OpenCLI failed');
 return JSON.parse(r.stdout);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [username,rangeArg,out,limit='100']=process.argv.slice(2);
 if(!username||!rangeArg||!out)throw Error('Usage: collect-posts.mjs USER RANGE NEW_SNAPSHOT.json [LIMIT]');
 if(fs.existsSync(out))throw Error('Snapshot exists; use a new path');
 const result=collectSlices(username,resolveRange(rangeArg),opencliSearch,{limit:Number(limit)});
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({posts:result.posts.length,coverageStatus:result.coverageStatus,unresolved:result.unresolved.length,output:out}));
 if(result.unresolved.some(r=>r.status==='failed'||r.status==='saturated-day'))process.exitCode=2;
}
