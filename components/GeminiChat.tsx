import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as Clipboard from 'expo-clipboard';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface GeminiChatProps {
  isDark: boolean;
  apiKey: string;
  accessToken: string | null;
  currentContent: string;
  onOpenSettings: () => void;
  onSaveChatToFile?: (filename: string, content: string) => Promise<boolean>;
  bottomSpacing?: number;
  model: string;
  onModelChange: (model: string) => void;
  models: { label: string, value: string }[];
}

export default function GeminiChat({ isDark, apiKey, accessToken, currentContent, onOpenSettings, onSaveChatToFile, bottomSpacing = 0, model, onModelChange, models }: GeminiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'general' | 'archive'>('general');
  const [archivePath, setArchivePath] = useState('chat-history.md');
  const scrollViewRef = useRef<ScrollView>(null);

  const colors = {
    background: isDark ? '#1E1E1E' : '#F9FAFB',
    text: isDark ? '#F3F4F6' : '#121212',
    border: isDark ? '#374151' : '#E5E7EB',
    primary: '#3B82F6',
    textMuted: isDark ? '#9CA3AF' : '#6B7280',
    userBubble: isDark ? '#2D3748' : '#EFF6FF',
    modelBubble: isDark ? '#1A202C' : '#FFFFFF',
    surface: isDark ? '#121212' : '#FFFFFF',
  };

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
      
      const systemPrompt = `당신은 마크다운 에디터 'Markdown Explorer'의 인공지능 어시스턴트입니다.
현재 사용자가 편집 중인 파일의 내용은 다음과 같습니다:
---
${currentContent || "(비어 있음)"}
---

위 내용을 바탕으로 다음 질문에 답해주세요:
${userMsg}`;

      if (accessToken) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`, {
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
        // Force v1 for better compatibility
        const modelInstance = genAI.getGenerativeModel({ model: model }, { apiVersion: 'v1' });
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
      setMessages(prev => [...prev, { role: 'model', content: "❌ 오류가 발생했습니다: " + (error.message || "알 수 없는 오류") }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMd = async () => {
    if (messages.length === 0) return;
    const md = formatChatAsMarkdown(messages);
    await Clipboard.setStringAsync(md);
    if (Platform.OS === 'web') alert('채팅 내역이 클립보드에 복사되었습니다.');
  };

  const handleKeyPress = (e: any) => {
    const key = e.nativeEvent.key;
    const isModifier = e.nativeEvent.metaKey || e.nativeEvent.ctrlKey;
    
    if (key === 'Enter' && isModifier) {
      handleSend();
    }
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
                <Text style={[styles.actionBtnText, { color: colors.primary }]}>복사(md)</Text>
              </Pressable>
            )}
            <Pressable onPress={onOpenSettings} style={styles.settingsBtn}>
              <Ionicons name="settings-outline" size={14} color={colors.text} />
              <Text style={[styles.settingsBtnText, { color: colors.text }]}>설정</Text>
            </Pressable>
          </View>
       </View>

       {mode === 'archive' && (
         <View style={[styles.archiveHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.archiveLabel, { color: colors.textMuted }]}>archiving:</Text>
            <TextInput 
              style={[styles.archiveInput, { color: colors.text, borderColor: colors.border }]}
              value={archivePath}
              onChangeText={setArchivePath}
              placeholder="파일명.md"
              placeholderTextColor={colors.textMuted}
            />
         </View>
       )}
       
       <ScrollView 
         ref={scrollViewRef}
         style={styles.chatArea}
         onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
       >
         {!hasAuth && (
            <View style={styles.emptyState}>
              <Ionicons name="lock-closed" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                인증이 필요합니다. 설정 버튼을 눌러 API Key 또는 Google 로그인을 완료해주세요.
              </Text>
            </View>
         )}
         {hasAuth && messages.length === 0 && (
           <View style={styles.emptyState}>
             <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.textMuted} />
             <Text style={[styles.emptyText, { color: colors.textMuted}]}>
               Gemini에게 질문해보세요! (Cmd/Ctrl + Enter로 전송)
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
             <Text style={{ marginLeft: 8, fontSize: 11, color: colors.textMuted }}>생각 중...</Text>
           </View>
         )}
       </ScrollView>

       <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
         {/* @ts-ignore - onKeyDown is available on web */}
         <TextInput
           style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}
           placeholder={hasAuth ? "메시지를 입력하세요..." : "인증 후 사용 가능합니다."}
           placeholderTextColor={colors.textMuted}
           value={inputText}
           onChangeText={setInputText}
           editable={hasAuth && !loading}
            onKeyPress={handleKeyPress}
         />
         <Pressable 
           onPress={handleSend} 
           disabled={!inputText.trim() || !hasAuth || loading}
           style={[styles.sendBtn, (!inputText.trim() || !hasAuth || loading) && { opacity: 0.5 }]}
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
  
  archiveHeader: { height: 32, paddingHorizontal: 12, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center' },
  archiveLabel: { fontSize: 10, fontWeight: 'bold', marginRight: 8 },
  archiveInput: { flex: 1, fontSize: 11, padding: 0, height: '100%' },

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
    height: 32, 
    borderWidth: 1, 
    borderRadius: 16, 
    paddingHorizontal: 16, 
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
