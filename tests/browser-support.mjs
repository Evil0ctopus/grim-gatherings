// Tests explicit unsupported-browser messages instead of an endless connection spinner.
// Usage: node tests/browser-support.mjs [url] [chromium|webkit]
import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';

const url = process.argv[2] || 'http://127.0.0.1:8132/';
const engine = process.argv[3] || 'chromium';
if (!['chromium', 'webkit'].includes(engine)) throw new Error('Choose chromium or webkit.');
const browser = await (engine === 'webkit' ? webkit : chromium).launch();
try {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    Object.defineProperty(window, 'RTCPeerConnection', { value: undefined, configurable: true });
  });
  const host = await context.newPage(), phone = await context.newPage();
  const errors = [], peerErrors = [];
  for (const page of [host, phone]) {
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.text().includes('peer error browser-incompatible')) peerErrors.push(message.text());
    });
  }
  await host.goto(url);
  await host.click('#btn-new');
  for (const name of ['One', 'Two', 'Three']) {
    await host.fill('#guest-name', name); await host.click('#add-guest');
  }
  await host.click('#use-sample'); await host.click('#open-lobby');
  await host.waitForFunction(() => document.querySelector('#net')?.textContent === 'WebRTC unavailable');
  assert.match(await host.locator('#host-connection-help').innerText(), /Safari or Chrome/);
  const room = (await host.locator('#room-code').innerText()).trim();
  await phone.goto(`${url}?room=${room}`);
  await phone.waitForFunction(() => document.querySelector('#connection-help')?.textContent.includes('cannot use WebRTC'));
  assert.equal(await phone.locator('#pstatus').innerText(), 'offline');
  assert.match(await phone.locator('#connection-help').innerText(), /Safari or Chrome/);
  await phone.waitForTimeout(17000);
  assert.equal(peerErrors.length, 2, 'Neither unsupported host nor phone should retry automatically');
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log(`PASS unsupported host and phone show actionable errors without retry loops or JavaScript exceptions (${engine}).`);
} finally {
  await browser.close();
}
