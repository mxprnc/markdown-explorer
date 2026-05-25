# Preview Component E2E Test Plan

이 계획은 미리보기 시스템(`Preview`, `ImageViewer`)의 기능을 검증하기 위한 단계별 테스트 시나리오를 포함합니다.

## 1. 테스트 준비 (Preparation)
- **Mock 데이터 설계**:
  - `complex-elements.md`: 표, 수식($$), Mermaid 코드 블록이 포함된 샘플.
  - `media-test.md`: YouTube 링크와 가상 이미지 경로(`![test](./image.png)`) 포함 샘플.
  - `long-doc.md`: 수십 개의 헤딩을 가진 긴 문서.
- **E2E Hook 활용**: 
  - `setEditorContent`를 사용하여 실시간 렌더링 변화 관찰.
  - `setSelectedFile`을 통해 파일 타입(MD vs Image)에 따른 뷰어 전환 테스트.

## 2. 테스트 시나리오 (Scenarios)

### Phase 1: 마크다운 렌더링 검증
- [x] **Scenario 1.1**: 기본적인 텍스트 스타일이 HTML 태그(`<strong>`, `<em>` 등)로 올바르게 렌더링되는가? (완료)
- [x] **Scenario 1.2**: YouTube 링크가 포함되었을 때 `iframe` 요소가 생성되는가? (완료)
- [x] **Scenario 1.3**: Mermaid 블록이 파싱되어 `svg` 다이어그램으로 변환되는가? (완료)

### Phase 2: 이미지 뷰어 인터랙션 검증
- [x] **Scenario 2.1**: 이미지 파일 선택 시 툴바와 이미지 컨테이너가 노출되는가? (완료)
- [x] **Scenario 2.2**: 줌 인(+) 버튼 클릭 시 텍스트가 "150%" 등으로 변경되고 이미지 크기가 커지는가? (완료)
- [x] **Scenario 2.3**: 마우스 드래그 시 이미지의 `transform: translate(...)` 값이 변경되는가? (완료)

### Phase 3: 스크롤 및 동기화 검증
- [x] **Scenario 3.1**: 긴 문서에서 특정 헤딩으로의 스크롤 요청 시 `Preview` 컨테이너의 `scrollTop`이 변경되는가? (완료)
- [x] **Scenario 3.2**: 다크 모드 전환 시 코드 하이라이팅 테마가 변경되는가? (완료)

## 3. 실행 계획
1. `tests/e2e/preview-basic.spec.ts` 파일 생성.
2. `ImageViewer.tsx`와 `Preview.web.tsx`에 필요한 `testID` 추가 (줌 버튼, 이미지 컨테이너 등).
3. `Mermaid` 렌더링은 비동기이므로 `waitForSelector` 등을 활용한 대기 로직 적용.
4. 테스트 결과를 `docs/plan/e2e-test/preview/GOAL1.md`에 업데이트.
