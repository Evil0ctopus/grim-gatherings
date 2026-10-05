// Host (narrator) side: setup, story review, lobby, rounds, voting, reveal. The host browser is the hub.
import { $, esc, paras, randomRoom, joinUrl, baseUrl, toast, qrSvg, download, PEER_PREFIX, shuffle } from './util.js?v=f1ed522';
import { parseGuests, normalizeStory, buildView, makeFill, tally } from './story.js?v=workshop-v1';
import { selectRoundBallots, voteSummary, voteStripHtml } from './voting.js?v=vote-panel-v1';
import { buildSampleStory, SAMPLE_INFO } from './sample.js?v=count-editions-v1';
import { loadAiSettings, saveAiSettings, generateStory } from './ai.js?v=workshop-v1';
import { communityRequest } from './community-api.js?v=reliability-v1';
import { STORY_LIBRARY_KEY, readStoryLibrary, upsertStory, getPlayerRange, adaptStoryForPlayers } from './library.js?v=rotating-clues-v1';
import { STARTER_MYSTERIES } from './starters.js?v=blackwater-story-v2';
import { createAtmosphere, hostAtmospherePanel, CUES, storyTheme } from './atmosphere.js?v=volume-58-v1';
import { hauntedManorHtml } from './manor.js?v=manor-background-v2';
import { HOST_SAVE_KEY, isOutdatedStory } from './saved-content.js?v=workshop-v1';
import { currentCharacter, releaseCharacter, retireOtherSessions, resumeSession } from './host-sessions.js?v=connection-recovery-v1';

const KEY = HOST_SAVE_KEY;
let S = null; // persisted host state
const ui = { tab: 'sample', errors: [], warnings: [], busy: false, libraryError: '', community: [], communityError: '' };
let peer = null, netStatus = 'offline', restartTimer = null, peerAttemptAt = 0, peerBlocked = false, hostPaused = false;
let atmosphere = null;
const conns = new Map(); // DataConnection -> { conn, charId, token, lastSeen }
const LIVE_PHASES = ['lobby', 'round', 'vote', 'reveal'];

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
const save = () => { if (S) localStorage.setItem(KEY, JSON.stringify(S)); };
const app = () => document.getElementById('app');

function restoreGame() {
  S = load();
  if (S?.story && isOutdatedStory(S.story)) {
    localStorage.removeItem(KEY);
    S = null;
    toast('Outdated saved game removed. Start a new game with a current mystery.');
    return;
  }
  if (S?.story && S.phase !== 'setup') {
    const result = normalizeStory(S.story);
    if (!result.story) {
      ui.errors = ['This saved game needs 5 or 6 narrated chapters with complete read-aloud clues before it can resume.', ...result.errors];
      ui.warnings = result.warnings;
      S.phase = 'review'; S.roundIndex = -1; S.wasLive = false;
      save();
    } else {
      S.story = result.story;
      ui.errors = [];
      ui.warnings = result.warnings;
      save();
    }
  }
}

export function startHost() {
  atmosphere = createAtmosphere();
  restoreGame();
  app().addEventListener('click', onClick);
  app().addEventListener('input', onInput);
  app().addEventListener('change', onChange);
  app().addEventListener('keydown', onKeydown);
  window.addEventListener('pagehide', () => { hostPaused = true; stopPeer(); });
  window.addEventListener('pageshow', recoverHost);
  window.addEventListener('online', () => { if (hosting()) restartPeer(0); });
  window.addEventListener('offline', () => { if (hosting()) { netStatus = 'offline'; updateLive(); } });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) recoverHost(); });
  setInterval(tick, 4000);
  if (location.hash === '#host' && S) {
    render();
    if (LIVE_PHASES.includes(S.phase) || (S.phase === 'review' && S.wasLive)) startPeer();
  } else renderLanding();
}

// ---------- Landing ----------
function renderLanding() {
  atmosphere.update({ room: '', phase: 'home', roundIndex: -1 }, null);
  app().className = '';
  const saved = load();
  app().innerHTML = `
    ${hauntedManorHtml()}
    <div class="landing-content">
    <header class="landing-heading">
    <p class="hero-eyebrow">An invitation to intrigue</p>
    <h1 class="hero-title">Grim Gatherings</h1>
    <p class="tagline">A murder-mystery party, whispered to every guest's phone.</p>
    <p class="manor-caption">The house is waiting. Someone is already inside.</p>
    </header>
    <div class="landing-actions">
    <div class="card gold stack">
      <h2>Host a gathering</h2>
      <p>Set up the story on this device (a laptop or tablet hooked to a TV is ideal). Guests join on their phones.</p>
      <button class="block" data-act="new" id="btn-new">Create a new game</button>
      <a class="btn secondary block" href="workshop.html">Build my mystery / approve stories</a>
      <a class="btn secondary block" href="workshop.html?account=1">Admin login / story approvals</a>
      ${saved && saved.room ? `<button class="block secondary" data-act="resume" id="btn-resume">Resume “${esc(saved.story?.title || 'Untitled')}” · room ${esc(saved.room)}</button>` : ''}
    </div>
    <div class="card stack">
      <h2>Joining as a guest?</h2>
      <p>Scan the host's QR code, or enter the room code:</p>
      <div class="row"><input id="join-code" placeholder="ROOM CODE" autocapitalize="characters" autocomplete="off" maxlength="8" style="text-transform:uppercase;letter-spacing:.2em;font-size:1.3rem;flex:2">
      <button data-act="join" style="flex:1">Join</button></div>
    </div>
    <p class="footer">Best on a phone held close to a candle. 🕯️</p>
    </div></div>`;
}

// ---------- Rendering by phase ----------
function render() {
  if (!S) return renderLanding();
  if (S.story && ['round', 'vote', 'reveal'].includes(S.phase)) selectRoundBallots(S, S.roundIndex);
  if (location.hash !== '#host') history.replaceState(null, '', baseUrl() + '#host');
  ({ setup: renderSetup, review: renderReview, lobby: renderLobby, round: renderRound, vote: renderVote, reveal: renderReveal }[S.phase] || renderSetup)();
  atmosphere.update({ room: S.room, phase: S.phase, roundIndex: S.roundIndex, roundTitle: S.story?.rounds[S.roundIndex]?.title }, S.story);
  window.scrollTo(0, 0);
}

function errBox() {
  let h = '';
  if (ui.errors.length) h += `<div class="err" id="errors"><b>Couldn't use that story:</b><ul>${ui.errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>`;
  if (ui.warnings.length) h += `<div class="card small muted" id="warnings"><b>Heads up:</b><ul>${ui.warnings.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>`;
  return h;
}

