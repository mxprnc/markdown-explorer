# Mobile Editor Features

This document specifies the core editing features for the mobile (Android/iOS) version of Mark Explorer.

---

## 🎨 Markdown Highlighting
- **Live Preview in Editor**: Headings, Lists, Blockquotes, and Code blocks are visually distinguished within the editing area.
- **Visual Hierarchy**:
  - `# Heading 1`: Bold, large font size.
  - `- List items`: Indented with custom markers.
  - `> Blockquotes`: Border left and distinct text color.
  - `Inline Code`: Monospace font with background.

## 🤖 Gemini Assistant Toggle System
- **Dual Control Interface**:
  1. **Header Toggle**: A "Sparkles" icon in the header provides global visibility control for the Gemini Assistant panel.
  2. **Footer Chevron**: A small arrow on the left of the status bar allows for quick collapsing/expanding of the chat window.
- **Animations**: Uses `react-native-reanimated` with `withSpring` for fluid, physics-based height transitions.
- **Layout Persistence**: When collapsed, the footer remains at a minimal height (24px) to keep the file path and status bar visible.

## 📑 Smart Tab Management (VSCode Style)
- **Title Formatting**:
  - Default: `[filename].[extension]` (e.g., `test.md`).
  - Disambiguation: If multiple files with the same name are open, titles are formatted as `[filename] • [parent_folder]` (e.g., `notes.md • project-a`).
- **Path Decoding**: All paths and titles automatically decode URI components (e.g., `%2F` -> `/`) to ensure high readability.
- **Active State**: The active tab is highlighted with the primary theme color and bold text.

## 📱 Mobile UI Optimization
- **Responsive Workspace**: Automatic layout adjustments between portrait and landscape modes.
- **File Info Modal**: Easy access to file metadata and renaming through a dedicated mobile-friendly modal.
- **Safe Area Support**: Full integration with `SafeAreaProvider` to avoid overlaps with system UI elements like the notch or home indicator.
