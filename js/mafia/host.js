// Mafia table screen: the automated narrator and the only device that knows every role.
import { $, esc, uid, randomRoom, toast, qrSvg } from '../util.js?v=f1ed522';
import { createHostWakeLock } from '../host-wake-lock.js?v=visitor-review-v1';
import {
  MIN_PLAYERS, MAX_PLAYERS, ROLE_INFO, DISCUSSION_CHOICES, DEFAULT_SETTINGS,
  roleCounts, startGame, acknowledgeRole, submitNightAction, castVote, forceAdvance, tick, viewFor, normalizeSettings,
} from './engine.js?v=mafia-v2';
import { createSounds } from './sounds.js?v=mafia-v2';
import { confirmAction } from '../dialog.js?v=ui-refresh-v1';

export const MAFIA_PEER_PREFIX = 'grimgath-mafia-v1-';
const SAVE_KEY = 'gg-mafia-host-v1';

export function mafiaJoinUrl(room) {
  return location.origin + location.pathname + '?room=' + encodeURIComponent(room);
}

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (s && typeof s.room === 'string' && Array.isArray(s.lobby)) return s;
  } catch { /* fresh room */ }
  return null;
}

export function startMafiaHost() {
  const app = $('#app');
  let H = load();
  const freshRoom = () => ({ room: randomRoom(), lobby: [], game: null, gameNumber: 0, settings: { ...DEFAULT_SETTINGS }, voice: false, sound: true });
  H ||= { room: '', lobby: [], game: null, gameNumber: 0, settings: { ...DEFAULT_SETTINGS }, voice: false };
  H.settings = normalizeSettings(H.settings);
  const conns = new Map(); // conn -> { playerId }
  let peer = null, netStatus = 'starting…', restartTimer = null, blocked = false;
  let lastSpoken = '';
  const wakeLock = createHostWakeLock({});
  if (typeof H.sound !== 'boolean') H.sound = true;
  const sounds = createSounds();
  sounds.enabled = H.sound;
  let lastSoundKey = null;
  document.addEventListener('pointerdown', () => sounds.unlock(), { capture: true });

  // Plays the drama for a phase the first time this screen shows it: the gunshot lands at dawn, then the
  // heavenly chime (Doctor save) or the wah-wah (victim dead) decides the night.
  function phaseSounds(g) {
    const key = `${g.gameNumber}:${g.phase}:${g.night}:${g.day}`;
    if (key === lastSoundKey) return;
    const first = lastSoundKey === null;
    lastSoundKey = key;
    if (first || !H.sound) return;
    const lastNight = [...g.history].reverse().find(h => h.type === 'night');
    if (g.phase === 'night') sounds.play('nightfall');
    else if (g.phase === 'dawn' || (g.phase === 'over' && g.history.at(-1)?.type === 'night')) {
      if (lastNight?.target) {
        sounds.play('gunshot');
        sounds.after(1100, lastNight.saved ? 'chime' : 'wahwah');
      } else sounds.play('daybreak');
    } else if (g.phase === 'verdict' || (g.phase === 'over' && g.history.at(-1)?.type === 'vote')) sounds.play('gavel');
    if (g.phase === 'over') sounds.after(2600, 'fanfare', g.winner);
  }

  const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(H)); } catch { /* storage full */ } };
  const byId = id => H.lobby.find(p => p.id === id);
  const online = id => [...conns.values()].some(r => r.playerId === id);
  const name = id => esc(H.game?.players.find(p => p.id === id)?.name ?? byId(id)?.name ?? '?');

  function lobbyView(playerId) {
    return {
      phase: 'lobby', room: H.room, min: MIN_PLAYERS, max: MAX_PLAYERS,
      roster: H.lobby.map(p => ({ id: p.id, name: p.name, alive: true })),
      counts: H.lobby.length >= MIN_PLAYERS && H.lobby.length <= MAX_PLAYERS ? roleCounts(H.lobby.length) : null,
      me: playerId ? { id: playerId, name: byId(playerId)?.name } : null,
    };
  }
  const viewOf = playerId => H.game ? viewFor(H.game, playerId) : lobbyView(playerId);

  function send(conn, msg) { try { if (conn.open) conn.send(msg); } catch (e) { console.warn('[mafia] send failed', e); } }
  function sendState(conn) {
    const rec = conns.get(conn);
    if (!rec?.playerId) return;
    send(conn, { t: 'state', view: viewOf(rec.playerId), now: Date.now() });
  }
  function broadcast() { for (const conn of conns.keys()) sendState(conn); }
  function changed() { save(); broadcast(); render(); }

  // ---------- networking ----------
  function startPeer() {
    if (!H.room || blocked || (peer && !peer.destroyed)) return;
    if (typeof window.Peer !== 'function') { netStatus = 'PeerJS failed to load'; renderNet(); return; }
    netStatus = 'connecting…'; renderNet();
    const p = new window.Peer(MAFIA_PEER_PREFIX + H.room.toLowerCase(), { debug: 1 });
    peer = p;
    p.on('open', () => { if (peer === p) { netStatus = 'online'; renderNet(); } });
    p.on('connection', conn => { if (peer !== p) conn.close(); else setupConn(conn); });
    p.on('close', () => { if (peer === p) restartPeer(1500); });
    p.on('disconnected', () => {
      if (peer !== p || p.destroyed) return;
      netStatus = 'reconnecting…'; renderNet();
      setTimeout(() => {
        if (peer === p && !p.destroyed && p.disconnected) { try { p.reconnect(); } catch { restartPeer(2000); } }
      }, 1500);
    });
    p.on('error', err => {
      console.warn('[mafia] peer error', err.type, err.message);
      if (peer !== p) return;
      if (['browser-incompatible', 'invalid-id', 'invalid-key', 'ssl-unavailable'].includes(err.type)) {
        blocked = true; netStatus = 'connection service unavailable'; renderNet();
        toast('This browser cannot host the room. Use an up-to-date Chrome or Safari.', 10000);
      } else if (err.type === 'unavailable-id') { netStatus = 'reclaiming room…'; renderNet(); restartPeer(4000); }
      else if (['network', 'server-error', 'socket-error', 'socket-closed'].includes(err.type)) { netStatus = 'reconnecting…'; renderNet(); restartPeer(3000); }
    });
  }
  function stopPeer() {
    const old = peer; peer = null;
    for (const c of conns.keys()) { try { c.close(); } catch { /* closed */ } }
    conns.clear();
    if (old && !old.destroyed) old.destroy();
  }
  function restartPeer(ms) {
    clearTimeout(restartTimer);
    restartTimer = setTimeout(() => { stopPeer(); startPeer(); }, ms);
  }

  function setupConn(conn) {
    const rec = { playerId: null };
    conns.set(conn, rec);
    conn.on('data', msg => {
      if (conns.get(conn) !== rec || !msg || typeof msg !== 'object') return;
      if (msg.t === 'ping') { send(conn, { t: 'pong' }); return; }
      try { handle(conn, rec, msg); } catch (e) { console.error('[mafia] message failed', e); fail(conn, 'Something went wrong. Try again.'); }
    });
    const drop = () => { if (conns.get(conn) === rec) { conns.delete(conn); render(); } };
    conn.on('close', drop);
    conn.on('error', drop);
  }

  function fail(conn, message) {
    send(conn, { t: 'error', message });
    sendState(conn);
  }

  function handle(conn, rec, msg) {
    if (msg.t === 'hello') {
      const token = String(msg.token || '').slice(0, 64);
      if (token.length < 8) { send(conn, { t: 'error', message: 'Bad join request. Reload the page.' }); return; }
      let p = H.lobby.find(x => x.token === token);
      if (!p) {
        const nm = String(msg.name || '').trim().replace(/\s+/g, ' ').slice(0, 24);
        if (H.game) { send(conn, { t: 'error', message: 'A game is already in progress in this room. Ask the host to return to the lobby after it ends.' }); return; }
        if (!nm) { send(conn, { t: 'error', message: 'Enter your name to join.' }); return; }
        if (H.lobby.length >= MAX_PLAYERS) { send(conn, { t: 'error', message: `This room is full (${MAX_PLAYERS} players).` }); return; }
        if (H.lobby.some(x => x.name.toLowerCase() === nm.toLowerCase())) { send(conn, { t: 'error', message: 'Someone already has that name. Pick another.' }); return; }
        p = { id: uid(8), token, name: nm };
        H.lobby.push(p);
      }
      for (const [c, r] of conns) if (c !== conn && r.playerId === p.id) { send(c, { t: 'superseded' }); conns.delete(c); setTimeout(() => c.close(), 300); }
      rec.playerId = p.id;
      changed();
      return;
    }
    if (!rec.playerId) { send(conn, { t: 'error', message: 'Join the room first.' }); return; }
    const id = rec.playerId, g = H.game;
    if (msg.t === 'leave') {
      if (!g) { H.lobby = H.lobby.filter(p => p.id !== id); rec.playerId = null; send(conn, { t: 'ended', reason: 'left' }); changed(); }
      else fail(conn, 'You cannot leave during a game.');
      return;
    }
    if (!g) { sendState(conn); return; }
    let result = { ok: true };
    if (msg.t === 'ready') acknowledgeRole(g, id);
    else if (msg.t === 'night') result = submitNightAction(g, id, String(msg.target));
    else if (msg.t === 'vote') result = castVote(g, id, String(msg.target));
    if (!result.ok) { fail(conn, result.error); return; }
    changed();
  }

  // ---------- game control ----------
  function newGame() {
    if (H.lobby.length < MIN_PLAYERS) return toast(`Mafia needs at least ${MIN_PLAYERS} players.`);
    H.gameNumber += 1;
    H.game = startGame(H.lobby, H.settings, { gameNumber: H.gameNumber });
    lastSpoken = '';
    changed();
  }
  function toLobby() {
    H.game = null;
    changed();
  }

  // ---------- narration ----------
  function narration(g) {
    const ann = g.announcement;
    switch (g.phase) {
      case 'reveal': return 'Everyone, look at your phone privately and learn your role. Tell no one.';
      case 'night': return `Night ${g.night} falls. Everyone, close your eyes. Mafia, open your eyes and agree on your victim. Doctor, choose someone to protect. Detective, choose someone to investigate.`;
      case 'dawn': return ann.killed
        ? `Dawn breaks. ${g.players.find(p => p.id === ann.killed).name} was found dead.${ann.role ? ` They were the ${ROLE_INFO[ann.role].name}.` : ''}`
        : 'Dawn breaks. The town wakes, and by some miracle, nobody died last night.';
      case 'day': {
        const recap = ann?.killed ? `${g.players.find(p => p.id === ann.killed).name} was killed in the night. ` : ann ? 'Nobody died last night. ' : '';
        return `${recap}Discuss. Who among you is hiding blood on their hands?`;
      }
      case 'vote': return 'The time for talk is over. Vote on your phones.';
      case 'verdict': {
        const v = g.verdict;
        if (!v.eliminated) return v.tie ? 'The vote is tied. Nobody is eliminated today.' : 'No votes were cast. Nobody is eliminated today.';
        return `The town has spoken. ${g.players.find(p => p.id === v.eliminated).name} is eliminated.${v.role ? ` They were the ${ROLE_INFO[v.role].name}.` : ''}`;
      }
      case 'over': {
        const last = g.history[g.history.length - 1];
        const who = last?.type === 'night' ? last.killed : last?.eliminated;
        const lead = who ? `${g.players.find(p => p.id === who).name} ${last.type === 'night' ? 'was killed in the night' : 'was voted out'}. ` : '';
        return lead + (g.winner === 'town' ? 'The last of the mafia is gone. The town wins.' : 'The mafia now hold the town. The mafia win.');
      }
      default: return '';
    }
  }
  function speak(text) {
    if (!H.voice || !text || text === lastSpoken || !('speechSynthesis' in window)) return;
    lastSpoken = text;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92; u.pitch = 0.8;
      speechSynthesis.speak(u);
    } catch { /* voice unavailable */ }
  }

  // ---------- rendering ----------
  function renderNet() {
    const el = $('#mafia-net');
    if (el) {
      el.textContent = `Room ${netStatus}`;
      el.className = 'pill ' + (netStatus === 'online' ? 'ok' : 'wait');
    }
  }

  function timerHtml(g) {
    return g.endsAt ? `<div class="mafia-timer" data-ends="${g.endsAt}">--:--</div>` : '';
  }

  function rosterHtml(g) {
    return `<ul class="mafia-roster">${g.players.map(p => {
      const role = g.phase === 'over' || (!p.alive && g.settings.revealRoleOnDeath) ? p.role : null;
      return `<li class="${p.alive ? '' : 'dead'}"><span class="dot ${online(p.id) ? 'on' : ''}" title="${online(p.id) ? 'connected' : 'disconnected'}"></span>${esc(p.name)}${p.alive ? '' : ' <span class="small muted">eliminated</span>'}${role ? ` <span class="role-tag ${role}">${ROLE_INFO[role].name}</span>` : ''}</li>`;
    }).join('')}</ul>`;
  }

  function voteBoardHtml(g) {
    const counts = {};
    for (const [voter, target] of Object.entries(g.votes)) (counts[target] ||= []).push(voter);
    const alive = g.players.filter(p => p.alive);
    return `<div class="mafia-tally">${alive.map(p => {
      const voters = counts[p.id] || [];
      return `<div class="tally-row"><strong>${esc(p.name)}</strong><span class="tally-bar" style="--n:${voters.length};--of:${alive.length}"></span><span class="tally-count">${voters.length}</span><span class="small muted">${voters.map(name).join(', ')}</span></div>`;
    }).join('')}</div><p class="small muted center">${Object.keys(g.votes).length} of ${alive.length} votes in. Votes can be changed until voting closes. A tie eliminates no one.</p>`;
  }

  function phaseBody(g) {
    const living = g.players.filter(p => p.alive).length;
    switch (g.phase) {
      case 'reveal': return `<p class="center">${g.ready.length} of ${g.players.length} players have seen their role.</p>`;
      case 'night': {
        const v = viewFor(g, null);
        return `<div class="moon" aria-hidden="true"></div><p class="center">${v.nightProgress.done} of ${v.nightProgress.of} phones done. Keep your eyes closed and your phones hidden.</p>`;
      }
      case 'dawn': return `<p class="center muted">The day begins shortly.</p>`;
      case 'day': return `<p class="center muted">${living} players remain. When the timer ends, voting opens.</p>`;
      case 'vote': return voteBoardHtml(g);
      case 'verdict': {
        const c = g.verdict.counts;
        const rows = Object.entries(c).sort((a, b) => b[1] - a[1]).map(([id, n]) => `<li>${name(id)}: ${n}</li>`).join('');
        return rows ? `<ul class="mafia-results">${rows}</ul>` : '';
      }
      case 'over': return `<div class="mafia-final">${g.players.map(p => `<div class="final-row ${p.role} ${p.alive ? '' : 'dead'}"><strong>${esc(p.name)}</strong><span class="role-tag ${p.role}">${ROLE_INFO[p.role].name}</span><span class="small muted">${p.alive ? 'survived' : 'eliminated'}</span></div>`).join('')}</div>`;
      default: return '';
    }
  }

  function controlsHtml(g) {
    const next = { reveal: 'Skip waiting: start the night', night: 'Force dawn (unfinished actions are skipped)', dawn: 'Start discussion now', day: 'Open voting now', vote: 'Close voting now', verdict: 'Night falls now' }[g.phase];
    if (g.phase === 'over') return `<div class="row"><button class="btn" id="play-again">Play again (new roles)</button><button class="btn secondary" id="to-lobby">Change players</button></div>`;
    return `<div class="row">${next ? `<button class="btn secondary" id="force">${next}</button>` : ''}<button class="btn secondary" id="end-game">End game</button></div>`;
  }

  function settingsHtml() {
    const s = H.settings;
    return `<details class="card mafia-settings"><summary>Table settings</summary>
      <label>Discussion time <select id="set-discussion">${DISCUSSION_CHOICES.map(n => `<option value="${n}"${n === s.discussionSeconds ? ' selected' : ''}>${n / 60} minutes</option>`).join('')}</select></label>
      <label class="check"><input type="checkbox" id="set-reveal"${s.revealRoleOnDeath ? ' checked' : ''}> Reveal a player's role when they are eliminated</label>
      <label class="check"><input type="checkbox" id="set-voice"${H.voice ? ' checked' : ''}> Narrator voice on this screen</label>
      <label class="check"><input type="checkbox" id="set-sound"${H.sound ? ' checked' : ''}> Sound effects (gunshot, saves, deaths)</label>
      <label class="check"><input type="checkbox" checked disabled> Mafia know each other</label>
      <p class="small muted">Mafia teammates always see each other in this standard ruleset. Most votes eliminates one player; a tie eliminates no one.</p></details>`;
  }

  function renderLobby() {
    const n = H.lobby.length;
    const counts = n >= MIN_PLAYERS && n <= MAX_PLAYERS ? roleCounts(n) : null;
    const url = mafiaJoinUrl(H.room);
    app.innerHTML = `<section class="mafia-host">
      <header class="mafia-head"><a class="small muted" href="./">&larr; Grim Gatherings</a><h1>Mafia</h1><p class="muted">A hidden-role game. New roles every game &mdash; the killers are never the same.</p><span id="mafia-net" class="pill wait"></span></header>
      <div class="mafia-grid">
        <div class="card gold center"><h2>Join on your phone</h2><div class="qr">${qrSvg(url)}</div><p class="room-code">${esc(H.room)}</p><p class="small"><a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a></p><button class="btn secondary" id="copy-link">Copy join link</button></div>
        <div class="card"><h2>Players (${n})</h2>
          ${n ? `<ul class="mafia-roster">${H.lobby.map(p => `<li><span class="dot ${online(p.id) ? 'on' : ''}"></span>${esc(p.name)} <button class="link-btn" data-kick="${esc(p.id)}" aria-label="Remove ${esc(p.name)}">remove</button></li>`).join('')}</ul>` : '<p class="muted">Waiting for players to join&hellip;</p>'}
          <p class="small muted">Everyone who joins plays. ${MIN_PLAYERS}&ndash;${MAX_PLAYERS} players; odd numbers avoid tied votes.</p>
          ${counts ? `<p class="deal-line">This deal: <span class="role-tag mafia">${counts.mafia} Mafia</span> <span class="role-tag doctor">${counts.doctor} Doctor${counts.doctor === 1 ? '' : 's'}</span> <span class="role-tag detective">${counts.detective} Detective${counts.detective === 1 ? '' : 's'}</span> <span class="role-tag town">${counts.town} Town</span></p>` : `<p class="small">Need ${Math.max(0, MIN_PLAYERS - n)} more player${MIN_PLAYERS - n === 1 ? '' : 's'}.</p>`}
          <button class="btn block" id="start"${counts ? '' : ' disabled'}>Deal roles &amp; start</button>
        </div>
      </div>
      ${settingsHtml()}
      <details class="card mafia-rules"><summary>How Mafia works</summary>
        <p>This screen is the narrator. Put it where everyone can see and hear it. Each player joins on their own phone and keeps it hidden.</p>
        <ol><li><strong>Secret roles.</strong> Every phone shows only its own role. Mafia also see who their teammates are.</li>
        <li><strong>Night.</strong> Everyone closes their eyes and uses their phone quietly. Mafia agree on one victim, the Doctor protects one player, and the Detective investigates one player. Townspeople pick a suspect so every phone looks busy.</li>
        <li><strong>Day.</strong> The narrator announces who died (a Doctor save means nobody did). Discuss, then vote. The player with the most votes is eliminated; a tie eliminates no one.</li>
        <li><strong>Winning.</strong> The town wins when every mafia member is gone. The mafia win when they equal or outnumber everyone else.</li></ol>
        <p>Eliminated players keep watching but cannot speak, act or vote.</p></details>
      <p class="center mode-switch"><a class="btn secondary" href="mafia.html?mode=narrator">Only one phone? Play in narrator mode</a></p>
    </section>`;
    renderNet();
    $('#copy-link').onclick = async () => { try { await navigator.clipboard.writeText(url); toast('Join link copied'); } catch { toast(url, 6000); } };
    $('#start').onclick = newGame;
    app.querySelectorAll('[data-kick]').forEach(b => b.onclick = () => {
      const id = b.dataset.kick;
      for (const [c, r] of conns) if (r.playerId === id) { send(c, { t: 'ended', reason: 'removed' }); r.playerId = null; }
      H.lobby = H.lobby.filter(p => p.id !== id);
      changed();
    });
    bindSettings();
  }

  function bindSettings() {
    $('#set-discussion').onchange = e => { H.settings.discussionSeconds = Number(e.target.value); if (H.game) H.game.settings.discussionSeconds = H.settings.discussionSeconds; changed(); };
    $('#set-reveal').onchange = e => { H.settings.revealRoleOnDeath = e.target.checked; if (H.game) H.game.settings.revealRoleOnDeath = e.target.checked; changed(); };
    $('#set-voice').onchange = e => { H.voice = e.target.checked; save(); if (H.voice && H.game) { lastSpoken = ''; speak(narration(H.game)); } };
    $('#set-sound').onchange = e => { H.sound = sounds.enabled = e.target.checked; save(); if (H.sound) { sounds.unlock(); sounds.play('chime'); } };
  }

  function renderGame() {
    const g = H.game;
    const text = narration(g);
    const phaseName = { reveal: 'Roles dealt', night: `Night ${g.night}`, dawn: `Day ${g.day}`, day: `Day ${g.day} · discussion`, vote: `Day ${g.day} · vote`, verdict: `Day ${g.day} · verdict`, over: 'Game over' }[g.phase];
    app.innerHTML = `<section class="mafia-host phase-${g.phase}${g.phase === 'over' ? ` win-${g.winner}` : ''}">
      <header class="mafia-head"><span class="small muted">Mafia · game ${g.gameNumber} · room ${esc(H.room)}</span><span id="mafia-net" class="pill wait"></span></header>
      <div class="card narrator ${g.phase === 'night' ? 'night' : ''}"><p class="phase-name">${phaseName}</p><p class="narration">${esc(text)}</p>${timerHtml(g)}${phaseBody(g)}</div>
      <div class="mafia-grid">
        <div class="card"><h2>The town</h2>${rosterHtml(g)}</div>
        <div class="card"><h2>Narrator controls</h2>${controlsHtml(g)}<p class="small muted">The game advances automatically. Use these if a player has wandered off.</p></div>
      </div>
      ${settingsHtml()}
    </section>`;
    renderNet();
    const on = (sel, fn) => { const el = $(sel); if (el) el.onclick = fn; };
    on('#force', async () => {
      const phase = g.phase;
      if (g.phase === 'night' && !await confirmAction('Force dawn? Anyone who has not acted loses their action tonight, and an unagreed mafia kill is cancelled.')) return;
      if (H.game !== g || g.phase !== phase) return toast('The game has already advanced. Review the current phase.');
      forceAdvance(g); changed();
    });
    on('#end-game', async () => { if (await confirmAction('End this game and return everyone to the lobby?')) toLobby(); });
    on('#play-again', newGame);
    on('#to-lobby', toLobby);
    bindSettings();
    speak(text);
    phaseSounds(g);
    updateTimers();
  }

  function renderEntry() {
    app.innerHTML = `<section class="mafia-host mafia-entry"><header class="mafia-head"><h1>Mafia</h1>
      <p>A hidden-role party game. Fresh secret roles every time.</p></header>
      <section class="card gold"><h2>Everyone has a phone?</h2><p>Create a room, then share its code with 5–18 players. Each player gets a private role on their own phone.</p>
      <button class="block" id="create-mafia-room">Create a Mafia room</button></section>
      <section class="card"><h2>Only one phone?</h2><p>Enter names and let the narrator's phone guide the whole game.</p><a class="btn secondary block" href="mafia.html?mode=narrator">Play in narrator mode</a></section>
      <details class="card"><summary>Joining an existing Mafia room</summary><label for="mafia-room-code">Room code</label>
      <form id="join-mafia-form" class="row"><input id="mafia-room-code" required maxlength="12" pattern="[A-Za-z0-9]{3,12}" autocapitalize="characters"><button>Join Mafia</button></form></details></section>`;
    $('#create-mafia-room').onclick = () => {
      H = freshRoom(); blocked = false; netStatus = 'connecting…'; sounds.enabled = H.sound;
      save(); render(); wakeLock.setActive(true); startPeer();
    };
    $('#join-mafia-form').onsubmit = event => {
      event.preventDefault();
      location.assign(mafiaJoinUrl($('#mafia-room-code').value.trim().toUpperCase()));
    };
  }
  function render() { if (!H.room) renderEntry(); else if (H.game) renderGame(); else renderLobby(); }

  let lastTick = null;
  function updateTimers() {
    document.querySelectorAll('[data-ends]').forEach(el => {
      const left = Math.max(0, Math.ceil((Number(el.dataset.ends) - Date.now()) / 1000));
      el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      el.classList.toggle('urgent', left <= 10);
      if (H.sound && left !== lastTick && lastTick !== null && left > 0 && left <= 10) sounds.play('tick');
      lastTick = left;
    });
  }

  setInterval(() => {
    if (H.game && tick(H.game)) changed();
    updateTimers();
  }, 500);

  document.addEventListener('visibilitychange', () => {
    wakeLock.setActive(!!H.room);
    if (H.room && !document.hidden && (!peer || peer.destroyed || peer.disconnected)) restartPeer(0);
  });
  window.addEventListener('online', () => { if (H.room) restartPeer(0); });
  wakeLock.setActive(!!H.room);
  if (H.room) save();
  render();
  startPeer();
}
