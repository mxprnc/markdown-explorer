import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';

export default function Editor({ value, onChange, isDark }: { value: string, onChange: (v: string) => void, isDark: boolean }) {
  const [internalValue, setInternalValue] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // Get the markdown content whenever the user types
      const markdown = (editor.storage as any).markdown.getMarkdown();
      setInternalValue(markdown);
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose outline-none focus:outline-none max-w-none',
        style: 'min-height: 100%; padding: 40px; font-family: Inter, sans-serif; font-size: 16px; line-height: 1.6;'
      }
    }
  });

  // Update content externally when file changes
  useEffect(() => {
    if (editor && value !== internalValue) {
      editor.commands.setContent(value);
      setInternalValue(value);
    }
  }, [value, editor]);

  const textColor = isDark ? '#F3F4F6' : '#121212';
  const bgColor = isDark ? '#121212' : '#ffffff';
  
  return (
    <div className="tiptap-wrapper" style={{ flex: 1, backgroundColor: bgColor, overflowY: 'auto', color: textColor }}>
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

        .tiptap-wrapper pre {
          background-color: ${isDark ? '#111827' : '#F3F4F6'};
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          border: 1px solid ${isDark ? '#374151' : '#E5E7EB'};
          margin-bottom: 1rem;
        }

        .tiptap-wrapper pre code {
          background-color: transparent;
          color: ${isDark ? '#E5E7EB' : '#1F2937'};
          padding: 0;
          border-radius: 0;
        }
      `}</style>
      <EditorContent editor={editor} style={{ height: '100%' }} />
    </div>
  );
}
