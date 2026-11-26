#!/usr/bin/env node
// Resolve human time ranges to YYYY-MM-DD since/until for X search.
const arg = (process.argv[2] || 'month').toLowerCase();
const now = process.argv[3] ? new Date(process.argv[3]) : new Date();
if (Number.isNaN(now.getTime())) {
  console.error('Invalid as-of date');
  process.exit(2);
}

const dayMs = 86400000;
function ymd(d) {
  return d.toISOString().slice(0, 10);
}

const presets = {
  day: 1,
  week: 7,
  '2w': 14,
  fortnight: 14,
  month: 30,
  '3m': 90,
  quarter: 90,
  '6m': 180,
  year: 365,
  '2y': 730,
  '两年': 730,
  '一年': 365,
  '一月': 30,
  '一周': 7,
};

let since;
let until = ymd(now);
if (/^\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}$/.test(arg)) {
  const [a, b] = arg.split('..');
  since = a;
  until = b;
} else if (/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
  since = arg;
} else if (presets[arg] != null) {
  since = ymd(new Date(now.getTime() - presets[arg] * dayMs));
} else {
  console.error('Unknown range. Use week|month|year|2y|YYYY-MM-DD|YYYY-MM-DD..YYYY-MM-DD');
  process.exit(2);
}

console.log(JSON.stringify({ range: arg, since, until, asOf: now.toISOString() }, null, 2));
