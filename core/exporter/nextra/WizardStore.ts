import { create } from 'zustand';
import { NextraConfig } from './types';

export const THEME_PRESETS = {
  'nextjs': { label: 'Next.js (Dark)', h: 0, s: 0, l: 0 },
  'tailwind': { label: 'Tailwind Blue', h: 199, s: 89, l: 48 },
  'ocean': { label: 'Ocean Blue', h: 210, s: 80, l: 50 },
  'forest': { label: 'Forest Green', h: 142, s: 76, l: 36 },
  'sunset': { label: 'Sunset Orange', h: 24, s: 100, l: 50 },
};

interface WizardState {
  step: number;
  config: NextraConfig;
  setStep: (step: number) => void;
  updateConfig: (updater: (prev: NextraConfig) => NextraConfig) => void;
  reset: () => void;
}

const initialConfig: NextraConfig = {
  projectInfo: {
    title: '',
    github: '',
    footer: 'Built with Mark Explorer',
  },
  theme: {
    preset: 'ocean',
    customColor: { h: 210, s: 80, l: 50 },
    useCustom: false,
    darkMode: 'system',
  },
  exportOptions: {
    convertToMdx: false,
    sortOrder: 'explorer',
    includeAssets: true,
    imageStrategy: 'slugified-colocation',
  },
};

export const useWizardStore = create<WizardState>((set) => ({
  step: 1,
  config: initialConfig,
  setStep: (step) => set({ step }),
  updateConfig: (updater) => set((state) => ({ config: updater(state.config) })),
  reset: () => set({ step: 1, config: initialConfig }),
}));
