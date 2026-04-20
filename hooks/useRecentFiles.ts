import { useState, useEffect, useCallback } from 'react';
import { openDB } from '../utils/IndexedDBUtils';

const RECENT_STORE = 'recent_files';
const MAX_RECENT = 10;

export interface RecentFile {
  path: string;
  name: string;
  lastOpened: number;
}

export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  const loadRecentFiles = useCallback(async () => {
    try {
      const db = await openDB();
      // Ensure store exists
      if (!db.objectStoreNames.contains(RECENT_STORE)) {
        // This should probably be handled in openDB upgrade, but just in case
        return;
      }
      
      const transaction = db.transaction(RECENT_STORE, 'readonly');
      const store = transaction.objectStore(RECENT_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const sorted = (request.result as RecentFile[]).sort((a, b) => b.lastOpened - a.lastOpened);
        setRecentFiles(sorted.slice(0, MAX_RECENT));
      };
    } catch (e) {
      console.error('Failed to load recent files', e);
    }
  }, []);

  const addRecentFile = useCallback(async (path: string, name: string) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(RECENT_STORE, 'readwrite');
      const store = transaction.objectStore(RECENT_STORE);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ path, name, lastOpened: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      loadRecentFiles();
    } catch (e) {
      console.error('Failed to add recent file', e);
    }
  }, [loadRecentFiles]);

  useEffect(() => {
    loadRecentFiles();
  }, [loadRecentFiles]);

  return { recentFiles, addRecentFile, loadRecentFiles };
}
