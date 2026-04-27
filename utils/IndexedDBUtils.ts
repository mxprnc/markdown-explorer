/**
 * IndexedDB Utility for Markdown Explorer
 * 
 * Provides a simple interface to store and retrieve file content or metadata
 * for local caching and offline support.
 */

const DB_NAME = 'MarkdownExplorerDB';
const STORE_NAME = 'files';
const DB_VERSION = 2;

import { Platform } from 'react-native';

export async function openDB(): Promise<IDBDatabase | null> {
  if (Platform.OS !== 'web') return null;
  
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'path' });
        }
        if (!db.objectStoreNames.contains('recent_files')) {
          db.createObjectStore('recent_files', { keyPath: 'path' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    } catch (e) {
      console.warn('IndexedDB not supported in this environment');
      resolve(null);
    }
  });
}

export async function setFileCache(path: string, content: string): Promise<void> {
  const db = await openDB();
  if (!db) return;
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ path, content, timestamp: Date.now() });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getFileCache(path: string): Promise<string | null> {
  const db = await openDB();
  if (!db) return null;
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(path);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result ? request.result.content : null);
    };
  });
}

export async function deleteFileCache(path: string): Promise<void> {
  const db = await openDB();
  if (!db) return;
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(path);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function clearCache(): Promise<void> {
  const db = await openDB();
  if (!db) return;
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
export async function getSetting(key: string): Promise<any> {
  const db = await openDB();
  if (!db) return null;
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result ? request.result.value : null);
    };
  });
}

export async function setSetting(key: string, value: any): Promise<void> {
  const db = await openDB();
  if (!db) return;
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put({ key, value, timestamp: Date.now() });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
