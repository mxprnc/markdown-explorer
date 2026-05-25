VSCode 테마 플러그인의 JSON 파일은 크게 **세 가지 방법**으로 아주 쉽게 구하실 수 있습니다. 선호하시는 방법을 선택하여 테마 JSON을 가져와 당사의 **VSCode Theme Importer**에 붙여넣어 보세요!

---

### 방법 1. GitHub 저장소에서 직접 가져오기 (가장 추천)

대부분의 유명한 VSCode 테마들은 오픈소스로 운영되고 있어 GitHub에서 JSON 원본을 쉽게 찾을 수 있습니다.

1. GitHub 검색창이나 구글에 **`[원하는 테마 이름] vscode theme github`**을 검색합니다. (예: `Tokyo Night vscode theme github`)
2. 해당 테마의 공식 GitHub 저장소에 진입합니다.
3. 보통 저장소 루트 내의 **`themes/`** 또는 **`src/`** 폴더 아래에 **`[테마이름]-color-theme.json`** 이라는 이름으로 색상 정보가 들어있는 JSON 파일이 존재합니다.
4. 해당 JSON 파일을 열고 우측 상단의 **Raw** 버튼을 눌러 전체 텍스트를 그대로 복사합니다.

> **자주 쓰이는 인기 테마들의 GitHub 링크 예시**:
>
> - [Tokyo Night 저장소 내 themes 폴더](https://github.com/enkia/tokyo-night-vscode-theme/tree/master/themes) (Tokyo Night.json 등)
> - [Dracula Theme 저장소 내 themes 폴더](https://github.com/dracula/visual-studio-code/tree/master/src) (dracula.json)
> - [One Dark Pro 저장소 내 themes 폴더](https://github.com/Binaryify/OneDark-Pro/tree/master/themes) (OneDark-Pro.json)

---

### 방법 2. 컴퓨터에 이미 설치된 VSCode에서 추출하기

만약 본인의 컴퓨터 VSCode에 이미 사용 중인 테마가 설치되어 있다면, 로컬 확장 프로그램 경로에서 JSON 파일을 직접 복사해 올 수 있습니다.

- **macOS 경로**:  
  `~/.vscode/extensions/`
- **Windows 경로**:  
  `C:\Users\[사용자계정]\.vscode\extensions\`
- **Linux 경로**:  
  `~/.vscode/extensions/`

**추출 순서**:

1. 위 폴더로 이동하면 본인이 설치한 확장 플러그인 목록들이 폴더 형태로 나열되어 있습니다.
2. 적용하고 싶은 테마의 폴더(예: `draculatheme.theme-dracula-x.x.x`)로 진입합니다.
3. 폴더 내부의 **`themes/`** 폴더에 들어가면 실제 테마 색상이 기재된 `.json` 파일을 찾을 수 있습니다.

---

### 방법 3. VSCode 마켓플레이스에서 직접 다운로드하여 추출하기 (웹 브라우저로만 진행할 때)

1. [VSCode Marketplace](https://marketplace.visualstudio.com/)에 접속하여 원하는 테마를 검색합니다.
2. 상세 페이지 우측 사이드바의 **`Download Extension`** 버튼을 클릭하여 `.vsix` 파일을 다운로드합니다.
3. `.vsix` 파일은 실제 ZIP 압축 파일입니다. 파일 확장자를 `.zip`으로 변경한 뒤 압축을 해제합니다.
4. 압축 해제된 폴더 내부의 **`extension/themes/`** 경로로 이동하면 테마 JSON 파일이 위치해 있습니다.
