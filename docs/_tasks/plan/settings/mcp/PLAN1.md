# Playwright E2E 테스트 환경 구축 계획 (PLAN1)

이 문서는 프로젝트에 Playwright를 도입하여 End-to-End (E2E) 테스트 환경을 구축하기 위한 상세 계획을 담고 있습니다. 현재 단계에서는 테스트 코드 작성 없이 **환경 설정(Setup)**에 집중합니다.

---

## 📋 개요
Markdown Explorer 프로젝트의 Web 및 Desktop(Electron) 환경에서의 사용자 시나리오를 검증하기 위해 Playwright를 도입합니다. Playwright는 다중 브라우저 지원과 강력한 디버깅 도구를 제공하여 안정적인 테스트 환경을 구축하는 데 적합합니다.

## 🚀 단계별 실행 계획

### 1. 패키지 설치 및 초기화
Playwright 핵심 패키지와 필요한 브라우저 바이너리를 설치합니다.
- **명령어**:
  ```bash
  npm install -D @playwright/test
  npx playwright install --with-deps
  ```

### 2. 설정 파일 (`playwright.config.ts`) 작성
프로젝트 루트에 Playwright 설정 파일을 생성하여 테스트 동작 방식을 정의합니다.
- **주요 설정 항목**:
  - `testDir`: `./tests/e2e` (E2E 테스트 코드가 위치할 디렉토리)
  - `use`:
    - `baseURL`: `http://localhost:8081` (Expo Web 기본 포트)
    - `trace`: `'on-first-retry'` (실패 시 트레이스 기록)
    - `video`: `'retain-on-failure'` (실패 시 비디오 보관)
  - `projects`: Chromium, Firefox, WebKit 등 주요 브라우저 엔진 설정
  - `webServer`: 테스트 실행 전 Expo 개발 서버를 자동으로 실행하는 설정

### 3. `package.json` 스크립트 추가
테스트 실행을 간편하게 하기 위한 스크립트를 추가합니다.
- **추가할 스크립트**:
  - `"test:e2e"`: `playwright test` (전체 테스트 실행)
  - `"test:e2e:ui"`: `playwright test --ui` (UI 모드로 실행)
  - `"test:e2e:debug"`: `playwright test --debug` (디버그 모드 실행)

### 4. 디렉토리 구조 정의
테스트 관련 파일들을 체계적으로 관리하기 위해 구조를 정의합니다.
- `tests/`
  - `e2e/`: E2E 테스트 파일 (`*.spec.ts`)
  - `fixtures/`: 테스트에 필요한 샘플 데이터 및 마크다운 파일
  - `support/`: 공통 유틸리티 및 Page Object Models (POM)

### 5. Electron 테스트 확장 고려
향후 Electron 앱 환경에서의 테스트를 위해 `playwright-electron` 관련 설정을 검토합니다.

---

## ✅ 완료 기준
1. `devDependencies`에 `@playwright/test`가 포함됨.
2. 루트 디렉토리에 `playwright.config.ts` 파일이 존재함.
3. `npm run test:e2e` 명령어가 정상적으로 동작(테스트 파일이 없어도 엔진 실행 확인)함.
4. `.gitignore`에 Playwright 결과물(`test-results/`, `playwright-report/`)이 추가됨.

---

> [!IMPORTANT]
> 본 계획은 **환경 설정**만을 목표로 하며, 실제 시나리오 테스트 코드는 다음 단계에서 작성합니다.
