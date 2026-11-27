import fs from 'node:fs';
import path from 'node:path';
import { render } from './core.mjs';
import { govern, governanceFiles, galleryView } from './governance.mjs';
import { readExclusions } from './review-exclusions.mjs';
import { readApprovals } from './review-status.mjs';
import { readFeatured } from './review-featured.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const index=fs.readdirSync('data/index').filter(f=>f.endsWith('.json')).sort().flatMap(f=>read('data/index/'+f)).sort((x,y)=>x.id.localeCompare(y.id,'en',{numeric:true}));
const result=govern(index,readExclusions(),readApprovals());
const view=galleryView(result.rows,read('data/taxonomy.json'));
const files={...render([],view.rows,view.taxonomy,readFeatured()),...governanceFiles(result)};
const check=process.argv.includes('--check');let bad=false;
for(const [p,s] of Object.entries(files)){if(check){if(!fs.existsSync(p)||fs.readFileSync(p,'utf8')!==s){console.error('Stale:',p);bad=true;}}else{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);}}
for(const dir of ['generation','reference','editing','unclassified']){if(!fs.existsSync(dir))continue;for(const name of fs.readdirSync(dir)){const p=dir+'/'+name;if(name.endsWith('.md')&&!(p in files)){if(check){console.error('Obsolete:',p);bad=true;}else fs.unlinkSync(p);}}}
if(bad)process.exitCode=1;
