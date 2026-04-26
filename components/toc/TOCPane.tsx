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
  width: number | string;
  onTOCClick: (text: string, index: number) => void;
  activeIndex?: number;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onClose?: () => void;
  isResizing?: boolean;
}

const TOCPaneComponent = ({ 
  content, width, onTOCClick, activeIndex, isPinned, onTogglePin, onClose, isResizing 
}: TOCPaneProps) => {
  const { colors, isDark, fontFamilyUI } = useTheme();
  const { Ionicons } = require('@expo/vector-icons');
  const tocList = useMemo(() => extractTOC(content), [content]);

  return (
    <View 
      nativeID="toc-pane" 
      accessibilityRole={Platform.OS === 'web' ? 'complementary' : 'none'} 
      style={[
        styles.paneTOC, 
        { 
          width: width, 
          minWidth: typeof width === 'number' ? 50 : undefined,
          maxWidth: typeof width === 'number' ? 800 : undefined,
          borderLeftColor: colors.border, 
          backgroundColor: colors.surface 
        }
      ]}
    >
      <View style={[styles.paneHeader, { borderBottomColor: colors.border, backgroundColor: colors.background, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={[styles.paneTitle, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>Table of Contents</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {onClose && (
            <Pressable onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
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
                borderBottomColor: colors.border,
                cursor: 'pointer',
                borderLeftWidth: activeIndex === index ? 3 : 0,
                borderLeftColor: colors.primary,
                backgroundColor: activeIndex === index 
                  ? colors.accentGlow 
                  : 'transparent',
                borderTopRightRadius: activeIndex === index ? 6 : 0,
                borderBottomRightRadius: activeIndex === index ? 6 : 0,
              } as any}>
                <Text 
                  numberOfLines={1} 
                  style={{ 
                    color: activeIndex === index ? colors.textHighlight : (item.level === 1 ? colors.text : colors.textMuted), 
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
};

export const TOCPane = memo(TOCPaneComponent);

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
});
