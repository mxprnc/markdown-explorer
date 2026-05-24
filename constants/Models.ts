export const AVAILABLE_MODELS = [
  { label: 'Gemini 3.5 Flash (Fast/GA)', value: 'gemini-3.5-flash' },
  { label: 'Gemini 3.1 Pro (Reasoning)', value: 'gemini-3.1-pro-preview' },
  { label: 'Gemini 3.1 Flash Lite (Cost)', value: 'gemini-3.1-flash-lite' },
  { label: 'Gemini 2.5 Pro (GA)', value: 'gemini-2.5-pro' },
] as const;

export const DEFAULT_MODEL = 'gemini-3.5-flash';

export const AI_PROVIDERS = {
  gemini: {
    label: 'Google Gemini',
    value: 'gemini',
    models: AVAILABLE_MODELS,
    defaultModel: DEFAULT_MODEL,
  },
  openai: {
    label: 'OpenAI',
    value: 'openai',
    models: [
      { label: 'GPT-5.5 (Latest Upper)', value: 'gpt-5.5' },
      { label: 'GPT-5.5 Pro (Deep Reasoning)', value: 'gpt-5.5-pro' },
      { label: 'GPT-5.4 (High Intelligence)', value: 'gpt-5.4' },
      { label: 'GPT-5.4 Mini (Fast)', value: 'gpt-5.4-mini' },
      { label: 'GPT-5.4 Nano (Cost Optimized)', value: 'gpt-5.4-nano' },
      { label: 'GPT-5 (Standard)', value: 'gpt-5' },
      { label: 'GPT-5 Mini (Fast Standard)', value: 'gpt-5-mini' },
      { label: 'GPT-5 Nano (High Speed)', value: 'gpt-5-nano' },
      { label: 'GPT-4.1 (Legacy Standard)', value: 'gpt-4.1' },
    ],
    defaultModel: 'gpt-5.4-mini',
  },
  claude: {
    label: 'Anthropic Claude',
    value: 'claude',
    models: [
      { label: 'Claude 4.6 Sonnet (Balanced/GA)', value: 'claude-sonnet-4-6' },
      { label: 'Claude 4.6 Opus (Highest Intelligence)', value: 'claude-opus-4-6' },
      { label: 'Claude 4.5 Sonnet (Standard)', value: 'claude-sonnet-4-5-20250514' },
      { label: 'Claude 4.5 Haiku (Fast/Cost)', value: 'claude-haiku-4-5-20251001' },
    ],
    defaultModel: 'claude-sonnet-4-6',
  },
} as const;

export type AIProviderType = keyof typeof AI_PROVIDERS;

