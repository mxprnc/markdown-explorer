import { TemplatesPlugin } from '../TemplatesPlugin';
import { AppInstance } from '@/core/AppInstance';
import { format } from 'date-fns';

describe('TemplatesPlugin', () => {
  let app: AppInstance;
  let plugin: TemplatesPlugin;

  beforeEach(() => {
    app = new AppInstance();
    // Workspace 모킹
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

  test('변수 치환이 정확하게 이루어져야 한다', () => {
    const template = 'Date: {{date}}, Time: {{time}}, Title: {{title}}';
    const now = new Date();
    const expectedDate = format(now, 'yyyy-MM-dd');
    
    // @ts-ignore - private 메서드 테스트
    const result = plugin.processVariables(template);
    
    expect(result).toContain(`Date: ${expectedDate}`);
    expect(result).toContain('Time:');
    expect(result).toContain('Title: Untitled');
  });
});
