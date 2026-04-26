# 에디터 코드 블록 복사 기능 (Smart Copy Button)

## 1. 개요
'Mark Explorer'는 사용자가 코드 스니펫을 빠르고 정확하게 복사할 수 있도록 코드 블록 상단에 지능형 복사 버튼을 제공합니다. 이 기능은 에디터(Editor)와 미리보기(Files) 모든 모드에서 일관되게 작동하며, 프리미엄 다크 테마에 최적화된 디자인을 갖추고 있습니다.

## 2. 주요 기능
### 2.1 스마트 복사 로직
- **다중 플랫폼 지원**: 웹 환경(`navigator.clipboard`)과 모바일 환경(`expo-clipboard`)을 자동으로 감지하여 최적의 복사 방식을 사용합니다.
- **콘텐츠 추출**: 코드 블록 내의 순수 텍스트만을 정확하게 추출하여 클립보드에 저장합니다.

### 2.2 시각적 피드백 (Micro-interactions)
- **상태 변화**: 복사 버튼 클릭 시 아이콘이 'Copy'에서 'Check'로, 텍스트가 'Copy'에서 'Copied'로 2초간 변경되어 복사 성공 여부를 직관적으로 알립니다.
- **애니메이션**: 부드러운 상태 전환 효과를 통해 프리미엄 마감 품질을 제공합니다.

### 2.3 테마 최적화
- **Dark Mode (Obsidian)**: 깊이감 있는 어두운 배경에 Violet 액센트를 활용하여 높은 시인성을 확보합니다.
- **Light Mode**: 깔끔한 Slate Gray 톤을 사용하여 에디터 전체 디자인과 조화를 이룹니다.

## 3. UI 구성 요소
### 3.1 에디터 (Tiptap)
- 코드 블록 상단에 언어 이름(Language)과 복사 버튼이 포함된 헤더가 표시됩니다.
- 편집 중(`isFocused`)일 때는 방해를 최소화하기 위해 헤더를 숨기고 원본 마크다운 구조를 보여줍니다.

### 3.2 미리보기 (Markdown Preview)
- **Premium Layout**: Mac 스타일의 윈도우 조작 버튼(Red, Yellow, Green) 디자인을 적용하여 개발자 도구와 같은 전문적인 느낌을 줍니다.
- 그림자 효과(`box-shadow`)를 통해 코드 블록이 배경에서 떠 있는 듯한 입체감을 제공합니다.

## 4. 기술 명세
- **컴포넌트**: `components/ui/CopyButton.tsx` (독립형 모듈)
- **사용 기술**: React Native, Expo Clipboard, Tiptap NodeView, React-Markdown (Web), React-Native-Markdown-Display (Native)

---
> [!NOTE]
> 이 기능은 `GEMINI.md`의 프리미엄 디자인 가이드라인을 준수하여 구현되었습니다.
