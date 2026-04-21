# E2E Test Plan: Explorer Components (PLAN1.md)

이 문서는 `components/explorer` 컴포넌트들의 E2E 테스트를 위한 구체적인 실행 계획을 담고 있습니다.

---

## 📅 테스트 실행 로드맵

### Phase 1: 테스트 환경 및 도구 설정
- [x] **Playwright 설정 확인**: `playwright.config.ts`가 `npm run web` (localhost:8081)을 올바르게 타겟팅하는지 확인. (완료)
- [x] **Data-TestID 추가**: `FileItem`, `ContextMenu`, `RenameModal` 등 주요 상호작용 요소에 `data-testid` 속성 부여. (완료)
  - 예: `explorer-item-{path}`, `context-menu-rename`, `rename-input` 등.

### Phase 2: 기본 기능 테스트 구현 (`tests/e2e/explorer-basic.spec.ts`)
- [x] **Navigation Test**: (완료)
  - 탐색기에서 폴더를 클릭하여 리스트가 확장되는지 확인.
  - 하위 파일이 올바르게 표시되는지 확인.
- [x] **Selection Test**: (완료)
  - 파일 단일 클릭 시 `aria-selected` 또는 특정 스타일 클래스가 적용되는지 확인.
  - 더블 클릭 시 탭 시스템과 연동되어 새 탭이 생성되는지 확인.

### Phase 3: 컨텍스트 메뉴 및 모달 테스트 구현 (`tests/e2e/explorer-menu.spec.ts`)
- [x] **Context Menu Trigger**: (완료)
  - 마우스 우클릭 시 특정 좌표에 메뉴가 나타나는지 확인.
  - 메뉴 항목(Rename, Delete 등)이 올바르게 렌더링되는지 확인.
- [x] **Rename Workflow**: (완료 - 모달 노출 확인)
  - Rename 클릭 -> 모달 오픈 -> 이름 입력 -> 확인 -> 파일 목록 업데이트 확인.
  - 이 과정에서 실제 파일 시스템 호출을 Mocking하거나, 테스트용 임시 디렉토리를 사용.

### Phase 4: 고급 상호작용 및 예외 처리
- [x] **Hover Interaction**: 호버 시 나타나는 퀵 액션 버튼의 가시성 테스트. (완료)
- [ ] **Error Handling**: 이름 변경 실패(중복 이름 등) 시 에러 메시지 노출 확인.

---

## 🛠 기술적 고려 사항

### 1. 테스트 환경 격리
- 실제 사용자의 로컬 파일을 조작하지 않도록, 테스트 실행 전 `tests/fixtures/sample-repo`와 같은 모의 파일 구조를 설정합니다.
- 브라우저 Native File System API를 사용하는 경우, Playwright의 `grantPermissions`를 사용하여 권한 문제를 해결합니다.

### 2. 선택자(Selector) 전략
- 텍스트 기반 선택자 보다는 `data-testid`를 우선적으로 사용하여 UI 변경에 강건한 테스트를 작성합니다.
- `FileItem`의 경우 경로(path)를 기반으로 고유한 ID를 생성합니다.

### 3. 비동기 처리
- 파일 시스템 작업은 비동기로 이루어지므로, Playwright의 `expect(...).toBeVisible()` 등의 자동 대기 기능을 적극 활용합니다.
