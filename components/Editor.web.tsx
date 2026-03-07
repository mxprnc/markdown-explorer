import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import CodeBlock from '@tiptap/extension-code-block';
import Heading from '@tiptap/extension-heading';
import Blockquote from '@tiptap/extension-blockquote';
import { Markdown } from 'tiptap-markdown';
import { MathExtension } from '@aarkue/tiptap-math-extension';
import { Ionicons } from '@expo/vector-icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import 'katex/dist/katex.min.css';

const ThemeContext = React.createContext({ isDark: false });

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

const CodeBlockComponent = ({ node, updateAttributes, extension, editor, getPos }: any) => {
  const { isDark } = React.useContext(ThemeContext);
  const [isEditing, setIsEditing] = useState(() => {
    if (typeof getPos !== 'function') return false;
    const pos = getPos();
    const { from, to } = editor.state.selection;
    return from >= pos && to <= pos + node.nodeSize;
  });

  const language = node.attrs.language || '';
  const isMermaid = language.toLowerCase() === 'mermaid';

  const { selected } = node; // Node selection

  useEffect(() => {
    const handleSelectionUpdate = () => {
      if (typeof getPos !== 'function') return;

      const { $from } = editor.state.selection;

      // Prosemirror nodes: a node starts at `pos` and ends at `pos + node.nodeSize`.
      // The cursor ($from.pos) must be entirely within this range to be editing THIS block.
      // However, NodeViews in Tiptap expose `selected` prop natively for this exactly!
      // Unfortunately we don't receive `selected` here in standard Tiptap ReactNodeViewRenderer unless passed down,
      // but `getPos()` gives us exact coordinates.

      // We check if $from.sameParent matches our node, or if we are actively inside its pos boundaries.
      // A safer check in Tiptap for NodeViews is just checking if we are within pos and pos + nodeSize.
      // Because node sizes jitter when typing newlines, we add a bit of leeway.
      const pos = getPos();
      const isInside = $from.pos >= pos && $from.pos <= pos + node.nodeSize;

      if (isInside) {
        if (!isEditing) setIsEditing(true);
      } else {
        if (isEditing) setIsEditing(false);
      }
    };

    // Check initially
    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => editor.off('selectionUpdate', handleSelectionUpdate);
  }, [editor, getPos, isEditing, node.nodeSize]);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(node.textContent)
        .then(() => window.alert('코드 블록이 복사되었습니다.'))
        .catch(err => console.error(err));
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    if (typeof getPos === 'function') {
      setTimeout(() => {
        editor.commands.setTextSelection(getPos() + 1);
        editor.view.focus();
      }, 0);
    }
  };

  const rawCodeContent = node.textContent;

  return (
    <NodeViewWrapper className="custom-code-block" style={{ margin: '24px 0' }}>
      <div style={{ display: isEditing ? 'block' : 'none' }}>
        <div style={{
          backgroundColor: isDark ? '#111827' : '#F9FAFB',
          border: '1px solid ' + (isDark ? '#374151' : '#E5E7EB'),
          borderRadius: 8,
          padding: 16,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 14,
          color: isDark ? '#E5E7EB' : '#1F2937'
        }}>
          <div style={{ color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: 8, userSelect: 'none' }}>
            ```{language}
          </div>
          <div style={{ display: 'block', outline: 'none', minHeight: '1.5em' }}>
            <code><NodeViewContent /></code>
          </div>
          <div style={{ color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 8, userSelect: 'none' }}>
            ```
          </div>
        </div>
      </div>

      <div
        onClick={!isMermaid ? handleEditClick : undefined}
        style={{ cursor: !isMermaid ? 'text' : 'default', position: 'relative', display: !isEditing ? 'block' : 'none' }}
      >

        {isMermaid ? (
          <div style={{
            position: 'relative',
            border: '1px solid ' + (isDark ? '#374151' : '#E5E7EB'),
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderRadius: 8,
            padding: 16
          }}>
            <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 8 }}>
              <div onClick={handleEditClick} style={{ cursor: 'pointer', padding: 4, backgroundColor: isDark ? '#374151' : '#E5E7EB', borderRadius: 4 }} title="코드 수정">
                <Ionicons name="code-slash-outline" size={16} color={isDark ? '#D1D5DB' : '#4B5563'} />
              </div>
            </div>
            <Mermaid chart={rawCodeContent} isDark={isDark} />
          </div>
        ) : (
          <div style={{
            position: 'relative',
            border: '1px solid ' + (isDark ? '#374151' : '#E5E7EB'),
            backgroundColor: isDark ? '#111827' : '#F9FAFB',
            borderRadius: 8,
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 16px',
              borderBottom: '1px solid ' + (isDark ? '#374151' : '#E5E7EB'),
              backgroundColor: isDark ? '#1F2937' : '#F3F4F6'
            }}>
              <div style={{ fontSize: 11, fontWeight: 'bold', fontFamily: 'Inter, sans-serif', color: isDark ? '#9CA3AF' : '#6B7280', textTransform: 'uppercase' }}>
                {language || 'code'}
              </div>
              <div onClick={(e) => { e.stopPropagation(); handleCopy(); }} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '4px 8px', borderRadius: 4 }}>
                <Ionicons name="copy-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginRight: 4 }} />
                <span style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: 'bold' }}>복사</span>
              </div>
            </div>

            <SyntaxHighlighter
              PreTag="div"
              children={rawCodeContent || ' '}
              language={language}
              style={isDark ? oneDark : oneLight}
              showLineNumbers={true}
              customStyle={{
                margin: 0,
                padding: 16,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 13,
                backgroundColor: 'transparent'
              }}
              lineNumberStyle={{
                minWidth: '2.5em',
                paddingRight: '1em',
                color: isDark ? '#4B5563' : '#9CA3AF',
                textAlign: 'right'
              }}
            />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

