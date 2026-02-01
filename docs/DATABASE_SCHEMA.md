# Database Schema
# 데이터베이스 스키마

All tables are stored in **Supabase (PostgreSQL)**.
> 모든 테이블은 **Supabase (PostgreSQL)**에 저장됩니다.

## 1. companies (회사 정보)
Stores client companies and the internal agency (protected).
> 고객사 정보와 내부 운영 기관(Agency) 정보를 저장합니다.

| Column Name | Type | Description (설명) |
|---|---|---|
| `id` | `uuid` (PK) | Unique Company ID (고유 회사 ID) |
| `name` | `text` | Company Name (회사명) |
| `business_number` | `text` | Registration Number (사업자등록번호) |
| `representative` | `text` | CEO Name (대표자명) |
| `industry` | `text` | Industry Type (업종) |
| `phone` | `text` | Main Phone Number (대표 전화) |
| `zip_code` | `text` | Zip Code (우편번호) |
| `address` | `text` | Address (주소) |
| `remarks` | `text` | Notes (비고) |
| `status` | `text` | 'ACTIVE' or 'INACTIVE' (상태: 활성/비활성) |

## 2. app_users (사용자 정보)
Stores all system users (Admin, Support, Customer).
> 시스템의 모든 사용자(관리자, 지원팀, 고객) 정보를 저장합니다.

| Column Name | Type | Description (설명) |
|---|---|---|
| `id` | `uuid` (PK) | Unique User ID (고유 사용자 ID) |
| `login_id` | `text` | Login Identifier (로그인 ID) |
| `password` | `text` | Password (암호 - 평문 또는 해시) |
| `name` | `text` | User Name (사용자 이름) |
| `role` | `text` | Role (역할): 'ADMIN', 'SUPPORT', 'SUPPORT_LEAD', 'CUSTOMER' |
| `status` | `text` | Status (상태): 'ACTIVE', 'INACTIVE' |
| `mobile` | `text` | Mobile Phone (휴대전화) |
| `email` | `text` | Email Address (이메일) |
| `phone` | `text` | Office Phone (사무실 전화) |
| `company_id` | `uuid` (FK) | Reference to `companies.id` (소속 회사 ID) |
| `remarks` | `text` | Notes (비고) |
| `support_team_name` | `text` | Team Name (지원팀 소속명 - 지원/관리자 역할용) |

## 3. projects (프로젝트 정보)
Stores project details linked to clients.
> 고객사와 연계된 프로젝트 정보를 저장합니다.

| Column Name | Type | Description (설명) |
|---|---|---|
| `id` | `uuid` (PK) | Unique Project ID (고유 프로젝트 ID) |
| `name` | `text` | Project Name (프로젝트명) |
| `client_id` | `uuid` (FK) | Reference to `companies.id` (고객사 ID) |
| `customer_contact_ids` | `jsonb` | Array of User IDs (관련 고객 담당자 ID 목록) |
| `support_staff_ids` | `jsonb` | Array of User IDs (투입된 지원팀원 ID 목록) |
| `start_date` | `timestamp` | Project Start Date (시작일) |
| `end_date` | `timestamp` | Project End Date (종료일) |
| `description` | `text` | Description (설명) |
| `status` | `text` | Status (상태): 'ACTIVE', 'INACTIVE' |
| `remarks` | `text` | Notes (비고) |
| `support_team` | `text` | Responsible Team Name (전담 지원팀) |

## 4. tickets (티켓/요청 정보)
Stores customer requests and issues.
> 고객의 요청 사항 및 이슈(티켓)를 저장합니다.

