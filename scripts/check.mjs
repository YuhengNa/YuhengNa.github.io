import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await readFile(path.join(root,'data/site.json'),'utf8'));
assert.equal(data.profile.name,'Yuheng Na');
for (const file of ['index.html','zh.html']) {
  const html = await readFile(path.join(root,'dist',file),'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`Duplicate IDs in ${file}`);
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href=m[1];
    if (href.startsWith('#')) assert(ids.includes(href.slice(1)),`Missing anchor ${href}`);
    else if (!/^(https?:|mailto:)/.test(href)) await access(path.join(root,'dist',href));
  }
  for (const p of data.publications) assert(html.includes(p.id));
  assert(!/undefined|\[object Object\]|Lorem ipsum|曾一鸣|Yiming Zeng/.test(html));
  assert(!html.includes('187-9521-7208'));
  const jsonld = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1];
  assert.equal(JSON.parse(jsonld).name,'Yuheng Na');
}
console.log('Passed: both languages, local assets, anchors, metadata, and content boundaries.');
