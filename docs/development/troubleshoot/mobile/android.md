# Android Troubleshooting Guide

This document records issues and solutions encountered during Android development for Mark Explorer.

---

## 🚀 Animation and Layout Issues

### 1. Reanimated vs. Native Animated Conflict
- **Issue**: `TypeError: Cannot read property 'prototype' of undefined` when using `new Animated.Value`.
- **Cause**: Mixing standard React Native `Animated` API with `react-native-reanimated` in the same component or project can lead to internal engine conflicts on Android.
- **Solution**: Standardize on **Reanimated 3** for all layout animations.
  - Use `useSharedValue` instead of `new Animated.Value`.
  - Use `useAnimatedStyle` for reactive styles.
  - Use `withSpring` or `withTiming` for smooth transitions.

### 2. Duplicate SharedValue Declarations
- **Issue**: `SyntaxError` or silent failures when a variable like `footerHeight` is declared both as a state (from a hook) and a SharedValue.
- **Solution**: Use distinct naming conventions for SharedValues (e.g., `svFooterHeight` or `footerHeightAnim`) to avoid namespace collisions with local states or hook returns.

### 3. Missing Imports in Large Files
- **Issue**: `ReferenceError: Property 'useCallback' (or 'withSpring', 'GeminiChat') doesn't exist`.
- **Cause**: When performing complex code replacements in large files like `app/index.tsx`, existing imports can be accidentally overwritten or new dependencies might be missed.
- **Prevention**: Always verify the import block after using `multi_replace_file_content`. Ensure all used hooks and components are explicitly imported.

---

## 📂 File System and URI Handling

### 1. SAF URI Encoding
- **Issue**: Displaying raw Android SAF URIs results in unreadable strings like `primary%3ADocuments%2F...`.
- **Solution**: Implement a robust decoding utility using `decodeURIComponent`.
- **Helper**: 
  ```typescript
  export function decodePath(path: string): string {
    try {
      return decodeURIComponent(path);
    } catch (e) {
      return path;
    }
  }
  ```

### 2. Layout Overlap with Status Bar
- **Issue**: Absolute positioned status bars can cover interactive elements like chat input in `GeminiChat`.
- **Solution**: Use flexbox layouts instead of absolute positioning for persistent bars. Ensure the main content (chat) has `flex: 1` and the status bar has a fixed height within a vertical container.

---

## 🛠 State Management

### 1. Accidental State Removal
- **Issue**: `ReferenceError: Property 'historyIndex' doesn't exist` after editing the state declaration block.
- **Solution**: Be extremely careful when replacing the core state block in `MainScreen`. It's safer to use smaller, more targeted replacements or ensure all existing states are included in the replacement chunk.
