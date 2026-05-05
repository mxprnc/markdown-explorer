# UI/UX 디자인 및 브랜드 바이브 명세

이 문서는 'Mark Explorer' 프로젝트의 시각적 정체성, 디자인 시스템 및 사용자 경험(UX)의 핵심 원칙을 정의합니다. 특히 제공된 스크린샷(`toc_demo.png`)을 기반으로 한 **Light Mode**의 디자인 언어를 상세히 기술합니다.

---

## 1. 디자인 철학: "Clean, Professional, Content-First"
'Mark Explorer'의 라이트 모드는 사용자가 복잡한 설정 없이도 즉시 문서 작업에 몰입할 수 있도록 **백색 공간(White Space)**과 **정교한 블루 톤의 포인트**를 활용합니다.

- **Maximum Clarity**: 배경과 텍스트 간의 높은 대비를 통해 가독성을 극대화합니다.
- **Systematic Structure**: 사이드바, 에디터, TOC 패널이 명확하게 구분되어 정보의 계층 구조를 직관적으로 인지하게 합니다.
- **Functional Accents**: 중요한 인터랙션 포인트(활성 파일, TOC 위치 등)에만 컬러를 사용하여 시각적 노이즈를 최소화합니다.

## 2. 라이트 모드 컬러 시스템 (Light Mode Palette)

| 분류 | 색상 코드 | 용도 | 특징 |
| :--- | :--- | :--- | :--- |
| **Primary Background** | `#ffffff` | 메인 에디터 및 탭 영역 | 순백색으로 문서 본연의 느낌 강조 |
| **Sidebar Background** | `#f8f9fa` | 탐색기(Explorer) 및 패널 | 에디터와 시각적으로 분리되는 미세한 회색 |
| **Accent Color** | `#3b82f6` | 활성 아이콘, 하이라이트, 하단 바 | 'Gemini Blue' - 신뢰감 있고 현대적인 파란색 |
| **Active Highlight** | `#e6f0ff` | 선택된 항목의 배경색 | 보조 패널 내 현재 위치 표시 (TOC 등) |
| **Main Text** | `#111827` | 제목 및 본문 | 깊은 다크 그레이로 가독성 확보 |
| **Muted Text** | `#6b7280` | 비활성 탭, 보조 설명 | 시각적 위계를 위한 중간 톤 |
| **Border Color** | `#e5e7eb` | 패널 구분선, 코드 블록 경계 | 1px의 얇고 깔끔한 선 처리 |

## 3. 타이포그래피 (Typography)

- **Sans-serif (UI/Body)**: `Inter`, `-apple-system`, `BlinkMacSystemFont`. 현대적이고 중립적인 느낌을 주며 긴 텍스트 읽기에 적합합니다.
- **Monospace (Code)**: `SFMono-Regular`, `Menlo`, `Monaco`. 코드 블록과 마크다운 문법을 위해 일정한 간격을 유지합니다.
- **Hierarchy**:
  - **H1**: 크고 굵은 서체로 페이지의 주제를 명시.
  - **H2**: 단락의 시작을 알리는 뚜렷한 강조.

## 4. 컴포넌트 디자인 특징

### 4.1 에디터 및 마크다운 렌더링
- **Markdown Highlighting**: 에디터 내에서 마크다운 문법이 실시간으로 시각화됩니다.
  - `# Heading 1`: 볼드체, 큰 폰트 크기.
  - `- List items`: 커스텀 마커와 들여쓰기.
  - `> Blockquotes`: 왼쪽 테두리(Border-left)와 구별되는 텍스트 색상.
  - `Inline Code`: 배경색이 있는 모노스페이스 폰트.
- **Code Blocks**: 배경색(`#f9fafb`)과 테두리를 통해 본문과 분리. 우측 상단에 미세한 그림자가 있는 'COPY' 버튼 배치.
- **TOC (Table of Contents)**: 우측 패널에 위치. 현재 읽고 있는 섹션은 파란색 배경(`Active Highlight`)과 왼쪽의 두꺼운 파란색 인디케이터로 표시.

### 4.2 내비게이션 및 탭
- **TabBar**: 활성 탭은 에디터와 연결된 느낌을 주기 위해 하단 경계선이 없거나 흰색 배경 유지. 비활성 탭은 회색 배경으로 처리.
- **Explorer**: 폴더와 파일 구조를 아이콘과 함께 정렬. 선택된 파일은 파란색 아이콘과 텍스트로 강조.

### 4.3 하단 인터페이스 (Status & AI)
- **Status Bar**: 최하단에 위치하며 선명한 블루 배경에 화이트 텍스트를 사용하여 현재 상태(파일 경로, 인코딩 등)를 명확히 전달.
- **AI Chat Pane**: 하단에 고정 가능하며, 입력창에는 은은한 테두리와 블루 전송 아이콘 적용.

### 4.4 모바일 UI 최적화 (Mobile Optimization)
- **Responsive Workspace**: 세로(Portrait) 및 가로(Landscape) 모드 간의 자동 레이아웃 조정.
- **Safe Area Support**: `SafeAreaProvider`를 통해 노치(Notch)나 홈 인디케이터와 같은 시스템 UI 요소와의 겹침을 방지합니다.

## 5. 인터랙션 바이브 (Interaction Vibe)

- **Snappy Transitions**: 로딩이나 전환 시 지연 없는 빠른 반응을 지향합니다.
- **Soft Hover**: 리스트 아이템이나 버튼에 마우스를 올릴 때 미세한 배경색 변화를 주어 피드백을 제공합니다.
- **Clean Alignment**: 모든 요소는 그리드 시스템에 맞춰 정교하게 정렬되어 있어, 전문적인 도구로서의 신뢰감을 줍니다.

---

> [!TIP]
> 라이트 모드는 `toc_demo.png`의 시각적 요소를 표준으로 하며, 다크 모드와 전환 시 일관된 사용자 경험을 유지하도록 설계되었습니다.
