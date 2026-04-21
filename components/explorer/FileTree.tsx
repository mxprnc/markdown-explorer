import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FileItem } from './FileItem';
import { useTheme } from '@/contexts/ThemeContext';

interface FileTreeProps {
  items: any[];
  depth?: number;
  parentPath?: string;
  selectedFile: string;
  selectedFile2: string;
  expandedFolders: Record<string, boolean>;
  hoveredItemPath: string | null;
  onSelect: (path: string, isPreview?: boolean) => void;
  onToggle: (path: string) => void;
  onContextMenu: (e: any, item: any) => void;
  onMouseEnter: (path: string) => void;
  onMouseLeave: () => void;
  onRenameRequest: (item: any) => void;
  creatingItem: { parentPath: string, kind: 'file' | 'directory' } | null;
  creationName: string;
  setCreationName: (val: string) => void;
  onConfirmCreation: () => void;
  onCancelCreation: () => void;
  setDraggingTab: (val: any) => void;
}

export function FileTree({
  items, depth = 0, parentPath = '', 
  selectedFile, selectedFile2, expandedFolders, hoveredItemPath,
  onSelect, onToggle, onContextMenu, onMouseEnter, onMouseLeave, onRenameRequest,
  creatingItem, creationName, setCreationName, onConfirmCreation, onCancelCreation,
  setDraggingTab
}: FileTreeProps) {
  const { colors, isDark } = useTheme();
  
  const renderList = () => {
    const list = items.map((item) => {
      const isSelected = selectedFile === item.path || selectedFile2 === item.path;
      const isExpanded = !!expandedFolders[item.path];

      return (
        <View key={item.path}>
          <FileItem 
            item={item}
            depth={depth}
            isSelected={isSelected}
            isExpanded={isExpanded}
            hoveredItemPath={hoveredItemPath}
            onSelect={onSelect}
            onToggle={onToggle}
            onContextMenu={onContextMenu}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onRenameRequest={onRenameRequest}
            setDraggingTab={setDraggingTab}
          />
          {(isExpanded && item.children) ? (
            <FileTree 
              items={item.children}
              depth={depth + 1}
              parentPath={item.path}
              selectedFile={selectedFile}
              selectedFile2={selectedFile2}
              expandedFolders={expandedFolders}
              hoveredItemPath={hoveredItemPath}
              onSelect={onSelect}
              onToggle={onToggle}
              onContextMenu={onContextMenu}
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
          ) : null}
        </View>
      );
    });

    if (creatingItem && creatingItem.parentPath === parentPath) {
      list.push(
        <View key="creation-input" style={[styles.creationInput, { paddingLeft: 30 + depth * 12 }]}>
          <Text style={{ fontSize: 13, marginRight: 4 }}>{creatingItem.kind === 'directory' ? '📁' : '📄'}</Text>
          <div style={{ flex: 1 }}>
            <input
              autoFocus
              value={creationName}
              onChange={(e) => setCreationName(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.nativeEvent.isComposing) return;
                if (e.key === 'Enter') onConfirmCreation();
                if (e.key === 'Escape') onCancelCreation();
              }}
              onBlur={() => {
                if (!creationName) onCancelCreation();
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

  return <>{renderList()}</>;
}

const styles = StyleSheet.create({
  creationInput: {
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  }
});
