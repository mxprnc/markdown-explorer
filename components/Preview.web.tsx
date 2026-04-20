import React, { useState, useEffect, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useMarkdownWorker } from '../hooks/useMarkdownWorker';
import mermaid from 'mermaid';
import equal from 'fast-deep-equal';
import { findBestHeadingMatch } from '@/utils/MarkdownUtils';

mermaid.initialize({ startOnLoad: false, theme: 'default' });

/**
 * Mermaid Component (Memoized)
 */
const Mermaid = React.memo(({ chart, isDark }: { chart: string, isDark: boolean }) => {
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
    return <span style={{ display: 'block', color: isDark ? '#FCA5A5' : '#EF4444', backgroundColor: isDark ? '#374151' : '#F3F4F6', padding: '16px', borderRadius: '8px', margin: '20px 0', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{error}</span>;
  }

  return <span className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }} />;
}, (prev, next) => prev.chart === next.chart && prev.isDark === next.isDark);

/**
 * HAST Node Renderer
 */
const HastRenderer = ({ node, components, isDark, resolveImage }: any): any => {
  if (!node) return null;
  
  if (node.type === 'text') {
    // Return the text content
    return node.value;
  }
  
  if (node.type === 'element') {
    const { tagName, properties, children } = node;
    
    // 1. Handle table-related whitespace issues
    // HTML tables don't allow text nodes as direct children of table, thead, tbody, tr
    const tableTags = ['table', 'thead', 'tbody', 'tfoot', 'tr'];
    const filteredChildren = children?.filter((child: any) => {
      if (tableTags.includes(tagName) && child.type === 'text' && !child.value.trim()) {
        return false; // Skip whitespace only nodes in tables
      }
      return true;
    });

    const Component = components[tagName] || tagName;
    
    // Map HAST properties to React props
    const props: any = { ...properties };
    if (props.class) {
      props.className = props.class;
      delete props.class;
    }

    // 2. Handle Void Elements (hr, br, img, etc.)
    // These tags cannot have children or dangerouslySetInnerHTML in React
    const voidElements = ['hr', 'br', 'img', 'input', 'meta', 'link'];
    if (voidElements.includes(tagName)) {
      const extraProps: any = {};
      if (tagName === 'img') {
        extraProps.isDark = isDark;
        extraProps.resolveImage = resolveImage;
      }
      return <Component {...props} {...extraProps} />;
    }

    if (tagName === 'code') {
      const codeString = children?.map((c: any) => c.type === 'text' ? c.value : '').join('') || '';
      return <Component {...props} isDark={isDark} children={codeString} />;
    }

    const extraProps: any = {};
    if (tagName === 'a' || tagName === 'img') {
      extraProps.isDark = isDark;
      extraProps.resolveImage = resolveImage;
    }

    return (
      <Component {...props} {...extraProps}>
        {filteredChildren?.map((child: any, i: number) => (
          <HastRenderer 
            key={i} 
            node={child} 
            components={components} 
            isDark={isDark} 
            resolveImage={resolveImage} 
          />
        ))}
      </Component>
    );
  }
  
  return null;
};

/**
 * Memoized Block Component for Goal 2
 */
const MarkdownBlock = React.memo(({ node, components, isDark, resolveImage }: any) => {
  return (
    <HastRenderer 
      node={node} 
      components={components} 
      isDark={isDark} 
      resolveImage={resolveImage} 
    />
  );
}, (prev, next) => {
  return (
    prev.isDark === next.isDark &&
    prev.resolveImage === next.resolveImage &&
    equal(prev.node, next.node)
  );
});

/**
 * Preview Component
 */
