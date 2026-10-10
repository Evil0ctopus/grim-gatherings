import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hauntedManorHtml } from '../js/manor.js';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('the estate uses bundled detailed cartoon artwork with no remote assets', () => {
  const html = hauntedManorHtml();
  assert.match(html, /class="manor-scene" aria-hidden="true"/);
  assert.doesNotMatch(html, /manor-arrived/);
  assert.match(html, /focusable="false"/);
  assert.match(html, /preserveAspectRatio="xMidYMid slice"/);
  assert.match(html, /viewBox="0 0 1920 1080"/);
  assert.doesNotMatch(html, /<button|<a\b|<input|href="https?:/);
  assert.match(html, /class="manor-artwork" href="assets\/estate-cartoon-manor.png"/);
  assert.equal((html.match(/href="assets\/estate-cartoon-manor.png"/g) || []).length, 1);
  assert.doesNotMatch(html, /manor-wing|manor-house-facade|href="assets\/estate-complete-manor.png"/);
  assert.match(html, /href="assets\/estate-candle.svg"/);
  assert.doesNotMatch(html, /photograph|estate-manor.jpg|estate-iron-gate.png/);
  const image = readFileSync(new URL('../assets/estate-cartoon-manor.png', import.meta.url));
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
  assert.equal((html.match(/class="manor-window /g) || []).length, 1);
  assert.match(html, /x="1080" y="240" width="517" height="600"/);
  assert.match(html, /M1227 580v-53a19 19 0 0 1 38 0v53z/);
  assert.match(read('../css/style.css'), /manor-passing-shadow 25s ease-in-out infinite/);
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

test('the restored house retains native proportions, aligned steps and responsive framing', () => {
  const html = hauntedManorHtml();
  const image = readFileSync(new URL('../assets/estate-cartoon-manor.png', import.meta.url));
  assert.equal(image.readUInt32BE(16), 776);
  assert.equal(image.readUInt32BE(20), 900);
  const artwork = html.match(/class="manor-artwork"[^>]+x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/);
  assert.ok(artwork);
  const [x, y, width, height] = artwork.slice(1).map(Number);
  assert.ok(Math.abs(width / height - 776 / 900) < .001);
  assert.ok(Math.abs(x + 387 / 776 * width - 1338) < 1);
  assert.equal(y + 855 / 900 * height, 810);

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
        `Restored house fits ${viewportWidth} x ${viewportHeight} at camera scale ${zoom}`);
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
  const version = 'manor-restored-v11';
  assert.ok(read('../index.html').includes(`css/style.css?v=${version}`));
  assert.ok(read('../index.html').includes(`js/main.js?v=${version}`));
  assert.ok(read('../js/main.js').includes(`./host.js?v=${version}`));
  assert.ok(read('../js/host.js').includes(`./manor.js?v=${version}`));
  assert.ok(read('../js/main.js').includes('./player.js?v=all-games-v1'));
});
