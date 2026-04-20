import React from 'react';
import { View, Text, Modal, Pressable, TextInput, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AVAILABLE_MODELS } from '@/constants/Models';

interface GeminiSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  tempApiKey: string;
  setTempApiKey: (val: string) => void;
  tempClientId: string;
  setTempClientId: (val: string) => void;
  tempModel: string;
  setTempModel: (val: string) => void;
  tempRootPath: string;
  setTempRootPath: (val: string) => void;
  onSave: () => void;
  onLogin: () => void;
  onLogout: () => void;
  hasToken: boolean;
  isDark: boolean;
  colors: any;
}

export function GeminiSettingsModal({
  visible, onClose, tempApiKey, setTempApiKey, tempClientId, setTempClientId,
  tempModel, setTempModel, tempRootPath, setTempRootPath, onSave, onLogin, onLogout,
  hasToken, isDark, colors
}: GeminiSettingsModalProps) {
  
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Settings / Gemini AI</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>
          
          <ScrollView style={styles.modalBody}>
             <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>1. API Key (Direct API)</Text>
                <TextInput 
                   style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                   placeholder="Enter your Gemini API Key..."
                   placeholderTextColor={colors.textMuted}
                   value={tempApiKey}
                   onChangeText={setTempApiKey}
                   secureTextEntry
                />
                <Text style={[styles.helpText, { color: colors.textMuted }]}>
                  개인 API 키를 사용하거나, Google 로그인을 통해 OAuth 토큰을 사용할 수 있습니다.
                </Text>
             </View>

             <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>2. Google OAuth (Google Drive/YouTube)</Text>
                <Text style={[styles.subLabel, { color: colors.textMuted }]}>Web Client ID:</Text>
                <TextInput 
                   style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                   placeholder="Enter Google Web Client ID..."
                   placeholderTextColor={colors.textMuted}
                   value={tempClientId}
                   onChangeText={setTempClientId}
                />
                
                <View style={styles.authRow}>
                   {hasToken ? (
                     <View style={styles.statusRow}>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        <Text style={styles.statusText}>Connected</Text>
                        <Pressable onPress={onLogout} style={styles.logoutBtn}>
                          <Text style={styles.logoutText}>Logout</Text>
                        </Pressable>
                     </View>
                   ) : (
                     <Pressable onPress={onLogin} style={[styles.loginBtn, { backgroundColor: colors.primary }]}>
                        <Ionicons name="logo-google" size={16} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.loginBtnText}>Login with Google</Text>
                     </Pressable>
                   )}
                </View>
             </View>

             <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>3. Default AI Model</Text>
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
                       <Text style={[styles.modelLabel, { color: colors.text }, tempModel === m.value && { color: colors.primary, fontWeight: 'bold' }]}>{m.label}</Text>
                       {tempModel === m.value && <Ionicons name="checkmark-sharp" size={16} color={colors.primary} />}
                     </Pressable>
                   ))}
                </View>
             </View>

             <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>4. Root Path (for relative links)</Text>
                <TextInput 
                   style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                   placeholder="e.g. /Users/name/docs"
                   placeholderTextColor={colors.textMuted}
                   value={tempRootPath}
                   onChangeText={setTempRootPath}
                />
             </View>
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
             <Pressable onPress={onClose} style={styles.cancelBtn}>
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Cancel</Text>
             </Pressable>
             <Pressable onPress={onSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
             </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

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
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 6,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 10,
    borderRadius: 6,
  },
  statusText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  logoutBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
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
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
