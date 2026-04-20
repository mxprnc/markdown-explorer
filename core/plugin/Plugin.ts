import { App } from '../App';
import { PluginManifest } from './Manifest';

/**
 * 모든 플러그인의 베이스 클래스입니다.
 * Mark Explorer 플러그인을 개발하려면 이 클래스를 상속받아야 합니다.
 */
export abstract class Plugin {
  /** 애플리케이션 인스턴스 */
  protected app: App;
  /** 플러그인 매니페스트 정보 */
  public manifest: PluginManifest;

  constructor(app: App, manifest: PluginManifest) {
    this.app = app;
    this.manifest = manifest;
  }

  /**
   * 플러그인이 로드될 때 호출됩니다.
   * 이벤트 리스너 등록, 명령어 추가, UI 요소 생성 등을 여기서 수행합니다.
   */
  abstract onload(): Promise<void> | void;

  /**
   * 플러그인이 비활성화되거나 언로드될 때 호출됩니다.
   * 메모리 누수를 방지하기 위해 등록된 모든 자원을 해제해야 합니다.
   */
  abstract onunload(): Promise<void> | void;

  /**
   * 플러그인 설정을 저장합니다. (구현 예정)
   */
  async saveData(data: any): Promise<void> {
    // TODO: PluginDataManager를 통해 데이터 저장 구현
  }

  /**
   * 저장된 플러그인 설정을 불러옵니다. (구현 예정)
   */
  async loadData(): Promise<any> {
    // TODO: PluginDataManager를 통해 데이터 로드 구현
    return {};
  }
}
