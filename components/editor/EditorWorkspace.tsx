import React from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
import { TabBar } from '@/components/layout/TabBar';
import { ImageViewer } from '@/components/preview/ImageViewer';
import { useTheme } from '@/contexts/ThemeContext';

interface EditorWorkspaceProps {
  activeTab: 'files' | 'editor';
  isSplitMode: boolean;
  middlePaneWidth: number;
  activePane: 1 | 2;
  setActivePane: (pane: 1 | 2) => void;
  openedFiles: string[];
  openedFiles2: string[];
  selectedFile: string;
  selectedFile2: string;
  previewFile1?: string | null;
  previewFile2?: string | null;
  editorContent: string;
  editorContent2: string;
  setEditorContent: (val: string) => void;
  setEditorContent2: (val: string) => void;
  localFiles: Record<string, string>;
  onSelectFile: (file: string, pane: 1 | 2) => void;
  onCloseTab: (file: string, pane: 1 | 2) => void;
  onPinTab: (file: string, pane: 1 | 2) => void;
  onSaveFile: (content: string, file: string) => void;
  resolveImage: (src: string, file: string) => Promise<string>;
  onPasteImage: (file: File) => Promise<string>;
  onRenameImage: (old: string, name: string) => Promise<string>;
  draggingTab: any;
  setDraggingTab: (val: any) => void;
  middlePaneResponder: any;
  fontFamilyCode: string;
  deferredContent: string;
  deferredContent2: string;
  previewRef1: React.RefObject<any>;
  previewRef2: React.RefObject<any>;
  editorRef1: React.RefObject<any>;
  editorRef2: React.RefObject<any>;
  onTabContextMenu?: (e: any, file: string, paneId: 1 | 2) => void;
  isDark: boolean;
}

export function EditorWorkspace({
  activeTab, isSplitMode, middlePaneWidth, activePane, setActivePane,
  openedFiles, openedFiles2, selectedFile, selectedFile2,
  editorContent, editorContent2, setEditorContent, setEditorContent2,
  localFiles, onSelectFile, onCloseTab, onPinTab, onSaveFile, resolveImage,
  onPasteImage, onRenameImage, draggingTab, setDraggingTab,
  middlePaneResponder, fontFamilyCode,
  previewFile1, previewFile2,
  previewRef1, previewRef2, editorRef1, editorRef2,
  onTabContextMenu, isDark
}: EditorWorkspaceProps) {
  const { colors } = useTheme();

  const renderContent = (paneId: 1 | 2) => {
    const selFile = paneId === 1 ? selectedFile : selectedFile2;
    const content = paneId === 1 ? editorContent : editorContent2;
    const setContent = paneId === 1 ? setEditorContent : setEditorContent2;

    if (!selFile) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <Text style={{ color: colors.textMuted }}>파일을 선택해주세요.</Text>
        </View>
      );
    }

    if (/\.(png|jpe?g|gif|webp)$/i.test(selFile)) {
      return <ImageViewer uri={localFiles[selFile]} name={selFile} fontFamilyCode={fontFamilyCode} />;
    }

    if (activeTab === 'files') {
      return (
        <Preview 
          ref={paneId === 1 ? previewRef1 : previewRef2}
          key={`preview-${paneId}-${selFile}`}
          content={content} 
          resolveImage={(src) => resolveImage(src, selFile)} 
        />
      );
    }

    return (
      <Editor 
        ref={paneId === 1 ? editorRef1 : editorRef2}
        key={`${paneId}-${selFile}`}
        value={content} 
        onChange={setContent} 
        resolveImage={(src) => resolveImage(src, selFile)} 
        onPasteImage={onPasteImage} 
        onRenameImage={onRenameImage}
        onSave={(val: string) => onSaveFile(val, selFile)}
        isDark={isDark}
      />
    );
  };

  const renderPane = (paneId: 1 | 2) => {
    const isMain = paneId === 1;
    const paneWidth = isMain && isSplitMode ? middlePaneWidth : undefined;
    const flex = isMain && !isSplitMode ? 1 : (isMain ? undefined : 1);

    const paneOpenedFiles = [...(paneId === 1 ? openedFiles : openedFiles2)];
    const panePreviewFile = paneId === 1 ? previewFile1 : previewFile2;
    
    if (panePreviewFile && !paneOpenedFiles.includes(panePreviewFile)) {
      paneOpenedFiles.push(panePreviewFile);
    }

    return (
      <View 
        id={`pane-${paneId}`}
        style={{ flex, width: paneWidth, position: 'relative', minHeight: 0, height: '100%' }}
        onTouchStart={() => setActivePane(paneId)}
        {...({ onClick: () => setActivePane(paneId) } as any)}
      >
        <TabBar 
          files={paneOpenedFiles} 
          previewFile={paneId === 1 ? previewFile1 : previewFile2}
          selectedFile={paneId === 1 ? selectedFile : selectedFile2}
          onSelect={(f) => onSelectFile(f, paneId)}
          onClose={(f) => onCloseTab(f, paneId)}
          onPin={(f) => onPinTab(f, paneId)}
          onContextMenu={onTabContextMenu}
          paneId={paneId}
          onSetDraggingTab={setDraggingTab}
        />
        <View style={{ flex: 1, minHeight: 0, height: '100%' }}>
          {renderContent(paneId)}
        </View>
      </View>
    );
  };

  return (
    <View 
      accessibilityRole="main"
      style={{ flex: 1, flexDirection: 'row', minHeight: 0, height: '100%' }}>
      {renderPane(1)}
      {isSplitMode && (
        <>
          <View 
            accessibilityRole="separator"
            accessibilityLabel="창 크기 조절"
            {...middlePaneResponder.panHandlers} 
            style={{ width: 14, marginLeft: -7, marginRight: -7, cursor: 'col-resize', zIndex: 10 } as any} 
          />
          {renderPane(2)}
        </>
      )}
    </View>
  );
}
