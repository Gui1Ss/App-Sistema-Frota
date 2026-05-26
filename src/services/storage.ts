import { INDEXEDDB_NAME, INDEXEDDB_VERSION, INDEXEDDB_STORES } from '../utils/constants';

class StorageService {
  private db: IDBDatabase | null = null;

  /**
   * Inicializa IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(INDEXEDDB_NAME, INDEXEDDB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Cria stores se não existirem
        if (!db.objectStoreNames.contains(INDEXEDDB_STORES.ENTREGAS)) {
          db.createObjectStore(INDEXEDDB_STORES.ENTREGAS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(INDEXEDDB_STORES.CONFIRMACOES)) {
          db.createObjectStore(INDEXEDDB_STORES.CONFIRMACOES, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(INDEXEDDB_STORES.SYNC_QUEUE)) {
          db.createObjectStore(INDEXEDDB_STORES.SYNC_QUEUE, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      };
    });
  }

  /**
   * Salva dado em IndexedDB
   */
  async save<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Obtém dado de IndexedDB
   */
  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Obtém todos os dados de um store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Deleta dado de IndexedDB
   */
  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Limpa um store
   */
  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Salva em LocalStorage
   */
  setLocalStorage(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Obtém de LocalStorage
   */
  getLocalStorage<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Remove de LocalStorage
   */
  removeLocalStorage(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Limpa LocalStorage
   */
  clearLocalStorage(): void {
    localStorage.clear();
  }
}

export const storageService = new StorageService();
