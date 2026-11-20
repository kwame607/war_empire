const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const mime = { '.js': 'text/javascript', '.html': 'text/html' };
const srv = http.createServer((q, r) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(d); } }); }).listen(8126, async () => {
  const out = process.env.OUT || '/tmp'; const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const j of process.argv.slice(2)) { const [name, qs] = j.split('@'); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
    p.on('pageerror', (e) => console.log('ERR', e.message)); await p.goto(`http://localhost:8126/hero.html?b=${name}&${qs || ''}`); await p.waitForFunction('window.done', null, { timeout: 120000 });
    await p.locator('#c').screenshot({ path: `${out}/${name}.png` }); await p.close(); }
  await b.close(); srv.close();
});
