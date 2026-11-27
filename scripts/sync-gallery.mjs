import { exportGallery } from './export-gallery.mjs';
import { createHash } from 'node:crypto';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec=promisify(execFile);
const columns=['id','media_type','slug','title','description','prompt','category','tags','input_mode','model','media','author','source_url','featured','featured_rank','updated_at'];
const hosts=new Set(['raw.githubusercontent.com','pbs.twimg.com','pub-62cf7640cd0f4066b60933bd2e9b85ef.r2.dev','cdn.prompthero.com','img.prompthero.com']);
const maxBytes=25*1024*1024;
const hash=b=>createHash('sha256').update(b).digest('hex');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function retry(fn) {
  for(let i=0;;i++) try{return await fn();}catch(e){if(!e.retryable||i===2)throw e;await sleep(500*2**i);}
}
function required(env,k){if(!env[k])throw Error('Missing configuration: '+k);return env[k];}
export function deletionPlan(existing, records, restricted=[],allowLarge=false) {
  const ids=new Set(records.map(r=>r.id));
  const denied=new Set(restricted);
  const urgent=existing.filter(r=>denied.has(r.id));
  const stale=existing.filter(r=>!ids.has(r.id)&&!denied.has(r.id));
  const blocked=!allowLarge && stale.length>0 && (records.length===0||stale.length/existing.length>0.2);
  return {urgent,stale,blocked};
}
export async function runSync(snapshot,io,{dryRun=false,allowLarge=false,forceMedia=false}={}) {
  const {mediaType,records,restricted}=snapshot;
  if(mediaType!=='image')throw Error('Only image sync is implemented');
  if(new Set(records.map(r=>r.id)).size!==records.length || records.some(r=>r.media_type!==mediaType))throw Error('Invalid export');
  const existing=await io.list(mediaType);
  await io.assertNoCollisions(records,mediaType);
  const unlicensed=new Set(snapshot.unlicensed??[]);
  const revokeHosted=existing.filter(r=>unlicensed.has(r.id)&&JSON.parse(r.media).some(m=>m.key||m.thumbnailKey)).map(r=>r.id);
  const {urgent,stale,blocked}=deletionPlan(existing,records,[...restricted,...revokeHosted],allowLarge);
  console.log(JSON.stringify({sourceCommit:process.env.SOURCE_COMMIT??null,type:mediaType,catalog:records.length,publishable:records.length,review:snapshot.reviewCounts,sourceUnavailable:snapshot.sourceUnavailable?.length??0,excluded:snapshot.excluded?.length,
    existing:existing.length,urgent:urgent.length,stale:stale.length,blocked,dryRun}));
  if(dryRun)return {urgent:urgent.length,stale:stale.length,blocked};
  // Security/rights removals are independent of ordinary deletion protection.
  if(urgent.length) console.log('Withdrawal candidates (retain for recovery): '+JSON.stringify(urgent.map(r=>({id:r.id,keys:JSON.parse(r.media).flatMap(m=>[m.key,m.thumbnailKey]).filter(Boolean)}))));
  await io.remove(urgent.map(r=>r.id),mediaType);
  if(urgent.length)await io.purgeWithdrawn(urgent);
  if(blocked)throw Error('Large ordinary deletion blocked; inspect export and explicitly approve');
  const removed=new Set(urgent.map(r=>r.id));
  const mediaMap=new Map();
  for(const r of existing) if(!removed.has(r.id)) for(const m of JSON.parse(r.media)) if(m.key)mediaMap.set(m.originalUrl,m);
  const ready=[],failures=[];
  for(const r of records){
    try{
      // The private D1 catalog includes pending cases, but they must not cause
      // third-party files to be copied to R2 or contain reusable R2 keys.
      if(r.author?.publicationStatus==='pending-review'){
        ready.push({...r,media:r.media.map(({type,role,originalUrl})=>({type,role,originalUrl}))});
        continue;
      }
      const media=[];
      for(const m of r.media){
        const old=mediaMap.get(m.originalUrl);
        const resolved=await io.prepare(m,old,forceMedia);
        mediaMap.set(m.originalUrl,resolved);
        media.push({...resolved,role:m.role});
      }
      ready.push({...r,media});
    }catch(e){failures.push(r.id);console.error('Media failed: '+r.id+' '+e.message);}
  }
  await io.upsert(ready,mediaType);
  if(failures.length)throw Error('Media sync incomplete; ordinary deletion skipped ('+failures.length+')');
  await io.remove(stale.map(r=>r.id),mediaType);
  const final=await io.list(mediaType);
  const ids=new Set(records.map(r=>r.id));
  if(final.length!==ids.size||final.some(r=>!ids.has(r.id)))throw Error('Final D1 IDs mismatch');
  console.log(JSON.stringify({upserted:ready.length,deleted:stale.length,withdrawn:urgent.length,final:final.length}));
  return {upserted:ready.length,deleted:stale.length};
}
export function createCloud(env=process.env) {
  const account=required(env,'CLOUDFLARE_ACCOUNT_ID'),db=required(env,'D1_DATABASE_ID'),token=required(env,'CLOUDFLARE_API_TOKEN');
  const bucket=env.R2_BUCKET;
  const endpoint='https://'+account+'.r2.cloudflarestorage.com';
  const query=async(sql,params=[])=>retry(async()=>{
    let response;
    try{response=await fetch('https://api.cloudflare.com/client/v4/accounts/'+encodeURIComponent(account)+'/d1/database/'+encodeURIComponent(db)+'/query',{
      method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
      body:JSON.stringify({sql,params}),signal:AbortSignal.timeout(60000)
    });}catch(e){throw Object.assign(Error('D1 network error'),{retryable:true});}
    if(response.status===429||response.status>=500)throw Object.assign(Error('D1 HTTP '+response.status),{retryable:true});
    const body=await response.json();
    if(!response.ok||!body.success||!body.result?.every(x=>x.success))throw Error('D1 query failed: '+JSON.stringify(body.errors??[]).slice(0,500));
    return body.result.flatMap(x=>x.results??[]);
  });
  const aws=async(args)=>{
    required(env,'R2_BUCKET');required(env,'AWS_ACCESS_KEY_ID');required(env,'AWS_SECRET_ACCESS_KEY');
    return exec('aws',['--endpoint-url',endpoint,'--region','auto','--no-cli-pager','s3api',...args],{
      env:{...env,AWS_RETRY_MODE:'standard',AWS_MAX_ATTEMPTS:'3',AWS_REQUEST_CHECKSUM_CALCULATION:'WHEN_REQUIRED',AWS_RESPONSE_CHECKSUM_VALIDATION:'WHEN_REQUIRED'},timeout:120000});
  };
  const known=new Set();
  const head=async(key)=>{
    if(!/^images\/(?:originals\/[a-f0-9]{64}\.(?:jpg|png|webp|gif)|thumbnails\/v1\/[a-f0-9]{64}\.webp)$/.test(key??''))return false;
    if(known.has(key))return true;
    try{await aws(['head-object','--bucket',bucket,'--key',key]);known.add(key);return true;}
    catch(e){if(/\(404\)|Not Found|NoSuchKey/.test(e.stderr??''))return false;throw Error('R2 HEAD failed');}
  };
  const upload=async(key,file,mime)=>{
    if(await head(key))return;
    await aws(['put-object','--bucket',bucket,'--key',key,'--body',file,'--content-type',mime]);
    if(!await head(key))throw Error('Uploaded object not found');
  };
  const list=async(type)=>{
    const rows=[];let cursor='';
    for(;;){const page=await query('SELECT id,media_type,media FROM prompts WHERE media_type=? AND id>? ORDER BY id LIMIT 200',[type,cursor]);
      rows.push(...page);if(page.length<200)return rows;cursor=page.at(-1).id;}
  };
  const remove=async(ids,type)=>{
    for(let i=0;i<ids.length;i+=80){const part=ids.slice(i,i+80);
      await query('DELETE FROM prompts WHERE media_type=? AND id IN ('+part.map(()=>'?').join(',')+')',[type,...part]);}
  };
  return {
    list,remove,
    async assertNoCollisions(records,type){
      for(let i=0;i<records.length;i+=80){const ids=records.slice(i,i+80).map(r=>r.id);
        const found=await query('SELECT id FROM prompts WHERE media_type<>? AND id IN ('+ids.map(()=>'?').join(',')+')',[type,...ids]);
        if(found.length)throw Error('Cross-type ID collision: '+found[0].id);}
    },
    async upsert(rows,type){
      for(let i=0;i<rows.length;i+=5){
        const part=rows.slice(i,i+5),time=Date.now();
        const values=part.flatMap(r=>columns.map(c=>c==='updated_at'?time:['tags','media','author'].includes(c)?JSON.stringify(r[c]):r[c]??null));
        const sql='INSERT INTO prompts ('+columns.join(',')+') VALUES '+part.map(()=> '('+columns.map(()=>'?').join(',')+')').join(',')+
          ' ON CONFLICT(id) DO UPDATE SET '+columns.filter(c=>c!=='id'&&c!=='media_type').map(c=>c+'=excluded.'+c).join(',')+
          ' WHERE prompts.media_type=excluded.media_type';
        await query(sql,values);
      }
    },
    async purgeWithdrawn(rows){
      // Durable manual remediation is necessary if a delete fails after D1 removal.
      // Log keys before attempting deletion, so operators can safely retry.
      const remaining=[...await list('image'),...await list('video')];
      const refs=new Set(remaining.flatMap(r=>JSON.parse(r.media).flatMap(m=>[m.key,m.thumbnailKey])));
      const keys=new Set(rows.flatMap(r=>JSON.parse(r.media).flatMap(m=>[m.key,m.thumbnailKey])).filter(k=>k&&!refs.has(k)));
      console.log('Withdrawal unreferenced keys: '+JSON.stringify([...keys]));
      for(const key of keys){
        if(await head(key)){await aws(['delete-object','--bucket',bucket,'--key',key]);known.delete(key);if(await head(key))throw Error('Withdrawal object still exists: '+key);}
      }
    },
    async prepare(m,old,force){
      if(!force&&old?.width&&old?.height&&await head(old.key)&&await head(old.thumbnailKey))return {...old,originalUrl:m.originalUrl,role:m.role};
      const url=new URL(m.originalUrl);
      if(url.protocol!=='https:'||url.username||url.password||url.port||!hosts.has(url.hostname))throw Error('Unapproved media host');
      const bytes=await retry(async()=>{
        let response;
        try{response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(60000)});}
        catch{throw Object.assign(Error('Media network error'),{retryable:true});}
        if(response.status===429||response.status>=500)throw Object.assign(Error('Media HTTP '+response.status),{retryable:true});
        if(!response.ok||!response.body)throw Error('Media HTTP '+response.status);
        if(Number(response.headers.get('content-length'))>maxBytes){await response.body.cancel();throw Error('Media too large');}
        const chunks=[];let size=0;
        for await(const chunk of response.body){size+=chunk.length;if(size>maxBytes)throw Error('Media too large');chunks.push(chunk);}
        return Buffer.concat(chunks);
      });
      const digest=hash(bytes),dir=await mkdtemp(path.join(tmpdir(),'prompt-media-'));
      try{
        const original=path.join(dir,'original'),thumb=path.join(dir,'thumb.webp');
        await writeFile(original,bytes);
        const python=[
          'from PIL import Image,ImageOps',
          'import sys,json,warnings',
          'Image.MAX_IMAGE_PIXELS=40000000',
          'warnings.simplefilter("error",Image.DecompressionBombWarning)',
          'with Image.open(sys.argv[1]) as im:',
          ' fmt=im.format',
          ' assert fmt in ("JPEG","PNG","WEBP","GIF"), "Unsupported image format"',
          ' im.verify()',
          'with Image.open(sys.argv[1]) as im:',
          ' im.load()',
          ' im=ImageOps.exif_transpose(im)',
          ' w,h=im.size',
          ' im.thumbnail((640,640),Image.Resampling.LANCZOS)',
          ' im.convert("RGBA" if "A" in im.getbands() or "transparency" in im.info else "RGB").save(sys.argv[2],"WEBP",quality=82)',
          ' print(json.dumps({"format":fmt,"width":w,"height":h}))'
        ].join('\n');
        const {stdout}=await exec('python3',['-c',python,original,thumb],{timeout:60000});
        const info=JSON.parse(stdout);
        const ext={JPEG:'jpg',PNG:'png',WEBP:'webp',GIF:'gif'}[info.format];
        if(!ext)throw Error('Unsupported image format');
        const key='images/originals/'+digest+'.'+ext,thumbnailKey='images/thumbnails/v1/'+digest+'.webp';
        await upload(key,original,'image/'+(ext==='jpg'?'jpeg':ext));
        await upload(thumbnailKey,thumb,'image/webp');
        return {...m,key,thumbnailKey,width:info.width,height:info.height};
      }finally{await rm(dir,{recursive:true,force:true});}
    }
  };
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const args=new Set(process.argv.slice(2));
  if([...args].some(a=>!['--dry-run','--allow-large-delete','--force-media-refresh','--export-only'].includes(a)))throw Error('Unknown argument');
  const snapshot=exportGallery();
  console.log(JSON.stringify({total:snapshot.total,canonical:snapshot.canonical,catalog:snapshot.records.length,publishable:snapshot.records.length,review:snapshot.reviewCounts,sourceUnavailable:snapshot.sourceUnavailable.length,excluded:snapshot.excluded.length}));
  if(!args.has('--export-only'))await runSync(snapshot,createCloud(),{dryRun:args.has('--dry-run'),allowLarge:args.has('--allow-large-delete'),forceMedia:args.has('--force-media-refresh')});
}
