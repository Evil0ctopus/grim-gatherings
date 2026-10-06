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
  const target = root.querySelector('#room-target')?.value;
  root.innerHTML = `<h1>${room ? esc(room.game.title) : 'Premium phone rooms'}</h1>
    <nav class="row"><a class="btn secondary" href="shop.html">Shop &amp; purchases</a><a class="btn secondary" href="index.html">Game home</a></nav>
    <p id="room-error" class="err" role="alert">${esc(error)}</p>${error ? button('retry', 'Retry connection') : ''}
    ${room ? roomHtml() : setupHtml()}`;
  if (target && root.querySelector('#room-target option[value="' + CSS.escape(target) + '"]')) root.querySelector('#room-target').value = target;
  if (busy) root.querySelectorAll('button,input,select').forEach(el => { el.disabled = true; });
}
function setupHtml() {
  if (host && catalog) return `<section class="card"><h2>Host a bundle game</h2>
    <p>Only you need to own the bundle. Guests join free without accounts. Everyone uses their own phone.</p>
    <label for="room-game">Game</label><select id="room-game">${catalog.games.map(g => `<option value="${esc(g.id)}">${esc(g.title)}</option>`).join('')}</select>
    <label for="room-capacity">Player seats (include yourself if playing)</label><input id="room-capacity" type="number" min="3" max="10" value="3">
    ${button('create', 'Create room')}
    <h3>Your rooms</h3>${catalog.rooms.map(r => `<p><button data-room="resume-host" data-code="${esc(r.code)}">${esc(r.code)} - ${esc(r.phase)}</button></p>`).join('') || '<p>No saved rooms.</p>'}</section>`;
  if (host) return `<p>Sign in to the purchasing account in the shop, then choose Host a room. ${button('retry', 'Retry connection')}</p>`;
  return `<section class="card"><h2>Join your host’s premium game</h2><p>No account or purchase needed. Ask your host for the eight-character code.</p>
    <label for="room-code">Room code</label><input id="room-code" maxlength="8" autocapitalize="characters" autocomplete="off" value="${esc(code)}">
    <label for="room-name">Your player name</label><input id="room-name" maxlength="40" autocomplete="nickname">
    ${button('join', 'Join room')} ${token ? button('retry', 'Resume my seat') : ''}
    <p>Use your own unique name. Keep this phone and its browser data; your private seat token stays here, never in the shared link.</p></section>`;
}
function roomHtml() {
  const closed = room.phase === 'closed';
  const publicPanel = `<section class="card"><h2>Room <span id="room-code-display">${esc(code)}</span></h2>
    <p>${esc(room.phase)}${room.round ? ` - round ${room.round}` : ''} | ${room.players.length}/${room.capacity} players</p>
    <p class="small">Expires ${esc(new Date(room.expiresAt).toLocaleString())}. Refresh or reopen this page to reconnect.</p>
    <ul>${room.players.map(p => `<li>${esc(p.name)}${p.detained ? ' - detained witness' : ''}${room.game.id === 'ledger' ? ` - influence ${p.influence}` : ''}${p.role ? `: ${esc(p.role)}` : ''}
    ${host && room.phase === 'lobby' ? `<button class="secondary small" data-room="remove" data-player="${esc(p.id)}">Remove ${esc(p.name)}</button>` : ''}</li>`).join('')}</ul>
    <ol>${room.log.map(line => `<li>${esc(line)}</li>`).join('')}</ol>
    ${room.winner ? `<h3>${esc(room.winner === 'loyal' ? room.game.loyal : room.game.enemy)} win</h3>` : ''}
    ${room.waiting ? `<p role="status">Waiting for ${room.waiting} private choice(s).</p>` : ''}
    ${closed ? '<p>This room is closed.</p>' : ''}</section>`;
  const hostPanel = host && !closed ? `<section class="card"><h2>Host controls</h2>
    <p>Share this code only with your group. Check the lobby names before dealing roles. The host view never shows private roles or choices.</p>
    <label for="room-link">Guest joining link</label><input id="room-link" readonly value="${esc(guestLink())}">
    <a class="btn secondary" href="${esc(guestLink())}" target="_blank" rel="noopener">Join as a player on this device</a>
    ${room.phase === 'lobby' ? button('start', 'Everyone joined - deal roles') : ''}
    ${room.phase === 'discussion' ? `<p>Allow everyone to read their private dawn notes and discuss before opening ballots.</p>${button('council', 'Discussion finished - open ballots')}` : ''}
    ${button('close', 'Close room')}</section>` : '';
  const privatePanel = !host && !closed ? `<section class="card gold"><h2>Your phone</h2>
    ${room.phase === 'lobby' ? '<p>You have joined. Wait for the host to deal roles.</p>' : room.private
      ? revealed ? privateHtml() : `<p>Keep your screen private.</p>${button('reveal', 'Reveal my private card')}`
      : '<p>You are a detained witness. Use public evidence in discussion only; no private actions or ballots.</p>'}
    </section>` : '';
  return `${publicPanel}${hostPanel}${privatePanel}<details><summary>Rules and win conditions</summary><p>${esc(room.game.premise)}</p><ol>${room.game.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ol></details>`;
}
function privateHtml() {
  const p = room.private;
  return `<h3>${esc(p.name)}: ${esc(p.role)}</h3><p>${esc(p.description)}</p>
    ${p.allies.length ? `<p>Secret allies: ${esc(p.allies.join(', '))}</p>` : ''}
    ${p.report ? `<p><b>Private dawn note:</b> ${esc(p.report)}</p>` : ''}
    ${room.submitted ? '<p role="status">Your choice is committed. Waiting for the other players.</p>'
      : ['night', 'vote'].includes(room.phase) ? `<label for="room-target">${room.phase === 'vote' ? `Secret ballot (weight ${p.weight})` : 'Tonight’s target'}</label>
      <select id="room-target">${p.targets.map(t => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('')}
      ${room.phase === 'vote' || !p.targets.length ? '<option value="">Abstain / no available attack</option>' : ''}</select>
      ${button('submit', room.phase === 'vote' ? 'Commit secret ballot' : 'Commit private action')}` : '<p>Read your note and join the discussion using the game rules.</p>'}
    ${button('hide', 'Hide private card')}`;
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
        if (next.round !== room.round || next.phase !== room.phase) revealed = false;
        room = next; error = ''; busy = false; render();
      }
    } catch (failure) {
      error = failure.message; revealed = false;
      if ([401, 403, 404, 410].includes(failure.status)) room = null;
      busy = false; render();
    } finally { busy = false; schedule(); }
  }, 4000);
}
root.addEventListener('click', async event => {
  const el = event.target.closest('[data-room]');
  if (!el || busy) return;
  const action = el.dataset.room;
  if (action === 'reveal' || action === 'hide') { revealed = action === 'reveal'; render(); return; }
  if (action === 'close' && !confirm('Close this room for all players? This cannot be undone.')) return;
  busy = true; error = '';
  root.querySelectorAll('button').forEach(b => { b.disabled = true; });
  try {
    if (action === 'create') {
      room = await communityRequest('/api/premium/rooms', { method: 'POST', body: {
        gameId: root.querySelector('#room-game').value, capacity: Number(root.querySelector('#room-capacity').value),
      } });
      code = room.code;
    } else if (action === 'join') {
      code = root.querySelector('#room-code').value.trim().toUpperCase();
      if (!/^[A-Z2-9]{8}$/.test(code)) throw new Error('Enter the eight-character premium room code.');
      token = localStorage.getItem(key()) || Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(key(), token);
      room = await request('join', { name: root.querySelector('#room-name').value });
      token = room.token; delete room.token;
      localStorage.setItem(key(), token);
    } else if (action === 'resume-host') { code = el.dataset.code; await load(); }
    else if (action === 'retry') { token = code ? localStorage.getItem(key()) || '' : ''; await load(); }
    else room = await request(action === 'submit' ? room.phase : action,
      action === 'submit' ? { target: root.querySelector('#room-target').value || null } :
        action === 'remove' ? { playerId: el.dataset.player } : {});
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
