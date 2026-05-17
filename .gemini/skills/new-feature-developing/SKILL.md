---
name: new-feature-developing
type: skill
description: Orchestrator for the end-to-end development process of new features, from ideation to documentation.
---
# new-feature-developing (Orchestrator)

**[역할 정의]**
당신은 'Mark Explorer' 프로젝트의 신규 기능 개발 프로세스를 총괄하는 **Orchestrator**입니다. 아래 정의된 7단계의 워크플로우를 자율적으로 관리하며, 각 단계에 최적화된 **Sub-agents**(`.gemini/agents/`에 정의됨)를 `@명칭`으로 호출하여 사용자에게 최상의 개발 경험을 제공합니다.

**[워크플로우 요약]**
1.  **(1) Idea Meeting:** 기획 및 아이디어 구체화 (PO 활용)
2.  **(2) Appearance Designing:** 디자인 및 UI/UX 스타일링 (UX Designer 활용)
3.  **(3) Implementation Planning:** 구현 계획 수립 (Frontend 활용)
4.  **(4) Implementation:** 기능 구현 및 코드 작성 (Frontend 활용)
5.  **(5) Tuning:** 기능 조율 및 미세 조정
6.  **(6) QA Check:** 품질 검증 및 미해결 이슈 관리 (QA 활용)
7.  **(7) Documentation:** 최종 문서화 및 히스토리 정리 (PO 활용)

---

**[단계별 상세 지침]**

### [초기 설정 (Initialization)]
- **Feature 명칭 설정:** 스킬 시작 시 사용자에게 개발할 `{feature명}`이 무엇인지 묻습니다.
- **기존 디렉토리 확인:** `.gemini/skills/new-feature-developing/history/{feature명}` 디렉토리가 존재하는지 확인합니다.
  - **존재 시:** 사용자에게 기존 기능의 수정을 원하는지 묻고, 수용 시 해당 `{feature명}`으로 작업을 시작합니다.
  - **미존재 시:** 즉시 작업을 시작합니다.

### (1) Idea Meeting
- **에이전트:** `@product-owner-subagent` 호출
- **문서 관리:** `.gemini/skills/new-feature-developing/history/{feature명}/product-owner/` 경로를 확인합니다.
  - 파일이 없으면 `1.md`를 생성하고 시작합니다.
  - 파일이 있으면 사용자에게 **'이미 존재하는 document 선택'** 또는 **'새로운 document 생성'**을 묻습니다.
    - **기존 선택 시:** 특정 {번호}를 선택받고 수정을 원하는지 묻습니다. 수정 미희망 시 즉시 (2)단계로 진행하며, 수정 희망 시 기획 아이디어 수정 작업을 시작합니다.
    - **새로운 생성 시:** 새로운 {번호}.md 파일을 생성하고 기획을 시작합니다.
- **아이디어 도출:** 아이디어 A, B, C를 제시하고 사용자의 의견을 묻습니다. 사용자가 추가 의견을 제시하면 기획을 발전시키거나 선택지를 수정하여 다시 제안합니다.
- **자율 개선:** 사용자가 만족하더라도 `@product-owner-subagent`는 개선 여지가 있다면 스스로 개선 의견을 추가하여 다시 제안합니다.
- **구현 가능성 검토:**
  - `@frontend-developer-subagent`를 호출하여 구현 가능 여부를 검토하게 합니다.
  - 결과는 `.gemini/skills/new-feature-developing/history/{feature명}/feasibility-check/{번호}.md`에 기록하며, 이전 내용이 있다면 삭제 후 새로 작성합니다.
  - 파일 내에 **'구현가능'** 또는 **'구현불가'**를 명확히 명시해야 합니다.
  - `@product-owner-subagent`는 이 결과를 읽고 `@product-owner/{번호}.md`를 수정 및 보완합니다. 구현 불가 시 대안을 제시하고 사용자 수락 시 기획을 수정합니다.
- **회의록 작성:** 단계 종료 시 `@product-owner-subagent`는 `.gemini/skills/new-feature-developing/history/{feature명}/meeting-log/{번호}.md`를 작성(또는 추가)합니다. 이미 작성된 내용이 있다면 새로 추가된 내용을 이어서 추가합니다.
- **전환:** 사용자에게 (2)단계 진행 여부를 묻고, Yes 시 진행합니다. No 시 (1)단계를 다시 시작합니다.

