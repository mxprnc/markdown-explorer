import { Plugin } from '@/core/plugin/Plugin';

export class OneDarkProPlugin extends Plugin {
  async onload() {
    console.log('[OneDarkProPlugin] Loading...');
    this.app.theme.registerTheme({
      id: 'one-dark-pro',
      name: 'One Dark Pro',
      isDark: true,
      colors: {
        background: '#282c34',
        text: '#abb2bf',
        border: 'rgba(97, 175, 239, 0.15)',
        surface: '#21252b',
        primary: '#61afef',
        textMuted: '#5c6370',
        textHighlight: '#c678dd',
        accentGlow: 'rgba(97, 175, 239, 0.2)',
      }
    });
    console.log('[OneDarkProPlugin] Registered successfully.');
  }

  async onunload() {
    console.log('[OneDarkProPlugin] Unloading...');
    this.app.theme.unregisterTheme('one-dark-pro');
    console.log('[OneDarkProPlugin] Unloaded successfully.');
  }
}
