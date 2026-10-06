import { DeveloperGameError, developerCatalog, createDeveloperGame, stepDeveloperGame, nextDeveloperPlayer, developerTargets } from './developer-games.js';

export function createDeveloperLab(secret) {
  const key = crypto.subtle.importKey('raw', new TextEncoder().encode(`gg-developer-v1:${secret}`),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  async function seal(state, owner) {
    const bytes = await crypto.subtle.sign('HMAC', await key, new TextEncoder().encode(JSON.stringify({ owner, state })));
    return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
  }
  return {
    catalog: () => ({ games: developerCatalog() }),
    async act(body, owner) {
      let state;
      if (body.command?.type === 'create') state = createDeveloperGame(body.gameId, body.names, () =>
        crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296);
      else {
        if (!body.state || typeof body.seal !== 'string' || !/^[0-9a-f]{64}$/.test(body.seal)) {
          throw new DeveloperGameError('Restart this developer session; its snapshot is invalid.');
        }
        const expected = await seal(body.state, owner);
        let difference = 0;
        for (let i = 0; i < 64; i++) difference |= expected.charCodeAt(i) ^ body.seal.charCodeAt(i);
        if (difference !== 0) throw new DeveloperGameError('Developer snapshot changed or belongs to another owner. Restart the test.');
        state = stepDeveloperGame(body.state, body.command);
      }
      const turn = nextDeveloperPlayer(state);
      return { state, seal: await seal(state, owner), turn,
        targets: turn ? developerTargets(state, turn) : [] };
    },
  };
}
