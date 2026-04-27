import React, { useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, TextInput, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSettings } from '@/contexts/SettingsContext';

export function SettingsModal() {
  const { colors, isDark, fontFamilyUI } = useTheme();
  const { 
    apiKeys, updateAPIKey, deleteAPIKey, 
    isSettingsVisible, setSettingsVisible,
    activeTab, setActiveTab 
  } = useAppSettings();

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
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.headerIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="settings" size={16} color="#FFF" />
              </View>
              <Text style={[styles.title, { color: colors.text, fontFamily: fontFamilyUI }]}>Settings</Text>
            </View>
            <Pressable onPress={() => setSettingsVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.contentContainer}>
            {/* Sidebar Tabs */}
            <View style={[styles.sidebar, { backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', borderRightColor: colors.border }]}>
              <Pressable 
                onPress={() => setActiveTab('api')}
                style={[
                  styles.tabItem, 
                  activeTab === 'api' && { backgroundColor: isDark ? '#2d2d2d' : '#fff' }
                ]}
              >
                <View style={[styles.tabIconBox, activeTab === 'api' && { backgroundColor: colors.primary }]}>
                  <Ionicons 
                    name="key" 
                    size={14} 
                    color={activeTab === 'api' ? '#FFF' : (isDark ? '#94a3b8' : '#4b5563')} 
                  />
                </View>
                <Text style={[
                  styles.tabText, 
                  { color: activeTab === 'api' ? colors.text : (isDark ? '#94a3b8' : '#4b5563'), fontFamily: fontFamilyUI },
                  activeTab === 'api' && { fontWeight: '700' }
                ]}>API Keys</Text>
              </Pressable>
              
              <Pressable 
                onPress={() => setActiveTab('general')}
                style={[
                  styles.tabItem, 
                  activeTab === 'general' && { backgroundColor: isDark ? '#2d2d2d' : '#fff' }
                ]}
              >
                <View style={[styles.tabIconBox, activeTab === 'general' && { backgroundColor: colors.primary }]}>
                  <Ionicons 
                    name="options" 
                    size={14} 
                    color={activeTab === 'general' ? '#FFF' : (isDark ? '#94a3b8' : '#4b5563')} 
                  />
                </View>
                <Text style={[
                  styles.tabText, 
                  { color: activeTab === 'general' ? colors.text : (isDark ? '#94a3b8' : '#4b5563'), fontFamily: fontFamilyUI },
                  activeTab === 'general' && { fontWeight: '700' }
                ]}>General</Text>
              </Pressable>
            </View>

            {/* Main Content */}
            <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
              {activeTab === 'api' && (
                <View style={{ flex: 1 }}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamilyUI }]}>API Integrations</Text>
                    <Text style={[styles.sectionDesc, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>
                      Securely manage keys for YouTube and Gemini AI.
                    </Text>
                  </View>

                  {/* Scrollable Key List */}
                  <View style={[styles.listContainer, { borderColor: colors.border, backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
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
                    <View style={[styles.addBox, { backgroundColor: isDark ? '#1a1a1a' : '#fff', borderColor: colors.primary }]}>
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
                                backgroundColor: isDark ? '#2d2d2d' : '#f9fafb',
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
                            backgroundColor: isDark ? '#2d2d2d' : '#f9fafb', 
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

              {activeTab === 'general' && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontFamilyUI }]}>General Settings</Text>
                  <Text style={[styles.sectionDesc, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>
                    Configure general application behavior and preferences.
                  </Text>
                  <View style={styles.placeholderBox}>
                    <Ionicons name="construct-outline" size={48} color={colors.border} />
                    <Text style={{ color: colors.textMuted, marginTop: 16, fontFamily: fontFamilyUI }}>Advanced settings module is under development.</Text>
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
});
