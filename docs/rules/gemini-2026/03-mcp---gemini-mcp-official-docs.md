# Gemini CLI MCP(Model Context Protocol) 가이드
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="10%" alt="Gemini Banner" />

<br/>

이 문서는 Gemini CLI에서 MCP(Model Context Protocol) 서버를 구성하고 사용하는 방법에 대한 종합적인 가이드를 제공합니다.

<br/>

## 출처
- MCP servers with the Gemini CLI : https://geminicli.com/docs/tools/mcp-server

<br/>

## 1. MCP 서버란 무엇인가?
MCP 서버는 **Model Context Protocol**을 통해 Gemini CLI에 도구와 리소스를 노출하는 애플리케이션입니다. 이를 통해 Gemini 모델은 로컬 환경이나 외부 API 서비스와 상호작용할 수 있는 브릿지 역할을 수행합니다.

**MCP 서버의 주요 기능:**
- **도구 검색(Discovery):** 표준화된 스키마를 통해 사용 가능한 도구 목록, 설명 및 파라미터 제공.
- **도구 실행(Execution):** 정의된 인자로 특정 도구를 호출하고 구조화된 응답 수신.
- **리소스 접근:** 서버가 노출하는 정보(파일, API 데이터, 보고서 등)를 읽기.

<br/>

## 2. 핵심 통합 아키텍처
Gemini CLI는 정교한 검색 및 실행 시스템을 통해 MCP 서버와 통합됩니다.

### ① 검색 레이어 (Discovery Layer)
`discoverMcpTools()` 함수를 통해 다음 과정을 수행합니다.
1. `settings.json`에 구성된 서버 목록을 순회합니다.
2. 전송 방식(Stdio, SSE, HTTP)에 따라 연결을 수립합니다.
3. MCP 프로토콜을 사용하여 각 서버로부터 도구 정의를 가져옵니다.
4. Gemini API 호환성을 위해 스키마를 검증하고 전역 도구 레지스트리에 등록합니다.

### ② 실행 레이어 (Execution Layer)
발견된 각 도구는 `DiscoveredMCPTool` 인스턴스로 래핑되어 다음을 관리합니다.
- 서버 신뢰 설정 및 사용자 기본 설정에 따른 **승인 로직** 처리.
- 적절한 파라미터로 MCP 서버를 호출하여 실행 관리.
- LLM 컨텍스트 및 사용자 디스플레이를 위한 응답 처리.

### ③ 전송 방식 (Transport Mechanisms)
- **Stdio**: 하위 프로세스를 실행하고 stdin/stdout을 통해 통신합니다. (로컬 서버용)
- **SSE**: Server-Sent Events 엔드포인트에 연결합니다.
- **Streamable HTTP**: HTTP 스트리밍을 사용하여 통신합니다.

<br/>

## 3. MCP 리소스 활용
일부 MCP 서버는 도구와 프롬프트 외에도 컨텍스트 정보를 담은 '리소스(Resources)'를 노출합니다. Gemini CLI는 이를 자동으로 검색하며, 사용자는 채팅 중에 이를 직접 참조할 수 있습니다.

### (1) 검색 및 목록 확인 (Discovery and listing)
- **자동 검색**: 서버 연결 시 CLI는 각 서버의 `resources/list` 결과를 자동으로 가져옵니다.
- **상태 확인**: `/mcp` 명령어를 입력하면 연결된 모든 서버의 도구, 프롬프트와 함께 **Resources** 섹션이 별도로 표시됩니다.
- **반환 데이터**: 리소스 목록은 간결한 URI 형태와 관련 메타데이터를 포함한 일반 텍스트 목록으로 제공됩니다.

### (2) 대화 내 리소스 참조 (Referencing resources)
로컬 파일을 참조할 때 사용하는 것과 동일한 `@` 구문을 사용하여 MCP 리소스를 호출할 수 있습니다.

- **예시**: `@server://resource/path`
- **자동 완성**: `@`를 입력하면 파일 시스템 경로와 함께 리소스 URI가 자동 완성 메뉴에 나타납니다.
- **작동 방식**: 메시지를 전송하면 CLI가 해당 서버에 `resources/read` 요청을 보내고, 그 내용을 대화 컨텍스트에 즉시 주입합니다.

<br/>

## 4. MCP 서버 설정 (`settings.json`)

Gemini CLI는 `settings.json` 파일을 통해 MCP 서버를 찾고 연결합니다. 이 설정 파일은 다음 두 위치에 존재할 수 있습니다:
- **전역 설정 (Global)**: `~/.gemini/settings.json` (사용자의 홈 디렉터리에 위치하며, 모든 프로젝트에 공통적으로 적용됩니다.)
- **프로젝트 설정 (Workspace)**: `.gemini/settings.json` (해당 워크스페이스/프로젝트 폴더 내에 위치하며, 현재 프로젝트에만 독점적으로 적용됩니다.)

