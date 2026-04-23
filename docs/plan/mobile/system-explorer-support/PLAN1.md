# Plan: Implementation of Mobile System Explorer

Technical roadmap to enable folder-based exploration on mobile devices.

## 🛠 Step 1: Library Evaluation
- **Primary Choice**: `expo-document-picker` with `directory` mode.
- **Alternative**: `react-native-file-access` if more low-level control is needed.
- **Storage Management**: `expo-file-system` for recursive listing and metadata retrieval.

## 📂 Step 2: Adaptive File Service
- Implement a unified `FileService` wrapper that branches based on `Platform.OS`:
  - **Web**: Continue using `FileSystemHandle` API.
  - **Mobile**: Use `DocumentPicker.getDirectoryUriAsync()` and `FileSystem.readDirectoryAsync()`.
- Normalize the data structure to match the existing `FileSystemItem` interface.

## 🔑 Step 3: Permission Workflow
- Implement a setup wizard or a modal that explains why folder access is needed.
- Handle "Deny" scenarios gracefully by offering a sandbox folder option.
- Verify security and privacy by strictly accessing only the selected folder.

## 🚀 Step 4: UI Refactoring
- Update the "Open Folder" button logic in `FileExplorer.tsx` to trigger the native picker on mobile.
- Add a loading spinner during recursive scanning.
