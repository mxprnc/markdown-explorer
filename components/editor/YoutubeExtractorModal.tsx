import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TextInput, Switch, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/Button';
import { extractPlaylistId, fetchPlaylistMetadata, YoutubePlaylistItem, fetchPlaylistItems, ExtractionOptions } from '@/utils/YoutubeUtils';
import { Ionicons } from '@expo/vector-icons';

interface YoutubeExtractorModalProps {
  visible: boolean;
  onConfirm: (items: YoutubePlaylistItem[], mode: string, options: ExtractionOptions & { listType: string }) => void;
  onCancel: () => void;
}

type Mode = 'Text' | 'URL' | 'Card' | 'Video';

export function YoutubeExtractorModal({ visible, onConfirm, onCancel }: YoutubeExtractorModalProps) {
  const { colors, isDark, fontFamilyUI, fontFamilyCode } = useTheme();
  const { apiKeys, setSettingsVisible, setActiveTab } = useAppSettings();
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<Mode>('Text');
  const [listType, setListType] = useState<'Numbered' | 'Bulleted' | 'Plain'>('Numbered');
  const [batchSize, setBatchSize] = useState('20');
  const [showLikes, setShowLikes] = useState(false);
  const [showViews, setShowViews] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<{ title: string; channel: string; count: number } | null>(null);

  const youtubeKey = apiKeys.youtube;

  const maskKey = (key?: string) => {
    if (!key) return '';
    if (key.length <= 8) return '********';
    return `${key.substring(0, 5)}*****${key.substring(key.length - 3)}`;
  };

  useEffect(() => {
    if (visible) {
      setUrl('');
      setMetadata(null);
      setIsLoading(false);
    }
  }, [visible]);

  const handleUrlChange = async (text: string) => {
    setUrl(text);
    const playlistId = extractPlaylistId(text);
    if (playlistId) {
      setIsLoading(true);
      const data = await fetchPlaylistMetadata(playlistId, youtubeKey);
      if (data) {
        setMetadata({
          title: data.title,
          channel: data.channelTitle,
          count: data.itemCount
        });
      }
      setIsLoading(false);
    } else {
      setMetadata(null);
    }
  };

  const handleConfirm = async () => {
    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
      alert('Please enter a valid YouTube Playlist URL');
      return;
    }

    setIsLoading(true);
    const size = Math.min(50, Math.max(1, parseInt(batchSize) || 20));
    const response = await fetchPlaylistItems(playlistId, size, showLikes || showViews, youtubeKey);
    const items = response.items;
    
    if (items.length > 0) {
      onConfirm(items, mode, { showLikes, showViews, batchSize: size, listType });
    } else {
      alert('Failed to fetch playlist items. Please check the URL or API Key.');
    }
    setIsLoading(false);
  };

  if (!visible) return null;

  const modes: Mode[] = ['Text', 'URL', 'Card', 'Video'];

  return (
    <View style={styles.overlay}>
      <View style={[styles.modal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: fontFamilyUI }]}>Extract Youtube Playlist</Text>
          <Ionicons name="logo-youtube" size={24} color="#FF0000" />
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {/* Mode Selection */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>EXTRACTION MODE</Text>
            <View style={[styles.segmentedControl, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
              {modes.map((m) => (
                <Button
                  key={m}
                  label={m}
                  onPress={() => setMode(m)}
                  variant={mode === m ? 'primary' : 'ghost'}
                  style={[styles.modeButton, mode !== m && { opacity: 0.8 }]}
                  textStyle={{ 
                    fontSize: 12, 
                    color: mode === m ? '#FFFFFF' : colors.textMuted 
                  }}
                />
              ))}
            </View>
          </View>

          {/* List Type Selection */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>LIST TYPE</Text>
            <View style={[styles.segmentedControl, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
              {(['Numbered', 'Bulleted', 'Plain'] as const).map((t) => (
                <Button
                  key={t}
                  label={t}
                  onPress={() => setListType(t)}
                  variant={listType === t ? 'primary' : 'ghost'}
                  style={[styles.modeButton, listType !== t && { opacity: 0.8 }]}
                  textStyle={{ 
                    fontSize: 12, 
                    color: listType === t ? '#FFFFFF' : colors.textMuted 
                  }}
                />
              ))}
            </View>
          </View>

          {/* URL Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>PLAYLIST URL</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                borderColor: colors.border, 
                color: colors.text,
                fontFamily: fontFamilyCode
              }]}
              value={url}
              onChangeText={handleUrlChange}
              placeholder="https://www.youtube.com/playlist?list=..."
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
          </View>

          {/* Metadata Preview */}
          {metadata && (
            <View style={[styles.preview, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
              <Text style={[styles.previewTitle, { color: colors.text, fontFamily: fontFamilyUI }]} numberOfLines={1}>
                {metadata.title}
              </Text>
              <Text style={[styles.previewSub, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>
                {metadata.channel} • {metadata.count} videos
              </Text>
            </View>
          )}

          <View style={styles.row}>
            {/* Batch Size */}
            <View style={[styles.section, { flex: 1, marginRight: 12 }]}>
              <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>ITEM LIMIT (MAX 50)</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background, 
                  borderColor: colors.border, 
                  color: colors.text,
                  fontFamily: fontFamilyCode
                }]}
                value={batchSize}
                onChangeText={(text) => setBatchSize(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
              />
            </View>

            {/* Options */}
            <View style={[styles.section, { flex: 1 }]}>
               <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>OPTIONS</Text>
               <View style={styles.optionRow}>
                  <Text style={[styles.optionText, { color: colors.text, fontFamily: fontFamilyUI }]}>Show Likes</Text>
                  <Switch value={showLikes} onValueChange={setShowLikes} trackColor={{ true: colors.primary }} />
               </View>
               <View style={styles.optionRow}>
                  <Text style={[styles.optionText, { color: colors.text, fontFamily: fontFamilyUI }]}>Show Views</Text>
                  <Switch value={showViews} onValueChange={setShowViews} trackColor={{ true: colors.primary }} />
               </View>
            </View>
          </View>

          {/* API Key Status */}
          <View style={[styles.section, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }]}>
            <View style={[styles.apiKeyContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="key-outline" size={14} color={youtubeKey ? colors.primary : colors.textMuted} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textMuted, marginBottom: 2 }]}>YOUTUBE API KEY</Text>
                {youtubeKey ? (
                  <Text style={[styles.apiKeyText, { color: colors.text, fontFamily: 'monospace' }]}>{maskKey(youtubeKey)}</Text>
                ) : (
                  <Pressable onPress={() => { onCancel(); setSettingsVisible(true); setActiveTab('api'); }}>
                    <Text style={[styles.apiKeyLink, { color: colors.primary }]}>API Key not set. Configure in Settings →</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button 
            label="Cancel"
            onPress={onCancel}
            variant="secondary"
          />
          <Button 
            label={isLoading ? "Processing..." : "Extract"}
            onPress={handleConfirm}
            variant="primary"
            disabled={isLoading || !url}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(4px)' } : {}),
  },
  modal: {
    padding: 24,
    borderRadius: 20,
    width: 500,
    maxWidth: '90%',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  body: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 6,
    height: 'auto',
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    outline: 'none',
  },
  row: {
    flexDirection: 'row',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 13,
  },
  preview: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewSub: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
  },
  apiKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  apiKeyText: {
    fontSize: 12,
  },
  apiKeyLink: {
    fontSize: 12,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
