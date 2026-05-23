import { test, expect } from '@playwright/test';
import { injectMockFileSystem, MOCK_LOCAL_FILES } from '../support/e2e-utils';

const CODE_MOCK_FS = [
  {
    name: 'code-test.md',
    kind: 'file' as const,
    path: 'code-test.md',
    handle: {} as any
  }
];

const CODE_MOCK_FILES = {
  ...MOCK_LOCAL_FILES,
  'code-test.md': `
# Code Test
This is \`inline code\` in a paragraph.

\`\`\`javascript
// This is a code block
console.log("Hello");
\`\`\`
`
};

test.describe('Inline and Block Code Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectMockFileSystem(page, CODE_MOCK_FS, CODE_MOCK_FILES);
  });

  test('should render inline code without breaking lines', async ({ page }) => {
    await page.getByTestId('explorer-item-code-test.md').click();
    
    const preview = page.getByTestId('preview-container');
    await expect(preview.locator('h1')).toHaveText('Code Test', { timeout: 15000 });

    const inlineCode = preview.locator('p code');
    await expect(inlineCode).toHaveText('inline code');
    
    // Verify it is inline (not block) using built-in assertion with retry
    await expect(inlineCode).toHaveCSS('display', /inline/);
    
    // Verify custom styles (matching light mode defaults in the test environment usually)
    // #F3F4F6 is rgb(243, 244, 246)
    await expect(inlineCode).toHaveCSS('background-color', 'rgb(243, 244, 246)');
  });

  test('should render code blocks with SyntaxHighlighter', async ({ page }) => {
    await page.getByTestId('explorer-item-code-test.md').click();
    
    const preview = page.getByTestId('preview-container');
    const codeBlock = preview.locator('pre div, div').filter({ hasText: 'console.log("Hello");' }).first();
    
    await expect(codeBlock).toBeVisible();
    await expect(codeBlock).toContainText('console.log("Hello");');
    
    const display = await codeBlock.evaluate(el => window.getComputedStyle(el).display);
    expect(display).toBe('block');
  });
});
