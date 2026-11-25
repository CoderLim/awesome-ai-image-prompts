import fs from 'node:fs';
import { render } from './core.mjs';
export const read = p => JSON.parse(fs.readFileSync(p,'utf8'));
export const list = p => fs.readdirSync(p).filter(f=>f.endsWith('.json')).sort().map(f=>read(p+'/'+f));
const files = render(list('data/cases'),list('data/index').flat().sort((x,y)=>x.id.localeCompare(y.id,'en',{numeric:true})),read('data/taxonomy.json'));
let bad = false;
for (const [p,s] of Object.entries(files)) {
 if(process.argv.includes('--check')) {if(!fs.existsSync(p)||fs.readFileSync(p,'utf8')!==s){console.error('Stale:',p);bad=true;}}
 else {fs.mkdirSync(p.slice(0,p.lastIndexOf('/'))||'.',{recursive:true});fs.writeFileSync(p,s);}
}
if(bad) process.exitCode=1;
