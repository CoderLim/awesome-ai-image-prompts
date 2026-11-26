// Pairing evidence is based on raw collected variants. Time proximity is never proof.
import {handle,xPost,xImage} from '../../../../scripts/x-source.mjs';
const asStrings=v=>Array.isArray(v)?v.filter(x=>typeof x==='string'):typeof v==='string'?[v]:[];
const textFields=r=>[r.full_text,r.fullText,r.note_tweet?.text,r.noteTweet?.text,r.text,r.content].filter(x=>typeof x==='string'&&x.trim());
const mediaFields=r=>[...asStrings(r.media_urls),...asStrings(r.mediaUrls),...(Array.isArray(r.media)?r.media.map(m=>typeof m==='string'?m:m?.url??m?.media_url_https):[])].filter(x=>typeof x==='string');
const relationFields=r=>[r.in_reply_to_status_id_str,r.in_reply_to_status_id,r.inReplyToStatusId,r.reply_to_id,r.replyToId,r.quoted_status_id_str,r.quoted_status_id,r.quotedStatusId,r.quoted_tweet_id,r.quotedTweetId].filter(x=>typeof x==='string');
const authorOf=r=>r.username??r.screen_name??r.author?.username??r.author?.screen_name??(typeof r.author==='string'&&/^@[A-Za-z0-9_]{1,15}$/.test(r.author)?r.author:null);
export const postTexts=p=>p.variants.flatMap(textFields);
const knownMedia=p=>new Set(p.variants.flatMap(mediaFields).flatMap(u=>{try{return [xImage(u).pathname]}catch{return []}}));
function linksTo(p,target){
 return p.variants.some(r=>[...textFields(r),...asStrings(r.urls),...(Array.isArray(r.entities?.urls)?r.entities.urls.map(x=>x.expanded_url??x.url):[])].some(t=>typeof t==='string'&&[...t.matchAll(/https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/(\d+)/g)].some(m=>m[1]===target.id)));
}
export function pairEvidence(image,prompt){
 if(image.id===prompt.id)return 'same-post';
 if(image.variants.some(r=>relationFields(r).includes(prompt.id))||prompt.variants.some(r=>relationFields(r).includes(image.id)))return 'explicit-reply-or-quote';
 if(linksTo(image,prompt)||linksTo(prompt,image))return 'explicit-post-link';
 return null;
}
export function verifyPair(c,snapshot){
 const image=xPost(c.url),prompt=xPost(c.promptPostUrl??c.url),user=handle(snapshot.username);
 if(image.handle!==user||prompt.handle!==user||(c.postId&&c.postId!==image.postId)||(c.promptPostId&&c.promptPostId!==prompt.postId))throw Error('Post identity mismatch: '+c.url);
 const byId=new Map(snapshot.posts.map(p=>[p.id,p])),a=byId.get(image.postId),b=byId.get(prompt.postId);
 if(!a||!b)throw Error('Posts missing from raw snapshot: '+c.url);
 for(const p of [a,b])for(const r of p.variants){const author=authorOf(r);if(author&&handle(author)!==user)throw Error('Author mismatch: '+p.id);}
 const body=typeof c.prompt==='string'?c.prompt:c.prompt?.original;
 if(typeof body!=='string'||!body.trim()||!postTexts(b).some(t=>t.includes(body)))throw Error('Prompt not a verbatim span of source text: '+c.url);
 if(!Array.isArray(c.images)||!c.images.length)throw Error('Missing selected media');
 const media=knownMedia(a);
 for(const m of c.images){const u=xImage(typeof m==='string'?m:m.url);if(!media.has(u.pathname))throw Error('Image not present in source post: '+u);}
 let evidence=pairEvidence(a,b);
 if(!evidence){
  const d=c.pairReview;
  if(d?.status!=='verified'||typeof d.reviewer!=='string'||!d.reviewer.trim()||typeof d.evidence!=='string'||!d.evidence.trim()||!['shared-series-identifier','thread-and-topic','visual-semantic-match'].includes(d.kind))throw Error('Ambiguous pair needs explicit semantic review: '+c.url);
  evidence='reviewed:'+d.kind;
 }
 return {imageId:image.postId,promptId:prompt.postId,evidence};
}
