// Uses real PeerJS connections with deliberate interruption of the browser lifecycle and messages.
// Usage: node tests/reconnect.mjs [url] [chromium|webkit]
import { chromium, webkit, devices } from 'playwright';
import assert from 'node:assert/strict';

const url = process.argv[2] || 'http://127.0.0.1:8132/';
const engine = process.argv[3] || 'chromium';
if (!['chromium', 'webkit'].includes(engine)) throw new Error('Choose chromium or webkit.');
const browser = await (engine === 'webkit' ? webkit : chromium).launch();
const timeout = 90000;
const errors = [];
const connectionLogs = [];
let checks = 0;
const check = (name, condition) => { assert.ok(condition, name); console.log(`PASS ${name}`); checks++; };

async function pageIn(context) {
  const page = await context.newPage();
  page.on('dialog', dialog => dialog.accept());
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (['warning', 'error'].includes(message.type())) connectionLogs.push(message.text());
  });
  return page;
}

async function game(host, waitingPhone = null) {
  await host.goto(url);
  await host.click('#btn-new');
  for (const name of ['Josh', 'Melissa', 'Xander guest', 'Lydia guest']) {
    await host.fill('#guest-name', name);
    await host.click('#add-guest');
  }
  await host.click('[data-act="use-starter"][data-id="blackwater-row"]');
  if (waitingPhone) {
    const room = await host.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')).room);
    await waitingPhone.goto(`${url}?room=${room}`);
    await waitingPhone.waitForFunction(() => document.querySelector('#pstatus')?.textContent === 'waiting for host…', null, { timeout });
    check('joining before the host opens the room gives a waiting message, not a permanent hang',
      (await waitingPhone.locator('#connection-help').innerText()).includes('Check the code'));
  }
  await host.click('#open-lobby');
  await host.waitForFunction(() => document.querySelector('#net')?.textContent === 'Live', null, { timeout });
  if (waitingPhone) {
    await waitingPhone.waitForSelector('#picker', { timeout });
    check('a waiting phone automatically joins when the host opens the room', true);
  }
  return (await host.locator('#room-code').innerText()).trim();
}

async function join(page, room, id) {
  await page.goto(`${url}?room=${room}`);
  await page.waitForSelector('#picker', { timeout });
  await page.click(`[data-claim="${id}"]`);
  await page.waitForFunction(id => window.__gg?.view.me === id && document.querySelector('#pstatus')?.textContent === 'connected', id, { timeout });
}

async function restored(page, id = 'xander', roundIndex = 2, phase = 'round') {
  await page.waitForFunction(({ id, roundIndex, phase }) =>
    window.__gg?.view.me === id && window.__gg.view.roundIndex === roundIndex &&
    window.__gg.view.phase === phase && document.querySelector('#pstatus')?.textContent === 'connected',
  { id, roundIndex, phase }, { timeout });
}

async function lifecycle(page, event, persisted = true) {
  await page.evaluate(({ event, persisted }) => {
    window.dispatchEvent(new PageTransitionEvent(event, { persisted }));
  }, { event, persisted });
}

