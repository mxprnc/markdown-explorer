import React from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
import { TabBar } from '@/components/layout/TabBar';
import { ImageViewer } from '@/components/preview/ImageViewer';

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
  editorContent: string;
  editorContent2: string;
  setEditorContent: (val: string) => void;
  setEditorContent2: (val: string) => void;
  localFiles: Record<string, string>;
  onSelectFile: (file: string, pane: 1 | 2) => void;
  onCloseTab: (file: string, pane: 1 | 2) => void;
  onSaveFile: (content: string, file: string) => void;
  resolveImage: (src: string, file: string) => Promise<string>;
  onPasteImage: (file: File) => Promise<string>;
  onRenameImage: (old: string, name: string) => Promise<string>;
  draggingTab: any;
  setDraggingTab: (val: any) => void;
  middlePaneResponder: any;
  isDark: boolean;
  colors: any;
  fontFamilyCode: string;
  deferredContent: string;
  deferredContent2: string;
}

export function EditorWorkspace({
  activeTab, isSplitMode, middlePaneWidth, activePane, setActivePane,
  openedFiles, openedFiles2, selectedFile, selectedFile2,
  editorContent, editorContent2, setEditorContent, setEditorContent2,
  localFiles, onSelectFile, onCloseTab, onSaveFile, resolveImage,
  onPasteImage, onRenameImage, draggingTab, setDraggingTab,
  middlePaneResponder, isDark, colors, fontFamilyCode,
  deferredContent, deferredContent2
}: EditorWorkspaceProps) {

  const renderContent = (paneId: 1 | 2) => {
    const selFile = paneId === 1 ? selectedFile : selectedFile2;
    const content = paneId === 1 ? (activeTab === 'files' ? deferredContent : editorContent) : (activeTab === 'files' ? deferredContent2 : editorContent2);
    const setContent = paneId === 1 ? setEditorContent : setEditorContent2;

    if (!selFile) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <Text style={{ color: colors.textMuted }}>파일을 선택해주세요.</Text>
        </View>
      );
    }

    if (/\.(png|jpe?g|gif|webp)$/i.test(selFile)) {
      return <ImageViewer uri={localFiles[selFile]} name={selFile} isDark={isDark} colors={colors} fontFamilyCode={fontFamilyCode} />;
    }

    if (activeTab === 'files') {
      return (
        <Preview 
          content={content} 
          isDark={isDark} 
          resolveImage={(src) => resolveImage(src, selFile)} 
        />
      );
    }

    return (
      <Editor 
        key={`${paneId}-${selFile}`}
        value={content} 
        onChange={setContent} 
        isDark={isDark} 
        resolveImage={(src) => resolveImage(src, selFile)} 
        onPasteImage={onPasteImage} 
        onRenameImage={onRenameImage}
        onSave={(val: string) => onSaveFile(val, selFile)}
      />
    );
  };

  const renderPane = (paneId: 1 | 2) => {
    const isMain = paneId === 1;
    const paneWidth = isMain && isSplitMode ? middlePaneWidth : undefined;
    const flex = isMain && !isSplitMode ? 1 : (isMain ? undefined : 1);

    return (
      <View 
        id={`pane-${paneId}`}
        style={{ flex, width: paneWidth, position: 'relative' }}
        onTouchStart={() => setActivePane(paneId)}
        {...({ onClick: () => setActivePane(paneId) } as any)}
      >
        <TabBar 
          paneId={paneId}
          tabs={isMain ? openedFiles : openedFiles2}
          selectedFile={isMain ? selectedFile : selectedFile2}
          activePane={activePane}
          onSelect={onSelectFile}
          onClose={onCloseTab}
          onSetDraggingTab={setDraggingTab}
          isDark={isDark}
          colors={colors}
        />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
          {renderContent(paneId)}
        </ScrollView>
      </View>
    );
  };

  return (
    <View 
      accessibilityRole="main"
      style={{ flex: 1, flexDirection: 'row' }}>
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
