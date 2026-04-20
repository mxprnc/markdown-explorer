import React, { memo, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface TabBarProps {
  paneId: 1 | 2;
  files: string[];
  previewFile?: string | null;
  selectedFile: string;
  onSelect: (file: string) => void;
  onClose: (file: string) => void;
  onPin?: (file: string) => void;
  onContextMenu?: (e: any, file: string, paneId: 1 | 2) => void;
  onSetDraggingTab: (val: any) => void;
}

export const TabBar = memo(({
  paneId, files, previewFile, selectedFile, onSelect, onClose, onPin, onContextMenu, onSetDraggingTab
}: TabBarProps) => {
  const { colors, fontFamilyUI } = useTheme();
  const lastClickRef = useRef<{ time: number, file: string } | null>(null);
  
  const handleTabPress = (file: string) => {
    const now = Date.now();
    const lastClick = lastClickRef.current;
    
    if (lastClick && lastClick.file === file && now - lastClick.time < 300) {
      // Double click detected
      onPin && onPin(file);
      lastClickRef.current = null;
    } else {
      lastClickRef.current = { time: now, file };
      onSelect(file);
    }
  };
  
  if (files.length === 0) {
    return (
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        <Text style={{ color: colors.textMuted, fontSize: 12, paddingHorizontal: 12 }}>No file opened</Text>
      </View>
    );
  }

  return (
    <View 
      accessibilityRole="tablist"
      style={[styles.tabBar, { borderBottomColor: colors.border }]}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {files.map(file => {
          const isActive = file === selectedFile;
          const isPreview = file === previewFile;
          const fileName = file.split('/').pop() || file;

          const tabContent = (
            <Pressable 
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[
                styles.tabItem, 
                { backgroundColor: colors.surface, borderRightColor: colors.border }, 
                isActive && [styles.tabItemActive, { borderTopColor: colors.primary, backgroundColor: colors.background }]
              ]}
              onPress={() => handleTabPress(file)} 
              onContextMenu={(e) => onContextMenu && onContextMenu(e, file, paneId)}
            >
              <Text 
                selectable={false} 
                style={[
                  styles.tabText, 
                  { color: colors.textMuted, fontFamily: fontFamilyUI }, 
                  isActive && [styles.tabTextActive, { color: colors.text }],
                  isPreview && { fontStyle: 'italic' }
                ]}
              >
                {fileName}
              </Text>
              <Pressable 
                onPress={(e) => { 
                  if (Platform.OS === 'web') e.preventDefault();
                  e.stopPropagation(); 
                  onClose(file); 
                }} 
                style={styles.tabCloseBtn}
              >
                <Text selectable={false} style={[styles.tabCloseText, { color: colors.textMuted }]}>✕</Text>
              </Pressable>
            </Pressable>
          );

          if (Platform.OS === 'web') {
            return (
              <div 
                key={file} 
                draggable="true"
                onDragStart={(e: any) => {
                  if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", file);
                  }
                  onSetDraggingTab({ file, sourcePane: paneId });
                }}
                onDragEnd={() => {
                  onSetDraggingTab(null);
                }}
                style={{ display: 'flex', flexDirection: 'row', userSelect: 'none', WebkitUserSelect: 'none', cursor: 'grab' } as any}
              >
                {tabContent}
              </div>
            );
          }

          return (
            <View key={file} style={{ flexDirection: 'row' }}>
              {tabContent}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 38,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
    borderRightWidth: 1,
    borderTopWidth: 2,
    borderTopColor: 'transparent',
  },
  tabItemActive: {
  },
  tabText: {
    fontSize: 12,
    marginRight: 6,
  },
  tabTextActive: {
    fontWeight: 'bold',
  },
  tabCloseBtn: {
    padding: 4,
    borderRadius: 4,
  },
  tabCloseText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