function renderSetup() {
  app().className = '';
  const ai = loadAiSettings();
  const guests = getGuests();
  const library = getStoryLibrary();
  app().innerHTML = `
    <span class="candle">🕯️</span>
    <h1>Set the Table</h1>
    <div class="card stack">
      <h2>Who's playing?</h2>
      <p class="small muted">Add each player by name. You can assign their characters on the next screen.</p>
      <div class="row guest-entry">
        <input id="guest-name" placeholder="Player's name" autocomplete="off">
        <input id="guest-desc" placeholder="Optional: a fun description" autocomplete="off">
        <button type="button" data-act="add-guest" id="add-guest">Add player</button>
      </div>
      <p class="small muted" id="guest-count">${guests.length} player${guests.length === 1 ? '' : 's'}${guests.length && guests.length < 4 ? ' — 4 or more is best' : ''}</p>
      <ul class="clean guest-list">${guests.map((g, i) => `<li class="row guest-item"><span><b>${esc(g.name)}</b>${g.desc ? ` <span class="muted">— ${esc(g.desc)}</span>` : ''}</span><button type="button" class="secondary small" data-act="remove-guest" data-index="${i}" aria-label="Remove ${esc(g.name)}">Remove</button></li>`).join('')}</ul>
      <label for="theme">Theme / setting <span class="muted">(used by AI generation; optional)</span></label>
      <input id="theme" data-s="theme" value="${esc(S.theme || '')}" placeholder="e.g. 1920s gothic manor, a séance gone wrong">
    </div>
    <div class="card">
      <h2>Your saved mysteries</h2>
      <p class="small muted">Saved in this browser on this device. Add your players above, then choose a story to prepare it for game night.</p>
      ${library.length ? `<ul class="clean">${library.map(entry => `<li class="row library-item">
        <span><b>${esc(entry.title || entry.story.title || 'Untitled mystery')}</b><span class="small muted"> · ${formatPlayerRange(entry.story)}</span>${entry.story.provenance ? ` <span class="pill">User-created</span><span class="small muted"> by ${esc(entry.story.provenance.author)}</span>` : ''}</span>
        <span class="row library-actions"><button class="small" data-act="use-saved" data-id="${esc(entry.id)}">Use story</button><button class="secondary small" data-act="delete-saved" data-id="${esc(entry.id)}" aria-label="Delete ${esc(entry.title || 'saved story')}">Delete</button></span>
      </li>`).join('')}</ul>` : '<p class="muted">No saved stories yet. Create one, then save it from the story review screen.</p>'}
      ${ui.libraryError ? `<p class="err" role="alert">${esc(ui.libraryError)}</p>` : ''}
    </div>
    <div class="card stack">
      <h2>Create or discover a story</h2>
      <a class="btn secondary" href="workshop.html">Story workshop - edit, save or submit</a>
      <button class="secondary" data-act="load-community" ${ui.busy ? 'disabled' : ''}>Browse approved community stories</button>
      ${ui.communityError ? `<p class="err" role="alert">${esc(ui.communityError)}</p>` : ''}
      ${ui.community.map(entry => `<div><h3>${esc(entry.title)}</h3><span class="pill">User-created</span><p class="small">By ${esc(entry.author)} · approved version ${entry.revision}</p><button data-act="use-community" data-id="${esc(entry.id)}">Play this mystery</button></div>`).join('')}
    </div>
    <div class="tabs">
      <button class="${ui.tab === 'sample' ? 'on' : ''}" data-act="tab" data-tab="sample">Ready-to-play mysteries</button>
      <button class="${ui.tab === 'paste' ? 'on' : ''}" data-act="tab" data-tab="paste">Paste story JSON</button>
      <button class="${ui.tab === 'ai' ? 'on' : ''}" data-act="tab" data-tab="ai">AI generate</button>
    </div>
    ${errBox()}
    <div class="card gold stack" ${ui.tab === 'sample' ? '' : 'hidden'}>
      <h2>${esc(SAMPLE_INFO.title)}</h2>
      <p>${esc(SAMPLE_INFO.blurb)}</p>
      <p class="small muted">Players are assigned to characters at random — even the murderer. You can change each assignment on the next screen.</p>
      <button class="block" data-act="use-sample" id="use-sample">Use this mystery →</button>
    </div>
    ${STARTER_MYSTERIES.map(entry => `<div class="card gold stack" ${ui.tab === 'sample' ? '' : 'hidden'}>
      <h2>${esc(entry.title)}</h2>
      <p>${esc(entry.blurb)}</p>
      <p><span class="pill">${formatPlayerRange(entry.story)}</span> <span class="small muted">${entry.story.rounds.length} evidence rounds + reveal</span></p>
      <p class="small muted">${esc(entry.inspiration)}</p>
      <details><summary>Content &amp; hosting notes</summary>
        <p class="small">${esc(entry.contentNote)}</p>
        <p class="small muted">The assigned player count selects a separately stored edition before play. Every character is required and reads a clue and receives one accusation each round. All evidence is public. Phone disconnections never change the edition. The host does not count unless also playing a character.</p>
      </details>
      <p class="small muted">Choose this story to fit it to your player list, then edit anything and save your own version.</p>
      <button class="block" data-act="use-starter" data-id="${esc(entry.id)}">Play this mystery →</button>
    </div>`).join('')}
    <div class="card stack" ${ui.tab === 'paste' ? '' : 'hidden'}>
      <h2>Paste a story</h2>
      <p class="small muted">Paste story JSON (format in the <a href="https://github.com/Evil0ctopus/grim-gatherings#story-json-format" target="_blank" rel="noopener">README</a>). Characters without a "guest" are matched to your player list in order.</p>
      <textarea id="json" rows="10" placeholder='{"title": "...", "characters": [...], ...}'>${esc(ui.pasteText || '')}</textarea>
      <input type="file" id="json-file" accept=".json,application/json,text/plain">
      <button class="block" data-act="load-json" id="load-json">Load story →</button>
    </div>
    <div class="card stack" ${ui.tab === 'ai' ? '' : 'hidden'}>
      <h2>Make a mystery with AI</h2>
      <p>Start with a theme and player list. AI will draft the mystery, characters, clues, and ending for you to review and edit.</p>
      <ol class="small">
        <li>Get a free Gemini API key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>.</li>
        <li>Paste the key below. You only need to do this once on this browser.</li>
        <li>Choose <b>Generate story</b>, then review and save your mystery.</li>
      </ol>
      <p class="small muted">Gemini offers a free API tier with usage limits. Google says free-tier content may be used to improve its products, so avoid entering private or sensitive information. Your key is stored in this browser and sent to the selected AI provider; it is not shared with players.</p>
      <details>
        <summary>Advanced AI settings</summary>
        <label for="ai-base">AI service address</label><input id="ai-base" value="${esc(ai.base)}">
        <label for="ai-model">AI model</label><input id="ai-model" value="${esc(ai.model)}">
      </details>
      <label for="ai-key">Gemini key</label><input id="ai-key" type="password" value="${esc(ai.key)}" placeholder="Paste your Google AI Studio key" autocomplete="off">
      <button class="block" data-act="gen-ai" id="gen-ai" ${ui.busy ? 'disabled' : ''}>${ui.busy ? 'Summoning a story… (up to a minute)' : 'Generate story →'}</button>
    </div>
    <div class="row"><button class="secondary small" data-act="home">← Home</button></div>`;
}

