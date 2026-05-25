# Playwright E2E 테스트 설정 가이드

이 문서는 Playwright를 사용한 End-to-End (E2E) 테스트 환경의 설정 상세와 사용법을 설명합니다.

---

## ⚙️ 주요 설정 (`playwright.config.ts`)

프로젝트 루트의 `playwright.config.ts` 파일에서 다음과 같은 핵심 설정을 관리합니다.

- **테스트 디렉토리**: `./tests/e2e`
- **대상 브라우저**: Chromium, Firefox, WebKit (Safari)
- **Base URL**: `http://localhost:8081` (Expo Web 기본 포트)
- **자동 서버 실행**: `webServer` 옵션을 통해 테스트 실행 시 `npm run web`을 자동으로 시작합니다.
- **디버깅 도구**:
  - `trace`: 실패 시 첫 번째 재시도에서 트레이스를 기록합니다.
  - `video`: 실패 시 비디오를 보관합니다.

---

## 📁 디렉토리 구조

- `tests/e2e/`: 실제 시나리오 테스트 파일 (`*.spec.ts`)
- `tests/fixtures/`: 테스트에 사용될 마크다운 파일, 이미지 등 정적 리소스
- `tests/support/`:
  - `commands.ts`: 공통으로 사용되는 커스텀 명령어
  - `pom/`: Page Object Model 클래스들 (에디터, 사이드바 등 컴포넌트별 추상화)

---

## 🛠️ 테스트 실행 방법

### 1. 헤드리스 모드 (CI/기본)
모든 브라우저에서 백그라운드로 테스트를 수행합니다.
```bash
npm run test:e2e
```

### 2. UI 모드 (권장)
시각적인 대시보드를 통해 단계별 실행 과정, DOM 상태, 로그를 실시간으로 확인하며 개발할 수 있습니다.
```bash
npm run test:e2e:ui
```

### 3. 디버그 모드
Playwright Inspector를 열어 한 줄씩 코드를 실행하며 디버깅합니다.
```bash
npm run test:e2e:debug
```

---

## 📝 테스트 작성 가이드라인

1. **Isolation**: 각 테스트는 `await page.goto('/')`로 시작하여 독립적인 상태에서 출발해야 합니다.
2. **Locators**: `id`나 `data-testid` 보다는 사용자 중심의 로케이터(`getByRole`, `getByText`, `getByLabel`)를 우선 사용합니다.
3. **Wait**: `page.waitForTimeout()` 사용을 지양하고, Playwright의 자동 대기(Auto-waiting) 기능을 신뢰하거나 특정 요소의 상태를 기다리는 API를 사용합니다.
4. **Clean up**: 테스트 중 생성된 임시 파일이나 상태는 테스트 종료 후 원복되도록 작성합니다.
