import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { Node } from 'unist';

export interface AssetMapping {
  originalPath: string;
  targetPath: string;
}

export interface TransformationResult {
  content: string;
  assets: AssetMapping[];
}

export class AssetTransformer {
  /**
   * Transforms markdown content by updating image paths and collecting assets
   */
  public async transform(
    content: string, 
    slug: string, 
    onAssetFound?: (original: string, target: string) => void
  ): Promise<TransformationResult> {
    const assets: AssetMapping[] = [];
    
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(() => (tree: Node) => {
        let index = 1;
        visit(tree, 'image', (node: any) => {
          const originalPath = node.url;
          
          // Skip external URLs
          if (originalPath.startsWith('http://') || originalPath.startsWith('https://')) {
            return;
          }

          const extension = originalPath.split('.').pop() || 'png';
          // Standardized path: ./img/{slug}/{index}.{ext}
          const targetPath = `./img/${slug}/${index}.${extension}`;
          
          assets.push({ originalPath, targetPath });
          if (onAssetFound) onAssetFound(originalPath, targetPath);
          
          node.url = targetPath;
          index++;
        });
      })
      .use(remarkStringify);

    const result = await processor.process(content);
    
    return {
      content: result.toString(),
      assets
    };
  }
}