function getStoryLibrary() {
  try {
    ui.libraryError = '';
    return readStoryLibrary(localStorage.getItem(STORY_LIBRARY_KEY)).filter(entry => !isOutdatedStory(entry.story));
  } catch (error) {
    ui.libraryError = error.message || 'Saved stories could not be loaded.';
    return [];
  }
}

function formatPlayerRange(story) {
  const range = getPlayerRange(story);
  return range.minPlayers === range.maxPlayers ? `${range.maxPlayers} players` : `${range.minPlayers}–${range.maxPlayers} players`;
}

function getGuests() {
  return Array.isArray(S.guests) ? S.guests : parseGuests(S.guestsText);
}

function guestAssignmentHtml(character, characterIndex) {
  const guests = getGuests();
  const options = guests.map(guest => `<option value="${esc(guest.name)}" ${guest.name === character.guest ? 'selected' : ''}>${esc(guest.name)}</option>`).join('');
  const existing = character.guest && !guests.some(guest => guest.name === character.guest)
    ? `<option value="${esc(character.guest)}" selected>${esc(character.guest)}</option>`
    : '';
  return `<div class="player-assignment"><label for="guest-assignment-${characterIndex}">Assign player</label>
    <select id="guest-assignment-${characterIndex}" data-assign-character="${characterIndex}">
      <option value="">Unassigned</option>${existing}${options}
    </select></div>`;
}

const fieldHtml = (label, path, val, kind = 'text') => {
  const id = 'f-' + path.replace(/\./g, '-');
  if (kind === 'text') return `<label for="${id}">${esc(label)}</label><input id="${id}" data-path="${path}" value="${esc(val)}">`;
  if (kind === 'checkbox') return `<label class="check-row" for="${id}"><input id="${id}" type="checkbox" data-path="${path}" data-kind="checkbox" ${val ? 'checked' : ''}>${esc(label)}</label>`;
  const v = kind === 'lines' ? (val || []).join('\n') : val;
  return `<label for="${id}">${esc(label)}${kind === 'lines' ? ' <span class="muted">(one per line)</span>' : ''}</label><textarea id="${id}" data-path="${path}" ${kind === 'lines' ? 'data-kind="lines"' : ''} rows="${kind === 'big' ? 6 : 3}">${esc(v)}</textarea>`;
};

function renderReview() {
  app().className = '';
  const st = S.story;
  app().innerHTML = `
    <h1>Review the Story</h1>
    ${st.edition ? `<p class="center" id="selected-edition"><span class="pill">${st.edition.playerCount}-player edition</span> <span class="small muted">${esc(st.edition.id)} · fixed cast and written clues</span></p>` : ''}
    <p class="center muted">Story preparation only — do not read this review screen to players. It contains future chapters and the solution. Open the doors, then read only the panel marked Read aloud for the current chapter. Each round needs one clue about each character, read by someone else. Rotating stories change each reader's target every round. All evidence must be spoken before it is used; there are no private backstories.</p>
    ${errBox()}
    <div class="row"><button class="secondary" data-act="save-story" id="save-story">${S.libraryId ? 'Update saved mystery' : 'Save to My Stories'}</button><button data-act="open-lobby" id="open-lobby">Open the doors (show join code) →</button></div>
    <div class="card stack">
      ${fieldHtml('Tell the murderer they are the murderer (off: everyone investigates without advance knowledge)', 'discloseKiller', st.discloseKiller, 'checkbox')}
      <p class="small muted">Off by default. This changes only the selected player's identity notification, not the clues or solution. Either mode is solvable from public evidence. Applies to this game and saved copies.</p>
      ${fieldHtml('Title', 'title', st.title)}
      <label for="story-atmosphere">Story atmosphere</label>
      <select id="story-atmosphere" data-path="atmosphere">${[['manor', 'Haunted manor'], ['witch', 'Witch-trial candlelight'], ['farm', 'Snowbound farmhouse'], ['victorian', 'Victorian lamplight']].map(([value, label]) => `<option value="${value}" ${storyTheme(st) === value ? 'selected' : ''}>${label}</option>`).join('')}</select>
      ${fieldHtml('Setting', 'setting', st.setting, 'area')}
      ${fieldHtml('Intro (shown to everyone before round 1)', 'intro', st.intro, 'big')}
      ${fieldHtml('Victim name', 'victim.name', st.victim.name)}
      ${fieldHtml('Victim description', 'victim.description', st.victim.description, 'area')}
    </div>
    <h2>The Cast (${st.characters.length})</h2>
    <p class="small muted">Works for ${formatPlayerRange(st)}. ${st.edition ? 'This edition is written for exactly this count. Start from the catalog to choose another count; saving preserves only this edition.' : 'Optional roles can be omitted for a smaller custom party.'} Every included character reads a clue and receives one accusation every round.</p>
    ${st.characters.map((c, i) => `
      <div class="card cast-assignment row">
        <div><b>${esc(c.name)}</b> <span class="muted">· ${esc(c.role)}${c.id === st.solution.killerId ? ' · KILLER' : ''}</span></div>
        ${guestAssignmentHtml(c, i)}
      </div>
      <details class="editchar">
        <summary>Edit ${esc(c.name)} <span class="muted">· ${esc(c.role)}</span>${c.id === st.solution.killerId ? ' <span class="pill bad">KILLER</span>' : ''}</summary>
        ${fieldHtml('Guest note (shown to them: how to lean in)', `characters.${i}.guestNote`, c.guestNote)}
        ${fieldHtml('Character name', `characters.${i}.name`, c.name)}
        ${fieldHtml('Role', `characters.${i}.role`, c.role)}
        ${st.edition ? '<p class="small muted">Required character in this fixed edition.</p>' : fieldHtml('Optional supporting character (can be omitted for smaller groups)', `characters.${i}.optional`, c.optional, 'checkbox')}
        ${fieldHtml('Public blurb (everyone sees)', `characters.${i}.publicBlurb`, c.publicBlurb, 'area')}
        ${st.rounds.map((r, ri) => `<h3>${esc(r.title)}</h3>
          <label>Read-aloud accusation target</label>
          <select aria-label="Accusation target for ${esc(c.name)}, round ${ri + 1}" data-path="characters.${i}.rounds.${ri}.readAloud.accuses"><option value="" ${!c.rounds[ri]?.readAloud?.accuses ? 'selected' : ''}>Choose a character</option>${st.characters.filter(target => target.id !== c.id).map(target => `<option value="${esc(target.id)}" ${c.rounds[ri]?.readAloud?.accuses === target.id ? 'selected' : ''}>${esc(target.name)}</option>`).join('')}</select>
          ${fieldHtml('Read aloud to everyone (event evidence about the target)', `characters.${i}.rounds.${ri}.readAloud.text`, c.rounds[ri]?.readAloud?.text || '', 'area')}`).join('')}
      </details>`).join('')}
    <h2>Rounds</h2>
    <div class="row"><button class="secondary small" data-act="add-story-round" ${st.rounds.length >= 6 ? 'disabled' : ''}>Add a chapter (${st.rounds.length}/6)</button>${st.rounds.length > 5 ? '<button class="secondary small" data-act="remove-story-round">Remove final chapter</button>' : ''}</div>
    ${st.rounds.map((r, ri) => `<details><summary>${esc(r.title)}</summary>
      ${fieldHtml('Title', `rounds.${ri}.title`, r.title)}
      ${fieldHtml('Narration (host reads aloud)', `rounds.${ri}.narration`, r.narration, 'big')}
      ${fieldHtml('Public text (on every phone)', `rounds.${ri}.publicText`, r.publicText, 'area')}
      ${fieldHtml('Host notes', `rounds.${ri}.hostNotes`, r.hostNotes, 'area')}</details>`).join('')}
    <details><summary>Finale & solution (spoilers)</summary>
      ${fieldHtml('Finale narration', 'finale.narration', st.finale.narration, 'big')}
      ${fieldHtml('Vote prompt', 'finale.votePrompt', st.finale.votePrompt)}
      <label for="killer">Killer</label>
      <select id="killer" data-path="solution.killerId">${st.characters.map(c => `<option value="${esc(c.id)}" ${c.id === st.solution.killerId ? 'selected' : ''}>${esc(c.name)} (${esc(c.guest)})</option>`).join('')}</select>
      ${fieldHtml('Solution explanation', 'solution.explanation', st.solution.explanation, 'big')}
      ${fieldHtml('Reveal narration', 'solution.revealNarration', st.solution.revealNarration, 'big')}
    </details>
    <details><summary>Export / edit raw JSON</summary>
      <div class="row"><button class="secondary small" data-act="export">Download JSON</button><button class="secondary small" data-act="copy-json">Copy JSON</button></div>
      <textarea id="raw-json" rows="14">${esc(JSON.stringify(st, null, 2))}</textarea>
      <button class="small" data-act="apply-json">Apply edited JSON</button>
    </details>
    <div class="row" style="margin-top:20px"><button class="secondary" data-act="back-setup">← Back to setup</button><button data-act="open-lobby">Open the doors →</button></div>`;
}

