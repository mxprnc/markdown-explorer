import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { usePlugins } from '@/contexts/PluginContext';
import { parseVSCodeTheme } from '@/utils/VSCodeThemeParser';

export function PluginsSidebar() {
  const {
    colors, isDark, fontFamilyUI, fontSizeUI,
    customThemes, activeThemeId, registerTheme, unregisterTheme, setActiveThemeId
  } = useTheme();

  const { allPlugins, enabledPluginIds, enablePlugin, disablePlugin } = usePlugins();

  const [pluginSearch, setPluginSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'plugins' | 'themes'>('all');

  // VSCode Theme Import States
  const [isImporterExpanded, setIsImporterExpanded] = useState(false);
  const [vscodeJson, setVscodeJson] = useState('');
  const [customThemeName, setCustomThemeName] = useState('');
  const [customThemeId, setCustomThemeId] = useState('');
  const [importError, setImportError] = useState('');

  const handleImportVSCodeTheme = () => {
    setImportError('');
    if (!customThemeId.trim() || !customThemeName.trim() || !vscodeJson.trim()) {
      setImportError('Please fill in all fields (ID, Name, and JSON).');
      return;
    }

    const sanitizedId = customThemeId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    try {
      const parsedTheme = parseVSCodeTheme(vscodeJson, sanitizedId, customThemeName.trim());
      registerTheme(parsedTheme);
      setActiveThemeId(sanitizedId);

      // Clear inputs
      setVscodeJson('');
      setCustomThemeName('');
      setCustomThemeId('');
      setIsImporterExpanded(false);
      alert(`VSCode theme "${parsedTheme.name}" successfully imported and applied!`);
    } catch (e: any) {
      setImportError(e.message || 'Failed to parse VSCode theme JSON.');
    }
  };

  const handleTogglePlugin = async (id: string, isCurrentlyEnabled: boolean) => {
    if (isCurrentlyEnabled) {
      await disablePlugin(id);
    } else {
      await enablePlugin(id);
    }
  };

  const filteredPlugins = allPlugins.filter(plugin => {
    // 1. Search filter
    const search = pluginSearch.toLowerCase().trim();
    const matchesSearch = !search ||
      plugin.manifest.name.toLowerCase().includes(search) ||
      (plugin.manifest.description || '').toLowerCase().includes(search);

    if (!matchesSearch) return false;

    // 2. Category filter
    if (activeCategory === 'plugins') {
      return plugin.manifest.type !== 'theme';
    }
    if (activeCategory === 'themes') {
      return plugin.manifest.type === 'theme';
    }
    return true;
  });

  // Filter custom imported themes
  const filteredCustomThemes = customThemes
    .filter(t => !allPlugins.some(p => p.manifest.id === t.id))
    .filter(theme => {
      const search = pluginSearch.toLowerCase().trim();
      const matchesSearch = !search ||
        theme.name.toLowerCase().includes(search) ||
        theme.id.toLowerCase().includes(search);

      if (!matchesSearch) return false;

      // Category filter (only show in 'all' or 'themes')
      return activeCategory === 'all' || activeCategory === 'themes';
    });

  const renderBadge = (type: string, isImported = false) => {
    const isTheme = type === 'theme';
    const bgColor = isImported
      ? 'rgba(236, 72, 153, 0.12)'
      : isTheme ? 'rgba(236, 72, 153, 0.08)' : 'rgba(59, 130, 246, 0.08)';
    const textColor = isImported || isTheme ? '#EC4899' : colors.primary;
    const label = isImported ? 'Imported' : isTheme ? 'Theme' : 'Functional';

    return (
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        <Text style={[styles.badgeText, { color: textColor, fontSize: fontSizeUI - 3, fontFamily: fontFamilyUI }]}>
          {label}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontSize: fontSizeUI + 3, fontFamily: fontFamilyUI }]}>
          Plugins & Themes
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: fontSizeUI - 2, fontFamily: fontFamilyUI }]}>
          Manage workspace additions and design themes.
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
        <Ionicons name="search" size={fontSizeUI + 2} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.text, fontFamily: fontFamilyUI, fontSize: fontSizeUI } as any]}
          placeholder="Search plugins & themes..."
          placeholderTextColor={colors.textMuted}
          value={pluginSearch}
          onChangeText={setPluginSearch}
        />
        {pluginSearch.length > 0 && (
          <Pressable onPress={() => setPluginSearch('')} style={{ padding: 2 }}>
            <Ionicons name="close-circle" size={fontSizeUI + 2} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsRow}>
        {(['all', 'plugins', 'themes'] as const).map(category => (
          <Pressable
            key={category}
            onPress={() => setActiveCategory(category)}
            style={[
              styles.tabBtn,
              { borderColor: colors.border },
              activeCategory === category && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
          >
            <Text style={[
              styles.tabBtnText,
              {
                color: activeCategory === category ? '#FFF' : colors.textMuted,
                fontSize: fontSizeUI - 2,
                fontFamily: fontFamilyUI
              }
            ]}>
              {category.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Main List */}
      <ScrollView style={styles.listScroll} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={true}>
        {/* Render Extensible Plugins */}
        {filteredPlugins.map(plugin => {
          const isEnabled = enabledPluginIds.includes(plugin.manifest.id);
          const isThemeType = plugin.manifest.type === 'theme';
          const isCurrentlyApplied = activeThemeId === plugin.manifest.id;

          return (
            <View
              key={plugin.manifest.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.background,
                  borderColor: isCurrentlyApplied ? colors.primary : colors.border,
                  borderWidth: isCurrentlyApplied ? 1.5 : 1
                }
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                    <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSizeUI + 1, fontFamily: fontFamilyUI }]}>
                      {plugin.manifest.name}
                    </Text>
                    {renderBadge(plugin.manifest.type)}
                  </View>
                  <Text style={[styles.cardMeta, { color: colors.textMuted, fontSize: fontSizeUI - 3, fontFamily: fontFamilyUI }]}>
                    v{plugin.manifest.version} • by {plugin.manifest.author}
                  </Text>
                </View>

                {/* Status Toggle */}
                <Pressable
                  onPress={() => handleTogglePlugin(plugin.manifest.id, isEnabled)}
                  style={[
                    styles.toggleBtn,
                    { backgroundColor: isEnabled ? colors.primary : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') }
                  ]}
                >
                  <Text style={[styles.toggleBtnText, { color: isEnabled ? '#FFF' : colors.textMuted, fontSize: fontSizeUI - 2 }]}>
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </Pressable>
              </View>

              <Text style={[styles.cardDesc, { color: colors.textMuted, fontSize: fontSizeUI - 1, fontFamily: fontFamilyUI, lineHeight: fontSizeUI + 4 }]}>
                {plugin.manifest.description || 'No description provided.'}
              </Text>

              {/* Theme Apply Action */}
              {isThemeType && isEnabled && (
                <Pressable
                  onPress={() => setActiveThemeId(isCurrentlyApplied ? null : plugin.manifest.id)}
                  style={[
                    styles.applyBtn,
                    {
                      borderColor: colors.primary,
                      backgroundColor: isCurrentlyApplied ? colors.primary : 'transparent'
                    }
                  ]}
                >
                  <Text style={{
                    color: isCurrentlyApplied ? '#FFF' : colors.primary,
                    fontWeight: 'bold',
                    fontSize: fontSizeUI - 2,
                    fontFamily: fontFamilyUI
                  }}>
                    {isCurrentlyApplied ? 'Applied' : 'Apply Theme'}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}

        {/* Render Custom Imported Themes */}
        {filteredCustomThemes.map(theme => {
          const isCurrentlyApplied = activeThemeId === theme.id;

          return (
            <View
              key={theme.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.background,
                  borderColor: isCurrentlyApplied ? colors.primary : colors.border,
                  borderWidth: isCurrentlyApplied ? 1.5 : 1
                }
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                    <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSizeUI + 1, fontFamily: fontFamilyUI }]}>
                      {theme.name}
                    </Text>
                    {renderBadge('theme', true)}
                  </View>
                  <Text style={[styles.cardMeta, { color: colors.textMuted, fontSize: fontSizeUI - 3, fontFamily: fontFamilyUI }]}>
                    v1.0.0 • by VSCode Importer
                  </Text>
                </View>

                {/* Delete Button */}
                <Pressable
                  onPress={() => {
                    const confirmDelete = Platform.OS === 'web'
                      ? window.confirm(`Are you sure you want to delete the theme "${theme.name}"?`)
                      : true;
                    if (confirmDelete) {
                      unregisterTheme(theme.id);
                    }
                  }}
                  style={[styles.deleteBtn, { borderColor: '#EF4444' }]}
                >
                  <Ionicons name="trash-outline" size={fontSizeUI - 1} color="#EF4444" />
                </Pressable>
              </View>

              <Text style={[styles.cardDesc, { color: colors.textMuted, fontSize: fontSizeUI - 1, fontFamily: fontFamilyUI, lineHeight: fontSizeUI + 4 }]}>
                Custom imported VSCode workspace theme.
              </Text>

              {/* Apply Action */}
              <Pressable
                onPress={() => setActiveThemeId(isCurrentlyApplied ? null : theme.id)}
                style={[
                  styles.applyBtn,
                  {
                    borderColor: colors.primary,
                    backgroundColor: isCurrentlyApplied ? colors.primary : 'transparent'
                  }
                ]}
              >
                <Text style={{
                  color: isCurrentlyApplied ? '#FFF' : colors.primary,
                  fontWeight: 'bold',
                  fontSize: fontSizeUI - 2,
                  fontFamily: fontFamilyUI
                }}>
                  {isCurrentlyApplied ? 'Applied' : 'Apply Theme'}
                </Text>
              </Pressable>
            </View>
          );
        })}

        {filteredPlugins.length === 0 && filteredCustomThemes.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="extension-puzzle-outline" size={32} color={colors.textMuted} style={{ opacity: 0.5, marginBottom: 8 }} />
            <Text style={[styles.emptyText, { color: colors.textMuted, fontSize: fontSizeUI - 1, fontFamily: fontFamilyUI }]}>
              No plugins or themes found.
            </Text>
          </View>
        )}

        {/* Collapsible VSCode Theme Importer Accordion */}
        {activeCategory !== 'plugins' && (
          <View style={[styles.importerCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Pressable
              onPress={() => setIsImporterExpanded(!isImporterExpanded)}
              style={styles.importerHeader}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="download-outline" size={fontSizeUI + 2} color={colors.primary} />
                <Text style={[styles.importerTitle, { color: colors.text, fontSize: fontSizeUI, fontFamily: fontFamilyUI }]}>
                  Import VSCode Theme
                </Text>
              </View>
              <Ionicons
                name={isImporterExpanded ? 'chevron-up' : 'chevron-down'}
                size={fontSizeUI + 1}
                color={colors.textMuted}
              />
            </Pressable>

            {isImporterExpanded && (
              <View style={styles.importerForm}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted, fontSize: fontSizeUI - 3, fontFamily: fontFamilyUI }]}>
                  Theme ID
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, fontSize: fontSizeUI - 1 }]}
                  placeholder="e.g. monokai-pro"
                  placeholderTextColor={colors.textMuted}
                  value={customThemeId}
                  onChangeText={setCustomThemeId}
                />

                <Text style={[styles.fieldLabel, { color: colors.textMuted, fontSize: fontSizeUI - 3, fontFamily: fontFamilyUI, marginTop: 10 }]}>
                  Theme Display Name
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, fontSize: fontSizeUI - 1 }]}
                  placeholder="e.g. Monokai Pro Premium"
                  placeholderTextColor={colors.textMuted}
                  value={customThemeName}
                  onChangeText={setCustomThemeName}
                />

                <Text style={[styles.fieldLabel, { color: colors.textMuted, fontSize: fontSizeUI - 3, fontFamily: fontFamilyUI, marginTop: 10 }]}>
                  VSCode JSON Contents
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                      height: 120,
                      paddingTop: 8,
                      fontSize: fontSizeUI - 2,
                      fontFamily: Platform.OS === 'web' ? 'monospace' : 'System'
                    }
                  ]}
                  multiline
                  numberOfLines={6}
                  placeholder='{ "type": "dark", "colors": { "editor.background": "#272822" } }'
                  placeholderTextColor={colors.textMuted}
                  value={vscodeJson}
                  onChangeText={setVscodeJson}
                />

                {importError ? (
                  <Text style={[styles.errorText, { fontSize: fontSizeUI - 2, fontFamily: fontFamilyUI }]}>
                    ⚠️ {importError}
                  </Text>
                ) : null}

                <Pressable
                  onPress={handleImportVSCodeTheme}
                  style={[styles.importBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.importBtnText, { fontSize: fontSizeUI - 1, fontFamily: fontFamilyUI }]}>
                    Convert & Apply
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    lineHeight: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    outline: 'none',
  } as any,
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnText: {
    fontWeight: '700',
  },
  listScroll: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontWeight: '800',
  },
  cardMeta: {
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnText: {
    fontWeight: 'bold',
  },
  cardDesc: {
    opacity: 0.85,
  },
  applyBtn: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontWeight: '500',
  },
  importerCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  importerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  importerTitle: {
    fontWeight: '700',
  },
  importerForm: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: 4,
  },
  fieldLabel: {
    fontWeight: '700',
    textTransform: 'uppercase',
    marginLeft: 2,
    marginBottom: 4,
  },
  input: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    outline: 'none',
  } as any,
  errorText: {
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 4,
  },
  importBtn: {
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  importBtnText: {
    color: '#FFF',
    fontWeight: '800',
  },
});
