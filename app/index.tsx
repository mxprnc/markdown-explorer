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
import { AVAILABLE_MODELS } from '@/constants/Models';
import { getFileCache, setFileCache } from '@/utils/IndexedDBUtils';

WebBrowser.maybeCompleteAuthSession();

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

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

  // Creation State
  const [creatingItem, setCreatingItem] = useState<{ parentPath: string, kind: 'file' | 'directory' } | null>(null);
  const [creationName, setCreationName] = useState('');

  const [deferredContent, setDeferredContent] = useState(editorContent);
  const [deferredContent2, setDeferredContent2] = useState(editorContent2);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeferredContent(editorContent);
    }, 300);
    return () => clearTimeout(timer);
  }, [editorContent]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeferredContent2(editorContent2);
    }, 300);
    return () => clearTimeout(timer);
  }, [editorContent2]);

  const handleSelectFile = async (file: string, targetPane: 1 | 2 = activePane) => {
    const isImage = /\.(png|jpe?g|gif|webp)$/i.test(file);
    let content = localFiles[file];
    
    if (content === undefined) {
      // Try to load from IndexedDB cache first
      content = await getFileCache(file);
      
      if (content) {
        setLocalFiles(prev => ({ ...prev, [file]: content }));
      } else {
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
            const f = await handle.getFile();
            content = isImage ? URL.createObjectURL(f) : await f.text();
            setLocalFiles(prev => ({ ...prev, [file]: content }));
            // Cache the loaded content
            if (!isImage) {
              await setFileCache(file, content);
            }
          } catch (e) {
            content = '';
          }
        } else {
          content = '';
        }
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
      setDeferredContent(content);
      setActivePane(1);
    } else {
      if (file === selectedFile2) return;
      if (selectedFile2 && !/\.(png|jpe?g|gif|webp)$/i.test(selectedFile2)) {
          setLocalFiles(prev => ({ ...prev, [selectedFile2]: editorContent2 }));
      }
      setOpenedFiles2(prev => !prev.includes(file) ? [...prev, file] : prev);
      setSelectedFile2(file);
      setEditorContent2(content);
      setDeferredContent2(content);
      setActivePane(2);
    }
    
    // Add to recent files
    if (!isImage) {
      const fileName = file.split('/').pop() || file;
      addRecentFile(file, fileName);
    }
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
    container: { flex: 1, backgroundColor: colors.background, flexDirection: 'column' },
    body: { flex: 1, flexDirection: 'row' },
  });

  const handleTOCClick = (text: string, index: number) => {
    if (Platform.OS === 'web') {
      const paneId = activePane === 1 ? 'pane-1' : 'pane-2';
      const pane = document.getElementById(paneId);
      if (!pane) return;

      const headers = pane.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const getHeaderText = (h: Element) => {
        const contentNode = h.querySelector('.heading-content');
        if (contentNode) return contentNode.textContent?.trim() || "";
        return h.textContent?.trim() || "";
      };

      let targetHeader: HTMLElement | null = null;
      if (headers[index] && getHeaderText(headers[index]) === text) {
        targetHeader = headers[index] as HTMLElement;
      } else {
        for (let i = 0; i < headers.length; i++) {
          if (getHeaderText(headers[i]) === text) {
             targetHeader = headers[i] as HTMLElement;
             break;
          }
        }
      }

      if (targetHeader) {
        targetHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
           let scroller: HTMLElement | null = null;
           let p = targetHeader!.parentElement;
           while (p && p !== pane) {
             const style = window.getComputedStyle(p);
             if (/(auto|scroll)/.test(style.overflow + style.overflowY)) {
               scroller = p;
               break;
             }
             p = p.parentElement;
           }
           if (scroller) scroller.scrollBy(0, -20);
        }, 500);
      }
    }
  };

  const tocList = React.useMemo(() => {
    let currentContent = '';
    if (activeTab === 'files') {
      const selFile = activePane === 1 ? selectedFile : selectedFile2;
      currentContent = localFiles[selFile] || '';
    } else {
      currentContent = activePane === 1 ? editorContent : editorContent2;
    }
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
  }, [editorContent, editorContent2, activePane, activeTab, selectedFile, selectedFile2, localFiles]);

  return (
    <ErrorBoundary>
      <View nativeID="main-container" style={s.container}>
        {/* HEADER */}
        <Header 
          selectedFolder={selectedFolder}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* BODY */}
        <View style={s.body}>
          <FileExplorer 
            leftPaneWidth={leftPaneWidth}
            leftPaneResponder={leftPaneResponder}
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
            selectedFile={selectedFile}
            selectedFile2={selectedFile2}
            editorContent={editorContent}
            editorContent2={editorContent2}
            setEditorContent={setEditorContent}
            setEditorContent2={setEditorContent2}
            localFiles={localFiles}
            onSelectFile={handleSelectFile}
            onCloseTab={closeTab}
            onSaveFile={handleSaveToDisk}
            resolveImage={resolveImage}
            onPasteImage={handlePasteImage}
            onRenameImage={handleRenameImage}
            draggingTab={draggingTab}
            setDraggingTab={setDraggingTab}
            middlePaneResponder={middlePaneResponder}
            fontFamilyCode={fontFamilyCode}
            deferredContent={deferredContent}
            deferredContent2={deferredContent2}
          />

          {/* TOC Pane */}
          {(activePane === 1 ? selectedFile : selectedFile2) && !/\.(png|jpe?g|gif|webp)$/i.test(activePane === 1 ? selectedFile : selectedFile2) && (
            <TOCPane 
               content={activePane === 1 ? deferredContent : deferredContent2} 
               width={tocPaneWidth} onTOCClick={handleTOCClick} responder={tocPaneResponder}
            />
          )}
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
      </View>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <MainScreen />
      </SettingsProvider>
    </ThemeProvider>
  );
}