### (2) Appearance Designing
- **에이전트:** `@ux-designer-subagent` 호출
- **문서 관리:** `.gemini/skills/new-feature-developing/history/{feature명}/ux-designer/` 경로를 확인합니다.
  - 파일이 없으면 `1.md`를 생성하고 시작합니다.
  - 파일이 있으면 사용자에게 **'이미 존재하는 document 선택'** 또는 **'새로운 document 생성'**을 묻습니다.
    - **기존 선택 시:** 특정 {번호}를 선택받고 수정을 원하는지 묻습니다. 수정 미희망 시 즉시 (3)단계로 진행합니다.
    - **새로운 생성 시:** 새로운 {번호}.md 파일을 생성하고 디자인을 시작합니다.
- **디자인 설계:** Mark Explorer의 현재 스타일에 부합하도록 UI/UX를 설계합니다. 사용자의 피드백을 받아 최적화합니다.
- **자율 개선:** 사용자가 만족하더라도 `@ux-designer-subagent`는 개선 여지가 있다면 스스로 개선 의견을 추가하여 제안합니다.
- **구현 가능성 검토:**
  - `@frontend-developer-subagent`를 호출하여 구현 가능 여부를 검토하고 결과를 `feasibility-check/{번호}.md`에 기록하게 합니다. (**'구현가능/불가'** 명시)
  - `@product-owner-subagent`는 이 결과를 검토하여 필요 시 PO 문서를 업데이트합니다. 기획 자체의 변경이 필요하면 (1)단계로 회귀합니다.
- **전환:** 디자인 확정 시 (3)단계 진행 여부를 묻고, Yes 시 진행합니다. No 시 (2)단계를 다시 시작합니다.

### (3) Implementation Planning
- **에이전트:** `@frontend-developer-subagent` 호출
- **동작:** PO/UX 결과물을 바탕으로 구현 계획을 세워 `.gemini/skills/new-feature-developing/history/{feature명}/implementation-planning/{번호}.md`에 기록합니다. {feature명}은 kebab-case를 따릅니다.
- **자율 개선:** 사용자가 만족하더라도 `@frontend-developer-subagent`는 개선 여지가 있다면 스스로 개선 의견을 추가하여 제안합니다.
- **전환:** 계획 확정 시 (4)단계 진행 여부를 묻고, Yes 시 진행합니다. No 시 (3)단계를 다시 시작합니다.

### (4) Implementation
- **에이전트:** `@frontend-developer-subagent` 호출
- **동작:** 계획에 따라 코드를 작성하고 기능을 개발합니다.
- **기록:** 개발 내용은 `.gemini/skills/new-feature-developing/history/{feature명}/implementation/{번호}.md`에 기록합니다.
- **전환:** 개발 완료 후 (5)단계로 즉시 이동합니다.

### (5) Tuning
- **동작:** 구현된 기능을 사용자에게 시연하고 피드백을 수집합니다.
- **수집 사항:** 수정/개선 요청 사항을 수집하고 기록합니다.
- **기록:** 피드백 내용은 `.gemini/skills/new-feature-developing/history/{feature명}/feedback/{번호}.md`에 기록합니다.
- **회의록 작성:** 단계 종료 시 `@product-owner-subagent`는 `.gemini/skills/new-feature-developing/history/{feature명}/meeting-log/{번호}.md`를 작성(또는 추가)합니다. 이미 작성된 내용이 있다면 새로 추가된 내용을 이어서 추가합니다.
- **회귀 로직:** 수정이 필요한 경우, 사용자에게 어떤 Phase(1, 2, 3, 4)로 돌아갈지 묻고 이동합니다.
- **전환:** 사용자가 만족할 경우 (6)단계 진행 여부를 묻고 이동합니다.

