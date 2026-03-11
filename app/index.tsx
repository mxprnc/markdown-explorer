import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useColorScheme, Platform, Alert, PanResponder } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

import Editor from '@/components/Editor';
import GeminiChat from '@/components/GeminiChat';
import Preview from '@/components/Preview';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [editorContent, setEditorContent] = useState('# Markdown Explorer Project\n\n* 실제 작동하는 CodeMirror 기반 에디터입니다.\n* 여기서 타이핑하면 아래 Live Preview 에 반영됩니다.\n\n해봤는데 잘 동작하나요? 😊');
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');

  const [activeTab, setActiveTab] = useState<'files' | 'editor'>('files');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [localFiles, setLocalFiles] = useState<Record<string, string>>({});
  const [dirHandle, setDirHandle] = useState<any>(null);

  const [openedFiles, setOpenedFiles] = useState<string[]>([]);
  const [fileSystemData, setFileSystemData] = useState<any[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedDirPath, setSelectedDirPath] = useState<string>('');
  
  // Drag & Drop State
  const [draggingTab, setDraggingTab] = useState<{file: string, sourcePane: 1 | 2} | null>(null);
  const [isDragOverRight, setIsDragOverRight] = useState(false);

  // Pane 2 State
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [activePane, setActivePane] = useState<1 | 2>(1);
  const [openedFiles2, setOpenedFiles2] = useState<string[]>([]);
  const [selectedFile2, setSelectedFile2] = useState('');
  const [editorContent2, setEditorContent2] = useState('');
  
  // Context Menu & Hover State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, visible: boolean, item: any | null }>({ x: 0, y: 0, visible: false, item: null });
  const [hoveredItemPath, setHoveredItemPath] = useState<string | null>(null);
  const [renamingItem, setRenamingItem] = useState<any | null>(null);
  const [newName, setNewName] = useState('');

  // Creation State
  const [creatingItem, setCreatingItem] = useState<{ parentPath: string, kind: 'file' | 'directory' } | null>(null);
  const [creationName, setCreationName] = useState('');

  // Gemini State
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [showGeminiSettings, setShowGeminiSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempClientId, setTempClientId] = useState('');

  // OAuth Request Hook
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: googleClientId,
    scopes: [
      'https://www.googleapis.com/auth/generative-language',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/youtube.force-ssl'
    ],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        setGoogleAccessToken(authentication.accessToken);
        if (Platform.OS === 'web') {
           localStorage.setItem('google_access_token', authentication.accessToken);
        }
      }
    }
  }, [response]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const savedKey = localStorage.getItem('gemini_api_key');
      const savedClientId = localStorage.getItem('google_client_id');
      const savedToken = localStorage.getItem('google_access_token');
      
      if (savedKey) { setGeminiApiKey(savedKey); setTempApiKey(savedKey); }
      if (savedClientId) { setGoogleClientId(savedClientId); setTempClientId(savedClientId); }
      if (savedToken) { setGoogleAccessToken(savedToken); }
    }
  }, []);

  const saveGeminiKey = () => {
    setGeminiApiKey(tempApiKey);
    setGoogleClientId(tempClientId);
    if (Platform.OS === 'web') {
      localStorage.setItem('gemini_api_key', tempApiKey);
      localStorage.setItem('google_client_id', tempClientId);
    }
    setShowGeminiSettings(false);
  };

  const handleLogout = () => {
    setGoogleAccessToken(null);
    if (Platform.OS === 'web') {
      localStorage.removeItem('google_access_token');
    }
  };

  const handleSelectFile = async (file: string, targetPane: 1 | 2 = activePane) => {
    const isImage = /\.(png|jpe?g|gif|webp)$/i.test(file);
    let content = localFiles[file];
    
    if (content === undefined) {
      // Lazy load content
      const findHandle = (items: any[], path: string): any => {
        for (const item of items) {
          if (item.path === path) return item.handle;
          if (item.children) {
            const h = findHandle(item.children, path);
            if (h) return h;
          }
        }
        return null;
      };
      const handle = findHandle(fileSystemData, file);
      if (handle) {
        try {
          if (isImage) {
            const f = await handle.getFile();
            content = URL.createObjectURL(f);
          } else {
            const f = await handle.getFile();
            content = await f.text();
          }
          setLocalFiles(prev => ({ ...prev, [file]: content }));
        } catch (e) {
          console.warn('Failed to read file lazy', e);
          content = '';
        }
      } else {
        content = '';
      }
    }

    if (targetPane === 1) {
      if (file === selectedFile) return;
      if (selectedFile && !/\.(png|jpe?g|gif|webp)$/i.test(selectedFile)) {
          setLocalFiles(prev => ({ ...prev, [selectedFile]: editorContent }));
      }
      setOpenedFiles(prev => !prev.includes(file) ? [...prev, file] : prev);
      setSelectedFile(file);
      setEditorContent(content);
      setActivePane(1);
    } else {
      if (file === selectedFile2) return;
      if (selectedFile2 && !/\.(png|jpe?g|gif|webp)$/i.test(selectedFile2)) {
          setLocalFiles(prev => ({ ...prev, [selectedFile2]: editorContent2 }));
      }
      setOpenedFiles2(prev => !prev.includes(file) ? [...prev, file] : prev);
      setSelectedFile2(file);
      setEditorContent2(content);
      setActivePane(2);
    }
  };

  const loadDirectory = async (path: string) => {
    const findAndLoad = async (items: any[]): Promise<any[]> => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].path === path && items[i].kind === 'directory') {
          if (items[i].isLoaded) return items;
          
          const newChildren: any[] = [];
          // @ts-ignore
          for await (const entry of items[i].handle.values()) {
            const entryPath = `${path}/${entry.name}`;
            if (entry.kind === 'file' && /\.(md|txt|png|jpe?g|gif|webp)$/i.test(entry.name)) {
              newChildren.push({ name: entry.name, path: entryPath, kind: 'file', handle: entry });
            } else if (entry.kind === 'directory') {
              newChildren.push({ name: entry.name, path: entryPath, kind: 'directory', handle: entry, children: [], isLoaded: false });
            }
          }
          newChildren.sort((a, b) => {
            if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
          
          const newItems = [...items];
          newItems[i] = { ...items[i], children: newChildren, isLoaded: true };
          return newItems;
        }
        if (items[i].children && path.startsWith(items[i].path)) {
          const updatedChildren = await findAndLoad(items[i].children);
          const newItems = [...items];
          newItems[i] = { ...items[i], children: updatedChildren };
          return newItems;
        }
      }
      return items;
    };

    const updatedFS = await findAndLoad(fileSystemData);
    setFileSystemData(updatedFS);
  };

  const toggleFolder = async (path: string) => {
    const isExpanding = !expandedFolders[path];
    if (isExpanding) {
      await loadDirectory(path);
    }
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const closeTab = (fileToClose: string, targetPane: 1 | 2) => {
    if (targetPane === 1) {
      setOpenedFiles(prev => {
        const newTabs = prev.filter(f => f !== fileToClose);
        if (selectedFile === fileToClose) {
          if (newTabs.length > 0) {
            const newSelected = newTabs[newTabs.length - 1];
            setSelectedFile(newSelected);
            setEditorContent(localFiles[newSelected] || '');
          } else {
            setSelectedFile('');
            setEditorContent('');
          }
        }
        return newTabs;
      });
    } else {
      setOpenedFiles2(prev => {
        const newTabs = prev.filter(f => f !== fileToClose);
        if (selectedFile2 === fileToClose) {
          if (newTabs.length > 0) {
            const newSelected = newTabs[newTabs.length - 1];
            setSelectedFile2(newSelected);
            setEditorContent2(localFiles[newSelected] || '');
          } else {
            setSelectedFile2('');
            setEditorContent2('');
          }
        }
        return newTabs;
      });
    }
  };

  const updateFileSystemData = (items: any[], oldPath: string, newPath: string, newNameStr: string): any[] => {
    return items.map(item => {
      if (item.path === oldPath) {
        return { ...item, path: newPath, name: newNameStr };
      }
      if (item.children && oldPath.startsWith(item.path + '/')) {
         return { ...item, children: updateFileSystemData(item.children, oldPath, newPath, newNameStr) };
      }
      return item;
    });
  };

  const removeItemFromData = (items: any[], pathToRemove: string): any[] => {
    return items.filter(item => item.path !== pathToRemove).map(item => {
      if (item.children) {
        return { ...item, children: removeItemFromData(item.children, pathToRemove) };
      }
      return item;
    });
  };

  const handleDeleteFileSystem = async (item: any) => {
    if (!dirHandle) return;
    if (Platform.OS === 'web' && !window.confirm(`'${item.name}'을(를) 삭제하시겠습니까?`)) return;

    try {
      const parts = item.path.split('/');
      let parentDir = dirHandle;
      if (parts.length > 1) {
        for (let i = 0; i < parts.length - 1; i++) {
          parentDir = await parentDir.getDirectoryHandle(parts[i]);
        }
      }
      await parentDir.removeEntry(item.name, { recursive: true });

      setFileSystemData(prev => removeItemFromData(prev, item.path));
      closeTab(item.path, 1);
      closeTab(item.path, 2);
      
      const newLocalFiles = { ...localFiles };
      delete newLocalFiles[item.path];
      setLocalFiles(newLocalFiles);

      if (selectedFile === item.path) setSelectedFile('');
      if (selectedFile2 === item.path) setSelectedFile2('');
    } catch (e) {
      console.error('Delete failed', e);
      if (Platform.OS === 'web') window.alert('삭제 오류: ' + e);
    }
  };

  const handleRenameFileSystem = async () => {
    if (!renamingItem || !newName || !dirHandle) {
      setRenamingItem(null);
      return;
    }

    const oldPath = renamingItem.path;
    const pathParts = oldPath.split('/');
    pathParts.pop();
    const newPath = pathParts.length > 0 ? `${pathParts.join('/')}/${newName}` : newName;

    try {
      let parentDir = dirHandle;
      if (pathParts.length > 0) {
        for (const p of pathParts) {
          parentDir = await parentDir.getDirectoryHandle(p);
        }
      }
      
      const entry = renamingItem.handle;
      // @ts-ignore
      if (entry.move) {
        // @ts-ignore
        await entry.move(newName);
      } else {
        throw new Error('이 브라우저는 .move()를 지원하지 않습니다.');
      }

      setFileSystemData(prev => updateFileSystemData(prev, oldPath, newPath, newName));
      
      if (localFiles[oldPath] !== undefined) {
        setLocalFiles(prev => {
          const next = { ...prev };
          next[newPath] = next[oldPath];
          delete next[oldPath];
          return next;
        });
      }

      if (selectedFile === oldPath) setSelectedFile(newPath);
      if (selectedFile2 === oldPath) setSelectedFile2(newPath);
      if (selectedDirPath === oldPath) setSelectedDirPath(newPath);

      setOpenedFiles(prev => prev.map(p => p === oldPath ? newPath : p));
      setOpenedFiles2(prev => prev.map(p => p === oldPath ? newPath : p));

      setRenamingItem(null);
      setNewName('');
    } catch (e) {
      console.error('Rename failed', e);
      if (Platform.OS === 'web') window.alert('이름 변경 오류: ' + e);
      setRenamingItem(null);
    }
  };

  const handleConfirmCreation = async () => {
    if (!creatingItem || !creationName || !dirHandle) {
      setCreatingItem(null);
      return;
    }

    try {
      const parentPath = creatingItem.parentPath;
      const pathParts = parentPath ? parentPath.split('/') : [];
      let parentDir = dirHandle;
      for (const p of pathParts) {
        parentDir = await parentDir.getDirectoryHandle(p);
      }

      let newHandle;
      if (creatingItem.kind === 'file') {
        newHandle = await parentDir.getFileHandle(creationName, { create: true });
      } else {
        newHandle = await parentDir.getDirectoryHandle(creationName, { create: true });
      }

      const newPath = parentPath ? `${parentPath}/${creationName}` : creationName;
      const newItem = {
        kind: creatingItem.kind,
        name: creationName,
        path: newPath,
        handle: newHandle,
        children: creatingItem.kind === 'directory' ? [] : undefined,
        isLoaded: creatingItem.kind === 'directory'
      };

      const addItemToData = (items: any[], path: string, item: any): any[] => {
        if (!path) return [...items, item];
        return items.map(it => {
          if (it.path === path) {
            return { ...it, children: [...(it.children || []), item], isLoaded: true };
          }
          if (it.children && path.startsWith(it.path + '/')) {
            return { ...it, children: addItemToData(it.children, path, item) };
          }
          return it;
        });
      };

      setFileSystemData(prev => addItemToData(prev, parentPath, newItem));
      
      if (creatingItem.kind === 'file') {
        handleSelectFile(newPath);
      } else {
        setExpandedFolders(prev => ({ ...prev, [parentPath]: true }));
      }

      setCreatingItem(null);
      setCreationName('');
    } catch (e) {
      console.error('Creation failed', e);
      if (Platform.OS === 'web') window.alert('생성 오류: ' + e);
      setCreatingItem(null);
    }
  };

  const leftPaneWidthRef = React.useRef(250);
  const [leftPaneWidth, setLeftPaneWidth] = useState(250);
  const startLeftWidthRef = React.useRef(250);
  const [isResizing, setIsResizing] = useState(false);

  const leftPaneResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startLeftWidthRef.current = leftPaneWidthRef.current;
        setIsResizing(true);
      },
      onPanResponderMove: (e, gestureState) => {
        const newWidth = Math.max(150, Math.min(800, startLeftWidthRef.current + gestureState.dx));
        leftPaneWidthRef.current = newWidth;
        setLeftPaneWidth(newWidth);
      },
      onPanResponderRelease: () => setIsResizing(false),
      onPanResponderTerminate: () => setIsResizing(false),
    })
  ).current;

  const tocPaneWidthRef = React.useRef(220);
  const [tocPaneWidth, setTocPaneWidth] = useState(220);
  const startTocWidthRef = React.useRef(220);

  const tocPaneResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startTocWidthRef.current = tocPaneWidthRef.current;
        setIsResizing(true);
      },
      onPanResponderMove: (e, gestureState) => {
        const newWidth = Math.max(150, Math.min(800, startTocWidthRef.current - gestureState.dx));
        tocPaneWidthRef.current = newWidth;
        setTocPaneWidth(newWidth);
      },
      onPanResponderRelease: () => setIsResizing(false),
      onPanResponderTerminate: () => setIsResizing(false),
    })
  ).current;

  const middlePaneWidthRef = React.useRef(300);
  const [middlePaneWidth, setMiddlePaneWidth] = useState(300);
  const startMiddleWidthRef = React.useRef(300);

  const middlePaneResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startMiddleWidthRef.current = middlePaneWidthRef.current;
        setIsResizing(true);
      },
      onPanResponderMove: (e, gestureState) => {
        const newWidth = Math.max(150, Math.min(800, startMiddleWidthRef.current + gestureState.dx));
        middlePaneWidthRef.current = newWidth;
        setMiddlePaneWidth(newWidth);
      },
      onPanResponderRelease: () => setIsResizing(false),
      onPanResponderTerminate: () => setIsResizing(false),
    })
  ).current;

  const handleOpenDirectory = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('알림', '로컬 폴더 열기는 데스크탑 웹 브라우저 (Chrome, Edge 등) 환경에서 지원됩니다.');
      return;
    }
    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker();
      setDirHandle(handle);
      setSelectedFolder(handle.name);
      
      async function scanLevel(currentHandle: any, path = '') {
        const items: any[] = [];
        // @ts-ignore
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
      }

      const topLevelItems = await scanLevel(handle);
      setFileSystemData(topLevelItems);
      setLocalFiles({}); 
      setSelectedDirPath('');

      const firstMd = topLevelItems.find(item => item.kind === 'file' && (item.name.endsWith('.md') || item.name.endsWith('.txt')));
      if (firstMd) {
        // Read content for the first file specifically
        const f = await firstMd.handle.getFile();
        const text = await f.text();
        setLocalFiles({ [firstMd.path]: text });
        setSelectedFile(firstMd.path);
        setEditorContent(text);
        setOpenedFiles([firstMd.path]);
      } else {
        setSelectedFile('');
        setEditorContent('# 불러올 Markdown 파일이 없습니다.');
        setOpenedFiles([]);
      }
      setSelectedFile2('');
      setEditorContent2('');
      setOpenedFiles2([]);
    } catch (e) {
      console.log('User cancelled or error', e);
    }
  };

  const handlePasteImage = async (file: File) => {
    if (!dirHandle || !selectedFile) return '';
    try {
      const extMatch = file.name.match(/\.(png|jpe?g|gif|webp)$/i);
      const ext = extMatch ? extMatch[1] : 'png';
      
      const fileNameWithoutExt = selectedFile.replace(/\.[^/.]+$/, '');
      const dateStr = format(new Date(), 'yyyy-MM-dd-HHmmssSSS');
      const imgTargetName = `${dateStr}.${ext}`;
      
      const imgDirHandle = await dirHandle.getDirectoryHandle('img', { create: true });
      const currentMdDirHandle = await imgDirHandle.getDirectoryHandle(fileNameWithoutExt, { create: true });
      
      const fileHandle = await currentMdDirHandle.getFileHandle(imgTargetName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(file);
      await writable.close();
      
      const relativePath = `img/${fileNameWithoutExt}/${imgTargetName}`;
      return relativePath;
    } catch (err) {
      console.error('Failed to save pasted image', err);
      // Fallback
      return `붙여넣기_실패_권한필요`;
    }
  };

  const resolveImage = async (relativePath: string) => {
    if (!dirHandle) return relativePath;
    try {
      if (relativePath.startsWith('http') || relativePath.startsWith('data:') || relativePath.startsWith('blob:')) {
        return relativePath;
      }
      let cleaned = relativePath;
      if (cleaned.startsWith('./')) {
         cleaned = cleaned.slice(2);
      }
      const parts = cleaned.split('/').filter(Boolean);
      if (parts.length === 0) return relativePath;
      let currentHandle = dirHandle;
      for (let i = 0; i < parts.length - 1; i++) {
        currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
      }
      const fileHandle = await currentHandle.getFileHandle(parts[parts.length - 1]);
      const file = await fileHandle.getFile();
      return URL.createObjectURL(file);
    } catch (err) {
      console.warn('Failed to resolve image', relativePath, err);
      return relativePath;
    }
  };

  const handleRenameImage = async (oldRelativePath: string, newFileName: string) => {
    if (!dirHandle || !selectedFile) return '';
    try {
      const parts = oldRelativePath.split('/');
      const oldFileName = parts.pop()!;
      if (oldFileName === newFileName) return oldRelativePath;
      
      let cleaned = oldRelativePath;
      if (cleaned.startsWith('./')) {
         cleaned = cleaned.slice(2);
      }
      const dirParts = cleaned.split('/').filter(Boolean);
      dirParts.pop(); // remove file name

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
      } catch (e) {
        console.warn('Cannot delete old file during rename', e);
      }
      
      let rootPath = dirParts.join('/');
      if (rootPath) rootPath += '/';
      return rootPath + newFileName;
    } catch (err: any) {
      console.error('Rename image failed', err);
      window.alert('이미지 파일명 변경 실패: ' + err.message);
      return '';
    }
  };

  const getAbsolutePath = () => `/Users/alpha300uk/Documents/toy-projects/${selectedFolder}/${selectedFile}`;
  const getRelativePath = () => `./${selectedFolder}/${selectedFile}`;

  const handleSaveToDisk = async (content: string, overrideFile?: string) => {
    const targetFile = overrideFile || selectedFile;
    if (!dirHandle || !targetFile) return false;
    try {
      if (Platform.OS === 'web') {
        const fileHandle = await dirHandle.getFileHandle(targetFile, { create: false });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Save to disk failed', e);
      return false;
    }
  };

  const copyAbsolutePath = async () => {
    const p = getAbsolutePath();
    await Clipboard.setStringAsync(p);
    if (Platform.OS === 'web') window.alert(`절대 경로가 복사되었습니다:\n${p}`);
    else Alert.alert('복사됨', `절대 경로가 복사되었습니다:\n${p}`);
  };

  const copyRelativePath = async () => {
    const p = getRelativePath();
    await Clipboard.setStringAsync(p);
    if (Platform.OS === 'web') window.alert(`상대 경로가 복사되었습니다:\n${p}`);
    else Alert.alert('복사됨', `상대 경로가 복사되었습니다:\n${p}`);
  };

  // Determine current active scheme
  const currentScheme = themeMode === 'system' ? systemScheme : themeMode;
  const isDark = currentScheme === 'dark';

  // Toggle Theme Function
  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Colors mapping matching plan-markdown-project.md
  const colors = {
    background: isDark ? '#121212' : '#FFFFFF',
    text: isDark ? '#F3F4F6' : '#121212',
    border: isDark ? '#374151' : '#E5E7EB',
    surface: isDark ? '#1E1E1E' : '#F9FAFB',
    primary: '#3B82F6',
    textMuted: isDark ? '#9CA3AF' : '#6B7280',
  };

  const fontFamilyUI = Platform.select({ web: 'Inter, sans-serif', default: 'System' });
  const fontFamilyCode = Platform.select({ web: 'JetBrains Mono, Fira Code, monospace', default: 'System' });

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, flexDirection: 'column' },
    
    // Header
    header: {
      height: 48,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    logoText: { color: colors.text, fontWeight: 'bold', fontSize: 16, marginRight: 24, fontFamily: fontFamilyUI },
    headerTitle: { color: colors.textMuted, fontSize: 14, marginRight: 8, fontFamily: fontFamilyUI },
    actionIcon: { color: colors.primary, fontSize: 16, marginHorizontal: 4, padding: 4, fontFamily: fontFamilyUI },
    themeBtnText: { color: colors.text, fontSize: 13, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginLeft: 16, overflow: 'hidden' },

    // Main Body
    body: { flex: 1, flexDirection: 'row' },
    
    // Sidebars
    paneLeft: {
      width: 250,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      backgroundColor: colors.surface,
    },
    paneMiddle: {
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    paneRight: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    paneTOC: {
      width: 220,
      borderLeftWidth: 1,
      borderLeftColor: colors.border,
      backgroundColor: colors.surface,
    },

    paneHeader: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    paneTitle: { fontSize: 12, fontWeight: 'bold', color: colors.textMuted, textTransform: 'uppercase', fontFamily: fontFamilyUI },

    listItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    listItemText: { color: colors.text, fontSize: 14, fontFamily: fontFamilyUI },
    listItemSelected: { backgroundColor: isDark ? '#2D3748' : '#EFF6FF', borderLeftWidth: 3, borderLeftColor: colors.primary },

    // Footer
    footer: {
      height: 250, // Gemini Chat height
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      padding: 0, // GeminiChat adds its own padding
    },
    terminalText: {
      color: '#A7F3D0',
      fontFamily: fontFamilyCode,
      fontSize: 12,
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      height: 38,
      alignItems: 'center',
    },
    tabItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      height: '100%',
      borderRightWidth: 1,
      borderRightColor: colors.border,
      backgroundColor: colors.surface,
      borderTopWidth: 2,
      borderTopColor: 'transparent',
      userSelect: 'none',
    } as any,
    tabItemActive: {
      backgroundColor: colors.background,
      borderTopColor: colors.primary,
    },
    tabText: {
      fontSize: 12,
      color: colors.textMuted,
      marginRight: 6,
      fontFamily: fontFamilyUI,
      userSelect: 'none',
    } as any,
    tabTextActive: {
      color: colors.text,
      fontWeight: 'bold',
    },
    tabCloseBtn: {
      padding: 4,
      borderRadius: 4,
    },
    tabCloseText: {
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: 'bold',
      userSelect: 'none',
    } as any,
    footerPath: {
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      height: 24,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    footerPathText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', fontFamily: fontFamilyCode },
  });

  const handleTOCClick = (text: string, index: number) => {
    if (Platform.OS === 'web') {
      const headers = document.querySelectorAll('.tiptap-wrapper h1, .tiptap-wrapper h2, .tiptap-wrapper h3, .tiptap-wrapper h4, .tiptap-wrapper h5, .tiptap-wrapper h6');
      
      // Fast path: try to index match exactly
      if (headers[index] && headers[index].textContent?.trim() === text) {
        headers[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      
      // Fallback: search by text content across all headers
      for (let i = 0; i < headers.length; i++) {
        if (headers[i].textContent?.trim() === text) {
           headers[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
           break;
        }
      }
    }
  };

  const tocList = React.useMemo(() => {
    const currentContent = activePane === 1 ? editorContent : editorContent2;
    const lines = currentContent.split('\n');
    const toc: { id: string, text: string, level: number }[] = [];
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;
      
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        toc.push({
          id: `toc-${i}`,
          level: match[1].length,
          text: match[2].replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_~`]/g, '')
        });
      }
    }
    return toc;
  }, [editorContent, editorContent2, activePane]);

  const renderTabBar = (paneId: 1 | 2) => {
    const tabs = paneId === 1 ? openedFiles : openedFiles2;
    const selFile = paneId === 1 ? selectedFile : selectedFile2;
    
    if (tabs.length === 0) return (
       <View style={[s.tabBar, activePane === paneId && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
         <Text style={{color: colors.textMuted, fontSize: 12, paddingHorizontal: 12}}>No file opened</Text>
       </View>
    );

    return (
      <View style={[s.tabBar, activePane === paneId && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
          {tabs.map(file => {
             const isActive = file === selFile;
             const tabContent = (
                  <Pressable 
                    style={[s.tabItem, isActive && s.tabItemActive]}
                    onPress={() => {
                      setActivePane(paneId);
                      handleSelectFile(file, paneId);
                    }} 
                  >
                    <Text selectable={false} style={[s.tabText, isActive && s.tabTextActive]}>{file}</Text>
                    <Pressable 
                       onPress={(e) => { 
                         if (Platform.OS === 'web') e.preventDefault();
                         e.stopPropagation(); 
                         closeTab(file, paneId); 
                       }} 
                       style={s.tabCloseBtn}
                     >
                      <Text selectable={false} style={s.tabCloseText}>✕</Text>
                    </Pressable>
                  </Pressable>
             );

             if (Platform.OS === 'web') {
               return (
                 <div 
                   key={file} 
                   draggable="true"
                   onDragStart={(e: any) => {
                     if (e.dataTransfer) {
                       e.dataTransfer.effectAllowed = "move";
                       e.dataTransfer.setData("text/plain", file);
                     }
                     setDraggingTab({ file, sourcePane: paneId });
                   }}
                   onDragEnd={() => {
                     setDraggingTab(null);
                     setIsDragOverRight(false);
                   }}
                   style={{ display: 'flex', flexDirection: 'row', userSelect: 'none', WebkitUserSelect: 'none', cursor: 'grab' } as any}
                 >
                   {tabContent}
                 </div>
               );
             }

             return (
               <View key={file} style={{ flexDirection: 'row' }}>
                 {tabContent}
               </View>
             );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderFileSystem = (items: any[], depth = 0, parentPath = ''): any => {
    const list = items.map((item) => {
      const isSelected = selectedFile === item.path || selectedFile2 === item.path;
      const isExpanded = !!expandedFolders[item.path];
      const isImage = /\.(png|jpe?g|gif|webp)$/i.test(item.name);
      const isDoc = /\.(md|txt)$/i.test(item.name);

      if (item.kind === 'directory') {
        return (
          <View key={item.path}>
            <Pressable 
              onPress={() => {
                toggleFolder(item.path);
                setSelectedDirPath(item.path);
              }}
              {...({
                onContextMenu: (e: any) => {
                  if (Platform.OS === 'web') {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, visible: true, item });
                  }
                },
                onMouseEnter: () => setHoveredItemPath(item.path),
                onMouseLeave: () => setHoveredItemPath(null),
              } as any)}
              style={{ 
                paddingLeft: 12 + depth * 12, 
                paddingVertical: 6, 
                paddingRight: 12,
                flexDirection: 'row', 
                alignItems: 'center',
                backgroundColor: hoveredItemPath === item.path ? (isDark ? '#2D3748' : '#F3F4F6') : 'transparent'
              }}
            >
              <Ionicons 
                name={isExpanded ? "chevron-down" : "chevron-forward"} 
                size={14} 
                color={colors.textMuted} 
                style={{ marginRight: 4 }}
              />
              <Text style={{ fontSize: 13, color: colors.text, fontWeight: '500', flex: 1 }}>📁 {item.name}</Text>
              
              {hoveredItemPath === item.path && (
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Pressable onPress={(e) => { e.stopPropagation(); setCreatingItem({ parentPath: item.path, kind: 'file' }); setCreationName(''); }}>
                    <Ionicons name="document-outline" size={14} color={colors.primary} />
                  </Pressable>
                  <Pressable onPress={(e) => { e.stopPropagation(); setCreatingItem({ parentPath: item.path, kind: 'directory' }); setCreationName(''); }}>
                    <Ionicons name="folder-outline" size={14} color={colors.primary} />
                  </Pressable>
                </View>
              )}
            </Pressable>
            {isExpanded && item.children && renderFileSystem(item.children, depth + 1, item.path)}
          </View>
        );
      }

      return (
        <Pressable 
          key={item.path} 
          onPress={() => handleSelectFile(item.path)}
          {...({
            onContextMenu: (e: any) => {
              if (Platform.OS === 'web') {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, visible: true, item });
              }
            }
          } as any)}
        >
          <View style={[
            { paddingLeft: 30 + depth * 12, paddingVertical: 6, paddingRight: 12, flexDirection: 'row', alignItems: 'center' },
            isSelected && { backgroundColor: isDark ? '#2D3748' : '#EFF6FF', borderLeftWidth: 3, borderLeftColor: colors.primary, paddingLeft: 27 + depth * 12 }
          ]}>
            <Text 
              numberOfLines={1} 
              style={[
                { fontSize: 13, color: isDoc ? colors.text : colors.textMuted, flex: 1 },
                isSelected && { fontWeight: 'bold', color: colors.primary }
              ]}
            >
              {isImage ? '🖼️' : '📄'} {item.name}
            </Text>
          </View>
        </Pressable>
      );
    });

    if (creatingItem && creatingItem.parentPath === parentPath) {
      list.push(
        <View key="creation-input" style={{ paddingLeft: 30 + depth * 12, paddingVertical: 4, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 13, marginRight: 4 }}>{creatingItem.kind === 'directory' ? '📁' : '📄'}</Text>
          <div style={{ flex: 1 }}>
            <input
              autoFocus
              value={creationName}
              onChange={(e) => setCreationName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreation();
                if (e.key === 'Escape') setCreatingItem(null);
              }}
              onBlur={() => {
                if (!creationName) setCreatingItem(null);
              }}
              style={{
                width: '90%',
                padding: '2px 6px',
                fontSize: '13px',
                border: `1px solid ${colors.primary}`,
                backgroundColor: isDark ? '#1a1a1a' : '#fff',
                color: isDark ? '#fff' : '#000',
                outline: 'none',
                borderRadius: '3px'
              }}
            />
          </div>
        </View>
      );
    }
    return list;
  };

  const ImageViewer = ({ uri, name }: { uri: string, name: string }) => {
    const [zoom, setZoom] = useState(1);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: any) => {
      e.preventDefault();
      setIsDragging(true);
      setStartPos({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    };

    const handleMouseMove = (e: any) => {
      if (!isDragging) return;
      setPos({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleReset = () => {
      setZoom(1);
      setPos({ x: 0, y: 0 });
    };
    
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0' }}>
        {/* Toolbar */}
        <View style={{ 
          flexDirection: 'row', 
          backgroundColor: colors.background, 
          padding: 8, 
          borderBottomWidth: 1, 
          borderBottomColor: colors.border,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          zIndex: 10
        }}>
          <Pressable onPress={() => setZoom(prev => Math.max(0.1, prev - 0.2))} style={{ padding: 4 }}>
            <Ionicons name="remove-circle-outline" size={24} color={colors.primary} />
          </Pressable>
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: 'bold', minWidth: 50, textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </Text>
          <Pressable onPress={() => setZoom(prev => Math.min(10, prev + 0.5))} style={{ padding: 4 }}>
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          </Pressable>
          <Pressable onPress={handleReset} style={{ padding: 4, marginLeft: 8 }}>
            <Ionicons name="refresh-outline" size={20} color={colors.textMuted} />
          </Pressable>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: 12 }}>
            (마우스 드래그로 이동 가능)
          </Text>
        </View>

        {/* Image Container */}
        <div 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ 
            flex: 1, 
            overflow: 'hidden', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            cursor: isDragging ? 'grabbing' : (zoom > 1 ? 'grab' : 'default'),
            position: 'relative'
          }}
        >
          <div style={{ 
            backgroundColor: colors.background, 
            padding: 20, 
            borderRadius: 12, 
            boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 12, fontFamily: fontFamilyCode }}>{name}</Text>
            <img 
              src={uri} 
              alt={name} 
              draggable="false"
              style={{ 
                maxWidth: 'none', 
                maxHeight: '80vh', 
                border: `1px solid ${colors.border}`, 
                borderRadius: 4,
                userSelect: 'none'
              }} 
            />
          </div>
        </div>
      </View>
    );
  };

  return (
    <View style={[s.container, { userSelect: isResizing ? 'none' : 'auto' } as any]}>
      {/* HEADER */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.logoText}>Mark Explorer</Text>
          <Text style={s.headerTitle}>~/Documents/toy-projects/markdown-explorer</Text>
          <Pressable onPress={copyAbsolutePath} style={{ padding: 4, marginHorizontal: 4 }}><Text style={s.actionIcon}>@</Text></Pressable>
          <Pressable onPress={copyRelativePath} style={{ padding: 4, marginHorizontal: 4 }}>
            <Ionicons name="copy-outline" size={18} color={colors.primary} />
          </Pressable>
          <Pressable onPress={toggleTheme}>
            <Text style={s.themeBtnText}>
              {currentScheme === 'dark' ? '모드: Dark' : '모드: Light'}
            </Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row' }}>
            <Pressable onPress={() => setActiveTab('files')}><Text style={[s.actionIcon, activeTab === 'files' && {color: colors.text, fontWeight: 'bold'}]}>Files</Text></Pressable>
            <Pressable onPress={() => setActiveTab('editor')}><Text style={[s.actionIcon, activeTab === 'editor' && {color: colors.text, fontWeight: 'bold'}]}>Editor</Text></Pressable>
        </View>
      </View>

      {/* BODY */}
      <View style={s.body}>
        {/* PANE 1: Directory List (Explorer 1) */}
        <View style={[s.paneLeft, { width: leftPaneWidth }]}>
          <View style={s.paneHeader}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={s.paneTitle}>Explorer</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {selectedFolder && (
                  <>
                    <Pressable onPress={() => { setCreatingItem({ parentPath: '', kind: 'file' }); setCreationName(''); }}>
                      <Ionicons name="document-outline" size={18} color={colors.primary} />
                    </Pressable>
                    <Pressable onPress={() => { setCreatingItem({ parentPath: '', kind: 'directory' }); setCreationName(''); }}>
                      <Ionicons name="folder-outline" size={18} color={colors.primary} />
                    </Pressable>
                  </>
                )}
                {Platform.OS === 'web' && (
                  <Pressable onPress={handleOpenDirectory}>
                    <Text style={{color: colors.primary, fontSize: 12, fontWeight: 'bold'}}>열기</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
          <ScrollView>
            {selectedFolder ? (
              <View style={{ paddingVertical: 8 }}>
                <View style={{ paddingHorizontal: 12, paddingVertical: 4, flexDirection: 'row', alignItems: 'center' }}>
                  <Pressable onPress={() => setSelectedDirPath('')}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.primary }}>📁 {selectedFolder}</Text>
                  </Pressable>
                </View>
                {renderFileSystem(fileSystemData)}
              </View>
            ) : (
              <View style={{ padding: 24 }}>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 12 }}>작업하실 로컬 폴더를 열어주세요.</Text>
                <Pressable onPress={handleOpenDirectory} style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 6, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>로컬 폴더 열기</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>

        <View
          {...leftPaneResponder.panHandlers}
          style={{ width: 14, marginLeft: -7, marginRight: -7, backgroundColor: 'transparent', cursor: 'col-resize', zIndex: 10 } as any}
        />

        {activeTab === 'files' ? (
          <>
            {/* PANE 2: File List (Explorer 2) */}
            <View style={[s.paneMiddle, { width: middlePaneWidth }]}>
              <View style={s.paneHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {selectedDirPath ? (
                    <Pressable onPress={() => {
                      const parts = selectedDirPath.split('/');
                      parts.pop();
                      setSelectedDirPath(parts.join('/'));
                    }} style={{ marginRight: 8 }}>
                      <Ionicons name="arrow-back" size={16} color={colors.primary} />
                    </Pressable>
                  ) : null}
                  <Text style={s.paneTitle}>{selectedDirPath || selectedFolder || 'No Folder Selected'}</Text>
                </View>
              </View>
              <ScrollView>
                {selectedFolder ? (
                  (() => {
                    let itemsToShow = fileSystemData;
                    if (selectedDirPath) {
                      const findItems = (data: any[], path: string): any[] => {
                        for (const item of data) {
                          if (item.path === path) return item.children || [];
                          if (item.children) {
                            const found = findItems(item.children, path);
                            if (found.length > 0 || (item.path === path)) return found;
                          }
                        }
                        return [];
                      };
                      itemsToShow = findItems(fileSystemData, selectedDirPath);
                    }

                    if (itemsToShow.length === 0) {
                      return <View style={{ padding: 24 }}><Text style={{ color: colors.textMuted }}>이 폴더는 비어 있습니다.</Text></View>;
                    }

                    return itemsToShow.map(item => (
                      <Pressable 
                        key={item.path} 
                        onPress={async () => {
                          if (item.kind === 'directory') {
                            await loadDirectory(item.path);
                            setSelectedDirPath(item.path);
                            setExpandedFolders(prev => ({ ...prev, [item.path]: true }));
                          } else {
                            handleSelectFile(item.path);
                          }
                        }}
                        {...({
                          onContextMenu: (e: any) => {
                            if (Platform.OS === 'web') {
                              e.preventDefault();
                              setContextMenu({ x: e.clientX, y: e.clientY, visible: true, item });
                            }
                          },
                          onMouseEnter: () => setHoveredItemPath(item.path),
                          onMouseLeave: () => setHoveredItemPath(null),
                        } as any)}
                      >
                        <View style={[
                          s.listItem, 
                          (selectedFile === item.path || selectedFile2 === item.path) && s.listItemSelected,
                          { position: 'relative', overflow: 'hidden' }
                        ]}>
                          <Text style={[s.listItemText, (selectedFile === item.path || selectedFile2 === item.path) && {fontWeight: 'bold' }]}>
                            {item.kind === 'directory' ? '📁' : (/\.(png|jpe?g|gif|webp)$/i.test(item.name) ? '🖼️' : '📄')} {item.name}
                          </Text>
                          
                          {hoveredItemPath === item.path && (
                            <View style={{ position: 'absolute', right: 8, top: 0, bottom: 0, flexDirection: 'row', alignItems: 'center' }}>
                              <Pressable 
                                onPress={(e) => {
                                  e.stopPropagation();
                                  setRenamingItem(item);
                                  setNewName(item.name);
                                }}
                                style={{ padding: 6 }}
                              >
                                <Ionicons name="pencil-outline" size={16} color={colors.primary} />
                              </Pressable>
                              <Pressable 
                                onPress={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFileSystem(item);
                                }}
                                style={{ padding: 6 }}
                              >
                                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                              </Pressable>
                            </View>
                          )}
                        </View>
                      </Pressable>
                    ));
                  })()
                ) : (
                  <View style={{ padding: 24 }}><Text style={{ color: colors.textMuted }}>폴더를 열어야 보입니다.</Text></View>
                )}
              </ScrollView>
            </View>

            <View
              {...middlePaneResponder.panHandlers}
              style={{ width: 14, marginLeft: -7, marginRight: -7, backgroundColor: 'transparent', cursor: 'col-resize', zIndex: 10 } as any}
            />

            {/* PANE 3: Preview */}
            <View style={s.paneRight}>
              {renderTabBar(1)}
              <View style={s.paneHeader}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={s.paneTitle}>Preview (Read-Only)</Text>
                  <Pressable 
                    onPress={() => setActiveTab('editor')}
                    style={{
                      backgroundColor: colors.primary,
                      paddingVertical: 6,
                      paddingHorizontal: 16,
                      borderRadius: 6,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <Ionicons name="create-outline" size={14} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={{color: '#FFF', fontSize: 13, fontWeight: 'bold'}}>에디터 모드로 열기 (Split View)</Text>
                  </Pressable>
                </View>
              </View>
              <ScrollView style={{ flex: 1 }}>
                {/\.(png|jpe?g|gif|webp)$/i.test(selectedFile) ? (
                  <ImageViewer uri={localFiles[selectedFile]} name={selectedFile} />
                ) : (
                  <Preview content={localFiles[selectedFile] || ''} isDark={isDark} />
                )}
              </ScrollView>
            </View>
          </>
        ) : (
          /* PANE 2: WYSIWYG Editor Mode */
          <View style={{ flex: 1 }}>
             <View style={[{borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: isDark ? '#1E1E1E' : '#F9FAFB', height: 40, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12}]}>
                <Text style={s.paneTitle}>WYSIWYG 에디터</Text>
                <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' }}>
                  <Pressable 
                    onPress={() => {
                      setIsSplitMode(!isSplitMode);
                      if (!isSplitMode) {
                        setOpenedFiles2(openedFiles.length > 0 ? [...openedFiles] : []);
                        setSelectedFile2(selectedFile);
                        setEditorContent2(editorContent);
                      }
                    }}
                    style={{ marginRight: 16, flexDirection: 'row', alignItems: 'center' }}
                  >
                     <Ionicons name="browsers-outline" size={16} color={isSplitMode ? colors.primary : colors.textMuted} style={{ marginRight: 4 }} />
                     <Text style={{color: isSplitMode ? colors.primary : colors.textMuted, fontSize: 13, fontWeight: 'bold'}}>
                       {isSplitMode ? '화면분할 끄기' : '화면분할'}
                     </Text>
                  </Pressable>
                  <Pressable 
                    onPress={async () => {
                      const curFile = activePane === 1 ? selectedFile : selectedFile2;
                      const curContent = activePane === 1 ? editorContent : editorContent2;
                      if (!curFile) return;

                      setLocalFiles(prev => ({ ...prev, [curFile]: curContent }));
                      const saved = await handleSaveToDisk(curContent);
                      if (saved) {
                        if (Platform.OS === 'web') window.alert(`${curFile} 파일이 로컬 디스크에 완전히 저장되었습니다.`);
                      } else {
                        if (Platform.OS === 'web') window.alert(`${curFile} 에디터 내용이 임시 저장되었습니다 (디스크 쓰기 실패).`);
                        else Alert.alert('저장됨', `${curFile} 에디터 내용이 임시 저장되었습니다.`);
                      }
                    }} 
                    style={{ marginRight: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Ionicons name="save-outline" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={{color: colors.primary, fontSize: 13, fontWeight: 'bold'}}>현재 창 저장 (Cmd+S)</Text>
                  </Pressable>
                  <Pressable onPress={() => setActiveTab('files')}>
                    <Text style={{color: colors.textMuted, fontSize: 13, fontWeight: 'bold'}}>닫기 (탐색기로 돌아가기)</Text>
                  </Pressable>
                </View>
             </View>
             <View style={{ flex: 1, flexDirection: 'row' }}>
               
               {/* Editor Pane 1 */}
               <View 
                 style={{ flex: 1, borderRightWidth: isSplitMode ? 1 : 0, borderRightColor: colors.border, position: 'relative' }} 
                 onTouchStart={() => setActivePane(1)} 
                 {...({ onClick: () => setActivePane(1) } as any)}
               >
                 {renderTabBar(1)}
                 {Platform.OS === 'web' && isSplitMode && draggingTab && draggingTab.sourcePane === 2 && (
                   <div
                     onDragOver={(e: any) => { 
                       e.preventDefault(); 
                       if (e.dataTransfer) e.dataTransfer.dropEffect = "move"; 
                     }}
                     onDrop={(e: any) => {
                       e.preventDefault();
                       const file = draggingTab?.file;
                       setDraggingTab(null);
                       if (file) {
                         closeTab(file, 2);
                         handleSelectFile(file, 1);
                       }
                     }}
                     style={{ 
                       position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                       zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' 
                     }}
                   >
                     <Text style={{color: colors.primary, fontWeight: 'bold'}}>이곳으로 이동</Text>
                   </div>
                 )}
                  {selectedFile ? (
                    /\.(png|jpe?g|gif|webp)$/i.test(selectedFile) ? (
                      <ImageViewer uri={localFiles[selectedFile]} name={selectedFile} />
                    ) : (
                      <Editor
                        key={'pane1-' + selectedFile}
                        value={editorContent} 
                        onChange={setEditorContent} 
                        onSave={async (val: string) => {
                          setEditorContent(val);
                          setLocalFiles(prev => ({ ...prev, [selectedFile]: val }));
                          const saved = await handleSaveToDisk(val, selectedFile);
                          if (saved && Platform.OS === 'web') window.alert('성공적으로 저장되었습니다.');
                        }} 
                        isDark={isDark}
                        resolveImage={resolveImage}
                        onPasteImage={handlePasteImage}
                        onRenameImage={handleRenameImage}
                      />
                    )
                  ) : (
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><Text style={{color: colors.textMuted}}>파일을 선택해주세요.</Text></View>
                  )}
                </View>

                {/* Editor Pane 2 */}
                {isSplitMode && (
                  <View 
                    style={{ flex: 1, position: 'relative', backgroundColor: isDragOverRight ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)') : 'transparent' }} 
                    onTouchStart={() => setActivePane(2)} 
                    {...({ onClick: () => setActivePane(2) } as any)}
                  >
                    {renderTabBar(2)}
                    {Platform.OS === 'web' && isSplitMode && draggingTab && draggingTab.sourcePane === 1 && (
                      <div
                        onDragOver={(e: any) => { 
                          e.preventDefault(); 
                          setIsDragOverRight(true); 
                          if (e.dataTransfer) e.dataTransfer.dropEffect = "move"; 
                        }}
                        onDragLeave={() => setIsDragOverRight(false)}
                        onDrop={(e: any) => {
                          e.preventDefault();
                          setIsDragOverRight(false);
                          const file = draggingTab?.file;
                          setDraggingTab(null);
                          if (file) {
                            closeTab(file, 1);
                            handleSelectFile(file, 2);
                          }
                        }}
                        style={{ 
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                          zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' 
                        }}
                      >
                        <Text style={{color: colors.primary, fontWeight: 'bold'}}>이곳으로 이동</Text>
                      </div>
                    )}
                    {selectedFile2 ? (
                      /\.(png|jpe?g|gif|webp)$/i.test(selectedFile2) ? (
                        <ImageViewer uri={localFiles[selectedFile2]} name={selectedFile2} />
                      ) : (
                        <Editor
                          key={'pane2-' + selectedFile2}
                          value={editorContent2} 
                          onChange={setEditorContent2} 
                          onSave={async (val: string) => {
                            setEditorContent2(val);
                            setLocalFiles(prev => ({ ...prev, [selectedFile2]: val }));
                            const saved = await handleSaveToDisk(val, selectedFile2);
                            if (saved && Platform.OS === 'web') window.alert('성공적으로 저장되었습니다.');
                          }} 
                          isDark={isDark}
                          resolveImage={resolveImage}
                          onPasteImage={handlePasteImage}
                          onRenameImage={handleRenameImage}
                        />
                      )
                    ) : (
                      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><Text style={{color: colors.textMuted}}>파일을 선택해주세요.</Text></View>
                    )}
                  </View>
                )}

               {/* Split Mode Drop Zone (When not split, overlay on right side) */}
               {!isSplitMode && draggingTab && draggingTab.sourcePane === 1 && (
                 Platform.OS === 'web' ? (
                   <div 
                     onDragOver={(e: any) => { 
                       e.preventDefault(); 
                       setIsDragOverRight(true); 
                       if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
                     }}
                     onDragLeave={() => setIsDragOverRight(false)}
                     onDrop={(e: any) => {
                       e.preventDefault();
                       setIsDragOverRight(false);
                       const file = draggingTab?.file;
                       setDraggingTab(null);
                       setIsSplitMode(true);
                       if (file) {
                         closeTab(file, 1);
                         handleSelectFile(file, 2);
                       }
                     }}
                     style={{
                       position: 'absolute',
                       right: 0, top: 0, bottom: 0, width: '50%',
                       backgroundColor: isDragOverRight ? (isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)') : 'transparent',
                       borderLeft: `2px dashed ${colors.primary}`,
                       zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center'
                     }}
                   >
                     <Text style={{color: colors.primary, fontWeight: 'bold', fontSize: 16}}>이곳에 드롭하여 화면 분할</Text>
                   </div>
                 ) : null
               )}

               <View
                 {...tocPaneResponder.panHandlers}
                 style={{ width: 14, marginLeft: -7, marginRight: -7, backgroundColor: 'transparent', cursor: 'col-resize', zIndex: 10 } as any}
               />

               <View style={[s.paneTOC, { width: tocPaneWidth }]}>
                 <View style={[s.paneHeader, { borderBottomWidth: 1, borderBottomColor: colors.border }]}><Text style={s.paneTitle}>목차 (TOC)</Text></View>
                 <ScrollView style={{ flex: 1 }}>
                   {tocList.length === 0 ? (
                     <View style={{ padding: 16 }}>
                       <Text style={{ color: colors.textMuted, fontSize: 12 }}>작성된 헤딩(제목)이 없습니다.</Text>
                     </View>
                   ) : (
                     tocList.map((item, index) => (
                       <Pressable key={item.id} onPress={() => handleTOCClick(item.text, index)}>
                         <View style={{ 
                           paddingVertical: 8, 
                           paddingRight: 12,
                           paddingLeft: 12 + (item.level - 1) * 12,
                           borderBottomWidth: 1, 
                           borderBottomColor: isDark ? '#374151' : '#F3F4F6',
                           cursor: 'pointer'
                         } as any}>
                           <Text 
                             numberOfLines={1} 
                             style={{ 
                               color: item.level === 1 ? colors.text : colors.textMuted, 
                               fontSize: item.level <= 2 ? 13 : 12,
                               fontWeight: item.level <= 2 ? 'bold' : 'normal',
                               fontFamily: 'Inter, sans-serif'
                             }}>
                             {item.text}
                           </Text>
                         </View>
                       </Pressable>
                     ))
                   )}
                 </ScrollView>
               </View>
             </View>
          </View>
        )}
      </View>

      {/* FOOTER */}
      <View style={s.footer}>
        <GeminiChat 
          isDark={isDark} 
          apiKey={geminiApiKey}
          accessToken={googleAccessToken}
          currentContent={activePane === 1 ? editorContent : editorContent2}
          onOpenSettings={() => setShowGeminiSettings(true)}
        />
        
        <View style={s.footerPath}>
          <Text style={s.footerPathText}>/Users/alpha300uk/Documents/.../{selectedFolder}/{selectedFile}</Text>
        </View>
      </View>
      {/* Context Menu Overlay */}
      {contextMenu.visible && (
        <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={() => setContextMenu({ ...contextMenu, visible: false })}
        >
          <View style={{
            position: 'absolute',
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: colors.surface,
            borderRadius: 8,
            paddingVertical: 6,
            minWidth: 160,
            borderWidth: 1,
            borderColor: colors.border,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999
          }}>
            {contextMenu.item?.kind === 'directory' && (
              <>
                <Pressable 
                  onPress={() => {
                    setContextMenu({ ...contextMenu, visible: false });
                    setCreatingItem({ parentPath: contextMenu.item.path, kind: 'file' });
                    setCreationName('');
                    setExpandedFolders(prev => ({ ...prev, [contextMenu.item.path]: true }));
                  }}
                  style={({ hovered }: any) => [
                    { paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' },
                    hovered && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }
                  ]}
                >
                  <Ionicons name="document-outline" size={16} color={colors.text} style={{ marginRight: 10 }} />
                  <Text style={{ color: colors.text, fontSize: 13 }}>새 파일</Text>
                </Pressable>
                <Pressable 
                  onPress={() => {
                    setContextMenu({ ...contextMenu, visible: false });
                    setCreatingItem({ parentPath: contextMenu.item.path, kind: 'directory' });
                    setCreationName('');
                    setExpandedFolders(prev => ({ ...prev, [contextMenu.item.path]: true }));
                  }}
                  style={({ hovered }: any) => [
                    { paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' },
                    hovered && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }
                  ]}
                >
                  <Ionicons name="folder-outline" size={16} color={colors.text} style={{ marginRight: 10 }} />
                  <Text style={{ color: colors.text, fontSize: 13 }}>새 폴더</Text>
                </Pressable>
                <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
              </>
            )}
            <Pressable 
              onPress={() => {
                setContextMenu({ ...contextMenu, visible: false });
                setRenamingItem(contextMenu.item);
                setNewName(contextMenu.item.name);
              }}
              style={({ hovered }: any) => [
                { paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' },
                hovered && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }
              ]}
            >
              <Ionicons name="pencil-outline" size={16} color={colors.text} style={{ marginRight: 10 }} />
              <Text style={{ color: colors.text, fontSize: 13 }}>이름 바꾸기</Text>
            </Pressable>
            <Pressable 
              onPress={() => {
                setContextMenu({ ...contextMenu, visible: false });
                handleDeleteFileSystem(contextMenu.item);
              }}
              style={({ hovered }: any) => [
                { paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' },
                hovered && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }
              ]}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" style={{ marginRight: 10 }} />
              <Text style={{ color: "#EF4444", fontSize: 13 }}>삭제</Text>
            </Pressable>
          </View>
        </Pressable>
      )}

      {/* Rename Modal */}
      {renamingItem && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }]}>
          <View style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 12, width: 400, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>이름 바꾸기</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>새 이름을 입력해주세요:</Text>
            <div style={{ marginBottom: 24 }}>
              <input 
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameFileSystem();
                  if (e.key === 'Escape') setRenamingItem(null);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: isDark ? '#1a1a1a' : '#fff',
                  color: isDark ? '#fff' : '#000',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <Pressable onPress={() => setRenamingItem(null)} style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
                <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>취소</Text>
              </Pressable>
              <Pressable onPress={handleRenameFileSystem} style={{ backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 6 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Gemini Settings Modal */}
      {showGeminiSettings && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }]}>
          <View style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 12, width: 450, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="sparkles" size={20} color={colors.primary} style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>인공지능(Gemini) 설정</Text>
            </View>

            <ScrollView style={{ maxHeight: 500 }}>
              <View style={{ marginBottom: 20, padding: 12, backgroundColor: isDark ? '#121212' : '#F3F4F6', borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontSize: 13, color: colors.text, fontWeight: 'bold', marginBottom: 4 }}>방법 1: API Key 방식 (추천)</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 10 }}>가장 빠르고 간편합니다. [Google AI Studio](https://aistudio.google.com/)에서 발급받으세요.</Text>
                <input 
                  placeholder="AIzaSy..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: isDark ? '#1a1a1a' : '#fff',
                    color: isDark ? '#fff' : '#000',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
              </View>

              <View style={{ marginBottom: 20, padding: 12, backgroundColor: isDark ? '#121212' : '#F3F4F6', borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontSize: 13, color: colors.text, fontWeight: 'bold', marginBottom: 4 }}>방법 2: Google 로그인 방식</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 8 }}>유튜브, 드라이브 연동이 가능합니다. GCP에서 Web Client ID를 발급하여 등록하세요.</Text>
                
                <input 
                  placeholder="OAuth Client ID 입력..."
                  value={tempClientId}
                  onChange={(e) => setTempClientId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: isDark ? '#1a1a1a' : '#fff',
                    color: isDark ? '#fff' : '#000',
                    fontSize: '12px',
                    marginBottom: 10
                  }}
                />

                {googleAccessToken ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E1F5FE', padding: 8, borderRadius: 4 }}>
                    <Ionicons name="checkmark-circle" size={16} color="#0288D1" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#0288D1', fontSize: 12, fontWeight: 'bold', flex: 1 }}>로그인됨</Text>
                    <Pressable onPress={handleLogout}><Text style={{ color: '#EF4444', fontSize: 11 }}>로그아웃</Text></Pressable>
                  </View>
                ) : (
                  <Pressable 
                    disabled={!googleClientId && !tempClientId}
                    onPress={() => promptAsync()}
                    style={({ pressed }: any) => [
                      { backgroundColor: '#4285F4', padding: 10, borderRadius: 4, alignItems: 'center', opacity: (!googleClientId && !tempClientId) ? 0.5 : (pressed ? 0.8 : 1) }
                    ]}
                  >
                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>Google로 로그인</Text>
                  </Pressable>
                )}
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              <Pressable onPress={() => setShowGeminiSettings(false)} style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
                <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>취소</Text>
              </Pressable>
              <Pressable onPress={saveGeminiKey} style={{ backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 6 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>설정 저장</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
