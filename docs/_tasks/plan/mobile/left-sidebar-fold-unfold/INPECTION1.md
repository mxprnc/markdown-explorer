# Inspection: Mobile Left Sidebar Fold/Unfold Design

This document analyzes the sidebar interaction patterns of Obsidian and Notion to improve the mobile UX of our Markdown Explorer.

---

## 🔍 Analysis of Reference Designs

### 1. Obsidian: Utilitarian & Accessible
- **Expanded (Photo 1)**:
    - **Ribbon + Explorer**: Uses a dual-layer sidebar. A thin "Ribbon" (vertical icon bar) remains fixed, while the wider "Explorer" can be toggled.
    - **Explicit Toggle**: A dedicated icon in the top header specifically for folding the sidebar.
    - **Hierarchy**: Clear distinction between navigation icons and content tree.
- **Collapsed (Photo 2)**:
    - **Minimal Footprint**: The explorer pane disappears entirely, maximizing the editor space.
    - **Quick Access**: The Ribbon icons often remain accessible or the toggle button is placed consistently in the top-left.

### 2. Notion: Minimalist & Focused
- **Expanded (Photo 3)**:
    - **Overlay/Push**: On desktop, it can push content; on mobile/small screens, it acts as an overlay.
    - **Hover Toggle**: Uses a subtle `<<` icon that appears near the border.
    - **Contextual Actions**: Workspace switcher and search are integrated at the top of the sidebar.
- **Collapsed (Photo 4)**:
    - **Zero Distraction**: The sidebar is completely hidden.
    - **Hamburger Access**: A single hamburger icon (`≡`) in the top-left header provides access.

---

## 🚩 Current Issues in Markdown Explorer (Android)
Based on the "awkward" feel reported:
1. **Layout Strategy**: If the sidebar "pushes" the editor on a small screen, the line length becomes too short for comfortable writing.
2. **Missing Toggle State**: Lack of a clear, animated transition between folded and unfolded states.
3. **Trigger Visibility**: If the open/close button isn't fixed in the header, users might lose track of how to navigate back to files.

---

## 💡 Proposed Improvements for Android App

### 1. Adopt the "Full Overlay" Drawer (Notion Style)
- **Behavior**: On Android phones, the sidebar should NEVER push the editor content. It must slide in as an **Overlay (Drawer)**.
- **Rationale**: Preserves the editor's horizontal space which is critical for Markdown editing.

### 2. Integrated Header Toggle (Obsidian & Notion Style)
- **Position**: Place a sidebar toggle button in the **Header (Top-Left)**.
- **Icon Strategy**:
    - **Obsidian Inspiration**: Use a `sidebar` icon that visually represents the layout.
    - **Notion Inspiration**: Use `chevron-back` (or `double-chevron-back`) when the sidebar is open to indicate "folding" it away.
- **Stateful Icon**:
    - Sidebar Closed: `menu` (hamburger) or `sidebar-layout-outline`.
    - Sidebar Open: `chevron-back` or `close-outline`.
- **Consistency**: The button should remain in the same visual location (Top-Left) regardless of whether the sidebar is open or closed, ensuring muscle memory for the user.

### 3. Visual Hierarchy & Micro-interactions
- **Scrim/Overlay**: When the sidebar is open, apply a semi-transparent dark overlay (scrim) over the editor. Clicking the scrim should close the sidebar.
- **Animation**: Use a 200-300ms ease-out slide animation from the left. 
- **Active State (Notion-like)**: The active file in the sidebar should have a subtle background highlight and a vertical bar on the side, similar to the "leetcode" entry in Photo 3.

### 4. Hybrid Layout for Tablets
- **Adaptive Behavior**: 
    - **Phone**: Overlay Drawer.
    - **Tablet**: Fixed Sidebar (Push) by default, with an Obsidian-style fold button to hide it when needed.

---

## 🛠 Action Items
1. [ ] Update `components/layout/Sidebar.tsx` to support absolute positioning on mobile.
2. [ ] Implement a `scrim` component in `components/layout/Layout.tsx`.
3. [ ] Add the sidebar toggle button to `components/layout/Header.tsx`.
4. [ ] Sync the `isSidebarOpen` state globally or via a dedicated layout context.
