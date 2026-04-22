# Implementation Plan: Inline vs. Block Code Distinction

## Overview
Currently, the `code` component in `MarkdownPreview.tsx` wraps all code in a `display: block` span, which causes inline backticks to break the line. This plan corrects that behavior.

## Phase 1: Code Component Refactoring
Modify `components/preview/MarkdownPreview.tsx` to handle inline code differently.

### Logic Changes
- **Identification**: Use the absence of a `language-` class or the presence of an `inline` prop to identify inline code.
- **Conditional Rendering**:
  - **Inline**: Render as a `<code>` tag or a `span` with `display: inline-block` or `inline`.
  - **Block**: Render using `SyntaxHighlighter` with `display: block`.

### Styling Adjustments
- **Inline Style**:
  - `padding: 2px 4px`
  - `borderRadius: 4px`
  - `fontSize: 0.9em`
  - Background color based on theme (`isDark`).
- **Block Style**: Keep existing padding and margins.

## Phase 2: Implementation Details
1.  **Extract Props**: Update the `code` renderer to correctly identify the `inline` status.
2.  **Apply Theme Colors**: Ensure the background and text colors for inline code match the existing design tokens.
3.  **Handle Special Cases**: Ensure `mermaid` diagrams are still treated as blocks regardless of the inline status (though they are usually blocks anyway).

## Phase 3: Verification
1.  **Visual Check**: Open a file containing `inline code` and verify it stays in the same line.
2.  **Theme Check**: Verify appearance in both Light and Dark modes.
3.  **Regression Check**: Verify that normal code blocks and mermaid diagrams are unaffected.
