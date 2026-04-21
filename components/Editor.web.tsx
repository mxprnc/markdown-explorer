import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { findBestHeadingMatch } from '@/utils/MarkdownUtils';
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Extension, getMarkRange, Node } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import CodeBlock from '@tiptap/extension-code-block';
import Heading from '@tiptap/extension-heading';
import Blockquote from '@tiptap/extension-blockquote';
import Image from '@tiptap/extension-image';
import { Markdown } from 'tiptap-markdown';
import { MathExtension } from '@aarkue/tiptap-math-extension';
import { Ionicons } from '@expo/vector-icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
// import 'katex/dist/katex.min.css'; // Loaded via CDN in +html.tsx for web

mermaid.initialize({ startOnLoad: false, theme: 'default' });

const ThemeContext = React.createContext({ isDark: false });

function Mermaid({ chart, isDark }: { chart: string, isDark: boolean }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Only update theme if it changed
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

      if (isInside !== isEditing) {
        setIsEditing(isInside);
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
              lineNumberStyle={{
                minWidth: '2.5em',
                paddingRight: '1em',
                color: isDark ? '#4B5563' : '#9CA3AF',
                textAlign: 'right'
              }}
              style={isDark ? oneDark : oneLight}
              showLineNumbers={true}
              customStyle={{
                margin: 0,
                padding: 16,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 13,
                backgroundColor: 'transparent'
              }}
            />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

const MemoizedCodeBlockComponent = React.memo(CodeBlockComponent);

const CustomCodeBlock = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(MemoizedCodeBlockComponent);
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

      if (isInside !== isEditing) {
        setIsEditing(isInside);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
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

const MemoizedHeadingComponent = React.memo(HeadingComponent);

const CustomHeading = Heading.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Enter: () => {
        const { selection } = this.editor.state;
        const { $from, empty } = selection;
        if (!empty || $from.parent.type.name !== this.name) return false;

        return this.editor.chain()
          .splitBlock()
          .setParagraph()
          .run();
      },
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
    return ReactNodeViewRenderer(MemoizedHeadingComponent);
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

      if (isInside !== isEditing) {
        setIsEditing(isInside);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
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

const MemoizedBlockquoteComponent = React.memo(BlockquoteComponent);

const CustomBlockquote = Blockquote.extend({
  addNodeView() {
    return ReactNodeViewRenderer(MemoizedBlockquoteComponent);
  },
});

const LiveMarkdownExtension = Extension.create({
  name: 'liveMarkdown',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('liveMarkdown'),
        props: {
          handleDOMEvents: {
            mousedown: () => {
              (window as any).pmIsMousingDown = true;
              return false;
            },
            mouseup: (view) => {
              (window as any).pmIsMousingDown = false;
              setTimeout(() => {
                if (!view.isDestroyed) {
                  view.dispatch(view.state.tr.setMeta('evalMarkdown', true));
                }
              }, 10);
              return false;
            }
          }
        },
        appendTransaction(transactions, oldState, newState) {
          if (!transactions.some(tr => tr.docChanged || tr.selectionSet || tr.getMeta('evalMarkdown'))) return;

          let tr = newState.tr;
          const markSymbols: Record<string, string> = {
            bold: '**',
            italic: '*',
            strike: '~~',
            code: '`'
          };

          const expandMark = () => {
            const { $from, $to } = newState.selection;
            const positions = [
              $from.pos - 1, $from.pos, $from.pos + 1,
              $to.pos - 1, $to.pos, $to.pos + 1
            ].filter(p => p >= 0 && p <= newState.doc.content.size);

            for (const pos of positions) {
              const $pos = newState.doc.resolve(pos);
              for (const mark of $pos.marks()) {
                const sym = markSymbols[mark.type.name];
                if (sym) {
                  const range = getMarkRange($pos, mark.type);
                  if (range) {
                    tr.removeMark(range.from, range.to, mark.type);
                    tr.insertText(sym, range.to);
                    tr.insertText(sym, range.from);

                    const selFrom = newState.selection.from;
                    const selTo = newState.selection.to;
                    
                    let newFrom = selFrom;
                    let newTo = selTo;

                    // If selection was after the mark's start, it shifts right by sym.length
                    if (selFrom >= range.to) newFrom += sym.length * 2;
                    else if (selFrom > range.from) newFrom += sym.length;
                    else if (selFrom === range.from) newFrom += sym.length;

                    if (selTo >= range.to) newTo += sym.length * 2;
                    else if (selTo > range.from) newTo += sym.length;
                    else if (selTo === range.from) newTo += sym.length;
                    
                    if (selTo === range.to && selFrom === selTo) {
                      newTo += sym.length;
                      newFrom = newTo;
                    }

                    tr.setSelection(TextSelection.create(
                      tr.doc,
                      newFrom,
                      newTo
                    ));
                    return true;
                  }
                }
              }
            }
            return false;
          };

          const expandMedia = () => {
            if ((window as any).pmIsMousingDown) return false;
            let found = false;
            newState.doc.descendants((node, pos) => {
              if (found) return false;
              if (node.type.name === 'image' || node.type.name === 'customImage' || node.type.name === 'customYoutube') {
                const isTouchingFromBefore = newState.selection.$from.pos === pos;
                const isTouchingFromAfter = newState.selection.$from.pos === pos + node.nodeSize;
                const isSelected = newState.selection.from <= pos && newState.selection.to >= pos + node.nodeSize;
                const isTouching = isTouchingFromBefore || isTouchingFromAfter || isSelected;
                  
                if (isTouching) {
                  let textStr = '';
                  if (node.type.name === 'customYoutube') {
                    textStr = node.attrs.originalUrl || node.attrs.src;
                  } else {
                    const alt = node.attrs.alt || '';
                    const src = node.attrs.src || '';
                    textStr = `![${alt}](<${src}>)`;
                  }
                  
                  tr.delete(pos, pos + node.nodeSize);
                  tr.insertText(textStr, pos);
                  
                  if (isTouchingFromAfter) {
                     tr.setSelection(TextSelection.create(tr.doc, pos + textStr.length));
                  } else {
                     tr.setSelection(TextSelection.create(tr.doc, pos));
                  }
                  
                  found = true;
                }
              }
            });
            return found;
          };

          const collapseText = () => {
            let found = false;
            newState.doc.descendants((node, pos) => {
              if (found) return false;
              if (node.isTextblock) {
                const text = node.textContent;
                if (!text.includes('*') && !text.includes('~') && !text.includes('`') && !text.includes('![') && !text.includes('youtu')) return;

                const regexes = [
                  { name: 'bold', regex: /\*\*([^\*]+)\*\*/g, symLength: 2 },
                  { name: 'strike', regex: /~~([^~]+)~~/g, symLength: 2 },
                  { name: 'code', regex: /`([^`]+)`/g, symLength: 1 },
                  { name: 'italic', regex: /(^|[^\*])\*([^\*]+)\*(?=[^\*]|$)/g, symLength: 1, isComplex: true },
                ];

                for (const { name, regex, symLength, isComplex } of regexes) {
                  let match;
                  const markType = newState.schema.marks[name];
                  if (!markType) continue;

                  while ((match = regex.exec(text)) !== null) {
                    const offset = isComplex ? match[1].length : 0;
                    const innerText = match[isComplex ? 2 : 1];
                    const start = pos + 1 + match.index + offset;
                    const end = start + innerText.length + symLength * 2;

                    const isTouching = 
                      (newState.selection.$from.pos >= start && newState.selection.$from.pos <= end) ||
                      (newState.selection.$to.pos >= start && newState.selection.$to.pos <= end);

                    if (!isTouching) {
                      tr.delete(start, end);
                      tr.insertText(innerText, start);
                      tr.addMark(start, start + innerText.length, markType.create());
                      found = true;
                      break;
                    }
                  }
                  if (found) break;
                }

                if (found) return false;
                if ((window as any).pmIsMousingDown) return false;

                // Handle Image Markdown text matching
                const imgRegex = /!\[([^\]]*)\]\((?:<([^>]+)>|([^)]+))\)/g;
                let imgMatch;
                while ((imgMatch = imgRegex.exec(text)) !== null) {
                  const start = pos + 1 + imgMatch.index;
                   const end = start + imgMatch[0].length;
                  
                  const isTouching = 
                    (newState.selection.$from.pos >= start && newState.selection.$from.pos <= end) ||
                    (newState.selection.$to.pos >= start && newState.selection.$to.pos <= end);
                    
                  if (!isTouching) {
                    const imageType = newState.schema.nodes.image || newState.schema.nodes.customImage;
                    if (imageType) {
                       const src = imgMatch[2] || imgMatch[3];
                       const imgNode = imageType.create({ alt: imgMatch[1], src });
                       tr.replaceWith(start, end, imgNode);
                    }
                    found = true;
                    break;
                  }
                }

                if (found) return false;

                // Handle Youtube Markdown text matching
                const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s<)]*)?/g;
                let ytMatch;
                while ((ytMatch = ytRegex.exec(text)) !== null) {
                  const start = pos + 1 + ytMatch.index;
                  const end = start + ytMatch[0].length;
                  
                  const isTouching = 
                    (newState.selection.$from.pos >= start && newState.selection.$from.pos <= end) ||
                    (newState.selection.$to.pos >= start && newState.selection.$to.pos <= end);
                    
                  if (!isTouching) {
                    const ytType = newState.schema.nodes.customYoutube;
                    if (ytType) {
                       const src = `https://www.youtube.com/embed/${ytMatch[1]}`;
                       const ytNode = ytType.create({ src, originalUrl: ytMatch[0] });
                       tr.replaceWith(start, end, ytNode);
                    }
                    found = true;
                    break;
                  }
                }

              }
            });
            return found;
          };

          if (expandMark()) return tr;
          if (expandMedia()) return tr;
          if (collapseText()) return tr;
          
          return null;
        }
      })
    ];
  },
  addKeyboardShortcuts() {
    const toggleMarkdownFormat = (sym: string) => {
      const { state, dispatch } = this.editor.view;
      const { $from, $to, empty } = state.selection;
      
      if (empty) return false;

      const text = state.doc.textBetween($from.pos, $to.pos, '\n');
      
      const textBefore = state.doc.textBetween(Math.max(0, $from.pos - sym.length), $from.pos, '\n');
      const textAfter = state.doc.textBetween($to.pos, Math.min(state.doc.content.size, $to.pos + sym.length), '\n');

      if (textBefore === sym && textAfter === sym) {
        // Selection is exactly between symbols. E.g. **|word|**
        if (dispatch) {
          const tr = state.tr;
          tr.delete($to.pos, $to.pos + sym.length);
          tr.delete($from.pos - sym.length, $from.pos);
          dispatch(tr);
        }
        return true;
      } else if (text.startsWith(sym) && text.endsWith(sym) && text.length >= sym.length * 2) {
        // Selection includes the symbols. E.g. |**word**|
        if (dispatch) {
          const tr = state.tr;
          tr.delete($to.pos - sym.length, $to.pos);
          tr.delete($from.pos, $from.pos + sym.length);
          dispatch(tr);
        }
        return true;
      } else {
        // Selection does not have the symbols. E.g. |word| -> **|word|**
        if (dispatch) {
          const tr = state.tr;
          tr.insertText(sym, $to.pos);
          tr.insertText(sym, $from.pos);
          tr.setSelection(TextSelection.create(tr.doc, $from.pos + sym.length, $to.pos + sym.length));
          dispatch(tr);
        }
        return true;
      }
    };

    const wrapWithPair = (open: string, close: string) => {
      const { state, dispatch } = this.editor.view;
      const { $from, $to, empty } = state.selection;

      if (empty) return false;

      if (dispatch) {
        const tr = state.tr;
        tr.insertText(close, $to.pos);
        tr.insertText(open, $from.pos);
        tr.setSelection(TextSelection.create(tr.doc, $from.pos + open.length, $to.pos + open.length));
        dispatch(tr);
      }
      return true;
    };

    return {
      'Mod-b': () => toggleMarkdownFormat('**'),
      'Mod-i': () => toggleMarkdownFormat('*'),
      'Mod-e': () => toggleMarkdownFormat('`'),
      'Mod-Shift-s': () => toggleMarkdownFormat('~~'),
      '\'': () => wrapWithPair('\'', '\''),
      '"': () => wrapWithPair('"', '"'),
      '(': () => wrapWithPair('(', ')'),
      '[': () => wrapWithPair('[', ']'),
      '{': () => wrapWithPair('{', '}'),
    };
  }
});

