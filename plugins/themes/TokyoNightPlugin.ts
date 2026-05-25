import { Plugin } from '@/core/plugin/Plugin';

export class TokyoNightPlugin extends Plugin {
  async onload() {
    console.log('[TokyoNightPlugin] Loading...');
    this.app.theme.registerTheme({
      id: 'tokyo-night',
      name: 'Tokyo Night',
      isDark: true,
      colors: {
        background: '#1a1b26',
        text: '#c0caf5',
        border: 'rgba(122, 162, 247, 0.15)',
        surface: '#16161e',
        primary: '#7aa2f7',
        textMuted: '#565f89',
        textHighlight: '#e0af68',
        accentGlow: 'rgba(122, 162, 247, 0.2)',
      }
    });
    console.log('[TokyoNightPlugin] Registered successfully.');
  }

  async onunload() {
    console.log('[TokyoNightPlugin] Unloading...');
    this.app.theme.unregisterTheme('tokyo-night');
    console.log('[TokyoNightPlugin] Unloaded successfully.');
  }
}
