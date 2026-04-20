import { Plugin } from '@/core/plugin/Plugin';
import { format } from 'date-fns';

/**
 * 마크다운 템플릿 기능을 제공하는 플러그인입니다.
 */
export class TemplatesPlugin extends Plugin {
  private templatesFolder = '.mark-explorer/templates';

  async onload() {
    console.log('[TemplatesPlugin] Loading...');

    // 1. 템플릿 폴더 존재 확인 및 생성
    if (!(await this.app.vault.exists(this.templatesFolder))) {
      await this.app.vault.createFolder(this.templatesFolder);
      console.log(`[TemplatesPlugin] Created templates folder: ${this.templatesFolder}`);
    }

    // 2. 명령어 등록
    this.app.commands.addCommand({
      id: 'insert-template',
      name: '템플릿 삽입',
      callback: () => this.openTemplatePicker()
    });

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

    // 실제로는 UI Picker를 띄워야 하지만, PoC를 위해 첫 번째 템플릿을 사용하는 예시
    this.app.emit('templates:show-picker', templates);
  }

  /**
   * 선택된 템플릿을 현재 에디터에 삽입합니다.
   */
  async insertTemplate(templatePath: string) {
    const rawContent = await this.app.vault.read(templatePath);
    const processedContent = this.processVariables(rawContent);
    
    this.app.emit('editor:insert-text', processedContent);
  }

  /**
   * 템플릿 내의 변수({{date}}, {{time}} 등)를 치환합니다.
   */
  private processVariables(content: string): string {
    const now = new Date();
    return content
      .replace(/{{date}}/g, format(now, 'yyyy-MM-dd'))
      .replace(/{{time}}/g, format(now, 'HH:mm:ss'))
      .replace(/{{title}}/g, this.app.workspace.getActiveFile()?.split('/').pop() || 'Untitled');
  }

  async onunload() {
    this.app.commands.removeCommand('insert-template');
    console.log('[TemplatesPlugin] Unloaded.');
  }
}
