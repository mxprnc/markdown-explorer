import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { ViewEntry } from '@/core/workspace/ViewRegistry';
import { App } from '@/core/App';

interface SidebarProps {
  app: App;
  width: number;
  activeViewId: string;
  setActiveViewId: (id: string) => void;
  registeredViews: ViewEntry[];
  // File Explorer specific props (passed down to FileExplorer if active)
  renderFileExplorer: () => React.ReactNode;
}

export function Sidebar({
  app, width, activeViewId, setActiveViewId, registeredViews,
  renderFileExplorer
}: SidebarProps) {
  const { colors, isDark } = useTheme();

  const allSidebarViews = [
    { id: 'files', name: 'Explorer', icon: 'folder-outline' },
    ...registeredViews
  ];

  const renderActiveView = () => {
    if (activeViewId === 'files') {
      return renderFileExplorer();
    }
    
    const view = registeredViews.find(v => v.id === activeViewId);
    if (view && view.component) {
      const Component = view.component;
      return <Component app={app} />;
    }
    
    return null;
  };

  return (
    <View style={[styles.container, { width, borderRightColor: colors.border }]}>
      {/* Sidebar Icon Bar (Left) */}
      <View style={[styles.iconBar, { backgroundColor: colors.background, borderRightColor: colors.border }]}>
        {allSidebarViews.map(view => (
          <Pressable
            key={view.id}
            onPress={() => setActiveViewId(view.id)}
            style={[
              styles.iconBtn,
              activeViewId === view.id && { borderLeftColor: colors.primary }
            ]}
          >
            <Ionicons 
              name={view.icon as any} 
              size={24} 
              color={activeViewId === view.id ? colors.primary : colors.textMuted} 
            />
          </Pressable>
        ))}
      </View>

      {/* Sidebar Content (Right) */}
      <View style={[styles.content, { backgroundColor: colors.surface }]}>
        {renderActiveView()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: '100%',
    borderRightWidth: 1,
  },
  iconBar: {
    width: 48,
    borderRightWidth: 1,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  iconBtn: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
  },
  content: {
    flex: 1,
  },
});
