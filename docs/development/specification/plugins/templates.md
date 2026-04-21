# Plugin Specification: Templates Plugin

템플릿 플러그인은 사용자가 정의한 마크다운 서식을 재사용 가능하게 관리하고 에디터에 삽입하는 기능을 제공합니다.

## 📁 파일 시스템 저장 구조

- **경로**: `_mark-explorer/templates/`
- **파일명 규칙**: `*.md`
- **구조 설계 의도**: 
    - 언더바(`_`) 접두사를 사용하여 시스템 폴더임을 나타냄.
    - 파일 탐색기에서 항상 최상단에 위치하여 사용자가 직접 마크다운 파일을 관리하기 쉽게 함.
    - 숨김 폴더(`.`) 사용 시 발생할 수 있는 운영체제별 숨김 속성 및 접근성 문제를 해결.

## 🏗 주요 컴포넌트

### 1. TemplatesPlugin (`plugins/templates/TemplatesPlugin.ts`)
- **역할**: 플러그인 생명주기 관리 및 코어 API 연동.
- **주요 기능**:
    - `onload`: `_mark-explorer/templates` 폴더 자동 생성 및 사이드바 뷰 등록.
    - `insertTemplate`: 파일 내용을 읽어 변수 치환 후 에디터에 삽입.
    - `deleteTemplate`: 템플릿 파일 삭제.
    - `processVariables`: `{{date}}`, `{{time}}`, `{{title}}` 등 동적 변수 처리.

### 2. TemplateListView (`components/plugins/TemplateListView.tsx`)
- **역할**: 사이드바에 표시되는 전용 UI.
- **기능**:
    - 실시간 템플릿 목록 렌더링 (`vault:changed` 이벤트 기반).
    - 템플릿 검색 및 필터링.
    - 신규 생성(Create), 삽입(Insert), 편집(Edit), 삭제(Delete) 버튼 제공.
    - 행 클릭 시 편집 모드로 전환.

## 🔄 데이터 흐름

1. **로딩**: 플러그인이 로드되면 `Vault` API를 통해 폴더 존재 여부를 확인하고 목록을 가져옵니다.
2. **이벤트 구독**: `app.on('vault:changed')`를 통해 파일 시스템 변화를 감지하여 UI를 동기화합니다.
3. **삽입**: 에디터 삽입 시 `app.emit('editor:insert-text', content)` 이벤트를 발생시켜 현재 활성화된 에디터에 텍스트를 전달합니다.

## 💡 개발 및 유지보수 가이드
- 템플릿 폴더 경로 수정 시 `TemplatesPlugin`과 `TemplateListView` 내의 `templatesFolder` 상수를 동시에 수정해야 합니다.
- 변수 치환 로직 확장은 `processVariables` 메서드 내에서 수행합니다.
