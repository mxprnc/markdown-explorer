import React from 'react';
import TestRenderer from 'react-test-renderer';
import { useChatHistory } from '../useChatHistory';

// Mock IndexedDB
const mockIndexedStore: Record<string, any> = {};
jest.mock('@/utils/IndexedDBUtils', () => ({
  getSetting: jest.fn(async (key: string) => mockIndexedStore[key] || null),
  setSetting: jest.fn(async (key: string, value: any) => { mockIndexedStore[key] = value; })
}));

describe('useChatHistory', () => {
  const Consumer = ({ callback, dirHandle, provider, model }: { callback: (history: any) => void, dirHandle: any, provider: any, model: any }) => {
    const history = useChatHistory(dirHandle, provider, model);
    React.useEffect(() => {
      callback(history);
    }, [history]);
    return null;
  };

  beforeEach(() => {
    // Clear mock store
    Object.keys(mockIndexedStore).forEach(k => delete mockIndexedStore[k]);
    jest.clearAllMocks();
  });

  it('should initialize with empty chat list and active chat id', () => {
    let result: any;
    TestRenderer.act(() => {
      TestRenderer.create(
        <Consumer 
          callback={(h) => (result = h)} 
          dirHandle={null} 
          provider="gemini" 
          model="gemini-3.5-flash" 
        />
      );
    });

    expect(result.chatList).toEqual([]);
    expect(result.activeChatId).toBeNull();
    expect(result.messages).toEqual([]);
  });

  it('should create a new chat and update activeChatId', async () => {
    let result: any;
    TestRenderer.act(() => {
      TestRenderer.create(
        <Consumer 
          callback={(h) => (result = h)} 
          dirHandle={null} 
          provider="gemini" 
          model="gemini-3.5-flash" 
        />
      );
    });

    let newId: string | null = null;
    await TestRenderer.act(async () => {
      newId = await result.createNewChat('테스트 대화방');
    });

    expect(newId).not.toBeNull();
    expect(result.activeChatId).toBe(newId);
    expect(result.chatList.length).toBe(1);
    expect(result.chatList[0].title).toBe('테스트 대화방');
  });

  it('should rename an existing chat title', async () => {
    let result: any;
    TestRenderer.act(() => {
      TestRenderer.create(
        <Consumer 
          callback={(h) => (result = h)} 
          dirHandle={null} 
          provider="gemini" 
          model="gemini-3.5-flash" 
        />
      );
    });

    let newId: string | null = null;
    await TestRenderer.act(async () => {
      newId = await result.createNewChat('구이름');
    });

    await TestRenderer.act(async () => {
      const success = await result.renameChat(newId!, '새이름');
      expect(success).toBe(true);
    });

    expect(result.chatList[0].title).toBe('새이름');
  });

  it('should delete a chat session and reset active states if active', async () => {
    let result: any;
    TestRenderer.act(() => {
      TestRenderer.create(
        <Consumer 
          callback={(h) => (result = h)} 
          dirHandle={null} 
          provider="gemini" 
          model="gemini-3.5-flash" 
        />
      );
    });

    let newId: string | null = null;
    await TestRenderer.act(async () => {
      newId = await result.createNewChat('삭제할 대화');
    });

    expect(result.activeChatId).toBe(newId);

    await TestRenderer.act(async () => {
      const success = await result.deleteChat(newId!);
      expect(success).toBe(true);
    });

    expect(result.chatList.length).toBe(0);
    expect(result.activeChatId).toBeNull();
    expect(result.messages).toEqual([]);
  });
});
