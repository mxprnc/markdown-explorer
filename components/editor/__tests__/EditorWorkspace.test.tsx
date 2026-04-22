import React from 'react';
import TestRenderer from 'react-test-renderer';
import { View } from 'react-native';
import { EditorWorkspace } from '../EditorWorkspace';
import { ThemeProvider } from '../../../contexts/ThemeContext';

// Mock components
jest.mock('../../Editor', () => 'Editor');
jest.mock('../../preview/MarkdownPreview', () => 'Preview');
jest.mock('../../layout/TabBar', () => ({ TabBar: 'TabBar' }));
jest.mock('../../preview/ImageViewer', () => ({ ImageViewer: 'ImageViewer' }));

// Mock react-native components to avoid ref issues in test-renderer
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.ScrollView = ({ children, style }: any) => <div style={style}>{children}</div>;
  return rn;
});

describe('EditorWorkspace', () => {
  const defaultProps = {
    activeTab: 'editor' as const,
    isSplitMode: false,
    middlePaneWidth: 300,
    activePane: 1 as const,
    setActivePane: jest.fn(),
    openedFiles: ['test.md'],
    openedFiles2: [],
    selectedFile: 'test.md',
    selectedFile2: '',
    editorContent: '# Hello',
    editorContent2: '',
    setEditorContent: jest.fn(),
    setEditorContent2: jest.fn(),
    localFiles: { 'test.md': '# Hello' },
    onSelectFile: jest.fn(),
    onCloseTab: jest.fn(),
    onSaveFile: jest.fn(),
    resolveImage: jest.fn(),
    onPasteImage: jest.fn(),
    onRenameImage: jest.fn(),
    draggingTab: null,
    setDraggingTab: jest.fn(),
    middlePaneResponder: { panHandlers: {} },
    fontFamilyCode: 'monospace',
    deferredContent: '# Hello',
    deferredContent2: '',
    previewRef1: { current: null },
    previewRef2: { current: null },
    editorRef1: { current: null },
    editorRef2: { current: null },
    onPinTab: jest.fn(),
    onDropTab: jest.fn(),
    isDark: false,
  };

  it('renders correctly with flex: 1 for layout', () => {
    let renderer: any;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <EditorWorkspace {...defaultProps} />
        </ThemeProvider>
      );
    });

    const root = renderer.root;
    // Main container should have flex: 1
    const mainView = root.findByProps({ accessibilityRole: 'main' });
    expect(mainView.props.style).toMatchObject({ flex: 1, flexDirection: 'row' });

    // The pane view should also have flex: 1
    const pane1 = root.findByProps({ id: 'pane-1' });
    const styles = Array.isArray(pane1.props.style) ? pane1.props.style : [pane1.props.style];
    expect(styles.some((s: any) => s && s.flex === 1)).toBe(true);
  });

  it('renders Preview when activeTab is "files"', () => {
    let renderer: any;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <EditorWorkspace {...defaultProps} activeTab="files" />
        </ThemeProvider>
      );
    });

    const root = renderer.root;
    const preview = root.findByType('Preview');
    expect(preview).toBeTruthy();
  });

  it('renders empty message when no file is selected', () => {
    let renderer: any;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <EditorWorkspace {...defaultProps} selectedFile="" />
        </ThemeProvider>
      );
    });

    const root = renderer.root;
    const texts = root.findAllByType('Text');
    const emptyText = texts.find((t: any) => t.props.children === 'Please select a file.');
    expect(emptyText).toBeTruthy();
  });
});
