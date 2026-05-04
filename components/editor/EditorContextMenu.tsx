import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface EditorContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
  onExtractYoutube: () => void;
}

export function EditorContextMenu({ x, y, visible, onClose, onExtractYoutube }: EditorContextMenuProps) {
  const { colors, isDark, fontFamilyUI } = useTheme();
  const menuRef = React.useRef<View>(null);

  React.useEffect(() => {
    if (!visible) return;

    const handleGlobalClick = (e: MouseEvent) => {
      // If clicking inside the menu, let the Pressable handle it
      if (menuRef.current) {
        const domNode = menuRef.current as unknown as HTMLElement;
        if (domNode && domNode.contains(e.target as Node)) {
          return;
        }
      }
      onClose();
    };
    const handleGlobalContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        onClose();
    };

    const timeout = setTimeout(() => {
      window.addEventListener('click', handleGlobalClick, true);
      window.addEventListener('contextmenu', handleGlobalContextMenu, true);
    }, 10);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('click', handleGlobalClick, true);
      window.removeEventListener('contextmenu', handleGlobalContextMenu, true);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <View 
      ref={menuRef}
      style={[
        styles.menu, 
        { top: y, left: x, backgroundColor: colors.surface, borderColor: colors.border }
      ]}
    >
      <Pressable 
        onPress={() => { onExtractYoutube(); onClose(); }} 
        style={({ hovered }: any) => [
            styles.menuItem, 
            hovered && { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }
        ]}
      >
        <Ionicons name="logo-youtube" size={14} color="#FF0000" style={styles.menuIcon} />
        <Text style={[styles.menuText, { color: colors.text, fontFamily: fontFamilyUI }]}>Extract Youtube playlist</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'fixed',
    width: 200,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    zIndex: 9999,
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  menuIcon: {
    marginRight: 10,
  },
  menuText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
