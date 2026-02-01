# 시스템 상세 기술 명세서 (Technical Specification)

## 1. 시스템 개요 (System Overview)
본 문서는 Service Desk 시스템의 기술적 구조, 데이터베이스 설계, 소스 코드 아키텍처 및 데이터 처리 체계를 설명합니다.

### 1.1 기술 스택
- **Frontend**: React (Vite 기반), TypeScript
- **Styling**: Tailwind CSS
- **Icon Set**: Lucide React
- **Backend / Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks (Custom Hooks Pattern)

---

## 2. 아키텍처 및 폴더 구조 (Architecture & Code Structure)

### 2.1 폴더 구조
```
/src
├── /components      # UI 컴포넌트 (Dashboard, ProjectManagement, TicketBoard 등)
├── /hooks           # 비즈니스 로직 및 상태 관리 (useServiceDesk, useTickets 등)
├── /services        # API 통신 계층 (api.ts - Supabase Client 래핑)
├── /lib             # 유틸리티 및 매퍼 (supabase.ts, dbMappers.ts)
├── /types           # TypeScript 인터페이스 및 Enum 정의 (types.ts)
└── App.tsx          # 메인 라우팅 및 레이아웃
```

### 2.2 계층별 역할
1.  **View Layer (Components)**:
    -   사용자 인터페이스 렌더링.
    -   비즈니스 로직은 직접 포함하지 않고 `hooks`를 통해 데이터를 받아옴.
2.  **Logic Layer (Hooks)**:
    -   **`useServiceDesk`**: 전체 Hook을 통합 관리하는 최상위 Hook. 데이터 초기화, 백업/복원 등 전역 기능 담당.
    -   **`useTickets`, `useProjects`, `useUsers`, `useCompanies`**: 도메인별 상태 관리 및 CRUD 로직.
3.  **Service Layer (api.ts)**:
    -   Legacy: 초기에는 로컬 상태를 에뮬레이션하였으나, 현재는 Supabase Client를 직접 호출하는 방식으로 전환됨.
    -   역할: Supabase 쿼리를 캡슐화하여 비즈니스 로직과 DB 접근을 분리.
4.  **Utility Layer (dbMappers.ts)**:
    -   **역할**: 애플리케이션의 `CamelCase` 데이터와 데이터베이스의 `snake_case` 컬럼 간의 양방향 변환 담당.
    -   **중요성**: DB 스키마 변경 시 이 파일만 수정하면 전역 반영됨.

---

## 3. 데이터베이스 구조 (Database Schema)

모든 테이블은 PostgreSQL 기반이며, 주요 테이블 구조는 다음과 같습니다.

### 3.1 주요 테이블 (Core Tables)

#### **app_users** (사용자)
| 컬럼명 | 타입 | 설명 |
|---|---|---|
| id | UUID/String | 사용자 고유 ID |
| login_id | VARCHAR | 로그인 ID (Unique) |
| role | VARCHAR | 권한 (ADMIN, SUPPORT_LEAD, SUPPORT, CUSTOMER) |
| company_id | UUID | 소속 회사 (Link to companies) |
| status | VARCHAR | 상태 (ACTIVE, INACTIVE) |

#### **companies** (고객사)
| 컬럼명 | 타입 | 설명 |
|---|---|---|
| id | UUID/String | 고객사 ID |
| name | VARCHAR | 고객사명 |
| business_number | VARCHAR | 사업자번호 |
| status | VARCHAR | 계약 상태 (ACTIVE, INACTIVE) |

#### **projects** (프로젝트)
| 컬럼명 | 타입 | 설명 |
|---|---|---|
| id | UUID/String | 프로젝트 ID |
| client_id | UUID | 발주 고객사 (Link to companies) |
| support_staff_ids | JSONB/Array | 투입 지원 인력 ID 목록 |
| status | VARCHAR | 프로젝트 상태 (ACTIVE, INACTIVE) |

#### **tickets** (요청 티켓)
| 컬럼명 | 타입 | 설명 |
|---|---|---|
| id | UUID/String | 티켓 번호 (예: T-1234) |
| project_id | UUID | 관련 프로젝트 |
| status | VARCHAR | 진행 상태 (WAITING, RECEIVED, IN_PROGRESS 등) |
| due_date | TIMESTAMP | 처리 기한 |
| customer_id | UUID | 요청자 |
| support_id | UUID | 담당자 |

#### **agency_info** (에이전시 정보)
시스템 운영 주체(공급사)의 정보 저장 (단일 레코드)

### 3.2 Enum (코드 정의)
- **UserStatus / ProjectStatus / CompanyStatus**: `ACTIVE` (활성), `INACTIVE` (비활성)
- **TicketStatus**:
    - `WAITING` (대기)
    - `RECEIVED` (접수)
    - `IN_PROGRESS` (처리중)
    - `COMPLETION_REQUESTED` (완료요청)
    - `COMPLETED` (완료)

---

## 4. 데이터 처리 체계 (Data Processing)

### 4.1 CRUD 데이터 흐름
`User Action` -> `Component Event` -> `Custom Hook` -> `api.ts (Service)` -> `dbMappers (Convert)` -> `Supabase (DB)`

### 4.2 데이터 매핑 (Mapping Strategy)
DB는 `snake_case`, App은 `camelCase`를 사용하므로 `lib/dbMappers.ts`에서 변환합니다.
- **ToDB**: `mapUserToDB`, `mapTicketUpdatesToDB` 등 (App -> DB)
- **FromDB**: `mapUser`, `mapTicket` 등 (DB -> App)

### 4.3 데이터 관리 기능 (Data Management)
`useServiceDesk` 훅 내에 구현된 특수 기능입니다.
1.  **초기화 (Reset)**:
    -   Admin 계정 및 기본 회사('c1')를 제외한 모든 데이터 삭제 (`TRUNCATE` 유사 동작).
2.  **샘플 생성 (Sample Generation)**:
    -   `sampleDataGenerator.ts`의 더미 데이터를 로드하여 일괄 `INSERT`.
3.  **백업/복원 (Backup/Restore)**:
    -   **Backup**: 모든 테이블의 데이터를 JSON 형태로 추출하여 다운로드.
    -   **Restore**: 시스템 초기화 후 백업 JSON 데이터를 일괄 `UPSERT`.

---

## 5. 보안 및 권한 체계 (Security & Permissions)
- **Row Level Security (RLS)**: (향후 도입 예정) 현재는 애플리케이션 레벨(`useServiceDesk.ts`의 `filteredProjects` 등)에서 롤 기반 필터링 수행.
- **Admin 보호**: 시스템 초기화 시에도 `admin` 계정은 삭제되지 않도록 로직 레벨에서 보호됨.
