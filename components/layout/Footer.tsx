import React, { memo } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GeminiChat from '@/components/GeminiChat';
import { useTheme } from '@/contexts/ThemeContext';

interface FooterProps {
  height: number;
  responder: any;
  selectedFile: string;
  editorContent: string;
  onSaveChatToFile: (filename: string, content: string) => Promise<boolean>;
  fileList: string[];
}

export const Footer = memo(({ height, responder, selectedFile, editorContent, onSaveChatToFile, fileList }: FooterProps) => {
  const { colors, fontFamilyCode } = useTheme();
  return (
    <View 
      nativeID="gemini-footer" 
      id="gemini-footer" 
      accessibilityRole="contentinfo"
      style={[styles.footer, { height, borderTopColor: colors.border, backgroundColor: colors.surface }]}
    >
      {/* Resize Handle for Footer */}
      {Platform.OS === 'web' && (
        <View 
          {...responder.panHandlers} 
          style={styles.resizeHandle}
        />
      )}
      
      <GeminiChat 
        currentContent={editorContent} 
        onSaveChatToFile={onSaveChatToFile}
        fileList={fileList}
      />

      {/* Path Display Bar */}
      <View style={[styles.footerPath, { backgroundColor: colors.primary }]}>
        <Ionicons name="link-outline" size={12} color="#FFF" style={{ marginRight: 6 }} />
        <Text style={styles.footerPathText}>
          {selectedFile || 'No file selected'}
        </Text>
        <View style={{ marginLeft: 'auto', flexDirection: 'row', gap: 12 }}>
          <Text style={styles.footerPathText}>UTF-8</Text>
          <Text style={styles.footerPathText}>Markdown</Text>
        </View>
      </View>
    </View>
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
    position: 'absolute',
    bottom: 0, 
    left: 0, 
    right: 0,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  footerPathText: { 
    color: '#FFF', 
    fontSize: 11, 
    fontWeight: 'bold',
    fontFamily: fontFamilyCode,
  },
});
