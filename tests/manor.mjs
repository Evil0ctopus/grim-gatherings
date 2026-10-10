import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hauntedManorHtml, manorShadowSequence, startManorShadow } from '../js/manor.js';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('the estate uses bundled detailed cartoon artwork with no remote assets', () => {
  const html = hauntedManorHtml();
  assert.match(html, /class="manor-scene" aria-hidden="true"/);
  assert.doesNotMatch(html, /manor-arrived/);
  assert.match(html, /focusable="false"/);
  assert.match(html, /preserveAspectRatio="xMidYMid slice"/);
  assert.match(html, /viewBox="0 0 1920 1080"/);
  assert.doesNotMatch(html, /<button|<a\b|<input|href="https?:/);
  assert.match(html, /class="manor-artwork" href="assets\/estate-generated-manor.png"/);
  assert.equal((html.match(/href="assets\/estate-generated-manor.png"/g) || []).length, 1);
  assert.doesNotMatch(html, /manor-wing|manor-house-facade|href="assets\/estate-complete-manor.png"/);
  assert.match(html, /href="assets\/estate-candle.svg"/);
  assert.doesNotMatch(html, /photograph|estate-manor.jpg|estate-iron-gate.png/);
  const image = readFileSync(new URL('../assets/estate-generated-manor.png', import.meta.url));
  assert.ok(image.length > 10000 && image.length < 2500000);
  assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.match(read('../assets/estate-candle.svg'), /linearGradient/);
  for (const name of ['estate-withered-tree.png', 'estate-illustrated-gate.png', 'estate-stone-pillar.png']) {
    assert.ok(html.includes(`assets/${name}`), name);
    const asset = readFileSync(new URL(`../assets/${name}`, import.meta.url));
    assert.deepEqual([...asset.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  }
  const credits = read('../how-to-play.html');
  assert.match(credits, /haunted-mansion-spooky-house-9805270/);
  assert.match(credits, /haunted-house-abandoned-house-9859927/);
  assert.match(credits, /PixelLabs/);
  assert.match(credits, /Pixabay Content License/);
  assert.match(credits, /AI-generated/);
  assert.match(credits, /Microsoft Copilot/);
  assert.match(credits, /servicesagreement/);
  assert.match(credits, /Art_Dreams/);
  assert.match(credits, /haunted-house-gate-stairway-manor-7570954/);
  assert.match(credits, /withered-tree-dead-tree-9379381/);
  assert.equal((html.match(/class="manor-flame"/g) || []).length, 8);
});

test('driveway and gate opening align with the front steps', () => {
  const html = hauntedManorHtml();
  assert.match(html, /class="manor-door-anchor" transform="translate\(1338 810\)"/);
  assert.match(html, /d="M1300 810h76C/);
  assert.match(html, /manor-gate-left" transform="translate\(898 445\)"/);
  assert.match(html, /manor-gate-right" transform="translate\(1338 445\)"/);
  assert.equal((html.match(/fill="url\(#manor-paver\)"/g) || []).length, 56);
  assert.equal((html.match(/class="manor-tree tree-/g) || []).length, 4);
  assert.match(html, /manor-fence-left" transform="translate\(-120 445\)"/);
  assert.match(html, /manor-fence-right" transform="translate\(1908 445\)"/);
  assert.equal((html.match(/class="manor-iron-panel"/g) || []).length, 4);
});

test('reference composition adds depth without splicing the mansion', () => {
  const html = hauntedManorHtml();
  assert.match(html, /class="manor-moon"/);
  assert.match(html, /class="manor-moon-cloud"/);
  assert.equal((html.match(/class="manor-grave"/g) || []).length, 10);
  assert.equal((html.match(/class="manor-bat-flight"/g) || []).length, 5);
  assert.equal((html.match(/class="manor-bolt-core"/g) || []).length, 2);
  assert.equal((html.match(/class="manor-window /g) || []).length, 7);
  assert.match(html, /x="978" y="315" width="720" height="498"/);
  assert.match(html, /M1107 565h20v43h-20zM1130 565h20v43h-20z/);
  assert.match(read('../css/style.css'), /manor-passing-shadow 60s linear infinite/);
});

test('shadow shuffles all seven windows per cycle and hides travel between floors', () => {
  const windowGeometry = [
    [1114, 449, 32, 37], [1317, 443, 41, 40], [1531, 449, 32, 37],
    [1107, 565, 43, 43], [1524, 565, 43, 43],
    [1107, 692, 43, 43], [1524, 692, 43, 43],
  ];
  const orders = new Set();
  let previous = -1;
  let seed = 314159;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let cycle = 0; cycle < 100; cycle++) {
    const sequence = manorShadowSequence(random, previous);
    assert.deepEqual([...sequence.order].sort(), [0, 1, 2, 3, 4, 5, 6]);
    assert.notEqual(sequence.order[0], previous);
    assert.ok(sequence.duration >= 56000 && sequence.duration < 70000);
    assert.equal(sequence.frames.length, 35);
    assert.equal(sequence.frames[0].offset, 0);
    assert.equal(sequence.frames.at(-1).offset, 1);
    sequence.order.forEach((index, slot) => {
      const [x, y, width, height] = windowGeometry[index];
      const frames = sequence.frames.slice(slot * 5, slot * 5 + 5);
      assert.equal(frames[0].opacity, 0);
      assert.equal(frames[3].opacity, 0);
      assert.equal(frames[4].opacity, 0);
      for (const frame of frames.filter(frame => frame.opacity > 0)) {
        assert.ok(frame.x > x && frame.x < x + width);
        assert.ok(frame.y > y && frame.y < y + height);
        assert.equal(frame.scale, height / 75);
      }
    });
    orders.add(sequence.order.join(','));
    previous = sequence.order.at(-1);
  }
  assert.ok(orders.size > 90, 'Visits must not use a fixed order');
  const first = manorShadowSequence(() => 0);
  const next = manorShadowSequence(() => 0, first.order[0]);
  assert.notEqual(next.order[0], first.order[0], 'Avoid repeats even with identical random draws');
});

test('mounted scene renews the randomized itinerary on every completed cycle', () => {
  let listener;
  const style = { textContent: '' };
  const shadow = {
    style: {},
    addEventListener(type, handler) {
      assert.equal(type, 'animationiteration');
      listener = handler;
    },
  };
  startManorShadow({
    querySelector(selector) {
      return selector === '.manor-shadow' ? shadow : style;
    },
  });
  assert.match(style.textContent, /^@keyframes manor-passing-shadow/);
  assert.match(shadow.style.animationDuration, /^\d+ms$/);
  style.textContent = 'unchanged';
  listener({ animationName: 'different-animation' });
  assert.equal(style.textContent, 'unchanged');
  listener({ animationName: 'manor-passing-shadow' });
  assert.match(style.textContent, /^@keyframes manor-passing-shadow/);
  assert.ok(read('../js/host.js').includes("startManorShadow(app().querySelector('.manor-scene'))"));
  assert.match(read('../css/style.css'), /body\[data-effects=off\] \*,body\[data-motion=reduced\] \*\{animation:none!important/);
});

test('weather, gates and window activity are separate layers', () => {
  const html = hauntedManorHtml();
  for (const layer of ['manor-camera', 'manor-cloud-shadow', 'manor-lightning', 'manor-mist mist-back', 'manor-mist mist-front', 'manor-rain', 'manor-rain rain-near', 'manor-scene-shade', 'manor-gateway', 'manor-gate manor-gate-left', 'manor-gate manor-gate-right']) {
    assert.ok(html.includes(`class="${layer}"`), layer);
  }
  assert.match(html, /clip-path="url\(#manor-window-clip\)"/);
  assert.match(html, /class="manor-storm-clouds" mask="url\(#manor-storm-mask\)"/);
  assert.match(html, /id="manor-storm-texture"/);
  assert.match(read('../assets/fog.svg'), /feTurbulence/);
  assert.match(read('../assets/fog.svg'), /stitchTiles="stitch"/);
});

test('the accepted wider house retains native proportions, aligned steps and responsive framing', () => {
  const html = hauntedManorHtml();
  const image = readFileSync(new URL('../assets/estate-generated-manor.png', import.meta.url));
  assert.equal(image.readUInt32BE(16), 1080);
  assert.equal(image.readUInt32BE(20), 747);
  const artwork = html.match(/class="manor-artwork"[^>]+x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/);
  assert.ok(artwork);
  const [x, y, width, height] = artwork.slice(1).map(Number);
  assert.equal(width / height, 1080 / 747);
  assert.ok(width >= 517 * 1.35, 'The building silhouette must be materially wider, not stretched');
  assert.equal(x + 540 / 1080 * width, 1338);
  assert.equal(y + 742.5 / 747 * height, 810);

  const css = read('../css/style.css');
  const camera = css.match(/\.manor-camera\{[^}]*transform-origin:([\d.]+)% ([\d.]+)%/);
  const approach = css.match(/@keyframes manor-approach\{from\{transform:scale\(([\d.]+)\)\}to\{transform:scale\(([\d.]+)\)\}/);
  const mobile = css.match(/\.manor-landscape\{position:absolute;top:[^;]+;width:([\d.]+)%;height:auto;margin-left:([-\d.]+)%/);
  assert.ok(camera && approach && mobile);
  for (const [viewportWidth, viewportHeight] of [[320, 844], [390, 844], [768, 844], [1280, 844], [1408, 900], [1920, 1080]]) {
    const isMobile = viewportWidth <= 780;
    const svgScale = isMobile
      ? viewportWidth * Number(mobile[1]) / 100 / 1920
      : Math.max(viewportWidth / 1920, viewportHeight / 1080);
    const offset = isMobile
      ? viewportWidth * Number(mobile[2]) / 100
      : (viewportWidth - 1920 * svgScale) / 2;
    const origin = viewportWidth * Number(camera[1]) / 100;
    for (const zoom of approach.slice(1).map(Number)) {
      const left = origin + (offset + x * svgScale - origin) * zoom;
      const right = left + width * svgScale * zoom;
      assert.ok(left >= 0 && right <= viewportWidth,
        `Wider house fits ${viewportWidth} x ${viewportHeight} at camera scale ${zoom}`);
    }
  }
});

test('returning home does not replay the arrival', () => {
  assert.match(hauntedManorHtml(), /manor-scene manor-arrived/);
  const css = read('../css/style.css');
  assert.match(css, /animation:manor-approach 18s 2s ease-in-out both/);
  assert.match(css, /body\[data-motion=reduced\] \.manor-lightning\{display:none\}/);
  assert.match(css, /body\[data-effects=off\] \.manor-lightning\{display:none\}/);
});

test('deployment cache tags include the changed scene module and stylesheet', () => {
  const version = 'manor-generated-v13';
  assert.ok(read('../index.html').includes(`css/style.css?v=${version}`));
  assert.ok(read('../index.html').includes(`js/main.js?v=${version}`));
  assert.ok(read('../js/main.js').includes(`./host.js?v=${version}`));
  assert.ok(read('../js/host.js').includes(`./manor.js?v=${version}`));
  assert.ok(read('../js/main.js').includes('./player.js?v=all-games-v1'));
});