const Preview = forwardRef(({ content, isDark, resolveImage }: { content: string, isDark: boolean, resolveImage?: (src: string) => Promise<string> }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { hast, isParsing, workerError } = useMarkdownWorker(content);

  useImperativeHandle(ref, () => ({
    scrollToHeading: (index: number, text?: string) => {
      if (containerRef.current) {
        const headings = Array.from(containerRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        
        // Find all headings matching the text
        const matches: { element: HTMLElement, index: number }[] = [];
        headings.forEach((el, idx) => {
          if (text && (el as HTMLElement).innerText.trim() === text.trim()) {
            matches.push({ element: el as HTMLElement, index: idx });
          }
        });

        // Use utility to find the best match
        const bestMatch = findBestHeadingMatch(matches, index);
        let target: HTMLElement | null = bestMatch ? bestMatch.element : (headings[index] as HTMLElement || null);

        if (target) {
          const container = containerRef.current;
          const containerRect = container.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const relativeTop = targetRect.top - containerRect.top;
          const targetScrollTop = container.scrollTop + relativeTop;

          container.scrollTo({
            top: Math.max(0, targetScrollTop - 150),
            behavior: 'smooth'
          });
        }
      }
    }
  }));
  const color = isDark ? '#F3F4F6' : '#121212';

  // Standard React components for both HAST and ReactMarkdown
  const components = useMemo(() => ({
    a: (props: any) => {
      const { href, children, node, isDark: _isDark, resolveImage: _resolveImage, ...rest } = props;
      const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s<)]*)?/;
      const match = href ? ytRegex.exec(href) : null;
      
      if (match) {
        const src = `https://www.youtube.com/embed/${match[1]}`;
        // Use span with display: block to avoid nested div in p warning
        return (
          <span style={{ position: 'relative', margin: '16px 0', width: '100%', maxWidth: '560px', display: 'block' }}>
            <iframe
              title="YouTube video player"
              src={src}
              width="100%"
              height="315"
              style={{ borderRadius: '8px', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; compute-pressure"
              allowFullScreen
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            />
            <span style={{ display: 'flex', alignItems: 'center', marginTop: '8px', gap: '8px' }}>
              <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#3b82f6', textDecoration: 'none' }}>
                {href}
              </a>
            </span>
          </span>
        );
      }
      return <a href={href} {...rest} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>{children}</a>;
    },
    img: (props: any) => {
      const { src, alt, node, isDark: _isDark, resolveImage: resolvedImageFunc, ...rest } = props;
      const [resolvedSrc, setResolvedSrc] = useState(src);
      let finalAlt = alt || '';
      let widthStyle = '100%';
      
      if (finalAlt.includes('|width=')) {
        const parts = finalAlt.split('|width=');
        finalAlt = parts[0];
        widthStyle = parts[1];
      }

      useEffect(() => {
        if (src && resolveImage) {
          resolveImage(src).then((url: string) => {
            if (url) setResolvedSrc(url);
          });
        }
      }, [src]);
      
      return (
        <img 
          src={resolvedSrc} 
          alt={finalAlt} 
          style={{ maxWidth: '100%', width: widthStyle, borderRadius: '8px', display: 'block', margin: '16px 0' }} 
          {...rest} 
        />
      );
    },
    code: (props: any) => {
      const { children, className, node, isDark: _isDark, ...rest } = props;
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      
      if (match && match[1] === 'mermaid') {
        return <Mermaid chart={codeString} isDark={isDark} />;
      }
      
      // SyntaxHighlighter uses div internally, so wrap in span if needed
      return (
        <span style={{ display: 'block', position: 'relative', marginBottom: '16px', marginTop: '16px' }}>
          <SyntaxHighlighter
            {...rest}
            PreTag="div"
            children={codeString}
            language={match ? match[1] : 'text'}
            style={isDark ? oneDark : oneLight}
            showLineNumbers={!!match}
            customStyle={{
              borderRadius: '8px',
              padding: '16px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
              backgroundColor: isDark ? '#111827' : '#F9FAFB',
              border: isDark ? '1px solid #374151' : '1px solid #E5E7EB'
            }}
          />
        </span>
      );
    }
  }), [isDark, resolveImage]);

  return (
    <div 
      ref={containerRef}
      className="markdown-preview" 
      style={{ height: '100%', maxHeight: '100%', boxSizing: 'border-box', flex: 1, overflowY: 'auto', padding: '24px', paddingBottom: '30vh', color, fontSize: '14px', lineHeight: '1.6', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}
    >
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
      
      {isParsing && !hast ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', color: '#9CA3AF' }}>
          <span style={{ marginRight: 8 }}>파싱 중...</span>
        </span>
      ) : null}

      {/* Worker rendering or Fallback rendering */}
      {!workerError && hast ? (
        hast.children.map((child: any, i: number) => (
          <MarkdownBlock
            key={i} 
            node={child} 
            components={components} 
            isDark={isDark} 
            resolveImage={resolveImage} 
          />
        ))
      ) : (
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex]}
          components={components as any}
        >
          {content}
        </ReactMarkdown>
      )}
    </div>
  );
});
export default React.memo(Preview);
