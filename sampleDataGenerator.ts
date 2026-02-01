import { Company, User, Project, Ticket, TicketStatus, UserRole, UserStatus, CompanyStatus, ProjectStatus, HistoryEntry, AgencyInfo } from './types';
import { addDays, format } from 'date-fns';
import { addBusinessDays } from './utils';

// 1. Initial Sample Companies (5 items)
export const initialCompanies: Company[] = [
    { id: 'c1', name: '누테크놀로지', businessNumber: '123-45-67890', representative: '누대표', industry: 'IT 서비스', phone: '02-1234-5678', zipCode: '06242', address: '서울시 강남구 테헤란로 123', remarks: '본사 (시스템 운영)', status: CompanyStatus.ACTIVE },
    { id: 'c2', name: '(주)미래제조', businessNumber: '234-56-78901', representative: '김미래', industry: '첨단 제조업', phone: '031-456-7890', zipCode: '13487', address: '경기도 성남시 판교로 456', remarks: '핵심 고객사 (연간 계약)', status: CompanyStatus.ACTIVE },
    { id: 'c3', name: '글로벌유통', businessNumber: '345-67-89012', representative: '이유통', industry: '물류/유통', phone: '051-789-0123', zipCode: '48058', address: '부산시 해운대구 센텀중앙로 78', remarks: '전략적 파트너', status: CompanyStatus.ACTIVE },
    { id: 'c4', name: '한국금융솔루션', businessNumber: '456-78-90123', representative: '박금융', industry: '핀테크/금융', phone: '02-9999-8888', zipCode: '07325', address: '서울시 영등포구 여의대로 99', remarks: '보안 중시 고객', status: CompanyStatus.ACTIVE },
    { id: 'c5', name: '스마트공공', businessNumber: '567-89-01234', representative: '최공공', industry: '공공/행정', phone: '044-123-4567', zipCode: '30112', address: '세종특별자치시 도움로 12', remarks: '정부 과제 수행', status: CompanyStatus.ACTIVE },
];

// 2. Initial Sample Users (5 items)
export const initialUsers: User[] = [
    { id: 'u1', loginId: 'admin', password: 'password123', name: '관리자(Admin)', role: UserRole.ADMIN, status: UserStatus.ACTIVE, mobile: '010-1111-2222', email: 'admin@nu.com', companyId: 'c1' },
    { id: 'u2', loginId: 'support1', password: 'password123', name: '지원팀장(Support)', role: UserRole.SUPPORT_LEAD, status: UserStatus.ACTIVE, mobile: '010-3333-4444', email: 'support1@nu.com', companyId: 'c1', team: '기술지원 1팀' },
    { id: 'u3', loginId: 'support2', password: 'password123', name: '엔지니어(Tech)', role: UserRole.SUPPORT, status: UserStatus.ACTIVE, mobile: '010-7777-8888', email: 'support2@nu.com', companyId: 'c1', team: '기술지원 2팀' },
    { id: 'u4', loginId: 'customer1', password: 'password123', name: '김고객(Customer)', role: UserRole.CUSTOMER, status: UserStatus.ACTIVE, companyId: 'c2', phone: '02-123-4567', mobile: '010-5555-6666', email: 'customer1@mirai.com' },
    { id: 'u5', loginId: 'customer2', password: 'password123', name: '박파트너(Customer)', role: UserRole.CUSTOMER, status: UserStatus.ACTIVE, companyId: 'c3', phone: '051-987-6543', mobile: '010-9999-0000', email: 'customer2@global.com' },
];

