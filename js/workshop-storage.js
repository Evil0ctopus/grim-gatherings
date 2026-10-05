const DB_NAME = 'gg-story-workshop-v1';
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('drafts', { keyPath: 'id' });
      const versions = request.result.createObjectStore('versions', { keyPath: 'id' });
      versions.createIndex('draftId', 'draftId');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Draft storage could not open: ${request.error.message}`));
    request.onblocked = () => reject(new Error('Close other workshop tabs and retry the storage upgrade.'));
  });
}

async function transaction(stores, mode, action) {
  const db = await openDB();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(stores, mode);
      let result;
      action(tx, value => { result = value; });
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(new Error(`Draft storage failed: ${tx.error?.message || 'unknown error'}. Download a backup before leaving.`));
      tx.onabort = () => reject(new Error('Draft storage was interrupted. Download a backup before leaving.'));
    });
  } finally { db.close(); }
}

export async function saveDraft(draft, label = 'Edited draft') {
  const snapshot = structuredClone({ ...draft, updatedAt: Date.now() });
  const version = { id: crypto.randomUUID(), draftId: draft.id, createdAt: snapshot.updatedAt, label, draft: snapshot };
  await transaction(['drafts', 'versions'], 'readwrite', tx => {
    tx.objectStore('drafts').put(snapshot);
    tx.objectStore('versions').add(version);
  });
  return snapshot;
}

export function listDrafts() {
  return transaction(['drafts'], 'readonly', (tx, done) => {
    tx.objectStore('drafts').getAll().onsuccess = event => done(event.target.result.sort((a, b) => b.updatedAt - a.updatedAt));
  });
}

export function draftVersions(id) {
  return transaction(['versions'], 'readonly', (tx, done) => {
    tx.objectStore('versions').index('draftId').getAll(id).onsuccess = event => done(event.target.result.sort((a, b) =>
      (b.draft.localRevision || 0) - (a.draft.localRevision || 0) || b.createdAt - a.createdAt));
  });
}