function statusBar() {
  const n = connectedChars().size;
  const cls = netStatus === 'online' ? 'ok' : netStatus === 'offline' ? 'bad' : 'wait';
  return `<div class="statusbar"><span>Room <b id="room-code-bar">${esc(S.room)}</b></span>
    <details class="vote-strip" id="vote-strip">${voteStripHtml(voteSummary(S))}</details>
    <span id="net" class="pill ${cls}">${esc(netStatus === 'online' ? 'Live' : netStatus)}</span>
    <span id="conn-count">${n}/${S.story.characters.length} here</span></div>
    <div class="game-exit"><button class="secondary small" data-act="end">End game → Home</button><button class="secondary small" data-act="reconnect-host">Reconnect room</button></div>
    <div class="card" id="host-connection-help" role="status" aria-live="polite" ${netStatus === 'online' ? 'hidden' : ''}>${esc(hostRecoveryText())}</div>`;
}

function hostRecoveryText() {
  if (peerBlocked) return 'The room service cannot start in this browser. For WebRTC unavailable, use an up-to-date Safari or Chrome browser rather than an embedded app browser. Reload or tap Reconnect room to retry.';
  return 'Keep this host screen open and check your internet connection. The room retries automatically. Tap Reconnect room to reopen the same room without losing characters, clues or votes; guests do not need a new code.';
}

function joinBlock(big = true) {
  const url = joinUrl(S.room);
  return `<div class="center">
    <div class="qr" id="qr">${qrSvg(url)}</div>
    <p><a href="${esc(url)}" target="_blank" rel="noopener" id="join-link" style="font-size:1.1rem;word-break:break-all">${esc(url.replace(/^https?:\/\//, ''))}</a></p>
    ${big ? `<p class="muted small" style="margin-bottom:0">Room code</p><div class="roomcode" id="room-code">${esc(S.room)}</div>` : ''}
  </div>`;
}

function rosterHtml() {
  const on = connectedChars();
  return `<ul class="clean roster">${S.story.characters.map(c => {
    const claimed = !!S.claims[c.id];
    const here = on.has(c.id);
    const voted = S.phase === 'vote' || S.phase === 'reveal' ? (S.votes[c.id] ? ' · voted ✓' : ' · not voted') : '';
    return `<li data-char="${esc(c.id)}"><span><span class="dot ${here ? 'on' : claimed ? 'half' : ''}"></span><b>${esc(c.guest || '—')}</b> <span class="muted">as ${esc(c.name)}</span></span>
      <span class="small">${here ? 'connected' : claimed ? 'away' : 'not joined'}${voted}${claimed ? ` <button class="secondary small" data-act="release" data-id="${esc(c.id)}" title="Let someone else claim this character">release</button>` : ''}</span></li>`;
  }).join('')}</ul>`;
}

function renderLobby() {
  app().className = 'wide';
  const st = S.story;
  app().innerHTML = `${statusBar()}
    <h1>${esc(st.title)}</h1>
    <div class="grid2">
      <div class="card gold"><h2 class="center">Scan to join</h2>${joinBlock()}
        <p class="center small muted">Guests: open the link, tap your name, and meet your character.</p></div>
      <div class="card"><h2>The guests</h2><div id="roster">${rosterHtml()}</div></div>
    </div>
    <div class="card"><div class="label">Read aloud</div><div class="narration">${paras(makeFill(st)(st.intro))}</div>
      <p class="muted small">${esc(st.setting)}</p></div>
    <div class="row actions"><button class="secondary" data-act="back-review">← Edit story</button><button data-act="start" id="start-game">Begin ${esc(st.rounds[0].title)} →</button></div>
    ${hostFooter()}`;
}

