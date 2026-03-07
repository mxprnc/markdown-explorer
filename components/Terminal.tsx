import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Terminal({ isDark }: { isDark: boolean }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>➜  markdown-explorer ✗ Native Terminal Placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  text: {
    color: '#A7F3D0',
    fontFamily: 'monospace',
    fontSize: 12,
  }
});
