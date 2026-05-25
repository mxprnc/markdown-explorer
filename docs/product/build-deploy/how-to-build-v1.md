# How to Build and Deploy v1

이 문서는 Markdown Explorer 프로젝트의 플랫폼별 빌드 및 배포 방법을 정리합니다.

## 1. 로컬 개발 및 가상 실행 (Native Simulation)

실제 기기에 APK/IPA를 넣기 전, 개발 PC에서 가상으로 실행하여 테스트하는 방법입니다.

### iOS 시뮬레이터 (Mac 전용)
*   **준비**: App Store에서 **Xcode** 설치 후, `Settings > Platforms`에서 iOS 시나리오 다운로드.
*   **실행**: 터미널에서 `npm start` 입력 후 키보드에서 **`i`** 클릭.

### 안드로이드 에뮬레이터
*   **준비**: **Android Studio** 설치 및 `Virtual Device(AVD)` 생성.
*   **실행**: 에뮬레이터를 먼저 띄운 후, 터미널에서 `npm start` 입력 후 키보드에서 **`a`** 클릭.

### 브라우저 모바일 보기 (빠른 확인용)
1.  `npm run web` 실행.
2.  브라우저(Chrome)에서 `F12` (개발자 도구) 클릭.
3.  좌상단 **핸드폰 아이콘(Toggle device toolbar)** 클릭 후 원하는 기기 선택.

---

## 2. 모바일 프로덕션 빌드 (Android, iOS)

EAS(Expo Application Services)를 사용하여 클라우드에서 배포용 파일을 생성합니다.

### 빌드 트리거
GitHub Actions 워크플로우를 실행하거나, 로컬에서 아래 명령어를 사용합니다:
```bash
eas build --platform all --profile production
```