function renderRound() {
  app().className = 'wide';
  const st = S.story, ri = S.roundIndex, r = st.rounds[ri];
  const evidenceHistory = buildView(S, null).evidenceHistory;
  app().innerHTML = `${statusBar()}
    <p class="center muted" style="margin-bottom:0">Round ${ri + 1} of ${st.rounds.length}</p>
    <h1 id="round-title">${esc(r.title)}</h1>
    <div class="grid2">
      <div>
        <div class="card blood"><div class="label">Read aloud</div><div class="narration">${paras(makeFill(st)(r.narration))}</div></div>
        ${r.hostNotes ? `<details id="hosting-notes"><summary>Hosting instructions — do not read aloud</summary><p class="muted small">${esc(r.hostNotes)}</p></details>` : ''}
        <div class="card"><div class="label">On every phone now</div>${paras(makeFill(st)(r.publicText))}<p>Read the full narration, then every player reads their clue verbatim. Each character receives exactly one accusation. Discuss only evidence the group has heard and vote freely. At voting, the complete narration and clues join everyone's notebook.</p>
        <div class="label">Read-aloud assignments (not voting)</div><ul class="clean">${st.characters.map(c => {
          const target = st.characters.find(t => t.id === c.rounds[S.roundIndex].readAloud.accuses);
          return `<li>${esc(c.name)}${c.guest ? ` (${esc(c.guest)})` : ''} → ${esc(target.name)}</li>`;
        }).join('')}</ul></div>
        ${evidenceHistory.length ? `<details id="host-evidence-history"><summary>Earlier public evidence (${evidenceHistory.length} rounds)</summary>
          ${evidenceHistory.map(chapter => `<h3>${esc(chapter.title)}</h3>${paras(chapter.narration)}
            ${chapter.accusations.map(clue => `<details><summary>${esc(clue.targetName)} · read by ${esc(clue.speakerName)}</summary>${paras(clue.text)}</details>`).join('')}`).join('<hr>')}</details>` : ''}
      </div>
      <div>
        <div class="card"><h2>The guests</h2><div id="roster">${rosterHtml()}</div></div>
        <details><summary>Join QR (for latecomers)</summary>${joinBlock(true)}</details>
        <p class="small muted">Read only the current chapter and player clues. The solution remains for the reveal.</p>
      </div>
    </div>
    <div class="row actions"><button class="secondary" data-act="prev">◀ ${ri === 0 ? 'Back to lobby' : 'Previous round'}</button>
      <button data-act="next" id="next-round">Vote after Round ${ri + 1} →</button></div>
    ${hostFooter()}`;
}

function tallyHtml() {
  const t = tally(S), st = S.story;
  const total = Object.keys(S.votes).length, max = Math.max(1, ...Object.values(t));
  const rows = st.characters.slice().sort((a, b) => t[b.id] - t[a.id]).map(c => `<div><div class="row" style="justify-content:space-between"><span><b>${esc(c.name)}</b> <span class="muted">(${esc(c.guest)})</span></span><span style="flex:0">${t[c.id]}</span></div>
    <div class="bar"><span style="width:${(t[c.id] / max) * 100}%"></span></div></div>`).join('');
  const waiting = st.characters.filter(c => S.claims[c.id] && !S.votes[c.id]).map(c => c.guest || c.name);
  return `<p id="votes-in"><b>${total}</b> vote${total === 1 ? '' : 's'} in${waiting.length ? ` · waiting on: ${esc(waiting.join(', '))}` : ''}</p>${rows}`;
}

function renderVote() {
  app().className = 'wide';
  const st = S.story;
  const last = S.roundIndex === st.rounds.length - 1;
  app().innerHTML = `${statusBar()}
    <h1>Round ${S.roundIndex + 1} · The Accusation</h1>
    <div class="grid2">
      <div class="card blood"><div class="label">Read aloud</div><div class="narration">${last ? paras(makeFill(st)(st.finale.narration)) : '<p>Discuss the evidence so far, then vote for your current top suspect. Your next clues may change your mind.</p>'}</div>
        <p class="muted small">Phones now show: “${esc(st.finale.votePrompt)}”</p></div>
      <div class="card"><h2>Live tally</h2><div id="tally">${tallyHtml()}</div></div>
    </div>
    <div class="card"><h2>The guests</h2><div id="roster">${rosterHtml()}</div></div>
    <div class="row actions"><button class="secondary" data-act="prev">◀ Back to Round ${S.roundIndex + 1}</button>${last ? '<button class="danger" data-act="reveal" id="reveal-btn">Reveal the killer 🔪</button>' : `<button data-act="next" id="next-round">Close voting · Next: ${esc(st.rounds[S.roundIndex + 1].title)} →</button>`}</div>
    ${hostFooter()}`;
}

function renderReveal() {
  app().className = 'wide';
  const st = S.story, k = st.characters.find(c => c.id === st.solution.killerId);
  const t = tally(S);
  const top = Math.max(0, ...Object.values(t));
  const caught = top > 0 && t[k.id] === top;
  app().innerHTML = `${statusBar()}
    <span class="candle">🕯️</span>
    <p class="center muted">The murderer was…</p>
    <div class="reveal-name" id="killer-name">${esc(k.name)}</div>
    <p class="center" style="font-size:1.3rem">played by <b>${esc(k.guest)}</b></p>
    <p class="center"><span class="pill ${caught ? 'ok' : 'bad'}">${caught ? 'The guests caught the killer!' : 'The killer got away with it…'}</span></p>
    <div class="grid2">
      <div class="card blood"><div class="label">Read aloud</div><div class="narration">${paras(makeFill(st)(st.solution.revealNarration))}</div></div>
      <div class="card"><h2>Final votes</h2><div id="tally">${tallyHtml()}</div></div>
    </div>
    <div class="card"><div class="label">What really happened</div>${paras(makeFill(st)(st.solution.explanation))}</div>
    <div class="row actions"><button class="secondary" data-act="prev">◀ Back to voting</button><button data-act="new-confirm">Start a new game</button></div>
    ${hostFooter()}`;
}

function hostFooter() {
  return `<details id="host-game-settings"><summary>Host game settings</summary>
    <label class="check-row"><input type="checkbox" data-disclose-killer ${S.story.discloseKiller ? 'checked' : ''}>Tell the murderer they are the murderer</label>
    <p class="small muted">Off: no advance identity notification. On: only the murderer is told. Once seen, the identity cannot be forgotten even if this is turned off later. Public evidence is unchanged.</p></details>
    ${hostAtmospherePanel()}<p class="footer">Refreshing this page is safe — the game is saved on this device. <button class="secondary small" data-act="end">End game → Home</button></p>`;
}

function updateLive() {
  const strip = $('#vote-strip');
  if (strip && S?.story) {
    const html = voteStripHtml(voteSummary(S));
    if (strip.innerHTML !== html) strip.innerHTML = html;
  }
  const r = $('#roster'); if (r) r.innerHTML = rosterHtml();
  const t = $('#tally'); if (t) t.innerHTML = tallyHtml();
  const net = $('#net');
  if (net) { net.className = 'pill ' + (netStatus === 'online' ? 'ok' : netStatus === 'offline' ? 'bad' : 'wait'); net.textContent = netStatus === 'online' ? 'Live' : netStatus; }
  const cc = $('#conn-count'); if (cc && S?.story) cc.textContent = `${connectedChars().size}/${S.story.characters.length} here`;
  const help = $('#host-connection-help');
  if (help) { help.hidden = netStatus === 'online'; help.textContent = hostRecoveryText(); }
}

// ---------- Actions ----------
function setPhase(phase, roundIndex = S.roundIndex) {
  if (['round', 'vote', 'reveal'].includes(phase)) selectRoundBallots(S, roundIndex);
  S.phase = phase; S.roundIndex = roundIndex; save(); render(); broadcast();
}

