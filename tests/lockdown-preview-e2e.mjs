import assert from 'node:assert/strict';
import { once } from 'node:events';
import { chromium, webkit } from 'playwright';
import { createLockdownPreviewServer } from '../tools/lockdown-preview-server.mjs';

const server = createLockdownPreviewServer();
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
try {
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${base}/tools/lockdown-preview.html`);
      await page.locator('#selection-status').filter({ hasText: '3-player edition selected' }).waitFor();
      for (let count = 3; count <= 12; count++) {
        await page.locator('#player-count').fill(String(count));
        assert.match(await page.locator('#selection-status').textContent(), new RegExp(`${count}-player edition selected`));
        assert.equal(await page.locator('.draft-character').count(), count);
        assert.equal(await page.locator('.draft-round').count(), 7);
        assert.equal(await page.locator('.draft-round h4').count(), count * 7);
        assert.equal(await page.locator('button, a[href*="room"]').count(), 0);
        await page.locator('#draft-reveal summary').click();
        assert.match(await page.locator('#draft-reveal').textContent(), /Author calls needed/);
      }
      await page.locator('#player-count').fill('13');
      assert.match(await page.locator('#selection-status').textContent(), /exactly 3 through 12/);
      assert.equal(await page.locator('.draft-character').count(), 0);
      await page.locator('#player-count').fill('8');
      assert.equal(await page.locator('.draft-character').count(), 8);
      assert.deepEqual(errors, []);
      assert.equal((await fetch(`${base}/README.md`)).status, 404);
      console.log('PASS: all ten editions, seven rounds, exact-count selection, draft-only gate and invalid-count recovery');
    } finally {
      await browser.close();
    }
  }
} finally {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
