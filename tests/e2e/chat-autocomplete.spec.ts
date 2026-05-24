import { test, expect } from '@playwright/test';
import { injectMockFileSystem, MOCK_FILE_SYSTEM, MOCK_LOCAL_FILES } from '../support/e2e-utils';

test.describe('GeminiChat Autocomplete & Suggestions E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectMockFileSystem(page, MOCK_FILE_SYSTEM, MOCK_LOCAL_FILES);

    // Set mock API key to enable GeminiChat
    await page.evaluate(() => {
      if ((window as any).__E2E_HOOKS__) {
        (window as any).__E2E_HOOKS__.setGeminiApiKey('MOCK_KEY');
      }
    });
  });

  test('should trigger file autocomplete dropdown overlay upon typing @', async ({ page }) => {
    const chatInput = page.getByTestId('chat-input');
    await expect(chatInput).toBeVisible();

    // 1. Initially suggestion overlay is hidden
    const overlay = page.getByTestId('autocomplete-overlay');
    await expect(overlay).not.toBeVisible();

    // 2. Type '@' inside chat input
    await chatInput.fill('Please look at @');
    await expect(overlay).toBeVisible();

    // 3. Verify file list options are rendered
    const item = page.getByTestId('autocomplete-item-root-file.md');
    await expect(item).toBeVisible();

    // 4. Click the item
    await item.click();

    // 5. Verify dropdown closes and injected path value is correct
    await expect(overlay).not.toBeVisible();
    await expect(chatInput).toHaveValue('Please look at @root-file.md ');
  });

  test('should trigger command autocomplete dropdown and filter by active AI provider', async ({ page }) => {
    const chatInput = page.getByTestId('chat-input');
    const overlay = page.getByTestId('autocomplete-overlay');

    // 1. Type '$' to trigger command suggestions
    await chatInput.fill('Run $');
    await expect(overlay).toBeVisible();

    // 2. Since default provider is Gemini, verify Gemini commands are suggested
    const geminiCmd = page.getByTestId('autocomplete-item-analyze-code');
    await expect(geminiCmd).toBeVisible();

    // 3. Select command using keyboard navigation (ArrowDown then Enter)
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // 4. Verify overlay closed and value is injected correctly
    await expect(overlay).not.toBeVisible();
    await expect(chatInput).toHaveValue('Run $refactor-code ');
  });
});