const actions = {
  async 'load-community'() {
    ui.busy = true; ui.communityError = ''; renderSetup();
    try { ui.community = (await communityRequest('/api/community')).stories; }
    catch (error) { ui.communityError = error.message; }
    finally { ui.busy = false; renderSetup(); }
  },
  async 'use-community'(el) {
    try {
      const { story } = await communityRequest(`/api/community/${encodeURIComponent(el.dataset.id)}`);
      acceptStory(adaptStoryForPlayers(story, getGuests(), shuffle(getGuests())), []);
    } catch (error) { ui.errors = [error.message]; renderSetup(); }
  },
  'atmosphere-cue'(el) {
    const kind = el.dataset.cue;
    if (!Object.hasOwn(CUES, kind)) return toast('That atmosphere cue is not available.');
    const message = { t: 'atmosphere', id: crypto.randomUUID(), kind };
    atmosphere.cue(message);
    broadcastRaw(message);
  },
  new() { newGame(); },
  resume() { restoreGame(); if (!S) return renderLanding(); history.replaceState(null, '', baseUrl() + '#host'); render(); if (LIVE_PHASES.includes(S.phase)) startPeer(); },
  join() { const c = ($('#join-code').value || '').trim().toUpperCase(); if (c) location.href = baseUrl() + '?room=' + encodeURIComponent(c); },
  home() { history.replaceState(null, '', baseUrl()); renderLanding(); },
  'add-guest'() {
    const name = ($('#guest-name').value || '').trim();
    const desc = ($('#guest-desc').value || '').trim();
    if (!name) {
      ui.errors = ['Enter a player name first.'];
      return renderSetup();
    }
    const guests = getGuests();
    if (guests.some(guest => guest.name.toLowerCase() === name.toLowerCase())) {
      ui.errors = [`${name} is already on the player list.`];
      return renderSetup();
    }
    guests.push({ name, desc });
    S.guests = guests;
    S.guestsText = guests.map(guest => guest.desc ? `${guest.name}, ${guest.desc}` : guest.name).join('\n');
    ui.errors = [];
    save();
    renderSetup();
    $('#guest-name')?.focus();
  },
  'remove-guest'(el) {
    const guests = getGuests();
    const index = Number(el.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= guests.length) return;
    guests.splice(index, 1);
    S.guests = guests;
    S.guestsText = guests.map(guest => guest.desc ? `${guest.name}, ${guest.desc}` : guest.name).join('\n');
    save();
    renderSetup();
  },
  tab(el) { ui.tab = el.dataset.tab; ui.errors = []; ui.warnings = []; renderSetup(); },
  'use-sample'() {
    const guests = getGuests();
    try {
      acceptStory(buildSampleStory(guests), []);
    } catch (error) {
      ui.errors = [error.message];
      ui.warnings = [];
      renderSetup();
    }
  },
  'load-json'() {
    ui.pasteText = $('#json').value;
    acceptStory(ui.pasteText, getGuests());
  },
  'use-starter'(el) {
    const entry = STARTER_MYSTERIES.find(item => item.id === el.dataset.id);
    if (!entry) {
      ui.errors = ['That starter mystery is not available. Reload the page and choose again.'];
      return renderSetup();
    }
    const guests = getGuests();
    let story;
    try {
      story = adaptStoryForPlayers(entry.story, guests, shuffle(guests));
    } catch (error) {
      ui.errors = [error.message || 'This mystery cannot be used with this player list.'];
      ui.warnings = [];
      return renderSetup();
    }
    acceptStory(story, []);
  },
  'use-saved'(el) {
    const entry = getStoryLibrary().find(item => item.id === el.dataset.id);
    if (!entry) { ui.libraryError = 'That saved story is no longer available.'; return renderSetup(); }
    const guests = getGuests();
    let story;
    try {
      story = adaptStoryForPlayers(entry.story, guests, shuffle(guests));
    } catch (error) {
      ui.errors = [error.message || 'This mystery cannot be used with this player list.'];
      ui.warnings = [];
      return renderSetup();
    }
    const res = normalizeStory(story);
    ui.errors = res.errors; ui.warnings = res.warnings;
    if (!res.story) return renderSetup();
    S.story = res.story; S.claims = {}; S.votes = {}; S.roundVotes = {}; S.libraryId = entry.id;
    setPhase('review', -1);
  },
  'save-story'() {
    try {
      const validation = normalizeStory(S.story);
      if (!validation.story) {
        ui.errors = validation.errors;
        ui.warnings = validation.warnings;
        return renderReview();
      }
      const entries = readStoryLibrary(localStorage.getItem(STORY_LIBRARY_KEY));
      const saved = upsertStory(entries, validation.story, S.libraryId);
      localStorage.setItem(STORY_LIBRARY_KEY, JSON.stringify(saved.entries));
      S.libraryId = saved.record.id;
      save();
      ui.libraryError = '';
      toast('Mystery saved to My Stories');
      renderReview();
    } catch (error) {
      ui.errors = [`Could not save this mystery: ${error.message || error}`];
      renderReview();
    }
  },
  'delete-saved'(el) {
    if (!confirm('Delete this saved mystery from My Stories?')) return;
    try {
      const entries = readStoryLibrary(localStorage.getItem(STORY_LIBRARY_KEY));
      localStorage.setItem(STORY_LIBRARY_KEY, JSON.stringify(entries.filter(entry => entry.id !== el.dataset.id)));
      ui.libraryError = '';
      renderSetup();
    } catch (error) {
      ui.libraryError = error.message || 'The saved mystery could not be deleted.';
      renderSetup();
    }
  },
  async 'gen-ai'() {
    const s = { base: $('#ai-base').value.trim(), model: $('#ai-model').value.trim(), key: $('#ai-key').value.trim() };
    saveAiSettings(s);
    ui.busy = true; ui.errors = []; renderSetup();
    try {
      const txt = await generateStory(s, S.theme, getGuests());
      ui.busy = false; ui.pasteText = txt;
      acceptStory(txt, getGuests());
    } catch (e) { ui.busy = false; ui.errors = [String(e.message || e)]; renderSetup(); }
  },
  'open-lobby'() {
    const res = normalizeStory(S.story);
    if (!res.story) { ui.errors = res.errors; return renderReview(); }
    const missing = res.story.characters.filter(c => !c.guest).length;
    if (missing && !confirm(`${missing} character(s) have no player assigned. Guests will see the character name instead. Continue?`)) return;
    ui.errors = []; ui.warnings = [];
    S.story = res.story; S.wasLive = true;
    setPhase('lobby', -1); startPeer();
  },
  'back-setup'() { ui.errors = []; ui.warnings = []; setPhase('setup'); },
  'back-review'() { setPhase('review'); },
  export() { download(`${(S.story.title || 'story').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.json`, JSON.stringify(S.story, null, 2)); },
  async 'copy-json'() { try { await navigator.clipboard.writeText(JSON.stringify(S.story, null, 2)); toast('Story JSON copied'); } catch { toast('Copy failed — use Download'); } },
  'apply-json'() {
    const res = normalizeStory($('#raw-json').value);
    ui.errors = res.errors; ui.warnings = res.warnings;
    if (res.story) { S.story = res.story; save(); toast('Story updated'); }
    renderReview();
  },
  'add-story-round'() {
    if (S.story.rounds.length >= 6) return;
    S.story.rounds.push({ title: `Round ${S.story.rounds.length + 1}`, narration: '', publicText: '', hostNotes: '' });
    for (const c of S.story.characters) c.rounds.push({ readAloud: { accuses: '', text: '' } });
    save();
    renderReview();
    toast('Chapter added. Write its narration and every character\'s read-aloud evidence before playing.');
  },
  'remove-story-round'() {
    if (S.story.rounds.length <= 5 || !confirm('Remove the final chapter and every character\'s clues for it?')) return;
    S.story.rounds.pop();
    for (const c of S.story.characters) c.rounds.pop();
    save();
    renderReview();
  },
  start() { S.votes = {}; S.roundVotes = {}; setPhase('round', 0); },
  next() {
    if (S.phase === 'round') return setPhase('vote');
    if (S.phase !== 'vote' || S.roundIndex >= S.story.rounds.length - 1) return;
    const missing = S.story.characters.filter(c => S.claims[c.id] && !S.votes[c.id]);
    if (missing.length && !confirm(`${missing.length} joined player(s) have not voted. Close this round's voting anyway?`)) return;
    setPhase('round', S.roundIndex + 1);
  },
  prev() {
    if (S.phase === 'reveal') return setPhase('vote');
    if (S.phase === 'vote') return setPhase('round');
    if (S.roundIndex <= 0) return setPhase('lobby', -1);
    setPhase('round', S.roundIndex - 1);
  },
  reveal() {
    if (S.phase !== 'vote' || S.roundIndex !== S.story.rounds.length - 1) return;
    if (!Object.keys(S.votes).length && !confirm('No votes yet. Reveal anyway?')) return;
    setPhase('reveal');
  },
  release(el) {
    const id = el.dataset.id;
    if (!confirm('Release this character so another phone can claim it?')) return;
    releaseCharacter(S, conns, id);
    save();
    broadcast(); updateLive();
  },
  'reconnect-host'() {
    peerBlocked = false;
    toast('Reopening this room. Guests will reconnect; characters, clues and votes are kept.', 5000);
    restartPeer(0);
  },
  end() { if (confirm('End this game and go back to the start? (The story is lost unless you exported it.)')) wipe(); },
  'new-confirm'() { if (confirm('Start a brand new game? This one will be cleared.')) wipe(); },
};

