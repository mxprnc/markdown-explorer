# 에디터 및 컨텍스트 안정화 목표 (GOAL10.md)

컴포넌트의 논리적 리렌더링이 물리적인 NodeView 파괴 및 `iframe` 리로드로 이어지는 고리를 끊어, 근본적인 깜빡임 문제를 해결하는 것을 목표로 합니다.

---

## 🎯 핵심 목표

1.  **에디터 설정의 정적화 (Static Editor Configuration)**:
    *   에디터가 매 렌더링마다 새로운 확장 프로그램 배열을 받지 않도록 메모이제이션하여 Tiptap 인스턴스의 안정성 확보.

2.  **컨텍스트 전파 최적화 (Context Propagation Optimization)**:
    *   `ThemeContext`의 값이 매번 새로운 객체로 생성되어 하위 NodeView들이 불필요하게 리렌더링되는 현상 방지.

3.  **기능 중복 제거 및 충돌 방지**:
    *   기존의 `CustomYoutube` 노드와 새로운 `LinkCardExtension`이 동일한 URL을 두고 경쟁하며 발생하는 렌더링 불안정성 해소.

## ✅ 주요 체크리스트

- [ ] **Editor.web.tsx 내 extensions 배열 useMemo 적용**
- [ ] **ThemeContext.Provider value useMemo 적용**
- [ ] **CustomYoutube 확장 프로그램 제거 및 기능 통합 확인**
- [ ] **에디터 업데이트 시 전체 노드 재생성 여부 확인**
