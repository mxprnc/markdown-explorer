## Q1
새로운 기능을 개발하는 skill 을 생성하려 합니다. 다음의 sub agent 들을 활용해서 제품의 UI/UX 의 모습을 어떻게 구현할지, 규칙은 어떻게 할지 제품의 동작은 어떻게 정의할지 정의하는 단계를 product-owner-subagent를 이용해서 기획하며, 제품의 디자인이나 모습, 컴포넌트의 테마나 색상조합 등에 대해서는 ux-designer-subagent를 이용해서 정의하려고 합니다.

- product-owner-subagent
- ux-designer-subagent
- frontend-developer-subagent

기획의 STEP 은 다음과 같이 이뤄졌으면 합니다.

- (1) Planning, Idea Storming
- (2) Appearance Designing 
- (3) Implementation Planning
- (4) Implementation
- (5) QA Check
- (6) Documentation



(1) Planning, Idea Storming<br/>
제품에 대한 기획을 할때 여러가지의 의견이 있을 수 있습니다. 만약 제품에 대한 Idea 가 A, B, C 로 나왔다면, 이 것에 대해 사용자에게 의견을 물어봐서 A,B,C 중 어떤 것을 선택할지를 물어보고 선택합니다. 만약 사용자의 의견이 더 있는지를 물어보고 더 원하는게 있다면 다시 기획을 해서 발전시키거나 선택지를 수정해서 다시 물어봅니다.

이 과정을 반복하면서 사용자에게 만족스러운지를 묻고 '(2) Appearance Designing' 로 넘어갈지를 묻고, 여기에 대해 Yes 를 한다면 '(2) Appearance Designing'으로 넘어갑니다. No 를 한다면 (1) Planning, Idea Storming 과정으로 돌아가서 다시 시작합니다. 단, 사용자가 기획에 대해서 만족을 했더라도 기획내용중에 개선의 여지가 있다고 판단되면 product-owner-subagent는 스스로 개선의견을 추가해서 다시 물어봅니다.

완료된 내용은 .gemini/skills/new-feature-developing/{feature명}/product-owner/{번호}.md 에 기록합니다. 

'번호'는 1부터 시작하며, 기존에 이미 1.md 가 있다면 2.md, 3.md ... 로 추가하며 계획을 기록합니다. 현재 기획을 사용자가 변경하기를 원한다면 {번호}를 증감시키지 않고 현재{번호}.md 의 내용을 수정하는 것을 원칙으로 합니다.


(2) Appearance Designing <br/>
'(1) Planning, Idea Storming' 에 대한 디자인을 사용자에게 보여주기 위해서, mark explorer 의 현재의 전체 디자인에 대한 스타일에 부합하도록 발전시키거나 발전시켜 나갑니다. 이 과정에 역시 사용자의 의견을 물어보면서 계속해서 최적화해나갑니다. 사용자의 의견을 수렴해서 디자인이 개선되고 난후, 다음 단계인 (3) Implementation Planning 단계로 넘어갈지를 묻고, 여기에 대해 Yes 를 한다면 '(3) Implementation Planning'으로 넘어갑니다. No 를 한다면 (2) Appearance Designing 과정으로 돌아가서 다시 시작합니다. 단, 사용자가 디자인에 대해서 만족을 했더라도 디자인내용중에 개선의 여지가 있다고 판단되면 ux-designer-subagent는 스스로 개선의견을 추가해서 다시 물어봅니다.

완료된 내용은 .gemini/skills/new-feature-developing/{feature명}/ux-designer/{번호}.md 에 기록합니다. 

'번호'는 1부터 시작하며, 기존에 이미 1.md 가 있다면 2.md, 3.md ... 로 추가하며 계획을 기록합니다. 현재 기획을 사용자가 변경하기를 원한다면 {번호}를 증감시키지 않고 현재{번호}.md 의 내용을 수정하는 것을 원칙으로 합니다.


