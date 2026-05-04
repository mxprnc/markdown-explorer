import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { CopyButton } from '../ui/CopyButton';

export default function MarkdownPreview({ content, isDark, resolveImage }: { content: string, isDark: boolean, resolveImage?: (src: string) => Promise<string> }) {
  const styles = StyleSheet.create({
    body: { color: isDark ? '#e2e8f0' : '#121212', fontSize: 14, lineHeight: 24 },
    heading1: { color: isDark ? '#ffffff' : '#000000', marginTop: 16, marginBottom: 8 },
    heading2: { color: isDark ? '#e2e8f0' : '#1F2937', marginTop: 12, marginBottom: 6 },
    hr: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB' },
    blockquote: { backgroundColor: isDark ? '#151921' : '#F3F4F6', color: isDark ? '#94a3b8' : '#4B5563', borderLeftWidth: 4, borderLeftColor: isDark ? '#334155' : '#E5E7EB' },
    code_inline: { backgroundColor: isDark ? '#1e293b' : '#F3F4F6', color: isDark ? '#7dd3fc' : '#EF4444' },
    code_block: { backgroundColor: isDark ? '#0b0e14' : '#F3F4F6', color: isDark ? '#e2e8f0' : '#1F2937', borderSize: 0 },
    fence: { backgroundColor: isDark ? '#0b0e14' : '#F3F4F6', color: isDark ? '#e2e8f0' : '#1F2937', borderSize: 0 },
  });

  const renderCodeBlock = (node: any, children: any, language: string) => {
    return (
      <View key={node.key} style={{ 
        marginVertical: 20, 
        borderRadius: 10, 
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
        backgroundColor: isDark ? '#0b0e14' : '#F9FAFB',
        ...Platform.select({
          web: {
            boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.05)',
          },
          default: {}
        })
      }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingHorizontal: 16, 
          paddingVertical: 8,
          backgroundColor: isDark ? '#151921' : '#F8FAFC',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff5f56', marginRight: 6 }} />
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ffbd2e', marginRight: 6 }} />
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#27c93f', marginRight: 12 }} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {language || 'code'}
            </Text>
          </View>
          <CopyButton content={node.content} />
        </View>
        <View style={{ padding: 16 }}>
          {children}
        </View>
      </View>
    );
  };

  const rules = {
    fence: (node: any, children: any, parent: any, styles: any) => {
      return renderCodeBlock(node, children, node.sourceInfo);
    },
    code_block: (node: any, children: any, parent: any, styles: any) => {
      return renderCodeBlock(node, children, 'code');
    },
    link: (node: any, children: any, parent: any, styles: any) => {
      const href = node.attributes.href;
      let text = '';
      if (node.children && node.children.length > 0) {
        text = node.children[0].content || '';
      }
      
      const mxMatch = text.match(/^mx-(thumb|link|video)\s*#\s*(.*)$/i);
      
      if (mxMatch) {
        const type = mxMatch[1].toLowerCase();
        const alt = mxMatch[2].trim();
        
        if (type === 'thumb') {
          return (
            <View key={node.key} style={{ 
              borderWidth: 1, borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e5e7eb', 
              borderRadius: 8, padding: 12, marginVertical: 12, backgroundColor: isDark ? '#1f2937' : '#fff'
            }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: isDark ? '#f3f4f6' : '#111827', marginBottom: 4 }}>{alt}</Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }} numberOfLines={1}>{href}</Text>
            </View>
          );
        }
        
        return (
          <Text key={node.key} style={{ color: '#3b82f6', textDecorationLine: 'none' }}>🔗 {alt || href}</Text>
        );
      }
      
      return <Text key={node.key} style={{ color: '#3b82f6' }}>{children}</Text>;
    },
  };


  return (
    <ScrollView style={{ padding: 24 }}>
      <Markdown style={styles} rules={rules}>
        {content}
      </Markdown>
    </ScrollView>
  );
}

