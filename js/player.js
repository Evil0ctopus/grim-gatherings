// Guest (phone) side. Connects to the host's peer id, claims a character, renders ONLY its own packet.
import { $, esc, paras, uid, toast, baseUrl, PEER_PREFIX } from './util.js?v=f1ed522';
import { createAtmosphere } from './atmosphere.js?v=volume-58-v1';
import { voteStripHtml } from './voting.js?v=round-votes-v1';

export function startPlayer(room) {
  const atmosphere = createAtmosphere();
  atmosphere.update({ room: '', phase: 'connecting', roundIndex: -1 }, null);
  const hostId = PEER_PREFIX + room.toLowerCase();
  const KEY = 'gg-player-v1-' + room;
  let me;
  try { me = JSON.parse(localStorage.getItem(KEY)); } catch {}
  if (!me || !me.token) me = { token: uid(16), charId: null };
  const saveMe = () => localStorage.setItem(KEY, JSON.stringify(me));
  saveMe();

  let peer = null, conn = null, view = null, lastMsg = 0, lastAttempt = 0, status = 'connecting', retryTimer = null, openTimeout = null;
  let lastHtml = '', prevKey = null, ended = false, hiddenAt = 0, everConnected = false;
  let leaving = false, leaveTimer = null;
  const app = document.getElementById('app');
  app.className = '';
  app.innerHTML = `<div class="statusbar"><span>Room <b>${esc(room)}</b></span><div class="vote-strip" id="vote-strip" tabindex="0" aria-label="Suspect vote history; scroll to see all suspects"></div><span id="pstatus" class="pill wait">connecting…</span></div><div class="game-exit"><button class="secondary small" id="leave-game">Leave game → Home</button></div><div id="pbody"></div>`;
  const body = $('#pbody');
  function returnHome() {
    clearTimeout(leaveTimer);
    ended = true;
    localStorage.removeItem(KEY);
    peer?.destroy();
    location.href = baseUrl();
  }
  $('#leave-game').addEventListener('click', () => {
    if (ended || !me.charId) return returnHome();
    if (!confirm('Leave this game and return home? Your character will be released for someone else. If disconnected, the host may need to release it manually.')) return;
    if (!conn?.open) return returnHome();
    if (leaving) return;
    leaving = true;
    $('#leave-game').disabled = true;
    if (!send({ t: 'unclaim' })) {
      leaving = false;
      $('#leave-game').disabled = false;
      return;
    }
    leaveTimer = setTimeout(() => {
      leaving = false;
      $('#leave-game').disabled = false;
      if (confirm('The host did not confirm releasing your character. Return home anyway? The host may need to release it manually.')) returnHome();
    }, 4000);
  });

  function setStatus(s) {
    status = s;
    const el = $('#pstatus');
    const map = { connected: ['ok', 'connected'], connecting: ['wait', 'connecting…'], reconnecting: ['wait', 'reconnecting…'], waiting: ['wait', 'waiting for host…'], offline: ['bad', 'offline'] };
    const [cls, txt] = map[s] || ['wait', s];
    el.className = 'pill ' + cls; el.textContent = txt;
    if (!view) render();
  }

  // ---------- networking ----------
  function newPeer() {
    lastAttempt = Date.now();
    const old = peer; peer = null; conn = null;
    try { old && old.destroy(); } catch {}
    if (typeof window.Peer !== 'function') { setStatus('offline'); body.innerHTML = '<div class="err">Could not load the connection library. Check your internet and reload.</div>'; return; }
    const p = new window.Peer({ debug: 1 });
    peer = p;
    p.on('open', () => { if (peer === p) openConn(); });
    p.on('disconnected', () => {
      if (peer !== p || p.destroyed) return;
      setTimeout(() => { if (peer === p && p.disconnected && !p.destroyed) { try { p.reconnect(); } catch { retry(1000, true); } } }, 1000);
    });
    p.on('error', err => {
      if (peer !== p) return;
      console.warn('[player] peer error', err.type, err.message);
      if (err.type === 'peer-unavailable') { setStatus(everConnected ? 'reconnecting' : 'waiting'); retry(3000); }
      else if (['network', 'server-error', 'socket-error', 'socket-closed', 'unavailable-id'].includes(err.type)) { setStatus('reconnecting'); retry(3000, true); }
      else retry(3000);
    });
  }

  function openConn() {
    if (!peer || !peer.open) return retry(1000, !peer || peer.destroyed);
    lastAttempt = Date.now();
    if (conn) { const old = conn; conn = null; try { old.close(); } catch {} }
    const c = peer.connect(hostId, { reliable: true, serialization: 'json' });
    conn = c;
    clearTimeout(openTimeout);
    openTimeout = setTimeout(() => { if (conn === c && !c.open) retry(0, true); }, 12000);
    c.on('open', () => {
      if (conn !== c) return;
      clearTimeout(openTimeout);
      lastMsg = Date.now(); everConnected = true;
      c.send({ t: 'hello', token: me.token, charId: me.charId });
      setStatus('connected');
    });
    c.on('data', msg => { if (conn !== c) return; lastMsg = Date.now(); if (status !== 'connected') setStatus('connected'); onMsg(msg); });
    c.on('close', () => { if (conn !== c) return; setStatus('reconnecting'); retry(1500); });
    c.on('error', () => { if (conn !== c) return; setStatus('reconnecting'); retry(2000); });
  }

  function retry(ms, fresh = false) {
    if (ended) return;
    clearTimeout(retryTimer);
    retryTimer = setTimeout(() => {
      if (ended) return;
      if (fresh || !peer || peer.destroyed) return newPeer();
      if (peer.disconnected) { try { peer.reconnect(); } catch { return newPeer(); } lastAttempt = Date.now(); return; }
      if (peer.open) openConn(); else newPeer();
    }, ms);
  }

  function send(o) { try { if (conn && conn.open) { conn.send(o); return true; } } catch {} toast('Not connected — reconnecting…'); retry(0); return false; }

  setInterval(() => {
    const now = Date.now();
    if (conn && conn.open) send({ t: 'ping' });
    if (status === 'connected' && now - lastMsg > 12000) { setStatus('reconnecting'); retry(0, true); }
    else if (status !== 'connected' && now - lastAttempt > 15000) retry(0, true);
  }, 4000);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    const away = hiddenAt ? Date.now() - hiddenAt : 0;
    if (!conn || !conn.open || Date.now() - lastMsg > 6000) { setStatus('reconnecting'); retry(0, away > 15000 || !peer || peer.disconnected); }
  });
  window.addEventListener('online', () => retry(0, true));

  function onMsg(msg) {
    if (!msg || typeof msg !== 'object') return;
    if (msg.t === 'state') {
      view = msg.view;
      if (leaving && !view.me) return returnHome();
      const strip = $('#vote-strip'), html = voteStripHtml(view.voteSummary);
      if (strip.innerHTML !== html) strip.innerHTML = html;
      window.__gg = { view };
      if (view.me !== me.charId) { me.charId = view.me; saveMe(); }
      render();
      atmosphere.update({ room, me: view.me, phase: view.phase, roundIndex: view.roundIndex, roundTitle: view.currentRound?.title, myVote: view.vote?.myVote }, view);
    } else if (msg.t === 'atmosphere') {
      atmosphere.cue(msg);
    } else if (msg.t === 'error') toast(msg.msg, 4000);
    else if (msg.t === 'ended') {
      ended = true;
      clearTimeout(leaveTimer);
      localStorage.removeItem(KEY);
      $('#leave-game').disabled = false;
      $('#leave-game').textContent = 'Return home';
      $('#vote-strip').innerHTML = '';
      atmosphere.update({ room, phase: 'connecting', roundIndex: -1 }, null);
      body.innerHTML = `<span class="candle">🕯️</span><h1>The candles are out</h1><p class="center">The host has ended this gathering. Thanks for playing!</p>`;
      lastHtml = '';
    }
  }

  // ---------- rendering ----------
  function render() {
    if (ended) return;
    const html = !view ? connectingHtml() : !view.me ? pickerHtml() : packetHtml();
    if (html === lastHtml) return;
    const open = new Set([...body.querySelectorAll('details[data-k]')].filter(d => d.open).map(d => d.dataset.k));
    const key = view ? `${view.me}|${view.phase}|${view.roundIndex}` : '';
    const isNewRound = view && view.me && prevKey !== null && key !== prevKey;
    body.innerHTML = html;
    body.querySelectorAll('details[data-k]').forEach(d => { if (open.has(d.dataset.k)) d.open = true; });
    lastHtml = html;
    if (isNewRound) {
      window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    if (view && view.me) prevKey = key; else prevKey = null;
  }

  function connectingHtml() {
    const waiting = status === 'waiting';
    return `<span class="candle">🕯️</span><h1>Grim Gatherings</h1>
      <div class="card center">
        <p style="font-size:1.2rem">${waiting ? `Waiting for the host to open room <b>${esc(room)}</b>…` : 'Summoning the host…'}</p>
        <p class="muted small">${waiting ? 'Make sure the host\'s screen is open. This page keeps trying on its own.' : 'This can take a few seconds.'}</p>
      </div>
      <p class="center"><a href="${esc(baseUrl())}">Wrong room code?</a></p>`;
  }

  function pickerHtml() {
    return `<span class="candle">🕯️</span><h1>${esc(view.title)}</h1>
      <div class="card"><div class="label">Who are you?</div><p>Tap <b>your own name</b> to receive your secret character packet. Don't peek at anyone else's!</p></div>
      <div id="picker">${view.roster.map(c => `<button class="pick ${c.claimed ? 'taken' : ''}" data-claim="${esc(c.id)}" ${c.claimed ? 'disabled' : ''}>
        <span class="g">${esc(c.guest || c.name)}${c.claimed ? ' <span class="small muted">· taken</span>' : ''}</span>
        <span class="c">${c.guest ? `as ${esc(c.name)} — ${esc(c.role)}` : esc(c.role)}</span></button>`).join('')}</div>
      <p class="small muted center">Your name not here, or already taken? Ask the host.</p>`;
  }

  function cluesBlock(r) {
    return `${r.clues.length ? `<ul class="secrets clue-cards">${r.clues.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : '<p class="muted">No new clues for you this round.</p>'}
      ${r.instructions ? `<div class="label" style="margin-top:12px">What to do</div><p>${esc(r.instructions)}</p>` : ''}`;
  }

  function packetHtml() {
    const p = view.packet, v = view;
    let phaseCard = '';
    if (v.phase === 'round' && v.currentRound) {
      const r = p.rounds[v.roundIndex];
      phaseCard = `<div class="card blood" id="phase-card"><div class="label">Round ${v.roundIndex + 1} of ${v.roundsTotal}</div>
        <h2 id="round-title">${esc(v.currentRound.title)}</h2>${paras(v.currentRound.publicText)}
        <hr><div class="label">🔒 Your secret clues</div><div id="my-clues">${r ? cluesBlock(r) : ''}</div></div>`;
    } else if (v.phase === 'vote') {
      phaseCard = `<div class="card blood" id="phase-card"><div class="label">Round ${v.roundIndex + 1} · The accusation</div><h2>${esc(v.vote.prompt)}</h2>
        <p>Tap the person you accuse. You can change your mind until the host closes this round's voting. Every round counts equally in the running vote share.</p>
        <div id="vote-list">${v.vote.suspects.filter(s => s.id !== v.me).map(s => `<button class="vote-btn ${v.vote.myVote === s.id ? 'on' : ''}" data-vote="${esc(s.id)}">${v.vote.myVote === s.id ? '🔪 ' : ''}${esc(s.name)}${s.guest ? ` <span class="small">(${esc(s.guest)})</span>` : ''}</button>`).join('')}</div>
        <p id="my-vote" class="small ${v.vote.myVote ? '' : 'muted'}">${v.vote.myVote ? 'Your vote is in. ✓' : 'You have not voted yet.'}</p></div>`;
    } else if (v.phase === 'reveal') {
      const rv = v.reveal, mine = v.vote?.myVote;
      phaseCard = `<div class="card blood" id="phase-card"><div class="label">The truth</div>
        <p class="center muted">The murderer was…</p><div class="reveal-name" id="reveal-killer">${esc(rv.killerName)}</div>
        ${rv.killerGuest ? `<p class="center">played by <b>${esc(rv.killerGuest)}</b></p>` : ''}
        ${p.isKiller ? `<p class="center"><span class="pill bad">That's you! ${(rv.tally[rv.killerId] || 0) ? 'They caught you.' : 'You got away with it…'}</span></p>` : mine ? `<p class="center"><span class="pill ${mine === rv.killerId ? 'ok' : 'bad'}">${mine === rv.killerId ? 'You guessed right!' : 'You accused the wrong person…'}</span></p>` : ''}
        ${paras(rv.revealNarration)}<hr><div class="label">What really happened</div>${paras(rv.explanation)}</div>`;
    } else {
      phaseCard = `<div class="card" id="phase-card"><div class="label">Before the game begins</div>
        <p>Read your character below and keep your secrets close. When the host begins, your clues will appear right here.</p>
        <details data-k="intro" open><summary>The story so far</summary>${paras(v.intro)}<p class="muted small">${esc(v.setting)}</p></details></div>`;
    }
    const earlier = p.rounds.filter(r => v.phase !== 'round' || r.index < v.roundIndex);
    return `
      <div class="card gold character-envelope" id="character-envelope"><div class="wax-seal" aria-hidden="true">GG</div><div class="label">Your private invitation · You are</div><h2 id="packet-name" style="font-size:1.8rem;margin:.1em 0">${esc(p.name)}</h2>
        <p style="margin:0"><i>${esc(p.role)}</i></p>
        ${p.guest ? `<p class="small muted" style="margin-bottom:0">Played by ${esc(p.guest)}${p.guestNote ? ` — lean into it: <i>${esc(p.guestNote)}</i>` : ''}</p>` : ''}</div>
      ${phaseCard}
      ${earlier.length ? `<details data-k="earlier" ${v.phase !== 'round' ? 'open' : ''}><summary>Your clues from ${v.phase === 'round' ? 'earlier rounds' : 'every round'} (${earlier.length})</summary>
        ${earlier.map(r => `<h3>${esc(r.title)}</h3>${cluesBlock(r)}`).join('<hr>')}</details>` : ''}
      <div class="card" id="character-sheet">
        ${p.isKiller ? '<p class="center"><span class="pill bad" style="font-size:1rem">🔪 YOU ARE THE MURDERER — keep it secret. You may lie.</span></p>' : ''}
        <div class="label">What everyone knows about you</div>${paras(p.publicBlurb)}
        <div class="label" style="margin-top:14px">🔒 Your backstory</div>${paras(p.backstory)}
        <div class="label" style="margin-top:14px">🔒 Your secrets</div><ul class="secrets" id="my-secrets">${p.secrets.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
        <div class="label" style="margin-top:14px">🔒 Your motive</div>${paras(p.motive)}
      </div>
      <details data-k="cast"><summary>Who's who (public)</summary>
        ${v.victim.name ? `<p><b>The victim:</b> ${esc(v.victim.name)}${v.victim.description ? ` — ${esc(v.victim.description)}` : ''}</p>` : ''}
        <ul class="clean">${v.roster.map(c => `<li style="margin:10px 0"><b>${esc(c.name)}</b>${c.guest ? ` <span class="muted">(${esc(c.guest)})</span>` : ''} — <i>${esc(c.role)}</i><br><span class="small">${esc(c.publicBlurb)}</span></li>`).join('')}</ul></details>
      <p class="footer">Wrong character? <button class="secondary small" data-unclaim="1">Switch</button></p>`;
  }

  body.addEventListener('click', e => {
    const claim = e.target.closest('[data-claim]');
    if (claim && !claim.disabled) { if (send({ t: 'claim', charId: claim.dataset.claim, token: me.token })) claim.textContent = 'Opening your packet…'; return; }
    const vote = e.target.closest('[data-vote]');
    if (vote) {
      if (send({ t: 'vote', suspect: vote.dataset.vote, roundIndex: view.roundIndex })) {
        lastHtml = '';
        body.querySelectorAll('.vote-btn').forEach(b => b.classList.toggle('on', b === vote));
        const mv = $('#my-vote'); if (mv) mv.textContent = 'Sending your vote…';
      }
      return;
    }
    if (e.target.closest('[data-unclaim]')) {
      if (confirm('Give up this character and pick again?')) send({ t: 'unclaim' });
    }
  });

  render();
  newPeer();
}
