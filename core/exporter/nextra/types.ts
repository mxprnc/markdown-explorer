export interface NextraProjectInfo {
  title: string;
  github?: string;
  footer?: string;
}

export interface NextraThemeConfig {
  preset: string;
  customColor: { h: number; s: number; l: number };
  useCustom: boolean;
  darkMode: 'system' | 'dark' | 'light';
}

export interface NextraExportOptions {
  convertToMdx: boolean;
  sortOrder: 'explorer' | 'alphabetical';
  includeAssets: boolean;
  imageStrategy: 'slugified-colocation';
}

export interface NextraConfig {
  projectInfo: NextraProjectInfo;
  theme: NextraThemeConfig;
  exportOptions: NextraExportOptions;
}

export interface FileEntry {
  path: string; // Relative path within the ZIP (e.g., 'pages/index.mdx')
  content: string | Uint8Array;
}

export interface ExportNode {
  name: string;
  kind: 'file' | 'directory';
  path?: string; // Original path in the workspace
  children?: ExportNode[];
  originalPath?: string; // Optional original path (for backward compatibility or explicit override)
}
