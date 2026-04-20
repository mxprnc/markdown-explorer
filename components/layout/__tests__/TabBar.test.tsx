import React from 'react';
import TestRenderer from 'react-test-renderer';
import { TabBar } from '../TabBar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Pressable, Text } from 'react-native';

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock react-native Components
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(() => 'light'),
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  StyleSheet: {
    create: (s: any) => s,
  },
  Platform: {
    OS: 'web',
    select: jest.fn((obj) => obj.web || obj.default),
  },
}));

describe('TabBar', () => {
  const mockOnSelect = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnSetDraggingTab = jest.fn();

  const defaultProps = {
    paneId: 1 as 1 | 2,
    files: ['doc1.md', 'doc2.md'],
    selectedFile: 'doc1.md',
    onSelect: mockOnSelect,
    onClose: mockOnClose,
    onPin: jest.fn(),
    onSetDraggingTab: mockOnSetDraggingTab,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with given files', () => {
    let renderer: any;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <TabBar {...defaultProps} />
        </ThemeProvider>
      );
    });

    const root = renderer.root;
    const tabTexts = root.findAllByType(Text);
    expect(tabTexts.some(t => t.props.children === 'doc1.md')).toBe(true);
    expect(tabTexts.some(t => t.props.children === 'doc2.md')).toBe(true);
  });

  it('calls onSelect when a tab is pressed', () => {
    let renderer: any;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <TabBar {...defaultProps} />
        </ThemeProvider>
      );
    });

    const root = renderer.root;
    // The first pressable on each tab item (the main area)
    const tabs = root.findAllByType(Pressable).filter(p => !p.props.onDragStart); 
    // Wait, in our implementation, the main tab area handles press.
    
    // Find tab for 'doc2.md'
    const doc2Tab = root.findAllByType(Pressable).find(p => {
        const text = p.findAllByType(Text).find(t => t.props.children === 'doc2.md');
        return !!text;
    });

    expect(doc2Tab).toBeDefined();
    TestRenderer.act(() => {
        doc2Tab.props.onPress();
    });
    expect(mockOnSelect).toHaveBeenCalledWith('doc2.md');
  });

  it('calls onClose when close button is pressed', () => {
    let renderer: any;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <TabBar {...defaultProps} />
        </ThemeProvider>
      );
    });

    const root = renderer.root;
    // Find close buttons by searching for the '✕' character
    const closeTexts = root.findAll(el => el.type === 'Text' && el.props.children === '✕');
    const closeBtns = closeTexts.map(text => {
        let current = text.parent;
        // Search up for the Pressable
        while (current && current.type !== 'Pressable') {
            current = current.parent;
        }
        return current;
    }).filter(Boolean);

    expect(closeBtns.length).toBe(2);
    TestRenderer.act(() => {
        closeBtns[0].props.onPress({
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
        });
    });
    expect(mockOnClose).toHaveBeenCalledWith('doc1.md');
  });

  it('renders empty message when no files', () => {
    let renderer: any;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <TabBar {...defaultProps} files={[]} selectedFile="" />
        </ThemeProvider>
      );
    });

    const root = renderer.root;
    const text = root.findByType(Text);
    expect(text.props.children).toBe('No file opened');
  });
});