// 3. Initial Sample Projects (5 items)
export const initialProjects: Project[] = [
    { id: 'p1', name: 'ERP 시스템 고도화 프로젝트', clientId: 'c2', customerContactIds: ['u4'], supportStaffIds: ['u2', 'u3'], description: '기존 레거시 ERP를 클라우드 기반으로 고도화하고 모바일 접근성을 강화함.', startDate: addDays(new Date(), -90).toISOString(), endDate: addDays(new Date(), 90).toISOString(), status: ProjectStatus.ACTIVE, supportTeam: '기술지원 1팀' },
    { id: 'p2', name: '글로벌 물류 트래킹 시스템', clientId: 'c3', customerContactIds: ['u5'], supportStaffIds: ['u3'], description: '해외 배송 현황을 실시간으로 추적하는 IoT 기반 관제 시스템 구축.', startDate: addDays(new Date(), -60).toISOString(), endDate: addDays(new Date(), 120).toISOString(), status: ProjectStatus.ACTIVE, supportTeam: '기술지원 2팀' },
    { id: 'p3', name: '금융 보안 모듈 업데이트', clientId: 'c4', customerContactIds: [], supportStaffIds: ['u2'], description: '최신 금융 보안 가이드라인 준수를 위한 암호화 모듈 전체 교체.', startDate: addDays(new Date(), -30).toISOString(), endDate: addDays(new Date(), 330).toISOString(), status: ProjectStatus.ACTIVE, supportTeam: '기술지원 1팀' },
    { id: 'p4', name: '공공데이터 포털 연동', clientId: 'c5', customerContactIds: [], supportStaffIds: ['u2'], description: '공공데이터 포털의 Open API를 활용한 대민 서비스 개발.', startDate: addDays(new Date(), -15).toISOString(), endDate: addDays(new Date(), 45).toISOString(), status: ProjectStatus.ACTIVE, supportTeam: '기술지원 1팀' },
    { id: 'p5', name: '스마트 팩토리 AI 도입', clientId: 'c2', customerContactIds: ['u4'], supportStaffIds: ['u2', 'u3'], description: '생산 라인 불량률 예측을 위한 머신러닝 모델 도입 및 시각화.', startDate: addDays(new Date(), 10).toISOString(), endDate: addDays(new Date(), 180).toISOString(), status: ProjectStatus.ACTIVE, supportTeam: '기술지원 2팀' },
];

export const initialAgencyInfo: AgencyInfo = {
    name: 'NuBiz',
    ceoName: '이누비',
    industry: '소프트웨어 자문, 개발 및 공급',
    phoneNumber: '02-1234-5678',
    zipCode: '06242',
    address: '서울시 강남구 테헤란로 123 누비즈타워 10층',
    notes: '시스템 운영 및 유지보수 전담 기관입니다.',
    supportTeam1: '기술지원 1팀',
    supportTeam2: '기술지원 2팀',
    supportTeam3: '개발팀'
};

// 4. Initial Sample Tickets (Strict Logic Applied) - 5 items
export const getInitialTickets = (now: Date): Ticket[] => [
    // 1. WAITING
    {
        id: 'T-1001',
        title: '로그인 페이지 간헐적 세션 만료 현상',
        description: 'PC 크롬 브라우저에서 로그인 후 10분 정도 지나면 세션이 만료되었다며 튕기는 현상이 발생합니다. 긴급 확인 부탁드립니다.',
        status: TicketStatus.WAITING,
        customerId: 'u4',
        customerName: '김고객(Customer)',
        projectId: 'p1',
        createdAt: addDays(now, -1).toISOString(),
        originalDueDate: addBusinessDays(now, 3).toISOString(),
        dueDate: addBusinessDays(now, 3).toISOString()
    },
    // 2. RECEIVED
    {
        id: 'T-1002',
        title: '물류 입고 데이터 엑셀 업로드 오류',
        description: '대량의 입고 데이터를 엑셀로 업로드할 때 500행 이상이면 타임아웃 오류가 발생합니다. 분할 업로드 기능이 필요합니다.',
        status: TicketStatus.RECEIVED,
        customerId: 'u5',
        customerName: '박파트너(Customer)',
        supportId: 'u3',
        supportName: '엔지니어(Tech)',
        projectId: 'p2',
        createdAt: addDays(now, -2).toISOString(),
        originalDueDate: addBusinessDays(now, 5).toISOString(),
        dueDate: addBusinessDays(now, 5).toISOString()
    },
    // 3. IN_PROGRESS
    {
        id: 'T-1003',
        title: '보안 모듈 패치 적용 일정 조율',
        description: '이번 달 정기 보안 패치 적용을 위해 서버 재부팅이 필요한지 확인 요청드립니다.',
        status: TicketStatus.IN_PROGRESS,
        customerId: 'u4',
        customerName: '김고객(Customer)',
        supportId: 'u2',
        supportName: '지원팀장(Support)',
        projectId: 'p3',
        plan: '서버 담당자와 협의하여 무중단 배포 방식으로 진행 예정. 필요시 야간 작업 수행.',
        expectedCompletionDate: addDays(now, 2).toISOString(),
        createdAt: addDays(now, -3).toISOString(),
        originalDueDate: addBusinessDays(now, 4).toISOString(),
        dueDate: addBusinessDays(now, 4).toISOString()
    },
    // 4. DELAYED
    {
        id: 'T-1004',
        title: '공공 API 스펙 변경에 따른 긴급 수정',
        description: '갑작스러운 API 응답 포맷 변경으로 데이터 수집이 중단되었습니다. 빠른 조치 바랍니다.',
        status: TicketStatus.DELAYED,
        customerId: 'u4',
        customerName: '김고객(Customer)',
        supportId: 'u3',
        supportName: '엔지니어(Tech)',
        projectId: 'p4',
        plan: 'API 문서 분석 중이나 변경 사항이 많아 시간이 소요되고 있음.',
        expectedCompletionDate: addDays(now, -1).toISOString(),
        createdAt: addDays(now, -5).toISOString(),
        originalDueDate: addDays(now, -1).toISOString(),
        dueDate: addDays(now, -1).toISOString()
    },
    // 5. COMPLETED
    {
        id: 'T-1005',
        title: '대시보드 차트 색상 테마 변경 요청',
        description: '기존 파란색 계열 차트를 회사 브랜드 컬러인 초록색 계열로 변경 요청합니다.',
        status: TicketStatus.COMPLETED,
        customerId: 'u5',
        customerName: '박파트너(Customer)',
        supportId: 'u2',
        supportName: '지원팀장(Support)',
        projectId: 'p5',
        plan: 'CSS 테마 변수 수정 및 차트 라이브러리 설정 변경 완료.',
        expectedCompletionDate: addDays(now, -3).toISOString(),
        satisfaction: 5,
        completionFeedback: '요청한 대로 깔끔하게 변경되었습니다. 가독성이 좋아졌네요! 감사합니다.',
        createdAt: addDays(now, -10).toISOString(),
        originalDueDate: addDays(now, -5).toISOString(),
        dueDate: addDays(now, -5).toISOString()
    }
];

