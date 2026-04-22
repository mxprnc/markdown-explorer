import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

export default function MarkdownPreview({ content, isDark, resolveImage }: { content: string, isDark: boolean, resolveImage?: (src: string) => Promise<string> }) {
  const styles = StyleSheet.create({
    body: { color: isDark ? '#F3F4F6' : '#121212', fontSize: 14, lineHeight: 24 },
    heading1: { color: isDark ? '#FFFFFF' : '#000000', marginTop: 16, marginBottom: 8 },
    heading2: { color: isDark ? '#E5E7EB' : '#1F2937', marginTop: 12, marginBottom: 6 },
    hr: { backgroundColor: isDark ? '#374151' : '#E5E7EB' },
    blockquote: { backgroundColor: isDark ? '#1F2937' : '#F3F4F6', color: isDark ? '#D1D5DB' : '#4B5563' },
    code_inline: { backgroundColor: isDark ? '#374151' : '#F3F4F6', color: isDark ? '#FCA5A5' : '#EF4444' },
    code_block: { backgroundColor: isDark ? '#111827' : '#F3F4F6', color: isDark ? '#E5E7EB' : '#1F2937' },
  });

  return (
    <ScrollView style={{ padding: 24 }}>
      <Markdown style={styles}>
        {content}
      </Markdown>
    </ScrollView>
  );
}
