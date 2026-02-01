# System Architecture
# 시스템 아키텍처

## 1. High-Level Architecture (상위 레벨 아키텍처)
Nu-ServiceDesk follows a modern **Single Page Application (SPA)** architecture, utilizing a **React** frontend communicating with a **Supabase** (PostgreSQL) backend via RESTful APIs (Supabase Client).

> **설명**: Nu-ServiceDesk는 모던 **싱글 페이지 애플리케이션 (SPA)** 아키텍처를 따릅니다. **React** 기반의 프론트엔드가 **Supabase Client**를 통해 **Supabase (PostgreSQL)** 백엔드와 RESTful API 방식으로 통신합니다.

```mermaid
graph TD
    User[User Browser (사용자 브라우저)] <-->|HTTPS| CloudFront[CDN / Hosting (호스팅 서버)]
    CloudFront <-->|Static Assets (정적 파일)| ReactApp[React Application (앱)]
    
    subgraph Client Side (클라이언트 사이드)
        ReactApp -->|State Mgmt (상태 관리)| ReactHooks[Custom Hooks (커스텀 훅)]
        ReactHooks -->|API Calls (API 호출)| SupabaseClient[Supabase JS Client]
    end
    
    subgraph Backend (백엔드 - Supabase)
        SupabaseClient <-->|JSON| API[Supabase API Gateway]
        API <-->|SQL| DB[(PostgreSQL Database)]
        DB --> Auth[Auth Service (인증)]
        DB --> Storage[File Storage (파일 저장소)]
    end
```

## 2. Technology Stack (기술 스택)

### Frontend (프론트엔드)
- **Framework:** React 18 (Vite)
  > 최신 React 18 버전과 빠른 빌드 도구인 Vite 사용.
- **Language:** TypeScript
  > 정적 타입 지원을 통한 안정성 확보를 위해 TypeScript 사용.
- **Styling:** Tailwind CSS
  > 유틸리티 퍼스트 CSS 프레임워크인 Tailwind CSS로 빠르고 일관된 스타일링.
- **Icons:** Lucide React
  > 깔끔하고 현대적인 아이콘 라이브러리 사용.
- **Date Handling:** date-fns
  > 가볍고 강력한 날짜 처리 라이브러리.
- **Charts:** implied usage or custom capability
  > 데이터 시각화를 위한 차트 라이브러리 (또는 커스텀 구현).

### Backend (백엔드 - BaaS)
- **Platform:** Supabase
  > 오픈 소스 Firebase 대안인 Supabase 사용 (데이터베이스, 인증, 스토리지 통합 제공).
- **Database:** PostgreSQL
  > 강력한 관계형 데이터베이스 관리 시스템.
- **Authentication:** Custom Table (`app_users`) implementation (Simulated Auth for this version).
  > **인증**: 기본 Supabase Auth 대신, `app_users` 테이블을 이용한 커스텀 인증 구현 (데모/프로토타입 목적).
- **API:** Auto-generated REST API from Supabase.
  > Supabase가 데이터베이스 스키마를 기반으로 자동 생성하는 RESTful API 사용.

## 3. Directory Structure (폴더 구조)
```
/
├── components/          # React UI Components (UI 컴포넌트 모음)
│   ├── ticket-detail/   # Sub-components for Ticket Detail view (티켓 상세 화면용 하위 컴포넌트)
│   └── ...              # Feature-based components (주요 기능별 컴포넌트 - 티켓생성, 사용자관리 등)
├── hooks/               # Custom React Hooks (커스텀 훅 - 비즈니스 로직 분리)
│   ├── useServiceDesk.ts # Main aggregator hook (전체 데이터를 통합 관리하는 메인 훅)
│   ├── useTickets.ts    # Ticket CRUD logic (티켓 관련 로직)
│   └── ...
├── lib/                 # Utilities and Configurations (라이브러리 설정 및 유틸)
│   ├── supabase.ts      # Supabase Client setup (Supabase 클라이언트 설정)
│   └── dbMappers.ts     # Data transformation (데이터 변환기: Snake_case <-> CamelCase)
├── services/            # API Layer (API 통신 계층)
│   └── api.ts           # Centralized API definitions (API 함수 정의 모음)
├── docs/                # Project Documentation (프로젝트 문서 폴더)
├── types.ts             # TypeScript Intefaces and Enums (타입 정의 및 Enum 상수)
├── utils.ts             # Helper functions (날짜 포맷팅 등 헬퍼 함수)
└── App.tsx              # Main Router and Layout (메인 라우터 및 레이아웃 설정)
```

## 4. Key Design Patterns (주요 디자인 패턴)
- **Container/Presenter Pattern (Partial):** Logic is largely abstracted into `hooks/`, keeping components focused on UI rendering.
  > **컨테이너/프리젠터 패턴 (부분 적용)**: 복잡한 비즈니스 로직과 상태 관리는 `hooks/` 폴더 내의 커스텀 훅으로 분리하고, 컴포넌트는 UI 렌더링에 집중하도록 설계했습니다.
- **Mapper Pattern:** `dbMappers.ts` isolates the application domain model (CamelCase) from the database schema (Snake_case), preventing DB naming conventions from leaking into the UI code.
  > **매퍼(Mapper) 패턴**: 데이터베이스의 칼럼 명명 규칙(Snake_case, 예: `user_id`)과 프론트엔드의 변수 명명 규칙(CamelCase, 예: `userId`)을 `dbMappers.ts`에서 상호 변환합니다. 이를 통해 DB 구조 변경이 UI 코드에 미치는 영향을 최소화합니다.
- **Optimistic Updates:** The UI often updates local state immediately for better UX while waiting for async DB operations (handled in hooks).
  > **낙관적 업데이트 (Optimistic Updates)**: DB 응답을 기다리지 않고 UI를 먼저 업데이트하여 사용자에게 즉각적인 반응성을 제공합니다 (실패 시 롤백하는 로직 포함 가능).
