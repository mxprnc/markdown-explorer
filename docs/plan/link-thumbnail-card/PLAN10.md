# 에디터 및 컨텍스트 안정화 계획 (PLAN10.md)

구조적인 리렌더링 원인을 제거하기 위한 계획입니다.

---

## 🛠 단계별 구현 계획

### 1단계: 에디터 확장 프로그램 안정화
- `Editor.web.tsx`에서 `useEditor`에 전달되는 `extensions` 배열을 `useMemo`로 관리.
- `onPasteImage`, `onRenameImage`, `resolveImage` 등 함수 기반 설정을 포함하여 의존성 관리.

### 2단계: 테마 컨텍스트 안정화
- `ThemeContext.Provider`의 `value`를 `{ isDark }` 객체로 넘길 때 `useMemo`를 사용하여 참조 안정성 유지.
- 이를 통해 `isDark`가 실제로 바뀌지 않는 한 하위 컴포넌트들이 리렌더링되지 않도록 함.

### 3단계: 레거시 코드 제거
- `CustomYoutube` 확장을 제거하여 `LinkCardExtension`과 매칭 영역이 겹치지 않게 함.
- `LiveMarkdownExtension`에서 `customYoutube` 관련 처리 로직을 `linkCard` 중심으로 통합.

### 4단계: 최종 검증
- 영상을 재생하거나 다른 파일을 클릭해도 기존의 영상 노드가 깜빡이지 않고 유지되는지 확인.
- `npm run web` 로그에서 불필요한 번들링이나 리로드가 발생하는지 모니터링.
