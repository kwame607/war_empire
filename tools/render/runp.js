const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const mime = { '.js': 'text/javascript', '.html': 'text/html' };
const srv = http.createServer((q, r) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(d); } }); }).listen(8124, async () => {
  const out = process.env.OUT; const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const n of process.argv.slice(2)) { const p = await b.newPage({ viewport: { width: 384, height: 384 } }); p.on('pageerror', (e) => console.log('ERR', n, e.message)); await p.goto(`http://localhost:8124/portrait.html?p=${n}`); await p.waitForFunction('window.done', null, { timeout: 60000 }); await p.locator('#c').screenshot({ path: `${out}/${n}.png` }); await p.close(); }
  await b.close(); srv.close();
});
