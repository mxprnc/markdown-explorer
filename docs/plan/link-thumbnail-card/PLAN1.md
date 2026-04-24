# 링크 썸네일/카드 보기 구현 계획 (PLAN-1.md)

링크 프리뷰 기능을 구현하기 위한 기술적 단계와 고려 사항을 정리합니다.

---

## 🛠 단계별 구현 계획

### 1단계: 메타데이터 추출 엔진 개발
- **YouTube 전용 핸들러**: 
    - 정규식을 통한 비디오 ID 추출.
    - `https://img.youtube.com/vi/{ID}/mqdefault.jpg` 등을 이용한 즉시 이미지 로드.
- **범용 웹사이트 핸들러**:
    - HTML의 `<meta property="og:image">`, `<meta property="og:title">` 등 파싱.
    - **CORS 대응**: 브라우저 환경에서는 직접 fetch가 불가능하므로 CORS Proxy 또는 데스크탑 메인 프로세스(Electron) 활용.

### 2단계: 에디터 연동 및 커스텀 노드 구현
- **Custom Node/Decorator**: 에디터 내에서 특정 패턴의 링크를 감지하여 썸네일 컴포넌트로 렌더링.
- **Interaction**: 링크 클릭 또는 호버 시 모드 전환(Thumbnail/Link/Text)을 위한 팝업 UI 표시.
- **State Management**: 선택된 모드를 마크다운 문법(`[marxplorer-thumbnail#{alt}](url)` 등)으로 직렬화(Serialize)하여 저장.

### 3단계: 성능 최적화 및 캐싱
- **IndexedDB 캐시**: 한 번 로드된 메타데이터는 로컬에 저장하여 재방문 시 즉시 렌더링.
- **Intersection Observer**: 뷰포트에 들어오는 링크만 우선적으로 메타데이터를 fetch하도록 지연 로드(Lazy Loading) 적용.

## ⚠️ 기술적 고려 사항
- **보안**: 외부 사이트에서 가져온 HTML을 파싱할 때 XSS 방지를 위한 Sanitization 필수.
- **네트워크**: 오프라인 상태이거나 네트워크가 느릴 때 사용자 경험이 저해되지 않도록 스켈레톤 UI(Skeleton UI) 제공.
- **확장성**: 향후 oEmbed 프로토콜을 도입하여 Twitter, Instagram 등 더 많은 서비스 지원 검토.
