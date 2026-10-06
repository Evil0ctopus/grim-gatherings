import { cp, lstat, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SITE_FILES = ['index.html', 'workshop.html', 'shop.html', 'how-to-play.html', 'privacy.html', 'terms.html', '.nojekyll'];
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

export async function buildSite(root = resolve(dirname(fileURLToPath(import.meta.url)), '..')) {
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
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(`Static website built at ${await buildSite()}`);
}
