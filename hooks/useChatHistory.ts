import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { getSetting, setSetting } from '@/utils/IndexedDBUtils';

export interface ChatMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  provider: 'gemini' | 'openai' | 'claude';
  model: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp?: number;
  feedback?: 'like' | 'dislike';
}

export interface ChatDetail {
  id: string;
  title: string;
  messages: ChatMessage[];
}

// Generate unique ID with browser compatibility fallback
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'chat-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
};

// Helper to read file from DirectoryHandle
const getFileContent = async (dirHandle: any, relativePath: string): Promise<string | null> => {
  try {
    const parts = relativePath.split('/');
    let current = dirHandle;
    for (let i = 0; i < parts.length - 1; i++) {
      current = await current.getDirectoryHandle(parts[i]);
    }
    const fileHandle = await current.getFileHandle(parts[parts.length - 1]);
    const file = await fileHandle.getFile();
    return await file.text();
  } catch (e) {
    return null;
  }
};

// Helper to write file to DirectoryHandle
const writeFileContent = async (dirHandle: any, relativePath: string, content: string): Promise<boolean> => {
  try {
    const parts = relativePath.split('/');
    let current = dirHandle;
    for (let i = 0; i < parts.length - 1; i++) {
      current = await current.getDirectoryHandle(parts[i], { create: true });
    }
    const fileHandle = await current.getFileHandle(parts[parts.length - 1], { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    return true;
  } catch (e) {
    console.error('[ChatHistory] Failed to write file content', e);
    return false;
  }
};

// Helper to delete file from DirectoryHandle
const deleteFile = async (dirHandle: any, relativePath: string): Promise<boolean> => {
  try {
    const parts = relativePath.split('/');
    let current = dirHandle;
    for (let i = 0; i < parts.length - 1; i++) {
      current = await current.getDirectoryHandle(parts[i]);
    }
    await current.removeEntry(parts[parts.length - 1]);
    return true;
  } catch (e) {
    console.error('[ChatHistory] Failed to delete file', e);
    return false;
  }
};

const readChatFile = async (dirHandle: any, relativePath: string): Promise<string | null> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.opener && typeof window.opener._readWorkspaceFile === 'function') {
    return await window.opener._readWorkspaceFile(relativePath);
  }
  return await getFileContent(dirHandle, relativePath);
};

const writeChatFile = async (dirHandle: any, relativePath: string, content: string): Promise<boolean> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.opener && typeof window.opener._writeWorkspaceFile === 'function') {
    return await window.opener._writeWorkspaceFile(relativePath, content);
  }
  return await writeFileContent(dirHandle, relativePath, content);
};

const deleteChatFile = async (dirHandle: any, relativePath: string): Promise<boolean> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.opener && typeof window.opener._deleteWorkspaceFile === 'function') {
    return await window.opener._deleteWorkspaceFile(relativePath);
  }
  return await deleteFile(dirHandle, relativePath);
};

const isWorkspaceWeb = (dirHandle: any): boolean => {
  if (Platform.OS !== 'web') return false;
  if (dirHandle) return true;
  if (typeof window !== 'undefined' && window.opener && typeof window.opener._readWorkspaceFile === 'function') return true;
  return false;
};