export const generateSampleHistory = (tickets: Ticket[]): HistoryEntry[] => {
    const history: HistoryEntry[] = [];

    tickets.forEach(t => {
        // 1. Creation
        history.push({
            id: `h-${t.id}-init`,
            ticketId: t.id,
            status: TicketStatus.WAITING,
            changedBy: t.customerName,
            timestamp: t.createdAt,
            note: `티켓이 신규 등록되었습니다. (요청 기한: ${format(new Date(t.originalDueDate!), 'yyyy-MM-dd')})`
        });

        // 2. Received
        if (t.status !== TicketStatus.WAITING) {
            const receivedTime = addDays(new Date(t.createdAt), 1).toISOString();
            history.push({
                id: `h-${t.id}-received`,
                ticketId: t.id,
                status: TicketStatus.RECEIVED,
                changedBy: t.supportName || 'Support Team',
                timestamp: receivedTime,
                note: '담당자가 배정되고 티켓 접수가 완료되었습니다.'
            });
        }

        // 3. Plan
        if (t.status === TicketStatus.IN_PROGRESS || t.status === TicketStatus.DELAYED || t.status === TicketStatus.COMPLETED) {
            if (t.plan) {
                const planTime = addDays(new Date(t.createdAt), 1).toISOString();
                history.push({
                    id: `h-${t.id}-plan`,
                    ticketId: t.id,
                    status: TicketStatus.IN_PROGRESS,
                    changedBy: t.supportName || 'Support Team',
                    timestamp: planTime,
                    note: `처리 계획이 등록되었습니다: ${t.plan}`
                });
            }
        }

        // 4. Completion
        if (t.status === TicketStatus.COMPLETED) {
            const completeReqTime = addDays(new Date(t.dueDate), -1).toISOString();
            history.push({
                id: `h-${t.id}-comp-req`,
                ticketId: t.id,
                status: TicketStatus.COMPLETION_REQUESTED,
                changedBy: t.supportName || 'Support Team',
                timestamp: completeReqTime,
                note: '[완료 보고] 모든 작업이 완료되어 승인을 요청했습니다.'
            });

            const finalizeTime = addDays(new Date(t.dueDate), 0).toISOString();
            history.push({
                id: `h-${t.id}-final`,
                ticketId: t.id,
                status: TicketStatus.COMPLETED,
                changedBy: t.customerName,
                timestamp: finalizeTime,
                note: `[최종 승인] 티켓이 종료되었습니다. (만족도: ${t.satisfaction}점)`
            });
        }
    });

    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
