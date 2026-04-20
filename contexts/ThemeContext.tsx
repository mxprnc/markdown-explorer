import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme, Platform } from 'react-native';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  colors: {
    background: string;
    text: string;
    border: string;
    surface: string;
    primary: string;
    textMuted: string;
  };
  fontFamilyUI: string;
  fontFamilyCode: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const currentScheme = themeMode === 'system' ? systemScheme : themeMode;
  const isDark = currentScheme === 'dark';

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const colors = useMemo(() => ({
    background: isDark ? '#121212' : '#FFFFFF',
    text: isDark ? '#F3F4F6' : '#121212',
    border: isDark ? '#374151' : '#E5E7EB',
    surface: isDark ? '#1E1E1E' : '#F9FAFB',
    primary: '#3B82F6',
    textMuted: isDark ? '#9CA3AF' : '#6B7280',
  }), [isDark]);

  const fontFamilyUI = useMemo(() => Platform.select({ web: 'Inter, sans-serif', default: 'System' })!, []);
  const fontFamilyCode = useMemo(() => Platform.select({ web: 'JetBrains Mono, Fira Code, monospace', default: 'System' })!, []);

  const value = {
    themeMode,
    isDark,
    setThemeMode,
    toggleTheme,
    colors,
    fontFamilyUI,
    fontFamilyCode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
