import React from 'react';
import TestRenderer from 'react-test-renderer';
import { useGemini } from '../useGemini';

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: jest.fn((obj) => obj.web || obj.default),
  },
}));

// Mock expo-auth-session
jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value.toString(); }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
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

  it('should initialize with default values', () => {
    let result: any;
    TestRenderer.act(() => {
      TestRenderer.create(<Consumer callback={(g) => (result = g)} />);
    });

    expect(result.geminiApiKey).toBe('');
    expect(result.selectedModel).toBe('gemini-3.5-flash');
  });

  it('should save settings to localStorage and update state', () => {
    let result: any;
    TestRenderer.act(() => {
      TestRenderer.create(<Consumer callback={(g) => (result = g)} />);
    });

    TestRenderer.act(() => {
      result.setTempApiKey('new-test-key');
      result.setTempModel('gemini-3.1-pro-preview');
    });

    TestRenderer.act(() => {
      result.saveSettings();
    });

    expect(result.geminiApiKey).toBe('new-test-key');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('gemini_api_key', 'new-test-key');
  });
});
