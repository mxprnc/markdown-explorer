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

jest.mock('@tiptap/core', () => {
  const mockNode = { 
    configure: jest.fn(() => ({})),
    extend: jest.fn(() => ({ configure: jest.fn(() => ({})) }))
  };
  return {
    Extension: { create: jest.fn(() => mockNode) },
    Node: { create: jest.fn(() => mockNode) },
    getMarkRange: jest.fn(),
  };
});

jest.mock('@tiptap/starter-kit', () => ({
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
}));
jest.mock('@tiptap/extension-code-block', () => {
  const mockNode = { 
    configure: jest.fn(() => ({})),
    extend: jest.fn(() => ({ configure: jest.fn(() => ({})) }))
  };
  return {
    __esModule: true,
    default: mockNode,
    CodeBlock: mockNode
  };
});
jest.mock('@tiptap/extension-heading', () => {
  const mockNode = { 
    configure: jest.fn(() => ({})),
    extend: jest.fn(() => ({ configure: jest.fn(() => ({})) }))
  };
  return {
    __esModule: true,
    default: mockNode,
    Heading: mockNode
  };
});
jest.mock('@tiptap/extension-blockquote', () => {
  const mockNode = { 
    configure: jest.fn(() => ({})),
    extend: jest.fn(() => ({ configure: jest.fn(() => ({})) }))
  };
  return {
    __esModule: true,
    default: mockNode,
    Blockquote: mockNode
  };
});
jest.mock('@tiptap/extension-image', () => {
  const mockNode = { 
    configure: jest.fn(() => ({})),
    extend: jest.fn(() => ({ configure: jest.fn(() => ({})) }))
  };
  return {
    __esModule: true,
    default: mockNode,
    Image: mockNode
  };
});

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
