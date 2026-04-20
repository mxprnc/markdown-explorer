# Mark Explorer: AI Assistant Dashboard (GEMINI.md)

이 문서는 AI 어시스턴트(Gemini)가 프로젝트의 컨텍스트를 이해하고 가이드라인을 준수하기 위한 메인 허브입니다.

---

## 🚀 프로젝트 기획 및 방향성
**상태**: 📝 기획 중
- **관련 문서**: [where-we-go-v1.md](docs/goals/where-we-go-v1.md)
- **컴포넌트 명세**: [overview.md](docs/development/specification/components/overview.md)
- **제품 명세 (Tabs)**: [editor-tab-system.md](docs/product/editor-tab-system.md)
- **제품 명세 (Explorer)**: [file-explorer-interaction.md](docs/product/file-explorer-interaction.md)
- **제품 명세 (Split View)**: [split-view.md](docs/product/split-view.md)
- **제품 명세 (Plugin)**: [plugin-system.md](docs/product/plugin-system.md)
- **제품 명세 (Template)**: [template-system.md](docs/product/template-system.md)
- **제품 명세 (AI & MCP)**: [ai-integration.md](docs/product/ai-integration.md)
- **핵심 목표**: 사용자 친화적인 로컬 마크다운 탐색 및 편집 환경 제공.

## 🎨 디자인 시스템 및 UX 스타일
**상태**: 🎨 정의 중
- **관련 문서**: [design-ux-style-v1.md](docs/goals/design-ux-style-v1.md)
- **스타일 가이드**: 현대적이고 깔끔한 UI, 다크/라이트 모드 지원, 반응형 레이아웃.

## 🛠 Coding Style 가이드
**상태**: ✅ **기본 가이드라인 수립 완료** (업데이트 중)
- **관련 문서**: [coding-style.md](docs/rules/coding-style.md)
- **핵심 원칙**:
  1. **Modularization & DRY**: 중복 제거 및 모듈화.
  2. **Testability**: 순수 함수 위주의 테스트 가능한 코드.
  3. **Wrapper Components**: 공통 UI의 컴포넌트화.
  4. **Directory Structure**: 도메인/기능 기반 디렉터리 구조.
  5. **Naming Convention**: React 컴포넌트 및 파일명 `PascalCase` 통일.
  6. **Separation of Concerns**: UI, 로직(Utils), 상태(Hooks)의 분리.
  7. **Granularity**: 작고 명확한 책임을 가진 함수 설계.
  8. **Testing Strategy**: 피라미드 구조 및 사용자 중심 테스트.
  9. **Constants & Configuration**: 매직 넘버 제거 및 상수화.
  10. **Styling & Design System**: StyleSheet 활용 및 디자인 토큰화.
  11. **JSX & Semantic DOM**: 시맨틱 태그 및 효율적인 리스트 렌더링.
  12. **Async & Error Handling**: 비동기 예외 처리 및 병렬 실행 최적화.

---

> [!NOTE]
> 이 문서는 프로젝트의 진행 상황에 따라 주기적으로 업데이트됩니다. AI 어시스턴트는 작업을 시작하기 전 항상 이 문서를 참조하여 최신 가이드라인을 확인해야 합니다.
