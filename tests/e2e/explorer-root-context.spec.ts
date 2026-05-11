import { test, expect } from '@playwright/test';
import { injectMockFileSystem, MOCK_FILE_SYSTEM, MOCK_LOCAL_FILES } from '../support/e2e-utils';

test.describe('Explorer Root Context Menu and Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectMockFileSystem(page, MOCK_FILE_SYSTEM, MOCK_LOCAL_FILES);
  });

  test('should display the selected folder name in the header', async ({ page }) => {
    const explorerTitle = page.getByTestId('explorer-title');
    await expect(explorerTitle).toHaveText('MOCK_REPO');
  });

  test('should show context menu when right-clicking the explorer title', async ({ page }) => {
    const explorerTitle = page.getByTestId('explorer-title');
    await explorerTitle.click({ button: 'right' });

    const contextMenu = page.getByTestId('explorer-context-menu');
    await expect(contextMenu).toBeVisible();

    // Verify root-specific menu items
    await expect(page.getByTestId('context-menu-new-file')).toBeVisible();
    await expect(page.getByTestId('context-menu-new-folder')).toBeVisible();
    await expect(page.getByTestId('context-menu-export-nextra')).toBeVisible();

    // Verify hidden items for root
    await expect(page.getByTestId('context-menu-rename')).not.toBeVisible();
    await expect(page.getByTestId('context-menu-delete')).not.toBeVisible();
  });

  test('should show context menu when right-clicking the empty area of the explorer', async ({ page }) => {
    const explorerScroll = page.getByTestId('explorer-scroll-view');
    
    // Right click on the scroll view area
    await explorerScroll.click({ button: 'right', position: { x: 50, y: 300 } });

    const contextMenu = page.getByTestId('explorer-context-menu');
    await expect(contextMenu).toBeVisible();
    await expect(page.getByTestId('context-menu-new-file')).toBeVisible();
  });

  test('should allow creating a new file in the root via title context menu', async ({ page }) => {
    await page.getByTestId('explorer-title').click({ button: 'right' });
    await page.getByTestId('context-menu-new-file').click();

    const creationInput = page.getByTestId('creation-input');
    await expect(creationInput).toBeVisible();
    await creationInput.focus();
    
    await creationInput.fill('new-at-root.md');
    await page.keyboard.press('Enter');

    // Wait for the creation input to disappear (indicates submission processed)
    await expect(creationInput).not.toBeVisible();

    // Verify the new file is visible in the list with a generous timeout
    const newItem = page.getByTestId('explorer-item-new-at-root.md');
    await expect(newItem).toBeVisible({ timeout: 10000 });
  });
});
