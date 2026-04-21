import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/contexts/ThemeContext';

interface FileItemProps {
  item: any;
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
  hoveredItemPath: string | null;
  onSelect: (path: string, isPreview?: boolean) => void;
  onToggle: (path: string) => void;
  onContextMenu: (e: any, item: any) => void;
  onMouseEnter: (path: string) => void;
  onMouseLeave: () => void;
  onRenameRequest: (item: any) => void;
  setDraggingTab: (val: any) => void;
}

export function FileItem({
  item, depth, isSelected, isExpanded, hoveredItemPath,
  onSelect, onToggle, onContextMenu, onMouseEnter, onMouseLeave, onRenameRequest,
  setDraggingTab
}: FileItemProps) {
  const { colors, isDark, fontFamilyUI } = useTheme();
  const isImage = /\.(png|jpe?g|gif|webp)$/i.test(item.name);
  const isDarkTheme = isDark;
  const isDoc = /\.(md|txt)$/i.test(item.name);
  const isHovered = hoveredItemPath === item.path;

  const lastClickTime = React.useRef<number>(0);
  const clickTimer = React.useRef<any>(null);

  const handlePress = () => {
    if (item.kind === 'directory') {
      onToggle(item.path);
      return;
    }

    const now = Date.now();
    const DOUBLE_CLICK_DELAY = 300;

    if (now - lastClickTime.current < DOUBLE_CLICK_DELAY) {
      // Double Click
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
        clickTimer.current = null;
      }
      onSelect(item.path, false); // Permanent
      lastClickTime.current = 0;
    } else {
      // Single Click (Potential)
      lastClickTime.current = now;
      clickTimer.current = setTimeout(() => {
        onSelect(item.path, true); // Preview
        clickTimer.current = null;
      }, DOUBLE_CLICK_DELAY);
    }
  };

  const handleCopyPath = async (e: any) => {
    e.stopPropagation();
    const p = `./${item.path}`;
    try {
      await Clipboard.setStringAsync(p);
      if (Platform.OS === 'web') {
        window.alert(`상대 경로가 복사되었습니다:\n${p}`);
      }
    } catch (error) {
      console.error('Failed to copy path:', error);
    }
  };

  const fileContent = (
    <View 
      testID={`explorer-item-${item.path}`}
      style={[
        styles.itemContainer,
        { paddingLeft: (item.kind === 'directory' ? 12 : 30) + depth * 12 },
        isSelected ? [styles.selectedItem, { borderLeftColor: colors.primary, backgroundColor: isDark ? '#2D3748' : '#EFF6FF', paddingLeft: (item.kind === 'directory' ? 9 : 27) + depth * 12 }] : {},
        (isHovered && !isSelected) ? { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' } : {}
      ]}
    >
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
          { color: isDoc || item.kind === 'directory' ? colors.text : colors.textMuted, fontFamily: fontFamilyUI },
          item.kind === 'directory' && { fontWeight: '500' },
          isSelected && { fontWeight: 'bold', color: colors.primary }
        ]}
      >
        {item.kind === 'directory' ? '📁' : (isImage ? '🖼️' : '📄')} {item.name}
      </Text>

      {isHovered && (
        <View style={styles.actionGroup}>
          <Pressable 
            onPress={handleCopyPath} 
            style={styles.actionBtn}
            testID={`explorer-item-copy-${item.path}`}
          >
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>@</Text>
          </Pressable>
          <Pressable 
            onPress={(e) => { e.stopPropagation(); onRenameRequest(item); }}
            style={styles.actionBtn}
            testID={`explorer-item-rename-${item.path}`}
          >
            <Ionicons name="pencil-outline" size={14} color={colors.primary} />
          </Pressable>
        </View>
      )}
    </View>
  );

  const wrapperProps = {
    onPress: handlePress,
    onContextMenu: (e: any) => onContextMenu(e, item),
    onMouseEnter: () => onMouseEnter(item.path),
    onMouseLeave: onMouseLeave,
  } as any;

  if (Platform.OS === 'web') {
    return (
      <div
        draggable={item.kind === 'file'}
        data-testid={`explorer-item-wrapper-${item.path}`}
        onDragStart={(e: any) => {
          if (item.kind === 'file' && e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", item.path);
            setDraggingTab({ file: item.path, sourcePane: 0 });
          }
        }}
        onDragEnd={() => setDraggingTab(null)}
      >
        <Pressable {...wrapperProps} style={{ cursor: 'pointer' } as any}>
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
    cursor: 'pointer',
  } as any
});
