# Gemini Sub-Agents
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="10%" alt="Gemini Banner" />
<br/>

Gemini CLI의 **Sub-Agent(서브 에이전트)**는 메인 세션 내에서 특정 전문 작업을 수행하도록 설계된 독립적인 AI 인스턴스입니다. 복잡한 코드 분석, 브라우징, 도움말 검색 등을 수행하며 메인 에이전트와 분리된 컨텍스트에서 작동하여 효율성을 극대화합니다.

<br/>

### 참고자료
- Gemini CLI 공식문서: https://geminicli.com/docs/core/subagents/

<br/>

### 1. Sub-Agent란 무엇인가?
서브 에이전트는 메인 에이전트가 특정 목적을 위해 "고용"하는 **'특수 요원'**입니다.

- **독립된 컨텍스트**: 서브 에이전트와의 대화는 별도의 루프에서 발생합니다. 이는 메인 세션의 컨텍스트(토큰 사용량)를 절약하고 히스토리가 섞이는 것을 방지합니다.
- **도구 위임**: 서브 에이전트는 메인 에이전트에게 하나의 '도구(Tool)'처럼 노출됩니다. 메인 에이전트가 이 도구를 호출하면 작업이 위임됩니다.
- **전문성 격리**: 서브 에이전트마다 고유의 시스템 프롬프트(Persona)와 부여된 도구 세트가 다를 수 있습니다.

<br/>

### 2. 사용 방법 (How to Use)
서브 에이전트를 사용하는 방법은 크게 두 가지가 있습니다.

#### ① 자동 위임 (Automatic Delegation)
메인 에이전트가 사용자의 질문을 분석하여 전문 지식이 필요하다고 판단되면 스스로 서브 에이전트를 호출합니다.
- 예: "인증 로직이 어떻게 구현되어 있어?" -> `codebase_investigator` 자동 호출

#### ② 수동 강제 호출 (@ 구문)
사용자가 특정 에이전트에게 직접 지시하고 싶을 때 프롬프트 시작 부분에 `@`와 에이전트 이름을 적습니다.
```bash
@codebase_investigator AgentRegistry 클래스의 의존성 구조를 분석해줘.
@cli_help /rewind 명령어의 사용법을 알려줘.
```

<br/>

### 3. 기본 내장 서브 에이전트 (Built-in Agents)
Gemini CLI는 설치 시 기본적으로 제공되는 강력한 내장 서브 에이전트들을 포함하고 있습니다.

#### ① codebase_investigator (코드베이스 조사관)
- **목적**: 대규모 코드베이스를 분석하고, 리버스 엔지니어링을 통해 복잡한 의존 관계를 파악합니다.
- **사용 시점**: "인증 로직이 어떻게 구현되어 있어?", "`AgentRegistry` 클래스의 의존 관계를 분석해줘."
- **설정 오버라이드**: 기본 활성화 상태이며, `settings.json`에서 모델이나 최대 턴 수를 조정할 수 있습니다.
  ```json
  {
    "agents": {
      "overrides": {
        "codebase_investigator": {
          "modelConfig": { "model": "gemini-3-flash-preview" },
          "runConfig": { "maxTurns": 50 }
        }
      }
    }
  }
  ```

#### ② cli_help (CLI 헬프 에이전트)
- **목적**: Gemini CLI 자체의 기능, 명령어, 설정 및 문서에 대한 지식을 제공합니다.
- **사용 시점**: "프록시 설정 어떻게 해?", "`/rewind` 명령어는 뭐야?"
- **설정**: 기본 활성화. 별도 설정 불필요.

#### ③ generalist_agent (제너럴리스트 에이전트)
- **목적**: 사용자의 요청을 분석하여 가장 적합한 전용 서브 에이전트에게 할당(라우팅)합니다.
- **사용 시점**: 메인 에이전트가 내부적으로 사용하며, 사용자가 직접 호출하지 않습니다.

#### ④ browser_agent (브라우저 에이전트 - 실험적)
웹 브라우저 작업을 자동화하여 웹사이트 탐색, 폼 입력, 데이터 추출 등을 수행합니다.

