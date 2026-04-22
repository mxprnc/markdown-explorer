import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { NextraExportWizard } from './NextraExportWizard';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { App } from '@/core/App';
import { ExportNode } from '@/core/exporter/nextra/types';

interface NextraExportModalProps {
  visible: boolean;
  onClose: () => void;
  app: App;
  targetNode: ExportNode | null;
}

export const NextraExportModal = ({ visible, onClose, app, targetNode }: NextraExportModalProps) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <NextraExportWizard app={app} targetNode={targetNode} onComplete={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    height: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  }
});
