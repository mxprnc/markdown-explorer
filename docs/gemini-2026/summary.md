subagent
* 서브 에이전트는 메인 에이전트가 특정 목적을 위해 "고용"하는 **'특수 요원'**입니다.
* 문서
  * [subagent](./02-subagent---gemini.md)
  * [remote subagent](./02-remote-subagent---official-docs.md)

<br/>

skills
* 워크스페이스 전반에 걸쳐 지속적인 배경 지식을 제공하는 [`GEMINI.md`](/docs/cli/gemini-md)와 다르다. 
* Skills는 **"필요할 때만 호출되는 전문가(On-demand Expertise)"**
* 문서
  * [skills](./02-skills---gemini-official-docs.md)

<br/>

commands
* 자주 사용하거나 복잡한 프롬프트를 나만의 **단축키(Shortcut)**로 저장하고 재사용할 수 있습니다. 
* 특정 프로젝트에 최적화된 명령어부터 모든 작업에 공통으로 쓰이는 전역 명령어까지 유연하게 구성하여 작업의 효율성과 일관성을 높일 수 있습니다.
* 문서
  * [commands](./05-custom-commands---gemini-official-docs.md)

<br/>

mcp
* MCP 서버는 **Model Context Protocol**을 통해 Gemini CLI에 도구와 리소스를 노출하는 애플리케이션입니다. 
* 이를 통해 Gemini 모델은 로컬 환경이나 외부 API 서비스와 상호작용할 수 있는 브릿지 역할을 수행합니다.
* 문서
  * [mcp](./03-mcp---gemini-mcp-official-docs.md)
  * [mcp setup](./03-mcp---gemini-mcp-setup-official-docs.md)
  * [mcp advanced config](./03-mcp---gemini-mcp-advanced-config-official-docs.md)

<br/>

hooks
* 후크는 Gemini CLI의 에이전트 루프 특정 시점에 자동으로 실행되는 스크립트나 프로그램입니다. 
* 이를 통해 CLI 본체의 소스 코드를 건드리지 않고도 동작을 가로채거나 사용자 정의 로직을 삽입할 수 있습니다.
* 문서
  * [hooks](./04-hooks---gemini-official-docs.md)

<br/>
