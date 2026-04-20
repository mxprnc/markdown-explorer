import { handleTabSelection, pinTab, closeOthers, closeAll } from '../TabUtils';

describe('TabUtils', () => {
  describe('handleTabSelection', () => {
    it('should set a preview file on single click', () => {
      const result = handleTabSelection([], null, 'file.md', false);
      expect(result.newPreviewFile).toBe('file.md');
      expect(result.newOpenedFiles).toEqual([]);
    });

    it('should replace old preview file on new single click', () => {
      const result = handleTabSelection([], 'old.md', 'new.md', false);
      expect(result.newPreviewFile).toBe('new.md');
      expect(result.newOpenedFiles).toEqual([]);
    });

    it('should open permanently on double click', () => {
      const result = handleTabSelection(['other.md'], 'file.md', 'file.md', true);
      expect(result.newPreviewFile).toBeNull();
      expect(result.newOpenedFiles).toEqual(['other.md', 'file.md']);
    });

    it('should stay permanent if single clicking an already permanent file', () => {
      const result = handleTabSelection(['file.md'], 'prev.md', 'file.md', false);
      expect(result.newPreviewFile).toBe('prev.md');
      expect(result.newOpenedFiles).toEqual(['file.md']);
    });
  });

  describe('pinTab', () => {
    it('should promote preview to permanent', () => {
      const result = pinTab(['a.md'], 'b.md');
      expect(result.newOpenedFiles).toEqual(['a.md', 'b.md']);
      expect(result.newPreviewFile).toBeNull();
    });
  });

  describe('bulk actions', () => {
    it('closeOthers should filter only target', () => {
      expect(closeOthers(['a.md', 'b.md', 'c.md'], 'b.md')).toEqual(['b.md']);
    });

    it('closeAll should return empty', () => {
      expect(closeAll()).toEqual([]);
    });
  });
});
