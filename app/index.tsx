// Updated TOC Logic - 2026-04-20
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useColorScheme, Platform, Alert, PanResponder, useWindowDimensions, KeyboardAvoidingView, Modal, TextInput } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
const fsLegacy = (FileSystemLegacy as any).default || FileSystemLegacy;
const readAsStringAsync = fsLegacy.readAsStringAsync;
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

import Editor from '@/components/Editor';
import GeminiChat from '@/components/GeminiChat';
import MarkdownPreview from '@/components/preview/MarkdownPreview';
import { MobileToolbar } from '@/components/editor/MobileToolbar';

import { useGemini } from '@/hooks/useGemini';
import { usePaneResize } from '@/hooks/usePaneResize';
import { useFileSystem } from '@/hooks/useFileSystem';
import { useRecentFiles } from '@/hooks/useRecentFiles';
import { useChatHistory } from '@/hooks/useChatHistory';
import { ChatHistoryList } from '@/components/sidebar/ChatHistoryList';
import { FileExplorer } from '@/components/explorer/FileExplorer';
import { ImageViewer } from '@/components/preview/ImageViewer';
import { TOCPane } from '@/components/toc/TOCPane';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TabBar } from '@/components/layout/TabBar';
import { RenameModal } from '@/components/explorer/RenameModal';
import { EditorWorkspace } from '@/components/editor/EditorWorkspace';
import { Resizer } from '@/components/ui/Resizer';
import { Sidebar } from '@/components/layout/Sidebar';
import { NextraExportModal } from '@/components/exporter/nextra/NextraExportModal';
import { ContextMenu } from '@/components/explorer/ContextMenu';
import { AVAILABLE_MODELS } from '@/constants/Models';
import { getFileCache, setFileCache } from '@/utils/IndexedDBUtils';
import { handleTabSelection, pinTab, closeOthers, closeAll } from '@/utils/TabUtils';
import { findItemInTree } from '@/utils/FileSystemUtils';
import { YoutubeExtractorModal } from '@/components/editor/YoutubeExtractorModal';
import { ExpandedExtractionModal } from '@/components/exporter/youtube/ExpandedExtractionModal';
import { YoutubePlaylistItem, ExtractionOptions } from '@/utils/YoutubeUtils';
import { ExportMode } from '@/utils/PlaylistParserUtils';

WebBrowser.maybeCompleteAuthSession();

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { SettingsProvider, useAppSettings } from '@/contexts/SettingsContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { PluginProvider, usePlugins } from '@/contexts/PluginContext';
import { AppInstance } from '@/core/AppInstance';
import { QuickPicker } from '@/components/ui/QuickPicker';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { PluginsSidebar } from '@/components/sidebar/PluginsSidebar';

const appInstance = new AppInstance();

