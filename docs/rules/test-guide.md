# Mark Explorer: Test Guide

This document defines the test strategy, tool usage, and test best practices for the Mark Explorer project.

---

## 🎯 Test Principles

1.  **Pure Functions First**: The more complex the logic, the more it should be separated from the UI and written as pure functions in `utils`, with corresponding unit tests.
2.  **User-Centric Testing**: Focus on verifying the results of user actions (e.g., whether a file is deleted when a button is clicked) rather than implementation details.
3.  **Isolation**: Each test must be independent and not affected by the results of other tests.

---

## 🛠️ Test Environment and Tools

-   **Test Runner**: Jest (Unit/Hook/Component), Playwright (E2E)
-   **Preset**: `jest-expo` (Optimized for Expo and React Native environments)
-   **Transpiler**: `babel-jest` (Converts TypeScript based on Babel settings)

> [!NOTE]
> For detailed settings, refer to the [Jest Configuration Guide](../test-settings/jest.md) and [Playwright Configuration Guide](../test-settings/playwright.md).

---

## 📁 File Structure and Naming Conventions

-   **Location**: Place in a `__tests__` folder within the same directory as the target file.
-   **Naming Convention**: `{FileName}.test.ts` or `{FileName}.test.tsx`
    -   Example: `utils/FileSystemUtils.ts` -> `utils/__tests__/FileSystemUtils.test.ts`

---

## 💡 Best Practices by Test Layer

### 1. Unit Tests
-   **Target**: `utils/`, constant calculation logic, etc.
    -   Aim for 100% coverage for path handling, string parsing, and data transformation logic.
-   **Writing Guide**:
    ```typescript
    describe('FileSystemUtils', () => {
      it('should correctly join path parts', () => {
        expect(joinPaths('folder', 'file.md')).toBe('folder/file.md');
      });
    });
    ```

### 2. Custom Hook Tests
-   **Target**: `hooks/` (useFileSystem, useGemini, etc.).
-   **Tools**: `@testing-library/react-hooks` (install if necessary)
-   **Recommendations**: Actively **Mock** browser APIs (FileSystem Access API) or external services (AI SDK) to verify success/failure cases for asynchronous logic.

### 3. Component Tests
-   **Target**: `components/`
-   **Tools**: `react-test-renderer` or `@testing-library/react-native`
-   **Recommendations**: 
    -   Verify core user interactions (tab switching, modal opening).
    -   Avoid `Snapshot Testing` in the early stages when the UI changes frequently; use it for regression testing after stabilization.

### 4. E2E Tests
-   **Target**: Entire application flow (Open file -> Edit -> Save -> Tab navigation, etc.).
-   **Tools**: Playwright
-   **Location**: `tests/e2e/`
-   **Recommendations**: 
    -   Verify user scenarios from start to finish in a real browser environment.
    -   The development server (`npm run web`) is set up to start automatically when running tests.
    -   Essential for preventing regressions in complex interactions (drag and drop, etc.).

---

## 🚀 Execution and Monitoring

### Commands
-   `npm test`: Run all Jest tests and generate a coverage report.
-   `npm test -- --watch`: Real-time Jest test feedback during development.
-   `npm run test:e2e`: Run Playwright E2E tests.
-   `npm run test:e2e:ui`: Run Playwright UI mode for visual debugging.

### CI/CD Guide (To be applied)
-   In principle, all Pull Requests must pass 100% of the tests to be mergeable.
-   Recommended to configure a dashboard to display a warning if coverage decreases.

---

## 🚀 Execution and Monitoring (Revised)

> [!TIP]
> If you're not sure "what to test," start with the **most frequent bugs or the most critical logic for users**.
