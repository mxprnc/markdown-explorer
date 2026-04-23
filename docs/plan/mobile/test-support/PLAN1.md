# Plan: Implementation of Mobile Testing Environment

Roadmap to set up tools and write test cases for the mobile version of Mark Explorer.

## 🛠 Step 1: Unit & Component Test Setup
- Configure **Jest** with `jest-expo` for seamless React Native testing.
- Add `@testing-library/react-native` to the dev dependencies.
- **Task**: Create a mock system for `expo-file-system` to simulate folder structures in tests.

## 🤖 Step 2: Maestro for E2E Testing
- **Why Maestro?**: It's easier to maintain than Detox and works perfectly with Expo development builds.
- **Task**: Create a `.maestro/` directory and write YAML-based test flows:
  - `open_folder_flow.yaml`
  - `gemini_chat_flow.yaml`
  - `responsive_layout_check.yaml`

## 📏 Step 3: Device Emulator Matrix
- Define a list of "Gold Standard" emulators to run tests against:
  - **iOS**: iPhone 15 Pro (Dynamic Island), iPhone SE (Small screen).
  - **Android**: Pixel 8 (Standard), Galaxy Z Fold (Tablet/Large screen).
- Use `expo-test-runner` to orchestrate multi-device testing.

## 🔄 Step 4: Integration with CI/CD
- Add a new job to `.github/workflows/ci.yml` for mobile tests.
- Use a Mac runner for iOS tests (or stick to Android emulators on Linux runners for cost efficiency).
- Implement screenshot reporting for failed E2E tests.
