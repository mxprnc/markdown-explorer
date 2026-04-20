import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FileTree } from './FileTree';
import { ContextMenu } from './ContextMenu';
import { useTheme } from '@/contexts/ThemeContext';

interface FileExplorerProps {
  leftPaneWidth: number;
  leftPaneResponder: any;
  fileSystemData: any[];
  selectedFile: string;
  selectedFile2: string;
  expandedFolders: Record<string, boolean>;
  hoveredItemPath: string | null;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
  onMouseEnter: (path: string) => void;
  onMouseLeave: () => void;
  onOpenDirectory: () => void;
  contextMenu: { x: number, y: number, visible: boolean, item: any };
  setContextMenu: (val: any) => void;
  onDelete: (item: any) => void;
  onRenameRequest: (item: any) => void;
  onCreateRequest: (parentPath: string, kind: 'file' | 'directory') => void;
  creatingItem: { parentPath: string, kind: 'file' | 'directory' } | null;
  creationName: string;
  setCreationName: (val: string) => void;
  onConfirmCreation: () => void;
  onCancelCreation: () => void;
  setDraggingTab: (val: any) => void;
}

export function FileExplorer({
  leftPaneWidth, leftPaneResponder, fileSystemData, 
  selectedFile, selectedFile2, expandedFolders, hoveredItemPath,
  onSelect, onToggle, onMouseEnter, onMouseLeave, onOpenDirectory,
  contextMenu, setContextMenu, onDelete, onRenameRequest, onCreateRequest,
  creatingItem, creationName, setCreationName, onConfirmCreation, onCancelCreation,
  setDraggingTab
}: FileExplorerProps) {
  const { colors, isDark, fontFamilyUI } = useTheme();
  
  return (
    <View nativeID="explorer-pane" id="explorer-pane" style={[styles.paneLeft, { width: leftPaneWidth, backgroundColor: colors.surface, borderRightColor: colors.border }]}>
      <View style={[styles.paneHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.paneTitle, { color: colors.textMuted }]}>Explorer</Text>
        <Pressable onPress={onOpenDirectory} style={styles.headerBtn}>
          <Ionicons name="folder-open-outline" size={16} color={colors.primary} />
        </Pressable>
      </View>
      <ScrollView style={styles.scroll}>
        {fileSystemData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No folder opened.</Text>
            <Pressable onPress={onOpenDirectory} style={[styles.openBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.openBtnText}>Open Folder</Text>
            </Pressable>
          </View>
        ) : (
          <FileTree 
            items={fileSystemData}
            selectedFile={selectedFile}
            selectedFile2={selectedFile2}
            expandedFolders={expandedFolders}
            hoveredItemPath={hoveredItemPath}
            onSelect={onSelect}
            onToggle={onToggle}
            onContextMenu={(e, item) => {
              if (Platform.OS === 'web') {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, visible: true, item });
              }
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onRenameRequest={onRenameRequest}
            creatingItem={creatingItem}
            creationName={creationName}
            setCreationName={setCreationName}
            onConfirmCreation={onConfirmCreation}
            onCancelCreation={onCancelCreation}
            setDraggingTab={setDraggingTab}
          />
        )}
      </ScrollView>

      {/* Resize Handle */}
      {Platform.OS === 'web' && (
        <View 
          {...leftPaneResponder.panHandlers} 
          style={styles.resizeHandle}
        />
      )}

      <ContextMenu 
        {...contextMenu}
        onClose={() => setContextMenu({ ...contextMenu, visible: false })}
        onRename={onRenameRequest}
        onDelete={onDelete}
        onCreateFile={(path) => onCreateRequest(path, 'file')}
        onCreateFolder={(path) => onCreateRequest(path, 'directory')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  paneLeft: {
    borderRightWidth: 1,
    position: 'relative',
  },
  paneHeader: {
    padding: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paneTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  headerBtn: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  openBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  openBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  resizeHandle: {
    position: 'absolute',
    right: -5,
    top: 0,
    bottom: 0,
    width: 10,
    cursor: 'col-resize',
    zIndex: 10,
  } as any,
});
