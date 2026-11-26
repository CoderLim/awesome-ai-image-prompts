import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export const featuredPath='data/review/featured.json';
// null: legacy automatic previews until the owner makes the first selection.
// []: explicitly empty manual selection; never silently fall back to automatic previews.
export function validateFeatured(value){
 if(value===null)return null;
 if(!Array.isArray(value)||value.some(id=>typeof id!=='string'||!/^[a-z0-9-]+$/.test(id))||new Set(value).size!==value.length)throw Error('Invalid featured IDs');
 return value;
}
export function readFeatured(root='.'){
 const f=path.join(root,featuredPath);
 return fs.existsSync(f)?validateFeatured(JSON.parse(fs.readFileSync(f,'utf8'))):null;
}
export function writeFeatured(ids,root='.'){
 validateFeatured(ids);
 const f=path.join(root,featuredPath);fs.mkdirSync(path.dirname(f),{recursive:true});
 const tmp=f+'.'+randomUUID()+'.tmp';
 try{fs.writeFileSync(tmp,JSON.stringify(ids,null,2)+'\n',{flag:'wx'});fs.renameSync(tmp,f);}finally{fs.rmSync(tmp,{force:true});}
}
