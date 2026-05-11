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
  onExportToNextra: (item: any) => void;
  onCreateYoutubePlaylist?: (parentPath: string) => void;
}

export function ContextMenu({ 
  x, y, visible, item, onClose, onRename, onDelete, onCreateFile, onCreateFolder, onExportToNextra, onCreateYoutubePlaylist
}: ContextMenuProps) {
  const { colors, isDark, fontFamilyUI } = useTheme();
  const menuRef = React.useRef<View>(null);

  React.useEffect(() => {
    if (!visible) return;

    const handleGlobalClick = (e: MouseEvent) => {
      if (menuRef.current) {
        const domNode = menuRef.current as unknown as HTMLElement;
        if (domNode && domNode.contains(e.target as Node)) {
          return;
        }
      }
      onClose();
    };
    const handleGlobalContextMenu = () => onClose();

    // Small delay to prevent current click from closing it immediately
    const timeout = setTimeout(() => {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('click', handleGlobalClick, true);
        window.addEventListener('contextmenu', handleGlobalContextMenu, true);
      }
    }, 10);

    return () => {
      clearTimeout(timeout);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('click', handleGlobalClick, true);
        window.removeEventListener('contextmenu', handleGlobalContextMenu, true);
      }
    };
  }, [visible, onClose]);

  if (!visible || !item) return null;

  return (
    <View 
      ref={menuRef}
      testID="explorer-context-menu"
      style={[
        styles.menu, 
        { top: y, left: x, backgroundColor: colors.background, borderColor: colors.border }
      ]}
    >
      {item.kind === 'directory' && (
        <>
          <Pressable 
            testID="context-menu-new-file"
            onPress={() => { onCreateFile(item.path); onClose(); }} 
            style={({ hovered }: any) => [styles.menuItem, hovered && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }]}
          >
            <Ionicons name="document-outline" size={14} color={colors.text} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>New File</Text>
          </Pressable>
          <Pressable 
            testID="context-menu-new-folder"
            onPress={() => { onCreateFolder(item.path); onClose(); }}
            style={({ hovered }: any) => [styles.menuItem, hovered && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }]}
          >
            <Ionicons name="folder-outline" size={14} color={colors.text} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>New Folder</Text>
          </Pressable>
          {onCreateYoutubePlaylist && (
            <Pressable 
              testID="context-menu-youtube-playlist"
              onPress={() => { onCreateYoutubePlaylist(item.path); onClose(); }}
              style={({ hovered }: any) => [styles.menuItem, hovered && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }]}
            >
              <Ionicons name="logo-youtube" size={14} color="#EF4444" style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>Create Youtube Playlist Note</Text>
            </Pressable>
          )}
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <Pressable 
            testID="context-menu-export-nextra"
            onPress={() => { onExportToNextra(item); onClose(); }}
            style={({ hovered }: any) => [styles.menuItem, hovered && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }]}
          >
            <Ionicons name="share-outline" size={14} color={colors.primary} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: colors.primary, fontFamily: fontFamilyUI, fontWeight: 'bold' }]}>Export to Nextra</Text>
          </Pressable>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
        </>
      )}
      {item.path !== '' && (
        <>
          <Pressable 
            testID="context-menu-rename"
            onPress={() => { onRename(item); onClose(); }}
            style={({ hovered }: any) => [styles.menuItem, hovered && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }]}
          >
            <Ionicons name="pencil-outline" size={14} color={colors.text} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>Rename</Text>
          </Pressable>
          <Pressable 
            testID="context-menu-delete"
            onPress={() => { onDelete(item); onClose(); }}
            style={({ hovered }: any) => [styles.menuItem, hovered && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }]}
          >
            <Ionicons name="trash-outline" size={14} color="#EF4444" style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: '#EF4444', fontFamily: fontFamilyUI }]}>Delete</Text>
          </Pressable>
        </>
      )}
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
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    elevation: 4,
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
