# Coding Style Guidelines

## 1. Modularization & DRY (Don't Repeat Yourself)

하드코딩된 로직이나 값이 여러 함수(A, B, C... N)에 걸쳐 반복되는 경우, 이를 별도의 모듈, 상수 또는 유틸리티 함수로 분리하여 관리해야 합니다. 이는 코드의 재사용성을 높이고 유지보수 시 실수를 방지하기 위함입니다.

### 지침
- **반복 금지**: 동일한 설정 값이나 복잡한 로직이 두 곳 이상에서 나타난다면 모듈화를 고려하세요.
- **상수화**: 설정값, 경로, API 엔드포인트 등은 파일 상단이나 별도의 `constants` 파일에서 정의하세요.
- **유틸리티 함수**: 반복되는 계산이나 변환 로직은 `utils` 폴더 내의 독립적인 함수로 만드세요.

### 예제

#### ❌ Bad: 여러 곳에 하드코딩된 경우
```javascript
// function A
function getProfile() {
  const apiHost = "https://api.example.com"; // 하드코딩
  return fetch(`${apiHost}/profile`);
}

// function B
function getPosts() {
  const apiHost = "https://api.example.com"; // 중복 하드코딩
  return fetch(`${apiHost}/posts`);
}
```

#### ✅ Good: 모듈화(상수화)한 경우
```javascript
// constants.js (또는 파일 상단)
export const API_HOST = "https://api.example.com";

// function A
function getProfile() {
  return fetch(`${API_HOST}/profile`);
}

// function B
function getPosts() {
  return fetch(`${API_HOST}/posts`);
}
```

## 2. Testability & Pure Functions

모든 기능은 테스트 가능해야 하며, 가급적 독립적인 함수를 통해 검증될 수 있어야 합니다. 사이드 이펙트(Side Effects)를 최소화하고 입력값에 대해 항상 동일한 출력값을 반환하는 **순수 함수(Pure Function)** 위주로 설계하세요.

### 지침
- **순수 함수 지향**: 함수 내부에서 전역 변수나 외부 상태를 직접 수정하지 말고, 필요한 값은 인자로 전달받으세요.
- **관심사 분리**: 데이터 처리 로직과 UI 렌더링 로직을 분리하여 데이터 처리 로직만 따로 테스트할 수 있게 하세요.
- **의존성 주입**: 함수 내부에서 외부 라이브러리나 전역 객체(window, localStorage 등)에 직접 의존하는 대신, 인자로 넘겨받아 테스트 시 가짜(Mock) 객체로 대체 가능하게 만드세요.

### 예제

#### ❌ Bad: 테스트하기 어려운 경우 (전역 상태 의존)
```javascript
function formatUserName() {
  // 전역 window 객체와 localStorage에 직접 의존하여 외부 환경 없이 테스트가 어려움
  const user = JSON.parse(window.localStorage.getItem('user'));
  return `${user.lastName} ${user.firstName}`;
}
```

#### ✅ Good: 테스트하기 쉬운 경우 (순수 함수)
```javascript
// 입력값만으로 결과를 반환하므로 어떤 환경에서도 테스트 코드를 작성하기 쉬움
export function formatUserName(user) {
  if (!user) return "";
  return `${user.lastName} ${user.firstName}`;
}

// Test code example
// expect(formatUserName({ firstName: 'Gildong', lastName: 'Hong' })).toBe('Hong Gildong');
```

## 3. Component Commonization & Wrapper Components

공통적인 UI 구조나 기능을 가진 '껍데기' 역할의 컴포넌트는 하나로 통합하여 관리해야 합니다. 이를 통해 코드 중복을 줄이고 일관된 디자인과 동작을 유지할 수 있습니다.

### 지침
- **Wrapper 활용**: 레이아웃, 카드, 모달 등 반복되는 컨테이너 구조는 `children` props를 활용하는 공통 컴포넌트로 만드세요.
- **Props를 통한 변주**: 공통 컴포넌트 내부에서 아주 미세하게 다른 부분(타이틀, 아이콘 등)은 props로 받아 처리하세요.
- **스타일 일관성**: 공통 컴포넌트의 스타일을 수정하면 이를 사용하는 모든 곳에 반영되도록 설계하여 디자인 시스템의 일관성을 유지하세요.

### 예제

#### ❌ Bad: 비슷한 구조의 컴포넌트를 각각 정의한 경우
```javascript
// ProfileCard.js
const ProfileCard = ({ name }) => (
  <div className="card-container" style={{ padding: 20, border: '1px solid #ccc' }}>
    <h2 className="card-title">Profile</h2>
    <div className="card-content">{name}</div>
  </div>
);

// SettingCard.js
const SettingCard = ({ settingName }) => (
  <div className="card-container" style={{ padding: 20, border: '1px solid #ccc' }}>
    <h2 className="card-title">Setting</h2>
    <div className="card-content">{settingName}</div>
  </div>
);
```