| Column Name | Type | Description (설명) |
|---|---|---|
| `id` | `text` (PK) | Ticket ID (티켓 번호, 예: 'T-1001') |
| `title` | `text` | Ticket Title (제목) |
| `description` | `text` | Detailed Description (상세 내용) |
| `status` | `text` | Current Status (현재 상태 Enum) |
| `customer_id` | `uuid` (FK) | Reference to `app_users` (요청 고객 ID) |
| `customer_name` | `text` | Denormalized Customer Name (요청 고객명 - 조회 성능용) |
| `support_id` | `uuid` (FK) | Assigned Support Staff ID (배정된 담당자 ID) |
| `support_name` | `text` | Denormalized Support Staff Name (담당자명) |
| `project_id` | `uuid` (FK) | Reference to `projects` (관련 프로젝트 ID) |
| `created_at` | `timestamp` | Creation Time (생성 일시) |
| `due_date` | `timestamp` | Deadline (처리 기한) |
| `plan` | `text` | Handler's Plan (처리 계획) |
| `satisfaction` | `integer` | Customer Rating (만족도 점수 1-5) |
| `completion_feedback` | `text` | Customer Feedback (완료 후 고객 피드백) |
| `attachments` | `jsonb` | Array of file names (첨부파일 목록) |
| `plan_attachments` | `jsonb` | Array of file names (계획 첨부파일) |
| `intake_method` | `text` | Intake Method (접수 경로: 'PHONE', 'EMAIL' 등) |
| `request_date` | `timestamp` | Date Request Received (실제 요청 수신일) |
| `expected_completion_date` | `timestamp` | Planned Completion Date (처리 완료 예정일) |
| `expected_completion_delay_reason` | `text` | Reason for expected delay (처리 지연 예상 사유) |
| `shortened_due_reason` | `text` | Reason for tight deadline (단축 기한 사유) |
| `postpone_reason` | `text` | Reason for postponement (연기 요청 사유) |
| `postpone_date` | `timestamp` | Requested Postpone Date (연기 희망일) |
| `rejection_reason` | `text` | Reason for Rejection (반려 사유 - 연기/완료 반려 시) |

## 5. history (활동 이력)
Audit log for ticket changes.
> 티켓 관련 변경 사항 및 이벤트 이력 로그.

| Column Name | Type | Description (설명) |
|---|---|---|
| `id` | `uuid` (PK) | Unique Log ID (로그 ID) |
| `ticket_id` | `text` (FK) | Reference to `tickets.id` (관련 티켓 ID) |
| `status` | `text` | Status at that time (당시 상태) |
| `changed_by` | `text` | User who made the change (변경자) |
| `timestamp` | `timestamp` | Event Time (일시) |
| `note` | `text` | Description of change (변경 내용/노트) |

## 6. comments (의견/댓글)
Discussion threads for tickets.
> 티켓에 대한 댓글 및 의견 교환 내역.

| Column Name | Type | Description (설명) |
|---|---|---|
| `id` | `uuid` (PK) | Unique Comment ID (댓글 ID) |
| `ticket_id` | `text` (FK) | Reference to `tickets.id` (관련 티켓 ID) |
| `author_id` | `uuid` (FK) | Reference to `app_users` (작성자 ID) |
| `author_name` | `text` | Denormalized Author Name (작성자명) |
| `content` | `text` | Comment Body (내용) |
| `timestamp` | `timestamp` | Creation Time (작성 일시) |
| `attachments` | `jsonb` | Array of file names (첨부파일) |

## 7. agency_info (운영 기관 정보)
Singleton table for system agency settings.
> 시스템 운영 기관(Agency) 정보를 저장하는 단일 행 테이블입니다.

| Column Name | Type | Description (설명) |
|---|---|---|
| `name` | `text` (PK) | Agency Name (기관/회사명 - PK) |
| `ceo_name` | `text` | CEO Name (대표자명) |
| `registration_number` | `text` | Business Reg. Number (사업자번호) |
| `industry` | `text` | Industry (업종) |
| `phone_number` | `text` | Phone (전화번호) |
| `zip_code` | `text` | Zip Code (우편번호) |
| `address` | `text` | Address (주소) |
| `notes` | `text` | Remarks (비고) |
| `support_team_1` | `text` | Team Name 1 (지원팀명 1) |
| `support_team_2` | `text` | Team Name 2 (지원팀명 2) |
| `support_team_3` | `text` | Team Name 3 (지원팀명 3) |