const CustomCodeBlock = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },
});

const HeadingComponent = ({ node, updateAttributes, editor, getPos }: any) => {
  const { isDark } = React.useContext(ThemeContext);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(() => {
    if (typeof getPos !== 'function') return false;
    const { $from, $to } = editor.state.selection;
    const pos = getPos();
    return $from.pos >= pos && $to.pos <= pos + node.nodeSize;
  });

  useEffect(() => {
    const handleSelectionUpdate = () => {
      if (typeof getPos !== 'function') return;

      const { $from, $to } = editor.state.selection;
      const pos = getPos();

      const isInside = $from.pos >= pos && $to.pos <= pos + node.nodeSize;

      if (isInside) {
        if (!isEditing) setIsEditing(true);
      } else {
        if (isEditing) setIsEditing(false);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => editor.off('selectionUpdate', handleSelectionUpdate);
  }, [editor, getPos, isEditing, node.nodeSize]);

  const level = node.attrs.level;
  const HeadingTag = `h${level}` as any;
  const showMarkdownPrefix = isEditing || isHovered;

  const toggleLevel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextLevel = level === 6 ? 1 : level + 1;
    updateAttributes({ level: nextLevel });
    editor.view.focus();
  };

  return (
    <NodeViewWrapper
      as={HeadingTag}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', whiteSpace: 'pre-wrap' }}
    >
      {showMarkdownPrefix && (
        <span
          contentEditable={false}
          onClick={toggleLevel}
          style={{
            color: isDark ? '#9CA3AF' : '#9CA3AF',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 'max(0.6em, 14px)',
            opacity: 0.8,
            cursor: 'pointer',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            marginRight: '8px'
          }}
          title={`클릭하여 H${level}에서 변경 (1~6단계 순환)`}
        >
          {`${'#'.repeat(level)}`}
        </span>
      )}
      <NodeViewContent className="heading-content" style={{ outline: 'none', flex: 1, minWidth: 0 }} />
    </NodeViewWrapper>
  );
};

const CustomHeading = Heading.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Backspace: () => {
        const { selection } = this.editor.state;
        const { $from, empty } = selection;
        if (!empty || $from.parent.type.name !== this.name) return false;

        if ($from.parentOffset === 0) {
          const level = $from.parent.attrs.level;
          if (level > 1) {
            return this.editor.commands.toggleHeading({ level: (level - 1) as any });
          }
        }
        return false;
      },
      '#': () => {
        const { selection } = this.editor.state;
        const { $from, empty } = selection;
        if (!empty || $from.parent.type.name !== this.name) return false;

        if ($from.parentOffset === 0) {
          const level = $from.parent.attrs.level;
          if (level < 6) {
            return this.editor.commands.toggleHeading({ level: (level + 1) as any });
          }
          return true; // prevent typing 7th '#'
        }
        return false;
      }
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(HeadingComponent);
  },
});

