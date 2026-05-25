# 링크 썸네일/카드 보기 구현 계획 (PLAN-1.md)

링크 프리뷰 기능을 구현하기 위한 기술적 단계와 고려 사항을 정리합니다.

---

## 🛠 단계별 구현 계획

### 1단계: URL 감지 및 메타데이터 엔진
- **URL 감지 로직**:
    - `http://` 또는 `https://`로 시작하고 공백(Whitespace) 전까지의 문자열을 캡처하는 Regex 적용.
    - 에디터 내 `paste` 이벤트 또는 실시간 입력 시 해당 패턴을 감지하여 `URL 노드`로 자동 변환.
- **YouTube 전용 핸들러**: 
    - 비디오 ID 추출 후 `https://img.youtube.com/vi/{ID}/mqdefault.jpg` 등을 이용한 즉시 이미지 로드.
- **범용 웹사이트 핸들러**:
    - OG 태그 파싱 (CORS Proxy 또는 Electron 메인 프로세스 활용).

### 2단계: 에디터 노드 및 타입 전환 UI
- **URL Node 구현**:
    - 마우스 오버 시 우측 상단에 `Type Selector`(Plain, Link, Thumb 아이콘) 노출.
    - 선택된 타입에 따라 노드의 렌더링 방식 및 저장 문법 실시간 변경.
- **Link Type Hover Menu**:
    - 링크 위 호버 시 말풍선 형태의 메뉴 표시.
    - 구성: `원본 URL 주소`, `복사 아이콘`, `편집 버튼`.
- **Edit Popup**:
    - 편집 클릭 시 `페이지 또는 URL`과 `링크 제목(alt text)` 입력 필드가 포함된 팝업 표시.
    - 제목 수정 시 내부적으로 `mx-link#` 접두사를 유지하도록 로직 구현.
- **State Management**: 선택된 모드를 마크다운 문법(`[mx-thumb#{alt}](url)` 등)으로 직렬화(Serialize)하여 저장.

### 3단계: 성능 최적화 및 캐싱
- **IndexedDB 캐시**: 한 번 로드된 메타데이터는 로컬에 저장하여 재방문 시 즉시 렌더링.
- **Intersection Observer**: 뷰포트에 들어오는 링크만 우선적으로 메타데이터를 fetch하도록 지연 로드(Lazy Loading) 적용.

## ⚠️ 기술적 고려 사항
- **보안**: 외부 사이트에서 가져온 HTML을 파싱할 때 XSS 방지를 위한 Sanitization 필수.
- **네트워크**: 오프라인 상태이거나 네트워크가 느릴 때 사용자 경험이 저해되지 않도록 스켈레톤 UI(Skeleton UI) 제공.
- **확장성**: 향후 oEmbed 프로토콜을 도입하여 Twitter, Instagram 등 더 많은 서비스 지원 검토.
