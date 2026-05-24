import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import GeminiChat from '../GeminiChat';

// Mock settings context
jest.mock('@/contexts/SettingsContext', () => ({
  useAppSettings: () => ({
    geminiApiKey: 'mock-gemini-key',
    googleAccessToken: '',
    selectedModel: 'gemini-3.5-flash',
    setSelectedModel: jest.fn(),
    setShowGeminiSettings: jest.fn(),
    aiProvider: 'gemini',
    openaiApiKey: '',
    claudeApiKey: ''
  })
}));

// Mock theme context
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      surface: '#fff',
      border: '#ccc',
      text: '#000',
      textMuted: '#666',
      primary: '#007AFF',
      background: '#f5f5f5',
      userBubble: '#E0F2FE',
      modelBubble: '#F3F4F6'
    },
    isDark: false,
    fontFamilyCode: 'Courier'
  })
}));

// Mock react-syntax-highlighter
jest.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>{children}</Text>;
  },
}));
jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
  oneLight: {},
}));

// Mock expo-clipboard
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true)
}));

// Mock react-native-markdown-display
jest.mock('react-native-markdown-display', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ children }: any) => <Text>{children}</Text>;
});

// Mock GoogleGenerativeAI
const mockGenerateContent = jest.fn().mockResolvedValue({
  response: {
    text: () => 'Mocked Gemini Response'
  }
});

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent
    })
  }))
}));

