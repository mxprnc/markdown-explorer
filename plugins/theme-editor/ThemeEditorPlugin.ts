import { Plugin } from '@/core/plugin/Plugin';
import { ThemeEditorView } from '@/components/plugins/ThemeEditorView';

/**
 * 사용자 정의 테마를 실시간 WYSIWYG으로 편집하고 관리할 수 있도록 지원하는 플러그인입니다.
 */
export class ThemeEditorPlugin extends Plugin {
  async onload() {
    console.log('[ThemeEditorPlugin] Loading...');

    // 1. 커맨드 등록
    this.app.commands.addCommand({
      id: 'edit-theme',
      name: 'Open Theme Editor',
      callback: () => {
        // 사이드바 뷰를 활성화할 수 있는 이벤트를 내보내거나 알림 처리
        console.log('[ThemeEditorPlugin] Triggered Open Theme Editor command.');
      }
    });

    // 2. 사이드바 뷰 등록
    this.app.workspace.addSidebarView(
      'theme-editor',
      'Theme Editor',
      'color-palette-outline',
      ThemeEditorView
    );

    console.log('[ThemeEditorPlugin] Loaded successfully.');
  }

  async onunload() {
    // 명령어 해제
    this.app.commands.removeCommand('edit-theme');
    
    // 사이드바 뷰 해제
    this.app.workspace.removeSidebarView('theme-editor');
    
    console.log('[ThemeEditorPlugin] Unloaded.');
  }
}
