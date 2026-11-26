// Shared X collector source contract. Handles are ASCII; '-' is an injective encoding of '_'.
export function handle(value){
 const h=String(value??'').replace(/^@/,'').toLowerCase();
 if(!/^[a-z0-9_]{1,15}$/.test(h))throw Error('Invalid X handle: '+value);
 return h;
}
export const xSourceId=value=>handle(value).replaceAll('_','-');
export function xPost(value){
 const u=new URL(value);
 const m=u.pathname.match(/^\/([a-zA-Z0-9_]{1,15})\/status\/([1-9]\d*)(?:\/)?$/);
 if(u.origin!=='https://x.com'||u.username||u.password||!m)throw Error('Invalid X post URL: '+value);
 return {handle:handle(m[1]),postId:m[2]};
}
export function xImage(value){
 const u=new URL(value);
 if(u.origin!=='https://pbs.twimg.com'||u.username||u.password||!/^\/media\/[\w.-]+$/.test(u.pathname))throw Error('Invalid X media URL: '+value);
 return u;
}
export const isXCollector=r=>r.provenance?.originalSource?.platform==='x'&&r.provenance?.collectedFrom?.[0]?.mode==='collector-export';
export function validateXRecord(r,source){
 const o=r.provenance.originalSource, p=xPost(o.url);
 if(o.platform!=='x'||p.postId!==o.postId||source.platform!=='x'||p.handle!==handle(source.username)||source.id!==r.provenance.collectedFrom[0].sourceId)throw Error('X source mismatch: '+r.id);
 const profile=new URL(source.url);
 if(profile.origin!=='https://x.com'||profile.pathname.toLowerCase().replace(/\/$/,'')!=='/'+handle(source.username))throw Error('Invalid X source profile: '+source.id);
 if(o.author&&handle(o.author)!==p.handle)throw Error('X author mismatch: '+r.id);
 if(o.promptPostUrl||o.promptPostId){
  const q=xPost(o.promptPostUrl);
  if(q.handle!==p.handle||q.postId!==o.promptPostId)throw Error('X prompt provenance mismatch: '+r.id);
 }
 if(!r.sourcePreview.images.length||!r.sourcePreview.images.some(m=>m.role!=='input'))throw Error('Missing example media: '+r.id);
 for(const m of r.sourcePreview.images)xImage(m.url);
}

export function hasXPermission(r){
 const e=r.rights?.evidence;
 const cleared=x=>x?.status==='cleared'&&typeof x.basis==='string'&&x.basis.trim()&&typeof x.evidence==='string'&&x.evidence.trim();
 return isXCollector(r)&&r.rights?.prompt==='permission-documented'&&r.rights?.media==='permission-documented'&&cleared(e?.prompt)&&Array.isArray(e?.media)&&r.sourcePreview.images.every(m=>e.media.some(x=>x.url===m.url&&cleared(x)));
}
