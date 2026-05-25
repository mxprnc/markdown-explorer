## Q1
새로운 기능을 개발하는 skill 을 생성하려 합니다. 다음의 sub agent 들을 활용해서 제품의 UI/UX 의 모습을 어떻게 구현할지, 규칙은 어떻게 할지 제품의 동작은 어떻게 정의할지 정의하는 단계를 product-owner-subagent를 이용해서 기획하며, 제품의 디자인이나 모습, 컴포넌트의 테마나 색상조합 등에 대해서는 ux-designer-subagent를 이용해서 정의하려고 합니다.

- product-owner-subagent
- ux-designer-subagent
- frontend-developer-subagent
- qa-engineer-subagent

기획의 STEP 은 다음과 같이 이뤄졌으면 합니다.

- (1) Idea Meeting
- (2) Appearance Designing 
- (3) Implementation Planning
- (4) Implementation
- (5) 기능 조율 및 튜닝
- (6) QA Check
- (7) Documentation

Skill 을 시작하는 초기에는 {feature명}을 무엇으로 할지를 사용자에게 묻고 해당 {feature명}으로 작업을 시작합니다. 만약 이미 `.gemini/skills/new-feature-developing/history/{feature명}` 디렉토리가 존재한다면 사용자가 수정을 원하는지를 물어봅니다. 사용자가 수정을 원한다면 {feature명}으로 작업을 시작합니다.  


(1) Idea Meeting<br/>
먼저 사전에 `.gemini/skills/new-feature-developing/history/{feature명}/product-owner` 내에 아무 파일도 없다면 1.md 파일을 만든 후 시작합니다. 

만약 사용자가 이미 작성해둔 `.gemini/skills/new-feature-developing/history/{feature명}/product-owner/{번호}.md` 파일이 있다면 다음 중 하나를 사용자가 선택하도록 합니다.
- '이미 존재하는 document 선택' (Choose one of existing documents) 
  - 이 옵션을 선택한다면 어떤 {번호}를 선택할지 묻습니다.
  - {번호}를 선택했다면 해당 문서를 수정할지를 묻고, 수정하기를 원한다면 기획 아이디어를 수정하는 작업을 시작합니다.
  - 만약 사용자가 수정하지 않기를 원한다면 바로 {번호}.md 파일 내용을 바탕으로 다음 단계인 (2) Appearance Designing 단계로 넘어갑니다.
- '새로운 document 생성' (Create new document) 
  - 이 옵션을 선택한다면 새로운 {번호}.md 파일을 생성한 후 사용자의 입력을 받고, 기획 아이디어를 정리하는 작업을 시작합니다.

제품에 대한 기획을 할때 여러가지의 의견이 있을 수 있습니다. 만약 제품에 대한 Idea 가 A, B, C 로 나왔다면, 이 것에 대해 사용자에게 의견을 물어봐서 A,B,C 중 어떤 것을 선택할지를 물어보고 선택합니다. 만약 사용자의 의견이 더 있는지를 물어보고 더 원하는게 있다면 다시 기획을 해서 발전시키거나 선택지를 수정해서 다시 물어봅니다.

이 과정을 반복하면서 사용자에게 만족스러운지를 묻고 '(2) Appearance Designing' 로 넘어갈지를 묻고, 여기에 대해 Yes 를 한다면 '(2) Appearance Designing'으로 넘어갑니다. No 를 한다면 (1) Idea Meeting 과정으로 돌아가서 다시 시작합니다. 단, 사용자가 기획에 대해서 만족을 했더라도 기획내용중에 개선의 여지가 있다고 판단되면 product-owner-subagent는 스스로 개선의견을 추가해서 다시 물어봅니다.

완료된 내용은 .gemini/skills/new-feature-developing/history/{feature명}/product-owner/{번호}.md 에 기록합니다. 

'번호'는 1부터 시작하며, 기존에 이미 1.md 가 있다면 2.md, 3.md ... 로 추가하며 계획을 기록합니다. 현재 기획을 사용자가 변경하기를 원한다면 {번호}를 증감시키지 않고 현재{번호}.md 의 내용을 수정하는 것을 원칙으로 합니다.

이 과정에서 'frontend-developer-subagent'에게 해당 내용이 구현 가능한지를 묻고, 만약 불가능하다면 불가능한 이유를 사용자에게 설명하고, 구현 가능한 대안을 제시합니다. 사용자가 대안을 받아들인다면 대안에 대한 (1) Idea Meeting 과정의 {번호}.md 파일을 수정하고 (2) Appearance Designing 과정으로 넘어갈지, 계속해서 {번호}.md 의 내용을 보완할지를 묻습니다. 

