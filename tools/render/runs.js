const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const mime = { '.js': 'text/javascript', '.html': 'text/html' };
const srv = http.createServer((q, r) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(d); } }); }).listen(8125, async () => {
  const out = process.env.OUT || '/tmp'; const jobs = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const all = {};
  for (const j of jobs) { const [name, qs] = j.split('@'); const p = await b.newPage({ viewport: { width: 1700, height: 1200 } });
    p.on('pageerror', (e) => console.log('ERR', e.message)); p.on('console', (m) => { const t = m.text(); if (!t.includes('GL Driver')) console.log('console', t); });
    await p.goto(`http://localhost:8125/scene.html?${qs}`); await p.waitForFunction('window.done', null, { timeout: 120000 });
    await p.locator('#c').screenshot({ path: `${out}/${name}.png`, omitBackground: true }); const h = await p.evaluate('window.hotspots'); if (h) all[name] = h; await p.close(); }
  if (Object.keys(all).length) fs.writeFileSync(`${out}/hotspots.json`, JSON.stringify(all, null, 1));
  await b.close(); srv.close();
});
