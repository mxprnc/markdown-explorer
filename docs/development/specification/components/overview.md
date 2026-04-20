# Component Specification: Mark Explorer (v1.0)

이 문서는 AI 어시스턴트 및 개발자가 프로젝트의 핵심 아키텍처와 컴포넌트 간 상호작용을 빠르게 파악하여, 새로운 세션 시작 시 스캐닝 오버헤드를 최소화하기 위해 작성되었습니다.

## 🏗 프로젝트 아키텍처 개요

프로젝트는 **React Native (Expo)** 기반이지만, 강력한 데스크탑/웹 경험을 위해 **Web 전용 컴포넌트(.web.tsx)**를 적극 활용합니다.

- **전역 상태**: `contexts/` 내의 Theme, Settings 컨텍스트 사용.
- **파일 시스템**: `useFileSystem.ts` 커스텀 훅을 통해 IndexedDB(브라우저 캐시) 및 Native File System API 연동.
- **비속기 처리**: `useMarkdownWorker.ts`를 통해 무거운 마크다운 파싱 작업을 Web Worker에서 병렬 처리.
- **플러그인 시스템**: `PluginManager`를 통해 기능 모듈의 동적 로드 및 생명주기 관리.
- **AI 도구 연동**: `MCPClient`를 통해 외부 MCP 서버와 연동하여 AI 모델에 도구(Tools) 제공.

## 🏗 아키텍처 및 코어 엔진

- **메인 에디터 엔진**: **Tiptap (ProseMirror 기반)**
    - 선택 사유 및 상세 동작 방식은 [editor-engine.md](../architecture/editor-engine.md)를 참고하십시오.
- **플러그인 및 MCP 아키텍처**:
    - 설계 상세는 [plugin-system.md](../architecture/plugin-system.md)를 참고하십시오.

## 📁 주요 컴포넌트 구조

### 1. Editor (`components/Editor.web.tsx`)
- **기반**: Tiptap Editor
- **확장 로직**: `StarterKit` 기반에 마크다운 기능을 입힌 `Live Markdown` 방식.
- **헤딩 이동 (핵심)**:
    - 외부(`TOCPane`)에서 전달받은 `index`와 `text`를 사용하여 이동.
    - **Proximity Match 엔진**: `findBestHeadingMatch`를 사용하여 코드 내 주석 등으로 인해 목차 인덱스가 밀려도 가장 적절한 헤딩 텍스트를 찾아냄.
    - **좌표 계산**: `editor.view.coordsAtPos(pos)`를 통한 픽셀 단위 정밀 추출.
    - **이동 오프셋**: 상단 UI 가려짐 방지를 위해 `150px` 여백 보정.

### 2. Preview (`components/Preview.web.tsx`)
- **기반**: `react-markdown`
- **렌더링**:
    - `SyntaxHighlighter`로 코드 블록 문법 강조.
    - `mermaid`를 통해 다이어그램 렌더링 (Worker에서 파싱된 결과물 활용).
- **헤딩 이동**:
    - `getBoundingClientRect()`를 통해 실제 DOM 위치 계산 후 컨테이너 스크롤.
    - 에디터와 동일한 `findBestHeadingMatch` 로직 공유.

### 3. EditorWorkspace (`components/editor/EditorWorkspace.tsx`)
- **역할**: 멀티 패인(Pane) 레이아웃 엔진.
- **특이사항**: 가로/세로 분할 레이아웃 및 탭 드래그 앤 드롭을 지원하며, 각 패인의 에디터/뷰어 Ref를 부모(`app/index.tsx`)와 연결하는 가로다리 역할.

### 4. TOCPane (`components/toc/TOCPane.tsx`)
- **역할**: 마크다운 본문에서 목차를 실시간 추출 및 표시.
- **추출 규칙**: `utils/MarkdownUtils.ts`의 `extractTOC` 사용.
    - **Regex**: `^ {0,3}#{1,6}\s+` (3칸 이내 들여쓰기된 헤딩만 인정하여 코드 주석 제외).

## 🛠 주요 유틸리티 경로 (루트 기준)

- **`utils/MarkdownUtils.ts`**: 목차 추출 및 헤딩 근접 매칭 로직.
- **`utils/FileSystemUtils.ts`**: 파일 경로 처리 및 확장자 유효성 검사.
- **`hooks/useMarkdownWorker.ts`**: 마크다운 파싱을 위한 백그라운드 Worker 관리.

## 💡 AI 가이드라인 (새 세션 작업 시)
1. **플랫폼 구분**: Web 기능 수정 시 반드시 `.web.tsx` 파일을 먼저 찾으십시오.
2. **스크롤 이슈**: 제목 가려짐이나 이동 오류 시 `scrollToHeading` 내의 `150px` 오프셋과 `findBestHeadingMatch` 로직을 가장 먼저 점검하십시오.
3. **경로 주의**: 모든 코드 수정 및 문서 작성 시 절대 경로가 아닌 **프로젝트 루트 기준 상대 경로**를 사용하십시오.
4. **스타일**: `ThemeContext`를 통해 제공되는 색상 토큰을 준수하고, `index.css`에 정의된 디자인 시스템을 따르십시오.
