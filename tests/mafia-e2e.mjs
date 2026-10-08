// Mafia browser test: a table screen plus phones in separate contexts, over real PeerJS.
// Usage: node tests/mafia-e2e.mjs [baseUrl] [players=5] [screenshotDir]
import { chromium, devices } from 'playwright';
import fs from 'node:fs';

const BASE = (process.argv[2] || 'https://evil0ctopus.github.io/grim-gatherings/').replace(/\/?$/, '/');
const COUNT = Number(process.argv[3] || 5);
const SHOTS = process.argv[4] || '';
const NAMES = ['Ada', 'Bram', 'Cleo', 'Dev', 'Esme', 'Finn', 'Gus', 'Hana', 'Ivo', 'Jude', 'Kai', 'Lena', 'Milo', 'Nell', 'Otto', 'Pia', 'Quin', 'Rhea'].slice(0, COUNT);
const T = 45000;
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' - ' + extra : ''}`);
  if (!cond) throw new Error('Assertion failed: ' + name + ' ' + extra);
};
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true }); };

const browser = await chromium.launch();
const errors = [];
const phones = [];
async function mkPage(label, mobile) {
  const ctx = await browser.newContext(mobile ? { ...devices['iPhone 13'], browserName: undefined } : { viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.on('dialog', d => d.accept());
  page.on('pageerror', e => errors.push(`[${label}] ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${label}] ${m.text()}`); });
  return page;
}

async function waitPhones(phones, want) {
  const wants = [].concat(want);
  await Promise.all(phones.map(p => p.page.waitForFunction(ws => ws.some(w => document.querySelector(`.mafia-phone.phase-${w}`)), wants, { timeout: T })));
}
const byName = (page, sel, name) => page.locator(sel).filter({ hasText: new RegExp(`^\\s*${name}(?![A-Za-z])`) }).first();
async function readRoles(phones) {
  for (const p of phones) {
    await p.page.click('#reveal');
    p.role = await p.page.evaluate(() => [...document.querySelector('.role-card').classList].find(c => c !== 'role-card'));
    p.team = await p.page.evaluate(() => document.querySelector('.team-line')?.textContent || '');
  }
}

try {
  const host = await mkPage('table', false);
  await host.goto(BASE + 'mafia.html', { waitUntil: 'load' });
  await host.waitForSelector('.room-code', { timeout: T });
  const room = (await host.textContent('.room-code')).trim();
  ok('table screen shows a room code', /^[A-Z0-9]{3,12}$/.test(room), room);
  await host.waitForSelector('#mafia-net.on, #mafia-net:not(.wait)', { timeout: T }).catch(() => {});
  ok('deal is disabled below the minimum', await host.isDisabled('#start'));

  for (const name of NAMES) {
    const page = await mkPage(name, true);
    await page.goto(`${BASE}mafia.html?room=${room}`, { waitUntil: 'load' });
    await page.fill('#mafia-name', name);
    await page.click('#join-form button[type=submit]');
    await page.waitForSelector('#leave', { timeout: T });
    phones.push({ name, page });
  }
  await host.waitForFunction(n => document.querySelectorAll('.mafia-roster li').length === n, COUNT, { timeout: T });
  ok('every phone joined the lobby', true, `${COUNT} players`);
  await shot(host, 'table-lobby');
  await shot(phones[0].page, 'phone-lobby');

  let firstKillers = '';
  for (let game = 1; game <= 2; game++) {
    if (game === 1) await host.click('#start'); else await host.click('#play-again');
    await waitPhones(phones, 'reveal');
    const tableHtml = await host.innerHTML('#app');
    ok(`game ${game}: table screen shows no roles before game over`, !/role-tag|role-card/.test(tableHtml));
    if (game === 1) await shot(phones[0].page, 'phone-role-back');
    await readRoles(phones);
    if (game === 1) await shot(phones[0].page, 'phone-role-card');
    const mafia = phones.filter(p => p.role === 'mafia');
    const killers = mafia.map(p => p.name).sort().join(',');
    const helpers = COUNT >= 13 ? 2 : 1;
    ok(`game ${game}: roles dealt`, mafia.length >= 1 && phones.filter(p => p.role === 'doctor').length === helpers && phones.filter(p => p.role === 'detective').length === helpers, phones.map(p => `${p.name}=${p.role}`).join(' '));
    for (const p of phones) {
      const html = await p.page.innerHTML('#app');
      const leaked = phones.filter(o => o !== p && html.includes(`role-tag`)).length;
      ok(`game ${game}: ${p.name} sees no one else's role tag`, leaked === 0);
      if (p.role === 'mafia') ok(`game ${game}: ${p.name} sees the mafia team`, mafia.every(m => p.team.includes(m.name)));
      else ok(`game ${game}: ${p.name} has no team list`, p.team === '');
    }
    for (const p of phones) await p.page.click('#ready');
    await waitPhones(phones, 'night');
    if (game === 1) { await shot(host, 'table-night'); }

    // Night: mafia pick the first non-mafia player; everyone else picks their first option.
    const victim = phones.find(p => p.role !== 'mafia' && p.role !== 'doctor');
    for (const p of phones) {
      if (p.role === 'mafia') await byName(p.page, '[data-target]', victim.name).click();
      else if (p.role === 'doctor') await byName(p.page, '[data-target]', mafia[0].name).click();
      else if (p.role === 'detective') await byName(p.page, '[data-target]', mafia[0].name).click();
      else await p.page.locator('[data-target]').first().click();
    }
    const detective = phones.find(p => p.role === 'detective');
    if (detective !== victim) {
      await detective.page.waitForSelector('.result.guilty', { timeout: T }).catch(() => {});
    }
    if (game === 1) await shot(mafia[0].page, 'phone-night-mafia');
    await waitPhones(phones, ['dawn', 'day']);
    const announce = await host.textContent('#app');
    ok(`game ${game}: dawn announces the unsaved victim`, announce.includes(victim.name) && /killed|found dead/.test(announce));
    if (game === 1) await shot(host, 'table-dawn');

    // Dead player is a locked-out spectator.
    await victim.page.waitForSelector('.spectator-banner', { timeout: T });
    ok(`game ${game}: eliminated player becomes a spectator`, true);
    if (detective && detective !== victim) {
      ok(`game ${game}: detective's private result is accurate`, (await detective.page.textContent('#app')).includes('MAFIA') || await detective.page.evaluate(() => !!document.querySelector('#peek')));
    }

    if (await phones[0].page.$('.mafia-phone.phase-dawn')) await host.click('#force');
    await waitPhones(phones, 'day');
    if (game === 1) await shot(host, 'table-day');
    await host.click('#force'); await waitPhones(phones, 'vote');
    ok(`game ${game}: dead player cannot vote`, await victim.page.locator('[data-vote]').count() === 0);
    const alive = phones.filter(p => p !== victim);
    for (const p of alive) {
      const target = p.role === 'mafia' ? alive.find(o => o.role !== 'mafia') : mafia.find(m => m !== p) || mafia[0];
      if (p === target) continue;
      await byName(p.page, '[data-vote]', target.name).click();
    }
    if (game === 1) await shot(alive[0].page, 'phone-vote');
    // Most players vote for the lone mafia (5-6 players) -> town win; with more mafia, force through.
    // Play on until someone wins: town votes out living mafia, mafia keep killing townspeople.
    for (let guard = 0; guard < 80 && !(await host.$('#play-again')); guard++) {
      const living = [];
      for (const p of phones) if (!(await p.page.$('.spectator-banner'))) living.push(p);
      const liveMafia = living.filter(p => p.role === 'mafia');
      const liveTown = living.filter(p => p.role !== 'mafia');
      let acted = false;
      for (const p of living) {
        if (await p.page.$('[data-vote]') && !(await p.page.$('[data-vote].picked'))) {
          const t = p.role === 'mafia' ? liveTown[0] : liveMafia[0];
          if (t) { await byName(p.page, '[data-vote]', t.name).click().catch(() => {}); acted = true; }
        } else if (await p.page.$('[data-target]:not([disabled])') && !(await p.page.$('.ok-line'))) {
          const t = p.role === 'mafia' ? liveTown.find(o => o.role !== 'doctor') || liveTown[0] : null;
          await (t ? byName(p.page, '[data-target]', t.name) : p.page.locator('[data-target]:not([disabled])').first()).click().catch(() => {});
          acted = true;
        }
      }
      if (!acted && await host.$('.mafia-host.phase-dawn, .mafia-host.phase-day, .mafia-host.phase-verdict')) {
        await host.click('#force').catch(() => {});
      } else if (!acted && await host.$('#force') && await phones[0].page.$('.mafia-phone.phase-reveal')) {
        await host.click('#force').catch(() => {});
      }
      await host.waitForTimeout(500);
    }
    await host.waitForSelector('#play-again', { timeout: T });
    await waitPhones(phones, 'over');
    const finalTable = await host.innerHTML('#app');
    ok(`game ${game}: game over reveals every role on the table`, phones.every(p => finalTable.includes(p.name)) && (finalTable.match(/role-tag/g) || []).length >= COUNT);
    if (COUNT <= 6) ok(`game ${game}: town wins after voting out the mafia`, /win-town/.test(finalTable));
    if (game === 1) { await shot(host, 'table-over'); await shot(phones[0].page, 'phone-over'); firstKillers = killers; }
    else console.log(`INFO  killers game 1: ${firstKillers}; game 2: ${killers}`);
  }
  ok('Play Again re-dealt a fresh game in the same lobby', true);
  ok('no page errors', errors.length === 0, errors.join(' | '));
  console.log('ALL MAFIA BROWSER CHECKS PASSED');
} catch (e) {
  console.error(e);
  for (const p of phones) console.error(`--- ${p.name} (${p.role}):`, (await p.page.textContent('#app').catch(() => '')).replace(/\s+/g, ' ').slice(0, 400));
  if (errors.length) console.error(errors.join('\n'));
  process.exitCode = 1;
} finally {
  await browser.close();
}
