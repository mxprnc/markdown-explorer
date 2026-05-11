import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ContextMenu } from '../ContextMenu';

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: { background: '#fff', border: '#ccc', text: '#000', primary: '#blue' },
    isDark: false,
    fontFamilyUI: 'System',
  })
}));

describe('ContextMenu', () => {
  const mockOnClose = jest.fn();
  const mockOnRename = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnCreateFile = jest.fn();
  const mockOnCreateFolder = jest.fn();
  const mockOnExportToNextra = jest.fn();
  const mockOnCreateYoutubePlaylist = jest.fn();

  const baseProps = {
    x: 0, y: 0, visible: true,
    onClose: mockOnClose, onRename: mockOnRename, onDelete: mockOnDelete,
    onCreateFile: mockOnCreateFile, onCreateFolder: mockOnCreateFolder,
    onExportToNextra: mockOnExportToNextra
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows Youtube Playlist Note option for directories when prop is provided', () => {
    const { getByText } = render(
      <ContextMenu 
        {...baseProps} 
        item={{ kind: 'directory', path: '/folder' }} 
        onCreateYoutubePlaylist={mockOnCreateYoutubePlaylist} 
      />
    );

    expect(getByText('Create Youtube Playlist Note')).toBeTruthy();
  });

  it('hides Youtube Playlist Note option for files', () => {
    const { queryByText } = render(
      <ContextMenu 
        {...baseProps} 
        item={{ kind: 'file', path: '/file.md' }} 
        onCreateYoutubePlaylist={mockOnCreateYoutubePlaylist} 
      />
    );

    expect(queryByText('Create Youtube Playlist Note')).toBeNull();
  });

  it('calls onCreateYoutubePlaylist correctly and closes menu', () => {
    const { getByText } = render(
      <ContextMenu 
        {...baseProps} 
        item={{ kind: 'directory', path: '/folder' }} 
        onCreateYoutubePlaylist={mockOnCreateYoutubePlaylist} 
      />
    );

    fireEvent.press(getByText('Create Youtube Playlist Note'));
    
    expect(mockOnCreateYoutubePlaylist).toHaveBeenCalledWith('/folder');
    expect(mockOnClose).toHaveBeenCalled();
  });

  describe('Root Directory (Empty Path)', () => {
    const rootItem = { kind: 'directory', path: '', name: 'Root' };

    it('shows New File and New Folder for root', () => {
      const { getByTestId } = render(<ContextMenu {...baseProps} item={rootItem} />);
      
      expect(getByTestId('context-menu-new-file')).toBeTruthy();
      expect(getByTestId('context-menu-new-folder')).toBeTruthy();
    });

    it('hides Rename and Delete for root', () => {
      const { queryByTestId } = render(<ContextMenu {...baseProps} item={rootItem} />);
      
      expect(queryByTestId('context-menu-rename')).toBeNull();
      expect(queryByTestId('context-menu-delete')).toBeNull();
    });

    it('shows Export to Nextra for root (directory)', () => {
      const { getByTestId } = render(<ContextMenu {...baseProps} item={rootItem} />);
      
      expect(getByTestId('context-menu-export-nextra')).toBeTruthy();
    });
  });

  describe('Non-Root Items', () => {
    it('shows Rename and Delete for non-root items', () => {
      const item = { kind: 'file', path: '/file.md', name: 'file.md' };
      const { getByTestId } = render(<ContextMenu {...baseProps} item={item} />);
      
      expect(getByTestId('context-menu-rename')).toBeTruthy();
      expect(getByTestId('context-menu-delete')).toBeTruthy();
    });
  });
});
