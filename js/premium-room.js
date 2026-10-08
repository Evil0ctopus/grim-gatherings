import { esc } from './util.js?v=workshop-v1';
import { communityRequest } from './community-api.js?v=premium-v1';

const root = document.getElementById('premium-room');
const params = new URLSearchParams(location.search);
let host = params.get('host') === '1', code = (params.get('room') || '').toUpperCase();
let room = null, catalog = null, token = '', revealed = false, busy = false, error = '', timer = null;
const key = () => `gg-premium-seat-v1-${code}`;
const button = (action, text) => `<button data-room="${action}">${esc(text)}</button>`;
function guestLink() {
  const url = new URL('premium-room.html', location.href);
  url.search = ''; url.searchParams.set('room', code); url.hash = '';
  return url.href;
}
function render() {
  root.innerHTML = `<h1>${room ? esc(room.game.title) : 'Premium story room'}</h1>
    <nav class="row"><a class="btn secondary" href="shop.html">Shop &amp; purchases</a><a class="btn secondary" href="index.html">Game home</a></nav>
    <p id="room-error" class="err" role="alert">${esc(error)}</p>${error ? button('retry', 'Retry connection') : ''}
    ${room ? roomHtml() : setupHtml()}`;
  if (busy) root.querySelectorAll('button,input,select').forEach(element => { element.disabled = true; });
}
function setupHtml() {
  if (host && catalog) return `<section class="card"><h2>Host a bundle story</h2>
    <p>Only you need to own the bundle. Guests join free without accounts. Everyone uses their own phone.</p>
    <label for="room-game">Story</label><select id="room-game">${catalog.games.map(game =>
      `<option value="${esc(game.id)}">${esc(game.title)} — exactly ${game.playerCount} players</option>`).join('')}</select>
    ${button('create', 'Create room')}
    <h3>Your rooms</h3>${catalog.rooms.map(room => `<p><button data-room="resume-host" data-code="${esc(room.code)}">${esc(room.code)} — ${esc(room.phase)}</button></p>`).join('') || '<p>No saved rooms.</p>'}</section>`;
  if (host) return `<p>Sign in to the purchasing account in the shop, then choose Host a room. ${button('retry', 'Retry connection')}</p>`;
  return `<section class="card"><h2>Join your host’s story</h2><p>No account or purchase needed. Ask your host for the eight-character code.</p>
    <label for="room-code">Room code</label><input id="room-code" maxlength="8" autocapitalize="characters" autocomplete="off" value="${esc(code)}">
    <label for="room-name">Your player name</label><input id="room-name" maxlength="40" autocomplete="nickname">
    ${button('join', 'Join room')} ${token ? button('retry', 'Resume my seat') : ''}
    <p>Use your own unique name. Keep this phone and its browser data; your private seat token stays here, never in the shared link.</p></section>`;
}
function readAloudHtml() {
  const current = room.current;
  if (!current) return '';
  if (current.type === 'character-card') {
    const character = current.character, player = room.players.find(item => item.characterName === character.name);
    return `<section class="card"><h2>Character card${player ? ` — ${esc(player.name)}` : ''}</h2>
      <h3>${esc(character.name)} — ${esc(character.role)}</h3><p>${esc(character.relationship)}</p>
      <p>${esc(character.tieIn)}</p><p>${esc(character.publicBlurb)}</p></section>`;
  }
  if (current.type === 'round-introduction') return `<section class="card"><h2>${esc(current.title)}</h2>
    <p>${esc(current.narration)}</p><p>${esc(current.publicText)}</p></section>`;
  if (current.type === 'clue') return `<section class="card"><h2>${esc(current.playerName)} reads the clue</h2>
    <blockquote>${esc(current.clue.text)}</blockquote></section>`;
  if (current.type === 'reveal') return `<section class="card gold"><h2>Fixed story reveal</h2>
    <p>${esc(current.fullStory)}</p><p><b>The truth:</b> ${esc(current.solution.explanation)}</p></section>`;
  return '';
}
function tallyHtml(tally) {
  if (!tally) return '';
  const names = new Map(room.players.map(player => [player.characterId, `${player.characterName} (${player.name})`]));
  return `<ul>${Object.entries(tally).map(([id, count]) => `<li>${esc(names.get(id) || id)}: ${count}</li>`).join('')}</ul>`;
}
function phaseHtml() {
  if (!room.stateStarted) return `<section class="card"><h2>Room lobby</h2><p>Wait for the host to start the story.</p></section>`;
  if (room.phase === 'setup') return `<section class="card"><h2>Story setup</h2><p>${esc(room.setup.setting)}</p>
    <p>${esc(room.setup.intro)}</p><p><b>Victim:</b> ${esc(room.setup.victim.name)} — ${esc(room.setup.victim.description)}</p></section>`;
  if (room.phase === 'intro-discussion') return `<section class="card"><h2>Pre-round deliberation</h2>
    <p>Discuss and accuse from the introduction and character cards. Discussion is optional.</p></section>`;
  if (room.phase === 'deliberation') return `<section class="card"><h2>Round ${room.round} deliberation and vote</h2>
    <p>Discuss the clues, then the host opens the round vote.</p>${tallyHtml(room.roundVoteTally)}</section>`;
  if (room.phase === 'final-accusation') return `<section class="card"><h2>Final accusations</h2>
    <p>${esc(room.finalPrompt || '')}</p><p>Discuss who committed the central act and why before the final vote.</p>
    ${tallyHtml(room.roundVoteTally)}</section>`;
  if (room.phase === 'vote' || room.phase === 'final-vote') return `<section class="card"><h2>${room.phase === 'final-vote' ? 'Final vote' : `Round ${room.round} vote`}</h2>
    <p>Players submit a private vote in turn for one other character.</p></section>`;
  if (room.phase === 'reveal') return `<section class="card"><h2>Reveal</h2><p>The host will read the fixed story reveal aloud.</p></section>`;
  if (room.phase === 'finished') return `<section class="card"><h2>Story complete</h2>${tallyHtml(room.finalVoteTally)}</section>`;
  return '';
}
function hostControls() {
  if (!host || room.phase === 'closed') return '';
  let controls = '';
  if (room.phase === 'lobby') controls = button('start', 'Everyone joined — begin story');
  else if (room.phase === 'setup') controls = button('start-introduction', 'Setup read — begin character cards');
  else if (room.phase === 'intro-discussion') controls = button('start-rounds', 'Begin clue rounds');
  else if (room.phase === 'round-intro') controls = button('start-clues', 'Narration read — begin clue chain');
  else if (room.phase === 'deliberation') controls = button('open-vote', 'Discussion finished — open round vote');
  else if (room.phase === 'final-accusation') controls = button('open-final-vote', 'Accusations finished — open final vote');
  else if (room.phase === 'reveal') controls = button('finish-reveal', 'Finish story');
  return `<section class="card"><h2>Host controls</h2>
    <p>The host advances public phases; players read clues and cast votes from their own phones.</p>
    <label for="room-link">Guest joining link</label><input id="room-link" readonly value="${esc(guestLink())}">
    <a class="btn secondary" href="${esc(guestLink())}" target="_blank" rel="noopener">Join as a player on this device</a>
    ${controls}${button('close', 'Close room')}</section>`;
}
function guestControls() {
  if (host || room.phase === 'closed' || !room.private) return '';
  const player = room.private;
  if (!room.stateStarted) return `<section class="card gold"><h2>Your seat</h2><p>You have joined. Wait for the host to begin the story.</p></section>`;
  if (!player.isCurrentTurn) return `<section class="card gold"><h2>Your seat</h2>
    <p>${room.currentPlayer ? `It is ${esc(room.currentPlayer)}’s turn.` : 'Wait for the next story phase.'}</p></section>`;
  if (room.phase === 'introduction' || room.phase === 'round') {
    return `<section class="card gold"><h2>Your turn</h2><p>Read the card or clue aloud to everyone.</p>
      ${button(room.phase === 'introduction' ? 'read-card' : 'read-clue', room.phase === 'introduction' ? 'Character card read — next' : 'Clue read — next')}</section>`;
  }
  if (room.phase === 'vote' || room.phase === 'final-vote') return `<section class="card gold"><h2>Your private vote</h2>
    ${revealed ? `<label for="room-target">${room.phase === 'final-vote' ? 'Final vote' : 'Round vote'}</label>
      <select id="room-target">${player.targets.map(target => `<option value="${esc(target.id)}">${esc(target.name)}</option>`).join('')}</select>
      ${button('submit', 'Submit vote')}${button('hide', 'Hide vote')}`
      : `${button('reveal', 'Reveal voting choices')}`}</section>`;
  return '';
}
function roomHtml() {
  const closed = room.phase === 'closed';
  return `<section class="card"><h2>Room <span id="room-code-display">${esc(code)}</span></h2>
    <p>${esc(room.phase.replaceAll('-', ' '))}${room.round ? ` — round ${room.round}` : ''} | ${room.players.length}/${room.capacity} players</p>
    <p class="small">Expires ${esc(new Date(room.expiresAt).toLocaleString())}. Refresh or reopen this page to reconnect.</p>
    <p>${esc(room.game.premise)}</p><p>${room.game.specialMechanics.map(esc).join(' ')}</p>
    <ul>${room.players.map(player => `<li>${esc(player.name)}${player.characterName ? ` — ${esc(player.characterName)}` : ''}</li>`).join('')}</ul>
    ${readAloudHtml()}${phaseHtml()}${room.waiting ? `<p role="status">Waiting for ${esc(room.currentPlayer || 'the host')}.</p>` : ''}
    ${closed ? '<p>This room is closed.</p>' : ''}</section>
    ${hostControls()}${guestControls()}
    <details><summary>Universal story flow</summary><p>Read the setup and character cards, then follow each precomputed clue chain. Deliberate and vote after every round; make final accusations and cast a final vote before the fixed full-story reveal.</p></details>`;
}
async function request(command, extra = {}) {
  return communityRequest(`/api/premium/rooms/${host ? 'host' : 'guest'}`, {
    method: 'POST', token: host ? undefined : '',
    body: { code, command, ...(host ? { revision: room?.revision } : { token, round: room?.round }), ...extra },
  });
}
async function load() {
  if (host && !code) catalog = await communityRequest('/api/premium/rooms');
  else if (code && (host || token)) room = await request('view');
}
function schedule() {
  clearTimeout(timer);
  if (!room || room.phase === 'closed') return;
  timer = setTimeout(async () => {
    if (busy || document.hidden) { schedule(); return; }
    busy = true;
    try {
      const next = await request('view');
      if (next.revision !== room.revision || error) {
        revealed = false; room = next; error = ''; busy = false; render();
      }
    } catch (failure) {
      error = failure.message; revealed = false;
      if ([401, 403, 404, 410].includes(failure.status)) room = null;
      busy = false; render();
    } finally { busy = false; schedule(); }
  }, 4000);
}
root.addEventListener('click', async event => {
  const element = event.target.closest('[data-room]');
  if (!element || busy) return;
  const action = element.dataset.room;
  if (action === 'reveal' || action === 'hide') { revealed = action === 'reveal'; render(); return; }
  if (action === 'close' && !confirm('Close this room for all players? This cannot be undone.')) return;
  busy = true; error = '';
  root.querySelectorAll('button').forEach(button => { button.disabled = true; });
  try {
    if (action === 'create') {
      const selected = catalog.games.find(game => game.id === root.querySelector('#room-game').value);
      room = await communityRequest('/api/premium/rooms', { method: 'POST', body: {
        gameId: selected.id, capacity: selected.playerCount,
      } });
      code = room.code;
    } else if (action === 'join') {
      code = root.querySelector('#room-code').value.trim().toUpperCase();
      if (!/^[A-Z2-9]{8}$/.test(code)) throw new Error('Enter the eight-character premium room code.');
      token = localStorage.getItem(key()) || Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(key(), token);
      room = await request('join', { name: root.querySelector('#room-name').value });
      token = room.token; delete room.token; localStorage.setItem(key(), token);
    } else if (action === 'resume-host') { code = element.dataset.code; await load(); }
    else if (action === 'retry') { token = code ? localStorage.getItem(key()) || '' : ''; await load(); }
    else if (action === 'submit') room = await request('vote', { target: root.querySelector('#room-target').value });
    else room = await request(action, action === 'remove' ? { playerId: element.dataset.player } : {});
    if (code) {
      const url = new URL(location.href); url.search = '';
      url.searchParams.set('room', code); if (host) url.searchParams.set('host', '1');
      history.replaceState(null, '', url);
    }
    revealed = false;
  } catch (failure) { error = failure.message; }
  finally { busy = false; render(); schedule(); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { revealed = false; render(); }
});
try { token = code ? localStorage.getItem(key()) || '' : ''; await load(); }
catch (failure) { error = failure.message; }
render(); schedule();