(3) Implementation Planning<br/>
제품을 구현을 계획하는 단계입니다. 'frontend-developer-subagent' 를 이용해서 제품을 구현하기 위해서 'product-owner-subagent'의 기획을 구현하기 위한 계획을 세워서 해당 기능 개발에 대한 계획을 .gemini/skills/new-feature-developing/{feature명}/implementation-planning/{번호}.md 에 계획을 기록합니다. 'feature' 명은 kebab case 를 따라야 하며, '번호'는 1부터 시작하며, 기존에 이미 1.md 가 있다면 2.md, 3.md ... 로 추가하며 계획을 기록합니다. 계획을 다 기록한 후 다음 단계인 Implementation 으로 넘어갈지를 사용자에게 묻고, 여기에 대해 Yes 를 한다면 '(4) Implementation'으로 넘어갑니다. No 를 한다면 (3) Implementation Planning 과정으로 돌아가서 다시 시작합니다. 단, 사용자가 Implementation Planning 에 대해서 만족을 했더라도 계획내용중에 개선의 여지가 있다고 판단되면 frontend-developer-subagent는 스스로 개선의견을 추가해서 다시 물어봅니다.

완료된 내용은 .gemini/skills/new-feature-developing/{feature명}/implementation-planning/{번호}.md 에 기록합니다. 

'번호'는 1부터 시작하며, 기존에 이미 1.md 가 있다면 2.md, 3.md ... 로 추가하며 계획을 기록합니다. 현재 기획을 사용자가 변경하기를 원한다면 {번호}를 증감시키지 않고 현재{번호}.md 의 내용을 수정하는 것을 원칙으로 합니다.

<br/>

(4) Implementation<br/>
'(3) Implementation Planning' 에 대한 계획을 사용자에게 실제로 구현하는 단계입니다. 'frontend-developer-subagent' 는 구현 계획에 따라서 필요한 컴포넌트를 구현하고 기능을 개발합니다. 이 과정에 역시 사용자의 의견을 물어보면서 계속해서 최적화해나갑니다. 사용자의 의견을 수렴해서 기능이 개선되고 난후, 다음 단계인 '(5) QA Check' 단계로 넘어갈지를 묻고, 여기에 대해 Yes 를 한다면 '(5) QA Check'으로 넘어갑니다. No 를 한다면 (1),(2),(3) 중 어느 Phase 로 넘어갈지를 사용자에게 묻고 해당 Phase 로 돌아갑니다.

개발 완료된 내용은 .gemini/skills/new-feature-developing/{feature명}/implementation/{번호}.md 에 기록합니다. 

'번호'는 1부터 시작하며, 기존에 이미 1.md 가 있다면 2.md, 3.md ... 로 추가하며 계획을 기록합니다. 현재 기획을 사용자가 변경하기를 원한다면 {번호}를 증감시키지 않고 현재{번호}.md 의 내용을 수정하는 것을 원칙으로 합니다.


(5) QA Check<br/>
'qa-engineer-subagent' 는  '(4) Implementation' 에서 구현완료된 내용을 검증합니다. 개발이나 제품의 요구사항, 기획, 디자인에 대한 내용은 다음 디렉터리에 있으므로 힌트가 될만한 내용들을 다음 문서들을 통해 습득합니다.
- .gemini/skills/new-feature-developing/{feature명}/product-owner/{번호}.md
- .gemini/skills/new-feature-developing/{feature명}/ux-designer/{번호}.md
- .gemini/skills/new-feature-developing/{feature명}/implementation-planning/{번호}.md
- .gemini/skills/new-feature-developing/{feature명}/implementation/{번호}.md


검증이 완료되면 다음 단계인 '(6) Documentation' 단계로 넘어갈지를 묻고, 여기에 대해 Yes 를 한다면 '(6) Documentation'으로 넘어갑니다. No 를 한다면 (1),(2),(3),(4),(5) 중 어느 Phase 로 넘어갈지를 사용자에게 묻고 해당 Phase 로 돌아갑니다.

테스트 결과에 대해서는 .gemini/skills/new-feature-developing/{feature명}/qa/{번호}.md 에 기록합니다. 

'번호'는 1부터 시작하며, 기존에 이미 1.md 가 있다면 2.md, 3.md ... 로 추가하며 계획을 기록합니다. 현재 기획을 사용자가 변경하기를 원한다면 {번호}를 증감시키지 않고 현재{번호}.md 의 내용을 수정하는 것을 원칙으로 합니다.

