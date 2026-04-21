// Updated TOC Logic - 2026-04-20
import React, { useState, useEffect, useRef } from 'react';
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

import { useGemini } from '@/hooks/useGemini';
import { usePaneResize } from '@/hooks/usePaneResize';
import { useFileSystem } from '@/hooks/useFileSystem';
import { useRecentFiles } from '@/hooks/useRecentFiles';
import { FileExplorer } from '@/components/explorer/FileExplorer';
import { ImageViewer } from '@/components/preview/ImageViewer';
import { TOCPane } from '@/components/toc/TOCPane';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TabBar } from '@/components/layout/TabBar';
import { GeminiSettingsModal } from '@/components/gemini/GeminiSettingsModal';
import { RenameModal } from '@/components/explorer/RenameModal';
import { EditorWorkspace } from '@/components/editor/EditorWorkspace';
import { Sidebar } from '@/components/layout/Sidebar';
import { AVAILABLE_MODELS } from '@/constants/Models';
import { getFileCache, setFileCache } from '@/utils/IndexedDBUtils';
import { handleTabSelection, pinTab, closeOthers, closeAll } from '@/utils/TabUtils';

WebBrowser.maybeCompleteAuthSession();

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { PluginProvider, usePlugins } from '@/contexts/PluginContext';
import { AppInstance } from '@/core/AppInstance';
import { QuickPicker } from '@/components/ui/QuickPicker';

const appInstance = new AppInstance();

