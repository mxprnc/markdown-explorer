import { Page } from '@playwright/test';

export async function injectMockFileSystem(page: Page, data: any[], files: Record<string, string> = {}) {
  // Wait for the hook to be available
  await page.waitForFunction(() => (window as any).__E2E_HOOKS__ !== undefined, { timeout: 10000 });
  
  await page.evaluate(({ data, files }) => {
    (window as any).__E2E_HOOKS__.mockClipboard();
    
    // Helper to find items in tree dynamically
    const findItemInTree = (items: any[], path: string): any => {
      for (const item of items) {
        if (item.path === path) return item;
        if (item.children) {
          const found = findItemInTree(item.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    // Rehydrate functions
    const rehydrate = (items: any[]): any[] => {
      return items.map(item => {
        const newItem = { ...item };
        if (newItem.children) {
          newItem.children = rehydrate(newItem.children);
        }
        if (newItem.kind === 'directory') {
          newItem.handle = {
            kind: 'directory',
            name: newItem.name,
            getDirectoryHandle: async (name: string) => {
              const child = newItem.children?.find((c: any) => c.name === name && c.kind === 'directory');
              return child ? child.handle : { kind: 'directory', name };
            },
            getFileHandle: async (name: string) => {
              const child = newItem.children?.find((c: any) => c.name === name && c.kind === 'file');
              return child ? child.handle : { kind: 'file', name };
            },
            removeEntry: async () => {},
            move: async () => {}, // Mock move
            values: async function* () {
              const latestData = (window as any).__E2E_HOOKS__?.fileSystemData || [];
              const latestItem = findItemInTree(latestData, newItem.path);
              const children = latestItem?.children || [];
              for (const child of children) {
                if (child.handle) {
                  yield child.handle;
                }
              }
            }
          };
        } else {
          newItem.handle = {
            kind: 'file',
            name: newItem.name,
            getFile: async () => new File([''], newItem.name),
            createWritable: async () => ({ write: async () => {}, close: async () => {} }),
            move: async (parentOrName: any, newName?: string) => {
              if (parentOrName === 'already-exists.md' || newName === 'already-exists.md') {
                throw new Error('Entry already exists');
              }
            }
          };
        }
        return newItem;
      });
    };

    const rehydratedData = rehydrate(data);
    (window as any).__E2E_HOOKS__.setFileSystemData(rehydratedData);
    (window as any).__E2E_HOOKS__.setLocalFiles(files);
    
    (window as any).__E2E_HOOKS__.setDirHandle({
      kind: 'directory',
      name: 'MOCK_REPO',
      getDirectoryHandle: async (name: string) => {
        // Simple mock for nested lookups
        return {
          kind: 'directory',
          name,
          getDirectoryHandle: async (subName: string) => {
            return {
              kind: 'directory',
              name: subName,
              getDirectoryHandle: async () => ({ kind: 'directory' }),
              getFileHandle: async () => ({ kind: 'file' }),
              removeEntry: async () => {},
              move: async () => {},
              values: async function* () { yield* []; }
            };
          },
          getFileHandle: async () => ({ kind: 'file' }),
          removeEntry: async () => {},
          move: async () => {},
          values: async function* () {
            const latestData = (window as any).__E2E_HOOKS__?.fileSystemData || [];
            const latestItem = findItemInTree(latestData, name);
            const children = latestItem?.children || [];
            for (const child of children) {
              if (child.handle) {
                yield child.handle;
              }
            }
          }
        };
      },
      getFileHandle: async (name: string) => ({ 
        kind: 'file', 
        name,
        getFile: async () => new File([''], name),
        createWritable: async () => ({ write: async () => {}, close: async () => {} })
      }),
      removeEntry: async () => {},
      values: async function* () {
        const latestData = (window as any).__E2E_HOOKS__?.fileSystemData || [];
        for (const item of latestData) {
          if (item.handle) {
            yield item.handle;
          }
        }
      }
    });
  }, { data, files });
}

export const MOCK_FILE_SYSTEM = [
  {
    name: 'folder1',
    path: 'folder1',
    kind: 'directory',
    children: [
      { name: 'file1.md', path: 'folder1/file1.md', kind: 'file' },
      { name: 'file2.md', path: 'folder1/file2.md', kind: 'file' },
    ],
    isLoaded: true
  },
  { name: 'root-file.md', path: 'root-file.md', kind: 'file' },
];

export const MOCK_LOCAL_FILES = {
  'folder1/file1.md': '# File 1 Content',
  'folder1/file2.md': '# File 2 Content',
  'root-file.md': '# Root File Content',
};
