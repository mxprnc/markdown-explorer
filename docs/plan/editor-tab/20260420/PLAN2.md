# 탭 관리 고도화 실행 계획 (PLAN2.md)

탭 순서 변경 및 Pane 간 이동을 위한 기술적 구현 단계입니다.

## 📅 실행 단계별 마일스톤

### Phase 1: 드롭 핸들러 인프라 구축
- [x] `TabBar.tsx`에 `onDragOver`, `onDrop` 이벤트 핸들러 구현.
- [x] 드롭 시 드래그 중인 탭 정보(`file`, `sourcePane`)와 대상 위치 정보를 수집하는 로직 작성.

### Phase 2: Pane 간 이동 로직 구현 (app/index.tsx)
- [x] `moveTab(file, fromPane, toPane, newIndex)` 함수 구현 (handleDropTab으로 명명됨).
- [x] `openedFiles`와 `openedFiles2` 상태를 동적으로 교체하는 로직 연동.
- [x] 프리뷰 탭(`previewFile1`, `previewFile2`)이 이동할 경우 영구 탭으로 전환할지 여부 결정 및 처리.

### Phase 3: 시각적 피드백 보강 (UX)
- [x] 탭 바 내 드래그 중인 위치에 삽입 표시기(Line indicator) 표시.
- [x] 드래그 중인 탭의 고스트 이미지(Ghost image) 스타일 개선.
- [x] 애니메이션 효과를 추가하여 탭 이동 시의 자연스러운 움직임 구현.

### Phase 4: 안정성 및 예외 처리
- [x] 분할 창이 꺼져 있는 상태에서의 드롭 처리 방안 수립.
- [x] 동일 파일이 양쪽 Pane에 중복으로 존재하는 경우의 처리 로직 점검.
- [ ] **(지연)** 빈 Pane 드롭 시나리오 대응 ([이슈 상세](../../../product/errors/split-view---editor-tab-drag-drop/issue-20260420.md))

## ⚠️ 기술적 고려사항
- 웹 브라우저의 Native Drag & Drop API를 최대한 활용하여 성능 최적화.
- `react-native-web`의 `View` 및 `Pressable`과 Native 이벤트 간의 호환성 유지.
- 탭 이동 시 에디터 인스턴스의 `key` 값이 바뀌어 내용이 초기화되지 않도록 주의.
