# 플러그인 시스템 기반 구축 구현 계획 (PLAN-1.md)

애플리케이션의 모듈성을 극대화하기 위한 플러그인 아키텍처 도입 단계별 계획입니다.

## 📅 실행 단계별 마일스톤

### Phase 1: 코어 인터페이스 및 데이터 모델 설계
- [x] `core/plugin/Plugin.ts`: 플러그인 베이스 클래스 및 생명주기 메서드(`onload`, `onunload`) 정의.
- [x] `core/plugin/Manifest.ts`: 플러그인 메타데이터(ID, Name, Version) 타입 정의.
- [x] `core/App.ts`: 플러그인에 노출할 전역 애플리케이션 인터페이스(`Workspace`, `Vault`, `Commands`) 설계.

### Phase 2: Plugin Manager 및 Context 구현
- [x] `PluginManager` 클래스 구현: 플러그인 등록, 활성화/비활성화, 인스턴스 관리 로직.
- [x] `PluginContext`: React 레이어에서 플러그인 상태를 공유하고 UI를 업데이트하기 위한 컨텍스트 구축.
- [ ] 설정(Settings) 페이지와 연동하여 플러그인 목록 표시 및 토글 기능 추가.

### Phase 3: 확장 포인트(Extension Points) 개발
- [x] **Command Registry**: 플러그인이 단축키나 명령어를 등록할 수 있는 중앙 레지스트리 구현.
- [x] **UI Component Slots**: 사이드바(Left/Right) 및 상태바에 플러그인 전용 컴포넌트를 주입할 수 있는 렌더링 영역 확보.
- [x] **Event Bus**: 앱의 주요 이벤트(파일 열림, 저장 등)를 플러그인이 구독할 수 있는 이벤트 시스템 도입.

### Phase 4: 기존 기능의 플러그인 전환 및 MCP PoC
- [x] `GeminiChat` 기능을 `GeminiPlugin`으로 리팩토링하여 새로운 구조 검증.
- [x] **MCP 클라이언트 엔진 구축**: 앱 코어에 MCP 서버와 통신할 수 있는 `MCPClient` 기반 마련.
- [x] **MCP 연동 플러그인 구현**: 외부 MCP 서버 정보를 등록하고 모델에 도구(Tools)를 주입하는 전용 플러그인 제작.
- [x] 플러그인 비활성화 시 관련 UI 및 MCP 연결이 완전히 해제되는지 테스트.

## ⚠️ 기술적 고려사항
- **TypeScript 지원**: 플러그인 개발자가 타입 추론을 완벽하게 지원받을 수 있도록 API 타입을 정교하게 설계해야 함.
- **성능 최적화**: 플러그인 로딩이 앱 시작 속도(TTI)에 미치는 영향을 최소화하기 위해 지연 로딩(Lazy Loading) 검토.
- **Cleanup 철저**: `onunload` 시 등록된 모든 이벤트 리스너와 DOM 요소가 제거되지 않으면 메모리 누수의 원인이 됨.
- **Electron vs Web**: 브라우저 환경(IndexedDB 기반)과 데스크탑 환경(로컬 FS 기반) 모두에서 플러그인 파일 로딩이 가능하도록 추상화 레이어 필요.
