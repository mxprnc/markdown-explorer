import { CommandManager } from '../CommandManager';

describe('CommandManager', () => {
  let manager: CommandManager;

  beforeEach(() => {
    manager = new CommandManager();
  });

  test('should be able to add and execute a command', () => {
    let executed = false;
    manager.addCommand({
      id: 'test-command',
      name: 'Test Command',
      callback: () => { executed = true; }
    });
    manager.executeCommand('test-command');
    expect(executed).toBe(true);
  });

  test('should be able to remove a command', () => {
    manager.addCommand({
      id: 'test-command',
      name: 'Test Command',
      callback: () => {}
    });
    manager.removeCommand('test-command');
    expect(manager.listCommands()).toHaveLength(0);
  });
});
