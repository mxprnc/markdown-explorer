import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { App } from '@/core/App';
import { PluginManager } from '@/core/plugin/PluginManager';
import { Plugin } from '@/core/plugin/Plugin';

interface PluginContextType {
  pluginManager: PluginManager;
  enabledPluginIds: string[];
  allPlugins: Plugin[];
  enablePlugin: (id: string) => Promise<void>;
  disablePlugin: (id: string) => Promise<void>;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export const PluginProvider: React.FC<{ children: React.ReactNode; app: App }> = ({ children, app }) => {
  const [enabledPluginIds, setEnabledPluginIds] = useState<string[]>([]);
  
  // PluginManager는 한 번만 생성되도록 useMemo 사용
  const pluginManager = useMemo(() => new PluginManager(app), [app]);

  useEffect(() => {
    // 초기 로딩 시 플러그인 상태 동기화
    setEnabledPluginIds(pluginManager.getEnabledPluginIds());
  }, [pluginManager]);

  const enablePlugin = async (id: string) => {
    await pluginManager.enablePlugin(id);
    setEnabledPluginIds(pluginManager.getEnabledPluginIds());
  };

  const disablePlugin = async (id: string) => {
    await pluginManager.disablePlugin(id);
    setEnabledPluginIds(pluginManager.getEnabledPluginIds());
  };

  const allPlugins = pluginManager.getPlugins();

  return (
    <PluginContext.Provider value={{ pluginManager, enabledPluginIds, allPlugins, enablePlugin, disablePlugin }}>
      {children}
    </PluginContext.Provider>
  );
};

export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (!context) throw new Error('usePlugins must be used within a PluginProvider');
  return context;
};
