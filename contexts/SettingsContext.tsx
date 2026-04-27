import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSetting, setSetting } from '@/utils/IndexedDBUtils';
import { useGemini } from '@/hooks/useGemini';

interface APIKeys {
  youtube?: string;
  gemini?: string;
}

interface SettingsContextType {
  // Global App Settings
  apiKeys: APIKeys;
  updateAPIKey: (type: keyof APIKeys, key: string) => Promise<void>;
  deleteAPIKey: (type: keyof APIKeys) => Promise<void>;
  isSettingsVisible: boolean;
  setSettingsVisible: (visible: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Gemini Integrated Settings (from useGemini)
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  googleClientId: string;
  googleAccessToken: string | null;
  showGeminiSettings: boolean;
  setShowGeminiSettings: (show: boolean) => void;
  tempApiKey: string;
  setTempApiKey: (key: string) => void;
  tempClientId: string;
  setTempClientId: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  tempModel: string;
  setTempModel: (model: string) => void;
  rootPath: string;
  setRootPath: (path: string) => void;
  tempRootPath: string;
  setTempRootPath: (path: string) => void;
  promptAsync: any;
  saveSettings: () => void;
  logout: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [apiKeys, setApiKeys] = useState<APIKeys>({});
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('api');
  
  // Reuse existing useGemini logic
  const gemini = useGemini();

  useEffect(() => {
    const loadSettings = async () => {
      const savedKeys = await getSetting('api_keys');
      if (savedKeys) {
        setApiKeys(savedKeys);
        // Sync with Gemini if exists
        if (savedKeys.gemini) {
          gemini.setGeminiApiKey(savedKeys.gemini);
        }
      }
    };
    loadSettings();
  }, []);

  const updateAPIKey = async (type: keyof APIKeys, key: string) => {
    const newKeys = { ...apiKeys, [type]: key };
    setApiKeys(newKeys);
    await setSetting('api_keys', newKeys);
    
    // Sync Gemini if changed
    if (type === 'gemini') {
      gemini.setGeminiApiKey(key);
      gemini.setTempApiKey(key); // Also update temp for modal
    }
  };

  const deleteAPIKey = async (type: keyof APIKeys) => {
    const newKeys = { ...apiKeys };
    delete newKeys[type];
    setApiKeys(newKeys);
    await setSetting('api_keys', newKeys);
    
    if (type === 'gemini') {
      gemini.setGeminiApiKey('');
      gemini.setTempApiKey('');
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      apiKeys, 
      updateAPIKey, 
      deleteAPIKey,
      isSettingsVisible,
      setSettingsVisible,
      activeTab,
      setActiveTab,
      ...gemini
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within a SettingsProvider');
  }
  return context;
}

export const useSettings = useAppSettings;
