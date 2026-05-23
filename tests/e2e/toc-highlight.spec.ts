import { test, expect } from '@playwright/test';
import { injectMockFileSystem, MOCK_LOCAL_FILES } from '../support/e2e-utils';

const HIGHLIGHT_MOCK_FS = [
  {
    name: 'highlight-test.md',
    kind: 'file' as const,
    path: 'highlight-test.md',
    handle: {} as any
  }
];

const HIGHLIGHT_MOCK_FILES = {
  ...MOCK_LOCAL_FILES,
  'highlight-test.md': `
# Section 1
${Array(100).fill('Content 1...').join('\n\n')}

# Section 2
${Array(100).fill('Content 2...').join('\n\n')}

# Section 3
${Array(100).fill('Content 3...').join('\n\n')}
`
};

test.describe('TOC Active Section Highlighting (Scroll Spy)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectMockFileSystem(page, HIGHLIGHT_MOCK_FS, HIGHLIGHT_MOCK_FILES);
    // Pin the TOC pane so it is visible
    await page.getByTestId('header-toc-btn').click();
  });

  test('should highlight TOC items as user scrolls', async ({ page }) => {
    await page.getByTestId('explorer-item-highlight-test.md').click();
    
    // 1. Initially, Section 1 should be highlighted (index 0)
    const tocItem0 = page.getByTestId('toc-item-0').locator('div').first();
    await expect(tocItem0).toHaveCSS('border-left-width', '3px');
    
    // 2. Scroll to Section 2
    const previewContainer = page.getByTestId('preview-container');
    await previewContainer.evaluate(el => {
      const headings = el.querySelectorAll('h1');
      if (headings[1]) {
        headings[1].scrollIntoView();
      }
    });

    // 3. Verify TOC Item 1 is now highlighted
    const tocItem1 = page.getByTestId('toc-item-1').locator('div').first();
    await expect(tocItem1).toHaveCSS('border-left-width', '3px', { timeout: 10000 });
    
    // 4. Verify TOC Item 0 is NO LONGER highlighted
    await expect(tocItem0).toHaveCSS('border-left-width', '0px');
  });

  test('should highlight correct item when clicking TOC item', async ({ page }) => {
    await page.getByTestId('explorer-item-highlight-test.md').click();
    
    // Wait for initial render/highlight of Section 1 to ensure markdown is loaded
    const tocItem0 = page.getByTestId('toc-item-0').locator('div').first();
    await expect(tocItem0).toHaveCSS('border-left-width', '3px');
    
    // Click TOC Item 2 (Section 3)
    await page.getByTestId('toc-item-2').click();
    
    // Wait for scroll and observer to trigger (instant scroll is used now)
    await page.waitForTimeout(500);
    
    // Verify TOC Item 2 is highlighted
    const tocItem2 = page.getByTestId('toc-item-2').locator('div').first();
    await expect(tocItem2).toHaveCSS('border-left-width', '3px');
    
    // Verify preview scrolled to Section 3
    const previewContainer = page.getByTestId('preview-container');
    const scrollTop = await previewContainer.evaluate(el => el.scrollTop);
    expect(scrollTop).toBeGreaterThan(500); 
  });
});
