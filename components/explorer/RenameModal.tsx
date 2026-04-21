import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';

interface RenameModalProps {
  visible: boolean;
  name: string;
  onChangeName: (name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RenameModal({ visible, name, onChangeName, onConfirm, onCancel }: RenameModalProps) {
  const { colors, isDark, fontFamilyUI } = useTheme();
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={[styles.modal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fontFamilyUI }]}>Rename</Text>
        <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>Enter new name:</Text>
        <div style={{ marginBottom: 24 }}>
          <input 
            autoFocus
            data-testid="rename-input"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            onKeyDown={(e: any) => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === 'Enter') onConfirm();
              if (e.key === 'Escape') onCancel();
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: `1px solid ${colors.border}`,
              backgroundColor: isDark ? '#1a1a1a' : '#fff',
              color: isDark ? '#fff' : '#000',
              fontSize: '14px',
              outline: 'none',
              fontFamily: fontFamilyUI
            }}
          />
        </div>
        <View style={styles.footer}>
          <Button 
            label="Cancel"
            onPress={onCancel}
            variant="secondary"
            testID="rename-cancel-btn"
          />
          <Button 
            label="Confirm"
            onPress={onConfirm}
            variant="primary"
            testID="rename-confirm-btn"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  modal: {
    padding: 24,
    borderRadius: 12,
    width: 400,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontWeight: 'bold',
  },
  confirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  confirmText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