- **목적**: 접근성 트리를 사용하여 브라우저 인터랙션 자동화.
- **사용 시점**: "특정 사이트 이동 후 양식 작성해줘", "이 페이지에서 가격표 긁어와", "로그인 시도해줘".
- **필수 조건**:
  - **Chrome 버전 144 이상** 필요.
  - 내장 `chrome-devtools-mcp` 서버가 자동 실행되므로 별도 설치 불필요.

**활성화 및 세션 모드 (`settings.json`):**
기본 비활성화 상태이므로 수동으로 켜야 하며, `sessionMode`를 선택할 수 있습니다.
```json
{
  "agents": {
    "overrides": { "browser_agent": { "enabled": true } }
  },
  "browser": {
    "sessionMode": "persistent"
  }
}
```

| 세션 모드 | 설명 |
| :--- | :--- |
| **`persistent`** | (기본값) `~/.gemini/cli-browser-profile/` 경로에 쿠키, 방문 기록 등을 유지. |
| **`isolated`** | 임시 프로필을 사용하며 세션 종료 시 삭제됨. 깔끔한 자동화에 사용. |
| **`existing`** | 이미 실행 중인 Chrome(원격 디버깅 활성화됨)에 연결. |

**상세 구성 참조 (Configuration):**
| 설정 | 유형 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| **`sessionMode`** | String | `"persistent"` | Chrome 관리 방법: `"persistent"`, `"isolated"`, 또는 `"existing"`. |
| **`headless`** | Boolean | `false` | Chrome을 가상 화면에서 실행할지 여부. |
| **`profilePath`** | String | - | 브라우저 프로필 디렉터리에 대한 사용자 지정 경로. |
| **`visualModel`** | String | - | 시각적 작업(스크린샷 분석)을 위한 모델 재정의. |
| **`allowedDomains`** | String[] | - | 탐색 허용 도메인 제한 (예: `["github.com"]`). |
| **`disableUserInput`** | Boolean | `true` | 자동화 중 사용자 입력 차단 여부 (헤드리스 제외). |
| **`maxActionsPerTask`** | Number | 100 | 작업당 최대 도구 호출 횟수 제한. |
| **`confirmSensitiveActions`** | Boolean | `false` | `upload_file`, `evaluate_script` 시 수동 확인 필요 여부. |
| **`blockFileUploads`** | Boolean | `false` | 에이전트의 모든 파일 업로드 요청 차단 여부. |

**보안 및 제어 기능:**
- **도메인 제한**: `allowedDomains`에 지정된 도메인 외에는 접속 시 에이전트가 즉시 종료됩니다. 허용된 도메인을 프록시로 사용하여 우회하는 시도도 감지하여 차단합니다.
- **위험 URL 차단**: `file://`, `javascript:`, `data:text/html`, `chrome://extensions`, `chrome://settings/passwords` 등 위험한 체계를 차단합니다.
- **민감한 작업 확인**: 양식 작성(`fill`, `fill_form`)은 승인 모드와 관계없이 항상 정책 엔진을 통해 사용자 확인을 요구합니다.
- **입력 차단 및 오버레이**: 의도치 않은 간섭을 방지하기 위해 사용자 입력을 차단하고, 화면에 자동화 진행 중임을 알리는 오버레이를 표시합니다.

**시각 에이전트 (Visual Agent):**
"노란색 버튼 클릭해"와 같이 시각적 판별이 필요한 경우, `visualModel`을 설정하여 스크린샷 분석(`analyze_screenshot`) 기능을 활성화할 수 있습니다.
*참고: API Key 또는 Vertex AI 인증 시에만 사용 가능.*

**샌드박스 및 Docker 지원:**
- **macOS**: `sandbox-exec` 환경 시 영구 프로필 접근 제한으로 인해 강제로 `isolated` 및 `headless` 모드가 적용됩니다.
- **Docker**: 컨텍스트 내부의 브라우저를 쓸 수 없으므로 호스트의 Chrome에 연결해야 합니다.
  1. 호스트에서 `9222` 포트로 크롬 실행.
  2. `sessionMode: "existing"` 설정.
  3. 실행 시 `GEMINI_SANDBOX=docker SANDBOX_PORTS=9222 gemini` 명령 사용.

<br/>

