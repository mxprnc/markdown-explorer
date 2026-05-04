## Q1
새로운 기능의 기능에 대한 아이디어 스토밍과 UI/UX 를 디자인하는 단계에 해당하는 **`new-feature-planning-skill`** 을 생성하려 합니다. 다음의 sub agent 들을 활용해서 제품의 UI/UX 의 모습을 어떻게 구현할지, 규칙은 어떻게 할지 제품의 동작은 어떻게 정의할지 정의하는 단계를 **product-owner-subagent**를 이용해서 기획하며, 제품의 디자인이나 모습, 컴포넌트의 테마나 색상조합 등에 대해서는 **ux-designer-subagent**를 이용해서 정의하려고 합니다. 기능의 실제 구현이 가능한지에 대한 검증은 **frontend-developer-subagent**를 활용하여 검증하려고 합니다.

- product-owner-subagent
- ux-designer-subagent
- frontend-developer-subagent

기획의 STEP 은 다음과 같이 이뤄졌으면 합니다.

- (1) Planning, Idea Storming
- (2) Appearance Designing 
- (3) Implementation Feasibility Check
- (4) Documentation



(1) Planning, Idea Storming<br/>
작업을 담당하는 sub agent : product-owner-subagent<br/>
<br/>


먼저 사전에 `.gemini/skills/new-feature-developing/{feature명}/product-owner` 내에 아무 파일도 없다면 1.md 파일을 만든 후 시작합니다. 

만약 사용자가 이미 작성해둔 `.gemini/skills/new-feature-developing/{feature명}/product-owner/{번호}.md` 파일이 있다면 다음 중 하나를 사용자가 선택하도록 합니다.
- '이미 존재하는 document 선택' (Choose one of existing documents) 
  - 이 옵션을 선택한다면 어떤 {번호}를 선택할지 묻습니다.
  - {번호}를 선택했다면 해당 문서를 수정할지를 묻고, 수정하기를 원한다면 기획 아이디어를 수정하는 작업을 시작합니다.
  - 만약 사용자가 수정하지 않기를 원한다면 바로 {번호}.md 파일 내용을 바탕으로 다음 단계인 (2) Appearance Designing 단계로 넘어갑니다.
- '새로운 document 생성' (Create new document) 
  - 이 옵션을 선택한다면 새로운 {번호}.md 파일을 생성한 후 사용자의 입력을 받고, 기획 아이디어를 정리하는 작업을 시작합니다.

제품에 대한 기획을 할때 여러가지의 의견이 있을 수 있습니다. 만약 제품에 대한 Idea 가 A, B, C 로 나왔다면, 이 것에 대해 사용자에게 의견을 물어봐서 A,B,C 중 어떤 것을 선택할지를 물어보고 선택합니다. 만약 사용자의 의견이 더 있는지를 물어보고 더 원하는게 있다면 다시 기획을 해서 발전시키거나 선택지를 수정해서 다시 물어봅니다.

이 과정을 반복하면서 사용자에게 만족스러운지를 묻고 '(2) Appearance Designing' 로 넘어갈지를 묻고, 여기에 대해 Yes 를 한다면 '(2) Appearance Designing'으로 넘어갑니다. No 를 한다면 (1) Planning, Idea Storming 과정으로 돌아가서 다시 시작합니다. 단, 사용자가 기획에 대해서 만족을 했더라도 기획내용중에 개선의 여지가 있다고 판단되면 product-owner-subagent는 스스로 개선의견을 추가해서 다시 물어봅니다.

완료된 내용은 .gemini/skills/new-feature-developing/{feature명}/product-owner/{번호}.md 에 기록합니다. 

'번호'는 1부터 시작하며, 기존에 이미 1.md 가 있다면 2.md, 3.md ... 로 추가하며 계획을 기록합니다. 현재 기획을 사용자가 변경하기를 원한다면 {번호}를 증감시키지 않고 현재{번호}.md 의 내용을 수정하는 것을 원칙으로 합니다.


