# Component Guide
# 컴포넌트 가이드

## 1. Core Layout (핵심 레이아웃)
- `App.tsx`: Main entry point. Handles Routing (Dashboard, Tickets, Projects, Management) and Layout (Sidebar, Topbar).
  > **메인 엔트리 포인트**: 라우팅(화면 이동) 및 전체 레이아웃 구조(사이드바, 탑바)를 정의합니다.
- `Sidebar`: (Implicit in `App.tsx`) Navigation menu.
  > **사이드바**: 메뉴 탐색을 위한 좌측 네비게이션 바.

## 2. Dashboard Components (대시보드 컴포넌트)
- `Dashboard`: Main view. Displays summary widgets.
  > **대시보드 메인**: 로그인 후 첫 화면으로, 주요 현황 위젯을 표시합니다.
- `NotificationZone`: Displays urgent alerts (Rejections, Approval requests, New comments).
  > **알림 존**: 반려, 승인 요청, 새 댓글 등 긴급한 알림을 모아서 보여주는 영역입니다.
- `StatusCard` / `UrgentCard`: Metric widgets.
  > **상태/긴급 카드**: 티켓 수, 긴급 건수 등 숫자로 된 주요 지표를 보여주는 위젯입니다.

## 3. Ticket Components (티켓 관련 컴포넌트)
- `TicketList`: Displays table of tickets with filtering.
  > **티켓 목록**: 검색 및 필터링 기능이 포함된 티켓 테이블 화면입니다.
- `TicketCreate`: Form to create new tickets.
  > **티켓 생성**: 새로운 요청을 등록하는 입력 폼입니다.
- `TicketDetail`: Comprehensive view of a single ticket.
  > **티켓 상세**: 하나의 티켓에 대한 모든 정보를 보여주는 상세 화면입니다.
    - `TicketHeader`: Title, Status, Metadata.
      > **헤더**: 제목, 상태, 기본 메타데이터 표시.
    - `TicketRequestSection`: Original request details.
      > **요청 내용**: 고객이 작성한 원본 요청 상세.
    - `TicketPlanSection`: Handler's plan and dates.
      > **처리 계획**: 담당자의 처리 계획 및 일정(기한) 관리 영역.
    - `TicketDiscussionSection`: Comments and file attachments.
      > **의견 나누기(토론)**: 댓글 작성 및 파일 첨부 영역.
    - `TicketSidebar`: Context info (Project details, History).
      > **사이드바**: 프로젝트 정보, 고객 연락처, 활동 이력(History) 표시.
    - `ActionButtons`: State transition controls (Start, Complete, Postpone, etc.).
      > **액션 버튼**: 시작, 완료, 연기 요청 등 상태 변경을 위한 버튼 모음.
- `Modal`: Generic modal wrapper for confirmations/inputs.
  > **모달**: 확인 창이나 팝업 입력을 위한 공통 모달 래퍼 컴포넌트.

## 4. Project Components (프로젝트 컴포넌트)
- `ProjectManagement`: CRUD for projects. Link to clients and staff.
  > **프로젝트 관리**: 프로젝트 생성/수정/삭제 및 고객사/팀원 연결 기능.
- `ProjectPerformance`: Report view for project-specific metrics.
  > **프로젝트 실적**: 특정 프로젝트의 성과 지표를 조회하는 보고서 화면.

## 5. Management Components (관리 컴포넌트)
- `UserManagement`: CRUD for system users.
  > **회원 관리**: 사용자 계정 생성 및 관리 화면.
- `CompanyManagement`: CRUD for client companies.
  > **고객사 관리**: 고객 회사 정보 및 내부 운영 기관 정보 관리 화면.
- `DataManagement`: System reset and Sample generation tools.
  > **데이터 관리**: 시스템 초기화 및 샘플 데이터 생성 도구.
- `Settings`: Agency Info configuration.
  > **환경 설정**: 운영 기관(Agency)의 세부 정보 설정 화면.

## 6. Report Components (보고서 컴포넌트)
- `PerformanceReport`: Overall system performance stats (SLA adherence, Volume).
  > **종합 성과**: 시스템 전체의 티켓 처리량, SLA 준수율 등을 보여주는 종합 보고서.

## 7. Utilities (유틸리티)
- `sampleDataGenerator.ts`: Logic to seed the database with initial test data.
  > **샘플 데이터 생성기**: 테스트를 위한 초기 데이터를 DB에 주입하는 로직.