이때 'frontend-developer-subagent'에게 구현가능한지를 검토해달라고 요청할때 'frontend-developer-subagent' 에게 검토 결과를 .gemini/skills/new-feature-developing/history/{feature명}/feasibility-check/{번호}.md 파일에 기록하도록 요청하며, 이때 이 파일에 이전 사이클에 작성된 내용이 있다면, 모두 지우고 새로 작성하도록 전달합니다.<br/>

'product-owner-subagent'는 'frontend-developer-subagent'가 작성한 `.gemini/skills/new-feature-developing/history/{feature명}/feasibility-check/{번호}.md` 파일의 내용을 읽고 검토해서 `.gemini/skills/new-feature-developing/history/{feature명}/product-owner/{번호}.md` 의 내용을 수정 및 보완,업데이트 합니다.<br/>

`.gemini/skills/new-feature-developing/history/{feature명}/feasibility-check/{번호}.md` 파일에는 '구현불가' or '구현가능'을 명확히 명시해야 합니다.<br/>
<br/>


이 과정이 끝나면 `product-owner-subagent`는 `.gemini/skills/new-feature-developing/history/{feature명}/meeting-log/{번호}.md`를 작성하여 회의록을 작성합니다. 이미 작성된 내용이 있다면 새로 추가된 내용을 이어서 추가합니다.


(2) Appearance Designing <br/>
먼저 사전에 `.gemini/skills/new-feature-developing/history/{feature명}/ux-designer` 내에 아무 파일도 없다면 1.md 파일을 만든 후 시작합니다. 

만약 사용자가 이미 작성해둔 `.gemini/skills/new-feature-developing/history/{feature명}/ux-designer/{번호}.md` 파일이 있다면 다음 중 하나를 사용자가 선택하도록 합니다.
- '이미 존재하는 document 선택' (Choose one of existing documents) 
  - 이 옵션을 선택한다면 어떤 {번호}를 선택할지 묻습니다.
  - {번호}를 선택했다면 해당 문서를 수정할지를 묻고, 수정하기를 원한다면 디자인을 수정하는 작업을 시작합니다.
  - 만약 사용자가 수정하지 않기를 원한다면 바로 {번호}.md 파일 내용을 바탕으로 다음 단계인 (3) Implementation Planning 단계로 넘어갑니다.
- '새로운 document 생성' (Create new document) 
  - 이 옵션을 선택한다면 새로운 {번호}.md 파일을 생성한 후 사용자의 입력을 받고, 디자인을 정리하는 작업을 시작합니다.


'(1) Idea Meeting' 에 대한 디자인을 사용자에게 보여주기 위해서, mark explorer 의 현재의 전체 디자인에 대한 스타일에 부합하도록 발전시키거나 발전시켜 나갑니다. 이 과정에 역시 사용자의 의견을 물어보면서 계속해서 최적화해나갑니다. 사용자의 의견을 수렴해서 디자인이 개선되고 난후, 다음 단계인 (3) Implementation Planning 단계로 넘어갈지를 묻고, 여기에 대해 Yes 를 한다면 '(3) Implementation Planning'으로 넘어갑니다. No 를 한다면 (2) Appearance Designing 과정으로 돌아가서 다시 시작합니다. 단, 사용자가 디자인에 대해서 만족을 했더라도 디자인내용중에 개선의 여지가 있다고 판단되면 ux-designer-subagent는 스스로 개선의견을 추가해서 다시 물어봅니다.

완료된 내용은 .gemini/skills/new-feature-developing/history/{feature명}/ux-designer/{번호}.md 에 기록합니다. 

'번호'는 1부터 시작하며, 기존에 이미 1.md 가 있다면 2.md, 3.md ... 로 추가하며 계획을 기록합니다. 현재 기획을 사용자가 변경하기를 원한다면 {번호}를 증감시키지 않고 현재{번호}.md 의 내용을 수정하는 것을 원칙으로 합니다.

이 과정에서 'frontend-developer-subagent'에게 해당 내용이 구현 가능한지를 묻고, 불가능하다면 구현 가능한 방향으로 (2) Appearance Designing 과정으로 다시 진행합니다. 만약 기획 내용까지 변경해야 한다면 (1) Idea Meeting 과정으로 돌아갑니다.<br/>
<br/>


이때 'frontend-developer-subagent'에게 구현가능한지를 검토해달라고 요청할때 'frontend-developer-subagent' 에게 검토 결과를 .gemini/skills/new-feature-developing/history/{feature명}/feasibility-check/{번호}.md 파일에 기록하도록 요청하며, 이때 이 파일에 이전 사이클에 작성된 내용이 있다면, 모두 지우고 새로 작성하도록 전달합니다.<br/>

