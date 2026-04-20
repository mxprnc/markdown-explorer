# Plan: VSCode-Style Tab System Implementation

## 🏗 아키텍처 변경 및 상태 관리 전략

### 1. 탭 상태 구조 고도화 (`app/index.tsx`)
현재 `openedFiles: string[]` 구조를 다음과 같이 확장하여 프리뷰 상태를 관리합니다.
- **Option A**: `openedFiles: { path: string, isPinned: boolean }[]` 형태로 데이터 구조 변경.
- **Option B (선택)**: 기존 `openedFiles`는 유지하되, 패인별로 `previewFile: string | null` 상태를 추가 관리. (하위 호환성 유지 및 로직 단순화에 유리)
    - 클릭 이벤트 발생 시 `previewFile`을 업데이트.
    - 더블 클릭이나 편집 발생 시 해당 파일을 `openedFiles`에 추가하고 `previewFile`은 초기화.

### 2. 탐색기 인터랙션 분기 (`components/explorer/FileItem.tsx`)
- **Single Click**: `onSelectFile(path, isPreview: true)` 호출.
- **Double Click**: `onSelectFile(path, isPreview: false)` 호출.
- **로직 처리**: `setTimeout`을 활용하여 더블 클릭 시 싱글 클릭 로직이 중복 수행되지 않도록 최적화.

## 🛠 컴포넌트별 상세 구현 계획

### 3. TabBar 고도화 (`components/layout/TabBar.tsx`)
- **스타일 적용**: `previewFile`과 일치하는 탭인 경우 `fontStyle: 'italic'` 처리.
- **컨텍스트 메뉴 연동**: 탭 아이템 우클릭 시 호출될 `showTabContextMenu` 함수 구현.
- **기능 구현**:
    - `Pin`: 현재 프리뷰 파일을 영구 탭 리스트(`openedFiles`)로 이동.
    - `Close Others`: 리스트에서 현재 인덱스를 제외한 모든 요소 제거.
    - `Copy Relative Path`: `navigator.clipboard.writeText` 활용.

### 4. Tab 컨텍스트 메뉴 UI (`components/ui/ContextMenu.tsx` 확장)
- 기존 파일용 컨텍스트 메뉴를 재활용하거나, 탭 전용 메뉴 아이템 구성을 위한 전용 모드 추가.
- `Reveal in Finder`: 웹 환경에서는 직접 지원이 어려우므로, 데스크탑 모드(Electron 환경)인 경우에만 활성화되도록 분기 처리.

## 📅 실행 단계별 마인스톤

### Phase 1: 상태 및 인터랙션 기초 (1~2일)
- [x] `previewFile` 상태 관리 로직 추가.
- [x] 탐색기 내 단일/더블 클릭 이벤트 분기 처리.
- [x] 프리뷰 탭의 이탤릭 스타일 적용.

### Phase 2: 탭 관리 기능 (2~3일)
- [x] 탭 우클릭 감지 및 기본 컨텍스트 메뉴(Close, Pin) 연동.
- [x] 'Close Others', 'Close All' 등 벌크 액션 로직 구현.
- [x] 편집 시작 시(`onChange`) 프리뷰 탭이 자동으로 영구 탭으로 전환되는 로직 추가.

### Phase 3: 폴리싱 및 가외 기능 (1~2일)
- [x] 'Copy Relative Path' 및 'Reveal in Finder' 구현.
- [x] 탭이 많아질 경우 프리뷰 탭이 항상 가시 영역에 있도록 스크롤 보정.

## ⚠️ 기술적 고려사항
- **성능**: 탭이 빈번하게 전환되므로 에디터의 불필요한 리렌더링 방지(`React.memo` 활용).
- **사용성**: 더블 클릭 속도가 사용자마다 다르므로 적절한 `doubleClickTimeout` 설정 필요 (일반적으로 300ms).
