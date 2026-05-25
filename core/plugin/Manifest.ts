/**
 * 플러그인의 정적 정보를 정의하는 인터페이스입니다.
 * 모든 플러그인은 manifest.json 파일을 가지거나 이 인터페이스를 준수해야 합니다.
 */
export interface PluginManifest {
  /** 플러그인의 고유 식별자 (예: 'gemini-chat') */
  id: string;
  /** 사용자에게 표시될 플러그인 이름 */
  name: string;
  /** 플러그인 설명 */
  description: string;
  /** 개발자 이름 */
  author: string;
  /** 플러그인 버전 (Semantic Versioning) */
  version: string;
  /** 이 플러그인이 작동하기 위해 필요한 최소 앱 버전 */
  minAppVersion?: string;
  /** 플러그인의 유형 (기능용 'functional' 또는 테마용 'theme') */
  type?: 'functional' | 'theme';
}
