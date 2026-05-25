import { CommandManager } from './commands/CommandManager';
import { PluginManager } from './plugin/PluginManager';
import { EventBus } from './events/EventBus';
import { ViewRegistry } from './workspace/ViewRegistry';
import { App, Vault, Workspace, Commands } from './App';

/**
 * 플러그인 인터페이스 및 핵심 시스템을 통합 관리하는 구체 클래스입니다.
 */
export class AppInstance implements App {
  public commands: CommandManager;
  public plugins: PluginManager;
  public events: EventBus;
  public views: ViewRegistry;

  // 인스턴스 생성을 위해 필요한 외부 주입 (나중에 React 레이어와 연결)
  public vault: Vault = {} as Vault;
  public workspace: Workspace = {} as Workspace;
  public anims: any = {};
  public theme = {
    registerTheme: (theme: any) => {
      this.emit('theme:register', theme);
    },
    unregisterTheme: (id: string) => {
      this.emit('theme:unregister', id);
    },
    setActiveTheme: (id: string | null) => {
      this.emit('theme:set-active', id);
    }
  };

  constructor() {
    this.commands = new CommandManager();
    this.plugins = new PluginManager(this);
    this.events = new EventBus();
    this.views = new ViewRegistry();
  }

  // implementations setters
  setVault(vault: Vault) { this.vault = vault; }
  setWorkspace(workspace: Workspace) { this.workspace = workspace; }

  // App 인터페이스 구현체
  on(event: string, callback: (...args: any[]) => void) { this.events.on(event, callback); }
  off(event: string, callback: (...args: any[]) => void) { this.events.off(event, callback); }
  emit(event: string, ...args: any[]) { this.events.emit(event, ...args); }
}
