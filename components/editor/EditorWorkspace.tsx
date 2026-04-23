import React from 'react';
import { View, Text, ScrollView, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Editor from '@/components/Editor';
import MarkdownPreview from '@/components/preview/MarkdownPreview';
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
  onDropTab?: (file: string, sourcePane: 1 | 2, targetPane: 1 | 2, targetIndex: number) => void;
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
  onHeadingVisible?: (index: number) => void;
  onOpenDirectory?: () => void;
  selectedFolder: string;
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
  onTabContextMenu, isDark, onDropTab, onHeadingVisible,
  onOpenDirectory, selectedFolder
}: EditorWorkspaceProps) {
  const { colors, fontFamilyUI } = useTheme();
  const [dragOverPane, setDragOverPane] = React.useState<number | null>(null);

  // Stable handlers using refs to avoid re-render issues during drag
  const onDropTabRef = React.useRef(onDropTab);
  React.useEffect(() => { onDropTabRef.current = onDropTab; }, [onDropTab]);

  const handleDragEnter = (e: any, paneId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    setDragOverPane(paneId);
  };

  const handleDragLeave = (e: any) => {
    e.stopPropagation();
    setDragOverPane(null);
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  };

  const renderContent = (paneId: 1 | 2) => {
    const selFile = paneId === 1 ? selectedFile : selectedFile2;
    const content = paneId === 1 ? editorContent : editorContent2;
    const setContent = paneId === 1 ? setEditorContent : setEditorContent2;

    if (!selFile) {
      return (
        <View 
          style={{ 
            flex: 1, 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: 40, 
            backgroundColor: dragOverPane === paneId ? (isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)') : 'transparent',
            borderWidth: dragOverPane === paneId ? 2 : 0,
            borderColor: colors.primary,
            borderStyle: 'dashed'
          }}
          {...({
            onDragOver: handleDragOver,
            onDragEnter: (e: any) => handleDragEnter(e, paneId),
            onDragLeave: (e: any) => handleDragLeave(e),
          } as any)}
        >
          <Ionicons name="folder-open-outline" size={48} color={colors.primary} style={{ marginBottom: 16 }} />
          {!selectedFolder ? (
            <>
              <Text style={{ color: colors.text, fontSize: 18, fontFamily: fontFamilyUI, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
                Welcome to Mark Explorer
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 14, fontFamily: fontFamilyUI, marginBottom: 24, textAlign: 'center' }}>
                Open a local folder to start exploring and editing your Markdown files.
              </Text>
              <View 
                style={{ 
                  backgroundColor: colors.primary, 
                  paddingHorizontal: 24, 
                  paddingVertical: 12, 
                  borderRadius: 8,
                }}
              >
                <Text 
                  onPress={onOpenDirectory}
                  style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', fontFamily: fontFamilyUI }}
                >
                  Open Folder
                </Text>
              </View>
            </>
          ) : (
            <Text style={{ color: colors.textMuted, fontSize: 16, fontFamily: fontFamilyUI }}>Please select a file.</Text>
          )}
        </View>
      );
    }

    if (/\.(png|jpe?g|gif|webp)$/i.test(selFile)) {
      return <ImageViewer uri={localFiles[selFile]} name={selFile} fontFamilyCode={fontFamilyCode} />;
    }

    if (activeTab === 'files') {
      return (
        <MarkdownPreview 
          ref={paneId === 1 ? previewRef1 : previewRef2}
          key={`preview-${paneId}-${selFile}`}
          content={content} 
          isDark={isDark}
          resolveImage={(src) => resolveImage(src, selFile)} 
          onHeadingVisible={paneId === activePane ? onHeadingVisible : undefined}
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
        onHeadingVisible={paneId === activePane ? onHeadingVisible : undefined}
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
        key={`pane-${paneId}`}
        id={`pane-${paneId}`}
        style={[
          { flex, width: paneWidth, position: 'relative', minHeight: 0, height: '100%' },
          styles.pane, 
          { borderRightWidth: isSplitMode && paneId === 1 ? 1 : 0, borderRightColor: colors.border },
          dragOverPane === paneId && { backgroundColor: colors.surface }
        ]}
        onTouchStart={() => setActivePane(paneId)}
        {...({ 
          onClick: () => setActivePane(paneId),
          onDragOver: handleDragOver,
          onDragEnter: (e: any) => handleDragEnter(e, paneId),
          onDragLeave: (e: any) => handleDragLeave(e),
          onDrop: (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverPane(null);
            const rawData = e.dataTransfer.getData("text/plain");
            let file = rawData;
            let sourcePane = 0;
            
            if (rawData.includes(':')) {
              const parts = rawData.split(':');
              sourcePane = parseInt(parts[0]);
              file = parts.slice(1).join(':');
            } else {
              const sourcePaneStr = e.dataTransfer.getData("application/x-pane-id");
              sourcePane = sourcePaneStr ? parseInt(sourcePaneStr) : (draggingTab?.sourcePane || 0);
              file = rawData || draggingTab?.file;
            }
            
            if (onDropTabRef.current && file) {
              onDropTabRef.current(file, sourcePane as any, paneId as 1 | 2, 999);
            }
          }
        } as any)}
      >
        <TabBar 
          files={paneOpenedFiles} 
          previewFile={paneId === 1 ? previewFile1 : previewFile2}
          selectedFile={paneId === 1 ? selectedFile : selectedFile2}
          onSelect={(f) => onSelectFile(f, false, paneId as 1 | 2)}
          onClose={(f) => onCloseTab(f, paneId as 1 | 2)}
          onPin={(f) => onPinTab(f, paneId)}
          onContextMenu={onTabContextMenu}
          paneId={paneId}
          onSetDraggingTab={setDraggingTab}
          onDropTab={onDropTab}
          isDraggingOver={dragOverPane === paneId}
        />
        <View style={{ flex: 1, minHeight: 0, height: '100%' }}>
          {renderContent(paneId)}
        </View>
      </View>
    );
  };

  return (
    <View 
      accessibilityRole={Platform.OS === 'web' ? 'main' : 'none'}
      style={{ flex: 1, flexDirection: 'row', minHeight: 0, height: '100%' }}>
      {renderPane(1)}
      {isSplitMode && (
        <>
          <View 
            accessibilityRole={Platform.OS === 'web' ? 'separator' : 'none'}
            accessibilityLabel="Resize panes"
            {...middlePaneResponder.panHandlers} 
            style={{ width: 14, marginLeft: -7, marginRight: -7, cursor: 'col-resize', zIndex: 10 } as any} 
          />
          {renderPane(2)}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pane: {
    flex: 1,
    minHeight: 0,
    height: '100%',
    overflow: 'hidden',
  },
});
