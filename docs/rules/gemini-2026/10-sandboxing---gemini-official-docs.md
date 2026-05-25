# Gemini CLI 샌드박싱(Sandboxing) 가이드
<img src="https://geminicli.com/_astro/icon.Bo4M5sF3.png" width="10%" alt="Gemini Banner" />

<br/>

## 출처
- Gemini CLI sandboxing : https://geminicli.com/docs/cli/sandbox/

<br/>

## 1. 샌드박싱(Sandboxing)이란 무엇인가?
샌드박싱은 쉘 명령어 실행이나 파일 수정과 같이 잠재적으로 위험한 작업을 호스트 시스템으로부터 격리하는 보안 기능입니다. AI가 수행하는 도구 호출과 실제 사용자 환경 사이에 강력한 보안 장벽을 제공하여 시스템 손상을 방지합니다.

### 주요 이점
- **보안**: 우발적인 시스템 손상이나 데이터 유실 방지.
- **격리**: 파일 시스템 접근을 프로젝트 디렉토리 내부로 엄격히 제한.
- **일관성**: 서로 다른 시스템 간에 재현 가능한 동일한 실행 환경 보장.
- **안전성**: 신뢰할 수 없는 코드나 실험적인 명령어를 안정적으로 실행.

<br/>

## 2. 플랫폼별 격리 방법

사용자의 운영체제와 선호하는 컨테이너 솔루션에 따라 적절한 방식을 선택할 수 있습니다.

### ① macOS Seatbelt (macOS 전용)
macOS 내장 `sandbox-exec`를 사용하는 경량 샌드박싱입니다. 프로젝트 디렉토리 외부의 쓰기 작업을 제한하는 `permissive-open` 프로필을 기본으로 사용합니다.

### ② 컨테이너 기반 (Docker/Podman)
완전한 프로세스 격리를 제공하는 크로스 플랫폼 방식입니다. 가장 널리 사용되며, 로컬 빌드 이미지나 조직의 레지스트리 이미지를 활용하여 완벽한 독립 환경을 구축합니다.

### ③ Windows Native Sandbox (Windows 전용)
`icacls` 명령을 사용하여 파일과 디렉토리에 **"낮은 무결성 수준(Low Integrity Level)"**을 설정합니다. 샌드박스가 종료된 후에도 생성된 파일의 낮은 무결성 수준은 유지될 수 있으므로 주의가 필요합니다.

### ④ gVisor / runsc (Linux 전용)
현존하는 가장 강력한 격리 방식입니다. [gVisor](https://github.com/google/gvisor) 커널을 사용하여 컨테이너의 시스템 호출을 가로채 보안 장벽을 형성합니다. (사용을 위해 `sandbox: "runsc"` 명시 필요)

### ⑤ LXC/LXD (Linux 전용, 실험적)
완전한 시스템 컨테이너 격리 방식입니다. 표준 Docker에서 작동하지 않는 `systemd` 기반 서비스나 `snapcraft` 같은 도구가 필요한 경우에 적합합니다.

<br/>

## 3. 도구 수준 샌드박싱 (Tool Sandboxing)
전체 CLI 프로세스를 가두는 대신, `shell_exec`나 `write_file` 같은 **개별 도구 실행 시에만** 세밀하게 격리하는 기능입니다. 이 방식을 사용하면 로컬 환경과의 편리한 통합성(UI 렌더링 등)을 유지하면서도 위험한 도구 작업만 안전하게 보호할 수 있습니다.

<br/>

## 4. 샌드박스 확장 (Sandbox Expansion)
사용 중 권한(특정 경로 접근, 네트워크 권한 등)이 부족하여 작업이 차단될 때, Gemini CLI가 동적으로 권한 추가를 요청하는 지능형 시스템입니다.

1. **감지**: 권한 부족으로 명령어 실패 시 CLI가 이를 감지합니다.
2. **요청**: 어떤 권한이 왜 필요한지 설명하는 팝업 대화상자가 표시됩니다.
3. **승인**: 사용자가 승인하면 해당 작업에 대해서만 일시적으로 확장된 권한이 부여되어 흐름이 중단되지 않습니다.

<br/>

## 5. 설정 및 활용

### ① 활성 방법 (우선순위 순)
1. **명령어 플래그**: `gemini -s` 또는 `gemini --sandbox`
2. **환경 변수**: `export GEMINI_SANDBOX=true` (또는 `docker`, `podman`, `runsc` 등 지정)
3. **설정 파일**: `settings.json` 내 `tools.sandbox` 값을 `true`로 설정.

### ② 커스텀 플래그 (`SANDBOX_FLAGS`)
Docker나 Podman 실행 시 추가적인 보호 옵션이나 네트워크 설정을 주입하고 싶을 때 사용합니다.
```bash
# macOS/Linux 예시
export SANDBOX_FLAGS="--security-opt label=disable --net=host"
```

<br/>

## 6. 트러블슈팅 (Troubleshooting)

- **"Operation not permitted"**: 작업이 샌드박스 허용 범위를 벗어났습니다. 마운트 지점을 추가하거나 더 허용적인 프로필을 사용하세요.
- **명령어 누락**: 샌드박스 컨테이너 내부에 필요한 도구가 설치되어 있어야 합니다. 커스텀 Dockerfile을 사용하거나 `sandbox.bashrc`를 통해 설치하세요.
- **디버그 모드**: 상세 로그 확인을 위해 `DEBUG=1 gemini -s` 명령어로 실행하세요.

---
**보안 참고**: 샌드박싱은 위험을 크게 줄여주지만 완벽한 방패는 아닙니다. 항상 작업에 꼭 필요한 최소한의 권한 프로필만 사용하며, 중요한 시스템 리소스에 대한 접근은 사용자가 직접 모니터링해야 합니다.
