import React from 'react';
import { TextInput } from 'react-native';

export default function Editor({ value, onChange, onSave, isDark }: { value: string, onChange: (v: string) => void, onSave?: (v: string) => void, isDark: boolean }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      multiline
      style={{
        flex: 1,
        padding: 16,
        color: isDark ? '#D1D5DB' : '#374151',
        fontFamily: 'monospace',
        fontSize: 14,
        lineHeight: 24,
      }}
    />
  );
}
