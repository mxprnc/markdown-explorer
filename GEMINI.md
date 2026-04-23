# Mark Explorer: AI Assistant Dashboard (GEMINI.md)

This document is the main hub for the AI assistant (Gemini) to understand the project context and follow guidelines.

---

## 🚀 Project Planning and Direction
**Status**: 📝 Planning
- **Related Documents**: [where-we-go-v1.md](docs/goals/where-we-go-v1.md), [deployment.md](docs/plan/ci-cd/deployment.md) (Deployment and dev setup per platform)
- **Component Specification**: [overview.md](docs/development/specification/components/overview.md)
- **Product Specification (Tabs)**: [editor-tab-system.md](docs/product/editor-tab-system.md)
- **Product Specification (Explorer)**: [file-explorer-interaction.md](docs/product/file-explorer-interaction.md)
- **Product Specification (Split View)**: [split-view.md](docs/product/split-view.md)
- **Product Specification (Plugin)**: [plugin-system.md](docs/product/plugin-system.md)
- **Product Specification (Template)**: [template-system.md](docs/product/template-system.md)
- **Product Specification (AI & MCP)**: [ai-integration.md](docs/product/ai-integration.md)
- **Product Specification (Nextra Export)**: [export-to-nextra.md](docs/product/new-feature/export-to-nextra.md)
- **Mobile Planning (Device Size)**: [GOAL1.md](docs/plan/mobile/device-size-support/GOAL1.md), [PLAN1.md](docs/plan/mobile/device-size-support/PLAN1.md)
- **Mobile Planning (System Explorer)**: [GOAL1.md](docs/plan/mobile/system-explorer-support/GOAL1.md), [PLAN1.md](docs/plan/mobile/system-explorer-support/PLAN1.md)
- **Mobile Planning (Test Support)**: [GOAL1.md](docs/plan/mobile/test-support/GOAL1.md), [PLAN1.md](docs/plan/mobile/test-support/PLAN1.md)
- **Core Goal**: Provide a user-friendly local markdown exploration and editing environment.

- **iOS/Android UI/UX Optimization**:
  - **Safe Area Support**: Implement `SafeAreaProvider` to avoid overlaps with the Dynamic Island and Home Indicator.
  - **Mobile Drawer**: Convert the fixed sidebar to a mobile drawer for small screens.
  - **Layout Responsiveness**: Disable Split View on iPhone/Android and optimize component density for touch interaction.

- **Mobile System Explorer**:
  - **Native Integration**: Bridge Web Directory Picker with Native Document Picker.
  - **Permission Persistency**: Handle Scoped Storage and recursive file scanning.

- **Stabilize Nextra Export**:
  - **Resolve Type Compatibility**: Fix property mismatches between `FileSystemItem`(`kind`) and `ExportNode` and normalize traverse logic.
  - **Prevent Missing Files**: Add automatic recursive scanning (`loadDirectoryRecursive`) to preserve the entire structure during export.
  - **Enhance Compatibility**: Apply Hex encoding (ASCII safe) for Korean filenames and optimize default format (`.md`) to prevent MDX compilation errors.
  - **Metadata Filtering**: Exclude non-page files from `_meta.js` to resolve Nextra validation errors.
- **Known Issues**: [TOC Highlight Shaking Issue](docs/product/errors/scroll-bar-and-toc-highlighting/issue-20260422.md) recorded.

## 🎨 Design System and UX Style
**Status**: 🎨 Defining
- **Related Documents**: [design-ux-style-v1.md](docs/goals/design-ux-style-v1.md)
- **Style Guide**: Modern and clean UI, Dark/Light mode support, Responsive layout.

## 🛠 Coding Style Guide
**Status**: ✅ **Base guidelines established** (Updating)
- **Related Documents**: [coding-style.md](docs/rules/coding-style.md)
- **Core Principles**:
  1. **Modularization & DRY**: Remove duplication and modularize.
  2. **Testability**: Pure function-based testable code.
  3. **Wrapper Components**: Componentize common UI.
  4. **Directory Structure**: Domain/feature-based directory structure.
  5. **Naming Convention**: Unified `PascalCase` for React components and filenames.
  6. **Separation of Concerns**: Separate UI, Logic (Utils), and State (Hooks).
  7. **Granularity**: Design functions with small, clear responsibilities.
  8. **Testing Strategy**: Pyramid structure and user-centric testing.
  9. **Constants & Configuration**: Remove magic numbers and use constants.
  10. **Styling & Design System**: Use StyleSheet and design tokens.
  11. **JSX & Semantic DOM**: Use semantic tags and efficient list rendering.
  12. **Async & Error Handling**: Handle async exceptions and optimize parallel execution.

---

> [!NOTE]
> This document is updated periodically based on project progress. The AI assistant should always refer to this document for the latest guidelines before starting work.
