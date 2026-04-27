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

  React.useEffect(() => {
    if (!visible) return;

    const handleGlobalClick = () => onClose();
    const handleGlobalContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        onClose();
    };

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

  if (!visible) return null;

  return (
    <View 
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
