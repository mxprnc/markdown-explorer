import React from 'react';
import TestRenderer from 'react-test-renderer';
import Preview from '../preview/MarkdownPreview.web';

// Mock ESM packages
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('remark-gfm', () => ({}));
jest.mock('remark-math', () => ({}));
jest.mock('rehype-katex', () => ({}));
jest.mock('rehype-raw', () => ({}));
jest.mock('mermaid', () => ({
  initialize: jest.fn(),
  run: jest.fn(),
}));
jest.mock('fast-deep-equal', () => jest.fn(() => true));
jest.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: any) => <pre>{children}</pre>,
}));
jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
  oneLight: {},
}));

// Mock theme context
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      text: '#121212',
      border: '#E5E7EB',
      surface: '#F9FAFB',
      primary: '#3B82F6',
      textMuted: '#6B7280',
      textHighlight: '#000000',
      accentGlow: 'rgba(59, 130, 246, 0.08)',
    },
    isDark: false,
    fontFamilyCode: 'monospace'
  })
}));

// Mock useMarkdownWorker
jest.mock('../../hooks/useMarkdownWorker', () => ({
  useMarkdownWorker: jest.fn(() => ({
    hast: { type: 'root', children: [] },
    isParsing: false,
    workerError: false
  }))
}));

describe('Preview Component (Web)', () => {
  it('renders correctly', () => {
    let renderer: any;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <Preview 
          content="# Test" 
          isDark={false} 
        />
      );
    });

    expect(renderer.toJSON()).toBeDefined();
  });

  it('should include KaTeX CSS styling in style tag', () => {
    let renderer: any;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <Preview 
          content="# Test" 
          isDark={false} 
        />
      );
    });

    const styleTag = renderer.root.findByType('style');
    expect(styleTag.props.children).toContain('.katex-display');
    expect(styleTag.props.children).toContain('.katex');
  });

  it('should expose scrollToHeading method via ref', () => {
    const ref = React.createRef<any>();
    TestRenderer.act(() => {
      TestRenderer.create(
        <Preview 
          ref={ref}
          content="# Test" 
          isDark={false} 
        />
      );
    });

    expect(ref.current).toBeDefined();
    expect(typeof ref.current.scrollToHeading).toBe('function');
  });
});
