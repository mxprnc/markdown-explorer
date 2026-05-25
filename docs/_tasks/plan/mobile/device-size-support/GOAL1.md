# Goal: Responsive Design for Smartphones (iOS & Android)

Optimize the UI/UX for a wide range of mobile devices, ensuring a seamless experience from small Android handsets to large iPhone Pro Max screens.

## 🎯 Primary Goals

### 1. Universal Safe Area Support
- Support **Dynamic Island/Notch** (iOS) and **Pinhole/Waterfall displays** (Android).
- Use `SafeAreaInsets` to adjust Header, Footer, and Floating Action Buttons (FABs).

### 2. Adaptive Sidebar (Common Drawer)
- Replace the fixed sidebar with a common **Navigation Drawer** for all smartphone devices.
- Implement a consistent "Hamburger" gesture (swipe from left) to open the explorer.
- Scale sidebar elements for better legibility on high-DPI mobile screens.

### 3. Screen-Adaptive Workspace
- **Auto-Stacking**: Switch from horizontal split-view to vertical stacking or a tabbed interface when the screen width is less than 768px.
- **Smart TOC**: Move the Table of Contents to a bottom sheet or an overlay to maximize editor space.

### 4. OS-Specific Interaction
- **Android**: Handle the physical/virtual **Back Button** to close modals or drawers instead of the app.
- **iOS**: Support native-like swipe gestures for tab navigation.
