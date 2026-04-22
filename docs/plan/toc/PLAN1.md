# Implementation Plan: TOC Scroll Spy (Active Section Highlighting)

## Phase 1: State Management & UI Foundation
1.  **Global State (`app/index.tsx`)**:
    - Add `activeHeadingIndex` state in `MainScreen`.
    - Pass this state down to `TOCPane`.
2.  **Highlight UI (`TOCPane.tsx`)**:
    - Add `activeIndex` prop to the component.
    - Apply conditional styling to the active item:
        - `borderLeftWidth: 3`, `borderLeftColor: colors.primary`
        - `backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)'`
        - `color: colors.primary`

## Phase 2: Preview Mode Integration
1.  **Scroll Detection (`MarkdownPreview.tsx`)**:
    - Add `onHeadingVisible` prop.
    - Use `IntersectionObserver` on `h1-h6` elements.
    - Logic: Use a `rootMargin` (e.g., `-50px 0px -80% 0px`) to detect when a heading is at the "reading position" near the top.
    - Update `activeHeadingIndex` via the callback.

## Phase 3: Editor Mode Integration
1.  **Editor Sync (`Editor.web.tsx`)**:
    - Listen to editor scroll or cursor updates.
    - Periodically (or on change) identify which heading is currently at the top of the editor view.
    - Call `onHeadingVisible` with the appropriate index.

## Phase 4: Refinement
1.  **TOC Auto-scroll**: If the TOC list is long, use `scrollIntoView` or `ScrollView.scrollTo` to ensure the highlighted TOC item is itself visible within the TOC pane.
2.  **Debouncing**: Throttle the scroll spy updates to avoid excessive re-renders during rapid scrolling.
