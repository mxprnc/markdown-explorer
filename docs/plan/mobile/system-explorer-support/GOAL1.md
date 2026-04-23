# Goal: Mobile System Explorer Support

Ensure that users can open and navigate local folders on mobile devices (iOS/Android) just like they do on the web/desktop version.

## 🎯 Primary Goals

### 1. Native File System Access
- Bridge the gap between Web's `showDirectoryPicker` and Native's `DocumentPicker`.
- Implement recursive file/folder scanning using `expo-file-system`.
- Support standard mobile storage providers (Files app on iOS, File Manager on Android).

### 2. Permission Management
- Handle OS-level permissions for reading/writing to external folders.
- Implement "Scoped Storage" support for Android 11+.
- Ensure permissions are persisted so users don't have to re-select the folder every time.

### 3. File Tree Performance
- Optimize the loading of large directories on mobile hardware.
- Implement lazy-loading for subdirectories to prevent UI freezes.