function wipe() {
  broadcastRaw({ t: 'ended' });
  stopPeer();
  localStorage.removeItem(KEY); S = null;
  history.replaceState(null, '', baseUrl());
  renderLanding();
}

function newGame() {
  const prev = load();
  const guests = Array.isArray(prev?.guests) ? prev.guests : parseGuests(prev?.guestsText || '');
  S = { room: randomRoom(), phase: 'setup', roundIndex: -1, story: null, claims: {}, votes: {}, libraryId: null, theme: prev?.theme || '', guests, guestsText: guests.map(guest => guest.desc ? `${guest.name}, ${guest.desc}` : guest.name).join('\n'), createdAt: Date.now() };
  ui.errors = []; ui.warnings = [];
  save(); render();
}

function acceptStory(input, guests) {
  const res = normalizeStory(input, guests);
  ui.errors = res.errors; ui.warnings = res.warnings;
  if (!res.story) return renderSetup();
  S.story = res.story; S.claims = {}; S.votes = {}; S.roundVotes = {}; S.libraryId = null;
  setPhase('review', -1);
}

function onClick(e) {
  const el = e.target.closest('[data-act]');
  if (!el || !app().contains(el)) return;
  const fn = actions[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el); }
}

function onKeydown(e) {
  if (e.key === 'Enter' && (e.target.id === 'guest-name' || e.target.id === 'guest-desc')) {
    e.preventDefault();
    actions['add-guest']();
  }
}

function setPath(obj, path, val) {
  const parts = path.split('.');
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) { if (o[parts[i]] == null) o[parts[i]] = /^\d+$/.test(parts[i + 1]) ? [] : {}; o = o[parts[i]]; }
  o[parts[parts.length - 1]] = val;
}

function onInput(e) {
  const t = e.target;
  if (t.dataset.s && S) {
    S[t.dataset.s] = t.value; save();
  }
  if (t.dataset.path && t.dataset.kind !== 'checkbox' && S?.story) {
    const v = t.dataset.kind === 'lines' ? t.value.split('\n').map(s => s.trim()).filter(Boolean) : t.value;
    setPath(S.story, t.dataset.path, v); save();
  }
}

function onChange(e) {
  const t = e.target;
  if (t.hasAttribute('data-disclose-killer') && S?.story) {
    S.story.discloseKiller = t.checked;
    save();
    broadcast();
    toast(t.checked ? 'Murderer notification enabled.' : 'Murderer notification disabled. Anyone already told still knows.');
    return;
  }
  if (t.dataset.assignCharacter != null && S?.story) {
    const index = Number(t.dataset.assignCharacter);
    const character = S.story.characters[index];
    if (!character) return;
    const selectedGuest = getGuests().find(guest => guest.name === t.value);
    if (selectedGuest) {
      for (const [otherIndex, otherCharacter] of S.story.characters.entries()) {
        if (otherIndex !== index && otherCharacter.guest === selectedGuest.name) {
          otherCharacter.guest = '';
          otherCharacter.guestNote = '';
        }
      }
    }
    character.guest = selectedGuest?.name || '';
    character.guestNote = selectedGuest?.desc || '';
    save();
    renderReview();
    return;
  }
  if (t.dataset.path && t.dataset.kind === 'checkbox' && S?.story) {
    setPath(S.story, t.dataset.path, t.checked);
    save();
    renderReview();
    return;
  }
  if (t.id === 'json-file' && t.files?.[0]) {
    const r = new FileReader();
    r.onload = () => { ui.pasteText = String(r.result); $('#json').value = ui.pasteText; };
    r.readAsText(t.files[0]);
  }
  if (t.id === 'killer') renderReview();
  if (t.id === 'story-atmosphere') atmosphere.update({ room: S.room, phase: S.phase, roundIndex: S.roundIndex }, S.story);
}

// ---------- Networking (PeerJS, host = hub) ----------
function connectedChars() {
  const now = Date.now(), s = new Set();
  for (const rec of conns.values()) {
    const id = currentCharacter(S, rec);
    if (id && rec.conn.open && now - rec.lastSeen < 15000) s.add(id);
  }
  return s;
}

function hosting() {
  return !!S?.story && (LIVE_PHASES.includes(S.phase) || (S.phase === 'review' && S.wasLive));
}

function stopPeer() {
  clearTimeout(restartTimer);
  restartTimer = null;
  const old = peer;
  peer = null;
  conns.clear();
  if (old && !old.destroyed) old.destroy();
}

