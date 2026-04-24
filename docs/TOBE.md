

아이폰 등과 같은 스마트폰 환경에서 반응형 웹 디자인 
- docs/plan/mobile/device-size-support/ios

Open Folder 버튼 안보이는 이슈 (시스템 탐색기가 모바일에서 지원이 안되는 이슈? 샌드박스에서 실행되는 것으로 인한)
- docs/plan/mobile/system-explorer-support

안드로이드,아이폰 지원 여부 테스트를 위한 문서
- docs/plan/mobile/test-support
- 오늘: 아이폰 조지기, 안드로이드 UI 구린거 어떻게 할지. (옵시디언 UI,노션UI, 타이포라 UI 비교후 기획점의 후보군 제공 후 여기서 어떤 것을 선호하는지 물어보자. 나는 똥눈이라 Gemini 의 도움이 필요함), 머티리얼 디자인 등 이런 것들에 대해서도 의견 물어보고 조언받기

오픈소스 기반 플러그인 레지스트리 구축
- docs/plan/plugin-sharing/brainstorming.md


---
Editor 내에서 Youtube link, website link 를 추가할때 블록 지정한 link 에 대해 thumbnail 모드/text link 모드/일반 텍스트 모드를 토글할수 있도록 하는 기능

e.g. youtube url
- thumbnail 모드 : [marxplorer-thumbnail#{alter text}](youtube url)
- text link 모드 : [marxplorer-text-link#{alter text}](youtube url)
- 일반 텍스트 모드 : {{youtube url}}

e.g. website link
- thumbnail 모드 : [marxplorer-thumbnail#{alter text}](website url)
- text link 모드 : [marxplorer-text-link#{alter text}](website url)
- 일반 텍스트 모드 : {{website url}}



---
모바일에서 image 업로드시 이미지 경로 처리 문제
- 영문 파일명일 경우 : ./img/{파일명 kebab case}/1.png, ./img/{파일명 kebab case}/2.png, ...
  - 특수문자는 '-' 로 치환
  - 대문자는 소문자로 변환
  - 띄어쓰기는 '-' 로 치환
  - 공백이 있는 경우 '-' 로 치환
- 한글 및 비 영어권 국가의 언어의 파일명일 경우 : ./img/{파일명 kebab case}/1.png, ./img/{파일명 kebab case}/2.png, ...
  - 이게 되는지 AI 의 조언을 듣고 적절한 처리 방안 검토

