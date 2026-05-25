# Goal: TOC Scroll Spy (Active Section Highlighting)

## Objective
To improve user navigation and situational awareness by highlighting the current section being viewed in the Table of Contents (TOC). As the user scrolls through the document (either in Editor or Preview mode), the TOC should automatically reflect their position.

## Scope
- `TOCPane.tsx`: Add support for highlighting an "active" item.
- `app/index.tsx`: Manage the global state for the active heading.
- `MarkdownPreview.tsx`: Implement `IntersectionObserver` to detect visible headings.
- `Editor.web.tsx`: Implement scroll/position tracking to determine the active heading.

## Success Criteria
- [x] The TOC item corresponding to the topmost visible heading in the content area is visually highlighted (e.g., accent color, bold text).
- [x] Scrolling the document updates the TOC highlight in real-time.
- [x] Highlighting works consistently in both "Files" (Preview) and "Editor" tabs.
- [x] Smooth performance during scrolling with no layout shifts.