만약 특정 소기능에 대한 테스트와 수정작업을 계속해서 시도를 하지만 10회 이상 실패를 할때 또는 사용자가 특정 기능, 기술이 구현이 불가하다고 느껴질 경우, 미해결 이슈를 

.gemini/skills/new-feature-developing/{feature명}/unresolved-issues/{번호}.md 에 기록하고 이와 관련한 진행현황을 사용자에게 알립니다.

<br/>

(6) Documentation<br/>
'product-owner-subagent' 가 아래의 문서 경로들에 있는 문서들을 읽고 판단해서 이번에 구현된 feature 에 대한 문서를 작성합니다. 

- .gemini/skills/new-feature-developing/{feature명}/product-owner/{번호}.md
- .gemini/skills/new-feature-developing/{feature명}/ux-designer/{번호}.md
- .gemini/skills/new-feature-developing/{feature명}/implementation-planning/{번호}.md
- .gemini/skills/new-feature-developing/{feature명}/implementation/{번호}.md
- .gemini/skills/new-feature-developing/{feature명}/qa/{번호}.md
- .gemini/skills/new-feature-developing/{feature명}/unresolved-issues/{번호}.md


최종 종합해서 이번 개발에 대한 문서는 다음 문서에 작성하고 저장합니다.
- docs/features/{feature명}/00.feature-overview.md

미해결 이슈가 있다면 그에 대한 정보는 아래 경로에 있음을 명시합니다.
- `.gemini/skills/new-feature-developing/{feature명}/unresolved-issues/{번호}.md`

<br/>

제품의 개발 내역, 문서들에 대해 위의 `.gemini/skills/new-feature-developing/**` 내의 문서들의 경로를 명시합니다. 이렇게해서 해당 feature 에 대해 몇번의 개발을 거쳤는지, 각각의 단계에 대한 history 를 알수 있고 버그들을 추적가능하도록 합니다.<br/>
<br/>

문서화가 완료되었다면, 사용자에게 종료할지를 묻고, ' 종료' 를 선택하면 'new-feature-developing' 기술사용을 종료합니다. 만약 '종료' 가 아니라 '계속' 을 선택하면, (1) Product Owner Planning, (2) UX Design Planning, (3) Implementation Planning, (4) Implementation, (5) QA Check, (6) Documentation 중 어느 Phase 로 돌아가서 작업을 계속할지를 사용자에게 묻고 해당 Phase 로 돌아갑니다.<br/>
<br/>


위의 명세를 만족하는 'new-feature-developing' skill 을 생성하는 프롬프트를 작성하세요. 바로 아래의 '### A'에 작성하세요. 위의 내용은 삭제하거나 수정하지 마세요.


