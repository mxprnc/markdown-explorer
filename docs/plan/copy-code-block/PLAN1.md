# Implementation Plan: Smart Copy Button

## Phase 1: Core Component Logic
1. **Create `CopyButton` Component**:
   - Create `components/ui/CopyButton.tsx`.
   - Implement `Clipboard` logic (handle Web `navigator.clipboard` and Native fallback).
   - Add state for `copied` feedback (toggle for 2 seconds).
   - Use `Ionicons` for 'copy' and 'checkmark' icons.

## Phase 2: Editor Integration
1. **Update `Editor.web.tsx`**:
   - Replace the existing simple 'Copy' button in `CodeBlockComponent` with the new `CopyButton`.
   - Ensure `stopPropagation` is handled correctly to avoid Tiptap selection issues.

## Phase 3: Preview Integration
1. **Update `MarkdownPreview.tsx`**:
   - `react-native-markdown-display` usually requires custom rules for code blocks.
   - Inject the `CopyButton` into the code block header in the Preview component.

## Phase 4: Styling & Polishing
1. **Theme Awareness**:
   - Use `useTheme` to apply the 'Obsidian' dark theme colors (Violet accent) and light theme colors.
   - Add transition animations for the 'Copied' state.
2. **Native Support**:
   - Ensure the button works and looks good on iOS/Android if applicable.
