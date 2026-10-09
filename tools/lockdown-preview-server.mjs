import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const routes = new Map([
  ['/tools/lockdown-preview.html', ['./lockdown-preview.html', 'text/html']],
  ['/tools/lockdown-preview.mjs', ['./lockdown-preview.mjs', 'text/javascript']],
  ['/tools/lockdown-draft-catalog.mjs', ['./lockdown-draft-catalog.mjs', 'text/javascript']],
  ['/js/lockdown-catalog.js', ['../js/lockdown-catalog.js', 'text/javascript']],
  ['/tools/lockdown-drafts.json', ['./lockdown-drafts.json', 'application/json']],
  ['/css/style.css', ['../css/style.css', 'text/css']],
]);

export function createLockdownPreviewServer() {
  return createServer(async (request, response) => {
    const path = new URL(request.url, 'http://127.0.0.1').pathname;
    if (path === '/' && ['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(302, { Location: '/tools/lockdown-preview.html' }).end();
      return;
    }
    const route = routes.get(path);
    if (!route || !['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not available in the author-review preview.');
      return;
    }
    try {
      const data = await readFile(new URL(route[0], import.meta.url));
      response.writeHead(200, { 'Content-Type': `${route[1]}; charset=utf-8`, 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : data);
    } catch (error) {
      console.error('Could not serve LOCKDOWN preview asset', error);
      response.writeHead(500, { 'Content-Type': 'text/plain' }).end('Could not load the author-review preview asset.');
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createLockdownPreviewServer();
  server.on('error', error => { console.error('LOCKDOWN preview server failed', error); process.exitCode = 1; });
  server.listen(8786, '127.0.0.1', () => console.log('Local author review: http://127.0.0.1:8786/tools/lockdown-preview.html'));
}
