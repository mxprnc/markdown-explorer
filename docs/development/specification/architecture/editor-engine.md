# Editor Engine Specification: Tiptap & ProseMirror

Mark Explorer는 단순한 텍스트 편집기를 넘어, 사용자에게 시각적으로 풍부하면서도 마크다운의 정체성을 유지하는 편집 경험을 제공하기 위해 **Tiptap**을 핵심 에디터 엔진으로 채택했습니다.

## 🚀 선택된 엔진: Tiptap (built on ProseMirror)

- **핵심 엔진**: [ProseMirror](https://prosemirror.net/)
- **Wrapper 프레임워크**: [Tiptap](https://tiptap.dev/)
- **선택 사유**:
    1. **Live Markdown 경험**: 소스 코드(CodeMirror 방식)와 결과물(Preview 방식)의 경계를 허물고, 편집하는 즉시 서식이 적용되는 'Live' 환경 구축에 가장 적합합니다.
    2. **준구조화된 데이터**: ProseMirror의 스키마 기반 문서 모델을 통해 마크다운 구조를 논리적으로 관리하며, 복잡한 노드(수식, 코드 블록, 이미지 등)를 커스텀할 수 있는 강력한 익스텐션 시스템을 제공합니다.
    3. **트랜잭션 기반 상태 관리**: 에디터 내의 모든 변경 사항이 트랜잭션으로 관리되어, 안정적인 Undo/Redo 및 상태 동기화가 가능합니다.

## 🆚 CodeMirror와의 차이점

| 특징 | CodeMirror | Tiptap (ProseMirror) |
| :--- | :--- | :--- |
| **주 목적** | 소스 코드 편집 (IDE 스타일) | 리치 텍스트 및 라이브 마크다운 |
| **렌더링** | 텍스트 기반 구문 강조 | DOM 노드 기반 구조화 렌더링 |
| **사용자 경험** | 개발자 중심 (Raw Text) | 일반 사용자 중심 (WYSIWYG 친화적) |
| **우리 프로젝트 활용** | 보조적인 코드 하이라이팅 (Prism 대체재 검토용) | **메인 편집 엔진** |

## 🛠 현재 활용 방식

1. **스키마 확장**: 기본 `StarterKit` 외에 `Heading`, `Blockquote`, `Image` 등을 `extend`하여 마크다운 심볼(`###`, `> ` 등)과 연동된 커스텀 동작을 구현했습니다.
2. **마크다운 연동**: `tiptap-markdown` 라이브러리를 사용하여 ProseMirror의 내부 문서를 실시간으로 마크다운 문자열로 변환하고 캐시합니다.
3. **DOM 제어**: `useImperativeHandle`을 통해 `editor.view`에 직접 접근하여, 정밀한 스크롤 및 선택 영역 제어 로직을 수행합니다.

## ⚠️ 개발 시 주의사항

- 에디터 엔진의 동작을 수정할 때는 Tiptap의 Declarative한 명령(`commands`)을 우선적으로 사용하되, 이번에 구현된 스크롤 로직처럼 정밀한 제어가 필요할 때만 ProseMirror의 Imperative한 API(`view`, `state`)를 활용하십시오.
