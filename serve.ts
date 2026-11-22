import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), 'game');
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8' };
const port = Number(process.env.PORT || 8080);
createServer((req,res)=>{
  try {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
    const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!path.startsWith(root + sep) || !statSync(path).isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type':mime[extname(path)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    res.end(readFileSync(path));
  } catch { res.writeHead(404).end(); }
}).listen(port,'127.0.0.1',()=>console.log(`Vault Shift: http://127.0.0.1:${port}`));
