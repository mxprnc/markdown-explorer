import { getYoutubeId, deriveMetadata, clearMetadataCache } from '../LinkCardUtils';

describe('LinkCardUtils', () => {
  beforeEach(() => {
    clearMetadataCache();
  });

  describe('getYoutubeId', () => {
    test('should extract ID from standard watch URL', () => {
      expect(getYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    test('should extract ID from short youtu.be URL', () => {
      expect(getYoutubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    test('should extract ID from embed URL', () => {
      expect(getYoutubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    test('should return null for non-YouTube URLs', () => {
      expect(getYoutubeId('https://google.com')).toBe(null);
    });

    test('should return null for empty URL', () => {
      expect(getYoutubeId('')).toBe(null);
    });
  });

  describe('deriveMetadata', () => {
    test('should derive YouTube metadata for thumb type', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const metadata = deriveMetadata(url, 'thumb', 'Rickroll');
      expect(metadata).toEqual({
        title: 'Rickroll',
        siteName: 'YouTube',
        image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
      });
    });

    test('should derive YouTube metadata for video type', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      const metadata = deriveMetadata(url, 'video', 'Rick');
      expect(metadata).toEqual({
        title: 'Rick',
        siteName: 'YouTube',
        image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
      });
    });

    test('should derive basic metadata for non-YouTube thumb type', () => {
      const url = 'https://example.com/page';
      const metadata = deriveMetadata(url, 'thumb', 'Example Page');
      expect(metadata).toEqual({
        title: 'Example Page',
        siteName: 'example.com'
      });
    });

    test('should derive metadata for link type (no image)', () => {
      const url = 'https://github.com';
      const metadata = deriveMetadata(url, 'link', 'GitHub');
      expect(metadata).toEqual({
        title: 'GitHub',
        siteName: ''
      });
    });

    test('should handle URLs without protocol', () => {
      const url = 'google.com';
      const metadata = deriveMetadata(url, 'thumb', 'Google');
      // Our simple split logic will return empty siteName for no protocol
      expect(metadata.siteName).toBe('');
    });

    test('should use cache for subsequent calls', () => {
      const url = 'https://test.com';
      const metadata1 = deriveMetadata(url, 'thumb', 'Test');
      const metadata2 = deriveMetadata(url, 'thumb', 'Test');
      expect(metadata1).toBe(metadata2); // Reference equality means it came from cache
    });
  });
});
