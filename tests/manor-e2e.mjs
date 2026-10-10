import assert from 'node:assert/strict';
import { once } from 'node:events';
import { join } from 'node:path';
import { chromium, webkit } from 'playwright';
import { createCommunityServer } from '../server/community.mjs';

const server = await createCommunityServer({ database: ':memory:' });
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = process.argv[2] || `http://127.0.0.1:${server.address().port}/`;
try {
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const width of [320, 390, 768, 1280, 1408]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(base);
        await page.locator('#btn-new').waitFor();
        await page.evaluate(async () => {
          const sources = [...document.querySelectorAll('.manor-scene image')].map(el => el.getAttribute('href'));
          await Promise.all([...new Set(sources)].map(async src => {
            const image = new Image();
            image.src = src;
            await image.decode();
            if (!image.naturalWidth) throw new Error(`Estate image failed to load: ${src}`);
          }));
          for (const animation of document.querySelector('.manor-scene').getAnimations({ subtree: true })) animation.pause();
        });
        assert.equal(await page.locator('.manor-artwork').count(), 1);
        const imageResponse = await page.request.get(base + 'assets/estate-generated-manor.png');
        assert.ok(imageResponse.ok());
        assert.match(imageResponse.headers()['content-type'], /image\/png/);
        assert.equal(await page.locator('.manor-flame').count(), 8);
        const geometry = await page.locator('.manor-landscape').evaluate(svg => {
          const door = svg.querySelector('.manor-door-anchor').transform.baseVal.consolidate().matrix;
          const driveway = svg.querySelector('.manor-driveway > path').getAttribute('d').match(/^M([\d.]+) ([\d.]+)h([\d.]+)/);
          const left = svg.querySelector('.manor-gate-left').transform.baseVal.consolidate().matrix;
          const right = svg.querySelector('.manor-gate-right').transform.baseVal.consolidate().matrix;
          const gate = svg.querySelector('.manor-gate-left .manor-gate-frame').getBBox().width;
          const art = svg.querySelector('.manor-artwork');
          return {
            doorX: door.e, doorY: door.f,
            pathX: Number(driveway[1]) + Number(driveway[3]) / 2, pathY: Number(driveway[2]),
            leftEdge: left.e + gate, rightEdge: right.e,
            stepsX: art.x.baseVal.value + 540 / 1080 * art.width.baseVal.value,
            stepsY: art.y.baseVal.value + 742.5 / 747 * art.height.baseVal.value,
            artWidth: art.width.baseVal.value, artHeight: art.height.baseVal.value,
          };
        });
        assert.equal(geometry.pathX, geometry.doorX);
        assert.equal(geometry.pathY, geometry.doorY);
        assert.equal(geometry.leftEdge, geometry.doorX);
        assert.equal(geometry.rightEdge, geometry.doorX);
        assert.ok(Math.abs(geometry.stepsX - geometry.doorX) < 1);
        assert.ok(Math.abs(geometry.stepsY - geometry.doorY) < 1);
        assert.equal(geometry.artWidth, 720);
        assert.equal(geometry.artHeight, 498);
        assert.equal(geometry.artWidth / geometry.artHeight, 1080 / 747);
        if (process.env.MANOR_PREVIEWS && engine === chromium && [390, 1408].includes(width)) {
          await page.locator('.manor-camera').evaluate(el => { el.getAnimations()[0].currentTime = 0; });
          await page.screenshot({ path: join(process.env.MANOR_PREVIEWS, `house-${width}-arrival.png`) });
        }
        const lightning = await page.locator('.manor-lightning').first().evaluate(el => {
          const animation = el.getAnimations()[0];
          animation.pause();
          animation.currentTime = 1180;
          const peak = Number(getComputedStyle(el).opacity);
          animation.currentTime = 7000;
          const quiet = Number(getComputedStyle(el).opacity);
          animation.currentTime = 13180;
          const nextPeak = Number(getComputedStyle(el).opacity);
          return { peak, quiet, nextPeak };
        });
        assert.ok(lightning.peak >= .8);
        assert.equal(lightning.quiet, 0);
        assert.ok(lightning.nextPeak >= .8);
        assert.equal(await page.locator('.manor-bolt-core').count(), 2);
        assert.ok(await page.locator('.lightning-distant').evaluate(el => {
          el.getAnimations()[0].currentTime = 7180;
          return Number(getComputedStyle(el).opacity) >= .8;
        }));
        const clouds = await page.locator('.manor-storm-clouds').evaluate(el => {
          const bounds = el.getBBox();
          return { left: bounds.x, right: bounds.x + bounds.width, top: bounds.y,
            bottom: bounds.y + bounds.height, maskBottom: Number(el.ownerSVGElement.querySelector('#manor-storm-mask').getAttribute('y')) + Number(el.ownerSVGElement.querySelector('#manor-storm-mask').getAttribute('height')),
            roofTop: el.ownerSVGElement.querySelector('.manor-artwork').y.baseVal.value,
            beforeStrike: el.nextElementSibling.classList.contains('manor-strike') };
        });
        assert.ok(clouds.left < 1654 && clouds.right > 1654);
        assert.ok(clouds.top <= 0 && clouds.bottom > 150);
        assert.equal(clouds.beforeStrike, true);
        assert.ok(clouds.left <= 0 && clouds.right >= 1920);
        assert.ok(clouds.maskBottom < clouds.roofTop);
        assert.equal(await page.locator('.manor-tree').count(), 4);
        assert.equal(await page.locator('.manor-grave').count(), 10);
        assert.equal(await page.locator('.manor-bat').count(), 5);
        assert.equal(await page.locator('.manor-moon').count(), 1);
        assert.equal(await page.locator('.manor-fence').count(), 2);
        const connections = await page.locator('.manor-landscape').evaluate(svg => {
          const pillars = [...svg.querySelectorAll('.manor-pillar')].map(el => el.transform.baseVal.consolidate().matrix.e);
          const panels = [...svg.querySelectorAll('.manor-fence')].map(el => ({
            x: el.transform.baseVal.consolidate().matrix.e,
            width: el.querySelector('.manor-gate-frame').getBBox().width,
          }));
          return { pillars, panels };
        });
        assert.equal(connections.panels[0].x + connections.panels[0].width, connections.pillars[0]);
        assert.equal(connections.pillars[0] + 130, geometry.leftEdge - 440);
        assert.equal(geometry.rightEdge + 440, connections.pillars[1]);
        assert.equal(connections.pillars[1] + 130, connections.panels[1].x);
        const storm = await page.locator('.manor-landscape').evaluate(svg => {
          const bolt = svg.querySelector('.manor-bolt-core').getBBox();
          const house = svg.querySelector('.manor-artwork');
          const trees = [...svg.querySelectorAll('.manor-tree')].map(el => {
            const image = el.querySelector('image');
            const center = el.transform.baseVal.consolidate().matrix.e;
            return { center, near: el.classList.contains('tree-near'), height: image.height.baseVal.value };
          });
          return { boltWidth: bolt.width, boltHeight: bolt.height,
            behindGround: [...svg.querySelectorAll('.manor-strike')].every(el => !!(el.compareDocumentPosition(svg.querySelector('path[fill="url(#manor-ground)"]')) & Node.DOCUMENT_POSITION_FOLLOWING)),
            houseLeft: house.x.baseVal.value, houseRight: house.x.baseVal.value + house.width.baseVal.value, trees };
        });
        assert.ok(storm.boltHeight > 700);
        assert.ok(storm.boltWidth < 250);
        assert.equal(storm.behindGround, true);
        assert.ok(storm.trees[0].center < storm.houseLeft);
        assert.ok(storm.trees[1].center > storm.houseRight);
        assert.ok(storm.trees[2].center <= storm.houseLeft - 300);
        assert.ok(storm.trees[3].center >= storm.houseRight + 300);
        assert.ok(Math.min(...storm.trees.filter(tree => tree.near).map(tree => tree.height)) > 2 * Math.max(...storm.trees.filter(tree => !tree.near).map(tree => tree.height)));
        const shadow = await page.locator('.manor-shadow').evaluate(el => {
          const animation = el.getAnimations()[0];
          const clip = el.ownerSVGElement.querySelector('#manor-window-clip');
          const paths = [...clip.querySelectorAll('path')];
          const duration = Number(animation.effect.getTiming().duration);
          return {
            clip: el.parentElement.getAttribute('clip-path'),
            visits: paths.map((_, slot) => {
              animation.currentTime = (slot + .25) / paths.length * duration;
              const matrix = new DOMMatrix(getComputedStyle(el).transform);
              return { index: paths.findIndex(path => path.isPointInFill({ x: matrix.e, y: matrix.f })),
                opacity: Number(getComputedStyle(el).opacity) };
            }),
            travelOpacity: paths.map((_, slot) => {
              animation.currentTime = (slot + .95) / paths.length * duration;
              return Number(getComputedStyle(el).opacity);
            }),
            skyClipped: paths.every(path => !path.isPointInFill({ x: 1338, y: 200 })),
            mullionsClipped: paths.every(path => {
              const bounds = path.getBBox();
              return !path.isPointInFill({ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 });
            }),
          };
        });
        assert.equal(shadow.clip, 'url(#manor-window-clip)');
        assert.ok(shadow.skyClipped);
        assert.ok(shadow.mullionsClipped);
        assert.equal(new Set(shadow.visits.map(visit => visit.index)).size, 7);
        assert.ok(shadow.visits.every(visit => visit.index >= 0 && visit.opacity >= .7));
        assert.ok(shadow.travelOpacity.every(opacity => opacity === 0));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.equal(await page.locator('.manor-camera').evaluate(el => getComputedStyle(el).animationIterationCount), '1');
        await page.locator('.manor-scene').evaluate(el => {
          for (const animation of el.getAnimations({ subtree: true })) {
            if (['manor-approach', 'manor-gate-open', 'manor-gateway-pass'].includes(animation.animationName)) animation.finish();
          }
        });
        assert.equal(await page.locator('.manor-gateway').evaluate(el => getComputedStyle(el).opacity), '0');
        assert.ok(await page.locator('.manor-camera').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).a >= 1.1));
        const artwork = await page.locator('.manor-artwork').boundingBox();
        assert.ok(artwork.x >= 0 && artwork.x + artwork.width <= width, `Wider house fits width ${width}`);
        if (process.env.MANOR_PREVIEWS && engine === chromium && [390, 1408].includes(width)) {
          await page.screenshot({ path: join(process.env.MANOR_PREVIEWS, `house-${width}-settled.png`) });
        }
        assert.equal(await page.locator('.manor-gate-leaf').first().evaluate(el => getComputedStyle(el).transform), 'matrix(0.08, 0, 0, 1, 0, 0)');
        await page.locator('#join-code').scrollIntoViewIfNeeded();
        const box = await page.locator('#join-code').boundingBox();
        assert.ok(box);
        assert.ok(await page.locator('#join-code').evaluate((el, point) =>
          document.elementFromPoint(point.x + point.width / 2, point.y + point.height / 2) === el, box));
      }
      const renewal = await page.locator('.manor-shadow').evaluate(el => new Promise((resolve, reject) => {
        const animation = el.getAnimations()[0];
        const duration = Number(animation.effect.getTiming().duration);
        const style = el.closest('.manor-scene').querySelector('[data-manor-shadow-style]');
        const observer = new MutationObserver(() => {
          observer.disconnect();
          clearTimeout(timeout);
          animation.pause();
          resolve({ currentTime: animation.currentTime, duration,
            sameAnimation: el.getAnimations()[0] === animation });
        });
        const timeout = setTimeout(() => {
          observer.disconnect();
          animation.pause();
          reject(new Error('The shadow itinerary did not renew at the real animation boundary'));
        }, 3000);
        observer.observe(style, { childList: true });
        animation.currentTime = duration - 50;
        animation.play();
      }));
      assert.equal(renewal.sameAnimation, true);
      assert.ok(renewal.currentTime >= renewal.duration);
      await page.locator('.atmosphere-controls summary').click();
      await page.locator('input[data-effects]').uncheck();
      for (const selector of ['.manor-lightning', '.manor-strike', '.manor-rain', '.manor-mist']) {
        assert.equal(await page.locator(selector).first().evaluate(el => getComputedStyle(el).display), 'none');
      }
      assert.equal(await page.locator('.manor-camera').evaluate(el => getComputedStyle(el).animationName), 'none');
      assert.equal(await page.locator('.manor-shadow').evaluate(el => getComputedStyle(el).animationName), 'none');
      await page.locator('input[data-effects]').check();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await page.locator('.manor-lightning').first().evaluate(el => getComputedStyle(el).display), 'none');
      assert.equal(await page.locator('.manor-strike').first().evaluate(el => getComputedStyle(el).display), 'none');
      assert.equal(await page.locator('.manor-shadow').evaluate(el => getComputedStyle(el).animationName), 'none');
      assert.equal(await page.locator('.manor-gateway').evaluate(el => getComputedStyle(el).opacity), '1');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.locator('#btn-new').click();
      await page.locator('[data-act="home"]').click();
      await page.locator('.manor-arrived').waitFor();
      assert.equal(await page.locator('.manor-camera').evaluate(el => getComputedStyle(el).animationName), 'none');
      assert.deepEqual(errors, []);
      console.log(`PASS ${engine.name()} estate: five widths, aligned steps and gates, visible lightning, controls, reduced motion, one-time arrival`);
    } finally {
      await browser.close();
    }
  }
} finally {
  await new Promise(resolve => server.close(resolve));
}
