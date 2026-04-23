# Mark Explorer: AI-Powered Markdown Sidekick

Mark Explorer is a tool designed to intelligently explore local Markdown files and manage them in real-time within a modern UI. Leveraging Tiptap editor technology, it provides an intuitive live Markdown editing experience.

## ✨ Key Features

- **Live Markdown Editor**: A semi-WYSIWYG Markdown editing environment based on the Tiptap (ProseMirror) engine.
- **Precision Navigation**: Pixel-perfect Table of Contents (TOC) navigation based on `getBoundingClientRect` and `coordsAtPos`.
- **Multi-pane Workspace**: A flexible workspace supporting up to 2x2 split layouts and tab drag-and-drop.
- **Intelligent TOC**: A smart TOC system that distinguishes comments within code blocks to extract only meaningful headings.
- **Offline-First Resource**: Robust local file management through IndexedDB caching and the browser's Native File System API.
- **Rich Media**: Full support for formulas (KaTeX), diagrams (Mermaid), and code highlighting (Prism).
- **Plugin-based Template System**: An extensible system for dynamic variable substitution and template insertion using files in the `.mark-explorer/templates/` folder.
- **Robust Markdown Processing**: A Markdown preprocessing system that handles various rendering edge cases, such as heading normalization and link escape recovery.
- **One-click Nextra Export**: Instantly extract local directories into Nextra static site projects (ZIP) via a setup wizard. Provides perfect navigation through automatic image path substitution and `_meta.js` generation.

## 🛠 Tech Stack

- **Framework**: React Native (Expo SDK 54) / React Native Web
- **Editor Engine**: Tiptap (ProseMirror Wrapper)
- **Markdown Parser**: react-markdown (rehype/remark ecosystem)
- **Background Computing**: Web Worker (Worker Threads)
- **Design System**: Vanilla CSS with Design Tokens (`index.css`)

## 🚀 Getting Started

