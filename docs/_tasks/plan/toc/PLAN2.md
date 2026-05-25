# Implementation Plan: TOC and Typography Refinement

## Phase 1: TOC Precision & Interaction Fix ✅ Done
1.  **Immediate Click Feedback (`app/index.tsx`)**:
    - Update `handleTOCClick` to call `setActiveHeadingIndex(index)` immediately. This provides instant visual feedback.
2.  **Detection Logic Tuning (`MarkdownPreview.tsx` & `Editor.web.tsx`)**:
    - Synchronize the `scrollTo` offset and the `bestIndex` detection threshold.
    - If scrolling to `target - 150`, set the detection threshold slightly higher (e.g., `170`) to ensure the item "falls into" the active zone reliably.

## Phase 2: Heading Typography Overhaul ✅ Done
1.  **Unified Heading Styles**:
    - Define a clearer hierarchy for H1-H6 in both Preview and Editor.
    - **Proposed Font Sizes**:
        - H1: `2.0rem` (Bold, border-bottom)
        - H2: `1.6rem` (Bold, border-bottom)
        - H3: `1.3rem` (Bold)
        - H4: `1.15rem` (Bold, slightly larger than body)
        - H5: `1.0rem` (Bold, uppercase or distinct color)
        - H6: `1.0rem` (Bold, italic or gray)
2.  **Margin Adjustments**:
    - Increase `margin-top` for headings to better separate sections visually.

## Phase 3: Validation ✅ Done
1.  Test TOC clicking across various document lengths.
2.  Verify that H4, H5, H6 are easily distinguishable from standard bold text in both themes.
