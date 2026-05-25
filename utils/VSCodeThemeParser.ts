import { ThemeConfig } from '@/core/App';

/**
 * VSCode 테마 JSON 문자열을 파싱하여 Mark Explorer의 ThemeConfig 형태로 변환합니다.
 */
export function parseVSCodeTheme(jsonString: string, id: string, name: string): ThemeConfig {
  let vscodeColors: Record<string, string> = {};
  let isDark = true; // 기본값은 Dark 테마

  try {
    // 주석이 섞여 있을 수 있는 JSON 대응 (주석 제거 정규식 적용)
    const cleanJson = jsonString
      .replace(/\/\*[\s\S]*?\*\//g, '') // 멀티라인 주석 제거
      .replace(/\/\/.*/g, '')          // 싱글라인 주석 제거
      .replace(/,(\s*[\]}])/g, '$1');   // 트레일링 콤마 제거

    const rawData = JSON.parse(cleanJson);
    
    // VSCode 테마의 colors 필드 추출
    if (rawData.colors && typeof rawData.colors === 'object') {
      vscodeColors = rawData.colors;
    }
  } catch (error) {
    console.error('[VSCodeThemeParser] Failed to parse JSON', error);
    throw new Error('Invalid JSON format. Please check the JSON syntax.');
  }

  // 헬퍼: 여러 후보 키 중에서 가장 먼저 존재하는 색상 값 반환, 없으면 기본값 반환
  const getColor = (keys: string[], fallback: string): string => {
    for (const key of keys) {
      if (vscodeColors[key] && typeof vscodeColors[key] === 'string') {
        return vscodeColors[key];
      }
    }
    return fallback;
  };

  // 16진수 색상의 밝기(Luminance)를 분석하여 어두운 테마인지 판별하는 헬퍼
  const isColorDark = (hexColor: string): boolean => {
    let color = hexColor.trim().replace('#', '');
    if (color.length === 3) {
      color = color.split('').map(c => c + c).join('');
    }
    if (color.length >= 6) {
      const r = parseInt(color.substring(0, 2), 16);
      const g = parseInt(color.substring(2, 4), 16);
      const b = parseInt(color.substring(4, 6), 16);
      // YIQ 공식을 적용해 명도 산출 (140 미만이면 어두운 색으로 간주)
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq < 140;
    }
    return true; // 기본값은 Dark
  };

  // 기본 테마 폴백 색상
  const defaultColors = {
    dark: {
      background: '#0b0e14',
      text: '#e2e8f0',
      border: 'rgba(255, 255, 255, 0.06)',
      surface: '#151921',
      primary: '#7c3aed',
      textMuted: '#94a3b8',
      textHighlight: '#ffffff',
      accentGlow: 'rgba(124, 58, 237, 0.15)',
    },
    light: {
      background: '#FFFFFF',
      text: '#121212',
      border: '#E5E7EB',
      surface: '#F9FAFB',
      primary: '#3B82F6',
      textMuted: '#6B7280',
      textHighlight: '#000000',
      accentGlow: 'rgba(59, 130, 246, 0.08)',
    }
  };

  // 임시로 배경을 먼저 구해서 테마의 진짜 밝기를 자체 판단 (JSON 메타데이터 오타 방어)
  const tempBg = getColor(['editor.background', 'sideBar.background', 'background'], '#0b0e14');
  isDark = isColorDark(tempBg);

  const fallbacks = isDark ? defaultColors.dark : defaultColors.light;

  const parsedBackground = getColor(['editor.background', 'sideBar.background', 'background'], fallbacks.background);
  const parsedText = getColor(['editor.foreground', 'foreground'], fallbacks.text);
  const parsedBorder = getColor(['editorGroup.border', 'sideBar.border', 'panel.border', 'borders'], fallbacks.border);
  const parsedSurface = getColor(['sideBar.background', 'tab.inactiveBackground', 'editorWidget.background', 'surface'], fallbacks.surface);
  const parsedPrimary = getColor(['button.background', 'statusBar.background', 'activityBarBadge.background', 'primary'], fallbacks.primary);
  
  // Heuristic 1: Safe Contrast Hierarchy for Comments / Muted Text
  // VSCode themes often don't contain a separate textMuted color or map it to foreground, which ruins hierarchy.
  let parsedTextMuted = getColor(['tab.inactiveForeground', 'descriptionForeground', 'textMuted'], fallbacks.textMuted);
  if (
    parsedTextMuted.toLowerCase() === parsedText.toLowerCase() || 
    (parsedTextMuted.startsWith('#') && parsedText.startsWith('#') && parsedTextMuted.substring(0, 4) === parsedText.substring(0, 4))
  ) {
    parsedTextMuted = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)';
  }

  const parsedTextHighlight = getColor(['editor.selectionBackground', 'editor.findMatchHighlightBackground', 'textHighlight'], fallbacks.textHighlight);
  
  // Heuristic 2: Safe Transparency for Accent Glow / Hover Highlights
  // VSCode line highlights are solid opaque colors which look harsh as web block hover backgrounds.
  // We automatically inject a safe 12%-15% opacity to hex values.
  let parsedAccentGlow = getColor(['editor.lineHighlightBackground', 'accentGlow'], fallbacks.accentGlow);
  if (parsedAccentGlow.startsWith('#')) {
    const cleanHex = parsedAccentGlow.replace('#', '');
    if (cleanHex.length === 6) {
      parsedAccentGlow = `#${cleanHex}22`; // Add ~13% transparency
    } else if (cleanHex.length === 8) {
      parsedAccentGlow = `#${cleanHex.substring(0, 6)}22`; // Force safe transparency
    } else if (cleanHex.length === 3) {
      const expanded = cleanHex.split('').map(c => c + c).join('');
      parsedAccentGlow = `#${expanded}22`;
    }
  }

  return {
    id,
    name,
    isDark,
    colors: {
      background: parsedBackground,
      text: parsedText,
      border: parsedBorder,
      surface: parsedSurface,
      primary: parsedPrimary,
      textMuted: parsedTextMuted,
      textHighlight: parsedTextHighlight,
      accentGlow: parsedAccentGlow,
    }
  };
}

