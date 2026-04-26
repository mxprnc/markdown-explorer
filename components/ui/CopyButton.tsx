import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { copyToClipboard } from '@/utils/ClipboardUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface CopyButtonProps {
  content: string;
  style?: any;
}

export const CopyButton = ({ content, style }: CopyButtonProps) => {
  const { colors, isDark, fontFamilyUI } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Error is handled in utility, but we could show a toast here
    }
  };

  return (
    <Pressable 
      testID="copy-button"
      onPress={(e) => {

        // Prevent Tiptap or other parent interactions
        if (Platform.OS === 'web') {
          (e as any).stopPropagation();
        }
        handleCopy();
      }}
      style={({ hovered, pressed }: any) => [
        styles.button,
        { 
          backgroundColor: isDark 
            ? (hovered ? 'rgba(124, 58, 237, 0.15)' : 'transparent') 
            : (hovered ? 'rgba(0, 0, 0, 0.04)' : 'transparent'),
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
        },
        pressed && { opacity: 0.7 },
        style
      ]}
    >
      <View style={styles.container}>
        <Ionicons 
          name={copied ? "checkmark" : "copy-outline"} 
          size={14} 
          color={copied ? colors.primary : (isDark ? '#94a3b8' : '#64748b')} 
          style={styles.icon}
        />
        <Text style={[
          styles.text, 
          { 
            color: copied ? colors.primary : (isDark ? '#94a3b8' : '#64748b'),
            fontFamily: fontFamilyUI,
            fontWeight: '600'
          }
        ]}>
          {copied ? 'Copied' : 'Copy'}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    cursor: Platform.OS === 'web' ? 'pointer' : 'auto',
  } as any,

  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
