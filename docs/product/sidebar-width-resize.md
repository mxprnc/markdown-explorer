# Layout Resizing System Specification

This document defines the interaction and technical specification for the layout resizing system in the Mark Explorer project.

---

## 1. Overview
Mark Explorer provides a flexible workspace where users can adjust the dimensions of various UI panes to suit their workflow. The resizing system is designed for high performance and smooth interaction across Web and Native platforms.

---

## 2. Adjustable Components

### 2.1 Explorer (Left Sidebar)
- **Feature**: Adjusts the width of the left sidebar containing the File Explorer and other sidebar views.
- **Interaction**:
    - A vertical resizer handle is located at the right edge of the sidebar.
    - Dragging the handle to the right increases the width; dragging to the left decreases it.
- **Constraints**:
    - **Min Width**: 120px
    - **Max Width**: 800px
- **Visuals**:
    - Transparent by default.
    - On hover or during resize, a thin (1px) `violet` line (Primary color) appears.
    - Cursor changes to `col-resize` on Web.

### 2.2 TOC Navigation (Right Sidebar)
- **Feature**: Adjusts the width of the Table of Contents pane when it is pinned to the workspace.
- **Interaction**:
    - A vertical resizer handle is located at the left edge of the TOC pane.
    - Dragging the handle to the left increases the width; dragging to the right decreases it.
- **Constraints**:
    - **Min Width**: 120px
    - **Max Width**: 800px
- **Visuals**:
    - Subtle 1px border line.
    - High-performance direct DOM manipulation during drag.

### 2.3 Gemini Chat (Footer/Bottom Pane)
- **Feature**: Adjusts the height of the Gemini AI chat interface at the bottom of the screen.
- **Interaction**:
    - A horizontal resizer handle is located at the top edge of the footer.
    - Dragging the handle upwards increases the height; dragging downwards decreases it.
- **Constraints**:
    - **Min Height**: 100px
    - **Max Height**: 800px
- **Visuals**:
    - Dragging handle integrated into the footer header.
    - Cursor changes to `ns-resize` on Web.

---

## 3. Technical Implementation

### 3.1 Core Hook: `usePaneResize`
The logic is centralized in the `usePaneResize` hook, which provides:
- **Responders**: `PanResponder` instances for each resizer.
- **States**: `leftPaneWidth`, `tocPaneWidth`, `middlePaneWidth`, `footerHeight`.
- **isResizing State**: A boolean flag to indicate an active resize operation.

### 3.2 Performance Optimization
- **Direct DOM Manipulation (Web)**: On the Web platform, the system uses `requestAnimationFrame` and `document.getElementById` to update element styles directly. This bypasses the React render cycle during the drag, ensuring 60fps performance.
- **Reanimated Integration**: `SharedValues` are used for smooth transition animations (e.g., opening/closing sidebars). During an active resize, `withTiming` animations are disabled to allow for instantaneous feedback.
- **Capture Handlers**: `PanResponder` uses capture phase handlers (`onStartShouldSetPanResponderCapture`) to ensure resizer handles take priority over underlying interactive elements (like the Markdown editor or scroll views).

### 3.3 State Synchronization
While direct DOM manipulation handles the visual update during the drag, the React state is updated simultaneously or at the end of the gesture to ensure consistency across the component tree and persistence (e.g., saving preferences).

---

## 4. UI/UX Guidelines
- **Hit Area**: Resizer handles have a larger hit area (approx. 10px) than their visual representation (1px) to ensure easy interaction on both mouse and touch devices.
- **Visual Feedback**: The active resizer handle should highlight using the project's primary accent color (`#7c3aed` Violet) to indicate it is being manipulated.
- **Responsive Behavior**: Resizing is disabled on small mobile screens where panes typically occupy fixed percentage widths or full-screen overlays.
