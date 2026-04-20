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
import { AVAILABLE_MODELS } from '@/constants/Models';
import { getFileCache, setFileCache } from '@/utils/IndexedDBUtils';
import { handleTabSelection, pinTab, closeOthers, closeAll } from '@/utils/TabUtils';

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
      </Pressable>
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

const styles = StyleSheet.create({
  contextMenu: {
    position: 'fixed',
    width: 180,
    borderRadius: 8,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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


