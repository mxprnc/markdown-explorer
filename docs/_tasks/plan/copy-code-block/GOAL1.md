# Goal: Smart Copy Button for Code Blocks

## Overview
Add a premium "Copy to Clipboard" button to all code blocks in 'Mark Explorer'. The goal is to provide a seamless and visually pleasing way for users to copy code snippets without manual selection.

## Success Criteria
1. **Premium UI**: The button should blend perfectly with the 'Obsidian & Violet' dark theme and the clean light theme.
2. **Micro-interactions**: Provide clear visual feedback (e.g., icon change to 'Check', 'Copied' text) when code is successfully copied.
3. **Consistency**: The button should appear and behave identically in both the Editor and the Preview mode.
4. **Cross-Platform**: Support clipboard operations on both Web and Native platforms.
5. **Accessibility**: Ensure the button is reachable and has appropriate hover/active states.

## Target Components
- `components/Editor.web.tsx` (CodeBlock NodeView)
- `components/preview/MarkdownPreview.tsx` (Markdown rendering)
