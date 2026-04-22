import { SlugService } from './SlugService';

describe('SlugService', () => {
  test('should convert filenames to slugs', () => {
    expect(SlugService.getSlug('Hello World.md')).toBe('hello-world');
    expect(SlugService.getSlug('My New Project.mdx')).toBe('my-new-project');
  });

  test('should handle special characters', () => {
    expect(SlugService.getSlug('Testing @#% Special! chars.md')).toBe('testing-special-chars');
  });

  test('should handle korean characters', () => {
    // Current implementation might just clean them up or keep them.
    // Let's see what the current implementation does.
    // Usually we want to keep them if they are valid URLs or slugify them.
    const slug = SlugService.getSlug('안녕 세상.md');
    expect(slug).toBe('안녕-세상');
  });

  test('should handle multiple dots', () => {
    expect(SlugService.getSlug('version.1.0.final.md')).toBe('version-1-0-final');
  });
});
