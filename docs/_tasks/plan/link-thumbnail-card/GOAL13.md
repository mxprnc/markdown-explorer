# 에디터 모드 복구 및 익스플로러 안정화 목표 (GOAL13.md)

에디터 모드 진입 에러를 수정하고, 익스플로러 모드에서 여전히 발생하는 깜빡임의 근본 원인인 데이터 교체 로직을 수정하는 것을 목표로 합니다.

---

## 🎯 핵심 목표

1.  **에디터 렌더링 에러 수정 (SaveShortcut 복구)**:
    *   `Editor.web.tsx`에서 누락된 `SaveShortcut` 확장 기능 정의를 복구하여 컴포넌트 렌더링 실패를 해결.

2.  **익스플로러 데이터 유지 (Old Data Persistence)**:
    *   `useMarkdownWorker`가 새 데이터를 파싱하는 동안 이전 `hast` 트리를 유지하게 하여, 화면이 `ReactMarkdown`으로 잠시 돌아갔다 오는 "깜빡임" 현상을 원천 차단.

3.  **구조적 안정성 확보**:
    *   에디터와 익스플로러 모두에서 컴포넌트가 안정적으로 렌더링되도록 보장.

## ✅ 주요 체크리스트

- [ ] **Editor.web.tsx 내 SaveShortcut 정의 추가**
- [ ] **useMarkdownWorker.ts 내 setHast(null) 제거**
- [ ] **에디터 진입 및 익스플로러 깜빡임 제거 확인**