#### ✅ Good: 공통 Card 컴포넌트로 통합한 경우
```javascript
// Card.js (공통 컴포넌트)
const Card = ({ title, children }) => (
  <div className="card-container" style={{ padding: 20, border: '1px solid #ccc' }}>
    <h2 className="card-title">{title}</h2>
    <div className="card-content">{children}</div>
  </div>
);

// 사용 예시
const ProfileCard = ({ name }) => <Card title="Profile">{name}</Card>;
const SettingCard = ({ settingName }) => <Card title="Setting">{settingName}</Card>;
```

## 4. Component Directory Structure

`components/` 디렉터리 내의 컴포넌트들은 기능 단위(초기화면, Explorer, Editor 등)로 구분하여 관리해야 합니다. 이는 프로젝트 규모가 커짐에 따라 관련 컴포넌트를 쉽게 찾고 관리하기 위함입니다.

### 지침
- **도메인 기반 그룹화**: 각 화면이나 큰 기능 단위별로 폴더를 생성하여 관련 컴포넌트를 모으세요.
- **공통 컴포넌트**: 여러 도메인에서 공용으로 사용하는 컴포넌트는 `components/ui/` 또는 `components/common/` 폴더에 위치시키세요.
- **구조 예시**:
  - `components/initial/`: 초기 진입 화면 관련 컴포넌트
  - `components/explorer/`: 파일 탐색기 관련 컴포넌트
  - `components/editor/`: 에디터 및 프리뷰 관련 컴포넌트
  - `components/ui/`: 버튼, 카드 등 재사용 가능한 UI 원자 단위 컴포넌트

### 예제

#### ❌ Bad: 모든 컴포넌트가 하나의 폴더에 평면적으로 있는 경우
```text
components/
├── FileItem.js
├── FolderTree.js
├── EditorArea.js
├── PreviewPane.js
├── WelcomeBanner.js
└── CustomButton.js
```

#### ✅ Good: 기능 단위로 디렉터리가 구분된 경우
```text
components/
├── explorer/
│   ├── FileItem.js
│   └── FolderTree.js
├── editor/
│   ├── EditorArea.js
│   └── PreviewPane.js
├── initial/
│   └── WelcomeBanner.js
└── ui/
    └── CustomButton.js
```

## 5. Naming Conventions

React 컴포넌트와 그 파일명은 일관된 명명 규칙을 따라야 합니다. 이는 컴포넌트와 일반 스크립트 파일을 명확히 구분하기 위함입니다.

### 지침
- **컴포넌트 이름 (PascalCase)**: 모든 React 컴포넌트 이름은 **PascalCase**로 작성합니다.
  - 예: `UserCard`, `MarkdownPreview`
- **파일명 (PascalCase)**: React 컴포넌트를 정의하는 파일명은 컴포넌트 이름과 동일하게 **PascalCase**를 사용합니다.
  - 예: `UserCard.tsx`, `MarkdownPreview.tsx`
- **비컴포넌트 파일 (kebab-case/camelCase)**: 유틸리티 함수, 상수, 타입 정의 등 컴포넌트가 아닌 파일은 **kebab-case** 또는 **camelCase**를 사용합니다.
  - 예: `api-client.ts`, `auth-utils.ts`

### 예제

#### ❌ Bad: 일관성 없는 파일 및 컴포넌트 이름
```text
components/
├── themed-text.tsx  (파일명이 kebab-case)
├── main_header.tsx  (파일명이 snake_case)
└── user-list.tsx    (파일명이 kebab-case)
```

#### ✅ Good: PascalCase로 통일된 컴포넌트 파일
```text
components/
├── ThemedText.tsx
├── MainHeader.tsx
└── UserList.tsx
```

## 6. Separation of Concerns (관심사 분리)

UI 컴포넌트 내부의 로직을 성격에 따라 분리하여 관리함으로써 가독성과 테스트 가능성을 높여야 합니다.

### 지침
- **Utility Functions (Pure Logic)**: UI나 React 상태에 의존하지 않는 순수 비즈니스 로직, 데이터 변환 등은 `utils/` 폴더로 분리합니다. (`.ts` 확장자 사용)
- **Custom Hooks (Stateful Logic)**: React의 상태나 생명주기를 사용하면서 여러 컴포넌트에서 재사용되거나 컴포넌트 로직을 깔끔하게 유지하고 싶을 때 `hooks/` 폴더로 분리합니다. (`use`로 시작하는 이름 사용)
- **UI Components (View)**: 컴포넌트는 가급적 데이터가 어떻게 보일지에 집중하며, 복잡한 계산이나 상태 관리 로직은 위에서 분리된 Utils나 Hooks를 호출하여 사용합니다.

### 예제

