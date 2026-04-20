import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  item: any;
  onClose: () => void;
  onRename: (item: any) => void;
  onDelete: (item: any) => void;
  onCreateFile: (parentPath: string) => void;
  onCreateFolder: (parentPath: string) => void;
}

export function ContextMenu({ 
  x, y, visible, item, onClose, onRename, onDelete, onCreateFile, onCreateFolder
}: ContextMenuProps) {
  const { colors, isDark, fontFamilyUI } = useTheme();

  React.useEffect(() => {
    if (!visible) return;

    const handleGlobalClick = () => onClose();
    const handleGlobalContextMenu = () => onClose();

    // Small delay to prevent current click from closing it immediately
    const timeout = setTimeout(() => {
      window.addEventListener('click', handleGlobalClick);
      window.addEventListener('contextmenu', handleGlobalContextMenu);
    }, 10);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('contextmenu', handleGlobalContextMenu);
    };
  }, [visible, onClose]);

  if (!visible || !item) return null;

  return (
    <View style={[
      styles.menu, 
      { top: y, left: x, backgroundColor: colors.background, borderColor: colors.border }
    ]}>
      {item.kind === 'directory' && (
        <>
          <Pressable 
            onPress={() => { onCreateFile(item.path); onClose(); }} 
            style={({ hovered }: any) => [styles.menuItem, hovered && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }]}
          >
            <Ionicons name="document-outline" size={14} color={colors.text} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>New File</Text>
          </Pressable>
          <Pressable 
            onPress={() => { onCreateFolder(item.path); onClose(); }}
            style={({ hovered }: any) => [styles.menuItem, hovered && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }]}
          >
            <Ionicons name="folder-outline" size={14} color={colors.text} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>New Folder</Text>
          </Pressable>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
        </>
      )}
      <Pressable 
        onPress={() => { onRename(item); onClose(); }}
        style={({ hovered }: any) => [styles.menuItem, hovered && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }]}
      >
        <Ionicons name="pencil-outline" size={14} color={colors.text} style={styles.menuIcon} />
        <Text style={[styles.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>Rename</Text>
      </Pressable>
      <Pressable 
        onPress={() => { onDelete(item); onClose(); }}
        style={({ hovered }: any) => [styles.menuItem, hovered && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }]}
      >
        <Ionicons name="trash-outline" size={14} color="#EF4444" style={styles.menuIcon} />
        <Text style={[styles.menuText, { color: '#EF4444', fontFamily: fontFamilyUI }]}>Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'fixed',
    width: 160,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    zIndex: 1000,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } as any,
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 4 }
    })
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuIcon: {
    marginRight: 8,
  },
  menuText: {
    fontSize: 13,
  },
  separator: {
    height: 1,
    marginVertical: 4,
  }
});
