# 링크 썸네일/카드 보기 구현 계획 (PLAN2.md) - ✅ 완료

`PLAN1.md`에서 구축한 기초를 바탕으로, Notion 스타일의 프리미엄 UI를 구현하기 위한 상세 단계입니다.

---

## 🛠 단계별 구현 계획

### 1단계: 디자인 시스템 확장 및 스타일 정의
- **상수 정의**: `LinkCardComponent.tsx` 내부에 Glassmorphism 및 테마별 색상 상수를 정의하거나 공통 테마 파일을 활용.
- **폰트 적용**: `JetBrains Mono` (Google Fonts)가 프로젝트에 포함되어 있는지 확인하고, 필요시 fallback(`monospace`) 설정.

### 2단계: LinkCardComponent 리팩토링
- **상태 관리 개선**:
    - `isHovered`, `showMenu`, `isEditing` 상태를 활용한 조건부 렌더링 최적화.
    - `useEffect`를 통한 외부 클릭 감지 및 `Esc` 키 이벤트 핸들러 추가.
- **UI 업그레이드**:
    - 기존 `renderPlain`, `renderLink`, `renderThumb`에 프로젝트 가이드라인에 맞춘 스타일 입히기.
    - **Hover Toolbar**: `absolute` 포지셔닝과 `backdrop-filter` 적용. URL 텍스트는 `overflow: hidden; text-overflow: ellipsis;` 적용.
    - **Edit Popup**: 입력 필드 포커스 스타일, 버튼 그룹 배치 고도화.

### 3단계: 상호작용 및 애니메이션 고도화
- **Hover Bridge 구현**: 마우스가 링크 노드에서 메뉴로 이동하는 영역에 투명한 `div`를 배치하여 `onMouseLeave` 트리거 방지.
- **CSS 애니메이션**: `keyframes`를 사용하여 `@keyframes fadeInScale` 등 정의 후 적용.
- **이벤트 전파 제어**: 버튼 클릭 시 에디터의 다른 이벤트와 충돌하지 않도록 `e.stopPropagation()` 및 `e.preventDefault()` 적절히 사용.

### 4단계: 모바일 및 다크 모드 검증
- **미디어 쿼리**: 화면 너비에 따라 팝업의 너비(`width: 90vw` 등)와 위치 조정.
- **다크 모드 테스트**: 에디터 배경색과 메뉴 배경색의 대비 확인.

---

## ⚠️ 기술적 고려 사항
- **Z-Index 관리**: 에디터의 다른 UI 요소(Floating Menu, Bubble Menu)와 겹치지 않도록 적절한 `z-index` 설정 (100~200 사이).
- **포커스 관리**: 팝업이 열렸을 때 에디터의 타이핑이 의도치 않게 작동하지 않도록 상태 제어.
- **성능**: 잦은 상태 변화가 에디터 전체의 렌더링 성능에 영향을 주지 않는지 모니터링.
