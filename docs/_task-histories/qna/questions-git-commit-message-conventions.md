

## Q1
git commit message convention 들에 대해 설명하고 권장되는 방식에 대해 설명하세요.

바로 아래의 '### A' 섹션에 작성하세요. 질문 내용은 수정하거나 삭제하지 마세요.

### A
Git 커밋 메시지 컨벤션은 프로젝트의 변경 이력을 명확히 하고, 협업 효율성을 극대화하며, 자동화 도구(예: 릴리즈 노트 생성)와 연동하기 위해 필수적으로 준수해야 하는 규칙입니다.

대표적인 컨벤션들과 가장 널리 권장되는 방식을 아래와 같이 설명합니다.

---

### 1. 대표적인 Git 커밋 메시지 컨벤션

#### ① **Conventional Commits (가장 권장됨)**
Angular 커밋 메시지 가이드라인에 기반하여 작성된 규격화된 커밋 메시지 규칙입니다. 커밋의 성격에 따라 명확한 `Type`을 지정하며, 기계가 읽을 수 있는(machine-readable) 구조를 가집니다.
*   **특징**: `Semantic Versioning (SemVer)`과 연동하여 버전 배포 및 릴리즈 노트를 자동 생성할 수 있습니다.
*   **예시**:
    ```text
    feat(auth): add JWT token validation on API requests
    ```

#### ② **Udacity 커밋 스타일**
소프트웨어 교육 플랫폼 Udacity에서 제안한 스타일로, 단순하면서도 직관적인 구조를 지향합니다. Conventional Commits와 거의 유사하며 국내외 많은 IT 기업에서 기본 뼈대로 채택하고 있습니다.
*   **예시**:
    ```text
    Fix typo in README.md
    ```

#### ③ **Gitmoji (Git + Emoji)**
커밋 메시지 맨 앞에 특정 의미를 담은 이모지(Emoji)를 붙여 변경 사항의 성격을 시각적으로 빠르게 구분할 수 있도록 돕는 스타일입니다.
*   예: 🐛 `:bug:` (버그 수정), ✨ `:sparkles:` (신규 기능), 📝 `:memo:` (문서 작성)
*   **예시**:
    ```text
    ✨ feat: add user profile picture upload API
    ```

---

### 2. 권장되는 커밋 메시지 작성 방식 (Conventional Commits 표준)

가장 권장되는 방식은 **Conventional Commits 표준 구조**와 **Git 커밋 메시지 7대 규칙**을 결합하여 사용하는 것입니다.

#### 1) 커밋 메시지의 기본 구조 및 예시
커밋 메시지는 크게 **제목(Header)**, **본문(Body)**, **바닥글(Footer)**의 3가지 요소로 구성되며, 각 요소 사이는 빈 줄로 구분합니다.

*   **구조**:
    ```text
    <type>(<scope>): <subject>  # 제목 (Header) - 필수

    <body>                      # 본문 (Body) - 상세 설명이 필요한 경우 작성 (선택)

    <footer>                    # 바닥글 (Footer) - 이슈 트래커 ID 등 참조용 (선택)
    ```
*   **올바른 전체 예시**:
    ```text
    feat(editor): implement split-view mode for markdown files

    Allow users to view the raw markdown editor and the rendered preview
    side-by-side. This mode can be toggled via the toolbar button.

    Resolves: #104, #112
    See-also: docs/product/split-view.md
    ```

#### 2) 제목에 사용하는 대표적인 커밋 타입 (`type`)
*   `feat`: 새로운 기능 추가
*   `fix`: 버그 수정
*   `docs`: 문서 수정 (README.md, 주석 등 코드 변경 없는 경우)
*   `style`: 코드 포맷 변경 (화이트스페이스, 세미콜론 누락 해결 등 의미 없는 변경)
*   `refactor`: 코드 리팩토링 (기능 추가나 버그 수정이 없는 구조적 개선)
*   `test`: 테스트 코드 추가 및 수정 (프로덕션 코드 변경 없음)
*   `chore`: 빌드 작업, 패키지 매니저 설정, 단순 설정 변경 등
*   `perf`: 성능 향상을 위한 코드 변경
*   `ci`: CI 설정 파일 및 스크립트 수정
*   `revert`: 이전 커밋 되돌리기

#### 3) Git 커밋 메시지 작성 7대 규칙 (Chris Beams 법칙)
1.  **제목과 본문은 빈 줄로 분리합니다.** (기본 명령어 `git log --oneline` 시 제목만 깔끔하게 노출됨)
2.  **제목은 50자 이내로 제한합니다.** (너무 길면 GitHub UI 등에서 말 줄임 처리됨)
3.  **제목 첫 글자는 대문자로 시작합니다.** (영어 작성 기준)
4.  **제목 끝에 마침표(`.`)를 붙이지 않습니다.**
5.  **제목은 명령조(Imperative mood)로 작성합니다.**
    *   영어 기준 동사원형 시작: `Add feature` (O) / `Added feature` (X), `Adds feature` (X)
    *   한글 기준: `~기능 추가` (O) / `~기능 추가함` (X)
6.  **본문은 한 줄당 72자 이내에서 줄바꿈을 수행합니다.** (CLI 터미널 가독성 확보)
7.  **본문에는 '어떻게(How)'보다 '무엇을(What)'과 '왜(Why)' 변경했는지를 설명합니다.**



