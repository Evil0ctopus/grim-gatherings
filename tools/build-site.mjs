import { cp, lstat, mkdir, readdir, rm, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SITE_FILES = ['index.html', 'workshop.html', 'shop.html', 'premium-room.html', 'how-to-play.html', 'privacy.html', 'terms.html', 'mafia.html', 'RULESETS.md', '.nojekyll'];
export const SITE_DIRECTORIES = ['assets', 'css', 'js', 'vendor'];

async function checkTree(path) {
  const stat = await lstat(path);
  if (stat.isSymbolicLink()) throw new Error(`Website assets must not be symbolic links: ${path}`);
  if (stat.isDirectory()) {
    for (const entry of await readdir(path)) {
      if (entry.startsWith('.')) throw new Error(`Hidden files are not website assets: ${join(path, entry)}`);
      await checkTree(join(path, entry));
    }
  } else if (!stat.isFile()) {
    throw new Error(`Unsupported website asset: ${path}`);
  }
}

export async function buildSite(root = resolve(dirname(fileURLToPath(import.meta.url)), '..'), { production = false } = {}) {
  root = resolve(root);
  const output = join(root, 'dist');
  for (const entry of SITE_FILES) {
    const path = join(root, entry);
    if (!(await lstat(path)).isFile()) throw new Error(`Missing regular website entry: ${path}`);
    await checkTree(path);
  }
  for (const entry of SITE_DIRECTORIES) {
    const path = join(root, entry);
    if (!(await lstat(path)).isDirectory()) throw new Error(`Missing website asset directory: ${path}`);
    await checkTree(path);
  }
  let outputStat;
  try {
    outputStat = await lstat(output);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (outputStat && (!outputStat.isDirectory() || outputStat.isSymbolicLink())) {
    throw new Error(`Website output must be a regular directory: ${output}`);
  }
  if (outputStat) await rm(output, { recursive: true });
  await mkdir(output);
  for (const entry of [...SITE_FILES, ...SITE_DIRECTORIES]) {
    await cp(join(root, entry), join(output, entry), { recursive: true });
  }
  if (production) {
    const policyPath = join(output, 'js', 'site-policy.js');
    const policy = await readFile(policyPath, 'utf8');
    if (!policy.includes('export const BUILD_RELEASE_ONLY = false;')) throw new Error('Missing release catalog policy.');
    await writeFile(policyPath, policy.replace('export const BUILD_RELEASE_ONLY = false;', 'export const BUILD_RELEASE_ONLY = true;'));
    const retired = ['workshop.html', 'shop.html', 'premium-room.html', 'mafia.html'];
    const notice = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Development games - Grim Gatherings</title><link rel="stylesheet" href="css/style.css"></head><body><main><h1>Development games</h1><p>This website offers The Lago Cabin and the LOCKDOWN author playtest. Other games remain on the GitHub development website until approved.</p><p><a href="index.html">Choose a mystery</a></p><p><a href="https://evil0ctopus.github.io/grim-gatherings/">Open the development website</a></p></main></body></html>';
    for (const file of retired) await writeFile(join(output, file), notice);
    for (const file of ['sample.js', 'starters.js', 'premium-stories.js']) await rm(join(output, 'js', file), { force: true });
    for (const file of await readdir(join(output, 'js', 'editions'))) {
      if (!['lockdown.js', 'lago-cabin.js'].includes(file)) await rm(join(output, 'js', 'editions', file));
    }
  }
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const production = process.env.CF_PAGES_BRANCH === 'production' || process.argv.includes('--production');
  console.log(`Static ${production ? 'release' : 'development'} website built at ${await buildSite(undefined, { production })}`);
}
