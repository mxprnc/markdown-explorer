import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, onPress, variant = 'primary', size = 'md', style, textStyle, disabled 
}) => {
  const { colors, fontFamilyUI } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary': return { backgroundColor: colors.primary };
      case 'secondary': return { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border };
      case 'outline': return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary };
      case 'danger': return { backgroundColor: '#EF4444' };
      default: return {};
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm': return { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 };
      case 'md': return { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 };
      case 'lg': return { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 };
      default: return {};
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') return colors.primary;
    if (variant === 'secondary') return colors.text;
    return '#FFFFFF';
  };

  return (
    <Pressable 
      onPress={onPress} 
      disabled={disabled}
      style={[
        styles.base, 
        getVariantStyle(), 
        getSizeStyle(), 
        disabled && { opacity: 0.5 },
        style
      ]}
    >
      <Text style={[
        styles.text, 
        { color: getTextColor(), fontFamily: fontFamilyUI, fontSize: size === 'sm' ? 12 : 14 },
        textStyle
      ]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
