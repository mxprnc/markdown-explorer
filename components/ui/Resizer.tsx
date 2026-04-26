import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ResizerProps {
  type: 'vertical' | 'horizontal';
  isResizing: boolean;
  responder: any;
  style?: any;
}

export const Resizer = ({ type, isResizing, responder, style }: ResizerProps) => {
  const { colors } = useTheme();

  const isVertical = type === 'vertical';

  return (
    <View
      {...responder.panHandlers}
      style={[
        isVertical ? styles.vertical : styles.horizontal,
        {
          backgroundColor: isResizing ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
        },
        style
      ]}
    >
      <View
        style={[
          isVertical ? styles.verticalLine : styles.horizontalLine,
          {
            backgroundColor: isResizing ? colors.primary : colors.border,
            opacity: isResizing ? 1 : 0.3,
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  vertical: {
    width: 10,
    height: '100%',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'col-resize' as any }
    })
  },
  horizontal: {
    height: 10,
    width: '100%',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'ns-resize' as any }
    })
  },
  verticalLine: {
    width: 1,
    height: '100%',
  },
  horizontalLine: {
    height: 1,
    width: '100%',
  }
});
