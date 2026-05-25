# 테마 및 외관 설정 (Themes) 가이드
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="10%" alt="Gemini Banner" />

<br/>

## 출처
- Gemini CLI Themes guide : https://geminicli.com/docs/cli/themes/

<br/>

## 1. 테마란 무엇인가?
Gemini CLI는 사용자의 취향과 터미널 환경에 맞춰 대화창의 색상 구성과 전체적인 외관을 변경할 수 있는 다양한 테마를 지원합니다. 시인성을 높이기 위해 다크 모드와 라이트 모드를 자유롭게 전환할 수 있습니다.

<br/>

## 2. 테마 변경 방법
1.  Gemini CLI 프롬프트에서 `/theme`를 입력합니다.
2.  사용 가능한 테마 목록이 나타나는 대화형 선택창이 표시됩니다.
3.  방향키를 사용하여 원하는 테마를 선택하고 엔터를 눌러 즉시 적용합니다.

> [!NOTE]
> 만약 `settings.json` 파일에 이미 특정 테마가 고정되어 선언되어 있다면, `/theme` 명령어를 사용하기 전에 해당 설정 줄을 삭제해야 정상적으로 변경이 가능합니다.

<br/>

## 3. 기본 제공 테마 목록
Gemini CLI는 현대적인 개발 환경에 맞춘 다양한 프리셋 테마를 제공합니다.

- **다크 테마 (Dark Themes)**: 
  - `Default`, `Ayu`, `Dracula`, `Tokyo Night`, `Atom One`, `Solarized Dark`, `Shades Of Purple`, `GitHub`, `Holiday`, `ANSI`
- **라이트 테마 (Light Themes)**: 
  - `Default Light`, `Ayu Light`, `Xcode`, `Google Code`, `GitHub Light`, `Solarized Light`, `ANSI Light`

<br/>

## 4. 커스텀 테마 제작 (Custom Themes)
제공되는 테마 외에도 `settings.json`에 `customThemes` 블록을 추가하여 나만의 색상 팔레트를 완벽하게 제어할 수 있습니다.

### 커스텀 테마 정의 예시
```json
{
  "ui": {
    "customThemes": {
      "MyBrandTheme": {
        "name": "MyBrandTheme",
        "type": "custom",
        "background": {
          "primary": "#1a1a1a"
        },
        "text": {
          "primary": "#ffffff",
          "secondary": "#888888",
          "link": "cyan",
          "accent": "coral"
        }
      }
    }
  }
}
```

### 주요 설정 항목
- **`text`**: 기본 텍스트, 강조색, 링크, AI 답변(`response`) 색상.
- **`background`**: 전체 배경색 및 코드 변경점(`diff`)의 추가/삭제 배경색.
- **`status`**: 성공(Success), 경고(Warning), 에러(Error) 발생 시의 색상 표시.
- **`ui`**: 주석(Comment), 연산자(Symbol), 그라데이션 효과 색상.

<br/>

## 5. 테마 파일 로드 및 보안 (Advanced)
테마 설정을 별도의 JSON 파일로 관리하여 공유하거나 다른 시스템에서 불러올 수 있습니다. `settings.json`의 `theme` 속성에 파일 경로를 지정하세요.

```json
{
  "ui": {
    "theme": "/Users/user/.gemini/my-theme.json"
  }
}
```

> [!CAUTION]
> **보안 주의**: Gemini CLI는 사용자의 **홈 디렉토리(`~`) 내부에 위치한 테마 파일만** 로드합니다. 신뢰할 수 없는 외부 소스에서 악성 테마 파일이 실행되는 것을 방지하기 위한 조치입니다.

---
**추가 정보**: 설치된 [확장 기능(Extensions)](/docs/extensions)에서 제공하는 테마도 자동으로 목록에 추가되며, 에디터 통합 모드를 사용하는 경우 IDE의 테마 설정을 자동으로 따르기도 합니다.

<br/>

---

## Dark themes

### ANSI

<img src="https://geminicli.com/docs/assets/theme-ansi-dark.png" alt="ANSI theme" width="600">

### Atom One

<img src="https://geminicli.com/docs/assets/theme-atom-one-dark.png" alt="Atom One theme" width="600">

### Ayu

<img src="https://geminicli.com/docs/assets/theme-ayu-dark.png" alt="Ayu theme" width="600">

### Default

<img src="https://geminicli.com/docs/assets/theme-default-dark.png" alt="Default theme" width="600">

### Dracula

<img src="https://geminicli.com/docs/assets/theme-dracula-dark.png" alt="Dracula theme" width="600">

### GitHub

<img src="https://geminicli.com/docs/assets/theme-github-dark.png" alt="GitHub theme" width="600">

### Holiday

<img src="https://geminicli.com/docs/assets/theme-holiday-dark.png" alt="Holiday theme" width="600">

### Shades Of Purple

<img src="https://geminicli.com/docs/assets/theme-shades-of-purple-dark.png" alt="Shades Of Purple theme" width="600">

### Solarized Dark

<img src="https://geminicli.com/docs/assets/theme-solarized-dark.png" alt="Solarized Dark theme" width="600">

### Tokyo Night

<img src="https://geminicli.com/docs/assets/theme-tokyonight-dark.png" alt="Tokyo Night theme" width="600">

---

## Light themes

### ANSI Light

<img src="https://geminicli.com/docs/assets/theme-ansi-light.png" alt="ANSI Light theme" width="600">

### Ayu Light

<img src="https://geminicli.com/docs/assets/theme-ayu-light.png" alt="Ayu Light theme" width="600">

### Default Light

<img src="https://geminicli.com/docs/assets/theme-default-light.png" alt="Default Light theme" width="600">

### GitHub Light

<img src="https://geminicli.com/docs/assets/theme-github-light.png" alt="GitHub Light theme" width="600">

### Google Code

<img src="https://geminicli.com/docs/assets/theme-google-light.png" alt="Google Code theme" width="600">

### Solarized Light

<img src="https://geminicli.com/docs/assets/theme-solarized-light.png" alt="Solarized Light theme" width="600">

### Xcode

<img src="https://geminicli.com/docs/assets/theme-xcode-light.png" alt="Xcode Light theme" width="600">
