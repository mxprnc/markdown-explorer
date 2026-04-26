
## 증상 (1)
다음은 다크모드를 선택했을 때에 대한 색상조합, 테마의 모습입니다.
(1)
- ![alt text](screenshot1-1.png)


(2)
- ![alt text](screenshot1-2.png)


(3)
![alt text](screenshot1-3.png)


toc_demo.png 에 대한 다크테마에서 어떻게 보이면 좋을지를 고려해서 조합한 다크모드에 대한 디자인 및 전반적인 색상조합, 컴포넌트 스타일 등에 대한 정제된 디자인을 제시하는 프롬프트를 제시하세요.

바로 아래의 ### 프롬프트에 작성하세요. ## 증상(1) 의 내용은 삭제하거나 수정하지 마세요.

### 프롬프트
당신은 프리미엄 마크다운 에디터 'Mark Explorer'의 수석 UI/UX 디자이너입니다. 제공된 3가지 다크모드 시안과 `toc_demo.png`를 기반으로, 가장 완성도 높고 눈이 편안하면서도 현대적인 'Ultimate Dark Mode' 디자인 가이드를 생성하세요.

#### 🎯 디자인 목표
사용자가 장시간 문서 작업을 해도 피로하지 않도록 가독성을 최우선으로 하되, 'Mark Explorer'만의 프리미엄한 감성(Modern, Sleek, Professional)을 유지합니다.

#### 🎨 1. 핵심 색상 및 테마 시스템
- **Primary Background**: `#0b0e14` (완전한 블랙보다 깊이감이 느껴지는 Obsidian Black)
- **Secondary Background (Sidebar/Panels)**: `#151921` (배경과 뚜렷이 구분되면서도 조화로운 톤)
- **Accent Color**: `#7c3aed` (Vivid Violet) 또는 `#0ea5e9` (Sky Blue)를 활용한 포인트
- **Surface & Borders**: `#1e293b`를 0.5px 두께의 섬세한 경계선으로 사용 (`rgba(255, 255, 255, 0.05)`)
- **Text Hierarchy**:
  - Main Text: `#e2e8f0` (부드러운 오프화이트)
  - Sub Text/Muted: `#94a3b8`
  - Active/Highlight: `#ffffff`

#### 📑 2. TOC (Table of Contents) 정제 디자인
- **위치 및 구조**: 우측 사이드바에 고정(Sticky). 에디터 영역과 미세한 경계선 또는 그림자로 분리.
- **Active State (현재 읽는 구간)**:
  - 텍스트 좌측에 3px 두께의 둥근 모서리를 가진 액센트 컬러 수직 바 표시.
  - 해당 항목의 텍스트를 `#ffffff`로 볼드 처리하고, 배경에 아주 미세한 그라데이션(`rgba(accent, 0.08)`) 적용.
- **Interaction**: 호버 시 텍스트 색상이 부드럽게 변하며, 클릭 시 부드러운 스크롤 애니메이션 작동.

#### 🖋 3. 컴포넌트 및 에디터 스타일
- **Editor**: 여백(Padding)을 충분히 두어 콘텐츠에 집중할 수 있는 레이아웃.
- **Glassmorphism**: 사이드바나 플로팅 메뉴에 `backdrop-filter: blur(12px)`를 적용하여 고급스러운 깊이감 부여.
- **Typography**: 코드 블록과 일반 텍스트의 폰트 패밀리를 명확히 구분하되, 행간(Line-height)을 1.6 이상으로 설정하여 가독성 확보.

위 가이드라인을 바탕으로, React(Tailwind 또는 CSS Module) 환경에서 즉시 적용 가능한 **디자인 토큰(CSS Variables)**과 **핵심 컴포넌트의 스타일 코드**를 제안해주세요.


바로 아래의 ### 디자인 가이드 섹션에 내용을 작성하세요. 위의 ### 프롬프트 섹션의 내용은 삭제하거나 수정하지 마세요.

### 디자인 가이드
제시해주신 프리미엄 다크 모드 가이드라인을 바탕으로, 'Mark Explorer'에 즉시 적용 가능한 디자인 시스템과 핵심 컴포넌트 코드를 제안합니다.

#### 1. 디자인 시스템 토큰 (CSS Variables)
모든 컴포넌트에서 일관된 테마를 유지하기 위해 다음 변수들을 최상위에 정의합니다.

```css
:root {
  /* Colors */
  --color-bg-primary: #0b0e14;
  --color-bg-secondary: #151921;
  --color-accent: #7c3aed; /* Vivid Violet */
  --color-accent-glow: rgba(124, 58, 237, 0.15);
  
  /* Borders & Surfaces */
  --color-border: rgba(255, 255, 255, 0.05);
  --color-surface-hover: rgba(255, 255, 255, 0.03);
  
  /* Text */
  --color-text-main: #e2e8f0;
  --color-text-muted: #94a3b8;
  --color-text-highlight: #ffffff;
  
  /* Layout & Effects */
  --glass-blur: blur(12px);
  --glass-bg: rgba(21, 25, 33, 0.8);
  --shadow-premium: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}
```

#### 2. 핵심 컴포넌트 스타일링

**🧭 TOC (Table of Contents)**
우측 사이드바에 위치하며 사용자의 가독성을 극대화하는 스타일입니다.

```tsx
// TOCItem.tsx (Tailwind CSS 활용 예시)
const TOCItem = ({ title, depth, isActive }) => (
  <div className={`
    relative py-1.5 transition-all duration-200 cursor-pointer group
    ${depth > 1 ? `ml-${(depth - 1) * 3}` : ''}
    ${isActive ? 'bg-[var(--color-accent-glow)] rounded-r-md' : 'hover:bg-[var(--color-surface-hover)]'}
  `}>
    {/* Active Indicator Bar: 둥근 모서리와 글로우 효과 */}
    {isActive && (
      <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-[var(--color-accent)] rounded-full shadow-[0_0_10px_var(--color-accent)]" />
    )}
    
    <span className={`
      pl-4 text-sm block transition-colors
      ${isActive ? 'text-[var(--color-text-highlight)] font-semibold' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]'}
    `}>
      {title}
    </span>
  </div>
);
```

**🖼️ 에디터 쉘 및 글래스모피즘 사이드바**
배경과의 조화를 유지하면서도 레이어 간의 깊이감을 부여합니다.

```css
/* Sidebar.css */
.sidebar-container {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-right: 1px solid var(--color-border);
  box-shadow: var(--shadow-premium);
}

/* EditorArea.css */
.editor-main {
  background-color: var(--color-bg-primary);
  color: var(--color-text-main);
  line-height: 1.7; /* 가독성을 위한 충분한 행간 */
  letter-spacing: -0.01em;
  padding: 4rem 10%; /* 시각적 노이즈를 줄이기 위한 충분한 여백 */
  max-width: 900px;
  margin: 0 auto;
}
```

#### 3. 마크다운 요소 및 가독성 디테일
- **Headings**: H1~H3 태그는 `font-weight: 700`과 함께 섹션 시작 시 적절한 상단 여백을 두어 구조적 명확성을 제공합니다.
- **Code Blocks**: `#1a1e26` 배경색과 `border: 1px solid var(--color-border)`를 적용하여 코드의 독립성을 강조합니다.
- **Scrollbar**: 
  ```css
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { 
    background: var(--color-border); 
    border-radius: 10px; 
  }
  ::-webkit-scrollbar-thumb:hover { background: var(--color-accent); }
  ```

이 가이드라인은 'Mark Explorer'의 다크 모드를 단순한 어두운 테마를 넘어, 하나의 **몰입형 작업 환경**으로 격상시킬 것입니다.

