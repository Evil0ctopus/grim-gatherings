import assert from 'node:assert/strict';
import { once } from 'node:events';
import { chromium, webkit } from 'playwright';
import { createCommunityServer } from '../server/community.mjs';
import { premiumFixture } from './premium-fixture.mjs';

const server = await createCommunityServer({ database: ':memory:' });
server.listen(0, '127.0.0.1'); await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`, f = await premiumFixture({ origin: base });
const project = 'https://project.supabase.co/functions/v1/community';
const type = process.argv[2] || 'chromium', browser = await ({ chromium, webkit })[type].launch();
const errors = [];
let checks = 0;
const check = (label, condition) => { assert.ok(condition, label); checks++; console.log(`PASS ${label}`); };
async function phone(host = false) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
  if (host) await page.addInitScript(() => sessionStorage.setItem('gg-community-session-v1', JSON.stringify({
    token: 'buyer-token', refreshToken: 'buyer-refresh', expiresAt: Date.now() + 3600000,
  })));
  await page.route('**/js/community-config.js*', route => route.fulfill({ contentType: 'text/javascript',
    body: `export const COMMUNITY_API=${JSON.stringify(project)};export const COMMUNITY_PROVIDER='supabase';` }));
  await page.route(`${project}/**`, async route => {
    const r = route.request();
    const response = await f.handler(new Request(r.url(), { method: r.method(), headers: await r.allHeaders(),
      ...(r.postData() ? { body: r.postData() } : {}) }));
    await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: await response.text() });
  });
  return page;
}
async function click(page, action) {
  await page.locator(`[data-room="${action}"]`).click();
  await page.waitForFunction(() => !document.querySelector('#premium-room button:disabled'));
  assert.equal(await page.locator('#room-error').innerText(), '');
}
async function reload(page) {
  await page.reload();
  await page.locator('#room-code-display').waitFor();
  assert.equal(await page.locator('#room-error').innerText(), '');
}
try {
  const order = (await f.buy()).body; f.approve(order.orderId); await f.capture(order.orderId);
  const host = await phone(true);
  await host.goto(base + '/shop.html');
  await host.locator('[data-shop="play"]').click();
  await host.locator('#room-game').waitFor();
  check('purchased primary play opens host phone-room setup', host.url().includes('host=1'));
  for (const gameId of ['lanternfall', 'ledger']) {
    if (gameId === 'ledger') { await host.goto(base + '/premium-room.html?host=1'); await host.locator('#room-game').waitFor(); }
    await host.selectOption('#room-game', gameId); await click(host, 'create');
    const code = await host.locator('#room-code-display').innerText();
    check(`${gameId}: secure room code and guest link shown`, /^[A-Z2-9]{8}$/.test(code) && !(await host.locator('#room-link').inputValue()).includes('token'));
    const guests = await Promise.all(Array.from({ length: 3 }, () => phone()));
    for (let i = 0; i < 3; i++) {
      await guests[i].goto(base + (i === 0 ? '/?room=' : '/premium-room.html?room=') + code);
      await guests[i].locator('#room-name').waitFor();
      if (i === 0) check(`${gameId}: homepage room code routes to premium joining`, guests[i].url().includes('premium-room.html'));
      await guests[i].fill('#room-name', `Guest ${i + 1}`); await click(guests[i], 'join');
      check(`${gameId}: guest ${i + 1} joins without login or purchase`, await guests[i].evaluate(() => !sessionStorage.getItem('gg-community-session-v1')));
    }
    await reload(host); await click(host, 'start');
    check(`${gameId}: moderator has no private card`, await host.locator('[data-room="reveal"]').count() === 0);
    for (const guest of guests) {
      await reload(guest);
      check(`${gameId}: refresh/reconnect hides roles`, await guest.locator('[data-room="reveal"]').count() === 1 && await guest.locator('#room-target').count() === 0);
      await click(guest, 'reveal');
      check(`${gameId}: phone has one private role only`, await guest.locator('.gold h3').count() === 1);
    }
    await guests[0].reload(); await guests[0].locator('[data-room="reveal"]').waitFor();
    check(`${gameId}: reopened seat never auto-reveals`, await guests[0].locator('#room-target').count() === 0);
    let steps = 0;
    while (true) {
      await reload(host);
      const view = await f.request('/api/premium/rooms/host', { method: 'POST', body: { code, command: 'view' } });
      assert.equal(view.status, 200);
      if (view.body.phase === 'finished') break;
      assert.ok(++steps < 15);
      if (view.body.phase === 'discussion') { await click(host, 'council'); continue; }
      for (const guest of guests) {
        await reload(guest); await click(guest, 'reveal');
        if (view.body.phase === 'vote') await guest.selectOption('#room-target', '');
        await click(guest, 'submit');
        check(`${gameId}: committing hides private card`, await guest.locator('#room-target').count() === 0);
      }
    }
    check(`${gameId}: full phone match reaches public finale`, (await host.locator('#premium-room').innerText()).includes('win'));
    for (const guest of guests) await reload(guest);
    for (const width of [320, 390, 768]) {
      await guests[0].setViewportSize({ width, height: 844 });
      check(`${gameId}: ${width}px has no horizontal overflow`, await guests[0].evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await click(host, 'close');
    await guests[0].reload(); await guests[0].getByRole('alert').filter({ hasText: 'closed' }).waitFor();
    check(`${gameId}: closed room stops guest access`, await guests[0].locator('.gold').count() === 0);
    for (const guest of guests) await guest.close();
  }
  check('no JavaScript page errors', errors.length === 0);
  console.log(`${checks} phone-room browser checks passed (${type}).`);
} finally { await browser.close(); await f.close(); await new Promise(resolve => server.close(resolve)); }