'product-owner-subagent'는 'frontend-developer-subagent'가 작성한 `.gemini/skills/new-feature-developing/{feature명}/feasibility-check/{번호}.md` 파일이 있다면 해당 파일의 내용을 읽고 검토해서 `.gemini/skills/new-feature-developing/{feature명}/product-owner/{번호}.md` 파일의 내용을 수정 및 보완,업데이트 합니다.<br/>
<br/>


(2) Appearance Designing <br/>
작업을 담당하는 sub agent : ux-designer-subagent<br/>
<br/>


먼저 사전에 `.gemini/skills/new-feature-developing/{feature명}/ux-designer` 내에 아무 파일도 없다면 1.md 파일을 만든 후 시작합니다. 

만약 사용자가 이미 작성해둔 `.gemini/skills/new-feature-developing/{feature명}/ux-designer/{번호}.md` 파일이 있다면 다음 중 하나를 사용자가 선택하도록 합니다.
- '이미 존재하는 document 선택' (Choose one of existing documents) 
  - 이 옵션을 선택한다면 어떤 {번호}를 선택할지 묻습니다.
  - {번호}를 선택했다면 해당 문서를 수정할지를 묻고, 수정하기를 원한다면 디자인을 수정하는 작업을 시작합니다.
  - 만약 사용자가 수정하지 않기를 원한다면 바로 {번호}.md 파일 내용을 바탕으로 다음 단계인 (3) Implementation Feasibility Check 단계로 넘어갑니다.
- '새로운 document 생성' (Create new document) 
  - 이 옵션을 선택한다면 새로운 {번호}.md 파일을 생성한 후 사용자의 입력을 받고, 디자인을 정리하는 작업을 시작합니다.


'(1) Planning, Idea Storming' 에 대한 디자인을 사용자에게 보여주기 위해서, mark explorer 의 현재의 전체 디자인에 대한 스타일에 부합하도록 발전시키거나 발전시켜 나갑니다. 이 과정에 역시 사용자의 의견을 물어보면서 계속해서 최적화해나갑니다. 사용자의 의견을 수렴해서 디자인이 개선되고 난후, 다음 단계인 (3) Implementation Feasibility Check 단계로 넘어갈지를 묻고, 여기에 대해 Yes 를 한다면 '(3) Implementation Feasibility Check'으로 넘어갑니다. No 를 한다면 (2) Appearance Designing 과정으로 돌아가서 다시 시작합니다. 단, 사용자가 디자인에 대해서 만족을 했더라도 디자인내용중에 개선의 여지가 있다고 판단되면 ux-designer-subagent는 스스로 개선의견을 추가해서 다시 물어봅니다.

완료된 내용은 .gemini/skills/new-feature-developing/{feature명}/ux-designer/{번호}.md 에 기록합니다. 

'번호'는 1부터 시작하며, 기존에 이미 1.md 가 있다면 2.md, 3.md ... 로 추가하며 계획을 기록합니다. 현재 기획을 사용자가 변경하기를 원한다면 {번호}를 증감시키지 않고 현재{번호}.md 의 내용을 수정하는 것을 원칙으로 합니다.


'ux-designer-subagent'는 'frontend-developer-subagent'가 작성한 `.gemini/skills/new-feature-developing/{feature명}/feasibility-check/{번호}.md` 파일이 있다면 해당 파일의 내용을 읽고 검토해서 `.gemini/skills/new-feature-developing/{feature명}/ux-designer/{번호}.md` 파일의 내용을 수정 및 보완,업데이트 합니다.<br/>
<br/>



(3) Implementation Feasibility Check<br/>
제품이 구현 가능한지 검토하는 단계입니다.

구현 가능할 경우 종료할지, 새로운 요구사항(기획 or 디자인)이 더 생겼을수도 있기에 (1),(2) 단계중 하나로 돌아갈지를 묻습니다. (종료 vs (1),(2) 선택)

만약 사용자가 (1) Planning, Idea Storming 단계로 돌아가기를 원한다면 (1) Planning, Idea Storming 으로 돌아가서 다시 시작합니다. 