'product-owner-subagent'는 'frontend-developer-subagent'가 작성한 `.gemini/skills/new-feature-developing/history/{feature명}/feasibility-check/{번호}.md` 파일의 내용을 읽고 검토해서 `.gemini/skills/new-feature-developing/history/{feature명}/product-owner/{번호}.md` 의 내용을 수정 및 보완,업데이트 합니다.<br/>
<br/>



(3) Implementation Planning<br/>
제품을 구현을 계획하는 단계입니다. 'frontend-developer-subagent' 를 이용해서 제품을 구현하기 위해서 'product-owner-subagent'의 기획을 구현하기 위한 계획을 세워서 해당 기능 개발에 대한 계획을 .gemini/skills/new-feature-developing/history/{feature명}/implementation-planning/{번호}.md 에 계획을 기록합니다. 'feature' 명은 kebab case 를 따라야 하며, '번호'는 1부터 시작하며, 기존에 이미 1.md 가 있다면 2.md, 3.md ... 로 추가하며 계획을 기록합니다. 계획을 다 기록한 후 다음 단계인 Implementation 으로 넘어갈지를 사용자에게 묻고, 여기에 대해 Yes 를 한다면 '(4) Implementation'으로 넘어갑니다. No 를 한다면 (3) Implementation Planning 과정으로 돌아가서 다시 시작합니다. 단, 사용자가 Implementation Planning 에 대해서 만족을 했더라도 계획내용중에 개선의 여지가 있다고 판단되면 frontend-developer-subagent는 스스로 개선의견을 추가해서 다시 물어봅니다.

완료된 내용은 .gemini/skills/new-feature-developing/history/{feature명}/implementation-planning/{번호}.md 에 기록합니다. 

'번호'는 1부터 시작하며, 기존에 이미 1.md 가 있다면 2.md, 3.md ... 로 추가하며 계획을 기록합니다. 현재 기획을 사용자가 변경하기를 원한다면 {번호}를 증감시키지 않고 현재{번호}.md 의 내용을 수정하는 것을 원칙으로 합니다.

<br/>

(4) Implementation<br/>
'(3) Implementation Planning' 에 대한 계획을 사용자에게 실제로 구현하는 단계입니다. 'frontend-developer-subagent' 는 구현 계획에 따라서 필요한 컴포넌트를 구현하고 기능을 개발합니다. 개발이 완료되면 다음 단계인 '(5) 기능 조율 및 튜닝' 단계로 넘어갑니다.

개발 완료된 내용은 .gemini/skills/new-feature-developing/history/{feature명}/implementation/{번호}.md 에 기록합니다. 

'번호'는 1부터 시작하며, 기존에 이미 1.md 가 있다면 2.md, 3.md ... 로 추가하며 계획을 기록합니다. 현재 기획을 사용자가 변경하기를 원한다면 {번호}를 증감시키지 않고 현재{번호}.md 의 내용을 수정하는 것을 원칙으로 합니다.

(5) 기능 조율 및 튜닝<br/>
구현된 기능을 사용자에게 시연하고 피드백을 받는 단계입니다. 사용자의 의견을 수렴하여 수정이 필요한 부분을 수집하거나, 구현 결과가 만족스러운지 확인합니다.
- **수정 사항이 있는 경우**: (1) Idea Meeting, (2) Appearance Designing, (3) Implementation Planning, (4) Implementation 중 어떤 단계로 돌아가서 수정할지를 사용자에게 묻고 해당 단계로 이동합니다.
- **구현 결과가 만족스러운 경우**: 다음 단계인 '(6) QA Check' 단계로 넘어갈지를 묻고, Yes를 하면 '(6) QA Check'으로 이동합니다.

진행 과정 및 피드백 내용은 .gemini/skills/new-feature-developing/history/{feature명}/feedback/{번호}.md 에 기록합니다.

'번호'는 1부터 시작하며, 기존에 이미 1.md 가 있다면 2.md, 3.md ... 로 추가하며 기록합니다. 현재 내용을 수정하기를 원한다면 {번호}를 증감시키지 않고 현재{번호}.md 의 내용을 수정합니다.

이 과정이 끝나면 `product-owner-subagent`는 `.gemini/skills/new-feature-developing/history/{feature명}/meeting-log/{번호}.md`를 작성하여 회의록을 작성합니다. 이미 작성된 내용이 있다면 새로 추가된 내용을 이어서 추가합니다.


