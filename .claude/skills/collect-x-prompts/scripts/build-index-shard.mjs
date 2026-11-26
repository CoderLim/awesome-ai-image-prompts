#!/usr/bin/env node
// Produces an append-only local queue, never overwrites published index shards.
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {handle,xSourceId,xPost,xImage} from '../../../../scripts/x-source.mjs';
import {readCatalog} from '../../../../scripts/audit-prompt-similarity.mjs';
import {readExclusions} from '../../../../scripts/review-exclusions.mjs';
import {readFeatured} from '../../../../scripts/review-featured.mjs';
import {readTemplateDecisions} from '../../../../scripts/review-templates.mjs';
import {readLocalReviewQueues,validateReviewCandidate} from '../../../../scripts/review-local-queues.mjs';
import {verifyPair} from './pair-posts.mjs';
import {preflight} from './preflight.mjs';

const simpleUtility=p=>/^(?:(?:please\s+)?(?:remove|erase|delete)\s+(?:the\s+)?(?:background|watermark|person|object|logo)|(?:upscale|resize|denoise|crop)(?:\s+(?:the\s+)?(?:image|photo))?|(?:去除|移除|删除)(?:背景|水印|人物)|抠图|图片放大)[.!。！\s]*$/i.test(p.trim());
function titleOf(title){
 const t=typeof title==='string'?{en:null,zh:title}:title;
 if(!t||![t.en,t.zh].some(v=>typeof v==='string'&&v.trim()))throw Error('Nonempty title required');
 if([t.en,t.zh].some(v=>v!=null&&typeof v!=='string'))throw Error('Invalid title');
 return {en:t.en??null,zh:t.zh??null};
}
function imagesOf(images){
 if(!Array.isArray(images)||!images.length)throw Error('Missing images');
 const byUrl=new Map();
 for(const raw of images){
  const m=typeof raw==='string'?{url:raw,role:'source-media'}:{url:raw.url,role:raw.role??'source-media'};
  const u=xImage(m.url);
  if(!['input','output','source-media'].includes(m.role))throw Error('Invalid image role');
  const key=u.pathname,old=byUrl.get(key);
  if(old&&old.role!==m.role)throw Error('Conflicting image role: '+m.url);
  byUrl.set(key,m);
 }
 const rows=[...byUrl.values()];
 if(rows.length>4)throw Error('More than four images; review and explicitly select examples first');
 if(!rows.some(m=>m.role!=='input'))throw Error('No possible output image');
 return rows;
}
export function makeRecords(cases,snapshot,tax,{sourceId,snapshotSha256,collectedAt=new Date().toISOString()}={}){
 const user=handle(snapshot.username),source=sourceId??xSourceId(user);
 if(source!==xSourceId(user))throw Error('Source ID must match canonical X handle encoding');
 if(!/^[a-f0-9]{64}$/.test(snapshotSha256??''))throw Error('Raw snapshot hash required');
 const records=[],rejected=[];
 for(const c of cases){
  try{
   const p=typeof c.prompt==='string'?c.prompt:c.prompt?.original;
   if(typeof p!=='string'||!p.trim()||simpleUtility(p))throw Error('Empty or simple-utility prompt');
   if(c.textReview!=='complete')throw Error('Text completeness review required');
   if(c.utilityReview!=='reusable')throw Error('Reusable-prompt review required');
   const images=imagesOf(c.images);
   const pair=verifyPair({...c,images},snapshot);
   const type=c.type??(c.category==='restyle'?'editing':'generation'),category=c.category,inputMode=c.inputMode;
   if(!tax[type]?.includes(category)||!['text-to-image','reference-to-image','image-editing'].includes(inputMode))throw Error('Invalid taxonomy or input mode');
   const chars=Array.from(p.replace(/\s+/g,' ').trim());
   const r={id:source+'-'+pair.promptId,title:titleOf(c.title),type,category,inputMode,status:'index-only',prompt:{original:p},media:[],models:Array.isArray(c.models)?c.models:[],sourcePreview:{images,promptExcerpt:chars.slice(0,100).join(''),excerptTruncated:chars.length>100},provenance:{originalSource:{platform:'x',author:'@'+user,url:c.url,postId:pair.imageId,publishedAt:c.publishedAt??null,verification:'reported-by-collector',...(pair.imageId!==pair.promptId?{promptPostUrl:c.promptPostUrl,promptPostId:pair.promptId}:{})},collectedFrom:[{sourceId:source,mode:'collector-export',snapshotSha256,url:c.url,collectedAt}]},rights:{prompt:'unknown',media:'unknown'},sourceMeta:{model:c.model??null,textReview:'complete',visualReview:'pending',pairing:pair.evidence,...(c.pairReview?{pairReview:c.pairReview}:{}),imageVerification:'source URLs matched to collected post; actual visual match unchecked',review:{qualityStatus:'candidate',classificationConfidence:c.classificationConfidence??'medium',classificationMethod:'collector-review',inputMode,category}}};
   if(!validateReviewCandidate(r))throw Error('Invalid queue record');
   records.push(r);
  }catch(e){rejected.push({url:c?.url??null,reason:String(e.message||e)});}
 }
 return {source,records,rejected};
}
function atomicJson(file,value){
 fs.mkdirSync(path.dirname(file),{recursive:true});
 const temp=file+'.'+randomUUID()+'.tmp';
 try{fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});fs.renameSync(temp,file);}
 finally{fs.rmSync(temp,{force:true});}
}
export function saveQueue(root,source,records){
 const dir=path.join(root,'.cache','review-queues'),file=path.join(dir,source+'.json');
 fs.mkdirSync(dir,{recursive:true});
 // Reject concurrent queue writers. Never replace a historical record.
 const lock=fs.openSync(path.join(root,'.cache','x-queue-write.lock'),'wx');
 try{
  const old=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[];
  if(!Array.isArray(old)||old.some(r=>!validateReviewCandidate(r)))throw Error('Invalid existing queue');
  const catalog=readCatalog(root),other=readLocalReviewQueues(root,new Set(catalog.map(r=>r.id)));
  const existing=[...catalog,...other];
  const result=preflight(records,existing,{exclusions:readExclusions(root),decisions:readTemplateDecisions(root),featured:readFeatured(root)??[]});
  if(result.accepted.length)atomicJson(file,[...old,...result.accepted]);
  return {file,...result,total:old.length+result.accepted.length};
 }finally{fs.closeSync(lock);fs.rmSync(path.join(root,'.cache','x-queue-write.lock'),{force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [input,snapshotFile]=process.argv.slice(2);
 if(!input||!snapshotFile)throw Error('Usage: build-index-shard.mjs CASES.json RAW_SNAPSHOT.json');
 const raw=fs.readFileSync(snapshotFile),snapshot=JSON.parse(raw),cases=JSON.parse(fs.readFileSync(input,'utf8'));
 if(!Array.isArray(cases)||snapshot.version!==1||!Array.isArray(snapshot.posts))throw Error('Invalid collector input');
 const root=process.cwd(),tax=JSON.parse(fs.readFileSync(path.join(root,'data/taxonomy.json'),'utf8'));
 const result=makeRecords(cases,snapshot,tax,{snapshotSha256:createHash('sha256').update(raw).digest('hex')});
 const queue=saveQueue(root,result.source,result.records);
 const report=path.join(root,'.cache','x-collection-reports',result.source+'-'+randomUUID()+'.json');
 atomicJson(report,{snapshot:snapshotFile,coverageStatus:snapshot.coverageStatus,invalid:result.rejected,rejected:queue.rejected,imageMatches:queue.imageMatches,near:queue.near,template:queue.template,acceptedIds:queue.accepted.map(r=>r.id)});
 console.log(JSON.stringify({queue:queue.file,total:queue.total,added:queue.accepted.length,rejected:result.rejected.length+queue.rejected.length,nearMatches:queue.near.length,report,coverageStatus:snapshot.coverageStatus},null,2));
}
