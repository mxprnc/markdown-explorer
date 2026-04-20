import { getFileExtension, isImageFile, getParentPath, joinPaths, normalizePath } from '../FileSystemUtils';

describe('FileSystemUtils', () => {
  test('getFileExtension returns correct extension', () => {
    expect(getFileExtension('test.md')).toBe('md');
    expect(getFileExtension('image.PNG')).toBe('png');
    expect(getFileExtension('noextension')).toBe('');
  });

  test('isImageFile correctly identifies images', () => {
    expect(isImageFile('test.png')).toBe(true);
    expect(isImageFile('test.jpg')).toBe(true);
    expect(isImageFile('test.md')).toBe(false);
  });

  test('getParentPath returns correct parent directory', () => {
    expect(getParentPath('a/b/c.txt')).toBe('a/b');
    expect(getParentPath('a.txt')).toBe('');
  });

  test('joinPaths correctly joins parts', () => {
    expect(joinPaths('a', 'b', 'c')).toBe('a/b/c');
    expect(joinPaths('a/', '/b', 'c')).toBe('a/b/c');
    expect(joinPaths('', 'a', 'b')).toBe('a/b');
  });

  test('normalizePath correctly handles . and ..', () => {
    expect(normalizePath('a/./b/../c')).toBe('a/c');
    expect(normalizePath('a/b/../../c')).toBe('c');
    expect(normalizePath('./a/b')).toBe('a/b');
  });
});
