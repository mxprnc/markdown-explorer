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
/**
 * Decodes URI component safely.
 */
export function decodePath(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch (e) {
    return path;
  }
}

/**
 * Gets a display title for a tab, showing parent folder if there are duplicate filenames.
 */
export function getTabTitle(targetPath: string, allOpenedFiles: string[]): string {
  const decodedPath = decodePath(targetPath);
  const fileName = decodedPath.split('/').pop() || decodedPath;
  
  // Check for duplicates in the rest of the opened files
  const hasDuplicate = allOpenedFiles.some(f => {
    if (f === targetPath) return false;
    const d = decodePath(f);
    const otherFileName = d.split('/').pop() || d;
    return otherFileName === fileName;
  });
  
  if (!hasDuplicate) {
    return fileName;
  }
  
  // If duplicates exist, show the parent folder for context (VSCode style)
  const parts = decodedPath.split('/');
  if (parts.length > 1) {
    const parent = parts[parts.length - 2];
    // If parent is also encoded or long, we might want to clean it, but decoding handled it
    return `${fileName} • ${parent}`;
  }
  
  return decodedPath;
}
