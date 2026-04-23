import { TemplatesPlugin } from '../TemplatesPlugin';
import { AppInstance } from '@/core/AppInstance';

describe('TemplatesPlugin Extended', () => {
  let app: AppInstance;
  let plugin: TemplatesPlugin;

  beforeEach(() => {
    app = new AppInstance();
    // Mock Vault and Workspace
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

  test('should register sidebar view on load', async () => {
    await plugin.onload();
    expect(app.workspace.addSidebarView).toHaveBeenCalledWith(
      'templates-list',
      'Templates',
      'document-text-outline',
      expect.any(Function)
    );
  });

  test('should remove sidebar view on unload', async () => {
    await plugin.onunload();
    expect(app.workspace.removeSidebarView).toHaveBeenCalledWith('templates-list');
  });

  test('should emit vault:delete-item event when deleteTemplate is called', async () => {
    const emitSpy = jest.spyOn(app, 'emit');
    await plugin.deleteTemplate('test-path.md');
    expect(emitSpy).toHaveBeenCalledWith('vault:delete-item', { path: 'test-path.md' });
  });

  test('should insert processed text when insertTemplate is called', async () => {
    const emitSpy = jest.spyOn(app, 'emit');
    await plugin.insertTemplate('test-path.md');
    expect(app.vault.read).toHaveBeenCalledWith('test-path.md');
    expect(emitSpy).toHaveBeenCalledWith('editor:insert-text', expect.any(String));
  });
});
