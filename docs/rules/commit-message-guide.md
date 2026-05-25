# Git Commit Message Guide (Conventional Commits)

이 문서는 프로젝트에서 사용하는 Git 커밋 메시지 작성 표준 가이드를 정의합니다. 프로젝트 구성원 모두는 커밋 내역의 일관성과 가독성을 위해 본 가이드를 준수해야 합니다.

---

## 1. 커밋 메시지 기본 구조

커밋 메시지는 크게 **제목(Header)**, **본문(Body)**, **바닥글(Footer)**의 3가지 요소로 구성되며, 각 요소 사이는 빈 줄로 구분합니다.

```text
<type>(<scope>): <subject>  # 제목 (Header) - 필수

<body>                      # 본문 (Body) - 상세 설명이 필요한 경우 작성 (선택)

<footer>                    # 바닥글 (Footer) - 이슈 트래커 ID 등 참조용 (선택)
```

### 올바른 전체 예시
```text
feat(editor): implement split-view mode for markdown files

Allow users to view the raw markdown editor and the rendered preview
side-by-side. This mode can be toggled via the toolbar button.

Resolves: #104, #112
See-also: docs/product/split-view.md
```

---

## 2. 제목에 사용하는 대표적인 커밋 타입 (`type`)

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

---

## 3. Git 커밋 메시지 작성 7대 규칙 (Chris Beams 법칙)

1.  **제목과 본문은 빈 줄로 분리합니다.** (기본 명령어 `git log --oneline` 시 제목만 깔끔하게 노출됨)
2.  **제목은 50자 이내로 제한합니다.** (너무 길면 GitHub UI 등에서 말 줄임 처리됨)
3.  **제목 첫 글자는 대문자로 시작합니다.** (영어 작성 기준)
4.  **제목 끝에 마침표(`.`)를 붙이지 않습니다.**
5.  **제목은 명령조(Imperative mood)로 작성합니다.**
    *   영어 기준 동사원형 시작: `Add feature` (O) / `Added feature` (X), `Adds feature` (X)
    *   한글 기준: `~기능 추가` (O) / `~기능 추가함` (X)
6.  **본문은 한 줄당 72자 이내에서 줄바꿈을 수행합니다.** (CLI 터미널 가독성 확보)
7.  **본문에는 '어떻게(How)'보다 '무엇을(What)'과 '왜(Why)' 변경했는지를 설명합니다.**
