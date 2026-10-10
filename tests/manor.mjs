import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { hauntedManorHtml, manorShadowSequence, startManorShadow } from '../js/manor.js';
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('reviewed estate uses local supporting artwork and one unchanged proportional house', () => {
  const html = hauntedManorHtml();
  assert.doesNotMatch(html, /manor-arrived|href="https?:|<canvas/);
  assert.match(html, /viewBox="0 0 1600 1000"/);
  assert.match(html, /x="485" y="235" width="630" height="435.75"/);
  assert.equal(630 / 435.75, 1080 / 747);
  assert.equal((html.match(/href="assets\/estate-generated-manor.png"/g) || []).length, 1);
  for (const source of [...html.matchAll(/href="([^"]+)"/g)]) {
    assert.ok(existsSync(new URL(`../${source[1]}`, import.meta.url)), source[1]);
  }
  assert.equal((html.match(/class="manor-grave"/g) || []).length, 10);
  assert.equal((html.match(/class="manor-flame"/g) || []).length, 10);
  assert.equal((html.match(/class="manor-bat-flight"/g) || []).length, 5);
  assert.equal((html.match(/class="manor-window"/g) || []).length, 7);
  assert.ok(html.indexOf('large-tree.png') > html.indexOf('estate-generated-manor.png'));
  assert.ok(html.indexOf('arch-tree.png') > html.indexOf('estate-generated-manor.png'));
  assert.match(html, /arch-tree.png" x="1010" y="280" width="650"/);
});

test('gate leaves meet in the center and open before camera passage', () => {
  const html = hauntedManorHtml();
  assert.match(html, /manor-gate-left" transform="translate\(548 690\)"/);
  assert.match(html, /manor-gate-right" transform="translate\(800 690\)"/);
  assert.match(html, /width="252" height="291.04"/);
  assert.match(html, /viewBox="629.5 0 629.5 727"/);
  const css = read('../css/style.css');
  assert.match(css, /animation:manor-gate-open 9s 1s/);
  assert.match(css, /animation:manor-approach 10s 10s/);
  assert.match(css, /animation:manor-gateway-pass 10s 10s/);
  assert.match(css, /100%\{transform:scale\(5\);opacity:0\}/);
});

test('shadow visits all seven protected panes with hidden travel and no immediate repeat', () => {
  let seed = 314159, previous = -1;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const orders = new Set();
  for (let cycle = 0; cycle < 100; cycle++) {
    const sequence = manorShadowSequence(random, previous);
    assert.deepEqual([...sequence.order].sort(), [0, 1, 2, 3, 4, 5, 6]);
    assert.notEqual(sequence.order[0], previous);
    assert.equal(sequence.duration, 60000);
    assert.equal(sequence.frames.length, 35);
    sequence.order.forEach((index, slot) => {
      const frames = sequence.frames.slice(slot * 5, slot * 5 + 5);
      assert.equal(frames[0].opacity, 0);
      assert.equal(frames[3].opacity, 0);
      assert.equal(frames[4].opacity, 0);
      assert.ok(frames[1].opacity > 0);
    });
    orders.add(sequence.order.join(','));
    previous = sequence.order.at(-1);
  }
  assert.ok(orders.size > 90);
  const first = manorShadowSequence(() => 0);
  assert.notEqual(manorShadowSequence(() => 0, first.order[0]).order[0], first.order[0]);
});

test('mounted shadow renews its itinerary and returning home skips arrival', () => {
  let listener;
  const style = {textContent: ''};
  const shadow = {style: {}, addEventListener(type, handler) { listener = handler; }};
  startManorShadow({querySelector: selector => selector === '.manor-shadow' ? shadow : style});
  assert.match(style.textContent, /^@keyframes manor-passing-shadow/);
  listener({animationName: 'manor-passing-shadow'});
  assert.match(style.textContent, /^@keyframes manor-passing-shadow/);
  assert.match(hauntedManorHtml(), /manor-scene manor-arrived/);
  assert.match(read('../css/style.css'), /body\[data-effects=off\] \*,body\[data-motion=reduced\] \*\{animation:none!important/);
});

test('release cache chain and generated-art credits are updated', () => {
  const version = 'estate-supporting-v14';
  for (const [path, target] of [['../index.html','css/style.css'], ['../index.html','js/main.js'],
    ['../js/main.js','./host.js'], ['../js/host.js','./manor.js'], ['../js/manor.js','./estate-scene.js']]) {
    assert.ok(read(path).includes(`${target}?v=${version}`));
  }
  assert.match(read('../how-to-play.html'), /Google Gemini/);
});
