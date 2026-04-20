export interface Command {
  id: string;
  name: string;
  callback: () => void;
  hotkeys?: string[];
}

/**
 * 전역 명령어를 관리하는 클래스입니다.
 */
export class CommandManager {
  private commands: Map<string, Command> = new Map();

  /**
   * 명령어를 등록합니다.
   */
  addCommand(command: Command) {
    this.commands.set(command.id, command);
    console.log(`[CommandManager] Command added: ${command.name} (${command.id})`);
  }

  /**
   * 명령어를 제거합니다.
   */
  removeCommand(id: string) {
    this.commands.delete(id);
    console.log(`[CommandManager] Command removed: ${id}`);
  }

  /**
   * 명령어를 실행합니다.
   */
  executeCommand(id: string) {
    const command = this.commands.get(id);
    if (command) {
      command.callback();
    } else {
      console.warn(`[CommandManager] Command not found: ${id}`);
    }
  }

  /**
   * 모든 명령어 목록을 가져옵니다.
   */
  listCommands(): Command[] {
    return Array.from(this.commands.values());
  }
}
