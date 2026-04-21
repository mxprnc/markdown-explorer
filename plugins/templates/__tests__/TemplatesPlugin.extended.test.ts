import { TemplatesPlugin } from '../TemplatesPlugin';
import { AppInstance } from '@/core/AppInstance';

describe('TemplatesPlugin Extended', () => {
  let app: AppInstance;
  let plugin: TemplatesPlugin;

  beforeEach(() => {
    app = new AppInstance();
    // Vault 및 Workspace 모킹
    app.vault = {
      exists: jest.fn().mockResolvedValue(true),
      createFolder: jest.fn().mockResolvedValue(undefined),
      listFiles: jest.fn().mockResolvedValue(['t1.md', 't2.md']),
      read: jest.fn().mockResolvedValue('content'),
      write: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(true),
    } as any;

    app.workspace = {
      getActiveFile: jest.fn().mockReturnValue(null),
      openFile: jest.fn(),
      addSidebarView: jest.fn(),
      removeSidebarView: jest.fn(),
    } as any;

    plugin = new TemplatesPlugin(app as any, {
      id: 'templates',
      name: 'Templates',
      description: 'Templates support',
      author: 'Antigravity',
      version: '1.0.0'
    });
  });

  test('onload 시 사이드바 뷰를 등록해야 한다', async () => {
    await plugin.onload();
    expect(app.workspace.addSidebarView).toHaveBeenCalledWith(
      'templates-list',
      'Templates',
      'document-text-outline',
      expect.any(Function)
    );
  });

  test('onunload 시 사이드바 뷰를 제거해야 한다', async () => {
    await plugin.onunload();
    expect(app.workspace.removeSidebarView).toHaveBeenCalledWith('templates-list');
  });

  test('deleteTemplate 호출 시 vault:delete-item 이벤트를 발생시켜야 한다', async () => {
    const emitSpy = jest.spyOn(app, 'emit');
    await plugin.deleteTemplate('test-path.md');
    expect(emitSpy).toHaveBeenCalledWith('vault:delete-item', { path: 'test-path.md' });
  });

  test('insertTemplate 시 변수가 처리된 텍스트가 삽입되어야 한다', async () => {
    const emitSpy = jest.spyOn(app, 'emit');
    await plugin.insertTemplate('test-path.md');
    expect(app.vault.read).toHaveBeenCalledWith('test-path.md');
    expect(emitSpy).toHaveBeenCalledWith('editor:insert-text', expect.any(String));
  });
});
