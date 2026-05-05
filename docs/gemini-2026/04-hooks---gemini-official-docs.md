# Gemini CLI Hooks (후크) 가이드
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="10%" alt="Gemini Banner" />

<br/>

## 출처
- Gemini CLI hooks : https://geminicli.com/docs/hooks/
- Hooks reference : https://geminicli.com/docs/hooks/reference/

<br/>

## 1. 후크(Hooks)란 무엇인가?
후크는 Gemini CLI의 에이전트 루프 특정 시점에 자동으로 실행되는 스크립트나 프로그램입니다. 이를 통해 CLI 본체의 소스 코드를 건드리지 않고도 동작을 가로채거나 사용자 정의 로직을 삽입할 수 있습니다.

### 주요 활용 사례
- **컨텍스트 주입**: 모델이 요청을 처리하기 전 Git 기록이나 프로젝트 특정 규칙을 삽입합니다.
- **작업 검증**: 도구의 인자를 검토하여 파일 삭제나 위험한 쉘 명령을 차단합니다.
- **보안 및 규정 준수**: 회사 내 보안 스캐너를 루프에 통합합니다.
- **상호작용 기록**: 감사(Auditing)를 위해 모든 도구 호출과 응답을 외부 시스템에 저장합니다.

<br/>

## 2. 핵심 이벤트 및 작동 원리

### ① 주요 후크 이벤트
| 이벤트 | 실행 시점 | 주요 용도 |
| :--- | :--- | :--- |
| **`SessionStart`** | 세션 시작/재개 시 | 프로젝트 초기 컨텍스트 로드, 리소스 준비 |
| **`BeforeAgent`** | 사용자 입력 제출 직후 | 프롬프트 검증, 대화 시작 차단 |
| **`BeforeTool`** | 도구가 실제로 실행되기 전 | 실행 인자 검증, 위험 작업 차단 및 수정 |
| **`AfterTool`** | 도구 실행 완료 직후 | 결과 데이터 정제, 테스트 자동 실행 |
| **`AfterAgent`** | 에이전트 답변 생성 완료 시 | 응답 내용 검토, 부적절 시 자동 재시도 강제 |

### ② 작동 방식 (The Golden Rule)
- **JSON 통신**: 후크는 `stdin`(입력)과 `stdout`(출력)을 통해 오직 **JSON**으로만 대화합니다.
- **순수 출력 유지**: 스크립트가 실행되는 도중 일반 텍스트(`echo`, `print` 등)를 `stdout`에 출력하면 파싱 오류가 발생합니다. **오직 최종 결과 JSON만 출력해야 합니다.**
- **디버깅**: 모든 디버깅 로그와 메시지는 표준 에러(`stderr`)로 출력해야 합니다 (`echo "debug" >&2`).

<br/>

## 3. 설정 및 구성 (`settings.json`)

후크는 프로젝트(`.gemini/settings.json`) 또는 사용자(`~/.gemini/settings.json`) 설정 파일에서 정의합니다.

### 구성 예시 (보안 체크 후크)
```json
{
  "hooks": {
    "BeforeTool": [
      {
        "matcher": "write_file|replace|run_shell_command",
        "hooks": [
          {
            "name": "security-scanner",
            "type": "command",
            "command": "$GEMINI_PROJECT_DIR/.gemini/hooks/security.sh",
            "timeout": 3000
          }
        ]
      }
    ]
  }
}
```

<br/>

## 4. 보안 정책 (Fingerprinting)

> [!WARNING]
> 후크는 사용자의 시스템 권한을 그대로 사용하여 코드를 실행합니다. 신뢰할 수 없는 프로젝트를 열 때는 특히 주의해야 합니다.

Gemini CLI는 프로젝트별 후크를 **디지털 지문(Fingerprint)**으로 관리합니다. 만약 다른 팀원이 `git pull` 등으로 후크의 이름이나 실행 명령을 변경했다면, CLI는 이를 **"신뢰할 수 없는 후크"**로 간주하고 실행 전 사용자에게 강력한 경고를 표시합니다.

<br/>

## 5. 후크 관리 명령어
터미널에서 직접 후크 상태를 제어할 수 있습니다.

- **전체 확인**: `/hooks panel` (현재 등록된 후크의 이름과 상태를 시각적으로 확인)
- **일괄 제어**: `/hooks enable-all` 또는 `/hooks disable-all`
- **개별 토글**: `/hooks enable <name>` 또는 `/hooks disable <name>`

---
**다음 단계**: 후크가 반환해야 하는 구체적인 JSON 스키마를 확인하려면 [Hooks Reference 전문](/docs/hooks/reference)을 참고하세요.
