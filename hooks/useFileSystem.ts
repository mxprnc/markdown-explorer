import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import { format } from 'date-fns';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';

// Use Legacy API for functions that were deprecated in SDK 54
const fs = (FileSystemLegacy as any).default || FileSystemLegacy;
const readDirectoryAsync = fs.readDirectoryAsync;
const makeDirectoryAsync = fs.makeDirectoryAsync;
const writeAsStringAsync = fs.writeAsStringAsync;
const deleteAsync = fs.deleteAsync;
const moveAsync = fs.moveAsync;
const copyAsync = fs.copyAsync;
const getInfoAsync = fs.getInfoAsync;
const readAsStringAsync = fs.readAsStringAsync;
const StorageAccessFramework = fs.StorageAccessFramework;

// Deep scan for StorageAccessFramework or the new SDK 54 Directory API
const getDirectoryAPI = () => {
  return (FileSystem as any).Directory || (FileSystem as any).StorageAccessFramework;
};

const getSAF = () => (FileSystem as any).StorageAccessFramework;
import { 
  getParentPath, 
  joinPaths, 
  normalizePath, 
  resolveImagePath, 
  updateTreePaths 
} from '@/utils/FileSystemUtils';

export interface FileSystemItem {
  name: string;
  path: string;
  kind: 'file' | 'directory';
  handle: any;
  children?: FileSystemItem[];
  isLoaded?: boolean;
}

