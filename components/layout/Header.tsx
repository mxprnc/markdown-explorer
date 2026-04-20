import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  selectedFolder: string;
  activeTab: 'files' | 'editor';
  setActiveTab: (tab: 'files' | 'editor') => void;
}

export const Header = memo(({ 
  selectedFolder, activeTab, setActiveTab
}: HeaderProps) => {
  const { colors, themeMode, toggleTheme, fontFamilyUI } = useTheme();

  return (
    <View 
      accessibilityRole="header"
      nativeID="app-header"
      style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
      <View style={styles.headerLeft}>
        <Text style={[styles.logoText, { color: colors.text, fontFamily: fontFamilyUI }]}>Mark Explorer</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: colors.textMuted, fontFamily: fontFamilyUI, fontWeight: '600' }]}>
            {selectedFolder || '폴더를 열어주세요'}
          </Text>
          <Ionicons name="folder-open-outline" size={14} color={colors.primary} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable 
          onPress={() => setActiveTab('files')}
          style={[styles.tabBtn, activeTab === 'files' && { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <Ionicons name="documents-outline" size={18} color={activeTab === 'files' ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabBtnText, { color: activeTab === 'files' ? colors.text : colors.textMuted, fontFamily: fontFamilyUI }]}>탐색기</Text>
        </Pressable>
        <Pressable 
          onPress={() => setActiveTab('editor')}
          style={[styles.tabBtn, activeTab === 'editor' && { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <Ionicons name="code-working-outline" size={18} color={activeTab === 'editor' ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabBtnText, { color: activeTab === 'editor' ? colors.text : colors.textMuted, fontFamily: fontFamilyUI }]}>에디터</Text>
        </Pressable>

        <Pressable onPress={toggleTheme} style={[styles.themeBtn, { borderColor: colors.border }]}>
          <Ionicons 
            name={themeMode === 'light' ? 'moon-outline' : 'sunny-outline'} 
            size={18} 
            color={colors.text} 
          />
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    height: 48,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontWeight: 'bold', fontSize: 16, marginRight: 24 },
  headerTitle: { fontSize: 14, marginRight: 8 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    marginHorizontal: 4,
    cursor: 'pointer',
  } as any,
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  themeBtn: {
    marginLeft: 16,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    cursor: 'pointer',
  } as any,
  actionIcon: {
    color: '#3B82F6',
    fontSize: 16,
  },
});
