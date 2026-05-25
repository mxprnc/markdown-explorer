# PLAN: Nextra Export 기능 이슈 해결 계획 (FIX-PLAN1)

이 계획은 `FileSystemItem`과 `ExportNode` 간의 호환성 문제를 해결하고, 전체 디렉터리 구조를 올바르게 내보내도록 수정하는 단계를 포함합니다.

## 🛠 Phase 1: 데이터 구조 및 타입 정렬
1. **타입 수정 (`core/exporter/nextra/types.ts`)**
   - `ExportNode` 인터페이스의 `type` 속성을 `kind`로 변경하거나, `kind`와 `type`을 모두 지원하도록 수정하여 `FileSystemItem`과의 호환성 확보.
   - 가능하면 `FileSystemItem`의 구조를 그대로 따르도록 통일.

2. **UI 레이어 확인 (`app/index.tsx`)**
   - `onExportToNextra` 호출 시 전달되는 객체가 최신 상태의 `children`을 포함하고 있는지 확인.
   - 필요한 경우, 내보내기 직전에 해당 디렉터리를 재귀적으로 스캔하여 전체 트리를 완성하는 로직 검토.

## 🛠 Phase 2: Exporter 핵심 로직 수정
1. **트래버스 로직 수정 (`core/exporter/nextra/ExportService.ts`)**
   - `traverse` 함수 내에서 `node.type` 대신 `node.kind`를 참조하도록 수정.
   - `depth` 계산 및 `relativeDir` 생성 로직이 중첩된 폴더 구조에서도 올바르게 작동하는지 검증.

2. **메타데이터 생성기 수정 (`core/exporter/nextra/MetaGenerator.ts`)**
   - `generate` 함수 내에서 `node.type` 대신 `node.kind`를 참조하도록 수정.

3. **Slug 생성 로직 개선 (`core/exporter/nextra/SlugService.ts`)**
   - 한글 등 Non-Latin 파일명의 경우 `slugify`가 빈 문자열을 반환하는 문제 해결.
   - 빈 문자열 반환 시 원본 파일명을 활용하거나 유니크한 ID를 부여하는 폴백(Fallback) 로직 추가.

4. **마크다운 외 파일 처리**
   - 현재 무시되고 있는 비 마크다운 파일(예: `.ipynb`)에 대한 처리 방안 구현 (단순 복사 또는 자산으로 분류).

## 🛠 Phase 3: 검증 및 테스트
1. **샘플 데이터 테스트**
   - `temp/sample_directory/lecture-note-fc-langgraph`를 대상으로 추출 수행.
   - 생성된 ZIP 파일 내 `pages/` 폴더에 모든 마크다운 파일이 포함되었는지 확인.
   - `_meta.js` 내용이 파일 목록과 일치하는지 확인.

2. **Nextra 실행 테스트**
   - 추출된 파일을 `temp/v2` 등에 풀고 `npm install && npm run dev`를 통해 실제 브라우저에서 메뉴와 내용이 잘 보이는지 확인.

## 📅 일정
- **Phase 1**: 2026-04-22 (즉시)
- **Phase 2**: 2026-04-22 (즉시)
- **Phase 3**: 2026-04-22 (즉시)
