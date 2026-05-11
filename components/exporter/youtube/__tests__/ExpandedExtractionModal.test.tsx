import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ExpandedExtractionModal } from '../ExpandedExtractionModal';

jest.mock('../../../../utils/PlaylistParserUtils', () => ({
  serializePlaylistToMarkdown: jest.fn().mockReturnValue('mocked markdown preview'),
  formatYoutubeLink: jest.fn().mockReturnValue('mocked-link'),
  // Add other types if needed, but they are usually fine as they are types
}));

jest.mock('@/contexts/SettingsContext', () => ({
  useAppSettings: () => ({
    apiKeys: { youtube: 'mock-api-key' }
  })
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      surface: '#fff',
      border: '#ccc',
      text: '#000',
      textMuted: '#666',
      primary: '#007AFF',
      background: '#f5f5f5'
    },
    isDark: false,
    fontFamilyUI: 'System'
  })
}));

jest.mock('@/utils/YoutubeUtils', () => ({
  extractPlaylistId: jest.fn().mockReturnValue('mock-id'),
  fetchPlaylistMetadata: jest.fn().mockResolvedValue({ title: 'Mock Playlist', itemCount: 10 }),
  fetchPlaylistItems: jest.fn().mockResolvedValue({
    items: [
      { videoId: '123', title: 'Video 1', url: 'https://youtube.com/watch?v=123' }
    ],
    nextPageToken: undefined
  })
}));
describe('ExpandedExtractionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnExtract = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly in default mode (Empty State)', () => {
    const { getByText, getByPlaceholderText } = render(
      <ExpandedExtractionModal visible={true} onClose={mockOnClose} onExtract={mockOnExtract} />
    );

    expect(getByText('Extract Youtube Playlist')).toBeTruthy();
    expect(getByText('Enter URL to see preview')).toBeTruthy();
    expect(getByPlaceholderText('https://youtube.com/playlist?list=...')).toBeTruthy();
  });

  it('locks D-1 mode and shows banner when targetDirectory is provided', () => {
    const { getByText } = render(
      <ExpandedExtractionModal 
        visible={true} 
        onClose={mockOnClose} 
        onExtract={mockOnExtract} 
        targetDirectory="/my/target/path" 
      />
    );

    expect(getByText('Auto-saving to: /my/target/path')).toBeTruthy();
    expect(getByText('Extract & Create File')).toBeTruthy();
  });

  it('shows loading skeleton and then renders preview when URL is entered', async () => {
    const { getByPlaceholderText, getByText, queryByText, getByTestId } = render(
      <ExpandedExtractionModal visible={true} onClose={mockOnClose} onExtract={mockOnExtract} />
    );

    const input = getByPlaceholderText('https://youtube.com/playlist?list=...');
    
    act(() => {
      fireEvent.changeText(input, 'https://youtube.com/playlist?list=mock');
    });

    // Should show loading text immediately
    expect(getByText('Fetching Playlist Data...')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Flush promises
    await act(async () => {
      await Promise.resolve();
    });

    // Switch to markdown tab
    await act(async () => {
      fireEvent.press(getByTestId('tab-markdown'));
      await Promise.resolve();
    });

    // One more tick for the editableData effect
    await act(async () => {
      await Promise.resolve();
    });

    // Loading text should be gone
    await waitFor(async () => {
      // Advance timers and flush multiple times to get through the loop
      act(() => { jest.advanceTimersByTime(100); });
      await Promise.resolve();
      await Promise.resolve();
      
      expect(queryByText('Fetching Playlist Data...')).toBeNull();
      expect(getByText('mocked markdown preview')).toBeTruthy();
    }, { timeout: 5000 });
  });

  it('calls onExtract with correct arguments', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ExpandedExtractionModal visible={true} onClose={mockOnClose} onExtract={mockOnExtract} />
    );

    const input = getByPlaceholderText('https://youtube.com/playlist?list=...');
    
    act(() => {
      fireEvent.changeText(input, 'https://youtube.com/playlist?list=mock');
    });

    // Wait for loading to finish
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Flush all pending promises from the async fetch
    await act(async () => {
      await Promise.resolve();
    });

    const extractBtn = getByText('Extract & Insert');
    
    act(() => {
      fireEvent.press(extractBtn);
    });

    expect(mockOnExtract).toHaveBeenCalledWith(
      'https://youtube.com/playlist?list=mock', 
      'D-2', 
      'URL', 
      'Plain', 
      undefined, 
      [
        { id: '123', title: 'Video 1', url: 'https://youtube.com/watch?v=123', note: '' }
      ], 
      'Mock Playlist'
    );
    expect(mockOnClose).toHaveBeenCalled();
  });
});