### 0. Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js**: LTS version (v20.x or higher)
- **For Android Development**: [Android Studio](https://developer.android.com/studio) and Android SDK.
- **For iOS Development**: [Xcode](https://developer.apple.com/xcode/) (macOS only).
- **For Desktop Development**: No extra tools required (Electron is included in dependencies).

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/alpha300uk/markdown-explorer.git
cd markdown-explorer

# Install dependencies
npm install
```

### 2. Running by Platform

#### 🌐 Web Environment
```bash
# Run web service (localhost:8081)
npm run web
```

#### 💻 Desktop Environment (Electron)
```bash
# Clean build and run Electron
rm -rf dist
npx expo export --platform web
npm run electron
```

#### 📱 Mobile Environment (Expo)
This project uses **Expo SDK 54**. You can run the app on simulators/emulators or physical devices.

*   **Physical Device**: Use the **Expo Go** app for the fastest development cycle.
*   **Simulator/Emulator**: Ensure you have [Xcode](https://developer.apple.com/xcode/) (iOS) or [Android Studio](https://developer.android.com/studio) (Android) set up.

```bash
# Run on iOS simulator or device
# (Tip: If you see version warnings, run 'npx expo install --fix')
npm run ios

# Run on Android emulator or device
# (Tip: If you see version warnings, run 'npx expo install --fix')
# (Note: Requires Android SDK & Emulator setup. See Troubleshooting below if 'adb' error occurs.)
npm run android
```

> [!NOTE]
> **About Expo Execution**:
> - **Global Install Not Recommended**: You don't need to run `npm install -g expo-cli`. Global installation is deprecated in favor of local versioning.
> - **Local Dependency**: The `expo` command is already included in `package.json`. Running `npm install` will automatically install the correct version in your `node_modules`.
> - **Execution Principle**: When you run `npm run android/ios`, it internally executes `node_modules/.bin/expo`. If you want to run expo commands directly from the terminal, use `npx expo <command>`.
> - **Version Synchronization**: If you see dependency version warnings, `npx expo install --fix` automatically syncs your library versions with the compatible versions required by the current Expo SDK.

> [!TIP]
> For a step-by-step guide on setting up your environment for Expo, check the **[Expo Environment Setup Guide](https://docs.expo.dev/get-started/set-up-your-environment/)**.
> For project-specific details, refer to **[deployment.md](./docs/plan/ci-cd/deployment.md)**.

### 📲 Development on Physical Devices (Expo Go)

For the best experience (especially when testing file system features), we recommend using a physical device.

1.  **Install Expo Go**: Download it from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) or [iOS App Store](https://apps.apple.com/app/expo-go/id982107779).
2.  **Connect to same Wi-Fi**: Ensure your phone and PC are on the same network.
3.  **Start with Tunnel (Recommended)**: If you encounter connection issues or are on different networks, use the tunnel mode:
    ```bash
    npx expo start --tunnel
    ```
4.  **Scan QR Code**:
    *   **Android**: Open Expo Go and tap "Scan QR Code".
    *   **iOS**: Open the default **Camera app** and scan the QR code, then tap the "Open in Expo Go" notification.

### 📱 For Mobile Development Beginners

If you are new to Android or iOS development, please follow these steps to set up your local environment.

#### 🤖 For Android Newbies (How to create an Emulator)
If `npm run android` fails because no device is found:
1. Open **Android Studio**.
2. Go to **Device Manager** (Tools > Device Manager).
3. Click **Create Device**, select a phone model (e.g., Pixel 7), and download a System Image (API 34 or 35).
4. Once created, start the emulator and run `npm run android` again.

#### 🍎 For iOS Newbies (How to setup Simulator)
If `npm run ios` fails with `No iOS devices available`, it usually means the system tools are not linked:

1. **Install Xcode**: Download it from the Mac App Store.
2. **Link Command Line Tools**: Run this in your terminal to tell the system where the developer tools are located:
   ```bash
   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
   ```
   *(This command tells your Mac exactly where the Xcode developer tools are stored so Expo can find the simulators.)*
3. **Download Simulators**: 
   - Open **Xcode > Settings**.
   - Look for **Components** (or **Platforms** in older versions).
   - Click the **Get** (or download) icon next to the latest **iOS** version.
4. **Manual Start**: If Expo still can't find the device (showing `No iOS devices available`), open the **Simulator.app** manually via Spotlight (Cmd + Space).
5. **Run**: Once the iPhone is on the screen and fully booted, run `npm run ios` again.
   - If you see an **"Operation timed out"** error, just wait for the simulator to reach the home screen and press `i` in the terminal to try again.
   - Using `npx expo start --ios --localhost` can also help bypass network issues.

### 🤖 Android Storage & Testing (SAF)

Since Expo SDK 54, Android requires **Storage Access Framework (SAF)** for accessing local directories. This project implements a robust SAF handling logic to ensure seamless file operations.

#### 📁 Testing with Local Files (Android Emulator)
To verify the file system features on an Android emulator:

1.  **Prepare a Test Directory**:
    -   Open the **Files** app on the emulator.
    -   Create a folder in **Documents** (e.g., `MarkExplorerDocs`).
    -   Inside that folder, create a test file (e.g., `test.md`).
2.  **Open Folder in Mark Explorer**:
    -   Tap the **Folder Icon** in the app header.
    -   When the system picker appears, navigate to `MarkExplorerDocs` and tap **"Use this folder"**.
    -   Grant the requested permissions.
3.  **Verification**:
    -   The app scans the directory and displays `test.md` in the Sidebar.
    -   Tapping the file loads the content into the Editor/Preview.

#### 🛠 Technical Note for SAF
-   **URI Scheme**: Native Android uses `content://` URIs. Standard string concatenation for paths is invalid for SAF.
-   **Implementation**: This project uses `StorageAccessFramework` and `expo-file-system/legacy` to resolve compatibility issues in SDK 54.
-   **Debug Logs**: Look for `[useFileSystem]` logs in the terminal to see the SAF URI resolution process.

### Testing Guide

#### 1. Unit and Integration Tests (Jest)
```bash
# Run all tests
npm test

# Run specific test files (e.g., Markdown utilities)
npm test utils/__tests__/MarkdownUtils.test.ts
npm test utils/__tests__/FileSystemUtils.test.ts

# Test watch mode (automatically re-run on changes)
npm test -- --watch
```

#### 2. E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run only specific component test files (e.g., TOC panel)
npx playwright test tests/e2e/toc-basic.spec.ts

# Run only on a specific browser engine (chromium, firefox, webkit)
npx playwright test tests/e2e/explorer-basic.spec.ts --project=chromium

# Run in UI mode (visually confirm and debug the test process)
npm run test:e2e:ui

# View the last test result report
npx playwright show-report
# (Tip: In case of port conflict, specify another port like npx playwright show-report --port 9324)
```

### Test Structure
- `utils/__tests__/`: Unit tests for utility functions (FileSystemUtils, MarkdownUtils, etc.).
- `hooks/__tests__/`: Logic tests for custom hooks (useFileSystem, useMarkdownWorker, etc.).
- `components/**/__tests__/`: Rendering and interaction tests for each UI component.
- `tests/e2e/`: End-to-End tests verifying the entire service flow (Playwright).

## 📖 Documentation System

This project operates a step-by-step specification system for AI task efficiency and development consistency.

1. **[GEMINI.md](./GEMINI.md)**: Overall project planning direction and coding guidelines (Main AI Hub).
2. **[Deployment Plan](./docs/plan/ci-cd/deployment.md)**: Guide for deployment and development environment setup by platform.
3. **[Component Specification](./docs/development/specification/components/overview.md)**: Detailed explanation of each core component's behavior and scroll logic.
4. **[Architecture: Editor Engine](./docs/development/specification/architecture/editor-engine.md)**: Background on Tiptap and ProseMirror adoption and utilization strategy.
5. **[Plan: Nextra Exporter](./docs/plan/exporter/nextra-exporter/PLAN1.md)**: Architecture and implementation roadmap for the Nextra project extraction system.

## ⚠️ Precautions (Troubleshooting)

### Android Build Issues (SDK & Dependencies)
If `npm run android` fails with `spawn adb ENOENT` or Android SDK path errors:
1. **Install Android SDK**: If not already installed, download and install [Android Studio](https://developer.android.com/studio) to obtain the Android SDK. Then, set environment variables in your shell config (`~/.zshrc` or `~/.bash_profile`):
   ```bash
   # Android SDK path (Adjust if installed in a custom location)
   export ANDROID_HOME=$HOME/Library/Android/sdk
   
   # Add Android tools to PATH
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
2. **Fix Dependencies**: If you see version mismatch warnings, run:
   ```bash
   # Use 'npx' (not 'npm') to run the expo command
   # Automatically fix version mismatches in package.json
   npx expo install --fix
   ```
3. **Start Emulator**: Ensure an Android emulator is running (via Android Studio Device Manager) or a physical device is connected with USB Debugging enabled before running `npm run android`.

### Expo Command Issues
If you see `expo: command not found` or similar errors:
1. **Check Installation**: Ensure you have run `npm install` in the project root.
2. **Use npx**: Instead of running `expo` directly, use `npx expo`. The project scripts (like `npm run android`) are already configured to use the local version.
3. **Reinstall Dependencies**: If the issue persists, try resetting your environment:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
Conflicts may occur with real-time page analysis extensions such as DeepL or YouTube Summary. If a `SecurityError` occurs or the editor slows down, please run in **Incognito Mode** or add an exception for `localhost:8081`.

### Connection/Network Issues (Infinite Loading Spinner)
If the app stays on the loading spinner forever:
1. **Force Localhost**: Sometimes Expo's auto-detected IP is unreachable. Restart the server with the `--localhost` flag:
   ```bash
   npx expo start --android --localhost
   # OR
   npx expo start --ios --localhost
   ```
2. **Clear Metro Cache**: If the bundler is stuck, try clearing the cache:
   ```bash
   npx expo start -c
   ```

### Emulator Quits Unexpectedly
If the emulator closes immediately after starting:
1. **Wipe Data**: In Android Studio Device Manager, click the three dots (`...`) next to your device and select **Wipe Data**. This fixes most startup crashes.
2. **Cold Boot**: Select **Cold Boot Now** from the same menu to bypass saved states.
3. **Check Architecture (Mac M1/M2/M3)**: Ensure you selected an **arm64-v8a** system image. **x86_64** images will not run on Apple Silicon.
4. **Manual Start**: Try running it directly from Android Studio first. If it works there, `npm run android` will then be able to connect to it.
- **Template Shortcut (macOS)**: The `Option + T` (Insert Template) shortcut may only work in certain situations due to macOS keyboard characteristics and event propagation interference. Alternatives such as a command palette or UI buttons are being considered. For details, refer to the [Issue Document](./docs/product/errors/open-template---shortcut-error/issue-20260421.md).

---

> [!TIP]
> When starting work in a new AI session, encourage reading the `GEMINI.md` at the top root first. It allows for an immediate understanding of the project context.
