import { test, expect } from '@playwright/test';
import { injectMockFileSystem, MOCK_FILE_SYSTEM, MOCK_LOCAL_FILES } from '../support/e2e-utils';

test.describe('File Search (Cmd + P) Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectMockFileSystem(page, MOCK_FILE_SYSTEM, MOCK_LOCAL_FILES);
  });

  test('should open file search and filter files as typing', async ({ page }) => {
    // 1. Open File Search Picker via E2E hook
    await page.evaluate(() => {
      if ((window as any).__E2E_HOOKS__) {
        (window as any).__E2E_HOOKS__.triggerFileSearchPicker();
      }
    });

    const picker = page.getByTestId('picker-container');
    await expect(picker).toBeVisible();
    await expect(page.getByTestId('picker-input')).toBeFocused();

    // 2. Initial state shows mock files (file1.md, file2.md, root-file.md)
    await expect(page.getByTestId('picker-item-folder1/file1.md')).toBeVisible();
    await expect(page.getByTestId('picker-item-folder1/file2.md')).toBeVisible();
    await expect(page.getByTestId('picker-item-root-file.md')).toBeVisible();

    // 3. Filter by 'file2'
    await page.getByTestId('picker-input').fill('file2');
    
    // file2.md should be visible
    await expect(page.getByTestId('picker-item-folder1/file2.md')).toBeVisible();
    // others should not
    await expect(page.getByTestId('picker-item-folder1/file1.md')).not.toBeVisible();
    await expect(page.getByTestId('picker-item-root-file.md')).not.toBeVisible();

    // 4. Select the matching file
    await page.getByTestId('picker-item-folder1/file2.md').click();

    // Picker should close
    await expect(picker).not.toBeVisible();

    // Verify file content is loaded (File 2 Content is in the markdown preview)
    await expect(page.getByRole('heading', { name: 'File 2 Content' }).first()).toBeVisible();
  });

  test('should support Cmd+P / Ctrl+P keyboard shortcut', async ({ page }) => {
    // 1. Focus something to ensure page has focus
    await page.click('body');

    // 2. Press Ctrl+P (Playwright supports sending Ctrl key combinations)
    await page.keyboard.press('Control+KeyP');

    const picker = page.getByTestId('picker-container');
    await expect(picker).toBeVisible();
    await expect(page.getByTestId('picker-input')).toBeFocused();

    // 3. Close it using overlay click
    await page.getByTestId('picker-overlay').click({ position: { x: 10, y: 10 } });
    await expect(picker).not.toBeVisible();
  });

  test('should prioritize prefix matches over contains matches', async ({ page }) => {
    // 1. Open File Search Picker
    await page.evaluate(() => {
      if ((window as any).__E2E_HOOKS__) {
        (window as any).__E2E_HOOKS__.triggerFileSearchPicker();
      }
    });

    const picker = page.getByTestId('picker-container');
    await expect(picker).toBeVisible();

    // 2. Type 'file' in search box
    // 'file1.md' and 'file2.md' start with 'file' (prefix match)
    // 'root-file.md' contains 'file' but starts with 'root' (contains match)
    await page.getByTestId('picker-input').fill('file');

    // 3. Verify order: prefix matches should be ranked above contains matches
    const items = page.locator('[data-testid^="picker-item-"]');
    await expect(items.nth(0)).toHaveAttribute('data-testid', 'picker-item-folder1/file1.md');
    await expect(items.nth(1)).toHaveAttribute('data-testid', 'picker-item-folder1/file2.md');
    await expect(items.nth(2)).toHaveAttribute('data-testid', 'picker-item-root-file.md');
  });
});
