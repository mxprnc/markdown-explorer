import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { AppInstance } from '@/core/AppInstance';
import { ViewEntry } from '@/core/ViewRegistry';

const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex || !hex.startsWith('#')) return hex;
  let color = hex.replace('#', '');
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }
  if (color.length === 6) {
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
};

interface SidebarProps {
  app: AppInstance;
  width: any;
  activeViewId: string;
  setActiveViewId: (id: string) => void;
  registeredViews: ViewEntry[];
  renderFileExplorer: () => React.ReactNode;
  renderChatHistoryList?: () => React.ReactNode;
  renderPluginsManager?: () => React.ReactNode;
  isMobile?: boolean;
}

export function Sidebar({ 
  app, width, activeViewId, setActiveViewId, registeredViews, renderFileExplorer, renderChatHistoryList, renderPluginsManager, isMobile 
}: SidebarProps) {
  const { colors, isDark } = useTheme();
  const iconBarWidth = isMobile ? 44 : 48;

  const allSidebarViews = [
    { id: 'files', name: 'Explorer', icon: 'folder-outline' },
    ...registeredViews,
    { id: 'chats', name: 'AI Chats', icon: 'chatbubbles-outline' },
    { id: 'plugins', name: 'Plugins & Themes', icon: 'extension-puzzle-outline' }
  ];

  const renderActiveView = () => {
    if (activeViewId === 'files') {
      return renderFileExplorer();
    }
    if (activeViewId === 'chats' && renderChatHistoryList) {
      return renderChatHistoryList();
    }
    if (activeViewId === 'plugins' && renderPluginsManager) {
      return renderPluginsManager();
    }
    
    const view = registeredViews.find(v => v.id === activeViewId);
    if (view) {
      const ViewComponent = view.component;
      return <ViewComponent app={app} />;
    }
    
    return null;
  };

  return (
    <View style={[styles.container, { width, borderRightColor: colors.border }]}>
      {/* Sidebar Icon Bar (Left) */}
      <View style={[
        styles.iconBar, 
        { 
          width: iconBarWidth, 
          backgroundColor: colors.background, 
          borderRightColor: colors.border,
          ...(Platform.OS === 'web' && isDark ? {
            backgroundColor: hexToRgba(colors.background, 0.95),
            backdropFilter: 'blur(8px)',
          } : {} as any)
        }
      ]}>
        {allSidebarViews.map(view => (
          <Pressable
            key={view.id}
            onPress={() => setActiveViewId(view.id)}
            style={[
              styles.iconBtn,
              activeViewId === view.id && { 
                borderLeftColor: colors.primary,
                backgroundColor: colors.accentGlow
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
      <View style={[
        styles.content, 
        { 
          backgroundColor: colors.surface,
          ...(Platform.OS === 'web' && isDark ? {
            backgroundColor: hexToRgba(colors.surface, 0.85),
            backdropFilter: 'blur(12px)',
          } : {} as any)
        }
      ]}>
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
