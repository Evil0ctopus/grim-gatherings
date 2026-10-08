import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { buildSite, SITE_DIRECTORIES, SITE_FILES } from '../tools/build-site.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'gg-static-build-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const file of SITE_FILES) await writeFile(join(root, file), `fixture ${file}`);
  for (const directory of SITE_DIRECTORIES) {
    await mkdir(join(root, directory));
    await writeFile(join(root, directory, 'asset.txt'), `fixture ${directory}`);
  }
  return root;
}

test('static build includes only game assets, never account notes or backend files', async t => {
  const root = await fixture(t);
  for (const directory of ['.local-private', '.git', 'server', 'supabase', 'tests', 'node_modules']) {
    await mkdir(join(root, directory));
    await writeFile(join(root, directory, 'DO-NOT-PUBLISH.txt'), 'private fixture');
  }
  await writeFile(join(root, '.env'), 'private fixture');
  await writeFile(join(root, 'ROADMAP.md'), 'not a game asset');
  const output = await buildSite(root);
  assert.deepEqual((await readdir(output)).sort(), [...SITE_FILES, ...SITE_DIRECTORIES].sort());
  assert.equal(await readFile(join(output, 'index.html'), 'utf8'), 'fixture index.html');
  assert.equal(await readFile(join(output, 'RULESETS.md'), 'utf8'), 'fixture RULESETS.md');
  assert.equal(await readFile(join(output, 'js', 'asset.txt'), 'utf8'), 'fixture js');
  assert.equal(await readFile(join(root, '.local-private', 'DO-NOT-PUBLISH.txt'), 'utf8'), 'private fixture');
});

test('how-to-play links to the published replacement rules without claiming game compliance', async () => {
  assert.ok(SITE_FILES.includes('RULESETS.md'));
  const guide = await readFile(new URL('../how-to-play.html', import.meta.url), 'utf8');
  assert.match(guide, /href="RULESETS\.md"/);
  assert.match(guide, /publishing this reference does not change their gameplay/);
});

test('rebuild removes obsolete published assets', async t => {
  const root = await fixture(t);
  const output = await buildSite(root);
  await writeFile(join(output, 'obsolete.txt'), 'stale');
  await writeFile(join(root, 'index.html'), 'updated');
  await buildSite(root);
  assert.ok(!(await readdir(output)).includes('obsolete.txt'));
  assert.equal(await readFile(join(output, 'index.html'), 'utf8'), 'updated');
});

test('missing entry fails before replacing the previous build', async t => {
  const root = await fixture(t);
  const output = await buildSite(root);
  await rm(join(root, 'index.html'));
  await assert.rejects(buildSite(root), { code: 'ENOENT' });
  assert.equal(await readFile(join(output, 'index.html'), 'utf8'), 'fixture index.html');
});

test('hidden files in asset directories fail instead of leaking into an upload', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'js', '.env'), 'private fixture');
  await assert.rejects(buildSite(root), /Hidden files are not website assets/);
});

test('GitHub Pages uploads only the built output, not the repository root', async () => {
  const workflow = await readFile(new URL('../.github/workflows/deploy-pages.yml', import.meta.url), 'utf8');
  assert.match(workflow, /node-version:\s*['"]24['"]/);
  assert.match(workflow, /run: npm run build:site/);
  assert.match(workflow, /path: dist/);
  assert.ok(workflow.indexOf('run: npm run build:site') < workflow.indexOf('uses: actions/upload-pages-artifact@v4'));
  assert.doesNotMatch(workflow, /path: \.\s*(?:\r?\n|$)/);
});
