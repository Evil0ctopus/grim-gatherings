// Mafia phone screen. Receives only viewFor(state, me) from the table screen; never sees anyone else's secret role.
import { $, esc, uid, toast } from '../util.js?v=f1ed522';
import { createPlayerConnection } from '../player-connection.js?v=visitor-review-v1';
import { ROLE_INFO } from './engine.js?v=mafia-v2';
import { MAFIA_PEER_PREFIX } from './host.js?v=mafia-v2';

const TASK_TEXT = {
  kill: { title: 'Choose tonight\'s victim', hint: 'All mafia must pick the same player. You can change your pick until you agree.', button: 'Mark' },
  protect: { title: 'Choose someone to protect', hint: 'If the mafia target this player tonight, they survive. You may protect yourself.', button: 'Protect' },
  investigate: { title: 'Choose someone to investigate', hint: 'You will learn privately whether they are mafia.', button: 'Investigate' },
  suspect: { title: 'Who do you suspect?', hint: 'You have no night power. Pick a suspect so your phone looks as busy as everyone else\'s.', button: 'Suspect' },
};

export function startMafiaPlayer(room) {
  const app = $('#app');
  const key = 'gg-mafia-player-v1-' + room.toUpperCase();
  let me;
  try { me = JSON.parse(localStorage.getItem(key) || 'null'); } catch { me = null; }
  if (!me?.token) me = { token: uid(20), name: '', joined: false };
  const saveMe = () => { try { localStorage.setItem(key, JSON.stringify(me)); } catch { /* private mode */ } };
  saveMe();

  let view = null, offset = 0, status = 'connecting', statusDetail = '', network = null, ended = false, reveal = false, peek = false;

  const nameOf = id => esc(view?.roster.find(p => p.id === id)?.name ?? '?');

  function connect() {
    if (network) return;
    network = createPlayerConnection({
      createPeer: () => {
        if (typeof window.Peer !== 'function') throw new Error('The connection library did not load. Reload the page.');
        return new window.Peer({ debug: 1 });
      },
      hostId: MAFIA_PEER_PREFIX + room.toLowerCase(),
      hello: () => ({ t: 'hello', token: me.token, name: me.name }),
      onStatus: (s, detail) => { status = s; statusDetail = detail || ''; renderStatus(); },
      onMessage: msg => {
        if (msg.t === 'state') {
          if (typeof msg.now === 'number') offset = msg.now - Date.now();
          const prevPhase = view?.phase, prevGame = view?.gameNumber;
          view = msg.view;
          if (view.phase !== 'reveal' || prevGame !== view.gameNumber || prevPhase !== 'reveal') reveal = false;
          if (!me.joined) { me.joined = true; saveMe(); }
          if (navigator.vibrate && prevPhase && prevPhase !== view.phase && ['reveal', 'night', 'vote', 'over'].includes(view.phase)) navigator.vibrate(120);
          render();
        } else if (msg.t === 'error') {
          if (!view) { network.stop(); network = null; me.joined = false; saveMe(); renderJoin(msg.message); }
          else toast(msg.message, 4000);
        } else if (msg.t === 'ended') {
          ended = true; network.stop(); network = null;
          me = { token: uid(20), name: me.name, joined: false }; saveMe(); view = null;
          renderJoin(msg.reason === 'removed' ? 'The host removed you from the lobby.' : 'You left the room.');
        } else if (msg.t === 'superseded') {
          ended = true; network.stop(); network = null;
          app.innerHTML = '<section class="mafia-phone"><div class="card center"><h2>Opened elsewhere</h2><p>Your seat is now open on another tab or device.</p><button class="btn" id="take-back">Use this screen instead</button></div></section>';
          $('#take-back').onclick = () => { ended = false; connect(); };
        }
      },
    });
    network.start();
    renderStatus();
  }

  function act(msg) {
    if (!network?.send(msg)) toast('Not connected yet. Hold on a moment.');
  }

  // ---------- rendering ----------
  function renderJoin(error = '') {
    app.innerHTML = `<section class="mafia-phone">
      <header class="mafia-head"><a class="small muted" href="./">&larr; Grim Gatherings</a><h1>Mafia</h1><p class="muted">Room <strong>${esc(room.toUpperCase())}</strong></p></header>
      <form class="card" id="join-form"><h2>Join the table</h2>
        ${error ? `<p class="error-line">${esc(error)}</p>` : ''}
        <label for="mafia-name">Your name</label>
        <input id="mafia-name" maxlength="24" autocomplete="nickname" required value="${esc(me.name)}" placeholder="What should the town call you?">
        <button class="btn block" type="submit">Join</button>
        <p class="small muted">Keep your phone private once the game starts &mdash; your role is secret.</p>
      </form></section>`;
    $('#join-form').onsubmit = e => {
      e.preventDefault();
      const nm = $('#mafia-name').value.trim().replace(/\s+/g, ' ');
      if (!nm) return;
      me.name = nm.slice(0, 24); saveMe();
      ended = false;
      app.innerHTML = '<section class="mafia-phone"><div class="card center"><p>Joining&hellip;</p><p id="mafia-status" class="small muted"></p></div></section>';
      connect();
    };
  }

  function renderStatus() {
    const el = $('#mafia-status');
    if (!el) return;
    el.textContent = status === 'connected' ? '' : statusDetail || 'Connecting…';
  }

  function timer() {
    return view.endsAt ? `<div class="mafia-timer" data-ends="${view.endsAt}">--:--</div>` : '';
  }

  function roleCard() {
    const r = view.me.role, info = ROLE_INFO[r];
    const team = view.team ? `<p class="team-line">Your mafia team: ${view.team.map(t => `<strong class="${t.alive ? '' : 'dead'}">${esc(t.name)}${t.id === view.me.id ? ' (you)' : ''}</strong>`).join(', ')}</p>` : '';
    const intel = view.investigations?.length ? `<ul class="intel">${view.investigations.map(i => `<li>Night ${i.night}: ${nameOf(i.target)} is <strong class="${i.guilty ? 'guilty' : 'innocent'}">${i.guilty ? 'MAFIA' : 'innocent'}</strong></li>`).join('')}</ul>` : '';
    return `<div class="role-card ${r}"><p class="small">You are</p><h2>${info.name}</h2><p>${info.blurb}</p>${team}${intel}</div>`;
  }

  function peekBlock() {
    return `<div class="peek">${peek ? roleCard() : ''}<button class="btn secondary block" id="peek">${peek ? 'Hide my role' : 'Peek at my role'}</button></div>`;
  }

  function aliveList() {
    return `<ul class="mafia-roster">${view.roster.map(p => `<li class="${p.alive ? '' : 'dead'}">${esc(p.name)}${p.id === view.me.id ? ' <span class="small muted">(you)</span>' : ''}${p.alive ? '' : ' <span class="small muted">eliminated</span>'}${p.role ? ` <span class="role-tag ${p.role}">${ROLE_INFO[p.role].name}</span>` : ''}</li>`).join('')}</ul>`;
  }

  function announcementHtml() {
    const a = view.announcement;
    if (!a) return '';
    if (!a.killed) return `<p class="announce">Night ${a.night}: nobody died.</p>`;
    return `<p class="announce">Night ${a.night}: <strong>${nameOf(a.killed)}</strong> was killed${a.role ? ` &mdash; they were the ${ROLE_INFO[a.role].name}` : ''}.</p>`;
  }

  function verdictHtml() {
    const v = view.verdict;
    if (!v) return '';
    if (!v.eliminated) return `<p class="announce">Day ${v.day}: ${v.tie ? 'the vote tied' : 'no votes were cast'} &mdash; nobody was eliminated.</p>`;
    return `<p class="announce">Day ${v.day}: <strong>${nameOf(v.eliminated)}</strong> was voted out${v.role ? ` &mdash; they were the ${ROLE_INFO[v.role].name}` : ''}.</p>`;
  }

  function nightHtml() {
    if (!view.me.alive) return `<div class="card night center"><div class="moon" aria-hidden="true"></div><h2>Night ${view.night}</h2><p>You are dead. Keep your eyes closed and stay silent.</p></div>`;
    const t = TASK_TEXT[view.task];
    const picks = view.mafiaPicks || {};
    const done = view.task === 'kill' ? !!view.consensus : !!view.myPick;
    const locked = view.task !== 'kill' && !!view.myPick;
    let extra = '';
    if (view.task === 'kill') {
      const mates = view.team.filter(m => m.alive);
      extra = `<div class="mafia-picks">${mates.map(m => `<p>${esc(m.name)}${m.id === view.me.id ? ' (you)' : ''}: ${picks[m.id] ? `<strong>${nameOf(picks[m.id])}</strong>` : '<span class="muted">choosing&hellip;</span>'}</p>`).join('')}
        <p class="${view.consensus ? 'ok-line' : 'small muted'}">${view.consensus ? `Agreed: ${nameOf(view.consensus)}. Close your eyes.` : mates.length > 1 ? 'Your team must all pick the same victim.' : 'Your pick is final when chosen; you can change it until the night ends.'}</p></div>`;
    }
    if (view.task === 'investigate' && view.myPick) {
      const r = view.investigations.find(i => i.night === view.night);
      extra = r ? `<p class="result ${r.guilty ? 'guilty' : 'innocent'}">${nameOf(r.target)} is ${r.guilty ? 'MAFIA' : 'innocent'}.</p>` : '';
    }
    const buttons = view.targets.map(id => `<button class="target ${view.myPick === id ? 'picked' : ''}" data-target="${esc(id)}"${locked ? ' disabled' : ''}>${nameOf(id)}${id === view.me.id ? ' (you)' : ''}</button>`).join('');
    return `<div class="card night"><p class="phase-name">Night ${view.night}</p><h2>${t.title}</h2><p class="small muted">${t.hint}</p>
      <div class="targets">${buttons}</div>${extra}
      ${done ? '<p class="center ok-line">Done. Close your eyes and wait for dawn.</p>' : ''}
      <p class="small muted center">${view.nightProgress.done} of ${view.nightProgress.of} phones done</p></div>`;
  }

  function voteHtml() {
    const counts = {};
    for (const [voter, target] of Object.entries(view.votes)) (counts[target] ||= []).push(voter);
    const alive = view.roster.filter(p => p.alive);
    if (!view.me.alive) {
      return `<div class="card"><h2>The town is voting</h2><p class="muted">You are eliminated and cannot vote.</p>${tallyRows(alive, counts, false)}</div>`;
    }
    return `<div class="card"><p class="phase-name">Day ${view.day} vote</p><h2>Who should be eliminated?</h2>${timer()}
      <p class="small muted">Tap a name to vote. You can change your vote until voting closes. Most votes is eliminated; a tie eliminates no one.</p>
      ${tallyRows(alive, counts, true)}
      <p class="small muted center">${Object.keys(view.votes).length} of ${alive.length} votes in</p></div>`;
  }

  function tallyRows(alive, counts, interactive) {
    return `<div class="mafia-tally">${alive.map(p => {
      const voters = counts[p.id] || [];
      const mine = view.myVote === p.id, self = p.id === view.me.id;
      const label = `<strong>${esc(p.name)}${self ? ' (you)' : ''}</strong><span class="tally-count">${voters.length}</span><span class="small muted">${voters.map(nameOf).join(', ')}</span>`;
      return interactive && !self
        ? `<button class="tally-row vote ${mine ? 'picked' : ''}" data-vote="${esc(p.id)}">${label}</button>`
        : `<div class="tally-row">${label}</div>`;
    }).join('')}</div>`;
  }

  function render() {
    if (!view) return;
    if (view.phase === 'lobby') {
      app.innerHTML = `<section class="mafia-phone"><header class="mafia-head"><h1>Mafia</h1><p class="muted">Room ${esc(room.toUpperCase())}</p></header>
        <div class="card"><h2>You're in, ${esc(view.me?.name)}</h2><p>${view.roster.length} player${view.roster.length === 1 ? '' : 's'} at the table. The host will deal roles when everyone has joined.</p>
        ${view.counts ? `<p class="small">This deal: ${view.counts.mafia} Mafia, 1 Doctor, 1 Detective, ${view.counts.town} Town.</p>` : `<p class="small muted">At least ${view.min} players are needed.</p>`}
        ${aliveList()}<button class="btn secondary" id="leave">Leave room</button></div>
        <p id="mafia-status" class="small muted center"></p></section>`;
      $('#leave').onclick = () => act({ t: 'leave' });
      renderStatus();
      return;
    }
    const p = view.phase;
    let body = '';
    if (p === 'reveal') {
      body = reveal
        ? `${roleCard()}${view.me.ready ? `<p class="center muted">Waiting for everyone else (${view.readyCount} of ${view.roster.length}).</p>` : '<button class="btn block" id="ready">I\'ve seen my role</button>'}<button class="btn secondary block" id="hide">Hide</button>`
        : `<button class="role-back" id="reveal"><span>Tap to reveal your role</span><span class="small">Make sure nobody can see your screen.</span></button>${view.me.ready ? `<p class="center muted">Waiting for everyone else (${view.readyCount} of ${view.roster.length}).</p>` : ''}`;
    } else if (p === 'night') {
      body = nightHtml();
    } else if (p === 'dawn') {
      body = `<div class="card center"><p class="phase-name">Dawn &middot; day ${view.day}</p>${announcementHtml()}${view.me.alive ? '' : '<p class="dead-line">You are dead. Stay silent.</p>'}</div>${peekBlock()}`;
    } else if (p === 'day') {
      body = `<div class="card"><p class="phase-name">Day ${view.day} &middot; discussion</p>${timer()}${announcementHtml()}${view.me.alive ? '<p>Talk it out. Voting opens when the timer ends.</p>' : '<p class="dead-line">You are eliminated. You may watch, but do not speak.</p>'}${aliveList()}</div>${peekBlock()}`;
    } else if (p === 'vote') {
      body = voteHtml() + peekBlock();
    } else if (p === 'verdict') {
      body = `<div class="card center"><p class="phase-name">Verdict</p>${verdictHtml()}${view.me.alive ? '<p class="muted">Night will fall soon.</p>' : '<p class="dead-line">You are eliminated. Watch in silence.</p>'}</div>${peekBlock()}`;
    } else if (p === 'over') {
      const won = ROLE_INFO[view.me.role].team === view.winner;
      body = `<div class="card center win-${view.winner}"><p class="phase-name">Game over</p><h2>${view.winner === 'town' ? 'The town wins' : 'The mafia win'}</h2><p class="${won ? 'ok-line' : 'dead-line'}">${won ? 'Your side won.' : 'Your side lost.'}</p>${verdictHtml() || announcementHtml()}</div>
        <div class="card"><h2>Everyone's roles</h2>${aliveList()}</div><p class="center small muted">Waiting for the host to play again with new roles.</p>`;
    }
    const banner = view.me.alive || p === 'over' ? '' : '<div class="spectator-banner">Spectator &mdash; you have been eliminated</div>';
    app.innerHTML = `<section class="mafia-phone phase-${p}">${banner}<header class="mafia-head compact"><span class="small muted">Mafia &middot; ${esc(view.me.name)}</span></header>${body}<p id="mafia-status" class="small muted center"></p></section>`;
    const on = (sel, fn) => { const el = $(sel); if (el) el.onclick = fn; };
    on('#reveal', () => { reveal = true; render(); });
    on('#hide', () => { reveal = false; render(); });
    on('#ready', () => act({ t: 'ready' }));
    on('#peek', () => { peek = !peek; render(); });
    app.querySelectorAll('[data-target]').forEach(b => b.onclick = () => act({ t: 'night', target: b.dataset.target }));
    app.querySelectorAll('[data-vote]').forEach(b => b.onclick = () => act({ t: 'vote', target: b.dataset.vote }));
    renderStatus();
    updateTimers();
  }

  function updateTimers() {
    document.querySelectorAll('[data-ends]').forEach(el => {
      const left = Math.max(0, Math.ceil((Number(el.dataset.ends) - (Date.now() + offset)) / 1000));
      el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      el.classList.toggle('urgent', left <= 10);
    });
  }
  setInterval(updateTimers, 500);

  document.addEventListener('visibilitychange', () => { if (!document.hidden && network && !ended) network.resume(); });
  window.addEventListener('pagehide', () => network?.suspend());
  window.addEventListener('pageshow', e => { if (e.persisted && network && !ended) network.resume(); });
  window.addEventListener('online', () => { if (network && !ended) network.reconnect(); });

  if (me.joined && me.name) {
    app.innerHTML = '<section class="mafia-phone"><div class="card center"><p>Rejoining your seat&hellip;</p><p id="mafia-status" class="small muted"></p></div></section>';
    connect();
  } else renderJoin();
}
