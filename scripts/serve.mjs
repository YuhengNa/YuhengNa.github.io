import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

await import('./build.mjs');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf','.xml':'application/xml','.txt':'text/plain'};
const port = Number(process.env.PORT || 4173);
const server = createServer(async (req,res)=>{
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let filename = path.resolve(root, '.'+pathname);
    if (!filename.startsWith(root+path.sep) && filename !== root) { res.writeHead(403);res.end('Forbidden');return; }
    if ((await stat(filename)).isDirectory()) filename = path.join(filename,'index.html');
    const body = await readFile(filename);
    res.writeHead(200, {'Content-Type':mime[path.extname(filename)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(body);
  } catch { res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found'); }
});
server.listen(port, '127.0.0.1', ()=>console.log(`Local: http://127.0.0.1:${port}`));
