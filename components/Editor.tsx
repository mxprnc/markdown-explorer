import React from 'react';
import { TextInput } from 'react-native';

export default function Editor({ value, onChange, onSave, onPasteImage, onRenameImage, resolveImage, isDark }: { value: string, onChange: (v: string) => void, onSave?: (v: string) => void, onPasteImage?: (file: any) => Promise<string>, onRenameImage?: (oldSrc: string, newName: string) => Promise<string>, resolveImage?: (src: string) => Promise<string>, isDark: boolean }) {
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
