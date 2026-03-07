import React from 'react';
import CodeMirror, { Extension } from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';

export default function Editor({ value, onChange, isDark }: { value: string, onChange: (v: string) => void, isDark: boolean }) {
  const extensions = [markdown({ base: markdownLanguage })] as Extension[];
  
  return (
    <div style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff', overflow: 'hidden' }}>
      <CodeMirror
        value={value}
        height="100%"
        theme={isDark ? 'dark' : 'light'}
        extensions={extensions}
        onChange={(val) => onChange(val)}
        style={{ height: '100%', fontSize: '14px', fontFamily: 'JetBrains Mono, Fira Code, monospace', padding: '16px' }}
      />
    </div>
  );
}