### (6) QA Check
- **에이전트:** `@qa-engineer-subagent` 호출
- **검증 힌트:** PO, UX, Planning, Implementation, Tuning 단계의 결과물들을 참고하여 검증합니다.
- **기록:** 테스트 결과는 `.gemini/skills/new-feature-developing/history/{feature명}/qa/{번호}.md`에 기록합니다.
- **미해결 이슈 관리:** 10회 이상 실패하거나 구현 불가 판단 시 `.gemini/skills/new-feature-developing/history/{feature명}/unresolved-issues/{번호}.md`에 기록하고 사용자에게 알립니다.
- **회귀 로직:** 검증 실패 시 각 단계별 수정 사항을 정리하여 제안하고 사용자 수용 시 해당 Phase로 돌아가 수정을 진행합니다. 거절 시 (7)단계로 넘어갑니다.
- **전환:** 검증 완료 후 (7)단계 진행 여부를 묻습니다. No 시 사용자가 원하는 Phase(1~5 중 하나)로 회귀합니다.

### (7) Documentation
- **에이전트:** `@product-owner-subagent` 호출
- **동작:** 모든 히스토리 문서(PO, UX, Planning, Implementation, Tuning, QA, Unresolved Issues)를 종합하여 `docs/features/{feature명}/00.feature-overview.md`를 작성합니다.
- **명시 사항:** 미해결 이슈 존재 시 관련 파일 경로를 명시하고, 개발 내역 히스토리가 `.gemini/skills/new-feature-developing/**` 내에 있음을 기록하여 추적 가능하게 합니다.
- **종료:** 완료 후 사용자에게 **'종료'** 또는 **'계속'** 여부를 묻습니다. '계속' 선택 시 돌아가고 싶은 Phase(1~7 중 하나)를 선택받아 이동합니다.

---

**[공통 운영 규칙]**
1.  **번호 및 파일 관리:** `{번호}`는 1부터 시작하며, 새 문서 생성 시 증가시키고 기존 수정 시에는 유지합니다. {feature명}은 kebab-case를 준수합니다.
2.  **문서 기반 컨텍스트:** 각 단계 시작 시 관련 히스토리 문서를 `view_file`로 읽어 컨텍스트를 유지합니다.
3.  **상태 추적:** Orchestrator는 현재 진행 중인 Phase와 작업 중인 문서 번호를 항상 추적해야 합니다.
4.  **Sub-agent 호출:** 호출 시 현재 상황 요약, 참고 문서 경로, 구체적인 목표를 프롬프트로 명확히 전달합니다.

---

## 📊 프로세스 흐름도 (Mermaid Diagrams)

본 섹션은 `new-feature-developing` 스킬의 전체 및 단계별 상세 워크플로우를 시각화한 Mermaid 다이어그램입니다. 각 에이전트의 역할, 상태 분기 및 회귀 로직을 한눈에 파악할 수 있습니다.

### 1. 전체 프로세스 흐름 (Overall Workflow)

```mermaid
flowchart TD
    Start([시작]) --> Init[초기 설정: Feature 명칭 및 디렉토리 확인]
    Init --> Phase1[Phase 1: Idea Meeting]
    Phase1 -->|Yes| Phase2[Phase 2: Appearance Designing]
    Phase1 -->|No| Phase1
    Phase2 -->|Yes| Phase3[Phase 3: Implementation Planning]
    Phase2 -->|No| Phase2
    Phase2 -->|기획 변경 필요| Phase1
    Phase3 -->|Yes| Phase4[Phase 4: Implementation]
    Phase3 -->|No| Phase3
    Phase4 --> Phase5[Phase 5: Tuning]
    Phase5 -->|수정 필요| Phase1_4{Phase 1~4 중 회귀}
    Phase1_4 -->|Phase 1| Phase1
    Phase1_4 -->|Phase 2| Phase2
    Phase1_4 -->|Phase 3| Phase3
    Phase1_4 -->|Phase 4| Phase4
    Phase5 -->|만족| Phase6[Phase 6: QA Check]
    Phase6 -->|검증 실패| Phase1_5_QA{Phase 1~5 중 회귀}
    Phase1_5_QA -->|Phase 1| Phase1
    Phase1_5_QA -->|Phase 2| Phase2
    Phase1_5_QA -->|Phase 3| Phase3
    Phase1_5_QA -->|Phase 4| Phase4
    Phase1_5_QA -->|Phase 5| Phase5
    Phase6 -->|검증 완료 / 거절| Phase7[Phase 7: Documentation]
    Phase7 -->|종료| End([종료])
    Phase7 -->|계속| Phase1_7{Phase 1~7 중 회귀}
    Phase1_7 -->|Phase 1| Phase1
    Phase1_7 -->|Phase 2| Phase2
    Phase1_7 -->|Phase 3| Phase3
    Phase1_7 -->|Phase 4| Phase4
    Phase1_7 -->|Phase 5| Phase5
    Phase1_7 -->|Phase 6| Phase6
    Phase1_7 -->|Phase 7| Phase7
```

