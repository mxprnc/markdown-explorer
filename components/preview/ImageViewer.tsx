import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface ImageViewerProps {
  uri: string;
  name: string;
}

export function ImageViewer({ uri, name }: ImageViewerProps) {
  const { colors, isDark, fontFamilyCode, fontFamilyUI } = useTheme();
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: any) => {
    if (Platform.OS !== 'web') return;
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging || Platform.OS !== 'web') return;
    setPos({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0' }}>
      {/* Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => setZoom(prev => Math.max(0.1, prev - 0.2))} style={styles.toolBtn} testID="zoom-out-btn">
          <Ionicons name="remove-circle-outline" size={24} color={colors.primary} />
        </Pressable>
        <Text style={[styles.zoomText, { color: colors.text, fontFamily: fontFamilyUI }]} testID="zoom-percentage">
          {Math.round(zoom * 100)}%
        </Text>
        <Pressable onPress={() => setZoom(prev => Math.min(10, prev + 0.5))} style={styles.toolBtn} testID="zoom-in-btn">
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </Pressable>
        <Pressable onPress={handleReset} style={[styles.toolBtn, { marginLeft: 8 }]} testID="zoom-reset-btn">
          <Ionicons name="refresh-outline" size={20} color={colors.textMuted} />
        </Pressable>
        <Text style={[styles.hint, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>
          {Platform.OS === 'web' ? '(Drag with mouse to move)' : ''}
        </Text>
      </View>

      {/* Image Container */}
      <div 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ 
          flex: 1, 
          overflow: 'hidden', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          cursor: isDragging ? 'grabbing' : (zoom > 1 ? 'grab' : 'default'),
          position: 'relative'
        }}
      >
        <div style={{ 
          backgroundColor: colors.background, 
          padding: 20, 
          borderRadius: 12, 
          boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
          transformOrigin: 'center center'
        }}>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 12, fontFamily: fontFamilyCode }}>{name}</Text>
          <img 
            src={uri} 
            alt={name} 
            draggable="false"
            data-testid="viewer-image"
            style={{ maxWidth: 'none', maxHeight: '80vh', border: `1px solid ${colors.border}`, borderRadius: 4, userSelect: 'none' }} 
          />
        </div>
      </div>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row', 
    padding: 8, 
    borderBottomWidth: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    zIndex: 10
  },
  toolBtn: {
    padding: 4,
  },
  zoomText: {
    fontSize: 13, 
    fontWeight: 'bold', 
    minWidth: 50, 
    textAlign: 'center'
  },
  hint: {
    fontSize: 11, 
    marginLeft: 12
  }
});
