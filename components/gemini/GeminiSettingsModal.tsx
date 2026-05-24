import React, { memo, useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AVAILABLE_MODELS, AI_PROVIDERS, AIProviderType } from '@/constants/Models';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/Button';
import { Collapsible } from '@/components/ui/Collapsible';

interface GeminiSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const GeminiSettingsModal = memo(({ visible, onClose }: GeminiSettingsModalProps) => {
  const { colors, isDark, fontFamilyUI } = useTheme();
  const {
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

  // Local state for sidebar navigation
  const [activeTab, setActiveTab] = useState<'ai' | 'integrations'>('ai');
  
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
  
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text testID="settings-modal-title" style={[styles.modalTitle, { color: colors.text, fontFamily: fontFamilyUI }]}>Settings</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>
          
          {/* Dual-Pane Content Body */}
          <View style={styles.modalContentRow}>
            
            {/* Left Sidebar */}
            <View style={[styles.sidebar, { borderRightColor: colors.border, backgroundColor: isDark ? '#161616' : '#F9FAFB' }]}>
              <Pressable 
                onPress={() => setActiveTab('ai')}
                testID="sidebar-tab-ai"
                style={[
                  styles.sidebarItem, 
                  activeTab === 'ai' && { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }
                ]}
              >
                <Ionicons name="sparkles" size={15} color={activeTab === 'ai' ? colors.primary : colors.textMuted} />
                <Text style={[
                  styles.sidebarText, 
                  { color: colors.text, fontFamily: fontFamilyUI }, 
                  activeTab === 'ai' && { color: colors.primary, fontWeight: 'bold' }
                ]}>
                  AI Assistant
                </Text>
              </Pressable>
              
              <Pressable 
                onPress={() => setActiveTab('integrations')}
                testID="sidebar-tab-integrations"
                style={[
                  styles.sidebarItem, 
                  activeTab === 'integrations' && { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }
                ]}
              >
                <Ionicons name="logo-google" size={15} color={activeTab === 'integrations' ? colors.primary : colors.textMuted} />
                <Text style={[
                  styles.sidebarText, 
                  { color: colors.text, fontFamily: fontFamilyUI }, 
                  activeTab === 'integrations' && { color: colors.primary, fontWeight: 'bold' }
                ]}>
                  Integrations
                </Text>
              </Pressable>
            </View>

            {/* Right Scrollable Content Pane */}
            <ScrollView style={styles.contentArea} contentContainerStyle={styles.contentContainer}>
              {activeTab === 'ai' && (
                <View style={styles.tabContent}>
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
                </View>
              )}

              {activeTab === 'integrations' && (
                <View style={styles.tabContent}>
                  {/* Google OAuth Section */}
                  <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.text, fontFamily: fontFamilyUI }]}>Google OAuth (Google Drive/YouTube)</Text>
                    <Text style={[styles.subLabel, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>Web Client ID:</Text>
                    <TextInput 
                       style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface, fontFamily: fontFamilyUI }]}
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
                </View>
              )}
            </ScrollView>
          </View>
          
          {/* Footer Controls */}
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
             <Button 
                label="Cancel"
                onPress={onClose}
                variant="secondary"
             />
             <Button 
                label="Save Changes"
                onPress={saveSettings}
                variant="primary"
             />
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 640,
    height: 480,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  modalHeader: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  modalContentRow: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  sidebar: {
    width: 160,
    borderRightWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 4,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  sidebarText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contentArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
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
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    fontSize: 13,
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
  modalFooter: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
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
  apiKeyField: {
    gap: 4,
  },
});
