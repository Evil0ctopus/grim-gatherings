// End-to-end test: host and every selected player in separate browser contexts.
// Usage: node tests/e2e.mjs [url] [playerCount=4] [mysteryId=sample] [discloseKiller=false]
import { chromium, devices } from 'playwright';
import fs from 'node:fs';

const URL = process.argv[2] || 'https://evil0ctopus.github.io/grim-gatherings/';
const playerCount = Number(process.argv[3] || 4);
const mysteryId = process.argv[4] || 'sample';
let discloseKiller = process.argv[5] === 'true';
if (!Number.isInteger(playerCount) || playerCount < 3) throw new Error('Use at least three players for this integration test.');
const GUESTS = ['Sarah, loud, loves wine, always late', 'Mike, quiet, secretly competitive', 'Priya, theatrical, loves true crime', 'Tom, jokester'].slice(0, playerCount);
for (let i = 4; i < playerCount; i++) GUESTS.push(`Guest ${i + 1}, enjoys investigating`);
const PLAYERS = GUESTS.map(g => g.split(',')[0]);
const T = 45000;
const results = [];
const ok = (name, cond, extra = '') => { results.push({ name, pass: !!cond, extra }); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`); if (!cond) throw new Error('Assertion failed: ' + name + ' ' + extra); };
const t0 = Date.now();
const el = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';

const browser = await chromium.launch();
const logs = [];
async function mkPage(label, mobile) {
  const ctx = await browser.newContext(mobile ? { ...devices['iPhone 13'], browserName: undefined, reducedMotion: 'no-preference' } : { viewport: { width: 1280, height: 900 }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.effectLog = [];
    document.addEventListener('animationstart', event => {
      if (['envelope-open', 'chapter-enter', 'seal-stamp', 'truth-reveal'].includes(event.animationName)) {
        window.effectLog.push(event.animationName);
      }
    });
  });
  page.on('dialog', d => d.accept());
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${label}] ${m.text()}`); });
  page.on('pageerror', e => logs.push(`[${label}] PAGEERROR ${e.message}`));
  return page;
}