try {
  const capabilityContext = await browser.newContext();
  const capabilityPage = await capabilityContext.newPage();
  const supportsRTC = await capabilityPage.evaluate(() => typeof RTCPeerConnection === 'function');
  await capabilityContext.close();
  if (!supportsRTC) throw new Error(`${engine} on this platform has no WebRTC implementation. Run the real transport suite in Chromium or WebKit on a platform with WebRTC support.`);
  const hostContext = await browser.newContext();
  const phoneContext = await browser.newContext({ ...devices['iPhone 13'], browserName: undefined });
  const host = await pageIn(hostContext), phone = await pageIn(phoneContext);
  const room = await game(host, phone);
  await join(phone, room, 'xander');
  const identity = await phone.evaluate(room => JSON.parse(localStorage.getItem(`gg-player-v1-${room}`)), room);
  await host.click('#start-game');
  for (let round = 0; round < 2; round++) {
    await host.click('#next-round');
    await phone.waitForSelector('#vote-list');
    await phone.click('[data-vote="marla"]');
    await phone.waitForFunction(() => window.__gg.view.vote?.myVote === 'marla');
    await host.click('#next-round');
    await restored(phone, 'xander', round + 1);
  }
  const before = await host.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')));
  check('reached the reported failure point: Round 3', before.roundIndex === 2);

  await lifecycle(phone, 'pagehide');
  check('paused phone exposes a reconnect status and disables actions', await phone.locator('#pstatus').innerText() === 'reconnecting…');
  await lifecycle(phone, 'pageshow');
  await restored(phone);
  check('iPhone-style page restoration returns directly to Xander in Round 3',
    (await phone.locator('#my-clues').innerText()).includes('Marla Quinn'));
  check('restoration retains the original player token',
    await phone.evaluate(({ room, token }) => JSON.parse(localStorage.getItem(`gg-player-v1-${room}`)).token === token, { room, token: identity.token }));

  await phone.reload();
  await restored(phone);
  check('closing/reloading the player page restores the active character', true);

  const duplicate = await pageIn(phoneContext);
  await duplicate.goto(`${url}?room=${room}`);
  await restored(duplicate);
  await phone.waitForFunction(() => document.querySelector('#connection-help')?.textContent.includes('another tab'), null, { timeout });
  await phone.waitForTimeout(6000);
  check('a second tab takes over without old/new tabs fighting over the character',
    await duplicate.locator('#pstatus').innerText() === 'connected' && await phone.locator('#pstatus').innerText() === 'offline');
  await phone.click('#reconnect-game');
  await restored(phone);
  await duplicate.waitForFunction(() => document.querySelector('#connection-help')?.textContent.includes('another tab'), null, { timeout });
  await duplicate.click('#leave-game');
  await duplicate.waitForSelector('#btn-new');
  await phone.reload();
  await restored(phone);
  check('leaving an obsolete tab does not erase the active tab\'s saved identity',
    await phone.evaluate(({ room, token }) => JSON.parse(localStorage.getItem(`gg-player-v1-${room}`)).token === token, { room, token: identity.token }));
  await duplicate.close();
  check('manual retry explicitly takes the character back from another tab', true);

  await host.click('[data-act="release"][data-id="xander"]');
  await phone.waitForSelector('#picker');
  await phone.click('[data-claim="xander"]');
  await restored(phone);
  check('host release and same-phone reclaim work during Round 3', true);

  const lateContext = await browser.newContext({ ...devices['iPhone 13'], browserName: undefined });
  const late = await pageIn(lateContext);
  await join(late, room, 'marla');
  await restored(late, 'marla');
  check('a previously unconnected phone can join an already-running third round',
    await late.locator('#my-case .personal-evidence').count() === 2);

  await host.click('#next-round');
  await restored(phone, 'xander', 2, 'vote');
  await phone.click('[data-vote="jasper"]');
  await phone.waitForFunction(() => window.__gg.view.vote.myVote === 'jasper');
  const savedVotes = await host.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('gg-host-v1')).roundVotes));
  await host.click('[data-act="release"][data-id="xander"]');
  await phone.waitForSelector('#picker');
  await phone.click('[data-claim="xander"]');
  await restored(phone, 'xander', 2, 'vote');
  check('release and reclaim preserve the current ballot',
    await phone.evaluate(() => window.__gg.view.vote.myVote === 'jasper'));

  await host.click('[data-act="reconnect-host"]');
  await host.waitForFunction(() => document.querySelector('#net')?.textContent === 'Live', null, { timeout });
  await host.waitForFunction(() => document.querySelector('#conn-count')?.textContent.startsWith('2/'), null, { timeout });
  await restored(phone, 'xander', 2, 'vote');
  await restored(late, 'marla', 2, 'vote');
  check('host room recovery keeps the room code, characters, phase and all ballots',
    await host.evaluate(({ room, votes }) => {
      const state = JSON.parse(localStorage.getItem('gg-host-v1'));
      return state.room === room && state.roundIndex === 2 && state.phase === 'vote' &&
        state.claims.xander && JSON.stringify(state.roundVotes) === votes;
    }, { room, votes: savedVotes }));

  await lifecycle(host, 'pagehide');
  await lifecycle(host, 'pageshow');
  await host.waitForFunction(() => document.querySelector('#net')?.textContent === 'Live', null, { timeout });
  await host.waitForFunction(() => document.querySelector('#conn-count')?.textContent.startsWith('2/'), null, { timeout });
  await restored(phone, 'xander', 2, 'vote');
  check('host page restoration reopens the same room without restarting the story', true);

  await host.evaluate(() => {
    const RealPeer = window.Peer;
    window.hostRecoveryPeers = [];
    window.Peer = class extends RealPeer {
      constructor(...args) {
        super(...args);
        this.holdOpen = window.hostRecoveryPeers.length === 0;
        window.hostRecoveryPeers.push(this);
      }
      emit(event, ...args) {
        if (event === 'open' && this.holdOpen) { this._open = false; return false; }
        return super.emit(event, ...args);
      }
    };
  });
  await host.click('[data-act="reconnect-host"]');
  await host.waitForFunction(() => window.hostRecoveryPeers.length >= 2 && document.querySelector('#net')?.textContent === 'Live', null, { timeout });
  await restored(phone, 'xander', 2, 'vote');
  check('host watchdog replaces a signaling attempt that never reports ready',
    await host.evaluate(() => window.hostRecoveryPeers[0].destroyed));

  await phoneContext.setOffline(true);
  await phone.waitForFunction(() => document.querySelector('#pstatus')?.textContent === 'offline');
  check('offline phone has explicit guidance instead of an endless connecting screen',
    (await phone.locator('#connection-help').innerText()).includes('offline'));
  await host.click('#next-round');
  await phoneContext.setOffline(false);
  await restored(phone, 'xander', 3);
  check('switching networks catches up to the latest round automatically', true);

  // Drop only incoming state, leaving the channel open and heartbeat pongs working.
  await phone.evaluate(() => {
    const RealPeer = window.Peer;
    window.dropGameState = true;
    window.recoveryPeers = [];
    window.Peer = class extends RealPeer {
      constructor(...args) { super(...args); window.recoveryPeers.push(this); }
      connect(...args) {
        const conn = super.connect(...args), emit = conn.emit;
        conn.emit = function(event, ...args) {
          if (event === 'data' && args[0]?.t === 'state' && window.dropGameState) return false;
          return emit.call(this, event, ...args);
        };
        return conn;
      }
    };
  });
  await phone.click('#reconnect-game');
  await phone.waitForFunction(() => document.querySelector('#connection-help')?.textContent.includes('did not send game state'), null, { timeout });
  check('an open channel missing state times out with actionable feedback',
    await phone.locator('#pstatus').innerText() !== 'connected');
  await phone.evaluate(() => { window.dropGameState = false; });
  await restored(phone, 'xander', 3);
  check('automatic fresh-peer retry restores state after a stalled handshake', true);
  await phone.evaluate(() => window.recoveryPeers.at(-1).destroy());
  await restored(phone, 'xander', 3);
  check('unexpected peer destruction triggers automatic recovery', true);

  await phone.click('#leave-game');
  await phone.waitForSelector('#btn-new');
  await phone.fill('#join-code', room);
  await phone.click('[data-act="join"]');
  await phone.waitForSelector('#picker', { timeout });
  await phone.click('[data-claim="xander"]');
  await restored(phone, 'xander', 3);
  check('leaving the game and re-entering its code rejoins the active round', true);

  await host.click('[data-act="release"][data-id="xander"]');
  await host.click('[data-act="release"][data-id="marla"]');
  await phone.waitForSelector('#picker'); await late.waitForSelector('#picker');
  await phone.click('[data-claim="xander"]'); await late.click('[data-claim="marla"]');
  await restored(phone, 'xander', 3); await restored(late, 'marla', 3);
  check('releasing every joined guest does not require a new room or restart', true);

  await host.locator('[data-act="end"]').first().click();
  await phone.waitForFunction(() => document.querySelector('#pbody')?.textContent.includes('The candles are out'));
  const nextRoom = await game(host);
  check('a restarted gathering has a new room code', nextRoom !== room);
  await join(phone, nextRoom, 'xander');
  await phone.reload();
  await restored(phone, 'xander', -1, 'lobby');
  check('the same iPhone can join a fresh room and reload without a stale-room hang', true);
  await host.locator('[data-act="end"]').first().click();
  check('no JavaScript exceptions during recovery', errors.length === 0);
  console.log(`${checks}/${checks} recovery checks passed using ${engine}.`);
} catch (error) {
  console.error('Recovery failure diagnostics:', connectionLogs.slice(-20));
  for (const context of browser.contexts()) {
    for (const page of context.pages()) {
      console.error(await page.evaluate(() => ({
        url: location.href,
        hostStatus: document.querySelector('#net')?.textContent,
        playerStatus: document.querySelector('#pstatus')?.textContent,
        help: document.querySelector('#connection-help')?.textContent,
      })));
    }
  }
  throw error;
} finally {
  await browser.close();
}
