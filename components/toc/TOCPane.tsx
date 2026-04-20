import React, { memo, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TOCPaneProps {
  content: string;
  width: number;
  onTOCClick: (text: string, index: number) => void;
  isDark: boolean;
  colors: any;
  responder: any;
}

export const TOCPane = memo(({ content, width, onTOCClick, isDark, colors, responder }: TOCPaneProps) => {
  const tocList = useMemo(() => {
    const lines = content.split('\n');
    const toc: TOCItem[] = [];
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;
      
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        toc.push({
          id: `toc-${i}`,
          level: match[1].length,
          text: match[2].replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_~`]/g, '')
        });
      }
    }
    return toc;
  }, [content]);

  return (
    <View nativeID="toc-pane" id="toc-pane" accessibilityRole="complementary" style={[styles.paneTOC, { width, borderLeftColor: colors.border, backgroundColor: colors.surface }]}>
      {/* Resize Handle for TOC Pane */}
      {Platform.OS === 'web' && (
        <View 
          {...responder.panHandlers} 
          style={styles.resizeHandle}
        />
      )}
      <View style={[styles.paneHeader, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Text style={[styles.paneTitle, { color: colors.textMuted }]}>목차 (TOC)</Text>
      </View>
      <ScrollView style={{ flex: 1 }}>
        {tocList.length === 0 ? (
          <View style={{ padding: 16 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>작성된 헤딩(제목)이 없습니다.</Text>
          </View>
        ) : (
          tocList.map((item, index) => (
            <Pressable key={item.id} onPress={() => onTOCClick(item.text, index)}>
              <View style={{ 
                paddingVertical: 8, 
                paddingRight: 12,
                paddingLeft: 12 + (item.level - 1) * 12,
                borderBottomWidth: 1, 
                borderBottomColor: isDark ? '#374151' : '#F3F4F6',
                cursor: 'pointer'
              } as any}>
                <Text 
                  numberOfLines={1} 
                  style={{ 
                    color: item.level === 1 ? colors.text : colors.textMuted, 
                    fontSize: item.level <= 2 ? 13 : 12,
                    fontWeight: item.level <= 2 ? 'bold' : 'normal',
                    fontFamily: 'Inter, sans-serif'
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
