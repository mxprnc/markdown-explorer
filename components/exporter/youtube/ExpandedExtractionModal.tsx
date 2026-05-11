import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Pressable, Clipboard } from 'react-native';
import { useAppSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ExportMode, ExportFormat, ExportListType, PlaylistItem, serializePlaylistToMarkdown, formatYoutubeLink } from '../../../utils/PlaylistParserUtils';
import { fetchPlaylistItems, extractPlaylistId, fetchPlaylistMetadata } from '@/utils/YoutubeUtils';
import MarkdownPreview from '../../preview/MarkdownPreview';

interface ExpandedExtractionModalProps {
  visible: boolean;
  onClose: () => void;
  targetDirectory?: string; // If provided via Context Menu, it locks into D-1 auto-creation mode
  onExtract: (url: string, mode: ExportMode, format: ExportFormat, listType: ExportListType, targetDirectory?: string, editedItems?: PlaylistItem[], editedTitle?: string) => void;
}

export const ExpandedExtractionModal: React.FC<ExpandedExtractionModalProps> = ({ 
  visible, onClose, targetDirectory, onExtract 
}) => {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<ExportMode>(targetDirectory ? 'D-1' : 'D-2');
  const [format, setFormat] = useState<ExportFormat>('URL');
  const [listType, setListType] = useState<ExportListType>('Plain');
  const [itemLimit, setItemLimit] = useState('20');
  const [isLoading, setIsLoading] = useState(false);
  const settings = useAppSettings();
  const { colors, isDark, fontFamilyUI, fontFamilyCode } = useTheme();
  const youtubeKey = settings.apiKeys?.youtube || "";
  const [previewData, setPreviewData] = useState<PlaylistItem[] | null>(null);
  const [editableData, setEditableData] = useState<PlaylistItem[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playlistTitle, setPlaylistTitle] = useState<string>("Youtube_Playlist");
  const [metadata, setMetadata] = useState<any>(null);
  const [previewTab, setPreviewTab] = useState<'markdown' | 'preview'>('preview');
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (previewData) {
      setEditableData(previewData);
    }
  }, [previewData]);

  const handleCopyItem = (item: PlaylistItem) => {
    const text = formatYoutubeLink(item, format);
    Clipboard.setString(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const updateItemTitle = (id: string, newTitle: string) => {
    if (!editableData) return;
    setEditableData(editableData.map(item => 
      item.id === id ? { ...item, title: newTitle } : item
    ));
  };

  useEffect(() => {
    if (visible) {
      if (targetDirectory) {
        setMode('D-1');
      }
    }
  }, [visible, targetDirectory]);

  // Automatic Incremental Looping Fetch
  useEffect(() => {
    if (!url) {
      setPreviewData(null);
      setNextPageToken(undefined);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true); // Set loading immediately to show feedback during debounce
    let isMounted = true;
    const batchSizeNum = parseInt(itemLimit) || 20;

    const fetchAllBatches = async () => {
      setIsLoading(true);
      setPreviewData([]); // Reset for new URL
      
      try {
        const playlistId = extractPlaylistId(url);
        
        if (playlistId) {
          // 1. Get metadata first
          const meta = await fetchPlaylistMetadata(playlistId, youtubeKey);
          if (isMounted && meta) {
            setPlaylistTitle(meta.title);
            setMetadata(meta);
          }

          // 2. Loop until no more pages
          let currentToken: string | undefined = undefined;
          let hasMore = true;

          while (hasMore && isMounted) {
            const response = await fetchPlaylistItems(playlistId, batchSizeNum, false, youtubeKey, currentToken);
            
            if (response.items.length > 0) {
              const newItems = response.items.map(item => ({
                id: item.videoId,
                title: item.title,
                url: item.url,
                note: ''
              }));
              
              // Append to existing data
              setPreviewData(prev => [...(prev || []), ...newItems]);
              
              currentToken = response.nextPageToken;
              setNextPageToken(currentToken);
              
              if (!currentToken) {
                hasMore = false;
              }
            } else {
              hasMore = false;
            }
            
            // Small safety break to allow UI to breathe
            if (hasMore) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch playlist batches', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchAllBatches();
    }, 800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [url, itemLimit]);

  const handleExtract = () => {
    onExtract(url, mode, format, listType, targetDirectory, editableData || [], playlistTitle);
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
        <View 
          testID="expanded-youtube-modal"
          style={[styles.modalContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
        >
          
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="logo-youtube" size={24} color="#ef4444" style={{ marginRight: 8 }} />
              <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fontFamilyUI }]}>Extract Youtube Playlist</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* 50:50 Layout Content */}
          <View style={styles.contentLayout}>
            
            {/* Left Panel: Settings */}
            <View style={[styles.leftPanel, { borderRightColor: colors.border, borderRightWidth: 1 }]}>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 10 }}>
                {targetDirectory && (
                  <View style={styles.infoBanner}>
                    <Ionicons name="information-circle" size={16} color="#8b5cf6" style={{ marginRight: 6 }} />
                    <Text style={styles.infoText}>Auto-saving to: {targetDirectory}</Text>
                  </View>
                )}

                <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>EXTRACTION MODE</Text>
                <View style={[styles.modeToggleGroup, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                  <TouchableOpacity 
                    testID="mode-toggle-D-1"
                    style={[styles.modeToggle, mode === 'D-1' && { backgroundColor: colors.primary }]}
                    onPress={() => !targetDirectory && setMode('D-1')}
                    disabled={!!targetDirectory} // Lock D-1 if context menu driven
                  >
                    <Text style={[styles.modeToggleText, { color: mode === 'D-1' ? '#FFF' : colors.textMuted }]}>D-1 (Dedicated Note)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    testID="mode-toggle-D-2"
                    style={[styles.modeToggle, mode === 'D-2' && { backgroundColor: colors.primary }, !!targetDirectory && { opacity: 0.3 }]}
                    onPress={() => !targetDirectory && setMode('D-2')}
                    disabled={!!targetDirectory}
                  >
                    <Text style={[styles.modeToggleText, { color: mode === 'D-2' ? '#FFF' : colors.textMuted }]}>D-2 (Inline Mix)</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>LINK FORMAT</Text>
                <View style={[styles.modeToggleGroup, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                  {['Text', 'URL', 'Card', 'Video'].map((fmt) => (
                    <TouchableOpacity 
                      key={fmt}
                      style={[styles.modeToggle, format === fmt && { backgroundColor: colors.primary }]}
                      onPress={() => setFormat(fmt as ExportFormat)}
                    >
                      <Text style={[styles.modeToggleText, { color: format === fmt ? '#FFF' : colors.textMuted }]}>{fmt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>LIST TYPE</Text>
                <View style={[styles.modeToggleGroup, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                  {(['Numbered', 'Bulleted', 'Plain'] as const).map((type) => (
                    <TouchableOpacity 
                      key={type}
                      testID={`list-type-${type}`}
                      style={[styles.modeToggle, listType === type && { backgroundColor: colors.primary }]}
                      onPress={() => setListType(type)}
                    >
                      <Text style={[styles.modeToggleText, { color: listType === type ? '#FFF' : colors.textMuted }]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>BATCH SIZE (MAX 50)</Text>
                <TextInput 
                  testID="item-limit-input"
                  style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderColor: colors.border, color: colors.text, fontFamily: fontFamilyCode, marginBottom: 20 }]} 
                  placeholder="20" 
                  placeholderTextColor={colors.textMuted}
                  value={itemLimit}
                  onChangeText={setItemLimit}
                  keyboardType="numeric"
                />

                <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>PLAYLIST URL</Text>
                <TextInput 
                  testID="playlist-url-input"
                  style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderColor: colors.border, color: colors.text, fontFamily: fontFamilyCode }]} 
                  placeholder="https://youtube.com/playlist?list=..." 
                  placeholderTextColor={colors.textMuted}
                  value={url}
                  onChangeText={setUrl}
                />

                {/* API Key Status */}
                <View style={[styles.apiKeyStatus, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border, borderWidth: 1, marginTop: 20 }]}>
                  <Ionicons name="key-outline" size={16} color={youtubeKey ? colors.primary : colors.textMuted} style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.apiKeyLabel, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>YOUTUBE DATA API</Text>
                    {youtubeKey ? (
                      <Text style={[styles.apiKeyText, { color: colors.text, fontFamily: fontFamilyCode }]} numberOfLines={1}>
                        {youtubeKey.substring(0, 5)}*****{youtubeKey.substring(youtubeKey.length - 3)}
                      </Text>
                    ) : (
                      <Pressable onPress={() => { onClose(); setSettingsVisible(true); setActiveTab('api'); }}>
                        <Text style={[styles.apiKeyLink, { color: colors.primary, fontFamily: fontFamilyUI }]}>Key not set. Configure in Settings →</Text>
                      </Pressable>
                    )}
                  </View>
                  {youtubeKey && (
                    <View style={[styles.statusBadge, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)' }]}>
                      <View style={[styles.statusDot, { backgroundColor: '#22c55e' }]} />
                      <Text style={[styles.statusText, { color: '#22c55e', fontFamily: fontFamilyUI }]}>Active</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
              
              <TouchableOpacity 
                testID="youtube-extract-submit"
                style={[styles.extractButton, { backgroundColor: colors.primary, marginTop: 10 }, (!url || isLoading) && { opacity: 0.5 }]} 
                onPress={handleExtract} 
                disabled={!url || isLoading}
              >
                <Text style={[styles.extractButtonText, { fontFamily: fontFamilyUI }]}>Extract & {targetDirectory ? 'Create File' : 'Insert'}</Text>
              </TouchableOpacity>
            </View>

            {/* Right Panel: Live Preview */}
            <View style={[styles.rightPanel, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]}>
              <View style={[styles.previewHeader, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                <Text style={[styles.previewTitle, { color: colors.text, fontFamily: fontFamilyUI }]}>Live Preview {previewData ? `(${previewData.length}${metadata?.itemCount ? ` / ${metadata.itemCount}` : ''})` : ''}</Text>
                <View style={styles.tabGroup}>
                  <TouchableOpacity testID="tab-markdown" onPress={() => setPreviewTab('markdown')}>
                    <Text style={[styles.tabText, { color: previewTab === 'markdown' ? colors.primary : colors.textMuted, fontWeight: previewTab === 'markdown' ? '700' : '400' }]}>Markdown</Text>
                  </TouchableOpacity>
                  <TouchableOpacity testID="tab-preview" onPress={() => setPreviewTab('preview')}>
                    <Text style={[styles.tabText, { color: previewTab === 'preview' ? colors.primary : colors.textMuted, fontWeight: previewTab === 'preview' ? '700' : '400' }]}>Preview</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.previewContainer}>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textMuted, marginTop: 12, fontFamily: fontFamilyUI }]}>Fetching Playlist Data...</Text>
                  </View>
                ) : (!previewData || previewData.length === 0) ? (
                  <View style={styles.emptyPreview}>
                    <Ionicons name="link-outline" size={48} color={colors.textMuted} />
                    <Text style={[styles.emptyPreviewText, { color: colors.textMuted, fontFamily: fontFamilyUI }]}>Enter URL to see preview</Text>
                  </View>
                ) : (
                  <View style={{ flex: 1 }}>
                    {previewTab === 'markdown' ? (
                      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
                        <Text style={[styles.markdownText, { color: colors.text, fontFamily: fontFamilyCode }]}>
                          {serializePlaylistToMarkdown(editableData || [], mode, format, listType)}
                        </Text>
                      </ScrollView>
                    ) : (
                      <View style={[styles.visualPreview, { backgroundColor: isDark ? '#18181b' : '#f9fafb' }]}>
                        <MarkdownPreview content={serializePlaylistToMarkdown(editableData || [], mode, format, listType)} isDark={isDark} />
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

          </View>
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '90%',
    height: '85%',
    maxWidth: 1200,
    maxHeight: 900,
    backgroundColor: '#18181b', // Zine 900
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
    padding: 32,
    borderRightWidth: 1,
    borderRightColor: '#27272a',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    color: '#8b5cf6',
    fontSize: 13,
    fontWeight: '500',
  },
  label: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#27272a',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  modeToggle: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeToggleActive: {
    backgroundColor: '#6366f1',
  },
  modeToggleText: {
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '600',
  },
  modeToggleTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#27272a',
    color: '#fff',
    padding: 14,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#3f3f46',
    marginBottom: 32,
  },
  extractButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  extractButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rightPanel: {
    flex: 1,
    backgroundColor: 'rgba(39, 39, 42, 0.2)',
    padding: 32,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    color: '#f4f4f5',
    fontSize: 14,
    fontWeight: '600',
  },
  tabGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  tabText: {
    color: '#a1a1aa',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
  previewContent: {
    flex: 1,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    padding: 16,
  },
  skeletonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonText: {
    color: '#a1a1aa',
    marginTop: 12,
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#71717a',
    marginTop: 12,
    fontSize: 13,
  },
  markdownText: {
    color: '#d4d4d8',
    fontFamily: 'Courier',
    fontSize: 13,
    lineHeight: 20,
  },
  visualPreview: {
    padding: 10,
    backgroundColor: '#18181b',
    borderRadius: 8,
  },
  apiKeyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  apiKeyLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  apiKeyText: {
    fontSize: 12,
  },
  apiKeyLink: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  interactiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  editInput: {
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
    marginBottom: 4,
  },
  itemUrl: {
    fontSize: 11,
    opacity: 0.7,
  },
  copyButton: {
    padding: 8,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});