(6) QA Check<br/>
'qa-engineer-subagent' 는  '(4) Implementation' 에서 구현완료된 내용을 검증합니다. 개발이나 제품의 요구사항, 기획, 디자인에 대한 내용은 다음 디렉터리에 있으므로 힌트가 될만한 내용들을 다음 문서들을 통해 습득합니다.
- .gemini/skills/new-feature-developing/history/{feature명}/product-owner/{번호}.md
- .gemini/skills/new-feature-developing/history/{feature명}/ux-designer/{번호}.md
- .gemini/skills/new-feature-developing/history/{feature명}/implementation-planning/{번호}.md
- .gemini/skills/new-feature-developing/history/{feature명}/implementation/{번호}.md


검증이 완료되면 다음 단계인 '(7) Documentation' 단계로 넘어갈지를 묻고, 여기에 대해 Yes 를 한다면 '(7) Documentation'으로 넘어갑니다. No 를 한다면 (1),(2),(3),(4),(5) 중 어느 Phase 로 넘어갈지를 사용자에게 묻고 해당 Phase 로 돌아갑니다.

테스트 결과에 대해서는 .gemini/skills/new-feature-developing/history/{feature명}/qa/{번호}.md 에 기록합니다. 

'번호'는 1부터 시작하며, 기존에 이미 1.md 가 있다면 2.md, 3.md ... 로 추가하며 계획을 기록합니다. 현재 기획을 사용자가 변경하기를 원한다면 {번호}를 증감시키지 않고 현재{번호}.md 의 내용을 수정하는 것을 원칙으로 합니다.

만약 특정 소기능에 대한 테스트와 수정작업을 계속해서 시도를 하지만 10회 이상 실패를 할때 또는 사용자가 특정 기능, 기술이 구현이 불가하다고 느껴질 경우, 미해결 이슈를 

.gemini/skills/new-feature-developing/history/{feature명}/unresolved-issues/{번호}.md 에 기록하고 이와 관련한 진행현황을 사용자에게 알립니다.

그리고 (1) 단계에서부터 Product Owner, UX Designer, Implementation Planning, Implementation, QA Check 각 단계별로 테스트 실패 사항에 대해 어떤 내용을 수정해야 할지를 요청받고, 수정 요청사항을 수용할지 말지를 사용자에게 묻습니다. 수정을 요청사항을 수용하겠다면 해당 Phase 로 돌아가서 수정을 하고, 그렇지 않다면 (7) Documentation 단계로 넘어갑니다.

<br/>

(7) Documentation<br/>
'product-owner-subagent' 가 아래의 문서 경로들에 있는 문서들을 읽고 판단해서 이번에 구현된 feature 에 대한 문서를 작성합니다. 

- .gemini/skills/new-feature-developing/history/{feature명}/product-owner/{번호}.md
- .gemini/skills/new-feature-developing/history/{feature명}/ux-designer/{번호}.md
- .gemini/skills/new-feature-developing/history/{feature명}/implementation-planning/{번호}.md
- .gemini/skills/new-feature-developing/history/{feature명}/implementation/{번호}.md
- .gemini/skills/new-feature-developing/history/{feature명}/qa/{번호}.md
- .gemini/skills/new-feature-developing/history/{feature명}/unresolved-issues/{번호}.md


최종 종합해서 이번 개발에 대한 문서는 다음 문서에 작성하고 저장합니다.
- docs/features/{feature명}/00.feature-overview.md

미해결 이슈가 있다면 그에 대한 정보는 아래 경로에 있음을 명시합니다.
- `.gemini/skills/new-feature-developing/history/{feature명}/unresolved-issues/{번호}.md`

<br/>

제품의 개발 내역, 문서들에 대해 위의 `.gemini/skills/new-feature-developing/**` 내의 문서들의 경로를 명시합니다. 이렇게해서 해당 feature 에 대해 몇번의 개발을 거쳤는지, 각각의 단계에 대한 history 를 알수 있고 버그들을 추적가능하도록 합니다.<br/>
<br/>

문서화가 완료되었다면, 사용자에게 종료할지를 묻고, ' 종료' 를 선택하면 'new-feature-developing' 기술사용을 종료합니다. 만약 '종료' 가 아니라 '계속' 을 선택하면, (1) Idea Meeting, (2) Appearance Designing, (3) Implementation Planning, (4) Implementation, (5) 기능 조율 및 튜닝, (6) QA Check, (7) Documentation 중 어느 Phase 로 돌아가서 작업을 계속할지를 사용자에게 묻고 해당 Phase 로 돌아갑니다.<br/>
<br/>


위의 명세를 만족하는 'new-feature-developing' skill 을 생성하는 프롬프트를 작성하세요. 바로 아래의 '### A'에 작성하세요. 위의 내용은 삭제하거나 수정하지 마세요.


### A
```markdown
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

```


