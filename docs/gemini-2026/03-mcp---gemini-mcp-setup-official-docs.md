# Set up an MCP server

Gemini CLI를 외부 데이터베이스 및 서비스에 연결하세요. 이 가이드에서는 GitHub MCP 서버를 설치하고 이를 사용하여 저장소를 관리함으로써 Gemini CLI의 기능을 확장하는 방법을 설명합니다.

<br/>

## 1. 사전 요구사항 (Prerequisites)
- Gemini CLI가 설치되어 있어야 합니다.
- **Docker**: 이 가이드의 예시는 Docker 컨테이너를 기반으로 하므로 설치가 필요합니다. (많은 MCP 서버가 Docker로 실행됩니다)
- **GitHub Token**: 리포지토리 권한이 있는 개인 접근 토큰(PAT)이 필요합니다.

<br/>

## 2. 자격 증명 준비 (Credentials)
대부분의 MCP 서버는 인증이 필요합니다. GitHub의 경우 PAT가 필요합니다.

1.  [Fine-grained PAT](https://github.com/settings/tokens?type=beta)를 생성합니다.
2.  **Metadata** 및 **Contents**에 대해 **Read** 권한을, **Issues** 및 **Pull Requests**에 대해 **Read/Write** 권한을 부여합니다.
3.  환경 변수에 저장합니다:

**macOS/Linux**
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="github_pat_..."
```

**Windows (PowerShell)**
```powershell
$env:GITHUB_PERSONAL_ACCESS_TOKEN="github_pat_..."
```

<br/>

## 3. Gemini CLI 설정 (`settings.json`)
`settings.json`을 편집하여 새 서버를 Gemini에 등록합니다.

1.  `~/.gemini/settings.json` (또는 프로젝트별 `.gemini/settings.json`)을 엽니다.
2.  `mcpServers` 블록을 추가합니다. 이는 Gemini에게 "이 Docker 컨테이너를 실행하고 통신하라"고 지시하는 것입니다.

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server:latest"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

> [!NOTE]
> `command`는 `docker`이며 나머지는 인자값으로 전달됩니다. 보안 정보를 설정 파일에 하드코딩하지 않기 위해 로컬 환경 변수를 컨테이너로 매핑하여 사용합니다.

<br/>

## 4. 연결 확인 (Verification)
Gemini CLI를 재시작하면 정의된 서버를 자동으로 시작합니다.

- **명령어**: `/mcp list`
- **정상 상태**: `✓ github: docker ... - Connected` 메시지가 표시되어야 합니다.

*만약 `Disconnected`나 오류가 표시된다면 Docker가 실행 중인지, 혹은 API 토큰이 유효한지 확인하세요.*

<br/>

## 5. 도구 활용 예시 (Usage Scenarios)
서버가 연결되면 에이전트에게 새로운 기능("도구")이 부여됩니다. 특별한 명령어를 외울 필요 없이 자연어로 요청하면 됩니다.

### 시나리오 1: Pull Request 목록 조회
**프롬프트:** `google/gemini-cli 리포지토리의 열려 있는 PR 목록을 보여줘.`
1. 에이전트가 요청이 GitHub 도구와 일치함을 인식합니다.
2. `mcp_github_list_pull_requests` 도구를 호출합니다.
3. 결과 데이터를 요약하여 사용자에게 보여줍니다.

### 시나리오 2: 이슈 생성
**프롬프트:** `내 리포지토리에 "Bug: Login fails"라는 제목과 "See logs"라는 내용으로 이슈를 만들어줘.`

<br/>

## 6. 트러블슈팅 (Troubleshooting)
- **서버가 시작되지 않나요?**: Docker 명령어를 터미널에서 수동으로 실행하여 이미지 인식 오류 등이 있는지 확인하세요.
- **도구를 찾을 수 없나요?**: `/mcp reload`를 입력하여 CLI가 서버로부터 도구 목록을 다시 불러오도록 강제하세요.

<br/>

## 7. 다음 단계
- SSE 또는 HTTP 전송 방식을 사용하는 원격 서버에 대해 알아보려면 [MCP 서버 참조 문서](/docs/tools/mcp-server)를 확인하세요.
- Slack, Postgres, Google Drive 등 연동 가능한 커넥터를 찾으려면 [공식 MCP 서버 리스트](https://github.com/modelcontextprotocol/servers)를 방문하세요.