try {
  const host = await mkPage('host', false);
  await host.goto(URL, { waitUntil: 'load' });
  await host.click('#btn-new');
  for (const guest of GUESTS) {
    const [name, ...description] = guest.split(',');
    await host.fill('#guest-name', name.trim());
    await host.fill('#guest-desc', description.join(',').trim());
    await host.click('#add-guest');
  }
  ok('players can be added one at a time', await host.locator('.guest-item').count() === GUESTS.length);
  if (mysteryId === 'example') {
    await host.locator('[data-act="tab"][data-tab="paste"]').click();
    const example = JSON.parse(fs.readFileSync(new globalThis.URL('../examples/example-story.json', import.meta.url)));
    example.characters.forEach(c => { c.guest = ''; c.guestNote = ''; });
    await host.fill('#json', JSON.stringify(example));
    await host.click('#load-json');
  } else {
    await host.click(mysteryId === 'sample' ? '#use-sample' : `[data-act="use-starter"][data-id="${mysteryId}"]`);
  }
  await host.waitForSelector('#open-lobby');
  if (mysteryId !== 'example') ok('review displays the selected count-specific edition', (await host.textContent('#selected-edition')).includes(`${playerCount}-player edition`));
  await host.locator('[data-path="discloseKiller"]').setChecked(discloseKiller);
  ok('host built selected story & reached review', true, el());
  const initialAssignments = await host.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')).story.characters.map(c => c.guest));
  const movedPlayer = initialAssignments[1], displacedPlayer = initialAssignments[0];
  await host.locator('#guest-assignment-0').selectOption(movedPlayer);
  await host.locator('#guest-assignment-1').selectOption(displacedPlayer);
  const assigned = await host.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')).story.characters.map(c => c.guest));
  ok('host can reassign players from dropdowns without duplicate assignments', assigned[0] === movedPlayer && assigned[1] === displacedPlayer && new Set(assigned.filter(Boolean)).size === assigned.filter(Boolean).length);
  await host.click('#open-lobby');
  await host.waitForFunction(() => document.querySelector('#net')?.textContent === 'Live', null, { timeout: T });
  const room = (await host.textContent('#room-code')).trim();
  ok('host peer online, room code shown', /^[A-Z]{5}$/.test(room), `room ${room}, ${el()}`);
  ok('QR code rendered', await host.$('#qr svg') !== null);

  const S = await host.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')));
  const story = S.story;
  const names = Object.fromEntries(story.characters.map(c => [c.id, c.guest ? `${c.name} (${c.guest})` : c.name]));
  names.victim = story.victim.name;
  const fill = text => text.replace(/\{([A-Za-z0-9_-]+)\}/g, (m, key) => names[key] || m);
  if (mysteryId !== 'example') {
    ok('host selects the exact prewritten edition', story.edition?.playerCount === playerCount && story.edition?.family === mysteryId);
    ok('all edition characters are required', story.characters.every(c => c.optional === false));
  }
  ok('the selected cast gives every listed guest exactly one character',
    story.characters.length === playerCount &&
    new Set(story.characters.map(c => c.guest)).size === playerCount &&
    story.characters.every(c => GUESTS.some(g => g.split(',')[0] === c.guest)));
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
    await p.waitForFunction(() => window.effectLog.includes('envelope-open'), null, { timeout: T });
    ok(`${g} received an animated character invitation`, true);
    ok(`${g} sound starts enabled with a mute control`, await p.locator('[data-sound]').getAttribute('aria-pressed') === 'true');
    players[g] = p;
  }

  async function checkFiltering(label) {
    for (const g of PLAYERS) {
      const p = players[g], me = byGuest[g];
      const packet = await p.evaluate(() => window.__gg.view.packet);
      ok(`${label}: ${g} has no private story fields`, !['backstory','secrets','motive'].some(key => key in packet));
      ok(`${label}: ${g} murderer notification matches host setting`,
        discloseKiller ? packet.isKiller === (me.id === killer.id) : !('isKiller' in packet));
      if (mysteryId === 'blackwater-row') {
        const view = await p.evaluate(() => window.__gg.view);
        if (view.phase === 'lobby' || view.roundIndex < 4) {
          ok(`${label}: ${g} has no early identity or Mayor spoilers`,
            !/Benjamin|Barker|Mayor|Aldric|Thorne|imprison|wife/i.test(JSON.stringify(view)));
        } else {
          ok(`${label}: ${g} receives the final court document`,
            view.currentRound.narration.includes('BENJAMIN BARKER'));
        }
      }
    }
  }
  await checkFiltering('lobby');
  await host.locator('#host-game-settings > summary').click();
  const initialDisclosure = discloseKiller;
  for (const enabled of [!initialDisclosure, initialDisclosure]) {
    await host.locator('[data-disclose-killer]').setChecked(enabled);
    discloseKiller = enabled;
    for (const g of PLAYERS) {
      await players[g].waitForFunction(({ enabled, killer }) =>
        enabled ? window.__gg.view.packet.isKiller === killer : !('isKiller' in window.__gg.view.packet),
      { enabled, killer: byGuest[g].id === killer.id }, { timeout: T });
      ok(`${g} live murderer notification is shown only to the murderer`,
        await players[g].locator('#killer-notification').count() === Number(enabled && byGuest[g].id === killer.id));
    }
    ok('live disclosure setting is persistently saved',
      await host.evaluate(enabled => JSON.parse(localStorage.getItem('gg-host-v1')).story.discloseKiller === enabled, enabled));
  }

  await host.waitForFunction(n => document.querySelector('#conn-count')?.textContent.startsWith(n + '/'), PLAYERS.length, { timeout: T });
  ok('host sees all players connected', true, (await host.textContent('#conn-count')) + ', ' + el());
  const barHeights = Object.fromEntries(await Promise.all(PLAYERS.map(async g => [g, await players[g].locator('.statusbar').evaluate(el => el.getBoundingClientRect().height)])));

  async function expectRound(ri) {
    const title = story.rounds[ri].title;
    ok(`round ${ri + 1}: host narration resolves character names and matches the spoken chapter`,
      await host.locator('.card.blood .narration').innerText() === fill(story.rounds[ri].narration));
    if (mysteryId === 'blackwater-row') {
      ok(`round ${ri + 1}: hosting notes are separate and collapsed`,
        await host.locator('#hosting-notes').getAttribute('open') === null &&
        (await host.locator('#hosting-notes summary').innerText()).includes('do not read aloud'));
      ok(`round ${ri + 1}: full solution is absent from the host round screen`,
        !(await host.locator('#app').textContent()).includes(fill(story.solution.explanation)));
      if (ri < 4) {
        ok(`round ${ri + 1}: host read-aloud narration has no future identity or Mayor spoilers`,
          !/Benjamin|Barker|Mayor|Aldric|Thorne|imprison|wife/i.test(await host.locator('.card.blood .narration').innerText()));
      }
    }
    for (const g of PLAYERS) {
      const p = players[g], me = byGuest[g];
      await p.waitForFunction(t => document.querySelector('#round-title')?.textContent === t, title, { timeout: T });
      const clues = await p.textContent('#my-clues');
      const raw = await p.evaluate(() => JSON.stringify(window.__gg.view));
      ok(`round ${ri + 1}: ${g} has only previously released public evidence`,
        await p.evaluate(n => window.__gg.view.evidenceHistory.length === n, ri));
      ok(`round ${ri + 1}: ${g} receives the spoken host narration`,
        await p.evaluate(text => window.__gg.view.currentRound.narration === text, fill(story.rounds[ri].narration)));
      const publicClue = await p.locator('#my-clues .read-aloud-clue').textContent();
      const readAloud = await p.evaluate(() => window.__gg.view.packet.rounds.at(-1).readAloud);
      ok(`round ${ri + 1}: ${g} sees their unique read-aloud accusation`, readAloud.accuses === me.rounds[ri].readAloud.accuses && publicClue.includes(readAloud.text) && publicClue.includes(readAloud.targetName));
      if (mysteryId === 'blackwater-row' && ri > 0) {
        ok(`round ${ri + 1}: ${g} reads about a different character`,
          readAloud.accuses !== me.rounds[ri - 1].readAloud.accuses);
      }
      if (mysteryId === 'blackwater-row' && ri === 2) {
        ok(`${g} has read about all three other characters by Round 3`,
          new Set(me.rounds.slice(0, 3).map(round => round.readAloud.accuses)).size === 3);
      }
      ok(`round ${ri + 1}: ${g} sees no secret clue UI`, !clues.includes('private clues') && await p.locator('#my-secrets').count() === 0);
      const futureLeak = ri < story.rounds.length - 1 && raw.includes(JSON.stringify(fill(me.rounds[ri + 1].readAloud.text)).slice(1,-1));
      ok(`round ${ri + 1}: ${g} did not get future-round clues`, !futureLeak);
    }
    await checkFiltering(`round ${ri + 1}`);
  }

  await host.click('#start-game');
  await expectRound(0);
  ok('round 1 pushed to all phones', true, el());
  for (const g of PLAYERS) {
    await players[g].waitForFunction(() => window.effectLog.includes('chapter-enter'), null, { timeout: T });
    ok(`${g} saw a new-clue entrance`, true);
  }

  // Player refresh / rejoin
  const rp = players['Mike'];
  await rp.reload({ waitUntil: 'load' });
  await rp.waitForFunction(t => document.querySelector('#round-title')?.textContent === t, story.rounds[0].title, { timeout: T });
  ok('Mike refreshed and rejoined straight into his packet + round 1', (await rp.textContent('#packet-name')).trim() === byGuest['Mike'].name, el());
  ok('refresh did not replay character or chapter effects', await rp.evaluate(() => window.effectLog.length === 0));

  async function voteBetweenRounds(ri) {
    await host.click('#next-round');
    for (const g of PLAYERS) {
      const p = players[g], me = byGuest[g];
      await p.waitForSelector('#vote-list', { timeout: T });
      ok(`round ${ri + 1}: ${g} notebook adds the completed round`,
        await p.locator('#my-case .personal-evidence').count() === ri + 1 &&
        await p.locator('#evidence-history section').count() === ri + 1);
      ok(`round ${ri + 1}: ${g} notebook retains the full spoken narration`,
        await p.evaluate(({ri, text}) => window.__gg.view.evidenceHistory[ri].narration === text, {ri, text: fill(story.rounds[ri].narration)}));
      if (mysteryId === 'blackwater-row' && ri < 4) {
        ok(`round ${ri + 1}: ${g} voting notebook has no early identity or Mayor spoilers`,
          !/Benjamin|Barker|Mayor|Aldric|Thorne|imprison|wife/i.test(await p.evaluate(() => JSON.stringify(window.__gg.view))));
      }
      if (ri === 3 && mysteryId === 'sample') {
        ok(`round 4: ${g} receives the correction to Constance's earlier suspicion`,
          (await p.locator('#evidence-history').textContent()).includes('same decanter and survived'));
      }
      const target = story.characters.find(c => c.id !== me.id && (ri === 0 || c.id === killer.id)) ||
        story.characters.find(c => c.id !== me.id);
      await p.click(`.vote-btn[data-vote="${target.id}"]`);
      await p.waitForFunction(() => document.querySelector('#my-vote')?.textContent.includes('Your vote is in'), null, { timeout: T });
    }
    await host.waitForFunction(n => document.querySelector('#votes-in b')?.textContent === String(n), PLAYERS.length, { timeout: T });
    for (const g of PLAYERS) {
      await players[g].waitForFunction(total => window.__gg.view.voteSummary.total === total, PLAYERS.length * (ri + 1), { timeout: T });
      const height = await players[g].locator('.statusbar').evaluate(el => el.getBoundingClientRect().height);
      ok(`${g} vote history does not enlarge the room bar`, Math.abs(height - barHeights[g]) < 0.1);
    }
    ok(`round ${ri + 1} votes synced to every player`, true);
    await host.click('#next-round');
  }

  await voteBetweenRounds(0);
  await expectRound(1);
  ok('round 2 pushed', true, el());

  // Host refresh — state must survive and players must reconnect
  await host.reload({ waitUntil: 'load' });
  await host.waitForFunction(t => document.querySelector('#round-title')?.textContent === t, story.rounds[1].title, { timeout: T });
  ok('host refresh kept game state (still round 2)', true, el());
  if (mysteryId !== 'example') {
    ok('refresh keeps the same locked edition and scripts',
      await host.evaluate(story => {
        const current = JSON.parse(localStorage.getItem('gg-host-v1')).story;
        return current.edition.id === story.edition.id && JSON.stringify(current.characters) === JSON.stringify(story.characters);
      }, story));
  }
  await host.waitForFunction(() => document.querySelector('#net')?.textContent === 'Live', null, { timeout: 90000 });
  ok('host re-opened same room id after refresh', true, el());
  await host.waitForFunction(n => document.querySelector('#conn-count')?.textContent.startsWith(n + '/'), PLAYERS.length, { timeout: 90000 });
  ok('players auto-reconnected after host refresh', true, el());

  await voteBetweenRounds(1);
  await expectRound(2);
  ok('round 3 pushed after host refresh', true, el());
  for (let ri = 2; ri < story.rounds.length - 1; ri++) {
    await voteBetweenRounds(ri);
    await expectRound(ri + 1);
    for (const g of PLAYERS) {
      ok(`round ${ri + 2}: ${g} has a growing personal evidence history`,
        await players[g].locator('#my-case .personal-evidence').count() === ri + 1);
    }
  }

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
    await players[g].waitForFunction(() => window.effectLog.includes('seal-stamp'), null, { timeout: T });
  }
  await host.waitForFunction(n => document.querySelector('#votes-in b')?.textContent === String(n), PLAYERS.length, { timeout: T });
  ok('host live tally shows all votes', true, (await host.textContent('#votes-in')).trim());
  for (const g of PLAYERS) {
    await players[g].waitForFunction(total => window.__gg.view.voteSummary.total === total, PLAYERS.length * story.rounds.length, { timeout: T });
    ok(`${g} retains every round of vote history`, await players[g].evaluate(n => window.__gg.view.voteSummary.rounds.length === n, story.rounds.length));
    ok(`${g} retains every round of public evidence`,
      await players[g].locator('#my-case .personal-evidence').count() === story.rounds.length);
  }
  await host.click('#reveal-btn');
  for (const g of PLAYERS) {
    await players[g].waitForSelector('#reveal-killer', { timeout: T });
    await players[g].waitForFunction(() => window.effectLog.includes('truth-reveal'), null, { timeout: T });
    const k = (await players[g].textContent('#reveal-killer')).trim();
    ok(`${g} sees reveal`, k === killer.name, k);
    ok(`${g} reveal identifies murderer regardless of notification setting`,
      await players[g].evaluate(id => window.__gg.view.packet.isKiller === (window.__gg.view.me === id), killer.id));
  }
  const largestReveal = Math.max(...await Promise.all(PLAYERS.map(g =>
    players[g].evaluate(() => new TextEncoder().encode(JSON.stringify(window.__gg.view)).length))));
  if (mysteryId === 'sample') {
    ok('chunked transport delivers a reveal larger than the JSON channel limit', largestReveal > 16300, `${largestReveal} bytes`);
  }
  ok('no growing packet was rejected by the transport', !logs.some(message => message.includes('Message too big')));
  ok('host reveal shows killer', (await host.textContent('#killer-name')).trim() === killer.name, `${killer.name} (${killer.guest}), ${el()}`);
  const exiting = players[PLAYERS[0]];
  await exiting.click('#leave-game');
  await exiting.waitForSelector('#btn-new', { timeout: T });
  ok('player can leave the completed game and return home', true);
  const remaining = PLAYERS.slice(1);
  for (const g of remaining) {
    ok('leaving preserves completed vote history for ' + g, await players[g].evaluate(total => window.__gg.view.voteSummary.total === total, PLAYERS.length * story.rounds.length));
  }
  await host.locator('[data-act="end"]').first().click();
  await host.waitForSelector('#btn-new', { timeout: T });
  for (const g of remaining) {
    await players[g].getByRole('button', { name: 'Return home', exact: true }).waitFor({ timeout: T });
    await players[g].click('#leave-game');
    await players[g].waitForSelector('#btn-new', { timeout: T });
  }
  ok('ending the gathering lets host and remaining players return home', true);
} catch (e) {
  console.log('ERROR', e.message);
  process.exitCode = 1;
} finally {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed in ${el()} against ${URL}`);
  if (logs.length) console.log('Console warnings/errors:\n' + logs.slice(0, 40).join('\n'));
  await browser.close();
}
