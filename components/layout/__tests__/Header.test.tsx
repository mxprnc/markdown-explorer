import React from 'react';
import TestRenderer from 'react-test-renderer';
import { Header } from '../Header';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Pressable, Text, Platform } from 'react-native';

jest.mock('react-native', () => ({
  useColorScheme: jest.fn(() => 'light'),
  Platform: {
    select: jest.fn((obj) => obj.web || obj.default),
    OS: 'web',
  },
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  StyleSheet: {
    create: (s: any) => s,
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe('Header', () => {
  const mockSetActiveTab = jest.fn();

  beforeEach(() => {
    mockSetActiveTab.mockClear();
  });

  test('should call setActiveTab when tabs are clicked', () => {
    let testRenderer: any;
    TestRenderer.act(() => {
      testRenderer = TestRenderer.create(
        <ThemeProvider>
          <Header 
            selectedFolder="test-folder"
            activeTab="files"
            setActiveTab={mockSetActiveTab}
            isSplitMode={false}
            onSplitToggle={jest.fn()}
          />
        </ThemeProvider>
      );
    });
    
    const root = testRenderer.root;
    const pressables = root.findAllByType(Pressable);
    
    // Find 'Editor' tab
    const editorTab = pressables.find(p => {
        const texts = p.findAllByType(Text);
        return texts.some(t => t.props.children === 'Editor');
    });

    expect(editorTab).toBeDefined();
    if (editorTab) {
        TestRenderer.act(() => {
            editorTab.props.onPress();
        });
        expect(mockSetActiveTab).toHaveBeenCalledWith('editor');
    }
  });

  test('should display Split View button and call onSplitToggle', () => {
    const mockToggle = jest.fn();
    let testRenderer: any;
    TestRenderer.act(() => {
      testRenderer = TestRenderer.create(
        <ThemeProvider>
          <Header 
            selectedFolder="Test"
            activeTab="files"
            setActiveTab={() => {}}
            isSplitMode={false}
            onSplitToggle={mockToggle}
          />
        </ThemeProvider>
      );
    });

    const root = testRenderer.root;
    const splitBtn = root.findAllByType(Pressable).find((p: any) => {
      const texts = p.findAllByType(Text);
      return texts.some(t => t.props.children === 'Split View');
    });

    expect(splitBtn).toBeDefined();
    if (splitBtn) {
      TestRenderer.act(() => {
        splitBtn.props.onPress();
      });
      expect(mockToggle).toHaveBeenCalled();
    }
  });
});
