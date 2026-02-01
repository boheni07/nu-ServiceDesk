# Product Requirements Document (PRD)
# 제품 요구사항 정의서

## 1. Product Overview (제품 개요)
**Product Name:** Nu-ServiceDesk  
**Description:** A comprehensive Service Desk and Project Management system designed for IT service providers to manage customer requests (tickets), projects, and contracts efficiently. It provides role-based access for Administrators, Support Teams, and Customers.

> **설명**: IT 서비스 제공업체가 고객의 요청(티켓), 프로젝트, 계약 등을 효율적으로 관리하기 위해 설계된 종합 서비스 데스크 및 프로젝트 관리 시스템입니다. 관리자, 지원팀, 고객 등 역할에 따른 차별화된 접근 권한과 기능을 제공합니다.

## 2. Key Objectives (핵심 목표)
- **Centralized Management:** Unified platform for tracking all customer issues and project statuses.
  > **통합 관리**: 모든 고객 이슈와 프로젝트 현황을 하나의 플랫폼에서 추적 및 관리합니다.
- **Role-Based Access Control (RBAC):** Distinct views and permissions for Admin, Support Lead, Support Staff, and Customers.
  > **역할 기반 권한 제어**: 관리자, 팀장, 팀원, 고객별로 구분된 화면과 권한을 제공합니다.
- **Process Standardization:** Enforced workflows for ticket handling (Receipt -> Work -> Completion -> Verification).
  > **프로세스 표준화**: 접수 -> 작업 -> 완료 -> 검증(승인)으로 이어지는 티켓 처리 워크플로우를 시스템적으로 강제합니다.
- **Data Integrity:** Protection of core system data (Agency Info) and consistent data relationships.
  > **데이터 무결성**: 시스템 운영 주체(Agency) 정보 등 핵심 데이터를 보호하고, 데이터 간의 관계를 일관성 있게 유지합니다.

## 3. User Roles (사용자 역할)
| Role | Description | Key Permissions (주요 권한) |
|---|---|---|
| **Admin** (관리자) | System Administrator | Full access to all modules, including system settings and user/company management.<br>(시스템 설정, 사용자/고객사 관리를 포함한 모든 모듈에 대한 전체 접근 권한) |
| **Support Lead** (지원팀장) | Team Leader | Manage projects, assign tickets, view all reports, manage team members.<br>(프로젝트 관리, 티켓 배정, 모든 보고서 조회, 팀원 관리) |
| **Support** (지원담당) | Staff/Engineer | Handle assigned tickets, view project details, update work logs.<br>(배정된 티켓 처리, 프로젝트 상세 조회, 작업 로그 업데이트) |
| **Customer** (고객) | Client User | Create tickets, view status of own tickets/projects, providing feedback.<br>(티켓 생성, 본인 티켓/프로젝트 상태 조회, 피드백 및 만족도 평가) |

## 4. Functional Requirements (기능 요구사항)

### 4.1. Authentication & User Management (인증 및 사용자 관리)
- **Login:** Secure login using ID/Password.
  > **로그인**: ID/비밀번호를 이용한 보안 로그인.
- **User CRUD:** Create, Read, Update, Delete users.
  > **사용자 관리**: 사용자 생성, 조회, 수정, 삭제 기능.
- **Company Management:** Manage client companies and the internal Agency.
  > **회사 관리**: 고객사 및 내부 운영 기관(Agency) 정보 관리.
- **Agency Protection:** Prevent accidental deletion or modification of the Agency's core company record and Admin account.
  > **운영 기관 보호**: 운영 기관(Agency)의 핵심 데이터 및 관리자 계정이 실수로 삭제되거나 수정되지 않도록 보호 로직 적용.

### 4.2. Dashboard & Navigation (대시보드 및 탐색)
- **Role-specific Dashboard:**
    - **Admin/Support:** Overview of total tickets, urgent tasks, project status, and team workload.
      > **관리자/지원팀**: 전체 티켓 현황, 긴급 작업, 프로젝트 상태, 팀 업무량 개요 표시.
    - **Customer:** Overview of their own open tickets and active projects.
      > **고객**: 본인이 등록한 진행 중인 티켓과 참여 프로젝트 개요 표시.
