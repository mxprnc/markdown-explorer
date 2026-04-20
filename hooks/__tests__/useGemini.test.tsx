import React from 'react';
import TestRenderer from 'react-test-renderer';
import { useGemini } from '../useGemini';
import * as Google from 'expo-auth-session/providers/google';

jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: jest.fn((obj) => obj.web || obj.default),
  },
}));

jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

// Mock localStorage for web
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage, writable: true });

describe('useGemini', () => {
  const Consumer = ({ callback }: { callback: (gemini: any) => void }) => {
    const gemini = useGemini();
    React.useEffect(() => {
        callback(gemini);
    }, [gemini]);
    return null;
  };

  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  test('should initialize with default values', () => {
    let result: any;
    TestRenderer.act(() => {
      TestRenderer.create(<Consumer callback={(g) => (result = g)} />);
    });

    expect(result.geminiApiKey).toBe('');
    expect(result.selectedModel).toBe('gemini-2.5-pro');
  });

  test('saveSettings should update state', () => {
    let result: any;
    TestRenderer.act(() => {
      TestRenderer.create(<Consumer callback={(g) => (result = g)} />);
    });

    TestRenderer.act(() => {
      result.setTempApiKey('test-key');
      result.setTempModel('gemini-3.1-pro-preview');
    });

    // Now call saveSettings with the updated state
    TestRenderer.act(() => {
      result.saveSettings();
    });

    expect(result.geminiApiKey).toBe('test-key');
    expect(mockLocalStorage.getItem('gemini_api_key')).toBe('test-key');
  });
});
