# Goal: Mobile Test Support & Automation

Establish a robust testing environment to ensure feature parity and UI stability across iOS and Android platforms.

## 🎯 Primary Goals

### 1. Automated Component Testing
- Validate React Native components using `@testing-library/react-native`.
- Ensure platform-specific logic (e.g., `Platform.OS` branches) is covered by unit tests.
- Mock native modules (FileSystem, DocumentPicker) to test business logic in isolation.

### 2. Mobile E2E (End-to-End) Testing
- Implement automated user flow testing (e.g., "Open Folder -> Select File -> Edit -> Save").
- Target tool: **Maestro** (recommended for Expo/RN for its simplicity and speed).
- Verify interactions like swipe gestures, drawer opening, and keyboard handling.

### 3. Cross-Device Visual Validation
- Test the responsive layout on multiple screen resolutions (iPhone 13 mini vs. Galaxy S24 Ultra).
- Ensure Safe Area insets are correctly applied on devices with different notch styles.

### 4. Real-Device / Cloud Testing
- Set up a workflow for testing on physical devices using Expo Go and development builds.
- Evaluate cloud-based testing services (e.g., AWS Device Farm, BrowserStack) for large-scale device coverage.
