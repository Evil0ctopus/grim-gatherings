import { developerCatalog, createDeveloperGame, stepDeveloperGame, developerTargets } from './developer-games.js';

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
    const game = developerCatalog().find(g => g.id === data.gameId);
    const player = seat && state?.players.find(p => p.id === seat.id);
    const submitted = player && ['night', 'vote'].includes(state.phase) &&
      Object.hasOwn(state.phase === 'night' ? state.actions : state.ballots, player.id);
    return {
      code: room.code, revision: room.revision, expiresAt: room.expires_at,
      game, phase: data.phase, capacity: data.capacity, host,
      players: data.seats.map(s => {
        const p = state?.players.find(item => item.id === s.id);
        return { id: s.id, name: s.name, detained: p?.detained || false, influence: p?.influence ?? 3,
          ...(state?.phase === 'finished' ? { role: game.roles[p.role][0] } : {}) };
      }),
      round: state?.round || 0, log: state?.log || [], winner: state?.winner || null,
      submitted: !!submitted,
      waiting: state && ['night', 'vote'].includes(state.phase)
        ? state.players.filter(p => !p.detained && !Object.hasOwn(state.phase === 'night' ? state.actions : state.ballots, p.id)).length : 0,
      private: player && !player.detained ? {
        id: player.id, name: player.name, role: game.roles[player.role][0], description: game.roles[player.role][1],
        report: player.report,
        allies: player.role === 'enemy' ? state.players.filter(p => p.role === 'enemy' && p.id !== player.id).map(p => p.name) : [],
        targets: !submitted && ['night', 'vote'].includes(state.phase) ? developerTargets(state, player) : [],
        weight: state.gameId === 'ledger' ? Math.max(1, player.influence) : 1,
      } : null,
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
    const seat = room.data.seats.find(s => s.tokenHash === digest);
    requireRoom(seat, 401, 'Your seat is no longer in this room. Check with the host.');
    return seat;
  }
  return {
    async list(user) { return { games: developerCatalog(), rooms: await rpc('gg_room_list', { p_user: user.id, p_environment: environment }) }; },
    async create(user, body) {
      requireRoom(developerCatalog().some(g => g.id === body.gameId), 400, 'Choose a bundle game.');
      requireRoom(Number.isInteger(body.capacity) && body.capacity >= 3 && body.capacity <= 10, 400, 'Choose 3-10 player seats.');
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const code = Array.from(crypto.getRandomValues(new Uint8Array(8)), b => alphabet[b % alphabet.length]).join('');
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
          requireRoom(data.phase === 'lobby' && data.seats.length === data.capacity, 409, 'Wait for every player to join before dealing roles.');
          data.state = createDeveloperGame(data.gameId, data.seats.map(s => s.name),
            () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296);
          data.state.players.forEach((p, i) => { p.id = data.seats[i].id; });
          data.phase = data.state.phase;
        } else if (body.command === 'council') {
          requireRoom(data.phase === 'discussion', 409, 'Open ballots only after dawn discussion.');
          data.state = stepDeveloperGame(data.state, { type: 'council' });
          data.phase = data.state.phase;
        } else if (body.command === 'remove') {
          requireRoom(data.phase === 'lobby' && data.seats.some(s => s.id === body.playerId), 400, 'Remove a joined player only before roles are dealt.');
          data.seats = data.seats.filter(s => s.id !== body.playerId);
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
          const existing = data.seats.find(s => s.tokenHash === digest);
          if (existing) return { seat: existing };
          requireRoom(data.phase === 'lobby', 409, 'Roles have already been dealt. Resume on your original phone.');
          requireRoom(data.seats.length < data.capacity, 409, 'This room is full.');
          requireRoom(!data.seats.some(s => s.name.toLowerCase() === name.toLowerCase()), 409, 'That name is already taken. Use your own unique name.');
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
        requireRoom(state && body.round === state.round && body.command === state.phase &&
          ['night', 'vote'].includes(body.command), 409, 'This turn has changed. Refresh before acting.');
        const player = state.players.find(p => p.id === seat.id);
        requireRoom(!player.detained, 403, 'Detained players participate only in public discussion.');
        const choices = state.phase === 'night' ? state.actions : state.ballots;
        if (Object.hasOwn(choices, seat.id)) {
          requireRoom(choices[seat.id] === body.target, 409, 'Your choice is already committed and cannot be changed.');
          return { seat };
        }
        room.data.state = stepDeveloperGame(state, { type: body.command, playerId: seat.id, target: body.target }, { simultaneous: true });
        room.data.phase = room.data.state.phase;
        return { seat };
      });
      return view(room, seat);
    },
  };
}
