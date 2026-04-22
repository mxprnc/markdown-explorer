# Mark Explorer: AI-Powered Markdown Sidekick

Mark Explorer는 로컬 마크다운 파일을 지능적으로 탐색하고, 현대적인 UI에서 실시간으로 편집하며 관리할 수 있는 도구입니다. Tiptap 에디터 기술을 활용하여 직관적인 실시간 마크다운 편집 경험을 제공합니다.

## ✨ 주요 기능

- **Live Markdown Editor**: Tiptap(ProseMirror) 엔진 기반의 반-WYSIWYG 마크다운 편집 환경.
- **Precision Navigation**: `getBoundingClientRect`와 `coordsAtPos`를 기반으로 한 픽셀 단위 정밀 목차 이동.
- **Multi-pane Workspace**: 최대 2x2 분할 레이아웃과 탭 드래그 앤 드롭을 지원하는 유연한 작업 공간.
- **Intelligent TOC**: 코드 블록 내의 주석을 구분하여 실제 의미 있는 헤딩만 추출하는 스마트 목차 시스템.
- **Offline-First Resource**: IndexedDB 캐싱과 브라우저 Native File System API를 통한 강력한 로컬 파일 관리.
- **Rich Media**: 수식(KaTeX), 다이어그램(Mermaid), 코드 하이라이팅(Prism) 완벽 지원.
- **Plugin-based Template System**: `.mark-explorer/templates/` 폴더의 파일을 활용한 동적 변수 치환 및 템플릿 삽입 확장 시스템.
- **Robust Markdown Processing**: 헤딩 정규화, 링크 이스케이프 복구 등 다양한 렌더링 예외를 처리하는 마크다운 전처리 시스템.

## 🛠 Tech Stack

- **Framework**: React Native (Expo SDK 52) / React Native Web
- **Editor Engine**: Tiptap (ProseMirror Wrapper)
- **Markdown Parser**: react-markdown (rehype/remark ecosystem)
- **Background Computing**: Web Worker (Worker Threads)
- **Design System**: Vanilla CSS with Design Tokens (`index.css`)

## 🚀 시작하기

### 개발 환경 구축
```bash
# 의존성 설치
npm install

# 웹 서비스 실행 (localhost:8081)
npm run web
```

### 테스트 가이드

#### 1. 단위 및 통합 테스트 (Jest)
```bash
# 전체 테스트 실행
npm test

# 특정 테스트 파일 실행 (예: 마크다운 유틸리티)
npm test utils/__tests__/MarkdownUtils.test.ts
npm test utils/__tests__/FileSystemUtils.test.ts

# 테스트 감시 모드 (변경 시 자동 재실행)
npm test -- --watch
```

#### 2. E2E 테스트 (Playwright)
```bash
# 모든 E2E 테스트 실행
npm run test:e2e

# 특정 컴포넌트 테스트 파일만 실행 (예: TOC 패널)
npx playwright test tests/e2e/toc-basic.spec.ts

# 특정 브라우저 엔진에서만 실행 (chromium, firefox, webkit)
npx playwright test tests/e2e/explorer-basic.spec.ts --project=chromium

# UI 모드로 실행 (테스트 과정을 시각적으로 확인 및 디버깅)
npm run test:e2e:ui

# 마지막 테스트 결과 리포트 보기
npx playwright show-report
# (Tip: 포트 충돌 시 npx playwright show-report --port 9324 처럼 다른 포트 지정 가능)
```

### 테스트 구조
- `utils/__tests__/`: 유틸리티 함수(FileSystemUtils, MarkdownUtils 등)에 대한 단위 테스트.
- `hooks/__tests__/`: 커스텀 훅(useFileSystem, useMarkdownWorker 등)의 로직 테스트.
- `components/**/__tests__/`: 각 UI 컴포넌트의 렌더링 및 인터랙션 테스트.
- `tests/e2e/`: 전체 서비스 흐름을 검증하는 End-to-End 테스트 (Playwright).

## 📖 문서 시스템

이 프로젝트는 AI 작업 효율과 개발 일관성을 위해 단계별 명세 시스템을 운영 중입니다.

1. **[GEMINI.md](./GEMINI.md)**: 프로젝트의 전체 기획 방향성과 코딩 가이드라인 (AI 메인 허브).
2. **[Component Specification](./docs/development/specification/components/overview.md)**: 각 핵심 컴포넌트의 동작 방식 및 스크롤 로직 상세 설명.
3. **[Architecture: Editor Engine](./docs/development/specification/architecture/editor-engine.md)**: Tiptap 및 ProseMirror 채택 배경과 활용 전략.

## ⚠️ 주의 사항 (Troubleshooting)

### 브라우저 확장 프로그램 충돌
DeepL, YouTube Summary 등 실시간 페이지 분석 확장 프로그램과 충돌할 수 있습니다. `SecurityError`가 발생하거나 에디터가 느려진다면 **시크릿 모드**에서 실행하거나 `localhost:8081`을 예외 처리해 주십시오.

### 알려진 이슈 (Known Issues)
- **템플릿 단축키 (Mac OS)**: `Option + T` (템플릿 삽입) 단축키가 Mac OS 자판 특성 및 이벤트 전파 간섭으로 인해 특정 상황에서만 작동할 수 있습니다. 대안으로 커맨드 팔레트나 UI 버튼 도입을 검토 중입니다. 상세 내용은 [Issue 문서](./docs/product/errors/open-template---shortcut-error/issue-20260421.md)를 참조하십시오.
    
---

> [!TIP]
> 새로운 AI 세션에서 작업을 시작할 때는 최상단 루트의 `GEMINI.md`를 가장 먼저 읽도록 유도하십시오. 프로젝트의 맥락을 즉시 파악할 수 있습니다.
