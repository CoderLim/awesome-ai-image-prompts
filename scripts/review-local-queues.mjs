// Local, ignored, source-independent full-record candidate queues.
import fs from 'node:fs';
import path from 'node:path';

const httpsUrl=value=>{
  try { const url=new URL(value); return typeof value==='string'&&url.protocol==='https:'&&!url.username&&!url.password; }
  catch { return false; }
};

export function validateReviewCandidate(r){
  return r && /^[a-z0-9-]+$/.test(r.id||'') &&
    (typeof r.title?.en==='string'&&r.title.en.trim() || typeof r.title?.zh==='string'&&r.title.zh.trim()) &&
    ['generation','editing','unclassified'].includes(r.type) &&
    typeof r.category==='string' && r.category.length>0 &&
    ['text-to-image','reference-to-image','image-editing','unknown'].includes(r.inputMode) &&
    r.status==='index-only' && typeof r.prompt?.original==='string' && r.prompt.original.trim() &&
    Array.isArray(r.sourcePreview?.images) && r.sourcePreview.images.length>0 &&
    r.sourcePreview.images.length<=4 && r.sourcePreview.images.some(m=>m.role!=='input') &&
    r.sourcePreview.images.every(m=>httpsUrl(m.url)&&['source-media','input','output'].includes(m.role)) &&
    httpsUrl(r.provenance?.originalSource?.url) &&
    Array.isArray(r.provenance?.collectedFrom) && /^[a-z0-9-]+$/.test(r.provenance.collectedFrom[0]?.sourceId||'') &&
    httpsUrl(r.provenance.collectedFrom[0]?.url) && !!r.rights?.prompt && !!r.rights?.media;
}

export function readLocalReviewQueues(root, known=new Set()){
  const dir=path.join(root,'.cache','review-queues');
  if(!fs.existsSync(dir))return [];
  const candidates=[];
  for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.json')).sort()){
    const records=JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
    if(!Array.isArray(records))throw Error('Expected review queue array: '+name);
    for(const r of records){
      if(!validateReviewCandidate(r))throw Error('Invalid full-record queue case: '+name+' / '+(r?.id||'?'));
      if(known.has(r.id))continue;
      known.add(r.id);
      candidates.push({...r,candidate:true});
    }
  }
  return candidates;
}