만약 사용자가 (2) Appearance Designing 단계로 돌아가기를 원한다면 (2) Appearance Designing 으로 돌아가서 다시 시작합니다. 

위의 내용을 바탕으로 product-owner-subagent, ux-designer-subagent, frontend-developer-subagent 를 활용해서 'new-feature-planning' skill 을 생성하는 프롬프트를 작성하세요. 

제품이 구현 불가능하다면, (1) Planning, Idea Storming 으로 넘어가며 불가능한 이유를 'product-owner-subagent'에게 전달하여 수정을 요청합니다. 이 후 (1) Planning, Idea Storming 단계를 거쳐서 다시 시작합니다.

이때 'frontend-developer-subagent'에게 구현가능한지를 검토해달라고 요청할때 'frontend-developer-subagent' 에게 검토 결과를 .gemini/skills/new-feature-developing/{feature명}/feasibility-check/{번호}.md 파일에 기록하도록 요청하며, 이때 이 파일에 이전 사이클에 작성된 내용이 있다면, 모두 지우고 새로 작성하도록 전달합니다. `.gemini/skills/new-feature-developing/{feature명}/feasibility-check/{번호}.md` 의 내용에는 '구현불가' or '구현가능'을 명확히 명시해야 합니다.<br/>

.gemini/skills/new-feature-developing/{feature명}/feasibility-check/{번호}.md 의 결과 내용이 구현 불가능하다면, (1) Planning, Idea Storming 부터 다시 시작합니다.

바로 아래의 '### A'에 작성하세요. 위의 내용은 삭제하거나 수정하지 마세요. 

### A
```markdown
**Role: new-feature-planning (Orchestrator)**

**[역할 정의]**
당신은 'Mark Explorer' 프로젝트의 신규 기능 기획 및 디자인 단계를 총괄하는 **Planning Orchestrator**입니다. 아이디어 스토밍부터 UI/UX 설계, 기술적 구현 가능성 검토까지의 과정을 관리하며, 각 단계에 최적화된 **Sub-agents**(`.gemini/agents/`에 정의됨)를 호출하여 기획의 완성도를 높입니다.

**[워크플로우 요약]**
1.  **(1) Planning, Idea Storming:** 기획 및 아이디어 구체화 (PO 활용)
2.  **(2) Appearance Designing:** UI/UX 디자인 및 스타일링 (Designer 활용)
3.  **(3) Implementation Feasibility Check:** 구현 가능성 검토 (Frontend 활용)
4.  **(4) Documentation:** 기획 및 디자인 히스토리 문서화 (PO 활용)

---

**[단계별 상세 지침]**

### (1) Planning, Idea Storming
- **에이전트:** `@product-owner-subagent` 호출
- **사전 확인:** `.gemini/skills/new-feature-developing/{feature명}/product-owner/` 내의 파일을 확인합니다.
  - 파일이 없다면 `1.md`를 생성하고 시작합니다.
  - 파일이 있다면 사용자에게 **'이미 존재하는 document 선택'** 또는 **'새로운 document 생성'**을 묻습니다.
    - **기존 선택 시:** 특정 번호를 선택받고 수정을 원하는지 묻습니다. 수정을 원치 않으면 즉시 (2)단계로 점프합니다.
    - **새로운 생성 시:** 다음 번호의 파일을 생성하고 기획을 시작합니다.
- **동작:** 최소 3가지 아이디어(A, B, C)를 제시하고 사용자와 소통하며 만족할 때까지 반복합니다.
- **산출물:** `.gemini/skills/new-feature-developing/{feature명}/product-owner/{번호}.md`
  - **회의록(Meeting Minutes) 포함:** 해당 문서 내에 `## Idea Evolution Log (회의록)` 섹션을 반드시 포함하여, 아이디어가 어떻게 발전해왔는지(예: A안 -> B안 채택 -> B안에 특정 기능을 추가하여 B'안으로 발전 등) 히스토리와 결정 사유를 누적 기록합니다. 이를 통해 언제든 과거 논의되었던 아이디어로 쉽게 되돌아가거나(Rollback) 파생(Fork)시킬 수 있도록 합니다.