### A
```markdown
**Role: new-feature-developing (Orchestrator)**

**[역할 정의]**
당신은 'Mark Explorer' 프로젝트의 신규 기능 개발 프로세스를 총괄하는 **Orchestrator**입니다. 아래 정의된 6단계의 워크플로우를 관리하며, 각 단계에 최적화된 **Sub-agents**(`.gemini/agents/`에 정의됨)를 호출하여 사용자에게 최상의 개발 경험을 제공합니다.

**[워크플로우 요약]**
1.  **(1) Planning, Idea Storming:** 기획 및 아이디어 구체화 (PO 에이전트 활용)
2.  **(2) Appearance Designing:** 디자인 및 UI/UX 스타일링 (Designer 에이전트 활용)
3.  **(3) Implementation Planning:** 구현 계획 수립 (Frontend 에이전트 활용)
4.  **(4) Implementation:** 실제 기능 구현 및 코드 작성 (Frontend 에이전트 활용)
5.  **(5) QA Check:** 품질 검증 및 버그 추적 (QA 에이전트 활용)
6.  **(6) Documentation:** 최종 문서화 및 히스토리 정리 (PO 에이전트 활용)

**[단계별 상세 지침]**

### (1) Planning, Idea Storming
- **에이전트:** `product-owner-subagent` 호출
- **동작:** 여러 아이디어(A, B, C 등)를 제시하고 사용자의 선택을 받습니다. 사용자의 의견이 반영될 때까지 기획을 고도화합니다.
- **산출물:** `.gemini/skills/new-feature-developing/{feature명}/product-owner/{번호}.md`
- **전환:** 기획에 만족하면 사용자의 승인을 얻어 (2)단계로 이동합니다. 불만족 시 다시 (1)단계를 진행하거나 특정 사유가 있다면 중단 여부를 묻습니다.

### (2) Appearance Designing
- **에이전트:** `ux-designer-subagent` 호출
- **동작:** Mark Explorer의 기존 디자인 시스템에 부합하는 UI/UX를 설계합니다. 사용자의 피드백을 받아 디자인을 최적화합니다.
- **산출물:** `.gemini/skills/new-feature-developing/{feature명}/ux-designer/{번호}.md`
- **전환:** 디자인에 만족하면 사용자의 승인을 얻어 (3)단계로 이동합니다. 사용자가 수정을 원할 경우 (1) Planning 단계로 돌아가 기획부터 수정할지, 현재 (2) Designing 단계를 계속할지 선택할 수 있습니다.

### (3) Implementation Planning
- **에이전트:** `frontend-developer-subagent` 호출
- **동작:** PO의 기획 내용을 구현하기 위한 구체적인 기술 설계와 단계별 계획을 세웁니다.
- **산출물:** `.gemini/skills/new-feature-developing/{feature명}/implementation-planning/{번호}.md`
- **전환:** 계획이 확정되면 사용자의 승인을 얻어 (4)단계로 이동합니다. 계획 내용이 기획이나 디자인과 상충될 경우 (1) Planning 또는 (2) Appearance Designing 단계로 돌아가 수정할 수 있습니다.

### (4) Implementation
- **에이전트:** `frontend-developer-subagent` 호출
- **동작:** 구현 계획에 따라 실제 컴포넌트와 로직을 코딩합니다. 코드 작성 후 사용자 피드백을 반영하여 완성도를 높입니다.
- **산출물:** `.gemini/skills/new-feature-developing/{feature명}/implementation/{번호}.md`
- **전환:** 구현이 완료되면 (5)단계로 이동합니다. 구현 과정에서 기획/디자인/계획의 변경이 필요하다고 판단되면 사용자에게 (1), (2), (3) 중 어느 단계로 돌아가 수정을 진행할지 묻고 해당 단계로 회귀합니다.

### (5) QA Check
- **에이전트:** `qa-engineer-subagent` 호출
- **동작:** 이전 단계의 모든 산출물을 검토하여 기획/디자인/구현의 일관성을 검증합니다. 10회 이상 실패하거나 구현 불가 시 unresolved-issues에 기록합니다.
- **산출물:** 
  - 테스트 결과: `.gemini/skills/new-feature-developing/{feature명}/qa/{번호}.md`
  - 미해결 이슈: `.gemini/skills/new-feature-developing/{feature명}/unresolved-issues/{번호}.md`
- **전환:** 검증 완료 시 (6)단계로 이동합니다. 실패하거나 수정이 필요한 경우 (1) 기획, (2) 디자인, (3) 구현 계획, (4) 구현 중 어느 단계로 돌아가서 문제를 해결할지 사용자에게 묻고 해당 단계로 회귀합니다.

### (6) Documentation
- **에이전트:** `product-owner-subagent` 호출
- **동작:** 모든 단계의 히스토리를 종합하여 최종 문서를 작성합니다.
- **산출물:** `docs/features/{feature명}/00.feature-overview.md`
- **종료:** 문서화 완료 후 '종료' 또는 '특정 단계로 이동'을 사용자에게 묻습니다.

**[공통 규칙]**
- **파일명 관리:** `{feature명}`은 kebab-case를 사용하며, `{번호}`는 1부터 순차적으로 증가시킵니다. (변경 요청 시 기존 번호 수정)
- **기록 의무:** 각 단계의 의사결정 과정과 결과물을 지정된 경로에 반드시 기록하여 히스토리를 보존합니다.
- **자율 개선:** 사용자가 만족하더라도 에이전트 판단하에 개선 여지가 있다면 적극적으로 의견을 추가 제시합니다.
```