// Functions moved to utils/MarkdownUtils.ts for better testability.
import { preprocessMarkdown, postprocessMarkdown } from '@/utils/MarkdownUtils';

const ImagePastingExtension = Extension.create({
  name: 'imagePasting',
  addOptions() {
    return {
      onPasteImage: null as ((file: File) => Promise<string>) | null,
    };
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imagePasting'),
        props: {
          handlePaste: (view, event) => {
            const { onPasteImage } = this.options;
            if (!onPasteImage) return false;

            const items = Array.from(event.clipboardData?.items || []);
            const imageItem = items.find(item => item.type.startsWith('image/'));
            
            if (imageItem) {
              const file = imageItem.getAsFile();
              if (file) {
                event.preventDefault();
                onPasteImage(file).then((relativePath: string) => {
                  if (relativePath) {
                    const { state, dispatch } = view;
                    const node = state.schema.nodes.image.create({ src: relativePath, alt: file.name });
                    const tr = state.tr.replaceSelectionWith(node);
                    dispatch(tr);
                  }
                });
                return true;
              }
            }
            return false;
          }
        }
      })
    ];
  }
});

const CustomImage = Image.extend<any>({
  addOptions() {
    return {
      ...(this.parent?.() as any),
      resolveImage: null,
      inline: true,
    };
  },
  addNodeView() {
    return ({ node, extension, getPos, editor }: any) => {
      const container = document.createElement('span');
      container.style.position = 'relative';
      container.style.display = 'block';
      container.style.margin = '16px 0';
      container.style.maxWidth = '100%';

      const dom = document.createElement('img');
      const { src, alt } = node.attrs;
      
      let altText = alt || '';
      let widthStyle = '100%';
      if (altText.includes('|width=')) {
        const parts = altText.split('|width=');
        altText = parts[0];
        widthStyle = parts[1];
      }
      
      dom.setAttribute('alt', altText);
      dom.style.maxWidth = '100%';
      dom.style.width = widthStyle;
      dom.style.borderRadius = '8px';
      dom.style.cursor = 'pointer';
      dom.style.display = 'block';

      if (src && extension.options.resolveImage) {
        extension.options.resolveImage(src).then((url: string) => {
          if (url) dom.setAttribute('src', url);
        });
      } else if (src) {
        dom.setAttribute('src', src);
      }

      const linkContainer = document.createElement('div');
      linkContainer.style.display = 'flex';
      linkContainer.style.alignItems = 'center';
      linkContainer.style.marginTop = '8px';
      linkContainer.style.gap = '8px';

      const link = document.createElement('div');
      link.innerText = src.split('/').pop() || altText || '';
      link.style.fontSize = '14px';
      link.style.color = '#3b82f6';
      link.style.wordBreak = 'break-all';
      link.style.whiteSpace = 'nowrap';
      link.style.overflow = 'hidden';
      link.style.textOverflow = 'ellipsis';
      link.style.flex = '1';

      link.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      const actionsDiv = document.createElement('div');
      actionsDiv.style.display = 'flex';
      actionsDiv.style.alignItems = 'center';
      actionsDiv.style.gap = '8px';

      const widthLabel = document.createElement('span');
      widthLabel.innerText = 'Scale:';
      widthLabel.style.fontSize = '12px';
      widthLabel.style.color = '#6b7280';

      const widthInput = document.createElement('input');
      widthInput.value = widthStyle === '100%' ? '' : widthStyle;
      widthInput.placeholder = '100%';
      widthInput.style.width = '60px';
      widthInput.style.fontSize = '12px';
      widthInput.style.padding = '4px 6px';
      widthInput.style.border = '1px solid #d1d5db';
      widthInput.style.borderRadius = '4px';
      widthInput.style.background = 'transparent';
      widthInput.style.color = 'inherit';
      widthInput.style.outline = 'none';

      const renameBtn = document.createElement('button');
      renameBtn.innerHTML = 'Rename';
      renameBtn.style.fontSize = '12px';
      renameBtn.style.padding = '4px 8px';
      renameBtn.style.cursor = 'pointer';
      renameBtn.style.background = '#f3f4f6';
      renameBtn.style.border = '1px solid #d1d5db';
      renameBtn.style.borderRadius = '4px';
      renameBtn.style.color = '#374151';

      actionsDiv.appendChild(widthLabel);
      actionsDiv.appendChild(widthInput);
      actionsDiv.appendChild(renameBtn);

      const editDiv = document.createElement('div');
      editDiv.style.display = 'none';
      editDiv.style.alignItems = 'center';
      editDiv.style.gap = '4px';

      const renameInput = document.createElement('input');
      renameInput.style.width = '120px';
      renameInput.style.fontSize = '12px';
      renameInput.style.padding = '4px 6px';
      renameInput.style.border = '1px solid #d1d5db';
      renameInput.style.borderRadius = '4px';
      renameInput.style.background = 'transparent';
      renameInput.style.color = 'inherit';
      renameInput.style.outline = 'none';

      const saveBtn = document.createElement('button');
      saveBtn.innerHTML = 'v';
      saveBtn.style.cursor = 'pointer';
      saveBtn.style.fontSize = '12px';
      saveBtn.style.padding = '4px 8px';
      saveBtn.style.background = '#10b981';
      saveBtn.style.color = 'white';
      saveBtn.style.border = 'none';
      saveBtn.style.borderRadius = '4px';
      saveBtn.title = '적용';
      
      const cancelBtn = document.createElement('button');
      cancelBtn.innerHTML = 'x';
      cancelBtn.style.cursor = 'pointer';
      cancelBtn.style.fontSize = '12px';
      cancelBtn.style.padding = '4px 8px';
      cancelBtn.style.background = '#ef4444';
      cancelBtn.style.color = 'white';
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '4px';
      cancelBtn.title = '취소';

      editDiv.appendChild(renameInput);
      editDiv.appendChild(saveBtn);
      editDiv.appendChild(cancelBtn);

      linkContainer.appendChild(link);
      linkContainer.appendChild(actionsDiv);
      linkContainer.appendChild(editDiv);

      container.appendChild(dom);
      container.appendChild(linkContainer);

      let isDestroyed = false;

       const updateWidth = () => {
         if (isDestroyed) return;
         if (typeof getPos === 'function') {
            try {
              const pos = getPos();
              if (pos === undefined) return;
              
              let finalWidth = widthInput.value.trim();
              if (/^\d+(\.\d+)?$/.test(finalWidth)) {
                finalWidth += '%';
                widthInput.value = finalWidth;
              }
              
              if ((finalWidth || '100%') === widthStyle) return;
              const newAlt = finalWidth ? `${altText}|width=${finalWidth}` : altText;
              const tr = editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, alt: newAlt });
              editor.view.dispatch(tr);
            } catch(e) {
              console.warn('Cannot update width', e);
            }
         }
       };

      widthInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          widthInput.blur(); // this will trigger focusout/blur immediately
        }
      });
      widthInput.addEventListener('blur', updateWidth);

      renameBtn.addEventListener('click', (e) => {
        e.preventDefault();
        actionsDiv.style.display = 'none';
        editDiv.style.display = 'flex';
        renameInput.value = src.split('/').pop() || '';
        setTimeout(() => renameInput.focus(), 0);
      });

      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        editDiv.style.display = 'none';
        actionsDiv.style.display = 'flex';
      });

      const executeRename = () => {
        if (isDestroyed) return;
        const oldName = src.split('/').pop() || '';
        const newName = renameInput.value.trim();
        if (newName && newName !== oldName && extension.options.onRenameImage) {
           renameInput.disabled = true;
           saveBtn.disabled = true;
           saveBtn.innerHTML = '...';
           extension.options.onRenameImage(src, newName).then((newSrc: string) => {
              if (newSrc && typeof getPos === 'function' && !isDestroyed) {
                 try {
                   const pos = getPos();
                   if (pos !== undefined) {
                     const tr = editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: newSrc, alt: newName + (widthStyle !== '100%' ? `|width=${widthStyle}` : '') });
                     editor.view.dispatch(tr);
                   }
                 } catch(e) { console.warn(e); }
              } else {
                 if (!isDestroyed) {
                   renameInput.disabled = false;
                   saveBtn.disabled = false;
                   saveBtn.innerHTML = 'v';
                   editDiv.style.display = 'none';
                   actionsDiv.style.display = 'flex';
                 }
              }
           });
        } else {
           editDiv.style.display = 'none';
           actionsDiv.style.display = 'flex';
        }
      };

      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        executeRename();
      });

      renameInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          executeRename();
        } else if (e.key === 'Escape') {
          editDiv.style.display = 'none';
          actionsDiv.style.display = 'flex';
        }
      });

      [widthInput, renameBtn, renameInput, saveBtn, cancelBtn].forEach(el => {
        el.addEventListener('mousedown', (e) => e.stopPropagation());
      });

      dom.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof getPos === 'function') {
          try {
            const pos = getPos();
            if (pos !== undefined) editor.commands.setTextSelection(pos);
          } catch(e){}
        }
      });

      return {
        dom: container,
        destroy: () => {
          isDestroyed = true;
        }
      };
    };
  }
});

