# Plan: Implementation of Mobile System Explorer

Technical roadmap to enable folder-based exploration on mobile devices.

## 🛠 Step 1: Library Installation & Evaluation
- **Install Dependencies**:
  - `npx expo install expo-document-picker expo-file-system`
- **Primary Choice**: `expo-document-picker` with `directory` mode.
- **Storage Management**: `expo-file-system` for recursive listing and metadata retrieval.
- **Android Specific**: Use `StorageAccessFramework` for persistent folder access.

## 📂 Step 2: Adaptive File Service & Hook
- **Unified `useFileSystem`**:
  - Refactor `handleOpenDirectory` in `app/index.tsx` to call a platform-agnostic method.
  - Update `useFileSystem.ts` to branch based on `Platform.OS`.
  - **Mobile Branch**: Use `DocumentPicker.getDirectoryUriAsync()` (Android) or `DocumentPicker.getDocumentAsync()` (iOS/Android).
- **Normalization**: Normalize URI-based paths to match the existing `FileSystemItem` interface.

## 🔑 Step 3: Permission & Persistence
- Implement logic to request and check permissions using `expo-file-system`.
- On Android, use `StorageAccessFramework` to list files and read/write once URI is obtained.
- Store the selected `directoryUri` in `AsyncStorage` or similar to persist across reloads.

## 🚀 Step 4: UI Refactoring & Visibility
- **Fix Visibility**: Remove `Platform.OS === 'web'` checks that prevent the "Open Folder" button from appearing or functioning.
- **Loading State**: Add a loading spinner during the initial recursive scan of a mobile folder.
- **Responsive Sidebar**: Ensure the sidebar doesn't shrink to 0 width on mobile when no folder is selected.
