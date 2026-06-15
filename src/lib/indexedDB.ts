export class CacheDB {
  private dbName = "wt_tactical_indexeddb";
  private version = 1;

  init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("json_cache")) {
          db.createObjectStore("json_cache");
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async get(key: string): Promise<any> {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction("json_cache", "readonly");
        const store = transaction.objectStore("json_cache");
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (e) {
      console.warn("IndexedDB not available or failed.", e);
      return null;
    }
  }

  async set(key: string, val: any): Promise<void> {
    try {
      const db = await this.init();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("json_cache", "readwrite");
        const store = transaction.objectStore("json_cache");
        const request = store.put(val, key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (e) {
      console.warn("IndexedDB cache save failed.", e);
    }
  }
}

export const cacheDb = new CacheDB();
export default cacheDb;
