import { test, expect } from '@playwright/test';
import { injectMockFileSystem, MOCK_LOCAL_FILES } from '../support/e2e-utils';

const TOC_MOCK_FS = [
  {
    name: 'toc-test.md',
    kind: 'file' as const,
    path: 'toc-test.md',
    handle: {} as any
  },
  {
    name: 'empty.md',
    kind: 'file' as const,
    path: 'empty.md',
    handle: {} as any
  }
];

const TOC_MOCK_FILES = {
  ...MOCK_LOCAL_FILES,
  'toc-test.md': '# Header 1\n\nSome content.\n\n## Header 2\n\nMore content.\n\n### Header 3\n\nEven more.',
  'empty.md': 'No headings here.'
};

test.describe('TOC Pane Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectMockFileSystem(page, TOC_MOCK_FS, TOC_MOCK_FILES);
    // Pin the TOC pane so it is visible
    await page.getByTestId('header-toc-btn').click();
  });

  test('should render TOC items correctly for markdown with headings', async ({ page }) => {
    // 1. Open toc-test.md
    await page.getByTestId('explorer-item-toc-test.md').click();
    
    // 2. Verify TOC pane is visible
    const tocPane = page.locator('#toc-pane');
    await expect(tocPane).toBeVisible();

    // 3. Verify heading items are listed
    await expect(page.getByTestId('toc-item-0')).toHaveText('Header 1');
    await expect(page.getByTestId('toc-item-1')).toHaveText('Header 2');
    await expect(page.getByTestId('toc-item-2')).toHaveText('Header 3');
  });

  test('should show empty message when no headings are present', async ({ page }) => {
    // 1. Open empty.md
    await page.getByTestId('explorer-item-empty.md').click();
    
    // 2. Verify empty message
    await expect(page.getByTestId('toc-empty-msg')).toBeVisible();
    await expect(page.getByText('No headings found.')).toBeVisible();
  });

  test('should have correct indentation based on heading level', async ({ page }) => {
    await page.getByTestId('explorer-item-toc-test.md').click();

    // Check paddingLeft of items
    // H1 (level 1) -> 12 + (1-1)*12 = 12
    // H2 (level 2) -> 12 + (2-1)*12 = 24
    // H3 (level 3) -> 12 + (3-1)*12 = 36
    
    const h1 = page.getByTestId('toc-item-0').locator('div').first();
    const h2 = page.getByTestId('toc-item-1').locator('div').first();
    const h3 = page.getByTestId('toc-item-2').locator('div').first();

    // On Web, react-native-web converts padding to style. Wait for render.
    await expect(h1).toHaveCSS('padding-left', '12px');
    await expect(h2).toHaveCSS('padding-left', '24px');
    await expect(h3).toHaveCSS('padding-left', '36px');
  });

  test('should update TOC when content changes in editor', async ({ page }) => {
    await page.getByTestId('explorer-item-toc-test.md').click();
    
    // 1. Check initial state
    await expect(page.getByTestId('toc-item-0')).toHaveText('Header 1');

    // 2. Modify editor content via Hook (Simulating typing)
    await page.evaluate(() => {
      if ((window as any).__E2E_HOOKS__) {
        (window as any).__E2E_HOOKS__.setSelectedFile('toc-test.md');
        (window as any).__E2E_HOOKS__.setEditorContent('# New Header\n\nContent');
      }
    });

    // 3. Verify TOC update
    await expect(page.getByTestId('toc-item-0')).toHaveText('New Header');
    await expect(page.getByTestId('toc-item-1')).not.toBeVisible();
  });

  test('should call scroll function when TOC item is clicked', async ({ page }) => {
    await page.getByTestId('explorer-item-toc-test.md').click();

    // We can't easily verify the actual scroll position in a simple way without more hooks,
    // but we can verify that the click doesn't crash and potentially check logs.
    // For now, let's just ensure clicking works.
    await page.getByTestId('toc-item-1').click();
    
    // In a more advanced test, we'd check if the preview/editor scrolled.
    // Currently, TOCPane calls onTOCClick which calls previewRef.current.scrollToHeading
  });
});
