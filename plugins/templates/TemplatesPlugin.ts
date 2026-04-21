import { Plugin } from '@/core/plugin/Plugin';
import { format } from 'date-fns';
import { processTemplateVariables } from '@/utils/MarkdownUtils';
import { TemplateListView } from '@/components/plugins/TemplateListView';

/**
 * 마크다운 템플릿 기능을 제공하는 플러그인입니다.
 */
export class TemplatesPlugin extends Plugin {
  private templatesFolder = '_mark-explorer/templates';

  async onload() {
    console.log('[TemplatesPlugin] Loading...');

    // 1. 템플릿 폴더 존재 확인 및 생성
    try {
      if (!(await this.app.vault.exists(this.templatesFolder))) {
        await this.app.vault.createFolder(this.templatesFolder);
        console.log(`[TemplatesPlugin] Created templates folder: ${this.templatesFolder}`);
      }
    } catch (e) {
      console.warn('[TemplatesPlugin] Folder initialization failed', e);
    }

    // 2. 명령어 등록
    this.app.commands.addCommand({
      id: 'insert-template',
      name: '템플릿 삽입',
      callback: () => this.openTemplatePicker()
    });

    // 3. 사이드바 뷰 등록 (Phase 2)
    this.app.workspace.addSidebarView(
      'templates-list',
      'Templates',
      'document-text-outline',
      TemplateListView
    );

    console.log('[TemplatesPlugin] Loaded successfully.');
  }

  /**
   * 템플릿 선택기를 엽니다.
   */
  private async openTemplatePicker() {
    const files = await this.app.vault.listFiles(this.templatesFolder);
    const templates = files.filter(f => f.endsWith('.md'));

    if (templates.length === 0) {
      console.log('[TemplatesPlugin] No templates found.');
      return;
    }

    this.app.emit('templates:show-picker', templates);
  }

  /**
   * 선택된 템플릿을 현재 에디터에 삽입합니다.
   */
  async insertTemplate(templatePath: string) {
    try {
      const rawContent = await this.app.vault.read(templatePath);
      const processedContent = this.processVariables(rawContent);
      this.app.emit('editor:insert-text', processedContent);
    } catch (e) {
      console.error(`[TemplatesPlugin] Failed to insert template: ${templatePath}`, e);
    }
  }

  /**
   * 템플릿 파일을 삭제합니다.
   */
  async deleteTemplate(path: string) {
    try {
      const success = await this.app.vault.delete(path);
      if (!success) {
        console.error(`[TemplatesPlugin] Failed to delete template: ${path}`);
      }
    } catch (e) {
      console.error(`[TemplatesPlugin] Error deleting template: ${path}`, e);
    }
  }

  /**
   * 템플릿 내의 변수({{date}}, {{time}} 등)를 치환합니다.
   */
  private processVariables(content: string): string {
    const now = new Date();
    const variables = {
      date: format(now, 'yyyy-MM-dd'),
      time: format(now, 'HH:mm:ss'),
      title: this.app.workspace.getActiveFile()?.split('/').pop() || 'Untitled'
    };
    
    return processTemplateVariables(content, variables);
  }

  async onunload() {
    this.app.commands.removeCommand('insert-template');
    this.app.workspace.removeSidebarView('templates-list');
    console.log('[TemplatesPlugin] Unloaded.');
  }
}
