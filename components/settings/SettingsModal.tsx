import React, { useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, TextInput, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSettings } from '@/contexts/SettingsContext';
import { usePlugins } from '@/contexts/PluginContext';
import { parseVSCodeTheme } from '@/utils/VSCodeThemeParser';
import { AVAILABLE_MODELS, AI_PROVIDERS } from '@/constants/Models';
import { Button } from '@/components/ui/Button';
import { Collapsible } from '@/components/ui/Collapsible';

export function SettingsModal() {
  const { 
    colors, isDark, fontFamilyUI, fontFamilyCode,
    fontSizeUI, fontSizeCode, updateFontSize,
    customThemes, activeThemeId, registerTheme, unregisterTheme, setActiveThemeId 
  } = useTheme();
  
  const { 
    apiKeys, updateAPIKey, deleteAPIKey, 
    isSettingsVisible, setSettingsVisible,
    activeTab, setActiveTab,

    // AI settings
    tempApiKey, setTempApiKey,
    tempClientId, setTempClientId,
    tempModel, setTempModel,
    tempRootPath, setTempRootPath,
    saveSettings, logout, promptAsync,
    googleAccessToken,

    // Multi-Provider settings
    tempAiProvider, setTempAiProvider,
    tempOpenaiApiKey, setTempOpenaiApiKey,
    tempClaudeApiKey, setTempClaudeApiKey
  } = useAppSettings();

  const { allPlugins, enabledPluginIds, enablePlugin, disablePlugin } = usePlugins();

  const hasToken = !!googleAccessToken;

  const getActiveTempApiKey = () => {
    if (tempAiProvider === 'gemini') return tempApiKey;
    if (tempAiProvider === 'openai') return tempOpenaiApiKey;
    if (tempAiProvider === 'claude') return tempClaudeApiKey;
    return '';
  };

  const setActiveTempApiKey = (value: string) => {
    if (tempAiProvider === 'gemini') setTempApiKey(value);
    if (tempAiProvider === 'openai') setTempOpenaiApiKey(value);
    if (tempAiProvider === 'claude') setTempClaudeApiKey(value);
  };

  const [inputKey, setInputKey] = useState('');
  const [selectedType, setSelectedType] = useState<'youtube' | 'gemini'>('youtube');
  const [isAdding, setIsAdding] = useState(false);

  const maskKey = (key?: string) => {
    if (!key) return '';
    if (key.length <= 8) return '********';
    return `${key.substring(0, 5)}*****${key.substring(key.length - 3)}`;
  };

  const handleSave = async () => {
    if (!inputKey.trim()) return;
    await updateAPIKey(selectedType, inputKey.trim());
    setInputKey('');
    setIsAdding(false);
  };

  const handleEdit = (type: 'youtube' | 'gemini', key: string) => {
    setSelectedType(type);
    setInputKey(key);
    setIsAdding(true);
  };

  const handleCopy = async (key: string) => {
    await Clipboard.setStringAsync(key);
    if (Platform.OS === 'web') alert('API Key copied to clipboard!');
  };

  if (!isSettingsVisible) return null;

  return (
    <Modal
      transparent
      visible={isSettingsVisible}
      animationType="fade"
      onRequestClose={() => setSettingsVisible(false)}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={() => setSettingsVisible(false)} />
        <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { height: fontSizeUI + 35, borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.headerIcon, { width: fontSizeUI + 15, height: fontSizeUI + 15, borderRadius: (fontSizeUI + 15) * 0.28, backgroundColor: colors.primary }]}>
                <Ionicons name="settings" size={fontSizeUI + 3} color="#FFF" style={{ lineHeight: fontSizeUI + 3 }} />
              </View>
              <Text testID="settings-modal-title" style={[styles.title, { fontSize: fontSizeUI + 5, color: colors.text, fontFamily: fontFamilyUI }]}>Settings</Text>
            </View>
            <Pressable onPress={() => setSettingsVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={fontSizeUI + 11} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.contentContainer}>
            {/* Sidebar Tabs */}
            <View style={[styles.sidebar, { width: 200 + (fontSizeUI - 13) * 8, backgroundColor: colors.surface, borderRightColor: colors.border }]}>
              {/* AI Assistant Tab */}
              <Pressable 
                onPress={() => setActiveTab('ai')}
                testID="sidebar-tab-ai"
                style={[
                  styles.tabItem, 
                  activeTab === 'ai' && { backgroundColor: colors.background }
                ]}
              >
                <View style={[styles.tabIconBox, { width: fontSizeUI + 11, height: fontSizeUI + 11 }, activeTab === 'ai' && { backgroundColor: colors.primary }]}>
                  <Ionicons 
                    name="sparkles" 
                    size={fontSizeUI + 1} 
                    color={activeTab === 'ai' ? '#FFF' : (isDark ? '#94a3b8' : '#4b5563')} 
                    style={{ lineHeight: fontSizeUI + 1 }}
                  />
                </View>
                <Text style={[
                  styles.tabText, 
                  { fontSize: fontSizeUI, color: activeTab === 'ai' ? colors.text : (isDark ? '#94a3b8' : '#4b5563'), fontFamily: fontFamilyUI },
                  activeTab === 'ai' && { fontWeight: '700' }
                ]}>AI Assistant</Text>
              </Pressable>

              {/* Appearance Tab */}
              <Pressable 
                onPress={() => setActiveTab('appearance')}
                testID="sidebar-tab-appearance"
                style={[
                  styles.tabItem, 
                  activeTab === 'appearance' && { backgroundColor: colors.background }
                ]}
              >
                <View style={[styles.tabIconBox, { width: fontSizeUI + 11, height: fontSizeUI + 11 }, activeTab === 'appearance' && { backgroundColor: colors.primary }]}>
                  <Ionicons 
                    name="brush-outline" 
                    size={fontSizeUI + 1} 
                    color={activeTab === 'appearance' ? '#FFF' : (isDark ? '#94a3b8' : '#4b5563')} 
                    style={{ lineHeight: fontSizeUI + 1 }}
                  />
                </View>
                <Text style={[
                  styles.tabText, 
                  { fontSize: fontSizeUI, color: activeTab === 'appearance' ? colors.text : (isDark ? '#94a3b8' : '#4b5563'), fontFamily: fontFamilyUI },
                  activeTab === 'appearance' && { fontWeight: '700' }
                ]}>Appearance</Text>
              </Pressable>


              {/* API Keys Tab */}
              <Pressable 
                onPress={() => setActiveTab('api')}
                testID="sidebar-tab-api"
                style={[
                  styles.tabItem, 
                  activeTab === 'api' && { backgroundColor: colors.background }
                ]}
              >
                <View style={[styles.tabIconBox, { width: fontSizeUI + 11, height: fontSizeUI + 11 }, activeTab === 'api' && { backgroundColor: colors.primary }]}>
                  <Ionicons 
                    name="key" 
                    size={fontSizeUI + 1} 
                    color={activeTab === 'api' ? '#FFF' : (isDark ? '#94a3b8' : '#4b5563')} 
                    style={{ lineHeight: fontSizeUI + 1 }}
                  />
                </View>
                <Text style={[
                  styles.tabText, 
                  { fontSize: fontSizeUI, color: activeTab === 'api' ? colors.text : (isDark ? '#94a3b8' : '#4b5563'), fontFamily: fontFamilyUI },
                  activeTab === 'api' && { fontWeight: '700' }
                ]}>API Keys</Text>
              </Pressable>

              {/* Integrations Tab */}
              <Pressable 
                onPress={() => setActiveTab('integrations')}
                testID="sidebar-tab-integrations"
                style={[
                  styles.tabItem, 
                  activeTab === 'integrations' && { backgroundColor: colors.background }
                ]}
              >
                <View style={[styles.tabIconBox, { width: fontSizeUI + 11, height: fontSizeUI + 11 }, activeTab === 'integrations' && { backgroundColor: colors.primary }]}>
                  <Ionicons 
                    name="logo-google" 
                    size={fontSizeUI + 1} 
                    color={activeTab === 'integrations' ? '#FFF' : (isDark ? '#94a3b8' : '#4b5563')} 
                    style={{ lineHeight: fontSizeUI + 1 }}
                  />
                </View>
                <Text style={[
                  styles.tabText, 
                  { fontSize: fontSizeUI, color: activeTab === 'integrations' ? colors.text : (isDark ? '#94a3b8' : '#4b5563'), fontFamily: fontFamilyUI },
                  activeTab === 'integrations' && { fontWeight: '700' }
                ]}>Integrations</Text>
              </Pressable>
            </View>

            {/* Main Content */}
            <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
              {activeTab === 'api' && (
                <View style={{ flex: 1 }}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { fontSize: fontSizeUI + 9, color: colors.text, fontFamily: fontFamilyUI }]}>API Integrations</Text>
                    <Text style={[styles.sectionDesc, { fontSize: fontSizeUI + 1, color: colors.textMuted, fontFamily: fontFamilyUI }]}>
                      Securely manage keys for YouTube and Gemini AI.
                    </Text>
                  </View>

                  {/* Scrollable Key List */}
                  <View style={[styles.listContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <ScrollView style={styles.keyList} showsVerticalScrollIndicator={true}>
                      {(Object.entries(apiKeys) as [keyof typeof apiKeys, string][]).map(([type, key], index, array) => (
                        <View 
                          key={type} 
                          style={[
                            styles.keyRow, 
                            index < array.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                          ]}
                        >
                          <Pressable 
                            onPress={() => handleCopy(key)}
                            style={styles.keyMainInfo}
                          >
                            <Text style={[styles.keyType, { color: colors.text, fontFamily: fontFamilyUI, fontWeight: '600' }]}>
                              {type.toUpperCase()}: <Text style={[styles.keyValue, { color: colors.textMuted, fontWeight: '400' }]}>{maskKey(key)}</Text>
                            </Text>
                            <Ionicons name="copy-outline" size={12} color={colors.primary} style={{ marginLeft: 8, opacity: 0.6 }} />
                          </Pressable>
                          <View style={styles.keyActions}>
                            <Pressable onPress={() => handleEdit(type as any, key)} style={styles.actionIcon}>
                              <Ionicons name="pencil-sharp" size={14} color={colors.primary} />
                            </Pressable>
                            <Pressable onPress={() => deleteAPIKey(type as any)} style={styles.actionIcon}>
                              <Ionicons name="trash-sharp" size={14} color="#EF4444" />
                            </Pressable>
                          </View>
                        </View>
                      ))}
                      {Object.keys(apiKeys).length === 0 && (
                        <View style={styles.emptyList}>
                          <Ionicons name="shield-outline" size={32} color={colors.border} />
                          <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>No API keys configured yet.</Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>

                  {!isAdding && (
                    <Pressable 
                      onPress={() => setIsAdding(true)}
                      style={[styles.addNewBtn, { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.02)' }]}
                    >
                      <Ionicons name="add" size={20} color={colors.primary} />
                      <Text style={[styles.addNewBtnText, { color: colors.primary, fontFamily: fontFamilyUI }]}>Add New API Key</Text>
                    </Pressable>
                  )}

                  {/* Modern Add/Edit Form */}
                  {isAdding && (
                    <View style={[styles.addBox, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                      <View style={styles.addBoxHeader}>
                        <Text style={[styles.addBoxTitle, { color: colors.text, fontFamily: fontFamilyUI }]}>
                          {inputKey ? 'Update Configuration' : 'Create Integration'}
                        </Text>
                        <Pressable onPress={() => { setIsAdding(false); setInputKey(''); }} style={styles.addBoxClose}>
                          <Ionicons name="close" size={18} color={colors.textMuted} />
                        </Pressable>
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>Service Provider</Text>
                        <View style={styles.selectWrapper}>
                          {Platform.OS === 'web' ? (
                            <select
                              value={selectedType}
                              onChange={(e) => setSelectedType(e.target.value as any)}
                              style={{
                                width: '100%',
                                height: 42,
                                borderRadius: 10,
                                border: `1px solid ${colors.border}`,
                                backgroundColor: colors.background,
                                color: colors.text,
                                paddingLeft: 12,
                                fontSize: 14,
                                fontFamily: fontFamilyUI,
                                outline: 'none',
                                cursor: 'pointer',
                                appearance: 'none',
                              } as any}
                            >
                              <option value="youtube">YouTube Data API v3</option>
                              <option value="gemini">Google Gemini AI</option>
                            </select>
                          ) : (
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                              {(['youtube', 'gemini'] as const).map(t => (
                                <Pressable 
                                  key={t}
                                  onPress={() => setSelectedType(t)}
                                  style={[
                                    styles.typeBtn, 
                                    { borderColor: colors.border },
                                    selectedType === t && { backgroundColor: colors.primary, borderColor: colors.primary }
                                  ]}
                                >
                                  <Text style={[
                                    styles.typeBtnText, 
                                    { color: selectedType === t ? '#FFF' : colors.textMuted, fontFamily: fontFamilyUI }
                                  ]}>{t.toUpperCase()}</Text>
                                </Pressable>
                              ))}
                            </View>
                          )}
                          <Ionicons name="chevron-down" size={14} color={colors.textMuted} style={styles.selectArrow} />
                        </View>
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>API Key / Token</Text>
                        <TextInput
                          style={[styles.input, { 
                            backgroundColor: colors.background, 
                            borderColor: colors.border, 
                            color: colors.text,
                            fontFamily: 'monospace'
                          }]}
                          placeholder="Enter key here..."
                          placeholderTextColor={colors.textMuted}
                          value={inputKey}
                          onChangeText={setInputKey}
                          secureTextEntry
                          autoFocus
                        />
                      </View>

                      <Pressable 
                        onPress={handleSave}
                        style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: inputKey ? 1 : 0.6 }]}
                        disabled={!inputKey}
                      >
                        <Text style={styles.saveBtnText}>{inputKey ? 'Update Key' : 'Authorize Integration'}</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}

              {activeTab === 'ai' && (
                <View style={styles.tabContent}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { fontSize: fontSizeUI + 9, color: colors.text, fontFamily: fontFamilyUI }]}>AI Assistant</Text>
                    <Text style={[styles.sectionDesc, { fontSize: fontSizeUI + 1, color: colors.textMuted, fontFamily: fontFamilyUI }]}>
                      Configure your preferred AI models and developer API keys.
                    </Text>
                  </View>

                  {/* 1. Active AI Provider */}
                  <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.text, fontFamily: fontFamilyUI }]}>Active AI Provider</Text>
                    <View style={styles.providerRow}>
                      {(['gemini', 'openai', 'claude'] as const).map(provider => {
                        const info = AI_PROVIDERS[provider];
                        const isActive = tempAiProvider === provider;
                        return (
                          <Pressable
                            key={provider}
                            onPress={() => {
                              setTempAiProvider(provider);
                              setTempModel(AI_PROVIDERS[provider].defaultModel);
                            }}
                            style={[
                              styles.providerTab,
                              { borderColor: colors.border, backgroundColor: colors.surface },
                              isActive && { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)' }
                            ]}
                          >
                            <Ionicons 
                              name={provider === 'gemini' ? 'logo-google' : provider === 'openai' ? 'hardware-chip-outline' : 'sparkles-outline'} 
                              size={13} 
                              color={isActive ? colors.primary : colors.textMuted} 
                            />
                            <Text style={[
                              styles.providerTabText,
                              { color: colors.text, fontFamily: fontFamilyUI },
                              isActive && { color: colors.primary, fontWeight: 'bold' }
                            ]}>
                              {info.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* 2. Dynamic API Key Configuration */}
                  <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.text, fontFamily: fontFamilyUI }]}>API Key Configuration</Text>
                    <View style={styles.apiKeyField}>
                      <Text style={[styles.subLabel, { color: colors.text, fontFamily: fontFamilyUI, fontWeight: '600' }]}>
                        {tempAiProvider === 'gemini' ? 'Google Gemini API Key' : tempAiProvider === 'openai' ? 'OpenAI API Key' : 'Anthropic Claude API Key'}
                      </Text>
                      <TextInput 
                         style={[styles.input, { color: colors.text, borderColor: colors.primary, backgroundColor: colors.surface, fontFamily: fontFamilyUI }]}
                         placeholder={tempAiProvider === 'gemini' ? "Enter your Gemini API Key..." : tempAiProvider === 'openai' ? "Enter your OpenAI API Key (sk-...)" : "Enter your Anthropic Claude API Key..."}
                         placeholderTextColor={colors.textMuted}
                         value={getActiveTempApiKey()}
                         onChangeText={setActiveTempApiKey}
                         secureTextEntry
                      />
                    </View>
                    <Text style={[styles.helpText, { color: colors.textMuted, fontFamily: fontFamilyUI, marginTop: 6 }]}>
                      The API key is securely saved specifically for the active AI Provider.
                    </Text>
                  </View>

                  {/* 3. Dynamic Default AI Model Selection */}
                  <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.text, fontFamily: fontFamilyUI }]}>Default AI Model</Text>
                    <View style={styles.modelList}>
                       {AI_PROVIDERS[tempAiProvider].models.map(m => (
                         <Pressable 
                           key={m.value} 
                           onPress={() => setTempModel(m.value)}
                           style={[
                             styles.modelItem, 
                             { borderColor: colors.border },
                             tempModel === m.value && { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)' }
                           ]}
                         >
                           <Text style={[
                             styles.modelLabel, 
                             { color: colors.text, fontFamily: fontFamilyUI }, 
                             tempModel === m.value && { color: colors.primary, fontWeight: 'bold' }
                           ]}>
                             {m.label}
                           </Text>
                           {tempModel === m.value && <Ionicons name="checkmark-sharp" size={14} color={colors.primary} />}
                         </Pressable>
                       ))}
                    </View>
                  </View>

                  {/* 4. Root Path Selection */}
                  <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.text, fontFamily: fontFamilyUI }]}>Root Path (for relative links)</Text>
                    <TextInput 
                       style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface, fontFamily: fontFamilyUI }]}
                       placeholder="e.g. /Users/name/docs"
                       placeholderTextColor={colors.textMuted}
                       value={tempRootPath}
                       onChangeText={setTempRootPath}
                    />
                  </View>

                  {/* Save AI Settings Button */}
                  <Pressable 
                    onPress={() => {
                      saveSettings();
                      alert('AI Settings saved successfully!');
                    }}
                    style={[styles.saveBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
                  >
                    <Text style={styles.saveBtnText}>Save AI Settings</Text>
                  </Pressable>
                </View>
              )}

              {activeTab === 'integrations' && (
                <View style={styles.tabContent}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { fontSize: fontSizeUI + 9, color: colors.text, fontFamily: fontFamilyUI }]}>Integrations</Text>
                    <Text style={[styles.sectionDesc, { fontSize: fontSizeUI + 1, color: colors.textMuted, fontFamily: fontFamilyUI }]}>
                      Connect with external storage and services like Google Drive.
                    </Text>
                  </View>

                  {/* Google OAuth Section */}
                  <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.text, fontFamily: fontFamilyUI }]}>Google OAuth (Google Drive/YouTube)</Text>
                    <Text style={[styles.subLabel, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>Web Client ID:</Text>
                    <TextInput 
                       style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface, fontFamily: fontFamilyUI, marginBottom: 12 }]}
                       placeholder="Enter Google Web Client ID..."
                       placeholderTextColor={colors.textMuted}
                       value={tempClientId}
                       onChangeText={setTempClientId}
                    />
                    
                    <View style={styles.authRow}>
                       {hasToken ? (
                         <View style={styles.statusRow}>
                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                            <Text style={[styles.statusText, { fontFamily: fontFamilyUI, color: '#059669', fontWeight: 'bold', marginLeft: 8, flex: 1 }]}>Connected</Text>
                            <Pressable onPress={logout} style={styles.logoutBtn}>
                              <Text style={[styles.logoutText, { fontFamily: fontFamilyUI, color: '#EF4444', fontWeight: 'bold' }]}>Logout</Text>
                            </Pressable>
                         </View>
                       ) : (
                         <Button 
                           label="Login with Google"
                           onPress={() => promptAsync()}
                           variant="primary"
                           style={{ width: '100%' }}
                         />
                       )}
                    </View>
                  </View>

                  {/* Advanced Settings for E2E validation */}
                  <View style={styles.section}>
                    <Collapsible title="Advanced Settings (Test)">
                      <View style={{ paddingVertical: 10, gap: 10 }}>
                        <Text style={{ fontSize: 11, color: colors.textMuted }}>This area is for UI validation during E2E testing.</Text>
                        <Button 
                          label="UI Test Button"
                          onPress={() => {}}
                          variant="outline"
                          size="sm"
                          testID="ui-test-button"
                        />
                      </View>
                    </Collapsible>
                  </View>

                  {/* Save Client ID Button */}
                  <Pressable 
                    onPress={() => {
                      saveSettings();
                      alert('Client ID saved successfully!');
                    }}
                    style={[styles.saveBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
                  >
                    <Text style={styles.saveBtnText}>Save Client ID</Text>
                  </Pressable>
                </View>
              )}

              {activeTab === 'appearance' && (
                <View style={{ flex: 1 }}>
                  {/* Section 1: Font Size Adjuster */}
                  <View style={[styles.sectionHeader, { marginBottom: 20 }]}>
                    <Text style={[styles.sectionTitle, { fontSize: fontSizeUI + 9, color: colors.text, fontFamily: fontFamilyUI }]}>Appearance & Font Scaling</Text>
                    <Text style={[styles.sectionDesc, { fontSize: fontSizeUI + 1, color: colors.textMuted, fontFamily: fontFamilyUI }]}>
                      Dynamically adjust the text size of your workspace and editor layout.
                    </Text>
                  </View>

                  <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, padding: 20, borderRadius: 14, borderWidth: 1, marginBottom: 28 }]}>
                    {/* UI Font Size */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <View>
                        <Text style={{ color: colors.text, fontFamily: fontFamilyUI, fontWeight: '700', fontSize: 14 }}>UI Font Size</Text>
                        <Text style={{ color: colors.textMuted, fontFamily: fontFamilyUI, fontSize: 12 }}>Sidebar, buttons, and system menu scales</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Pressable 
                          onPress={() => updateFontSize('ui', 'decrease')}
                          style={[styles.smallBtn, { backgroundColor: colors.background }]}
                        >
                          <Ionicons name="remove" size={16} color={colors.text} />
                        </Pressable>
                        <Text style={{ color: colors.text, fontFamily: fontFamilyUI, fontWeight: 'bold', width: 32, textAlign: 'center' }}>{fontSizeUI}px</Text>
                        <Pressable 
                          onPress={() => updateFontSize('ui', 'increase')}
                          style={[styles.smallBtn, { backgroundColor: colors.background }]}
                        >
                          <Ionicons name="add" size={16} color={colors.text} />
                        </Pressable>
                      </View>
                    </View>

                    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />

                    {/* Editor Font Size */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={{ color: colors.text, fontFamily: fontFamilyUI, fontWeight: '700', fontSize: 14 }}>Editor Font Size</Text>
                        <Text style={{ color: colors.textMuted, fontFamily: fontFamilyUI, fontSize: 12 }}>Markdown editor and preview font size</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Pressable 
                          onPress={() => updateFontSize('code', 'decrease')}
                          style={[styles.smallBtn, { backgroundColor: colors.background }]}
                        >
                          <Ionicons name="remove" size={16} color={colors.text} />
                        </Pressable>
                        <Text style={{ color: colors.text, fontFamily: fontFamilyUI, fontWeight: 'bold', width: 32, textAlign: 'center' }}>{fontSizeCode}px</Text>
                        <Pressable 
                          onPress={() => updateFontSize('code', 'increase')}
                          style={[styles.smallBtn, { backgroundColor: colors.background }]}
                        >
                          <Ionicons name="add" size={16} color={colors.text} />
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  {/* Section 2: Workspace Themes */}
                  <View style={[styles.sectionHeader, { marginBottom: 20 }]}>
                    <Text style={[styles.sectionTitle, { fontSize: fontSizeUI + 9, color: colors.text, fontFamily: fontFamilyUI }]}>Workspace Themes</Text>
                    <Text style={[styles.sectionDesc, { fontSize: fontSizeUI + 1, color: colors.textMuted, fontFamily: fontFamilyUI }]}>
                      Manage and apply custom visual color schemes to your workspace.
                    </Text>
                  </View>

                  <View style={{ gap: 16, marginBottom: 28 }}>
                    {allPlugins.filter(plugin => plugin.manifest.type === 'theme').map((plugin) => {
                      const isEnabled = enabledPluginIds.includes(plugin.manifest.id);
                      const isThemePlugin = plugin.manifest.type === 'theme';
                      const isCurrentlyAppliedTheme = activeThemeId === plugin.manifest.id;
                      
                      return (
                        <View 
                          key={plugin.manifest.id}
                          style={[
                            styles.pluginCard,
                            { 
                              backgroundColor: colors.surface,
                              borderColor: isCurrentlyAppliedTheme ? colors.primary : colors.border,
                              borderWidth: isCurrentlyAppliedTheme ? 1.5 : 1,
                              borderRadius: 14,
                              padding: 16
                            }
                          ]}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ flex: 1, marginRight: 16 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <Text style={{ color: colors.text, fontFamily: fontFamilyUI, fontWeight: 'bold', fontSize: 15 }}>
                                  {plugin.manifest.name}
                                </Text>
                                <View style={{ 
                                  backgroundColor: isThemePlugin ? 'rgba(236, 72, 153, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                  paddingHorizontal: 8,
                                  paddingVertical: 2,
                                  borderRadius: 6
                                }}>
                                  <Text style={{ 
                                    color: isThemePlugin ? '#EC4899' : colors.primary, 
                                    fontFamily: fontFamilyUI, 
                                    fontWeight: '700', 
                                    fontSize: 10,
                                    textTransform: 'uppercase'
                                  }}>
                                    {isThemePlugin ? 'Theme' : 'Functional'}
                                  </Text>
                                </View>
                                <Text style={{ color: colors.textMuted, fontFamily: fontFamilyUI, fontSize: 11 }}>
                                  v{plugin.manifest.version}
                                </Text>
                              </View>
                              
                              <Text style={{ color: colors.textMuted, fontFamily: fontFamilyUI, fontSize: 13, lineHeight: 18, marginBottom: 12 }}>
                                {plugin.manifest.description || 'No description provided.'}
                              </Text>
                              
                              <Text style={{ color: colors.textMuted, fontFamily: fontFamilyUI, fontSize: 11 }}>
                                Author: <Text style={{ fontWeight: '600' }}>{plugin.manifest.author}</Text>
                              </Text>
                            </View>

                            <View style={{ alignItems: 'flex-end', gap: 10 }}>
                              {/* Toggle switch (Enable/Disable) */}
                              <Pressable 
                                onPress={() => isEnabled ? disablePlugin(plugin.manifest.id) : enablePlugin(plugin.manifest.id)}
                                style={[
                                  styles.toggleBtn, 
                                  { 
                                    backgroundColor: isEnabled ? colors.primary : colors.border,
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 8
                                  }
                                ]}
                              >
                                <Text style={{ color: isEnabled ? '#FFF' : colors.textMuted, fontWeight: 'bold', fontSize: 12 }}>
                                  {isEnabled ? 'Enabled' : 'Disabled'}
                                </Text>
                              </Pressable>

                              {/* Apply theme button (Only for active theme plugins) */}
                              {isThemePlugin && isEnabled && (
                                <Pressable
                                  onPress={() => setActiveThemeId(isCurrentlyAppliedTheme ? null : plugin.manifest.id)}
                                  style={[
                                    styles.applyBtn,
                                    {
                                      borderColor: colors.primary,
                                      borderWidth: 1,
                                      backgroundColor: isCurrentlyAppliedTheme ? colors.primary : 'transparent',
                                      paddingHorizontal: 12,
                                      paddingVertical: 6,
                                      borderRadius: 8
                                    }
                                  ]}
                                >
                                  <Text style={{ 
                                    color: isCurrentlyAppliedTheme ? '#FFF' : colors.primary, 
                                    fontWeight: 'bold', 
                                    fontSize: 12 
                                  }}>
                                    {isCurrentlyAppliedTheme ? 'Applied' : 'Apply'}
                                  </Text>
                                </Pressable>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })}

                    {customThemes.filter(t => !allPlugins.some(p => p.manifest.id === t.id)).map((theme) => {
                      const isCurrentlyAppliedTheme = activeThemeId === theme.id;
                      
                      return (
                        <View 
                          key={theme.id}
                          style={[
                            styles.pluginCard,
                            { 
                              backgroundColor: colors.surface,
                              borderColor: isCurrentlyAppliedTheme ? colors.primary : colors.border,
                              borderWidth: isCurrentlyAppliedTheme ? 1.5 : 1,
                              borderRadius: 14,
                              padding: 16
                            }
                          ]}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ flex: 1, marginRight: 16 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <Text style={{ color: colors.text, fontFamily: fontFamilyUI, fontWeight: 'bold', fontSize: 15 }}>
                                  {theme.name}
                                </Text>
                                <View style={{ 
                                  backgroundColor: 'rgba(236, 72, 153, 0.1)',
                                  paddingHorizontal: 8,
                                  paddingVertical: 2,
                                  borderRadius: 6
                                }}>
                                  <Text style={{ 
                                    color: '#EC4899', 
                                    fontFamily: fontFamilyUI, 
                                    fontWeight: '700', 
                                    fontSize: 10,
                                    textTransform: 'uppercase'
                                  }}>
                                    Theme (Imported)
                                  </Text>
                                </View>
                                <Text style={{ color: colors.textMuted, fontFamily: fontFamilyUI, fontSize: 11 }}>
                                  v1.0.0
                                </Text>
                              </View>
                              
                              <Text style={{ color: colors.textMuted, fontFamily: fontFamilyUI, fontSize: 13, lineHeight: 18, marginBottom: 12 }}>
                                Custom imported VSCode workspace theme.
                              </Text>
                              
                              <Text style={{ color: colors.textMuted, fontFamily: fontFamilyUI, fontSize: 11 }}>
                                Author: <Text style={{ fontWeight: '600' }}>VSCode Importer</Text>
                              </Text>
                            </View>

                            <View style={{ alignItems: 'flex-end', gap: 10 }}>
                              {/* Apply theme button */}
                              <Pressable
                                onPress={() => setActiveThemeId(isCurrentlyAppliedTheme ? null : theme.id)}
                                style={[
                                  styles.applyBtn,
                                  {
                                    borderColor: colors.primary,
                                    borderWidth: 1,
                                    backgroundColor: isCurrentlyAppliedTheme ? colors.primary : 'transparent',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 8
                                  }
                                ]}
                              >
                                <Text style={{ 
                                  color: isCurrentlyAppliedTheme ? '#FFF' : colors.primary, 
                                  fontWeight: 'bold', 
                                  fontSize: 12 
                                }}>
                                  {isCurrentlyAppliedTheme ? 'Applied' : 'Apply'}
                                </Text>
                              </Pressable>

                              {/* Delete theme button */}
                              <Pressable
                                onPress={() => {
                                  const confirmDelete = Platform.OS === 'web'
                                    ? window.confirm(`Are you sure you want to delete the theme "${theme.name}"?`)
                                    : true;
                                  if (confirmDelete) {
                                    unregisterTheme(theme.id);
                                  }
                                }}
                                style={[
                                  styles.applyBtn,
                                  {
                                    borderColor: '#EF4444',
                                    borderWidth: 1,
                                    backgroundColor: 'transparent',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 8
                                  }
                                ]}
                              >
                                <Text style={{ 
                                  color: '#EF4444', 
                                  fontWeight: 'bold', 
                                  fontSize: 12 
                                }}>
                                  Delete
                                </Text>
                              </Pressable>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  } as any,
  container: {
    width: '95%',
    maxWidth: 760,
    height: '85%',
    maxHeight: 640,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  closeBtn: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 200,
    borderRightWidth: 1,
    padding: 16,
    gap: 6,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 12,
  },
  tabIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    padding: 32,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  sectionDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  listContainer: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  keyList: {
    maxHeight: 280,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  keyMainInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyType: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  keyValue: {
    fontSize: 13,
    marginLeft: 6,
  },
  keyActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  } as any,
  emptyList: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addNewBtnText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  addBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  addBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addBoxTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  addBoxClose: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  selectWrapper: {
    position: 'relative',
  },
  selectArrow: Platform.select({
    web: {
      position: 'absolute',
      right: 12,
      top: 14,
      pointerEvents: 'none',
    } as any,
    default: { display: 'none' }
  }),
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    outline: 'none',
  } as any,
  saveBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  placeholderBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 20,
    marginTop: 20,
    opacity: 0.5,
  } as any,
  typeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  smallBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  card: {
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  pluginCard: {
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  toggleBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  applyBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  tabContent: {
    paddingBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  apiKeyField: {
    gap: 4,
  },
  helpText: {
    fontSize: 10,
    lineHeight: 14,
  },
  authRow: {
    marginTop: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 13,
  },
  logoutBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoutText: {
    fontSize: 11,
  },
  modelList: {
    gap: 6,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  modelLabel: {
    fontSize: 12,
  },
  providerRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  providerTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
  },
  providerTabText: {
    fontSize: 10,
  },
});
