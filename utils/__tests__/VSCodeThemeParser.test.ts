import { parseVSCodeTheme } from '../VSCodeThemeParser';

describe('VSCodeThemeParser', () => {
  test('should parse a standard VSCode dark theme JSON correctly', () => {
    const json = `{
      "type": "dark",
      "colors": {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
        "sideBar.background": "#252526",
        "button.background": "#0e639c"
      }
    }`;

    const theme = parseVSCodeTheme(json, 'my-theme', 'My Theme');
    expect(theme.id).toBe('my-theme');
    expect(theme.name).toBe('My Theme');
    expect(theme.isDark).toBe(true);
    expect(theme.colors.background).toBe('#1e1e1e');
    expect(theme.colors.text).toBe('#d4d4d4');
    expect(theme.colors.surface).toBe('#252526');
    expect(theme.colors.primary).toBe('#0e639c');
  });

  test('should handle JSON with comments and fallback to defaults', () => {
    const json = `{
      // This is a comment
      /* Multi-line comment */
      "type": "light",
      "colors": {
        "editor.background": "#ffffff"
      }
    }`;

    const theme = parseVSCodeTheme(json, 'light-theme', 'Light Theme');
    expect(theme.isDark).toBe(false);
    expect(theme.colors.background).toBe('#ffffff');
    expect(theme.colors.text).toBe('#121212'); // fallback default light foreground
  });

  test('should throw error for invalid JSON', () => {
    const invalidJson = `{ type: 'dark', }`;
    expect(() => parseVSCodeTheme(invalidJson, 'err', 'Err')).toThrow();
  });
});
