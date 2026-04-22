import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useWizardStore } from '@/core/exporter/nextra/WizardStore';
import { DepthGuard } from '@/core/exporter/nextra/DepthGuard';

import { ExportNode } from '@/core/exporter/nextra/types';

interface Step3OptionsProps {
  targetNode: ExportNode | null;
}

export const Step3Options = ({ targetNode }: Step3OptionsProps) => {
  const { config, updateConfig } = useWizardStore();

  const maxDepth = targetNode ? DepthGuard.calculateMaxDepth(targetNode) : 0;
  const showWarning = maxDepth >= DepthGuard.MAX_DEPTH;

  const toggleOption = (key: keyof typeof config.exportOptions) => {
    updateConfig(prev => ({
      ...prev,
      exportOptions: {
        ...prev.exportOptions,
        [key]: !prev.exportOptions[key]
      }
    }));
  };

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.title}>Step 3: Export Options</ThemedText>
      
      <TouchableOpacity 
        style={styles.optionRow}
        onPress={() => toggleOption('convertToMdx')}
        testID="option-convert-mdx"
      >
        <View style={[styles.checkbox, config.exportOptions.convertToMdx && styles.checkboxChecked]} />
        <View style={styles.optionText}>
          <ThemedText style={styles.optionTitle}>Convert .md to .mdx</ThemedText>
          <ThemedText style={styles.optionDesc}>Recommended for full Nextra component support.</ThemedText>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionRow}
        onPress={() => toggleOption('includeAssets')}
        testID="option-include-assets"
      >
        <View style={[styles.checkbox, config.exportOptions.includeAssets && styles.checkboxChecked]} />
        <View style={styles.optionText}>
          <ThemedText style={styles.optionTitle}>Include Images & Assets</ThemedText>
          <ThemedText style={styles.optionDesc}>Automatically re-locate and link local images.</ThemedText>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />
      
      {showWarning ? (
        <View style={styles.warningBox} testID="depth-warning-box">
          <ThemedText style={styles.warningTitle}>⚠️ Notice</ThemedText>
          <ThemedText style={styles.warningDesc}>
            {DepthGuard.getWarningMessage()}
          </ThemedText>
        </View>
      ) : (
        <View style={styles.infoBox} testID="depth-info-box">
          <ThemedText style={styles.infoTitle}>✅ Structure Verified</ThemedText>
          <ThemedText style={styles.infoDesc}>
            The folder structure is compatible with Nextra's sidebar navigation.
          </ThemedText>
        </View>
      )}

      <ThemedText style={styles.summaryNote}>
        Ready to generate your Nextra project as a ZIP file.
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  title: {
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    padding: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 15,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    opacity: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  warningBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE58F',
  },
  warningTitle: {
    color: '#856404',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  warningDesc: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  infoBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F6FFED',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B7EB8F',
  },
  infoTitle: {
    color: '#389E0D',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoDesc: {
    fontSize: 13,
    color: '#389E0D',
    lineHeight: 18,
  },
  summaryNote: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.5,
  }
});
