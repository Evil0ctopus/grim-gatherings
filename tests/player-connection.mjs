import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createPlayerConnection } from '../js/player-connection.js';

function clock() {
  let time = 1000, next = 0;
  const jobs = new Map();
  const add = (fn, delay, repeat = false) => {
    const id = ++next;
    jobs.set(id, { fn, at: time + delay, delay, repeat });
    return id;
  };
  return {
    now: () => time,
    setTimeout: (fn, ms) => add(fn, ms),
    clearTimeout: id => jobs.delete(id),
    setInterval: (fn, ms) => add(fn, ms, true),
    clearInterval: id => jobs.delete(id),
    count: () => jobs.size,
    advance(ms) {
      const end = time + ms;
      while (true) {
        const nextJob = [...jobs].filter(([, job]) => job.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!nextJob) break;
        const [id, job] = nextJob;
        time = job.at;
        if (job.repeat) job.at += job.delay;
        else jobs.delete(id);
        job.fn();
      }
      time = end;
    },
  };
}

class Channel extends EventEmitter {
  open = false;
  sent = [];
  close() { this.open = false; this.emit('close'); }
  send(message) { this.sent.push(message); }
  opened() { this.open = true; this.emit('open'); }
}

class Peer extends EventEmitter {
  destroyed = false;
  channel = new Channel();
  reconnects = 0;
  connect(hostId, options) { this.target = { hostId, options }; return this.channel; }
  destroy() { this.destroyed = true; this.channel.close(); this.emit('close'); }
  reconnect() { this.reconnects++; }
}

function harness() {
  const timers = clock(), peers = [], statuses = [], messages = [];
  let online = true;
  const identity = { t: 'hello', token: 'same-phone-token', charId: 'xander' };
  const network = createPlayerConnection({
    createPeer: () => { const p = new Peer(); peers.push(p); return p; },
    hostId: 'grimgath-v1-test', hello: () => identity,
    onMessage: message => messages.push(message),
    onStatus: (status, detail) => statuses.push({ status, detail }),
    online: () => online, now: timers.now, timers,
  });
  const state = { t: 'state', view: { roster: [], me: 'xander', phase: 'round', roundIndex: 2 } };
  return {
    timers, peers, statuses, messages, network, identity, state,
    offline: () => { online = false; network.reconnect(); },
    online: () => { online = true; network.reconnect(); },
    channel() { return peers.at(-1).channel; },
    opened() { peers.at(-1).emit('open'); this.channel().opened(); },
    joined() { this.opened(); this.channel().emit('data', state); },
  };
}

test('a silent signaling service cannot leave a phone connecting forever', () => {
  const h = harness();
  h.network.start();
  h.timers.advance(12000);
  assert.equal(h.peers[0].destroyed, true);
  assert.match(h.statuses.at(-1).detail, /service did not respond/);
  h.timers.advance(2000);
  assert.equal(h.peers.length, 2);
  h.joined();
  assert.equal(h.statuses.at(-1).status, 'connected');
  h.network.stop();
});

test('a never-opening data channel times out and is replaced with a fresh peer', () => {
  const h = harness();
  h.network.start();
  h.peers[0].emit('open');
  assert.deepEqual(h.peers[0].target, {
    hostId: 'grimgath-v1-test', options: { reliable: true, serialization: 'binary' },
  });
  h.timers.advance(12000);
  assert.match(h.statuses.at(-1).detail, /host connection timed out/);
  h.timers.advance(2000);
  h.joined();
  assert.deepEqual(h.channel().sent[0], h.identity);
  h.network.stop();
});

test('an open channel with pongs but no game state is not a successful connection', () => {
  const h = harness();
  h.network.start(); h.opened();
  assert.notEqual(h.statuses.at(-1).status, 'connected');
  assert.equal(h.network.send({ t: 'claim' }), false);
  h.channel().emit('data', { t: 'state', view: null });
  h.channel().emit('data', { t: 'pong' });
  h.timers.advance(10000);
  assert.match(h.statuses.at(-1).detail, /did not send game state/);
  h.timers.advance(2000); h.joined();
  assert.equal(h.statuses.at(-1).status, 'connected');
  assert.equal(h.messages.length, 1);
  h.network.stop();
});

test('a channel that stays open but stops answering heartbeats is replaced', () => {
  const h = harness();
  h.network.start(); h.joined();
  const old = h.channel();
  h.timers.advance(16000);
  assert.match(h.statuses.at(-1).detail, /host stopped responding/);
  assert.equal(h.peers[0].destroyed, true);
  old.emit('data', h.state);
  assert.notEqual(h.statuses.at(-1).status, 'connected', 'Retired data must be ignored');
  h.timers.advance(2000); h.joined();
  assert.deepEqual(h.channel().sent[0], h.identity);
  h.network.stop();
});