설정은 크게 두 가지 방식으로 이루어집니다:
1. **`mcpServers` 객체**: 각 서버별 실행 경로, 인증, 도구 필터링 등 상세한 개별 서버 정의를 담당합니다.
2. **`mcp` 객체**: 서버 검색 및 실행을 제어하는 전역 규칙(허용/제외 목록 등)을 정의합니다.

#### (1) 전역 MCP 설정 (`mcp`)
`settings.json`의 `mcp` 객체는 모든 MCP 서버에 대한 글로벌 규칙을 정의합니다.

- **`mcp.allowed`** (Array): 연결을 허용할 서버 이름 목록. 설정 시 이 목록에 있는 서버만 연결됩니다.
- **`mcp.excluded`** (Array): 연결에서 제외할 서버 이름 목록. 세션에서 해당 서버들이 무시됩니다.
- **`mcp.serverCommand`** (String): 모든 MCP 서버를 시작할 때 공통으로 사용할 전역 명령.

**예시:**
```json
{
  "mcp": {
    "allowed": ["my-trusted-server"],
    "excluded": ["experimental-server"]
  }
}
```

#### (2) 개별 서버 설정 (`mcpServers`)
`mcpServers` 객체 내에 각 서버의 실행 경로, 인자, 환경 변수 등을 정의합니다.

**구성 구조 (Structure):**
```json
{
  "mcpServers": {
    "server-name": {
      "command": "path/to/executable",
      "args": ["--port", "8080"],
      "env": { "API_KEY": "$MY_TOKEN" },
      "cwd": "./working-dir",
      "timeout": 30000,
      "trust": false
    }
  }
}
```

#### (3) 상세 구성 속성 (Configuration Properties)

| 구분 | 속성 | 유형 | 설명 |
| :--- | :--- | :--- | :--- |
| **필수** | **`command`** | String | **Stdio 방식 전용.** 실행 파일 경로 (예: `node`, `python`). |
| (택 1) | **`url`** | String | **SSE 방식 전용.** 엔드포인트 URL (예: `http://localhost:8080/sse`). |
| | **`httpUrl`** | String | **HTTP 스트리밍 전용.** 엔드포인트 URL. |
| **선택** | **`args`** | String[] | Stdio 전용. 명령행 인자 배열. |
| | **`headers`** | Object | HTTP/SSE 전용. 사용자 정의 HTTP 헤더. |
| | **`env`** | Object | 서버 환경 변수. 아래 '환경 변수 확장' 문법 지원. |
| | **`cwd`** | String | Stdio 전용. 서버 프로세스의 작업 디렉토리. |
| | **`timeout`** | Number | 요청 타임아웃(ms). 기본값 10분(600,000ms). |
| | **`trust`** | Boolean | `true` 시 도구 호출 승인 팝업을 생략함 (기본값: `false`). |
| | **`includeTools`** | String[] | 사용할 도구 목록만 화이트리스트로 지정. |
| | **`excludeTools`** | String[] | 제외할 도구 목록. `includeTools`보다 우선순위가 높음. |
| | **`targetAudience`** | String | IAP 보호 서비스 접근을 위한 OAuth Client ID. |
| | **`targetServiceAccount`**| String | 가장(Impersonate)할 Google Cloud 서비스 계정 이메일. |

<br/>

#### (4) 환경 변수 확장 (Environment Variable Expansion)
Gemini CLI는 `env` 블록 내에서 환경 변수를 자동으로 확장합�## 6. 멀티모달 및 풍부한 콘텐츠 응답
MCP 도구는 단순 텍스트 외에도 이미지, 오디오 등 바이너리 데이터를 포함한 멀티파트 응답을 반환할 수 있습니다.
- 응답 내 `ContentBlock` 배열을 통해 `text`, `image`, `audio` 등을 혼합하여 반환하면, Gemini CLI가 이를 적절히 패키징하여 모델의 컨텍스트로 주입합니다.

<br/>

## 5. 발견 과정 심층 분석 (Discovery Process Deep Dive)

Gemini CLI가 시작될 때 수행되는 MCP 서버 검색의 구체적인 단계는 다음과 같습니다.

### (1) 서버 순회 및 연결 (Server iteration and connection)
`mcpServers`에 구성된 각 서버에 대해 다음 작업을 수행합니다.
1. **상태 추적 시작**: 서버 상태를 `CONNECTING`으로 설정합니다.
2. **전송 방식 선택**: 구성 속성에 따라 적절한 클라이언트를 선택합니다.
   - `httpUrl` → `StreamableHTTPClientTransport`
   - `url` → `SSEClientTransport`
   - `command` → `StdioClientTransport`