### 4. 사용자 지정 서브 에이전트 생성 (Custom Subagents)
특정 워크플로를 자동화하거나 특정 페르소나를 적용하기 위해 사용자 지정 하위 에이전트를 직접 만들 수 있습니다.

#### ① 에이전트 정의 파일
사용자 지정 에이전트는 YAML 프런트매터가 포함된 Markdown 파일(`.md`)로 정의됩니다. 파일은 다음 위치에 배치할 수 있습니다.
- **프로젝트 수준**: `.gemini/agents/*.md` (팀원들과 공유 가능)
- **사용자 수준**: `~/.gemini/agents/*.md` (모든 프로젝트에서 개인적으로 사용)

#### ② 파일 형식 및 예시
파일은 반드시 세 개의 대시(`---`)로 묶인 YAML 형식의 프런트매터로 시작해야 합니다. 마크다운 본문은 해당 에이전트의 **시스템 프롬프트(System Prompt)**가 됩니다.

> [!IMPORTANT]
> **`description` 필드의 중요성**: 메인 에이전트가 사용자의 요청을 분석하여 어떤 서브 에이전트에게 작업을 위임할지 결정하는 가장 중요한 기준은 `description`에 적힌 내용입니다. 따라서 에이전트의 전문 분야와 사용 시나리오를 상세하고 명확하게 작성해야 자동 위임이 정확하게 작동합니다.

**예시: `.gemini/agents/security-auditor.md`**
```markdown
---
name: security-auditor
description: 코드의 보안 취약점을 전문적으로 찾는 에이전트입니다.
kind: local
tools:
  - read_file
  - grep_search
model: gemini-3-flash-preview
temperature: 0.2
max_turns: 10
---

너는 무자비한 보안 감사관이야. 네 임무는 코드에서 잠재적인 취약점을 분석하는 것이다.
다음 사항에 집중해:
1. SQL 인젝션
2. XSS (Cross-Site Scripting)
3. 하드코딩된 자격 증명
4. 안전하지 않은 파일 작업

취약점을 발견하면 명확하게 설명하고 수정을 제안해. 직접 수정하지 말고 보고만 할 것.
```

#### ③ 실행 및 호출 방법
정의된 사용자 지정 서브 에이전트는 다음과 같이 두 가지 방식으로 실행할 수 있습니다.

- **수동 호출**: 명령어 시작 부분에 `@`와 에이전트 이름을 명시하여 즉시 작업을 맡깁니다.
  - 예: `@security-auditor 우리 프로젝트 코드 중에 하드코딩된 비밀번호나 위험한 SQL 쿼리가 있는지 전수조사해줘`
- **자동 위임**: 메인 에이전트에게 자연어로 요청하면, 등록된 에이전트의 `description`을 분석하여 가장 적합한 에이전트에게 작업을 자동으로 넘깁니다.
  - 예: `우리 프로젝트 코드 중에 하드코딩된 비밀번호나 위험한 SQL 쿼리가 있는지 전수조사해줘`

<br/>

#### ④ 구성 스키마 (Configuration Schema)
프런트매터에서 사용할 수 있는 필드와 상세 설명입니다.

| 필드 | 유형 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| **`name`** | String | 예 | 에이전트의 고유 식별자(Slug). 소문자, 숫자, 하이픈, 밑줄만 가능하며 도구 이름으로 사용됩니다. |
| **`description`** | String | 예 | 에이전트의 역할 설명. 메인 에이전트가 이 서브 에이전트를 호출할지 결정하는 핵심 정보입니다. |
| **`kind`** | String | 아니오 | `local`(기본값) 또는 `remote`. |
| **`tools`** | Array | 아니오 | 사용 가능한 도구 목록. 와일드카드(`*`, `mcp_*`) 지원. 생략 시 상위 세션 도구 상속. |
| **`mcpServers`** | Object | 아니오 | 해당 에이전트에 한정된 인라인 MCP 서버 구성. |
| **`model`** | String | 아니오 | 사용할 모델 (예: `gemini-3-preview`). 기본값은 `inherit`(메인 세션 모델). |
| **`temperature`** | Number | 아니오 | 모델 온도 (0.0 - 2.0). 기본값은 1. |
| **`max_turns`** | Number | 아니오 | 한 세션에서 허용되는 최대 대화 턴 수. 기본값은 30. |
| **`timeout_mins`** | Number | 아니오 | 최대 실행 시간(분). 기본값은 10. |

