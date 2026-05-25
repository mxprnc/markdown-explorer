import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { App } from '@/core/App';
import { PluginManager } from '@/core/plugin/PluginManager';
import { Plugin } from '@/core/plugin/Plugin';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { registerTheme, unregisterTheme, setActiveThemeId } = useTheme();
  
  // PluginManager는 한 번만 생성되도록 useMemo 사용
  const pluginManager = useMemo(() => new PluginManager(app), [app]);

  const [allPlugins, setAllPlugins] = useState<Plugin[]>(() => pluginManager.getPlugins());
 
  useEffect(() => {
    // 테마 등록/해제/활성화 이벤트 리스너 바인딩
    const handleRegister = (theme: any) => registerTheme(theme);
    const handleUnregister = (id: string) => unregisterTheme(id);
    const handleSetActive = (id: string | null) => setActiveThemeId(id);

    app.on('theme:register', handleRegister);
    app.on('theme:unregister', handleUnregister);
    app.on('theme:set-active', handleSetActive);

    return () => {
      app.off('theme:register', handleRegister);
      app.off('theme:unregister', handleUnregister);
      app.off('theme:set-active', handleSetActive);
    };
  }, [app, registerTheme, unregisterTheme, setActiveThemeId]);

  useEffect(() => {
    // 템플릿 플러그인 등록 (PoC용 직접 등록)
    const { TemplatesPlugin } = require('@/plugins/templates/TemplatesPlugin');
    pluginManager.registerPlugin(
      { id: 'templates', name: 'Templates', version: '1.0.0', author: 'Mark Explorer', type: 'functional', description: 'Supports inserting customized markdown templates directly into the active editor.' },
      TemplatesPlugin
    );

    // 원 다크 프로 테마 플러그인 등록 (기본 내장 등록)
    const { OneDarkProPlugin } = require('@/plugins/themes/OneDarkProPlugin');
    pluginManager.registerPlugin(
      { id: 'one-dark-pro', name: 'One Dark Pro', version: '1.0.0', author: 'Mark Explorer', type: 'theme', description: 'The classic One Dark Pro theme for developers.' },
      OneDarkProPlugin
    );

    // 도쿄 나이트 테마 플러그인 등록 (PoC용 직접 등록)
    const { TokyoNightPlugin } = require('@/plugins/themes/TokyoNightPlugin');
    pluginManager.registerPlugin(
      { id: 'tokyo-night', name: 'Tokyo Night Theme', version: '1.0.0', author: 'Mark Explorer', type: 'theme', description: 'A beautiful neon dark theme inspired by Tokyo Night.' },
      TokyoNightPlugin
    );

    // 테마 편집기 플러그인 등록 (Phase 3 직접 등록)
    const { ThemeEditorPlugin } = require('@/plugins/theme-editor/ThemeEditorPlugin');
    pluginManager.registerPlugin(
      { id: 'theme-editor', name: 'Theme Editor', version: '1.0.0', author: 'Mark Explorer', type: 'functional', description: 'Real-time WYSIWYG theme builder allowing custom color scheme creations and exporting.' },
      ThemeEditorPlugin
    );
    
    // 기본적으로 활성화
    Promise.all([
      pluginManager.enablePlugin('templates'),
      pluginManager.enablePlugin('theme-editor'),
      pluginManager.enablePlugin('one-dark-pro')
    ]).then(() => {
      setEnabledPluginIds(pluginManager.getEnabledPluginIds());
      setAllPlugins(pluginManager.getPlugins());
    });
  }, [pluginManager]);

  useEffect(() => {
    // 초기 로딩 시 플러그인 상태 동기화
    setEnabledPluginIds(pluginManager.getEnabledPluginIds());
    setAllPlugins(pluginManager.getPlugins());
  }, [pluginManager]);

  const enablePlugin = async (id: string) => {
    await pluginManager.enablePlugin(id);
    setEnabledPluginIds(pluginManager.getEnabledPluginIds());
    setAllPlugins(pluginManager.getPlugins());
  };

  const disablePlugin = async (id: string) => {
    await pluginManager.disablePlugin(id);
    // 테마 플러그인 비활성화 시 자동 테마 적용 해제 처리
    const plugin = pluginManager.getPlugin(id);
    if (plugin && plugin.manifest.type === 'theme') {
      setActiveThemeId(null);
    }
    setEnabledPluginIds(pluginManager.getEnabledPluginIds());
    setAllPlugins(pluginManager.getPlugins());
  };

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
