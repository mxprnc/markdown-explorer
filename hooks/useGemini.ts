import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { DEFAULT_MODEL, AI_PROVIDERS } from '@/constants/Models';

export function useGemini() {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [showGeminiSettings, setShowGeminiSettings] = useState(false);
  
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempClientId, setTempClientId] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [tempModel, setTempModel] = useState(DEFAULT_MODEL);
  const [rootPath, setRootPath] = useState('');
  const [tempRootPath, setTempRootPath] = useState('');

  // Multi-Provider Support States
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'claude'>('gemini');
  const [tempAiProvider, setTempAiProvider] = useState<'gemini' | 'openai' | 'claude'>('gemini');
  
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [tempOpenaiApiKey, setTempOpenaiApiKey] = useState('');
  
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [tempClaudeApiKey, setTempClaudeApiKey] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: googleClientId,
    androidClientId: googleClientId,
    iosClientId: googleClientId,
    scopes: [
      'https://www.googleapis.com/auth/generative-language',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/youtube.force-ssl'
    ],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        setGoogleAccessToken(authentication.accessToken);
        if (Platform.OS === 'web') {
           localStorage.setItem('google_access_token', authentication.accessToken);
        }
      }
    }
  }, [response]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const savedKey = localStorage.getItem('gemini_api_key');
      const savedClientId = localStorage.getItem('google_client_id');
      const savedToken = localStorage.getItem('google_access_token');
      const savedModel = localStorage.getItem('gemini_selected_model');
      const savedRootPath = localStorage.getItem('markdown_explorer_root_path');
      
      const savedProvider = localStorage.getItem('ai_provider');
      const savedOpenaiKey = localStorage.getItem('openai_api_key');
      const savedClaudeKey = localStorage.getItem('claude_api_key');
      
      if (savedKey) { setGeminiApiKey(savedKey); setTempApiKey(savedKey); }
      if (savedClientId) { setGoogleClientId(savedClientId); setTempClientId(savedClientId); }
      if (savedToken) { setGoogleAccessToken(savedToken); }
      if (savedRootPath) { setRootPath(savedRootPath); setTempRootPath(savedRootPath); }
      
      // AI Provider Self-Healing
      let activeProvider: 'gemini' | 'openai' | 'claude' = 'gemini';
      if (savedProvider && (savedProvider === 'gemini' || savedProvider === 'openai' || savedProvider === 'claude')) {
        activeProvider = savedProvider;
      }
      setAiProvider(activeProvider);
      setTempAiProvider(activeProvider);

      // Selected Model Self-Healing & Default Loading
      if (savedModel) {
        const providerConfig = AI_PROVIDERS[activeProvider];
        const modelExists = providerConfig.models.some((m: any) => m.value === savedModel);
        
        if (modelExists) {
          setSelectedModel(savedModel);
          setTempModel(savedModel);
        } else {
          // Fallback to the provider's default model (Self-healing)
          const fallbackModel = providerConfig.defaultModel;
          setSelectedModel(fallbackModel);
          setTempModel(fallbackModel);
          localStorage.setItem('gemini_selected_model', fallbackModel);
        }
      } else {
        const defaultModelForProvider = AI_PROVIDERS[activeProvider].defaultModel;
        setSelectedModel(defaultModelForProvider);
        setTempModel(defaultModelForProvider);
      }
      
      if (savedOpenaiKey) { 
        setOpenaiApiKey(savedOpenaiKey); 
        setTempOpenaiApiKey(savedOpenaiKey); 
      }
      if (savedClaudeKey) { 
        setClaudeApiKey(savedClaudeKey); 
        setTempClaudeApiKey(savedClaudeKey); 
      }
    }
  }, []);

  const saveSettings = useCallback(() => {
    setGeminiApiKey(tempApiKey);
    setGoogleClientId(tempClientId);
    setSelectedModel(tempModel);
    setRootPath(tempRootPath);
    
    setAiProvider(tempAiProvider);
    setOpenaiApiKey(tempOpenaiApiKey);
    setClaudeApiKey(tempClaudeApiKey);
    
    if (Platform.OS === 'web') {
      localStorage.setItem('gemini_api_key', tempApiKey);
      localStorage.setItem('google_client_id', tempClientId);
      localStorage.setItem('gemini_selected_model', tempModel);
      localStorage.setItem('markdown_explorer_root_path', tempRootPath);
      
      localStorage.setItem('ai_provider', tempAiProvider);
      localStorage.setItem('openai_api_key', tempOpenaiApiKey);
      localStorage.setItem('claude_api_key', tempClaudeApiKey);
    }
    setShowGeminiSettings(false);
  }, [tempApiKey, tempClientId, tempModel, tempRootPath, tempAiProvider, tempOpenaiApiKey, tempClaudeApiKey]);

  const logout = useCallback(() => {
    setGoogleAccessToken(null);
    if (Platform.OS === 'web') {
      localStorage.removeItem('google_access_token');
    }
  }, []);

  return {
    geminiApiKey,
    googleClientId,
    googleAccessToken,
    showGeminiSettings, setShowGeminiSettings,
    tempApiKey, setTempApiKey,
    tempClientId, setTempClientId,
    selectedModel, setSelectedModel,
    tempModel, setTempModel,
    rootPath, setRootPath,
    tempRootPath, setTempRootPath,
    promptAsync,
    saveSettings,
    logout,
    setGeminiApiKey,
    
    // Multi-Provider Exports
    aiProvider, setAiProvider,
    tempAiProvider, setTempAiProvider,
    openaiApiKey, setOpenaiApiKey,
    tempOpenaiApiKey, setTempOpenaiApiKey,
    claudeApiKey, setClaudeApiKey,
    tempClaudeApiKey, setTempClaudeApiKey,
  };
}