describe('GeminiChat Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with given messages and supports copying for both user and model messages', async () => {
    const chatMessages = [
      { role: 'user' as const, content: 'Hello assistant' },
      { role: 'model' as const, content: 'Hello user' }
    ];

    const { getByText, getByTestId } = render(
      <GeminiChat 
        currentContent="Some content"
        chatMessages={chatMessages}
        onSaveActiveChat={jest.fn()}
      />
    );

    expect(getByText('Hello assistant')).toBeTruthy();
    expect(getByText('Hello user')).toBeTruthy();
    expect(getByTestId('regenerate-btn-1')).toBeTruthy();
    expect(getByTestId('copy-btn-0')).toBeTruthy(); // User bubble copy btn
    expect(getByTestId('copy-btn-1')).toBeTruthy(); // Model bubble copy btn

    const Clipboard = require('expo-clipboard');
    await act(async () => {
      fireEvent.press(getByTestId('copy-btn-0'));
    });
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('Hello assistant');
  });

  it('calls onSaveActiveChat with updated versions list when regenerate is clicked', async () => {
    const chatMessages = [
      { role: 'user' as const, content: 'Hello assistant' },
      { 
        role: 'model' as const, 
        content: 'Hello user',
        versions: [{ content: 'Hello user', model: 'gemini-3.5-flash', provider: 'gemini' as const }],
        activeVersionIndex: 0
      }
    ];

    const mockSaveActiveChat = jest.fn().mockResolvedValue(undefined);

    const { getByTestId } = render(
      <GeminiChat 
        currentContent="Some content"
        chatMessages={chatMessages}
        onSaveActiveChat={mockSaveActiveChat}
      />
    );

    const regenerateBtn = getByTestId('regenerate-btn-1');

    await act(async () => {
      fireEvent.press(regenerateBtn);
    });

    // Wait for the AI mock to be called and completed
    await waitFor(() => {
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    // Verify it saved active chat with the updated versions list
    expect(mockSaveActiveChat).toHaveBeenCalledWith([
      { role: 'user', content: 'Hello assistant' },
      { 
        role: 'model', 
        content: 'Mocked Gemini Response',
        versions: [
          { content: 'Hello user', model: 'gemini-3.5-flash', provider: 'gemini' },
          { content: 'Mocked Gemini Response', model: 'gemini-3.5-flash', provider: 'gemini' }
        ],
        activeVersionIndex: 1
      }
    ]);
  });

  it('allows switching between different regenerated versions using pagination buttons', async () => {
    const chatMessages = [
      { role: 'user' as const, content: 'Hello assistant' },
      { 
        role: 'model' as const, 
        content: 'Response Version 2',
        versions: [
          { content: 'Response Version 1', model: 'gemini-3.5-flash', provider: 'gemini' as const },
          { content: 'Response Version 2', model: 'gemini-3.5-flash', provider: 'gemini' as const },
          { content: 'Response Version 3', model: 'gemini-3.5-flash', provider: 'gemini' as const }
        ],
        activeVersionIndex: 1
      }
    ];

    const mockSaveActiveChat = jest.fn().mockResolvedValue(undefined);

    const { getByTestId, getByText } = render(
      <GeminiChat 
        currentContent="Some content"
        chatMessages={chatMessages}
        onSaveActiveChat={mockSaveActiveChat}
      />
    );

    // Verify the version text displays "2 / 3"
    expect(getByText('2 / 3')).toBeTruthy();

    const prevBtn = getByTestId('prev-version-btn-1');

    // Click previous version button
    await act(async () => {
      fireEvent.press(prevBtn);
    });

    // Verify it updated active chat to select Version 1 (index 0)
    expect(mockSaveActiveChat).toHaveBeenCalledWith([
      { role: 'user', content: 'Hello assistant' },
      { 
        role: 'model', 
        content: 'Response Version 1',
        versions: [
          { content: 'Response Version 1', model: 'gemini-3.5-flash', provider: 'gemini' },
          { content: 'Response Version 2', model: 'gemini-3.5-flash', provider: 'gemini' },
          { content: 'Response Version 3', model: 'gemini-3.5-flash', provider: 'gemini' }
        ],
        activeVersionIndex: 0
      }
    ]);
  });

  it('displays the friendly name of the active model in the role label header', () => {
    const chatMessages = [
      { role: 'user' as const, content: 'Hello assistant' },
      { 
        role: 'model' as const, 
        content: 'Hello user',
        versions: [{ content: 'Hello user', model: 'gemini-3.1-pro-preview', provider: 'gemini' as const }],
        activeVersionIndex: 0
      }
    ];

    const { getByText } = render(
      <GeminiChat 
        currentContent="Some content"
        chatMessages={chatMessages}
        onSaveActiveChat={jest.fn()}
      />
    );

    // Verify it maps 'gemini-3.1-pro-preview' to its friendly label 'Gemini 3.1 Pro (Reasoning)'
    expect(getByText('GEMINI (Gemini 3.1 Pro (Reasoning))')).toBeTruthy();
  });

  it('renders maximize button when onMaximize callback is provided and triggers on press', async () => {
    const mockOnMaximize = jest.fn();
    const { getByTestId } = render(
      <GeminiChat 
        currentContent="Some content"
        chatMessages={[]}
        onSaveActiveChat={jest.fn()}
        onMaximize={mockOnMaximize}
      />
    );

    const maximizeBtn = getByTestId('gemini-maximize-btn');
    expect(maximizeBtn).toBeTruthy();

    await act(async () => {
      fireEvent.press(maximizeBtn);
    });

    expect(mockOnMaximize).toHaveBeenCalled();
  });

  it('displays autocomplete file suggestions when typing @ and updates input on selection', async () => {
    const fileList = ['src/components/Editor.tsx', 'src/utils/Helper.ts', 'package.json'];
    const { getByPlaceholderText, getByText, queryByText } = render(
      <GeminiChat 
        currentContent="Some content"
        chatMessages={[]}
        onSaveActiveChat={jest.fn()}
        fileList={fileList}
      />
    );

    const input = getByPlaceholderText('Type a message...');
    
    // Suggestion dropdown should not be present initially
    expect(queryByText('@package.json')).toBeNull();

    // Type '@' to trigger suggestions
    await act(async () => {
      fireEvent.changeText(input, '@');
    });

    // Check that matching files show up in the dropdown
    expect(getByText('@package.json')).toBeTruthy();
    expect(getByText('@Editor.tsx')).toBeTruthy();

    // Press a suggestion
    await act(async () => {
      fireEvent.press(getByText('@package.json'));
    });

    // Verify it replaced the trigger with the file value and closed the dropdown
    expect(input.props.value).toBe('@package.json ');
    expect(queryByText('@package.json')).toBeNull();
  });

  it('displays autocomplete command suggestions when typing $ and filters based on active provider', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <GeminiChat 
        currentContent="Some content"
        chatMessages={[]}
        onSaveActiveChat={jest.fn()}
      />
    );

    const input = getByPlaceholderText('Type a message...');

    // Type '$' to trigger suggestions
    await act(async () => {
      fireEvent.changeText(input, '$');
    });

    // Since default provider is 'gemini', it should show gemini specific skills
    expect(getByText('$analyze-code')).toBeTruthy();
    expect(getByText('$refactor-code')).toBeTruthy();
    expect(queryByText('$deep-reasoning')).toBeNull(); // OpenAI only

    // Press a suggestion
    await act(async () => {
      fireEvent.press(getByText('$analyze-code'));
    });

    // Verify injection
    expect(input.props.value).toBe('$analyze-code ');
  });
});
