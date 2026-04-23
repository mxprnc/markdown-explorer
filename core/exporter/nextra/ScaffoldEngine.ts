import JSZip from 'jszip';
import { Platform } from 'react-native';
import { NextraConfig, FileEntry, ExportNode } from './types';
import { TemplateProvider } from './TemplateProvider';
import { SlugService } from './SlugService';
import { AssetTransformer, AssetMapping } from './AssetTransformer';
import { MetaGenerator } from './MetaGenerator';
import { NEXTRA_FILES } from './NextraConstants';

export class ScaffoldEngine {
  private zip: JSZip;
  private config: NextraConfig;

  constructor(config: NextraConfig) {
    this.zip = new JSZip();
    this.config = config;
  }

  /**
   * Initializes the ZIP with basic Nextra scaffolding files
   */
  public async initScaffold(): Promise<void> {
    // Add base config files
    this.zip.file(NEXTRA_FILES.PACKAGE_JSON, TemplateProvider.getPackageJson(this.config));
    this.zip.file(NEXTRA_FILES.NEXT_CONFIG, TemplateProvider.getNextConfig());
    this.zip.file(NEXTRA_FILES.THEME_CONFIG, TemplateProvider.getThemeConfig(this.config));
    this.zip.file(NEXTRA_FILES.TS_CONFIG, TemplateProvider.getTsConfig());
    this.zip.file(NEXTRA_FILES.GITIGNORE, 'node_modules\n.next\nout\n.DS_Store\n');
    
    // Create necessary directories
    this.zip.folder('pages');
    this.zip.folder('public');

    // Add mandatory _app.tsx for Nextra v3
    this.zip.file(NEXTRA_FILES.APP_JS, TemplateProvider.getAppJs());
  }

  /**
   * Adds a file to the ZIP
   */
  public addFile(entry: FileEntry): void {
    this.zip.file(entry.path, entry.content);
  }

  /**
   * Generates the ZIP blob and triggers download
   */
  public async exportAsZip(filename: string = 'nextra-export.zip'): Promise<Blob> {
    const content = await this.zip.generateAsync({ type: 'blob' });
    
    if (Platform.OS === 'web') {
      // Dynamic import to avoid crash on native platforms
      try {
        const { saveAs } = await import('file-saver');
        saveAs(content, filename);
      } catch (e) {
        console.error('Failed to load file-saver:', e);
      }
    } else {
      console.warn('ZIP export is only supported on Web/Desktop platforms.');
    }
    
    return content;
  }

  /**
   * Returns the internal JSZip instance for advanced operations
   */
  public getZipInstance(): JSZip {
    return this.zip;
  }

  /**
   * Transforms markdown content and adds it to the ZIP, while collecting assets
   * @param filename Original filename
   * @param content Original markdown content
   * @param relativeDir Relative directory path in the pages folder (e.g., 'docs/sub')
   * @returns List of assets that need to be collected
   */
  public async transformAndAddMarkdown(
    filename: string,
    content: string,
    relativeDir: string = ''
  ): Promise<AssetMapping[]> {
    const slug = SlugService.getSlug(filename);
    const transformer = new AssetTransformer();
    
    const { content: transformedContent, assets } = await transformer.transform(content, slug);
    
    // Determine target path in the ZIP (usually inside 'pages/')
    const extension = this.config.exportOptions.convertToMdx ? 'mdx' : 'md';
    const zipPath = `pages/${relativeDir ? relativeDir + '/' : ''}${slug}.${extension}`;
    
    this.zip.file(zipPath, transformedContent);
    
    return assets;
  }

  /**
   * Adds _meta.js to a directory in the ZIP
   * @param relativeDir Relative directory path in the pages folder
   * @param nodes Sibling nodes to include in the meta data
   */
  public addMetaJson(relativeDir: string, nodes: ExportNode[]): void {
    const content = MetaGenerator.generate(nodes);
    const zipPath = `pages/${relativeDir ? relativeDir + '/' : ''}${NEXTRA_FILES.META_JS}`;
    this.zip.file(zipPath, content);
  }
}
