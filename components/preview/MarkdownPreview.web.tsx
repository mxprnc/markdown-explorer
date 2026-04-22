import React, { useState, useEffect, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { Platform } from 'react-native';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useMarkdownWorker } from '../../hooks/useMarkdownWorker';
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

  if (!svg) {
    return <span data-testid="preview-mermaid-loading" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>Rendering diagram...</span>;
  }

  return <span className="mermaid-diagram" data-testid="preview-mermaid" dangerouslySetInnerHTML={{ __html: svg }} style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }} />;
}, (prev, next) => prev.chart === next.chart && prev.isDark === next.isDark);

/**
 * HAST Node Renderer
 */
const HastRenderer = ({ node, components, isDark, resolveImage }: any): any => {
  if (!node) return null;
  if (node.type === 'text') return node.value;
  
  if (node.type === 'element') {
    const { tagName, properties, children } = node;
    const tableTags = ['table', 'thead', 'tbody', 'tfoot', 'tr'];
    const filteredChildren = children?.filter((child: any) => {
      if (tableTags.includes(tagName) && child.type === 'text' && !child.value.trim()) return false;
      return true;
    });

    const Component = components[tagName] || tagName;
    const props: any = { ...properties };
    if (props.class) { props.className = props.class; delete props.class; }

    const voidElements = ['hr', 'br', 'img', 'input', 'meta', 'link'];
    if (voidElements.includes(tagName)) {
      const extraProps: any = {};
      if (tagName === 'img') { extraProps.isDark = isDark; extraProps.resolveImage = resolveImage; }
      return <Component {...props} {...extraProps} />;
    }

    if (tagName === 'code') {
      const codeString = children?.map((c: any) => c.type === 'text' ? c.value : '').join('') || '';
      return <Component {...props} isDark={isDark} children={codeString} />;
    }

    const extraProps: any = {};
    if (tagName === 'a' || tagName === 'img') { extraProps.isDark = isDark; extraProps.resolveImage = resolveImage; }

    return (
      <Component {...props} {...extraProps}>
        {filteredChildren?.map((child: any, i: number) => (
          <HastRenderer key={i} node={child} components={components} isDark={isDark} resolveImage={resolveImage} />
        ))}
      </Component>
    );
  }
  return null;
};

const MarkdownBlock = React.memo(({ node, components, isDark, resolveImage }: any) => {
  return <HastRenderer node={node} components={components} isDark={isDark} resolveImage={resolveImage} />;
}, (prev, next) => prev.isDark === next.isDark && prev.resolveImage === next.resolveImage && equal(prev.node, next.node));

