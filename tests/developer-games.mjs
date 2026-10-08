import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDeveloperGame, developerCatalog, developerCurrentContent, developerGameView, developerTargets,
  nextDeveloperPlayer, stepDeveloperGame,
} from '../server/developer-games.js';
import { createDeveloperLab } from '../server/developer-lab.js';

const names = Array.from({ length: 5 }, (_, i) => `Guest ${i + 1}`);
const advance = (state, type) => stepDeveloperGame(state, { type });

for (const gameId of ['lanternfall', 'ledger']) {
  test(`${gameId}: fixed five-player universal story flow, exact chains and complete target coverage`, () => {
    let state = createDeveloperGame(gameId, names);
    const definition = developerCatalog().find(game => game.id === gameId);
    assert.equal(definition.playerCount, 5);
    assert.equal(state.phase, 'setup');
    assert.equal(developerCurrentContent(state), null);
    assert.equal(state.players.length, 5);

    state = advance(state, 'start-introduction');
    const characters = [];
    while (state.phase === 'introduction') {
      const player = nextDeveloperPlayer(state);
      characters.push(player.characterId);
      assert.equal(developerCurrentContent(state).character.id, player.characterId);
      state = stepDeveloperGame(state, { type: 'read-card', playerId: player.id });
    }
    assert.equal(state.phase, 'intro-discussion');
    state = advance(state, 'start-rounds');

    const seenPairs = new Set();
    const story = developerGameView(gameId).story;
    for (let round = 0; round < story.rounds.length; round++) {
      assert.equal(state.phase, 'round-intro');
      assert.equal(developerCurrentContent(state).type, 'round-introduction');
      state = advance(state, 'start-clues');
      const expectedChain = story.rounds[round].chain;
      for (let i = 0; i < expectedChain.length; i++) {
        const player = nextDeveloperPlayer(state);
        assert.equal(player.characterId, expectedChain[i]);
        const clue = developerCurrentContent(state).clue;
        const target = expectedChain[(i + 1) % expectedChain.length];
        assert.equal(clue.accuses, target);
        const pair = `${player.characterId}->${target}`;
        assert.ok(!seenPairs.has(pair), `repeated pair ${pair}`);
        seenPairs.add(pair);
        state = stepDeveloperGame(state, { type: 'read-clue', playerId: player.id });
      }
      assert.equal(state.phase, 'deliberation');
      state = advance(state, 'open-vote');
      while (state.phase === 'vote') {
        const player = nextDeveloperPlayer(state);
        const target = developerTargets(state, player)[0];
        assert.ok(target);
        state = stepDeveloperGame(state, { type: 'vote', playerId: player.id, target: target.id });
      }
      if (round < story.rounds.length - 1) {
        assert.equal(state.phase, 'round-intro');
      } else {
        assert.equal(state.phase, 'final-accusation');
        state = advance(state, 'open-final-vote');
        while (state.phase === 'final-vote') {
          const player = nextDeveloperPlayer(state);
          const target = developerTargets(state, player)[0];
          state = stepDeveloperGame(state, { type: 'vote', playerId: player.id, target: target.id });
        }
        assert.equal(state.phase, 'reveal');
        const reveal = developerCurrentContent(state);
        assert.ok(reveal.fullStory.includes(reveal.solution.revealNarration));
        assert.ok(reveal.solution.explanation);
        state = advance(state, 'finish-reveal');
      }
    }
    assert.equal(state.phase, 'finished');
    assert.equal(seenPairs.size, 20);
    for (const reader of characters) for (const target of characters) {
      if (reader !== target) assert.ok(seenPairs.has(`${reader}->${target}`));
    }
    assert.equal(Object.values(state.finalVoteTally).reduce((sum, count) => sum + count, 0), 5);
  });
}

test('catalog and creation enforce one fixed edition and reject invalid names', () => {
  assert.deepEqual(developerCatalog().map(game => game.playerCount), [5, 5]);
  for (const count of [0, 4, 6, 10]) assert.throws(() =>
    createDeveloperGame('ledger', Array.from({ length: count }, (_, i) => `Player ${i}`)), /exactly 5/);
  assert.throws(() => createDeveloperGame('ledger', ['Alex', 'alex', ...names.slice(2)]), /different name/);
  assert.throws(() => createDeveloperGame('unknown', names), /Choose a bundle story/);
  assert.throws(() => stepDeveloperGame(createDeveloperGame('ledger', names), { type: 'read-clue', playerId: 'x' }), /not next/);
});

test('signed owner snapshots reject tampering and reveal full story only at the reveal phase', async () => {
  const lab = createDeveloperLab('test-secret');
  const initial = await lab.act({ command: { type: 'create' }, gameId: 'ledger', names }, 'owner');
  assert.equal(initial.state.phase, 'setup');
  assert.ok(!initial.game.story.solution);
  const started = await lab.act({ state: initial.state, seal: initial.seal, command: { type: 'start-introduction' } }, 'owner');
  assert.equal(started.state.phase, 'introduction');
  await assert.rejects(() => lab.act({
    state: { ...started.state, phase: 'finished' }, seal: started.seal, command: { type: 'resume' },
  }, 'owner'), /changed or belongs/);
  await assert.rejects(() => lab.act({
    state: started.state, seal: started.seal, command: { type: 'resume' },
  }, 'another-owner'), /changed or belongs/);
});
