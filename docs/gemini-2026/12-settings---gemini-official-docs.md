# Gemini CLI 설정 (settings.json) 가이드
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="10%" alt="Gemini Banner" />

<br/>

## 출처
- Gemini CLI settings : https://geminicli.com/docs/cli/settings/

<br/>

## 1. 개요 (Overview)
Gemini CLI의 모든 경험은 `/settings` 명령어 또는 `settings.json` 파일을 통해 사용자 지정할 수 있습니다. UI 테마부터 보안 정책, AI 모델의 사고 방식까지 세밀한 제어가 가능합니다.

### 설정 방법
- **대화형 UI**: CLI 대화창에서 `/settings`를 입력하면 모든 설정을 시각적으로 편집할 수 있는 콘솔 기반 UI가 열립니다.
- **직접 편집**: 물리적인 JSON 파일을 텍스트 에디터로 직접 수정할 수 있습니다.

### 설정 파일 위치 및 우선순위
1.  **사용자 공통 설정 (User Settings)**: `~/.gemini/settings.json` (모든 프로젝트에 공통으로 적용되는 기본값)
2.  **워크스페이스 설정 (Workspace Settings)**: `[내-프로젝트]/.gemini/settings.json`

> [!IMPORTANT]
> **워크스페이스 설정**은 사용자 공통 설정보다 높은 우선순위를 가집니다. 프로젝트마다 다른 보안 정책이나 모델을 사용하고 싶을 때 유용합니다.

<br/>

## 2. 주요 설정 레퍼런스 (Category)

### ① 일반 (General) - 기본 동작 방식
- **Vim Mode (`general.vimMode`)**: 터미널 내에서 Vim 스타일 키바인딩을 사용합니다. (기본값: `false`)
- **기본 승인 모드 (`general.defaultApprovalMode`)**: 도구 실행 전 승인 절차를 설정합니다.
  - `default`: 매번 사용자 확인 후 실행
  - `auto_edit`: 코드 편집 관련 도구는 자동 승인
  - `plan`: 설계(읽기 전용) 모드로 시작
- **세션 자동 정리 (`general.sessionRetention.enabled`)**: 지정된 기간(예: 30일)이 지난 오래된 대화 기록을 자동으로 삭제하여 성능을 유지합니다.

### ② UI (사용자 경험) - 시각적 정보 및 테마
- **인라인 사고 과정 (`ui.inlineThinkingMode`)**: 모델이 답변을 도출하기 위해 수행하는 '사고 과정'을 대화창에 즉시 표시할지 결정합니다.
- **도구 출력 압축 (`ui.compactToolOutput`)**: 디렉토리 목록이나 파일 읽기 결과를 간결한 구조로 압축하여 화면 공간을 절약합니다.
- **푸터 정보 제어**: CWD(현재 경로), 샌드박스 상태, 모델 정보, 메모리 사용량 등을 푸터(Footer) 공간에서 개별적으로 숨길 수 있습니다.

### ③ 보안 (Security) - 안전한 실행 환경
- **도구 레벨 샌드박싱 (`security.toolSandboxing`)**: 전체 프로세스가 아닌 개별 도구만 격리된 환경에서 실행하여 보안 리스크를 최소화합니다.
- **지능형 보안 검사 (`security.enableConseca`)**: AI 모델이 실행하려는 도구의 위험성을 실시간으로 판단하여 허용 여부를 동적으로 결정합니다.
- **비밀 정보 마스킹 (`security.environmentVariableRedaction.enabled`)**: 로그나 출력물에서 API 키, 비밀번호 등이 포함된 환경 변수를 찾아 자동으로 마스킹 처리합니다.

### ④ 모델 (Model) - AI 엔진 및 대화 정책
- **모델 지정 (`model.name`)**: 주력으로 사용할 Gemini 모델 이름을 명시합니다. (예: `gemini-2.0-pro-exp`)
- **컨텍스트 압축 (`model.compressionThreshold`)**: 대화 내용이 길어질 때 어느 수준(기본 50%)에서 과거 기록을 압축할지 결정합니다.
- **무한 루프 방지 (`model.disableLoopDetection`)**: 에이전트가 동일한 동작을 반복하며 리소스를 낭비하는 무한 루프 현상을 감지하고 차단합니다.

### ⑤ 도구 (Tools) - 성능 및 기능 확장
- **고속 검색 (`tools.useRipgrep`)**: 파일 검색 도구로 `ripgrep (rg)`을 사용하여 탐색 속도를 비약적으로 높입니다.
- **출력 절단 설정 (`tools.truncateToolOutputThreshold`)**: 수만 줄의 로그 같은 방대한 도구 결과를 몇 글자에서 자를지 설정합니다. (기본: 40,000자)
- **에러 자동 교정 (`tools.disableLLMCorrection`)**: 편집 도구 실행 중 오타 등으로 인한 실패 시 AI가 스스로 교정하여 재시도할지 여부를 선택합니다.

### ⑥ 실험적 기능 (Experimental) - 최신 테스트 기능
- **Git Worktrees (`experimental.worktrees`)**: 멀티태스킹을 위해 프로젝트의 병렬 작업 공간을 AI가 자동으로 구성하고 관리합니다.
- **메모리 매니저 (`experimental.memoryManager`)**: 대화 기억 중 중요 정보를 추출하고 중복을 제거하는 등 기억력을 최적화하는 전용 서비스를 사용합니다.

---
**팁**: 특정 설정의 정확한 JSON 키값이나 기본값이 궁금할 때는 언제든지 CLI에서 `/settings`를 입력해 보세요. 항목별 도움말이 함께 제공됩니다.
