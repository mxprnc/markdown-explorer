import { test, expect } from '@playwright/test';
import { injectMockFileSystem, MOCK_LOCAL_FILES } from '../support/e2e-utils';

const PREVIEW_MOCK_FS = [
  {
    name: 'preview-test.md',
    kind: 'file' as const,
    path: 'preview-test.md',
    handle: {} as any
  },
  {
    name: 'test-image.png',
    kind: 'file' as const,
    path: 'test-image.png',
    handle: {} as any
  }
];

const PREVIEW_MOCK_FILES = {
  ...MOCK_LOCAL_FILES,
  'preview-test.md': `
# Preview Title
This is **bold** and *italic*.

## YouTube Test
https://www.youtube.com/watch?v=dQw4w9WgXcQ

## Mermaid Test
\`\`\`mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
\`\`\`

## Image Test
![Test Image](./test-image.png)

## Long Section
${Array(50).fill('Scroll content...').join('\n\n')}
### Target Heading
Found me!
`,
  'test-image.png': 'fake-image-binary-content'
};

test.describe('Preview and ImageViewer Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectMockFileSystem(page, PREVIEW_MOCK_FS, PREVIEW_MOCK_FILES);
  });

  test('should render markdown elements correctly', async ({ page }) => {
    await page.getByTestId('explorer-item-preview-test.md').click();
    
    // 1. Basic text - Wait for parsing
    const preview = page.getByTestId('preview-container');
    await expect(preview.locator('h1')).toHaveText('Preview Title', { timeout: 15000 });
    await expect(preview.locator('strong')).toHaveText('bold');

    // 2. YouTube iframe
    await expect(page.getByTestId('preview-youtube')).toBeVisible();

    // 3. Mermaid diagram (SVG)
    // Wait for the loading state first, then for the SVG
    const mermaid = page.getByTestId('preview-mermaid');
    await expect(mermaid.locator('svg')).toBeVisible({ timeout: 15000 });
  });

  test('should open ImageViewer for image files', async ({ page }) => {
    // Force click to ensure it triggers
    await page.getByTestId('explorer-item-test-image.png').click({ force: true });
    
    // 1. Verify Image Viewer UI
    const viewerImage = page.getByTestId('viewer-image');
    await expect(viewerImage).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('zoom-percentage')).toHaveText('100%');
    
    // 2. Zoom interaction
    await page.getByTestId('zoom-in-btn').click();
    await expect(page.getByTestId('zoom-percentage')).toHaveText('150%');
    
    await page.getByTestId('zoom-reset-btn').click();
    await expect(page.getByTestId('zoom-percentage')).toHaveText('100%');
  });

  test('should scroll to heading when requested', async ({ page }) => {
    await page.getByTestId('explorer-item-preview-test.md').click();
    
    const container = page.getByTestId('preview-container');
    // Wait for content to render
    await expect(container.locator('h1')).toBeVisible();

    const initialScroll = await container.evaluate(el => el.scrollTop);
    expect(initialScroll).toBe(0);

    // Trigger scroll via hook
    await page.evaluate(() => {
      if ((window as any).previewRef1) {
         (window as any).previewRef1.current.scrollToHeading(5, 'Target Heading');
      }
    });

    // Wait for smooth scroll
    await page.waitForTimeout(1500);
    
    const newScroll = await container.evaluate(el => el.scrollTop);
    expect(newScroll).toBeGreaterThan(500);
  });
});