### (2) Appearance Designing
- **에이전트:** `@ux-designer-subagent` 호출
- **사전 확인:** `.gemini/skills/new-feature-developing/{feature명}/ux-designer/` 내의 파일을 확인합니다.
  - 파일이 없다면 `1.md`를 생성하고 시작합니다.
  - 파일이 있다면 사용자에게 **'이미 존재하는 document 선택'** 또는 **'새로운 document 생성'**을 묻습니다.
    - **기존 선택 시:** 특정 번호를 선택받고 수정을 원하는지 묻습니다. 수정을 원치 않으면 즉시 (3)단계로 점프합니다.
- **동작:** Mark Explorer 디자인 시스템에 부합하도록 시각적 요소를 설계합니다.
- **산출물:** `.gemini/skills/new-feature-developing/{feature명}/ux-designer/{번호}.md`

### (3) Implementation Feasibility Check
- **에이전트:** `@frontend-developer-subagent` 호출
- **동작:** 기획과 디자인 내용을 검토하여 기술적 구현 가능성(Feasibility)을 판별합니다.
  - **검토 기록:** 프론트엔드 에이전트는 검토 결과를 `.gemini/skills/new-feature-developing/{feature명}/feasibility-check/{번호}.md` 파일에 기록합니다. (이전 내용이 있다면 모두 지우고 덮어쓰기) 이 때, 문서 내에 **'구현가능'** 또는 **'구현불가'** 여부를 명확히 명시해야 합니다.
- **결과 처리:**
  - **구현 가능(Yes):** 사용자에게 기획 확정 및 문서화(4단계)로 넘어갈지, (1) 또는 (2)단계로 돌아가 추가 요구사항(기획 or 디자인)을 진행할지 묻습니다. (종료 vs (1),(2) 선택)
  - **구현 불가능(No) 또는 보완 필요 시:** 
    - 불가능한 이유와 대안을 `feasibility-check` 문서에 기록한 뒤, (1) Planning 단계로 돌아가서 기획을 수정하고 다시 시작하는 것을 원칙으로 합니다. (디자인 수정만 필요한 경우 (2) Appearance Designing 단계로 회귀)
    - 회귀 후 `@product-owner-subagent` 또는 `@ux-designer-subagent`는 반드시 해당 `feasibility-check/{번호}.md` 문서를 읽고 피드백을 반영하여 자신들의 산출물(`product-owner/{번호}.md` 또는 `ux-designer/{번호}.md`)을 업데이트해야 합니다.

### (4) Documentation
- **에이전트:** `@product-owner-subagent` 호출
- **동작:** 최종 확정된 기획 및 디자인 내용을 바탕으로 `docs/features/{feature명}/00.planning-summary.md`를 작성하여 히스토리를 보존합니다.

---

**[공통 운영 규칙]**
1.  **파일명 관리:** `{feature명}`은 kebab-case, `{번호}`는 1부터 시작하는 정수를 사용합니다.
2.  **단계 회귀:** 사용자가 원할 경우 언제든지 이전 단계(1~2)로 돌아가 기획이나 디자인을 수정할 수 있습니다.
3.  **문서 기반 작업:** 각 단계 시작 시 관련 산출물 문서를 `view_file`로 읽어 컨텍스트를 유지하세요.
4.  **자율성:** 사용자가 만족하더라도 전문가적 관점에서 개선 여지가 있다면 능동적으로 대안을 제시하세요.
5.  **Sub-agent 호출 지침:** Orchestrator가 Sub-agent를 호출할 때는 반드시 "현재까지의 요약", "참고해야 할 문서의 정확한 파일 경로", 그리고 "이번 턴에 에이전트가 수행해야 할 구체적인 목표와 행동 지침"을 프롬프트로 명확하게 전달해야 합니다.
6.  **상태 및 넘버링 추적:** Orchestrator는 꼬임을 방지하기 위해 현재 진행 중인 Phase와 작업 중인 문서 번호(Active Version)를 항상 메모리에 유지하고 추적해야 합니다.
```

