## Gemini CLI 에서 Claude Code 의 Sub Agent 기능 지원여부
결론부터 이야기하자면, 서브에이전트는 지원하지 않는다. 대신 MCP 도구를 사용해라.

다음은 'Gemini CLI 에서 Claude Code 의 Sub Agent 비슷한 기능이 지원되는지? 비슷한 기능이 있다면 어떤 개념인지' 에 대한 Gemini 의 답변이다.<br/>
<br/>


#### A
Gemini CLI는 Claude Code와 같은 명시적인 `Sub Agent` 명령어를 별도로 두기보다는, **'에이전틱 도구 호출(Agentic Tool-Use)'**과 **'MCP(Model Context Protocol) 서버'**를 통해 동일한 기능을 구현합니다.

### 1. 핵심 개념: 도구가 곧 서브 에이전트
Claude가 별도의 에이전트 인스턴스를 생성한다면, Gemini는 각 태크스에 특화된 **MCP 도구들을 서브 에이전트처럼 오케스트레이션(Orchestration)** 합니다. 예를 들어, 코드를 작성하는 Gemini(메인)가 파일 시스템 도구, GitHub MCP, 브라우저 도구 등을 각각의 전문 하위 요원으로 부리는 방식입니다.

### 2. 예제: 블로그 댓글 기능 구현 시나리오
Gemini CLI에서 복잡한 작업을 지시하면 내부적으로 다음과 같이 전문화된 도구(서브 에이전트 역할)를 호출합니다.

```markdown
사용자 요청: "GitHub에 브랜치를 만들고 댓글 기능을 구현한 뒤 PR까지 올려줘."

Gemini의 에이전틱 흐름 (Sub Agent 역할 수행):
1. [Git Sub-Agent 역할]: `github_mcp` 도구를 호출하여 새 브랜치 `feature/comments` 생성
2. [Code Sub-Agent 역할]: `write_to_file` 도구를 사용하여 스키마 및 API 로직 구현
3. [Test Sub-Agent 역할]: `run_command` 도구로 `npm test`를 실행하여 직접 검증
4. [Review Sub-Agent 역할]: 다시 `github_mcp`를 호출하여 구현된 내용을 바탕으로 PR 생성 및 요약 작성
```

### 요약
- **개념**: **지능형 도구 위임(Delegation to Tools)**.
- **차이점**: Claude는 '에이전트 인스턴스' 중심의 분리라면, Gemini는 '도구(MCP) 중심의 전문화'를 통해 컨텍스트를 유지하면서 멀티태스킹을 수행합니다. 
- **장점**: 모든 기록이 하나의 세션 내에서 도구 호출 로그로 남기 때문에, 메인 에이전트가 하위 작업의 결과를 훨씬 더 정확하게 추론 과정에 반영할 수 있습니다.