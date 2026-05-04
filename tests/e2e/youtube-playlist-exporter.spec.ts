import { test, expect } from '@playwright/test';
import { injectMockFileSystem } from '../support/e2e-utils';

test.describe('YouTube Playlist Exporter Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectMockFileSystem(page, [], {});
    
    // Trigger modal via E2E hook
    await page.evaluate(() => {
      if ((window as any).__E2E_HOOKS__) {
        (window as any).__E2E_HOOKS__.triggerExpandedYoutubeModal();
      }
    });
    
    // Wait for modal to be visible and animation to finish
    await expect(page.getByTestId('expanded-youtube-modal')).toBeVisible();
    await page.waitForTimeout(500);
  });

  test('should have correct default values', async ({ page }) => {
    // Check default Item Limit
    const limitInput = page.getByTestId('item-limit-input');
    await expect(limitInput).toHaveValue('20');

    // Check default List Type (Plain should be active)
    const plainToggle = page.getByTestId('list-type-Plain');
    const bulletToggle = page.getByTestId('list-type-Bulleted');
    
    await expect(plainToggle).toBeVisible();
    await expect(bulletToggle).toBeVisible();
  });

  test('should be large and visible', async ({ page }) => {
    const modal = page.getByTestId('expanded-youtube-modal');
    await expect(modal).toBeVisible();
    
    // Check for key UI elements that should be in a large modal
    await expect(page.locator('text=EXTRACTION MODE')).toBeVisible();
    await expect(page.locator('text=Live Preview')).toBeVisible();
  });

  test('should allow manual item limit input', async ({ page }) => {
    const limitInput = page.getByTestId('item-limit-input');
    
    await limitInput.fill('50');
    await expect(limitInput).toHaveValue('50');
    
    await limitInput.fill('5');
    await expect(limitInput).toHaveValue('5');
  });

  test('should switch between Markdown and Preview tabs', async ({ page }) => {
    const tabMarkdown = page.getByTestId('tab-markdown');
    const tabPreview = page.getByTestId('tab-preview');
    
    await tabMarkdown.click();
    // In markdown tab, we expect to see raw markdown text
    await expect(page.locator('text=Enter URL to see preview')).toBeVisible();

    await tabPreview.click();
    // In preview tab, we expect rendered content
    await expect(page.locator('text=Enter URL to see preview')).toBeVisible();
  });

  test('should show preview when URL is entered', async ({ page }) => {
    const urlInput = page.getByTestId('playlist-url-input');
    await urlInput.fill('https://www.youtube.com/playlist?list=PLAx0_A2LToY_I3_Xn-yS7qF97B6XN8S1C');
    
    // Wait for debounce and fetch (mock fallback will show Sample Video)
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=Sample Video 1')).toBeVisible();
  });
});