function recoverHost() {
  hostPaused = false;
  if (!hosting() || peerBlocked) return;
  if (!peer || peer.destroyed) startPeer();
  else if (peer.disconnected && Date.now() - peerAttemptAt > 15000) restartPeer(0);
}

function startPeer() {
  if (!hosting() || peerBlocked || hostPaused) return;
  if (peer && !peer.destroyed) return;
  if (typeof window.Peer !== 'function') { netStatus = 'PeerJS failed to load'; updateLive(); return; }
  if (navigator.onLine === false) { netStatus = 'offline'; updateLive(); return; }
  netStatus = 'connecting…'; updateLive();
  peerAttemptAt = Date.now();
  const p = new window.Peer(PEER_PREFIX + S.room.toLowerCase(), { debug: 1 });
  peer = p;
  p.on('open', () => { if (peer !== p) return; peerAttemptAt = Date.now(); netStatus = 'online'; updateLive(); });
  p.on('connection', conn => {
    if (peer !== p || !hosting()) { conn.close(); return; }
    setupConn(conn);
  });
  p.on('close', () => { if (peer === p) restartPeer(1500); });
  p.on('disconnected', () => {
    if (peer !== p || p.destroyed) return;
    peerAttemptAt = Date.now();
    netStatus = 'reconnecting…'; updateLive();
    setTimeout(() => {
      if (peer === p && !p.destroyed && p.disconnected) {
        try { p.reconnect(); } catch (error) {
          console.warn('[host] signaling reconnect failed', error);
          restartPeer(2000);
        }
      }
    }, 1500);
  });
  p.on('error', err => {
    console.warn('[host] peer error', err.type, err.message);
    if (peer !== p) return;
    if (['browser-incompatible', 'invalid-id', 'invalid-key', 'ssl-unavailable'].includes(err.type)) {
      peerBlocked = true;
      stopPeer();
      netStatus = err.type === 'browser-incompatible' ? 'WebRTC unavailable' : 'connection service unavailable';
      updateLive();
      toast(err.type === 'browser-incompatible'
        ? 'This browser cannot host WebRTC. Use an up-to-date Safari or Chrome browser, not an embedded app browser.'
        : `The room service could not start (${err.type}). Reload the page to retry.`, 10000);
    } else if (err.type === 'unavailable-id') { netStatus = 'reclaiming room…'; updateLive(); restartPeer(4000); }
    else if (['network', 'server-error', 'socket-error', 'socket-closed'].includes(err.type)) { netStatus = 'reconnecting…'; updateLive(); restartPeer(3000); }
  });
}
function restartPeer(ms) {
  clearTimeout(restartTimer);
  if (ms === 0 && hosting()) { netStatus = 'reconnecting…'; updateLive(); }
  restartTimer = setTimeout(() => {
    restartTimer = null;
    if (!hosting()) return;
    stopPeer();
    startPeer();
  }, ms);
}

function setupConn(conn) {
  const rec = { conn, charId: null, token: null, lastSeen: Date.now() };
  conns.set(conn, rec);
  conn.on('data', msg => {
    if (conns.get(conn) !== rec) return;
    rec.lastSeen = Date.now();
    try { onMsg(rec, msg); } catch (error) {
      console.error('[host] could not process player message', error);
      send(rec, { t: 'error', msg: 'The host could not process that action. Reconnect to check the latest state.' });
    }
  });
  const gone = () => { conns.delete(conn); updateLive(); };
  conn.on('close', gone);
  conn.on('error', gone);
}

function supersedeConnection(connection) {
  try {
    if (connection.open) connection.send({ t: 'superseded' });
  } catch (error) {
    console.warn('[host] could not notify replaced connection', error);
  }
  // Give the notice a chance to reach the old tab before closing its channel.
  setTimeout(() => connection.close(), 500);
}

function send(rec, obj) { try { if (rec.conn.open) rec.conn.send(obj); } catch (e) { console.warn('send failed', e); } }
function sendState(rec) {
  if (S?.story && rec.token) {
    rec.charId = currentCharacter(S, rec);
    send(rec, { t: 'state', view: buildView(S, rec.charId) });
  }
}
function broadcast() { for (const rec of conns.values()) sendState(rec); }
function broadcastRaw(o) { for (const rec of conns.values()) send(rec, o); }

function onMsg(rec, msg) {
  if (!msg || typeof msg !== 'object' || !S?.story) return;
  const ids = new Set(S.story.characters.map(c => c.id));
  switch (msg.t) {
    case 'hello': {
      const token = typeof msg.token === 'string' ? msg.token : '';
      if (!token) return send(rec, { t: 'error', msg: 'Your saved player identity is missing. Reload the page to retry.' });
      resumeSession(S, conns, rec, token, supersedeConnection);
      sendState(rec); updateLive();
      break;
    }
    case 'claim': {
      const id = msg.charId, token = String(msg.token || rec.token || '');
      if (!ids.has(id) || !token) return send(rec, { t: 'error', msg: 'That character does not exist.' });
      if (S.claims[id] && S.claims[id] !== token) { send(rec, { t: 'error', msg: 'Someone already claimed that character. If it is really you, ask the host to tap “release”.' }); return sendState(rec); }
      for (const k of Object.keys(S.claims)) if (S.claims[k] === token && k !== id) {
        releaseCharacter(S, conns, k);
      }
      S.claims[id] = token; rec.token = token; rec.charId = id; save();
      retireOtherSessions(conns, rec, supersedeConnection);
      broadcast(); updateLive();
      break;
    }
    case 'unclaim': {
      if (rec.charId && S.claims[rec.charId] === rec.token) {
        releaseCharacter(S, conns, rec.charId);
        save();
      }
      rec.charId = null; broadcast(); updateLive();
      break;
    }
    case 'vote': {
      if (S.phase !== 'vote' || msg.roundIndex !== S.roundIndex || !rec.charId ||
          S.claims[rec.charId] !== rec.token || !ids.has(msg.suspect) || msg.suspect === rec.charId) {
        send(rec, { t: 'error', msg: 'Voting is closed for that round, or that accusation is not allowed. Refresh if your screen is out of date.' });
        return sendState(rec);
      }
      selectRoundBallots(S, S.roundIndex);
      S.votes[rec.charId] = msg.suspect; save();
      broadcast(); updateLive();
      break;
    }
    case 'ping': send(rec, { t: 'pong' }); break;
  }
}

function tick() {
  const now = Date.now();
  if (hosting() && !peerBlocked && !hostPaused && navigator.onLine !== false) {
    if (!peer || peer.destroyed) startPeer();
    else if ((!peer.open || peer.disconnected) && now - peerAttemptAt > 15000 && restartTimer === null) {
      netStatus = 'reconnecting…'; updateLive();
      restartPeer(0);
    }
  }
  for (const [conn, rec] of conns) if (now - rec.lastSeen > 45000) { try { conn.close(); } catch {} conns.delete(conn); }
  updateLive();
}
