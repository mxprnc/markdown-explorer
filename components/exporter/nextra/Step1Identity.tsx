import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useWizardStore } from '@/core/exporter/nextra/WizardStore';

export const Step1Identity = () => {
  const { config, updateConfig } = useWizardStore();

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.title}>Step 1: Project Identity</ThemedText>
      
      <View style={styles.field}>
        <ThemedText style={styles.label}>Site Title</ThemedText>
        <TextInput 
          style={styles.input}
          value={config.projectInfo.title}
          onChangeText={(text) => updateConfig(prev => ({
            ...prev,
            projectInfo: { ...prev.projectInfo, title: text }
          }))}
          placeholder="My Awesome Docs"
          placeholderTextColor="#999"
          testID="input-site-title"
        />
      </View>

      <View style={styles.field}>
        <ThemedText style={styles.label}>GitHub Repository URL</ThemedText>
        <TextInput 
          style={styles.input}
          value={config.projectInfo.github}
          onChangeText={(text) => updateConfig(prev => ({
            ...prev,
            projectInfo: { ...prev.projectInfo, github: text }
          }))}
          placeholder="https://github.com/user/repo"
          placeholderTextColor="#999"
          testID="input-github-url"
        />
      </View>

      <View style={styles.field}>
        <ThemedText style={styles.label}>Footer Text</ThemedText>
        <TextInput 
          style={styles.input}
          value={config.projectInfo.footer}
          onChangeText={(text) => updateConfig(prev => ({
            ...prev,
            projectInfo: { ...prev.projectInfo, footer: text }
          }))}
          placeholder="Built with Mark Explorer"
          placeholderTextColor="#999"
          testID="input-footer-text"
        />
      </View>
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
  field: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: '#000', // Note: Should handle theme colors properly later
    backgroundColor: '#fff',
  }
});
