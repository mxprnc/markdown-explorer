## (1)
현재 light, dark 모드의 모습은 다음과 같습니다.
- light theme : ![alt text](screenshot1-1.png)
- dark theme : ![alt text](screenshot1-2.png)

각 테마 별로 코드 블록에 대한 복사 버튼을 어울리도록 생성하고, 코드 블록의 내용을 클립보드에 복사하는 기능을 추가하는 프롬프트를 만드세요.

위의 내용은 삭제하거나 수정하지 마세요. 바로 아래의 ### 프롬프트 섹션에 프롬프트를 작성하세요.

### 프롬프트
당신은 프리미엄 마크다운 에디터 'Mark Explorer'의 개발 총괄입니다. 코드 블록의 사용성을 높이기 위해, 각 테마별로 최적화된 **'스마트 복사 버튼(Smart Copy Button)'**을 에디터와 미리보기 영역에 추가하는 구현 계획을 세우세요.

#### 1. 시각적 디자인 가이드
- **Dark Mode (Obsidian)**: 
  - 버튼 배경: `#1e293b` (Slate) 또는 투명 처리.
  - 호버 시: `rgba(124, 58, 237, 0.2)` (Violet Glow) 배경 및 텍스트 강조.
  - 아이콘: 미니멀한 듀오톤 또는 아웃라인 아이콘 사용.
- **Light Mode**:
  - 버튼 배경: `#f1f5f9`.
  - 호버 시: `#e2e8f0` 배경 및 액센트 컬러 텍스트.
- **피드백 애니메이션**: 복사 완료 시 아이콘이 '체크' 표시로 부드럽게 전환(Transition)되며 'Copied' 문구가 나타나는 마이크로 인터랙션 구현.

#### 2. 기술적 구현 세부사항
- **플랫폼 지원**: 웹(Web)과 모바일(Native) 환경을 모두 고려한 범용적인 복사 로직 작성.
- **컴포넌트화**: 복사 버튼을 독립적인 UI 컴포넌트로 분리하여 에디터의 `CodeBlockComponent`와 미리보기의 `renderCodeBlock` 등에서 재사용 가능하도록 설계.
- **상태 관리**: 각 코드 블록별로 복사 성공 여부를 개별적으로 추적하여 피드백이 올바르게 표시되도록 처리.

#### 3. 적용 대상
- `components/Editor.web.tsx` 내의 코드 블록 NodeView.
- `components/preview/MarkdownPreview.tsx` 내의 코드 블록 스타일 및 기능 확장.

위 내용을 바탕으로 즉시 적용 가능한 **React 컴포넌트 코드와 스타일링 가이드**를 작성해주세요.

### Instruction
'### 프롬프트' 섹션의 내용의 개발을 진행하세요. 구현 계획과 목표를 docs/plan/copy-code-block/PLAN1.md, docs/plan/copy-code-block/GOAL1.md 에 작성하고 개발을 진행하세요.
