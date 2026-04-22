import { DepthGuard } from './DepthGuard';
import { ExportNode } from './types';

describe('DepthGuard', () => {
  test('isAllowed should respect max depth', () => {
    expect(DepthGuard.isAllowed(0)).toBe(true);
    expect(DepthGuard.isAllowed(4)).toBe(true);
    expect(DepthGuard.isAllowed(5)).toBe(false);
  });

  test('calculateMaxDepth should return correct depth', () => {
    const tree: ExportNode = {
      name: 'root',
      type: 'directory',
      children: [
        {
          name: 'child1',
          type: 'directory',
          children: [
            {
              name: 'grandchild1',
              type: 'directory',
              children: [
                { name: 'file', type: 'file' } // Level 3
              ]
            }
          ]
        }
      ]
    };

    expect(DepthGuard.calculateMaxDepth(tree)).toBe(3);
  });

  test('calculateMaxDepth should exit early at level 5', () => {
    // Create a very deep tree
    const deepTree: ExportNode = {
      name: '0',
      type: 'directory',
      children: [
        {
          name: '1',
          type: 'directory',
          children: [
            {
              name: '2',
              type: 'directory',
              children: [
                {
                  name: '3',
                  type: 'directory',
                  children: [
                    {
                      name: '4',
                      type: 'directory',
                      children: [
                        { name: '5', type: 'directory', children: [] }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    expect(DepthGuard.calculateMaxDepth(deepTree)).toBe(5);
  });
});
