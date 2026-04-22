import { MetaGenerator } from './MetaGenerator';
import { ExportNode } from './types';

describe('MetaGenerator', () => {
  test('should generate JS export with correct mapping', () => {
    const nodes: ExportNode[] = [
      { name: 'Introduction.md', type: 'file' },
      { name: 'Advanced Usage.md', type: 'file' },
      { name: 'Sub Folder', type: 'directory', children: [] }
    ];

    const result = MetaGenerator.generate(nodes);
    
    expect(result).toContain('export default');
    expect(result).toContain('"introduction": "Introduction"');
    expect(result).toContain('"advanced-usage": "Advanced Usage"');
    expect(result).toContain('"sub-folder": "Sub Folder"');
  });

  test('should skip excluded names', () => {
    const nodes: ExportNode[] = [
      { name: 'index.md', type: 'file' },
      { name: 'img', type: 'directory', children: [] }
    ];

    const result = MetaGenerator.generate(nodes, ['img', 'index.md']);
    
    expect(result).toBe('export default {}');
  });
});
