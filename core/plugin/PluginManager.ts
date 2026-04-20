import { App } from '../App';
import { Plugin } from './Plugin';
import { PluginManifest } from './Manifest';

export type PluginConstructor = new (app: App, manifest: PluginManifest) => Plugin;

/**
 * 플러그인의 로딩, 활성화, 비활성화 및 생명주기를 관리하는 클래스입니다.
 */
export class PluginManager {
  private app: App;
  private plugins: Map<string, Plugin> = new Map();
  private manifests: Map<string, PluginManifest> = new Map();
  private enabledPlugins: Set<string> = new Set();

  constructor(app: App) {
    this.app = app;
  }

  /**
   * 플러그인 클래스를 시스템에 등록합니다.
   */
  registerPlugin(manifest: PluginManifest, pluginClass: PluginConstructor) {
    const pluginInstance = new pluginClass(this.app, manifest);
    this.plugins.set(manifest.id, pluginInstance);
    this.manifests.set(manifest.id, manifest);
    console.log(`[PluginManager] Registered plugin: ${manifest.name} (${manifest.id})`);
  }

  /**
   * 플러그인을 활성화합니다.
   */
  async enablePlugin(id: string) {
    if (this.enabledPlugins.has(id)) return;

    const plugin = this.plugins.get(id);
    if (!plugin) {
      console.error(`[PluginManager] Plugin not found: ${id}`);
      return;
    }

    try {
      await plugin.onload();
      this.enabledPlugins.add(id);
      console.log(`[PluginManager] Enabled plugin: ${plugin.manifest.name}`);
    } catch (error) {
      console.error(`[PluginManager] Failed to enable plugin ${id}:`, error);
    }
  }

  /**
   * 플러그인을 비활성화합니다.
   */
  async disablePlugin(id: string) {
    if (!this.enabledPlugins.has(id)) return;

    const plugin = this.plugins.get(id);
    if (!plugin) return;

    try {
      await plugin.onunload();
      this.enabledPlugins.delete(id);
      console.log(`[PluginManager] Disabled plugin: ${plugin.manifest.name}`);
    } catch (error) {
      console.error(`[PluginManager] Failed to disable plugin ${id}:`, error);
    }
  }

  /**
   * 모든 플러그인 목록을 가져옵니다.
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 활성화된 플러그인 아이디 목록을 가져옵니다.
   */
  getEnabledPluginIds(): string[] {
    return Array.from(this.enabledPlugins);
  }

  /**
   * 특정 플러그인 인스턴스를 가져옵니다.
   */
  getPlugin(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }
}
