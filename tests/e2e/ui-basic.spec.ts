import { test, expect } from '@playwright/test';
import { injectMockFileSystem } from '../support/e2e-utils';

test.describe('UI Components Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectMockFileSystem(page, [], {});
  });

  test('QuickPicker functionality (Templates)', async ({ page }) => {
    // 1. Open QuickPicker via E2E hook
    await page.evaluate(() => {
      if ((window as any).__E2E_HOOKS__) {
        (window as any).__E2E_HOOKS__.triggerTemplatePicker(['Template 1', 'Template 2', 'Unique Item']);
      }
    });

    const picker = page.getByTestId('picker-container');
    await expect(picker).toBeVisible();
    await expect(page.getByTestId('picker-input')).toBeFocused();

    // 2. Filter items
    await page.getByTestId('picker-input').fill('Unique');
    await expect(page.getByTestId('picker-item-Unique Item')).toBeVisible();
    await expect(page.getByTestId('picker-item-Template 1')).not.toBeVisible();

    // 3. Select item
    await page.getByTestId('picker-item-Unique Item').click();
    await expect(picker).not.toBeVisible();
  });

  test('Collapsible and Button in Settings Modal', async ({ page }) => {
    // 1. Open Settings Modal
    await page.getByTestId('settings-btn').click();
    await expect(page.getByTestId('settings-modal-title')).toBeVisible();

    // Switch to Integrations tab where the Collapsible is located
    await page.getByTestId('sidebar-tab-integrations').click();

    // 2. Verify Collapsible state (initial: closed)
    const collapsibleHeading = page.getByTestId('collapsible-heading');
    const collapsibleContent = page.getByTestId('collapsible-content');
    
    await expect(collapsibleHeading).toBeVisible();
    await expect(collapsibleContent).not.toBeVisible();

    // 3. Toggle Collapsible (open)
    await collapsibleHeading.click();
    await expect(collapsibleContent).toBeVisible();
    await expect(page.getByTestId('ui-test-button')).toBeVisible();

    // 4. Toggle Collapsible (close)
    await collapsibleHeading.click();
    await expect(collapsibleContent).not.toBeVisible();
  });

  test('QuickPicker empty state', async ({ page }) => {
    await page.evaluate(() => {
      if ((window as any).__E2E_HOOKS__) {
        (window as any).__E2E_HOOKS__.triggerTemplatePicker(['A', 'B']);
      }
    });

    await page.getByTestId('picker-input').fill('Non-existent');
    await expect(page.getByTestId('picker-empty')).toBeVisible();
    await expect(page.getByTestId('picker-empty')).toHaveText('No results found');
  });
});
