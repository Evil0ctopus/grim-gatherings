import { esc } from './util.js?v=workshop-v1';
import { communityRequest } from './community-api.js?v=premium-v1';

export function createGameRoom({ endpoint = '/api/admin/developer', noticeHtml = null, storageKey = null } = {}) {
  let games = [], snapshot = null, revealed = false;
  const button = (action, label) => `<button type="button" data-action="lab-${action}">${esc(label)}</button>`;
  function clearDeveloperLab() { games = []; snapshot = null; revealed = false; }
  async function openDeveloperLab() {
    games = (await communityRequest(endpoint)).games;
    if (storageKey && !snapshot) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        let record;
        try { record = JSON.parse(saved); }
        catch { throw new Error('Your saved premium session is damaged. Use Discard saved match to start again; your purchase is unchanged.'); }
        snapshot = await communityRequest(endpoint, { method: 'POST', body: { ...record, command: { type: 'resume' } } });
        revealed = false;
      }
    }
  }
  function phaseCommand(type) {
    return communityRequest(endpoint, { method: 'POST', body: {
      state: snapshot.state, seal: snapshot.seal,
      command: { type, ...(snapshot.turn ? { playerId: snapshot.turn.id } : {}) },
    } });
  }
  function tallyHtml(tally) {
    if (!tally) return '';
    const names = new Map(snapshot.state.players.map(player => [player.characterId, player.characterName]));
    return `<ul>${Object.entries(tally).map(([id, count]) => `<li>${esc(names.get(id) || id)}: ${count}</li>`).join('')}</ul>`;
  }
  function currentText() {
    const current = snapshot.current;
    if (!current) return '';
    if (current.type === 'character-card') {
      const c = current.character, p = snapshot.turn;
      return `<h3>Character card — ${esc(p.name)} — ${esc(c.name)}</h3><p><b>${esc(c.role)}</b></p>
        <p>${esc(c.relationship)}</p><p>${esc(c.tieIn)}</p><p>${esc(c.publicBlurb)}</p>`;
    }
    if (current.type === 'clue') return `<h3>${esc(current.playerName)} reads</h3><blockquote>${esc(current.clue.text)}</blockquote>`;
    return '';
  }
  function passTurnHtml() {
    const state = snapshot.state, player = snapshot.turn;
    if (!player) return '';
    if (!revealed) return `<div class="card"><h3>Pass the device to ${esc(player.name)}</h3>
      <p>Everyone else looks away. Reveal only when the next reader or voter is ready.</p>${button('reveal', 'Reveal this turn')}</div>`;
    let control;
    if (state.phase === 'introduction') control = button('read-card', 'Read character card aloud and pass');
    else if (state.phase === 'round') control = button('read-clue', 'Read clue aloud and pass');
    else control = `<label for="lab-target">Your vote</label><select id="lab-target">${snapshot.targets.map(target =>
      `<option value="${esc(target.id)}">${esc(target.name)}</option>`).join('')}</select>${button('vote', 'Submit vote and pass')}`;
    return `<div class="card gold">${currentText()}${control}</div>`;
  }
  function phasePanel() {
    const state = snapshot.state, story = snapshot.game.story, current = snapshot.current;
    if (state.phase === 'setup') return `<div class="card"><h3>Read the story setup aloud</h3>
      <p>${esc(story.setting)}</p><p>${esc(story.intro)}</p>${button('start-introduction', 'Setup read — begin character cards')}</div>`;
    if (state.phase === 'intro-discussion') return `<div class="card"><h3>Pre-round deliberation</h3>
      <p>Discuss and accuse based on the setup and character introductions. This discussion is optional.</p>${button('start-rounds', 'Begin clue rounds')}</div>`;
    if (state.phase === 'round-intro') return `<div class="card"><h3>${esc(current.title)}</h3>
      <p>${esc(current.narration)}</p><p>${esc(current.publicText)}</p>${button('start-clues', 'Narration read — begin clue chain')}</div>`;
    if (state.phase === 'deliberation') return `<div class="card"><h3>Round ${state.round} deliberation and vote</h3>
      <p>Discuss the clues just read. Then open the round vote.</p>${tallyHtml(state.roundVoteTallies[state.roundIndex])}${button('open-vote', 'Discussion finished — open round vote')}</div>`;
    if (state.phase === 'final-accusation') return `<div class="card"><h3>Final accusations</h3>
      <p>${esc(story.finale.narration)}</p><p><b>${esc(story.finale.votePrompt)}</b></p>
      <p>Make and discuss final accusations before the final vote.</p>${button('open-final-vote', 'Accusations finished — open final vote')}</div>`;
    if (state.phase === 'reveal') return `<div class="card gold"><h3>Fixed story reveal</h3>
      <p>${esc(current.fullStory)}</p><p><b>Truth:</b> ${esc(current.solution.explanation)}</p>
      ${button('finish-reveal', 'Finish story')}</div>`;
    if (state.phase === 'finished') return `<div class="card gold"><h3>Story complete</h3>${tallyHtml(state.finalVoteTally)}
      <p>The fixed reveal answered the final accusation.</p></div>`;
    if (state.phase === 'vote' || state.phase === 'final-vote') return `<div class="card"><h3>${state.phase === 'final-vote' ? 'Final vote' : `Round ${state.round} vote`}</h3>
      <p>Each player votes privately in turn. Vote for one other character.</p>${passTurnHtml()}</div>`;
    return passTurnHtml();
  }
  function developerLabHtml() {
    const notice = noticeHtml || `<div class="card"><p><b>Owner-only developer sandbox.</b> Test premium stories independently of the shop. This sandbox never charges or grants purchase access.</p>
      <p>Pass-and-play on one trusted device. The story uses a fixed player count; all players follow the same read-aloud setup, target-chained clue rounds, deliberation and vote phases, final accusation, final vote and fixed reveal.</p></div>`;
    if (!snapshot) return `${notice}<label for="lab-game">${storageKey ? 'Story' : 'Prototype'}</label><select id="lab-game">${games.map(game =>
      `<option value="${esc(game.id)}">${esc(game.title)} — ${game.playerCount} players</option>`).join('')}</select>
      <label for="lab-names">Player names — exactly five, one per line</label><textarea id="lab-names">Player 1\nPlayer 2\nPlayer 3\nPlayer 4\nPlayer 5</textarea>
      ${button('create', 'Start story')}
      ${games.map(game => `<section class="card"><h2>${esc(game.title)}</h2><p>${esc(game.premise)}</p>
        <p>Fixed cast: ${game.playerCount} players.</p><p>${game.specialMechanics.map(esc).join(' ')}</p></section>`).join('')}`;
    const state = snapshot.state, story = snapshot.game.story;
    const publicPanel = `<h2>${esc(snapshot.game.title)} — ${esc(state.phase.replaceAll('-', ' '))}${state.round ? ` — round ${state.round}` : ''}</h2>
      <details><summary>Story premise and mechanics</summary><p>${esc(snapshot.game.premise)}</p>
        <p>${story.specialMechanics.map(esc).join(' ')}</p></details>
      <div class="card"><h3>Players</h3><ul>${state.players.map(player =>
        `<li>${esc(player.name)} — ${esc(player.characterName)}</li>`).join('')}</ul>
        ${state.phase === 'deliberation' ? `<h3>Round vote</h3>${tallyHtml(state.roundVoteTallies[state.roundIndex])}` : ''}
      </div>`;
    return `${notice}${publicPanel}${phasePanel()}${button('restart', storageKey ? 'End match / choose another story' : 'End test / choose another story')}`;
  }
  async function developerLabAction(action, root) {
    if (action === 'create') {
      const gameId = root.querySelector('#lab-game').value;
      const names = root.querySelector('#lab-names').value.split('\n').filter(name => name.trim());
      snapshot = await communityRequest(endpoint, { method: 'POST', body: { command: { type: 'create' }, gameId, names } });
      revealed = false;
    } else if (action === 'reveal') revealed = true;
    else if (action === 'restart') {
      if (!confirm(`End this ${storageKey ? 'match' : 'test'}? Its progress will be discarded.`)) return;
      snapshot = null; revealed = false;
      if (storageKey) localStorage.removeItem(storageKey);
    } else {
      const commands = {
        'start-introduction': () => phaseCommand('start-introduction'),
        'start-rounds': () => phaseCommand('start-rounds'),
        'start-clues': () => phaseCommand('start-clues'),
        'open-vote': () => phaseCommand('open-vote'),
        'open-final-vote': () => phaseCommand('open-final-vote'),
        'finish-reveal': () => phaseCommand('finish-reveal'),
        'read-card': () => phaseCommand('read-card'),
        'read-clue': () => phaseCommand('read-clue'),
        vote: () => communityRequest(endpoint, { method: 'POST', body: {
          state: snapshot.state, seal: snapshot.seal,
          command: { type: 'vote', playerId: snapshot.turn.id, target: root.querySelector('#lab-target').value },
        } }),
      };
      if (commands[action]) {
        snapshot = await commands[action]();
        revealed = false;
      }
    }
    if (storageKey && snapshot) localStorage.setItem(storageKey, JSON.stringify({ state: snapshot.state, seal: snapshot.seal }));
  }
  return { open: openDeveloperLab, html: developerLabHtml, action: developerLabAction, clear: clearDeveloperLab };
}

const developerRoom = createGameRoom();
export const openDeveloperLab = developerRoom.open;
export const developerLabHtml = developerRoom.html;
export const developerLabAction = developerRoom.action;
export const clearDeveloperLab = developerRoom.clear;
