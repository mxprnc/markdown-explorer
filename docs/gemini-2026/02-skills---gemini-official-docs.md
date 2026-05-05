# Agent Skills (에이전트 스킬)
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="10%" alt="Gemini Banner" />

<br/>

**Agent Skills**는 Gemini CLI의 기능을 특정 전문 지식, 절차적 워크플로우 및 작업 전용 리소스로 확장할 수 있게 해주는 기능입니다. 이 기능은 [Agent Skills](https://agentskills.io) 오픈 표준을 기반으로 하며, 독립된 폴더 내의 지침(SOP)과 자산(Assets)을 하나의 실행 가능한 '기술(Capability)'로 패키징하여 사용합니다.

<br/>

## 1. 개요 (Overview)
워크스페이스 전반에 걸쳐 지속적인 배경 지식을 제공하는 [`GEMINI.md`](/docs/cli/gemini-md)와 달리, Skills는 **"필요할 때만 호출되는 전문가(On-demand Expertise)"**를 의미합니다. 이를 통해 모델의 메인 컨텍스트 윈도우를 깨끗하게 유지하면서도 보안 감사, 클라우드 배포, 코드베이스 마이그레이션과 같은 복잡한 전문 작업을 효율적으로 수행할 수 있습니다.

Gemini는 사용자의 요청과 각 스킬의 설명을 분석하여 언제 스킬을 사용할 지 자율적으로 결정합니다. 관련 스킬이 식별되면 모델은 `activate_skill` 도구를 사용하여 해당 작업을 완료하는 데 필요한 전체 지침과 리소스를 "불러옵니다(Pull-in)".

<br/>

### 주요 장점 (Key Benefits)
- **전문 지식 공유**: 특정 팀의 PR 리뷰 프로세스 같은 복잡한 워크플로우를 누구나 사용할 수 있는 폴더 형태로 패키징할 수 있습니다.
- **반복 가능한 워크플로우**: 절차적 프레임워크를 제공함으로써 다단계 작업이 항상 일관된 방식으로 수행되도록 보장합니다.
- **리소스 번들링**: 단순한 텍스트 지침 외에도 스크립트, 템플릿, 예제 데이터를 함께 포함하여 에이전트가 작업에 필요한 모든 도구를 즉시 갖추게 합니다.
- **컨텍스트 절약 (Progressive Disclosure)**: 초기에는 스킬의 이름과 설명만 로드됩니다. 상세 지침은 에이전트가 실제로 스킬을 활성화할 때만 로드되므로 토큰 사용량을 최적화할 수 있습니다.

<br/>

## 2. 스킬 탐색 계층 및 우선순위 (Discovery Tiers)
Gemini CLI는 다음 세 가지 주요 위치에서 스킬을 탐색합니다.

1.  **Workspace Skills**: `.gemini/skills/` 또는 `.agents/skills/` (별칭). 프로젝트 전용이며 팀원들과 Git을 통해 공유됩니다.
2.  **User Skills**: `~/.gemini/skills/` 또는 `~/.agents/skills/` (별칭). 모든 프로젝트에서 전역적으로 사용 가능한 개인용 스킬입니다.
3.  **Extension Skills**: 설치된 [확장 프로그램](/docs/extensions)에 포함된 스킬입니다.

**우선순위 규칙 (Precedence):**
- 계층 간 우선순위: **Workspace > User > Extension** (동일 이름일 경우)
- 동일 계층 내 우선순위: **`.agents/skills/`** 디렉토리가 `.gemini/skills/`보다 우선권을 가집니다.

<br/>

## 3. 스킬 관리 명령어

### ① 대화형 세션 중 (`/skills`)
세션 내부에서 `/skills` 명령어를 사용하여 실시간으로 관리합니다.
- `/skills list` (기본): 발견된 모든 스킬의 목록과 현재 상태를 보여줍니다.
- `/skills link <path>`: 로컬 디렉토리의 스킬을 심볼릭 링크로 연결합니다.
- `/skills disable <name>`: 특정 스킬 사용을 일시적으로 중지합니다.
- `/skills enable <name>`: 비활성화된 스킬을 다시 활성화합니다.
- `/skills reload`: 모든 계층에서 스킬 목록을 다시 읽어옵니다.

> [!NOTE]
> `/skills disable` 및 `enable`은 기본적으로 `user` 범위를 대상으로 합니다. 워크스페이스 전용 설정을 관리하려면 `--scope workspace` 옵션을 사용하세요.

### ② 터미널 명령행 (`gemini skills`)
세션 밖에서 시스템 전역 또는 프로젝트별 스킬을 관리할 수 있는 도구입니다.

```bash
# 발견된 모든 스킬 목록 확인
gemini skills list

# 로컬 스킬 저장소를 심볼릭 링크로 연결 (Workspace 범위 지정 가능)
gemini skills link /path/to/my-skills-repo --scope workspace

# 스킬 설치 (Git, 로컬 폴더, .skill 파일 지원)
gemini skills install https://github.com/user/repo.git
gemini skills install /path/to/local/skill --scope workspace

# 모노레포 등에서 특정 경로의 스킬만 설치 시
gemini skills install https://github.com/my-org/my-skills.git --path skills/frontend-design

# 특정 스킬 삭제 (이름 기준)
gemini skills uninstall my-expertise --scope workspace

# 전역적으로 스킬 활성화/비활성화
gemini skills enable my-expertise
gemini skills disable my-expertise --scope workspace
```

<br/>

## 4. 작동 원리 및 프로세스 (How it Works)

1.  **탐색 (Discovery)**: 세션 시작 시, Gemini CLI는 탐색 계층을 스캔하고 활성화된 모든 스킬의 이름과 설명을 메인 시스템 프롬프트에 주입합니다.
2.  **활성화 (Activation)**: 모델이 사용자의 태스크가 특정 스킬의 설명과 일치한다고 판단하면 `activate_skill` 도구를 호출합니다.
3.  **동의 (Consent)**: **사용자 인터페이스(UI)에 스킬 이름, 목적, 해당 스킬이 접근하게 될 디렉토리 경로가 표시되며 사용자에게 실행 승인을 요청합니다.**
4.  **주입 (Injection)**: 사용자가 승인하면:
    - `SKILL.md` 본문과 관련 폴더 구조가 대화 히스토리에 추가됩니다.
    - 해당 스킬 디렉토리가 허용된 파일 경로에 추가되어 에이전트가 번들된 자산을 읽을 수 있게 됩니다.
5.  **실행 (Execution)**: 에이전트가 전문 지식을 활성화한 상태로 작업을 진행합니다. 이때 에이전트는 스킬에 기술된 절차적 가이드라인을 최우선으로 준수합니다.

---
**Tip**: 스킬이 활성화되면 세션이 지속되는 동안 해당 전문 지식이 유지되며, 에이전트는 스킬에 정의된 지침을 우선적으로 따르게 됩니다.