import { test, expect } from '@playwright/test';
import { injectMockFileSystem, MOCK_FILE_SYSTEM, MOCK_LOCAL_FILES } from '../support/e2e-utils';

test.describe('Explorer Basic Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectMockFileSystem(page, MOCK_FILE_SYSTEM, MOCK_LOCAL_FILES);
    
    // Inject expanded state
    await page.evaluate(() => {
      if ((window as any).__E2E_HOOKS__) {
        (window as any).__E2E_HOOKS__.setExpandedFolders({ 'folder1': true });
      }
    });

    // Wait for the mock tree to be fully hydrated and rendered
    await expect(page.getByTestId('explorer-item-folder1')).toBeVisible();
  });

  test('should render the mock file tree', async ({ page }) => {
    // Check for folder
    await expect(page.getByTestId('explorer-item-folder1')).toBeVisible();
    await expect(page.getByText('folder1')).toBeVisible();

    // Check for root file
    await expect(page.getByTestId('explorer-item-root-file.md')).toBeVisible();
    await expect(page.getByText('root-file.md')).toBeVisible();
  });

  test('should show files inside folder1', async ({ page }) => {
    // Since isLoaded is true in our mock, it should be visible if expanded
    // Let's ensure it's expanded (though our mock has it as isLoaded, we need to click to expand or set expanded state)
    
    // Check if files are visible
    await expect(page.getByTestId('explorer-item-folder1/file1.md')).toBeVisible();
    await expect(page.getByTestId('explorer-item-folder1/file2.md')).toBeVisible();
  });

  test('should select a file on click', async ({ page }) => {
    const fileItem = page.getByTestId('explorer-item-root-file.md');
    await fileItem.click();
    
    // Check if it becomes selected. We'll check the editor/preview area.
    await expect(page.getByRole('heading', { name: 'Root File Content' }).first()).toBeVisible();
    
    // Check selection highlight (backgroundColor: isDark ? '#2D3748' : '#EFF6FF')
    // We'll check if it has the selected background color
    // const style = await fileItem.getAttribute('style');
    const backgroundColor = await fileItem.evaluate(el => window.getComputedStyle(el).backgroundColor);
    // #EFF6FF in RGB is rgb(239, 246, 255)
    // #2D3748 in RGB is rgb(45, 55, 72)
    const isSelectedColor = backgroundColor === 'rgb(239, 246, 255)' || backgroundColor === 'rgb(45, 55, 72)';
    expect(isSelectedColor).toBeTruthy();
  });

  test('should open file in permanent tab on double click', async ({ page }) => {
    const fileItem = page.getByTestId('explorer-item-root-file.md');
    await fileItem.dblclick();
    
    // In our app, double click adds the file to openedFiles, which renders a tab in TabBar.
    // Let's check for the tab element (TabBar uses Pressable with Text)
    // We should probably add testID to TabBar items too, but for now check by text
    await expect(page.locator('.tab-item >> text=root-file.md')).toBeVisible();
  });

  test('should show context menu on right click and close on outside click', async ({ page }) => {
    const fileItem = page.getByTestId('explorer-item-root-file.md');
    await fileItem.click({ button: 'right' });
    
    const contextMenu = page.getByTestId('explorer-context-menu');
    await expect(contextMenu).toBeVisible();
    
    // Click outside using coordinates to ensure it's outside the menu
    await page.mouse.click(500, 500); 
    await expect(contextMenu).not.toBeVisible();
  });

  test('should complete rename workflow', async ({ page }) => {
    const fileItem = page.getByTestId('explorer-item-root-file.md');
    await fileItem.click({ button: 'right' });
    await page.getByTestId('context-menu-rename').click();
    
    const renameInput = page.getByTestId('rename-input');
    await renameInput.fill('new-root-file.md');
    await expect(renameInput).toHaveValue('new-root-file.md');
    await renameInput.press('Enter');
    
    // Verify it's updated in the list
    await expect(page.getByTestId('explorer-item-new-root-file.md')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('explorer-item-root-file.md')).not.toBeVisible();
  });

  test('should delete a file after confirmation', async ({ page }) => {
    // Handle dialog
    page.on('dialog', dialog => dialog.accept());
    
    const fileItem = page.getByTestId('explorer-item-folder1/file2.md');
    await fileItem.click({ button: 'right' });
    await page.getByTestId('context-menu-delete').click();
    
    // Verify it's removed
    await expect(fileItem).not.toBeVisible();
  });

  test('should copy path to clipboard', async ({ page }) => {
    const fileItem = page.getByTestId('explorer-item-root-file.md');
    await fileItem.hover();
    
    // Register dialog handler once before the action
    let alertMsg = '';
    page.once('dialog', async dialog => {
      alertMsg = dialog.message();
      await dialog.accept();
    });

    // Use force click to ensure it triggers even if hover state is transient
    await page.getByTestId('explorer-item-copy-root-file.md').click({ force: true });
    
    // Wait for the alertMsg to be populated (the click above will wait for the action to finish)
    expect(alertMsg).toContain('Relative path copied');
    expect(alertMsg).toContain('./root-file.md');
  });

  test('should show error message when rename fails (duplicate name)', async ({ page }) => {
    // 1. Right click on a file
    const fileItem = page.getByTestId('explorer-item-root-file.md');
    await fileItem.click({ button: 'right' });
    
    // 2. Click Rename
    await page.getByTestId('context-menu-rename').click();
    
    // 3. Type a name that we've set to fail ('already-exists.md')
    const input = page.getByTestId('rename-input');
    await input.fill('already-exists.md');
    await expect(input).toHaveValue('already-exists.md');
    
    // 4. Register dialog handler for the expected error
    let errorMsg = '';
    page.once('dialog', async dialog => {
      errorMsg = dialog.message();
      await dialog.accept();
    });

    // 5. Click Confirm / Press Enter
    await input.press('Enter');
    
    // 6. Verify error message
    expect(errorMsg).toContain('An error occurred during rename.');
    
    // 7. Modal should still be open (or we can check if it closed based on implementation)
    // Actually, based on app/index.tsx, it closes the modal regardless? 
    // Wait: setRenameModal({ ...renameModal, visible: false }); is outside the success check.
    // So it will close.
    await expect(page.getByTestId('rename-modal')).not.toBeVisible();
  });

  test('should show quick actions on hover', async ({ page }) => {
    const fileItem = page.getByTestId('explorer-item-root-file.md');
    
    // We need to use dispatchEvent or hover()
    await fileItem.hover();
    
    await expect(page.getByTestId('explorer-item-rename-root-file.md')).toBeVisible();
    await expect(page.getByTestId('explorer-item-copy-root-file.md')).toBeVisible();
  });
});
