# Jest 단위 및 컴포넌트 테스트 설정 가이드

이 문서는 Jest를 사용한 단위 테스트(Unit Test), 커스텀 훅 테스트(Hook Test), 컴포넌트 테스트(Component Test) 환경의 설정 상세와 사용법을 설명합니다.

---

## ⚙️ 주요 설정 (`jest.config.js`)

프로젝트 루트의 `jest.config.js` 파일에서 다음과 같은 핵심 설정을 관리합니다.

- **프리셋**: `jest-expo` (Expo 및 React Native 환경에 최적화된 설정 제공)
- **테스트 매칭**: `**/__tests__/**/*.test.[jt]s?(x)`
  - 소스 코드 디렉토리 내의 `__tests__` 폴더에 위치한 `.test.ts`, `.test.tsx` 파일을 자동으로 찾아 실행합니다.
- **트랜스파일러**: `babel-jest` (Babel 설정을 사용하여 TypeScript 및 JSX 변환)
- **Transform Ignore Patterns**: ESM 기반의 라이브러리(Tiptap, Markdown 관련 패키지 등)가 Jest에서 정상적으로 변환되도록 화이트리스트가 구성되어 있습니다.
- **커버리지 수집**:
  - `utils/`, `hooks/`, `components/` 디렉토리를 대상으로 합니다.
  - 실행 시 `coverage/` 디렉토리에 상세 리포트가 생성됩니다.

---

## 📁 디렉토리 구조 및 명명 규칙

- **위치**: 테스트 대상 파일과 동일한 디렉토리 내의 `__tests__` 폴더
- **파일 이름**: `{TargetName}.test.ts` 또는 `{TargetName}.test.tsx`

예시:
```text
utils/
  MarkdownUtils.ts
  __tests__/
    MarkdownUtils.test.ts
```

---

## 🛠️ 테스트 실행 방법

### 1. 전체 테스트 실행
모든 Jest 테스트를 실행하고 커버리지 보고서를 생성합니다.
```bash
npm test
```

### 2. 특정 파일 실행
특정 경로의 테스트 파일만 실행합니다.
```bash
npm test utils/__tests__/MarkdownUtils.test.ts
```

### 3. 감시(Watch) 모드
파일 변경을 감지하여 관련 테스트를 자동으로 재실행합니다.
```bash
npm test -- --watch
```

---

## 📝 테스트 작성 가이드라인

1. **Pure Function Logic**: 복잡한 비즈니스 로직은 `utils`로 분리하여 UI 의존성 없이 순수하게 검증합니다.
2. **Mocking**: 
   - `jest.mock()`을 사용하여 외부 모듈이나 브라우저 전용 API를 모킹합니다.
   - 특히 `expo-constants`, `expo-file-system` 등 네이티브 모듈 의존성이 있는 경우 필수입니다.
3. **Asynchronous Tests**: 비동기 로직은 `async/await`와 `findBy*` 쿼리를 사용하여 안정적으로 검증합니다.
4. **Coverage**: 새로운 유틸리티나 훅을 추가할 때는 높은 테스트 커버리지를 유지하도록 권장합니다.
