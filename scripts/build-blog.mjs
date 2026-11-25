import { readdir, readFile, mkdir, writeFile, cp } from 'node:fs/promises';
import path from 'node:path';

export async function listFiles(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path.join(directory, entry.name), relative));
    else files.push(relative);
  }
  return files;
}

export async function buildBlog(root, out) {
  const blog = path.join(root, 'blog');
  await cp(blog, path.join(out, 'blog'), { recursive: true });
  const files = await listFiles(blog);
  for (const file of files) {
    // The academic homepage now owns the root and its 404 page.
    if (file === 'index.html' || file === '404.html') continue;
    const destination = path.join(out, file);
    await mkdir(path.dirname(destination), { recursive: true });
    if (!file.endsWith('.html')) {
      // Preserve incoming links to existing article images and other assets.
      await cp(path.join(blog, file), destination);
      continue;
    }
    const target = encodeURI('/blog/' + file.replace(/index\.html$/, ''));
    await writeFile(destination, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>This blog page has moved</title><link rel="canonical" href="https://yuhengna.github.io${target}">
<meta http-equiv="refresh" content="0;url=${target}">
<script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script>
</head><body><p>This blog page has moved. <a href="${target}">Continue to the article.</a></p></body></html>`);
  }
  await writeFile(path.join(out, '404.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found — Yuheng Na</title><link rel="stylesheet" href="/assets/style.css"></head><body><main class="page-shell"><section class="academic-section"><h1>Page not found</h1><p><a href="/">Academic homepage</a> · <a href="/blog/">Technical blog</a></p></section></main></body></html>`);
  const sitemapPath = path.join(out, 'sitemap.xml');
  const sitemap = await readFile(sitemapPath, 'utf8');
  const blogPages = files.filter(file => file.endsWith('.html') && file !== '404.html');
  const entries = blogPages.map(file => `<url><loc>https://yuhengna.github.io${encodeURI('/blog/' + file.replace(/index\.html$/, ''))}</loc></url>`).join('');
  await writeFile(sitemapPath, sitemap.replace('</urlset>', entries + '</urlset>'));
  console.log(`Preserved ${blogPages.length} blog pages at /blog/ with legacy URL redirects.`);
}