### 2. 초기 설정 및 Phase 1: Idea Meeting 세부 흐름

```mermaid
flowchart TD
    subgraph Initialization [초기 설정]
        InitStart([초기 설정 시작]) --> SetName[Feature 명칭 설정]
        SetName --> CheckDir{기존 디렉토리 존재 여부}
        CheckDir -->|존재| AskModify{기존 기능 수정 여부 질문}
        AskModify -->|Yes| StartFeature[해당 Feature명으로 작업 시작]
        AskModify -->|No| SetName
        CheckDir -->|미존재| StartFeature
    end
    
    subgraph Phase1 [Phase 1: Idea Meeting]
        StartFeature --> CallPO1[@product-owner-subagent 호출]
        CallPO1 --> CheckPOFile{PO 문서 존재 여부}
        CheckPOFile -->|없음| CreatePO1[1.md 생성 및 시작]
        CheckPOFile -->|있음| SelectPO{이미 존재하는 문서 선택 또는 새 문서 생성}
        SelectPO -->|기존 선택| SelectNo[특정 번호 선택 및 수정 여부 확인]
        SelectNo -->|수정 미희망| Step2Go{Phase 2 진행 여부}
        SelectNo -->|수정 희망| Ideation[아이디어 도출 및 제안 A, B, C]
        SelectPO -->|새로 생성| CreateNewPO[새로운 {번호}.md 생성 및 기획 시작]
        CreatePO1 --> Ideation
        CreateNewPO --> Ideation
        
        Ideation --> FeedBack1[사용자 의견 수렴 및 기획 발전]
        FeedBack1 --> CheckFeasibility[@frontend-developer-subagent 호출: 구현 가능성 검토]
        CheckFeasibility --> RecordFeasibility["feasibility-check/{번호}.md 기록 <br>(구현가능 또는 구현불가 명시)"]
        RecordFeasibility --> ModifyPO[PO가 검토 결과를 읽고 PO 문서 수정 및 보완]
        ModifyPO --> MeetingLog["meeting-log/{번호}.md 작성/추가"]
        MeetingLog --> Step2Go
        Step2Go -->|Yes| End1([Phase 2 이동])
        Step2Go -->|No| CallPO1
    end
```

### 3. Phase 2: Appearance Designing 세부 흐름

```mermaid
flowchart TD
    subgraph Phase2 [Phase 2: Appearance Designing]
        Start2([Phase 2 시작]) --> CallUX[@ux-designer-subagent 호출]
        CallUX --> CheckUXFile{UX 문서 존재 여부}
        CheckUXFile -->|없음| CreateUX1[1.md 생성 및 시작]
        CheckUXFile -->|있음| SelectUX{이미 존재하는 문서 선택 또는 새 문서 생성}
        SelectUX -->|기존 선택| SelectUXNo[특정 번호 선택 및 수정 여부 확인]
        SelectUXNo -->|수정 미희망| Step3Go{Phase 3 진행 여부}
        SelectUXNo -->|수정 희망| DesignUX[UI/UX 설계 및 피드백 반영]
        SelectUX -->|새로 생성| CreateNewUX[새로운 {번호}.md 생성 및 디자인 시작]
        CreateUX1 --> DesignUX
        CreateNewUX --> DesignUX
        
        DesignUX --> CheckFeasibility2[@frontend-developer-subagent 호출: 구현 가능성 검토]
        CheckFeasibility2 --> RecordFeasibility2["feasibility-check/{번호}.md 기록 <br>(구현가능/불가 명시)"]
        RecordFeasibility2 --> CheckPOReview{PO가 결과 검토: 기획 변경 필요 여부}
        CheckPOReview -->|기획 변경 필요| Regress1([Phase 1 회귀])
        CheckPOReview -->|불필요/보완완료| Step3Go
        Step3Go -->|Yes| End2([Phase 3 이동])
        Step3Go -->|No| CallUX
    end
```

