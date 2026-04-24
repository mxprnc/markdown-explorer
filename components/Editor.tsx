import React from 'react';
import { TextInput, Platform, View, Text, StyleSheet } from 'react-native';

export default React.forwardRef(function Editor({ value, onChange, onSave, onPasteImage, onRenameImage, resolveImage, isDark, onSelectionChange }: { value: string, onChange: (v: string) => void, onSave?: (v: string) => void, onPasteImage?: (file: any) => Promise<string>, onRenameImage?: (oldSrc: string, newName: string) => Promise<string>, resolveImage?: (src: string) => Promise<string>, isDark: boolean, onSelectionChange?: (selection: { start: number, end: number }) => void }, ref: any) {
  const inputRef = React.useRef<TextInput>(null);

  React.useImperativeHandle(ref, () => ({
    scrollToHeading: (index: number, text: string) => {
      if (!inputRef.current) return;
      const lines = (value || '').split('\n');
      let currentIdx = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().endsWith(text) && line.trim().startsWith('#')) {
          inputRef.current.focus();
          inputRef.current.setSelection(currentIdx, currentIdx + line.length);
          return;
        }
        currentIdx += line.length + 1;
      }
    },
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
  }));

  // Improved Markdown parser for highlighting
  const renderHighlightedText = (text: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const isLastLine = lineIdx === lines.length - 1;
      
      // Heading
      const headingMatch = line.match(/^(#{1,6})\s(.*)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const fontSize = level === 1 ? 26 : level === 2 ? 22 : level === 3 ? 20 : 18;
        return (
          <Text key={lineIdx}>
            <Text style={{ color: isDark ? '#4B5563' : '#9CA3AF', fontWeight: '400' }}>{headingMatch[1]} </Text>
            <Text style={{ fontSize, fontWeight: '700', color: isDark ? '#FFFFFF' : '#000000' }}>{headingMatch[2]}</Text>
            {!isLastLine && '\n'}
          </Text>
        );
      }

      // List item (Visual Bullet replacement)
      const listMatch = line.match(/^(\s*)([-*+])(\s+)(.*)/);
      if (listMatch) {
        const indent = listMatch[1];
        const bullet = '•'; // Visual replacement
        const space = listMatch[3];
        const content = listMatch[4];
        return (
          <Text key={lineIdx}>
            <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>{indent}{bullet}{space}</Text>
            <Text>{renderInlineFormatting(content)}</Text>
            {!isLastLine && '\n'}
          </Text>
        );
      }

      // Numbered List
      const numListMatch = line.match(/^(\s*\d+\.\s+)(.*)/);
      if (numListMatch) {
        return (
          <Text key={lineIdx}>
            <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>{numListMatch[1]}</Text>
            <Text>{renderInlineFormatting(numListMatch[2])}</Text>
            {!isLastLine && '\n'}
          </Text>
        );
      }

      // Blockquote
      if (line.startsWith('>')) {
        return (
          <Text key={lineIdx} style={{ color: isDark ? '#9CA3AF' : '#4B5563', fontStyle: 'italic' }}>
            {line}
            {!isLastLine && '\n'}
          </Text>
        );
      }

      // Default line with inline parsing
      return (
        <Text key={lineIdx}>
          {renderInlineFormatting(line)}
          {!isLastLine && '\n'}
        </Text>
      );
    });
  };

  const renderInlineFormatting = (text: string) => {
    if (!text) return '';
    const parts = [];
    let lastIdx = 0;
    // Enhanced regex to better handle Unicode/Korean
    const regex = /(\*\*[\s\S]+?\*\*|`[\s\S]+?`|\*[\s\S]+?\*)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index));
      }
      
      const content = match[0];
      if (content.startsWith('**')) {
        parts.push(<Text key={match.index} style={{ fontWeight: 'bold', color: isDark ? '#E5E7EB' : '#111827' }}>{content}</Text>);
      } else if (content.startsWith('`')) {
        parts.push(<Text key={match.index} style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6', color: isDark ? '#FCA5A5' : '#EF4444', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>{content}</Text>);
      } else if (content.startsWith('*')) {
        parts.push(<Text key={match.index} style={{ fontStyle: 'italic' }}>{content}</Text>);
      }
      
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx));
    }
    
    return parts.length > 0 ? parts : text;
  };

  return (
    <View style={{ flex: 1, width: '100%', backgroundColor: isDark ? '#111827' : '#FFFFFF' }}>
      <TextInput
        ref={inputRef}
        onChangeText={onChange}
        onSelectionChange={(e) => onSelectionChange?.(e.nativeEvent.selection)}
        multiline
        placeholder="Start writing..."
        placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
        style={{
          flex: 1,
          width: '100%',
          padding: 20,
          color: isDark ? '#E5E7EB' : '#111827',
          fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
          fontSize: 16,
          lineHeight: 24,
          textAlignVertical: 'top',
          minHeight: '100%',
        }}
      >
        {renderHighlightedText(value || '')}
      </TextInput>
    </View>
  );
});
