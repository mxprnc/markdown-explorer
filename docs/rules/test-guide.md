# Mark Explorer: Test Guide

이 문서는 Mark Explorer 프로젝트의 테스트 전략, 도구 사용법 및 코드 기여 시 준수해야 할 테스트 권장사항을 정의합니다.

---

## 🎯 테스트 원칙

1.  **순수 함수 우선 (Pure Functions First)**: 로직이 복잡할수록 UI와 분리하여 `utils`에 순수 함수로 작성하고, 이에 대한 단위 테스트를 반드시 수행합니다.
2.  **사용자 중심 테스트**: 구현 세부 사항보다는 사용자의 액션에 따른 결과(예: 버튼 클릭 시 파일이 삭제되는지)를 검증하는 데 집중합니다.
3.  **격리 (Isolation)**: 각 테스트는 독립적이어야 하며, 다른 테스트의 결과에 영향을 받지 않아야 합니다.

---

## 🛠️ 테스트 환경 및 도구

-   **Test Runner**: Jest (Unit/Hook/Component), Playwright (E2E)
-   **Preset**: `jest-expo` (Expo 및 React Native 환경 최적화)
-   **Transpiler**: `babel-jest` (Babel 설정을 기반으로 TypeScript 변환)

> [!NOTE]
> 상세 설정은 [Jest 설정 가이드](../test-settings/jest.md) 및 [Playwright 설정 가이드](../test-settings/playwright.md)를 참조하십시오.

---

## 📁 파일 구조 및 명명 규칙

-   **위치**: 테스트 대상 파일과 동일한 디렉토리 내의 `__tests__` 폴더에 위치시킵니다.
-   **명명 규칙**: `{FileName}.test.ts` 또는 `{FileName}.test.tsx`
    -   예: `utils/FileSystemUtils.ts` -> `utils/__tests__/FileSystemUtils.test.ts`

---

## 💡 테스트 레이어별 권장사항

### 1. 단위 테스트 (Unit Tests)
-   **대상**: `utils/`, 상수 계산 로직 등.
    -   경로 처리, 문자열 파싱, 데이터 변환 로직은 100% 커버리지를 지향합니다.
-   **작성 가이드**:
    ```typescript
    describe('FileSystemUtils', () => {
      it('should correctly join path parts', () => {
        expect(joinPaths('folder', 'file.md')).toBe('folder/file.md');
      });
    });
    ```

### 2. 커스텀 훅 테스트 (Hook Tests)
-   **대상**: `hooks/` (useFileSystem, useGemini 등).
-   **도구**: `@testing-library/react-hooks` (필요 시 추가 설치)
-   **권장사항**: 브라우저 API(FileSystem Access API)나 외부 서비스(AI SDK)는 적극적으로 **Mocking**하여 비동기 로직의 성공/실패 케이스를 검증합니다.

### 3. 컴포넌트 테스트 (Component Tests)
-   **대상**: `components/`
-   **도구**: `react-test-renderer` 또는 `@testing-library/react-native`
-   **권장사항**: 
    -   핵심 사용자 인터랙션(탭 전환, 모달 열기)을 검증합니다.
    -   `Snapshot Testing`은 UI가 자주 변하는 초기 단계에서는 지양하고, 안정화된 이후 회귀 테스트 용도로 사용합니다.

### 4. E2E 테스트 (E2E Tests)
-   **대상**: 전체 애플리케이션 흐름 (파일 열기 -> 편집 -> 저장 -> 탭 이동 등).
-   **도구**: Playwright
-   **위치**: `tests/e2e/`
-   **권장사항**: 
    -   실제 브라우저 환경에서 사용자 시나리오를 처음부터 끝까지 검증합니다.
    -   테스트 실행 시 자동으로 개발 서버(`npm run web`)가 기동되도록 설정되어 있습니다.
    -   복잡한 인터랙션(드래그 앤 드롭 등)의 회귀 방지를 위해 필수적으로 작성합니다.

---

## 🚀 실행 및 모니터링

### 명령어
-   `npm test`: 전체 Jest 테스트 실행 및 커버리지 보고서 생성.
-   `npm test -- --watch`: 개발 중 실시간 Jest 테스트 피드백 확인.
-   `npm run test:e2e`: Playwright E2E 테스트 실행.
-   `npm run test:e2e:ui`: 시각적 디버깅을 위한 Playwright UI 모드 실행.

### CI/CD 가이드 (추후 적용)
-   모든 Pull Request는 테스트가 100% 통과해야 Merge가 가능함을 원칙으로 합니다.
-   커버리지가 이전에 비해 낮아질 경우 경고를 표시하도록 대시보드를 구성할 권장사항이 있습니다.

---

> [!TIP]
> 테스트 작성 시 "무엇을 테스트해야 할지" 모르겠다면, **가장 버그가 자주 발생하거나 사용자에게 가장 치명적인 로직**부터 시작하세요.
