# Architecture Specification: Plugin System & MCP Integration

이 문서는 Mark Explorer의 확장성을 책임지는 플러그인 시스템과 MCP(Model Context Protocol) 연동 아키텍처에 대해 기술합니다.

## 🏗 설계 개요
Mark Explorer의 플러그인 시스템은 애플리케이션 코어와 기능적 확장을 분리하여, 사용자가 필요한 기능을 선택적으로 추가하고 AI 모델이 외부 도구를 자유롭게 사용할 수 있도록 설계되었습니다.

## 🧩 플러그인 모델 (Plugin Model)

### 1. 기본 구조
모든 플러그인은 `Plugin` 추상 클래스를 상속받아야 합니다.
- **`onload()`**: 플러그인이 로드될 때 호출됩니다. UI 요소 등록, 명령어 추가 등을 수행합니다.
- **`onunload()`**: 플러그인이 언로드될 때 호출됩니다. 등록된 모든 리소스를 해제해야 합니다.

### 2. 매니페스트 (`manifest.json`)
플러그인의 정적 정보를 담고 있습니다.
- `id`: 고유 식별자 (예: `gemini-chat`)
- `name`: 사용자에게 표시될 이름
- `version`: 시맨틱 버저닝 기반 버전
- `minAppVersion`: 호환 가능한 최소 앱 버전

## 🔌 확장 포인트 (Extension Points)

### 1. Command Registry
플러그인은 `app.commands.addCommand()`를 통해 새로운 동작을 명령어 팔레트에 등록할 수 있습니다.

### 2. UI View Slots
- **Left/Right Sidebar**: 사용자 지정 뷰(View)를 사이드바 탭으로 주입할 수 있습니다.
- **Status Bar**: 하단 상태바에 작은 정보를 표시하는 아이템을 추가할 수 있습니다.

### 3. Editor/Preview Extensions
- **Tiptap Extension**: 에디터의 기능을 확장하는 새로운 Node나 Mark를 주입합니다.
- **Markdown Renderer**: Preview 화면에서 특정 문법을 처리하는 Post-processor를 등록합니다.

## 🤖 MCP (Model Context Protocol) 연동

### 1. MCP Client Integration
앱 코어는 하나 이상의 MCP 서버와 통신할 수 있는 클라이언트를 내장합니다.
- 플러그인이 활성화될 때, 해당 플러그인이 요구하는 MCP 서버 연결 정보를 `MCPManager`에 전달합니다.

### 2. Tool Registration
MCP 서버가 제공하는 도구(Tools)들은 플러그인을 통해 앱에 등록되며, Gemini 등 내장 AI 모델이 이를 인식하여 호출할 수 있게 됩니다.

## ⚠️ 핵심 보안 및 안정성
- **Error Boundary**: 플러그인 뷰 렌더링 시 발생하는 에러는 별도의 Error Boundary에서 처리하여 전체 앱의 크래시를 방지합니다.
- **API Restriction**: 플러그인은 전달받은 `App` 인스턴스를 통해서만 내부 상태에 접근하며, `private` 영역에 대한 직접적인 접근은 금지됩니다.
