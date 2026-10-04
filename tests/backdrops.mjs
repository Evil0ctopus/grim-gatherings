import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BACKDROPS, backdropFor, backdropHtml } from '../js/backdrops.js';
import { THEMES } from '../js/atmosphere.js';

test('all host and player story phases use the selected setting', () => {
  for (const phase of ['review', 'lobby', 'round', 'vote', 'reveal']) {
    for (const theme of THEMES) assert.equal(backdropFor(phase, theme), theme);
  }
  assert.equal(backdropFor('home', 'witch'), null);
  assert.equal(backdropFor('setup', 'witch'), 'corridor');
  assert.equal(backdropFor('connecting', 'farm'), 'corridor');
  assert.equal(backdropFor('round', '<script>'), 'manor');
});

test('story themes use four locally bundled photographs distinct from the landing', () => {
  assert.equal(new Set(THEMES.map(theme => BACKDROPS[theme])).size, 4);
  for (const file of Object.values(BACKDROPS)) {
    assert.notEqual(file, 'assets/haunted-manor.jpg');
    const photo = readFileSync(new URL(`../${file}`, import.meta.url));
    assert.deepEqual([...photo.subarray(0, 3)], [0xff, 0xd8, 0xff]);
    assert.ok(photo.length > 50000 && photo.length < 1000000);
  }
});

test('background markup is noninteractive and has no story content', () => {
  const html = backdropHtml();
  assert.match(html, /class="story-photograph" alt=""/);
  assert.doesNotMatch(html, /<button|<input|<a\b|src=|https?:/);
  for (const layer of ['story-camera', 'story-light', 'story-mist', 'story-weather', 'atmosphere-vignette']) {
    assert.ok(html.includes(layer));
  }
});
