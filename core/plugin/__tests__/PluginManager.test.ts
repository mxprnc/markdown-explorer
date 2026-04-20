import { AppInstance } from '../../AppInstance';
import { Plugin } from '../Plugin';
import { PluginManager } from '../PluginManager';
import { PluginManifest } from '../Manifest';

// 테스트용 가짜 플러그인
class TestPlugin extends Plugin {
  public loaded = false;
  async onload() { this.loaded = true; }
  async onunload() { this.loaded = false; }
}

describe('PluginManager', () => {
  let app: AppInstance;
  let manager: PluginManager;
  const manifest: PluginManifest = {
    id: 'test-plugin',
    name: 'Test Plugin',
    description: 'Testing',
    author: 'Antigravity',
    version: '1.0.0'
  };

  beforeEach(() => {
    app = new AppInstance();
    manager = new PluginManager(app as any);
  });

  test('플러그인을 등록할 수 있어야 한다', () => {
    manager.registerPlugin(manifest, TestPlugin);
    expect(manager.getPlugins().length).toBe(1);
    expect(manager.getPlugin('test-plugin')).toBeDefined();
  });

  test('플러그인을 활성화/비활성화할 수 있어야 한다', async () => {
    manager.registerPlugin(manifest, TestPlugin);
    const plugin = manager.getPlugin('test-plugin') as TestPlugin;

    await manager.enablePlugin('test-plugin');
    expect(manager.getEnabledPluginIds()).toContain('test-plugin');
    expect(plugin.loaded).toBe(true);

    await manager.disablePlugin('test-plugin');
    expect(manager.getEnabledPluginIds()).not.toContain('test-plugin');
    expect(plugin.loaded).toBe(false);
  });
});
