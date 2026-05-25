import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSettings } from '@/contexts/SettingsContext';
import { AVAILABLE_MODELS, AI_PROVIDERS } from '@/constants/Models';
import Markdown from 'react-native-markdown-display';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageVersion {
  content: string;
  model: string;
  provider: 'gemini' | 'openai' | 'claude';
}

interface Message {
  role: 'user' | 'model';
  content: string;
  feedback?: 'like' | 'dislike' | null;
  versions?: MessageVersion[];
  activeVersionIndex?: number;
}

interface GeminiChatProps {
  currentContent: string;
  onSaveChatToFile?: (filename: string, content: string) => Promise<boolean>;
  bottomSpacing?: number;
  fileList?: string[];
  onClose?: () => void;
  chatMessages?: Message[];
  onSaveActiveChat?: (newMessages: Message[]) => Promise<void>;
  onUpdateMessageFeedback?: (msgIndex: number, feedback: 'like' | 'dislike' | null) => Promise<void>;
  onMaximize?: () => void;
  highlightInfo?: { chatId: string; messageIndex: number; query: string } | null;
  onClearHighlight?: () => void;
}

export interface AIAgentSkill {
  name: string;
  description: string;
  icon: string;
  provider: 'gemini' | 'openai' | 'claude';
}

const AGENT_SKILLS: AIAgentSkill[] = [
  // Gemini Skills
  { name: 'analyze-code', description: 'Perform high-fidelity codebase structure analysis', icon: 'analytics-outline', provider: 'gemini' },
  { name: 'refactor-code', description: 'Clean up architecture and enforce DRY principles', icon: 'git-compare-outline', provider: 'gemini' },
  { name: 'write-tests', description: 'Generate robust, comprehensive Jest unit tests', icon: 'shield-checkmark-outline', provider: 'gemini' },
  { name: 'explain-logic', description: 'Provide a detailed, step-by-step logic breakdown', icon: 'bulb-outline', provider: 'gemini' },
  { name: 'optimize-performance', description: 'Identify computational bottlenecks and fix them', icon: 'speedometer-outline', provider: 'gemini' },
  { name: 'translate-language', description: 'Translate comments, strings, or markdown files', icon: 'language-outline', provider: 'gemini' },
  { name: 'system-instructions', description: 'Inspect or refine custom agent prompts', icon: 'options-outline', provider: 'gemini' },

  // GPT (OpenAI) Skills
  { name: 'deep-reasoning', description: 'Activate O1-style detailed multi-step logical chain', icon: 'hardware-chip-outline', provider: 'openai' },
  { name: 'generate-boilerplate', description: 'Scaffold new React Native elements or utilities', icon: 'cube-outline', provider: 'openai' },
  { name: 'debug-error', description: 'Parse complex error stack traces and find root cause', icon: 'bug-outline', provider: 'openai' },
  { name: 'document-code', description: 'Generate standard JSDoc/TSDoc and descriptive READMEs', icon: 'document-text-outline', provider: 'openai' },
  { name: 'ui-ux-review', description: 'Review layout design tokens for premium aesthetics', icon: 'color-palette-outline', provider: 'openai' },
  { name: 'interactive-grill', description: 'Trigger interactive prompt-grill to refine design ideas', icon: 'chatbubbles-outline', provider: 'openai' },

  // Claude Skills
  { name: 'artifact-creation', description: 'Synthesize custom SVGs, diagrams, or precise plans', icon: 'construct-outline', provider: 'claude' },
  { name: 'semantic-search', description: 'Locate semantically related variables or styles', icon: 'search-outline', provider: 'claude' },
  { name: 'token-optimizer', description: 'Prune code block contexts to minimize token usage', icon: 'leaf-outline', provider: 'claude' },
  { name: 'codebase-mapping', description: 'Visualize and chart architecture relationships', icon: 'map-outline', provider: 'claude' },
  { name: 'style-compliance', description: 'Audit code style against project conventions', icon: 'checkmark-done-circle-outline', provider: 'claude' },
  { name: 'architectural-review', description: 'Perform high-level software engineering pattern audit', icon: 'business-outline', provider: 'claude' },
];

