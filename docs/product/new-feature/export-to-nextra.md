# Nextra Export 기능 명세 (export-to-nextra.md)

이 문서는 Mark Explorer 내의 특정 디렉토리를 [Nextra](https://nextra.site/) 기반의 정적 사이트 구조로 내보내는 기능에 대한 기획 및 기술적 고려사항을 정리합니다.

## 🌟 개요
사용자가 작성한 마크다운 문서 꾸러미를 즉시 배포 가능한 현대적인 문서 사이트(Nextra) 형태로 변환하여 공유 및 퍼블리싱의 편의성을 극대화합니다.

## 🛠 주요 기능
1. **컨텍스트 메뉴 통합**: 파일 탐색기에서 디렉토리 우클릭 시 'Export to Nextra' 메뉴 제공.
2. **자동 구조화**: 선택한 디렉토리의 계층 구조를 Nextra의 `pages` 폴더 구조로 자동 변환.
3. **네비게이션 생성**: 폴더 내의 파일 구성을 기반으로 `_meta.json` 파일 자동 생성.
4. **정적 자산 복사**: 문서에 포함된 이미지 및 기타 미디어 파일을 Nextra 프로젝트 내로 이동/복사.

## 🖥 플랫폼별 지원 가능성 및 아키텍처

### 1. Web 환경 (Browser)
*   **지원 방법**: File System Access API를 통한 직접 쓰기 또는 ZIP 다운로드.
*   **고려사항**: 
    *   브라우저 환경에서는 `npm install`이나 `next build`를 직접 실행할 수 없습니다.
    *   따라서 'Export'는 Nextra 프로젝트에 필요한 **소스 코드와 폴더 구조를 생성(Scaffolding)**하는 것에 집중합니다.
    *   사용자가 허용한 디렉토리 권한이 있는 경우, 해당 위치에 즉시 프로젝트 구조를 구성할 수 있습니다.

### 2. Desktop 환경 (App)
*   **지원 방법**: 로컬 쉘(Shell) 명령 실행을 통한 완전한 프로젝트 초기화.
*   **고려사항**:
    *   `npx create-next-app` 등을 백그라운드에서 실행하여 의존성 설치까지 완료된 상태로 제공 가능합니다.
    *   MCP 서버를 활용하여 로컬 개발 서버(`npm run dev`)를 바로 띄워주는 연동이 가능합니다.

## ⚙️ 기술적 고려사항 및 과제

### 1. Meta 데이터 관리 (`_meta.json`)
- Nextra는 파일 이름을 기반으로 사이드바 순서를 결정하는 대신 `_meta.json`을 사용합니다.
- 탐색기에서 설정된 정렬 순서나 파일명을 읽어 자동으로 적절한 `_meta.json`을 생성하는 로직이 필요합니다.

### 2. 링크 및 이미지 경로 변환
- 로컬 마크다운에서의 상대 경로(예: `../images/pic.png`)를 Nextra의 `public` 폴더 구조에 맞게 자동으로 치환해야 합니다.

### 3. 테마 및 설정 템플릿
- 기본적으로 Nextra Docs Theme를 사용하며, `theme.config.jsx`와 `next.config.js`의 기본 템플릿을 제공해야 합니다.
- 프로젝트 이름, 레포지토리 주소 등을 입력받는 간단한 설장 마법사(Wizard) UI가 필요합니다.

### 4. MDX 호환성
- 일반 마크다운(.md)을 MDX(.mdx)로 확장할 수 있는 옵션을 제공하여 Nextra의 리액트 컴포넌트 삽입 기능을 활용할 수 있도록 고려합니다.

## 🛠 1. 설정 마법사 상세 명세 (Wizard Specification)

사용자가 개발 지식 없이도 전문가 수준의 결과물을 얻을 수 있도록 3단계의 사용자 여정을 제공합니다.

### [Step 1] 프로젝트 기본 정보 (Identity)
사용자가 생성할 사이트의 '이름표'를 정의하는 단계입니다.
*   **사이트 제목 (Site Title)**: 상단 네비게이션 바와 브라우저 탭에 표시될 이름. (기본값: 선택한 폴더명)
*   **GitHub 저장소 URL**: Nextra의 'Edit this page' 기능을 활성화하기 위한 주소. (선택 사항)
*   **푸터 문구 (Footer Text)**: 하단 저작권 표시 (예: `© 2024 My Docs`).

### [Step 2] 디자인 및 테마 (Theming & Mood)
*   **테마 모드 선택**:
    *   **프리셋 모드 (Grid View)**: `Next.js`, `Tailwind`, `Ocean` 등 시각적 스와치(Swatch)가 포함된 카드 리스트에서 선택.
    *   **커스텀 모드 (Advanced)**: 컬러 피커를 통해 색상을 선택하고, `Hue`, `Saturation`, `Lightness` 슬라이더로 미세 조정.
*   **로고 설정**: 로고 이미지 업로드 또는 텍스트 로고 사용 선택.
*   **다크 모드 기본값**: (시스템 설정 / 다크 모드 고정 / 라이트 모드 고정) 선택.

### [Step 3] 내보내기 옵션 (Export Configuration)
*   **파일 확장자 전략**: 모든 `.md` 파일을 `.mdx`로 일괄 전환할지 여부 (MDX 컴포넌트 사용을 위해 권장).
*   **네비게이션 정렬 규칙**:
    *   `Explorer 순서`: 현재 Mark Explorer 내에서의 정렬 순서를 `_meta.json`에 반영.
    *   `알파벳 순서`: 파일 이름 기반 자동 정렬.
*   **이미지 처리 전략**:
    *   이미지를 `img/{slugified-filename}/{index}.png` 구조로 자동 재배치.
    *   파일명 슬러그 처리: 소문자화, 특수문자 및 공백을 `-`로 치환, 연속된 대시 방지.
    *   마크다운 내 경로를 상대 경로로 자동 치환.

---

### 💾 내부 데이터 구조 (Configuration Schema)
```json
{
  "projectInfo": {
    "title": "My Awesome Docs",
    "github": "https://github.com/user/repo",
    "footer": "Built with Mark Explorer"
  },
  "theme": {
    "preset": "ocean",
    "customColor": { "h": 210, "s": 80, "l": 50 },
    "useCustom": false,
    "darkMode": "system"
  },
  "exportOptions": {
    "convertToMdx": true,
    "sortOrder": "explorer",
    "includeAssets": true,
    "imageStrategy": "slugified-colocation"
  }
}
```

### 💡 Live Preview Lite
마법사 화면 우측에 실제 사이트의 상단바와 사이드바 형태를 본뜬 미니 미리보기를 배치하여, 테마 선택 시 Primary Color가 실시간으로 변하는 시각적 피드백 제공.

## 🛠 2. 참조 경로 및 자산 자동 치환 로직 상세 설계

원본 마크다운의 파손 없이 Nextra 환경에 최적화된 경로로 자산을 재구성합니다.

### 1) 처리 워크플로우 (Flow)
1.  **스캔(Scanning)**: 파일 내 모든 이미지 태그(`![]()`, `<img>`) 식별.
2.  **슬러그 생성(Slugification)**: 마크다운 파일명을 기반으로 소문자/대시 조합의 폴더명 생성.
3.  **자산 복사 및 이름 변경(Collection & Renaming)**: `img/{slugified-filename}/{index}.{ext}` 구조로 복사.
4.  **본문 업데이트(Content Update)**: 마크다운 내 경로를 `./img/...` 상대 경로로 치환.

### 2) 세부 규칙 및 Edge Case
*   **중복 이미지**: 한 문서 내 동일 이미지 재사용 시 기존 부여된 번호를 재사용하여 용량 절약.
*   **외부 URL**: `http(s)://` 시작 경로는 치환 대상에서 제외.
*   **_meta.json 처리**: `img/` 폴더가 사이드바에 노출되지 않도록 `_meta.json`에서 제외하거나 `display: hidden` 처리.

## 🛡 3. 계층 구조 깊이 제한 (Directory Depth Guard)

사이드바 네비게이션의 가독성 및 기술적 안정성을 위해 계층 깊이를 제한합니다.

### 1) 제한 기준 및 로직
*   **최대 깊이**: **5단계 (Level 5)** 권장.
*   **사전 검사 (Pre-scan)**: 내보내기 시작 전 계층 구조를 분석하여 임계치 초과 여부 확인.
*   **방어 로직**: `depth > 5`인 디렉토리 및 파일은 스캔 대상에서 제외하여 사이드바 복잡도 방지.

### 2) 사용자 안내 및 옵션
*   **알림 메시지**: *"주의: 5단계를 초과하는 하위 폴더가 발견되었습니다. 사이드바 UX를 위해 해당 폴더는 내보내기에서 제외됩니다."*
*   **처리 옵션**:
    *   **Skip (기본)**: 깊은 계층 무시.
    *   **Flatten**: 초과된 계층의 파일들을 5단계 폴더로 모아서 계층 평탄화.

## 🛠 4. 기술 스택 및 구현 아키텍처

### 1) 기술 스택 (Tech Stack)
*   **패키징 및 저장**: `JSZip`, `FileSaver.js`
*   **마크다운 변환**: `Unified`, `Remark` 생태계 (`remark-parse`, `remark-stringify`, `remark-gfm`)
*   **유틸리티**: `slugify` (URL 안전 파일명 생성), `Zustand` (마법사 상태 관리)

### 2) 모듈 아키텍처 (Module Architecture)
*   **`ScaffoldEngine`**: 내보내기 전체 프로세스를 오케스트레이션.
*   **`AssetTransformer`**: Remark AST 기반 이미지 경로 치환 및 자산 복사 예약.
*   **`TemplateEngine`**: Nextra 설정 파일(`next.config.js` 등)에 사용자 입력값 주입.
*   **`ZipService`**: 가상 디렉토리 구조를 최종 ZIP 파일로 빌드.

### 3) 이미지 경로 치환 코드 예시 (Remark PoC)
AST를 직접 조작하여 정교하게 경로를 변경하는 예시입니다.

```typescript
import { visit } from 'unist-util-visit';

/**
 * 이미지 노드를 방문하여 경로를 ./img/{slug}/{index}.{ext} 로 치환하는 Remark 플러그인
 */
function remarkNextraAssets({ slug, onAssetFound }) {
  return (tree) => {
    let index = 1;
    visit(tree, 'image', (node) => {
      if (!node.url.startsWith('http')) {
        const extension = node.url.split('.').pop() || 'png';
        const newPath = `./img/${slug}/${index}.${extension}`;
        
        // 자산 복사를 위해 콜백 호출
        onAssetFound(node.url, newPath);
        
        // AST 노드 경로 업데이트
        node.url = newPath;
        index++;
      }
    });
  };
}
```

## 📅 로드맵
- **Phase 1**: 디렉토리 구조를 `pages` 폴더 및 `_meta.json`으로 변환하여 ZIP으로 내보내는 기능 (Web/App 공통).
- **Phase 2**: 로컬 권한이 있는 디렉토리에 직접 Nextra 프로젝트 스캐폴딩 생성.
- **Phase 3**: (App 전용) 내보내기 직후 로컬 개발 서버 실행 및 브라우저 오픈 자동화.

## 🧠 브레인스토밍 (요구사항 구체화를 위한 질문)

### 1. UI/UX 및 워크로드가 가중되는 지점 (Wizard)
*   **설정 마법사(Wizard)**: 사용자가 입력해야 할 최소 정보는 무엇인가요? (프로젝트 명, 레포지토리 URL, 테마 컬러, 로고 등)
*   **미리보기(Preview)**: 내보내기 전, 생성될 `_meta.json`의 구조나 사이트 맵을 미리 확인하고 편집할 수 있는 단계가 필요한가요?

### 2. 변환 로직 (Transformation Logic)
*   **이미지/에셋 처리**: Mark Explorer 내에서 분산된 경로의 이미지들을 Nextra의 `public/` 폴더로 모을 때, 파일명 충돌(예: 서로 다른 폴더의 `image.png`)을 어떻게 방지할까요?
*   **링크 치환**: 마크다운 내의 상대 경로(`.md` 확장자 포함)를 Nextra가 인식하는 경로 구조로 어떻게 정교하게 치환할 것인가요?

### 3. 플랫폼별 구현 차이 (Web vs App)
*   **Web (ZIP)**: ZIP 파일 내부에는 바로 `npm install && npm run dev`가 가능한 전체 프로젝트 템플릿이 포함되나요? 아니면 `pages` 폴더만 포함되나요?
*   **App (Shell)**: 로컬에 `node`, `npm` 등이 설치되지 않은 사용자 환경은 어떻게 대응할까요? (사전 체크 로직 등)

### 4. 확장성 및 호환성
*   **Frontmatter**: 기존 마크다운의 YAML Frontmatter를 Nextra 전용 속성(예: `title`, `sidebar_label`)으로 변환하는 규칙은 무엇인가요?
*   **MDX 전환**: 일반 `.md`를 `.mdx`로 바꿀 때 사용자가 선택할 수 있는 템플릿(예: 콜아웃, 버튼 컴포넌트 자동 삽입 등)이 있을까요?
