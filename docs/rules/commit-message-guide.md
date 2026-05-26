# Git Commit Message Guide (Conventional Commits)

이 문서는 프로젝트에서 사용하는 Git 커밋 메시지 작성 표준 가이드를 정의합니다. 프로젝트 구성원 모두는 커밋 내역의 일관성과 가독성을 위해 본 가이드를 준수해야 합니다.

> [!IMPORTANT]
> 모든 커밋 메시지(제목, 본문, 바닥글)는 **영어(English)**로만 작성해야 합니다.

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

## 3. Git 커밋 메시지 7대 규칙 (Chris Beams 법칙)

1.  **제목과 본문은 빈 줄로 분리합니다.** (기본 명령어 `git log --oneline` 시 제목만 깔끔하게 노출됨)
2.  **제목은 50자 이내로 제한합니다.** (너무 길면 GitHub UI 등에서 말 줄임 처리됨)
3.  **제목 첫 글자는 대문자로 시작합니다.**
4.  **제목 끝에 마침표(`.`)를 붙이지 않습니다.**
5.  **제목은 명령조(Imperative mood)로 작성합니다.**
    *   동사원형으로 시작합니다: `Add feature` (O) / `Added feature` (X), `Adds feature` (X)
6.  **본문은 한 줄당 72자 이내에서 줄바꿈을 수행합니다.** (CLI 터미널 가독성 확보)
7.  **본문에는 '어떻게(How)'보다 '무엇을(What)'과 '왜(Why)' 변경했는지를 설명합니다.**

---

## 4. AI-Powered Git Commit Helper (자동화 도구 가이드)

프로젝트에는 커밋 메시지 작성 규약을 자동으로 준수하고, 영어 번역 및 변경 사항 정리를 일원화하기 위한 **AI 지원 도구**가 기본 탑재되어 있습니다. 

staged 상태인 변경 파일들의 `git diff`를 AI가 직접 분석하여 커밋 메시지를 생성하므로, 개발자는 복잡한 수동 영작 과정 없이도 표준을 완벽히 준수할 수 있습니다.

### 🛠️ 제공되는 도구 환경

Gemini CLI 대화창 내부에서 정밀한 협업과 단계별 커밋 프로세스를 수행할 때 사용되는 **AI 커스텀 커맨드**들이 탑재되어 있습니다.

1. **`/git:commit-message [의도]`**
   - **설명**: 현재 staged 상태인 파일들의 diff를 분석하여 영어 커밋 메시지를 생성합니다.
   - **저장 위치**: [.gemini/commands/git/git-temp/](../../.gemini/commands/git/git-temp/) 폴더 하위의 `<type>-<subject-kebab-case>/<id>.md`에 임시 저장됩니다.
   - **메타데이터 저장**: 생성 시점의 staged 파일 목록과 크기, 해시를 파일 하단에 `<!-- gemini-cli-metadata -->` 주석 블록으로 안전하게 병합 저장합니다.
   - **수정 가이드**: 사용자에게 완성된 메시지와 임시 파일 경로를 안내하며, 마크다운 파일을 사용자가 직접 열어 자유롭게 편집할 수 있습니다.

2. **`/git:commit`**
   - **설명**: 생성해 둔 임시 커밋 메시지로 실제 git commit을 최종 승인 및 완료합니다.
   - **안전 장치 (Diff 비교)**: 메시지 생성 후 staged 파일이 달라졌을 경우, 메타데이터 해시값 비교를 통해 사용자에게 즉각 보고하고 재생성할지 기존 안을 유지할지 질문합니다.
   - **주석 필터링(Strip)**: 실제 커밋 기록을 남기기 전, 임시 파일 하단의 `<!-- gemini-cli-metadata -->` 주석 블록을 **완벽하게 필터링하여 순수한 텍스트만** 커밋 로그에 남깁니다.
   - **임시 파일 정리**: 커밋 완료 시 `.gemini/commands/git/git-temp/` 하위의 관련 임시 디렉토리는 자동으로 말끔히 제거됩니다.

3. **`/git:force-commit`**
   - **설명**: 리뷰나 질문 절차 없이 staged된 내용을 AI가 알아서 고품질의 영문 커밋 메시지로 작성하고, 즉시 순수 메시지로 변환하여 커밋까지 다이렉트로 처리하는 자동화 기능입니다.

---

> [!TIP]
> **성공적인 자동화를 위한 팁**:
> - 사용자의 의도가 담긴 인자(예: `"docs: (README) 가이드 문서 추가"`)는 한국어, 프랑스어, 독일어, 스페인어 등 **어떤 다국어로 입력해도 완벽하게 분석되어 영어 기반 Conventional Commit 규격으로 번역 및 변환**됩니다.
> - staged 파일이 존재하지 않는 경우 모든 커맨드는 안전 조치를 작동하고 `git add` 선행을 안내하며 안전하게 자동 종료됩니다.

