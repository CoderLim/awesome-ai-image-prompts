#!/usr/bin/env node
// Build data/index/<sourceId>-NNN.json shards from a collected cases JSON array.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const usage = `Usage: node build-index-shard.mjs <cases.json> <out-dir> [sourceId]

cases.json: array of collected cases (see references/record-schema.md / intermediate shape below).
Writes <out-dir>/<sourceId>-001.json … (80 per shard) and prints {count, snapshotSha256, files}.

Intermediate case shape (minimum):
{
  "id"?: "optional-stable-id",
  "title": { "zh"?: string, "en"?: string } | string,
  "type"?: "generation"|"editing"|"unclassified",
  "category": string,
  "inputMode": "text-to-image"|"reference-to-image"|"image-editing"|"unknown",
  "prompt": string | { "original": string },
  "images": string[] | { url, role? }[],
  "author"?: "@handle",
  "url": "https://x.com/.../status/<id>",
  "postId"?: string,
  "publishedAt"?: string,
  "promptPostUrl"?: string,
  "promptPostId"?: string,
  "pairing"?: string
}`;

const [input, outDir, sourceIdArg] = process.argv.slice(2);
if (!input || !outDir) {
  console.error(usage);
  process.exit(2);
}

const taxPathCandidates = [
  path.resolve('data/taxonomy.json'),
  path.resolve(process.cwd(), 'data/taxonomy.json'),
];
const taxFile = taxPathCandidates.find((p) => fs.existsSync(p));
if (!taxFile) throw Error('data/taxonomy.json not found; run from repository root');
const tax = JSON.parse(fs.readFileSync(taxFile, 'utf8'));

const rawBuf = fs.readFileSync(input);
const cases = JSON.parse(rawBuf);
if (!Array.isArray(cases)) throw Error('cases.json must be an array');

function sourceIdFrom(cases, fallback) {
  if (fallback) return fallback.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const fromAuthor = String(cases[0]?.author || cases[0]?.originalSource?.author || '')
    .replace(/^@/, '')
    .toLowerCase();
  if (/^[a-z0-9_]+$/i.test(fromAuthor)) return fromAuthor.toLowerCase().replace(/_/g, '');
  throw Error('Pass sourceId as third arg');
}

const sourceId = sourceIdFrom(cases, sourceIdArg);
const collectedAt = new Date().toISOString();
const snapshotSha256 = createHash('sha256').update(rawBuf).digest('hex');

function excerpt(prompt) {
  const chars = [...String(prompt).replace(/\s+/g, ' ').trim()];
  if (chars.length <= 100) return { promptExcerpt: chars.join(''), excerptTruncated: false };
  return { promptExcerpt: chars.slice(0, 100).join(''), excerptTruncated: true };
}

function postIdFromUrl(url) {
  const m = String(url).match(/status\/(\d+)/);
  return m?.[1] || null;
}

function normalizeImages(images) {
  const list = (images || []).map((m) => {
    if (typeof m === 'string') return { url: m, role: 'source-media' };
    return { url: m.url, role: m.role || 'source-media' };
  });
  if (!list.length) throw Error('each case needs images');
  if (list.length > 4) return list.slice(0, 4);
  for (const m of list) {
    const u = new URL(m.url);
    if (u.protocol !== 'https:') throw Error('image must be https: ' + m.url);
    if (!['source-media', 'input', 'output'].includes(m.role)) throw Error('bad image role');
  }
  return list;
}

function normalizeTitle(title) {
  if (title && typeof title === 'object') {
    return { en: title.en ?? null, zh: title.zh ?? null };
  }
  if (typeof title === 'string' && title.trim()) return { en: null, zh: title.trim() };
  throw Error('title required');
}

const out = [];
for (const c of cases) {
  const prompt = typeof c.prompt === 'string' ? c.prompt : c.prompt?.original;
  if (!prompt?.trim()) throw Error('empty prompt: ' + (c.id || c.url));
  const url = c.url || c.originalSource?.url;
  if (!url) throw Error('url required');
  const postId = String(c.postId || c.originalSource?.postId || postIdFromUrl(url) || '');
  if (!/^\d+$/.test(postId)) throw Error('postId required for ' + url);

  let type = c.type || 'generation';
  let category = c.category;
  if (!category) throw Error('category required for ' + url);
  if (category === 'restyle' && type !== 'editing') type = 'editing';
  if (!tax[type]?.includes(category)) throw Error(`bad taxonomy ${type}/${category} for ${url}`);

  const inputMode = c.inputMode || 'unknown';
  if (!['text-to-image', 'reference-to-image', 'image-editing', 'unknown'].includes(inputMode)) {
    throw Error('bad inputMode ' + inputMode);
  }

  const author = c.author || c.originalSource?.author || ('@' + sourceId);
  const id = c.id || `${sourceId}-${postId}`;
  if (!/^[a-z0-9-]+$/.test(id)) throw Error('bad id ' + id);

  const images = normalizeImages(c.images || c.sourcePreview?.images);
  const { promptExcerpt, excerptTruncated } = excerpt(prompt);
  const title = normalizeTitle(c.title);

  const originalSource = {
    platform: 'x',
    author,
    url,
    postId,
    publishedAt: c.publishedAt || c.originalSource?.publishedAt || null,
    verification: 'reported-by-collector',
  };
  if (c.promptPostUrl) originalSource.promptPostUrl = c.promptPostUrl;
  if (c.promptPostId) originalSource.promptPostId = String(c.promptPostId);

  out.push({
    id,
    title,
    type,
    category,
    inputMode,
    status: 'index-only',
    prompt: { original: prompt },
    media: [],
    models: Array.isArray(c.models) ? c.models : [],
    sourcePreview: { images, promptExcerpt, excerptTruncated },
    provenance: {
      originalSource,
      collectedFrom: [{
        sourceId,
        mode: 'collector-export',
        snapshotSha256,
        url,
        collectedAt,
      }],
    },
    rights: { prompt: 'unknown', media: 'unknown' },
    sourceMeta: {
      model: c.model ?? c.sourceMeta?.model ?? null,
      textReview: c.textReview || c.sourceMeta?.textReview || 'appears-complete',
      visualReview: c.visualReview || c.sourceMeta?.visualReview || 'pending',
      pairing: c.pairing || c.sourceMeta?.pairing || (c.promptPostId ? 'prompt_post_paired_with_nearby_image_post' : 'same-post-reported'),
      imageVerification: 'source-reported-output; HTTP and visual match unchecked',
      review: {
        qualityStatus: 'recommended',
        classificationConfidence: c.classificationConfidence || 'medium',
        classificationMethod: 'owner-directed-collector-import',
        inputMode,
        category,
      },
    },
  });
}

out.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
fs.mkdirSync(outDir, { recursive: true });
const shardSize = 80;
const files = [];
for (let i = 0; i < out.length; i += shardSize) {
  const name = `${sourceId}-${String(i / shardSize + 1).padStart(3, '0')}.json`;
  const dest = path.join(outDir, name);
  fs.writeFileSync(dest, JSON.stringify(out.slice(i, i + shardSize), null, 2) + '\n');
  files.push(dest);
}

console.log(JSON.stringify({ sourceId, count: out.length, snapshotSha256, collectedAt, files }, null, 2));
