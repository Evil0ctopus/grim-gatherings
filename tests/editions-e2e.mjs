// Runs every committed edition with a host and a separate phone for every character.
// Usage: node tests/editions-e2e.mjs [url] [absolute log directory] [concurrency=3]
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sample from '../js/editions/sample.js';
import { STARTER_MYSTERIES } from '../js/starters.js';

const url = process.argv[2] || 'http://127.0.0.1:8128/';
const logDirectory = process.argv[3];
const concurrency = Number(process.argv[4] || 3);
if (!logDirectory || !path.isAbsolute(logDirectory)) throw new Error('Provide an absolute directory for browser test logs.');
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 3) throw new Error('Concurrency must be 1, 2 or 3.');
fs.mkdirSync(logDirectory, { recursive: true });
const cases = [{ id: 'sample', editions: sample }, ...STARTER_MYSTERIES.map(e => ({ id: e.id, editions: e.story.editions }))]
  .flatMap(family => Object.keys(family.editions).map(Number).map(count => ({ id: family.id, count })));
const completed = [];
let next = 0;
let contextsInUse = 0;
const capacityWaiters = [];

async function worker() {
  while (next < cases.length) {
    const entry = cases[next++];
    const contexts = entry.count + 1;
    while (contextsInUse + contexts > 32) await new Promise(resolve => capacityWaiters.push(resolve));
    contextsInUse += contexts;
    const file = path.join(logDirectory, `${entry.id}-${entry.count}.txt`);
    const log = fs.createWriteStream(file);
    const args = [fileURLToPath(new URL('./e2e.mjs', import.meta.url)), url, String(entry.count), entry.id, String(entry.count % 2 === 1)];
    const child = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.pipe(log, { end: false });
    child.stderr.pipe(log, { end: false });
    const exitCode = await new Promise(resolve => {
      child.once('error', error => {
        console.error(`Could not start ${entry.id}/${entry.count}: ${error.message}`);
        resolve(1);
      });
      child.once('close', resolve);
    });
    await new Promise(resolve => log.end(resolve));
    contextsInUse -= contexts;
    capacityWaiters.splice(0).forEach(resolve => resolve());
    completed.push({ ...entry, exitCode, file });
    console.log(`${exitCode === 0 ? 'PASS' : 'FAIL'} ${entry.id}: ${entry.count} players (${completed.length}/${cases.length})`);
    if (exitCode !== 0) console.error(fs.readFileSync(file, 'utf8').split('\n').slice(-30).join('\n'));
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));
const failed = completed.filter(c => c.exitCode !== 0);
console.log(`${completed.length - failed.length}/${cases.length} full all-character edition games passed.`);
fs.writeFileSync(path.join(logDirectory, 'results.json'), JSON.stringify(completed, null, 2));
if (failed.length) process.exitCode = 1;
