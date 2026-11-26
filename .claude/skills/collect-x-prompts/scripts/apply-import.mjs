#!/usr/bin/env node
// Apply a staged plan only to a clean, unchanged checkout. Never commit automatically.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const [dir]=process.argv.slice(2);
if(!dir)throw Error('Usage: apply-import.mjs LOCAL_PLAN_DIR');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const root=git('rev-parse','--show-toplevel');
if(path.resolve(process.cwd())!==path.resolve(root))throw Error('Run from repository root');
const dest=path.resolve(dir);
if(!dest.startsWith(path.join(root,'.cache')+path.sep))throw Error('Plan must be under .cache/');
const report=JSON.parse(fs.readFileSync(path.join(dest,'report.json'),'utf8'));
if(report.head!==git('rev-parse','HEAD')||git('status','--porcelain').length)throw Error('Plan stale or working tree not clean; restage from current main');
if(!Array.isArray(report.files)||!report.files.length)throw Error('No approved additions in plan');
const paths=new Set(),pending=[];
for(const f of report.files){
 if(!f||typeof f.path!=='string'||!(f.path==='data/sources.json'||/^data\/index\/[a-z0-9-]+-\d+\.json$/.test(f.path))||paths.has(f.path))throw Error('Invalid plan path');
 paths.add(f.path);
 const bytes=fs.readFileSync(path.join(dest,f.path));
 if(createHash('sha256').update(bytes).digest('hex')!==f.sha256)throw Error('Plan integrity mismatch: '+f.path);
 if(f.path!=='data/sources.json'&&fs.existsSync(f.path))throw Error('Refuse to overwrite existing shard: '+f.path);
 pending.push({path:f.path,bytes});
}
if(!paths.has('data/sources.json'))throw Error('Missing source registry update');
for(const f of pending.filter(x=>x.path!=='data/sources.json'))fs.writeFileSync(f.path,f.bytes,{flag:'wx'});
fs.writeFileSync('data/sources.json',pending.find(x=>x.path==='data/sources.json').bytes);
try{
 execFileSync('npm',['run','build'],{stdio:'inherit'});
 execFileSync('npm',['run','check'],{stdio:'inherit'});
 console.log('Staged import validated. Inspect git diff and git status; commit all data and generated files together.');
}catch(e){
 console.error('Import validation failed. No commit was created; inspect the working tree before retrying.');
 process.exitCode=1;
}
