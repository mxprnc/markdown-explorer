# 커스텀 명령어 (Custom Commands) 가이드
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="10%" alt="Gemini Banner" />

<br/>

## 출처
- Custom commands official guide : https://geminicli.com/docs/cli/custom-commands/

<br/>

## 1. 커스텀 명령어란 무엇인가?
커스텀 명령어를 사용하면 자주 사용하거나 복잡한 프롬프트를 나만의 **단축키(Shortcut)**로 저장하고 재사용할 수 있습니다. 특정 프로젝트에 최적화된 명령어부터 모든 작업에 공통으로 쓰이는 전역 명령어까지 유연하게 구성하여 작업의 효율성과 일관성을 높일 수 있습니다.

<br/>

## 2. 파일 위치 및 우선순위
Gemini CLI는 다음 두 위치에서 명령어를 자동으로 탐색하고 로드합니다.

1.  **사용자 명령어 (Global)**: `~/.gemini/commands/`. 어떤 프로젝트를 작업하든 항상 사용 가능합니다.
2.  **프로젝트 명령어 (Local)**: `<프로젝트-루트>/.gemini/commands/`. 해당 프로젝트에서만 사용 가능하며, 팀원들과 공유하기 위해 Git에 포함할 수 있습니다.

> [!IMPORTANT]
> 특정 프로젝트용 명령어가 전역 명령어와 이름이 같을 경우, **프로젝트 명령어가 항상 우선(Override)**합니다.

<br/>

## 3. 명령법 및 네임스페이스
명령어의 이름은 `commands` 디렉토리 내의 파일 경로를 따르며, 하위 디렉토리는 자동으로 네임스페이스가 됩니다.

- `~/.gemini/commands/test.toml` -> **/test**
- `<project>/.gemini/commands/git/commit.toml` -> **/git:commit**

*팁: 명령어를 추가하거나 수정한 후에는 `/commands reload`를 실행하여 CLI 재시작 없이 즉시 반영할 수 있습니다.*

<br/>

## 4. 인자(Arguments) 처리 및 동적 주입

### ① `{{args}}`를 이용한 사용자 입력 주입
프롬프트 내에 `{{args}}`를 넣으면 사용자가 명령어 뒤에 입력한 텍스트로 치환됩니다.
- **쉘 보안**: `!{...}` 블록 내부에서 사용될 경우, 보안을 위해 자동으로 쉘 이스케이프 처리됩니다.

### ② 쉘 명령어 실행 결과 주입 (`!{...}`)
쉘 명령어의 실행 결과를 프롬프트에 직접 삽입합니다. (예: `!{git diff --staged}`) 실행 전 보안을 위해 사용자 승인 확인 창이 표시됩니다.

### ③ 파일 및 디렉토리 내용 주입 (`@{...}`)
파일의 내용이나 디렉토리 내의 파일 전체를 프롬프트에 포함합니다.
- **파일**: `@{path/to/file.txt}` -> 파일 텍스트 삽입. (이미지, PDF 등 멀티모달도 지원)
- **디렉토리**: `@{path/to/dir}` -> 디렉토리 내 모든 파일 내용 삽입.

<br/>

## 5. 실습 예제: 리팩토링 명령어 만들기

전역에서 사용할 수 있는 순수 함수(Pure Function) 리팩토링용 명령어를 만들어 보겠습니다.

**1. 파일 생성 (macOS/Linux 기준)**
```bash
mkdir -p ~/.gemini/commands/refactor
touch ~/.gemini/commands/refactor/pure.toml
```

**2. TOML 내용 작성**
```toml
# ~/.gemini/commands/refactor/pure.toml
description = "현재 코드를 순수 함수로 리팩토링하도록 요청합니다."
prompt = """
제공된 코드를 분석하여 순수 함수(Pure function)로 리팩토링해 주세요.
수정 사항에 대한 간단한 설명도 포함해야 합니다.
"""
```

**3. 명령어 실행**
이제 터미널에서 어떤 파일이든 컨텍스트에 추가한 후 아래 명령어를 입력하면 작동합니다.
```
> @my-code.js
> /refactor:pure
```

---
**다음 단계**: 명령어 실행 중 발생할 수 있는 보안 문제나 샌드박스 설정이 궁금하다면 [보안 및 샌드박싱 가이드](/docs/gemini/7-sandboxing---gemini-official-docs.md)를 참고하세요.
