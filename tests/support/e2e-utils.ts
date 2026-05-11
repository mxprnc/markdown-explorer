import { Page } from '@playwright/test';

export async function injectMockFileSystem(page: Page, data: any[], files: Record<string, string> = {}) {
  // Wait for the hook to be available
  await page.waitForFunction(() => (window as any).__E2E_HOOKS__ !== undefined, { timeout: 10000 });
  
  await page.evaluate(({ data, files }) => {
    (window as any).__E2E_HOOKS__.mockClipboard();
    
    // Rehydrate functions
    const rehydrate = (items: any[]) => {
      return items.map(item => {
        const newItem = { ...item };
        if (item.kind === 'directory') {
          newItem.handle = {
            kind: 'directory',
            name: item.name,
            getDirectoryHandle: async () => ({ kind: 'directory' }),
            getFileHandle: async () => ({ kind: 'file' }),
            removeEntry: async () => {},
            move: async () => {}, // Mock move
            values: async function* () { yield* []; }
          };
        } else {
          newItem.handle = {
            kind: 'file',
            name: item.name,
            getFile: async () => new File([''], item.name),
            createWritable: async () => ({ write: async () => {}, close: async () => {} }),
            move: async (parentOrName: any, newName?: string) => {
              if (parentOrName === 'already-exists.md' || newName === 'already-exists.md') {
                throw new Error('Entry already exists');
              }
            }
          };
        }
        if (newItem.children) {
          newItem.children = rehydrate(newItem.children);
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
          getDirectoryHandle: async () => ({ kind: 'directory' }),
          getFileHandle: async () => ({ kind: 'file' }),
          removeEntry: async () => {},
          move: async () => {}
        };
      },
      getFileHandle: async (name: string) => ({ 
        kind: 'file', 
        name,
        getFile: async () => new File([''], name),
        createWritable: async () => ({ write: async () => {}, close: async () => {} })
      }),
      removeEntry: async () => {}
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
