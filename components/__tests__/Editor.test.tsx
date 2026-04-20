import React from 'react';
import TestRenderer from 'react-test-renderer';
import Editor from '../Editor.web';

// Mock Tiptap
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(() => ({
    storage: { markdown: { getMarkdown: () => '# Test' } },
    on: jest.fn(),
    off: jest.fn(),
    commands: {
      focus: jest.fn(),
      setTextSelection: jest.fn(),
      scrollIntoView: jest.fn(),
    },
    state: {
        doc: {
            descendants: jest.fn()
        }
    }
  })),
  EditorContent: ({ editor }: any) => <div />,
  ReactNodeViewRenderer: jest.fn(),
  NodeViewWrapper: ({ children }: any) => <div>{children}</div>,
  NodeViewContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@tiptap/core', () => ({
  Extension: { create: jest.fn(() => ({})) },
  Node: { create: jest.fn(() => ({})) },
  getMarkRange: jest.fn(),
}));

jest.mock('@tiptap/starter-kit', () => ({
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
}));
jest.mock('@tiptap/extension-code-block', () => ({ 
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
  CodeBlock: { configure: jest.fn(() => ({})) } 
}));
jest.mock('@tiptap/extension-heading', () => ({ 
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
  Heading: { extend: jest.fn(() => ({ configure: jest.fn(() => ({})) })) } 
}));
jest.mock('@tiptap/extension-blockquote', () => ({ 
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
  Blockquote: { extend: jest.fn(() => ({ configure: jest.fn(() => ({})) })) } 
}));
jest.mock('@tiptap/extension-image', () => ({ 
  __esModule: true,
  default: { configure: jest.fn(() => ({})) } 
}));

jest.mock('tiptap-markdown', () => ({ Markdown: { configure: jest.fn(() => ({})) } }));
jest.mock('@aarkue/tiptap-math-extension', () => ({ MathExtension: { configure: jest.fn(() => ({})) } }));
jest.mock('mermaid', () => ({ initialize: jest.fn(), render: jest.fn() }));

describe('Editor Component (Web)', () => {
  it('renders correctly and exposes ref', () => {
    const ref = React.createRef<any>();
    let renderer: any;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <Editor 
          ref={ref}
          value="# Test" 
          onChange={jest.fn()} 
          isDark={false} 
        />
      );
    });

    expect(renderer.toJSON()).toBeDefined();
    expect(ref.current).toBeDefined();
    expect(typeof ref.current.scrollToHeading).toBe('function');
  });
});
