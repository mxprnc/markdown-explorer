import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { ThemeConfig } from '@/core/App';

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
  fontSizeUI: number;
  fontSizeCode: number;
  updateFontSize: (type: 'ui' | 'code', action: 'increase' | 'decrease' | 'reset' | number) => void;
  customThemes: ThemeConfig[];
  activeThemeId: string | null;
  registerTheme: (theme: ThemeConfig) => void;
  unregisterTheme: (id: string) => void;
  setActiveThemeId: (id: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [fontSizeUI, setFontSizeUI] = useState<number>(() => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('mark_explorer_font_size_ui');
        if (saved) return parseInt(saved, 10);
      } catch (e) {
        console.error('Failed to load UI font size from localStorage', e);
      }
    }
    return 13;
  });
  const [fontSizeCode, setFontSizeCode] = useState<number>(() => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('mark_explorer_font_size_code');
        if (saved) return parseInt(saved, 10);
      } catch (e) {
        console.error('Failed to load code font size from localStorage', e);
      }
    }
    return 14;
  });
  
  const [customThemes, setCustomThemes] = useState<ThemeConfig[]>(() => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      try {
        const savedThemes = localStorage.getItem('mark_explorer_custom_themes');
        if (savedThemes) {
          return JSON.parse(savedThemes);
        }
      } catch (e) {
        console.error('Failed to load custom themes from localStorage', e);
      }
    }
    return [];
  });

  const [activeThemeId, setActiveThemeId] = useState<string | null>(() => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      try {
        const savedActiveId = localStorage.getItem('mark_explorer_active_theme_id');
        if (savedActiveId) {
          return savedActiveId;
        }
      } catch (e) {
        console.error('Failed to load active theme ID from localStorage', e);
      }
    }
    return null;
  });

  // Save custom themes list when modified
  useEffect(() => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('mark_explorer_custom_themes', JSON.stringify(customThemes));
      } catch (e) {
        console.error('Failed to save custom themes to localStorage', e);
      }
    }
  }, [customThemes]);

  // Save active theme ID when changed
  useEffect(() => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      try {
        if (activeThemeId) {
          localStorage.setItem('mark_explorer_active_theme_id', activeThemeId);
        } else {
          localStorage.removeItem('mark_explorer_active_theme_id');
        }
      } catch (e) {
        console.error('Failed to save active theme ID to localStorage', e);
      }
    }
  }, [activeThemeId]);

  // Save UI font size when changed
  useEffect(() => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('mark_explorer_font_size_ui', fontSizeUI.toString());
      } catch (e) {
        console.error('Failed to save UI font size to localStorage', e);
      }
    }
  }, [fontSizeUI]);

  // Save Code font size when changed
  useEffect(() => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('mark_explorer_font_size_code', fontSizeCode.toString());
      } catch (e) {
        console.error('Failed to save code font size to localStorage', e);
      }
    }
  }, [fontSizeCode]);

  const updateFontSize = (type: 'ui' | 'code', action: 'increase' | 'decrease' | 'reset' | number) => {
    const setter = type === 'ui' ? setFontSizeUI : setFontSizeCode;
    const defaultVal = type === 'ui' ? 13 : 14;
    
    if (typeof action === 'number') {
      setter(action);
    } else if (action === 'increase') {
      setter(prev => Math.min(prev + 1, 24));
    } else if (action === 'decrease') {
      setter(prev => Math.max(prev - 1, 9));
    } else if (action === 'reset') {
      setter(defaultVal);
    }
  };

  const registerTheme = React.useCallback((theme: ThemeConfig) => {
    setCustomThemes(prev => {
      const filtered = prev.filter(t => t.id !== theme.id);
      return [...filtered, theme];
    });
  }, []);

  const unregisterTheme = React.useCallback((id: string) => {
    setCustomThemes(prev => prev.filter(t => t.id !== id));
    setActiveThemeId(prev => (prev === id ? null : prev));
  }, []);

  const activeTheme = useMemo(() => {
    if (!activeThemeId) return null;
    return customThemes.find(t => t.id === activeThemeId) || null;
  }, [customThemes, activeThemeId]);

  const currentScheme = themeMode === 'system' ? systemScheme : themeMode;
  const isDark = activeTheme ? activeTheme.isDark : currentScheme === 'dark';

  const toggleTheme = () => {
    if (activeThemeId) {
      setActiveThemeId(null);
    }
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const colors = useMemo(() => {
    if (activeTheme) {
      return activeTheme.colors;
    }
    return {
      background: isDark ? '#0b0e14' : '#FFFFFF',
      text: isDark ? '#e2e8f0' : '#121212',
      border: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E7EB',
      surface: isDark ? '#151921' : '#F9FAFB',
      primary: isDark ? '#7c3aed' : '#3B82F6',
      textMuted: isDark ? '#94a3b8' : '#6B7280',
      textHighlight: isDark ? '#ffffff' : '#000000',
      accentGlow: isDark ? 'rgba(124, 58, 237, 0.15)' : 'rgba(59, 130, 246, 0.08)',
    };
  }, [isDark, activeTheme]);

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
    fontSizeUI,
    fontSizeCode,
    updateFontSize,
    customThemes,
    activeThemeId,
    registerTheme,
    unregisterTheme,
    setActiveThemeId,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
