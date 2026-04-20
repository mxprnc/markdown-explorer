import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { DEFAULT_MODEL } from '@/constants/Models';

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

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: googleClientId,
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
      
      if (savedKey) { setGeminiApiKey(savedKey); setTempApiKey(savedKey); }
      if (savedClientId) { setGoogleClientId(savedClientId); setTempClientId(savedClientId); }
      if (savedToken) { setGoogleAccessToken(savedToken); }
      if (savedModel) { setSelectedModel(savedModel); setTempModel(savedModel); }
      if (savedRootPath) { setRootPath(savedRootPath); setTempRootPath(savedRootPath); }
    }
  }, []);

  const saveSettings = useCallback(() => {
    setGeminiApiKey(tempApiKey);
    setGoogleClientId(tempClientId);
    setSelectedModel(tempModel);
    setRootPath(tempRootPath);
    if (Platform.OS === 'web') {
      localStorage.setItem('gemini_api_key', tempApiKey);
      localStorage.setItem('google_client_id', tempClientId);
      localStorage.setItem('gemini_selected_model', tempModel);
      localStorage.setItem('markdown_explorer_root_path', tempRootPath);
    }
    setShowGeminiSettings(false);
  }, [tempApiKey, tempClientId, tempModel, tempRootPath]);

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
  };
}
