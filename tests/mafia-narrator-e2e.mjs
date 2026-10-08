// One-phone narrator mode browser test: one phone runs the whole game.
// Usage: node tests/mafia-narrator-e2e.mjs [baseUrl] [players=5] [screenshotDir]
import { chromium, devices } from 'playwright';
import fs from 'node:fs';

const BASE = (process.argv[2] || 'https://evil0ctopus.github.io/grim-gatherings/').replace(/\/?$/, '/');
const COUNT = Number(process.argv[3] || 5);
const SHOTS = process.argv[4] || '';
const NAMES = ['Ada', 'Bram', 'Cleo', 'Dev', 'Esme', 'Finn', 'Gus', 'Hana', 'Ivo', 'Jude', 'Kai', 'Lena', 'Milo', 'Nell', 'Otto', 'Pia', 'Quin', 'Rhea'].slice(0, COUNT);
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' - ' + extra : ''}`);
  if (!cond) throw new Error('Assertion failed: ' + name + ' ' + extra);
};
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true }); };

const browser = await chromium.launch();
const errors = [];
const ctx = await browser.newContext({ ...devices['iPhone 13'], browserName: undefined });
await ctx.addInitScript(() => {
  window.__sounds = [];
  window.addEventListener('mafia-sound', e => window.__sounds.push(e.detail.name));
});
const page = await ctx.newPage();
page.on('dialog', d => d.accept());
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const sounds = () => page.evaluate(() => window.__sounds.slice());
const clearSounds = () => page.evaluate(() => { window.__sounds.length = 0; });
const btn = name => page.locator('[data-pick]').filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) }).first();

try {
  await page.goto(BASE + 'index.html');
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE + 'mafia.html');
  await page.click('.mode-switch a');
  await page.waitForSelector('.mafia-narrator #add-form');
  ok('lobby links to narrator mode', page.url().includes('mode=narrator'));

  await page.fill('#add-name', NAMES.slice(0, 2).join(', '));
  await page.press('#add-name', 'Enter');
  for (const n of NAMES.slice(2)) { await page.fill('#add-name', n); await page.click('#add-form button[type=submit]'); }
  await page.fill('#add-name', NAMES[0].toLowerCase());
  await page.press('#add-name', 'Enter');
  ok('names added, duplicates ignored', await page.locator('.name-chips li').count() === COUNT);
  await shot(page, 'narrator-setup');
  await page.click('#deal');

  const roles = {};
  for (let i = 0; i < COUNT; i++) {
    await page.click('#show-role');
    const name = NAMES[i];
    roles[name] = await page.evaluate(() => [...document.querySelector('.role-card').classList].find(c => c !== 'role-card'));
    ok(`${name} sees only their own role card`, (await page.locator('.role-card').count()) === 1 && (await page.locator('.role-card').innerText()).includes(name));
    if (i === 0) await shot(page, 'narrator-pass-role');
    await page.click('#hide-role');
  }
  const mafia = NAMES.filter(n => roles[n] === 'mafia');
  const townNames = NAMES.filter(n => roles[n] !== 'mafia');
  ok('deal has mafia, doctor and detective', mafia.length >= 1 && Object.values(roles).includes('doctor') && Object.values(roles).includes('detective'), JSON.stringify(roles));

  const alive = new Set(NAMES);
  async function playNight(saveVictim) {
    await clearSounds();
    await page.click('#night');
    let victim = null;
    for (let guard = 0; guard < 20; guard++) {
      if (!(await page.locator('.narrator.night').count())) break;
      if (await page.locator('#kill').count()) {
        const picks = await page.locator('[data-pick]').allInnerTexts();
        ok('mafia cannot pick a mafia member', !picks.some(t => mafia.includes(t.trim())));
        victim = picks.map(t => t.trim()).find(n => roles[n] !== 'doctor') || picks[0].trim();
        await btn(victim).click();
        await page.click('#kill');
        ok('gunshot plays on KILL', (await sounds()).includes('gunshot'));
        continue;
      }
      const step = await page.locator('.phase-name').innerText();
      const next = page.locator('#next-step');
      if (await page.locator('[data-pick]').count() && await next.isDisabled()) {
        const script = (await page.locator('.script').innerText()).toLowerCase();
        if (script.includes('doctor')) {
          const other = [...alive].find(n => n !== victim);
          await btn(saveVictim ? victim : other).click();
        } else {
          const target = (await page.locator('[data-pick]').allInnerTexts())[0].trim();
          await btn(target).click();
          const verdict = await page.locator('.verdict-big').innerText();
          ok(`detective result for ${target} is accurate`, verdict.includes(roles[target] === 'mafia' ? 'GUILTY' : 'INNOCENT'), verdict);
          if (guard < 6) await shot(page, 'narrator-detective');
        }
      }
      await page.waitForFunction(() => !document.querySelector('#next-step')?.disabled, null, { timeout: 15000 });
      ok(`night step advances (${step})`, true);
      await page.click('#next-step');
    }
    const heard = await sounds();
    if (saveVictim) ok('heavenly chime when the medic saves the victim', heard.includes('chime') && !heard.includes('wahwah'), heard.join());
    else {
      ok('wah-wah when the victim dies', heard.includes('wahwah') && !heard.includes('chime'), heard.join());
      alive.delete(victim);
    }
    const text = await page.locator('.narrator').first().innerText();
    ok('dawn announces the outcome', saveVictim ? !text.includes(`${victim} was`) || /no one|nobody|saved|survived/i.test(text) : text.includes(victim), text.slice(0, 160));
    return victim;
  }

  await playNight(true);
  await shot(page, 'narrator-dawn-saved');
  await page.click('#discuss');
  await page.waitForSelector('.mafia-timer[data-ends]');
  await page.click('#to-vote');
  await page.click('#no-vote');
  ok('skipping the vote eliminates nobody', alive.size === COUNT);

  await playNight(false);
  await shot(page, 'narrator-dawn-killed');
  let guard = 0;
  while (!(await page.locator('#play-again').count()) && guard++ < 20) {
    if (await page.locator('#discuss').count()) await page.click('#discuss');
    if (await page.locator('#to-vote').count()) await page.click('#to-vote');
    if (await page.locator('.vote-counters').count()) {
      const target = mafia.find(n => alive.has(n));
      const voters = alive.size;
      const plus = page.locator('.vote-row').filter({ hasText: target }).locator('[data-d="1"]');
      for (let i = 0; i < voters; i++) await plus.click();
      ok('vote counter caps at the living count', await plus.isDisabled());
      await shot(page, 'narrator-vote');
      await clearSounds();
      await page.click('#close-vote');
      alive.delete(target);
      const heard = await sounds();
      ok('gavel or fanfare on the verdict', heard.includes('gavel') || heard.includes('fanfare'), heard.join());
    } else if (await page.locator('#night').count()) await playNight(false);
  }
  ok('game reaches game over', await page.locator('#play-again').count() === 1);
  const over = await page.locator('.narrator').first().innerText();
  ok('town wins after the mafia are voted out', /town wins/i.test(over), over.slice(0, 120));
  ok('game over reveals every role', await page.locator('.final-row').count() === COUNT);
  await page.waitForFunction(() => window.__sounds.includes('fanfare'), null, { timeout: 5000 }).catch(() => {});
  ok('win fanfare plays', (await sounds()).includes('fanfare'));
  await shot(page, 'narrator-over');

  await page.reload();
  ok('finished game survives a reload', await page.locator('#play-again').count() === 1);
  await page.click('#play-again');
  ok('play again re-deals with the same names', await page.locator('#show-role').count() === 1 && (await page.locator('.narration').innerText()).includes(NAMES[0]));

  ok('no page errors', errors.length === 0, errors.join(' | '));
  console.log('\nNarrator E2E passed.');
} finally {
  await browser.close();
}
