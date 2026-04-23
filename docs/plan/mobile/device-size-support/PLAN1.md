# Plan: Implementation of Responsive Mobile Design

Roadmap to refactor the core layout for cross-platform mobile compatibility.

## 🛠 Step 1: Layout Logic Refactoring
- Implement a `useIsMobile()` hook using `useWindowDimensions()`.
- Define breakpoints:
  - **Mobile**: < 768px (iPhone/Android Phone)
  - **Tablet**: 768px - 1024px (iPad/Android Tablet)
  - **Desktop**: > 1024px (Web/PC)

## 📂 Step 2: Native Drawer System
- Integrate `@react-navigation/drawer` or build a custom `Animated` drawer for the File Explorer.
- Hide the `leftPaneWidth` resizing logic on mobile devices.
- Add a "Menu" button to the `Header` component specifically for mobile users.

## 📱 Step 3: Android Stabilization
- Implement `BackHandler` listeners to ensure a native navigation feel.
- Optimize the `SettingsModal` to prevent keyboard overlapping using `KeyboardAvoidingView`.

## ✨ Step 4: UI Refinement
- Adjust font sizes and button paddings globally for touch targets (minimum 44x44px).
- Simplify the `GeminiChat` footer for mobile screens (e.g., hiding optional metadata).
