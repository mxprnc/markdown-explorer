import { CommandManager } from '../CommandManager';

describe('CommandManager', () => {
  let manager: CommandManager;

  beforeEach(() => {
    manager = new CommandManager();
  });

  test('명령어를 추가하고 실행할 수 있어야 한다', () => {
    const callback = jest.fn();
    manager.addCommand({ id: 'test-cmd', name: 'Test', callback });

    manager.executeCommand('test-cmd');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('명령어를 제거할 수 있어야 한다', () => {
    const callback = jest.fn();
    manager.addCommand({ id: 'test-cmd', name: 'Test', callback });
    manager.removeCommand('test-cmd');

    manager.executeCommand('test-cmd');
    expect(callback).not.toHaveBeenCalled();
  });
});
