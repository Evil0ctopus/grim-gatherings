import { chromium, devices } from 'playwright';
const URL = process.argv[2];
const b = await chromium.launch();
const h = await (await b.newContext()).newPage(); h.on('dialog', d => d.accept());
await h.goto(URL); await h.click('#btn-new');
for (const name of ['Sarah', 'Mike', 'Priya']) {
  await h.fill('#guest-name', name);
  await h.click('#add-guest');
}
await h.click('#use-sample'); await h.click('#open-lobby');
await h.waitForFunction(() => document.querySelector('#net')?.textContent === 'Live');
const room = (await h.textContent('#room-code')).trim();
const pctx = await b.newContext({ ...devices['Pixel 7'] }); const p = await pctx.newPage();
await p.goto(URL + '?room=' + room); await p.waitForSelector('#picker'); await p.click('button.pick >> nth=0'); await p.waitForSelector('#packet-name');
await h.click('#start-game'); await p.waitForSelector('#round-title');
const t0 = Date.now();
await pctx.setOffline(true); console.log('player offline');
await p.waitForTimeout(20000);
await h.click('#next-round'); console.log('host advanced to round 2 while player offline');
await pctx.setOffline(false); console.log('player back online');
await p.waitForFunction(() => document.querySelector('#round-title')?.textContent.includes('Round 2'), null, { timeout: 90000 });
console.log('PASS player recovered and got round 2, ' + ((Date.now() - t0) / 1000).toFixed(1) + 's after going offline; status=' + await p.textContent('#pstatus'));
await b.close();
