import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { once } from 'node:events';
import { chromium } from 'playwright';

const root = resolve('dist');
const server = createServer(async (req, res) => {
  if (req.url === '/estate-review') {
    res.setHeader('Content-Type', 'text/html');
    res.end('<!doctype html><html><head><link rel="stylesheet" href="/css/style.css"></head><body></body></html>');
    return;
  }
  const path = resolve(root, `.${decodeURIComponent(new URL(req.url, 'http://localhost').pathname)}`);
  if (!path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try {
    const data = await readFile(path);
    res.setHeader('Content-Type', ({'.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.html': 'text/html'})[extname(path)] || 'application/octet-stream');
    res.end(data);
  } catch (error) {
    if (error.code !== 'ENOENT') console.error(error);
    res.writeHead(404).end();
  }
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/estate-review`);
  await page.evaluate(async () => {
    const {hauntedManorHtml, startManorShadow} = await import('/js/manor.js');
    document.body.innerHTML = hauntedManorHtml();
    document.body.dataset.effects = 'on';
    document.body.dataset.motion = 'full';
    startManorShadow(document.querySelector('.manor-scene'));
    await Promise.all([...new Set([...document.querySelectorAll('image')].map(el => el.getAttribute('href')))].map(async src => {
      const image = new Image(); image.src = src; await image.decode();
    }));
    for (const animation of document.querySelector('.manor-scene').getAnimations({subtree:true})) animation.pause();
  });
  for (const width of [320, 390, 768, 1408, 1920]) {
    await page.setViewportSize({width, height: 1000});
    const bounds = await page.locator('.manor-artwork').boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, `House fits ${width}`);
    assert.equal(await page.locator('.manor-grave').count(), 10);
    assert.equal(await page.locator('.manor-window').count(), 7);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  }
  const timing = await page.evaluate(() => {
    const gate = document.querySelector('.manor-gate-leaf').getAnimations()[0];
    const camera = document.querySelector('.manor-camera').getAnimations()[0];
    const gateway = document.querySelector('.manor-gateway').getAnimations()[0];
    const results = [0, 5000, 10000, 15000, 20000].map(time => {
      gate.currentTime = camera.currentTime = gateway.currentTime = time;
      return {time, gate: getComputedStyle(gate.effect.target).transform, camera:getComputedStyle(camera.effect.target).transform, gateway:getComputedStyle(gateway.effect.target).opacity};
    });
    return results;
  });
  assert.match(timing[0].gate, /^matrix\(1,/);
  assert.match(timing[2].gate, /^matrix\(0.045,/);
  assert.match(timing[2].camera, /^matrix\(1,/);
  assert.equal(timing[4].gateway, '0');
  await page.evaluate(() => { document.body.dataset.effects = 'off'; });
  assert.equal(await page.locator('.manor-rain').evaluate(el => getComputedStyle(el).display), 'none');
  assert.equal(await page.locator('.manor-camera').evaluate(el => el.getAnimations().length), 0);
  await page.evaluate(() => { document.body.dataset.effects = 'on'; document.body.dataset.motion = 'reduced'; });
  assert.equal(await page.locator('.estate-lightning').evaluate(el => getComputedStyle(el).display), 'none');
  assert.equal(await page.locator('.manor-camera').evaluate(el => el.getAnimations().length), 0);
  await page.evaluate(async () => {
    const {hauntedManorHtml} = await import('/js/manor.js');
    document.body.innerHTML = hauntedManorHtml();
  });
  assert.equal(await page.locator('.manor-arrived').count(), 1);
  assert.deepEqual(errors, []);
  await page.setViewportSize({width: 1408, height: 900});
  await page.goto(`${base}/index.html`);
  await page.locator('#btn-new').waitFor();
  assert.equal(await page.locator('.manor-artwork').count(), 1);
  await page.evaluate(async () => {
    await Promise.all([...new Set([...document.querySelectorAll('.manor-scene image')].map(el => el.getAttribute('href')))].map(async src => {
      const image = new Image(); image.src = src; await image.decode();
    }));
    for (const animation of document.querySelector('.manor-scene').getAnimations({subtree:true})) {
      animation.pause(); animation.currentTime = 0;
    }
  });
  if (process.env.ESTATE_PREVIEWS) {
    await page.screenshot({path: resolve(process.env.ESTATE_PREVIEWS, 'estate-home-desktop.png')});
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path: resolve(process.env.ESTATE_PREVIEWS, 'estate-home-mobile.png')});
  }
  assert.deepEqual(errors, []);
  console.log('Estate browser checks passed: five viewport widths, artwork decoding, gates-before-passage, controls, seven panes, one-time arrival.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