### 4. Phase 3 & Phase 4: Implementation Planning & Implementation 세부 흐름

```mermaid
flowchart TD
    subgraph Phase3 [Phase 3: Implementation Planning]
        Start3([Phase 3 시작]) --> CallDev3[@frontend-developer-subagent 호출]
        CallDev3 --> Plan[PO/UX 결과물 기반 구현 계획 수립]
        Plan --> RecordPlan["implementation-planning/{번호}.md 기록"]
        RecordPlan --> SelfImprove3[자율 개선 의견 추가 제안]
        SelfImprove3 --> Step4Go{Phase 4 진행 여부}
        Step4Go -->|Yes| End3([Phase 4 이동])
        Step4Go -->|No| CallDev3
    end

    subgraph Phase4 [Phase 4: Implementation]
        End3 --> CallDev4[@frontend-developer-subagent 호출]
        CallDev4 --> Develop[계획에 따른 코드 작성 및 기능 개발]
        Develop --> RecordImpl["implementation/{번호}.md 기록"]
        RecordImpl --> End4([Phase 5 즉시 이동])
    end
```

### 5. Phase 5 & Phase 6: Tuning & QA Check 세부 흐름

```mermaid
flowchart TD
    subgraph Phase5 [Phase 5: Tuning]
        Start5([Phase 5 시작]) --> Demo[기능 시연 및 피드백 수집]
        Demo --> RecordFeedback["feedback/{번호}.md 기록"]
        RecordFeedback --> MeetingLog5["meeting-log/{번호}.md 작성/추가"]
        MeetingLog5 --> CheckTuning{수정 필요 여부}
        CheckTuning -->|Yes| RegressPhase{원하는 Phase 선택}
        RegressPhase -->|Phase 1~4| RegressGo([해당 Phase로 이동])
        CheckTuning -->|No| Step6Go{Phase 6 진행 여부}
        Step6Go -->|Yes| End5([Phase 6 이동])
    end

    subgraph Phase6 [Phase 6: QA Check]
        End5 --> CallQA[@qa-engineer-subagent 호출]
        CallQA --> Validate[PO, UX, Plan, Impl, Tuning 결과 기반 검증]
        Validate --> RecordQA["qa/{번호}.md 기록"]
        RecordQA --> CheckFail{10회 이상 실패 또는 구현불가?}
        CheckFail -->|Yes| RecordUnresolved["unresolved-issues/{번호}.md 기록 및 알림"]
        CheckFail -->|No| CheckQAStatus{검증 성공 여부}
        
        RecordUnresolved --> CheckQAStatus
        CheckQAStatus -->|실패| RegressQA{수정 제안 및 수용 여부}
        RegressQA -->|수용| RegressQAGo([해당 Phase로 회귀])
        RegressQA -->|거절| Step7Go{Phase 7 진행 여부}
        
        CheckQAStatus -->|성공| Step7Go
        Step7Go -->|Yes| End6([Phase 7 이동])
        Step7Go -->|No| RegressQASelect{원하는 Phase 1~5 선택}
        RegressQASelect --> RegressQASelectGo([해당 Phase로 회귀])
    end
```

### 6. Phase 7: Documentation 세부 흐름

```mermaid
flowchart TD
    subgraph Phase7 [Phase 7: Documentation]
        Start7([Phase 7 시작]) --> CallPO7[@product-owner-subagent 호출]
        CallPO7 --> CollectAll[모든 히스토리 문서 종합]
        CollectAll --> CreateOverview["docs/features/{feature명}/00.feature-overview.md 작성"]
        CreateOverview --> RecordMeta[미해결 이슈 및 히스토리 경로 명시]
        RecordMeta --> AskEnd{종료 또는 계속 여부}
        AskEnd -->|종료| EndAll([최종 종료])
        AskEnd -->|계속| SelectRegress7[원하는 Phase 1~7 선택]
        SelectRegress7 --> Regress7Go([해당 Phase로 이동])
    end
```
