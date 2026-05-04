import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PlaylistUpdateDrawer } from '../PlaylistUpdateDrawer';

describe('PlaylistUpdateDrawer', () => {
  const mockOnApply = jest.fn();
  const mockOnClose = jest.fn();
  
  const sampleItems: any[] = [
    { id: '1', title: 'Video 1', url: 'url1' },
    { id: '2', title: 'Video 2', url: 'url2', note: 'Has a note' },
    { id: '3', title: 'Video 3', url: 'url3' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not visible', () => {
    const { queryByText } = render(
      <PlaylistUpdateDrawer visible={false} items={sampleItems} onApply={mockOnApply} onClose={mockOnClose} />
    );
    expect(queryByText('Update Playlist')).toBeNull();
  });

  it('renders correctly when visible and shows items', () => {
    const { getByText } = render(
      <PlaylistUpdateDrawer visible={true} items={sampleItems} onApply={mockOnApply} onClose={mockOnClose} />
    );

    expect(getByText('Update Playlist')).toBeTruthy();
    expect(getByText('Video 1')).toBeTruthy();
    expect(getByText('Video 2')).toBeTruthy();
    expect(getByText('📝 Note attached')).toBeTruthy();
  });

  it('handles item deletion and calls onApply with filtered list', () => {
    const { getAllByTestId, getByText } = render(
      <PlaylistUpdateDrawer visible={true} items={sampleItems} onApply={mockOnApply} onClose={mockOnClose} />
    );

    const deleteButtons = getAllByTestId('delete-button');
    expect(deleteButtons.length).toBe(3);

    // Delete the first item
    fireEvent.press(deleteButtons[0]);

    const applyButton = getByText('Apply Updates');
    fireEvent.press(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith([
      sampleItems[1],
      sampleItems[2]
    ]);
  });

  it('handles move up and down logic', () => {
    const { getAllByTestId, getByText } = render(
      <PlaylistUpdateDrawer visible={true} items={sampleItems} onApply={mockOnApply} onClose={mockOnClose} />
    );

    const moveDownButtons = getAllByTestId('move-down-button');
    // Move first item down
    fireEvent.press(moveDownButtons[0]);

    const applyButton = getByText('Apply Updates');
    fireEvent.press(applyButton);

    // Order should now be Video 2, Video 1, Video 3
    expect(mockOnApply).toHaveBeenCalledWith([
      sampleItems[1],
      sampleItems[0],
      sampleItems[2]
    ]);
  });
});