export default function GeminiChat({ 
  currentContent, 
  onSaveChatToFile, 
  bottomSpacing = 0, 
  fileList = [], 
  onClose,
  chatMessages,
  onSaveActiveChat,
  onUpdateMessageFeedback,
  onMaximize,
  highlightInfo,
  onClearHighlight
}: GeminiChatProps) {
  const { colors, isDark, fontFamilyCode, fontSizeUI } = useTheme();

  const customPrismStyle = useMemo(() => {
    const baseStyle = isDark ? oneDark : oneLight;
    return {
      ...baseStyle,
      'code[class*="language-"]': {
        ...baseStyle['code[class*="language-"]'],
        background: 'transparent',
      },
      'pre[class*="language-"]': {
        ...baseStyle['pre[class*="language-"]'],
        background: 'transparent',
      },
      'comment': {
        ...baseStyle['comment'],
        color: colors.textMuted,
        opacity: 0.85
      },
      'prolog': {
        ...baseStyle['prolog'],
        color: colors.textMuted
      },
      'doctype': {
        ...baseStyle['doctype'],
        color: colors.textMuted
      },
      'cdata': {
        ...baseStyle['cdata'],
        color: colors.textMuted
      }
    };
  }, [isDark, colors.textMuted]);
  const { 
    geminiApiKey: apiKey, 
    googleAccessToken: accessToken, 
    selectedModel: model, 
    setSelectedModel: onModelChange,
    setSettingsVisible,
    setActiveTab,
    
    // Multi-Provider settings
    aiProvider,
    openaiApiKey,
    claudeApiKey
  } = useAppSettings();
  
  const models = AI_PROVIDERS[aiProvider].models;
  const onOpenSettings = () => {
    setActiveTab('ai');
    setSettingsVisible(true);
  };

  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const isExternalHistory = chatMessages !== undefined && onSaveActiveChat !== undefined;
  const messages = isExternalHistory ? chatMessages : localMessages;

  const [inputText, setInputText] = useState('');
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number | null>(null);

  useEffect(() => {
    if (highlightInfo && highlightInfo.messageIndex !== undefined && highlightInfo.messageIndex >= 0 && highlightInfo.messageIndex < messages.length) {
      const targetIndex = highlightInfo.messageIndex;
      setActiveHighlightIndex(targetIndex);

      if (Platform.OS === 'web') {
        setTimeout(() => {
          const el = document.getElementById(`chat-msg-${targetIndex}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      }

      const timer = setTimeout(() => {
        setActiveHighlightIndex(null);
        if (onClearHighlight) {
          onClearHighlight();
        }
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [highlightInfo, messages.length]);
  
  // Autocomplete Suggestion States
  const [suggestionTrigger, setSuggestionTrigger] = useState<'@' | '$' | null>(null);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(0);

  useEffect(() => {
    const match = inputText.match(/(?:^|\s)([@$])(\S*)$/);
    if (match) {
      setSuggestionTrigger(match[1] as '@' | '$');
      setSuggestionQuery(match[2]);
      setFocusedSuggestionIndex(0);
    } else {
      setSuggestionTrigger(null);
      setSuggestionQuery('');
    }
  }, [inputText]);

  const suggestions = React.useMemo(() => {
    if (!suggestionTrigger) return [];
    if (suggestionTrigger === '@') {
      const lowerQuery = suggestionQuery.toLowerCase();
      return (fileList || []).filter(path => {
        const fileName = path.split('/').pop() || path;
        return fileName.toLowerCase().includes(lowerQuery) || path.toLowerCase().includes(lowerQuery);
      }).slice(0, 8).map(path => ({
        id: path,
        name: path.split('/').pop() || path,
        subtitle: path,
        icon: 'document-text-outline' as const,
        value: path
      }));
    } else {
      const lowerQuery = suggestionQuery.toLowerCase();
      return AGENT_SKILLS.filter(skill => 
        skill.provider === aiProvider && 
        (skill.name.toLowerCase().includes(lowerQuery) || skill.description.toLowerCase().includes(lowerQuery))
      ).slice(0, 8).map(skill => ({
        id: skill.name,
        name: skill.name,
        subtitle: skill.description,
        icon: skill.icon,
        value: skill.name
      }));
    }
  }, [suggestionTrigger, suggestionQuery, fileList, aiProvider]);

  const handleSelectSuggestion = (value: string) => {
    const updated = inputText.replace(/(?:^|\s)([@$])(\S*)$/, (match, trigger) => {
      const lead = match.startsWith(' ') ? ' ' : '';
      return lead + trigger + value + ' ';
    });
    setInputText(updated);
    setSuggestionTrigger(null);
  };
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'general' | 'archive'>('general');
  const [archivePath, setArchivePath] = useState('chat-history.md');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const hasAuth = (() => {
    if (aiProvider === 'gemini') return !!(apiKey || accessToken);
    if (aiProvider === 'openai') return !!openaiApiKey;
    if (aiProvider === 'claude') return !!claudeApiKey;
    return false;
  })();

  const updateMessages = async (newMessages: Message[]) => {
    if (isExternalHistory) {
      await onSaveActiveChat(newMessages);
    } else {
      setLocalMessages(newMessages);
    }
  };

  const handleToggleFeedback = async (msgIndex: number, type: 'like' | 'dislike') => {
    const currentMsg = messages[msgIndex];
    if (!currentMsg) return;

    const newFeedback = currentMsg.feedback === type ? null : type;

    if (isExternalHistory && onUpdateMessageFeedback) {
      await onUpdateMessageFeedback(msgIndex, newFeedback);
    } else {
      const updated = messages.map((m, idx) => {
        if (idx === msgIndex) {
          return {
            ...m,
            feedback: newFeedback === null ? undefined : newFeedback
          };
        }
        return m;
      });
      setLocalMessages(updated);
    }
  };

  const handleSend = async (overrideMessages?: Message[], overridePrompt?: string) => {
    const isRegenerate = overrideMessages !== undefined && overridePrompt !== undefined;
    const userMsg = isRegenerate ? overridePrompt : inputText.trim();
    if (!userMsg || !hasAuth || loading) return;

    if (!isRegenerate) {
      setInputText('');
    }

    const baseMessages = isRegenerate ? overrideMessages : messages;
    const newMessages = isRegenerate 
      ? baseMessages 
      : [...baseMessages, { role: 'user', content: userMsg } as Message];
    await updateMessages(newMessages);
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

      if (aiProvider === 'gemini') {
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
          if (!response.ok || data.error) throw new Error(data.error?.message || `HTTP ${response.status}`);
          text = data.candidates[0].content.parts[0].text;
        } else {
          const genAI = new GoogleGenerativeAI(apiKey);
          const modelInstance = genAI.getGenerativeModel({ model: model }, { apiVersion: apiVer });
          const result = await modelInstance.generateContent(systemPrompt);
          const response = await result.response;
          text = response.text();
        }
      } else if (aiProvider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: systemPrompt }]
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
        text = data.choices[0].message.content;
      } else if (aiProvider === 'claude') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': claudeApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: model,
            max_tokens: 4096,
            messages: [{ role: 'user', content: systemPrompt }]
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
        text = data.content[0].text;
      }

      const newModelMsg: Message = {
        role: 'model',
        content: text,
        versions: [{ content: text, model: model, provider: aiProvider }],
        activeVersionIndex: 0
      };
      const finalMessages = [...newMessages, newModelMsg];
      await updateMessages(finalMessages);

      // If in archive mode, automatically save to file
      if (mode === 'archive' && onSaveChatToFile && archivePath) {
        await onSaveChatToFile(archivePath, formatChatAsMarkdown(finalMessages));
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMsg = "❌ An error occurred: " + (error.message || "Unknown error");
      const errorMsgObj: Message = {
        role: 'model',
        content: errorMsg,
        versions: [{ content: errorMsg, model: model, provider: aiProvider }],
        activeVersionIndex: 0
      };
      await updateMessages([...newMessages, errorMsgObj]);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchVersion = async (msgIndex: number, newIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg || !msg.versions || newIndex < 0 || newIndex >= msg.versions.length) return;

    const normalizedVersions: MessageVersion[] = msg.versions.map(v => {
      if (typeof v === 'string') {
        return { content: v, model: model, provider: aiProvider };
      }
      return v;
    });

    const updated = messages.map((m, idx) => {
      if (idx === msgIndex) {
        return {
          ...m,
          versions: normalizedVersions,
          activeVersionIndex: newIndex,
          content: normalizedVersions[newIndex].content
        };
      }
      return m;
    });

    await updateMessages(updated);
  };

  const handleRegenerate = async (msgIndex: number) => {
    if (msgIndex <= 0 || loading || !hasAuth) return;
    const userMsgObj = messages[msgIndex - 1];
    if (!userMsgObj || userMsgObj.role !== 'user') return;
    
    const userPrompt = userMsgObj.content;
    const targetModelMsg = messages[msgIndex];
    if (!targetModelMsg || targetModelMsg.role !== 'model') return;

    setLoading(true);

    try {
      let text = "";
      
      const systemPrompt = `You are an AI assistant for 'Mark Explorer', a markdown editor.
The current content of the file the user is editing is as follows:
---
${currentContent || "(empty)"}
---

Based on the content above, please answer the following question:
${userPrompt}`;

      if (aiProvider === 'gemini') {
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
          if (!response.ok || data.error) throw new Error(data.error?.message || `HTTP ${response.status}`);
          text = data.candidates[0].content.parts[0].text;
        } else {
          const genAI = new GoogleGenerativeAI(apiKey);
          const modelInstance = genAI.getGenerativeModel({ model: model }, { apiVersion: apiVer });
          const result = await modelInstance.generateContent(systemPrompt);
          const response = await result.response;
          text = response.text();
        }
      } else if (aiProvider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: systemPrompt }]
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
        text = data.choices[0].message.content;
      } else if (aiProvider === 'claude') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': claudeApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: model,
            max_tokens: 4096,
            messages: [{ role: 'user', content: systemPrompt }]
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
        text = data.content[0].text;
      }

      const rawVersions = targetModelMsg.versions || [targetModelMsg.content];
      const currentVersions: MessageVersion[] = rawVersions.map(v => {
        if (typeof v === 'string') {
          return { content: v, model: model, provider: aiProvider };
        }
        return v;
      });

      const newVersion: MessageVersion = { content: text, model: model, provider: aiProvider };
      const updatedVersions = [...currentVersions, newVersion];
      const updatedIndex = updatedVersions.length - 1;

      const updated = messages.map((m, idx) => {
        if (idx === msgIndex) {
          return {
            ...m,
            content: text,
            versions: updatedVersions,
            activeVersionIndex: updatedIndex
          };
        }
        return m;
      });

      await updateMessages(updated);

      if (mode === 'archive' && onSaveChatToFile && archivePath) {
        await onSaveChatToFile(archivePath, formatChatAsMarkdown(updated));
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMsg = "❌ An error occurred: " + (error.message || "Unknown error");
      
      const rawVersions = targetModelMsg.versions || [targetModelMsg.content];
      const currentVersions: MessageVersion[] = rawVersions.map(v => {
        if (typeof v === 'string') {
          return { content: v, model: model, provider: aiProvider };
        }
        return v;
      });

      const newVersion: MessageVersion = { content: errorMsg, model: model, provider: aiProvider };
      const updatedVersions = [...currentVersions, newVersion];
      const updatedIndex = updatedVersions.length - 1;

      const updated = messages.map((m, idx) => {
        if (idx === msgIndex) {
          return {
            ...m,
            content: errorMsg,
            versions: updatedVersions,
            activeVersionIndex: updatedIndex
          };
        }
        return m;
      });

      await updateMessages(updated);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = async (content: string) => {
    await Clipboard.setStringAsync(content);
    if (Platform.OS === 'web') alert('Copied to clipboard.');
  };

  const renderCodeBlock = (node: any, children: any, language: string) => {
    return (
      <View 
        key={node.key} 
        nativeID={`chat-code-block-${node.key}`}
        className="chat-code-block-scroll"
        style={{ 
          marginVertical: 8, 
          borderRadius: 8, 
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
        }}
      >
        {Platform.OS === 'web' && (
          <style>{`
            .chat-code-block-scroll div::-webkit-scrollbar {
              height: 6px;
              width: 6px;
            }
            .chat-code-block-scroll div::-webkit-scrollbar-track {
              background: ${colors.surface};
            }
            .chat-code-block-scroll div::-webkit-scrollbar-thumb {
              background: ${colors.border};
              border-radius: 3px;
            }
            .chat-code-block-scroll div::-webkit-scrollbar-thumb:hover {
              background: ${colors.textMuted};
            }
            .chat-code-block-scroll div {
              scrollbar-width: thin;
              scrollbar-color: ${colors.border} ${colors.surface};
            }
          `}</style>
        )}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingHorizontal: 12, 
          paddingVertical: 6,
          backgroundColor: isDark ? '#151921' : '#F8FAFC',
          borderBottomWidth: 1,
          borderBottomColor: colors.border
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#ff5f56', marginRight: 4 }} />
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#ffbd2e', marginRight: 4 }} />
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#27c93f', marginRight: 8 }} />
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {language || 'code'}
            </Text>
          </View>
          <Pressable 
            onPress={() => handleCopyMessage(node.content)}
            style={({ hovered }: any) => [
              { padding: 2, borderRadius: 4 },
              hovered && { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }
            ]}
          >
            <Ionicons name="copy-outline" size={12} color={colors.textMuted} />
          </Pressable>
        </View>
        <View style={{ padding: 12 }}>
          {Platform.OS === 'web' ? (
            <SyntaxHighlighter
              PreTag="div"
              children={node.content?.replace(/\n$/, '')}
              language={language || 'text'}
              style={customPrismStyle}
              showLineNumbers={false}
              customStyle={{
                margin: 0,
                padding: 0,
                fontSize: '11px',
                lineHeight: '16px',
                backgroundColor: 'transparent',
                border: 'none',
                fontFamily: fontFamilyCode || 'monospace',
              }}
            />
          ) : (
            <Text style={{ 
              fontFamily: fontFamilyCode || 'monospace', 
              fontSize: 11, 
              color: isDark ? '#e2e8f0' : '#1F2937', 
              lineHeight: 16 
            }} selectable>
              {node.content?.replace(/\n$/, '')}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const markdownRules = {
    fence: (node: any, children: any, parent: any, styles: any) => {
      return renderCodeBlock(node, children, node.sourceInfo);
    },
    code_block: (node: any, children: any, parent: any, styles: any) => {
      return renderCodeBlock(node, children, 'code');
    },
  };

  const markdownStyles = {
    body: { 
      color: colors.text, 
      fontSize: 12, 
      lineHeight: 18,
    },
    heading1: { color: colors.text, marginTop: 8, marginBottom: 4, fontSize: 15, fontWeight: 'bold' },
    heading2: { color: colors.text, marginTop: 6, marginBottom: 3, fontSize: 13.5, fontWeight: 'bold' },
    heading3: { color: colors.text, marginTop: 4, marginBottom: 2, fontSize: 12.5, fontWeight: 'bold' },
    hr: { backgroundColor: colors.border },
    blockquote: { 
      backgroundColor: isDark ? '#151921' : '#F3F4F6', 
      color: colors.textMuted, 
      borderLeftWidth: 3, 
      borderLeftColor: colors.border,
      paddingLeft: 8,
      marginVertical: 4
    },
    code_inline: { 
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', 
      color: isDark ? '#38bdf8' : '#e11d48',
      fontFamily: fontFamilyCode || 'monospace',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 3,
      fontSize: 10.5,
      borderWidth: 0,
      borderColor: 'transparent'
    },
    code_block: { 
      backgroundColor: isDark ? '#0b0e14' : '#F3F4F6', 
      color: isDark ? '#e2e8f0' : '#1F2937', 
      fontFamily: fontFamilyCode || 'monospace',
      fontSize: 11,
      padding: 8,
      borderRadius: 6,
      marginVertical: 6,
      borderWidth: 0
    },
    fence: { 
      backgroundColor: isDark ? '#0b0e14' : '#F3F4F6', 
      color: isDark ? '#e2e8f0' : '#1F2937', 
      fontFamily: fontFamilyCode || 'monospace',
      fontSize: 11,
      padding: 8,
      borderRadius: 6,
      marginVertical: 6,
      borderWidth: 0
    },
  };

  const formatChatAsMarkdown = (msgs: Message[]) => {
    const assistantName = aiProvider === 'gemini' ? 'Gemini' : aiProvider === 'openai' ? 'OpenAI' : 'Claude';
    return msgs.map(m => `### ${m.role === 'user' ? 'User' : assistantName}\n\n${m.content}`).join('\n\n---\n\n');
  };

  const handleCopyMd = async () => {
    if (messages.length === 0) return;
    const md = formatChatAsMarkdown(messages);
    await Clipboard.setStringAsync(md);
    if (Platform.OS === 'web') alert('Chat history copied to clipboard.');
  };

  const handleKeyPress = (e: any) => {
    const key = e.nativeEvent.key;
    
    if (suggestionTrigger && suggestions.length > 0) {
      if (key === 'ArrowDown') {
        if (e.preventDefault) e.preventDefault();
        setFocusedSuggestionIndex(prev => (prev + 1) % suggestions.length);
        return;
      }
      if (key === 'ArrowUp') {
        if (e.preventDefault) e.preventDefault();
        setFocusedSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (key === 'Enter') {
        if (e.preventDefault) e.preventDefault();
        const selected = suggestions[focusedSuggestionIndex];
        if (selected) {
          handleSelectSuggestion(selected.value);
        }
        return;
      }
      if (key === 'Escape') {
        if (e.preventDefault) e.preventDefault();
        setSuggestionTrigger(null);
        return;
      }
    }

    const isModifier = e.nativeEvent.metaKey || e.nativeEvent.ctrlKey;
    if (key === 'Enter' && isModifier) {
      if (e.preventDefault) e.preventDefault();
      handleSend();
    }
  };
  
  const handleArchiveInputChange = (text: string) => {
    setArchivePath(text);
    if (text.length > 0) {
      const filtered = fileList.filter(f => 
        f.toLowerCase().includes(text.toLowerCase()) && f !== text
      ).slice(0, 5); 
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectArchiveSuggestion = (suggestion: string) => {
    setArchivePath(suggestion);
    setShowSuggestions(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: bottomSpacing }]}>
       <View style={[styles.header, { height: fontSizeUI + 27, borderBottomColor: colors.border, backgroundColor: isDark ? '#121212' : '#F3F4F6' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="sparkles" size={fontSizeUI + 1} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.title, { color: colors.text, fontSize: fontSizeUI - 2 }]}>AI Assistant</Text>
            
            <View style={[styles.modeToggle, { borderColor: colors.border, height: fontSizeUI + 11 }]}>
              <Pressable 
                onPress={() => setMode('general')}
                style={[styles.modeBtn, mode === 'general' && { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.modeBtnText, { color: mode === 'general' ? '#FFF' : colors.textMuted, fontSize: fontSizeUI - 4 }]}>General</Text>
              </Pressable>
              <Pressable 
                onPress={() => setMode('archive')}
                style={[styles.modeBtn, mode === 'archive' && { backgroundColor: '#10B981' }]}
              >
                <Text style={[styles.modeBtnText, { color: mode === 'archive' ? '#FFF' : colors.textMuted, fontSize: fontSizeUI - 4 }]}>Archive</Text>
              </Pressable>
            </View>

            <View style={{ marginLeft: 12, borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: 12 }}>
              {Platform.OS === 'web' ? (
                <select
                  value={model}
                  onChange={(e) => onModelChange(e.target.value)}
                  style={{
                    height: fontSizeUI + 7,
                    paddingHorizontal: 4,
                    borderRadius: 4,
                    fontSize: fontSizeUI - 4,
                    backgroundColor: colors.background,
                    color: colors.primary,
                    borderWidth: 1,
                    borderColor: colors.border,
                    cursor: 'pointer'
                  } as any}
                >
                  {models.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              ) : (
                <Pressable 
                  onPress={() => {
                    const currentIndex = models.findIndex(m => m.value === model);
                    const nextIndex = (currentIndex + 1) % models.length;
                    onModelChange(models[nextIndex].value);
                  }}
                  style={{
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    backgroundColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: fontSizeUI - 4, fontWeight: 'bold', color: colors.primary }}>
                    {models.find(m => m.value === model)?.label || model}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {mode === 'general' && messages.length > 0 && (
              <Pressable onPress={handleCopyMd} style={[styles.actionBtn, { paddingVertical: fontSizeUI - 9 }]}>
                <Ionicons name="copy-outline" size={fontSizeUI + 1} color={colors.primary} />
                <Text style={[styles.actionBtnText, { color: colors.primary, fontSize: fontSizeUI - 3 }]}>Copy (MD)</Text>
              </Pressable>
            )}
            <Pressable onPress={onOpenSettings} style={styles.settingsBtn} testID="settings-btn">
              <Ionicons name="settings-outline" size={fontSizeUI + 1} color={colors.text} />
              <Text style={[styles.settingsBtnText, { color: colors.text, fontSize: fontSizeUI - 3 }]}>Settings</Text>
            </Pressable>

            {onMaximize && (
              <Pressable 
                onPress={onMaximize} 
                style={({ hovered }: any) => [
                  styles.closeBtn,
                  hovered && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}
                testID="gemini-maximize-btn"
              >
                <Ionicons name="expand-outline" size={16} color={colors.text} />
              </Pressable>
            )}

            {onClose && (
              <Pressable 
                onPress={onClose} 
                style={({ hovered }: any) => [
                  styles.closeBtn,
                  hovered && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}
                testID="gemini-close-btn"
              >
                <Ionicons name="chevron-down" size={18} color={colors.text} />
              </Pressable>
            )}
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
                      onPress={() => handleSelectArchiveSuggestion(item)}
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
          {Platform.OS === 'web' && (
            <style>{`
              @keyframes chatBubblePulse {
                0% {
                  transform: scale(1);
                  box-shadow: 0 0 8px ${colors.primary}30;
                }
                100% {
                  transform: scale(1.015);
                  box-shadow: 0 0 18px ${colors.primary}60;
                }
              }
            `}</style>
          )}
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
                Ask AI anything! (Press Cmd/Ctrl + Enter to send)
             </Text>
           </View>
         )}
          {messages.map((msg, i) => {
            const isFocused = activeHighlightIndex === i;
            return (
              <View 
                key={i} 
                nativeID={`chat-msg-${i}`}
                id={`chat-msg-${i}`}
                style={[
                  styles.messageBubble, 
                  msg.role === 'user' ? styles.userBubbleStyle : styles.modelBubbleStyle,
                  { 
                    backgroundColor: msg.role === 'user' ? colors.userBubble : colors.modelBubble, 
                    borderColor: isFocused ? colors.primary : colors.border,
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    borderWidth: isFocused ? 2 : 1,
                  },
                  isFocused && (Platform.OS === 'web' ? {
                    boxShadow: `0 0 16px ${colors.primary}40, inset 0 0 8px ${colors.primary}20`,
                    animation: 'chatBubblePulse 1.5s infinite alternate',
                    transition: 'all 0.3s ease-in-out'
                  } as any : {
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    elevation: 4
                  })
                ]}
              >
                <Text style={[styles.roleLabel, { color: colors.primary }]}>
                  {msg.role === 'user' 
                    ? 'USER' 
                    : (() => {
                        const activeIndex = msg.activeVersionIndex || 0;
                        const activeVer = msg.versions && msg.versions[activeIndex];
                        if (activeVer && typeof activeVer === 'object') {
                          const prov = activeVer.provider;
                          const mdlVal = activeVer.model;
                          const label = AI_PROVIDERS[prov]?.models.find(m => m.value === mdlVal)?.label || mdlVal;
                          return `${prov.toUpperCase()} (${label})`;
                        }
                        return aiProvider.toUpperCase();
                      })()
                  }
                </Text>
                <Markdown style={markdownStyles} rules={markdownRules}>
                  {msg.content}
                </Markdown>
                
                {/* Action Toolbar for Messages */}
                <View style={styles.actionRow}>
                  {msg.role === 'model' && (
                    <Pressable
                      onPress={() => handleRegenerate(i)}
                      style={styles.actionBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      testID={`regenerate-btn-${i}`}
                    >
                      <Ionicons 
                        name="refresh-outline" 
                        size={13} 
                        color={colors.textMuted} 
                      />
                    </Pressable>
                  )}

                  <Pressable
                    onPress={() => handleCopyMessage(msg.content)}
                    style={styles.actionBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    testID={`copy-btn-${i}`}
                  >
                    <Ionicons 
                      name="copy-outline" 
                      size={13} 
                      color={colors.textMuted} 
                    />
                  </Pressable>

                  {/* Version Selector for Regenerated AI Responses */}
                  {msg.role === 'model' && msg.versions && msg.versions.length > 1 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', gap: 6 }}>
                      <Pressable
                        onPress={() => handleSwitchVersion(i, (msg.activeVersionIndex || 0) - 1)}
                        disabled={(msg.activeVersionIndex || 0) === 0}
                        style={({ pressed }: any) => [
                          { opacity: (msg.activeVersionIndex || 0) === 0 ? 0.3 : 1 },
                          pressed && { opacity: 0.7 }
                        ]}
                        testID={`prev-version-btn-${i}`}
                      >
                        <Ionicons name="chevron-back" size={13} color={colors.text} />
                      </Pressable>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textMuted }}>
                        {((msg.activeVersionIndex || 0) + 1)} / {msg.versions.length}
                      </Text>
                      <Pressable
                        onPress={() => handleSwitchVersion(i, (msg.activeVersionIndex || 0) + 1)}
                        disabled={(msg.activeVersionIndex || 0) === msg.versions.length - 1}
                        style={({ pressed }: any) => [
                          { opacity: (msg.activeVersionIndex || 0) === msg.versions.length - 1 ? 0.3 : 1 },
                          pressed && { opacity: 0.7 }
                        ]}
                        testID={`next-version-btn-${i}`}
                      >
                        <Ionicons name="chevron-forward" size={13} color={colors.text} />
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
         {loading && (
           <View style={styles.loadingContainer}>
             <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ marginLeft: 8, fontSize: 11, color: colors.textMuted }}>Thinking...</Text>
           </View>
         )}
        </ScrollView>
 
        {suggestionTrigger && suggestions.length > 0 && (
          <View 
            testID="autocomplete-overlay"
            style={[
              styles.autocompleteOverlay, 
              { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                shadowColor: isDark ? '#000' : '#475569'
              }
            ]}
          >
            <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled">
              {suggestions.map((item, index) => {
                const isFocused = index === focusedSuggestionIndex;
                return (
                  <Pressable
                    key={item.id}
                    testID={`autocomplete-item-${item.id}`}
                    onPress={() => handleSelectSuggestion(item.value)}
                    style={[
                      styles.suggestionRow,
                      isFocused && { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(59,130,246,0.08)' }
                    ]}
                  >
                    <Ionicons 
                      name={item.icon as any} 
                      size={13} 
                      color={isFocused ? colors.primary : colors.textMuted} 
                      style={{ marginRight: 8 }} 
                    />
                    <View style={{ flex: 1 }}>
                      <Text 
                        testID={`autocomplete-label-${item.id}`}
                        style={[
                          styles.suggestionLabel, 
                          { 
                            color: isFocused ? colors.primary : colors.text,
                            fontWeight: isFocused ? 'bold' : 'normal'
                          }
                        ]}
                      >
                        {suggestionTrigger}{item.name}
                      </Text>
                      <Text style={[styles.suggestionSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
         <TextInput
           style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
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
  archiveInput: Platform.select({
    web: { flex: 1, fontSize: 11, padding: 0, height: '100%', outlineStyle: 'none' } as any,
    default: { flex: 1, fontSize: 11, padding: 0, height: '100%' }
  }),
  suggestionBox: Platform.select({
    web: {
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
    default: {
      position: 'absolute',
      top: 32,
      left: 0,
      right: 0,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 4,
      zIndex: 2000,
      elevation: 5,
    }
  }),
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  actionBtn: {
    padding: 4,
    marginRight: 10,
    borderRadius: 4,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {})
  } as any,

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
  closeBtn: {
    padding: 4,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {})
  } as any,
  autocompleteOverlay: {
    position: 'absolute',
    bottom: 50,
    left: 12,
    right: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 6,
    zIndex: 9999,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 1,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {})
  } as any,
  suggestionLabel: {
    fontSize: 12,
    fontFamily: Platform.OS === 'web' ? 'Inter, system-ui, sans-serif' : undefined
  },
  suggestionSubtitle: {
    fontSize: 9.5,
    marginTop: 2,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace'
  },
});