#### ❌ Bad: 컴포넌트 내부에 모든 로직이 섞여 있는 경우
```tsx
const UserProfile = () => {
  const [user, setUser] = useState(null);
  
  // 데이터 페칭 로직 (Stateful)
  useEffect(() => { /* ... fetch logic ... */ }, []);

  // 문자열 처리 로직 (Pure)
  const formatName = (u) => u ? `${u.lastName} ${u.firstName}` : "";

  return <div>{formatName(user)}</div>;
};
```

#### ✅ Good: 관심사에 따라 로직을 분리한 경우
```tsx
// utils/user-format.ts (Pure Logic)
export const formatName = (user) => user ? `${user.lastName} ${user.firstName}` : "";

// hooks/useUser.ts (Stateful Logic)
export const useUser = (userId) => {
  const [user, setUser] = useState(null);
  useEffect(() => { /* ... fetch logic ... */ }, [userId]);
  return user;
};

// UserProfile.tsx (View)
import { formatName } from '@/utils/user-format';
import { useUser } from '@/hooks/useUser';

const UserProfile = ({ userId }) => {
  const user = useUser(userId);
  return <div>{formatName(user)}</div>;
};
```

## 7. Function Granularity & Abstraction (함수 세분화 및 추상화)

하나의 함수가 너무 많은 책임을 가지거나 하드코딩된 로직이 길게 나열되지 않도록, 의미 있는 단위로 함수를 쪼개고 추상화해야 합니다.

### 지침
- **단일 책임 원칙 (SRP)**: 하나의 함수는 가급적 하나의 명확한 작업만 수행해야 합니다.
- **추상화 레벨 관리**: 고수준 함수(컴포넌트 메인 로직 등)에서는 저수준의 세부 구현 사항이 드러나지 않도록 서브 함수 호출 위주로 구성합니다.
- **함수 길이 제한**: 함수가 50~100라인을 넘어간다면 로직을 분리할 수 있는 신호로 간주하세요.

### 예제

#### ❌ Bad: 하나의 이벤트 핸들러 안에 모든 세부 로직이 들어있는 경우
```javascript
const handleSave = async (data) => {
  // 1. 유효성 검사 로직 (하드코딩)
  if (!data.title) { alert('제목을 입력하세요'); return; }
  if (data.content.length < 10) { alert('내용이 너무 짧습니다'); return; }

  // 2. 데이터 변환 로직
  const payload = { ...data, updatedAt: new Date().toISOString(), status: 'draft' };

  // 3. 서버 전송 로직
  await fetch('/api/save', { method: 'POST', body: JSON.stringify(payload) });
  alert('저장 완료');
};
```

#### ✅ Good: 각 단계를 함수로 분리하여 추상화한 경우
```javascript
// 각 단계가 함수 호출로 표현되어 전체 흐름을 파악하기 쉬움
const handleSave = async (data) => {
  if (!validateData(data)) return;

  const payload = transformToPayload(data);
  
  await sendSaveRequest(payload);
  showSuccessMessage();
};

// 세부 구현은 아래의 작은 함수들로 분리
const validateData = (data) => { /* ... */ };
const transformToPayload = (data) => { /* ... */ };
const sendSaveRequest = async (payload) => { /* ... */ };
const showSuccessMessage = () => { /* ... */ };
```

## 8. Testing Strategy (테스트 전략)

프로젝트의 안정성을 위해 모든 코드는 테스트 가능해야 하며, 각 계층에 맞는 적절한 테스트 전략을 사용합니다.

### 지침
- **Testing Pyramid 준수**: 많은 수의 단위 테스트(Unit), 중간 수준의 컴포넌트 테스트, 소수의 통합/E2E 테스트 구조를 지향합니다.
- **사용자 중심 테스트**: 컴포넌트 테스트 시 내부 구현(state, private method)이 아닌, 사용자에게 보이는 텍스트나 버튼 클릭 등의 상호작용을 검증합니다.
- **시각적 고립**: 컴포넌트 개발 시 Storybook 등을 활용하여 다양한 상태(Loading, Error, Empty 등)를 독립적으로 검증합니다.

### 예제

#### ❌ Bad: 구현 세부 사항을 테스트하는 경우
```javascript
// 컴포넌트 내부의 state가 바뀌었는지는 사용자가 알 수 없는 영역임
test('버튼 클릭 시 state가 true가 된다', () => {
  const wrapper = render(<MyComponent />);
  expect(wrapper.state('isOpen')).toBe(true); 
});
```

#### ✅ Good: 사용자 경험을 테스트하는 경우 (React Testing Library 스타일)
```javascript
// 사용자가 화면에서 실제로 겪는 변화를 검증
test('열기 버튼 클릭 시 상세 내용이 화면에 나타난다', async () => {
  render(<MyComponent />);
  
  const button = screen.getByRole('button', { name: /열기/i });
  fireEvent.click(button);
  
  const detailText = await screen.findByText(/상세 정보 내용/i);
  expect(detailText).toBeInTheDocument();
});
```
