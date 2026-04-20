import React, { memo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';

interface TabBarProps {
  paneId: 1 | 2;
  tabs: string[];
  selectedFile: string;
  activePane: 1 | 2;
  onSelect: (file: string, paneId: 1 | 2) => void;
  onClose: (file: string, paneId: 1 | 2) => void;
  onSetDraggingTab: (val: any) => void;
  isDark: boolean;
  colors: any;
}

export const TabBar = memo(({
  paneId, tabs, selectedFile, activePane, onSelect, onClose, onSetDraggingTab, isDark, colors
}: TabBarProps) => {
  
  if (tabs.length === 0) {
    return (
      <View style={[styles.tabBar, activePane === paneId && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
        <Text style={{ color: colors.textMuted, fontSize: 12, paddingHorizontal: 12 }}>No file opened</Text>
      </View>
    );
  }

  return (
    <View 
      accessibilityRole="tablist"
      style={[styles.tabBar, activePane === paneId && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {tabs.map(file => {
          const isActive = file === selectedFile;
          const tabContent = (
            <Pressable 
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[styles.tabItem, { backgroundColor: colors.surface, borderRightColor: colors.border }, isActive && [styles.tabItemActive, { borderTopColor: colors.primary, backgroundColor: colors.background }]]}
              onPress={() => onSelect(file, paneId)} 
            >
              <Text selectable={false} style={[styles.tabText, { color: colors.textMuted }, isActive && [styles.tabTextActive, { color: colors.text }]]}>{file}</Text>
              <Pressable 
                onPress={(e) => { 
                  if (Platform.OS === 'web') e.preventDefault();
                  e.stopPropagation(); 
                  onClose(file, paneId); 
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