function MainScreen() {
  "use no-memo";
  const { themeMode, isDark, toggleTheme, colors, fontFamilyUI, fontFamilyCode } = useTheme();
  const s = React.useMemo(() => getStyles(colors), [colors]);
  const settings = useAppSettings();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  useEffect(() => {
    console.log(`[App] Window Dimensions: ${windowWidth}x${windowHeight}`);
  }, [windowWidth, windowHeight]);
  const isMobile = windowWidth < 768;
  const [isSidebarVisible, setIsSidebarVisible] = useState(!isMobile);

  const {
    leftPaneWidth,
    tocPaneWidth,
    middlePaneWidth,
    footerHeight,
    isResizing,
    leftPaneResponder,
    tocPaneResponder,
    middlePaneResponder,
    footerResponder,
  } = usePaneResize();

  const sidebarWidth = windowWidth * 0.85;
  
  // Reanimated Shared Values
  const svSidebar = useSharedValue(isSidebarVisible ? 0 : -sidebarWidth);
  const svTocSidebar = useSharedValue(windowWidth);
  const svScrim = useSharedValue(isSidebarVisible ? 1 : 0);
  const svWidth = useSharedValue(isSidebarVisible ? Number(leftPaneWidth) : 0);

  const lastScannedDirRef = useRef<any>(null);
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    isMounted.current = true;
    if (isMounted.current) {
      setSidebarViews(appInstance.views.getSidebarViews());
    }
    return () => { isMounted.current = false; };
  }, []);

  React.useEffect(() => {
    const targetSidebar = isSidebarVisible ? 0 : -sidebarWidth;
    const targetScrim = isSidebarVisible ? 1 : 0;
    const targetWidth = isSidebarVisible ? Number(leftPaneWidth) : 0;

    if (isResizing) {
      svWidth.value = targetWidth;
      svSidebar.value = targetSidebar;
      svScrim.value = targetScrim;
    } else {
      svSidebar.value = withTiming(targetSidebar, { duration: 250 });
      svScrim.value = withTiming(targetScrim, { duration: 250 });
      svWidth.value = withTiming(targetWidth, { duration: 250 });
    }
  }, [isSidebarVisible, leftPaneWidth, sidebarWidth, windowWidth, isResizing]);

  const animatedSidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: svSidebar.value }]
  }));

  const animatedScrimStyle = useAnimatedStyle(() => ({
    opacity: svScrim.value
  }));

  const animatedWidthStyle = useAnimatedStyle(() => ({
    width: svWidth.value
  }));

  const animatedTocStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: svTocSidebar.value }]
  }));

  const [isTocVisible, setIsTocVisible] = useState(false);
  const [isTocPinned, setIsTocPinned] = useState(false);
  const [isFileManagerVisible, setIsFileManagerVisible] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const toggleSidebar = (show: boolean) => {
    setIsSidebarVisible(show);
  };

  const toggleToc = (show: boolean) => {
    if (show) setIsTocVisible(true);
    svTocSidebar.value = withTiming(show ? windowWidth * 0.2 : windowWidth, { duration: 300 });
    if (!show) {
      setTimeout(() => {
        if (!show) setIsTocVisible(false);
      }, 300);
    }
  };

  const {
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
    saveToDisk: handleSaveToDiskInHook,
    updateFileSystemData,
    removeItemFromData,
    copyDirectoryRecursive,
    deleteItem,
    renameItem,
    createItem,
    pasteImage,
    resolveImage,
    handleRenameImage: handleRenameImageInHook,
    handleSaveChatToFile,
    moveItem,
  } = useFileSystem();
  
  const loadDirRecursiveRef = useRef<any>(null);
  loadDirRecursiveRef.current = loadDirectoryRecursive;

  
  const { recentFiles, addRecentFile } = useRecentFiles();
  
  useEffect(() => {
    if (fileSystemData.length > 0) {
      console.log('[App] fileSystemData updated:', JSON.stringify(fileSystemData.map(i => ({ name: i.name, kind: i.kind })), null, 2));
    }
  }, [fileSystemData]);

  // Keep active directory handles globally accessible for popup windows
  useEffect(() => {
    if (Platform.OS === 'web') {
      (window as any)._activeDirHandle = dirHandle;
      (window as any)._activeFileSystemData = fileSystemData;
      
      (window as any)._readWorkspaceFile = async (relativePath: string) => {
        if (!dirHandle) return null;
        try {
          const parts = relativePath.split('/');
          let current = dirHandle;
          for (let i = 0; i < parts.length - 1; i++) {
            current = await current.getDirectoryHandle(parts[i]);
          }
          const fileHandle = await current.getFileHandle(parts[parts.length - 1]);
          const file = await fileHandle.getFile();
          return await file.text();
        } catch (e) {
          console.error('[Parent-FS] Read failed:', relativePath, e);
          return null;
        }
      };

      (window as any)._writeWorkspaceFile = async (relativePath: string, content: string) => {
        if (!dirHandle) return false;
        try {
          const parts = relativePath.split('/');
          let current = dirHandle;
          for (let i = 0; i < parts.length - 1; i++) {
            current = await current.getDirectoryHandle(parts[i], { create: true });
          }
          const fileHandle = await current.getFileHandle(parts[parts.length - 1], { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(content);
          await writable.close();
          return true;
        } catch (e) {
          console.error('[Parent-FS] Write failed:', relativePath, e);
          return false;
        }
      };

      (window as any)._deleteWorkspaceFile = async (relativePath: string) => {
        if (!dirHandle) return false;
        try {
          const parts = relativePath.split('/');
          let current = dirHandle;
          for (let i = 0; i < parts.length - 1; i++) {
            current = await current.getDirectoryHandle(parts[i]);
          }
          await current.removeEntry(parts[parts.length - 1]);
          return true;
        } catch (e) {
          console.error('[Parent-FS] Delete failed:', relativePath, e);
          return false;
        }
      };
    }
  }, [dirHandle, fileSystemData]);

  const chatHistory = useChatHistory(
    dirHandle,
    settings.aiProvider,
    settings.selectedModel
  );

  const [editorContent, setEditorContent] = useState('# Markdown Explorer Project\n\n* This is a functional CodeMirror-based editor.\n* Typing here will be reflected in the Live Preview below.\n\nDoes it work well? 😊');
  const [activeTab, setActiveTab] = useState<'files' | 'editor'>('files');
  
  // Drag & Drop State
  const [draggingTab, setDraggingTab] = useState<{file: string, sourcePane: number} | null>(null);
  const [isDragOverRight, setIsDragOverRight] = useState(false);

  // Pane 2 State
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [activePane, setActivePane] = useState<1 | 2>(1);

  // Sync Pane 2 with Pane 1 in Split Mode for Live Preview
  useEffect(() => {
    if (isSplitMode && selectedFile && !selectedFile2) {
      setSelectedFile2(selectedFile);
      setEditorContent2(editorContent);
      if (!openedFiles2.includes(selectedFile)) {
        setOpenedFiles2([...openedFiles2, selectedFile]);
      }
    }
  }, [isSplitMode, selectedFile]);
  const [editorContent2, setEditorContent2] = useState('');
  
  // Context Menu & Hover State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, visible: boolean, item: any | null }>({ x: 0, y: 0, visible: false, item: null });
  const [hoveredItemPath, setHoveredItemPath] = useState<string | null>(null);
  const [renamingItem, setRenamingItem] = useState<any | null>(null);
  const [newName, setNewName] = useState('');

  // Tab Context Menu
  const [tabContextMenu, setTabContextMenu] = useState<{ x: number, y: number, visible: boolean, file: string, paneId: 1 | 2 } | null>(null);

  // Creation State
  const [creatingItem, setCreatingItem] = useState<{ parentPath: string, kind: 'file' | 'directory' } | null>(null);
  const [creationName, setCreationName] = useState('');
  const [activeHeadingIndex, setActiveHeadingIndex] = useState(-1);

  // Nextra Export State
  const [nextraExportModalVisible, setNextraExportModalVisible] = useState(false);
  const [nextraExportTarget, setNextraExportTarget] = useState<any | null>(null);

  // Preview File States
  const [previewFile1, setPreviewFile1] = useState<string | null>(null);
  const [previewFile2, setPreviewFile2] = useState<string | null>(null);

  const deferredContent = React.useDeferredValue(editorContent);
  const deferredContent2 = React.useDeferredValue(editorContent2);

  const previewRef1 = useRef(null);
  const previewRef2 = useRef(null);
  const editorRef1 = useRef(null);
  const editorRef2 = useRef(null);
  const [selection1, setSelection1] = useState({ start: 0, end: 0 });
  const [selection2, setSelection2] = useState({ start: 0, end: 0 });

  const { pluginManager } = usePlugins();
  const [templatePicker, setTemplatePicker] = useState<{ visible: boolean, items: any[] }>({ visible: false, items: [] });
  const [activeSidebarViewId, setActiveSidebarViewId] = useState('files');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean, message: string }>({ visible: false, message: '' });
  const [history, setHistory] = useState<{ content: string, file: string }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isFooterVisible, setIsFooterVisible] = React.useState(true);
  const svFooterHeight = useSharedValue(250);

  React.useEffect(() => {
    console.log(`[App] Animating footer height. Visible: ${isFooterVisible}`);
    svFooterHeight.value = withSpring(isFooterVisible ? 250 : 24, {
      damping: 15,
      stiffness: 100,
    });
  }, [isFooterVisible]);

  const toggleFooter = useCallback(() => {
    console.log(`[App] Toggle Footer from ${isFooterVisible} to ${!isFooterVisible}`);
    setIsFooterVisible(prev => !prev);
  }, [isFooterVisible]);
  const [sidebarViews, setSidebarViews] = useState<any[]>([]);
  const [lastSavedContent, setLastSavedContent] = useState<string>('');
  const [youtubeModalVisible, setYoutubeModalVisible] = useState(false);
  const [expandedYoutubeModalVisible, setExpandedYoutubeModalVisible] = useState(false);
  const [youtubeTargetDirectory, setYoutubeTargetDirectory] = useState<string | undefined>(undefined);

  const [fileSearchPickerVisible, setFileSearchPickerVisible] = useState(false);

  // Memoized searchable files list
  const allSearchableFiles = React.useMemo(() => {
    const list: { id: string; label: string; description: string; icon: string }[] = [];
    const collect = (items: any[]) => {
      for (const item of items) {
        if (item.kind === 'file') {
          const isImage = /\.(png|jpe?g|gif|webp)$/i.test(item.name);
          list.push({
            id: item.path,
            label: item.name,
            description: item.path,
            icon: isImage ? 'image-outline' : 'document-text-outline',
          });
        }
        if (item.children) {
          collect(item.children);
        }
      }
    };
    collect(fileSystemData);
    return list;
  }, [fileSystemData]);

  const handleYoutubeExtract = (items: YoutubePlaylistItem[], mode: string, options: ExtractionOptions & { listType?: string }) => {
    let markdown = '';
    const listType = options.listType || 'Numbered';
    
    items.forEach((item, index) => {
      let line = '';
      if (listType === 'Numbered') {
        line = `${index + 1}. `;
      } else if (listType === 'Bulleted') {
        line = `- `;
      }

      // Sanitize title for markdown links (especially for mx-video which might be sensitive)
      const sanitizedTitle = item.title.replace(/\[/g, '(').replace(/\]/g, ')');
      
      if (mode === 'Text') {
        line += `[${sanitizedTitle}](${item.url})`;
      } else if (mode === 'URL') {
        line += item.url;
      } else if (mode === 'Card') {
        line += `[mx-link#${sanitizedTitle}](${item.url})`;
      } else if (mode === 'Video') {
        line += `[mx-video#${sanitizedTitle}](${item.url})`;
      }

      const stats = [];
      if (options.showLikes && item.likeCount) stats.push(`👍 ${parseInt(item.likeCount).toLocaleString()}`);
      if (options.showViews && item.viewCount) stats.push(`👁️ ${parseInt(item.viewCount).toLocaleString()}`);
      
      if (stats.length > 0) {
        line += ` - ${stats.join(' | ')}`;
      }
      
      markdown += line + (listType === 'Plain' ? '\n\n' : '\n');
    });

    // Add trailing newlines to prevent the cursor from "touching" the last item
    // and keeping it in raw markdown mode.
    markdown += '\n\n';

    const activeEditor = activePane === 1 ? editorRef1.current : editorRef2.current;
    if (activeEditor) {
      (activeEditor as any).insertText(markdown);
    } else {
      // Fallback if ref is not available
      const setContent = activePane === 1 ? setEditorContent : setEditorContent2;
      const currentContent = activePane === 1 ? editorContent : editorContent2;
      const selection = activePane === 1 ? selection1 : selection2;
      
      const newContent = currentContent.substring(0, selection.start) + markdown + currentContent.substring(selection.end);
      setContent(newContent);
    }
    
    setYoutubeModalVisible(false);
  };

  const handleExpandedYoutubeExtract = async (
    url: string, 
    mode: ExportMode, 
    format: ExportFormat, 
    listType: ExportListType, 
    targetDirectory?: string,
    editedItems?: PlaylistItem[],
    editedTitle?: string
  ) => {
    let playlistTitle = editedTitle || "Youtube_Playlist";
    let items: PlaylistItem[] = editedItems || [];
    
    if (items.length === 0 && url) {
      // 1. Fetch playlist data (API) if no edited items provided
      const { fetchPlaylistItems, fetchPlaylistMetadata, extractPlaylistId } = await import('@/utils/YoutubeUtils');
      const playlistId = extractPlaylistId(url);
      
      if (playlistId) {
        const youtubeKey = settings.apiKeys.youtube;
        const metadata = await fetchPlaylistMetadata(playlistId, youtubeKey);
        if (metadata && metadata.title) {
          playlistTitle = metadata.title;
        }
        
        const response = await fetchPlaylistItems(playlistId, 50, false, youtubeKey);
        items = response.items.map(item => ({
          id: item.videoId,
          title: item.title,
          url: item.url,
          note: ''
        }));
      }
    }
    
    // Fallback if no items were found
    if (items.length === 0) {
      items = [
        { id: 'dQw4w9WgXcQ', title: 'Sample Video 1', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', note: 'First sample note generated automatically.' }
      ];
    }
    
    const { serializePlaylistToMarkdown } = await import('@/utils/PlaylistParserUtils');
    const markdown = serializePlaylistToMarkdown(items, mode, format, listType);
    
    if (targetDirectory !== undefined) {
      // D-1 mode: Create a new file in targetDirectory
      const safeTitle = playlistTitle.replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
      const now = new Date();
      const sequenceNum = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      const fileName = `${safeTitle}_${sequenceNum}.md`;
      const fullPath = targetDirectory === '' ? fileName : `${targetDirectory}/${fileName}`;
      
      // Register the new file in the FileSystem state first
      await createItem(targetDirectory, fileName, 'file');
      
      await handleSaveToDiskInHook(fullPath, markdown);
      appInstance.emit('vault:changed');
      handleSelectFile(fullPath, false, activePane); // Open the new file
    } else {
      // D-2 mode: Insert at cursor
      const activeEditor = activePane === 1 ? editorRef1.current : editorRef2.current;
      if (activeEditor) {
        (activeEditor as any).insertText(markdown + '\n\n');
      } else {
        const setContent = activePane === 1 ? setEditorContent : setEditorContent2;
        const currentContent = activePane === 1 ? editorContent : editorContent2;
        const selection = activePane === 1 ? selection1 : selection2;
        const newContent = currentContent.substring(0, selection.start) + markdown + '\n\n' + currentContent.substring(selection.end);
        setContent(newContent);
      }
    }
    setExpandedYoutubeModalVisible(false);
  };

  const stateRefs = useRef({
    fileSystemData,
    localFiles,
    selectedFile,
    selectedFile2,
    activePane,
    activeTab,
    openedFiles,
    openedFiles2,
    previewFile1,
    previewFile2,
    editorContent,
    editorContent2,
  });

  useEffect(() => {
    stateRefs.current = {
      fileSystemData,
      localFiles,
      selectedFile,
      selectedFile2,
      activePane,
      activeTab,
      openedFiles,
      openedFiles2,
      previewFile1,
      previewFile2,
      editorContent,
      editorContent2,
    };
  }, [fileSystemData, localFiles, selectedFile, selectedFile2, activePane, activeTab, openedFiles, openedFiles2, previewFile1, previewFile2, editorContent, editorContent2]);


  // ViewRegistry 변화 감지 (등록된 사이드바 뷰 목록 동기화)
  useEffect(() => {
    const updateViews = () => {
      setSidebarViews(appInstance.views.getSidebarViews());
    };
    updateViews();
    const timer = setInterval(updateViews, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stable Vault/Workspace for Plugins
  React.useLayoutEffect(() => {
    const vault = {
      read: async (path: string) => {
        const { localFiles, fileSystemData, dirHandle } = stateRefs.current;
        if (localFiles[path]) return localFiles[path];
        const findHandleRec = (items: any[], p: string): any => {
          for (const item of items) {
            if (item.path === p) return item.handle;
            if (item.children) {
              const h = findHandleRec(item.children, p);
              if (h) return h;
            }
          }
          return null;
        };
        let handle = findHandleRec(fileSystemData, path);
        if (!handle && dirHandle) {
          try {
            const parts = path.split('/').filter(Boolean);
            let current = dirHandle;
            for (let i = 0; i < parts.length - 1; i++) {
              current = await (current as any).getDirectoryHandle(parts[i]);
            }
            handle = await (current as any).getFileHandle(parts[parts.length - 1]);
          } catch (e) {}
        }
        if (handle) {
          try {
            if (Platform.OS === 'web') {
              const f = await (handle as any).getFile();
              return await f.text();
            } else {
              return await readAsStringAsync(handle);
            }
          } catch (e) {}
        }
      },
      readBinary: async (path: string) => {
        const { fileSystemData } = stateRefs.current;
        const findHandleRec = (items: any[], p: string): any => {
          for (const item of items) {
            if (item.path === p) return item.handle;
            if (item.children) {
              const h = findHandleRec(item.children, p);
              if (h) return h;
            }
          }
          return null;
        };
        let handle = findHandleRec(fileSystemData, path);
        if (handle) {
          try {
            const f = await (handle as any).getFile();
            const buffer = await f.arrayBuffer();
            return new Uint8Array(buffer);
          } catch (e) {}
        }
        throw new Error(`Binary file not found: ${path}`);
      },
      write: async (path: string, data: string) => {
        await handleSaveToDiskInHook(path, data);
        appInstance.emit('vault:changed');
      },
      exists: async (path: string) => {
        const { fileSystemData, dirHandle } = stateRefs.current;
        const findItemRec = (items: any[], p: string): boolean => {
          for (const item of items) {
            if (item.path === p) return true;
            if (item.children && findItemRec(item.children, p)) return true;
          }
          return false;
        };
        if (findItemRec(fileSystemData, path)) return true;
        if (dirHandle) {
          try {
            const parts = path.split('/').filter(Boolean);
            let current = dirHandle;
            for (let i = 0; i < parts.length - 1; i++) {
              current = await (current as any).getDirectoryHandle(parts[i]);
            }
            await (current as any).getFileHandle(parts[parts.length - 1]);
            return true;
          } catch (e) {}
        }
        return false;
      },
      delete: async (path: string) => {
        const { fileSystemData } = stateRefs.current;
        const findItem = (items: any[], p: string): any => {
          for (const item of items) {
            if (item.path === p) return item;
            if (item.children) {
              const it = findItem(item.children, p);
              if (it) return it;
            }
          }
          return null;
        };
        const item = findItem(fileSystemData, path);
        if (item) {
          const success = await deleteItem(item);
          if (success) appInstance.emit('vault:changed');
          return success;
        }
        return false;
      },
      getAllFiles: () => {
        const { fileSystemData } = stateRefs.current;
        const list: string[] = [];
        const collect = (items: any[]) => {
          for (const it of items) {
            if (it.kind === 'file') list.push(it.path);
            if (it.children) collect(it.children);
          }
        };
        collect(fileSystemData);
        return list;
      },
      listFiles: async (path: string) => {
        const { fileSystemData } = stateRefs.current;
        const findItems = (items: any[], p: string): any[] | null => {
          if (p === '' || p === '.') return items;
          const parts = p.split('/');
          let current = items;
          for (const part of parts) {
            const found = current.find(it => it.name === part);
            if (!found || !found.children) return null;
            current = found.children;
          }
          return current;
        };
        const items = findItems(fileSystemData, path);
        return items ? items.map(it => it.path) : [];
      },
      createFolder: async (path: string) => {
        const parts = path.split('/').filter(Boolean);
        let currentPath = '';
        for (const part of parts) {
          const nextPath = currentPath ? `${currentPath}/${part}` : part;
          if (!(await vault.exists(nextPath))) {
            await createItem(currentPath, part, 'directory');
          }
          currentPath = nextPath;
        }
        appInstance.emit('vault:changed');
      }
    };

    const workspace = {
      getActiveFile: () => stateRefs.current.activePane === 1 ? stateRefs.current.selectedFile : stateRefs.current.selectedFile2,
      openFile: async (path: string, options?: { leaf?: 'left' | 'right' | 'main' }) => {
        const pane = options?.leaf === 'right' ? 2 : 1;
        await handleSelectFile(path, false, pane as 1 | 2);
      },
      addSidebarView: (id: string, name: string, icon: string, component: any) => {
        appInstance.views.registerView({ id, name, icon, component });
        appInstance.views.addToSidebar(id);
        // Delay to avoid "state update on unmounted component"
        setTimeout(() => {
          if (isMounted.current) {
            setSidebarViews(appInstance.views.getSidebarViews());
          }
        }, 0);
      },
      removeSidebarView: (id: string) => {
        appInstance.views.removeFromSidebar(id);
        setTimeout(() => {
          if (isMounted.current) {
            setSidebarViews(appInstance.views.getSidebarViews());
          }
        }, 0);
      }
    };

    appInstance.setVault(vault);
    appInstance.setWorkspace(workspace);
  }, []);

  useEffect(() => {
    const onShowTemplatePicker = (templates: string[]) => {
      setTemplatePicker({
        visible: true,
        items: templates.map(t => ({
          id: t,
          label: t.split('/').pop() || t,
          description: t
        }))
      });
    };

    const onInsertText = (text: string) => {
      // Automatically switch to Editor tab if we are in Preview (Files) mode
      if (activeTab === 'files') {
        setActiveTab('editor');
      }

      const targetRef = activePane === 1 ? editorRef1 : editorRef2;
      if (targetRef.current && (targetRef.current as any).insertText) {
        (targetRef.current as any).insertText(text);
      } else {
        // Fallback for native or if ref not ready
        // PREPEND for better visibility when switching tabs
        if (activePane === 1) {
          setEditorContent(prev => text + "\n" + prev);
        } else {
          setEditorContent2(prev => text + "\n" + prev);
        }
      }
      
      console.log('[Editor] Text inserted successfully');
    };

    const onExecuteCommand = (e: any) => {
      const { id } = e.detail;
      appInstance.commands.executeCommand(id);
    };

    appInstance.on('templates:show-picker', onShowTemplatePicker);
    appInstance.on('editor:insert-text', onInsertText);
    
    if (Platform.OS === 'web') {
      window.addEventListener('command:execute', onExecuteCommand);
    }

    return () => {
      appInstance.off('templates:show-picker', onShowTemplatePicker);
      appInstance.off('editor:insert-text', onInsertText);
      if (Platform.OS === 'web') {
        window.removeEventListener('command:execute', onExecuteCommand);
      }
    };
  }, [activePane, activeTab]);

  // Register File Search Command
  useEffect(() => {
    appInstance.commands.addCommand({
      id: 'open-file-search',
      name: 'Search Files',
      callback: () => {
        setFileSearchPickerVisible(true);
      }
    });

    return () => {
      appInstance.commands.removeCommand('open-file-search');
    };
  }, []);

  // Trigger background scan when dirHandle changes
  useEffect(() => {
    if (!dirHandle) return;
    if (lastScannedDirRef.current === dirHandle) return;

    lastScannedDirRef.current = dirHandle;
    console.log('[App] dirHandle updated, starting background recursive scan...');
    const timer = setTimeout(async () => {
      try {
        if (loadDirRecursiveRef.current) {
          await loadDirRecursiveRef.current('');
        }
        console.log('[App] Background recursive scan complete.');
      } catch (e) {
        console.error('[App] Background scan failed', e);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [dirHandle]);

  // Global Keyboard Listener
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Use e.code ('KeyT') instead of e.key ('t') to support Mac Option key correctly
      if (e.altKey && e.code === 'KeyT') {
        e.preventDefault();
        console.log('[Shortcut] Option+T triggered');
        appInstance.commands.executeCommand('insert-template');
      }

      // Cmd + P or Ctrl + P for File Search
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyP') {
        e.preventDefault();
        console.log('[Shortcut] Cmd/Ctrl+P triggered');
        appInstance.commands.executeCommand('open-file-search');
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    
    // E2E Test Hook
    if (process.env.NODE_ENV === 'development') {
      (window as any).__E2E_HOOKS__ = {
        setFileSystemData: (data: any) => {
          setFileSystemData(data);
          setSelectedFolder('MOCK_REPO');
        },
        get fileSystemData() {
          return stateRefs.current.fileSystemData;
        },
        setDirHandle: (handle: any) => setDirHandle(handle),
        setLocalFiles: (files: any) => setLocalFiles(files),
        setExpandedFolders: (folders: any) => setExpandedFolders(folders),
        setSelectedFile: (file: string) => setSelectedFile(file),
        setEditorContent: (content: string) => setEditorContent(content),
        setEditorContent2: (content: string) => setEditorContent2(content),
        updateAPIKey: (type: any, key: string) => settings.updateAPIKey(type, key),
        appInstance,
        previewRef1,
        previewRef2,
        triggerTemplatePicker: (items: string[]) => {
          // Manually trigger the state update that normally happens via events
          setTemplatePicker({
            visible: true,
            items: items.map(t => ({
              id: t,
              label: t.split('/').pop() || t,
              description: t
            }))
          });
        },
        setGeminiApiKey: (key: string) => {
          settings.setGeminiApiKey(key);
        },
        triggerExpandedYoutubeModal: (path?: string) => {
          setYoutubeTargetDirectory(path || '');
          setExpandedYoutubeModalVisible(true);
        },
        triggerFileSearchPicker: () => {
          setFileSearchPickerVisible(true);
        },
        mockClipboard: () => {
          try {
            const Clipboard = require('expo-clipboard');
            Clipboard.setStringAsync = () => Promise.resolve();
          } catch (e) {}
        }
      };
      (window as any).previewRef1 = previewRef1;
      (window as any).previewRef2 = previewRef2;
    }

    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const id = 'global-web-styles';
      if (!document.getElementById(id)) {
        const style = document.createElement('style');
        style.id = id;
        style.innerHTML = `
          html, body, #root {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  const handleSelectFile = async (file: string, isPreview: boolean = false, targetPane: 1 | 2 = activePane) => {
    const isImage = /\.(png|jpe?g|gif|webp)$/i.test(file);
    let content = localFiles[file];
    
    if (content === undefined) {
      // Try to load content via vault implementation (which now has fallback)
      try {
        content = await appInstance.vault.read(file);
        if (content) {
            setLocalFiles(prev => ({ ...prev, [file]: content }));
            if (!isImage && Platform.OS === 'web') await setFileCache(file, content);
        }
      } catch (e) {
        // If image and not in localFiles, we might need a special handle
        if (isImage) {
          const findHandleRec = (items: any[], path: string): any => {
            for (const item of items) {
              if (item.path === path) return item.handle;
              if (item.children) {
                const h = findHandleRec(item.children, path);
                if (h) return h;
              }
            }
            return null;
          };
          let handle = findHandleRec(fileSystemData, file);
          if (!handle && dirHandle) {
             try {
                const parts = file.split('/').filter(Boolean);
                let current = dirHandle;
                for (let i = 0; i < parts.length - 1; i++) current = await current.getDirectoryHandle(parts[i]);
                handle = await current.getFileHandle(parts[parts.length - 1]);
             } catch(err) {}
          }
          if (handle) {
            if (Platform.OS === 'web') {
              const f = await handle.getFile();
              content = URL.createObjectURL(f);
            } else {
              content = handle;
            }
            setLocalFiles(prev => ({ ...prev, [file]: content }));
          }
        } else {
          content = '';
        }
      }
    }

    const actualTargetPane = isSplitMode ? targetPane : 1;

    if (actualTargetPane === 1) {
      if (file === selectedFile && !isPreview && !previewFile1) return;
      if (selectedFile && !/\.(png|jpe?g|gif|webp)$/i.test(selectedFile)) {
          setLocalFiles(prev => ({ ...prev, [selectedFile]: editorContent }));
      }
      
      const { newOpenedFiles, newPreviewFile } = handleTabSelection(openedFiles, previewFile1, file, !isPreview);
      setOpenedFiles(newOpenedFiles);
      setPreviewFile1(newPreviewFile);
      setSelectedFile(file);
      setEditorContent(content);
      setActivePane(1);
    } else {
      if (file === selectedFile2 && !isPreview && !previewFile2) return;
      if (selectedFile2 && !/\.(png|jpe?g|gif|webp)$/i.test(selectedFile2)) {
          setLocalFiles(prev => ({ ...prev, [selectedFile2]: editorContent2 }));
      }

      const { newOpenedFiles, newPreviewFile } = handleTabSelection(openedFiles2, previewFile2, file, !isPreview);
      setOpenedFiles2(newOpenedFiles);
      setPreviewFile2(newPreviewFile);
      setSelectedFile2(file);
      setEditorContent2(content);
      setActivePane(2);
    }
    
    // Add to recent files
    if (!isImage) {
      const fileName = file.split('/').pop() || file;
      addRecentFile(file, fileName);
    }
    
    // Reset active heading when switching files
    setActiveHeadingIndex(-1);

    // Reset history for the new file
    setHistory([]);
    setHistoryIndex(-1);
  };

  const handleDropTab = (fileFromDrop: string, _sourcePane: 1 | 2, targetPane: 1 | 2, targetIndex: number) => {
    const draggedFile = draggingTab ? draggingTab.file : fileFromDrop;
    const sourcePane = (draggingTab ? draggingTab.sourcePane : _sourcePane) || _sourcePane;
    
    if (!draggedFile) {
      setDraggingTab(null);
      return;
    }
    const actualFile = draggedFile.trim();
    
    if (sourcePane === targetPane) {
      // Reorder in same pane
      if (targetPane === 1) {
        setOpenedFiles(prev => {
          const filtered = prev.filter(f => f.trim() !== actualFile);
          const result = [...filtered];
          const insertAt = targetIndex >= result.length ? result.length : targetIndex;
          result.splice(insertAt, 0, actualFile);
          return result;
        });
        if (previewFile1 === actualFile) pinTabHandler(actualFile, 1);
      } else {
        setOpenedFiles2(prev => {
          const filtered = prev.filter(f => f.trim() !== actualFile);
          const result = [...filtered];
          const insertAt = targetIndex >= result.length ? result.length : targetIndex;
          result.splice(insertAt, 0, actualFile);
          return result;
        });
        if (previewFile2 === actualFile) pinTabHandler(actualFile, 2);
      }
    } else {
      // Move between panes
      if (sourcePane === 1 && targetPane === 2) {
        // Move 1 -> 2
        setOpenedFiles(prev => prev.filter(f => f.trim() !== actualFile));
        setOpenedFiles2(prev => {
          const filtered = prev.filter(f => f.trim() !== actualFile);
          const result = [...filtered];
          const insertAt = Math.min(targetIndex, result.length);
          result.splice(insertAt, 0, actualFile);
          return result;
        });
        
        // Use a small timeout to ensure openedFiles2 is updated before selection if needed,
        // but handleSelectFile already handles adding to openedFiles if missing.
        handleSelectFile(actualFile, false, 2);
        
        // Update selected file in source if it was moved
        if (selectedFile === actualFile) {
          setOpenedFiles(prev => {
            if (prev.length > 0) {
              const next = prev[prev.length - 1];
              setSelectedFile(next);
              setEditorContent(localFiles[next] || '');
            } else {
              setSelectedFile('');
              setEditorContent('');
            }
            return prev;
          });
        }
      } else if (sourcePane === 2 && targetPane === 1) {
        // Move 2 -> 1
        setOpenedFiles2(prev => prev.filter(f => f.trim() !== actualFile));
        setOpenedFiles(prev => {
          const filtered = prev.filter(f => f.trim() !== actualFile);
          const result = [...filtered];
          const insertAt = Math.min(targetIndex, result.length);
          result.splice(insertAt, 0, actualFile);
          return result;
        });
        
        handleSelectFile(actualFile, false, 1);
        
        if (selectedFile2 === actualFile) {
          setOpenedFiles2(prev => {
            if (prev.length > 0) {
              const next = prev[prev.length - 1];
              setSelectedFile2(next);
              setEditorContent2(localFiles[next] || '');
            } else {
              setSelectedFile2('');
              setEditorContent2('');
            }
            return prev;
          });
        }
      } else if (sourcePane === 0) {
        // From Explorer
        if (targetPane === 1) {
          setOpenedFiles(prev => {
            const filtered = prev.filter(f => f.trim() !== actualFile);
            const result = [...filtered];
            const insertAt = Math.min(targetIndex, result.length);
            result.splice(insertAt, 0, actualFile);
            return result;
          });
          handleSelectFile(actualFile, false, 1);
        } else {
          setOpenedFiles2(prev => {
            const filtered = prev.filter(f => f.trim() !== actualFile);
            const result = [...filtered];
            const insertAt = Math.min(targetIndex, result.length);
            result.splice(insertAt, 0, actualFile);
            return result;
          });
          handleSelectFile(actualFile, false, 2);
        }
      }
    }
    
    setDraggingTab(null);
  };

  const pinTabHandler = (file: string, targetPane: 1 | 2) => {
    if (targetPane === 1) {
      if (previewFile1 === file) {
        const { newOpenedFiles, newPreviewFile } = pinTab(openedFiles, file);
        setOpenedFiles(newOpenedFiles);
        setPreviewFile1(newPreviewFile);
      }
    } else {
      if (previewFile2 === file) {
        const { newOpenedFiles, newPreviewFile } = pinTab(openedFiles2, file);
        setOpenedFiles2(newOpenedFiles);
        setPreviewFile2(newPreviewFile);
      }
    }
  };

  const closeTab = (fileToClose: string, targetPane: 1 | 2) => {
    if (targetPane === 1) {
      setOpenedFiles(prev => {
        const newTabs = prev.filter(f => f !== fileToClose);
        if (previewFile1 === fileToClose) setPreviewFile1(null);
        if (selectedFile === fileToClose) {
          if (newTabs.length > 0) {
            const newSelected = newTabs[newTabs.length - 1];
            setSelectedFile(newSelected);
            setEditorContent(localFiles[newSelected] || '');
          } else if (previewFile1 && previewFile1 !== fileToClose) {
             setSelectedFile(previewFile1);
             setEditorContent(localFiles[previewFile1] || '');
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
        if (previewFile2 === fileToClose) setPreviewFile2(null);
        if (selectedFile2 === fileToClose) {
          if (newTabs.length > 0) {
            const newSelected = newTabs[newTabs.length - 1];
            setSelectedFile2(newSelected);
            setEditorContent2(localFiles[newSelected] || '');
          } else if (previewFile2 && previewFile2 !== fileToClose) {
            setSelectedFile2(previewFile2);
            setEditorContent2(localFiles[previewFile2] || '');
          } else {
            setSelectedFile2('');
            setEditorContent2('');
          }
        }
        return newTabs;
      });
    }
  };

  const handleDeleteFileSystem = async (item: any) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Are you sure you want to delete '${item.name}'?`)) return;
    } else {
      // Native Alert
      const confirmed = await new Promise(resolve => {
        Alert.alert('Delete', `Are you sure you want to delete '${item.name}'?`, [
          { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
          { text: 'Delete', onPress: () => resolve(true), style: 'destructive' }
        ]);
      });
      if (!confirmed) return;
    }
    
    const success = await deleteItem(item);
    if (!success) {
      if (Platform.OS === 'web') window.alert('An error occurred during deletion.');
      else Alert.alert('Error', 'An error occurred during deletion.');
    }
  };

  const handleRenameFileSystem = async () => {
    const success = await renameItem(renamingItem, newName);
    if (!success) {
      if (Platform.OS === 'web') window.alert('An error occurred during rename.');
      else Alert.alert('Error', 'An error occurred during rename.');
    }
    setRenamingItem(null);
  };

  const handleMoveFileSystem = useCallback(async (draggedItemInfo: any, targetParentPath: string) => {
    const fullItem = findItemInTree(fileSystemData, draggedItemInfo.path);
    if (!fullItem) {
      console.error('Could not find item with path:', draggedItemInfo.path);
      return;
    }

    const success = await moveItem(fullItem, targetParentPath);
    if (success) {
      const displayPath = targetParentPath || 'root';
      setToast({ visible: true, message: `Moved to ${displayPath}` });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
    } else {
      if (Platform.OS === 'web') window.alert('An error occurred during move.');
      else Alert.alert('Error', 'An error occurred during move.');
    }
  }, [moveItem, fileSystemData]);

  const handleConfirmCreation = async () => {
    if (!creatingItem || !creationName.trim()) {
      setCreatingItem(null);
      setCreationName('');
      return;
    }

    const parentP = creatingItem.parentPath;
    const kind = creatingItem.kind;
    const name = creationName.trim();

    const newItem = await createItem(parentP, name, kind);
    
    // Reset UI state after creation attempt
    setCreatingItem(null);
    setCreationName('');

    if (newItem) {
      if (newItem.kind === 'file') handleSelectFile(newItem.path);
      else setExpandedFolders(prev => ({ ...prev, [parentP]: true }));
    }
  };

  const handleTabContextMenu = (e: any, file: string, paneId: 1 | 2) => {
    if (Platform.OS === 'web') {
      e.preventDefault();
      e.stopPropagation();
    }
    const x = e.clientX || (e.nativeEvent && e.nativeEvent.pageX) || e.pageX;
    const y = e.clientY || (e.nativeEvent && e.nativeEvent.pageY) || e.pageY;
    
    setTabContextMenu({
      x,
      y,
      visible: true,
      file,
      paneId
    });
  };

  const handleTabAction = async (action: string) => {
    if (!tabContextMenu) return;
    const { file, paneId } = tabContextMenu;
    const isPane1 = paneId === 1;
    const currentOpened = isPane1 ? openedFiles : openedFiles2;
    const currentPreview = isPane1 ? previewFile1 : previewFile2;
    const setOpened = isPane1 ? setOpenedFiles : setOpenedFiles2;
    const setPreview = isPane1 ? setPreviewFile1 : setPreviewFile2;

    switch (action) {
      case 'close':
        closeTab(file, paneId);
        break;
      case 'closeOthers':
        setOpened(closeOthers(currentOpened, file));
        if (currentPreview !== file) setPreview(null);
        break;
      case 'closeAll':
        setOpened(closeAll());
        setPreview(null);
        setSelectedFile(isPane1 ? '' : selectedFile);
        setSelectedFile2(isPane1 ? selectedFile2 : '');
        break;
      case 'pin':
        if (currentPreview === file) {
          const { newOpenedFiles, newPreviewFile } = pinTab(currentOpened, file);
          setOpened(newOpenedFiles);
          setPreview(newPreviewFile);
        }
        break;
      case 'copyPath':
        await Clipboard.setStringAsync(file);
        if (Platform.OS === 'web') window.alert('Relative path copied');
        else Alert.alert('Success', 'Relative path copied');
        break;
      case 'reveal':
        if (Platform.OS === 'web') window.alert('Reveal in Finder is only supported in Desktop app.');
        else Alert.alert('Info', 'Reveal in Finder is only supported in Desktop app.');
        break;
    }
    setTabContextMenu(null);
  };

  const handleOpenDirectory = async () => {
    try {
      console.log('[App] Opening directory picker...');
      const handle = await pickDirectory();
      console.log('[App] Picker result:', handle);
      
      if (!handle) return;

      setDirHandle(handle);
      
      // Better folder name extraction for Android content URIs
      let folderName = 'Folder';
      if (Platform.OS === 'web') {
        folderName = handle.name;
      } else {
        const decodedUri = decodeURIComponent(handle);
        folderName = decodedUri.split('/').pop() || decodedUri.split('%2F').pop() || 'Folder';
        if (folderName.includes(':')) folderName = folderName.split(':').pop() || folderName;
      }
      
      setSelectedFolder(folderName);
      
      if (Platform.OS === 'web') {
        await checkWritePermission(handle);
      }
      
      const topLevelItems = await scanLevel(handle);
      setFileSystemData(topLevelItems);
      setLocalFiles({}); 
      setSelectedDirPath('');
      
      // On mobile, automatically show the sidebar so the user can see the file list
      if (isMobile) {
        toggleSidebar(true);
      }

      // Auto-open first markdown file if exists
      const firstMd = topLevelItems.find(item => item.kind === 'file' && (item.name.endsWith('.md') || item.name.endsWith('.txt')));
      if (firstMd) {
        let text = '';
        if (Platform.OS === 'web') {
          const f = await (firstMd.handle as any).getFile();
          text = await f.text();
        } else {
          text = await readAsStringAsync(firstMd.handle);
        }
        setLocalFiles({ [firstMd.path]: text });
        setSelectedFile(firstMd.path);
        setEditorContent(text);
        setLastSavedContent(text); // Initialize last saved content
        setOpenedFiles([firstMd.path]);
      } else {
        setSelectedFile('');
        setOpenedFiles([]);
      }
      setSelectedFile2('');
      setOpenedFiles2([]);

      // Give immediate feedback
      Alert.alert('Success', `Successfully opened folder: ${folderName}`);

      console.log('[App] Directory loaded successfully:', folderName);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('[App] Failed to load directory:', err);
        Alert.alert('Error', 'Failed to read the selected folder.');
      }
    }
  };

  const handleRenameFile = async () => {
    if (!selectedFile || !newFileName || newFileName === selectedFile.split('/').pop()) {
      setIsFileManagerVisible(false);
      return;
    }
    
    try {
      const parts = selectedFile.split('/');
      parts[parts.length - 1] = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`;
      const newPath = parts.join('/');
      
      // In a real app, we would use appInstance.vault.rename
      // For now, let's simulate by updating states
      setLocalFiles(prev => {
        const next = { ...prev };
        next[newPath] = next[selectedFile];
        delete next[selectedFile];
        return next;
      });
      
      setOpenedFiles(prev => prev.map(f => f === selectedFile ? newPath : f));
      setSelectedFile(newPath);
      setIsFileManagerVisible(false);
      Alert.alert("Success", "File renamed successfully");
    } catch (e) {
      Alert.alert("Error", "Failed to rename file");
    }
  };

  const handlePasteImage = async (file: File) => {
    return await pasteImage(file, activePane === 1 ? selectedFile : selectedFile2);
  };

  const handleRenameImage = async (old: string, name: string) => {
    return await handleRenameImageInHook(old, name, activePane === 1 ? selectedFile : selectedFile2);
  };

  // Undo/Redo Handlers
  const addToHistory = (content: string, file: string) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      // Avoid duplicate states
      if (newHistory.length > 0 && newHistory[newHistory.length - 1].content === content) return prev;
      
      const updated = [...newHistory, { content, file }];
      // Keep last 50 states
      if (updated.length > 50) updated.shift();
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      if (prevState.file === selectedFile) {
        setEditorContent(prevState.content);
        setHistoryIndex(historyIndex - 1);
      }
    }
  }, [history, historyIndex, selectedFile]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      if (nextState.file === selectedFile) {
        setEditorContent(nextState.content);
        setHistoryIndex(historyIndex + 1);
      }
    }
  }, [history, historyIndex, selectedFile]);

  // Track content changes for history
  useEffect(() => {
    if (!selectedFile || /\.(png|jpe?g|gif|webp)$/i.test(selectedFile)) return;
    
    const timer = setTimeout(() => {
      addToHistory(editorContent, selectedFile);
    }, 500); // 500ms debounce for history recording
    
    return () => clearTimeout(timer);
  }, [editorContent, selectedFile]);

  const handleToolbarAction = useCallback((action: string) => {
    if (action === 'undo') return handleUndo();
    if (action === 'redo') return handleRedo();

    const pane = activePane;
    const content = pane === 1 ? editorContent : editorContent2;
    const setContent = pane === 1 ? setEditorContent : setEditorContent2;
    const selection = pane === 1 ? selection1 : selection2;
    
    const start = selection.start;
    const end = selection.end;
    const selectedText = content.substring(start, end);
    
    let replacement = '';
    switch(action) {
      case 'bold': replacement = `**${selectedText}**`; break;
      case 'italic': replacement = `*${selectedText}*`; break;
      case 'code': replacement = `\`${selectedText}\``; break;
      case 'h1': replacement = `\n# ${selectedText}`; break;
      case 'h2': replacement = `\n## ${selectedText}`; break;
      case 'list': replacement = `\n- ${selectedText}`; break;
      case 'checkbox': replacement = `\n- [ ] ${selectedText}`; break;
      case 'quote': replacement = `\n> ${selectedText}`; break;
      case 'link': replacement = `[${selectedText}](url)`; break;
      default: return;
    }
    
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
  }, [handleUndo, handleRedo, activePane, editorContent, editorContent2, selection1, selection2]);

  const handleSaveToDisk = useCallback(async (content: string, file: string, silent = false) => {
    setIsSaving(true);
    try {
      const success = await handleSaveToDiskInHook(file, content);
      if (success) {
        if (!silent) {
          if (Platform.OS === 'web') {
            window.alert('Successfully saved.');
          } else {
            showToast('Saved');
          }
        } else {
          showToast('Auto-saved');
        }
        
        // Update IndexedDB cache
        if (Platform.OS === 'web') {
          await setFileCache(file, content);
        }
        setLastSavedContent(content); // Update last saved content after success
      }
      return success;
    } finally {
      setIsSaving(false);
    }
  }, [handleSaveToDiskInHook]);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    // Duration 2s
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2000);
  };

  // Auto-save logic
  useEffect(() => {
    if (activeTab !== 'editor' || !selectedFile || /\.(png|jpe?g|gif|webp)$/i.test(selectedFile)) return;
    
    // Only trigger if content actually changed from the last known saved state
    if (editorContent === lastSavedContent) return;

    const timer = setTimeout(() => {
      handleSaveToDisk(editorContent, selectedFile, true);
    }, 2000); // 2 second debounce for auto-save
    
    return () => clearTimeout(timer);
  }, [editorContent, selectedFile, lastSavedContent]);

  useEffect(() => {
    if (!selectedFile2 || /\.(png|jpe?g|gif|webp)$/i.test(selectedFile2)) return;
    
    const timer = setTimeout(() => {
      handleSaveToDisk(editorContent2, selectedFile2, true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [editorContent2, selectedFile2]);

  const handleTOCClick = (text: string, index: number) => {
    setActiveHeadingIndex(index);
    if (activePane === 1) {
      if (activeTab === 'files' && previewRef1.current) {
        (previewRef1.current as any).scrollToHeading(index, text);
      } else if (activeTab === 'editor' && editorRef1.current) {
        (editorRef1.current as any).scrollToHeading(index, text);
      }
    } else {
      if (activeTab === 'files' && previewRef2.current) {
        (previewRef2.current as any).scrollToHeading(index, text);
      } else if (activeTab === 'editor' && editorRef2.current) {
        (editorRef2.current as any).scrollToHeading(index, text);
      }
    }
  };

  return (
    <ErrorBoundary>
    <SafeAreaView 
        edges={['bottom', 'left', 'right']} 
        style={{ flex: 1, backgroundColor: colors.background }}
    >
      <Pressable 
        accessibilityRole={Platform.OS === 'web' ? 'main' : 'none'}
        nativeID="main-container" 
        style={s.container}
        onPress={() => {
          setContextMenu(prev => ({ ...prev, visible: false }));
          setTabContextMenu(null);
        }}
        {...({ onContextMenu: (e: any) => {
          e.preventDefault();
          setContextMenu(prev => ({ ...prev, visible: false }));
          setTabContextMenu(null);
        }} as any)}
      >
        {/* HEADER */}
        <Header 
          selectedFolder={selectedFolder}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSplitMode={isSplitMode}
          onSplitToggle={() => setIsSplitMode(!isSplitMode)}
          isMobile={isMobile}
          isSidebarOpen={isSidebarVisible}
          onMenuPress={() => {
            // Hamburger menu always toggles File Explorer
            toggleSidebar(!isSidebarVisible);
          }}
          isTocOpen={isTocVisible || isTocPinned}
          onTocPress={() => {
            if (isMobile) {
              toggleToc(!isTocVisible);
            } else {
              setIsTocPinned(!isTocPinned);
            }
          }}
          onOpenDirectory={handleOpenDirectory}
          onSave={() => handleSaveToDisk(activePane === 1 ? editorContent : editorContent2, activePane === 1 ? selectedFile : selectedFile2)}
          isSaving={isSaving}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          activeFile={activePane === 1 ? selectedFile : selectedFile2}
          onFileTitlePress={() => {
            if (selectedFile) {
              const decoded = decodeURIComponent(selectedFile);
              const name = decoded.split('/').pop() || '';
              setNewFileName(name);
              setIsFileManagerVisible(true);
            }
          }}
          isGeminiOpen={isFooterVisible}
          onGeminiPress={toggleFooter}
        />

        {/* BODY */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.body}
        >
          {/* Sidebar (Overlay on mobile, Static on desktop) */}
          {isSidebarVisible && (
            <Animated.View 
              nativeID="explorer-pane"
              style={[
                isMobile ? {
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: sidebarWidth,
                  zIndex: 2000,
                  backgroundColor: colors.background,
                  borderRightWidth: 1,
                  borderRightColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 4, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 10,
                } : {
                  height: '100%',
                  backgroundColor: colors.background,
                  borderRightWidth: 1,
                  borderRightColor: colors.border,
                  overflow: 'hidden'
                },
                isMobile ? animatedSidebarStyle : animatedWidthStyle
              ]}
            >
              <Sidebar
                app={appInstance}
                isMobile={isMobile}
                width={isMobile ? sidebarWidth : leftPaneWidth}
                activeViewId={activeSidebarViewId}
                setActiveViewId={setActiveSidebarViewId}
                registeredViews={sidebarViews}
                renderPluginsManager={useCallback(() => (
                  <PluginsSidebar />
                ), [])}
                renderChatHistoryList={useCallback(() => (
                  <ChatHistoryList
                    chatList={chatHistory.chatList}
                    activeChatId={chatHistory.activeChatId}
                    onSelectChat={(id, messageIndex, query) => {
                      chatHistory.loadActiveChat(id);
                      if (messageIndex !== undefined && query !== undefined) {
                        chatHistory.setHighlightInfo({ chatId: id, messageIndex, query });
                      } else {
                        chatHistory.setHighlightInfo(null);
                      }
                      if (!isFooterVisible) {
                        toggleFooter(true);
                      }
                    }}
                    onCreateNewChat={() => {
                      chatHistory.createNewChat();
                      chatHistory.setHighlightInfo(null);
                      if (!isFooterVisible) {
                        toggleFooter(true);
                      }
                    }}
                    onRenameChat={chatHistory.renameChat}
                    onDeleteChat={chatHistory.deleteChat}
                    searchChats={chatHistory.searchChats}
                  />
                ), [chatHistory, isFooterVisible])}
                renderFileExplorer={useCallback(() => (
                  <FileExplorer 
                    leftPaneWidth={(isMobile ? sidebarWidth : leftPaneWidth) - 48}
                    fileSystemData={fileSystemData}
                    selectedFile={selectedFile}
                    selectedFile2={selectedFile2}
                    expandedFolders={expandedFolders}
                    hoveredItemPath={hoveredItemPath}
                    onSelect={(file, preview, pane) => {
                      handleSelectFile(file, preview, pane);
                      if (isMobile) toggleSidebar(false);
                    }}
                    onToggle={toggleFolder}
                    onMouseEnter={setHoveredItemPath}
                    onMouseLeave={() => setHoveredItemPath(null)}
                    onOpenDirectory={handleOpenDirectory}
                    contextMenu={contextMenu}
                    setContextMenu={setContextMenu}
                    onDelete={handleDeleteFileSystem}
                    onRenameRequest={(item) => { setRenamingItem(item); setNewName(item.name); }}
                    onCreateRequest={(parentPath, kind) => setCreatingItem({ parentPath, kind })}
                    creatingItem={creatingItem}
                    creationName={creationName}
                    setCreationName={setCreationName}
                    onConfirmCreation={handleConfirmCreation}
                    onCancelCreation={() => setCreatingItem(null)}
                    setDraggingTab={setDraggingTab}
                    onExportToNextra={async (item) => {
                      if (item.kind === 'directory') {
                        await loadDirectoryRecursive(item.path);
                      }
                      setNextraExportTarget(item);
                      setNextraExportModalVisible(true);
                    }}
                    onMove={handleMoveFileSystem}
                    selectedFolder={selectedFolder}
                  />
                ), [isMobile, sidebarWidth, leftPaneWidth, fileSystemData, selectedFile, selectedFile2, expandedFolders, hoveredItemPath, handleSelectFile, toggleFolder, handleOpenDirectory, contextMenu, handleDeleteFileSystem, renamingItem, creatingItem, creationName, handleConfirmCreation, loadDirectoryRecursive, handleMoveFileSystem, selectedFolder])}
              />
            </Animated.View>
          )}

          {/* Vertical Resizer for Sidebar (Desktop only) */}
          {isSidebarVisible && !isMobile && (
            <Resizer 
              type="vertical"
              isResizing={isResizing}
              responder={leftPaneResponder}
              style={{ marginLeft: -5, marginRight: -5 }}
            />
          )}

          {/* Main Content Area (Workspace + Pinned TOC + Toolbar) */}
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <EditorWorkspace 
                activeTab={activeTab}
                isSplitMode={isSplitMode}
                middlePaneWidth={isMobile && isTocPinned ? windowWidth * 0.6 : middlePaneWidth}
                activePane={activePane}
                setActivePane={setActivePane}
                openedFiles={openedFiles}
                openedFiles2={openedFiles2}
                previewFile1={previewFile1}
                previewFile2={previewFile2}
                selectedFile={selectedFile}
                selectedFile2={selectedFile2}
                editorContent={editorContent || ''}
                editorContent2={editorContent2 || ''}
                setEditorContent={(val) => {
                  setEditorContent(val);
                  if (selectedFile2 === selectedFile) {
                    setEditorContent2(val);
                  }
                  if (previewFile1 === selectedFile) {
                    const { newOpenedFiles, newPreviewFile } = pinTab(openedFiles, previewFile1);
                    setOpenedFiles(newOpenedFiles);
                    setPreviewFile1(newPreviewFile);
                  }
                }}
                setEditorContent2={(val) => {
                  setEditorContent2(val);
                  if (selectedFile === selectedFile2) {
                    setEditorContent(val);
                  }
                  if (previewFile2 === selectedFile2) {
                    const { newOpenedFiles, newPreviewFile } = pinTab(openedFiles2, previewFile2);
                    setOpenedFiles2(newOpenedFiles);
                    setPreviewFile2(newPreviewFile);
                  }
                }}
                localFiles={localFiles}
                onSelectFile={handleSelectFile}
                onCloseTab={closeTab}
                onPinTab={pinTabHandler}
                onSaveFile={handleSaveToDisk}
                resolveImage={resolveImage}
                onPasteImage={handlePasteImage}
                onRenameImage={handleRenameImage}
                draggingTab={draggingTab}
                setDraggingTab={setDraggingTab}
                middlePaneResponder={middlePaneResponder}
                fontFamilyCode={fontFamilyCode}
                previewRef1={previewRef1}
                previewRef2={previewRef2}
                editorRef1={editorRef1}
                editorRef2={editorRef2}
                isDark={isDark}
                onTabContextMenu={handleTabContextMenu}
                onDropTab={handleDropTab}
                onHeadingVisible={setActiveHeadingIndex}
                onOpenDirectory={handleOpenDirectory}
                selectedFolder={selectedFolder}
                onSelectionChange1={setSelection1}
                onSelectionChange2={setSelection2}
                forcePaneModes={isSplitMode ? { 1: 'editor', 2: 'files' } : undefined}
                onYoutubeExtract={(targetDirectory) => {
                  setYoutubeTargetDirectory(targetDirectory);
                  setExpandedYoutubeModalVisible(true);
                }}
              />

              {/* Pinned TOC for Mobile */}
              {isMobile && isTocPinned && ((activePane === 1 ? selectedFile : selectedFile2) && !/\.(png|jpe?g|gif|webp)$/i.test(activePane === 1 ? selectedFile : selectedFile2)) && (
                <View style={{ width: windowWidth * 0.4, borderLeftWidth: 1, borderLeftColor: colors.border, backgroundColor: colors.surface }}>
                  <View style={{ paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 11 }}>TOC</Text>
                    <Pressable onPress={() => setIsTocPinned(false)}>
                      <Ionicons name="pin" size={16} color={colors.primary} />
                    </Pressable>
                  </View>
                  <TOCPane 
                    content={activePane === 1 ? deferredContent : deferredContent2} 
                    width={windowWidth * 0.4} 
                    onTOCClick={handleTOCClick}
                    activeIndex={activeHeadingIndex}
                  />
                </View>
              )}

              {/* Desktop TOC Fixed */}
              {!isMobile && isTocPinned && ((activePane === 1 ? selectedFile : selectedFile2) && !/\.(png|jpe?g|gif|webp)$/i.test(activePane === 1 ? selectedFile : selectedFile2)) && (
                <>
                  <Resizer 
                    type="vertical"
                    isResizing={isResizing}
                    responder={tocPaneResponder}
                    style={{ marginLeft: -5, marginRight: -5 }}
                  />
                  
                  <TOCPane 
                    content={activePane === 1 ? deferredContent : deferredContent2} 
                    width={tocPaneWidth} 
                    onTOCClick={handleTOCClick} 
                    activeIndex={activeHeadingIndex}
                    isPinned={true}
                    onTogglePin={() => setIsTocPinned(false)}
                    onClose={() => {
                      setIsTocPinned(false);
                      setIsTocVisible(false);
                    }}
                    isResizing={isResizing}
                  />
                </>
              )}
            </View>

            {/* Mobile Toolbar */}
            {isMobile && activeTab === 'editor' && (selectedFile || selectedFile2) && (
              <MobileToolbar 
                onAction={handleToolbarAction} 
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
              />
            )}
          </View>

          {/* MOBILE SIDEBAR SCRIM */}
          {isMobile && isSidebarVisible && (
            <Animated.View 
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  zIndex: 100,
                }, 
                animatedScrimStyle
              ]}
            >
              <Pressable style={{ flex: 1 }} onPress={() => setIsSidebarVisible(false)} />
            </Animated.View>
          )}

          {/* TOC Overlay (Floating mode) */}
          {isTocVisible && !isTocPinned && ((activePane === 1 ? selectedFile : selectedFile2) && !/\.(png|jpe?g|gif|webp)$/i.test(activePane === 1 ? selectedFile : selectedFile2)) && (
            <View style={[StyleSheet.absoluteFill, { zIndex: 3000 }]} pointerEvents="box-none">
              {!isMobile && (
                <Pressable 
                  style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.1)' }]} 
                  onPress={() => setIsTocVisible(false)} 
                />
              )}
              <Animated.View style={[
                 {
                   position: 'absolute',
                   right: 0,
                   width: isMobile ? '80%' : 300,
                   height: '100%',
                   backgroundColor: colors.surface,
                   elevation: 10,
                   shadowColor: '#000',
                   shadowOffset: { width: -4, height: 0 },
                   shadowOpacity: 0.3,
                   shadowRadius: 10,
                 },
                 animatedTocStyle
               ]}>
                <TOCPane 
                  content={activePane === 1 ? deferredContent : deferredContent2} 
                  width="100%" 
                  onTOCClick={(text, idx) => {
                    handleTOCClick(text, idx);
                    if (isMobile) setIsTocVisible(false);
                  }}
                  activeIndex={activeHeadingIndex}
                  isPinned={false}
                  onTogglePin={() => {
                    setIsTocPinned(true);
                    // On desktop, keep it visible when pinned
                  }}
                  onClose={() => setIsTocVisible(false)}
                />
              </Animated.View>
            </View>
          )}

          {/* Tab Context Menu */}
          {tabContextMenu && (
            <View 
              style={[
                s.contextMenu, 
                { top: tabContextMenu.y, left: tabContextMenu.x, backgroundColor: colors.surface, borderColor: colors.border, zIndex: 4000 }
              ]}
            >
              <Pressable style={s.menuItem} onPress={() => handleTabAction('close')}>
                <Text style={[s.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>Close</Text>
              </Pressable>
              <Pressable style={s.menuItem} onPress={() => handleTabAction('pin')}>
                <Text style={[s.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>Pin</Text>
              </Pressable>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
              <Pressable style={s.menuItem} onPress={() => handleTabAction('closeOthers')}>
                <Text style={[s.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>Close Others</Text>
              </Pressable>
              <Pressable style={s.menuItem} onPress={() => handleTabAction('closeAll')}>
                <Text style={[s.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>Close All</Text>
              </Pressable>
            </View>
          )}

          {/* File Manager Modal (Mobile) */}
          {isMobile && isFileManagerVisible && (
            <Modal
              transparent
              visible={isFileManagerVisible}
              animationType="fade"
              onRequestClose={() => setIsFileManagerVisible(false)}
            >
              <Pressable 
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }]} 
                onPress={() => setIsFileManagerVisible(false)}
              >
                <Pressable 
                  style={{ width: '100%', backgroundColor: colors.surface, borderRadius: 16, padding: 20, elevation: 5 }}
                  onPress={(e) => e.stopPropagation()}
                >
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 20, fontFamily: fontFamilyUI }}>File Info</Text>
                  
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8, fontFamily: fontFamilyUI }}>NAME</Text>
                    <TextInput 
                      style={{ 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
                        color: colors.text, 
                        padding: 12, 
                        borderRadius: 8,
                        fontSize: 14,
                        fontFamily: fontFamilyCode
                      }}
                      value={newFileName}
                      onChangeText={setNewFileName}
                      placeholder="Filename.md"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>

                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8, fontFamily: fontFamilyUI }}>LOCATION</Text>
                    <View style={{ 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
                      padding: 12, 
                      borderRadius: 8,
                    }}>
                      <Text style={{ color: colors.text, fontSize: 14 }}>{(() => {
                        const decoded = decodeURIComponent(selectedFile || '');
                        const parts = decoded.split('/');
                        return parts.slice(0, -1).join('/') || 'Root';
                      })()}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <Pressable 
                      onPress={() => setIsFileManagerVisible(false)} 
                      style={{ paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 }}
                    >
                      <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>Cancel</Text>
                    </Pressable>
                    <Pressable 
                      onPress={handleRenameFile} 
                      style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
                    >
                      <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Apply</Text>
                    </Pressable>
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          )}

          <SettingsModal />

          <YoutubeExtractorModal 
            visible={youtubeModalVisible}
            onConfirm={handleYoutubeExtract}
            onCancel={() => setYoutubeModalVisible(false)}
          />

          <ExpandedExtractionModal 
            visible={expandedYoutubeModalVisible}
            targetDirectory={youtubeTargetDirectory}
            onExtract={handleExpandedYoutubeExtract}
            onClose={() => setExpandedYoutubeModalVisible(false)}
          />
        </KeyboardAvoidingView>

        <Footer 
          height={svFooterHeight} 
          responder={footerResponder}
          selectedFile={activePane === 1 ? selectedFile : selectedFile2}
          editorContent={activePane === 1 ? editorContent : editorContent2}
          onSaveChatToFile={handleSaveChatToFile}
          isCollapsed={!isFooterVisible}
          onToggleCollapse={toggleFooter}
          isResizing={isResizing}
          chatMessages={chatHistory.messages}
          onSaveActiveChat={chatHistory.saveActiveChat}
          onUpdateMessageFeedback={chatHistory.updateMessageFeedback}
          highlightInfo={chatHistory.highlightInfo}
          onClearHighlight={() => chatHistory.setHighlightInfo(null)}
          onMaximize={() => {
            if (Platform.OS === 'web') {
              const width = 1000;
              const height = 800;
              const left = (window.screen.width - width) / 2;
              const top = (window.screen.height - height) / 2;
              const activeId = chatHistory.activeChatId || '';
              window.open(
                window.location.origin + `?mode=chat${activeId ? `&chatId=${activeId}` : ''}`,
                'GeminiChatPopup',
                `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
              );
            }
          }}
          fileList={(() => {
            const list: string[] = [];
            const collect = (items: any[]) => {
              for (const it of items) {
                if (it.kind === 'file') list.push(it.path);
                if (it.children) collect(it.children);
              }
            };
            collect(fileSystemData);
            return list;
          })()}
        />

        {/* LOADING OVERLAY */}
        {isLoading && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 999 }]}>
            <View style={{ backgroundColor: colors.surface, padding: 20, borderRadius: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 }}>
              <Ionicons name="sync" size={24} color={colors.primary} style={{ marginRight: 12 }} />
              <Text style={{ color: colors.text, fontSize: 16, fontFamily: fontFamilyUI, fontWeight: '600' }}>Loading Files...</Text>
            </View>
          </View>
        )}



        <RenameModal 
          visible={!!renamingItem}
          onCancel={() => setRenamingItem(null)}
          name={newName}
          onChangeName={setNewName}
          onConfirm={handleRenameFileSystem}
        />

        <NextraExportModal 
          visible={nextraExportModalVisible}
          onClose={() => setNextraExportModalVisible(false)}
          app={appInstance}
          targetNode={nextraExportTarget}
        />

        <ContextMenu 
          {...contextMenu}
          onClose={() => setContextMenu({ ...contextMenu, visible: false })}
          onRename={(item) => { setRenamingItem(item); setNewName(item.name); }}
          onDelete={handleDeleteFileSystem}
          onCreateFile={(path) => setCreatingItem({ parentPath: path, kind: 'file' })}
          onCreateFolder={(path) => setCreatingItem({ parentPath: path, kind: 'directory' })}
          onExportToNextra={async (item) => {
            if (item.kind === 'directory') {
              await loadDirectoryRecursive(item.path);
            }
            setNextraExportTarget(item);
            setNextraExportModalVisible(true);
          }}
          onCreateYoutubePlaylist={(path) => {
            setYoutubeTargetDirectory(path);
            setExpandedYoutubeModalVisible(true);
          }}
        />

        <QuickPicker 
          visible={templatePicker.visible}
          title="Select Template"
          items={templatePicker.items}
          onSelect={(item) => {
            const plugin = pluginManager.getPlugin('templates') as any;
            if (plugin) {
              plugin.insertTemplate(item.id);
            }
            setTemplatePicker(prev => ({ ...prev, visible: false }));
          }}
          onClose={() => setTemplatePicker(prev => ({ ...prev, visible: false }))}
        />

        <QuickPicker 
          visible={fileSearchPickerVisible}
          title="Search Files"
          placeholder="Type a file name to search..."
          items={allSearchableFiles}
          onSelect={(item) => {
            handleSelectFile(item.id, false, activePane);
            setFileSearchPickerVisible(false);
          }}
          onClose={() => setFileSearchPickerVisible(false)}
        />
      </Pressable>
        {/* Toast Notification */}
        {toast.visible && (
          <View style={{
            position: 'absolute',
            top: 70,
            left: 20,
            right: 20,
            alignItems: 'center',
            zIndex: 1000,
          }} pointerEvents="none">
            <View style={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons name="checkmark-circle" size={16} color="#4ADE80" style={{ marginRight: 8 }} />
              <Text style={{ color: '#FFF', fontSize: 13, fontWeight: 'bold' }}>{toast.message}</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </ErrorBoundary>
  );
}

function ChatOnlyScreen() {
  const { colors, isDark } = useTheme();
  const settings = useAppSettings();
  
  // Retrieve shared parent references from window.opener
  const parentWindow = typeof window !== 'undefined' ? window.opener : null;
  const parentDirHandle = parentWindow?._activeDirHandle || null;
  const parentFileSystemData = parentWindow?._activeFileSystemData || [];
  
  const { dirHandle, fileSystemData } = useFileSystem();
  
  // Prioritize parent handles if available (since popup context is fresh)
  const activeDirHandle = parentDirHandle || dirHandle;
  const activeFileSystemData = parentDirHandle ? parentFileSystemData : fileSystemData;
  
  const chatHistory = useChatHistory(
    activeDirHandle,
    settings.aiProvider,
    settings.selectedModel
  );

  useEffect(() => {
    if (Platform.OS === 'web' && activeDirHandle) {
      const params = new URLSearchParams(window.location.search);
      const urlChatId = params.get('chatId');
      if (urlChatId) {
        chatHistory.loadActiveChat(urlChatId);
      }
    }
  }, [activeDirHandle]);

  return (
    <SafeAreaView 
      edges={['top', 'bottom', 'left', 'right']} 
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Left Sidebar for Chat History List */}
        <View style={{ 
          width: 250, 
          borderRightWidth: 1, 
          borderRightColor: colors.border,
          backgroundColor: isDark ? '#111827' : '#F9FAFB',
        }}>
          <ChatHistoryList
            chatList={chatHistory.chatList}
            activeChatId={chatHistory.activeChatId}
            onSelectChat={(id, messageIndex, query) => {
              chatHistory.loadActiveChat(id);
              if (messageIndex !== undefined && query !== undefined) {
                chatHistory.setHighlightInfo({ chatId: id, messageIndex, query });
              } else {
                chatHistory.setHighlightInfo(null);
              }
            }}
            onCreateNewChat={() => {
              chatHistory.createNewChat();
              chatHistory.setHighlightInfo(null);
            }}
            onRenameChat={chatHistory.renameChat}
            onDeleteChat={chatHistory.deleteChat}
            searchChats={chatHistory.searchChats}
          />
        </View>
        
        {/* Right Chat Pane */}
        <View style={{ flex: 1 }}>
          <GeminiChat
            currentContent=""
            onSaveChatToFile={async () => true}
            fileList={(() => {
              const list: string[] = [];
              const collect = (items: any[]) => {
                for (const it of items) {
                  if (it.kind === 'file') list.push(it.path);
                  if (it.children) collect(it.children);
                }
              };
              collect(activeFileSystemData);
              return list;
            })()}
            chatMessages={chatHistory.messages}
            onSaveActiveChat={chatHistory.saveActiveChat}
            onUpdateMessageFeedback={chatHistory.updateMessageFeedback}
            highlightInfo={chatHistory.highlightInfo}
            onClearHighlight={() => chatHistory.setHighlightInfo(null)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  "use no-memo";
  const [isChatOnlyMode, setIsChatOnlyMode] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const params = new URLSearchParams(window.location.search);
      setIsChatOnlyMode(params.get('mode') === 'chat');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SettingsProvider>
          <PluginProvider app={appInstance}>
            {isChatOnlyMode ? <ChatOnlyScreen /> : <MainScreen />}
          </PluginProvider>
        </SettingsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    width: '100%', 
    height: Platform.OS === 'web' ? '100vh' : '100%', 
    backgroundColor: colors.background, 
    flexDirection: 'column', 
    overflow: 'hidden' 
  },
  body: { 
    flex: 1, 
    width: '100%', 
    flexDirection: 'row', 
    minHeight: 0 
  },
  contextMenu: {
    position: 'fixed',
    width: 180,
    borderRadius: 8,
    paddingVertical: 5,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
    elevation: 5,
    borderWidth: 1,
  } as any,
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  menuText: {
    fontSize: 13,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    minWidth: 48,
    justifyContent: 'center',
  },
});
