import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import { format } from 'date-fns';
import * as Clipboard from 'expo-clipboard';
import { isImageFile, getParentPath, joinPaths, normalizePath } from '@/utils/FileSystemUtils';

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

  const checkWritePermission = useCallback(async (handle = dirHandle) => {
    if (!handle) return false;
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
    const items: FileSystemItem[] = [];
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
    return items.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
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

  const saveToDisk = useCallback(async (path: string, content: string | Blob) => {
    if (!dirHandle) return false;
    try {
      const parts = path.split('/');
      let current = dirHandle;
      for (let i = 0; i < parts.length - 1; i++) {
        current = await current.getDirectoryHandle(parts[i], { create: true });
      }
      const fileHand = await current.getFileHandle(parts[parts.length - 1], { create: true });
      const writable = await fileHand.createWritable();
      await writable.write(content);
      await writable.close();
      return true;
    } catch (err) {
      console.error('Save to disk failed', err);
      return false;
    }
  }, [dirHandle]);

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
    saveToDisk,
    updateFileSystemData,
    removeItemFromData,
    copyDirectoryRecursive,
    deleteItem: async (item: FileSystemItem) => {
      if (!dirHandle) return;
      
      try {
        const parts = item.path.split('/');
        let parentDir = dirHandle;
        if (parts.length > 1) {
          for (let i = 0; i < parts.length - 1; i++) {
            parentDir = await parentDir.getDirectoryHandle(parts[i]);
          }
        }
        await parentDir.removeEntry(item.name, { recursive: true });

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
    },
    renameItem: async (item: FileSystemItem, newName: string) => {
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

        const updatePath = (path: string) => {
          if (path === oldPath) return newPath;
          if (path.startsWith(oldPath + '/')) {
            return newPath + path.slice(oldPath.length);
          }
          return path;
        };

        setFileSystemData(prev => updateFileSystemData(prev, oldPath, newPath, newName, newEntryHandle));
        
        setLocalFiles(prev => {
          const next: Record<string, string> = {};
          Object.keys(prev).forEach(key => {
            const newKey = updatePath(key);
            next[newKey] = prev[key];
          });
          return next;
        });

        setSelectedFile(prev => updatePath(prev));
        setSelectedFile2(prev => updatePath(prev));
        setSelectedDirPath(prev => updatePath(prev));
        setOpenedFiles(prev => prev.map(updatePath));
        setOpenedFiles2(prev => prev.map(updatePath));
        setExpandedFolders(prev => {
          const next: Record<string, boolean> = {};
          Object.keys(prev).forEach(key => {
            const newKey = updatePath(key);
            next[newKey] = prev[key];
          });
          return next;
        });
        return true;
      } catch (e) {
        console.error('Rename failed', e);
        return false;
      }
    },
    createItem: async (parentPath: string, name: string, kind: 'file' | 'directory') => {
      if (!name || !dirHandle) return null;

      try {
        const pathParts = parentPath ? parentPath.split('/') : [];
        let parentDir = dirHandle;
        for (const p of pathParts) {
          parentDir = await parentDir.getDirectoryHandle(p);
        }

        let newHandle;
        if (kind === 'file') {
          newHandle = await parentDir.getFileHandle(name, { create: true });
        } else {
          newHandle = await parentDir.getDirectoryHandle(name, { create: true });
        }

        const newPath = joinPaths(parentPath, name);
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
    },
    pasteImage: async (file: File, targetMarkdownFile: string) => {
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
    },
    resolveImage: async (relativePath: string, currentFilePath?: string) => {
      if (!dirHandle) return relativePath;
      try {
        if (relativePath.startsWith('http') || relativePath.startsWith('data:') || relativePath.startsWith('blob:')) {
          return relativePath;
        }
        
        let fullPath = relativePath;
        if (relativePath.startsWith('/')) {
          fullPath = relativePath.slice(1);
        } else if (relativePath.startsWith('img/')) {
          fullPath = relativePath;
        } else if (currentFilePath) {
          const fileDir = getParentPath(currentFilePath);
          if (fileDir) {
            fullPath = joinPaths(fileDir, relativePath);
          }
        }

        const normalized = normalizePath(fullPath);
        if (!normalized) return relativePath;

        const stack = normalized.split('/');
        let currentHandle = dirHandle;
        for (let i = 0; i < stack.length - 1; i++) {
          currentHandle = await currentHandle.getDirectoryHandle(stack[i]);
        }
        const fileHandle = await currentHandle.getFileHandle(stack[stack.length - 1]);
        const file = await fileHandle.getFile();
        return URL.createObjectURL(file);
      } catch (err) {
        return relativePath;
      }
    },
    handleRenameImage: async (oldRelativePath: string, newFileName: string, selectedFile: string) => {
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
    },
    handleSaveChatToFile: async (filename: string, content: string) => {
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
    }
  };
}

function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}
