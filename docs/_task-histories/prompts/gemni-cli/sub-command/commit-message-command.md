
커밋 메시지 작성 가이드 : [commit-message-guide.md](../../../../rules/commit-message-guide.md)


## git:commit-message
A. 사용자가 다음과 같이 입력값을 줄경우
- e.g. `env(git) : (gemini cli) git commit command, commit message generator command`

B. 입력값으로 아무것도 안줄때도 있습니다.
- 이 경우 `<type>`, `<subject>` 에 대한 힌트를 주지 않았으므로, 사용자의 의도를 추측해서 `<type>`, `<subject>`을 결정하고, 커밋 메시지를 작성합니다.

C. git add 된 파일이 없을 때 실행될 때도 있습니다.
- git add 된 파일이 없음을 사용자에게 알리고, 커밋할 대상 파일들을 먼저 `git add` 하도록 안내하는 알림 문구를 출력하고 종료합니다.
<br/>

gemini cli 로 커맨드를 실행하면 gemini cli 가 현재 git add 된 파일 목록을 보고 프로젝트의 내용에 맞도록 commit message 를 만들어서 보여줍니다. 이때 생성되는 커밋 메시지는 반드시 [commit-message-guide.md](../../../../rules/commit-message-guide.md)의 규칙을 준수하여 **영어(English)로만 작성**합니다.

이렇게 생성한 commit-message 는 프로젝트 디렉토리 내의 `./gemini/git/git-temp/<type>-<subject-kebab-case>/<id>.md` 로 저장합니다(여기서 `type` 은 [commit-message-guide.md](../../../../rules/commit-message-guide.md) 의 예시에서 사용된 `<type>` 을 의미하며, `subject-kebab-case` 는 생성된 커밋 메시지 제목을 영문 소문자 기준 kebab-case 로 치환한 문자열입니다). 예를 들어 `<type>` 이 `feat` 이고 제목이 `implement split-view mode` 이라면 `feat-implement-split-view-mode/001.md` 와 같이 저장합니다. 커밋 메시지를 수정하고 싶은지를 사용자에게 묻고, 사용자가 수정하고 싶어한다면 `./gemini/git/git-temp/<type>-<subject-kebab-case>/001.md` 의 파일을 수정하라고 안내합니다.

- 여기서 `<id>` 는 `<type>-<subject-kebab-case>` 에 대한 이름이 중복될 경우 몇 번째로 만든 메시지인지를 표현하는 3자리 패딩 숫자(예: `001`, `002`, `003`...)입니다.
- 만약 사용자가 작성한 `<type>`, `<subject>` 가 기존에 작성한 `<type>-<subject-kebab-case>`와 다를 경우에는 새로운 디렉터리를 생성하고 새로운 `<id>.md` 파일을 생성합니다.
- 생성되는 `<id>.md` 파일 하단에는 생성 시점에 staged 되어 있던 파일들의 목록과 해시/크기 등의 메타데이터를 HTML 주석(`<!-- gemini-cli-metadata ... -->`) 형태로 저장합니다.

<br/>


## git:commit
A. 사용자가 commit message 를 만들어둔 경우 (git:commit-message로 만들어둔 파일들이 있을 경우)
- 현재 add 된 파일 목록에 대해 commit 을 수행할지를 묻습니다. commit 을 원하지 않는다면 종료합니다.
- 현재 git add 된 파일 중에 `./gemini/git/git-temp/<type>-<subject-kebab-case>`와 같은 디렉터리들을 찾아서 가장 최근의 `<id>.md`를 찾아서 이 커밋 메시지로 commit 할지 사용자에게 물어보고 그렇다고 할 경우 커밋을 진행합니다. 그렇지 않다면 `git:commit-message` 커맨드를 수행하도록 권고합니다.
- 이미 `./gemini/git/git-temp/<type>-<subject-kebab-case>/` 내에 `<id>.md` 가 존재하고 새로운 변경사항이 발생했을 경우, 파일 하단 HTML 주석에 담긴 `gemini-cli-metadata`와 현재 staged된 파일 목록/해시를 비교하여 다를 때 기존 `<id>.md`를 사용할지, 새로운 커밋 메시지를 만들지를 물어봅니다. 만약 새로운 커밋 메시지를 만들기를 원한다면 `git:commit-message` 를 다시 실행하도록 권고합니다.

B. 사용자가 commit message를 만들지 않은 경우
- 현재 add 된 파일 목록에 대해 commit 을 수행할지를 묻습니다. commit 을 원하지 않는다면 종료합니다.
- 새로운 기능을 개발했지만, git add 를 해두었지만, 아직 commit message를 한번도 만든적이 없는 경우입니다. 이 경우 `git:commit-message` 를 실행하도록 권고합니다.
- 새로운 기능을 개발했지만, add 된 파일들이 없는 경우에는 사용자에게 git add 로 commit을 원하는 파일들을 선택하라고 권고합니다.


A,B 에 대해 `git:commit-message` 커맨드를 실행하도록 권고되지 않고 그대로 진행되어 여기까지 왔다면, 해당 `./gemini/git/git-temp/<type>-<subject-kebab-case>/<id>.md` 에 기록된 commit message 로 commit 을 수행합니다.
- **⚠️ 중요**: 실제 커밋을 수행하기 전에, 마크다운 파일 내용에서 메타데이터용 HTML 주석(`<!-- gemini-cli-metadata ... -->`) 블록은 반드시 완벽하게 제거(Strip)한 후 순수한 커밋 메시지 내용만 사용해야 합니다.


커밋이 완료되면 `./gemini/git/git-temp/<type>-<subject-kebab-case>/` 디렉터리는 삭제합니다.


## git:force-commit
커밋 메시지를 확인하기 원하지 않고 AI가 알아서 커밋메시지 작성 후 커밋해주기를 원하는 경우 사용하는 커맨드입니다.


A. 사용자가 원하는 파일들을 add 해둔 경우
- 현재 add 된 파일 목록에 대해 commit 을 수행할지를 묻습니다. commit 을 원하지 않는다면 종료합니다.
- git add 된 파일들을 보고 [commit-message-guide.md](../../../../rules/commit-message-guide.md) 의 규칙에 따라 `./gemini/git/git-temp/<type>-<subject-kebab-case>/<id>.md` 에 커밋 메시지를 작성합니다. (이때 파일 하단에 `gemini-cli-metadata` HTML 주석을 함께 저장합니다.)
- 그리고 해당 커밋 메시지(`./gemini/git/git-temp/<type>-<subject-kebab-case>/<id>.md`)에 따라 커밋을 진행합니다. 이와 동일하게 실제 커밋 시점에는 HTML 주석 블록을 완전히 제거(Strip)한 순수한 메시지만을 사용합니다.
- 커밋이 완료되면 `./gemini/git/git-temp/<type>-<subject-kebab-case>/` 디렉터리를 삭제합니다.

B. 사용자가 원하는 파일들을 add 해두지 않은 경우
- git add 된 파일이 없다는 것을 사용자에게 알리고, 원하는 파일들을 직접 add 하라는 알림문구를 사용자에게 보냅니다.
- 사용자는 git add 로 필요한 파일들을 추가한 후에 다시 `git:force-commit` 을 수행합니다. 

