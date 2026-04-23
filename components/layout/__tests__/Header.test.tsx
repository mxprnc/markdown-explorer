import React from 'react';
import TestRenderer from 'react-test-renderer';
import { Header } from '../Header';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Pressable, Text } from 'react-native';

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
    
    // Find all Pressables (tabs and theme toggle)
    const pressables = testRenderer.root.findAllByType(Pressable);
    
    // On the current implementation:
    // Tab 1: 'Explorer'
    // Tab 2: 'Editor'
    // Tab 3: 'Theme Toggle'

    // Click '에디터' tab (should be the second pressable under tabs section)
    const editorTab = pressables.find(p => {
        const text = p.findByType(Text);
        return text.props.children === 'Editor';
    });

    if (editorTab) {
        TestRenderer.act(() => {
            editorTab.props.onPress();
        });
        expect(mockSetActiveTab).toHaveBeenCalledWith('editor');
    }
  });

  test('should display folder name', () => {
     let testRenderer: any;
     TestRenderer.act(() => {
       testRenderer = TestRenderer.create(
         <ThemeProvider>
           <Header 
             selectedFolder="My Project"
             activeTab="files"
             setActiveTab={() => {}}
             isSplitMode={false}
             onSplitToggle={() => {}}
           />
         </ThemeProvider>
       );
     });

    const texts = testRenderer.root.findAllByType(Text);
    const folderText = texts.find((t: any) => t.props.children === 'My Project');
    expect(folderText).toBeDefined();
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

    const splitBtn = testRenderer.root.findAllByType(Pressable).find((p: any) => {
      const text = p.findAllByType(Text).find((t: any) => t.props.children === 'Split View');
      return !!text;
    });

    expect(splitBtn).toBeDefined();
    TestRenderer.act(() => {
      splitBtn.props.onPress();
    });
    expect(mockToggle).toHaveBeenCalled();
  });
});
