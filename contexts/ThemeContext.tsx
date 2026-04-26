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
    textHighlight: string;
    accentGlow: string;
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
    background: isDark ? '#0b0e14' : '#FFFFFF',
    text: isDark ? '#e2e8f0' : '#121212',
    border: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E7EB',
    surface: isDark ? '#151921' : '#F9FAFB',
    primary: isDark ? '#7c3aed' : '#3B82F6',
    textMuted: isDark ? '#94a3b8' : '#6B7280',
    textHighlight: isDark ? '#ffffff' : '#000000',
    accentGlow: isDark ? 'rgba(124, 58, 237, 0.15)' : 'rgba(59, 130, 246, 0.08)',
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
