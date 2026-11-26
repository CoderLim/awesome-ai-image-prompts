#!/usr/bin/env node
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const day=86400000;
export const ymd=d=>new Date(d).toISOString().slice(0,10);
export function dateMs(s){
 if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error('Invalid ISO date: '+s);
 const t=Date.parse(s+'T00:00:00Z');
 if(!Number.isFinite(t)||ymd(t)!==s)throw Error('Invalid calendar date: '+s);
 return t;
}
// All date-only inputs are UTC calendar days. Explicit end date is inclusive.
export function resolveRange(arg='month',asOf=new Date()){
 const now=new Date(asOf);if(!Number.isFinite(+now))throw Error('Invalid as-of date');
 const today=dateMs(ymd(now)), presets={day:1,week:7,'2w':14,fortnight:14,month:30,'3m':90,quarter:90,'6m':180,year:365,'2y':730,'两年':730,'一年':365,'一月':30,'一周':7};
 let start,end=today+day;const a=arg.toLowerCase();
 if(a.includes('..')){const parts=a.split('..');if(parts.length!==2)throw Error('Invalid range');start=dateMs(parts[0]);end=dateMs(parts[1])+day;}
 else if(/^\d{4}-\d{2}-\d{2}$/.test(a))start=dateMs(a);
 else if(Object.hasOwn(presets,a))start=end-presets[a]*day;
 else throw Error('Unknown range: '+a);
 if(start>=end||end>today+day)throw Error('Reversed or future range');
 return {range:a,since:ymd(start),until:ymd(end),asOf:now.toISOString(),timezone:'UTC',untilExclusive:true};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 console.log(JSON.stringify(resolveRange(process.argv[2],process.argv[3]??new Date()),null,2));
}
