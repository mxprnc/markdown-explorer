# 원격 분석 및 모니터링 (Telemetry) 가이드
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="10%" alt="Gemini Banner" />

<br/>

## 출처
- Observability with OpenTelemetry : https://geminicli.com/docs/cli/telemetry/

<br/>

## 1. 텔레메트리(Telemetry)란 무엇인가?
텔레메트리는 Gemini CLI가 내부적으로 어떻게 작동하고 있는지(어떤 도구를 썼는지, 토큰은 얼마나 사용했는지, 지연 시간은 어느 정도였는지 등)를 수집하고 시각화하는 기능입니다. 

### 왜 필요한가?
- **비용 최적화**: 대규모 자동화나 팀 내 공용 환경에서 토큰 소비량을 정밀하게 추적하여 예산을 관리할 수 있습니다.
- **성능 디버깅**: AI가 답변을 생성하거나 도구를 실행하는 데 걸리는 시간(Latency)을 측정하여 병목 지점을 찾습니다.
- **투명성 확보**: "검은 상자(Black box)" 같은 AI의 실제 도구 호출 과정을 투명하게 로그로 남겨 사후 분석이 가능하게 합니다.

<br/>

## 2. 기본 활성화 방법 (`settings.json`)
텔레메트리는 성능 및 개인 정보 보호를 위해 기본적으로 꺼져 있습니다. 이를 활성화하려면 설정을 추가해야 합니다.

```json
{
  "telemetry": {
    "enabled": true,
    "target": "local",  // "local" 또는 "gcp" 권장
    "outfile": ".gemini/telemetry.log"  // 로컬 저장 파일 경로 (target이 local일 때)
  }
}
```

### 주요 설정 속성
- **`enabled`**: 기능을 켭니다 (기본값: `false`).
- **`target`**: 데이터를 보낼 장소입니다. 로컬 파일(`local`) 혹은 구글 클라우드(`gcp`)를 선택합니다.
- **`logPrompts`**: 로그에 사용자가 입력한 프롬프트 원문을 포함할지 결정합니다. (민감한 데이터가 있을 경우 `false` 권장)

<br/>

## 3. Google Cloud 모니터링 (GCP 연동)
팀 단위로 Gemini CLI를 사용하거나 기업용 관리 시스템을 구축할 때 가장 강력한 방법입니다.

1. **설정**: `target`을 `"gcp"`로 변경합니다.
2. **인증**: 터미널에서 `gcloud auth application-default login` 명령을 통해 인증 절차를 거칩니다.
3. **대비보드**: Google Cloud Monitoring 페이지에서 "**Gemini CLI Monitoring**" 대시보드 템플릿을 검색하여 원클릭으로 시각화된 보고서를 생성할 수 있습니다.

<br/>

## 4. 로컬 모니터링 (파일 저장)
개인적인 디버깅이나 개발용으로, 파일 시스템에 JSON 로그를 한 줄씩 남깁니다.
- **위치**: 설정한 `outfile` 경로(기본: `.gemini/telemetry.log`)에 기록됩니다.
- **내용**: API 응답 상태, 도구 호출 인자, 토큰 사용량 정보 등을 포함합니다. 텍스트 에디터나 `jq` 같은 도구로 쉽게 분석할 수 있습니다.

<br/>

## 5. 수집되는 데이터 유형 (OpenTelemetry 기반)
Gemini CLI는 업계 표준인 **OpenTelemetry** 프레임워크를 기반으로 세 가지 데이터를 생성하여 관리의 편의성을 높입니다.

- **Logs (로그)**: 세션 시작, 설정 정보, 도구 실행 성공/실패 여부, API 에러 메시지 등.
- **Metrics (지표)**: 토큰 사용량(입력/출력/캐시), API 레이턴시, 세션 수 등 수치 데이터.
- **Traces (트레이스)**: 복잡한 작업(Multi-turn) 실행 시 전체적인 진행 흐름 및 도구별 시간 점유율 정보.

---
**고급 정보**: 수백 가지의 상세 로그 필드와 기술 사양 전문이 궁금하시다면 [공식 Telemetry 레퍼런스](https://geminicli.com/docs/cli/telemetry/) 문서를 직접 참고하세요.
