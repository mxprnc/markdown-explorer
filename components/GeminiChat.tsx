import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";

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
}

export default function GeminiChat({ isDark, apiKey, accessToken, currentContent, onOpenSettings }: GeminiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const colors = {
    background: isDark ? '#1E1E1E' : '#F9FAFB',
    text: isDark ? '#F3F4F6' : '#121212',
    border: isDark ? '#374151' : '#E5E7EB',
    primary: '#3B82F6',
    textMuted: isDark ? '#9CA3AF' : '#6B7280',
    userBubble: isDark ? '#2D3748' : '#EFF6FF',
    modelBubble: isDark ? '#1A202C' : '#FFFFFF',
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const hasAuth = apiKey || accessToken;
    if (!hasAuth) {
      setMessages(prev => [...prev, { role: 'model', content: "⚠️ 인증 정보가 없습니다 (API Key 또는 Google 로그인 필요). 설정을 클릭하여 정보를 입력해주세요." }]);
      return;
    }

    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
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
        // OAuth Access Token 방식 (REST API 직접 호출)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`, {
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
        // API Key 방식 (SDK 활용)
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        text = response.text();
      }

      setMessages(prev => [...prev, { role: 'model', content: text }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "❌ 오류가 발생했습니다: " + (error.message || "알 수 없는 오류") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
       <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: isDark ? '#121212' : '#F3F4F6' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="sparkles" size={14} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.title, { color: colors.text }]}>Gemini AI Assistant</Text>
          </View>
          <Pressable onPress={onOpenSettings} style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={14} color={colors.text} />
            <Text style={[styles.settingsBtnText, { color: colors.text }]}>설정</Text>
          </Pressable>
       </View>
       
       <ScrollView 
         ref={scrollViewRef}
         style={styles.chatArea}
         onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
       >
         {messages.length === 0 && (
           <View style={styles.emptyState}>
             <Ionicons name="chatbubble-ellipses-outline" size={32} color={isDark ? '#4B5563' : '#9CA3AF'} />
             <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280'}]}>
               Gemini에게 질문해보세요! 현재 문서의 내용을 파악하고 답변해드립니다.
             </Text>
           </View>
         )}
         {messages.map((msg, i) => (
           <View key={i} style={[
             styles.messageBubble, 
             msg.role === 'user' ? styles.userBubble : styles.modelBubble,
             { 
               backgroundColor: msg.role === 'user' ? colors.userBubble : colors.modelBubble, 
               borderColor: colors.border,
               alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
             }
           ]}>
             <Text style={[styles.roleLabel, { color: colors.primary }]}>
               {msg.role === 'user' ? '나' : 'Gemini'}
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

       <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: isDark ? '#121212' : '#FFFFFF' }]}>
         <TextInput
           style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}
           placeholder="Gemini에게 메시지 보내기..."
           placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
           value={inputText}
           onChangeText={setInputText}
           onSubmitEditing={handleSend}
         />
         <Pressable onPress={handleSend} style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}>
           <Ionicons name="send" size={16} color="#FFF" />
         </Pressable>
       </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    height: 36, 
    paddingHorizontal: 12, 
    borderBottomWidth: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  title: { fontSize: 11, fontWeight: 'bold', fontFamily: 'Inter, sans-serif' },
  settingsBtn: { flexDirection: 'row', alignItems: 'center', padding: 4 },
  settingsBtnText: { fontSize: 10, marginLeft: 4, fontWeight: '600' },
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
  userBubble: { borderBottomRightRadius: 2 },
  modelBubble: { borderBottomLeftRadius: 2 },
  roleLabel: { fontSize: 9, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase' },
  messageText: { fontSize: 12, lineHeight: 18, fontFamily: 'Inter, sans-serif' },
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
    fontFamily: 'Inter, sans-serif'
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
