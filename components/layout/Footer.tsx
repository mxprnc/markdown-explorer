import React, { memo } from 'react';
import { View, StyleSheet, Platform, Text, Pressable } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import GeminiChat from '@/components/GeminiChat';
import { useTheme } from '@/contexts/ThemeContext';
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
}

export const Footer = memo(({ height, responder, selectedFile, editorContent, onSaveChatToFile, fileList, isCollapsed, onToggleCollapse, isResizing }: FooterProps) => {
  const { colors, fontFamilyCode } = useTheme();
  
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
          />
        </View>
      )}

      {/* Path Display Bar */}
      <View style={[styles.footerPath, { backgroundColor: colors.primary }]}>
        <Pressable 
          onPress={() => {
            console.log('[Footer] Toggle button pressed');
            onToggleCollapse?.();
          }} 
          style={styles.toggleBtn}
        >
          <Ionicons name={isCollapsed ? "chevron-up" : "chevron-down"} size={14} color="#FFF" />
        </Pressable>
        <Ionicons name="link-outline" size={12} color="#FFF" style={{ marginRight: 6 }} />
        <Text 
          numberOfLines={1} 
          ellipsizeMode="middle" 
          style={[styles.footerPathText, { fontFamily: fontFamilyCode, flex: 1 }]}
        >
          {selectedFile ? decodePath(selectedFile) : 'No file selected'}
        </Text>
        <View style={{ marginLeft: 'auto', flexDirection: 'row', gap: 12 }}>
          <Text style={[styles.footerPathText, { fontFamily: fontFamilyCode }]}>UTF-8</Text>
          <Text style={[styles.footerPathText, { fontFamily: fontFamilyCode }]}>Markdown</Text>
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
    paddingHorizontal: 8,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  }
});