const BlockquoteComponent = ({ node, editor, getPos }: any) => {
  const { isDark } = React.useContext(ThemeContext);
  const [isEditing, setIsEditing] = useState(() => {
    if (typeof getPos !== 'function') return false;
    const { $from, $to } = editor.state.selection;
    const pos = getPos();
    return $from.pos >= pos && $to.pos <= pos + node.nodeSize;
  });

  useEffect(() => {
    const handleSelectionUpdate = () => {
      if (typeof getPos !== 'function') return;
      const { $from, $to } = editor.state.selection;
      const pos = getPos();
      const isInside = $from.pos >= pos && $to.pos <= pos + node.nodeSize;

      if (isInside) {
        if (!isEditing) setIsEditing(true);
      } else {
        if (isEditing) setIsEditing(false);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => editor.off('selectionUpdate', handleSelectionUpdate);
  }, [editor, getPos, isEditing, node.nodeSize]);

  return (
    <NodeViewWrapper style={{ position: 'relative', display: 'flex', borderLeft: `4px solid ${isDark ? '#374151' : '#E5E7EB'}`, paddingLeft: '16px', margin: '16px 0', color: isDark ? '#D1D5DB' : '#4B5563' }}>
      {isEditing && (
        <span
          contentEditable={false}
          style={{
            position: 'absolute',
            left: 0,
            transform: 'translateX(calc(-100% - 12px))',
            color: isDark ? '#9CA3AF' : '#9CA3AF',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 'max(0.6em, 14px)',
            opacity: 0.8,
            userSelect: 'none',
          }}
        >
          {'>'}
        </span>
      )}
      <NodeViewContent className="blockquote-content" style={{ flex: 1, outline: 'none' }} />
    </NodeViewWrapper>
  );
};

const CustomBlockquote = Blockquote.extend({
  addNodeView() {
    return ReactNodeViewRenderer(BlockquoteComponent);
  },
});

export default function Editor({ value, onChange, onSave, isDark }: { value: string, onChange: (v: string) => void, onSave?: (v: string) => void, isDark: boolean }) {

  const SaveShortcut = Extension.create({
    name: 'saveShortcut',
    addKeyboardShortcuts() {
      return {
        'Mod-s': () => {
          if (onSave) {
            onSave((this.editor.storage as any).markdown.getMarkdown());
          }
          return true; // prevent default
        },
      }
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: false, blockquote: false }),
      CustomCodeBlock,
      CustomHeading,
      CustomBlockquote,
      Markdown,
      MathExtension.configure({ evaluation: false }),
      SaveShortcut,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // Get the markdown content whenever the user types
      const markdown = (editor.storage as any).markdown.getMarkdown();
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose outline-none focus:outline-none max-w-none',
        style: 'min-height: 100%; padding: 40px; font-family: Inter, sans-serif; font-size: 16px; line-height: 1.6;'
      }
    }
  });

  const textColor = isDark ? '#F3F4F6' : '#121212';
  const bgColor = isDark ? '#121212' : '#ffffff';

  const cbBg = isDark ? '#111827' : '#F9FAFB';
  const cbBgHeader = isDark ? '#1F2937' : '#F3F4F6';
  const cbBorder = isDark ? '#374151' : '#E5E7EB';
  const cbText = isDark ? '#E5E7EB' : '#1F2937';
  const cbCopy = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <div className="tiptap-wrapper" style={{ flex: 1, backgroundColor: bgColor, overflowY: 'auto', color: textColor, '--cb-bg': cbBg, '--cb-bg-header': cbBgHeader, '--cb-border': cbBorder, '--cb-text': cbText, '--cb-copy': cbCopy } as React.CSSProperties}>
      <style>{`
        .tiptap-wrapper .ProseMirror {
          min-height: 100%;
          outline: none;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .tiptap-wrapper h1,
        .tiptap-wrapper h2,
        .tiptap-wrapper h3,
        .tiptap-wrapper h4,
        .tiptap-wrapper h5,
        .tiptap-wrapper h6 {
          line-height: 1.2;
          margin-top: 1.5em;
          margin-bottom: 0.5rem;
        }
        
        .tiptap-wrapper h1 { font-size: 2.25rem; font-weight: bold; border-bottom: 1px solid ${isDark ? '#374151' : '#E5E7EB'}; padding-bottom: 0.3em; margin-bottom: 1em; }
        .tiptap-wrapper h2 { font-size: 1.75rem; font-weight: bold; border-bottom: 1px solid ${isDark ? '#374151' : '#E5E7EB'}; padding-bottom: 0.3em; margin-bottom: 0.8em; }
        .tiptap-wrapper h3 { font-size: 1.5rem; font-weight: bold; }
        
        .tiptap-wrapper p {
          margin-bottom: 1em;
        }

        .tiptap-wrapper ul,
        .tiptap-wrapper ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .tiptap-wrapper ul { list-style-type: disc; }
        .tiptap-wrapper ol { list-style-type: decimal; }

        .tiptap-wrapper blockquote {
          border-left: 4px solid #3B82F6;
          margin: 0 0 1rem 0;
          padding-left: 1rem;
          font-style: italic;
          color: ${isDark ? '#9CA3AF' : '#6B7280'};
        }

        .tiptap-wrapper code {
          background-color: ${isDark ? '#374151' : '#F3F4F6'};
          padding: 2px 4px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: ${isDark ? '#FCA5A5' : '#EF4444'};
          font-size: 0.9em;
        }

        .custom-code-block code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }
      `}</style>
      <ThemeContext.Provider value={{ isDark }}>
        <EditorContent editor={editor} style={{ height: '100%' }} />
      </ThemeContext.Provider>
    </div>
  );
}
