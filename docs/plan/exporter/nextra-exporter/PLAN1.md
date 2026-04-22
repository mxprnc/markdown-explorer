# Nextra Export Implementation Plan (PLAN1.md)

이 문서는 `export-to-nextra.md` 명세를 바탕으로 한 **Phase 1: ZIP 기반 스캐폴딩 내보내기**의 단계별 구현 계획을 정의합니다.

## 📅 전체 일정 및 단계 (Phase 1)

### 1단계: 프로젝트 기초 및 스캐폴딩 엔진 (Scaffold Foundation)
*   **목표**: 정적 파일 및 기본 폴더 구조를 ZIP으로 생성하는 기반 마련.
*   **세부 작업**:
    *   `JSZip` 및 `FileSaver.js` 의존성 추가 및 유틸리티 구성.
    *   `TemplateProvider`: `package.json`, `next.config.js`, `theme.config.tsx` 등 고정 템플릿 파일 정의.
    *   `ScaffoldEngine` 초기화: 가상 파일 시스템(Virtual FS) 구축 로직 구현.

### 2단계: 마크다운 변환 엔진 (Transformation Engine)
*   **목표**: `Unified/Remark`를 활용한 지능형 마크다운 변환 로직 구현.
*   **세부 작업**:
    *   `AssetTransformer`: 이미지 노드 탐색 및 경로 치환 Remark 플러그인 구현.
    *   `SlugService`: 파일명 및 폴더명을 위한 Slug 생성 로직 (`slugify` 활용).
    *   파일별 자산 수집기(Collector): 원본 경로와 타겟 경로를 매핑하는 데이터 구조 설계.

### 3단계: 네비게이션 및 깊이 제어 (Meta & Guard)
*   **목표**: Nextra의 핵심인 `_meta.json` 생성 및 계층 구조 안정화.
*   **세부 작업**:
    *   `MetaGenerator`: 현재 파일 탐색기의 정렬 순서를 반영한 `_meta.json` 생성기 구현.
    *   `DepthGuard`: 재귀적 탐색 시 계층 깊이를 체크하고 임계치(Level 5) 초과 시 방어 로직 실행.
    *   `img/` 폴더 숨김 처리 로직 반영.

### 4단계: 설정 마법사 UI (Wizard Implementation)
*   **목표**: 사용자 친화적인 3단계 설정 환경 구축.
*   **세부 작업**:
    *   `WizardStore`: Zustand를 활용한 설정 상태 관리 (Steps 1~3).
    *   `Step 1 (Identity)`: 기본 정보 입력 폼 구현.
    *   `Step 2 (Theming)`: 테마 프리셋 카드 및 HSL 슬라이더 UI 구현.
    *   `Live Preview Lite`: CSS Variables를 활용한 테마 실시간 미리보기 연동.
    *   `Step 3 (Options)`: 내보내기 상세 옵션 체크박스 및 경고 메시지 UI.

### 5단계: 통합 및 검증 (Integration & QA)
*   **목표**: 전체 모듈을 연결하고 실제 Nextra 구동 확인.
*   **세부 작업**:
    *   마법사 완료 버튼과 `ScaffoldEngine` 연결.
    *   생성된 ZIP 파일을 로컬 `next dev` 환경에서 실행하여 렌더링 및 이미지 로드 확인.
    *   E2E 테스트 코드를 통한 내보내기 무결성 검증.

---

## 🛠 주요 마일스톤
1.  **M1**: 기본 ZIP 생성 및 다운로드 성공 (헬로월드 수준의 Nextra 프로젝트).
2.  **M2**: 이미지 경로가 자동 치환된 마크다운 내보내기 성공.
3.  **M3**: 테마 프리셋이 적용된 전체 프로젝트 패키징 완료.
