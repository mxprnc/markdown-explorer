# Mark Explorer: Future Optimization Goals

이 문서는 현재 리팩토링된 구조를 바탕으로, 향후 프로젝트가 더 크고 복합적인 환경으로 성장하기 위해 추진해야 할 최적화 방향성을 정의합니다.

---

## 1. 상태 관리 아키텍처 최적화 (State Management)

### 현재 상태
- `App` 컴포넌트에서 대부분의 상태를 관리하고 하위 컴포넌트로 전달하는 Prop Drilling 방식.

### 지향점
- **Context API 도입**: 테마, 사용자 설정 등 전역적으로 공유되는 상태를 Context로 분리하여 컴포넌트 간 결합도를 낮춤.
- **Zustand 또는 전역 상태 라이브러리 검토**: 복잡한 파일 시스템 상태나 에디터 상태를 효율적으로 관리하고, 필요한 컴포넌트만 구독(Subscription)하여 리렌더링 최적화 수행.

---

## 2. 컴포넌트 설계 고도화 (Component Design)

### 지향점
- **Atomic Design 패턴 도입**: 컴포넌트를 Atom(기본 버튼, 입력창), Molecule(검색창), Organism(사이드바) 단위로 세분화하여 UI 일관성 유지.
- **디자인 토큰(Design Tokens) 강화**: 현재의 `colors` 객체를 CSS Variables 또는 전역 테마 객체로 고도화하여 다크/라이트 모드 대응력을 높임.

---

## 3. 선언적 에러 핸들링 (Error Handling)

### 지향점
- **Error Boundaries 적용**: 컴포넌트 레벨에서 에러를 캡처하여 특정 부분의 에러가 앱 전체의 중단으로 이어지지 않도록 방어.
- **Fall-back UI 디자인**: 에러 발생 시 사용자에게 친절한 안내와 복구 방법(새로고침 등)을 제시하는 UI 컴포넌트 구현.

---

## 4. 테스트 스코프 확장 (Testing Strategy)

### 지향점
- **통합 테스트 (Integration Tests)**: 커스텀 훅(`useFileSystem` 등)과 UI 컴포넌트가 함께 동작하는 시나리오 테스트 추가.
- **E2E 테스트 도입**: `Playwright` 또는 `Cypress`를 활용하여 실제 브라우저 환경에서의 주요 사용자 여정(파일 생성 -> 편집 -> 저장) 검증.
- **시각적 회귀 테스트 (Visual Regression)**: 디자인 변경 시 의도치 않은 UI 깨짐을 방지하기 위한 스냅샷 테스트 강화.

---

## 5. 성능 및 오프라인 경험 (Performance & PWA)

### 지향점
- **PWA (Progressive Web App) 강화**: 오프라인 상태에서도 에디터를 사용할 수 있도록 Service Worker 및 캐싱 전략 고도화.
- **Web Worker 고도화**: 마크다운 파싱뿐만 아니라 검색, 대형 파일 처리 등 무거운 연산을 메인 스레드와 분리하여 차단 없는 UI 유지.

---

> [!IMPORTANT]
> 모든 최적화는 **가독성**과 **단순함**을 유지하는 범위 내에서 점진적으로 진행하는 것을 원칙으로 합니다.
