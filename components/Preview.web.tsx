import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Ionicons } from '@expo/vector-icons';

export default function Preview({ content, isDark }: { content: string, isDark: boolean }) {
  const color = isDark ? '#F3F4F6' : '#121212';
  return (
    <div className="markdown-preview" style={{ padding: '24px', color, fontSize: '14px', lineHeight: '1.6', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .markdown-preview blockquote {
          border-left: 4px solid #3B82F6;
          margin: 0;
          padding-left: 16px;
          color: ${isDark ? '#9CA3AF' : '#6B7280'};
        }
        .markdown-preview h1, .markdown-preview h2 {
          border-bottom: 1px solid ${isDark ? '#374151' : '#E5E7EB'};
          padding-bottom: 0.3em;
        }
      `}</style>
      <ReactMarkdown
        components={{
          code(props: any) {
            const {children, className, node, ...rest} = props;
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            
            const handleCopy = () => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(codeString)
                  .then(() => window.alert('코드 블록이 복사되었습니다.'))
                  .catch(err => console.error('Failed to copy', err));
              }
            };
      
            return match ? (
              <div style={{ position: 'relative', marginBottom: '16px', marginTop: '16px' }}>
                <div style={{
                  position: 'absolute',
                  top: '-1px', // align with top border
                  left: '16px',
                  padding: '4px 12px',
                  backgroundColor: isDark ? '#374151' : '#E5E7EB',
                  borderBottomLeftRadius: '6px',
                  borderBottomRightRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  fontFamily: "'Inter', sans-serif",
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  textTransform: 'uppercase',
                  zIndex: 10,
                  border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
                  borderTop: 'none',
                }}>
                  {match[1]}
                </div>
                <div 
                  onClick={handleCopy}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '6px 10px',
                    backgroundColor: isDark ? '#374151' : '#E5E7EB',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isDark ? '1px solid #4B5563' : '1px solid #D1D5DB'
                  }}
                  title="코드 복사"
                >
                  <Ionicons name="copy-outline" size={14} color={isDark ? '#D1D5DB' : '#4B5563'} style={{ marginRight: 4 }} />
                  <span style={{ fontSize: '12px', color: isDark ? '#D1D5DB' : '#4B5563', fontWeight: 'bold' }}>복사</span>
                </div>
                <SyntaxHighlighter
                  {...rest}
                  PreTag="div"
                  children={codeString}
                  language={match[1]}
                  style={isDark ? oneDark : oneLight}
                  showLineNumbers={true}
                  customStyle={{
                    borderRadius: '8px',
                    padding: '16px',
                    paddingTop: '36px',
                    margin: 0,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: '13px',
                    backgroundColor: isDark ? '#111827' : '#F9FAFB',
                    border: isDark ? '1px solid #374151' : '1px solid #E5E7EB'
                  }}
                  lineNumberStyle={{
                    minWidth: '2.5em',
                    paddingRight: '1em',
                    color: isDark ? '#4B5563' : '#9CA3AF',
                    textAlign: 'right'
                  }}
                />
              </div>
            ) : (
              <code 
                {...rest} 
                className={className}
                style={{
                  backgroundColor: isDark ? '#374151' : '#F3F4F6',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  color: isDark ? '#FCA5A5' : '#EF4444'
                }}
              >
                {children}
              </code>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
