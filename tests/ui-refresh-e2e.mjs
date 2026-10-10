import assert from 'node:assert/strict';
import { once } from 'node:events';
import { chromium, webkit } from 'playwright';
import { createCommunityServer } from '../server/community.mjs';

const server = await createCommunityServer({ database: ':memory:' });
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}/`;
let checks = 0;
const check = (label, condition) => { assert.ok(condition, label); checks++; console.log(`PASS ${label}`); };
try {
  for (const [name, engine] of [['Chromium', chromium], ['WebKit', webkit]]) {
    const browser = await engine.launch();
    try {
      const context = await browser.newContext();
      await context.route('**/js/community-config.js*', route => route.fulfill({
        contentType: 'text/javascript', body: "export const COMMUNITY_API='';export const COMMUNITY_PROVIDER='node';",
      }));
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('dialog', () => { throw new Error('Native dialog is forbidden'); });
      for (const width of [320, 390, 768, 1280]) {
        await page.setViewportSize({ width, height: 844 });
        for (const path of ['', 'how-to-play.html', 'workshop.html', 'shop.html', 'premium-room.html', 'privacy.html', 'terms.html', 'mafia.html', 'mafia.html?mode=narrator']) {
          await page.goto(base + path);
          await page.locator('h1').first().waitFor();
          check(`${name} ${width} ${path || 'home'} fits`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          check(`${name} ${width} ${path || 'home'} has navigation`, await page.getByRole('navigation', { name: 'Main navigation', exact: true }).isVisible());
          check(`${name} ${width} ${path || 'home'} ornaments stay outside text`, await page.locator('.card').evaluateAll(cards => cards.every(card => {
            const style = getComputedStyle(card);
            const frame = getComputedStyle(card, '::after');
            const inset = parseFloat(frame.top);
            const border = parseFloat(frame.borderTopWidth);
            return frame.pointerEvents === 'none' && Number(frame.zIndex) < 0 &&
              ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].every(side => parseFloat(style[side]) >= inset + border);
          })));
        }
      }
      await page.goto(base);
      await page.locator('#btn-new').waitFor();
      check(`${name} new ornament assets load`, await page.evaluate(async () => {
        return (await Promise.all(['assets/gothic-frame.svg', 'assets/gothic-rule.svg'].map(async src => {
          const image = new Image();
          image.src = src;
          await image.decode();
          return image.naturalWidth > 0;
        }))).every(Boolean);
      }));
      const primary = page.locator('#btn-new');
      await primary.evaluate(el => { el.textContent = 'Create a gathering with extraordinarily long character names'; });
      check(`${name} long button labels wrap without clipping`, await primary.evaluate(el => el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight));
      await primary.evaluate(el => { el.textContent = 'Create a new game'; });
      check(`${name} host card has exactly two primary choices`, await page.locator('.landing-actions > .card.gold button, .landing-actions > .card.gold a.btn').count() === 2);
      await page.fill('#join-code', 'ABCD2345');
      await page.click('[data-act="join"]');
      await page.waitForURL('**/premium-room.html?room=ABCD2345');
      check(`${name} single join routes premium code`, page.url().includes('premium-room.html'));
      await page.goto(base + 'how-to-play.html');
      const tree = await page.locator('main').ariaSnapshot();
      const intro = 'A mystery night with friends. One host narrates; everyone reads, discusses and votes.';
      check(`${name} help introduction read once`, tree.split(intro).length === 2);
      check(`${name} host guide initially collapsed`, await page.locator('details[open]').count() === 0);
      await page.goto(base + 'mafia.html');
      check(`${name} Mafia entry creates no room`, await page.evaluate(() => !localStorage.getItem('gg-mafia-host-v1')));
      await page.goto(base + 'mafia.html?mode=narrator');
      check(`${name} narrator settings collapsed`, !await page.locator('.mafia-settings').evaluate(el => el.open));

      await page.goto(base);
      await page.locator('#btn-new').waitFor();
      await page.click('#btn-new');
      await page.click('[data-act="home"]');
      await page.click('#btn-new');
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      check(`${name} cancellation focused by default`, await page.locator('[data-dialog-cancel]').evaluate(el => el === document.activeElement));
      await page.keyboard.press('Shift+Tab');
      check(`${name} focus stays inside modal`, await dialog.evaluate(el => el.contains(document.activeElement)));
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      check(`${name} Escape restores focus and preserves room`, await page.locator('#btn-new').evaluate(el => el === document.activeElement) && await page.locator('#btn-resume').isVisible());
      await page.evaluate(async () => {
        const { confirmAction } = await import('./js/dialog.js?v=ui-refresh-v1');
        window.dialogResults = [];
        confirmAction('<b>Not HTML</b>', { title: 'First action' }).then(result => window.dialogResults.push(result));
        confirmAction('Second action', { title: 'Second action' }).then(result => window.dialogResults.push(result));
      });
      await dialog.waitFor();
      check(`${name} dialog escapes text`, await dialog.locator('#game-dialog-message').innerText() === '<b>Not HTML</b>' && await dialog.locator('#game-dialog-message b').count() === 0);
      await dialog.locator('[data-dialog-accept]').click();
      await page.getByRole('heading', { name: 'Second action', exact: true }).waitFor();
      check(`${name} confirmations queued one at a time`, await page.locator('dialog[open]').count() === 1);
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => window.dialogResults?.length === 2);
      check(`${name} promise resolves true or false`, await page.evaluate(() => JSON.stringify(window.dialogResults) === '[true,false]'));
      check(`${name} no UI exceptions`, errors.length === 0);
    } finally { await browser.close(); }
  }
  console.log(`${checks} UI refresh checks passed.`);
} finally { await new Promise(resolve => server.close(resolve)); }
