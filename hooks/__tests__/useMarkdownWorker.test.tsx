import React from 'react';
import TestRenderer from 'react-test-renderer';
import { useMarkdownWorker } from '../useMarkdownWorker';

// Mock Worker
const mockPostMessage = jest.fn();
const mockTerminate = jest.fn();

class MockWorker {
  onmessage: ((ev: MessageEvent) => any) | null = null;
  onmessageerror: ((ev: MessageEvent) => any) | null = null;
  onerror: ((ev: ErrorEvent) => any) | null = null;
  
  postMessage = mockPostMessage;
  terminate = mockTerminate;
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  dispatchEvent = jest.fn();
}

// @ts-ignore
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
// @ts-ignore
global.URL.revokeObjectURL = jest.fn();

// @ts-ignore
global.Worker = MockWorker;

describe('useMarkdownWorker', () => {
  const Consumer = ({ content, callback }: { content: string, callback: (worker: any) => void }) => {
    const worker = useMarkdownWorker(content);
    React.useEffect(() => {
        callback(worker);
    }, [worker, content]);
    return null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should clear hast state immediately when content changes', () => {
    let result: any;
    let renderer: any;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <Consumer content="# Initial" callback={(w) => (result = w)} />
      );
    });

    // Rerender with new content
    TestRenderer.act(() => {
      renderer.update(
        <Consumer content="# New Content" callback={(w) => (result = w)} />
      );
    });

    // isParsing should be true and hast should be null
    expect(result.isParsing).toBe(true);
    expect(result.hast).toBeNull();
    expect(mockPostMessage).toHaveBeenCalledTimes(2);
  });
});
