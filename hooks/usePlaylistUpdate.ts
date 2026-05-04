import { useState, useCallback } from 'react';
import { 
  parsePlaylistFromMarkdown, 
  serializePlaylistToMarkdown, 
  diffPlaylistItems, 
  PlaylistItem, 
  ExportMode 
} from '../utils/PlaylistParserUtils';

/**
 * Hook to manage YouTube playlist updates, Auto Diff logic, and Editor injection.
 * 
 * @param selectedMarkdown - The currently selected text in the editor (or full text if D-1)
 * @param mode - Export mode ('D-1' or 'D-2')
 * @param onApplyEdits - Callback to inject the updated text back into the editor using its native API (e.g. monaco.editor.executeEdits)
 */
export const usePlaylistUpdate = (
  selectedMarkdown: string, 
  mode: ExportMode,
  onApplyEdits: (newMarkdownChunk: string) => void
) => {
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [isDrawerVisible, setDrawerVisible] = useState(false);

  // Opens the drawer and performs Auto Diff with API data
  const openUpdateDrawer = useCallback((apiData: any[] = []) => {
    // 1. Parse current markdown selection to get existing items
    const existing = parsePlaylistFromMarkdown(selectedMarkdown, mode);
    
    // 2. Idea G: Auto Diff - Compare with new API data to find new videos
    const newItems = diffPlaylistItems(existing, apiData);
    
    // 3. Combine existing items and new items (appended at the bottom)
    setItems([...existing, ...newItems]);
    
    // 4. Open Drawer UI
    setDrawerVisible(true);
  }, [selectedMarkdown, mode]);

  // Applies the rearranged/deleted items back to the Editor
  const applyUpdates = useCallback((updatedItems: PlaylistItem[]) => {
    // 1. Serialize the updated items back to Markdown based on the current mode
    const newMarkdownChunk = serializePlaylistToMarkdown(updatedItems, mode);
    
    // 2. Call the editor API injection callback
    // This allows the Editor to execute an 'Edit Operation', perfectly supporting Cmd + Z (Undo).
    onApplyEdits(newMarkdownChunk);
    
    // 3. Close the Drawer UI
    setDrawerVisible(false);
  }, [mode, onApplyEdits]);

  const closeDrawer = () => setDrawerVisible(false);

  return {
    items,
    isDrawerVisible,
    openUpdateDrawer,
    applyUpdates,
    closeDrawer
  };
};
