# 에디터 모드 복구 및 익스플로러 안정화 계획 (PLAN13.md)

에디터 에러 해결과 익스플로러 모드 안정화를 위한 단계별 계획입니다.

---

## 🛠 단계별 구현 계획

### 1단계: SaveShortcut 확장 기능 복구
- `components/Editor.web.tsx` 파일 내부에 `SaveShortcut` 확장 기능을 정의.
- `onSave` 프롭을 통해 저장을 트리거하는 로직 포함.

### 2단계: useMarkdownWorker 로직 개선
- `hooks/useMarkdownWorker.ts`에서 새 파싱 요청 시 `setHast(null)`을 호출하는 부분을 주석 처리하거나 제거.
- 이렇게 하면 워커가 작업을 마칠 때까지 화면에는 이전 내용이 유지되어 깜빡임이 사라짐.

### 3단계: MarkdownPreview 폴백 조건 강화
- `MarkdownPreview.web.tsx`에서 `hast`가 없을 때만 `ReactMarkdown`을 보여주도록 되어 있는데, `hast`가 계속 유지되므로 자연스럽게 `ReactMarkdown`으로의 전환(플리커)이 발생하지 않게 됨.

### 4단계: 통합 테스트
- 에디터 모드로 전환이 잘 되는지 확인.
- 익스플로러 모드에서 수정 시 영상 카드가 깜빡이지 않는지 최종 확인.