#### ⑤ 도구 와일드카드 (Tool Wildcards)
`tools` 필드에서 와일드카드를 사용하여 여러 도구에 대한 권한을 빠르게 부여할 수 있습니다.
- `*`: 사용 가능한 모든 내장 및 검색된 도구에 접근 허용.
- `mcp_*`: 연결된 모든 MCP 서버의 모든 도구에 접근 허용.
- `mcp_my-server_*`: 특정 MCP 서버(`my-server`)의 모든 도구에 접근 허용.

#### ⑥ 격리 및 재귀 보호 (Isolation & Recursion Protection)
각 하위 에이전트는 독립된 컨텍스트 루프에서 실행되어 다음과 같은 특징을 가집니다.
- **독립적인 기록**: 서브 에이전트의 대화 기록은 메인 에이전트의 컨텍스트를 불필요하게 확장시키지 않습니다.
- **격리된 도구**: 명시적으로 권한을 부여한 도구에만 접근할 수 있습니다.
- **재귀 방지 (중요)**: 무한 루프와 토큰 낭비를 방지하기 위해 **서브 에이전트는 다른 서브 에이전트를 호출할 수 없습니다.** (`*` 와일드카드가 있어도 다른 에이전트는 보이지 않습니다.)

<br/>

### 5. 서브 에이전트 도구 격리 (Subagent Tool Isolation)
서브 에이전트 도구 격리 기능을 통해 Gemini CLI는 단일 글로벌 도구 레지스트리에서 벗어날 수 있습니다. 격리된 실행 환경을 제공함으로써 서브 에이전트가 설계된 시스템 부분과만 상호 작용하도록 보장할 수 있습니다. 이는 의도치 않은 부작용을 방지하고, 상태 오염을 막아 안정성을 향상시키며, 세밀한 권한 제어를 가능하게 합니다.

이 기능을 사용하면 다음과 같은 작업을 수행할 수 있습니다.
- **도구 접근 권한 지정**: `tools` 에이전트 정의에서 목록을 사용하여 에이전트가 접근할 수 있는 도구를 정확하게 정의합니다.
- **인라인 MCP 서버 정의**: 모델 컨텍스트 프로토콜(MCP) 서버를 하위 에이전트의 마크다운 프런트매터에 직접 구성하여 해당 에이전트에만 적용되도록 합니다.
- **상태 격리 유지**: 하위 에이전트가 자체 도구 및 서버 세트와만 상호 작용하도록 하여 부작용 및 상태 오염을 방지합니다.
- **하위 에이전트별 정책 적용**: 실행 중인 하위 에이전트의 이름을 기반으로 정책 엔진 TOML 구성에서 세부적인 규칙을 적용합니다.

#### ① 격리된 도구 및 서버 구성
하위 에이전트의 마크다운 프런트매터를 업데이트하여 도구 격리를 구성할 수 있습니다. `mcpServers` 객체를 추가하여 에이전트별로 고유한 인라인 MCP 서버를 정의할 수 있습니다.

**예시:**
```markdown
---
name: my-isolated-agent
tools:
  - grep_search
  - read_file
mcpServers:
  my-custom-server:
    command: 'node'
    args: ['path/to/server.js']
---
```

#### ② 하위 에이전트별 정책 (policy.toml)
정책 엔진의 TOML 구성을 사용하면 CLI 세션의 나머지 부분에 영향을 주지 않고 특정 에이전트에 대한 권한을 부여하거나 제한할 수 있습니다. 특정 하위 에이전트에 정책 규칙을 적용하려면 `policy.toml` 파일의 `[[rules]]` 블록에 `subagent` 속성을 추가합니다.

**예시 (`policy.toml`):**
```toml
[[rules]]
name = "Allow pr-creator to push code"
subagent = "pr-creator"
description = "Permit pr-creator to push branches automatically."
action = "allow"
toolName = "run_shell_command"
commandPrefix = "git push"
```
*참고: `subagent` 속성이 없는 규칙은 모든 에이전트에 일괄적으로 적용됩니다.*

