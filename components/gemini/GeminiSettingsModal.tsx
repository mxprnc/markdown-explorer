import React, { memo } from 'react';
import { View, Text, Modal, Pressable, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AVAILABLE_MODELS } from '@/constants/Models';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
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
    googleAccessToken
  } = useSettings();
  
  const hasToken = !!googleAccessToken;
  
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontFamily: fontFamilyUI }]}>Settings / Gemini AI</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>
          
          <ScrollView style={styles.modalBody}>
             <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text, fontFamily: fontFamilyUI }]}>1. API Key (Direct API)</Text>
                <TextInput 
                   style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface, fontFamily: fontFamilyUI }]}
                   placeholder="Enter your Gemini API Key..."
                   placeholderTextColor={colors.textMuted}
                   value={tempApiKey}
                   onChangeText={setTempApiKey}
                   secureTextEntry
                />
                <Text style={[styles.helpText, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>
                  You can use your personal API key or an OAuth token via Google Login.
                </Text>
             </View>

             <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text, fontFamily: fontFamilyUI }]}>2. Google OAuth (Google Drive/YouTube)</Text>
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

             <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text, fontFamily: fontFamilyUI }]}>3. Default AI Model</Text>
                <View style={styles.modelList}>
                   {AVAILABLE_MODELS.map(m => (
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
                       {tempModel === m.value && <Ionicons name="checkmark-sharp" size={16} color={colors.primary} />}
                     </Pressable>
                   ))}
                </View>
             </View>

             <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text, fontFamily: fontFamilyUI }]}>4. Root Path (for relative links)</Text>
                <TextInput 
                   style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface, fontFamily: fontFamilyUI }]}
                   placeholder="e.g. /Users/name/docs"
                   placeholderTextColor={colors.textMuted}
                   value={tempRootPath}
                   onChangeText={setTempRootPath}
                />
             </View>
          </ScrollView>

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
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
  },
  helpText: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  authRow: {
    marginTop: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 10,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
  },
  logoutBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoutText: {
    fontSize: 12,
  },
  modelList: {
    gap: 8,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  modelLabel: {
    fontSize: 13,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});
