import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { PluginsSidebar } from '../PluginsSidebar';

// Mock contexts
const mockRegisterTheme = jest.fn();
const mockUnregisterTheme = jest.fn();
const mockSetActiveThemeId = jest.fn();

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      surface: '#fff',
      background: '#f5f5f5',
      border: '#ccc',
      text: '#000',
      textMuted: '#666',
      primary: '#007AFF',
    },
    isDark: false,
    fontFamilyUI: 'System',
    fontSizeUI: 13,
    customThemes: [
      { id: 'custom-one', name: 'Custom Imported Theme', colors: { background: '#1e1e1e' } }
    ],
    activeThemeId: 'one-dark-pro',
    registerTheme: mockRegisterTheme,
    unregisterTheme: mockUnregisterTheme,
    setActiveThemeId: mockSetActiveThemeId,
  })
}));

const mockEnablePlugin = jest.fn();
const mockDisablePlugin = jest.fn();

jest.mock('@/contexts/PluginContext', () => ({
  usePlugins: () => ({
    allPlugins: [
      {
        manifest: {
          id: 'templates',
          name: 'Templates Plugin',
          version: '1.0.0',
          author: 'Mark Explorer',
          type: 'functional',
          description: 'A markdown template manager.'
        }
      },
      {
        manifest: {
          id: 'one-dark-pro',
          name: 'One Dark Pro',
          version: '1.0.0',
          author: 'Mark Explorer',
          type: 'theme',
          description: 'A beautiful dark theme.'
        }
      }
    ],
    enabledPluginIds: ['templates'],
    enablePlugin: mockEnablePlugin,
    disablePlugin: mockDisablePlugin,
  })
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('PluginsSidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with sections, tabs and search bar', () => {
    const { getByText, getByPlaceholderText } = render(<PluginsSidebar />);

    expect(getByText('Plugins & Themes')).toBeTruthy();
    expect(getByPlaceholderText('Search plugins & themes...')).toBeTruthy();
    expect(getByText('ALL')).toBeTruthy();
    expect(getByText('PLUGINS')).toBeTruthy();
    expect(getByText('THEMES')).toBeTruthy();
  });

  it('renders extension lists including functional, theme, and custom themes', () => {
    const { getByText } = render(<PluginsSidebar />);

    expect(getByText('Templates Plugin')).toBeTruthy();
    expect(getByText('One Dark Pro')).toBeTruthy();
    expect(getByText('Custom Imported Theme')).toBeTruthy();
  });

  it('filters plugins by search text query', () => {
    const { getByPlaceholderText, queryByText } = render(<PluginsSidebar />);
    const searchInput = getByPlaceholderText('Search plugins & themes...');

    fireEvent.changeText(searchInput, 'Templates');

    expect(queryByText('Templates Plugin')).toBeTruthy();
    expect(queryByText('One Dark Pro')).toBeNull();
    expect(queryByText('Custom Imported Theme')).toBeNull();
  });

  it('filters plugins by segmented category button tap', () => {
    const { getByText, queryByText } = render(<PluginsSidebar />);

    // Tap on PLUGINS tab
    fireEvent.press(getByText('PLUGINS'));
    expect(queryByText('Templates Plugin')).toBeTruthy();
    expect(queryByText('One Dark Pro')).toBeNull();
    expect(queryByText('Custom Imported Theme')).toBeNull();

    // Tap on THEMES tab
    fireEvent.press(getByText('THEMES'));
    expect(queryByText('Templates Plugin')).toBeNull();
    expect(queryByText('One Dark Pro')).toBeTruthy();
    expect(queryByText('Custom Imported Theme')).toBeTruthy();
  });

  it('calls enable/disable context function when toggling plugins', async () => {
    const { getByText } = render(<PluginsSidebar />);

    // Find toggle button for templates
    const toggleButton = getByText('Enabled'); // Active for templates
    
    await act(async () => {
      fireEvent.press(toggleButton);
    });

    expect(mockDisablePlugin).toHaveBeenCalledWith('templates');
  });

  it('toggles collapsible VSCode Theme Importer and triggers validation on empty fields', () => {
    const { getByText, queryByPlaceholderText } = render(<PluginsSidebar />);

    expect(queryByPlaceholderText('e.g. monokai-pro')).toBeNull(); // Collapsed by default

    // Press expand button
    fireEvent.press(getByText('Import VSCode Theme'));
    expect(queryByPlaceholderText('e.g. monokai-pro')).toBeTruthy(); // Expanded

    // Press import without filling fields
    fireEvent.press(getByText('Convert & Apply'));
    expect(getByText('⚠️ Please fill in all fields (ID, Name, and JSON).')).toBeTruthy();
  });
});
