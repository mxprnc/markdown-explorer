# 원격 서브에이전트 (Remote Subagents) 가이드
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="10%" alt="Gemini Banner" />

<br/>

## 출처
- Remote Subagents guide : https://geminicli.com/docs/core/remote-agents/

<br/>

## 1. 원격 서브에이전트란 무엇인가?
Gemini CLI는 **A2A (Agent-to-Agent)** 프로토콜을 통해 외부에 있는 다른 AI 에이전트와 통신할 수 있습니다. 이를 통해 Gemini CLI의 기본 역량을 넘어, 특정 전문 분야를 가진 원격 서비스에 작업을 위임하거나 사내 구축된 다른 AI 시스템을 연동하여 활용할 수 있습니다.

<br/>

## 2. 원격 서브에이전트 정의 방법
원격 에이전트는 마크다운(`.md`) 파일에 YAML 프론트매터를 포함하여 정의합니다.

- **프로젝트 레벨**: `.gemini/agents/*.md` (팀원과 공유)
- **사용자 레벨**: `~/.gemini/agents/*.md` (로그인된 사용자 전역에서 공유)

### 설정 스키마 (Configuration)
- **`kind`**: 반드시 `remote`여야 합니다.
- **`name`**: 에이전트의 고유 식별자.
- **`agent_card_url`**: 에이전트의 기능 명세(Agent Card)가 있는 URL입니다. (URL이 없는 경우 `agent_card_json`으로 직접 작성 가능)
- **`auth`**: 에이전트 호출 시 필요한 인증 정보입니다.

<br/>

## 3. 강력한 인증 (Authentication) 및 보안
리모트 에이전트와의 안전한 통신을 위해 다양한 인증 방식을 지원합니다.

### 1) 지원하는 인증 유형
| 유형 | 설명 |
| :--- | :--- |
| **`apiKey`** | HTTP 헤더에 고정된 API 키를 실어 보냅니다. |
| **`http`** | Bearer 토큰, Basic 인증 등 표준 HTTP 인증 방식을 사용합니다. |
| **`google-credentials`** | 구글 ADC(Application Default Credentials)를 통해 GCP 서비스에 인증합니다. |
| **`oauth`** | 브라우저를 통한 OAuth 2.0 Authorization Code flow를 수행합니다. |

### 2) 동적 값 (Dynamic Values) 사용 권장
비밀번호나 API 키를 파일에 직접 하드코딩하지 마세요. 다음 방식을 통해 보안을 강화할 수 있습니다.
- **환경 변수**: `key: $MY_SECRET_KEY` 형태로 시스템 환경 변수에서 읽어옴.
- **쉘 명령어**: `token: !gcloud auth print-access-token` 형태로 명령어 실행 결과를 사용함.

<br/>

## 4. 구글 클라우드 통합 (Google ADC)
`google-credentials` 타입을 사용하면 구글 클라우드 리소스 인증이 매우 쉬워집니다.
- **Identity 토큰**: `*.run.app` (Cloud Run) 서비스 호출 시 사용.
- **Access 토큰**: `*.googleapis.com` (Vertex AI 등) 서비스 호출 시 사용.
- CLI는 호스트 패턴에 맞춰 적절한 토큰을 자동으로 선택하고 갱신합니다.

<br/>

## 5. 관리 및 설정
### 에이전트 제어 명령어
- **/agents list**: 로드된 모든 서브에이전트 상태 확인.
- **/agents reload**: 설정 파일 변경 후 정보 동기화.
- **/agents enable/disable [name]**: 특정 에이전트 활성/비활성 제어.

### 프록시 설정
폐쇄망 환경 등에서 프록시가 필요한 경우 `settings.json`의 `general.proxy`를 설정하거나 `HTTP_PROXY` 환경 변수를 사용하세요.

---
**팁**: 단일 마크다운 파일에 리스트 형식(`-`)으로 여러 개의 리모트 에이전트를 한꺼번에 정의할 수도 있습니다.
