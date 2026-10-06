import assert from 'node:assert/strict';
import { once } from 'node:events';
import { chromium, webkit } from 'playwright';
import { createCommunityServer } from '../server/community.mjs';
import { premiumFixture } from './premium-fixture.mjs';

const server = await createCommunityServer({ database: ':memory:' });
server.listen(0, '127.0.0.1'); await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
const fixture = await premiumFixture({ origin: base });
const project = 'https://project.supabase.co/functions/v1/community';
const browserType = process.argv[2] || 'chromium';
assert.ok(['chromium', 'webkit'].includes(browserType), 'Choose chromium or webkit');
const browser = await ({ chromium, webkit })[browserType].launch();
const errors = [], consoleErrors = [], rejectedResponses = [];
let checks = 0, snapshot = null;
const check = (label, value) => { assert.ok(value, label); checks++; console.log(`PASS ${label}`); };
async function pageFor(user = null) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('response', response => {
    if (response.status() >= 400) rejectedResponses.push({ url: response.url(), status: response.status(), body: response.request().postDataJSON() });
  });
  page.on('dialog', dialog => dialog.accept());
  if (user) await page.addInitScript(name => sessionStorage.setItem('gg-community-session-v1', JSON.stringify({
    token: `${name}-token`, refreshToken: `${name}-refresh`, expiresAt: Date.now() + 3600000,
  })), user);
  await page.route('**/js/community-config.js*', route => route.fulfill({ contentType: 'text/javascript',
    body: `export const COMMUNITY_API=${JSON.stringify(project)};export const COMMUNITY_PROVIDER='supabase';` }));
  await page.route(`${project}/**`, async route => {
    const req = route.request();
    const response = await fixture.handler(new Request(req.url(), { method: req.method(), headers: await req.allHeaders(),
      ...(req.postData() ? { body: req.postData() } : {}) }));
    const text = await response.text();
    if (req.url().endsWith('/api/premium/games') && req.method() === 'POST' && response.ok) snapshot = JSON.parse(text);
    await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: text });
  });
  // PayPal is simulated here; no real credentials or charges are used.
  await page.route('https://www.paypal.com/**', async route => {
    const token = new URL(route.request().url()).searchParams.get('token');
    const order = fixture.orders.get(token);
    if (order) fixture.approve(token);
    await route.fulfill({ contentType: 'text/html', body: `<h1>Simulated PayPal approval</h1><a href="${base}/shop.html?payment=return&token=${token}">Return to merchant</a><a href="${base}/shop.html?payment=cancel">Cancel</a>` });
  });
  return page;
}
async function click(page, selector) {
  await page.locator(selector).first().click();
  await page.waitForFunction(() => !document.querySelector('#shop [data-shop]:disabled:not([data-shop^="buy-"]):not([data-shop="capture-return"])'));
}
async function loaded(page) { await page.getByRole('heading', { name: 'Shadow Societies: Two-Game Bundle', exact: true }).waitFor(); }
try {
  const anonymous = await pageFor();
  await anonymous.goto(base + '/shop.html'); await loaded(anonymous);
  check('anonymous visitor sees exact $9.99 bundle with both titles', (await anonymous.locator('#shop').innerText()).includes('$9.99') &&
    (await anonymous.locator('#shop').innerText()).includes('The Black Ledger Society') &&
    (await anonymous.locator('#shop').innerText()).includes('The Lanternfall Covenant'));
  check('anonymous visitor must log in to buy', await anonymous.locator('[data-shop="buy-card"]').isDisabled());
  check('single-device scope is disclosed before buying', (await anonymous.locator('#shop').innerText()).includes('No separate-phone rooms'));
  await anonymous.fill('#shop-email', 'buyer@example.test'); await anonymous.fill('#shop-password', 'test-only-password');
  await click(anonymous, '[data-shop="login"]');
  check('buyer login leaves card and PayPal options available', await anonymous.locator('[data-shop="buy-card"]').isEnabled() && await anonymous.locator('[data-shop="buy-paypal"]').isEnabled());
  await click(anonymous, '[data-shop="buy-card"]');
  check('purchase consent is required', (await anonymous.locator('#shop-error').innerText()).includes('Accept the immediate-access'));
  await anonymous.check('#purchase-consent');
  await anonymous.click('[data-shop="buy-card"]');
  await anonymous.getByRole('heading', { name: 'Simulated PayPal approval' }).waitFor();
  const orderId = new URL(anonymous.url()).searchParams.get('token');
  const creation = fixture.calls.find(call => call.path === '/v2/checkout/orders');
  check('card option requests hosted guest checkout and fixed price', creation.body.payment_source.paypal.experience_context.landing_page === 'GUEST_CHECKOUT' &&
    creation.body.purchase_units[0].amount.value === '9.99');
  await anonymous.getByRole('link', { name: 'Return to merchant' }).click();
  await anonymous.getByRole('button', { name: 'Play my purchased games' }).waitFor();
  check('return automatically verifies payment and adds both games to the signed-in account', (await anonymous.locator('#shop-message').innerText()).includes('Payment confirmed'));
  check('purchase history provides a receipt and recovery button', await anonymous.locator('[data-shop="check-order"]').count() === 1);
  check('purchase never exposes administrator controls', await anonymous.locator('[data-shop="payments-admin"]').count() === 0);
  await click(anonymous, '[data-shop="play"]');
  check('purchased game selector includes both games', await anonymous.locator('#lab-game option').count() === 2);
  await anonymous.fill('#lab-names', 'One');
  await click(anonymous, '[data-action="lab-create"]');
  check('invalid player count is surfaced', (await anonymous.locator('#shop-error').innerText()).includes('3-10'));
  let finalSealed;
  for (const gameId of ['lanternfall', 'ledger']) for (const count of [3, 10]) {
    await anonymous.selectOption('#lab-game', gameId);
    await anonymous.fill('#lab-names', Array.from({ length: count }, (_, index) => `Guest ${index + 1}`).join('\n'));
    await click(anonymous, '[data-action="lab-create"]');
    check(`${gameId}/${count}: private roles hidden before handoff`, !(await anonymous.locator('#shop').innerText()).includes('Secret allies:'));
    for (let i = 0; i < count; i++) {
      await click(anonymous, '[data-action="lab-reveal"]');
      await click(anonymous, '[data-action="lab-next-card"]');
    }
    await click(anonymous, '[data-action="lab-reveal"]');
    const roundBeforeReload = snapshot.state.round;
    await anonymous.reload(); await loaded(anonymous);
    await click(anonymous, '[data-shop="play"]');
    check(`${gameId}/${count}: refresh retains saved match but conceals private turn`, snapshot.state.round === roundBeforeReload &&
      await anonymous.locator('[data-action="lab-reveal"]').count() === 1 && await anonymous.locator('#lab-target').count() === 0);
    let steps = 0;
    while (snapshot.state.phase !== 'finished') {
      assert.ok(steps++ < 100, 'premium match should terminate');
      if (snapshot.state.phase === 'discussion') {
        await click(anonymous, '[data-action="lab-notes"]');
        for (const player of snapshot.state.players.filter(player => !player.detained)) {
          await click(anonymous, '[data-action="lab-reveal"]');
          check(`${gameId}/${count}: private dawn note ${player.id}`, (await anonymous.locator('#shop').innerText()).includes('Private note:'));
          await click(anonymous, '[data-action="lab-next-card"]');
        }
        await click(anonymous, '[data-action="lab-council"]');
      } else {
        await click(anonymous, '[data-action="lab-reveal"]');
        if (snapshot.state.phase === 'vote') await anonymous.selectOption('#lab-target', '');
        await click(anonymous, '[data-action="lab-submit"]');
      }
    }
    finalSealed = snapshot;
    check(`${gameId}/${count}: full purchased match reaches final reveal`, (await anonymous.locator('#shop').innerText()).includes('Final reveal'));
    for (const width of [320, 390, 768]) {
      await anonymous.setViewportSize({ width, height: 844 });
      check(`${gameId}/${count}: ${width}px no overflow`, await anonymous.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await anonymous.setViewportSize({ width: 390, height: 844 });
    await click(anonymous, '[data-action="lab-restart"]');
  }
  const other = await pageFor('other');
  await other.goto(base + '/shop.html'); await loaded(other);
  check('another account cannot see or play purchased games', await other.locator('[data-shop="play"]').count() === 0);
  const forbidden = await fixture.request('/api/premium/games', { user: 'other', method: 'POST',
    body: { state: finalSealed.state, seal: finalSealed.seal, command: { type: 'resume' } } });
  check('copied premium snapshot cannot bypass account entitlement', forbidden.status === 403);
  const reopened = await pageFor('buyer');
  await reopened.goto(base + '/shop.html'); await loaded(reopened);
  check('same account on another browser sees ownership without repurchase', await reopened.locator('[data-shop="play"]').count() === 1);
  const cancelled = await pageFor('other');
  await cancelled.goto(base + '/shop.html?payment=cancel'); await loaded(cancelled);
  check('cancellation is explicit and does not unlock games', (await cancelled.locator('#shop-message').innerText()).includes('cancelled') && await cancelled.locator('[data-shop="play"]').count() === 0);
  const owner = await pageFor('owner');
  await owner.goto(base + '/shop.html'); await loaded(owner);
  await click(owner, '[data-shop="payments-admin"]');
  check('owner can manage receipts without exposing those controls to buyers', (await owner.locator('#shop').innerText()).includes('buyer@example.test'));
  await click(owner, '[data-shop="refund"]');
  check('owner refund has an explicit confirmation/result', (await owner.locator('#shop-message').innerText()).includes('Full refund confirmed'));
  await click(reopened, '[data-shop="refresh"]');
  check('refund removes play access and shows inactive payment', await reopened.locator('[data-shop="play"]').count() === 0 && (await reopened.locator('#shop').innerText()).includes('refunded'));
  check('refunded payment cannot be captured again', (await fixture.capture(orderId)).status === 409);
  await click(anonymous, '[data-shop="logout"]');
  check('logout clears current purchase view and private game cards', await anonymous.locator('[data-shop="play"]').count() === 0 && await anonymous.locator('#lab-game').count() === 0);
  check('no unexpected JavaScript exceptions', errors.length === 0);
  assert.equal(rejectedResponses.length, 1, 'only the deliberately invalid player count is rejected');
  assert.equal(rejectedResponses[0].url, project + '/api/premium/games');
  assert.equal(rejectedResponses[0].status, 400);
  assert.deepEqual(rejectedResponses[0].body.names, ['One']);
  assert.equal(consoleErrors.length, 1, 'only the intentional validation failure is logged');
  assert.match(consoleErrors[0], /Failed to load resource:.*400/);
  check('no unexpected browser console errors', true);
  console.log(`${checks} premium browser checks passed (${browserType}).`);
} finally { await browser.close(); await fixture.close(); await new Promise(resolve => server.close(resolve)); }
