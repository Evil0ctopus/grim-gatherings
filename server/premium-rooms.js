import {
  developerCatalog, developerCurrentContent, developerTargets, nextDeveloperPlayer,
  createDeveloperGame, stepDeveloperGame,
} from './developer-games.js';

class RoomError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const requireRoom = (condition, status, message) => { if (!condition) throw new RoomError(status, message); };
async function hash(token) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
const validCode = code => {
  requireRoom(typeof code === 'string' && /^[A-Z2-9]{8}$/.test(code), 400, 'Enter the eight-character premium room code.');
  return code;
};

export function createPremiumRooms({ rpc, environment }) {
  const read = code => rpc('gg_room_access', { p_code: validCode(code), p_environment: environment });
  function view(room, seat = null, host = false) {
    const data = room.data, state = data.state;
    const game = developerCatalog().find(item => item.id === data.gameId);
    const player = seat && state?.players.find(item => item.id === seat.id);
    const turn = state && nextDeveloperPlayer(state);
    const isCurrentTurn = !!player && turn?.id === player.id;
    const current = state && developerCurrentContent(state);
    const setup = game && {
      title: game.title, premise: game.premise, playerCount: game.playerCount,
      specialMechanics: game.specialMechanics, setting: game.setting, intro: game.intro,
      victim: game.victim, finale: game.finale,
    };
    return {
      code: room.code, revision: room.revision, expiresAt: room.expires_at,
      game, setup, phase: data.phase, capacity: data.capacity, host,
      players: data.seats.map(s => {
        const p = state?.players.find(item => item.id === s.id);
        return { id: s.id, name: s.name, characterId: p?.characterId || null, characterName: p?.characterName || null };
      }),
      round: state?.round || 0, current, roundVoteTallies: state?.roundVoteTallies || [],
      roundVoteTally: state?.roundVoteTallies?.[state.round - 1] || null,
      finalVoteTally: state?.finalVoteTally || null,
      finalPrompt: setup?.finale.votePrompt || '',
      stateStarted: !!state,
      submitted: !!player && ['round', 'vote', 'final-vote'].includes(state?.phase) && !isCurrentTurn,
      currentPlayer: turn?.name || null,
      private: player ? {
        id: player.id, name: player.name, isCurrentTurn,
        targets: isCurrentTurn && ['vote', 'final-vote'].includes(state.phase) ? developerTargets(state, player) : [],
      } : null,
      waiting: turn ? 1 : 0,
    };
  }
  async function mutate(code, transform) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const room = await read(code);
      requireRoom(room.data.phase !== 'closed', 410, 'This room has been closed by the host.');
      const result = await transform(room);
      const saved = await rpc('gg_room_save', { p_code: code, p_environment: environment,
        p_revision: room.revision, p_data: room.data });
      if (saved) return { room: saved, ...result };
    }
    throw new RoomError(409, 'The room changed while you were acting. Refresh and try again.');
  }
  async function seatFor(room, token) {
    requireRoom(typeof token === 'string' && /^[0-9a-f]{64}$/.test(token), 401, 'Rejoin on the phone used to claim your seat.');
    const digest = await hash(token);
    const seat = room.data.seats.find(item => item.tokenHash === digest);
    requireRoom(seat, 401, 'Your seat is no longer in this room. Check with the host.');
    return seat;
  }
  return {
    async list(user) {
      return { games: developerCatalog(), rooms: await rpc('gg_room_list', { p_user: user.id, p_environment: environment }) };
    },
    async create(user, body) {
      const game = developerCatalog().find(item => item.id === body.gameId);
      requireRoom(game, 400, 'Choose a bundle story.');
      requireRoom(body.capacity === game.playerCount, 400, `This story is written for exactly ${game.playerCount} players.`);
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const code = Array.from(crypto.getRandomValues(new Uint8Array(8)), byte => alphabet[byte % alphabet.length]).join('');
      const room = await rpc('gg_room_create', { p_code: code, p_user: user.id, p_environment: environment,
        p_data: { gameId: body.gameId, capacity: body.capacity, phase: 'lobby', seats: [], state: null } });
      return view(room, null, true);
    },
    async host(user, body) {
      const code = validCode(body.code);
      if (body.command === 'view') {
        const room = await read(code);
        requireRoom(room.owner_id === user.id, 403, 'Only this room’s purchasing host can manage it.');
        return view(room, null, true);
      }
      const { room } = await mutate(code, room => {
        requireRoom(room.owner_id === user.id, 403, 'Only this room’s purchasing host can manage it.');
        requireRoom(body.revision === room.revision, 409, 'The room changed. Refresh before managing it.');
        const data = room.data;
        if (body.command === 'start') {
          requireRoom(data.phase === 'lobby' && data.seats.length === data.capacity, 409, 'Wait for every player to join before reading the story.');
          data.state = createDeveloperGame(data.gameId, data.seats.map(item => item.name));
          data.state.players.forEach((player, index) => { player.id = data.seats[index].id; });
          data.phase = data.state.phase;
        } else if (['start-introduction', 'start-rounds', 'start-clues', 'open-vote', 'open-final-vote', 'finish-reveal'].includes(body.command)) {
          requireRoom(data.state, 409, 'Start the story before advancing its phases.');
          data.state = stepDeveloperGame(data.state, { type: body.command });
          data.phase = data.state.phase;
        } else if (body.command === 'remove') {
          requireRoom(data.phase === 'lobby' && data.seats.some(item => item.id === body.playerId), 400, 'Remove a joined player only before the story starts.');
          data.seats = data.seats.filter(item => item.id !== body.playerId);
        } else if (body.command === 'close') data.phase = 'closed';
        else throw new RoomError(400, 'Choose a host room action.');
        return {};
      });
      return view(room, null, true);
    },
    async guest(body) {
      const code = validCode(body.code);
      if (body.command === 'join') {
        requireRoom(typeof body.name === 'string' && body.name.trim().length > 0 && body.name.trim().length <= 40, 400, 'Enter a player name of 1-40 characters.');
        requireRoom(typeof body.token === 'string' && /^[0-9a-f]{64}$/.test(body.token), 400, 'Your phone must supply a secure seat token.');
        const token = body.token, digest = await hash(token);
        const { room, seat } = await mutate(code, room => {
          const data = room.data, name = body.name.trim();
          const existing = data.seats.find(item => item.tokenHash === digest);
          if (existing) return { seat: existing };
          requireRoom(data.phase === 'lobby', 409, 'The story has started. Resume on your original phone.');
          requireRoom(data.seats.length < data.capacity, 409, 'This room is full.');
          requireRoom(!data.seats.some(item => item.name.toLowerCase() === name.toLowerCase()), 409, 'That name is already taken. Use your own unique name.');
          const seat = { id: crypto.randomUUID(), name, tokenHash: digest };
          data.seats.push(seat);
          return { seat };
        });
        return { ...view(room, seat), token };
      }
      if (body.command === 'view') {
        const room = await read(code);
        requireRoom(room.data.phase !== 'closed', 410, 'This room has been closed by the host.');
        return view(room, await seatFor(room, body.token));
      }
      const { room, seat } = await mutate(code, async room => {
        const seat = await seatFor(room, body.token), state = room.data.state;
        const expected = state && nextDeveloperPlayer(state);
        requireRoom(state && body.round === state.round &&
          ['read-card', 'read-clue', 'vote'].includes(body.command), 409, 'This turn has changed. Refresh before acting.');
        requireRoom(expected?.id === seat.id, 409, 'Wait for your turn in the story.');
        room.data.state = stepDeveloperGame(state, { type: body.command, playerId: seat.id, target: body.target });
        room.data.phase = room.data.state.phase;
        return { seat };
      });
      return view(room, seat);
    },
  };
}
