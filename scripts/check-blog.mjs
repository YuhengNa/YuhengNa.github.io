import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { listFiles } from './build-blog.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const files = await listFiles(path.join(dist, 'blog'));
const errors = [];
async function checkLink(href, source) {
  if (!href.startsWith('/') || href.startsWith('//')) return;
  const pathname = decodeURIComponent(href.split(/[?#]/)[0].replaceAll('&amp;', '&'));
  let target = path.join(dist, pathname);
  try {
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    await stat(target);
  } catch { errors.push(`${source}: ${href}`); }
}
for (const file of files.filter(file => file.endsWith('.html'))) {
  const html = await readFile(path.join(dist, 'blog', file), 'utf8');
  for (const match of html.matchAll(/\b(?:href|src|srcset|data-src|data-lazy-src)\s*=\s*["']([^"']+)["']/g)) {
    await checkLink(match[1], file);
  }
  for (const match of html.matchAll(/url\(["']?([^"')]+)["']?\)/g)) await checkLink(match[1], file);
  assert(html.includes('"root":"/blog/"'), `Incorrect blog root: ${file}`);
  assert(html.includes('"search_path":"/blog/local-search.xml"'), `Incorrect search path: ${file}`);
  if (file !== 'index.html' && file !== '404.html') {
    const redirect = await readFile(path.join(dist, file), 'utf8');
    assert(redirect.includes('location.search+location.hash'), `Redirect loses query/hash: ${file}`);
    assert(redirect.includes(encodeURI('/blog/' + file.replace(/index\.html$/, ''))), `Incorrect redirect: ${file}`);
  }
}
const search = await readFile(path.join(dist, 'blog/local-search.xml'), 'utf8');
for (const match of search.matchAll(/<url>(.*?)<\/url>/g)) await checkLink(match[1], 'local-search.xml');
assert.deepEqual(errors, [], 'Broken local blog links');
console.log('Passed: blog pages, local links, search index, and legacy redirects.');
