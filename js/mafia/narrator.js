// One-phone narrator console: the narrator holds the only device, reads the script, and taps what the players point to.
import { $, esc, toast } from '../util.js?v=f1ed522';
import { createHostWakeLock } from '../host-wake-lock.js?v=visitor-review-v1';
import { ROLE_INFO, DISCUSSION_CHOICES, DEFAULT_SETTINGS, roleCounts } from './engine.js?v=mafia-v2';
import {
  MIN_PLAYERS, MAX_PLAYERS, cleanNames, newNarratorGame, byId, livingPlayers, showPassRole, nextPass, skipPass,
  beginNight, currentStep, actorAlive, stepTargets, pick, confirmKill, detectiveResult, canAdvance, advanceNight,
  startDay, startVote, adjustVote, votesCast, closeVote,
} from './narrator-game.js?v=mafia-v2';
import { createSounds } from './sounds.js?v=mafia-v2';
import { confirmAction } from '../dialog.js?v=ui-refresh-v1';

const SAVE_KEY = 'gg-mafia-narrator-v1';
const DEAD_ROLE_PAUSE_MS = 5000;

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (s && Array.isArray(s.names)) return s;
  } catch { /* fresh table */ }
  return null;
}

export function startMafiaNarrator() {
  const app = $('#app');
  const N = load() || { names: [], settings: { ...DEFAULT_SETTINGS, sound: true, voice: false }, game: null, gameNumber: 0 };
  N.settings = { ...DEFAULT_SETTINGS, sound: true, voice: false, ...N.settings };
  const sounds = createSounds();
  sounds.enabled = N.settings.sound;
  const wakeLock = createHostWakeLock({});
  let lastSpoken = '', stepShownAt = Date.now(), lastStepKey = '', lastTickSecond = null, sheetOpen = false;

  const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(N)); } catch { /* storage full */ } };
  const changed = () => { save(); render(); };
  const play = (name, ...a) => { if (N.settings.sound) sounds.play(name, ...a); };
  const later = (ms, name, ...a) => { if (N.settings.sound) setTimeout(() => sounds.play(name, ...a), ms); };
  const nm = id => esc(byId(N.game, id)?.name ?? '?');
  const roleTag = r => `<span class="role-tag ${r}">${ROLE_INFO[r].name}</span>`;
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

  function speak(text) {
    if (!N.settings.voice || !text || text === lastSpoken || !('speechSynthesis' in window)) return;
    lastSpoken = text;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9; u.pitch = 0.8;
      speechSynthesis.speak(u);
    } catch { /* voice unavailable */ }
  }

  // ---------- setup ----------
  function countsLine(n) {
    if (n < MIN_PLAYERS) return `<p class="small">Need ${plural(MIN_PLAYERS - n, 'more player')}.</p>`;
    if (n > MAX_PLAYERS) return `<p class="small error-line">Too many players &mdash; the maximum is ${MAX_PLAYERS}.</p>`;
    const c = roleCounts(n);
    return `<p class="deal-line">This deal: <span class="role-tag mafia">${c.mafia} Mafia</span> <span class="role-tag doctor">${plural(c.doctor, 'Doctor')}</span> <span class="role-tag detective">${plural(c.detective, 'Detective')}</span> <span class="role-tag town">${c.town} Town</span></p>`;
  }

  function settingsHtml() {
    const s = N.settings;
    return `<details class="card mafia-settings"><summary>Table settings</summary>
      <label>Discussion time <select id="set-discussion">${DISCUSSION_CHOICES.map(n => `<option value="${n}"${n === s.discussionSeconds ? ' selected' : ''}>${n / 60} minutes</option>`).join('')}</select></label>
      <label class="check"><input type="checkbox" id="set-reveal"${s.revealRoleOnDeath ? ' checked' : ''}> Reveal a player's role when they are eliminated</label>
      <label class="check"><input type="checkbox" id="set-sound"${s.sound ? ' checked' : ''}> Sound effects (gunshot, saves, deaths)</label>
      <label class="check"><input type="checkbox" id="set-voice"${s.voice ? ' checked' : ''}> Read the script aloud (phone voice)</label>
      <p class="small muted">Votes are plurality: the single player with the most votes is eliminated. A tie eliminates no one.</p></details>`;
  }

  function bindSettings() {
    const set = (id, fn) => { const el = $(id); if (el) el.onchange = fn; };
    set('#set-discussion', e => { N.settings.discussionSeconds = Number(e.target.value); if (N.game) N.game.settings.discussionSeconds = N.settings.discussionSeconds; save(); });
    set('#set-reveal', e => { N.settings.revealRoleOnDeath = e.target.checked; if (N.game) N.game.settings.revealRoleOnDeath = e.target.checked; save(); });
    set('#set-sound', e => { N.settings.sound = sounds.enabled = e.target.checked; save(); if (e.target.checked) play('chime'); });
    set('#set-voice', e => { N.settings.voice = e.target.checked; save(); if (!e.target.checked && 'speechSynthesis' in window) speechSynthesis.cancel(); });
  }

  function renderSetup() {
    const n = N.names.length;
    app.innerHTML = `<section class="mafia-host mafia-narrator">
      <header class="mafia-head"><a class="small muted" href="./">&larr; Grim Gatherings</a><h1>Mafia</h1><p class="muted">One-phone narrator mode. You hold the phone, read the script and tap what the players point to.</p>
        <p class="small"><a href="mafia.html">Switch to everyone&rsquo;s-phone mode</a></p></header>
      <div class="mafia-grid">
        <div class="card"><h2>Who&rsquo;s playing? (${n})</h2>
          <form id="add-form" class="name-entry" autocomplete="off"><input id="add-name" maxlength="80" placeholder="Player name (or several, separated by commas)" aria-label="Player name"><button class="btn" type="submit">Add</button></form>
          ${n ? `<ul class="name-chips">${N.names.map((x, i) => `<li>${esc(x)}<button type="button" data-remove="${i}" aria-label="Remove ${esc(x)}">&times;</button></li>`).join('')}</ul>` : '<p class="muted">Add every player except the narrator.</p>'}
          <p class="small muted">${MIN_PLAYERS}&ndash;${MAX_PLAYERS} players, not counting you. Odd numbers avoid tied votes.</p>
          ${countsLine(n)}
          <button class="btn block" id="deal"${n >= MIN_PLAYERS && n <= MAX_PLAYERS ? '' : ' disabled'}>Deal roles</button>
          ${n ? '<button class="link-btn" id="clear-names" type="button">Clear all names</button>' : ''}
        </div>
        <div>${settingsHtml()}
          <details class="card mafia-rules"><summary>How one-phone mode works</summary>
            <ol><li><strong>Deal.</strong> The phone is passed around. Each player taps to see their secret role, then hides it and passes it on.</li>
            <li><strong>Night.</strong> The phone shows you exactly what to say and who wakes next. Players point; you tap who they pointed at.</li>
            <li><strong>The kill.</strong> Tap the mafia&rsquo;s victim and hit KILL &mdash; a gunshot rings out, but nobody learns who was hit.</li>
            <li><strong>The save.</strong> The Doctor guesses blind. A heavenly chime means they saved the victim; a sad wah-wah means they missed.</li>
            <li><strong>Day.</strong> Reveal the night, run the discussion timer, then count raised hands. Most votes is eliminated; a tie eliminates no one.</li>
            <li><strong>Winning.</strong> Town wins when every mafia member is gone. Mafia win when they equal or outnumber everyone else. The phone checks after every death.</li></ol></details>
        </div>
      </div>
    </section>`;
    $('#add-form').onsubmit = e => {
      e.preventDefault();
      const input = $('#add-name');
      const before = N.names.length;
      N.names = cleanNames([...N.names, ...input.value.split(',')]);
      if (N.names.length === before && input.value.trim()) toast('That name is already in the game.');
      if (N.names.length > MAX_PLAYERS) toast(`Mafia supports up to ${MAX_PLAYERS} players.`);
      changed();
      $('#add-name')?.focus();
    };
    app.querySelectorAll('[data-remove]').forEach(b => b.onclick = () => { N.names.splice(Number(b.dataset.remove), 1); changed(); });
    const clear = $('#clear-names');
    if (clear) clear.onclick = async () => { if (await confirmAction('Remove every player name?')) { N.names = []; changed(); } };
    $('#deal').onclick = deal;
    bindSettings();
  }

  function deal() {
    sounds.unlock();
    try {
      N.gameNumber++;
      N.game = newNarratorGame(N.names, N.settings, { gameNumber: N.gameNumber });
      sheetOpen = false;
      changed();
    } catch (e) { toast(e.message, 5000); }
  }

  // ---------- in-game pieces ----------
  function teammates(g, p) {
    if (p.role !== 'mafia') return '';
    const others = g.players.filter(x => x.role === 'mafia' && x.id !== p.id);
    return others.length ? `<p class="team-line">Your fellow mafia: <strong>${others.map(x => esc(x.name)).join(', ')}</strong></p>` : '<p class="team-line">You work alone.</p>';
  }

  function sheetHtml(g) {
    return `<details class="card narrator-sheet" id="sheet"${sheetOpen ? ' open' : ''}><summary>Narrator&rsquo;s sheet (keep hidden)</summary>
      <ul class="mafia-roster">${g.players.map(p => `<li class="${p.alive ? '' : 'dead'}">${esc(p.name)} ${roleTag(p.role)}${p.alive ? '' : ' <span class="small muted">dead</span>'}</li>`).join('')}</ul></details>`;
  }

  function logHtml(g) {
    if (!g.history.length) return '';
    const rows = g.history.map(h => {
      if (h.type === 'night') {
        if (!h.target) return `<li>Night ${h.night}: the mafia did not kill.</li>`;
        return h.killed ? `<li>Night ${h.night}: the mafia killed <strong>${nm(h.killed)}</strong> (${ROLE_INFO[byId(g, h.killed).role].name}).</li>`
          : `<li>Night ${h.night}: the mafia went for <strong>${nm(h.target)}</strong>, but ${h.savedBy.map(nm).join(' and ')} (Doctor) saved them.</li>`;
      }
      if (h.type === 'investigate') return `<li class="small">Night ${h.night}: ${nm(h.actor)} (Detective) checked ${nm(h.target)} &mdash; <span class="${h.guilty ? 'guilty' : 'innocent'}">${h.guilty ? 'guilty' : 'innocent'}</span>.</li>`;
      if (h.type === 'vote') return h.eliminated ? `<li>Day ${h.day}: the town voted out <strong>${nm(h.eliminated)}</strong> (${ROLE_INFO[byId(g, h.eliminated).role].name}).</li>`
        : `<li>Day ${h.day}: ${h.tie ? 'a tied vote' : 'no votes'} &mdash; nobody was eliminated.</li>`;
      return '';
    }).join('');
    return `<ol class="game-log">${rows}</ol>`;
  }

  function nightAnnouncement(g) {
    const a = g.announcement;
    if (!a) return '';
    if (a.killed) return `The town wakes to find <strong>${nm(a.killed)}</strong> dead.${a.role ? ` They were ${a.role === 'town' ? 'a Townsperson' : `the ${ROLE_INFO[a.role].name}`}.` : ''}`;
    if (a.target) return 'The mafia struck in the night&hellip; but the Doctor got there first. <strong>Nobody died.</strong>';
    return 'A quiet night. <strong>Nobody died.</strong>';
  }

  function verdictText(g) {
    const v = g.verdict;
    if (!v) return '';
    if (v.eliminated) return `The town has spoken: <strong>${nm(v.eliminated)}</strong> is eliminated.${v.role ? ` They were ${v.role === 'town' ? 'a Townsperson' : `the ${ROLE_INFO[v.role].name}`}.` : ''}`;
    return v.tie ? 'The vote is tied. <strong>Nobody is eliminated.</strong>' : 'No votes were cast. <strong>Nobody is eliminated.</strong>';
  }
  const plainText = html => html.replace(/<[^>]+>/g, '').replace(/&hellip;/g, '…').replace(/&mdash;/g, '—').replace(/&rsquo;/g, '’');

  // Script for the current night step. `said` is what the narrator reads; `hint` is narrator-only guidance.
  function stepScript(g, step) {
    const dupe = g.steps.filter(x => x.kind === step.kind).length > 1;
    const which = dupe ? (g.steps.filter(x => x.kind === step.kind).indexOf(step) === 0 ? 'First ' : 'Second ') : '';
    const actor = step.actor ? byId(g, step.actor) : null;
    const deadHint = actor && !actor.alive ? `<p class="hint dead-line">Narrator only: ${esc(actor.name)} is dead. Read the lines anyway and pause a few seconds so nobody can tell.</p>` : '';
    switch (step.kind) {
      case 'sleep': return { said: g.night === 1 ? 'Night falls on the town. Everyone, close your eyes and put your heads down.' : 'Night falls again. Everyone, close your eyes.', done: 'Everyone&rsquo;s eyes are closed' };
      case 'mafia': return g.picks.killConfirmed
        ? { said: 'Mafia, close your eyes.', done: 'Mafia eyes closed' }
        : { said: 'Mafia, open your eyes. Silently agree and point to the one you want to kill.', hint: '<p class="hint">Tap who they point to, then hit KILL. The gunshot plays, but don&rsquo;t say who was hit.</p>' };
      case 'doctor': {
        const pickedNow = actorAlive(g, step) && g.picks.protects[step.actor];
        return pickedNow
          ? { said: `${which}Doctor, close your eyes.`, done: 'Doctor&rsquo;s eyes closed' }
          : { said: `${which}Doctor, open your eyes. Point to one player you want to save tonight.`, hint: deadHint || (actor ? `<p class="hint">The Doctor is <strong>${esc(actor.name)}</strong>. They may save themself.</p>` : ''), done: 'Doctor&rsquo;s eyes closed' };
      }
      case 'detective': {
        const pickedNow = actorAlive(g, step) && g.picks.investigations[step.actor];
        return pickedNow
          ? { said: `Show the result with a silent thumbs up or down. ${which}Detective, close your eyes.`, done: 'Detective&rsquo;s eyes closed' }
          : { said: `${which}Detective, open your eyes. Point to one player you want to investigate.`, hint: deadHint || (actor ? `<p class="hint">The Detective is <strong>${esc(actor.name)}</strong>.</p>` : ''), done: 'Detective&rsquo;s eyes closed' };
      }
      case 'wake': return { said: 'Everyone, open your eyes.', done: 'Reveal the night' };
    }
    return { said: '' };
  }

  function targetsHtml(g, step, selected) {
    return `<div class="targets big">${stepTargets(g, step).map(p => `<button class="target${p.id === selected ? ' picked' : ''}" data-pick="${esc(p.id)}" aria-pressed="${p.id === selected}">${esc(p.name)}${p.id === selected ? ' <span class="selection-label">Selected</span>' : ''}</button>`).join('')}</div>`;
  }

  function nightBody(g, step) {
    const dead = !actorAlive(g, step);
    if (step.kind === 'mafia' && !g.picks.killConfirmed) {
      return `${targetsHtml(g, step, g.picks.kill)}
        <button class="btn block kill-btn" id="kill"${g.picks.kill ? '' : ' disabled'}>${g.picks.kill ? `KILL ${nm(g.picks.kill)}` : 'Tap the victim first'}</button>`;
    }
    if ((step.kind === 'doctor' || step.kind === 'detective') && !dead) {
      const sel = step.kind === 'doctor' ? g.picks.protects[step.actor] : g.picks.investigations[step.actor];
      const res = detectiveResult(g, step);
      return `${targetsHtml(g, step, sel)}
        ${res ? `<div class="verdict-big ${res.guilty ? 'guilty' : 'innocent'}"><span aria-hidden="true">${res.guilty ? '👎' : '👍'}</span> ${esc(res.target.name)} is ${res.guilty ? 'GUILTY' : 'INNOCENT'}</div>` : ''}`;
    }
    return '';
  }

  function renderNight(g) {
    const step = currentStep(g);
    const key = `${g.night}:${g.step}`;
    if (key !== lastStepKey) { lastStepKey = key; stepShownAt = Date.now(); }
    const sc = stepScript(g, step);
    const dead = !actorAlive(g, step);
    const wait = dead ? Math.max(0, DEAD_ROLE_PAUSE_MS - (Date.now() - stepShownAt)) : 0;
    const ready = canAdvance(g) && wait === 0;
    const label = step.kind === 'mafia' && !g.picks.killConfirmed ? '' : (sc.done || 'Continue');
    const progress = `<p class="step-dots" aria-label="Night step ${g.step + 1} of ${g.steps.length}">${g.steps.map((_, i) => `<span class="${i < g.step ? 'done' : i === g.step ? 'now' : ''}"></span>`).join('')}</p>`;
    return { said: sc.said, html: `<div class="card narrator night"><p class="phase-name">Night ${g.night}</p>${progress}
        <p class="script">&ldquo;${esc(sc.said)}&rdquo;</p>${sc.hint || ''}${nightBody(g, step)}
        ${label ? `<button class="btn block" id="next-step"${ready ? '' : ' disabled'} data-wait="${wait ? stepShownAt + DEAD_ROLE_PAUSE_MS : ''}">${label} &rarr;</button>` : ''}</div>` };
  }

  function renderPass(g) {
    const p = g.players[g.passIndex];
    if (!g.passShown) {
      return `<div class="card narrator center"><p class="phase-name">Secret roles &middot; ${g.passIndex + 1} of ${g.players.length}</p>
        <p class="narration">Pass the phone to <strong>${esc(p.name)}</strong>.</p>
        <button class="role-back" id="show-role">Tap to see your role<span class="small">Only ${esc(p.name)} should look.</span></button>
        <button class="link-btn" id="skip-pass">Narrator: skip the pass-around (I&rsquo;ll tell players their roles)</button></div>`;
    }
    const info = ROLE_INFO[p.role];
    const last = g.passIndex === g.players.length - 1;
    return `<div class="role-card ${p.role}"><p class="small">${esc(p.name)}, you are</p><h2>${p.role === 'town' ? 'A Townsperson' : `The ${info.name}`}</h2><p>${info.blurb}</p>${teammates(g, p)}</div>
      <button class="btn block" id="hide-role">Hide &amp; ${last ? 'give the phone back to the narrator' : `pass to ${esc(g.players[g.passIndex + 1].name)}`}</button>`;
  }

  function overHtml(g) {
    const town = g.winner === 'town';
    return `<div class="card narrator"><p class="phase-name">Game over</p>
      <p class="narration">${town ? 'The last of the mafia is gone. <strong>The town wins!</strong>' : 'The mafia now control the town. <strong>The mafia win!</strong>'}</p>
      ${g.announcement && g.history.at(-1)?.type === 'night' ? `<p>${nightAnnouncement(g)}</p>` : g.verdict ? `<p>${verdictText(g)}</p>` : ''}
      <div class="mafia-final">${g.players.map(p => `<div class="final-row ${p.role}${p.alive ? '' : ' dead'}"><strong>${esc(p.name)}</strong>${roleTag(p.role)}<span class="small muted">${p.alive ? 'survived' : 'eliminated'}</span></div>`).join('')}</div>
      <div class="row center-row"><button class="btn" id="play-again">Play again &mdash; new roles</button><button class="btn secondary" id="change-players">Change players</button></div></div>
      <div class="card"><h2>Game log</h2>${logHtml(g)}</div>`;
  }

  function renderGame() {
    const g = N.game;
    let said = '', body = '';
    if (g.phase === 'pass') body = renderPass(g);
    else if (g.phase === 'ready') {
      said = 'Everyone has their role. The game begins.';
      body = `<div class="card narrator center"><p class="phase-name">Roles dealt</p><p class="narration">Give the phone back to the narrator.</p>
        <p class="muted">Narrator: when everyone is ready, tap below and read the script.</p><button class="btn block" id="night">Night falls &rarr;</button></div>`;
    } else if (g.phase === 'night') ({ said, html: body } = renderNight(g));
    else if (g.phase === 'dawn') {
      said = plainText(`Morning comes. ${nightAnnouncement(g)}`);
      body = `<div class="card narrator"><p class="phase-name">Day ${g.day}</p><p class="narration">${nightAnnouncement(g)}</p>
        ${g.announcement.killed ? '<p class="small muted">The dead may not speak, vote or give hints for the rest of the game.</p>' : ''}
        <button class="btn block" id="discuss">Start the discussion &rarr;</button></div>`;
    } else if (g.phase === 'day') {
      said = 'Discuss. Who among you is mafia?';
      body = `<div class="card narrator"><p class="phase-name">Day ${g.day} &middot; discussion</p><p class="narration">Discuss. Who among you is mafia?</p>
        <div class="mafia-timer" data-ends="${g.endsAt}">--:--</div>
        <div class="row center-row"><button class="btn secondary" id="more-time">+1 minute</button><button class="btn" id="to-vote">Go to the vote &rarr;</button></div></div>`;
    } else if (g.phase === 'vote') {
      const living = livingPlayers(g), cast = votesCast(g);
      said = 'Time to vote. On three, point at the player you want to eliminate.';
      body = `<div class="card narrator"><p class="phase-name">Day ${g.day} &middot; vote</p><p class="narration">On three, everyone point at the player you want to eliminate.</p>
        <p class="small muted">Count the fingers pointing at each player. The dead do not vote.</p>
        <div class="vote-counters">${living.map(p => `<div class="vote-row"><strong>${esc(p.name)}</strong>
          <button class="btn secondary round" data-vote="${esc(p.id)}" data-d="-1" aria-label="One fewer vote for ${esc(p.name)}"${g.voteCounts[p.id] ? '' : ' disabled'}>&minus;</button>
          <span class="tally-count">${g.voteCounts[p.id]}</span>
          <button class="btn secondary round" data-vote="${esc(p.id)}" data-d="1" aria-label="One more vote for ${esc(p.name)}"${cast < living.length ? '' : ' disabled'}>+</button></div>`).join('')}</div>
        <p class="small">${cast} of ${living.length} votes counted.</p>
        <button class="btn block" id="close-vote"${cast ? '' : ' disabled'}>Read the verdict &rarr;</button>
        <button class="link-btn" id="no-vote">Nobody voted &mdash; skip</button></div>`;
    } else if (g.phase === 'verdict') {
      said = plainText(verdictText(g));
      body = `<div class="card narrator"><p class="phase-name">Day ${g.day} &middot; verdict</p><p class="narration">${verdictText(g)}</p>
        <button class="btn block" id="night">Night falls &rarr;</button></div>`;
    } else if (g.phase === 'over') {
      said = g.winner === 'town' ? 'The town wins!' : 'The mafia win!';
      body = overHtml(g);
    }

    const head = `<header class="mafia-head"><span class="small muted">Mafia &middot; one-phone &middot; game ${g.gameNumber} &middot; ${plural(livingPlayers(g).length, 'player')} alive</span>
      <button class="link-btn" id="end-game">End game</button></header>`;
    const hideSheet = g.phase === 'pass' || g.phase === 'over';
    app.innerHTML = `<section class="mafia-host mafia-narrator phase-${g.phase}${g.phase === 'over' ? ` win-${g.winner}` : ''}">${head}${body}
      ${hideSheet ? '' : sheetHtml(g)}
      ${g.history.length && g.phase !== 'over' && g.phase !== 'pass' ? `<details class="card"><summary>Game log</summary>${logHtml(g)}</details>` : ''}
      ${g.phase === 'pass' ? '' : settingsHtml()}</section>`;
    bindGame(g);
    bindSettings();
    if (said) speak(said);
    updateTimers();
  }

  function bindGame(g) {
    const on = (sel, fn) => { const el = $(sel); if (el) el.onclick = e => { sounds.unlock(); fn(e); }; };
    const sheet = $('#sheet');
    if (sheet) sheet.ontoggle = () => { sheetOpen = sheet.open; };
    on('#end-game', async () => { if (await confirmAction('End this game? Roles will be lost.')) { N.game = null; changed(); } });
    on('#show-role', () => { showPassRole(g); changed(); });
    on('#hide-role', () => { nextPass(g); changed(); });
    on('#skip-pass', async () => { if (await confirmAction('Skip the pass-around? Open the narrator\u2019s sheet to tell players their roles yourself.')) { skipPass(g); sheetOpen = true; changed(); } });
    on('#night', () => { if (beginNight(g)) { play('nightfall'); changed(); } });
    app.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
      sounds.unlock();
      const err = pick(g, b.dataset.pick);
      if (err) toast(err); else changed();
    });
    on('#kill', () => { if (confirmKill(g)) { play('gunshot'); changed(); } });
    on('#next-step', () => {
      const ev = advanceNight(g);
      if (ev === 'saved') play('chime');
      else if (ev === 'killed') play('wahwah');
      else if (ev === 'dawn') {
        if (g.phase === 'over') later(200, 'fanfare', g.winner);
        else play('daybreak');
      }
      changed();
    });
    on('#discuss', () => { if (startDay(g)) { g.endsAt = Date.now() + g.settings.discussionSeconds * 1000; lastTickSecond = null; play('daybreak'); changed(); } });
    on('#more-time', () => { g.endsAt = Math.max(g.endsAt, Date.now()) + 60000; changed(); });
    on('#to-vote', () => { if (startVote(g)) changed(); });
    app.querySelectorAll('[data-vote]').forEach(b => b.onclick = () => { if (adjustVote(g, b.dataset.vote, Number(b.dataset.d))) changed(); });
    const finishVote = () => {
      if (!closeVote(g)) return;
      play('gavel');
      if (g.phase === 'over') later(900, 'fanfare', g.winner);
      changed();
    };
    on('#close-vote', finishVote);
    on('#no-vote', async () => { if (await confirmAction('Close the vote with no votes? Nobody is eliminated.')) finishVote(); });
    on('#play-again', () => deal());
    on('#change-players', () => { N.game = null; changed(); });
  }

  function render() {
    if (N.game) renderGame(); else renderSetup();
  }

  function updateTimers() {
    document.querySelectorAll('[data-ends]').forEach(el => {
      const left = Math.max(0, Math.ceil((Number(el.dataset.ends) - Date.now()) / 1000));
      el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      el.classList.toggle('urgent', left <= 10);
      if (left !== lastTickSecond) {
        if (lastTickSecond !== null && left > 0 && left <= 10) play('tick');
        if (lastTickSecond !== null && left === 0) play('timeUp');
        lastTickSecond = left;
      }
    });
    const next = $('#next-step');
    if (next?.dataset.wait && Date.now() >= Number(next.dataset.wait)) {
      next.removeAttribute('data-wait');
      next.disabled = !canAdvance(N.game);
    }
  }

  setInterval(updateTimers, 250);
  document.addEventListener('visibilitychange', () => wakeLock.setActive(true));
  wakeLock.setActive(true);
  render();
}
