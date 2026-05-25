import React, { memo } from 'react';
import { View, StyleSheet, Platform, Text, Pressable } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import GeminiChat from '@/components/GeminiChat';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSettings } from '@/contexts/SettingsContext';
import { decodePath } from '@/utils/TabUtils';
import { Resizer } from '@/components/ui/Resizer';

interface FooterProps {
  height: any; // Reanimated SharedValue
  responder: any;
  selectedFile: string;
  editorContent: string;
  onSaveChatToFile: (filename: string, content: string) => Promise<boolean>;
  fileList: string[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isResizing?: boolean;
  chatMessages?: any[];
  onSaveActiveChat?: (newMessages: any[]) => Promise<void>;
  onUpdateMessageFeedback?: (msgIndex: number, feedback: 'like' | 'dislike' | null) => Promise<void>;
  onMaximize?: () => void;
  highlightInfo?: any;
  onClearHighlight?: () => void;
}

export const Footer = memo(({ height, responder, selectedFile, editorContent, onSaveChatToFile, fileList, isCollapsed, onToggleCollapse, isResizing, chatMessages, onSaveActiveChat, onUpdateMessageFeedback, onMaximize, highlightInfo, onClearHighlight }: FooterProps) => {
  const { colors, fontFamilyCode, fontSizeUI } = useTheme();
  const { setSettingsVisible } = useAppSettings();
  
  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View 
      nativeID="gemini-footer" 
      id="gemini-footer" 
      accessibilityRole={Platform.OS === 'web' ? 'contentinfo' : 'none'}
      style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }, animatedStyle]}
    >
      {/* Resize Handle for Footer */}
      {Platform.OS === 'web' && !isCollapsed && (
        <Resizer 
          type="horizontal"
          isResizing={!!isResizing}
          responder={responder}
          style={styles.resizeHandle}
        />
      )}
      
      {!isCollapsed && (
        <View style={{ flex: 1 }}>
          <GeminiChat 
            currentContent={editorContent} 
            onSaveChatToFile={onSaveChatToFile}
            fileList={fileList}
            onClose={onToggleCollapse}
            chatMessages={chatMessages}
            onSaveActiveChat={onSaveActiveChat}
            onUpdateMessageFeedback={onUpdateMessageFeedback}
            onMaximize={onMaximize}
            highlightInfo={highlightInfo}
            onClearHighlight={onClearHighlight}
          />
        </View>
      )}

      {/* Path Display Bar */}
      <View style={[styles.footerPath, { backgroundColor: colors.primary, height: fontSizeUI + 11 }]}>
        <Pressable 
          onPress={() => {
            console.log('[Footer] Toggle button pressed');
            onToggleCollapse?.();
          }} 
          style={styles.toggleBtn}
        >
          <Ionicons name={isCollapsed ? "chevron-up" : "chevron-down"} size={fontSizeUI + 1} color="#FFF" />
        </Pressable>
        <Ionicons name="link-outline" size={fontSizeUI - 1} color="#FFF" style={{ marginRight: 6 }} />
        <Text 
          numberOfLines={1} 
          ellipsizeMode="middle" 
          style={[styles.footerPathText, { fontFamily: fontFamilyCode, flex: 1, fontSize: fontSizeUI - 2 }]}
        >
          {selectedFile ? decodePath(selectedFile) : 'No file selected'}
        </Text>
        <View style={{ marginLeft: 'auto', flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Text style={[styles.footerPathText, { fontFamily: fontFamilyCode, fontSize: fontSizeUI - 2 }]}>UTF-8</Text>
          <Text style={[styles.footerPathText, { fontFamily: fontFamilyCode, fontSize: fontSizeUI - 2 }]}>Markdown</Text>
          <Pressable 
            onPress={() => setSettingsVisible(true)}
            style={({ hovered }: any) => [
              { padding: 4, borderRadius: 4 },
              hovered && { backgroundColor: 'rgba(255,255,255,0.2)' }
            ]}
          >
            <Ionicons name="settings-outline" size={fontSizeUI + 1} color="#FFF" />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  resizeHandle: {
    position: 'absolute',
    top: -5,
    left: 0,
    right: 0,
    height: 10,
    cursor: 'ns-resize',
    zIndex: 100,
  } as any,
  footerPath: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  footerPathText: { 
    color: '#FFF', 
    fontSize: 11, 
    fontWeight: 'bold',
  },
  toggleBtn: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any
});
