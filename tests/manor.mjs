import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hauntedManorHtml } from '../js/manor.js';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('the manor is decorative, nonfocusable and uses a bundled photograph', () => {
  const html = hauntedManorHtml();
  assert.match(html, /class="manor-scene" aria-hidden="true"/);
  assert.match(html, /focusable="false"/);
  assert.match(html, /preserveAspectRatio="xMidYMid slice"/);
  assert.match(html, /viewBox="0 0 1920 1228"/);
  assert.doesNotMatch(html, /<button|<a\b|<input|href="https?:/);
  const photoPath = html.match(/href="([^"]+\.jpg)"/)?.[1];
  assert.equal(photoPath, 'assets/haunted-manor.jpg');
  const photo = readFileSync(new URL(`../${photoPath}`, import.meta.url));
  assert.deepEqual([...photo.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  assert.ok(photo.length > 50000 && photo.length < 1000000);
});

test('weather and window activity are layered separately from the photograph', () => {
  const html = hauntedManorHtml();
  for (const layer of ['manor-camera', 'manor-cloud-shadow', 'manor-mist mist-back', 'manor-mist mist-front', 'manor-rain', 'manor-scene-shade']) {
    assert.ok(html.includes(`class="${layer}"`), layer);
  }
  assert.match(html, /clip-path="url\(#manor-window-clip\)"/);
  assert.match(read('../assets/fog.svg'), /feTurbulence/);
  assert.match(read('../assets/fog.svg'), /stitchTiles="stitch"/);
});

test('deployment cache tags include the changed scene module and stylesheet', () => {
  const version = 'ui-refresh-v1';
  assert.ok(read('../index.html').includes(`css/style.css?v=${version}`));
  assert.ok(read('../index.html').includes('js/main.js?v=blackwater-master-v1'));
  assert.ok(read('../js/main.js').includes('./host.js?v=blackwater-master-v1'));
  assert.ok(read('../js/host.js').includes('./manor.js?v=manor-background-v2'));
  assert.ok(read('../js/main.js').includes('./player.js?v=lockdown-release-v1'));
});