3. **연결 수립**: 설정된 타임아웃 내에 연결을 시도합니다.
4. **오류 처리**: 연결 실패 시 로그를 남기고 서버 상태를 `DISCONNECTED`로 변경합니다.

### (2) 도구 검색 (Tool discovery)
성공적으로 연결되면 다음 단계를 거칩니다.
1. **도구 목록 조회**: 서버의 도구 목록 엔드포인트를 호출합니다.
2. **스키마 검증**: 각 도구의 함수 선언 형식을 검증합니다.
3. **도구 필터링**: `includeTools` 및 `excludeTools` 설정에 따라 도구를 필터링합니다.
4. **이름 최적화 (Sanitization)**: Gemini API의 요구사항에 맞게 이름을 조정합니다.
   - 문자가 아닌 특수 기호 등은 언더바(`_`)로 대체됩니다. (단, `-`, `.`, `:` 는 허용)
   - 63자를 초과하는 긴 이름은 중간을 생략(`...`)하여 길이를 맞춥니다.

### (3) 도구 명명 및 네임스페이스 (Tool naming and namespaces)
여러 서버 간의 이름 충돌이나 내장 도구와의 충돌을 방지하기 위해 엄격한 네임스페이스를 할당합니다.
1. **자동 FQN 할당**: 모든 MCP 도구에는 무조건 `mcp_{serverName}_{toolName}` 형식의 정규화된 이름(Fully Qualified Name)이 할당됩니다.
2. **레지스트리 추적**: 도구 레지스트리는 각 FQN과 원래 소스 서버를 매핑하여 관리합니다.
3. **덮어쓰기 규칙**: 설정에서 동일한 별칭을 사용하는 두 서버가 동일한 이름의 도구를 제공할 경우, 나중에 등록된 도구가 이전 도구를 덮어씁니다.
4. **정책 엔진 연동**: 자동 승인이나 거부 등 MCP 도구의 권한을 설정하려면 정책 엔진의 [MCP 도구 전용 구문](/docs/reference/policy-engine#special-syntax-for-mcp-tools)을 확인하세요.

> [!WARNING]
> **중요: MCP 서버 이름에 언더바(`_`)를 사용하지 마세요.**
> 정책 파서(Policy Parser)는 `mcp_` 접두사 다음에 오는 **첫 번째 언더바**를 기준으로 서버 이름을 식별합니다. 서버 이름에 언더바가 포함될 경우 서버 식별 오류가 발생하여 보안 정책이 정상적으로 작동하지 않을 수 있습니다.

<br/>

### (4) 스키마 처리 (Schema processing)
도구의 파라미터 스키마는 Gemini API 호환성을 위해 다음과 같이 정제됩니다.
- **`$schema` 속성** 제거
- **`additionalProperties`** 속성 제거
- **`anyOf` 내 `default` 값** 제거 (Vertex AI 호환성)
- 중첩된 스키마에 대해 **재귀적 처리** 적용

<br/>

### (5) 연결 관리 (Connection management)
- **연결 유지**: 하나 이상의 도구를 성공적으로 등록한 서버는 연결을 유지합니다.
- **연결 종료**: 유효한 도구가 하나도 없는 서버는 연결을 닫습니다.
- **상태 업데이트**: 최종 서버 상태를 `CONNECTED` 또는 `DISCONNECTED`로 확정합니다.

<br/>

## 6. 멀티모달 및 풍부한 콘텐츠 응답
MCP 도구는 단순 텍스트 외에도 이미지, 오디오 등 바이너리 데이터를 포함한 멀티파트 응답을 반환할 수 있습니다.
- 응답 내 `ContentBlock` 배열을 통해 `text`, `image`, `audio` 등을 혼합하여 반환하면, Gemini CLI가 이를 적절히 패키징하여 모델의 컨텍스트로 주입합니다.

<br/>

## 7. MCP 프롬프트를 슬래시 명령어로 사용
서버가 정의된 프롬프트를 노출하면 CLI 내에서 슬래시(`/`) 명령어로 즉시 호출할 수 있습니다.
- 예: `/poem-writer --title="My Poem" --mood="happy"`
- 이 명령은 서버의 `prompts/get` 메서드를 호출하여 완성된 텍스트를 모델에 전달합니다.

<br/>

## 8. 명령어 관리 (`gemini mcp`)
`settings.json`을 직접 수정하지 않고 터미널에서 서버를 쉽게 관리할 수 있습니다.

```bash
# 새 서버 추가 (Stdio 기본)
gemini mcp add my-server node ./server.js --env KEY=$VALUE

# SSE 서버 추가
gemini mcp add --transport sse sse-server https://example.com/sse

# 구성된 서버 목록 및 상태 확인
gemini mcp list

# 서버 일시 비활성화/활성화
gemini mcp disable my-server
gemini mcp enable my-server

# 서버 제거
gemini mcp remove my-server
```

<br/>