export function useFileSystem() {
  const [dirHandle, setDirHandle] = useState<any>(null);
  const [fileSystemData, setFileSystemData] = useState<FileSystemItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [localFiles, setLocalFiles] = useState<Record<string, string>>({});
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFile2, setSelectedFile2] = useState('');
  const [openedFiles, setOpenedFiles] = useState<string[]>([]);
  const [openedFiles2, setOpenedFiles2] = useState<string[]>([]);
  const [hasWritePermission, setHasWritePermission] = useState(false);
  const [selectedDirPath, setSelectedDirPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const checkWritePermission = useCallback(async (handle = dirHandle) => {
    if (!handle) return false;
    if (Platform.OS !== 'web') return true;
    try {
      if (typeof handle.queryPermission !== 'function') return true;
      const currentPerm = await handle.queryPermission({ mode: 'readwrite' });
      const granted = currentPerm === 'granted';
      setHasWritePermission(granted);
      return granted;
    } catch (e) {
      console.warn('Failed to check permission', e);
      return false;
    }
  }, [dirHandle]);

  useEffect(() => {
    if (dirHandle) checkWritePermission();
  }, [dirHandle, checkWritePermission]);

  const requestWritePermission = useCallback(async () => {
    if (!dirHandle) return false;
    if (Platform.OS !== 'web') return true;
    try {
      const nextPerm = await dirHandle.requestPermission({ mode: 'readwrite' });
      const granted = nextPerm === 'granted';
      setHasWritePermission(granted);
      if (granted && Platform.OS === 'web') window.alert('Write permission granted.');
      return granted;
    } catch (e) {
      console.error('Failed to request permission', e);
      if (Platform.OS === 'web') window.alert('An error occurred while requesting permission. Please check your browser settings.');
      return false;
    }
  }, [dirHandle]);

  const scanLevel = useCallback(async (currentHandle: any, path = '') => {
    setIsLoading(true);
    try {
      const items: FileSystemItem[] = [];
      
      if (Platform.OS === 'web') {
        for await (const entry of currentHandle.values()) {
          const entryPath = path ? `${path}/${entry.name}` : entry.name;
          if (entry.kind === 'file') {
            const isSupported = /\.(md|txt|png|jpe?g|gif|webp)$/i.test(entry.name);
            if (isSupported) {
              items.push({ name: entry.name, path: entryPath, kind: 'file', handle: entry });
            }
          } else if (entry.kind === 'directory') {
            items.push({ name: entry.name, path: entryPath, kind: 'directory', children: [], handle: entry, isLoaded: false });
          }
        }
      } else {
        // Native Implementation
        try {
          let result: string[] = [];
          
          console.log('[useFileSystem] Scanning directory:', currentHandle);

          if (Platform.OS === 'android' && currentHandle.startsWith('content://')) {
            console.log('[useFileSystem] Using SAF.readDirectoryAsync');
            result = await StorageAccessFramework.readDirectoryAsync(currentHandle);
          } else {
            console.log('[useFileSystem] Using legacy readDirectoryAsync');
            result = await readDirectoryAsync(currentHandle);
          }
          
          console.log('[useFileSystem] Found items:', result.length);

          for (const name of result) {
            const entryPath = path ? `${path}/${name}` : name;
            
            // For SAF, the name returned is usually the full URI or already encoded.
            // We need to resolve the individual item info.
            const entryUri = (Platform.OS === 'android' && currentHandle.startsWith('content://')) ? name : (currentHandle.endsWith('/') ? currentHandle + name : currentHandle + '/' + name);
            
            const info = await getInfoAsync(entryUri);
            const isDir = info.exists && info.isDirectory;
            
            // Extract a clean name from the URI if needed for SAF
            let cleanName = name;
            if (Platform.OS === 'android' && name.startsWith('content://')) {
              try {
                const decoded = decodeURIComponent(name);
                // Try splitting by / first, then by %2F just in case, then by :
                const parts = decoded.split('/');
                const lastPart = parts.pop() || '';
                cleanName = lastPart.includes(':') ? lastPart.split(':').pop() || lastPart : lastPart;
                
                if (!cleanName) cleanName = name; // Fallback
              } catch (e) {
                cleanName = name;
              }
            }
            if (isDir && cleanName.endsWith('/')) cleanName = cleanName.slice(0, -1);
            
            console.log(`[useFileSystem] Entry: ${cleanName} (${isDir ? 'dir' : 'file'})`);
            
            if (isDir) {
              items.push({ name: cleanName, path: entryPath, kind: 'directory', children: [], handle: entryUri, isLoaded: false });
            } else {
              const isSupported = /\.(md|txt|png|jpe?g|gif|webp)$/i.test(cleanName);
              if (isSupported) {
                items.push({ name: cleanName, path: entryPath, kind: 'file', handle: entryUri });
              }
            }
          }
        } catch (e) {
          console.error('Failed to read directory native', e);
        }
      }

      return items.sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDirectoryRecursive = useCallback(async (path: string) => {
    const scanRecursive = async (handle: any, currentPath: string): Promise<FileSystemItem[]> => {
      const items = await scanLevel(handle, currentPath);
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'directory') {
          items[i].children = await scanRecursive(items[i].handle, items[i].path);
          items[i].isLoaded = true;
        }
      }
      return items;
    };

    const findAndLoadRecursive = async (items: FileSystemItem[]): Promise<FileSystemItem[]> => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].path === path && items[i].kind === 'directory') {
          const newChildren = await scanRecursive(items[i].handle, path);
          const newItems = [...items];
          newItems[i] = { ...items[i], children: newChildren, isLoaded: true };
          return newItems;
        }
        if (items[i].children && path.startsWith(items[i].path + '/')) {
          const updatedChildren = await findAndLoadRecursive(items[i].children!);
          const newItems = [...items];
          newItems[i] = { ...items[i], children: updatedChildren };
          return newItems;
        }
      }
      return items;
    };

    const updatedFS = await findAndLoadRecursive(fileSystemData);
    setFileSystemData(updatedFS);
    return updatedFS;
  }, [fileSystemData, scanLevel]);

  const loadDirectory = useCallback(async (path: string) => {
    const findAndLoad = async (items: FileSystemItem[]): Promise<FileSystemItem[]> => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].path === path && items[i].kind === 'directory') {
          if (items[i].isLoaded) return items;
          
          const newChildren = await scanLevel(items[i].handle, path);
          
          const newItems = [...items];
          newItems[i] = { ...items[i], children: newChildren, isLoaded: true };
          return newItems;
        }
        if (items[i].children && path.startsWith(items[i].path)) {
          const updatedChildren = await findAndLoad(items[i].children!);
          const newItems = [...items];
          newItems[i] = { ...items[i], children: updatedChildren };
          return newItems;
        }
      }
      return items;
    };

    const updatedFS = await findAndLoad(fileSystemData);
    setFileSystemData(updatedFS);
  }, [fileSystemData, scanLevel]);

  const toggleFolder = useCallback(async (path: string) => {
    const isExpanding = !expandedFolders[path];
    if (isExpanding) {
      await loadDirectory(path);
    }
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  }, [expandedFolders, loadDirectory]);

  const copyDirectoryRecursive = useCallback(async (srcHandle: any, destHandle: any) => {
    for await (const entry of srcHandle.values()) {
      if (entry.kind === 'file') {
        const srcFile = await entry.getFile();
        const destFileHandle = await destHandle.getFileHandle(entry.name, { create: true });
        const writable = await destFileHandle.createWritable();
        await writable.write(srcFile);
        await writable.close();
      } else if (entry.kind === 'directory') {
        const destSubDirHandle = await destHandle.getDirectoryHandle(entry.name, { create: true });
        await copyDirectoryRecursive(entry, destSubDirHandle);
      }
    }
  }, []);

  const updateFileSystemData = useCallback((items: FileSystemItem[], oldPath: string, newPath: string, newNameStr: string, newHandle?: any): FileSystemItem[] => {
    return items.map(item => {
      if (item.path === oldPath) {
        const updatedItem = { ...item, path: newPath, name: newNameStr };
        if (newHandle) updatedItem.handle = newHandle;

        if (updatedItem.kind === 'directory' && newHandle && newHandle !== item.handle) {
          updatedItem.isLoaded = false;
          updatedItem.children = [];
        } else if (updatedItem.children) {
          const updateChildrenPaths = (children: FileSystemItem[], oldBase: string, newBase: string): FileSystemItem[] => {
            return children.map(child => {
              const childNewPath = newBase + child.path.slice(oldBase.length);
              const updatedChild = { ...child, path: childNewPath };
              if (updatedChild.children) {
                updatedChild.children = updateChildrenPaths(updatedChild.children, oldBase, newBase);
              }
              return updatedChild;
            });
          };
          updatedItem.children = updateChildrenPaths(updatedItem.children, oldPath, newPath);
        }
        return updatedItem as FileSystemItem;
      }
      if (item.children && oldPath.startsWith(item.path + '/')) {
         return { ...item, children: updateFileSystemData(item.children, oldPath, newPath, newNameStr, newHandle) };
      }
      return item;
    });
  }, []);

  const removeItemFromData = useCallback((items: FileSystemItem[], pathToRemove: string): FileSystemItem[] => {
    return items.filter(item => item.path !== pathToRemove).map(item => {
      if (item.children) {
        return { ...item, children: removeItemFromData(item.children, pathToRemove) };
      }
      return item;
    });
  }, []);

  const addItemToData = useCallback((items: FileSystemItem[], pPath: string, newItem: FileSystemItem): FileSystemItem[] => {
    if (!pPath) return [...items, newItem].sort((a, b) => a.name.localeCompare(b.name));
    return items.map(it => {
      if (it.path === pPath) {
        return { ...it, children: [...(it.children || []), newItem].sort((a, b) => a.name.localeCompare(b.name)), isLoaded: true };
      }
      if (it.children && pPath.startsWith(it.path + '/')) {
        return { ...it, children: addItemToData(it.children, pPath, newItem) };
      }
      return it;
    });
  }, []);

  const saveToDisk = useCallback(async (path: string, content: string | Blob) => {
    if (!dirHandle) return false;
    try {
      if (Platform.OS === 'web') {
        const parts = path.split('/');
        let current = dirHandle;
        for (let i = 0; i < parts.length - 1; i++) {
          current = await current.getDirectoryHandle(parts[i], { create: true });
        }
        const fileHand = await current.getFileHandle(parts[parts.length - 1], { create: true });
        const writable = await fileHand.createWritable();
        await writable.write(content);
        await writable.close();
      } else {
        // Native
        // Resolve the handle for this path if it exists in fileSystemData
        const findHandleByPath = (items: FileSystemItem[], p: string): any => {
          for (const it of items) {
            if (it.path === p) return it.handle;
            if (it.children && p.startsWith(it.path + '/')) {
              return findHandleByPath(it.children, p);
            }
          }
          return null;
        };

        let fileUri = findHandleByPath(fileSystemData, path);
        
        if (!fileUri) {
          // If file doesn't exist, we might need to create it (though saveToDisk usually expects it exists)
          // For now, try fallback concatenation for non-SAF, or error for SAF
          if (Platform.OS === 'android' && dirHandle.startsWith('content://')) {
            console.error('saveToDisk: File handle not found for SAF path', path);
            return false;
          }
          fileUri = joinPaths(dirHandle, path);
        }

        await writeAsStringAsync(fileUri, typeof content === 'string' ? content : '');
      }
      return true;
    } catch (err) {
      console.error('Save to disk failed', err);
      return false;
    }
  }, [dirHandle, fileSystemData]);

  const pickDirectory = useCallback(async () => {
    setIsLoading(true);
    try {
      if (Platform.OS === 'web') {
        try {
          const handle = await (window as any).showDirectoryPicker();
          return handle;
        } catch (e: any) {
          if (e.name !== 'AbortError') console.error('Directory Picker error', e);
          return null;
        }
      } else {
        try {
          // On Android, prioritize established SAF or use the new Directory API
          if (Platform.OS === 'android') {
            const SAF = getSAF();
            const DirAPI = getDirectoryAPI();
            
            console.log('[useFileSystem] Attempting Android Directory Picker...');
            try {
              // Try the established requestDirectoryPermissionsAsync first if available
              if (SAF && typeof SAF.requestDirectoryPermissionsAsync === 'function') {
                console.log('[useFileSystem] Using SAF.requestDirectoryPermissionsAsync');
                const permissions = await SAF.requestDirectoryPermissionsAsync();
                console.log('[useFileSystem] SAF Result:', permissions);
                if (permissions.granted) {
                  return permissions.directoryUri;
                }
              } 
              // Fallback to new pickDirectoryAsync
              else if (DirAPI && typeof DirAPI.pickDirectoryAsync === 'function') {
                console.log('[useFileSystem] Using DirAPI.pickDirectoryAsync');
                const result = await DirAPI.pickDirectoryAsync();
                console.log('[useFileSystem] DirAPI Result:', result);
                
                // Flexible check for success (uri property is the key)
                if (result && result.uri) {
                  return result.uri;
                }
                if (result && result.granted) {
                  return result.uri || result.directoryUri;
                }
              }
            } catch (err) {
              console.error('[useFileSystem] Android Picker error', err);
            }
          }
          
          // iOS/Fallback
          const result = await DocumentPicker.getDocumentAsync({
            type: undefined,
            copyToCacheDirectory: false,
          });
          
          if (result.assets && result.assets.length > 0) {
            return result.assets[0].uri;
          }
        } catch (e) {
          console.error('DocumentPicker error', e);
        }
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    dirHandle, setDirHandle,
    fileSystemData, setFileSystemData,
    expandedFolders, setExpandedFolders,
    localFiles, setLocalFiles,
    selectedFolder, setSelectedFolder,
    selectedFile, setSelectedFile,
    selectedFile2, setSelectedFile2,
    openedFiles, setOpenedFiles,
    openedFiles2, setOpenedFiles2,
    hasWritePermission, setHasWritePermission,
    selectedDirPath, setSelectedDirPath,
    checkWritePermission,
    requestWritePermission,
    loadDirectory,
    loadDirectoryRecursive,
    toggleFolder,
    scanLevel,
    pickDirectory,
    isLoading,
    saveToDisk,
    updateFileSystemData,
    removeItemFromData,
    copyDirectoryRecursive,
    deleteItem: useCallback(async (item: FileSystemItem) => {
      if (!dirHandle) return;
      
      try {
        if (Platform.OS === 'web') {
          const parts = item.path.split('/');
          let parentDir = dirHandle;
          if (parts.length > 1) {
            for (let i = 0; i < parts.length - 1; i++) {
              parentDir = await parentDir.getDirectoryHandle(parts[i]);
            }
          }
          await parentDir.removeEntry(item.name, { recursive: true });
        } else {
          // Native
          await deleteAsync(item.handle, { idempotent: true });
        }

        const isInside = (path: string) => path === item.path || path.startsWith(item.path + '/');

        setFileSystemData(prev => removeItemFromData(prev, item.path));
        setOpenedFiles(prev => prev.filter(p => !isInside(p)));
        setOpenedFiles2(prev => prev.filter(p => !isInside(p)));
        
        setLocalFiles(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(k => {
            if (isInside(k)) delete next[k];
          });
          return next;
        });

        if (isInside(selectedFile)) {
          setSelectedFile('');
        }
        if (isInside(selectedFile2)) {
          setSelectedFile2('');
        }
        return true;
      } catch (e) {
        console.error('Delete failed', e);
        return false;
      }
    }, [dirHandle, selectedFile, selectedFile2, removeItemFromData]),
    renameItem: useCallback(async (item: FileSystemItem, newName: string) => {
      if (!item || !newName || !dirHandle) return false;

      const oldPath = item.path;
      const parentP = getParentPath(oldPath);
      const newPath = joinPaths(parentP, newName);

      try {
        const pathParts = parentP ? parentP.split('/') : [];
        let parentDir = dirHandle;
        for (const p of pathParts) {
          parentDir = await parentDir.getDirectoryHandle(p);
        }
        
        const entry = item.handle;
        let newEntryHandle = entry;

        // @ts-ignore
        if (entry.move) {
          // @ts-ignore
          await entry.move(newName);
        } else {
          if (item.kind === 'directory') {
            newEntryHandle = await parentDir.getDirectoryHandle(newName, { create: true });
            await copyDirectoryRecursive(entry, newEntryHandle);
            await parentDir.removeEntry(item.name, { recursive: true });
          } else {
            const file = await entry.getFile();
            newEntryHandle = await parentDir.getFileHandle(newName, { create: true });
            const writable = await newEntryHandle.createWritable();
            await writable.write(file);
            await writable.close();
            await parentDir.removeEntry(item.name);
          }
        }

        setLocalFiles(prev => {
          const next: Record<string, string> = {};
          Object.keys(prev).forEach(key => {
            const newKey = updateTreePaths(key, oldPath, newPath);
            next[newKey] = prev[key];
          });
          return next;
        });

        setSelectedFile(prev => updateTreePaths(prev, oldPath, newPath));
        setSelectedFile2(prev => updateTreePaths(prev, oldPath, newPath));
        setSelectedDirPath(prev => updateTreePaths(prev, oldPath, newPath));
        setOpenedFiles(prev => prev.map(p => updateTreePaths(p, oldPath, newPath)));
        setOpenedFiles2(prev => prev.map(p => updateTreePaths(p, oldPath, newPath)));
        setExpandedFolders(prev => {
          const next: Record<string, boolean> = {};
          Object.keys(prev).forEach(key => {
            const newKey = updateTreePaths(key, oldPath, newPath);
            next[newKey] = prev[key];
          });
          return next;
        });
        return true;
      } catch (e) {
        console.error('Rename failed', e);
        return false;
      }
    }, [dirHandle, copyDirectoryRecursive, updateFileSystemData]),
    createItem: useCallback(async (parentPath: string, name: string, kind: 'file' | 'directory') => {
      if (!name || !dirHandle) return null;

      try {
        let newHandle;
        const newPath = joinPaths(parentPath, name);

        if (Platform.OS === 'web') {
          const pathParts = parentPath ? parentPath.split('/') : [];
          let parentDir = dirHandle;
          for (const p of pathParts) {
            parentDir = await parentDir.getDirectoryHandle(p);
          }

          if (kind === 'file') {
            newHandle = await parentDir.getFileHandle(name, { create: true });
          } else {
            newHandle = await parentDir.getDirectoryHandle(name, { create: true });
          }
        } else {
          // Native
          // Find the parent handle
          const findHandleByPath = (items: FileSystemItem[], p: string): any => {
            if (!p) return dirHandle;
            for (const it of items) {
              if (it.path === p) return it.handle;
              if (it.children && p.startsWith(it.path + '/')) {
                return findHandleByPath(it.children, p);
              }
            }
            return null;
          };

          const parentHandle = findHandleByPath(fileSystemData, parentPath) || dirHandle;

          if (Platform.OS === 'android' && parentHandle.startsWith('content://')) {
            if (kind === 'file') {
              newHandle = await StorageAccessFramework.createFileAsync(parentHandle, name, 'text/markdown');
            } else {
              newHandle = await StorageAccessFramework.makeDirectoryAsync(parentHandle, name);
            }
          } else {
            newHandle = joinPaths(parentHandle, name);
            if (kind === 'file') {
              await writeAsStringAsync(newHandle, '');
            } else {
              await makeDirectoryAsync(newHandle, { intermediates: true });
            }
          }
        }

        const newItem: FileSystemItem = {
          kind,
          name,
          path: newPath,
          handle: newHandle,
          children: kind === 'directory' ? [] : undefined,
          isLoaded: kind === 'directory'
        };

        const addItemToData = (items: FileSystemItem[], pPath: string, itm: FileSystemItem): FileSystemItem[] => {
          if (!pPath) return [...items, itm];
          return items.map(it => {
            if (it.path === pPath) {
              return { ...it, children: [...(it.children || []), itm], isLoaded: true };
            }
            if (it.children && pPath.startsWith(it.path + '/')) {
              return { ...it, children: addItemToData(it.children, pPath, itm) };
            }
            return it;
          });
        };

        setFileSystemData(prev => addItemToData(prev, parentPath, newItem));
        return newItem;
      } catch (e) {
        console.error('Creation failed', e);
        return null;
      }
    }, [dirHandle, fileSystemData]),
    pasteImage: useCallback(async (file: File, targetMarkdownFile: string) => {
      if (!dirHandle || !targetMarkdownFile) return '';
      try {
        if (!hasWritePermission) {
          const granted = await requestWritePermission();
          if (!granted) return '';
        }

        const ext = getFileExtension(file.name) || 'png';
        const fileNameWithoutExt = targetMarkdownFile.replace(/\.[^/.]+$/, '');
        const dateStr = format(new Date(), 'yyyy-MM-dd-HHmmssSSS');
        const imgTargetName = `${dateStr}.${ext}`;
        
        const imgDirHandle = await dirHandle.getDirectoryHandle('img', { create: true });
        const pathParts = fileNameWithoutExt.split('/').filter(Boolean);
        let currentMdDirHandle = imgDirHandle;
        for (const part of pathParts) {
          currentMdDirHandle = await currentMdDirHandle.getDirectoryHandle(part, { create: true });
        }
        
        const fileHandle = await currentMdDirHandle.getFileHandle(imgTargetName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file);
        await writable.close();
        
        return `/img/${fileNameWithoutExt}/${imgTargetName}`;
      } catch (err) {
        console.error('Failed to save pasted image', err);
        return '';
      }
    }, [dirHandle, hasWritePermission, requestWritePermission]),
    resolveImage: useCallback(async (relativePath: string, currentFilePath?: string) => {
      if (!dirHandle) return relativePath;
      try {
        const resolvedPath = resolveImagePath(relativePath, currentFilePath);
        if (resolvedPath.startsWith('http') || resolvedPath.startsWith('data:') || resolvedPath.startsWith('blob:')) {
          return resolvedPath;
        }

        const stack = resolvedPath.split('/').filter(Boolean);
        let currentHandle = dirHandle;
        for (let i = 0; i < stack.length - 1; i++) {
          currentHandle = await currentHandle.getDirectoryHandle(stack[i]);
        }
        const fileHandle = await currentHandle.getFileHandle(stack[stack.length - 1]);
        const file = await fileHandle.getFile();
        return Platform.OS === 'web' ? URL.createObjectURL(file) : fileHandle;
      } catch (err) {
        return relativePath;
      }
    }, [dirHandle]),
    handleRenameImage: useCallback(async (oldRelativePath: string, newFileName: string, selectedFile: string) => {
      if (!dirHandle || !selectedFile) return '';
      try {
        const parts = oldRelativePath.split('/');
        const oldFileName = parts.pop()!;
        if (oldFileName === newFileName) return oldRelativePath;
        
        let cleaned = oldRelativePath;
        if (cleaned.startsWith('./')) cleaned = cleaned.slice(2);
        
        const dirParts = cleaned.split('/').filter(Boolean);
        dirParts.pop();

        let currentHandle = dirHandle;
        for (const p of dirParts) {
          currentHandle = await currentHandle.getDirectoryHandle(p);
        }

        const fileHandle = await currentHandle.getFileHandle(oldFileName);
        const file = await fileHandle.getFile();
        
        const newFileHandle = await currentHandle.getFileHandle(newFileName, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(file);
        await writable.close();
        
        try {
          await currentHandle.removeEntry(oldFileName);
        } catch (e) {}
        
        let rootPath = dirParts.join('/');
        if (rootPath) rootPath += '/';
        return rootPath + newFileName;
      } catch (err) {
        console.error('Rename image failed', err);
        return '';
      }
    }, [dirHandle]),
    handleSaveChatToFile: useCallback(async (filename: string, content: string) => {
      if (!dirHandle) return false;
      try {
        let targetPath = filename;
        if (filename.startsWith('./')) targetPath = filename.slice(2);
        
        const parts = targetPath.split('/').filter(Boolean);
        const name = parts.pop()!;
        let currentHand = dirHandle;
        
        for (const p of parts) {
          currentHand = await currentHand.getDirectoryHandle(p, { create: true });
        }

        const fileHand = await currentHand.getFileHandle(name, { create: true });
        const writable = await fileHand.createWritable();
        await writable.write(content);
        await writable.close();
        
        if (localFiles[targetPath] !== undefined) {
          setLocalFiles(prev => ({ ...prev, [targetPath]: content }));
        }
        return true;
      } catch (err) {
        console.error('Save chat to file failed', err);
        return false;
      }
    }, [dirHandle, localFiles]),
    moveItem: useCallback(async (item: FileSystemItem, targetParentPath: string) => {
      if (!item || !dirHandle) return false;
      
      const oldPath = item.path;
      const targetPath = joinPaths(targetParentPath, item.name);
      
      if (oldPath === targetPath) return true;
      if (targetPath.startsWith(oldPath + '/')) {
        console.error('Cannot move a folder into its own subdirectory');
        return false;
      }

      try {
        let newHandle;
        if (Platform.OS === 'web') {
          // Find target parent handle
          const pathParts = targetParentPath ? targetParentPath.split('/') : [];
          let targetParentHandle = dirHandle;
          for (const p of pathParts) {
            targetParentHandle = await targetParentHandle.getDirectoryHandle(p);
          }

          // @ts-ignore
          if (item.handle.move) {
            // @ts-ignore
            await item.handle.move(targetParentHandle);
            newHandle = item.handle;
          } else {
            if (item.kind === 'directory') {
              newHandle = await targetParentHandle.getDirectoryHandle(item.name, { create: true });
              await copyDirectoryRecursive(item.handle, newHandle);
            } else {
              const file = await item.handle.getFile();
              newHandle = await targetParentHandle.getFileHandle(item.name, { create: true });
              const writable = await newHandle.createWritable();
              await writable.write(file);
              await writable.close();
            }
            
            // Remove from old location
            const oldParentPath = getParentPath(oldPath);
            const oldParentParts = oldParentPath ? oldParentPath.split('/') : [];
            let oldParentHandle = dirHandle;
            for (const p of oldParentParts) {
              oldParentHandle = await oldParentHandle.getDirectoryHandle(p);
            }
            await oldParentHandle.removeEntry(item.name, { recursive: true });
          }
        } else {
          // Native Implementation
          const findHandleByPath = (items: FileSystemItem[], p: string): any => {
            if (!p) return dirHandle;
            for (const it of items) {
              if (it.path === p) return it.handle;
              if (it.children && p.startsWith(it.path + '/')) {
                return findHandleByPath(it.children, p);
              }
            }
            return null;
          };

          const targetParentHandle = findHandleByPath(fileSystemData, targetParentPath) || dirHandle;
          
          if (Platform.OS === 'android' && targetParentHandle.startsWith('content://')) {
            // SAF move is complex, use copy + delete for simplicity or if move is not direct
            // For now, let's use moveAsync if handles are paths, or SAF specific move if available
            newHandle = await StorageAccessFramework.copyAsync({
              from: item.handle,
              to: targetParentHandle
            });
            await deleteAsync(item.handle);
          } else {
            newHandle = joinPaths(targetParentHandle, item.name);
            await moveAsync({ from: item.handle, to: newHandle });
          }
        }

        // Update Tree Data
        const updateItemPaths = (it: FileSystemItem, oldB: string, newB: string): FileSystemItem => {
          const updated = { ...it, path: updateTreePaths(it.path, oldB, newB) };
          if (updated.children) {
            updated.children = updated.children.map(child => updateItemPaths(child, oldB, newB));
          }
          return updated;
        };

        const movedItem = updateItemPaths({ ...item, handle: newHandle }, oldPath, targetPath);

        setFileSystemData(prev => {
          const removed = removeItemFromData(prev, oldPath);
          return addItemToData(removed, targetParentPath, movedItem);
        });

        // Update other states
        setLocalFiles(prev => {
          const next: Record<string, string> = {};
          Object.keys(prev).forEach(key => {
            const newKey = updateTreePaths(key, oldPath, targetPath);
            next[newKey] = prev[key];
          });
          return next;
        });

        setSelectedFile(prev => updateTreePaths(prev, oldPath, targetPath));
        setSelectedFile2(prev => updateTreePaths(prev, oldPath, targetPath));
        setOpenedFiles(prev => prev.map(p => updateTreePaths(p, oldPath, targetPath)));
        setOpenedFiles2(prev => prev.map(p => updateTreePaths(p, oldPath, targetPath)));
        setExpandedFolders(prev => {
          const next: Record<string, boolean> = {};
          Object.keys(prev).forEach(key => {
            const newKey = updateTreePaths(key, oldPath, targetPath);
            next[newKey] = prev[key];
          });
          // Ensure target folder is expanded
          next[targetParentPath] = true;
          return next;
        });

        return true;
      } catch (e) {
        console.error('Move failed', e);
        return false;
      }
    }, [dirHandle, fileSystemData, copyDirectoryRecursive, removeItemFromData, addItemToData]),
  };
}

function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}
