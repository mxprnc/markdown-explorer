import { TemplatesPlugin } from '../TemplatesPlugin';
import { AppInstance } from '@/core/AppInstance';
import { format } from 'date-fns';

describe('TemplatesPlugin', () => {
  let app: AppInstance;
  let plugin: TemplatesPlugin;

  beforeEach(() => {
    app = new AppInstance();
    // Mock workspace
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

  test('should correctly process variables in templates', () => {
    const template = 'Date: {{date}}, Time: {{time}}, Title: {{title}}';
    const now = new Date();
    const expectedDate = format(now, 'yyyy-MM-dd');
    
    // @ts-ignore - testing private method
    const result = plugin.processVariables(template);
    
    expect(result).toContain(`Date: ${expectedDate}`);
    expect(result).toContain('Time:');
    expect(result).toContain('Title: Untitled');
  });
});
