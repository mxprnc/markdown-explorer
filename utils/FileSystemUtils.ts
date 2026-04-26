export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
}

export function getParentPath(path: string): string {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/');
}

export function joinPaths(...parts: string[]): string {
  return parts.filter(Boolean).join('/').replace(/\/+/g, '/');
}

export function normalizePath(path: string): string {
  if (!path) return '';
  // Handle leading dot-slash
  let cleaned = path;
  if (cleaned.startsWith('./')) cleaned = cleaned.slice(2);
  
  const parts = cleaned.split('/').filter(Boolean);
  const stack: string[] = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return stack.join('/');
}

/**
 * Resolves a relative image path into a normalized full path within the project.
 * Handles URI decoding for non-English characters and various relative path formats.
 */
export function resolveImagePath(relativePath: string, currentFilePath?: string): string {
  if (!relativePath) return '';
  if (relativePath.startsWith('http') || relativePath.startsWith('data:') || relativePath.startsWith('blob:')) {
    return relativePath;
  }

  let cleanedPath = relativePath;
  if (cleanedPath.startsWith('./')) {
    cleanedPath = cleanedPath.slice(2);
  }

  let fullPath = cleanedPath;
  if (cleanedPath.startsWith('/')) {
    fullPath = cleanedPath.slice(1);
  } else if (cleanedPath.startsWith('img/')) {
    fullPath = cleanedPath;
  } else if (currentFilePath) {
    const fileDir = getParentPath(currentFilePath);
    if (fileDir) {
      fullPath = joinPaths(fileDir, cleanedPath);
    }
  }

  const normalized = normalizePath(fullPath);
  try {
    return decodeURIComponent(normalized);
  } catch (e) {
    return normalized;
  }
}


/**
 * Recursively finds an item in the file system tree by its path.
 */
export function findItemInTree(items: any[], path: string): any {
  for (const item of items) {
    if (item.path === path) return item;
    if (item.children) {
      const found = findItemInTree(item.children, path);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Updates a path based on an old base and a new base (e.g. after moving/renaming a folder).
 */
export function updateTreePaths(path: string, oldBase: string, newBase: string): string {
  if (path === oldBase) return newBase;
  if (path.startsWith(oldBase + '/')) {
    return newBase + path.slice(oldBase.length);
  }
  return path;
}
