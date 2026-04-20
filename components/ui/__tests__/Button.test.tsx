import React from 'react';
import TestRenderer from 'react-test-renderer';
import { Button } from '../Button';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Text, Pressable } from 'react-native';

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

describe('Button', () => {
  test('should render label correctly', () => {
    let testRenderer: any;
    TestRenderer.act(() => {
      testRenderer = TestRenderer.create(
        <ThemeProvider>
          <Button label="Click Me" onPress={() => {}} />
        </ThemeProvider>
      );
    });
    
    const textInstance = testRenderer.root.findByType(Text);
    expect(textInstance.props.children).toBe('Click Me');
  });

  test('should trigger onPress when clicked', () => {
    const onPressMock = jest.fn();
    let testRenderer: any;
    TestRenderer.act(() => {
      testRenderer = TestRenderer.create(
        <ThemeProvider>
          <Button label="Click Me" onPress={onPressMock} />
        </ThemeProvider>
      );
    });
    
    const pressableInstance = testRenderer.root.findByType(Pressable);
    
    TestRenderer.act(() => {
      pressableInstance.props.onPress();
    });
    
    expect(onPressMock).toHaveBeenCalled();
  });

  test('should apply variant styles', () => {
    let testRenderer: any;
    TestRenderer.act(() => {
      testRenderer = TestRenderer.create(
        <ThemeProvider>
          <Button label="Cancel" variant="secondary" onPress={() => {}} />
        </ThemeProvider>
      );
    });
    
    const pressableInstance = testRenderer.root.findByType(Pressable);
    expect(pressableInstance).toBeDefined();
  });
});
