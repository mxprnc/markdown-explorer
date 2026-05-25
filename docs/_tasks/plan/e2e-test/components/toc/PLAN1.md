# TOC Component E2E Test Plan

이 계획은 `TOCPane` 컴포넌트의 기능을 검증하기 위한 단계별 테스트 시나리오를 포함합니다.

## 1. 테스트 준비 (Preparation)
- **Mock 데이터 설계**:
  - `multiple-headings.md`: H1, H2, H3가 골고루 섞인 샘플.
  - `no-headings.md`: 헤딩이 전혀 없는 샘플.
  - `deep-headings.md`: H6까지 깊은 계층을 가진 샘플.
- **E2E Hook 활용**: `page.evaluate`를 통해 `editorContent`를 주입하여 TOC의 변화를 관찰.

## 2. 테스트 시나리오 (Scenarios)

### Phase 1: 기본 렌더링 검증
- [x] **Scenario 1.1**: 문서를 열었을 때 목차 패널(`nativeID="toc-pane"`)이 화면 오른쪽에 노출되는가?
- [x] **Scenario 1.2**: 문서 내의 모든 헤딩 텍스트가 목차 아이템으로 렌더링되는가?
- [x] **Scenario 1.3**: 헤딩이 없을 때 "작성된 헤딩(제목)이 없습니다." 메시지가 표시되는가?

### Phase 2: 계층 구조 및 스타일 검증
- [x] **Scenario 2.1**: H2는 H1보다 더 많은 왼쪽 패딩(`paddingLeft`)을 가지고 있는가?
- [x] **Scenario 2.2**: 레벨에 따라 폰트 크기와 굵기(`fontWeight`)가 다르게 적용되는가?

### Phase 3: 상호작용 및 네비게이션
- [x] **Scenario 3.1**: 목차 아이템 클릭 시 `onTOCClick` 핸들러가 호출되는가? (실제 스크롤 발생 확인)
- [x] **Scenario 3.2**: 에디터에서 헤딩을 새로 추가했을 때 TOC 목록에 즉시 반영되는가?

### Phase 4: UI/UX 안정성
- [x] **Scenario 4.1**: 리사이징 핸들을 드래그했을 때 TOC 패널의 너비가 변경되는가?
- [x] **Scenario 4.2**: 긴 헤딩 텍스트가 있을 때 `numberOfLines={1}` 속성에 의해 말줄임표(...)가 표시되는가?

## 3. 실행 계획
1. `tests/e2e/toc-basic.spec.ts` 파일 생성.
2. `support/e2e-utils.ts`에 TOC 관련 Mock 유틸리티 추가 (필요 시).
3. Chromium 기반으로 1차 검증 후 멀티 브라우저 테스트 수행.
4. 테스트 결과를 `docs/plan/e2e-test/toc/GOAL1.md`에 업데이트.
