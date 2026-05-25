# MCP 고급 인증 및 설정 (Advanced Configuration)
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="10%" alt="Gemini Banner" />

이 문서는 원격 MCP 서버 연동을 위한 OAuth 인증, Google Cloud 서비스 계정 가장(Impersonation), IAP 보호 서비스 접근 등 복잡한 엔터프라이즈 환경 설정을 다룹니다.

<br/>

## 출처
- MCP servers with the Gemini CLI : https://geminicli.com/docs/tools/mcp-server

<br/>

## 1. 원격 서버를 위한 OAuth 인증
Gemini CLI는 SSE 또는 HTTP 전송 방식을 사용하는 원격 MCP 서버를 위해 OAuth 2.0 인증을 지원합니다.

### ① 자동 OAuth 검색 및 흐름
서버가 OAuth 검색을 지원하는 경우, CLI가 자동으로 다음을 수행합니다.
- **자동 감지**: 401 Unauthorized 응답 시 OAuth 요구 사항을 감지합니다.
- **엔드포인트 검색**: 서버 메타데이터에서 인증 및 토큰 엔드포인트를 찾습니다.
- **인증 수행**: 로컬 브라우저를 열어 사용자 로그인을 처리하고 토큰을 안전하게 저장합니다.

### ② 인증 관리 명령어 (`/mcp auth`)
```bash
# 인증이 필요한 서버 목록 확인
/mcp auth

# 특정 서버에 대해 인증 수행
/mcp auth serverName

# 토큰 만료 시 재인증
/mcp auth serverName
```

<br/>

## 2. Google Cloud 서비스 계정 가장 (Service Account Impersonation)
Cloud Run 등 IAP(Identity-Aware Proxy)로 보호되는 Google Cloud 서비스에 접근할 때 사용합니다. 기업 내부 도구를 연동할 때 핵심적인 기능입니다.

### ① 설정 예시
```json
{
  "mcpServers": {
    "company-internal-tool": {
      "url": "https://internal-service.run.app/sse",
      "authProviderType": "service_account_impersonation",
      "targetAudience": "IAP_CLIENT_ID.apps.googleusercontent.com",
      "targetServiceAccount": "mcp-bot@my-project.iam.gserviceaccount.com"
    }
  }
}
```

### ② 작동 원리
CLI는 로컬에 설정된 **기본 자격 증명(ADC)**을 사용하여 지정된 서비스 계정 대신 OIDC ID 토큰을 생성합니다. 이 토큰을 통해 추가적인 키 노출 없이 IAP 보안 요원을 통과할 수 있습니다.

<br/>

## 3. 다양한 서버 설정 심화 예시

### ① Docker 기반 로컬 서버
로컬 환경을 깨끗하게 유지하고 싶을 때 유용합니다.
```json
{
  "mcpServers": {
    "docker-tool": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm", "-e", "API_KEY",
        "-v", "${PWD}:/workspace", "my-mcp-server:latest"
      ],
      "env": { "API_KEY": "$EXTERNAL_TOKEN" }
    }
  }
}
```

### ② 도구 필터링 (Tool Filtering)
서버가 제공하는 수많은 도구 중 AI 모델에게 노출할 항목을 정교하게 제어합니다.
```json
{
  "mcpServers": {
    "filteredServer": {
      "command": "node",
      "args": ["dist/server.js"],
      "includeTools": ["safe_tool", "file_reader"],  // 이것만 허용
      "excludeTools": ["delete_all", "db_drop"]      // 명시적 금지
    }
  }
}
```

---
*주의: 이 가이드의 내용은 주로 리눅스/macOS 환경 및 기업용 클라우드 아키텍처를 기반으로 합니다. 간단한 로컬 스크립트 실행에는 Stdio 기반의 기본 설정으로 충분합니다.*
