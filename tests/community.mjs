import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createCommunityServer } from '../server/community.mjs';

test('accounts persist while story authoring and publishing endpoints are retired', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'grim-account-test-'));
  let server, base;
  async function start() {
    server = await createCommunityServer({ database: path.join(dir, 'test.sqlite'), adminUsername: 'site-owner', adminPassword: 'test-only-password-123!', origins: ['https://example.test'] });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    base = `http://127.0.0.1:${server.address().port}`;
  }
  const request = async (url, method = 'GET', body, token, status = 200, headers = {}) => {
    const response = await fetch(base + url, { method, headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers,
    }, ...(body ? { body: JSON.stringify(body) } : {}) });
    assert.equal(response.status, status, `${method} ${url}: ${await response.clone().text()}`);
    return response.json();
  };
  await start();
  try {
    for (const page of ['', 'workshop.html', 'how-to-play.html', 'privacy.html', 'terms.html']) {
      assert.equal((await fetch(`${base}/${page}`)).status, 200);
    }
    for (const file of ['server/community.mjs', 'data/test.sqlite', 'js/ai.js', 'js/workshop.js', 'js/workshop-storage.js', 'js/workshop-core.js', 'tools/story-core.mjs']) {
      assert.equal((await fetch(`${base}/${file}`)).status, 404);
    }
    await request('/api/health', 'GET', null, null, 403, { Origin: 'https://evil.test' });
    const cors = await fetch(base + '/api/health', { headers: { Origin: 'https://example.test' } });
    assert.equal(cors.headers.get('access-control-allow-origin'), 'https://example.test');
    const player = await request('/api/auth/register', 'POST', { username: 'player-one', password: 'test-only-password-123!', name: 'Player One', role: 'admin' });
    assert.equal(player.user.role, 'author', 'Public registration cannot grant administrator access');
    const owner = await request('/api/auth/login', 'POST', { username: 'site-owner', password: 'test-only-password-123!' });
    for (const token of [null, player.token, owner.token]) {
      for (const url of ['/api/drafts', '/api/drafts/old-story', '/api/submissions', '/api/community', '/api/community/old-story', '/api/admin/submissions', '/api/admin/submissions/old-story']) {
        for (const method of ['GET', 'POST', 'PUT']) {
          const result = await request(url, method, method === 'GET' ? null : {}, token, 410);
          assert.match(result.error, /retired/);
        }
      }
    }
    await request('/api/admin/developer', 'GET', null, player.token, 403);
    assert.equal((await request('/api/admin/developer', 'GET', null, owner.token)).games.length, 2);
    assert.equal((await request('/api/auth/me', 'GET', null, player.token)).user.name, 'Player One');
    await request('/api/auth/logout', 'POST', {}, player.token);
    await request('/api/auth/me', 'GET', null, player.token, 401);
    await new Promise(resolve => server.close(resolve));
    await start();
    const login = await request('/api/auth/login', 'POST', { username: 'player-one', password: 'test-only-password-123!' });
    assert.equal(login.user.name, 'Player One');
    assert.equal((await request('/api/purchases', 'GET', null, login.token)).checkoutEnabled, false);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(dir, { recursive: true, force: true });
  }
});
