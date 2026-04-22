# Brainstorming: Plugin-based Multi-Exporter System (brainstorming1.md)

이 문서는 "Nextra Export"를 넘어 다양한 블로그/문서 도구(Hugo, Astro, Jekyll 등)를 플러그인 형태로 확장하고, 우클릭 컨텍스트 메뉴에서 즉시 사용할 수 있도록 하는 시스템에 대한 아이디어를 정리합니다.

---

## 💡 핵심 컨셉
사용자가 특정 내보내기 플러그인(예: `mark-explorer-plugin-hugo`)을 설치하면, 별도의 코드 수정 없이 파일 탐색기 우클릭 메뉴에 "Export to Hugo" 항목이 자동으로 추가되고 작동해야 합니다.

## 🏗 아키텍처 제안

### 1. 컨텍스트 메뉴 등록 시스템 (Context Menu API)
플러그인이 탐색기 메뉴에 개입할 수 있는 인터페이스를 제공합니다.
```typescript
// Plugin.onload() 예시
this.app.workspace.registerContextMenuAction({
  id: 'export-hugo',
  label: 'Export to Hugo',
  icon: 'share-outline',
  predicate: (item) => item.kind === 'directory', // 폴더일 때만 표시
  callback: (item) => {
    // 내보내기 로직 또는 전용 설정 모달 실행
    new HugoExportWizard(this.app, item).open();
  }
});
```

### 2. 내보내기 핵심 라이브러리 추상화 (Exporter Core)
Nextra Export 개발 시 사용했던 `ScaffoldEngine`, `AssetTransformer`, `SlugService` 등을 플러그인이 재사용할 수 있도록 Core API로 노출합니다.
- `app.exporter.createZip()`: ZIP 기반 추출 엔진 제공.
- `app.exporter.transformMarkdown()`: 이미지 경로 치환 및 Markdown/MDX 변환 유틸리티 제공.

### 3. 플러그인 전용 설정 위저드 (Plugin Wizard UI)
각 플랫폼마다 필요한 설정(예: Hugo는 BaseURL, Astro는 프레임워크 선택 등)이 다르므로, 플러그인이 커스텀 UI를 제공할 수 있어야 합니다.
- 공통 위저드 프레임워크 제공 (Step 기반 UI).
- 플러그인은 각 Step에 들어갈 React 컴포넌트만 정의하여 등록.

## 🚀 구현 로드맵 (Next Steps)

### Phase 1: Context Menu 확장성 확보
- [ ] `FileExplorer`의 컨텍스트 메뉴 로직을 하드코딩에서 `Registry` 기반으로 전환.
- [ ] `App` 인터페이스에 `registerContextMenuAction` 메서드 추가.

### Phase 2: Exporter Logic 모듈화
- [ ] 현재 `core/exporter/nextra` 아래에 있는 로직 중 범용적인 부분(Asset 처리, Slug 처리)을 `core/exporter/common`으로 이동.
- [ ] 플러그인이 `this.app.vault`를 통해 파일에 접근하고 `JSZip`을 사용할 수 있는 표준 패턴 확립.

### Phase 3: 내보내기 플러그인 예제 제작
- [ ] **Astro Exporter**: Nextra와 유사하지만 파일 구조와 `_meta.js` 대신 Frontmatter를 강조하는 방식.
- [ ] **Hugo Exporter**: TOML/YAML Frontmatter 변환을 지원하는 방식.

## 📝 다음 작업자를 위한 참고 사항 (AI 에이전트 가이드)
- 현재 Nextra Export는 `core/exporter/nextra`에 강하게 결합되어 있습니다.
- 이를 플러그인으로 분리하기 위해서는 `ExportService`가 `App` 인스턴스에 접근하여 실행되는 구조로 바뀌어야 합니다.
- `app/index.tsx`의 `onExportToNextra` 핸들러를 플러그인 명령어 시스템(`app.commands`)으로 통합하는 것이 첫 번째 과제입니다.

---
> **상태**: 💡 아이디어 제안 단계  
> **작성일**: 2026-04-22
