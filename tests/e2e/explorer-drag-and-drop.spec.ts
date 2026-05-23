import { test, expect } from '@playwright/test';
import { injectMockFileSystem, MOCK_FILE_SYSTEM, MOCK_LOCAL_FILES } from '../support/e2e-utils';

test.describe('Explorer Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectMockFileSystem(page, MOCK_FILE_SYSTEM, MOCK_LOCAL_FILES);
    
    // Inject expanded state
    await page.evaluate(() => {
      if ((window as any).__E2E_HOOKS__) {
        (window as any).__E2E_HOOKS__.setExpandedFolders({ 'folder1': true });
      }
    });
  });

  test('should move a file to a folder via drag and drop', async ({ page }) => {
    const sourceFile = page.getByTestId('explorer-item-wrapper-root-file.md');
    const targetFolder = page.getByTestId('explorer-item-wrapper-folder1');

    // Perform drag and drop
    await sourceFile.dragTo(targetFolder);

    // Verify move result
    // The file should now be inside folder1
    await expect(page.getByTestId('explorer-item-folder1/root-file.md')).toBeVisible();
    // And removed from root
    await expect(page.getByTestId('explorer-item-root-file.md')).not.toBeVisible();
  });

  test('should move a folder to another folder', async ({ page }) => {
    // Wait for the mock file system from beforeEach to be fully hydrated and rendered
    await expect(page.getByTestId('explorer-item-folder1')).toBeVisible();

    // Add another folder to the mock for this test
    await page.evaluate(() => {
      const currentData = (window as any).__E2E_HOOKS__.fileSystemData;
      const newFolder = {
        name: 'folder2',
        path: 'folder2',
        kind: 'directory',
        handle: {
          kind: 'directory',
          name: 'folder2',
          getDirectoryHandle: async () => ({ kind: 'directory' }),
          getFileHandle: async () => ({ kind: 'file' }),
          removeEntry: async () => {},
          move: async () => {},
          values: async function* () { yield* []; }
        },
        children: [],
        isLoaded: true
      };
      (window as any).__E2E_HOOKS__.setFileSystemData([...currentData, newFolder]);
    });

    const sourceFolder = page.getByTestId('explorer-item-wrapper-folder2');
    const targetFolder = page.getByTestId('explorer-item-wrapper-folder1');

    await sourceFolder.dragTo(targetFolder);

    await expect(page.getByTestId('explorer-item-folder1/folder2')).toBeVisible();
    await expect(page.getByTestId('explorer-item-folder2')).not.toBeVisible();
  });

  test('should show visual feedback during drag over', async ({ page }) => {
    const targetFolder = page.getByTestId('explorer-item-wrapper-folder1');

    // Trigger drag over visual feedback using event dispatching
    await targetFolder.dispatchEvent('dragenter');
    await targetFolder.dispatchEvent('dragover');

    // Check for visual feedback (e.g. background color or outline)
    // Based on our implementation: isDragOver ? { backgroundColor: isDark ? '#374151' : '#DBEAFE', outline: `1px dashed ${colors.primary}` } : {}
    const folderContainer = page.getByTestId('explorer-item-folder1');
    const backgroundColor = await folderContainer.evaluate(el => window.getComputedStyle(el).backgroundColor);
    
    // #DBEAFE is rgb(219, 234, 254)
    expect(backgroundColor).toBe('rgb(219, 234, 254)');

    // Reset dragover state
    await targetFolder.dispatchEvent('dragleave');
  });

  test('should move a file to the root area', async ({ page }) => {
    const explorerScroll = page.getByTestId('explorer-scroll-view');
    await explorerScroll.evaluate((el) => {
      const dispatchDragAndDrop = (target: Element) => {
        // Dragover
        const dragOverEvent = new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
        });
        target.dispatchEvent(dragOverEvent);

        // Drop
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
        });
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: {
            getData: (format: string) => {
              if (format === 'application/json') {
                return JSON.stringify({ path: 'folder1/file1.md', kind: 'file', name: 'file1.md' });
              }
              return '';
            }
          }
        });
        target.dispatchEvent(dropEvent);
      };

      // Dispatch on a root file item wrapper to ensure it bubbles to the ScrollView without being stopped by folder drop zones
      const bubbleTarget = el.querySelector('[data-testid="explorer-item-wrapper-root-file.md"]') || el.querySelector('div') || el;
      dispatchDragAndDrop(bubbleTarget);
    });

    await expect(page.getByTestId('explorer-item-file1.md')).toBeVisible();
    await expect(page.getByTestId('explorer-item-folder1/file1.md')).not.toBeVisible();
  });
});
