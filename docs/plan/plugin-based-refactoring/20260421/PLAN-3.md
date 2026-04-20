# 템플릿 전용 UI 시스템 구현 계획 (PLAN-3.md)

템플릿 관리의 편의성을 극대화하기 위한 전용 UI 컴포넌트 개발 및 연동 계획입니다.

## 📅 실행 단계별 마일스톤

### Phase 1: 템플릿 리스트 컴포넌트 개발
- [ ] `components/plugins/TemplateListView.tsx`: 템플릿 목록을 렌더링하는 UI 컴포넌트 작성.
- [ ] 각 아이템별 [삽입], [편집] 버튼 레이아웃 설계.

### Phase 2: 사이드바 슬롯 연동 (TemplatesPlugin 확장)
- [ ] `TemplatesPlugin.ts`의 `onload` 시점에 `TemplateListView`를 사이드바 슬롯에 등록.
- [ ] 사이드바 아이콘(예: `document-text-outline`) 및 탭 이름 설정.

### Phase 3: 관리 기능 구현 (Create & Edit)
- [ ] **New Template**: 클릭 시 무제(Untitled) 템플릿 파일을 생성하고 에디터로 즉시 이동하는 로직 구현.
- [ ] **Edit Template**: 기존 템플릿 파일을 워크스페이스의 메인 에디터 탭으로 여는 기능 연동.
- [ ] **Real-time Sync**: `Vault`의 변경 이벤트를 구독하여 파일 시스템 변화 시 리스트 자동 갱신.

### Phase 4: UX 개선 및 폴리싱
- [ ] 템플릿 검색 필드 추가 (템플릿이 많아질 경우 대비).
- [ ] 삭제(Delete) 기능 추가 및 확인 모달 연결.

## ⚠️ 기술적 고려사항
- **컴포넌트 주입**: 코어 아키텍처에서 `addSidebarView`에 전달된 React 컴포넌트를 실제 UI 레이어에서 어떻게 안전하게 렌더링할지 설계 필요.
- **에디터 포커스**: 템플릿 삽입 후 사용자가 바로 입력을 이어갈 수 있도록 에디터 포커스 관리 로직 포함.
