import React from 'react';
import TestRenderer from 'react-test-renderer';
import { useFileSystem, FileSystemItem } from '../useFileSystem';

// Mock FileSystemHandle factories
const createMockFileHandle = (name: string, content: string = '') => ({
  kind: 'file' as const,
  name,
  getFile: jest.fn(async () => ({
    text: async () => content,
    name,
    size: content.length,
  })),
  createWritable: jest.fn(async () => {
      let internalContent = content;
      return {
          write: jest.fn(async (newContent) => { internalContent = newContent; }),
          close: jest.fn(async () => {}),
      };
  }),
});

const createMockDirectoryHandle = (name: string, entries: any[] = []) => {
  const entriesMap = new Map(entries.map(e => [e.name, e]));
  return {
    kind: 'directory' as const,
    name,
    values: jest.fn(() => ({
      async *[Symbol.asyncIterator]() {
        for (const entry of entriesMap.values()) {
          yield entry;
        }
      },
    })),
    getDirectoryHandle: jest.fn(async (dirName, options) => {
        if (entriesMap.has(dirName)) return entriesMap.get(dirName);
        if (options?.create) {
            const newDir = createMockDirectoryHandle(dirName);
            entriesMap.set(dirName, newDir);
            return newDir;
        }
        throw new Error('Not found');
    }),
    getFileHandle: jest.fn(async (fileName, options) => {
        if (entriesMap.has(fileName)) return entriesMap.get(fileName);
        if (options?.create) {
            const newFile = createMockFileHandle(fileName);
            entriesMap.set(fileName, newFile);
            return newFile;
        }
        throw new Error('Not found');
    }),
    removeEntry: jest.fn(async (entryName) => {
        entriesMap.delete(entryName);
    }),
    queryPermission: jest.fn(async () => 'granted'),
    requestPermission: jest.fn(async () => 'granted'),
  };
};

describe('useFileSystem', () => {
  const Consumer = ({ callback }: { callback: (fs: any) => void }) => {
    const fs = useFileSystem();
    React.useEffect(() => {
        callback(fs);
    }, [fs]);
    return null;
  };

  test('scanLevel should return sorted items', async () => {
    const mockRoot = createMockDirectoryHandle('root', [
      createMockFileHandle('b.md'),
      createMockDirectoryHandle('folder'),
      createMockFileHandle('a.md'),
    ]);

    let result: any;
    TestRenderer.act(() => {
      TestRenderer.create(<Consumer callback={(fs) => (result = fs)} />);
    });

    let items: FileSystemItem[] = [];
    await TestRenderer.act(async () => {
        items = await result.scanLevel(mockRoot);
    });

    expect(items.length).toBe(3);
    expect(items[0].kind).toBe('directory'); // Directories first
    expect(items[1].name).toBe('a.md'); // Then alphabetical
    expect(items[2].name).toBe('b.md');
  });

  test('createItem should update fileSystemData', async () => {
    const mockRoot = createMockDirectoryHandle('root');
    
    let result: any;
    TestRenderer.act(() => {
      TestRenderer.create(<Consumer callback={(fs) => (result = fs)} />);
    });

    await TestRenderer.act(async () => {
        result.setDirHandle(mockRoot);
    });

    await TestRenderer.act(async () => {
        await result.createItem('', 'newfile.md', 'file');
    });

    expect(result.fileSystemData.length).toBe(1);
    expect(result.fileSystemData[0].name).toBe('newfile.md');
  });

  test('saveToDisk should call createWritable', async () => {
    const mockRoot = createMockDirectoryHandle('root');
    
    let result: any;
    TestRenderer.act(() => {
      TestRenderer.create(<Consumer callback={(fs) => (result = fs)} />);
    });

    await TestRenderer.act(async () => {
        result.setDirHandle(mockRoot);
    });

    await TestRenderer.act(async () => {
        await result.saveToDisk('test.md', 'hello');
    });

    expect(mockRoot.getFileHandle).toHaveBeenCalledWith('test.md', { create: true });
  });
});
