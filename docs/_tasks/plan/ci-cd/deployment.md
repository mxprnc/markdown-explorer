# Markdown Explorer Deployment Plan

This document describes the deployment process and CI/CD pipeline configuration for the Web, Mobile, and Desktop platforms of the Markdown Explorer project.

---

## 1. Deployment Strategy by Platform

### 🌐 Web (Static Web)
*   **Build Tool**: Expo CLI (`npx expo export`)
*   **Artifacts**: Static files (HTML/JS/CSS) in the `dist/` directory
*   **Deployment Method**: 
    *   **GitHub Releases**: Compress the `dist/` folder into a ZIP and upload it to Assets.
    *   **Hosting**: Provide real-time previews via GitHub Pages or Vercel.

### 📱 Mobile (Android & iOS)
*   **Build Tool**: EAS (Expo Application Services)
*   **Artifacts**: 
    *   **Android**: `.apk` (for testing) or `.aab` (for store submission)
    *   **iOS**: `.ipa` (requires Apple Developer account)
*   **Deployment Method**: 
    *   Include build result links in Release notes via EAS Cloud Build.
    *   If necessary, download built binaries directly and add them to GitHub Release Assets.

### 💻 Desktop (PC - Windows, macOS, Linux)
*   **Build Tool**: `electron-builder`
*   **Artifacts**:
    *   **macOS**: `.dmg`, `.zip`
    *   **Windows**: `.exe` (NSIS), `.msi`
    *   **Linux**: `.AppImage`, `.deb`
*   **Deployment Method**:
    *   Generate native binaries for each OS via GitHub Actions Matrix Build.
    *   Automatically upload to GitHub Releases using `electron-builder`'s built-in features.

---

## 2. Development Environment Setup

This guide covers the environment settings required for smooth development and testing on each platform.

### 🌐 Common
*   **Node.js**: LTS version (v20.x or higher recommended)
*   **Package Manager**: `npm` (default project manager)
*   **Dependency Installation**: `npm install`

### 🌐 Web Development Environment
*   **Run**: `npm run web` (or `npx expo start --web`)
*   **Features**: Can be checked immediately in the browser; the most basic development environment.

### 💻 Desktop Development Environment (Electron)
*   **Prerequisites**: 
    *   The `electron` package must be installed via `npm install`.
*   **Development Workflow**:
    1.  **Clean Build Web Assets**: `rm -rf dist && npx expo export --platform web` (Electron currently loads static files from the `dist/` folder.)
    2.  **Run**: `npm run electron`
*   **Precautions**: 
    *   Changes must be rebuilt to be reflected in Electron. 
    *   (Planned) In development mode, `electron-main.js` can be modified to directly load the Expo Dev Server (`http://localhost:8081`).

### 📱 Mobile Development Environment (Expo/EAS)
*   **Prerequisites**:
    *   **Expo Go**: Install on a physical smartphone for immediate testing via QR code.
    *   **EAS CLI**: `npm install -g eas-cli` (required for build and deployment management)
    *   **Simulator/Emulator**:
        *   **iOS**: Install Xcode (macOS only)
        *   **Android**: Install Android Studio, SDK, and Emulator
*   **Development Workflow**:
    *   **iOS**: `npm run ios`
    *   **Android**: `npm run android`
*   **Expo Account**: Pre-login is required via `eas login`.

---

## 3. CI/CD Pipeline Configuration (GitHub Actions)

### Workflow Flow
1.  **Trigger**: User manually executes by entering a `release_tag` in the GitHub Actions tab (`workflow_dispatch`).
2.  **Job 1: Create Release**: Create a GitHub Release Draft to secure space for all platform artifacts.
3.  **Job 2: Web & Mobile Build**:
    *   Generate and compress static files for Web and upload them.
    *   Trigger mobile builds via the EAS Build command.
4.  **Job 3: Desktop Matrix Build**:
    *   Parallel builds in `macos-latest`, `windows-latest`, and `ubuntu-latest` environments.
    *   Automatically upload binaries for each OS to Release Assets.

### Required Environment Variables (Secrets)
| Name | Purpose |
| :--- | :--- |
| `EXPO_TOKEN` | Expo/EAS account authentication (for mobile builds) |
| `GITHUB_TOKEN` | Permissions to create GitHub Releases and upload files |
| `APPLE_ID` / `APPLE_APP_SPECIFIC_PASSWORD` | (Optional) Required for macOS app signing and notarization |

---

## 4. Future Improvements
*   **Auto-Versioning**: Add logic to automatically increment the version in `package.json` and create a Git Tag.
*   **Auto-Changelog**: Automatically write release notes based on commit messages.
*   **E2E Test Integration**: Enforce that Playwright tests must pass before any build can be deployed.
*   **Desktop Hot Reload**: Add Dev Server integration logic so changes are reflected in real-time during Electron development without requiring a Web build.
