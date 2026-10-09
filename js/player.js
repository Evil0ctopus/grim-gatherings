// Guest (phone) side. Connects to the host's peer id, claims a character, renders ONLY its own packet.
import { $, esc, paras, uid, toast, baseUrl, PEER_PREFIX } from './util.js?v=f1ed522';
import { createAtmosphere } from './atmosphere.js?v=ui-refresh-v1';
import { voteStripHtml } from './voting.js?v=vote-panel-v1';
import { createPlayerConnection } from './player-connection.js?v=visitor-review-v1';
import { confirmAction } from './dialog.js?v=ui-refresh-v1';
import { RELEASE_ONLY } from './site-policy.js?v=lockdown-release-v1';

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

  let view = null, status = 'connecting', connectionDetail = '';
  let lastHtml = '', prevKey = null, ended = false, replaced = false;
  let leaving = false, leaveTimer = null, pendingAction = false;
  const app = document.getElementById('app');
  app.className = '';
  app.innerHTML = `<div class="statusbar"><span>Room <b>${esc(room)}</b></span><details class="vote-strip" id="vote-strip">${voteStripHtml({ rounds: [], suspects: [], total: 0, leaders: [] })}</details><span id="pstatus" class="pill wait">connecting…</span></div><div class="game-exit"><button class="secondary small" id="leave-game">Leave game → Home</button><button class="secondary small" id="reconnect-game">Reconnect to room</button></div><div id="connection-help" class="card" role="status" aria-live="polite"></div><div id="pbody"></div>`;
  const body = $('#pbody');
  function returnHome() {
    clearTimeout(leaveTimer);
    ended = true;
    if (!replaced) localStorage.removeItem(KEY);
    network.stop();
    location.href = baseUrl();
  }
  $('#leave-game').addEventListener('click', async () => {
    if (ended || !me.charId) return returnHome();
    if (!await confirmAction('Leave this game and return home? Your character will be released for someone else. If disconnected, the host may need to release it manually.')) return;
    if (status !== 'connected') return returnHome();
    if (leaving) return;
    leaving = true;
    $('#leave-game').disabled = true;
    if (!send({ t: 'unclaim' })) {
      leaving = false;
      $('#leave-game').disabled = false;
      return;
    }
    leaveTimer = setTimeout(async () => {
      leaving = false;
      $('#leave-game').disabled = false;
      if (await confirmAction('The host did not confirm releasing your character. Return home anyway? The host may need to release it manually.')) returnHome();
    }, 4000);
  });

  function setStatus(s, detail = '') {
    if (s === 'connected' && status !== 'connected') lastHtml = '';
    status = s;
    connectionDetail = detail;
    const el = $('#pstatus');
    const map = { connected: ['ok', 'connected'], connecting: ['wait', 'connecting…'], reconnecting: ['wait', 'reconnecting…'], waiting: ['wait', 'waiting for host…'], offline: ['bad', 'offline'] };
    const [cls, txt] = map[s] || ['wait', s];
    el.className = 'pill ' + cls; el.textContent = txt;
    const help = $('#connection-help');
    help.hidden = s === 'connected';
    help.textContent = detail + (view ? ' Showing your last received clues; voting and character changes wait for reconnection.' : '');
    body.querySelectorAll('[data-claim], [data-vote], [data-unclaim]').forEach(button => {
      button.disabled = s !== 'connected' || (button.hasAttribute('data-claim') && view?.roster.find(c => c.id === button.dataset.claim)?.claimed);
    });
    if (!view) render();
  }

  // ---------- networking ----------
  const network = createPlayerConnection({
    createPeer: () => {
      if (typeof window.Peer !== 'function') throw new Error('The connection library did not load. Reload the page.');
      return new window.Peer({ debug: 1 });
    },
    hostId,
    hello: () => ({ t: 'hello', token: me.token, charId: me.charId }),
    onMessage: onMsg,
    onStatus: setStatus,
  });

  function send(message) {
    pendingAction = true;
    if (network.send(message)) return true;
    pendingAction = false;
    toast('Not connected - reconnecting without changing your character.', 4000);
    network.reconnect();
    return false;
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !ended && !replaced) network.resume();
  });
  window.addEventListener('pagehide', () => network.suspend());
  window.addEventListener('pageshow', event => { if (event.persisted && !ended && !replaced) network.resume(); });
  window.addEventListener('online', () => { if (!ended && !replaced) network.reconnect(); });
  window.addEventListener('offline', () => { if (!ended && !replaced) network.reconnect(); });
  $('#reconnect-game').addEventListener('click', () => { replaced = false; network.reconnect(); });

  function onMsg(msg) {
    if (!msg || typeof msg !== 'object') return;
    if (msg.t === 'state') {
      if (RELEASE_ONLY && msg.view?.edition?.family !== 'lockdown') {
        toast('This game is available only on the development website.', 6000);
        return;
      }
      view = msg.view;
      if (pendingAction) { pendingAction = false; lastHtml = ''; }
      if (leaving && !view.me) return returnHome();
      const strip = $('#vote-strip'), html = voteStripHtml(view.voteSummary);
      if (strip.innerHTML !== html) strip.innerHTML = html;
      window.__gg = { view };
      if (view.me !== me.charId) { me.charId = view.me; saveMe(); }
      render();
      atmosphere.update({ room, me: view.me, phase: view.phase, roundIndex: view.roundIndex, roundTitle: view.currentRound?.title, myVote: view.vote?.myVote }, view);
    } else if (msg.t === 'superseded') {
      replaced = true;
      network.suspend();
      setStatus('offline', 'Your character is connected in another tab on this device. Use that tab, or tap Reconnect to room to use this one instead.');
    } else if (msg.t === 'atmosphere') {
      atmosphere.cue(msg);
    } else if (msg.t === 'error') toast(msg.msg, 4000);
    else if (msg.t === 'ended') {
      ended = true;
      network.stop();
      clearTimeout(leaveTimer);
      localStorage.removeItem(KEY);
      $('#leave-game').disabled = false;
      $('#leave-game').textContent = 'Return home';
      $('#reconnect-game').hidden = true;
      $('#connection-help').hidden = true;
      $('#vote-strip').innerHTML = '';
      atmosphere.update({ room, phase: 'connecting', roundIndex: -1 }, null);
      body.innerHTML = `<span class="candle">🕯️</span><h1>The candles are out</h1><p class="center">The host has ended this gathering. Thanks for playing!</p>`;
      lastHtml = '';
    }
  }

  // ---------- rendering ----------
  function render() {
    if (ended) return;
    const html = (!view ? connectingHtml() : !view.me ? pickerHtml() : packetHtml()) +
      (view?.playtestNotice ? `<p class="small muted" role="note">${esc(view.playtestNotice)}</p>` : '');
    if (html === lastHtml) return;
    const open = new Set([...body.querySelectorAll('details[data-k]')].filter(d => d.open).map(d => d.dataset.k));
    const key = view ? `${view.me}|${view.phase}|${view.roundIndex}|${view.currentRound?.currentReaderId || ''}` : '';
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
        <p class="muted small">${esc(connectionDetail || 'This can take a few seconds.')}</p>
        <p class="small muted">This page retries automatically. If it keeps waiting, tap Reconnect to room, confirm the host shows Live, and try Wi-Fi or mobile data. You do not need to restart the game.</p>
      </div>
      <p class="center"><a href="${esc(baseUrl())}">Wrong room code?</a></p>`;
  }

  function pickerHtml() {
    return `<span class="candle">🕯️</span><h1>${esc(view.title)}</h1>
      <div class="card"><div class="label">Who are you?</div><p>Tap <b>your own name</b> to meet your character and receive the clue you will read aloud each round.</p></div>
      <div id="picker">${view.roster.map(c => `<button class="pick ${c.claimed ? 'taken' : ''}" data-claim="${esc(c.id)}" ${c.claimed ? 'disabled' : ''}>
        <span class="g">${esc(c.guest || c.name)}${c.claimed ? ' <span class="small muted">· taken</span>' : ''}</span>
        <span class="c">${c.guest ? `as ${esc(c.name)} — ${esc(c.role)}` : esc(c.role)}</span></button>`).join('')}</div>
      <p class="small muted center">Your name not here, or already taken? Ask the host.</p>`;
  }

  function cluesBlock(r) {
    return `<div class="card gold read-aloud-clue"><div class="label">Read aloud to everyone</div>
      ${r.readAloud.isGhost ? '<p class="small muted"><b>Your character has returned as a ghost.</b> Read this short story-specific part along with your clue.</p>' : ''}
      <h3>Evidence against ${esc(r.readAloud.targetName)}</h3>
      ${paras(r.readAloud.text)}
      ${r.readAloud.ghostPart ? `<div class="card"><div class="label">Ghost part</div>${paras(r.readAloud.ghostPart)}</div>` : ''}
      <p class="small muted">Read this clue in full on your turn. This is evidence to discuss, not your vote.</p></div>`;
  }

  function packetHtml() {
    const p = view.packet, v = view;
    let phaseCard = '';
    if (v.phase === 'round' && v.currentRound) {
      const r = p.rounds[v.roundIndex];
      const chain = v.currentRound.chain || [];
      const currentReader = chain[v.currentRound.chainIndex];
      phaseCard = `<div class="card blood" id="phase-card"><div class="label">Round ${v.roundIndex + 1} of ${v.roundsTotal}</div>
        <h2 id="round-title">${esc(v.currentRound.title)}</h2>${paras(v.currentRound.publicText)}
        <details data-k="narration"><summary>The host's narration</summary>${paras(v.currentRound.narration)}</details>
        <div class="card"><div class="label">Who's reading</div>
        ${v.currentRound.readingGroup && currentReader ? `<p class="small muted">${esc(v.currentRound.readingGroup)}</p>` : ''}
        <p class="turn-indicator${currentReader?.id === v.me ? ' your-turn' : !currentReader ? ' complete' : ''}" id="current-reader" role="status" aria-live="polite" aria-atomic="true">${currentReader?.id === v.me ? 'You are next to read.' : currentReader ? `Waiting for ${esc(currentReader.name)}${currentReader.guest ? ` (${esc(currentReader.guest)})` : ''} to read.` : 'Everyone has read this round’s clue.'}</p></div>
        <hr><div id="my-clues">${r ? cluesBlock(r) : ''}</div></div>`;
    } else if (v.phase === 'deliberation' && v.currentRound) {
      const last = v.roundIndex === v.roundsTotal - 1;
      phaseCard = `<div class="card blood" id="phase-card"><div class="label">${last ? 'Final accusations' : `Round ${v.roundIndex + 1} · Deliberation`}</div>
        <h2>${last ? 'Discuss before the final vote' : 'Discuss the evidence'}</h2>
        ${last ? paras(v.deliberation.finalNarration) : '<p>Compare the observations with the physical details. Discuss what the group believes before voting opens.</p>'}
        <p><b>${esc(v.deliberation.prompt)}</b></p>
        <p class="small muted">The host will open the vote after deliberation.</p></div>`;
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
        <p>When the host begins the read-around, read your character’s name, role, relationship, tie-in and public introduction aloud. The group may discuss or make accusations based only on the setup and character cards before Round 1. All story evidence comes from the host’s narration and clues read to the room.</p>
        <details data-k="intro" open><summary>The story so far</summary>${paras(v.intro)}<p class="muted small">${esc(v.setting)}</p></details></div>`;
    }
    const earlier = p.rounds.filter(r => v.phase !== 'round' || r.index < v.roundIndex);
    const history = v.evidenceHistory || [];
    const aboutMe = history.map(r => ({ ...r, clue: r.accusations.find(c => c.accuses === v.me) }));
    return `
      <div class="card gold character-envelope" id="character-envelope"><div class="wax-seal" aria-hidden="true">GG</div><div class="label">Your character · You are</div><h2 id="packet-name" style="font-size:1.8rem;margin:.1em 0">${esc(p.name)}</h2>
        <p style="margin:0"><i>${esc(p.role)}</i></p>
        ${p.relationship ? `<p class="small" style="margin:.2em 0"><b>Relationship:</b> ${esc(p.relationship)}</p>` : ''}
        ${p.tieIn ? `<p class="small" style="margin:.2em 0"><b>Tie to the event:</b> ${esc(p.tieIn)}</p>` : ''}
        ${p.guest ? `<p class="small muted" style="margin-bottom:0">Played by ${esc(p.guest)}${p.guestNote ? ` — lean into it: <i>${esc(p.guestNote)}</i>` : ''}</p>` : ''}</div>
      ${phaseCard}
      ${history.length ? `<details data-k="my-case" id="my-case" open><summary>How the evidence against you has changed (${history.length} rounds)</summary>
        <p class="small muted">Keep the earlier suspicion and its later explanation together. These are the public clues, not a verdict or automatic clearance.</p>
        ${aboutMe.map(r => `<article class="personal-evidence"><h3>${esc(r.title)}</h3><p class="small muted">Read by ${esc(r.clue.speakerName)}</p>${paras(r.clue.text)}</article>`).join('<hr>')}</details>
        <details data-k="evidence" id="evidence-history"><summary>The room's evidence notebook (${history.length} rounds)</summary>
        <p class="small muted">The complete spoken narration and read-aloud clues become available here when each round moves to voting.</p>
        ${history.map(r => `<section><h3>${esc(r.title)}</h3>${paras(r.narration)}
          ${r.accusations.map(c => `<details><summary>${esc(c.targetName)} · read by ${esc(c.speakerName)}</summary>${paras(c.text)}</details>`).join('')}</section>`).join('<hr>')}</details>` : ''}
      ${earlier.length ? `<details data-k="earlier" ${v.phase !== 'round' ? 'open' : ''}><summary>Your clues from ${v.phase === 'round' ? 'earlier rounds' : 'every round'} (${earlier.length})</summary>
        ${earlier.map(r => `<h3>${esc(r.title)}</h3>${cluesBlock(r)}`).join('<hr>')}</details>` : ''}
      <div class="card" id="character-sheet">
        ${p.isKiller && v.phase !== 'reveal' ? '<p class="center"><span class="pill bad" id="killer-notification" style="font-size:1rem">🔪 YOU ARE THE MURDERER. The host enabled this notification. Read your clue exactly and defend your interpretation without inventing new events.</span></p>' : ''}
        <div class="label">What everyone knows about you</div>${paras(p.publicBlurb)}
      </div>
      <details data-k="cast"><summary>Who's who (public)</summary>
        ${v.victim.name ? `<p><b>The victim:</b> ${esc(v.victim.name)}${v.victim.description ? ` — ${esc(v.victim.description)}` : ''}</p>` : ''}
        <ul class="clean">        ${v.roster.map(c => `<li style="margin:10px 0"><b>${esc(c.name)}</b>${c.isGhost ? ' <span class="pill">Ghost</span>' : ''}${c.guest ? ` <span class="muted">(${esc(c.guest)})</span>` : ''} — <i>${esc(c.role)}</i>${c.relationship ? `<br><span class="small"><b>Relationship:</b> ${esc(c.relationship)}</span>` : ''}${c.tieIn ? `<br><span class="small"><b>Tie to the event:</b> ${esc(c.tieIn)}</span>` : ''}<br><span class="small">${esc(c.publicBlurb)}</span></li>`).join('')}</ul></details>
      <p class="footer">Wrong character? <button class="secondary small" data-unclaim="1">Switch</button></p>`;
  }

  body.addEventListener('click', async e => {
    const claim = e.target.closest('[data-claim]');
    if (claim && !claim.disabled) { if (send({ t: 'claim', charId: claim.dataset.claim, token: me.token })) claim.textContent = 'Opening your packet…'; return; }
    const vote = e.target.closest('[data-vote]');
    if (vote && !vote.disabled) {
      if (send({ t: 'vote', suspect: vote.dataset.vote, roundIndex: view.roundIndex })) {
        lastHtml = '';
        body.querySelectorAll('.vote-btn').forEach(b => b.classList.toggle('on', b === vote));
        const mv = $('#my-vote'); if (mv) mv.textContent = 'Sending your vote…';
      }
      return;
    }
    if (e.target.closest('[data-unclaim]:not(:disabled)')) {
      if (await confirmAction('Give up this character and pick again?')) send({ t: 'unclaim' });
    }
  });

  render();
  network.start();
}
