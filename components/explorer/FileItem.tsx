import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface FileItemProps {
  item: any;
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
  hoveredItemPath: string | null;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
  onContextMenu: (e: any, item: any) => void;
  onMouseEnter: (path: string) => void;
  onMouseLeave: () => void;
  onRenameRequest: (item: any) => void;
  isDark: boolean;
  colors: any;
  setDraggingTab: (val: any) => void;
}

export function FileItem({
  item, depth, isSelected, isExpanded, hoveredItemPath,
  onSelect, onToggle, onContextMenu, onMouseEnter, onMouseLeave, onRenameRequest,
  isDark, colors, setDraggingTab
}: FileItemProps) {
  const isImage = /\.(png|jpe?g|gif|webp)$/i.test(item.name);
  const isDoc = /\.(md|txt)$/i.test(item.name);
  const isHovered = hoveredItemPath === item.path;

  const handleCopyPath = async (e: any) => {
    e.stopPropagation();
    const p = `./${item.path}`;
    await Clipboard.setStringAsync(p);
    if (Platform.OS === 'web') window.alert(`상대 경로가 복사되었습니다:\n${p}`);
  };

  const fileContent = (
    <View style={[
      styles.itemContainer,
      { paddingLeft: (item.kind === 'directory' ? 12 : 30) + depth * 12 },
      isSelected && [styles.selectedItem, { borderLeftColor: colors.primary, backgroundColor: isDark ? '#2D3748' : '#EFF6FF', paddingLeft: (item.kind === 'directory' ? 9 : 27) + depth * 12 }],
      isHovered && !isSelected && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }
    ]}>
      {item.kind === 'directory' && (
        <Ionicons 
          name={isExpanded ? "chevron-down" : "chevron-forward"} 
          size={14} 
          color={colors.textMuted} 
          style={{ marginRight: 4 }}
        />
      )}
      <Text 
        numberOfLines={1} 
        style={[
          styles.itemText,
          { color: isDoc || item.kind === 'directory' ? colors.text : colors.textMuted },
          item.kind === 'directory' && { fontWeight: '500' },
          isSelected && { fontWeight: 'bold', color: colors.primary }
        ]}
      >
        {item.kind === 'directory' ? '📁' : (isImage ? '🖼️' : '📄')} {item.name}
      </Text>

      {isHovered && (
        <View style={styles.actionGroup}>
          <Pressable onPress={handleCopyPath} style={styles.actionBtn}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>@</Text>
          </Pressable>
          <Pressable 
            onPress={(e) => { e.stopPropagation(); onRenameRequest(item); }}
            style={styles.actionBtn}
          >
            <Ionicons name="pencil-outline" size={14} color={colors.primary} />
          </Pressable>
        </View>
      )}
    </View>
  );

  const wrapperProps = {
    onPress: () => item.kind === 'directory' ? onToggle(item.path) : onSelect(item.path),
    onContextMenu: (e: any) => onContextMenu(e, item),
    onMouseEnter: () => onMouseEnter(item.path),
    onMouseLeave: onMouseLeave,
  } as any;

  if (Platform.OS === 'web') {
    return (
      <div
        draggable={item.kind === 'file'}
        onDragStart={(e: any) => {
          if (item.kind === 'file' && e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", item.path);
            setDraggingTab({ file: item.path, sourcePane: 0 });
          }
        }}
        onDragEnd={() => setDraggingTab(null)}
        style={{ cursor: item.kind === 'file' ? 'grab' : 'default' } as any}
      >
        <Pressable {...wrapperProps}>
          {fileContent}
        </Pressable>
      </div>
    );
  }

  return (
    <Pressable {...wrapperProps}>
      {fileContent}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    paddingVertical: 6,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedItem: {
    borderLeftWidth: 3,
  },
  itemText: {
    fontSize: 13,
    flex: 1,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    padding: 2,
  }
});