function MainScreen() {
  const { themeMode, isDark, toggleTheme, colors, fontFamilyUI, fontFamilyCode } = useTheme();
  const gemini = useSettings();

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
    toggleFolder,
    scanLevel,
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
  } = useFileSystem();
  
  const { recentFiles, addRecentFile } = useRecentFiles();

  const [editorContent, setEditorContent] = useState('# Markdown Explorer Project\n\n* 실제 작동하는 CodeMirror 기반 에디터입니다.\n* 여기서 타이핑하면 아래 Live Preview 에 반영됩니다.\n\n해봤는데 잘 동작하나요? 😊');
  const [activeTab, setActiveTab] = useState<'files' | 'editor'>('files');
  
  // Drag & Drop State
  const [draggingTab, setDraggingTab] = useState<{file: string, sourcePane: number} | null>(null);
  const [isDragOverRight, setIsDragOverRight] = useState(false);

  // Pane 2 State
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [activePane, setActivePane] = useState<1 | 2>(1);
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

  // Preview File States
  const [previewFile1, setPreviewFile1] = useState<string | null>(null);
  const [previewFile2, setPreviewFile2] = useState<string | null>(null);

  const deferredContent = React.useDeferredValue(editorContent);
  const deferredContent2 = React.useDeferredValue(editorContent2);

  const previewRef1 = useRef(null);
  const previewRef2 = useRef(null);
  const editorRef1 = useRef(null);
  const editorRef2 = useRef(null);

  const { pluginManager } = usePlugins();
  const [templatePicker, setTemplatePicker] = useState<{ visible: boolean, items: any[] }>({ visible: false, items: [] });
  const [activeSidebarViewId, setActiveSidebarViewId] = useState('files');
  const [sidebarViews, setSidebarViews] = useState<any[]>([]);

  // ViewRegistry 변화 감지 (등록된 사이드바 뷰 목록 동기화)
  useEffect(() => {
    const updateViews = () => {
      setSidebarViews(appInstance.views.getSidebarViews());
    };
    updateViews();
    // registerView 시점에 이벤트를 발생시키도록 core를 수정하거나, 
    // 여기서는 간단히 setInterval로 체크하거나 plugin 로드 후 직접 호출할 수도 있지만
    // 일단 registerView 시점에 로깅만 하니, pluginManager 로드 후 한번 더 업데이트하도록 합니다.
    const timer = setInterval(updateViews, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Vault implementation
    const vault = {
      read: async (path: string) => {
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
        
        // Fallback: Try to find handle directly via dirHandle
        if (!handle && dirHandle) {
          try {
            const parts = path.split('/').filter(Boolean);
            let current = dirHandle;
            for (let i = 0; i < parts.length - 1; i++) {
              current = await current.getDirectoryHandle(parts[i]);
            }
            handle = await current.getFileHandle(parts[parts.length - 1]);
          } catch (e) {}
        }

        if (handle) {
          try {
            const f = await handle.getFile();
            return await f.text();
          } catch (e) {}
        }
        throw new Error(`File not found: ${path}`);
      },
      write: async (path: string, data: string) => {
        await handleSaveToDiskInHook(path, data);
        appInstance.emit('vault:changed');
      },
      exists: async (path: string) => {
        const findItemRec = (items: any[], p: string): boolean => {
          for (const item of items) {
            if (item.path === p) return true;
            if (item.children && findItemRec(item.children, p)) return true;
          }
          return false;
        };
        if (findItemRec(fileSystemData, path)) return true;
        
        // Fallback: Check disk directly
        if (dirHandle) {
          try {
            const parts = path.split('/').filter(Boolean);
            let current = dirHandle;
            for (let i = 0; i < parts.length - 1; i++) {
              current = await current.getDirectoryHandle(parts[i]);
            }
            await current.getFileHandle(parts[parts.length - 1]);
            return true;
          } catch (e) {}
        }
        return false;
      },
      delete: async (path: string) => {
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

    // Workspace implementation
    const workspace = {
      getActiveFile: () => activePane === 1 ? selectedFile : selectedFile2,
      openFile: async (path: string, options?: { leaf?: 'left' | 'right' | 'main' }) => {
        const pane = options?.leaf === 'right' ? 2 : 1;
        await handleSelectFile(path, false, pane as 1 | 2);
      },
      addSidebarView: (id: string, name: string, icon: string, component: any) => {
        appInstance.views.registerView({ id, name, icon, component });
        appInstance.views.addToSidebar(id);
        setSidebarViews(appInstance.views.getSidebarViews());
      },
      removeSidebarView: (id: string) => {
        appInstance.views.removeFromSidebar(id);
        setSidebarViews(appInstance.views.getSidebarViews());
      }
    };

    appInstance.setVault(vault);
    appInstance.setWorkspace(workspace);
  }, [fileSystemData, localFiles, selectedFile, selectedFile2, activePane]);

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
    window.addEventListener('command:execute', onExecuteCommand);

    return () => {
      appInstance.off('templates:show-picker', onShowTemplatePicker);
      appInstance.off('editor:insert-text', onInsertText);
      window.removeEventListener('command:execute', onExecuteCommand);
    };
  }, [activePane, activeTab]);

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
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    
    // E2E Test Hook
    if (process.env.NODE_ENV === 'development') {
      (window as any).__E2E_HOOKS__ = {
        setFileSystemData: (data: any) => {
          setFileSystemData(data);
          setSelectedFolder('MOCK_REPO');
        },
        setDirHandle: (handle: any) => setDirHandle(handle),
        setLocalFiles: (files: any) => setLocalFiles(files),
        setExpandedFolders: (folders: any) => setExpandedFolders(folders),
        appInstance,
        mockClipboard: () => {
          try {
            const Clipboard = require('expo-clipboard');
            Clipboard.setStringAsync = () => Promise.resolve();
          } catch (e) {}
        }
      };
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
            if (!isImage) await setFileCache(file, content);
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
            const f = await handle.getFile();
            content = URL.createObjectURL(f);
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
    if (Platform.OS === 'web' && !window.confirm(`'${item.name}'을(를) 삭제하시겠습니까?`)) return;
    const success = await deleteItem(item);
    if (!success && Platform.OS === 'web') window.alert('삭제 오류가 발생했습니다.');
  };

  const handleRenameFileSystem = async () => {
    const success = await renameItem(renamingItem, newName);
    if (!success && Platform.OS === 'web') window.alert('이름 변경 오류가 발생했습니다.');
    setRenamingItem(null);
  };

  const handleConfirmCreation = async () => {
    const newItem = await createItem(creatingItem!.parentPath, creationName, creatingItem!.kind);
    if (newItem) {
      if (newItem.kind === 'file') handleSelectFile(newItem.path);
      else setExpandedFolders(prev => ({ ...prev, [creatingItem!.parentPath]: true }));
    }
    setCreatingItem(null);
    setCreationName('');
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
        break;
      case 'reveal':
        if (Platform.OS === 'web') window.alert('Reveal in Finder is only supported in Desktop app.');
        // If Electron, we would use shell.showItemInFolder(file)
        break;
    }
    setTabContextMenu(null);
  };

  const handleOpenDirectory = async () => {
    if (Platform.OS !== 'web') return;
    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setDirHandle(handle);
      setSelectedFolder(handle.name);
      await checkWritePermission(handle);
      
      const topLevelItems = await scanLevel(handle);
      setFileSystemData(topLevelItems);
      setLocalFiles({}); 
      setSelectedDirPath('');

      const firstMd = topLevelItems.find(item => item.kind === 'file' && (item.name.endsWith('.md') || item.name.endsWith('.txt')));
      if (firstMd) {
        const f = await firstMd.handle.getFile();
        const text = await f.text();
        setLocalFiles({ [firstMd.path]: text });
        setSelectedFile(firstMd.path);
        setEditorContent(text);
        setOpenedFiles([firstMd.path]);
      } else {
        setSelectedFile('');
        setOpenedFiles([]);
      }
      setSelectedFile2('');
      setOpenedFiles2([]);
    } catch (e: any) {
      if (e.name !== 'AbortError') Alert.alert('오류', '폴더를 선택하는 중 오류가 발생했습니다.');
    }
  };

  const handlePasteImage = async (file: File) => {
    return await pasteImage(file, activePane === 1 ? selectedFile : selectedFile2);
  };

  const handleRenameImage = async (old: string, name: string) => {
    return await handleRenameImageInHook(old, name, activePane === 1 ? selectedFile : selectedFile2);
  };

  const handleSaveToDisk = async (content: string, file: string) => {
    const success = await handleSaveToDiskInHook(file, content);
    if (success) {
      if (Platform.OS === 'web') {
        window.alert('성공적으로 저장되었습니다.');
        // Update IndexedDB cache
        await setFileCache(file, content);
      }
    }
    return success;
  };

  const s = StyleSheet.create({
    container: { flex: 1, height: Platform.OS === 'web' ? '100vh' : '100%', backgroundColor: colors.background, flexDirection: 'column', overflow: 'hidden' },
    body: { flex: 1, flexDirection: 'row', minHeight: 0 },
  });

  const handleTOCClick = (text: string, index: number) => {
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
      <Pressable 
        accessibilityRole="main"
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
        />

        {/* BODY */}
        <View style={s.body}>
          <Sidebar
            app={appInstance}
            width={leftPaneWidth}
            activeViewId={activeSidebarViewId}
            setActiveViewId={setActiveSidebarViewId}
            registeredViews={sidebarViews}
            renderFileExplorer={() => (
              <FileExplorer 
                leftPaneWidth={leftPaneWidth - 48} // Leave space for icon bar
                leftPaneResponder={{ panHandlers: {} }} // Resize is handled by MainScreen
                fileSystemData={fileSystemData}
                selectedFile={selectedFile}
                selectedFile2={selectedFile2}
                expandedFolders={expandedFolders}
                hoveredItemPath={hoveredItemPath}
                onSelect={handleSelectFile}
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
              />
            )}
          />

          {/* Resizing Area */}
          <View 
            {...leftPaneResponder.panHandlers} 
            style={{ width: 14, marginLeft: -7, marginRight: -7, cursor: 'col-resize', zIndex: 10 } as any}
          />

          <EditorWorkspace 
            activeTab={activeTab}
            isSplitMode={isSplitMode}
            middlePaneWidth={middlePaneWidth}
            activePane={activePane}
            setActivePane={setActivePane}
            openedFiles={openedFiles}
            openedFiles2={openedFiles2}
            previewFile1={previewFile1}
            previewFile2={previewFile2}
            selectedFile={selectedFile}
            selectedFile2={selectedFile2}
            editorContent={editorContent}
            editorContent2={editorContent2}
            setEditorContent={(val) => {
               setEditorContent(val);
               if (previewFile1 === selectedFile) {
                  const { newOpenedFiles, newPreviewFile } = pinTab(openedFiles, previewFile1);
                  setOpenedFiles(newOpenedFiles);
                  setPreviewFile1(newPreviewFile);
               }
            }}
            setEditorContent2={(val) => {
               setEditorContent2(val);
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
          />

          {tabContextMenu && (
            <View 
              style={[
                styles.contextMenu, 
                { top: tabContextMenu.y, left: tabContextMenu.x, backgroundColor: colors.surface, borderColor: colors.border, zIndex: 1000 }
              ]}
            >
              <Pressable style={styles.menuItem} onPress={() => handleTabAction('close')}>
                <Text style={[styles.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>Close</Text>
              </Pressable>
              <Pressable style={styles.menuItem} onPress={() => handleTabAction('pin')}>
                <Text style={[styles.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>Pin</Text>
              </Pressable>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
              <Pressable style={styles.menuItem} onPress={() => handleTabAction('closeOthers')}>
                <Text style={[styles.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>Close Others</Text>
              </Pressable>
              <Pressable style={styles.menuItem} onPress={() => handleTabAction('closeAll')}>
                <Text style={[styles.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>Close All</Text>
              </Pressable>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
              <Pressable style={styles.menuItem} onPress={() => handleTabAction('copyPath')}>
                <Text style={[styles.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>Copy Relative Path</Text>
              </Pressable>
              <Pressable style={styles.menuItem} onPress={() => handleTabAction('reveal')}>
                <Text style={[styles.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>Reveal in Finder</Text>
              </Pressable>
            </View>
          )}

          {/* TOC Pane */}
          {((activePane === 1 ? selectedFile : selectedFile2) && !/\.(png|jpe?g|gif|webp)$/i.test(activePane === 1 ? selectedFile : selectedFile2)) ? (
            <TOCPane 
               content={activePane === 1 ? deferredContent : deferredContent2} 
               width={tocPaneWidth} onTOCClick={handleTOCClick} responder={tocPaneResponder}
            />
          ) : null}
        </View>

        {/* FOOTER */}
        <Footer 
          height={footerHeight} 
          responder={footerResponder}
          selectedFile={activePane === 1 ? selectedFile : selectedFile2}
          editorContent={activePane === 1 ? editorContent : editorContent2}
          onSaveChatToFile={handleSaveChatToFile}
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

        {/* MODALS */}
        <GeminiSettingsModal 
          visible={gemini.showGeminiSettings} onClose={() => gemini.setShowGeminiSettings(false)}
        />

        <RenameModal 
          visible={!!renamingItem} name={newName} onChangeName={setNewName}
          onConfirm={handleRenameFileSystem} onCancel={() => setRenamingItem(null)}
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
      </Pressable>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <PluginProvider app={appInstance}>
          <MainScreen />
        </PluginProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
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
});


