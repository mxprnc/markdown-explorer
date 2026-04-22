import { ExportNode } from './types';
import { SlugService } from './SlugService';

export class MetaGenerator {
  /**
   * Generates _meta.json content for a given list of sibling nodes
   * @param nodes List of nodes in the current directory
   * @param exclude Folders to explicitly hide (e.g., ['img'])
   */
  static generate(nodes: ExportNode[], exclude: string[] = ['img']): string {
    const meta: Record<string, any> = {};

    for (const node of nodes) {
      // Skip excluded names
      if (exclude.includes(node.name)) continue;

      const slug = SlugService.getSlug(node.name);
      
      if (node.kind === 'file') {
        // For files, we usually just want the display name
        // Nextra will use the filename as key
        const displayName = node.name.replace(/\.[^/.]+$/, "");
        meta[slug] = displayName;
      } else {
        // For directories
        meta[slug] = node.name;
      }
    }

    return `export default ${JSON.stringify(meta, null, 2)}`;
  }
}
