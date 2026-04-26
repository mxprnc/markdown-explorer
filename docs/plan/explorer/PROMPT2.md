## (1)
#### 증상
현재 Explorer 모드, Editor 모드 모두에서 좌측의 Explorer 의 width 를 드래그해서 줄이거나 늘릴 수 가 없습니다.

이 문제를 해결하기 위한 프롬프트를 아래의 '### 프롬프트' 섹션에 작성하세요. 위의 '#### 증상' 섹션의 내용을 지우거나 수정하지 마세요.

#### 프롬프트
현재 Explorer(사이드바)의 너비를 조절할 수 없는 문제를 해결하기 위해 다음 작업을 수행하세요.

1.  **원인 분석**:
    -   `usePaneResize` 훅은 웹 환경에서 `id="explorer-pane"`인 엘리먼트를 직접 조작하려고 하지만, `app/index.tsx`의 사이드바 컨테이너에 해당 ID가 누락되어 있습니다.
    -   사이드바와 메인 워크스페이스 사이에 드래그를 감지할 수 있는 'Resizer' UI 요소가 존재하지 않습니다.
    -   `app/index.tsx`에서 `FileExplorer`에 `leftPaneResponder`를 빈 객체(`{{ panHandlers: {} }}`)로 전달하고 있습니다.

2.  **구현 단계**:
    -   **사이드바 컨테이너 수정**: `app/index.tsx`에서 사이드바를 감싸는 `Animated.View`에 `nativeID="explorer-pane"`를 추가하세요.
    -   **Resizer 컴포넌트 추가**: 사이드바와 메인 콘텐츠(`flex: 1` View) 사이에 세로형 Resizer 바를 구현하세요.
        -   이 바는 `leftPaneResponder.panHandlers`를 사용하여 드래그를 감지해야 합니다.
        -   웹 환경에서는 `cursor: 'col-resize'` 스타일이 적용되어야 합니다.
        -   디자인 시스템에 맞춰 평소에는 투명하다가 호버 시에 `violet` 액센트 색상의 선이 나타나도록 구현하여 프리미엄 느낌을 주십시오.
    -   **상태 연동**: `isMobile`이 아닐 때만 Resizer가 보이도록 하고, 사이드바가 닫혀있을 때는 Resizer도 숨겨야 합니다.
    -   **훅 연동**: `FileExplorer` 컴포넌트에 더 이상 `leftPaneResponder`를 직접 넘길 필요가 없다면(Resizer 바가 대신 처리하므로), 해당 프롭 전달 로직을 정리하세요.

3.  **디자인 세부사항**:
    -   Resizer 바의 너비는 약 4~6px 정도로 잡아 드래그 영역을 확보하되, 시각적인 선은 1~2px 정도로 얇고 세련되게 표현하세요.
    -   호버 시 `theme.colors.primary` (Violet) 색상이 적용되도록 하십시오.
