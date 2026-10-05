import { writeFile, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

export async function configureSupabase(projectRef, filename = new URL('../js/community-config.js', import.meta.url)) {
  if (!/^[a-z0-9]{20}$/.test(projectRef || '')) throw new Error('Use the 20-character project reference from the Supabase dashboard, not a key or password.');
  const endpoint = `https://${projectRef}.supabase.co/functions/v1/community`;
  const response = await fetch(`${endpoint}/api/health`, { headers: { Origin: 'https://evil0ctopus.github.io' }, signal: AbortSignal.timeout(20000) });
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Backend health check failed. Deploy the migration/function and configure the allowed site origin before connecting the frontend.');
  const health = await response.json();
  if (health.available !== true || health.authMode !== 'email') throw new Error('The deployed service does not report a ready email-auth backend.');
  const text = await readFile(filename, 'utf8');
  if (!/export const COMMUNITY_API = '[^']*';/.test(text) || !/export const COMMUNITY_PROVIDER = '[^']*';/.test(text)) throw new Error('Unexpected community configuration format; no file was changed.');
  await writeFile(filename, text.replace(/export const COMMUNITY_API = '[^']*';/, `export const COMMUNITY_API = '${endpoint}';`)
    .replace(/export const COMMUNITY_PROVIDER = '[^']*';/, "export const COMMUNITY_PROVIDER = 'supabase';"));
  console.log('Connected the local frontend configuration to the healthy Supabase backend. Review, commit and deploy the change to publish it.');
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) await configureSupabase(process.argv[2]);
