# Goal: Fix Inline Code Rendering Issue

## Objective
The primary objective is to resolve the layout issue where inline code (surrounded by single backticks) is rendered as a block element in Explorer (Preview) mode, causing unwanted line breaks and occupying full width.

## Scope
- `MarkdownPreview.tsx`: Update the `code` component renderer to distinguish between inline code and code blocks.
- CSS Styling: Implement appropriate inline styling for `<code>` elements to ensure they stay within the text flow.

## Success Criteria
- [x] Inline code (e.g., `text`) renders within the same line as the surrounding text.
- [x] Code blocks (triple backticks) continue to render as distinct blocks with syntax highlighting and proper margins.
- [x] Visual consistency (background, font, padding) is maintained across both light and dark themes.
