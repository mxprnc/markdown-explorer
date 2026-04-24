import React from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface MobileToolbarProps {
  onAction: (action: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function MobileToolbar({ onAction, canUndo, canRedo }: MobileToolbarProps) {
  const { colors, isDark } = useTheme();

  const actions = [
    { id: 'undo', icon: 'arrow-undo-outline', disabled: !canUndo },
    { id: 'redo', icon: 'arrow-redo-outline', disabled: !canRedo },
    { id: 'bold', label: 'B', style: { fontWeight: 'bold' } },
    { id: 'italic', label: 'I', style: { fontStyle: 'italic' } },
    { id: 'h1', label: 'H1' },
    { id: 'h2', label: 'H2' },
    { id: 'list', icon: 'list-outline' },
    { id: 'checkbox', icon: 'checkbox-outline' },
    { id: 'quote', icon: 'chatbox-outline' },
    { id: 'link', icon: 'link-outline' },
    { id: 'code', icon: 'code-slash-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            onPress={() => onAction(action.id)}
            disabled={action.disabled}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: pressed ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent' },
              action.disabled && { opacity: 0.3 }
            ]}
          >
            {action.icon ? (
              <Ionicons name={action.icon as any} size={20} color={colors.text} />
            ) : (
              <Text style={[styles.label, { color: colors.text }, action.style]}>{action.label}</Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    borderTopWidth: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  btn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    borderRadius: 6,
  },
  label: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  }
});
