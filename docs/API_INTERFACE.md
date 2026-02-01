# API Interface
# API 인터페이스

The application uses an internal service layer (`services/api.ts`) against Supabase.
> 애플리케이션은 Supabase와 통신하기 위해 내부 서비스 레이어인 `services/api.ts`를 사용합니다.

## 1. Companies API (`api.companies`) - 회사 관리 API
- `getAll()`: Returns `Promise<Company[]>`
  > **모든 회사 목록 조회**: 등록된 모든 회사 정보를 배열로 반환합니다.
- `create(company: Company)`: Returns `Promise<Company>`
  > **회사 생성**: 새로운 회사를 등록하고 생성된 객체를 반환합니다.
- `update(id: string, updates: Partial<Company>)`: Returns `Promise<void>`
  > **회사 정보 수정**: 특정 ID의 회사 정보를 부분적으로 수정합니다.
- `delete(id: string)`: Returns `Promise<void>`
  > **회사 삭제**: 특정 ID의 회사를 삭제합니다.
- `rawDeleteAll(exceptId?: string)`: Returns `Promise<void>`
  > **전체 삭제 (초기화용)**: 특정 ID(예: Agency)를 제외한 모든 회사를 삭제합니다.

## 2. Users API (`api.users`) - 사용자 관리 API
- `getAll()`: Returns `Promise<User[]>`
  > **모든 사용자 목록 조회**: 시스템에 등록된 모든 사용자를 반환합니다.
- `create(user: User)`: Returns `Promise<User>`
  > **사용자 생성**: 새로운 사용자를 등록합니다.
- `update(id: string, updates: Partial<User>)`: Returns `Promise<void>`
  > **사용자 정보 수정**: 특정 ID의 사용자 정보를 업데이트합니다.
- `delete(id: string)`: Returns `Promise<void>`
  > **사용자 삭제**: 특정 ID의 사용자를 삭제합니다.
- `rawDeleteAll(exceptRole?: string)`: Returns `Promise<void>`
  > **전체 삭제 (초기화용)**: 특정 역할(예: ADMIN)을 제외한 모든 사용자를 삭제합니다.

## 3. Projects API (`api.projects`) - 프로젝트 관리 API
- `getAll()`: Returns `Promise<Project[]>`
  > **모든 프로젝트 목록 조회**: 시스템상의 모든 프로젝트를 반환합니다.
- `create(project: Project)`: Returns `Promise<void>`
  > **프로젝트 생성**: 신규 프로젝트를 생성합니다.
- `update(id: string, updates: Partial<Project>)`: Returns `Promise<void>`
  > **프로젝트 수정**: 프로젝트 정보를 업데이트합니다.
- `delete(id: string)`: Returns `Promise<void>`
  > **프로젝트 삭제**: 특정 프로젝트를 삭제합니다.
- `rawDeleteAll(exceptId?: string)`: Returns `Promise<void>`
  > **전체 삭제 (초기화용)**: 모든 프로젝트 데이터를 삭제합니다.

## 4. Tickets API (`api.tickets`) - 티켓(요청) 관리 API
- `getAll()`: Returns `Promise<Ticket[]>`
  > **모든 티켓 조회**: 등록된 모든 티켓을 최신순으로 반환합니다.
- `create(ticket: Ticket)`: Returns `Promise<Ticket>`
  > **티켓 생성**: 새로운 티켓을 생성합니다.
- `update(id: string, updates: Partial<Ticket>)`: Returns `Promise<void>`
  > **티켓 수정**: 티켓의 상태나 내용을 업데이트합니다.
- `delete(id: string)`: Returns `Promise<void>`
  > **티켓 삭제**: 특정 티켓을 영구 삭제합니다.
- `rawDeleteAll(exceptId?: string)`: Returns `Promise<void>`
  > **전체 삭제 (초기화용)**: 모든 티켓 데이터를 삭제합니다.

## 5. History API (`api.history`) - 활동 이력 API
- `getAll()`: Returns `Promise<HistoryEntry[]>`
  > **전체 이력 조회**: 시스템 내의 모든 활동 로그를 반환합니다.
- `create(entry: HistoryEntry)`: Returns `Promise<void>`
  > **이력 생성**: 상태 변경 등의 이벤트 발생 시 로그를 기록합니다.
- `rawDeleteAll(exceptId?: string)`: Returns `Promise<void>`
  > **전체 삭제 (초기화용)**: 이력 로그를 모두 지웁니다.

## 6. Comments API (`api.comments`) - 댓글/의견 API
- `getAll()`: Returns `Promise<Comment[]>`
  > **전체 댓글 조회**: 모든 티켓의 댓글을 반환합니다 (필터링 필요).
- `create(comment: Comment)`: Returns `Promise<void>`
  > **댓글 작성**: 새로운 댓글을 저장합니다.
- `rawDeleteAll(exceptId?: string)`: Returns `Promise<void>`
  > **전체 삭제 (초기화용)**: 모든 댓글 데이터를 삭제합니다.

## 7. Agency Info API (`api.agencyInfo`) - 운영 기관 정보 API
- `get()`: Returns `Promise<AgencyInfo | null>`
  > **기관 정보 조회**: 단일 기관 정보를 가져옵니다. 없으면 null을 반환합니다.
- `upsert(info: AgencyInfo)`: Returns `Promise<void>`
  > **기관 정보 등록/수정**: 기관 정보를 저장하거나 업데이트합니다 (Upsert).
