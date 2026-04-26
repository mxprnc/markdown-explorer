import { getFileExtension, isImageFile, getParentPath, joinPaths, normalizePath, resolveImagePath } from '../FileSystemUtils';

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

  describe('resolveImagePath', () => {
    test('handles absolute/special URLs', () => {
      expect(resolveImagePath('http://example.com/img.png')).toBe('http://example.com/img.png');
      expect(resolveImagePath('data:image/png;base64,...')).toBe('data:image/png;base64,...');
      expect(resolveImagePath('blob:http://localhost/...')).toBe('blob:http://localhost/...');
    });

    test('handles simple relative paths', () => {
      expect(resolveImagePath('img/test.png')).toBe('img/test.png');
      expect(resolveImagePath('./img/test.png')).toBe('img/test.png');
      expect(resolveImagePath('/img/test.png')).toBe('img/test.png');
    });

    test('resolves relative to current file', () => {
      expect(resolveImagePath('local.png', 'folder/file.md')).toBe('folder/local.png');
      expect(resolveImagePath('./sub/local.png', 'folder/file.md')).toBe('folder/sub/local.png');
      expect(resolveImagePath('../outside.png', 'folder/sub/file.md')).toBe('folder/outside.png');
    });

    test('handles URI encoding (Korean/Non-English)', () => {
      // "테스트" encoded is "%ED%85%8C%EC%8A%A4%ED%8A%B8"
      expect(resolveImagePath('img/%ED%85%8C%EC%8A%A4%ED%8A%B8.png')).toBe('img/테스트.png');
      expect(resolveImagePath('%ED%95%9C%EA%B8%80%20%ED%8C%8C%EC%9D%BC.png', 'folder/doc.md'))
        .toBe('folder/한글 파일.png');
    });
  });
});
