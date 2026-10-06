import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeveloperGame, stepDeveloperGame, nextDeveloperPlayer, developerTargets, developerCatalog } from '../server/developer-games.js';
import { createDeveloperLab } from '../server/developer-lab.js';

const names = count => Array.from({ length: count }, (_, i) => `Guest ${i + 1}`);
function commitNight(state, choose) {
  while (state.phase === 'night') {
    const player = nextDeveloperPlayer(state);
    const target = choose(player, state);
    state = stepDeveloperGame(state, { type: 'night', playerId: player.id, target });
  }
  return state;
}
function vote(state, suspect = null) {
  state = stepDeveloperGame(state, { type: 'council' });
  while (state.phase === 'vote') {
    const player = nextDeveloperPlayer(state);
    state = stepDeveloperGame(state, { type: 'vote', playerId: player.id, target: player.id === suspect ? null : suspect });
  }
  return state;
}
const defaultTarget = (player, state) => developerTargets(state, player)[0]?.id || null;
for (const gameId of ['lanternfall', 'ledger']) for (let count = 3; count <= 10; count++) {
  test(`${gameId}: ${count} players have complete roles and can finish a four-night game`, () => {
    let state = createDeveloperGame(gameId, names(count), () => 0.5);
    assert.equal(state.players.length, count);
    assert.equal(state.enemyCount, count >= 7 ? 2 : 1);
    assert.equal(state.players.filter(p => p.role === 'enemy').length, state.enemyCount);
    assert.equal(state.players.filter(p => p.role === 'protector').length, 1);
    assert.equal(state.players.filter(p => p.role === 'investigator').length, 1);
    assert.equal(state.players.filter(p => p.role === 'citizen').length, count - state.enemyCount - 2);
    let actions = 0;
    while (state.phase !== 'finished') {
      state = vote(commitNight(state, defaultTarget));
      actions++;
      assert.ok(actions <= 4);
    }
    assert.ok(['loyal', 'enemy'].includes(state.winner));
    assert.equal(state.players.length, count, 'no one is deleted');
  });
  test(`${gameId}: ${count} players can catch the entire enemy team`, () => {
    let state = createDeveloperGame(gameId, names(count), () => 0.5);
    for (const enemy of state.players.filter(p => p.role === 'enemy')) {
      state = commitNight(state, defaultTarget);
      state = vote(state, enemy.id);
      assert.ok(state.players.find(p => p.id === enemy.id).detained);
    }
    assert.equal(state.winner, 'loyal');
    assert.equal(state.phase, 'finished');
    assert.throws(() => stepDeveloperGame(state, { type: 'council' }), /discussion/);
  });
}
test('lantern wards rotate, simultaneous duplicate attacks break a lantern only once, and observations do not identify visitors', () => {
  let state = createDeveloperGame('lanternfall', names(7), () => 0.5);
  state = commitNight(state, p => p.role === 'protector' ? 'l1' : 'l0');
  assert.deepEqual(state.broken, ['l0']);
  assert.match(state.players.find(p => p.role === 'investigator').report, /A Hollow touched/);
  const watcher = state.players.find(p => p.role === 'citizen');
  assert.match(watcher.report, /other visitor/);
  assert.ok(!watcher.report.includes('Guest'));
  state = vote(state);
  const guard = state.players.find(p => p.role === 'protector');
  assert.ok(!developerTargets(state, guard).some(t => t.id === 'l1'));
  state = commitNight(state, p => p.role === 'enemy' ? 'l1' : p.role === 'protector' ? 'l2' : 'l1');
  state = vote(state);
  state = commitNight(state, p => p.role === 'enemy' ? 'l2' : p.role === 'protector' ? 'l0' : 'l2');
  state = vote(state);
  assert.equal(state.winner, 'enemy');
});
test('wards block every attacker but the listener still detects the attempted touch', () => {
  const state = commitNight(createDeveloperGame('lanternfall', names(3)), () => 'l0');
  assert.deepEqual(state.broken, []);
  assert.match(state.players.find(p => p.role === 'investigator').report, /A Hollow touched/);
});
test('ledger shields precede attacks, duplicate debts count once, and credit follows damage', () => {
  let state = createDeveloperGame('ledger', names(7), () => 0.5);
  const target = state.players.find(p => p.role === 'investigator').id;
  state = commitNight(state, p => p.role === 'protector' ? p.id : target);
  assert.equal(state.losses, 1);
  assert.equal(state.players.find(p => p.id === target).influence, 3, 'credit restored damaged influence');
  assert.match(state.players.find(p => p.role === 'investigator').report, /Counterfeit debt was attempted/);
  state = vote(state);
  state = commitNight(state, () => target);
  assert.equal(state.losses, 1, 'shield blocks both counterfeiters');
});
test('ledger uses current weighted influence, abstentions count toward majority denominator, and tied councils detain nobody', () => {
  let state = createDeveloperGame('ledger', names(3), () => 0.5);
  state.phase = 'discussion';
  state.players[0].influence = 0;
  state.players[1].influence = 3;
  state.players[2].influence = 1;
  state = stepDeveloperGame(state, { type: 'council' });
  for (const player of state.players) state = stepDeveloperGame(state, {
    type: 'vote', playerId: player.id, target: player.id === 'p2' ? 'p1' : null,
  });
  assert.ok(state.players[0].detained, 'weight 3 beats half of total 5');
  let tied = createDeveloperGame('lanternfall', names(4));
  tied.phase = 'discussion';
  tied = stepDeveloperGame(tied, { type: 'council' });
  for (const p of tied.players) tied = stepDeveloperGame(tied, { type: 'vote', playerId: p.id, target: ['p1', 'p2'].includes(p.id) ? 'p3' : 'p1' });
  assert.ok(tied.players.every(p => !p.detained));
});
test('ledger loss objective is reachable at three players and simultaneous convictions take priority', () => {
  let state = createDeveloperGame('ledger', names(3), () => 0.5);
  const victim = state.players.find(p => p.role === 'investigator').id;
  while (state.phase !== 'finished') {
    state = vote(commitNight(state, (p, current) => p.role === 'protector'
      ? developerTargets(current, p).find(t => t.id !== victim).id : victim));
  }
  assert.equal(state.winner, 'enemy');
  assert.equal(state.losses, 3);
  let caught = createDeveloperGame('ledger', names(3), () => 0.5);
  caught.losses = 2;
  const enemy = caught.players.find(p => p.role === 'enemy').id;
  const other = caught.players.find(p => p.role === 'investigator').id;
  caught = vote(commitNight(caught, p => p.role === 'protector' ? p.id : other), enemy);
  assert.equal(caught.losses, 3);
  assert.equal(caught.winner, 'loyal', 'last-chance council can still catch the entire faction');
});
test('input and phase guards reject invalid sizes, duplicates, out-of-turn actions and self-votes', () => {
  for (const n of [0, 2, 11]) assert.throws(() => createDeveloperGame('ledger', names(n)), /3-10/);
  assert.throws(() => createDeveloperGame('ledger', ['Alex', ' alex ', 'Sam']), /different name/);
  assert.throws(() => createDeveloperGame('unknown', names(3)), /prototype/);
  const state = createDeveloperGame('lanternfall', names(3));
  assert.throws(() => stepDeveloperGame(state, { type: 'council' }), /discussion/);
  assert.throws(() => stepDeveloperGame(state, { type: 'night', playerId: 'p2', target: 'l0' }), /next eligible/);
  assert.throws(() => stepDeveloperGame(state, { type: 'night', playerId: 'p1', target: 'invalid' }), /available target/);
  const voting = stepDeveloperGame(commitNight(state, defaultTarget), { type: 'council' });
  assert.throws(() => stepDeveloperGame(voting, { type: 'vote', playerId: 'p1', target: 'p1' }), /available target/);
});
test('signed owner snapshots cannot be altered, forged or reused by another owner', async () => {
  const lab = createDeveloperLab('test-secret');
  const original = await lab.act({ command: { type: 'create' }, gameId: 'ledger', names: names(3) }, 'owner');
  const command = { type: 'night', playerId: original.turn.id, target: original.targets[0].id };
  const next = await lab.act({ ...original, command }, 'owner');
  assert.equal(Object.keys(next.state.actions).length, 1);
  const modified = structuredClone(original); modified.state.losses = 100;
  await assert.rejects(lab.act({ ...modified, command }, 'owner'), /snapshot changed/);
  await assert.rejects(lab.act({ ...original, command }, 'other-owner'), /another owner/);
  await assert.rejects(lab.act({ ...original, seal: '0'.repeat(64), command }, 'owner'), /snapshot changed/);
  assert.equal(developerCatalog().length, 2);
});
