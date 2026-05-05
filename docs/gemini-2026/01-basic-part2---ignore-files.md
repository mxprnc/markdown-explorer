# 파일 무시 설정 (.geminiignore) 가이드
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="10%" alt="Gemini Banner" />

<br/>

## 출처
- Gemini Ignore guide : https://geminicli.com/docs/cli/gemini-ignore/

<br/>

## 1. .geminiignore란 무엇인가?
`.geminiignore` 파일은 Gemini CLI가 프로젝트 파일을 탐색하거나 `@` 명령어로 파일을 참조할 때, 특정 항목을 목록에서 제외하도록 설정하는 파일입니다. Git의 `.gitignore`나 구글의 `.aiexclude`와 유사하게 작동하며, AI가 불필요하게 방대한 데이터나 민감한 정보(API 키 등)에 접근하는 것을 사전에 차단합니다.

<br/>

## 2. 작동 방식 및 문법 규칙
`.geminiignore`는 개발자들에게 익숙한 `.gitignore` 스타일의 규칙을 따릅니다.

- **주석**: `#`으로 시작하는 줄은 설명을 위한 주석으로 처리됩니다.
- **와일드카드 지원**: `*`, `?`, `[]` 같은 표준 글로브(Glob) 패턴을 사용하여 여러 파일을 한꺼번에 지정할 수 있습니다.
- **디렉토리 구분**: 경로 끝에 `/`를 붙이면 해당 디렉토리와 그 하위의 모든 항목을 일치시킵니다.
- **경로 고정**: 경로 시작 부분에 `/`를 붙이면 해당 파일을 `.geminiignore`가 있는 위치에 고정합니다.
- **반전 (`!`)**: 특정 패턴 앞에 `!`를 붙이면 해당 파일이나 폴더를 무시 대상에서 제외(즉, 다시 포함)합니다.

> [!IMPORTANT]
> `.geminiignore` 파일의 내용을 수정한 후 변경 사항을 완벽히 적용하려면 **Gemini CLI 세션을 종료하고 다시 시작**해야 합니다.

<br/>

## 3. 사용 방법 (Workflow)
1. 프로젝트의 최상위(Root) 디렉토리에 `.geminiignore` 파일을 생성합니다.
2. 제외하고 싶은 경로를 한 줄씩 추가합니다.

### 설정 예시
```text
# 아카이브 폴더와 그 하위 전체 제외
/archive/

# 특정 민감 파일 제외
apikeys.txt
.env

# 모든 마크다운 파일 제외하되, README.md만은 예외로 포함
*.md
!README.md
```

<br/>

## 4. 왜 사용해야 하나요?
- **데이터 최소화**: AI에게 꼭 필요한 파일만 전달하여 컨텍스트 창(Context Window)을 효율적으로 사용합니다.
- **보안 강화**: 실수로 소스 코드 외의 비밀 키나 개인 정보가 AI 모델로 전송되는 위험을 방지합니다.
- **정확도 향상**: AI가 빌드 결과물이나 로그 파일 같은 노이즈 데이터를 무시하고 본질적인 비즈니스 로직에만 집중하게 합니다.

---
**다음 단계**: 파일 단위 무시를 넘어, 프로젝트 전반의 AI 지침을 관리하고 싶다면 [GEMINI.md 컨텍스트 가이드](/docs/gemini/1-basic-part3---project-context.md)를 참고하세요.
