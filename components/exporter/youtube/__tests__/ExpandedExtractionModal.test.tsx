import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ExpandedExtractionModal } from '../ExpandedExtractionModal';

jest.mock('../../../../utils/PlaylistParserUtils', () => ({
  serializePlaylistToMarkdown: jest.fn().mockReturnValue('mocked markdown preview')
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
    const { getByPlaceholderText, getByText, queryByText } = render(
      <ExpandedExtractionModal visible={true} onClose={mockOnClose} onExtract={mockOnExtract} />
    );

    const input = getByPlaceholderText('https://youtube.com/playlist?list=...');
    
    act(() => {
      fireEvent.changeText(input, 'https://youtube.com/playlist?list=mock');
    });

    // Should show loading text immediately
    expect(getByText('Fetching Playlist Data...')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(800);
    });

    // Loading text should be gone
    expect(queryByText('Fetching Playlist Data...')).toBeNull();
    // Rendered markdown preview should be visible
    expect(getByText('mocked markdown preview')).toBeTruthy();
  });

  it('calls onExtract with correct arguments', () => {
    const { getByPlaceholderText, getByText } = render(
      <ExpandedExtractionModal visible={true} onClose={mockOnClose} onExtract={mockOnExtract} />
    );

    const input = getByPlaceholderText('https://youtube.com/playlist?list=...');
    
    act(() => {
      fireEvent.changeText(input, 'https://youtube.com/playlist?list=mock');
    });

    const extractBtn = getByText('Extract & Insert');
    
    act(() => {
      fireEvent.press(extractBtn);
    });

    expect(mockOnExtract).toHaveBeenCalledWith('https://youtube.com/playlist?list=mock', 'D-2', 'URL', undefined);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
