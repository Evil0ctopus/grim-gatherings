// End-to-end test: host + 3 players in separate browser contexts, full game against a URL.
// Usage: node tests/e2e.mjs [url]   (default: live GitHub Pages URL)
import { chromium, devices } from 'playwright';

const URL = process.argv[2] || 'https://evil0ctopus.github.io/grim-gatherings/';
const GUESTS = ['Sarah, loud, loves wine, always late', 'Mike, quiet, secretly competitive', 'Priya, theatrical, loves true crime', 'Tom, jokester'];
const PLAYERS = ['Sarah', 'Mike', 'Priya'];
const T = 45000;
const results = [];
const ok = (name, cond, extra = '') => { results.push({ name, pass: !!cond, extra }); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`); if (!cond) throw new Error('Assertion failed: ' + name + ' ' + extra); };
const t0 = Date.now();
const el = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';

const browser = await chromium.launch();
const logs = [];
async function mkPage(label, mobile) {
  const ctx = await browser.newContext(mobile ? { ...devices['iPhone 13'], browserName: undefined } : { viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.on('dialog', d => d.accept());
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${label}] ${m.text()}`); });
  page.on('pageerror', e => logs.push(`[${label}] PAGEERROR ${e.message}`));
  return page;
}

try {
  const host = await mkPage('host', false);
  await host.goto(URL, { waitUntil: 'load' });
  await host.click('#btn-new');
  await host.fill('#guests', GUESTS.join('\n'));
  await host.click('#use-sample');
  await host.waitForSelector('#open-lobby');
  ok('host built sample story & reached review', true, el());
  await host.click('#open-lobby');
  await host.waitForFunction(() => document.querySelector('#net')?.textContent === 'Live', null, { timeout: T });
  const room = (await host.textContent('#room-code')).trim();
  ok('host peer online, room code shown', /^[A-Z]{5}$/.test(room), `room ${room}, ${el()}`);
  ok('QR code rendered', await host.$('#qr svg') !== null);

  const S = await host.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')));
  const story = S.story;
  const byGuest = Object.fromEntries(story.characters.map(c => [c.guest, c]));
  const killer = story.characters.find(c => c.id === story.solution.killerId);

  const players = {};
  for (const g of PLAYERS) {
    const p = await mkPage(g, true);
    await p.goto(URL + '?room=' + room, { waitUntil: 'load' });
    await p.waitForSelector('#picker', { timeout: T });
    await p.click(`button.pick:has(.g:text-is("${g}"))`);
    await p.waitForSelector('#packet-name', { timeout: T });
    const name = (await p.textContent('#packet-name')).trim();
    ok(`${g} joined and got own packet`, name === byGuest[g].name, `${name}, ${el()}`);
    players[g] = p;
  }

  async function checkFiltering(label) {
    for (const g of PLAYERS) {
      const p = players[g], me = byGuest[g];
      const raw = await p.evaluate(() => JSON.stringify(window.__gg?.view || {}));
      const text = await p.evaluate(() => document.body.innerText);
      const others = story.characters.filter(c => c.id !== me.id);
      const leaks = others.filter(c => raw.includes(c.backstory.slice(0, 50)) || c.secrets.some(s => raw.includes(s.slice(0, 40))) || raw.includes(c.motive.slice(0, 40)));
      ok(`${label}: ${g} sees own secrets`, text.includes(me.secrets[0].slice(0, 40)));
      ok(`${label}: ${g} received NO other players' secrets/backstory/motive`, leaks.length === 0, leaks.map(c => c.name).join(', '));
    }
  }
  await checkFiltering('lobby');

  await host.waitForFunction(n => document.querySelector('#conn-count')?.textContent.startsWith(n + '/'), PLAYERS.length, { timeout: T });
  ok('host sees all players connected', true, (await host.textContent('#conn-count')) + ', ' + el());

  async function expectRound(ri) {
    const title = story.rounds[ri].title;
    for (const g of PLAYERS) {
      const p = players[g], me = byGuest[g];
      await p.waitForFunction(t => document.querySelector('#round-title')?.textContent === t, title, { timeout: T });
      const clues = await p.textContent('#my-clues');
      const raw = await p.evaluate(() => JSON.stringify(window.__gg.view));
      const firstClue = (me.rounds[ri].clues[0] || '').replace(/\{[a-z0-9_-]+\}/gi, '').slice(0, 30);
      const otherClueLeak = story.characters.filter(c => c.id !== me.id).some(c => c.rounds[ri].clues.some(cl => { const s = cl.replace(/\{[a-z0-9_-]+\}.*/i, ''); return s.length > 25 && raw.includes(s.slice(0, 40)); }));
      ok(`round ${ri + 1}: ${g} got round + own clues`, clues.includes(firstClue.split(/[{]/)[0].trim().slice(0, 25)));
      ok(`round ${ri + 1}: ${g} got no other players' clues`, !otherClueLeak);
      const futureLeak = raw.includes(JSON.stringify(me.rounds[ri + 1]?.clues?.[0] || '###none###').slice(1, 40));
      ok(`round ${ri + 1}: ${g} did not get future-round clues`, !futureLeak);
    }
  }

  await host.click('#start-game');
  await expectRound(0);
  ok('round 1 pushed to all phones', true, el());

  // Player refresh / rejoin
  const rp = players['Mike'];
  await rp.reload({ waitUntil: 'load' });
  await rp.waitForFunction(t => document.querySelector('#round-title')?.textContent === t, story.rounds[0].title, { timeout: T });
  ok('Mike refreshed and rejoined straight into his packet + round 1', (await rp.textContent('#packet-name')).trim() === byGuest['Mike'].name, el());

  await host.click('#next-round');
  await expectRound(1);
  ok('round 2 pushed', true, el());

  // Host refresh — state must survive and players must reconnect
  await host.reload({ waitUntil: 'load' });
  await host.waitForFunction(t => document.querySelector('#round-title')?.textContent === t, story.rounds[1].title, { timeout: T });
  ok('host refresh kept game state (still round 2)', true, el());
  await host.waitForFunction(() => document.querySelector('#net')?.textContent === 'Live', null, { timeout: 90000 });
  ok('host re-opened same room id after refresh', true, el());
  await host.waitForFunction(n => document.querySelector('#conn-count')?.textContent.startsWith(n + '/'), PLAYERS.length, { timeout: 90000 });
  ok('players auto-reconnected after host refresh', true, el());

  await host.click('#next-round');
  await expectRound(2);
  ok('round 3 pushed after host refresh', true, el());

  await host.click('#next-round'); // -> vote
  for (const g of PLAYERS) await players[g].waitForSelector('#vote-list', { timeout: T });
  ok('voting opened on all phones', true, el());
  const votes = {};
  for (const g of PLAYERS) {
    const me = byGuest[g];
    const target = me.id === killer.id ? story.characters.find(c => c.id !== me.id).id : killer.id;
    await players[g].click(`.vote-btn[data-vote="${target}"]`);
    votes[g] = target;
    await players[g].waitForFunction(() => document.querySelector('#my-vote')?.textContent.includes('Your vote is in'), null, { timeout: T });
  }
  await host.waitForFunction(n => document.querySelector('#votes-in b')?.textContent === String(n), PLAYERS.length, { timeout: T });
  ok('host live tally shows all votes', true, (await host.textContent('#votes-in')).trim());

  await host.click('#reveal-btn');
  for (const g of PLAYERS) {
    await players[g].waitForSelector('#reveal-killer', { timeout: T });
    const k = (await players[g].textContent('#reveal-killer')).trim();
    ok(`${g} sees reveal`, k === killer.name, k);
  }
  ok('host reveal shows killer', (await host.textContent('#killer-name')).trim() === killer.name, `${killer.name} (${killer.guest}), ${el()}`);
} catch (e) {
  console.log('ERROR', e.message);
  process.exitCode = 1;
} finally {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed in ${el()} against ${URL}`);
  if (logs.length) console.log('Console warnings/errors:\n' + logs.slice(0, 40).join('\n'));
  await browser.close();
}
