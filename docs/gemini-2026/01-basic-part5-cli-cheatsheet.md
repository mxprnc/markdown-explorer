# Gemini CLI 치트 시트 (Cheat Sheet)
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="10%" alt="Gemini Banner" />

<br/>

## 출처
- Gemini CLI Reference : https://geminicli.com/docs/cli/cli-reference/

<br/>

## 1. 터미널 명령어 (CLI Commands)
터미널에서 직접 실행하여 Gemini CLI의 동작을 제어합니다.

| 명령어 | 설명 | 예시 |
| :--- | :--- | :--- |
| `gemini` | 대화형 모드(REPL) 시작 | `gemini` |
| `gemini -p "질문"` | 답변 출력 후 즉시 종료 (비대화형) | `gemini -p "README 요약해줘"` |
| `gemini "질문"` | 질문 후 대화형 모드로 진입 | `gemini "기존 코드 리팩토링해줘"` |
| `cat file \| gemini` | 파일 내용을 파이프로 전달 | `cat logs.txt \| gemini` |
| `gemini -i "질문"` | 실행 후 대화형 인터페이스 유지 | `gemini -i "이 프로젝트의 구조가 뭐야?"` |
| `gemini -r latest` | 가장 최근 세션 재개 | `gemini -r latest` |
| `gemini update` | CLI를 최신 버전으로 업데이트 | `gemini update` |

<br/>

## 2. 대화 중 명령어 (Interactive Commands)
대화형 모드(REPL) 내부에서 슬래시(/)를 입력하여 실행합니다.

| 명령어 | 설명 |
| :--- | :--- |
| `/skills reload` | 디스크에서 에이전트 스킬 다시 로드 |
| `/agents reload` | 에이전트 레지스트리 다시 로드 |
| `/commands reload` | 커스텀 슬래시 명령어 다시 로드 |
| `/memory reload` | `GEMINI.md` 등 컨텍스트 파일 다시 읽기 |
| `/mcp reload` | MCP 서버 재시작 및 연결 다시 로드 |
| `/extensions reload` | 활성화된 모든 확장 기능 다시 로드 |
| `/help` | 모든 명령어 도움말 확인 |
| `/quit` | 세션 종료 및 터미널로 복귀 |

<br/>

## 3. CLI 실행 옵션 (Flags)
| 옵션 | 단축 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `--model` | `-m` | `auto` | 사용할 모델 지정 (`pro`, `flash`, `flash-lite`) |
| `--prompt` | `-p` | - | 프롬프트 입력 (비대화형 모드 강제) |
| `--sandbox` | `-s` | `false` | 보안 샌드박스 격리 환경에서 실행 |
| `--approval-mode`| - | `default` | 승인 모드 (`default`, `auto_edit`, `yolo`, `plan`) |
| `--resume` | `-r` | - | 이전 세션 재개 (`latest` 또는 인덱스 번호) |
| `--output-format` | `-o` | `text` | 출력 형식 지정 (`text`, `json`, `stream-json`) |
| `--debug` | `-d` | `false` | 디버그 모드(상세 로그 포함) 실행 |

<br/>

## 4. 모델 선택 가이드 (Model Selection)
`--model` (또는 `-m`) 플래그로 선택 가능한 주요 별칭(Alias)입니다.

| 별칭 | 매핑 모델 | 설명 |
| :--- | :--- | :--- |
| **`auto`** | `pro` 단계 | 시스템이 판단한 최적 모델 사용 (기본값) |
| **`pro`** | `gemini-2.5-pro` | 복잡한 추론, 대규모 설계, 정밀 코딩용 |
| **`flash`** | `gemini-2.5-flash` | 속도와 성능의 균형이 좋은 범용 작업용 |
| **`flash-lite`**| `gemini-2.5-flash-lite` | 요약 및 즉각 응답이 필요한 초고속용 |

<br/>

## 5. 관리 명령어 요약 (Management)

### 📦 확장 기능 (Extensions)
- **설치**: `gemini extensions install [URL\|Path]`
- **제거**: `gemini extensions uninstall [Name]`
- **상태**: `gemini extensions [list \| enable \| disable]`
- **신규**: `gemini extensions new [Path]` (템플릿 생성)

### 🛠️ MCP 서버 (MCP Server)
- **추가**: `gemini mcp add github npx -y @modelcontextprotocol/server-github`
- **추가(HTTP)**: `gemini mcp add api http://localhost:3000 --transport http`
- **제거**: `gemini mcp remove [Name]`

### 🧠 에이전트 스킬 (Skills)
- **설치**: `gemini skills install [URL\|Path]`
- **링크**: `gemini skills link [Path]` (로컬 개발 시 심볼릭 링크)
- **제어**: `gemini skills [enable \| disable] [Name]`

---
**팁**: 모든 명령어는 뒤에 `--help`를 붙여 상세 옵션을 확인할 수 있습니다. (예: `gemini mcp add --help`)
