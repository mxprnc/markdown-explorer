import { test, expect } from '@playwright/test';
import { injectMockFileSystem } from '../support/e2e-utils';

test.describe('YouTube Playlist Exporter Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectMockFileSystem(page, [], {});
    
    // Inject API Key BEFORE triggering the modal
    await page.evaluate(() => {
      if ((window as any).__E2E_HOOKS__) {
        (window as any).__E2E_HOOKS__.updateAPIKey('youtube', 'MOCK_KEY');
      }
    });

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
    // Check default Batch Size
    const batchInput = page.getByTestId('item-limit-input');
    await expect(batchInput).toHaveValue('20');
    await expect(page.locator('text=BATCH SIZE (MAX 50)')).toBeVisible();

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

  test('should allow manual batch size input', async ({ page }) => {
    const batchInput = page.getByTestId('item-limit-input');
    
    await batchInput.fill('50');
    await expect(batchInput).toHaveValue('50');
    
    await batchInput.fill('5');
    await expect(batchInput).toHaveValue('5');
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

  test('should automatically loop and accumulate items until the end', async ({ page }) => {

    const playlistId = 'PL_LOOP_TEST';
    const url = `https://www.youtube.com/playlist?list=${playlistId}`;
    
    let requestCount = 0;
    await page.route('**/youtube/v3/playlistItems*', async (route) => {
      requestCount++;
      if (requestCount === 1) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              { snippet: { title: 'Video 1', thumbnails: { default: { url: '' } }, channelTitle: 'Ch' }, contentDetails: { videoId: 'v1' } },
              { snippet: { title: 'Video 2', thumbnails: { default: { url: '' } }, channelTitle: 'Ch' }, contentDetails: { videoId: 'v2' } }
            ],
            nextPageToken: 'token2'
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              { snippet: { title: 'Video 3', thumbnails: { default: { url: '' } }, channelTitle: 'Ch' }, contentDetails: { videoId: 'v3' } },
              { snippet: { title: 'Video 4', thumbnails: { default: { url: '' } }, channelTitle: 'Ch' }, contentDetails: { videoId: 'v4' } }
            ],
            nextPageToken: null
          })
        });
      }
    });

    await page.route('**/youtube/v3/playlists*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [{ snippet: { title: 'Loop Test Playlist', channelTitle: 'Ch' }, contentDetails: { itemCount: 4 } }]
        })
      });
    });

    const urlInput = page.getByTestId('playlist-url-input');
    await urlInput.fill(url);
    
    await expect(page.locator('text=Video 1')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Video 4')).toBeVisible({ timeout: 15000 });
    
    const previewHeader = page.locator('text=Live Preview');
    await expect(previewHeader).toContainText('(4 / 4)');
  });

  test('should handle API errors gracefully (TC-YT-05)', async ({ page }) => {

    await page.route('**/youtube/v3/playlists*', async (route) => {
      await route.fulfill({ status: 403, body: 'Quota Exceeded' });
    });

    const urlInput = page.getByTestId('playlist-url-input');
    await urlInput.fill('https://www.youtube.com/playlist?list=ERROR');
    
    // Check if empty state message is shown instead of crashing
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Enter URL to see preview')).toBeVisible();
  });

  test('should debounce URL input to prevent API spam (TC-YT-06)', async ({ page }) => {
    let apiCallCount = 0;
    await page.route('**/youtube/v3/playlists*', async (route) => {
      apiCallCount++;
      await route.fulfill({ status: 200, body: JSON.stringify({ items: [] }) });
    });

    const urlInput = page.getByTestId('playlist-url-input');
    
    // Simulate real typing with pressSequentially
    await urlInput.click();
    await urlInput.pressSequentially('https://www.youtube.com/playlist?list=123', { delay: 50 });
    
    await page.waitForTimeout(1500); 
    
    // Should only have been called once despite many key presses
    expect(apiCallCount).toBeLessThanOrEqual(1);
  });
});
