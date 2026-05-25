# Gemini CLI 공식 가이드 (Korean) / 2026
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="20%" alt="Gemini Banner" />

<br/>

Gemini CLI는 터미널 환경에 최적화된 강력한 AI 코딩 에이전트입니다. 이 가이드는 Gemini CLI의 설치부터 고도의 자동화 및 보안 설정까지 모든 핵심 기능을 한국어로 상세히 안내합니다.

<br/>

## Notice
이 문서는 2026년도의 가이드 문서의 업데이트 내용들만을 주기적으로 업데이트해나갈 예정이며, 2027년도 이후에는 관리하지 않을 계획이며, 2027년에는 새로운 디렉터리로 새로운 버전의 문서로 작업을 시작할 가능성이 높습니다.<br/>

2026년도에만 유효한 디렉터리임을 인지하고 사용해주세요.<br/>
<br/>

## 📚 가이드 목차

### 1. 기본 사용 가이드 (Core Basics)
AI와 협업하기 위한 가장 본질적인 설정과 도구들을 다룹니다.
- [기본 최적화 및 팁](./1-basic-part2---optimization.md): 요금제별 성능 최적화.
- [GEMINI.md 컨텍스트](./1-basic-part3---project-context.md): 프로젝트 전용 지침 관리.
- [파일 무시 (.geminiignore)](./1-basic-part4---ignore-files.md): AI의 탐색 범위 제어.
- [신뢰할 수 있는 폴더](./1-basic-part5---trusted-folders.md): 프로젝트 권한 및 보안 모드.
- [테마 설정](./1-basic-part6---themes.md): 터미널 UI 색상 및 스타일 커스텀.

### 2. 생산성 및 확장 (Productivity & Extensions)
CLI의 기능을 외부 세계와 연결하고 자동화하는 고급 기술입니다.
- [MCP (Model Context Protocol)](./3-mcp---gemini-mcp-official-docs.md): 도구 및 정보 소스 확장.
- [커스텀 명령어](./5-custom-commands---gemini-official-docs.md): 나만의 단축키 및 동적 데이터 주입.
- [원격 서브에이전트](./02-remote-subagent---official-docs.md): 외부 AI 에이전트와 A2A 협업.
- [헤드리스 모드 (Automation)](./4-headless-mode---gemini-official-docs.md): CI/CD 및 자동 스크립팅 활용.

### 3. 안전 및 복구 (Safety & Recovery)
코드의 안전을 보장하고 실수를 즉시 되돌리는 안정성 기능입니다.
- [샌드박싱 (Sandboxing)](./7-sandboxing---gemini-official-docs.md): 격리된 환경에서의 안전한 실행.
- [되돌리기 (Rewind)](./8-rewind---gemini-official-docs.md): 대화 및 코드 상태를 이전으로 복구.
- [체크포인팅 (Checkpointing)](./9-checkpointing---gemini-official-docs.md): 자동 스냅샷 및 복원 메커니즘.
- [플랜 모드 (Plan Mode)](./5-plan-mode---gemini-official-docs.md): 설계와 구현을 분리한 안전한 작업.

### 4. 레퍼런스 및 운영 (Refs & Ops)
전문적인 운영과 비용 관리를 위한 가이드입니다.
- [전체 설정 가이드](./12-settings---gemini-official-docs.md): `settings.json` 전체 항목 상세 설명.
- [비용 및 토큰 최적화](./13-cost-optimization---gemini-official-docs.md): 토큰 캐싱을 통한 요금 절감.
- [모델 라우팅](./10-model-routing---gemini-official-docs.md): 모델 가용성 및 Fallback 설정.
- [텔레메트리](./14-telemetry---gemini-official-docs.md): 로그 수집 및 관측성(Observability) 설정.

---
**팁**: 특정 기능에 대해 더 자세히 알고 싶다면 위 목차의 링크를 클릭하여 해당 상세 가이드로 이동해 보세요. 🚀


## 그 밖의 다루지 않은 내용들
모델
- Gemini CLI 모델 선택 : https://geminicli.com/docs/cli/model/
- Model steering : https://geminicli.com/docs/cli/model-steering/
- Notifications : https://geminicli.com/docs/cli/notifications/

Configuration
- Enterprise Configuration : https://geminicli.com/docs/cli/enterprise/
- Model configuration : https://geminicli.com/docs/cli/generation-settings/
- System prompt override : https://geminicli.com/docs/cli/system-prompt/

Development
- Contribution guide : https://geminicli.com/docs/contributing/
- Integration tests : https://geminicli.com/docs/integration-tests/
- Issue and PR automation : https://geminicli.com/docs/issue-and-pr-automation/
- Local development : https://geminicli.com/docs/local-development/
- NPM package structure : https://geminicli.com/docs/npm/

<br/>

## 이 문서의 작성자
목차나 방향, 파일 구조 등은 직접 사람이 개입했지만, 실제 공식 문서 전체의 구체적인 내용의 요약은 Gemini 3 Flash 의 도움을 90% 이상 받아서 정리했습니다. basic-part1 \~ basic-part2까지의 내용은 모두 주관적으로 요약한 좁은 범위의 내용이지만 시간이 지나면서 여러가지 내용들을 다루기 위해 이번 가이드 문서 디렉터리를 Gemini 3 Flash 를 이용해 작업했습니다.<br/>
<br/>


