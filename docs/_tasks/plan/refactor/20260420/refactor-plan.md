# Refactoring Plan - 2026-04-20

이 문서는 `docs/rules/coding-style.md`에 정의된 코딩 스타일 가이드를 기반으로 현재 코드베이스를 리팩토링하기 위한 상세 계획을 담고 있습니다.

## 1. 개요
현재 `app/index.tsx`는 약 2,600라인에 달하는 거대 컴포넌트로, 파일 시스템 로직, 상태 관리, UI 렌더링, 리사이징 로직 등이 모두 혼재되어 있습니다. 이를 가이드라인에 따라 모듈화하고 관심사를 분리하여 유지보수성을 높이는 것이 목적입니다.

---

## 2. 주요 작업 항목

### 📂 A. 디렉터리 구조 및 명명 규칙 준수 (Rule 4, 5)
- **컴포넌트 계층화**: `components/` 디렉터리를 기능 단위로 재구성합니다.
  - `components/explorer/`: 파일 트리, 아이템, 컨텍스트 메뉴 등.
  - `components/editor/`: 에디터 영역, 탭 바, 프리뷰 영역 등.
  - `components/layout/`: 스플릿 뷰 컨테이너, 리사이저 등.
  - `components/ui/`: 공통으로 사용되는 버튼, 입력창, 모달 등 (Wrapper Components 적용).
- **파일명 변경**: kebab-case로 작성된 컴포넌트 파일들을 **PascalCase**로 변경합니다.
  - `external-link.tsx` -> `ExternalLink.tsx`
  - `themed-text.tsx` -> `ThemedText.tsx` 등

### 🪝 B. 관심사 분리 및 커스텀 훅 추출 (Rule 6, 7)
- **Monolithic Component 분해**: `app/index.tsx`의 비즈니스 로직을 커스텀 훅으로 추출합니다.
  - `useFileSystem`: 파일 읽기/쓰기, 생성, 삭제, 이름 변경 로직.
  - `usePaneResize`: 화면 분할 및 패널 크기 조절 로직 (`PanResponder` 관련).
  - `useGemini`: Gemini API 연동 및 OAuth 인증 로직.
  - `useSettings`: 테마 설정, API 키 관리 등 사용자 설정 로직.

### 🎨 C. 스타일 및 디자인 시스템 (Rule 10, 9)
- **Design Tokens 전역화**: `constants/` 내에 `Theme.ts`, `Spacing.ts`, `Colors.ts` 등 디자인 토큰을 정의합니다.
- **StyleSheet 활용**: 컴포넌트 내의 인라인 스타일을 `StyleSheet.create`로 분리하고, 사전에 정의된 토큰을 사용하여 일관성을 유지합니다.

### 🛠 D. 순수 함수 및 유틸리티화 (Rule 1, 2)
- **Pure Logic 분리**: UI나 상태에 의존하지 않는 파일 경로 처리, 데이터 변환 로직 등을 `utils/` 폴더로 분리하여 테스트 가능성을 높입니다.
- **중복 제거 (DRY)**: 탭 관리 로직 등 Pane 1과 Pane 2에서 반복되는 코드를 추상화하여 하나로 관리합니다.

### ⚠️ E. 에러 처리 및 안정성 (Rule 12)
- **비동기 예외 처리**: 모든 파일 시스템 및 API 호출 로직에 `try-catch`와 `finally`를 적용하여 로딩 및 에러 상태를 사용자에게 명확히 알립니다.

---

## 3. 단계별 실행 계획

### [Phase 1] 인프라 및 기반 다지기
1. `constants/` 및 `utils/` 기본 파일 구성.
2. 기존 kebab-case 파일들 PascalCase로 리네임 및 임포트 경로 수정.
3. 공통 UI 컴포넌트(`Button`, `Modal`, `Input`)를 `components/ui/`로 추출.

### [Phase 2] 로직 분리 (Hooks)
1. `app/index.tsx`에서 파일 시스템 관련 상태와 함수를 `useFileSystem`으로 이동.
2. 리사이징 로직을 `usePaneResize`로 이동.
3. Gemini 및 인증 관련 로직을 `useGemini`로 이동.

### [Phase 3] 컴포넌트 분해 (View)
1. `FileExplorer` 컴포넌트 분리 (`components/explorer/`).
2. `EditorWorkspace` 컴포넌트 분리 (`components/editor/`).
3. `GeminiDashboard` 컴포넌트 분리 (`components/ui/` 또는 `components/gemini/`).

### [Phase 4] 마무리 및 테스트
1. `StyleSheet` 적용 및 인라인 스타일 제거.
2. 시맨틱 태그(`nav`, `main`, `section`) 적용 여부 검토 (Rule 11).
3. 단위 테스트 작성 및 코드 안정성 검증.

---

## 4. 기대 효과
- **가독성 향상**: `app/index.tsx`의 코드 양이 현격히 줄어들어 전체 구조 파악이 용이해집니다.
- **재사용성 증대**: 독립적인 훅과 컴포넌트 사용으로 다른 기능 구현 시 재활용이 가능합니다.
- **테스트 용이성**: 순수 함수와 비즈니스 로직이 분리되어 독립적인 유닛 테스트가 가능해집니다.
