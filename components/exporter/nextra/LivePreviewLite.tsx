import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useWizardStore, THEME_PRESETS } from '@/core/exporter/nextra/WizardStore';

export const LivePreviewLite = () => {
  const { config } = useWizardStore();
  
  // Get colors from custom or preset
  let h, s, l;
  if (config.theme.useCustom) {
    ({ h, s, l } = config.theme.customColor);
  } else {
    const preset = (THEME_PRESETS as any)[config.theme.preset] || THEME_PRESETS.ocean;
    ({ h, s, l } = preset);
  }
  
  const isDarkPreset = config.theme.preset === 'nextjs';
  const primaryColor = `hsl(${h}, ${s}%, ${l || 50}%)`;
  const bgColor = isDarkPreset ? '#111' : '#fff';
  const textColor = isDarkPreset ? '#eee' : '#000';
  const borderColor = isDarkPreset ? '#333' : '#eee';
  const sidebarItemBg = isDarkPreset ? '#222' : '#fff';

  return (
    <View style={styles.container}>
      <ThemedText style={styles.previewTitle}>Live Preview</ThemedText>
      
      <View style={[styles.browserFrame, { backgroundColor: bgColor, borderColor }]}>
        <View style={[styles.navbar, { backgroundColor: bgColor, borderBottomColor: borderColor }]}>
          <View style={[styles.logo, { backgroundColor: primaryColor }]} />
          <ThemedText style={[styles.siteName, { color: textColor }]}>{config.projectInfo.title || 'My Site'}</ThemedText>
        </View>
        
        <View style={styles.mainBody}>
          <View style={[styles.sidebar, { borderRightColor: borderColor }]}>
            <View style={[styles.sidebarItem, { borderLeftColor: primaryColor, borderLeftWidth: 2, backgroundColor: sidebarItemBg }]}>
              <ThemedText style={[styles.sidebarText, { color: primaryColor }]}>Introduction</ThemedText>
            </View>
            <View style={styles.sidebarItem}>
              <ThemedText style={[styles.sidebarText, { color: isDarkPreset ? '#888' : '#444' }]}>Installation</ThemedText>
            </View>
            <View style={styles.sidebarItem}>
              <ThemedText style={[styles.sidebarText, { color: isDarkPreset ? '#888' : '#444' }]}>Getting Started</ThemedText>
            </View>
          </View>
          
          <View style={styles.content}>
            <ThemedText style={[styles.h1, { color: textColor }]}>Hello World</ThemedText>
            <View style={[styles.paragraph, { backgroundColor: isDarkPreset ? '#222' : '#f0f0f0' }]} />
            <View style={[styles.paragraph, { backgroundColor: isDarkPreset ? '#222' : '#f0f0f0' }]} />
            <View style={[styles.button, { backgroundColor: primaryColor }]} />
            
            <View style={styles.spacer} />
            <View style={[styles.previewFooter, { borderTopColor: borderColor }]}>
              <ThemedText style={[styles.footerText, { color: isDarkPreset ? '#555' : '#888' }]}>
                {config.projectInfo.footer}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
      
      <ThemedText style={styles.colorInfo}>
        Color: H:${h} S:${s}% L:${l}%
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    opacity: 0.5,
  },
  browserFrame: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    minHeight: 300,
  },
  navbar: {
    height: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  logo: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  siteName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  mainBody: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 80,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    padding: 10,
  },
  sidebarItem: {
    marginBottom: 8,
    paddingLeft: 4,
  },
  sidebarText: {
    fontSize: 10,
    color: '#444',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  h1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  paragraph: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 8,
    width: '90%',
  },
  button: {
    width: 40,
    height: 16,
    borderRadius: 4,
    marginTop: 10,
  },
  spacer: {
    flex: 1,
  },
  previewFooter: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 9,
    textAlign: 'center',
  },
  colorInfo: {
    marginTop: 10,
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'monospace',
    opacity: 0.4,
  }
});
