import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, TextInput, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { ChatMetadata, ChatSearchResult } from '@/hooks/useChatHistory';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ChatHistoryListProps {
  chatList: ChatMetadata[];
  activeChatId: string | null;
  onSelectChat: (id: string, messageIndex?: number, query?: string) => void;
  onCreateNewChat: () => void;
  onRenameChat: (id: string, newTitle: string) => Promise<boolean>;
  onDeleteChat: (id: string) => Promise<boolean>;
  searchChats?: (query: string) => Promise<ChatSearchResult[]>;
}

// Map provider to specific styles and icons
const getProviderDetails = (provider: string) => {
  switch (provider) {
    case 'openai':
      return {
        icon: 'hardware-chip-outline' as const,
        color: '#E28743', // Orange hue
        label: 'OpenAI'
      };
    case 'claude':
      return {
        icon: 'brain-outline' as const,
        color: '#8A2BE2', // Purple hue
        label: 'Claude'
      };
    case 'gemini':
    default:
      return {
        icon: 'sparkles-outline' as const,
        color: '#10B981', // Emerald hue
        label: 'Gemini'
      };
  }
};

// Calculate elegant relative distance text
const getRelativeTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const distance = formatDistanceToNow(date, { addSuffix: true, locale: ko });
    // Simplify common suffixes to match mock reference style "1주", "오늘", "5분"
    return distance
      .replace('약 ', '')
      .replace(' 전', '')
      .replace('방금', '오늘')
      .replace('분', '분')
      .replace('시간', '시간')
      .replace('일', '일')
      .replace('주', '주')
      .replace('개월', '달');
  } catch (e) {
    return '오늘';
  }
};