test('a silently closed data channel is recovered without needing a close event', () => {
  const h = harness();
  h.network.start(); h.joined();
  h.channel().open = false;
  h.timers.advance(4000);
  assert.match(h.statuses.at(-1).detail, /no longer open/);
  h.timers.advance(2000); h.joined();
  assert.equal(h.statuses.at(-1).status, 'connected');
  h.network.stop();
});

test('lost claim or vote acknowledgments recover even if heartbeat pongs still arrive', () => {
  const h = harness();
  h.network.start(); h.joined();
  assert.equal(h.network.send({ t: 'claim', charId: 'xander' }), true);
  for (let i = 0; i < 3; i++) {
    h.channel().emit('data', { t: 'pong' });
    h.timers.advance(4000);
  }
  assert.match(h.statuses.at(-1).detail, /did not confirm your action/);
  h.timers.advance(2000); h.joined();
  assert.equal(h.state.view.roundIndex, 2);
  h.network.stop();
});

test('healthy channels survive signaling disconnection and duplicate open events', () => {
  const h = harness();
  h.network.start(); h.joined();
  h.peers[0].emit('disconnected');
  assert.equal(h.peers[0].reconnects, 1);
  h.peers[0].emit('open');
  h.peers[0].emit('error', { type: 'network', message: 'signaling only' });
  assert.equal(h.peers.length, 1);
  assert.equal(h.peers[0].destroyed, false);
  assert.equal(h.network.send({ t: 'vote', suspect: 'marla', roundIndex: 2 }), true);
  h.channel().emit('data', h.state);
  h.timers.advance(8000);
  assert.equal(h.peers[0].destroyed, false);
  h.network.stop();
});

test('pagehide/pageshow recovery keeps identity, cancels old deadlines and ignores stale callbacks', () => {
  const h = harness();
  h.network.start(); h.joined();
  const old = h.peers[0];
  h.network.suspend();
  h.timers.advance(60000);
  assert.equal(h.peers.length, 1);
  old.emit('open');
  old.channel.emit('data', h.state);
  h.network.resume(); h.joined();
  assert.equal(h.peers.length, 2);
  assert.deepEqual(h.channel().sent[0], h.identity);
  h.network.stop();
  h.network.resume(); h.network.reconnect(); h.timers.advance(60000);
  assert.equal(h.peers.length, 2);
  assert.equal(h.timers.count(), 0);
});

test('offline pauses connection attempts and online resumes without resetting identity', () => {
  const h = harness();
  h.network.start(); h.joined();
  h.offline();
  assert.equal(h.statuses.at(-1).status, 'offline');
  h.timers.advance(60000);
  assert.equal(h.peers.length, 1);
  h.online(); h.joined();
  assert.deepEqual(h.channel().sent[0], h.identity);
  h.network.stop();
});

test('manual retry and peer-unavailable retire obsolete attempts without a retry storm', () => {
  const h = harness();
  h.network.start();
  const old = h.peers[0];
  old.emit('error', { type: 'peer-unavailable', message: 'missing room' });
  assert.equal(h.statuses.at(-1).status, 'waiting');
  h.network.reconnect();
  old.emit('error', { type: 'network', message: 'stale error' });
  h.joined(); h.timers.advance(3000);
  assert.equal(h.peers.length, 2);
  assert.equal(h.statuses.at(-1).status, 'connected');
  h.network.stop();
});

test('send exceptions become explicit recovery, not success-shaped acknowledgments', t => {
  t.mock.method(console, 'warn', () => {});
  const h = harness();
  h.network.start(); h.joined();
  h.channel().send = () => { throw new Error('closed channel'); };
  assert.equal(h.network.send({ t: 'vote' }), false);
  assert.match(h.statuses.at(-1).detail, /stopped sending/);
  h.timers.advance(2000); h.joined();
  h.network.stop();
});

test('unsupported browsers show a permanent actionable error instead of retrying forever', t => {
  t.mock.method(console, 'warn', () => {});
  const h = harness();
  h.network.start();
  h.peers[0].emit('error', { type: 'browser-incompatible', message: 'No WebRTC' });
  assert.equal(h.statuses.at(-1).status, 'offline');
  assert.match(h.statuses.at(-1).detail, /cannot use WebRTC.*Safari or Chrome/);
  h.network.resume(); h.timers.advance(60000);
  assert.equal(h.peers.length, 1);
  h.network.reconnect();
  assert.equal(h.peers.length, 2, 'Only an explicit retry should restart an unsupported browser');
  h.network.stop();
});
