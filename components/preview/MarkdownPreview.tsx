import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

export default function MarkdownPreview({ content, isDark, resolveImage }: { content: string, isDark: boolean, resolveImage?: (src: string) => Promise<string> }) {
  const styles = StyleSheet.create({
    body: { color: isDark ? '#e2e8f0' : '#121212', fontSize: 14, lineHeight: 24 },
    heading1: { color: isDark ? '#ffffff' : '#000000', marginTop: 16, marginBottom: 8 },
    heading2: { color: isDark ? '#e2e8f0' : '#1F2937', marginTop: 12, marginBottom: 6 },
    hr: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB' },
    blockquote: { backgroundColor: isDark ? '#151921' : '#F3F4F6', color: isDark ? '#94a3b8' : '#4B5563', borderLeftWidth: 4, borderLeftColor: isDark ? '#334155' : '#E5E7EB' },
    code_inline: { backgroundColor: isDark ? '#1e293b' : '#F3F4F6', color: isDark ? '#7dd3fc' : '#EF4444' },
    code_block: { backgroundColor: isDark ? '#0b0e14' : '#F3F4F6', color: isDark ? '#e2e8f0' : '#1F2937', borderSize: 1, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB' },

  });

  return (
    <ScrollView style={{ padding: 24 }}>
      <Markdown style={styles}>
        {content}
      </Markdown>
    </ScrollView>
  );
}
