export const AVAILABLE_MODELS = [
  { label: 'Gemini 3.1 Pro (Reasoning)', value: 'gemini-3.1-pro-preview' },
  { label: 'Gemini 3.1 Flash Lite', value: 'gemini-3.1-flash-lite-preview' },
  { label: 'Gemini 3 Flash (Fast)', value: 'gemini-3-flash-preview' },
  { label: 'Gemini 2.5 Pro (GA)', value: 'gemini-2.5-pro' },
  { label: 'Gemini 2.5 Flash (GA)', value: 'gemini-2.5-flash' },
] as const;

export const DEFAULT_MODEL = 'gemini-2.5-pro';
