import React from 'react';
import TestRenderer from 'react-test-renderer';
import { useColorScheme } from 'react-native';
import { ThemeProvider, useTheme } from '../ThemeContext';

jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
  Platform: {
    select: jest.fn((obj) => obj.web || obj.default),
    OS: 'web',
  },
  View: 'View',
  Text: 'Text',
  StyleSheet: {
    create: (s: any) => s,
  },
}));

describe('ThemeContext', () => {
  const Consumer = ({ callback }: { callback: (theme: any) => void }) => {
    const theme = useTheme();
    callback(theme);
    return null;
  };

  test('should provide default light theme colors', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    
    let capturedTheme: any;
    TestRenderer.act(() => {
      TestRenderer.create(
        <ThemeProvider>
          <Consumer callback={(t) => (capturedTheme = t)} />
        </ThemeProvider>
      );
    });

    expect(capturedTheme).toBeDefined();
    expect(capturedTheme.isDark).toBe(false);
    expect(capturedTheme.colors.background).toBe('#FFFFFF');
  });

  test('should provide dark theme colors when system is dark', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    
    let capturedTheme: any;
    TestRenderer.act(() => {
      TestRenderer.create(
        <ThemeProvider>
          <Consumer callback={(t) => (capturedTheme = t)} />
        </ThemeProvider>
      );
    });

    expect(capturedTheme).toBeDefined();
    expect(capturedTheme.isDark).toBe(true);
    expect(capturedTheme.colors.background).toBe('#0b0e14');
  });

  test('toggleTheme should switch between light and dark', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    
    let capturedTheme: any;
    let renderer: any;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <Consumer callback={(t) => (capturedTheme = t)} />
        </ThemeProvider>
      );
    });

    expect(capturedTheme.isDark).toBe(false);

    TestRenderer.act(() => {
      capturedTheme.toggleTheme();
    });

    expect(capturedTheme.isDark).toBe(true);

    TestRenderer.act(() => {
      capturedTheme.toggleTheme();
    });

    expect(capturedTheme.isDark).toBe(false);
  });
});
