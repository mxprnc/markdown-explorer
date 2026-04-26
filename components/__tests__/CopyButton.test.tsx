import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CopyButton } from '../ui/CopyButton';
import { ThemeProvider } from '@/contexts/ThemeContext';
import * as ClipboardUtils from '@/utils/ClipboardUtils';

// Mock the clipboard utility
jest.mock('@/utils/ClipboardUtils', () => ({
  copyToClipboard: jest.fn(() => Promise.resolve()),
}));

// Mock Ionicons to avoid rendering issues in tests
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('CopyButton Component', () => {
  const testContent = 'console.log("Hello World");';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with the initial "Copy" label', () => {
    const { getByText } = render(
      <ThemeProvider initialIsDark={false}>
        <CopyButton content={testContent} />
      </ThemeProvider>
    );

    expect(getByText('Copy')).toBeTruthy();
  });

  it('calls copyToClipboard when pressed', async () => {
    const { getByTestId } = render(
      <ThemeProvider initialIsDark={false}>
        <CopyButton content={testContent} />
      </ThemeProvider>
    );

    const button = getByTestId('copy-button');
    
    await act(async () => {
      fireEvent.press(button);
    });

    expect(ClipboardUtils.copyToClipboard).toHaveBeenCalledWith(testContent);
  });

  it('changes label to "Copied" after successful copy', async () => {
    const { getByText, queryByText } = render(
      <ThemeProvider initialIsDark={false}>
        <CopyButton content={testContent} />
      </ThemeProvider>
    );

    const button = getByText('Copy');
    
    await act(async () => {
      fireEvent.press(button);
    });

    expect(getByText('Copied')).toBeTruthy();
    expect(queryByText('Copy')).toBeNull();
  });

  it('reverts label back to "Copy" after timeout', async () => {
    const { getByText } = render(
      <ThemeProvider initialIsDark={false}>
        <CopyButton content={testContent} />
      </ThemeProvider>
    );

    const button = getByText('Copy');
    
    await act(async () => {
      fireEvent.press(button);
    });

    expect(getByText('Copied')).toBeTruthy();

    // Fast-forward 2000ms
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(getByText('Copy')).toBeTruthy();
  });
});
