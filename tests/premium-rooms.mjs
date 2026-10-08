import test from 'node:test';
import assert from 'node:assert/strict';
import { premiumFixture, premiumIds } from './premium-fixture.mjs';
const seatToken = () => crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
const names = Array.from({ length: 5 }, (_, index) => `Player ${index + 1}`);

async function setup(t) {
  const fixture = await premiumFixture(); t.after(() => fixture.close());
  const order = (await fixture.buy()).body; fixture.approve(order.orderId); await fixture.capture(order.orderId);
  const host = (code, command, revision, extra = {}, user = 'buyer') => fixture.request('/api/premium/rooms/host',
    { user, method: 'POST', body: { code, command, revision, ...extra } });
  const guest = body => fixture.request('/api/premium/rooms/guest', { user: null, method: 'POST', body });
  const create = (gameId = 'lanternfall', capacity = 5) => fixture.request('/api/premium/rooms',
    { method: 'POST', body: { gameId, capacity } });
  return { ...fixture, host, guest, create, order };
}

test('host ownership, fixed capacity, seat filtering, atomic joins, removal and revocation', async t => {
  const f = await setup(t);
  assert.equal((await f.request('/api/premium/rooms', { user: 'other', method: 'POST', body: { gameId: 'ledger', capacity: 5 } })).status, 403);
  assert.equal((await f.create('ledger', 4)).status, 400);
  const created = (await f.create()).body, code = created.code;
  assert.equal(created.capacity, 5);
  assert.match(code, /^[A-Z2-9]{8}$/);
  assert.equal((await f.host(code, 'view', null, {}, 'other')).status, 403);
  assert.equal((await f.host(code, 'start', created.revision)).status, 409);
  const tokens = Array.from({ length: 5 }, seatToken);
  const joined = await Promise.all(tokens.map((token, index) => f.guest({ code, command: 'join', token, name: names[index] })));
  joined.forEach(response => assert.equal(response.status, 200, JSON.stringify(response.body)));
  const lobby = (await f.host(code, 'view')).body;
  assert.equal(lobby.players.length, 5);
  assert.ok(!JSON.stringify(lobby).includes('tokenHash'));
  assert.equal((await f.guest({ code, command: 'join', token: tokens[0], name: names[0] })).status, 200);
  assert.equal((await f.guest({ code, command: 'view', token: seatToken() })).status, 401);
  assert.equal((await f.guest({ code, command: 'join', token: seatToken(), name: 'Intruder' })).status, 409);
  const remove = await f.host(code, 'remove', (await f.host(code, 'view')).body.revision,
    { playerId: lobby.players[0].id });
  assert.equal(remove.status, 200);
  assert.equal((await f.guest({ code, command: 'view', token: tokens[0] })).status, 401);
  assert.equal((await f.guest({ code, command: 'join', token: seatToken(), name: 'Replacement' })).status, 200);
  const full = (await f.host(code, 'view')).body;
  assert.equal((await f.host(code, 'start', full.revision)).status, 200);
  let current = (await f.host(code, 'view')).body;
  assert.equal(current.phase, 'setup');
  assert.ok(current.players.every(player => !Object.hasOwn(player, 'role')));
  assert.ok(!JSON.stringify(current).includes('killerId'));
  assert.equal(current.private, null);
  assert.equal((await f.guest({ code, token: tokens[1], command: 'read-card', round: 0 })).status, 409);
  current = (await f.host(code, 'start-introduction', current.revision)).body;
  const firstSeat = tokens[names.indexOf(current.currentPlayer)];
  const cardRead = { code, command: 'read-card', token: firstSeat, round: 0 };
  assert.equal((await f.guest({ ...cardRead, token: tokens[2] })).status, 409);
  assert.equal((await f.guest(cardRead)).status, 200);
  await f.db.query("update public.gg_purchases set status='refunded' where user_id=$1", ['11111111-1111-4111-8111-111111111111']);
  assert.equal((await f.guest({ code, command: 'view', token: tokens[1] })).status, 403);
});

for (const gameId of ['lanternfall', 'ledger']) {
  test(`${gameId}: five phone seats complete setup, chained clues, every vote phase and fixed reveal`, async t => {
    const f = await setup(t), code = (await f.create(gameId)).body.code;
    const tokens = Array.from({ length: 5 }, seatToken);
    for (let i = 0; i < 5; i++) assert.equal((await f.guest({ code, command: 'join', token: tokens[i], name: names[i] })).status, 200);
    let room = (await f.host(code, 'view')).body;
    room = (await f.host(code, 'start', room.revision)).body;
    assert.equal(room.phase, 'setup');
    room = (await f.host(code, 'start-introduction', room.revision)).body;
    let actions = 0, revealed = false;
    while (room.phase !== 'finished') {
      assert.ok(actions++ < 100, 'story must terminate');
      if (['round-intro', 'intro-discussion', 'deliberation', 'final-accusation', 'reveal'].includes(room.phase)) {
        if (room.phase === 'reveal') {
          revealed = room.current?.type === 'reveal' && !!room.current.solution && !!room.current.fullStory;
        }
        const hostCommand = ({
          'round-intro': 'start-clues', 'intro-discussion': 'start-rounds', deliberation: 'open-vote',
          'final-accusation': 'open-final-vote', reveal: 'finish-reveal',
        })[room.phase];
        room = (await f.host(code, hostCommand, room.revision)).body;
        continue;
      }
      const playerIndex = names.indexOf(room.currentPlayer);
      assert.notEqual(playerIndex, -1, `current player ${room.currentPlayer} exists`);
      const command = room.phase === 'introduction' ? 'read-card' : room.phase === 'round' ? 'read-clue' : 'vote';
      const body = { code, token: tokens[playerIndex], command, round: room.round };
      if (command === 'vote') {
        const personal = (await f.guest({ code, command: 'view', token: tokens[playerIndex] })).body;
        assert.ok(personal.private.isCurrentTurn);
        assert.ok(personal.private.targets.length);
        body.target = personal.private.targets[0].id;
      }
      const action = await f.guest(body);
      assert.equal(action.status, 200, JSON.stringify(action.body));
      room = action.body;
    }
    assert.equal(room.current, null);
    assert.ok(revealed);
    assert.ok(room.finalVoteTally);
    assert.equal((await f.host(code, 'close', room.revision)).body.phase, 'closed');
    assert.equal((await f.guest({ code, token: tokens[0], command: 'view' })).status, 410);
  });
}

