# 3. MCP (Model Context Protocol) - Gemini

Model Context Protocol(MCP)은 AI 모델이 로컬 데이터, 도구 또는 타사 서비스와 상호작용할 수 있도록 하는 개방형 표준입니다. Gemini CLI에서 MCP를 사용하면 Gemini의 강력한 추론 능력에 실시간 데이터를 결합할 수 있습니다.

---

## 1. Github MCP 연동 예제

Gemini CLI에서 Github MCP를 연동하여 소스 코드 관리, Issue/PR 조회 및 생성을 자동화하는 설정 방법입니다.

### 1.1 준비 사항
*   **Github Personal Access Token (PAT):** Github 계정 설정에서 생성합니다. (Metadata/Contents `Read`, Issues/PRs `Read/Write` 권한 권장)
*   **Gemini CLI 설치:** 최신 버전의 Gemini CLI(0.35.3 이상)가 필요합니다.

### 1.2 설정 방법 (`settings.json`)
사용자의 홈 디렉터리에 있는 `.gemini/settings.json` 파일(또는 프로젝트 내 `.gemini/settings.json`)에 다음과 같이 MCP 서버 설정을 추가합니다.

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_github_pat_here"
      }
    }
  }
}
```

> [!TIP]
> 보안을 위해 토큰을 직접 설정 파일에 적기보다 환경 변수(`env`)를 통해 참조하거나, 로컬 셸 환경에서 `export GITHUB_PERSONAL_ACCESS_TOKEN=...`을 수행한 뒤 사용하세요.

### 1.3 사용 예시
설정이 완료되면 Gemini CLI를 재시작한 후 자연어로 명령할 수 있습니다.
*   "현재 저장소의 오픈된 Issue 목록을 가져와줘."
*   "방금 수정한 내용에 대해 PR을 생성해줘."
*   "특정 파일의 커밋 히스토리를 요약해줘."

---

## 2. PPT 생성 MCP (Custom MCP) 예제

회의록이나 분석 결과를 바탕으로 즉석에서 PowerPoint(.pptx) 발표 자료를 생성해주는 MCP 활용 예제입니다.

### 2.1 준비 사항
*   **Python 환경:** 대부분의 PPT MCP는 `python-pptx` 라이브러리를 기반으로 동작하므로 Python 환경이 필요합니다.
*   **서버 설치:** 오픈소스 고정 서버를 사용하거나 `uvx`를 통해 즉시 실행할 수 있습니다.

### 2.2 설정 방법 (`settings.json`)
`uvx`를 사용하여 PowerPoint MCP 서버를 연동하는 설정 예시입니다.

```json
{
  "mcpServers": {
    "powerpoint": {
      "command": "uvx",
      "args": [
        "--from",
        "office-powerpoint-mcp-server",
        "ppt_mcp_server"
      ]
    }
  }
}
```

### 2.3 사용 예시
텍스트 데이터나 분석 결과를 PPT로 전환하도록 명령할 수 있습니다.
*   "오늘 회의록 내용을 요약해서 5페이지 분량의 전략 보고서 PPT를 만들어줘."
*   "현재 프로젝트의 구조를 설명하는 기술 명세서 슬라이드를 생성해줘."
*   "제목 슬라이드, 내용 슬라이드 3개, 결론 슬라이드 1개를 포함한 'presentation.pptx' 파일을 저장해줘."

---

## 3. 커스텀 MCP의 특징

커스텀 MCP는 단순한 API 호출을 넘어 LLM에게 '손과 발'을 달아주는 역할을 합니다.

1.  **규격화된 인터페이스:** 모델은 내부 구현을 알 필요 없이 MCP가 제공하는 표준화된 도구(Tools), 리소스(Resources), 프롬프트(Prompts) 규격에 맞춰 명령을 내립니다.
2.  **동적 확장성:** 새로운 서버를 추가하기만 하면 모델의 기능을 무한히 확장할 수 있습니다. (예: DB 조회, 로컬 파일 분석, 검색 엔진 연동 등)
3.  **상태 관리:** MCP 서버 내에서 필요한 상태를 유지하거나 복잡한 워크플로우를 처리할 수 있어, 모델의 컨텍스트 부담을 줄여줍니다.

---

## 4. MCP 사용 시 지켜야 할 원칙

MCP는 LLM에게 강력한 권한을 부여하므로 다음의 원칙을 준수해야 합니다.

1.  **최소 권한의 원칙 (Least Privilege):** 
    *   Github PAT 등에 필요한 권한만 부여하세요. 모든 권한(Full Access)을 부여하면 모델의 실수나 오작동 시 위험이 커집니다.
2.  **컨텍스트 최적화:** 
    *   너무 많은 도구를 동시에 활성화하면 모델이 혼란을 겪거나 토큰 사용량이 급증할 수 있습니다. 필요한 도구만 선택적으로 로드하세요.
3.  **명확한 도구 설명 (Description):** 
    *   MCP 서버를 직접 개발할 경우, 각 도구의 용도와 매개변수를 LLM이 이해하기 쉬운 자연어로 상세히 설명해야 합니다.
4.  **보안 및 신뢰:** 
    *   신뢰할 수 없는 써드파티 MCP 서버를 실행하지 마세요. (Docker 등 격리된 환경 사용 권장)

---

## 5. Gemini MCP vs Claude MCP (장점 비교)

Claude Desktop이 MCP의 대중화를 이끌었지만, Gemini CLI 환경에서의 MCP 사용은 다음과 같은 차별화된 이점을 가집니다.

| 특징 | Claude MCP | **Gemini MCP (Advantage)** |
| :--- | :--- | :--- |
| **컨텍스트 윈도우** | 최대 200k (비교적 작음) | **1M ~ 2M+ 토큰 지원.** MCP를 통해 대량의 문서나 복잡한 코드베이스를 불러와도 '기억력' 손실 없이 처리가 가능합니다. |
| **성능 및 비용** | Opus/Sonnet 사용 시 비용 발생 | **Gemini 2.0 Flash** 모델 연동 시, 압도적으로 빠른 속도와 저렴한 비용으로 에이전틱 루프를 수행할 수 있습니다. |
| **네이티브 생태계** | 주로 Desktop App 중심 | **CLI 및 Google Workspace 연동.** 개발자 워크플로우(CLI)에 최적화되어 있으며, 향후 Google Docs, Sheets 등과의 네이티브 연동에서 우위를 가집니다. |
| **추론 효율성** | 도구 호출 시 정교함 위주 | **입력 토큰 캐싱(Context Caching).** 자주 사용하는 MCP 리소스 데이터를 캐싱하여 반복적인 연산 비용과 응답 시간을 획기적으로 줄일 수 있습니다. |

**결론적으로,** Gemini의 광활한 컨텍스트 윈도우는 MCP가 가져오는 방대한 데이터를 처리하기에 최적화된 그릇이며, 이는 복잡한 대규모 프로젝트 분석에서 Claude 대비 강력한 경쟁력이 됩니다.
