# Goal: Refine TOC Precision and Heading Typography

## Objective
To improve the accuracy of the TOC scroll spy and refine the visual hierarchy of document headings (H1-H6) for better readability and a more professional appearance.

## Scope
- `MarkdownPreview.tsx` & `Editor.web.tsx`: Refine scroll detection logic and heading CSS styles.
- `app/index.tsx`: Implement immediate highlighting on TOC click.

## Success Criteria
- [x] Clicking a TOC item highlights the correct item immediately, even before the smooth scroll finishes.
- [x] Scroll spy correctly identifies the active section with higher precision during manual scrolling.
- [x] H1-H6 headings have a balanced and distinct visual hierarchy, with H4-H6 clearly distinguishable from bold body text.
