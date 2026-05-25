import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/contexts/ThemeContext';
import { App, ThemeConfig } from '@/core/App';

interface ThemeEditorViewProps {
  app: App;
}

const DEFAULT_LIGHT_COLORS = {
  background: '#FFFFFF',
  text: '#121212',
  border: '#E5E7EB',
  surface: '#F9FAFB',
  primary: '#3B82F6',
  textMuted: '#6B7280',
  textHighlight: '#000000',
  accentGlow: 'rgba(59, 130, 246, 0.08)',
};

const DEFAULT_DARK_COLORS = {
  background: '#0b0e14',
  text: '#e2e8f0',
  border: 'rgba(255, 255, 255, 0.06)',
  surface: '#151921',
  primary: '#7c3aed',
  textMuted: '#94a3b8',
  textHighlight: '#ffffff',
  accentGlow: 'rgba(124, 58, 237, 0.15)',
};

export function ThemeEditorView({ app }: ThemeEditorViewProps) {
  const { colors, fontFamilyUI, customThemes, activeThemeId } = useTheme();

  // Selected starting template theme
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default-dark');

  // Theme states
  const [themeId, setThemeId] = useState<string>('my-custom-theme');
  const [themeName, setThemeName] = useState<string>('My Custom Theme');
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);

  const [bgVal, setBgVal] = useState<string>(DEFAULT_DARK_COLORS.background);
  const [textVal, setTextVal] = useState<string>(DEFAULT_DARK_COLORS.text);
  const [borderVal, setBorderVal] = useState<string>(DEFAULT_DARK_COLORS.border);
  const [surfaceVal, setSurfaceVal] = useState<string>(DEFAULT_DARK_COLORS.surface);
  const [primaryVal, setPrimaryVal] = useState<string>(DEFAULT_DARK_COLORS.primary);
  const [textMutedVal, setTextMutedVal] = useState<string>(DEFAULT_DARK_COLORS.textMuted);
  const [textHighlightVal, setTextHighlightVal] = useState<string>(DEFAULT_DARK_COLORS.textHighlight);
  const [accentGlowVal, setAccentGlowVal] = useState<string>(DEFAULT_DARK_COLORS.accentGlow);

  // Load standard themes
  const templates = useMemo(() => {
    return [
      { id: 'default-light', name: 'Default Light Theme', isDark: false, colors: DEFAULT_LIGHT_COLORS },
      { id: 'default-dark', name: 'Default Dark Theme', isDark: true, colors: DEFAULT_DARK_COLORS },
      { 
        id: 'tokyo-night', 
        name: 'Tokyo Night', 
        isDark: true, 
        colors: {
          background: '#1a1b26',
          text: '#c0caf5',
          border: 'rgba(59, 130, 246, 0.15)',
          surface: '#16161e',
          primary: '#7aa2f7',
          textMuted: '#565f89',
          textHighlight: '#e0af68',
          accentGlow: 'rgba(122, 162, 247, 0.2)',
        }
      },
      ...customThemes
    ];
  }, [customThemes]);

  // Load colors when a starting template is selected
  const handleApplyTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setSelectedTemplateId(id);
      setIsDarkTheme(template.isDark);
      
      // Update color picker states
      setBgVal(template.colors.background);
      setTextVal(template.colors.text);
      setBorderVal(template.colors.border);
      setSurfaceVal(template.colors.surface);
      setPrimaryVal(template.colors.primary);
      setTextMutedVal(template.colors.textMuted);
      setTextHighlightVal(template.colors.textHighlight);
      setAccentGlowVal(template.colors.accentGlow);
      
      // If it's a custom theme, populate fields
      if (id !== 'default-light' && id !== 'default-dark' && id !== 'tokyo-night') {
        setThemeId(template.id);
        setThemeName(template.name);
      }
    }
  };

  // Compile active editing state into a ThemeConfig
  const currentEditingTheme = useMemo<ThemeConfig>(() => {
    return {
      id: themeId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      name: themeName.trim() || 'Custom Theme',
      isDark: isDarkTheme,
      colors: {
        background: bgVal,
        text: textVal,
        border: borderVal,
        surface: surfaceVal,
        primary: primaryVal,
        textMuted: textMutedVal,
        textHighlight: textHighlightVal,
        accentGlow: accentGlowVal,
      }
    };
  }, [themeId, themeName, isDarkTheme, bgVal, textVal, borderVal, surfaceVal, primaryVal, textMutedVal, textHighlightVal, accentGlowVal]);

  // Automatically register and set as active on any color change to enable WYSIWYG
  useEffect(() => {
    if (!currentEditingTheme.id) return;
    app.theme.registerTheme(currentEditingTheme);
    app.theme.setActiveTheme(currentEditingTheme.id);
  }, [currentEditingTheme, app]);

  const handleSaveTheme = () => {
    if (!currentEditingTheme.id) {
      alert('Please specify a valid Theme ID.');
      return;
    }
    app.theme.registerTheme(currentEditingTheme);
    app.theme.setActiveTheme(currentEditingTheme.id);
    alert(`Theme "${currentEditingTheme.name}" saved successfully!`);
  };

  const handleDeleteTheme = () => {
    if (confirm(`Are you sure you want to delete the theme "${currentEditingTheme.name}"?`)) {
      app.theme.unregisterTheme(currentEditingTheme.id);
      app.theme.setActiveTheme(null);
      alert('Theme deleted.');
    }
  };

  const handleExportVSCode = async () => {
    const vscodeTheme = {
      name: currentEditingTheme.name,
      type: currentEditingTheme.isDark ? 'dark' : 'light',
      colors: {
        'editor.background': currentEditingTheme.colors.background,
        'editor.foreground': currentEditingTheme.colors.text,
        'sideBar.background': currentEditingTheme.colors.surface,
        'sideBar.border': currentEditingTheme.colors.border,
        'activityBar.background': currentEditingTheme.colors.surface,
        'button.background': currentEditingTheme.colors.primary,
        'editor.lineHighlightBackground': currentEditingTheme.colors.accentGlow,
      }
    };
    
    const jsonStr = JSON.stringify(vscodeTheme, null, 2);
    await Clipboard.setStringAsync(jsonStr);
    alert('VSCode Theme JSON successfully copied to clipboard!');
  };

  const handleExportImporter = async () => {
    const jsonStr = JSON.stringify(currentEditingTheme, null, 2);
    await Clipboard.setStringAsync(jsonStr);
    alert('Importer Theme JSON successfully copied to clipboard!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="color-palette" size={20} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fontFamilyUI }]}>Theme Editor</Text>
      </View>

      {/* Starting Template Selection */}
      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fontFamilyUI }]}>Load Starting Template</Text>
        <View style={styles.selectWrapper}>
          {Platform.OS === 'web' ? (
            <select
              value={selectedTemplateId}
              onChange={(e) => handleApplyTemplate(e.target.value)}
              style={{
                width: '100%',
                height: 38,
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                color: colors.text,
                paddingLeft: 8,
                fontSize: 13,
                fontFamily: fontFamilyUI,
                outline: 'none',
                cursor: 'pointer',
              } as any}
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          ) : (
            <View style={{ gap: 6 }}>
              {templates.map(t => (
                <Pressable
                  key={t.id}
                  onPress={() => handleApplyTemplate(t.id)}
                  style={[
                    styles.mobileTab, 
                    { borderColor: colors.border, backgroundColor: colors.surface },
                    selectedTemplateId === t.id && { borderColor: colors.primary }
                  ]}
                >
                  <Text style={{ color: colors.text, fontSize: 12 }}>{t.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Meta Fields */}
      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fontFamilyUI }]}>Theme Metadata</Text>
        
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>Theme ID</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface, fontFamily: fontFamilyUI }]}
              placeholder="e.g. neon-cyber"
              value={themeId}
              onChangeText={setThemeId}
            />
          </View>
          <View style={{ flex: 1.5 }}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>Display Name</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface, fontFamily: fontFamilyUI }]}
              placeholder="e.g. Neon Cyber"
              value={themeName}
              onChangeText={setThemeName}
            />
          </View>
        </View>

        <View style={[styles.row, { alignItems: 'center', marginTop: 12, justifyContent: 'space-between' }]}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted, fontFamily: fontFamilyUI, marginBottom: 0 }]}>Is Dark Theme?</Text>
          <Switch
            value={isDarkTheme}
            onValueChange={setIsDarkTheme}
            trackColor={{ false: '#767577', true: colors.primary }}
          />
        </View>
      </View>

      {/* Color Grid */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: fontFamilyUI }]}>Color Tokens (WYSIWYG)</Text>

        {[
          { label: 'Background (Editor & App)', val: bgVal, setter: setBgVal },
          { label: 'Primary Text', val: textVal, setter: setTextVal },
          { label: 'Borders & Rules', val: borderVal, setter: setBorderVal },
          { label: 'Surface (Sidebar & Cards)', val: surfaceVal, setter: setSurfaceVal },
          { label: 'Primary Accent (Highlights)', val: primaryVal, setter: setPrimaryVal },
          { label: 'Muted / Secondary Text', val: textMutedVal, setter: setTextMutedVal },
          { label: 'Selected Text Highlight', val: textHighlightVal, setter: setTextHighlightVal },
          { label: 'Accent Hover Glow / Line Highlight', val: accentGlowVal, setter: setAccentGlowVal },
        ].map((token, index) => (
          <View key={index} style={styles.colorRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.colorName, { color: colors.text, fontFamily: fontFamilyUI }]} numberOfLines={1}>
                {token.label}
              </Text>
              <TextInput
                style={[styles.hexInput, { color: colors.textMuted, borderColor: colors.border, backgroundColor: colors.surface }]}
                placeholder="#000000"
                value={token.val}
                onChangeText={token.setter}
              />
            </View>
            {Platform.OS === 'web' && (
              <input
                type="color"
                value={token.val.startsWith('#') && token.val.length === 7 ? token.val : '#000000'}
                onChange={(e) => token.setter(e.target.value)}
                style={{
                  width: 38,
                  height: 38,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                } as any}
              />
            )}
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable 
          onPress={handleSaveTheme} 
          style={[styles.btn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="save-outline" size={14} color="#FFF" />
          <Text style={styles.btnText}>Save & Apply</Text>
        </Pressable>

        <Pressable 
          onPress={handleDeleteTheme} 
          style={[styles.btn, { backgroundColor: '#EF4444' }]}
        >
          <Ionicons name="trash-outline" size={14} color="#FFF" />
          <Text style={styles.btnText}>Delete Theme</Text>
        </Pressable>

        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />

        <Pressable 
          onPress={handleExportVSCode} 
          style={[styles.btnOutline, { borderColor: colors.primary }]}
        >
          <Ionicons name="copy-outline" size={14} color={colors.primary} />
          <Text style={[styles.btnOutlineText, { color: colors.primary }]}>Export as VSCode Theme JSON</Text>
        </Pressable>

        <Pressable 
          onPress={handleExportImporter} 
          style={[styles.btnOutline, { borderColor: colors.primary }]}
        >
          <Ionicons name="code-download-outline" size={14} color={colors.primary} />
          <Text style={[styles.btnOutlineText, { color: colors.primary }]}>Export as Importer JSON</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  section: {
    padding: 14,
    paddingTop: 4,
    borderBottomWidth: 1,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectWrapper: {
    position: 'relative',
  },
  mobileTab: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    height: 36,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 12,
    outline: 'none',
  } as any,
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  colorName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  hexInput: {
    height: 32,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 11,
    outline: 'none',
    fontFamily: 'monospace',
  } as any,
  actions: {
    padding: 14,
    gap: 8,
    paddingBottom: 40,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 8,
    gap: 8,
  },
  btnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  btnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
