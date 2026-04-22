import React, { memo, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { extractTOC } from '@/utils/MarkdownUtils';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TOCPaneProps {
  content: string;
  width: number;
  onTOCClick: (text: string, index: number) => void;
  responder: any;
  activeIndex?: number;
}

export const TOCPane = memo(({ content, width, onTOCClick, responder, activeIndex }: TOCPaneProps) => {
  const { colors, isDark, fontFamilyUI } = useTheme();
  const tocList = useMemo(() => extractTOC(content), [content]);

  return (
    <View nativeID="toc-pane" id="toc-pane" accessibilityRole="complementary" style={[styles.paneTOC, { width, borderLeftColor: colors.border, backgroundColor: colors.surface }]}>
      {/* Resize Handle for TOC Pane */}
      {Platform.OS === 'web' && (
        <View 
          {...responder.panHandlers} 
          style={styles.resizeHandle}
          testID="toc-resize-handle"
        />
      )}
      <View style={[styles.paneHeader, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Text style={[styles.paneTitle, { color: colors.textMuted }]}>Table of Contents</Text>
      </View>
      <ScrollView style={{ flex: 1 }}>
        {tocList.length === 0 ? (
          <View style={{ padding: 16 }} testID="toc-empty-msg">
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>No headings found.</Text>
          </View>
        ) : (
          tocList.map((item, index) => (
            <Pressable key={item.id} onPress={() => onTOCClick(item.text, index)} testID={`toc-item-${index}`}>
              <View style={{ 
                paddingVertical: 8, 
                paddingRight: 12,
                paddingLeft: 12 + (item.level - 1) * 12,
                borderBottomWidth: 1, 
                borderBottomColor: isDark ? '#374151' : '#F3F4F6',
                cursor: 'pointer',
                borderLeftWidth: activeIndex === index ? 3 : 0,
                borderLeftColor: colors.primary,
                backgroundColor: activeIndex === index 
                  ? (isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)')
                  : 'transparent'
              } as any}>
                <Text 
                  numberOfLines={1} 
                  style={{ 
                    color: activeIndex === index ? colors.primary : (item.level === 1 ? colors.text : colors.textMuted), 
                    fontSize: item.level <= 2 ? 13 : 12,
                    fontWeight: (item.level <= 2 || activeIndex === index) ? 'bold' : 'normal',
                    fontFamily: fontFamilyUI
                  }}>
                  {item.text}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  paneTOC: {
    borderLeftWidth: 1,
    position: 'relative',
  },
  paneHeader: {
    padding: 12,
    borderBottomWidth: 1,
  },
  paneTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  resizeHandle: {
    position: 'absolute',
    left: -5,
    top: 0,
    bottom: 0,
    width: 10,
    cursor: 'col-resize',
    zIndex: 10,
  } as any,
});
