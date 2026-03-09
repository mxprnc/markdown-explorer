import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Ionicons } from '@expo/vector-icons';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';

function Mermaid({ chart, isDark }: { chart: string, isDark: boolean }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'default' });
    const renderChart = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substring(7)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError('');
      } catch (e: any) {
        console.error('Mermaid rendering error:', e);
        setError(e?.message || 'Invalid mermaid syntax');
      }
    };
    if (chart) renderChart();
  }, [chart, isDark]);

  if (error) {
    return <div style={{ color: isDark ? '#FCA5A5' : '#EF4444', backgroundColor: isDark ? '#374151' : '#F3F4F6', padding: '16px', borderRadius: '8px', margin: '20px 0', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{error}</div>;
  }

  return <div className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }} />;
}

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
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a(props: any) {
            const { href, children, node, ...rest } = props;
            const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s<)]*)?/;
            const match = href ? ytRegex.exec(href) : null;
            
            if (match) {
              const src = `https://www.youtube.com/embed/${match[1]}`;
              return (
                <div style={{ position: 'relative', margin: '16px 0', width: '100%', maxWidth: '560px', display: 'block' }}>
                  <iframe
                    src={src}
                    width="100%"
                    height="315"
                    style={{ borderRadius: '8px', border: 'none' }}
                    allowFullScreen
                  />
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', gap: '8px' }}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '14px',
                        color: '#3b82f6',
                        textDecoration: 'none',
                        wordBreak: 'break-all',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      {href}
                    </a>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const btn = e.currentTarget;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(href).then(() => {
                            const originalHtml = btn.innerHTML;
                            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                            setTimeout(() => {
                              btn.innerHTML = originalHtml;
                            }, 2000);
                          });
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        borderRadius: '4px'
                      }}
                      title="주소 복사"
                      onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                      dangerouslySetInnerHTML={{ __html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>` }}
                    />
                  </div>
                </div>
              );
            }
            return <a href={href} {...rest} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>{children}</a>;
          },
          img(props: any) {
            const { src, alt, node, ...rest } = props;
            let finalAlt = alt || '';
            let widthStyle = '100%';
            
            if (finalAlt.includes('|width=')) {
              const parts = finalAlt.split('|width=');
              finalAlt = parts[0];
              widthStyle = parts[1];
            }
            
            return (
              <img 
                src={src} 
                alt={finalAlt} 
                style={{ maxWidth: '100%', width: widthStyle, borderRadius: '8px', display: 'block', margin: '16px 0' }} 
                {...rest} 
              />
            );
          },
          code(props: any) {
            const {children, className, node, ...rest} = props;
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            
            if (match && match[1] === 'mermaid') {
              return <Mermaid chart={codeString} isDark={isDark} />;
            }
            
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
