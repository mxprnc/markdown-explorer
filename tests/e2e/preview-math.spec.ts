import { test, expect } from '@playwright/test';
import { injectMockFileSystem, MOCK_LOCAL_FILES } from '../support/e2e-utils';

const MATH_MOCK_FS = [
  {
    name: 'math-test.md',
    kind: 'file' as const,
    path: 'math-test.md',
    handle: {} as any
  }
];

const MATH_MOCK_FILES = {
  ...MOCK_LOCAL_FILES,
  'math-test.md': `
# Math Formula Test
Here is an inline formula: $\\sigma$.

Here is a block/display formula:

$$
\\sigma = \\sqrt{\\frac{1}{N} \\sum_{t=1}^{N} (x_t - \\mu)^2}
$$

`
};

test.describe('KaTeX Math Rendering E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectMockFileSystem(page, MATH_MOCK_FS, MATH_MOCK_FILES);
  });

  test('should render inline and block math formulas correctly using KaTeX', async ({ page }) => {
    // 1. Open the math test file
    await page.getByTestId('explorer-item-math-test.md').click();
    
    // 2. Wait for preview container to render
    const preview = page.getByTestId('preview-container');
    await expect(preview.locator('h1')).toHaveText('Math Formula Test', { timeout: 15000 });

    // 3. Verify inline math rendering is resolved by KaTeX
    const inlineMath = preview.locator('.katex');
    await expect(inlineMath.first()).toBeVisible({ timeout: 15000 });
    
    // 4. Verify display math rendering is resolved by KaTeX with display mode layout style
    const displayMath = preview.locator('.katex-display');
    await expect(displayMath).toBeVisible();

    // 5. Assert that no plain code blocks containing language-math are visible (which was the bug!)
    const codeBlockMath = preview.locator('pre code.language-math, div code.language-math');
    await expect(codeBlockMath).not.toBeVisible();
  });
});
