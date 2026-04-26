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
    const sourceFile = page.getByTestId('explorer-item-wrapper-root-file.md');
    const targetFolder = page.getByTestId('explorer-item-wrapper-folder1');

    // Drag over but don't drop yet
    await page.mouse.move(0, 0); // Start from top
    const sourceBox = await sourceFile.boundingBox();
    const targetBox = await targetFolder.boundingBox();

    if (!sourceBox || !targetBox) throw new Error('Bounding boxes not found');

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);

    // Check for visual feedback (e.g. background color or outline)
    // Based on our implementation: isDragOver ? { backgroundColor: isDark ? '#374151' : '#DBEAFE', outline: `1px dashed ${colors.primary}` } : {}
    const folderContainer = targetFolder.locator('> div'); // The inner Pressable/View
    const backgroundColor = await folderContainer.evaluate(el => window.getComputedStyle(el).backgroundColor);
    
    // #DBEAFE is rgb(219, 234, 254)
    expect(backgroundColor).toBe('rgb(219, 234, 254)');

    await page.mouse.up();
  });

  test('should move a file to the root area', async ({ page }) => {
    const sourceFile = page.getByTestId('explorer-item-wrapper-folder1/file1.md');
    
    // The root area is the ScrollView container in FileExplorer
    // In our implementation, we added drop handler to the ScrollView
    const explorerPane = page.locator('div[data-testid^="explorer-item-wrapper-"]').first().locator('xpath=..'); // Parent of items

    // Wait, let's use a more direct way to find the root area
    // Maybe we should add a testID to the ScrollView
    const rootArea = page.locator('div.css-view-175oi2r').filter({ hasText: 'Explorer' }).locator('div.css-view-175oi2r').nth(2); // Heuristic

    // Actually, just dragging to the "Explorer" title or empty space should work if we have a good locator.
    // Let's drag to the top of the explorer
    await sourceFile.dragTo(page.getByText('Explorer'));

    await expect(page.getByTestId('explorer-item-file1.md')).toBeVisible();
    await expect(page.getByTestId('explorer-item-folder1/file1.md')).not.toBeVisible();
  });
});
