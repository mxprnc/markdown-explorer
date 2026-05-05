# Checkpointing (체크포인트 및 복구) 가이드
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="10%" alt="Gemini Banner" />

<br/>

## 출처
- Checkpointing official guide : https://geminicli.com/docs/cli/checkpointing/

<br/>

## 1. Checkpointing이란 무엇인가?
Checkpointing은 AI 기반 도구(예: `write_file`, `replace`)가 프로젝트 파일을 실제로 수정하기 직전, 현재의 모든 상태를 자동으로 스냅샷으로 저장하는 보안 기능입니다. 이를 통해 AI가 제안한 변경 사항을 안심하고 적용해 보고, 결과가 마음에 들지 않을 경우 즉시 수정 전 상태로 완벽하게 돌아갈 수 있습니다.

<br/>

## 2. 작동 원리
수정 도구가 승인되어 실행되기 직전, CLI는 다음 세 가지 중요한 데이터를 사용자 로컬 시스템에 자동으로 저장합니다.

1.  **그림자 Git 스냅샷 (Shadow Git Snapshot)**: 사용자의 프로젝트 Git과는 완전히 별개로, 홈 디렉토리(`~/.gemini/history/`) 내의 전용 저장소에 파일 상태를 기록합니다. 이는 사용자의 기존 Git 워크플로우를 전혀 방해하지 않습니다.
2.  **대화 기록 (Conversation History)**: 해당 시점까지 AI와 나눈 모든 대화 맥락을 보존합니다.
3.  **도구 호출 정보 (Tool Call)**: 실행 직전이었던 구체적인 도구 이름과 파라미터 정보를 저장합니다.

복구(`restore`)를 실행하면 파일 시스템이 이전 상태로 되돌아감과 동시에 대화 기록이 복원되며, 실행 전이었던 도구 호출 프롬프트가 다시 나타나 사용자가 내용을 수정하거나 재시도할 수 있게 됩니다.

<br/>

## 3. 기능 활성화 및 설정
Checkpointing은 성능 및 저장 공간 관리를 위해 기본적으로 비활성화되어 있습니다. 기능을 사용하려면 반드시 `settings.json` 파일을 수정해야 합니다.

> [!CAUTION]
> **중요**: 버전 0.11.0부터 `--checkpointing` 명령줄 플래그가 지원 중단되었습니다. 이제는 반드시 아래와 같이 `settings.json` 설정을 통해서만 활성화할 수 있습니다.

### `settings.json` 설정 추가
```json
{
  "general": {
    "checkpointing": {
      "enabled": true
    }
  }
}
```

<br/>

## 4. `/restore` 명령어 사용법
활성화 이후 모든 체크포인트는 자동으로 관리됩니다. 관리나 복구는 `/restore` 명령어를 사용합니다.

### ① 체크포인트 목록 확인
현재 프로젝트에서 사용 가능한 모든 체크포인트를 확인하려면 다음을 실행합니다.
```bash
/restore
```
타임스탬프와 도구 이름이 포함된 체크포인트 파일명(예: `2025-06-22T...-write_file`) 목록이 표시됩니다.

### ② 특정 체크포인트로 복구
확인한 파일명을 지정하여 프로젝트를 이전 상태로 돌립니다.
```bash
/restore [체크포인트_파일명]
```
실행 즉시 파일 시스템과 대화 기록이 복구되며, 원래 실행하려 했던 도구 호출이 다시 제안됩니다.

---
**다음 단계**: 더 세밀한 대화 지점 복구가 궁금하다면 [Rewind 가이드](/docs/gemini/8-rewind---gemini-official-docs.md)를 확인하세요.
