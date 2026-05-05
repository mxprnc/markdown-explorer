# 헤드리스 모드(Headless Mode) 및 자동화 가이드
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="10%" alt="Gemini Banner" />

<br/>

## 출처
- Automation tutorial : https://geminicli.com/docs/cli/tutorials/automation/
- Headless mode reference : https://geminicli.com/docs/cli/headless/

<br/>

## 1. 헤드리스 모드란 무엇인가?
헤드리스 모드는 대화형 인터페이스 없이 Gemini CLI를 실행하고 결과를 출력한 뒤 즉시 종료하는 작동 방식입니다. 다음과 같은 시나리오에 최적화되어 있습니다.

- **CI/CD**: 풀 리퀘스트(PR)를 자동으로 분석하거나 빌드 로그를 검토할 때.
- **일괄 처리(Batch processing)**: 대량의 로그 파일을 요약하거나 여러 소스 코드를 동시 가공할 때.
- **도구 빌드**: 자신만의 AI 래퍼(Wrapper) 스크립트를 작성할 때.

<br/>

## 2. 기본 사용법 및 파이프(Pipe) 연결
`-p` (또는 `--prompt`) 플래그를 사용하여 명령을 실행하면 답변을 표준 출력(stdout)으로 정밀하게 반환합니다. 이 모드에서는 대화 인터페이스가 생략됩니다.

### ① 단일 명령 실행
```bash
gemini -p "TypeScript의 이점에 대해 짧게 요약해줘"
```

### ② 입력을 파이프로 전달
유닉스 파이프(`|`)를 사용하여 파일 내용이나 다른 명령의 출력을 Gemini의 컨텍스트로 직접 주입할 수 있습니다. 원격 파일(@파일명) 참조와 결합하여 강력한 자동화가 가능합니다.

```bash
# 로그 파일 분석 (macOS/Linux)
cat error.log | gemini -p "이 오류가 발생한 원인을 분석해줘"

# Git 변경 사항에 대한 커밋 메시지 생성
git diff | gemini -p "이 변경 사항에 대한 Conventional Commit 메시지를 작성해줘"
```

<br/>

## 3. 스크립트 활용 예시: 대량 문서 생성기 (Bulk Docs)
폴더 내의 모든 Python(`.py`) 파일을 순회하며 각각의 설명이 담긴 마크다운 문서를 자동으로 만드는 자동화 예시입니다.

### macOS / Linux (`generate_docs.sh`)
```bash
#!/bin/bash
for file in *.py; do
  echo "Generating docs for $file..."
  gemini -p "Generate a Markdown documentation summary for @$file. Print ONLY the result." > "${file%.py}.md"
done
```

### Windows PowerShell (`generate_docs.ps1`)
```powershell
Get-ChildItem -Filter *.py | ForEach-Object {
  $newName = $_.Name -replace '\.py$', '.md'
  gemini -p "Generate a Markdown summary for @$($_.Name). Print ONLY the result." | Out-File -FilePath $newName -Encoding utf8
}
```

<br/>

## 4. 구조화된 JSON 데이터 추출
`--output-format json` 플래그를 사용하면 다른 도구(예: `jq`)에서 파싱하기 쉬운 JSON 객체를 반환받을 수 있습니다. 모델의 응답 텍스트는 `.response` 필드에 포함됩니다.

```bash
# package.json에서 데이터 추출 후 파일 저장
gemini --output-format json "Return a raw JSON with 'version' and 'deps' from @package.json" | jq -r '.response' > data.json
```

<br/>

## 5. 커스텀 AI 도구 만들기: Smart Commit
쉘 설정 파일(`.zshrc` 등)에 아래 함수를 등록해 두면, `gcommit` 명령 한 번으로 스테이징된 변경 사항을 분석하여 커밋 메시지를 자동 생성하고 커밋까지 완료합니다.

```bash
# macOS/Linux (Bash/Zsh) 전용 .zshrc 설정 예시
function gcommit() {
  diff=$(git diff --staged)
  if [ -z "$diff" ]; then
    echo "커밋할 변경 사항이 없습니다."
    return 1
  fi
  
  echo "AI 커밋 메시지 생성 중..."
  msg=$(echo "$diff" | gemini -p "Write a concise Conventional Commit message for this diff. Output ONLY the message.")
  
  git commit -m "$msg"
}
```

<br/>

## 6. 기술 참조 (Technical Reference)

### ① 출력 형식 (Output Formats)
- **JSON**: 응답 텍스트와 토큰 사용량, API 레이턴시 정보 등을 포함한 객체를 반환합니다.
- **Streaming JSON (JSONL)**: 대규모 프로세싱을 위해 `message`, `tool_use`, `result` 등의 이벤트를 개별 라인 단위로 실시간 스트리밍합니다.

### ② 종료 코드 (Exit Codes)
CLI는 표준 종료 코드를 통해 자동화 스크립트에 실행 결과를 알립니다.

| 코드 | 의미 | 비고 |
| :--- | :--- | :--- |
| **0** | **Success** | 작업이 성공적으로 완료됨 |
| **1** | **General Error** | 일반적인 오류 또는 API 호출 실패 |
| **42** | **Input Error** | 유효하지 않은 프롬프트나 인자 전달 |
| **53** | **Turn Limit** | 설정된 최대 턴(Turn) 제한을 초과함 |

---
**다음 단계**: 실시간으로 쉘 명령을 실행하는 에이전트의 능력을 확인하려면 [Shell Commands 가이드](/docs/cli/tutorials/shell-commands)를 참고하세요.