### 결과물(APK, IPA) 확인 및 다운로드
빌드된 파일은 사용자의 로컬이 아닌 **Expo 클라우드**에 저장됩니다.
1.  **Expo 대시보드**: [https://expo.dev/artifacts](https://expo.dev/artifacts) 에 접속하여 다운로드.
2.  **터미널**: `eas build:list` 명령어로 링크 확인.
*   **참고**: 기본 설정상 Android는 스토어용 `.aab`를 생성합니다. 테스트용 `.apk`가 필요하면 `eas.json` 설정을 `preview` 등으로 변경해야 합니다.

---

## 3. 데스크톱 앱 빌드 (Mac, Windows, Linux)

Electron을 통해 웹 번들을 데스크톱 전용 앱으로 패키징합니다.

### 실행 명령어
*   **현재 OS용 빌드**: `npm run build:desktop`
*   **모든 OS용 빌드**: `npm run build:desktop-all` (Mac/Win/Linux)

### 특징
*   **로컬 서버 내장**: 보안 제약(CORS)을 피하기 위해 앱 내부적으로 `http://localhost:9876` 서버를 구동합니다. 이를 통해 **로컬 폴더 열기** 기능이 정상 작동합니다.
*   **빌드 위치**: 결과물은 `dist-desktop/` 폴더에 생성됩니다.

---

## 4. 웹 배포 (Static Hosting)

1.  `npx expo export --platform web` 명령어로 `dist` 폴더를 생성합니다.
2.  생성된 `dist` 폴더의 내용을 GitHub Pages, Vercel, Netlify 등에 업로드합니다.
3.  로컬에서 정적 결과물만 확인하려면 `npx serve dist`를 사용합니다.


# Expo 클라우드 (EAS - Expo Application Services)

## Expo 클라우드란?
Expo 클라우드는 **EAS(Expo Application Services)**라고 불리는 배포 및 빌드 자동화 서비스의 집합체입니다. 이 프로젝트에서는 주로 모바일 앱의 덩어리(빌드 파일)를 만드는 용도로 사용합니다.

### 1. Expo 클라우드를 왜 쓰나요?
*   **환경 독립성**: 안드로이드 앱을 만들 때 Java, Android SDK가 내 컴퓨터에 없어도 됩니다. iOS 앱을 만들 때 실제 Mac이 없거나 Xcode 설정이 복잡해도 Expo 클라우드가 알아서 빌드해 줍니다.
*   **빌드 서버 부하 감소**: 내 컴퓨터의 자원을 쓰지 않고 Expo의 고성능 서버에서 빌드하기 때문에 내 컴퓨터는 다른 작업을 계속할 수 있습니다.
*   **파일 영구 보관**: 빌드된 결과물(APK, IPA 등)이 프로젝트별로 차곡차곡 쌓여서 나중에 다시 다운로드하거나 팀원에게 링크로 공유하기 편리합니다.

### 2. 빌드 파일(APK, IPA)은 어디에 생성되나요?
*   **로컬 디스크 아님**: `npm run build`를 해도 내 컴퓨터 폴더에는 파일이 생기지 않습니다. 모든 결과물은 **Expo 서버** 내부에 생성됩니다.
*   **위치 확인**:
    *   **Expo Dashboard**: [expo.dev/artifacts](https://expo.dev/artifacts) 에서 빌드 성공 로그와 다운로드 버튼을 볼 수 있습니다.
    *   **QR 코드**: 빌드가 끝나면 터미널이나 대시보드에 QR 코드가 뜹니다. 앱(Expo Go 등)이나 카메라로 찍으면 바로 설치 페이지로 이동합니다.

### 3. 어떤 파일이 만들어지나요? (프로필의 차이)
`eas.json` 설정에 따라 만들어지는 파일 형식이 달라집니다:
*   **Build Production**: 실제 스토어용 완성본입니다. Android는 `.aab` (Play 스토어 업로드용), iOS는 `.ipa` 파일이 생성됩니다.
*   **Build Preview/Development**: 테스트용입니다. Android의 경우 폰에 바로 설치 가능한 **`.apk`** 파일이 생성됩니다. iOS는 특정 기기(UDID 등록됨) 혹은 시뮬레이터에서만 돌아가는 전용 파일이 생성됩니다.

### 4. 주의사항
*   **인터넷 연결 필수**: 빌드 과정 전체가 클라우드에서 일어나므로 인터넷이 끊기면 빌드도 멈춥니다.
*   **빌드 시간**: 클라우드의 무료 플랜을 쓸 경우 대기열(Queue)이 밀리면 빌드 시작까지 몇 분 정도 기다려야 할 수 있습니다. 릴리즈 시에는 `GitHub Actions`를 통해 자동으로 요청해두고 신경 끄는 것이 정신 건강에 좋습니다.


# 로컬 Expo 앱 빌드

## ipa, apk 파일을 로컬에 빌드하기 (EAS Local Build)

클라우드 서버를 거치지 않고 내 컴퓨터의 자원을 사용하여 `apk`나 `ipa` 파일을 직접 추출할 수도 있습니다.

### 1. 로컬 빌드를 사용하는 이유
*   **클라우드 대기열 회避**: Expo 서버가 바쁠 때 기다리지 않고 바로 빌드할 수 있습니다.
*   **무료**: EAS 클라우드 빌드 횟수 제한에 영향을 받지 않습니다.
*   **즉각적인 파일 획득**: 빌드가 완료되면 파일이 즉시 내 프로젝트 폴더에 생성됩니다.

### 2. 사전 준비 사항 (중요)
로컬 빌드는 내 컴퓨터가 "빌드 서버" 역할을 해야 하므로 환경 설정이 까다롭습니다.
*   **Android 빌드 시**: Android SDK, JDK(Java Development Kit), Android Studio 등이 설치되어 있어야 합니다.
*   **iOS 빌드 시**: macOS 환경에서 **Xcode**와 **CocoaPods**가 설치되어 있어야 합니다.

### 3. 빌드 명령어
터미널에서 `--local` 플래그를 붙여 실행합니다.

*   **Android (APK 추출)**:
    ```bash
    eas build --platform android --profile preview --local
    ```
    *(주의: profile이 apk 생성을 지원하도록 eas.json에 설정되어 있어야 합니다.)*

*   **iOS (Simulator/IPA 추출)**:
    ```bash
    eas build --platform ios --profile preview --local
    ```

### 4. 결과물 위치
빌드가 성공적으로 끝나면 터미널 로그 마지막에 파일 경로가 표시됩니다. 보통 프로젝트의 **루트 디렉토리**에 `build-12345.apk` 또는 `build-12345.tar.gz`와 같은 이름으로 생성됩니다.

---

**결론**: 환경 설정이 이미 되어 있다면 `--local` 방식이 파일을 직접 관리하기에 가장 편리합니다. 하지만 설정이 복잡하다면 앞서 설명한 **Expo 클라우드** 방식을 쓰는 것이 훨씬 정신 건강에 이롭습니다.