export function ChatHistoryList({
  chatList,
  activeChatId,
  onSelectChat,
  onCreateNewChat,
  onRenameChat,
  onDeleteChat,
  searchChats
}: ChatHistoryListProps) {
  const { colors, fontFamilyUI, isDark, fontSizeUI = 13 } = useTheme();
  
  // Inline rename state
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  // Hovered item ID for desktop layout to show action icons dynamically
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeoutRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimeoutRef.current = setTimeout(async () => {
      if (searchChats) {
        try {
          const results = await searchChats(trimmedQuery);
          setSearchResults(results);
        } catch (e) {
          console.error('[ChatHistoryList] Search failed', e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery, searchChats]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const handleStartRename = (chat: ChatMetadata) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = async (id: string) => {
    if (!editTitle.trim()) return;
    const success = await onRenameChat(id, editTitle.trim());
    if (success) {
      setEditingChatId(null);
    }
  };

  const handleDeletePrompt = (chat: ChatMetadata) => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`"${chat.title}" 대화방을 삭제하시겠습니까?\n삭제된 대화는 복구할 수 없습니다.`);
      if (confirmDelete) {
        onDeleteChat(chat.id);
      }
    } else {
      Alert.alert(
        '대화방 삭제',
        `"${chat.title}" 대화방을 삭제하시겠습니까?\n삭제된 대화는 복구할 수 없습니다.`,
        [
          { text: '취소', style: 'cancel' },
          { text: '삭제', style: 'destructive', onPress: () => onDeleteChat(chat.id) }
        ]
      );
    }
  };

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const renderSnippetWithHighlight = (snippet: string, query: string) => {
    if (!query) return <Text style={{ color: colors.textMuted, fontSize: fontSizeUI - 2 }}>{snippet}</Text>;

    const parts = snippet.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
    return (
      <Text numberOfLines={2} style={{ fontSize: fontSizeUI - 2, color: colors.textMuted, lineHeight: fontSizeUI + 3, fontFamily: fontFamilyUI }}>
        {parts.map((part, i) => {
          const isMatch = part.toLowerCase() === query.toLowerCase();
          return (
            <Text
              key={i}
              style={[
                isMatch && {
                  color: colors.primary,
                  fontWeight: 'bold',
                  backgroundColor: colors.primary + '20',
                  paddingHorizontal: 2,
                  borderRadius: 2
                }
              ]}
            >
              {part}
            </Text>
          );
        })}
      </Text>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* List Header */}
      <View style={[styles.header, { height: fontSizeUI + 35, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fontFamilyUI, fontSize: fontSizeUI }]}>
          AI Chats
        </Text>
        <Pressable
          onPress={onCreateNewChat}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
            pressed && { opacity: 0.6 }
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID="sidebar-new-chat-btn"
        >
          <Ionicons name="add" size={fontSizeUI + 5} color={colors.text} />
        </Pressable>
      </View>

      {/* Search Input Bar */}
      <View style={[styles.searchBarContainer, { borderBottomColor: colors.border }]}>
        <Ionicons name="search-outline" size={fontSizeUI + 2} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="대화 내용 검색..."
          placeholderTextColor={colors.textMuted}
          style={[
            styles.searchInput,
            {
              color: colors.text,
              fontFamily: fontFamilyUI,
              fontSize: fontSizeUI - 1.5,
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            }
          ]}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={handleClearSearch} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={fontSizeUI + 2} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* List Items Scroll view */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {searchQuery.trim().length > 0 ? (
          isSearching ? (
            <View style={styles.searchingState}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.searchingText, { color: colors.textMuted, fontFamily: fontFamilyUI, fontSize: fontSizeUI - 1 }]}>
                검색 중...
              </Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={fontSizeUI + 19} color={colors.textMuted} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: fontFamilyUI, fontSize: fontSizeUI - 1 }]}>
                일치하는 대화 내용이 없습니다.
              </Text>
            </View>
          ) : (
            searchResults.map((result, idx) => {
              const prov = getProviderDetails(result.provider);
              const isTitleMatch = result.role === 'title';

              return (
                <Pressable
                  key={`${result.chatId}-${result.messageIndex}-${idx}`}
                  onPress={() => onSelectChat(result.chatId, result.messageIndex === -1 ? undefined : result.messageIndex, searchQuery)}
                  style={({ pressed }) => [
                    styles.searchResultItem,
                    { borderBottomColor: colors.border },
                    pressed && { opacity: 0.7 }
                  ]}
                >
                  <View style={styles.searchResultHeader}>
                    {/* Provider Avatar */}
                    <View style={[styles.avatar, { backgroundColor: prov.color + '18', width: fontSizeUI + 11, height: fontSizeUI + 11, borderRadius: (fontSizeUI + 11) * 0.22, marginRight: 6 }]}>
                      <Ionicons name={prov.icon} size={fontSizeUI - 1} color={prov.color} />
                    </View>
                    <Text numberOfLines={1} style={[styles.searchResultTitle, { color: colors.text, fontFamily: fontFamilyUI, fontSize: fontSizeUI - 1 }]}>
                      {result.chatTitle}
                    </Text>
                    <Text style={[styles.searchResultRole, { 
                      color: isTitleMatch ? colors.primary : result.role === 'user' ? '#3B82F6' : '#10B981', 
                      fontFamily: fontFamilyUI, 
                      fontSize: fontSizeUI - 3.5,
                      backgroundColor: isTitleMatch ? colors.primary + '15' : result.role === 'user' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      borderColor: isTitleMatch ? colors.primary + '30' : result.role === 'user' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      borderWidth: 1,
                      borderRadius: 4,
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                      overflow: 'hidden'
                    }]}>
                      {isTitleMatch ? '제목' : result.role === 'user' ? '사용자' : 'AI'}
                    </Text>
                  </View>

                  {/* snippet rendering with highlight */}
                  <View style={styles.snippetContainer}>
                    {renderSnippetWithHighlight(result.matchedSnippet, searchQuery)}
                  </View>
                </Pressable>
              );
            })
          )
        ) : (
          chatList.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={fontSizeUI + 19} color={colors.textMuted} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: fontFamilyUI, fontSize: fontSizeUI - 1 }]}>
                저장된 대화가 없습니다.
              </Text>
              <Pressable
                onPress={onCreateNewChat}
                style={[styles.emptyAddBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.emptyAddBtnText, { fontFamily: fontFamilyUI, fontSize: fontSizeUI - 1 }]}>
                  새 대화 시작
                </Text>
              </Pressable>
            </View>
          ) : (
            chatList.map(chat => {
              const isActive = chat.id === activeChatId;
              const isEditing = chat.id === editingChatId;
              const prov = getProviderDetails(chat.provider);
              const timeAgo = getRelativeTime(chat.updatedAt);
              const isHovered = chat.id === hoveredChatId;

              return (
                <Pressable
                  key={chat.id}
                  onPress={() => !isEditing && onSelectChat(chat.id)}
                  {...({
                    onMouseEnter: () => setHoveredChatId(chat.id),
                    onMouseLeave: () => setHoveredChatId(null)
                  } as any)}
                  style={[
                    styles.chatItem,
                    isActive && { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' },
                    { borderLeftColor: isActive ? colors.primary : 'transparent', height: fontSizeUI + 35 }
                  ]}
                  testID={`chat-item-${chat.id}`}
                >
                  {/* Provider Icon Avatar */}
                  <View style={[styles.avatar, { backgroundColor: prov.color + '18', width: fontSizeUI + 15, height: fontSizeUI + 15, borderRadius: (fontSizeUI + 15) * 0.22 }]}>
                    <Ionicons name={prov.icon} size={fontSizeUI + 3} color={prov.color} />
                  </View>

                  {/* Info Text Area */}
                  <View style={styles.infoArea}>
                    {isEditing ? (
                      <TextInput
                        value={editTitle}
                        onChangeText={setEditTitle}
                        onBlur={() => handleSaveRename(chat.id)}
                        onSubmitEditing={() => handleSaveRename(chat.id)}
                        autoFocus
                        selectTextOnFocus
                        style={[
                          styles.renameInput,
                          { 
                            color: colors.text, 
                            fontFamily: fontFamilyUI,
                            borderColor: colors.primary,
                            backgroundColor: colors.background,
                            fontSize: fontSizeUI - 1,
                            height: fontSizeUI + 14
                          }
                        ]}
                      />
                    ) : (
                      <View style={styles.titleRow}>
                        <Text 
                          numberOfLines={1} 
                          style={[
                            styles.chatTitle, 
                            { 
                              color: isActive ? colors.text : colors.textMuted,
                              fontFamily: fontFamilyUI,
                              fontWeight: isActive ? '600' : 'normal',
                              fontSize: fontSizeUI - 1
                            }
                          ]}
                        >
                          {chat.title}
                        </Text>
                        <Text style={[styles.timeText, { color: colors.textMuted, fontFamily: fontFamilyUI, fontSize: fontSizeUI - 2.5 }]}>
                          {timeAgo}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Inline Action Buttons on Hover */}
                  {!isEditing && (isHovered || Platform.OS !== 'web') && (
                    <View style={styles.actions}>
                      <Pressable
                        onPress={() => handleStartRename(chat)}
                        style={styles.actionIconBtn}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Ionicons name="pencil-outline" size={fontSizeUI + 1} color={colors.textMuted} />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeletePrompt(chat)}
                        style={styles.actionIconBtn}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Ionicons name="trash-outline" size={fontSizeUI + 1} color="#EF4444" />
                      </Pressable>
                    </View>
                  )}
                </Pressable>
              );
            })
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {})
  },
  scrollContent: {
    paddingVertical: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 48,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyAddBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {})
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    height: 48,
    position: 'relative',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {})
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoArea: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatTitle: {
    fontSize: 12,
    flex: 1,
    marginRight: 6,
  },
  timeText: {
    fontSize: 10.5,
    opacity: 0.8,
  },
  renameInput: {
    fontSize: 12,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    width: '95%',
    height: 26,
  },
  actions: {
    flexDirection: 'row',
    position: 'absolute',
    right: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconBtn: {
    padding: 4,
    marginLeft: 6,
    borderRadius: 4,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {})
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 22,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    paddingLeft: 32,
    paddingRight: 32,
    paddingVertical: 0,
  },
  clearBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  searchingState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 48,
  },
  searchingText: {
    marginTop: 12,
  },
  searchResultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  searchResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  searchResultTitle: {
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  searchResultRole: {
    fontSize: 9.5,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  snippetContainer: {
    marginTop: 2,
  },
});