- **Notification Zone:** Real-time alerts for urgent matters (e.g., "Postpone Rejected", "Completion Approved").
  > **알림 존**: "연기 요청 반려", "완료 승인" 등 긴급하고 중요한 사항에 대한 실시간 알림 제공.

### 4.3. Ticket Management (Core) (티켓 관리 - 핵심 기능)
- **Ticket Lifecycle (티켓 수명주기):**
    - `WAITING` (대기): 최초 등록 상태.
    - `RECEIVED` (접수): 지원팀이 티켓을 확인하고 접수한 상태.
    - `IN_PROGRESS` (처리중): 실제 작업이 진행 중인 상태.
    - `DELAYED` / `POSTPONE_REQUESTED` (지연/연기요청): 기한 준수가 어려워 연기를 요청하거나 지연된 상태.
    - `COMPLETION_REQUESTED` (완료요청): 작업 완료 후 고객의 승인을 기다리는 상태.
    - `COMPLETED` (완료): 고객 승인으로 최종 종결된 상태.
- **Features (주요 기능):** 
    - Create ticket (Phone, Email, Discovery, etc.).
      > 티켓 생성 (전화, 메일, 시스템 발견 등 다양한 접수 경로 지원).
    - Update status with notes.
      > 상태 변경 및 작업 노트(Note) 기록.
    - **Discussion/Comments:** Threaded comments with file attachments support.
      > **의견 나누기(댓글)**: 파일 첨부가 가능한 스레드형 댓글 기능으로 소통 지원.
    - **Activity History:** Audit log of all status changes.
      > **활동 이력**: 모든 상태 변경 및 주요 이벤트에 대한 감사 로그(Audit Log) 자동 기록.
    - **Deadlines:** Due date management with postponement workflow.
      > **기한 관리**: 처리 기한 설정 및 사유 입력을 통한 기한 연기 승인 처리 프로세스.

### 4.4. Project Management (프로젝트 관리)
- Manage project details (Client, Period, Staffing).
  > 프로젝트 상세 정보(고객사, 기간, 투입 인력) 관리.
- Link tickets to specific projects.
  > 티켓과 특정 프로젝트 연결 (프로젝트별 이슈 추적 가능).
- Project Performance reports (Task volume, completion rates).
  > 프로젝트별 성과 보고 (티켓 발생량, 처리율 등 분석).

### 4.5. Reporting (보고서)
- **Performance Report:** Comprehensive metrics on ticket handling, response times, and customer satisfaction.
  > **종합 성과 보고서**: 티켓 처리 현황, 응답 속도, 고객 만족도 등에 대한 종합적인 지표 제공.
- **Project Performance:** Drill-down view into specific project metrics.
  > **프로젝트 실적**: 특정 프로젝트에 집중된 세부 지표 및 성과 조회 화면.

### 4.6. System Settings (Agency Info) (시스템 설정)
- Manage the Service Provider's (Agency) details (Name, CEO, Contact, Teams).
  > **운영 기관 정보**: 서비스 제공자(Agency)의 기본 정보(이름, 대표자, 연락처, 지원팀 구성 등) 관리.
- This data reflects globally across the system (e.g., in reports or footers).
  > 이 정보는 시스템 전반(보고서, 푸터 등)에 공통으로 반영됩니다.

## 5. Non-Functional Requirements (비기능 요구사항)
- **Performance:** UI should load within 2 seconds.
  > **성능**: 주요 UI는 2초 이내에 로딩되어야 함.
- **Responsiveness:** Support for desktop and tablet resolutions.
  > **반응형**: 데스크탑 및 태블릿 해상도 지원.
- **Data Persistence:** All data stored in Supabase (PostgreSQL).
  > **데이터 영속성**: 모든 데이터는 Supabase(PostgreSQL)에 안전하게 저장.
- **Security:** API access restricted by RLS (Row Level Security) policies (implied).
  > **보안**: API 접근은 RLS(행 수준 보안) 정책 등을 통해 통제됨 (구현 시 고려).
