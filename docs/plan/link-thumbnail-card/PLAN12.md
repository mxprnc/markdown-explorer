# 미리보기 모드 비디오 안정화 계획 (PLAN12.md)

미리보기(익스플로러) 모드의 영상 렌더링을 에디터 수준으로 안정화하기 위한 계획입니다.

---

## 🛠 단계별 구현 계획

### 1단계: PreviewVideoPlayer 컴포넌트 추출
- `MarkdownPreview.web.tsx` 상단에 `PreviewVideoPlayer` 컴포넌트를 정의.
- `youtubeId`와 `isDark`를 프롭으로 받으며, `React.memo`를 통해 프롭이 바뀌지 않으면 리렌더링을 건너뛰도록 함.

### 2단계: 썸네일 폴백 로직 적용
- `PreviewVideoPlayer` 내부에 `relative` 포지션의 컨테이너를 생성.
- `absolute` 포지션으로 `mqdefault` 썸네일을 배치하고 그 위에 `iframe`을 얹음.
- 로딩 중이나 재렌더링 시에도 검은 화면 대신 썸네일이 보이도록 처리.

### 3단계: MarkdownPreview 연동
- `components.a` 렌더러 함수에서 `mx-video` 매칭 시 직접 `iframe`을 반환하던 부분을 `<PreviewVideoPlayer />` 호출로 변경.
- `key` 값으로 `youtubeId`를 사용하여 React가 인스턴스를 유지하도록 가이드.

### 4단계: 리렌더링 사이클 확인
- 문서 내 다른 텍스트를 수정하거나 자동 저장이 발생할 때 영상 영역이 깜빡이지 않는지 최종 확인.
