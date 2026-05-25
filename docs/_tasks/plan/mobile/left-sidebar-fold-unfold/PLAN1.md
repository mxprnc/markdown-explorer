# Plan: Implementing Animated Mobile Sidebar

This plan outlines the steps to implement the redesigned sidebar interaction for Android/iOS.

## 🛠 Step 1: Animation Foundation
- Use the `Animated` API from `react-native` to manage sidebar position.
- Define an `animatedSidebarX` value (e.g., `-width` to `0`).
- Implement `toggleSidebar` function that triggers the animation.

## 🧱 Step 2: Component Refactoring
### 1. Header Update (`components/layout/Header.tsx`)
- Modify `onMenuPress` icon based on an `isOpen` prop.
- Use `menu-outline` when closed, and `chevron-back-outline` (Notion style) when open.

### 2. Sidebar Overlay & Scrim (`app/index.tsx`)
- Add a `Scrim` component (Pressable absolute View with opacity).
- Update the sidebar container in `app/index.tsx` to use `Animated.View`.
- Apply shadow and elevation for the "floating" effect on mobile.

## ✨ Step 3: UI/UX Polishing
- Add a subtle background highlight for the "Active File" in the explorer.
- Ensure the sidebar width is responsive (e.g., 80% of window width on phone).
- Test on different screen sizes (Phone vs Tablet).

## 🧪 Step 4: Verification
- Verify that tapping the Scrim closes the sidebar.
- Verify that opening the sidebar does not "shrink" the editor text on mobile.
- Verify smooth 60fps animation on Android.

---

## 📈 Detailed Tasks

### Task 1: Animation Hook/Logic
- [ ] Add `useRef(new Animated.Value(-width))` for sidebar position.
- [ ] Add `useRef(new Animated.Value(0))` for scrim opacity.

### Task 2: Layout Integration
- [ ] Wrap the mobile Sidebar in `Animated.View`.
- [ ] Implement the `Scrim` overlay behind the sidebar but above the editor.

### Task 3: Header Icon Logic
- [ ] Pass `isSidebarVisible` to `Header` component.
- [ ] Update icon rendering in `Header.tsx`.
