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

import { LinkCardExtension } from './editor/LinkCardExtension';
import { useTheme } from '@/contexts/ThemeContext';
import { CopyButton } from './ui/CopyButton';

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
  const { isDark, colors } = useTheme();
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
    // Use editor.isFocused to ensure we only show editing mode when active
    const isInside = editor.isFocused && $from.pos >= pos && $from.pos <= pos + node.nodeSize;

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
        .then(() => window.alert('Code block copied.'))
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
          backgroundColor: isDark ? '#0b0e14' : '#F9FAFB',
          border: '1px solid ' + (isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB'),
          borderRadius: 8,
          padding: 16,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 14,
          color: isDark ? '#e2e8f0' : '#1F2937'
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
            border: '1px solid ' + (isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB'),
            backgroundColor: isDark ? '#151921' : '#FFFFFF',
            borderRadius: 8,
            padding: 16
          }}>
            <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 8 }}>
              <div onClick={handleEditClick} style={{ cursor: 'pointer', padding: 4, backgroundColor: isDark ? '#374151' : '#E5E7EB', borderRadius: 4 }} title="Edit code">
                <Ionicons name="code-slash-outline" size={16} color={isDark ? '#D1D5DB' : '#4B5563'} />
              </div>
            </div>
            <Mermaid chart={rawCodeContent} isDark={isDark} />
          </div>
        ) : (
          <div style={{
            position: 'relative',
            border: '1px solid ' + (isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB'),
            backgroundColor: isDark ? '#0b0e14' : '#F9FAFB',
            borderRadius: 8,
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 16px',
              borderBottom: '1px solid ' + (isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB'),
              backgroundColor: isDark ? '#151921' : '#F3F4F6'
            }}>
              <div style={{ fontSize: 11, fontWeight: 'bold', fontFamily: 'Inter, sans-serif', color: isDark ? '#9CA3AF' : '#6B7280', textTransform: 'uppercase' }}>
                {language || 'code'}
              </div>
                <CopyButton content={rawCodeContent} />
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
  const { isDark } = useTheme();
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
            color: isDark ? '#64748b' : '#9CA3AF',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 'max(0.6em, 14px)',
            opacity: 0.8,
            cursor: 'pointer',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            marginRight: '8px'
          }}
          title={`Click to cycle heading level (1-6)`}
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
  const { isDark } = useTheme();
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
    <NodeViewWrapper style={{ position: 'relative', display: 'flex', borderLeft: `4px solid ${isDark ? '#334155' : '#E5E7EB'}`, paddingLeft: '16px', margin: '16px 0', color: isDark ? '#94a3b8' : '#4B5563' }}>
      {isEditing && (
        <span
          contentEditable={false}
          style={{
            position: 'absolute',
            left: 0,
            transform: 'translateX(calc(-100% - 12px))',
            color: isDark ? '#64748b' : '#9CA3AF',
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
          if (transactions.some(tr => tr.getMeta('evalMarkdown'))) return;
          if (!transactions.some(tr => tr.docChanged || tr.selectionSet)) return;

          let tr = newState.tr;
          tr.setMeta('evalMarkdown', true);
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
              if (node.type.name === 'image' || node.type.name === 'customImage' || node.type.name === 'customYoutube' || node.type.name === 'linkCard') {
                const isTouchingFromBefore = newState.selection.$from.pos === pos;
                const isTouchingFromAfter = newState.selection.$from.pos === pos + node.nodeSize;
                const isSelected = newState.selection.from <= pos && newState.selection.to >= pos + node.nodeSize;
                const isTouching = isTouchingFromBefore || isTouchingFromAfter || isSelected;
                  
                if (isTouching) {
                  let textStr = '';
                  if (node.type.name === 'customYoutube') {
                    textStr = node.attrs.originalUrl || node.attrs.src;
                  } else if (node.type.name === 'linkCard') {
                    const { type, url, alt } = node.attrs;
                    if (type === 'thumb') {
                      textStr = `[mx-thumb#${alt}](${url})`;
                    } else if (type === 'link') {
                      textStr = `[mx-link#${alt}](${url})`;
                    } else if (type === 'video') {
                      textStr = `[mx-video#${alt}](${url})`;
                    } else {
                      textStr = url;
                    }
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
            let changes: { start: number, end: number, node?: any, markType?: any, symLength?: number }[] = [];
            newState.doc.descendants((node, pos) => {
              if (node.isTextblock) {
                const text = node.textContent;
                if (!text.includes('*') && !text.includes('~') && !text.includes('`') && !text.includes('![') && !text.includes('youtu') && !text.includes('mx-') && !text.includes('http')) return;

                const regexes = [
                  { name: 'bold', regex: /\*\*([^\*]+)\*\*/g, symLength: 2 },
                  { name: 'strike', regex: /~~([^~]+)~~/g, symLength: 2 },
                  { name: 'code', regex: /`([^`]+)`/g, symLength: 1 },
                  { name: 'italic', regex: /(^|[^\*])\*([^\*]+)\*(?=[^\*]|$)/g, symLength: 1, isComplex: true },
                ];

                for (const { name, regex, symLength, isComplex } of regexes) {
                  let match;
                  const markType = newState.schema.marks[name];
                  while ((match = regex.exec(text)) !== null) {
                    const start = pos + 1 + match.index + (isComplex ? match[1].length : 0);
                    const end = start + match[0].length - (isComplex ? match[1].length : 0);
                    const isTouching = (newState.selection.$from.pos >= start && newState.selection.$from.pos <= end) || (newState.selection.$to.pos >= start && newState.selection.$to.pos <= end);

                    if (!isTouching) {
                      const type = newState.schema.marks[name];
                      if (type) {
                        changes.push({
                          start, end,
                          node: null, // Mark change
                          markType: type,
                          symLength
                        });
                      }
                    }
                  }
                }

                if ((window as any).pmIsMousingDown) return false;

                // Handle Image Markdown text matching
                const imgRegex = /!\[([^\]]*)\]\((?:<([^>]+)>|([^)]+))\)/g;
                let imgMatch;
                while ((imgMatch = imgRegex.exec(text)) !== null) {
                  const start = pos + 1 + imgMatch.index;
                  const end = start + imgMatch[0].length;
                  const isTouching = (newState.selection.$from.pos >= start && newState.selection.$from.pos <= end) || (newState.selection.$to.pos >= start && newState.selection.$to.pos <= end);
                    
                  if (!isTouching) {
                    const imageType = newState.schema.nodes.image || newState.schema.nodes.customImage;
                    if (imageType) {
                      const src = imgMatch[2] || imgMatch[3];
                      changes.push({
                        start, end,
                        node: imageType.create({ alt: imgMatch[1], src })
                      });
                    }
                  }
                }


                // Handle LinkCard (mx-thumb, mx-link, mx-video)
                const mxRegex = /\[mx-(thumb|link|video|plain)#?([^\]]*)\]\(([^)]+)\)/g;
                let mxMatch;
                while ((mxMatch = mxRegex.exec(text)) !== null) {
                  const matchStart = mxMatch.index;
                  const matchEnd = matchStart + mxMatch[0].length;
                  
                  // Accurate position calculation within the textblock
                  const start = pos + 1 + matchStart;
                  const end = pos + 1 + matchEnd;
                  
                  const isTouching = (newState.selection.$from.pos >= start && newState.selection.$from.pos <= end) || (newState.selection.$to.pos >= start && newState.selection.$to.pos <= end);
                  
                  // More robust check for existing linkCard node in this range
                  let isAlreadyLinkCard = false;
                  newState.doc.nodesBetween(start, end, (node) => {
                    if (node.type.name === 'linkCard') isAlreadyLinkCard = true;
                  });

                  if (!isTouching && !isAlreadyLinkCard) {
                    const linkCardType = newState.schema.nodes.linkCard;
                    if (linkCardType) {
                      changes.push({ 
                        start, end, 
                        node: linkCardType.create({ type: mxMatch[1], alt: mxMatch[2], url: mxMatch[3] }) 
                      });
                    }
                  }
                }

                // Handle Plain URL detection
                const plainUrlRegex = /(https?:\/\/[^\s<)]+)/g;
                let plainMatch;
                while ((plainMatch = plainUrlRegex.exec(text)) !== null) {
                  const start = pos + 1 + plainMatch.index;
                  const end = start + plainMatch[0].length;
                  const isTouching = (newState.selection.$from.pos >= start && newState.selection.$from.pos <= end) || (newState.selection.$to.pos >= start && newState.selection.$to.pos <= end);
                  
                  const textBefore = text.slice(0, plainMatch.index);
                  const isInsideLink = /\[[^\]]*\]\($/.test(textBefore) || /!\[[^\]]*\]\($/.test(textBefore);

                  // Check if already a linkCard node at this position
                  const existingNode = newState.doc.nodeAt(start);
                  const isAlreadyLinkCard = existingNode && existingNode.type.name === 'linkCard';

                  if (!isTouching && !isInsideLink && !isAlreadyLinkCard) {
                    const linkCardType = newState.schema.nodes.linkCard;
                    if (linkCardType) {
                      // Only push if this range doesn't overlap with already matched patterns
                      if (!changes.some(c => (start >= c.start && start < c.end) || (end > c.start && end <= c.end))) {
                        changes.push({ 
                          start, end, 
                          node: linkCardType.create({ type: 'plain', url: plainMatch[1] }) 
                        });
                      }
                    }
                  }
                }
              }
            });

            if (changes.length > 0) {
              // Apply changes from back to front to maintain positions
              changes.sort((a, b) => b.start - a.start);
              changes.forEach(change => {
                if (change.node) {
                  tr.replaceWith(change.start, change.end, change.node);
                } else if (change.markType && change.symLength) {
                  tr.addMark(change.start + change.symLength, change.end - change.symLength, change.markType.create());
                  tr.delete(change.end - change.symLength, change.end);
                  tr.delete(change.start, change.start + change.symLength);
                }
              });
              return true;
            }
            return false;
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
      saveBtn.title = 'Apply';
      
      const cancelBtn = document.createElement('button');
      cancelBtn.innerHTML = 'x';
      cancelBtn.style.cursor = 'pointer';
      cancelBtn.style.fontSize = '12px';
      cancelBtn.style.padding = '4px 8px';
      cancelBtn.style.background = '#ef4444';
      cancelBtn.style.color = 'white';
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '4px';
      cancelBtn.title = 'Cancel';

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

const SaveShortcut = Extension.create({
  name: 'saveShortcut',
  addKeyboardShortcuts() {
    return {
      'Mod-s': () => {
        if (this.options.onSave) {
          const markdown = postprocessMarkdown((this.editor.storage as any).markdown.getMarkdown());
          this.options.onSave(markdown);
        }
        return true;
      },
    };
  },
  addOptions() {
    return {
      onSave: null,
    };
  },
});

export default forwardRef(function Editor({ value, onChange, onSave, onPasteImage, onRenameImage, resolveImage, isDark, onHeadingVisible, onSelectionChange }: { value: string, onChange: (v: string) => void, onSave?: (v: string) => void, onPasteImage?: (file: File) => Promise<string>, onRenameImage?: (oldSrc: string, newName: string) => Promise<string>, resolveImage?: (src: string) => Promise<string>, isDark: boolean, onHeadingVisible?: (index: number) => void, onSelectionChange?: (selection: { start: number, end: number }) => void }, ref: any) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);


  const extensions = React.useMemo(() => [
    StarterKit.configure({ codeBlock: false, heading: false, blockquote: false }),
    Markdown,
    CustomCodeBlock,
    CustomHeading,
    CustomBlockquote,
    ImagePastingExtension.configure({ onPasteImage }),
    LiveMarkdownExtension,
    CustomImage.configure({ resolveImage, onRenameImage }),
    MathExtension.configure({ evaluation: false }),
    SaveShortcut.configure({ onSave }),
    LinkCardExtension,
  ], [onPasteImage, resolveImage, onRenameImage, onSave, onSelectionChange]);

  const lastSentValueRef = React.useRef(value);

  const editor = useEditor({
    extensions,
    content: preprocessMarkdown(value),
    onUpdate: ({ editor }) => {
      if ((window as any).onUpdateTimer) {
        clearTimeout((window as any).onUpdateTimer);
      }
      
      (window as any).onUpdateTimer = setTimeout(() => {
        if (editor.isDestroyed) return;
        const markdown = postprocessMarkdown((editor.storage as any).markdown.getMarkdown());
        lastSentValueRef.current = markdown;
        onChange(markdown);
      }, 300);
    },
    onSelectionUpdate: ({ editor }) => {
      if (onSelectionChange) {
        onSelectionChange({
          start: editor.state.selection.from,
          end: editor.state.selection.to
        });
      }
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
      // If the value is the same as what we just sent, or the same as current content, don't reset
      if (value === lastSentValueRef.current) return;

      const currentMarkdown = (editor.storage as any).markdown.getMarkdown();
      if (currentMarkdown !== value) {
        const processedNew = preprocessMarkdown(value);
        const processedCurrent = preprocessMarkdown(currentMarkdown);
        if (processedCurrent !== processedNew) {
          editor.commands.setContent(processedNew, false);
          lastSentValueRef.current = value;
        }
      }
    }
  }, [value, editor]);

  useEffect(() => {
    if (!onHeadingVisible || !wrapperRef.current || !editor) return;

    const container = wrapperRef.current;
    const observer = new IntersectionObserver(
      () => {
        const allHeadings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        if (allHeadings.length === 0) return;

        const containerRect = container.getBoundingClientRect();
        let bestIndex = -1;
        
        for (let i = 0; i < allHeadings.length; i++) {
          const rect = allHeadings[i].getBoundingClientRect();
          const relativeTop = rect.top - containerRect.top;
          if (relativeTop <= 170) {
            bestIndex = i;
          } else {
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

    const updateObservations = () => {
      if (editor.isDestroyed) return;
      observer.disconnect();
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(h => observer.observe(h));
    };

    updateObservations();
    editor.on('selectionUpdate', updateObservations);
    editor.on('update', updateObservations);

    return () => {
      observer.disconnect();
      if (!editor.isDestroyed) {
        editor.off('selectionUpdate', updateObservations);
        editor.off('update', updateObservations);
      }
    };
  }, [editor, onHeadingVisible]);

  useImperativeHandle(ref, () => ({
    scrollToHeading: (index: number, text?: string) => {
      if (!editor || editor.isDestroyed) return;

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
      if (!editor || editor.isDestroyed) return;
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
    <div ref={wrapperRef} className="tiptap-wrapper" data-testid="editor-container" style={{ height: '100%', maxHeight: '100%', boxSizing: 'border-box', flex: 1, backgroundColor: bgColor, overflowY: 'auto', color: textColor, '--cb-bg': cbBg, '--cb-bg-header': cbBgHeader, '--cb-border': cbBorder, '--cb-text': cbText, '--cb-copy': cbCopy } as React.CSSProperties}>
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
          line-height: 1.25;
          font-weight: 700;
        }
        
        .tiptap-wrapper h1 { font-size: 2rem; font-weight: 800; border-bottom: 1px solid ${isDark ? '#374151' : '#E5E7EB'}; padding-bottom: 0.3em; margin-top: 2rem; margin-bottom: 1rem; }
        .tiptap-wrapper h2 { font-size: 1.6rem; font-weight: 700; border-bottom: 1px solid ${isDark ? '#374151' : '#E5E7EB'}; padding-bottom: 0.3em; margin-top: 1.8rem; margin-bottom: 0.8rem; }
        .tiptap-wrapper h3 { font-size: 1.3rem; font-weight: 700; margin-top: 1.6rem; margin-bottom: 0.6rem; }
        .tiptap-wrapper h4 { font-size: 1.15rem; font-weight: 700; margin-top: 1.4rem; margin-bottom: 0.4rem; color: ${isDark ? '#F3F4F6' : '#111827'}; }
        .tiptap-wrapper h5 { font-size: 1.05rem; font-weight: 700; margin-top: 1.2rem; margin-bottom: 0.3rem; color: ${isDark ? '#D1D5DB' : '#374151'}; }
        .tiptap-wrapper h6 { font-size: 1rem; font-weight: 700; margin-top: 1rem; margin-bottom: 0.2rem; color: ${isDark ? '#9CA3AF' : '#6B7280'}; text-transform: uppercase; letter-spacing: 0.05em; }
        
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
        <div data-testid="editor-input" style={{ height: '100%' }}>
          <EditorContent editor={editor} />
        </div>
    </div>
  );
});
