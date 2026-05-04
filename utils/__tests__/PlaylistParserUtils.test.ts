import {
  parsePlaylistFromMarkdown,
  serializePlaylistToMarkdown,
  diffPlaylistItems
} from '../PlaylistParserUtils';

describe('PlaylistParserUtils', () => {
  const d1Text = `## First Video
https://youtube.com/watch?v=123

### Note
This is my first note.
It has two lines.
---

## Second Video
https://youtube.com/watch?v=456

### Note
Second note here.
---`;

  const d2Text = `- **First Video**
  https://youtube.com/watch?v=123
  > This is my first note.
  > It has two lines.

- **Second Video**
  https://youtube.com/watch?v=456
  > Second note here.`;

  it('should parse D-1 format correctly', () => {
    const items = parsePlaylistFromMarkdown(d1Text, 'D-1');
    expect(items).toHaveLength(2);
    expect(items[0].id).toBe('123');
    expect(items[0].title).toBe('First Video');
    expect(items[0].note).toBe('This is my first note.\nIt has two lines.');
  });

  it('should parse D-2 format correctly', () => {
    const items = parsePlaylistFromMarkdown(d2Text, 'D-2');
    expect(items).toHaveLength(2);
    expect(items[0].id).toBe('123');
    expect(items[0].title).toBe('First Video');
    expect(items[0].note).toBe('This is my first note.\nIt has two lines.');
  });

  it('should serialize to D-1 correctly', () => {
    const items = parsePlaylistFromMarkdown(d1Text, 'D-1');
    const serialized = serializePlaylistToMarkdown(items, 'D-1');
    expect(serialized).toContain('## First Video');
    expect(serialized).toContain('### Note');
    expect(serialized).toContain('---');
  });

  it('should serialize to D-2 correctly', () => {
    const items = parsePlaylistFromMarkdown(d2Text, 'D-2');
    const serialized = serializePlaylistToMarkdown(items, 'D-2');
    expect(serialized).toContain('- **First Video**');
    expect(serialized).toContain('  > This is my first note.');
  });

  it('should compute diff correctly', () => {
    const existing = parsePlaylistFromMarkdown(d1Text, 'D-1');
    const apiItems = [
      { id: '123', title: 'First Video (Updated)' },
      { id: '789', title: 'New Video', url: 'https://youtube.com/watch?v=789' }
    ];
    
    const diff = diffPlaylistItems(existing, apiItems);
    expect(diff).toHaveLength(1);
    expect(diff[0].id).toBe('789');
    expect(diff[0].title).toBe('New Video');
  });
});
