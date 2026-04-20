import { PluginManifest } from './plugin/Manifest';

/**
 * 플러그인이 파일 시스템과 상호작용하기 위한 인터페이스입니다.
 */
export interface Vault {
  /** 파일의 내용을 읽어옵니다. */
  read(path: string): Promise<string>;
  /** 파일에 내용을 씁니다. */
  write(path: string, data: string): Promise<void>;
  /** 파일이나 폴더가 존재하는지 확인합니다. */
  exists(path: string): Promise<boolean>;
  /** 모든 파일 목록을 가져옵니다. */
  getAllFiles(): string[];
  /** 특정 폴더 내의 파일 목록을 가져옵니다. */
  listFiles(path: string): Promise<string[]>;
  /** 폴더를 생성합니다. */
  createFolder(path: string): Promise<void>;
}

/**
 * 앱의 레이아웃 및 탭 상태를 관리하는 인터페이스입니다.
 */
export interface Workspace {
  /** 현재 활성화된 파일 경로를 가져옵니다. */
  getActiveFile(): string | null;
  /** 특정 파일을 에디터에서 엽니다. */
  openFile(path: string, options?: { leaf?: 'left' | 'right' | 'main' }): Promise<void>;
  /** 사이드바에 커스텀 뷰를 추가합니다. */
  addSidebarView(id: string, name: string, icon: string, component: any): void;
  /** 사이드바에서 뷰를 제거합니다. */
  removeSidebarView(id: string): void;
}

/**
 * 전역 명령어를 관리하는 인터페이스입니다.
 */
export interface Commands {
  /** 새로운 명령어를 등록합니다. */
  addCommand(command: { id: string; name: string; callback: () => void }): void;
  /** 명령어를 제거합니다. */
  removeCommand(id: string): void;
}

/**
 * 플러그인에 전달되는 최상위 애플리케이션 인스턴스 인터페이스입니다.
 */
export interface App {
  vault: Vault;
  workspace: Workspace;
  commands: Commands;
  plugins: {
    getPlugin(id: string): any;
  };
  /** 이벤트 버스 접근 */
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}
