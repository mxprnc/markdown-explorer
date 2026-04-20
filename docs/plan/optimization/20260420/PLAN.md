# Mark Explorer: Optimization Execution Plan (2026-04-20)

이 문서는 `GOAL.md`에 정의된 최적화 목표를 달성하기 위한 상세 실행 계획입니다.

---

## 🏃 Phase 1: 아키텍처 기반 강화 (상태 관리 및 안정성) [COMPLETED]

### Step 1.1: Context API 도입 (Prop Drilling 해결)
- [x] `contexts/` 디렉토리 신설.
- [x] `ThemeContext`: 시스템 테마 및 사용자 설정 모드 관리.
- [x] `SettingsContext`: Gemini API Key, 모델 설정, 루트 경로 등 전역 설정 관리.
- [x] `App.tsx` 최상위에서 Provider 래핑 및 하위 컴포넌트(`Header`, `GeminiSettingsModal` 등) 의 순수 Prop 제거 및 `useContext` 전환.

### Step 1.2: 선언적 에러 핸들링 구현
- [x] `components/ui/ErrorBoundary.tsx` 구현.
- [x] 메인 에디터 영역 및 AI 채팅 영역에 각각 Error Boundary 적용.
- [x] 예기치 못한 에러 시 상태를 초기화하고 안전하게 복구할 수 있는 "Retry" UI 제공.

---

## 🎨 Phase 2: UI 시스템 및 컴포넌트 정제 [COMPLETED]

### Step 2.1: 디자인 토큰 및 UI 컴포넌트 표준화
- [x] `constants/Theme.ts`를 확장하여 Spacing, Radius, Typography 토큰 정의.
- [x] `components/ui/`에 원자 단위(Atom) 컴포넌트 추출: `Button`, `IconButton`, `Badge`, `Typography`.
- [x] 기존 인라인 스타일을 표준 토큰 기반의 정형화된 스타일로 교체.

### Step 2.2: 컴포넌트 책임 분리 심화
- [x] `EditorWorkspace` 내의 탭 바를 독립적인 `Organism`으로 승격하여 가독성 강화.
- [x] 비즈니스 로직이 섞인 UI 컴포넌트를 Presentational 컴포넌트와 Container 컴포넌트(혹은 커스텀 훅 결합형)로 분리.

---

## 🧪 Phase 3: 테스트 및 품질 보증 [IN PROGRESS]

### Step 3.1: 통합 테스트 및 모킹 전략 수립
- [x] Context 및 Hook 단위 테스트 (`ThemeContext`, `useGemini`) 진행 및 성공.
- [x] UI 컴포넌트 단위 테스트 (`Button`, `Header`) 진행 및 성공.
- [x] `useFileSystem` 훅의 복잡한 로직에 대한 통합 테스트(FileSystem API 모킹) 작성 완료.

### Step 3.2: 시각적 안정성 확보
- [x] 다크/라이트 모드 테마 전환 시 UI 일관성 검증 테스트 작성 완료.

---

## 🚀 Phase 4: 성능 및 사용자 경험 고도화 [IN PROGRESS]

### Step 4.1: 오프라인 및 성능 최적화
- [x] `app.json` 내 PWA 메타데이터(name, themeColor, standalone 등) 보강.
- [x] 마크다운 파서를 Web Worker로 격리하여 타이핑 지연 시간 최소화 (확인 및 적용 완료).

### Step 4.2: 파일 캐싱 전략
- [x] `IndexedDB` 유틸리티 구현 및 `useRecentFiles` 커스텀 훅을 통한 최근 파일 관리 최적화.
- [x] `app/index.tsx` 내 파일 로드 및 저장 시 IndexedDB 캐시 연동 완료.


---

## 📅 일정 알림
- **Phase 1~2**: 리팩토링의 연장선상에서 즉시 진행 가능.
- **Phase 3~4**: 앱 기능 안정화 이후 점진적으로 도입.
