import React, { createContext, useContext } from 'react';
import { useGemini } from '@/hooks/useGemini';

interface SettingsContextType {
  geminiApiKey: string;
  googleClientId: string;
  googleAccessToken: string;
  showGeminiSettings: boolean;
  setShowGeminiSettings: (show: boolean) => void;
  tempApiKey: string;
  setTempApiKey: (key: string) => void;
  tempClientId: string;
  setTempClientId: (id: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  tempModel: string;
  setTempModel: (model: string) => void;
  rootPath: string;
  setRootPath: (path: string) => void;
  tempRootPath: string;
  setTempRootPath: (path: string) => void;
  saveSettings: () => void;
  logout: () => void;
  promptAsync: any;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const gemini = useGemini();

  return (
    <SettingsContext.Provider value={gemini}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
