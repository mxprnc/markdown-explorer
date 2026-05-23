import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  selectedFolder: string;
  activeTab: 'files' | 'editor';
  setActiveTab: (tab: 'files' | 'editor') => void;
  isSplitMode: boolean;
  onSplitToggle: () => void;
  isMobile?: boolean;
  isSidebarOpen?: boolean;
  onMenuPress?: () => void;
  onOpenDirectory?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onTocPress?: () => void;
  isTocOpen?: boolean;
  activeFile?: string | null;
  onFileTitlePress?: () => void;
  isGeminiOpen?: boolean;
  onGeminiPress?: () => void;
}

export const Header = memo(({ 
  selectedFolder, activeTab, setActiveTab, isSplitMode, onSplitToggle,
  isMobile, isSidebarOpen, onMenuPress, onOpenDirectory, onSave, isSaving,
  onUndo, onRedo, canUndo, canRedo,
  onTocPress, isTocOpen,
  activeFile, onFileTitlePress,
  isGeminiOpen, onGeminiPress
}: HeaderProps) => {
  const { colors, themeMode, toggleTheme, fontFamilyUI, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const truncateMiddle = (str: string, maxLen: number = 20) => {
    if (!str || str.length <= maxLen) return str;
    const mid = Math.floor(maxLen / 2);
    return str.substring(0, mid) + '...' + str.substring(str.length - mid);
  };

  const fileName = activeFile ? decodeURIComponent(activeFile).split('/').pop() || '' : '';

  return (
    <View 
      accessibilityRole={Platform.OS === 'web' ? 'header' : 'none'}
      nativeID="app-header"
      style={[
        styles.header, 
        { 
          borderBottomColor: colors.border, 
          backgroundColor: colors.surface,
          paddingTop: insets.top,
          height: 48 + insets.top
        }
      ]}
    >
      <View style={styles.headerLeft}>
        <Pressable 
          onPress={() => {
            console.log('[Header] Menu button pressed');
            onMenuPress?.();
          }} 
          style={{ padding: 8 }}
        >
          <Ionicons name="menu-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.headerCenter}>
        {isMobile && activeTab === 'editor' && activeFile && (
          <Pressable 
            onPress={onFileTitlePress}
            style={styles.fileTitleBtn}
          >
            <Text style={[styles.fileTitleText, { color: colors.text, fontFamily: fontFamilyUI }]}>
              {truncateMiddle(fileName, 18)}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.textMuted} style={{ marginLeft: 4 }} />
          </Pressable>
        )}
      </View>

      <View style={styles.headerRight}>
        <View style={styles.tabContainer}>
          <Pressable 
            onPress={() => setActiveTab('files')} 
            style={[styles.tabBtn, activeTab === 'files' && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            testID="header-files-btn"
          >
            <Ionicons name="folder-open-outline" size={18} color={activeTab === 'files' ? colors.primary : colors.textMuted} />
            {!isMobile && <Text style={[styles.tabBtnText, { color: activeTab === 'files' ? colors.text : colors.textMuted, fontFamily: fontFamilyUI }]}>Files</Text>}
          </Pressable>
          <Pressable 
            onPress={() => setActiveTab('editor')} 
            style={[styles.tabBtn, activeTab === 'editor' && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            testID="header-editor-btn"
          >
            <Ionicons name="document-text-outline" size={18} color={activeTab === 'editor' ? colors.primary : colors.textMuted} />
            {!isMobile && <Text style={[styles.tabBtnText, { color: activeTab === 'editor' ? colors.text : colors.textMuted, fontFamily: fontFamilyUI }]}>Editor</Text>}
          </Pressable>
          
          {onTocPress && (
            <Pressable 
              onPress={onTocPress} 
              style={[styles.tabBtn, isTocOpen && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
              testID="header-toc-btn"
            >
              <Ionicons name={isTocOpen ? "list" : "list-outline"} size={20} color={isTocOpen ? colors.primary : colors.textMuted} />
            </Pressable>
          )}
        </View>

        {!isMobile && <View style={{ width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: 8 }} />}

        {!isMobile && (
          <Pressable 
            onPress={onSplitToggle}
            style={[styles.tabBtn, isSplitMode && { backgroundColor: colors.surface, borderColor: colors.primary }]}
            testID="header-split-btn"
          >
            <Ionicons 
              name={isSplitMode ? "copy" : "copy-outline"} 
              size={18} 
              color={isSplitMode ? colors.primary : colors.textMuted} 
            />
            <Text style={[styles.tabBtnText, { color: isSplitMode ? colors.text : colors.textMuted, fontFamily: fontFamilyUI }]}>Split View</Text>
          </Pressable>
        )}

        {onUndo && (
          <View style={{ flexDirection: 'row', marginRight: 8 }}>
            <Pressable 
              onPress={onUndo} 
              style={[styles.themeBtn, { borderColor: colors.border, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0, opacity: canUndo ? 1 : 0.3 }]}
              disabled={!canUndo}
            >
              <Ionicons name="arrow-undo-outline" size={18} color={colors.text} />
            </Pressable>
            <Pressable 
              onPress={onRedo} 
              style={[styles.themeBtn, { borderColor: colors.border, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, opacity: canRedo ? 1 : 0.3 }]}
              disabled={!canRedo}
            >
              <Ionicons name="arrow-redo-outline" size={18} color={colors.text} />
            </Pressable>
          </View>
        )}

        {onSave && (
          <Pressable 
            onPress={onSave} 
            style={[styles.themeBtn, { borderColor: colors.border, marginRight: 8 }]}
            disabled={isSaving}
          >
            <Ionicons 
              name={isSaving ? "sync-outline" : "save-outline"} 
              size={18} 
              color={isSaving ? colors.primary : colors.text} 
            />
          </Pressable>
        )}

        <View style={styles.tabContainer}>
          <Pressable 
            onPress={() => {
              console.log('[Header] Gemini button pressed');
              onGeminiPress?.();
            }}
            style={({ pressed }) => [
              styles.tabBtn,
              isGeminiOpen && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
              { opacity: pressed ? 0.6 : 1 }
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID="header-gemini-btn"
          >
            <Ionicons 
              name={isGeminiOpen ? 'sparkles' : 'sparkles-outline'} 
              size={18} 
              color={isGeminiOpen ? colors.primary : colors.text} 
            />
            {!isMobile && <Text style={[styles.tabBtnText, { color: isGeminiOpen ? colors.text : colors.textMuted, fontFamily: fontFamilyUI }]}>Gemini</Text>}
          </Pressable>

          <Pressable 
            onPress={toggleTheme} 
            style={({ pressed }) => [
              styles.tabBtn, 
              { opacity: pressed ? 0.6 : 1 }
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID="header-theme-btn"
          >
            <Ionicons 
              name={themeMode === 'light' ? 'moon-outline' : 'sunny-outline'} 
              size={18} 
              color={colors.text} 
            />
          </Pressable>
        </View>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', minWidth: 40 },
  headerCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  fileTitleBtn: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(120,120,128,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fileTitleText: {
    fontSize: 13, 
    fontWeight: '600',
  },
  logoText: { fontWeight: 'bold', fontSize: 16, marginRight: 24 },
  headerTitle: { fontSize: 14, marginRight: 8 },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    minWidth: 44,
    justifyContent: 'center',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  } as any,
  themeBtn: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {})
  } as any,
  actionIcon: {
    color: '#3B82F6',
    fontSize: 16,
  },
});
