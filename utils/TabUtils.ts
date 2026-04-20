/**
 * Utilities for Tab Management
 * Extracted logic for testability and reuse.
 */

export interface TabItem {
  path: string;
  isPinned: boolean;
}

/**
 * Pins a tab in the list.
 */
export function pinTab(openedFiles: string[], previewFile: string | null): {
  newOpenedFiles: string[];
  newPreviewFile: string | null;
} {
  if (!previewFile) return { newOpenedFiles: openedFiles, newPreviewFile: null };
  
  const newOpenedFiles = openedFiles.includes(previewFile)
    ? openedFiles
    : [...openedFiles, previewFile];
    
  return {
    newOpenedFiles,
    newPreviewFile: null
  };
}

/**
 * Closes other tabs except the one at targetPath.
 */
export function closeOthers(openedFiles: string[], targetPath: string): string[] {
  return openedFiles.filter(f => f === targetPath);
}

/**
 * Closes all tabs.
 */
export function closeAll(): string[] {
  return [];
}

/**
 * Handles logic for selecting a file with preview/permanent distinction.
 */
export function handleTabSelection(
  currentOpenedFiles: string[],
  currentPreviewFile: string | null,
  newPath: string,
  isPermanent: boolean
): {
  newOpenedFiles: string[];
  newPreviewFile: string | null;
} {
  // If we are opening permanently (isPermanent = true)
  if (isPermanent) {
    // If it was in preview, clear it and move to opened
    const filteredOpened = currentOpenedFiles.includes(newPath) 
      ? currentOpenedFiles 
      : [...currentOpenedFiles, newPath];
    
    return {
      newOpenedFiles: filteredOpened,
      newPreviewFile: currentPreviewFile === newPath ? null : currentPreviewFile
    };
  }

  // If it's already in permanent tabs, just stay there
  if (currentOpenedFiles.includes(newPath)) {
    return {
      newOpenedFiles: currentOpenedFiles,
      newPreviewFile: currentPreviewFile === newPath ? null : currentPreviewFile
    };
  }

  // Otherwise, set it as the preview tab (replacing old one)
  return {
    newOpenedFiles: currentOpenedFiles,
    newPreviewFile: newPath
  };
}
