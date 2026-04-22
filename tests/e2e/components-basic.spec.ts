import { test, expect } from '@playwright/test';
import { injectMockFileSystem } from '../support/e2e-utils';

test.describe('Core Components Verification', () => {
  const mockFiles = [
    { name: 'file1.md', path: 'file1.md', kind: 'file' },
    { name: 'file2.md', path: 'file2.md', kind: 'file' }
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectMockFileSystem(page, mockFiles, { 'file1.md': '# File 1 Content', 'file2.md': '# File 2 Content' });
    
    // Set mock API key to enable GeminiChat
    await page.evaluate(() => {
      if ((window as any).__E2E_HOOKS__) {
        (window as any).__E2E_HOOKS__.setGeminiApiKey('MOCK_KEY');
      }
    });
  });

  test('Editor typing and Preview sync', async ({ page }) => {
    // 1. Open file1.md and switch to Editor mode
    await page.getByTestId('explorer-item-file1.md').click();
    await expect(page.getByTestId('tab-item-file1.md')).toBeVisible();
    await page.getByTestId('header-editor-btn').click();

    // 2. Type in Editor
    const editor = page.locator('.ProseMirror');
    await editor.waitFor({ state: 'visible' });
    await editor.focus();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Hello from E2E');

    // 3. Switch back to Files mode to see Preview
    await page.getByTestId('header-files-btn').click();
    const preview = page.getByTestId('preview-container');
    await expect(preview).toContainText('Hello from E2E');
  });

  test('Tab switching and state persistence', async ({ page }) => {
    // 1. Open file1.md and switch to Editor mode
    await page.getByTestId('explorer-item-file1.md').click();
    await page.getByTestId('header-editor-btn').click();
    const editor = page.locator('.ProseMirror');
    await editor.waitFor({ state: 'visible' });
    await editor.focus();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Modified File 1');

    // 2. Open file2.md
    await page.getByTestId('explorer-item-file2.md').click();
    // Re-ensure we are in editor mode (it should stay, but good to be sure)
    await expect(page.getByTestId('tab-item-file2.md')).toBeVisible();
    await expect(editor).toContainText('File 2 Content');

    // 3. Switch back to file1.md
    await page.getByTestId('tab-item-file1.md').click();
    // Use haveText to check exact content if possible, or containText
    await expect(editor).toContainText('Modified File 1');
  });

  test('Tab closing functionality', async ({ page }) => {
    await page.getByTestId('explorer-item-file1.md').dblclick();
    await page.getByTestId('explorer-item-file2.md').dblclick();
    
    await expect(page.getByTestId('tab-item-file1.md')).toBeVisible();
    await expect(page.getByTestId('tab-item-file2.md')).toBeVisible();

    // Close file1.md
    await page.getByTestId('tab-close-file1.md').click();
    await expect(page.getByTestId('tab-item-file1.md')).not.toBeVisible();
    await expect(page.getByTestId('tab-item-file2.md')).toBeVisible();
  });

  test('GeminiChat basic interaction', async ({ page }) => {
    // 1. Check if GeminiChat is visible (it's in the footer usually)
    const chatInput = page.getByTestId('chat-input');
    await expect(chatInput).toBeVisible();

    // 2. Type message
    await chatInput.fill('How are you?');
    const sendBtn = page.getByTestId('chat-send-btn');
    
    // 3. Mock Auth if needed (GeminiChat checks hasAuth)
    // For this test, we just check if it attempts to send
    await sendBtn.click();
    
    // Since we don't have real API keys in CI, it might show "Error" or "Auth required"
    // But we verified the UI flow.
    await expect(page.getByTestId('chat-message-list')).toContainText('How are you?');
  });
});
