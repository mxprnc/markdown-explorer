# Goal: UI Globalization to English

## Objective
The primary goal is to replace all Korean UI text with English to provide a globally accessible user experience. By standardizing the interface language to English, we ensure that users from various backgrounds can navigate and use the application without language barriers.

## Scope
- All visible UI text (Buttons, Labels, Tooltips, Placeholders).
- System messages and alerts.
- AI Assistant (Gemini) default prompts and responses.
- Configuration and settings menus.

## Success Criteria
- [x] No Korean strings are visible in the main UI components.
- [x] All interactive elements (buttons, inputs) have clear English labels.
- [x] AI Assistant interactions (prompts/system messages) are standardized in English.
- [x] Automated tests pass with English string assertions.

## Target Components
- `Header.tsx`: Navigation and global controls.
- `GeminiChat.tsx`: AI interaction interface.
- `GeminiSettingsModal.tsx`: AI configuration.
- `EditorWorkspace.tsx`: Main editing environment.
- `FileItem.tsx`: File explorer interactions.
- `ErrorBoundary.tsx`: System error handling.
