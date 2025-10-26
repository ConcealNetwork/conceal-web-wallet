/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
 * Copyright (c) 2018-2023 Conceal Community, Conceal.Network & Conceal Devs
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

interface StorageInterface {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string, defaultValue: any): Promise<any>;
  keys(): Promise<string[]>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

class IndexedDBStorage implements StorageInterface {
  private db: any;
  private readonly dbName = "mydb";
  private readonly storeName = "storage";
  private ready: Promise<void>;

  constructor() {
    this.ready = new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onupgradeneeded = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.db.createObjectStore(this.storeName, { keyPath: "key" });
      };
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.ready;
    const transaction = this.db.transaction(this.storeName, "readwrite");
    const store = transaction.objectStore(this.storeName);
    await store.put({ key, value });
  }

  async getItem(key: string, defaultValue: any = null): Promise<string | any> {
    await this.ready;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result ? request.result.value : defaultValue;
        resolve(result);
      };
      request.onerror = (event: any) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async keys(): Promise<string[]> {
    await this.ready;
    const transaction = this.db.transaction(this.storeName, "readonly");
    const store = transaction.objectStore(this.storeName);
    const keys = await store.getAllKeys();
    return keys;
  }

  async remove(key: string): Promise<void> {
    await this.ready;
    const transaction = this.db.transaction(this.storeName, "readwrite");
    const store = transaction.objectStore(this.storeName);
    await store.delete(key);
  }

  async clear(): Promise<void> {
    await this.ready;
    const transaction = this.db.transaction(this.storeName, "readwrite");
    const store = transaction.objectStore(this.storeName);
    await store.clear();
  }
}

export class Storage {
  static _storage: StorageInterface = new IndexedDBStorage();

  static clear(): Promise<void> {
    return Storage._storage.clear();
  }

  static getItem(key: string, defaultValue: any = null): Promise<any> {
    return Storage._storage.getItem(key, defaultValue);
  }

  static keys(): Promise<string[]> {
    return Storage._storage.keys();
  }

  static remove(key: string): Promise<void> {
    return Storage._storage.remove(key);
  }

  static removeItem(key: string): Promise<void> {
    return Storage._storage.remove(key);
  }

  static setItem(key: string, value: any): Promise<void> {
    return Storage._storage.setItem(key, value);
  }
}
