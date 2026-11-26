import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {readLocalReviewQueues} from './review-local-queues.mjs';

const row={
 id:'aweniai-123',title:{zh:'Example'},type:'generation',category:'posters',inputMode:'reference-to-image',status:'index-only',
 prompt:{original:'Example prompt'},sourcePreview:{images:[{url:'https://example.org/sample.jpg',role:'source-media'}]},
 provenance:{originalSource:{url:'https://example.org/post/123'},collectedFrom:[{sourceId:'aweniai',url:'https://example.org/post/123'}]},
 rights:{prompt:'unknown',media:'unknown'}
};

test('loads full records locally as candidates, skips known IDs, rejects incomplete entries',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'review-queue-'));
 try{
  assert.deepEqual(readLocalReviewQueues(root),[]);
  const dir=path.join(root,'.cache','review-queues');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'example.json'),JSON.stringify([row,row]));
  const result=readLocalReviewQueues(root);
  assert.equal(result.length,1);assert.equal(result[0].candidate,true);
  assert.equal(result[0].prompt.original,row.prompt.original);
  assert.deepEqual(readLocalReviewQueues(root,new Set([row.id])),[]);
  fs.writeFileSync(path.join(dir,'example.json'),JSON.stringify([{...row,prompt:{original:''}}]));
  assert.throws(()=>readLocalReviewQueues(root),/Invalid full-record queue case/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
