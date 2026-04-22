# Markdown Explorer Deployment Plan

이 문서는 Markdown Explorer 프로젝트의 Web, Mobile, Desktop 플랫폼별 배포 프로세스와 CI/CD 파이프라인 구성을 설명합니다.

---

## 1. 플랫폼별 배포 전략

### 🌐 Web (Static Web)
*   **빌드 도구**: Expo CLI (`npx expo export`)
*   **결과물**: `dist/` 디렉토리 내 정적 파일 (HTML/JS/CSS)
*   **배포 방식**: 
    *   **GitHub Releases**: `dist/` 폴더를 zip으로 압축하여 Assets에 업로드.
    *   **Hosting**: GitHub Pages 또는 Vercel을 통한 실시간 프리뷰 제공.

### 📱 Mobile (Android & iOS)
*   **빌드 도구**: EAS (Expo Application Services)
*   **결과물**: 
    *   **Android**: `.apk` (테스트용) 또는 `.aab` (스토어용)
    *   **iOS**: `.ipa` (애플 개발자 계정 필요)
*   **배포 방식**: 
    *   EAS Cloud Build를 통해 빌드 후 결과물 링크를 Release 노트에 포함.
    *   필요 시 빌드된 바이너리를 직접 다운로드하여 GitHub Release Assets에 추가.

### 💻 Desktop (PC - Windows, macOS, Linux)
*   **빌드 도구**: `electron-builder`
*   **결과물**:
    *   **macOS**: `.dmg`, `.zip`
    *   **Windows**: `.exe` (NSIS), `.msi`
    *   **Linux**: `.AppImage`, `.deb`
*   **배포 방식**:
    *   GitHub Actions의 Matrix Build를 통해 각 OS별 네이티브 바이너리 생성.
    *   `electron-builder`의 내장 기능을 활용하여 GitHub Release에 자동 업로드.

---

## 2. CI/CD 파이프라인 구성 (GitHub Actions)

### 워크플로우 흐름
1.  **Trigger**: 사용자가 GitHub Actions 탭에서 `release_tag`를 입력하여 수동 실행(`workflow_dispatch`).
2.  **Job 1: Create Release**: GitHub Release Draft를 생성하여 모든 플랫폼의 결과물이 모일 공간 확보.
3.  **Job 2: Web & Mobile Build**:
    *   Web용 정적 파일 생성 및 압축 업로드.
    *   EAS Build 명령을 통해 모바일 빌드 트리거.
4.  **Job 3: Desktop Matrix Build**:
    *   `macos-latest`, `windows-latest`, `ubuntu-latest` 환경에서 병렬 빌드.
    *   각 OS에 맞는 바이너리를 Release Assets에 자동 업로드.

### 필요한 환경 변수 (Secrets)
| 이름 | 용도 |
| :--- | :--- |
| `EXPO_TOKEN` | Expo/EAS 계정 인증 (모바일 빌드용) |
| `GITHUB_TOKEN` | GitHub Release 생성 및 파일 업로드 권한 |
| `APPLE_ID` / `APPLE_APP_SPECIFIC_PASSWORD` | (선택) macOS 앱 서명 및 공증 시 필요 |

---

## 3. 향후 개선 사항
*   **Auto-Versioning**: `package.json`의 버전을 자동으로 올리고 Git Tag를 생성하는 로직 추가.
*   **Changelog 자동 생성**: 커밋 메시지를 기반으로 릴리즈 노트를 자동 작성.
*   **E2E 테스트 연동**: 모든 빌드 전 Playwright 테스트가 통과해야 배포되도록 강제.
