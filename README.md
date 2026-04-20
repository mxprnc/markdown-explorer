# Markdown Explorer


## Development Setting
```bash
npm i
```
<br/>

npm run web
```
<br/>

## Unit Testing
이 프로젝트는 Jest를 사용하여 유틸리티 및 핵심 로직의 안정성을 검증합니다.

### 테스트 실행 방법
```bash
# 전체 테스트 실행
npm test

# 특정 테스트 파일 실행
npm test utils/__tests__/FileSystemUtils.test.ts

# 테스트 감시 모드 (변경 시 자동 재실행)
npm test -- --watch
```

### 테스트 구조
- `utils/__tests__/`: 유틸리티 함수(FileSystemUtils 등)에 대한 단위 테스트가 포함되어 있습니다.
<br/>

## 주의 사항 (Troubleshooting)

### 브라우저 확장 프로그램 충돌
DeepL, YouTube Summary, Grammarly 등과 같이 페이지 내용을 실시간으로 분석하는 브라우저 확장 프로그램이 활성화되어 있을 경우, 개발 콘솔에 `SecurityError`가 발생하거나 에디터 반응 속도가 느려질 수 있습니다. 이는 확장 프로그램이 보안이 적용된 유튜브 `iframe` 등에 접근을 시도하면서 발생하는 현상입니다.

**해결 방법:**
- **시크릿 모드(Incognito)**에서 접속하여 사용하세요.
- 또는, 해당 확장 프로그램 설정에서 `localhost:8081` 도메인을 **제외(Whitelist)** 처리해 주세요.
