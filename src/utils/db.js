// utils/db.js
// Returns a wrapper around the raw IDBDatabase with promise-based methods
// that mirror the `idb` library API used in magazineService.js

const DB_NAME    = 'MagazineDB';
const DB_VERSION = 2;

function wrapDB(idb) {
  return {
    objectStoreNames: idb.objectStoreNames,

    /** Read a single record by key */
    get(storeName, key) {
      return new Promise((resolve, reject) => {
        const tx  = idb.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror   = () => reject(req.error);
      });
    },

    /** Write (insert or overwrite) a record */
    put(storeName, value) {
      return new Promise((resolve, reject) => {
        const tx  = idb.transaction(storeName, 'readwrite');
        const req = tx.objectStore(storeName).put(value);
        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => reject(req.error);
      });
    },

    /** Delete a single record by key */
    delete(storeName, key) {
      return new Promise((resolve, reject) => {
        const tx  = idb.transaction(storeName, 'readwrite');
        const req = tx.objectStore(storeName).delete(key);
        req.onsuccess = () => resolve();
        req.onerror   = () => reject(req.error);
      });
    },

    /** Return every record in the store */
    getAll(storeName) {
      return new Promise((resolve, reject) => {
        const tx  = idb.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = () => resolve(req.result ?? []);
        req.onerror   = () => reject(req.error);
      });
    },

    /** Remove every record from the store */
    clear(storeName) {
      return new Promise((resolve, reject) => {
        const tx  = idb.transaction(storeName, 'readwrite');
        const req = tx.objectStore(storeName).clear();
        req.onsuccess = () => resolve();
        req.onerror   = () => reject(req.error);
      });
    },
  };
}

export const openDB = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const db         = event.target.result;

      // magazines store
      if (!db.objectStoreNames.contains('magazines')) {
        const store = db.createObjectStore('magazines', { keyPath: 'id' });
        store.createIndex('storedAt',  'storedAt');
        store.createIndex('isOffline', 'isOffline');
      }

      // downloads store
      if (!db.objectStoreNames.contains('downloads')) {
        const dl = db.createObjectStore('downloads', {
          keyPath: 'id',
          autoIncrement: true,
        });
        dl.createIndex('magazineId',   'magazineId');
        dl.createIndex('downloadDate', 'downloadDate');
      }
    };

    request.onsuccess = () => resolve(wrapDB(request.result));
  });

export const clearDatabase = async () => {
  const db     = await openDB();
  const stores = ['magazines', 'downloads'];
  for (const store of stores) {
    if (db.objectStoreNames.contains(store)) {
      await db.clear(store);
    }
  }
};