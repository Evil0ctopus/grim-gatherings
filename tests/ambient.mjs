import test from 'node:test';
import assert from 'node:assert/strict';
import { ambientTrack, createAmbientAudio } from '../js/ambient.js';
import { readFileSync } from 'node:fs';

const state = { phase: 'home', theme: 'manor', enabled: true, visible: true, volume: 0.6 };

function harness() {
  const sources = [];
  const gains = [];
  const errors = [];
  const node = () => ({ connect() {}, disconnect() {} });
  const context = {
    currentTime: 0,
    decodeAudioData: async () => ({
      sampleRate: 100, length: 200, numberOfChannels: 1,
      getChannelData: () => new Float32Array(200).fill(1),
    }),
    createBufferSource() {
      const source = { ...node(), starts: 0, stops: 0, start() { this.starts++; }, stop() { this.stops++; } };
      sources.push(source);
      return source;
    },
    createBiquadFilter: () => ({ ...node(), frequency: { value: 0 } }),
    createGain() {
      const gain = { ...node(), gain: {
        value: 0,
        setValueAtTime(value) { this.value = value; },
        linearRampToValueAtTime(value) { this.value = value; },
        setTargetAtTime(value) { this.value = value; },
      } };
      gains.push(gain);
      return gain;
    },
  };
  return { ambient: createAmbientAudio(context, error => errors.push(error)), sources, gains, errors };
}

test('only home, setup and review are eligible for recorded ambience', () => {
  for (const theme of ['manor', 'witch', 'farm', 'victorian']) assert.equal(ambientTrack('home', theme), 'storm');
  assert.equal(ambientTrack('setup', 'victorian'), 'wind');
  assert.equal(ambientTrack('review', 'victorian'), 'rain');
  assert.equal(ambientTrack('review', 'farm'), 'wind');
  for (const phase of ['connecting', 'lobby', 'round', 'vote', 'reveal', 'unknown']) {
    for (const theme of ['manor', 'witch', 'farm', 'victorian']) assert.equal(ambientTrack(phase, theme), null);
  }
});

test('recordings are bundled Ogg files', () => {
  for (const file of ['rain', 'howling-wind', 'thunderstorm']) {
    const data = readFileSync(new URL(`../assets/audio/${file}.ogg`, import.meta.url));
    assert.equal(data.subarray(0, 4).toString(), 'OggS');
    assert.ok(data.length > 100000 && data.length < 2000000);
  }
});

test('ambient playback updates volume without restarting and stops for every game phase', async t => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) }));
  for (const phase of ['lobby', 'round', 'vote', 'reveal', 'connecting']) {
    const { ambient, sources, gains } = harness();
    await ambient.update(state);
    assert.equal(sources[0].loop, true);
    await ambient.update({ ...state, volume: 0.2 });
    assert.equal(sources.length, 1);
    assert.equal(gains[0].gain.value, 0.06);
    await ambient.update({ ...state, phase });
    assert.equal(sources[0].stops, 1);
    await ambient.update({ ...state, phase });
    assert.equal(sources.length, 1);
  }
});

test('mute and hiding the tab stop ambience, and disabled audio does not fetch', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) }));
  const { ambient, sources } = harness();
  await ambient.update({ ...state, enabled: false });
  assert.equal(fetch.mock.callCount(), 0);
  await ambient.update(state);
  await ambient.update({ ...state, enabled: false });
  assert.equal(sources[0].stops, 1);
  await ambient.update(state);
  await ambient.update({ ...state, visible: false });
  assert.equal(sources[1].stops, 1);
});

test('a recording that finishes loading after entering the lobby never starts', async t => {
  let resolve;
  t.mock.method(globalThis, 'fetch', () => new Promise(done => { resolve = done; }));
  const { ambient, sources } = harness();
  const loading = ambient.update(state);
  await ambient.update({ ...state, phase: 'lobby' });
  resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) });
  await loading;
  assert.equal(sources.length, 0);
});

test('download errors are reported and allow an explicit retry', async t => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 503 }));
  const { ambient, sources, errors } = harness();
  await ambient.update(state);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /503/);
  assert.equal(sources.length, 0);
  await ambient.update(state);
  assert.equal(errors.length, 2);
});
