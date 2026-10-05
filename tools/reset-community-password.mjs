import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { passwordHash } from '../server/community.mjs';

const username = process.env.GG_ACCOUNT_USERNAME?.trim().toLowerCase();
const password = process.env.GG_NEW_PASSWORD;
if (!username || !password) throw new Error('Set GG_ACCOUNT_USERNAME and GG_NEW_PASSWORD for the account to reset. Stop the service first.');
const database = process.env.GG_DATABASE_PATH || fileURLToPath(new URL('../data/community.sqlite', import.meta.url));
const db = new DatabaseSync(path.resolve(database), { open: true });
try {
  const user = db.prepare('SELECT id FROM users WHERE username=?').get(username);
  if (!user) throw new Error('Account not found. No account was changed.');
  const hash = await passwordHash(password);
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('UPDATE users SET password=? WHERE id=?').run(hash, user.id);
    db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id);
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
  console.log('Password reset. All existing sessions for that account were revoked.');
} finally { db.close(); }
