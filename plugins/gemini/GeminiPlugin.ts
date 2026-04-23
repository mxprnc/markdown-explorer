import { Plugin } from '@/core/plugin/Plugin';

/**
 * Gemini AI 기능을 제공하는 플러그인입니다.
 */
export class GeminiPlugin extends Plugin {
  async onload() {
    console.log('[GeminiPlugin] Loading...');

    // 1. 명령어 등록
    this.app.commands.addCommand({
      id: 'ask-gemini',
      name: 'Ask Gemini',
      callback: () => {
        this.app.emit('gemini:open-chat');
      }
    });

    // 2. UI 뷰 등록 (사이드바 탭 예시)
    this.app.workspace.addSidebarView(
      'gemini-chat-view',
      'Gemini Chat',
      'chatbubble-outline',
      null // 컴포넌트는 나중에 React 레이어에서 연결
    );

    console.log('[GeminiPlugin] Loaded successfully.');
  }

  async onunload() {
    console.log('[GeminiPlugin] Unloading...');
    
    // 등록된 명령어 및 뷰 제거
    this.app.commands.removeCommand('ask-gemini');
    this.app.workspace.removeSidebarView('gemini-chat-view');
  }
}
