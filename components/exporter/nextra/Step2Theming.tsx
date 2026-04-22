import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useWizardStore, THEME_PRESETS } from '@/core/exporter/nextra/WizardStore';

export const Step2Theming = () => {
  const { config, updateConfig } = useWizardStore();

  const handleSelectPreset = (key: string) => {
    const preset = (THEME_PRESETS as any)[key];
    updateConfig(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        preset: key,
        customColor: { h: preset.h, s: preset.s, l: preset.l },
        useCustom: false
      }
    }));
  };

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.title}>Step 2: Design & Theming</ThemedText>
      
      <ThemedText style={styles.sectionLabel}>Choose a Preset</ThemedText>
      <View style={styles.presetGrid}>
        {Object.entries(THEME_PRESETS).map(([key, value]) => (
          <TouchableOpacity 
            key={key} 
            style={[
              styles.presetCard, 
              config.theme.preset === key && !config.theme.useCustom && styles.activeCard
            ]}
            onPress={() => handleSelectPreset(key)}
            testID={`preset-card-${key}`}
          >
            <View style={[styles.swatch, { backgroundColor: `hsl(${value.h}, ${value.s}%, ${value.l || 50}%)` }]} />
            <ThemedText style={styles.presetLabel}>{value.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.advancedSection}>
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => updateConfig(prev => ({ ...prev, theme: { ...prev.theme, useCustom: !prev.theme.useCustom }}))}
          testID="checkbox-use-custom"
        >
          <View style={[styles.checkbox, config.theme.useCustom && styles.checkboxChecked]} />
          <ThemedText>Advanced: Use Custom Colors</ThemedText>
        </TouchableOpacity>
        
        {config.theme.useCustom && (
          <View style={styles.customControls}>
             <View style={styles.sliderRow}>
               <ThemedText style={styles.sliderLabel}>Hue: {config.theme.customColor.h}</ThemedText>
               <input 
                 type="range" min="0" max="360" 
                 value={config.theme.customColor.h} 
                 onChange={(e) => updateConfig(prev => ({ ...prev, theme: { ...prev.theme, customColor: { ...prev.theme.customColor, h: parseInt(e.target.value) }}}))}
                 style={{ flex: 1, cursor: 'pointer' } as any}
               />
             </View>
             
             <View style={styles.sliderRow}>
               <ThemedText style={styles.sliderLabel}>Sat: {config.theme.customColor.s}%</ThemedText>
               <input 
                 type="range" min="0" max="100" 
                 value={config.theme.customColor.s} 
                 onChange={(e) => updateConfig(prev => ({ ...prev, theme: { ...prev.theme, customColor: { ...prev.theme.customColor, s: parseInt(e.target.value) }}}))}
                 style={{ flex: 1, cursor: 'pointer' } as any}
               />
             </View>

             <View style={styles.sliderRow}>
               <ThemedText style={styles.sliderLabel}>Light: {config.theme.customColor.l}%</ThemedText>
               <input 
                 type="range" min="0" max="100" 
                 value={config.theme.customColor.l} 
                 onChange={(e) => updateConfig(prev => ({ ...prev, theme: { ...prev.theme, customColor: { ...prev.theme.customColor, l: parseInt(e.target.value) }}}))}
                 style={{ flex: 1, cursor: 'pointer' } as any}
               />
             </View>
          </View>
        )}
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
  sectionLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 10,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetCard: {
    width: '48%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  activeCard: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  presetLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  advancedSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  customControls: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sliderLabel: {
    width: 80,
    fontSize: 12,
  },
  note: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.6,
  }
});
