# Core Components E2E Test Plan

이 문서는 에디터, 탭 바, AI 채팅 컴포넌트의 E2E 테스트 수행을 위한 상세 절차를 설명합니다.

## 1. 사전 준비 (Instrumentation)
테스트 안정성을 위해 다음 컴포넌트들에 `testID`를 주입합니다.
- **Editor**: CodeMirror 컨테이너 (`editor-container`), 실제 입력 영역 (`editor-input`)
- **TabBar**: 각 탭 아이템 (`tab-item-{path}`), 닫기 버튼 (`tab-close-{path}`), 탭 추가 영역 (`tab-bar-container`)
- **GeminiChat**: 전송 버튼 (`chat-send-btn`), 입력창 (`chat-input`), 메시지 리스트 (`chat-message-list`)

## 2. 테스트 시나리오 (Scenarios)

### Phase 1: Editor & TabBar 통합 인터랙션
- [ ] **Scenario 1.1**: 파일 탐색기에서 파일 A를 클릭하여 탭을 연다.
- [ ] **Scenario 1.2**: 에디터에 특정 텍스트를 입력하고, 미리보기에 즉시 반영되는지 확인한다.
- [ ] **Scenario 1.3**: 파일 B를 클릭하여 새 탭을 열고 내용을 작성한다.
- [ ] **Scenario 1.4**: 다시 파일 A 탭을 클릭했을 때 이전에 입력한 내용이 그대로 유지되어 있는가?
- [ ] **Scenario 1.5**: 탭의 닫기(X) 버튼을 눌렀을 때 탭이 제거되고 적절한 다른 탭이 활성화되는가?

### Phase 2: GeminiChat 기능 검증
- [ ] **Scenario 2.1**: 채팅창에 질문을 입력하고 전송 시 UI에 사용자 메시지가 표시되는가?
- [ ] **Scenario 2.2**: API 응답 대기 중 로딩 인디케이터가 정상적으로 노출되는가?
- [ ] **Scenario 2.3**: General/Archive 모드 스위칭 시 아카이브 전용 입력 필드가 나타나고 사라지는가?

### Phase 3: Layout & Sidebar 인터랙션
- [ ] **Scenario 3.1**: 사이드바의 아이콘 바를 통해 탐색기와 다른 뷰 사이를 전환할 수 있는가?
- [ ] **Scenario 3.2**: 사이드바 너비를 조절했을 때 레이아웃이 붕괴되지 않고 정상적으로 반응하는가? (Resize Handle 테스트)

## 3. 실행 계획
1. 각 컴포넌트(`Editor.web.tsx`, `TabBar.tsx`, `GeminiChat.tsx`) 소스 코드에 `testID` 및 `data-testid` 추가.
2. `tests/e2e/components-basic.spec.ts` 테스트 스크립트 작성.
3. 가상 파일 시스템(Mock FS) 유틸리티를 사용하여 테스트 환경 격리.
4. 테스트 실행 및 리포트 확인:
   ```bash
   npx playwright test tests/e2e/components-basic.spec.ts --project=chromium
   ```

## 4. 리스크 관리
- **CodeMirror 포커스**: Playwright가 CodeMirror 내부의 hidden textarea를 정확히 찾아 클릭하도록 정교한 셀렉터 구성 필요.
- **비동기 상태**: 탭 전환 시 에디터 인스턴스가 다시 렌더링되는데, 이때 내용이 복구되는 시점까지 적절한 `waitFor` 필요.
