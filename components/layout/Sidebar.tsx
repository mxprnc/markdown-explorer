import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { AppInstance } from '@/core/AppInstance';
import { ViewEntry } from '@/core/ViewRegistry';

interface SidebarProps {
  app: AppInstance;
  width: any;
  activeViewId: string;
  setActiveViewId: (id: string) => void;
  registeredViews: ViewEntry[];
  renderFileExplorer: () => React.ReactNode;
  isMobile?: boolean;
}

export function Sidebar({ 
  app, width, activeViewId, setActiveViewId, registeredViews, renderFileExplorer, isMobile 
}: SidebarProps) {
  const { colors, isDark } = useTheme();
  const iconBarWidth = isMobile ? 44 : 48;

  const allSidebarViews = [
    { id: 'files', name: 'Explorer', icon: 'folder-outline' },
    ...registeredViews
  ];

  const renderActiveView = () => {
    if (activeViewId === 'files') {
      return renderFileExplorer();
    }
    
    const view = registeredViews.find(v => v.id === activeViewId);
    if (view) {
      return app.viewRegistry.renderView(view.id);
    }
    
    return null;
  };

  return (
    <View style={[styles.container, { width, borderRightColor: colors.border }]}>
      {/* Sidebar Icon Bar (Left) */}
      <View style={[styles.iconBar, { width: iconBarWidth, backgroundColor: colors.background, borderRightColor: colors.border }]}>
        {allSidebarViews.map(view => (
          <Pressable
            key={view.id}
            onPress={() => setActiveViewId(view.id)}
            style={[
              styles.iconBtn,
              activeViewId === view.id && { 
                borderLeftColor: colors.primary,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
              }
            ]}
          >
            <Ionicons 
              name={view.id === activeViewId ? (view.icon.replace('-outline', '') as any) : (view.icon as any)} 
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
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
  },
  iconBtn: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    marginBottom: 8,
  },
  content: {
    flex: 1,
  }
});