const MarkdownPreview = forwardRef(({ content, isDark, resolveImage, onHeadingVisible }: { content: string, isDark: boolean, resolveImage?: (src: string) => Promise<string>, onHeadingVisible?: (index: number) => void }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { hast, isParsing, workerError } = useMarkdownWorker(content);

  useEffect(() => {
    if (Platform.OS !== 'web' || !onHeadingVisible || !containerRef.current) return;

    const container = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        // We trigger whenever any heading enters or leaves the "active zone"
        // Then we find the best candidate among all headings
        const allHeadings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        if (allHeadings.length === 0) return;

        const containerRect = container.getBoundingClientRect();
        
        // Find the topmost heading that is either:
        // 1. Within the top 150px of the container
        // 2. Or the last heading that is above the current scroll position
        let bestIndex = -1;
        
        for (let i = 0; i < allHeadings.length; i++) {
          const rect = allHeadings[i].getBoundingClientRect();
          const relativeTop = rect.top - containerRect.top;
          
          if (relativeTop <= 170) {
            bestIndex = i;
          } else {
            // This heading is below our "active zone", 
            // so the previous one (bestIndex) was the right one.
            break;
          }
        }
        
        if (bestIndex !== -1) {
          onHeadingVisible(bestIndex);
        }
      },
      {
        root: container,
        rootMargin: '0px 0px -80% 0px',
        threshold: [0, 1]
      }
    );

    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(h => observer.observe(h));

    return () => observer.disconnect();
  }, [content, onHeadingVisible, hast]);

  useImperativeHandle(ref, () => ({
    scrollToHeading: (index: number, text?: string) => {
      if (containerRef.current) {
        const headings = Array.from(containerRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const matches: { element: HTMLElement, index: number }[] = [];
        headings.forEach((el, idx) => {
          if (text && (el as HTMLElement).innerText.trim() === text.trim()) matches.push({ element: el as HTMLElement, index: idx });
        });
        const bestMatch = findBestHeadingMatch(matches, index);
        let target: HTMLElement | null = bestMatch ? bestMatch.element : (headings[index] as HTMLElement || null);

        if (target) {
          const container = containerRef.current;
          const containerRect = container.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const targetScrollTop = container.scrollTop + (targetRect.top - containerRect.top);
          container.scrollTo({ top: Math.max(0, targetScrollTop - 150), behavior: 'smooth' });
        }
      }
    }
  }));

  const components = useMemo(() => ({
    a: (props: any) => {
      const { href, children, ...rest } = props;
      const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = href ? ytRegex.exec(href) : null;
      if (match) {
        return (
          <span data-testid="preview-youtube" style={{ position: 'relative', margin: '16px 0', width: '100%', maxWidth: '560px', display: 'block' }}>
            <iframe title="YouTube" src={`https://www.youtube.com/embed/${match[1]}`} width="100%" height="315" style={{ borderRadius: '8px', border: 'none' }} allowFullScreen loading="lazy" />
          </span>
        );
      }
      return <a href={href} {...rest} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>{children}</a>;
    },
    img: (props: any) => {
      const { src, alt, ...rest } = props;
      const [resolvedSrc, setResolvedSrc] = useState(src);
      useEffect(() => { if (src && resolveImage) resolveImage(src).then(url => url && setResolvedSrc(url)); }, [src]);
      return <img src={resolvedSrc} alt={alt} data-testid="preview-image" style={{ maxWidth: '100%', borderRadius: '8px', display: 'block', margin: '16px 0' }} {...rest} />;
    },
    code: (props: any) => {
      const { children, className, inline, ...rest } = props;
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      if (match && match[1] === 'mermaid') return <Mermaid chart={codeString} isDark={isDark} />;

      if (inline || !match) {
        return (
          <code
            style={{
              backgroundColor: isDark ? '#374151' : '#F3F4F6',
              color: isDark ? '#FCA5A5' : '#EF4444',
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '0.9em',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
          >
            {codeString}
          </code>
        );
      }

      return (
        <span style={{ display: 'block', position: 'relative', margin: '16px 0' }}>
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
              fontSize: '13px',
              backgroundColor: isDark ? '#111827' : '#F9FAFB',
              border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
            }}
          />
        </span>
      );
    }
  }), [isDark, resolveImage]);

  return (
    <div ref={containerRef} data-testid="preview-container" className="markdown-preview" style={{ height: '100%', overflowY: 'auto', padding: '24px', paddingBottom: '30vh', color: isDark ? '#F3F4F6' : '#121212', fontSize: '14px', lineHeight: '1.6', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .markdown-preview blockquote { border-left: 4px solid #3B82F6; padding-left: 16px; color: ${isDark ? '#9CA3AF' : '#6B7280'}; font-style: italic; margin: 1.5em 0; }
        .markdown-preview h1 { font-size: 2rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid ${isDark ? '#374151' : '#E5E7EB'}; padding-bottom: 0.3em; }
        .markdown-preview h2 { font-size: 1.6rem; font-weight: 700; margin-top: 1.8rem; margin-bottom: 0.8rem; border-bottom: 1px solid ${isDark ? '#374151' : '#E5E7EB'}; padding-bottom: 0.3em; }
        .markdown-preview h3 { font-size: 1.3rem; font-weight: 700; margin-top: 1.6rem; margin-bottom: 0.6rem; }
        .markdown-preview h4 { font-size: 1.15rem; font-weight: 700; margin-top: 1.4rem; margin-bottom: 0.4rem; color: ${isDark ? '#F3F4F6' : '#111827'}; }
        .markdown-preview h5 { font-size: 1.05rem; font-weight: 700; margin-top: 1.2rem; margin-bottom: 0.3rem; color: ${isDark ? '#D1D5DB' : '#374151'}; }
        .markdown-preview h6 { font-size: 1rem; font-weight: 700; margin-top: 1rem; margin-bottom: 0.2rem; color: ${isDark ? '#9CA3AF' : '#6B7280'}; text-transform: uppercase; letter-spacing: 0.05em; }
        .markdown-preview p { margin-bottom: 1.2em; line-height: 1.7; }
        .markdown-preview ul, .markdown-preview ol { padding-left: 24px; margin-bottom: 1.2em; }
        .markdown-preview li { margin-bottom: 0.4em; }
        .markdown-preview table { border-collapse: collapse; width: 100%; margin-bottom: 1.5em; border: 1px solid ${isDark ? '#374151' : '#E5E7EB'}; }
        .markdown-preview th, .markdown-preview td { border: 1px solid ${isDark ? '#374151' : '#E5E7EB'}; padding: 8px 12px; text-align: left; }
        .markdown-preview th { background-color: ${isDark ? '#1F2937' : '#F9FAFB'}; font-weight: bold; }
      `}</style>
      {isParsing && !hast ? <span style={{ display: 'flex', justifyContent: 'center', padding: '20px', color: '#9CA3AF' }}>Parsing...</span> : null}
      {!workerError && hast ? hast.children.map((child: any, i: number) => <MarkdownBlock key={i} node={child} components={components} isDark={isDark} resolveImage={resolveImage} />) : <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]} components={components as any}>{content}</ReactMarkdown>}
    </div>
  );
});

export default React.memo(MarkdownPreview);