export function useChatHistory(dirHandle: any, aiProvider: 'gemini' | 'openai' | 'claude', selectedModel: string) {
  const [chatList, setChatList] = useState<ChatMetadata[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load chat list from active source (Directory or IndexedDB)
  const loadChatList = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isWorkspaceWeb(dirHandle)) {
        // Load from workspace folder .chats/list.json
        const content = await readChatFile(dirHandle, '.chats/list.json');
        if (content) {
          try {
            const parsed = JSON.parse(content) as ChatMetadata[];
            // Sort by updatedAt descending
            parsed.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            setChatList(parsed);
            setIsLoading(false);
            return parsed;
          } catch (e) {
            console.error('[ChatHistory] Failed to parse chat list', e);
          }
        }
      } else {
        // Fallback to IndexedDB
        const cache = await getSetting('ai_chat_list');
        if (cache) {
          const parsed = cache as ChatMetadata[];
          parsed.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          setChatList(parsed);
          setIsLoading(false);
          return parsed;
        }
      }
      setChatList(prev => prev.length > 0 ? prev : []);
      return [];
    } catch (e) {
      console.error('[ChatHistory] Load failed', e);
      setChatList(prev => prev.length > 0 ? prev : []);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [dirHandle]);

  // Load message transcripts for selected chat
  const loadActiveChat = useCallback(async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    try {
      if (isWorkspaceWeb(dirHandle)) {
        const content = await readChatFile(dirHandle, `.chats/chat-${id}.json`);
        if (content) {
          try {
            const parsed = JSON.parse(content) as ChatDetail;
            setMessages(parsed.messages || []);
            setActiveChatId(id);
            return;
          } catch (e) {
            console.error('[ChatHistory] Failed to parse chat detail', e);
          }
        }
      } else {
        // Fallback to IndexedDB
        const cache = await getSetting(`ai_chat_detail_${id}`);
        if (cache) {
          const parsed = cache as ChatDetail;
          setMessages(parsed.messages || []);
          setActiveChatId(id);
          return;
        }
      }
      // If not found, clear messages and set active
      setMessages([]);
      setActiveChatId(id);
    } catch (e) {
      console.error('[ChatHistory] Load active chat failed', e);
      setMessages([]);
      setActiveChatId(id);
    } finally {
      setIsLoading(false);
    }

    if (Platform.OS === 'web' && id) {
      const channel = new BroadcastChannel('markdown-explorer-chat-sync');
      channel.postMessage({ type: 'ACTIVE_CHAT_CHANGED', chatId: id });
      channel.close();
    }
  }, [dirHandle]);

  const prevDirHandleRef = useRef<any>(dirHandle);

  // Trigger reload of list when directory handle updates
  useEffect(() => {
    loadChatList();
    if (
      prevDirHandleRef.current !== undefined && 
      prevDirHandleRef.current !== null && 
      prevDirHandleRef.current !== dirHandle
    ) {
      setActiveChatId(null);
      setMessages([]);
    }
    prevDirHandleRef.current = dirHandle;
  }, [dirHandle, loadChatList]);

  // Synchronize across windows/tabs via BroadcastChannel
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const channel = new BroadcastChannel('markdown-explorer-chat-sync');
    
    const handleMessage = async (event: MessageEvent) => {
      const { type, chatId } = event.data;
      
      if (type === 'CHAT_UPDATED') {
        await loadChatList();
        if (chatId === activeChatId) {
          await loadActiveChat(chatId);
        }
      } else if (type === 'ACTIVE_CHAT_CHANGED') {
        if (chatId && chatId !== activeChatId) {
          await loadActiveChat(chatId);
        }
      }
    };
    
    channel.addEventListener('message', handleMessage);
    
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [activeChatId, loadChatList, loadActiveChat]);

  // Save current messages to files or IndexedDB
  const saveActiveChat = useCallback(async (newMessages: ChatMessage[]) => {
    let currentId = activeChatId;
    let currentList = chatList;
    
    if (!currentId) {
      currentId = generateUUID();
      const firstUserMessage = newMessages.find(m => m.role === 'user');
      const defaultTitle = firstUserMessage ? (firstUserMessage.content.slice(0, 20) || '새로운 대화') : '새로운 대화';
      
      const newChat: ChatMetadata = {
        id: currentId,
        title: defaultTitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        provider: aiProvider,
        model: selectedModel
      };
      
      currentList = [newChat, ...chatList];
      setChatList(currentList);
      setActiveChatId(currentId);
    }

    // Update active chat messages
    setMessages(newMessages);

    try {
      // Find title of current chat
      const currentChat = currentList.find(c => c.id === currentId);
      const currentTitle = currentChat ? currentChat.title : '새로운 대화';

      const detailData: ChatDetail = {
        id: currentId!,
        title: currentTitle,
        messages: newMessages
      };

      // 1. Write messages file
      if (isWorkspaceWeb(dirHandle)) {
        await writeChatFile(dirHandle, `.chats/chat-${currentId}.json`, JSON.stringify(detailData, null, 2));
      } else {
        await setSetting(`ai_chat_detail_${currentId}`, detailData);
      }

      // 2. Update list metadata
      const updatedList = currentList.map(c => {
        if (c.id === currentId) {
          return {
            ...c,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      });

      // Sort by updatedAt descending
      updatedList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setChatList(updatedList);

      if (isWorkspaceWeb(dirHandle)) {
        await writeChatFile(dirHandle, '.chats/list.json', JSON.stringify(updatedList, null, 2));
      } else {
        await setSetting('ai_chat_list', updatedList);
      }

      if (Platform.OS === 'web') {
        const channel = new BroadcastChannel('markdown-explorer-chat-sync');
        channel.postMessage({ type: 'CHAT_UPDATED', chatId: currentId });
        channel.close();
      }
    } catch (e) {
      console.error('[ChatHistory] Save active chat failed', e);
    }
  }, [activeChatId, chatList, dirHandle, aiProvider, selectedModel]);

  // Create a brand new chat session
  const createNewChat = useCallback(async (customTitle?: string) => {
    const newId = generateUUID();
    const defaultTitle = customTitle || '새로운 대화';
    
    const newChat: ChatMetadata = {
      id: newId,
      title: defaultTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      provider: aiProvider,
      model: selectedModel
    };

    const newDetail: ChatDetail = {
      id: newId,
      title: defaultTitle,
      messages: []
    };

    try {
      const updatedList = [newChat, ...chatList];
      setChatList(updatedList);
      setMessages([]);
      setActiveChatId(newId);

      // Write metadata list
      if (isWorkspaceWeb(dirHandle)) {
        await writeChatFile(dirHandle, '.chats/list.json', JSON.stringify(updatedList, null, 2));
        await writeChatFile(dirHandle, `.chats/chat-${newId}.json`, JSON.stringify(newDetail, null, 2));
      } else {
        await setSetting('ai_chat_list', updatedList);
        await setSetting(`ai_chat_detail_${newId}`, newDetail);
      }
      
      if (Platform.OS === 'web' && newId) {
        const channel = new BroadcastChannel('markdown-explorer-chat-sync');
        channel.postMessage({ type: 'CHAT_UPDATED', chatId: newId });
        channel.close();
      }

      return newId;
    } catch (e) {
      console.error('[ChatHistory] Create chat failed', e);
      return null;
    }
  }, [chatList, dirHandle, aiProvider, selectedModel]);

  // Rename an existing chat title
  const renameChat = useCallback(async (id: string, newTitle: string) => {
    if (!id || !newTitle.trim()) return false;

    try {
      // 1. Update list metadata
      const updatedList = chatList.map(c => {
        if (c.id === id) {
          return {
            ...c,
            title: newTitle,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      });

      setChatList(updatedList);

      if (isWorkspaceWeb(dirHandle)) {
        await writeChatFile(dirHandle, '.chats/list.json', JSON.stringify(updatedList, null, 2));
      } else {
        await setSetting('ai_chat_list', updatedList);
      }

      // 2. Load existing transcript, update title, and write back
      let currentMessages: ChatMessage[] = [];
      if (isWorkspaceWeb(dirHandle)) {
        const detailStr = await readChatFile(dirHandle, `.chats/chat-${id}.json`);
        if (detailStr) {
          try {
            const parsed = JSON.parse(detailStr) as ChatDetail;
            currentMessages = parsed.messages || [];
          } catch (e) {}
        }
        
        const updatedDetail: ChatDetail = {
          id,
          title: newTitle,
          messages: currentMessages
        };
        await writeChatFile(dirHandle, `.chats/chat-${id}.json`, JSON.stringify(updatedDetail, null, 2));
      } else {
        const detailObj = await getSetting(`ai_chat_detail_${id}`);
        if (detailObj) {
          currentMessages = (detailObj as ChatDetail).messages || [];
        }
        
        const updatedDetail: ChatDetail = {
          id,
          title: newTitle,
          messages: currentMessages
        };
        await setSetting(`ai_chat_detail_${id}`, updatedDetail);
      }

      // If renamed active chat, update current local state
      if (id === activeChatId) {
        setMessages(currentMessages);
      }

      if (Platform.OS === 'web') {
        const channel = new BroadcastChannel('markdown-explorer-chat-sync');
        channel.postMessage({ type: 'CHAT_UPDATED', chatId: id });
        channel.close();
      }

      return true;
    } catch (e) {
      console.error('[ChatHistory] Rename chat failed', e);
      return false;
    }
  }, [chatList, dirHandle, activeChatId]);

  // Delete a chat session completely
  const deleteChat = useCallback(async (id: string) => {
    if (!id) return false;

    try {
      // 1. Filter out from list metadata
      const updatedList = chatList.filter(c => c.id !== id);
      setChatList(updatedList);

      if (isWorkspaceWeb(dirHandle)) {
        await writeChatFile(dirHandle, '.chats/list.json', JSON.stringify(updatedList, null, 2));
        await deleteChatFile(dirHandle, `.chats/chat-${id}.json`);
      } else {
        // Fallback IndexedDB deletion
        await setSetting('ai_chat_list', updatedList);
        const db = await openDBWrapper();
        if (db) {
          await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction('settings', 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.delete(`ai_chat_detail_${id}`);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
          });
        }
      }

      // If active chat deleted, clear messages and focus
      if (id === activeChatId) {
        setActiveChatId(null);
        setMessages([]);
      }

      if (Platform.OS === 'web') {
        const channel = new BroadcastChannel('markdown-explorer-chat-sync');
        channel.postMessage({ type: 'CHAT_UPDATED', chatId: id });
        channel.close();
      }

      return true;
    } catch (e) {
      console.error('[ChatHistory] Delete chat failed', e);
      return false;
    }
  }, [chatList, dirHandle, activeChatId]);

  const updateMessageFeedback = useCallback(async (msgIndex: number, feedback: 'like' | 'dislike' | null) => {
    if (!activeChatId) return;
    
    const updatedMessages = messages.map((m, idx) => {
      if (idx === msgIndex) {
        return {
          ...m,
          feedback: feedback === null ? undefined : feedback
        };
      }
      return m;
    });

    await saveActiveChat(updatedMessages);
  }, [activeChatId, messages, saveActiveChat]);

  return {
    chatList,
    activeChatId,
    messages,
    isLoading,
    createNewChat,
    loadActiveChat,
    saveActiveChat,
    renameChat,
    deleteChat,
    loadChatList,
    updateMessageFeedback
  };
}

// Internal safe openDB reference to delete chat detail keys from settings store
async function openDBWrapper() {
  if (Platform.OS !== 'web') return null;
  try {
    const DB_NAME = 'MarkdownExplorerDB';
    const DB_VERSION = 2;
    return await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (e) {
    return null;
  }
}