const CustomYoutube = Node.create<any>({
  name: 'customYoutube',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      originalUrl: { default: null }
    }
  },
  parseHTML() {
    return [{ tag: 'iframe[data-youtube]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['iframe', { ...HTMLAttributes, 'data-youtube': 'true' }]
  },
  addNodeView() {
    return ({ node, getPos, editor }: any) => {
      const dom = document.createElement('span')
      dom.style.position = 'relative'
      dom.style.margin = '16px 0'
      dom.style.width = '100%'
      dom.style.maxWidth = '560px'
      dom.style.display = 'inline-block'
      
      const iframe = document.createElement('iframe')
      iframe.src = node.attrs.src
      iframe.width = '100%'
      iframe.height = '315'
      iframe.style.borderRadius = '8px'
      iframe.setAttribute('frameborder', '0')
      iframe.setAttribute('allowfullscreen', 'true')
      
      // Top overlay for clicking
      const overlay = document.createElement('div')
      overlay.style.position = 'absolute'
      overlay.style.top = '0'
      overlay.style.left = '0'
      overlay.style.right = '0'
      overlay.style.height = '40px'
      overlay.style.zIndex = '10'
      overlay.style.cursor = 'pointer'
      overlay.title = '클릭하여 링크 수정'
      overlay.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.2), transparent)'
      overlay.style.borderTopLeftRadius = '8px'
      overlay.style.borderTopRightRadius = '8px'

      dom.appendChild(iframe)
      dom.appendChild(overlay)

      const linkContainer = document.createElement('div')
      linkContainer.style.display = 'flex'
      linkContainer.style.alignItems = 'center'
      linkContainer.style.marginTop = '8px'
      linkContainer.style.gap = '8px'

      const link = document.createElement('a')
      link.href = node.attrs.originalUrl || node.attrs.src
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.innerText = node.attrs.originalUrl || node.attrs.src
      link.style.fontSize = '14px'
      link.style.color = '#3b82f6' // text-blue-500
      link.style.textDecoration = 'none'
      link.style.wordBreak = 'break-all'
      link.style.whiteSpace = 'nowrap'
      link.style.overflow = 'hidden'
      link.style.textOverflow = 'ellipsis'
      link.style.flex = '1'
      
      link.addEventListener('mouseover', () => {
        link.style.textDecoration = 'underline'
      })
      link.addEventListener('mouseout', () => {
        link.style.textDecoration = 'none'
      })
      link.addEventListener('mousedown', (e) => {
        e.preventDefault()
        e.stopPropagation()
      })

      const copyButton = document.createElement('button')
      copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`
      copyButton.style.display = 'flex'
      copyButton.style.alignItems = 'center'
      copyButton.style.justifyContent = 'center'
      copyButton.style.padding = '4px'
      copyButton.style.background = 'transparent'
      copyButton.style.border = 'none'
      copyButton.style.cursor = 'pointer'
      copyButton.style.color = '#6b7280' // text-gray-500
      copyButton.style.borderRadius = '4px'
      copyButton.title = '주소 복사'
      
      copyButton.addEventListener('mouseover', () => {
        copyButton.style.background = 'rgba(0,0,0,0.05)'
      })
      copyButton.addEventListener('mouseout', () => {
        copyButton.style.background = 'transparent'
      })
      copyButton.addEventListener('mousedown', (e) => {
        e.preventDefault()
        e.stopPropagation()
      })
      
      copyButton.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (navigator.clipboard) {
          navigator.clipboard.writeText(node.attrs.originalUrl || node.attrs.src)
            .then(() => {
              const originalHtml = copyButton.innerHTML;
              copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
              setTimeout(() => {
                copyButton.innerHTML = originalHtml;
              }, 2000)
            })
        }
      })

      linkContainer.appendChild(link)
      linkContainer.appendChild(copyButton)
      dom.appendChild(linkContainer)

      overlay.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (typeof getPos === 'function') {
          editor.commands.setTextSelection(getPos())
        }
      })

      return { dom }
    }
  }
});

export default forwardRef(function Editor({ value, onChange, onSave, onPasteImage, onRenameImage, resolveImage, isDark }: { value: string, onChange: (v: string) => void, onSave?: (v: string) => void, onPasteImage?: (file: File) => Promise<string>, onRenameImage?: (oldSrc: string, newName: string) => Promise<string>, resolveImage?: (src: string) => Promise<string>, isDark: boolean }, ref: any) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const SaveShortcut = Extension.create({
    name: 'saveShortcut',
    addKeyboardShortcuts() {
      return {
        'Mod-s': () => {
          if (onSave) {
            let md = (this.editor.storage as any).markdown.getMarkdown();
            onSave(postprocessMarkdown(md));
          }
          return true; // prevent default
        },
        // Alt-t (Option-t on Mac) for templates
        'Alt-t': () => {
          // This will be caught by the AppInstance or handled via event bus
          window.dispatchEvent(new CustomEvent('command:execute', { detail: { id: 'insert-template' } }));
          return true;
        }
      }
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: false, blockquote: false }),
      CustomCodeBlock,
      CustomHeading,
      CustomBlockquote,
      ImagePastingExtension.configure({ onPasteImage }),
      LiveMarkdownExtension,
      CustomImage.configure({ resolveImage, onRenameImage }),
      CustomYoutube,
      Markdown,
      MathExtension.configure({ evaluation: false }),
      SaveShortcut,
    ],
    content: preprocessMarkdown(value),
    onUpdate: ({ editor }) => {
      // Get the markdown content whenever the user types
      const markdown = postprocessMarkdown((editor.storage as any).markdown.getMarkdown());
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose outline-none focus:outline-none max-w-none',
        style: 'min-height: 100%; padding: 40px; font-family: Inter, sans-serif; font-size: 16px; line-height: 1.6;'
      }
    }
  });

  useEffect(() => {
    if (editor && value !== undefined && !editor.isFocused) {
      // Check if content actually changed to avoid unnecessary updates
      const currentMarkdown = (editor.storage as any).markdown.getMarkdown();
      const newMarkdown = preprocessMarkdown(value);
      if (preprocessMarkdown(currentMarkdown) !== newMarkdown) {
        editor.commands.setContent(newMarkdown);
      }
    }
  }, [value, editor]);

  useImperativeHandle(ref, () => ({
    scrollToHeading: (index: number, text?: string) => {
      if (!editor) return;

      let targetPos = -1;
      let currentIndex = 0;
      
      const matches: { pos: number, index: number }[] = [];

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          const headingText = node.textContent.trim();
          
          if (text && headingText === text.trim()) {
            matches.push({ pos, index: currentIndex });
          }
          
          if (currentIndex === index) {
            targetPos = pos;
          }
          
          currentIndex++;
        }
        return true;
      });

      const bestMatch = findBestHeadingMatch(matches, index);
      let finalPos = bestMatch ? bestMatch.pos : targetPos;

      if (finalPos !== -1) {
        editor.commands.setTextSelection(finalPos);
        
        setTimeout(() => {
          const container = wrapperRef.current;
          if (container) {
            const coords = editor.view.coordsAtPos(finalPos);
            if (coords) {
              const containerRect = container.getBoundingClientRect();
              const relativeTop = coords.top - containerRect.top;
              const targetScrollTop = container.scrollTop + relativeTop;

              container.scrollTo({
                top: Math.max(0, targetScrollTop - 150),
                behavior: 'smooth'
              });
            } else {
              editor.commands.scrollIntoView();
            }
          }
        }, 100);
        
        editor.commands.focus();
      }
    },
    insertText: (text: string) => {
      if (!editor) return;
      editor.commands.insertContent(text);
      editor.commands.focus();
    }
  }));

  const textColor = isDark ? '#F3F4F6' : '#121212';
  const bgColor = isDark ? '#121212' : '#ffffff';

  const cbBg = isDark ? '#111827' : '#F9FAFB';
  const cbBgHeader = isDark ? '#1F2937' : '#F3F4F6';
  const cbBorder = isDark ? '#374151' : '#E5E7EB';
  const cbText = isDark ? '#E5E7EB' : '#1F2937';
  const cbCopy = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <div ref={wrapperRef} className="tiptap-wrapper" style={{ height: '100%', maxHeight: '100%', boxSizing: 'border-box', flex: 1, backgroundColor: bgColor, overflowY: 'auto', color: textColor, '--cb-bg': cbBg, '--cb-bg-header': cbBgHeader, '--cb-border': cbBorder, '--cb-text': cbText, '--cb-copy': cbCopy } as React.CSSProperties}>
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
});
