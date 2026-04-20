import React from 'react';
import TestRenderer from 'react-test-renderer';
import Preview from '../Preview.web';

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
});
