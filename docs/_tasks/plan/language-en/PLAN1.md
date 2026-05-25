# Implementation Plan: UI English Localization

## Overview
This plan outlines the steps to replace Korean strings with English equivalents across the application.

## Phase 1: Resource Extraction & Mapping
Identify all Korean strings and define their English counterparts.

| Original (Korean) | Target (English) | Context |
| :--- | :--- | :--- |
| 탐색기 | Explorer | Header Tab |
| 에디터 | Editor | Header Tab |
| 폴더를 열어주세요 | Please open a folder | Header Title Placeholder |
| 복사(md) | Copy (MD) | Gemini Chat Action |
| 설정 | Settings | Gemini Chat / Modal |
| 생각 중... | Thinking... | Gemini Chat Loading |
| 메시지를 입력하세요... | Type a message... | Chat Placeholder |
| 인증이 필요합니다 | Authentication required | Chat Empty State |
| 파일명.md | filename.md | Archive Path Placeholder |

## Phase 2: Code Implementation
Modify the following components:

### 1. Header Localization (`components/layout/Header.tsx`)
- Update "폴더를 열어주세요"
- Update "탐색기"
- Update "에디터"

### 2. Gemini Assistant Localization (`components/GeminiChat.tsx`)
- Update system prompt logic (ensure AI responds in English by default).
- Update status messages (Loading, Error, Copy alert).
- Update button labels and placeholders.

### 3. Settings Localization (`components/gemini/GeminiSettingsModal.tsx`)
- Update help texts for API Key and OAuth sections.
- Update UI test labels and descriptions.

### 4. System & Error Localization
- `components/ui/ErrorBoundary.tsx`: Update user-facing error messages.
- `components/preview/ImageViewer.tsx`: Update any status text.

## Phase 3: Test Suite Updates
- Update `components/layout/__tests__/Header.test.tsx` to assert English text.
- Update `components/editor/__tests__/EditorWorkspace.test.tsx`.
- Ensure E2E tests (Playwright) that rely on text selectors are updated.

## Phase 4: Final Review
- Manual check of all UI flows in both Light and Dark modes.
- Verify AI assistant responses are consistently in English.
