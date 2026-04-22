# Phase 2: Local Directory Scaffolding (Desktop) - Implementation Plan

## 🏗 아키텍처 설계
기존의 `ScaffoldEngine`을 인터페이스화하여, 출력 방식에 따라 전략을 교체할 수 있는 구조로 개선합니다.

### 1. 추상화 레이어 도입
- `IScaffoldStrategy`: 파일 및 폴더 생성을 담당하는 추상 인터페이스 정의.
- `ZipScaffoldStrategy`: 현재 구현된 JSZip 기반 엔진 (Web용).
- `DirectScaffoldStrategy`: Node.js `fs` 모듈 기반 엔진 (Desktop용).

### 2. 데스크톱 브릿지 (IPC)
- Electron 메인 프로세스와 렌더러 프로세스 간의 통신 채널 구축.
- `select-folder`: 네이티브 폴더 선택창 호출.
- `write-project-files`: 로컬 경로에 파일 쓰기 실행.

## 🛠 단계별 구현 계획

### Step 1: 출력 전략 분리 및 리팩토링
- [ ] `ScaffoldEngine`의 코드를 전략 패턴(Strategy Pattern)으로 리팩토링.
- [ ] 출력 방식에 관계없이 동일한 `ExportService` 로직을 사용할 수 있도록 보장.

### Step 2: 데스크톱 전용 UI 보강
- [ ] 내보내기 마법사 마지막 단계에서 '다운로드 경로'가 아닌 '로컬 저장 경로' 선택 필드 추가.
- [ ] 저장 경로 선택 시 Electron `dialog.showOpenDialog` 호출 로직 구현.

### Step 3: 네이티브 쓰기 엔진 (NativeWriter) 구현
- [ ] `fs-extra` 또는 네이티브 `fs` 모듈을 사용하여 재귀적 디렉토리 생성 로직 구현.
- [ ] 파일 쓰기 도중 권한 오류나 용량 부족에 대한 예외 처리.

### Step 4: 자동화 스크립트 연동 (선택 사항)
- [ ] `child_process`를 사용하여 생성 완료 후 해당 경로에서 `npm install` 실행 기능 검토.

## 🧪 테스트 계획
- **데스크톱 환경 테스트**: 실제 Electron 빌드 환경에서 폴더 선택 및 파일 생성 여부 확인.
- **권한 테스트**: 읽기 전용 폴더나 시스템 보호 폴더 선택 시 적절한 에러 메시지 노출 확인.
- **성능 테스트**: 파일 수가 많은(100개 이상) 폴더 내보내기 시 블로킹 현상 유무 확인.
