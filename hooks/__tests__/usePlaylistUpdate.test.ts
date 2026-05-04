import { renderHook, act } from '@testing-library/react-native';
import { usePlaylistUpdate } from '../usePlaylistUpdate';
import { parsePlaylistFromMarkdown, serializePlaylistToMarkdown, diffPlaylistItems } from '../../utils/PlaylistParserUtils';

// Mock the utilities
jest.mock('../../utils/PlaylistParserUtils', () => ({
  parsePlaylistFromMarkdown: jest.fn(),
  serializePlaylistToMarkdown: jest.fn(),
  diffPlaylistItems: jest.fn(),
}));

describe('usePlaylistUpdate hook', () => {
  const mockOnApplyEdits = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => usePlaylistUpdate('some markdown', 'D-1', mockOnApplyEdits));
    expect(result.current.items).toEqual([]);
    expect(result.current.isDrawerVisible).toBe(false);
  });

  it('openUpdateDrawer parses markdown, diffs api data, and opens drawer', () => {
    (parsePlaylistFromMarkdown as jest.Mock).mockReturnValue([{ id: 'mock1', title: 'A' }]);
    (diffPlaylistItems as jest.Mock).mockReturnValue([{ id: 'mock2', title: 'B' }]);

    const { result } = renderHook(() => usePlaylistUpdate('markdown', 'D-1', mockOnApplyEdits));

    act(() => {
      result.current.openUpdateDrawer([{ id: 'mock2', title: 'B' }]);
    });

    expect(parsePlaylistFromMarkdown).toHaveBeenCalledWith('markdown', 'D-1');
    expect(diffPlaylistItems).toHaveBeenCalled();
    expect(result.current.items).toEqual([
      { id: 'mock1', title: 'A' },
      { id: 'mock2', title: 'B' }
    ]);
    expect(result.current.isDrawerVisible).toBe(true);
  });

  it('applyUpdates serializes updated items and calls onApplyEdits', () => {
    (serializePlaylistToMarkdown as jest.Mock).mockReturnValue('new serialized markdown');
    
    const { result } = renderHook(() => usePlaylistUpdate('markdown', 'D-1', mockOnApplyEdits));

    // First open drawer
    act(() => {
      result.current.openUpdateDrawer([]);
    });

    // Then apply updates
    act(() => {
      result.current.applyUpdates([{ id: 'mock1', title: 'Modified' } as any]);
    });

    expect(serializePlaylistToMarkdown).toHaveBeenCalledWith([{ id: 'mock1', title: 'Modified' }], 'D-1');
    expect(mockOnApplyEdits).toHaveBeenCalledWith('new serialized markdown');
    expect(result.current.isDrawerVisible).toBe(false);
  });

  it('closeDrawer closes the drawer without applying', () => {
    const { result } = renderHook(() => usePlaylistUpdate('markdown', 'D-1', mockOnApplyEdits));

    act(() => {
      result.current.openUpdateDrawer([]);
    });
    expect(result.current.isDrawerVisible).toBe(true);

    act(() => {
      result.current.closeDrawer();
    });
    expect(result.current.isDrawerVisible).toBe(false);
    expect(mockOnApplyEdits).not.toHaveBeenCalled();
  });
});