<br/>

### 6. 하위 에이전트 관리 (Managing Subagents)
`/agents` 명령어를 사용하여 대화형으로 관리하거나 `settings.json`을 통해 지속적으로 관리할 수 있습니다.

#### ① 대화형 관리 (`/agents`)
구성 파일을 수동으로 편집하지 않고도 실시간으로 서브 에이전트를 관리할 수 있습니다. 에이전트를 신속하게 활성화, 비활성화 또는 재구성하는 데 권장되는 방법입니다. 상세 사용법은 `/agents --help`를 참조하십시오.

#### ② 영구 설정 (`settings.json`)
모든 세션에 걸쳐 특정 모델이나 실행 제한을 적용하는 데 유용합니다.

**`agents.overrides`**
특정 에이전트를 활성화/비활성화하거나 실행 구성을 재정의합니다.
```json
{
  "agents": {
    "overrides": {
      "security-auditor": {
        "enabled": false,
        "runConfig": {
          "maxTurns": 20,
          "maxTimeMinutes": 10
        }
      }
    }
  }
}
```

**`modelConfigs.overrides`**
`overrideScope` 필드를 사용하여 특정 하위 에이전트에 사용자 지정 모델 설정(온도, 안전 설정 등)을 적용합니다.
```json
{
  "modelConfigs": {
    "overrides": [
      {
        "match": { "overrideScope": "security-auditor" },
        "modelConfig": {
          "generateContentConfig": {
            "temperature": 0.1
          }
        }
      }
    ]
  }
}
```

<br/>

### 7. 하위 에이전트 최적화 (Optimization)
메인 에이전트는 **에이전트 설명(Description)**에 따라 해당 에이전트가 관련 전문가인지 여부를 판단합니다. 설명을 명확하게 작성하면 호출의 신뢰성을 높일 수 있습니다.

**설명에 포함해야 할 핵심 사항:**
- **전문 분야**: 에이전트가 가장 잘하는 일.
- **사용 시점**: 어떤 질문이나 작업 시 호출되어야 하는가.
- **예시 시나리오**: 구체적인 작업 예시.

**최적화된 예시 (Git 전문가 에이전트):**
> "로컬 및 원격 Git 작업에 모두 사용해야 하는 Git 전문가 에이전트입니다. 예를 들어: 커밋하기, 이분법(bisect)을 이용한 회귀 분석, GitHub와 같은 소스 코드 관리 및 이슈 제공업체와의 상호 작용 시 사용됩니다."

**디버깅 팁:**
하위 에이전트가 특정 프롬프트에서 호출되지 않는다면, `/model` 명령어로 최적화할 모델을 선택한 후 **"왜 이 설명이 있는 하위 에이전트를 호출하지 않았니?"**라고 모델에게 직접 이유를 물어볼 수 있습니다.

<br/>

### 8. 기타 기능
- **원격 서브 에이전트 (Agent2Agent)**: A2A 프로토콜을 통해 다른 원격지에 있는 서브 에이전트에게 작업을 위임할 수 있습니다.
- **에이전트 기능 비활성화**: 실험적 기능을 완전히 끄고 싶다면 `settings.json`에서 `enableAgents`를 `false`로 설정합니다.

<br/>

### 9. Skill vs Sub-Agent 비교

| 구분 | Agent Skills (지침) | Sub-Agents (요원) |
| :--- | :--- | :--- |
| **핵심 목적** | 업무 절차(SOP) 가이드라인 제공 | **완전 격리된 작업 수행** |
| **컨텍스트** | **메인 컨텍스트에 추가됨** | **독립된 컨텍스트 루프에서 작동** |
| **파일 위치** | `.gemini/skills/SKILL.md` | `.gemini/agents/*.md` |
| **적합한 상황** | "이 순서대로 코딩해줘" (규칙 준수) | "이 코드를 정밀 분석해와" (작업 위임) |

---
**Tip**: Gemini CLI에서는 컨텍스트 윈도우가 크기 때문에(2M) 대부분의 작업을 메인에서 처리할 수 있지만, 정밀한 분석이나 브라우징이 필요한 경우 Sub-Agent를 사용하는 것이 훨씬 정확하고 효율적입니다.