test('room expiry, sandbox isolation, caps and direct database privileges', async t => {
  const f = await setup(t);
  const codes = [];
  for (let i = 0; i < 3; i++) codes.push((await f.create()).body.code);
  assert.equal((await f.create()).status, 409);
  await f.db.query("update public.gg_premium_rooms set expires_at=now()-interval '1 second' where code=$1", [codes[0]]);
  assert.equal((await f.host(codes[0], 'view')).status, 404);
  assert.equal((await f.create()).status, 200);
  assert.equal((await f.db.query('select count(*)::int as n from public.gg_premium_rooms where code=$1', [codes[0]])).rows[0].n, 0);
  const rights = await f.db.query("select has_table_privilege('anon','public.gg_premium_rooms','SELECT') as readable, has_function_privilege('authenticated','public.gg_room_access(text,text)','EXECUTE') as executable");
  assert.equal(rights.rows[0].readable, false); assert.equal(rights.rows[0].executable, false);
  assert.equal((await f.db.query("select public.gg_room_list($1,'sandbox') as rooms", ['11111111-1111-4111-8111-111111111111'])).rows[0].rooms.length, 0);
});

test('payment webhooks suspend rooms, restore seller-won disputes, and never undo refunds', async t => {
  const f = await setup(t), code = (await f.create()).body.code;
  const tokens = Array.from({ length: 5 }, seatToken);
  for (let i = 0; i < tokens.length; i++) assert.equal((await f.guest({
    code, command: 'join', token: tokens[i], name: names[i],
  })).status, 200);
  let room = (await f.host(code, 'view')).body;
  room = (await f.host(code, 'start', room.revision)).body;
  room = (await f.host(code, 'start-introduction', room.revision)).body;
  const playerIndex = names.indexOf(room.currentPlayer);
  const action = { code, command: 'read-card', token: tokens[playerIndex], round: 0 };
  const capture = f.orders.get(f.order.orderId).purchase_units[0].payments.captures[0];
  const disputeId = 'PP-D-ROOMTEST0001';
  const dispute = { dispute_id: disputeId, status: 'OPEN', disputed_transactions: [{ seller_transaction_id: capture.id }] };
  f.disputes.set(disputeId, dispute);
  f.signatures(false);
  assert.equal((await f.webhook(disputeId, 'CUSTOMER.DISPUTE.CREATED', 'ROOMINVALID')).status, 403);
  assert.equal((await f.guest({ code, command: 'view', token: tokens[0] })).status, 200);
  f.signatures(true);
  assert.equal((await f.webhook(disputeId, 'CUSTOMER.DISPUTE.CREATED', 'ROOMDISPUTE')).status, 200);
  assert.equal((await f.host(code, 'view')).status, 403);
  assert.equal((await f.guest({ code, command: 'view', token: tokens[0] })).status, 403);
  assert.equal((await f.guest(action)).status, 403);
  assert.equal((await f.guest({ code, command: 'join', token: seatToken(), name: 'Late guest' })).status, 403);
  assert.equal((await f.webhook(f.order.orderId, 'PAYMENT.CAPTURE.COMPLETED', 'ROOMLATECAPTURE')).status, 200);
  assert.equal((await f.guest({ code, command: 'view', token: tokens[0] })).status, 403);
  dispute.status = 'RESOLVED'; dispute.dispute_outcome = { outcome_code: 'RESOLVED_SELLER_FAVOUR' };
  assert.equal((await f.webhook(disputeId, 'CUSTOMER.DISPUTE.RESOLVED', 'ROOMSELLERWON')).status, 200);
  const restored = (await f.guest({ code, command: 'view', token: tokens[playerIndex] })).body;
  assert.equal(restored.phase, 'introduction');
  assert.equal(restored.private.isCurrentTurn, true);
  assert.equal(restored.submitted, false);
  assert.equal((await f.guest(action)).status, 200);
  capture.status = 'REFUNDED';
  assert.equal((await f.webhook(f.order.orderId, 'PAYMENT.CAPTURE.REFUNDED', 'ROOMDASHBOARDREFUND')).status, 200);
  assert.equal((await f.webhook(f.order.orderId, 'PAYMENT.CAPTURE.REFUNDED', 'ROOMDASHBOARDREFUND')).status, 200);
  assert.equal((await f.host(code, 'view')).status, 403);
  assert.equal((await f.guest({ code, command: 'view', token: tokens[1] })).status, 403);
  assert.equal((await f.request('/api/purchases')).body.owned, false);
  assert.equal((await f.webhook(f.order.orderId, 'CHECKOUT.ORDER.APPROVED', 'ROOMLATEAPPROVAL')).status, 200);
  assert.equal((await f.guest({ code, command: 'view', token: tokens[1] })).status, 403);
  const stored = await f.db.query('select status from public.gg_purchases where user_id=$1', [premiumIds.buyer]);
  assert.equal(stored.rows[0].status, 'refunded');
});
