import { test, expect } from '@playwright/test';
import { injectMockFileSystem, MOCK_FILE_SYSTEM, MOCK_LOCAL_FILES } from '../support/e2e-utils';

test.describe('Nextra Export Wizard E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Mock files so we have something to export
    await injectMockFileSystem(page, MOCK_FILE_SYSTEM, MOCK_LOCAL_FILES);
  });

  test('should open and navigate through Nextra Export Wizard', async ({ page }) => {
    // 1. Right click on a folder to open context menu
    const folderItem = page.getByTestId('explorer-item-folder1');
    await folderItem.click({ button: 'right' });
    
    // 2. Click "Export to Nextra"
    await page.getByTestId('context-menu-export-nextra').click();
    
    // 3. Verify Wizard is visible (Check header text)
    await expect(page.getByText('Export to Nextra')).toBeVisible();
    await expect(page.getByText('Step 1 / 3')).toBeVisible();

    // 4. Step 1: Fill in identity info
    const titleInput = page.getByTestId('input-site-title');
    await titleInput.fill('E2E Test Site');
    
    const githubInput = page.getByTestId('input-github-url');
    await githubInput.fill('https://github.com/test/repo');

    // Check if Live Preview reflects the title
    // (LivePreviewLite shows title at the top left of the mock browser)
    await expect(page.locator('text=E2E Test Site').first()).toBeVisible();

    // 5. Click Next -> Step 2
    await page.getByTestId('wizard-next-btn').click();
    await expect(page.getByText('Step 2 / 3')).toBeVisible();
    await expect(page.getByText('Design & Theming')).toBeVisible();

    // 6. Select a preset
    await page.getByTestId('preset-card-rose').click();
    
    // 7. Click Next -> Step 3
    await page.getByTestId('wizard-next-btn').click();
    await expect(page.getByText('Step 3 / 3')).toBeVisible();
    await expect(page.getByText('Export Options')).toBeVisible();

    // 8. Verify Structure Verified box is visible (Mock folder1 is shallow)
    await expect(page.getByTestId('depth-info-box')).toBeVisible();

    // 9. Check and toggle an option
    const mdxOption = page.getByTestId('option-convert-mdx');
    await mdxOption.click();

    // 10. Verify "Generate ZIP" button is visible
    const generateBtn = page.getByTestId('wizard-next-btn');
    await expect(generateBtn).toHaveText('Generate ZIP');
    
    // 11. Test Cancel
    await page.getByTestId('wizard-cancel-btn').click();
    await expect(page.getByText('Export to Nextra')).not.toBeVisible();
  });
});
