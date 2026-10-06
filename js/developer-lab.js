import { esc } from './util.js?v=workshop-v1';
import { communityRequest } from './community-api.js?v=premium-v1';

export function createGameRoom({ endpoint = '/api/admin/developer', noticeHtml = null, storageKey = null } = {}) {
let games = [], snapshot = null, mode = 'setup', cardIndex = 0, revealed = false, notesRead = false;
const button = (action, label) => `<button type="button" data-action="lab-${action}">${esc(label)}</button>`;
function clearDeveloperLab() {
  games = []; snapshot = null; mode = 'setup'; cardIndex = 0; revealed = false; notesRead = false;
}
async function openDeveloperLab() {
  games = (await communityRequest(endpoint)).games;
  if (storageKey && !snapshot) {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      let record;
      try { record = JSON.parse(saved); }
      catch { throw new Error('Your saved premium session is damaged. Use Discard saved match to start again; your purchase is unchanged.'); }
      snapshot = await communityRequest(endpoint, { method: 'POST', body: { ...record, command: { type: 'resume' } } });
      mode = 'public'; notesRead = false;
    }
  }
  revealed = false;
}
function game() { return games.find(g => g.id === snapshot?.state.gameId); }
function privateCard(player, notesOnly = false) {
  if (!revealed) return `<div class="card"><h2>Pass the device to ${esc(player.name)}</h2><p>Everyone else looks away. Do not share the ${storageKey ? 'account' : 'owner'} login or leave this device unattended.</p>${button('reveal', notesOnly ? 'Read my private dawn note' : 'Reveal my private card')}</div>`;
  const current = game(), [role, description] = current.roles[player.role];
  const allies = player.role === 'enemy' ? snapshot.state.players.filter(p => p.role === 'enemy' && p.id !== player.id).map(p => p.name) : [];
  return `<div class="card gold"><h2>${esc(player.name)}: ${esc(role)}</h2><p>${esc(description)}</p>
    ${player.role === 'enemy' ? `<p>Secret allies: ${esc(allies.join(', ') || 'None - you act alone.')}</p>` : ''}
    ${player.report ? `<p><b>Private note:</b> ${esc(player.report)}</p>` : ''}
    ${notesOnly || mode === 'roles' ? button('next-card', 'Hide and pass on') : turnControls(player)}</div>`;
}
function turnControls(player) {
  const phase = snapshot.state.phase;
  return `<p>${phase === 'vote' ? 'Secret ballot. You may abstain; you cannot vote for yourself.' : 'Choose tonight’s secret target.'}</p>
    <label for="lab-target">Target</label><select id="lab-target">
    ${snapshot.targets.map(t => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('')}
    ${phase === 'vote' || !snapshot.targets.length ? '<option value="">Abstain / no available attack</option>' : ''}
    </select>${button('submit', phase === 'vote' ? 'Cast ballot and hide' : 'Commit action and hide')}
    <p class="small muted">${phase === 'vote' ? `Ballot weight: ${snapshot.state.gameId === 'ledger' ? Math.max(1, player.influence) : 1}.` : 'Actions resolve together after everyone commits. The Lamplighter / Escrow Agent cannot repeat last night’s target.'}</p>`;
}
function developerLabHtml() {
  const notice = noticeHtml || `<div class="card"><p><b>Owner-only developer sandbox.</b> Test the original games independently of the premium shop. This sandbox never charges or grants purchase access.</p>
    <p>Pass-and-play on one trusted device for 3-10 people, or control all seats yourself to test. No phone rooms or remote joining in this prototype. Roles and actions are delivered only through the protected owner API.</p>
    <p class="small">Tests live in this page’s memory, not account backups. Refreshing, logging out, or closing the page ends the test. This is an owner-controlled sandbox, not a competitive anti-cheat service.</p></div>`;
  if (!snapshot) return `${notice}<label for="lab-game">${storageKey ? 'Game' : 'Prototype'}</label><select id="lab-game">${games.map(g => `<option value="${esc(g.id)}">${esc(g.title)}</option>`).join('')}</select>
    <label for="lab-names">Players - one unique name per line (3-10)</label><textarea id="lab-names">Player 1\nPlayer 2\nPlayer 3</textarea>
    ${button('create', 'Deal secret roles')}
    ${games.map(g => `<section class="card"><h2>${esc(g.title)}</h2><p>${esc(g.premise)}</p><ol>${g.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ol></section>`).join('')}`;
  const state = snapshot.state, current = game();
  const publicPanel = `<h2>${esc(current.title)} - ${state.phase === 'finished' ? 'Final reveal' : `Round ${state.round}: ${esc(state.phase)}`}</h2>
    <details><summary>Rules and win conditions</summary><ol>${current.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ol></details>
    <div class="card"><h3>Public table</h3><ul>${state.players.map(p => `<li>${esc(p.name)}${p.detained ? ' - detained witness' : ''}${state.gameId === 'ledger' ? ` - influence ${p.influence}, ballot weight ${Math.max(1, p.influence)}` : ''}</li>`).join('')}</ul>
    <h3>Public chronicle</h3><ol>${state.log.map(line => `<li>${esc(line)}</li>`).join('')}</ol></div>`;
  let content;
  if (mode === 'roles') content = privateCard(state.players[cardIndex]);
  else if (mode === 'reports') content = privateCard(state.players.filter(p => !p.detained)[cardIndex], true);
  else if (snapshot.turn) content = privateCard(snapshot.turn);
  else if (state.phase === 'discussion') content = `<div class="card"><h3>Dawn discussion</h3><p>Read private notes one player at a time, then discuss. Give each person time to speak. A two-minute discussion is a useful starting point; the moderator decides when everyone is ready.</p>
    ${button('notes', notesRead ? 'Reread private dawn notes' : 'Read private dawn notes')}
    ${notesRead ? button('council', 'Discussion finished - start secret ballots') : '<p>Read the dawn notes before opening ballots.</p>'}</div>`;
  else content = `<div class="card gold"><h3>${esc(state.winner === 'loyal' ? current.loyal : current.enemy)} win</h3>
    <ul>${state.players.map(p => `<li>${esc(p.name)}: ${esc(current.roles[p.role][0])}</li>`).join('')}</ul><p>Discuss which claims were true, which observations were misleading, and how the vote weights or wards changed the outcome.</p></div>`;
  return `${notice}${publicPanel}${content}${button('restart', storageKey ? 'End match / choose another game' : 'End test / choose another prototype')}`;
}
async function developerLabAction(action, root) {
  if (action === 'create') {
    const gameId = root.querySelector('#lab-game').value, names = root.querySelector('#lab-names').value.split('\n').filter(n => n.trim());
    snapshot = await communityRequest(endpoint, { method: 'POST', body: { command: { type: 'create' }, gameId, names } });
    mode = 'roles'; cardIndex = 0; revealed = false; notesRead = false;
  } else if (action === 'reveal') revealed = true;
  else if (action === 'next-card') {
    const count = mode === 'roles' ? snapshot.state.players.length : snapshot.state.players.filter(p => !p.detained).length;
    cardIndex++; revealed = false;
    if (cardIndex === count) { mode = 'public'; notesRead = snapshot.state.phase === 'discussion'; }
  } else if (action === 'notes') { mode = 'reports'; cardIndex = 0; revealed = false; }
  else if (action === 'restart') {
    if (!confirm(`End this ${storageKey ? 'match' : 'test'}? Its roles, actions and history will be discarded.`)) return;
    snapshot = null; mode = 'setup'; revealed = false; notesRead = false;
    if (storageKey) localStorage.removeItem(storageKey);
  } else if (action === 'council' || action === 'submit') {
    const command = action === 'council' ? { type: 'council' } : {
      type: snapshot.state.phase, playerId: snapshot.turn.id, target: root.querySelector('#lab-target').value || null,
    };
    snapshot = await communityRequest(endpoint, { method: 'POST', body: { state: snapshot.state, seal: snapshot.seal, command } });
    mode = 'public'; revealed = false;
    if (snapshot.state.phase !== 'discussion') notesRead = false;
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
