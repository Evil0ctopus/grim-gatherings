import test from 'node:test';
import assert from 'node:assert/strict';
import { createHostWakeLock } from '../js/host-wake-lock.js';

function fixture(requestImpl) {
  const statuses = [], locks = [];
  let visible = true, requests = 0;
  const wakeLock = {
    async request(kind) {
      requests++;
      assert.equal(kind, 'screen');
      if (requestImpl) await requestImpl();
      const lock = new EventTarget();
      lock.released = false;
      lock.release = async () => {
        lock.released = true;
        lock.dispatchEvent(new Event('release'));
      };
      locks.push(lock);
      return lock;
    },
  };
  const host = createHostWakeLock({ wakeLock, visible: () => visible, onStatus: status => statuses.push(status) });
  return { host, locks, statuses, requests: () => requests, hide: () => { visible = false; }, show: () => { visible = true; } };
}

test('host requests one screen lock and releases it when hosting ends', async () => {
  const f = fixture();
  await f.host.setActive(true);
  await f.host.setActive(true);
  assert.equal(f.requests(), 1);
  assert.equal(f.statuses.at(-1), 'active');
  await f.host.setActive(false);
  assert.ok(f.locks[0].released);
  assert.equal(f.statuses.at(-1), 'inactive');
});

test('hidden host releases screen lock and reacquires when visible', async () => {
  const f = fixture();
  await f.host.setActive(true);
  f.hide();
  await f.host.setActive(true);
  assert.ok(f.locks[0].released);
  assert.equal(f.statuses.at(-1), 'paused');
  f.show();
  await f.host.setActive(true);
  assert.equal(f.requests(), 2);
  assert.equal(f.statuses.at(-1), 'active');
});

test('late wake-lock request cannot keep an ended game awake', async () => {
  let resolve;
  const f = fixture(() => new Promise(done => { resolve = done; }));
  const pending = f.host.setActive(true);
  await f.host.setActive(false);
  resolve();
  await pending;
  assert.ok(f.locks[0].released);
  assert.equal(f.statuses.at(-1), 'inactive');
});

test('a slow old-lock release cannot overwrite the newly active status', async () => {
  const f = fixture();
  await f.host.setActive(true);
  let resolve;
  const originalRelease = f.locks[0].release;
  f.locks[0].release = async () => {
    await new Promise(done => { resolve = done; });
    await originalRelease();
  };
  const releasing = f.host.setActive(false);
  await f.host.setActive(true);
  resolve();
  await releasing;
  assert.equal(f.statuses.at(-1), 'active');
  assert.equal(f.requests(), 2);
});

test('concurrent requests share a single pending screen lock', async () => {
  let resolve;
  const f = fixture(() => new Promise(done => { resolve = done; }));
  const first = f.host.setActive(true), second = f.host.setActive(true);
  resolve();
  await Promise.all([first, second]);
  assert.equal(f.requests(), 1);
  assert.equal(f.locks.length, 1);
});

test('returning while a cancelled pending lock releases reacquires the screen', async () => {
  let finishRequest, finishRelease;
  const statuses = [];
  let requests = 0;
  const wakeLock = { async request() {
    requests++;
    if (requests === 1) await new Promise(resolve => { finishRequest = resolve; });
    const lock = new EventTarget();
    lock.released = false;
    lock.release = async () => {
      await new Promise(resolve => { finishRelease = resolve; });
      lock.released = true;
    };
    return lock;
  } };
  const host = createHostWakeLock({ wakeLock, visible: () => true, onStatus: status => statuses.push(status) });
  const pending = host.setActive(true);
  await host.setActive(false);
  finishRequest();
  await Promise.resolve();
  await Promise.resolve();
  const returning = host.setActive(true);
  finishRelease();
  await Promise.all([pending, returning]);
  assert.equal(requests, 2);
  assert.equal(statuses.at(-1), 'active');
});

test('browser releasing wake lock gives honest status and can retry', async () => {
  const f = fixture();
  await f.host.setActive(true);
  await f.locks[0].release();
  assert.equal(f.statuses.at(-1), 'released');
  await f.host.setActive(true);
  assert.equal(f.requests(), 2);
  assert.equal(f.statuses.at(-1), 'active');
});

test('unsupported browsers receive manual-awake status without crashing', async () => {
  const statuses = [];
  const host = createHostWakeLock({ wakeLock: null, visible: () => true, onStatus: status => statuses.push(status) });
  await host.setActive(true);
  assert.deepEqual(statuses, ['unavailable']);
});

test('denied wake-lock requests warn and leave a retryable manual-awake status', async t => {
  const warning = t.mock.method(console, 'warn', () => {});
  const f = fixture(() => { throw new Error('Permission denied'); });
  await f.host.setActive(true);
  await f.host.setActive(true);
  assert.equal(f.requests(), 2);
  assert.equal(f.statuses.at(-1), 'unavailable');
  assert.equal(warning.mock.callCount(), 2);
});
