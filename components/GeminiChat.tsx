import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { AVAILABLE_MODELS } from '@/constants/Models';

interface GeminiChatProps {
  currentContent: string;
  onSaveChatToFile?: (filename: string, content: string) => Promise<boolean>;
  bottomSpacing?: number;
  fileList?: string[];
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function GeminiChat({ currentContent, onSaveChatToFile, bottomSpacing = 0, fileList = [] }: GeminiChatProps) {
  const { colors, isDark, fontFamilyCode } = useTheme();
  const { 
    geminiApiKey: apiKey, 
    googleAccessToken: accessToken, 
    selectedModel: model, 
    setSelectedModel: onModelChange,
    setShowGeminiSettings
  } = useSettings();
  
  const models = AVAILABLE_MODELS;
  const onOpenSettings = () => setShowGeminiSettings(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'general' | 'archive'>('general');
  const [archivePath, setArchivePath] = useState('chat-history.md');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const hasAuth = !!(apiKey || accessToken);

  const formatChatAsMarkdown = (msgs: Message[]) => {
    return msgs.map(m => `### ${m.role === 'user' ? 'User' : 'Gemini'}\n\n${m.content}`).join('\n\n---\n\n');
  };

  const handleSend = async () => {
    if (!inputText.trim() || !hasAuth || loading) return;

    const userMsg = inputText.trim();
    setInputText('');
    const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(newMessages);
    setLoading(true);

    try {
      let text = "";
      
      const systemPrompt = `You are an AI assistant for 'Mark Explorer', a markdown editor.
The current content of the file the user is editing is as follows:
---
${currentContent || "(empty)"}
---

Based on the content above, please answer the following question:
${userMsg}`;

      // Unified v1beta for 2026 model compatibility (Gemini 2.5, 3.1, etc.)
      const apiVer = 'v1beta';

      if (accessToken) {
        const response = await fetch(`https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        text = data.candidates[0].content.parts[0].text;
      } else {
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelInstance = genAI.getGenerativeModel({ model: model }, { apiVersion: apiVer });
        const result = await modelInstance.generateContent(systemPrompt);
        const response = await result.response;
        text = response.text();
      }

      const finalMessages = [...newMessages, { role: 'model', content: text } as Message];
      setMessages(finalMessages);

      // If in archive mode, automatically save to file
      if (mode === 'archive' && onSaveChatToFile && archivePath) {
        await onSaveChatToFile(archivePath, formatChatAsMarkdown(finalMessages));
      }
    } catch (error: any) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "❌ An error occurred: " + (error.message || "Unknown error") }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMd = async () => {
    if (messages.length === 0) return;
    const md = formatChatAsMarkdown(messages);
    await Clipboard.setStringAsync(md);
    if (Platform.OS === 'web') alert('Chat history copied to clipboard.');
  };

  const handleKeyPress = (e: any) => {
    // For React Native Web multiline TextInput
    const key = e.nativeEvent.key;
    const isModifier = e.nativeEvent.metaKey || e.nativeEvent.ctrlKey;
    
    if (key === 'Enter' && isModifier) {
      // In web, e.preventDefault is available to stop newline insertion
      if (e.preventDefault) e.preventDefault();
      handleSend();
    }
  };
  
  const handleArchiveInputChange = (text: string) => {
    setArchivePath(text);
    if (text.length > 0) {
      const filtered = fileList.filter(f => 
        f.toLowerCase().includes(text.toLowerCase()) && f !== text
      ).slice(0, 5); // Limit to 5 suggestions
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setArchivePath(suggestion);
    setShowSuggestions(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: bottomSpacing }]}>
       <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: isDark ? '#121212' : '#F3F4F6' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="sparkles" size={14} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.title, { color: colors.text }]}>Gemini Assistant</Text>
            
            <View style={[styles.modeToggle, { borderColor: colors.border }]}>
              <Pressable 
                onPress={() => setMode('general')}
                style={[styles.modeBtn, mode === 'general' && { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.modeBtnText, { color: mode === 'general' ? '#FFF' : colors.textMuted }]}>General</Text>
              </Pressable>
              <Pressable 
                onPress={() => setMode('archive')}
                style={[styles.modeBtn, mode === 'archive' && { backgroundColor: '#10B981' }]}
              >
                <Text style={[styles.modeBtnText, { color: mode === 'archive' ? '#FFF' : colors.textMuted }]}>Archive</Text>
              </Pressable>
            </View>

            <View style={{ marginLeft: 12, borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: 12 }}>
              <select
                value={model}
                onChange={(e) => onModelChange(e.target.value)}
                style={{
                  height: 20,
                  paddingHorizontal: 4,
                  borderRadius: 4,
                  fontSize: '9px',
                  fontWeight: 'bold',
                  backgroundColor: isDark ? '#1a1a1a' : '#fff',
                  color: colors.primary,
                  border: `1px solid ${colors.border}`,
                  outline: 'none',
                  cursor: 'pointer'
                } as any}
              >
                {models.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {mode === 'general' && messages.length > 0 && (
              <Pressable onPress={handleCopyMd} style={styles.actionBtn}>
                <Ionicons name="copy-outline" size={14} color={colors.primary} />
                <Text style={[styles.actionBtnText, { color: colors.primary }]}>Copy (MD)</Text>
              </Pressable>
            )}
            <Pressable onPress={onOpenSettings} style={styles.settingsBtn} testID="settings-btn">
              <Ionicons name="settings-outline" size={14} color={colors.text} />
              <Text style={[styles.settingsBtnText, { color: colors.text }]}>Settings</Text>
            </Pressable>
          </View>
       </View>

        {mode === 'archive' && (
          <View style={[styles.archiveHeader, { borderBottomColor: colors.border, overflow: 'visible' }]}>
            <Text style={[styles.archiveLabel, { color: colors.textMuted }]}>archiving:</Text>
            <View style={{ flex: 1, position: 'relative' }}>
              <TextInput 
                style={[styles.archiveInput, { color: colors.text, borderColor: colors.border }]}
                value={archivePath}
                onChangeText={handleArchiveInputChange}
                onFocus={() => {
                  if (archivePath.length > 0) {
                    const filtered = fileList.filter(f => f.toLowerCase().includes(archivePath.toLowerCase()) && f !== archivePath).slice(0, 5);
                    if (filtered.length > 0) {
                      setFilteredSuggestions(filtered);
                      setShowSuggestions(true);
                    }
                  }
                }}
                onBlur={() => {
                  // Small delay to allow Pressable to trigger
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="filename.md"
                placeholderTextColor={colors.textMuted}
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <View style={[styles.suggestionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {filteredSuggestions.map((item, idx) => (
                    <Pressable 
                      key={idx} 
                      onPress={() => handleSelectSuggestion(item)}
                      style={({ hovered }: any) => [
                        styles.suggestionItem,
                        hovered && { backgroundColor: isDark ? '#2D3748' : '#F3F4F6' }
                      ]}
                    >
                      <Ionicons name="document-outline" size={12} color={colors.textMuted} style={{ marginRight: 6 }} />
                      <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={1}>
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
       
       <ScrollView 
         ref={scrollViewRef}
         style={styles.chatArea}
         onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
         testID="chat-message-list"
       >
         {!hasAuth && (
            <View style={styles.emptyState}>
              <Ionicons name="lock-closed" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Authentication required. Please click the Settings button to provide an API Key or log in with Google.
              </Text>
            </View>
         )}
         {hasAuth && messages.length === 0 && (
           <View style={styles.emptyState}>
             <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.textMuted} />
             <Text style={[styles.emptyText, { color: colors.textMuted}]}>
                Ask Gemini anything! (Press Cmd/Ctrl + Enter to send)
             </Text>
           </View>
         )}
         {messages.map((msg, i) => (
           <View key={i} style={[
             styles.messageBubble, 
             msg.role === 'user' ? styles.userBubbleStyle : styles.modelBubbleStyle,
             { 
               backgroundColor: msg.role === 'user' ? colors.userBubble : colors.modelBubble, 
               borderColor: colors.border,
               alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
             }
           ]}>
             <Text style={[styles.roleLabel, { color: colors.primary }]}>
               {msg.role === 'user' ? 'USER' : 'GEMINI'}
             </Text>
             <Text selectable style={[styles.messageText, { color: colors.text }]}>{msg.content}</Text>
           </View>
         ))}
         {loading && (
           <View style={styles.loadingContainer}>
             <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ marginLeft: 8, fontSize: 11, color: colors.textMuted }}>Thinking...</Text>
           </View>
         )}
       </ScrollView>

       <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
         <TextInput
           style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}
            placeholder={hasAuth ? "Type a message..." : "Available after authentication."}
           placeholderTextColor={colors.textMuted}
           value={inputText}
           onChangeText={setInputText}
           editable={hasAuth && !loading}
           multiline={true}
           onKeyPress={handleKeyPress}
           testID="chat-input"
         />
         <Pressable 
           onPress={handleSend} 
           disabled={!inputText.trim() || !hasAuth || loading}
           style={[styles.sendBtn, (!inputText.trim() || !hasAuth || loading) && { opacity: 0.5 }]}
           testID="chat-send-btn"
         >
           <Ionicons name="send" size={16} color="#FFF" />
         </Pressable>
       </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    height: 40, 
    paddingHorizontal: 12, 
    borderBottomWidth: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  title: { fontSize: 11, fontWeight: 'bold', marginRight: 12 },
  modeToggle: { 
    flexDirection: 'row', 
    borderWidth: 1, 
    borderRadius: 6, 
    overflow: 'hidden',
    height: 24
  },
  modeBtn: { paddingHorizontal: 8, justifyContent: 'center' },
  modeBtnText: { fontSize: 9, fontWeight: 'bold' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  actionBtnText: { fontSize: 10, marginLeft: 4, fontWeight: '600' },
  settingsBtn: { flexDirection: 'row', alignItems: 'center', padding: 4 },
  settingsBtnText: { fontSize: 10, marginLeft: 4, fontWeight: '600' },
  
  archiveHeader: { height: 32, paddingHorizontal: 12, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', zIndex: 1000 },
  archiveLabel: { fontSize: 10, fontWeight: 'bold', marginRight: 8 },
  archiveInput: { flex: 1, fontSize: 11, padding: 0, height: '100%', outlineStyle: 'none' } as any,
  suggestionBox: {
    position: 'absolute',
    top: 32,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 2000,
  } as any,
  suggestionItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 11,
  },

  chatArea: { flex: 1, padding: 12 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 10, opacity: 0.6 },
  emptyText: { fontSize: 11, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 },
  messageBubble: { 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 10, 
    maxWidth: '90%', 
    borderWidth: 1,
    position: 'relative'
  },
  userBubbleStyle: { borderBottomRightRadius: 2 },
  modelBubbleStyle: { borderBottomLeftRadius: 2 },
  roleLabel: { fontSize: 9, fontWeight: 'bold', marginBottom: 4, opacity: 0.7 },
  messageText: { fontSize: 12, lineHeight: 18, fontFamily: 'monospace' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginLeft: 4 },
  inputContainer: { padding: 8, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1 },
  input: { 
    flex: 1, 
    minHeight: 32, 
    maxHeight: 100,
    borderWidth: 1, 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 12, 
    marginRight: 8,
  },
  sendBtn: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#3B82F6', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
});
