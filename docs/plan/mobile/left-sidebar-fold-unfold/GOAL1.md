# Goal: Native Mobile Sidebar Fold/Unfold Experience

The objective is to transform the "awkward" sidebar behavior on Android into a professional, native-feeling interaction that draws inspiration from industry-leading tools like Obsidian and Notion.

## 🎯 Key Objectives

### 1. Visual Intuition (Inspired by Obsidian & Notion)
- **State-Aware Icons**: Use icons that clearly indicate the current state (e.g., Hamburger for closed, Chevron/Back for open).
- **Clear Hierarchy**: Ensure the sidebar toggle is always accessible in the top-left header, maintaining consistency for muscle memory.

### 2. Space Optimization (Mobile First)
- **Full Overlay (Notion Style)**: On mobile phones, the sidebar must overlay the editor content instead of pushing it. This preserves the editing area's aspect ratio and usability.
- **Scrim Integration**: Implement a semi-transparent background overlay (scrim) when the sidebar is open to focus the user's attention and provide a clear tap-to-close area.

### 3. Smooth Interactions
- **Animated Transitions**: Replace the instant show/hide with a smooth slide-in/out animation (250ms ease-out).
- **Gesture Support**: Lay the foundation for swipe-to-open/close gestures from the screen edge.

### 4. Adaptive Tablet Support
- **Hybrid Behavior**: Automatically switch from "Overlay Drawer" (Phone) to "Fixed Sidebar" (Tablet) based on screen width, while still allowing the user to fold it for more space.

## ✅ Success Criteria
- [ ] Sidebar slides in smoothly from the left on mobile.
- [ ] Editor content is dimmed (scrim) when the sidebar is active on mobile.
- [ ] Header icon changes from `menu` to `chevron-back` (or similar) when the sidebar is open.
- [ ] Tapping outside the sidebar (on the scrim) closes it.
- [ ] Mobile editing space remains at 100% width when the sidebar is closed.
