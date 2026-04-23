import { AppInstance } from '../../AppInstance';
import { Plugin } from '../Plugin';
import { PluginManager } from '../PluginManager';
import { PluginManifest } from '../Manifest';

// Mock plugin for testing
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

  test('should be able to register a plugin', () => {
    manager.registerPlugin(manifest, TestPlugin);
    expect(manager.getPlugins().length).toBe(1);
    expect(manager.getPlugin('test-plugin')).toBeDefined();
  });

  test('should be able to enable/disable a plugin', async () => {
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
