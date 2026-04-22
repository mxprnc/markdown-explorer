# UI Component E2E Test Plan

이 계획은 공통 UI 컴포넌트(`QuickPicker`, `Collapsible`, `Button`)의 기능을 검증하기 위한 상세 시나리오를 포함합니다.

## 1. 테스트 준비 (Preparation)
- **Shortcut Hook**: `Option + T` 단축키를 시뮬레이션하여 `QuickPicker`(템플릿 피커)를 호출.
- **Mock Plugins**: 템플릿 플러그인이 로드된 상태에서 아이템 리스트가 존재하는지 확인.
- **TestID 주입**: 
  - `QuickPicker` 내부의 Input, List Item 등에 `testID` 추가 필요.
  - `Collapsible`의 헤딩 및 컨텐츠 영역에 `testID` 추가 필요.

## 2. 테스트 시나리오 (Scenarios)

### Phase 1: QuickPicker 인터랙션 검증
- [x] **Scenario 1.1**: `Option + T` 입력 시 템플릿 피커 모달이 화면 중앙에 나타나는가? (완료 - E2E Hook으로 검증)
- [x] **Scenario 1.2**: 검색창에 "YouTube" 입력 시 관련 템플릿만 필터링되어 노출되는가? (완료)
- [x] **Scenario 1.3**: 첫 번째 아이템을 클릭했을 때 모달이 닫히고 에디터에 템플릿이 삽입되는가? (완료)
- [x] **Scenario 1.4**: 오버레이 영역을 클릭했을 때 모달이 닫히는가? (완료)

### Phase 2: Collapsible 동작 검증
- [x] **Scenario 2.1**: 설정 모달 내의 Collapsible 클릭 시 하위 내용이 노출/은닉되는가? (완료)
- [x] **Scenario 2.2**: 펼침 상태에 따라 아이콘의 회전 각도가 변경되는가? (완료)

### Phase 3: Button 공통 속성 검증
- [x] **Scenario 3.1**: `disabled` 상태의 버튼 클릭 시 바인딩된 함수가 호출되지 않는가? (완료)
- [x] **Scenario 3.2**: 마우스 호버 시 배경색이 미세하게 변경되는가? (완료)

## 3. 실행 계획
1. `QuickPicker.tsx`, `Collapsible.tsx`에 E2E용 `testID` 추가.
2. `tests/e2e/ui-basic.spec.ts` 파일 생성.
3. 단축키 시뮬레이션(`page.keyboard.press('Alt+t')`)을 통한 피커 테스트 수행.
4. 테스트 결과를 `docs/plan/e2e-test/ui/GOAL1.md`에 업데이트.
