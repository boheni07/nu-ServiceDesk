import { Ticket, Project, User, Company, Comment, HistoryEntry, AgencyInfo, TicketStatus, ProjectStatus, UserStatus, CompanyStatus } from '../types';

// ------------------------------------------------------------------
// Enum Mappers (Korean <-> English)
// ------------------------------------------------------------------

// TicketStatus
const ticketStatusToDB = (status: TicketStatus): string => {
    switch (status) {
        case TicketStatus.WAITING: return 'WAITING';
        case TicketStatus.RECEIVED: return 'RECEIVED';
        case TicketStatus.IN_PROGRESS: return 'IN_PROGRESS';
        case TicketStatus.DELAYED: return 'DELAYED';
        case TicketStatus.POSTPONE_REQUESTED: return 'POSTPONE_REQUESTED';
        case TicketStatus.COMPLETION_REQUESTED: return 'COMPLETION_REQUESTED';
        case TicketStatus.COMPLETED: return 'COMPLETED';
        default: return 'WAITING';
    }
};

const ticketStatusFromDB = (status: string): TicketStatus => {
    switch (status) {
        case 'WAITING': return TicketStatus.WAITING;
        case 'RECEIVED': return TicketStatus.RECEIVED;
        case 'IN_PROGRESS': return TicketStatus.IN_PROGRESS;
        case 'DELAYED': return TicketStatus.DELAYED;
        case 'POSTPONE_REQUESTED': return TicketStatus.POSTPONE_REQUESTED;
        case 'COMPLETION_REQUESTED': return TicketStatus.COMPLETION_REQUESTED;
        case 'COMPLETED': return TicketStatus.COMPLETED;
        default: return TicketStatus.WAITING;
    }
};

// ProjectStatus
const projectStatusToDB = (status: ProjectStatus): string => {
    return status === ProjectStatus.ACTIVE ? 'ACTIVE' : 'INACTIVE';
};

const projectStatusFromDB = (status: string): ProjectStatus => {
    return (status === 'ACTIVE' || status === '활성') ? ProjectStatus.ACTIVE : ProjectStatus.INACTIVE;
};

// UserStatus
const userStatusToDB = (status: UserStatus): string => {
    return status === UserStatus.ACTIVE ? 'ACTIVE' : 'INACTIVE';
};

const userStatusFromDB = (status: string): UserStatus => {
    return (status === 'ACTIVE' || status === '활성') ? UserStatus.ACTIVE : UserStatus.INACTIVE;
};

// CompanyStatus
const companyStatusToDB = (status: CompanyStatus): string => {
    return status === CompanyStatus.ACTIVE ? 'ACTIVE' : 'INACTIVE';
};

const companyStatusFromDB = (status: string): CompanyStatus => {
    if (status === 'ACTIVE' || status === '활성') return CompanyStatus.ACTIVE;
    return CompanyStatus.INACTIVE;
};


// ------------------------------------------------------------------
// DB -> App Mappers (snake_case to camelCase)
// ------------------------------------------------------------------

export const mapTicket = (data: any): Ticket => ({
    ...data,
    customerId: data.customer_id,
    customerName: data.customer_name,
    supportId: data.support_id,
    supportName: data.support_name,
    projectId: data.project_id,
    createdAt: data.created_at,
    originalDueDate: data.original_due_date,
    dueDate: data.due_date,
    shortenedDueReason: data.shortened_due_reason,
    postponeReason: data.postpone_reason,
    postponeDate: data.postpone_date,
    rejectionReason: data.rejection_reason,
    completionFeedback: data.completion_feedback,
    planAttachments: data.plan_attachments,
    intakeMethod: data.intake_method,
    requestDate: data.request_date,
    expectedCompletionDate: data.expected_completion_date,
    expectedCompletionDelayReason: data.expected_completion_delay_reason,
    status: ticketStatusFromDB(data.status) // Map Enum
});

export const mapProject = (data: any): Project => ({
    ...data,
    clientId: data.client_id,
    customerContactIds: data.customer_contact_ids || [],
    supportStaffIds: data.support_staff_ids || [],
    startDate: data.start_date,
    endDate: data.end_date,
    supportTeam: data.support_team,
    status: projectStatusFromDB(data.status) // Map Enum
});

export const mapUser = (data: any): User => ({
    ...data,
    loginId: data.login_id,
    companyId: data.company_id,
    team: data.support_team_name,
    status: userStatusFromDB(data.status) // Map Enum
});

export const mapHistory = (data: any): HistoryEntry => ({
    ...data,
    ticketId: data.ticket_id,
    changedBy: data.changed_by
    // History status might be stored as Korean string in legacy or new Enum?
    // Let's assume History stores the Display Value (Korean) or the Enum Value.
    // If History stores Display Value, we don't map. 
    // If History stores 'RECEIVED', we should map.
    // The previous implementation didn't map history.status.
    // Let's keep it as is for now or map it if it matches known enums.
    // Given usage in UI, History often just displays text.
});

export const mapCompany = (data: any): Company => ({
    ...data,
    businessNumber: data.businessNumber || data.business_number || data.registration_number,
    phone: data.phone || data.phone_number,
    zipCode: data.zipCode || data.zip_code,
    status: companyStatusFromDB(data.status) // Map Enum
});

export const mapAgencyInfo = (data: any): AgencyInfo => ({
    ...data,
    ceoName: data.ceo_name,
    registrationNumber: data.registration_number,
    phoneNumber: data.phone_number,
    zipCode: data.zip_code,
    supportTeam1: data.support_team_1,
    supportTeam2: data.support_team_2,
    supportTeam3: data.support_team_3
});

export const mapComment = (data: any): Comment => ({
    ...data,
    ticketId: data.ticket_id,
    authorId: data.author_id,
    authorName: data.author_name
});


// ------------------------------------------------------------------
// App -> DB Mappers (camelCase to snake_case)
// ------------------------------------------------------------------

export const mapTicketToDB = (ticket: Ticket) => ({
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticketStatusToDB(ticket.status), // Map Enum
    customer_id: ticket.customerId,
    customer_name: ticket.customerName,
    support_id: ticket.supportId || null,
    support_name: ticket.supportName || null,
    project_id: ticket.projectId,
    created_at: ticket.createdAt,
    original_due_date: ticket.originalDueDate,
    due_date: ticket.dueDate,
    plan: ticket.plan || null,
    satisfaction: ticket.satisfaction || null,
    completion_feedback: ticket.completionFeedback || null,
    attachments: ticket.attachments || [],
    plan_attachments: ticket.planAttachments || [],
    intake_method: ticket.intakeMethod || null,
    request_date: ticket.requestDate || null,
    expected_completion_date: ticket.expectedCompletionDate || null,
    expected_completion_delay_reason: ticket.expectedCompletionDelayReason || null,
    shortened_due_reason: ticket.shortenedDueReason || null,
    postpone_reason: ticket.postponeReason || null,
    postpone_date: ticket.postponeDate || null,
    rejection_reason: ticket.rejectionReason || null
});

export const mapProjectToDB = (project: Project) => ({
    id: project.id,
    name: project.name,
    client_id: project.clientId,
    customer_contact_ids: project.customerContactIds,
    support_staff_ids: project.supportStaffIds,
    start_date: project.startDate || null,
    end_date: project.endDate || null,
    description: project.description,
    status: projectStatusToDB(project.status), // Map Enum
    remarks: project.remarks || null,
    support_team: project.supportTeam || null
});

export const mapUserToDB = (user: User) => ({
    id: user.id,
    login_id: user.loginId,
    password: user.password || 'password123',
    name: user.name,
    role: user.role,
    status: userStatusToDB(user.status), // Map Enum
    mobile: user.mobile || null,
    email: user.email || null,
    phone: user.phone || null,
    company_id: user.companyId || null,
    remarks: user.remarks || null,
    support_team_name: user.team || null
});

export const mapHistoryToDB = (history: HistoryEntry) => ({
    id: history.id,
    ticket_id: history.ticketId,
    status: history.status, // History might store the display string? 
    // If History column is ENUM, we must map. If Text, we can keep Korean.
    // Assuming Text for history for now as it's a log.
    changed_by: history.changedBy,
    timestamp: history.timestamp,
    note: history.note || null
});

export const mapCompanyToDB = (company: Company) => ({
    id: company.id,
    name: company.name,
    business_number: company.businessNumber || null,
    representative: company.representative || null,
    industry: company.industry || null,
    phone: company.phone || null,
    zip_code: company.zipCode || null,
    address: company.address || null,
    remarks: company.remarks || null,
    status: companyStatusToDB(company.status)
});

export const mapCommentToDB = (comment: Comment) => ({
    id: comment.id,
    ticket_id: comment.ticketId,
    author_id: comment.authorId,
    author_name: comment.authorName,
    content: comment.content,
    timestamp: comment.timestamp,
    attachments: comment.attachments || []
});

export const mapAgencyInfoToDB = (info: AgencyInfo) => ({
    name: info.name,
    ceo_name: info.ceoName,
    registration_number: info.registrationNumber,
    industry: info.industry,
    phone_number: info.phoneNumber,
    zip_code: info.zipCode,
    address: info.address,
    notes: info.notes,
    support_team_1: info.supportTeam1,
    support_team_2: info.supportTeam2,
    support_team_3: info.supportTeam3
});

// ------------------------------------------------------------------
// Partial Update Mappers
// ------------------------------------------------------------------

export const mapTicketUpdatesToDB = (updates: Partial<Ticket>): any => {
    const db: any = {};
    if (updates.title !== undefined) db.title = updates.title;
    if (updates.description !== undefined) db.description = updates.description;
    if (updates.status !== undefined) db.status = ticketStatusToDB(updates.status);
    if (updates.customerId !== undefined) db.customer_id = updates.customerId;
    if (updates.customerName !== undefined) db.customer_name = updates.customerName;
    if (updates.supportId !== undefined) db.support_id = updates.supportId;
    if (updates.supportName !== undefined) db.support_name = updates.supportName;
    if (updates.projectId !== undefined) db.project_id = updates.projectId;
    if (updates.createdAt !== undefined) db.created_at = updates.createdAt;
    if (updates.originalDueDate !== undefined) db.original_due_date = updates.originalDueDate;
    if (updates.dueDate !== undefined) db.due_date = updates.dueDate;
    if (updates.plan !== undefined) db.plan = updates.plan;
    if (updates.satisfaction !== undefined) db.satisfaction = updates.satisfaction;
    if (updates.completionFeedback !== undefined) db.completion_feedback = updates.completionFeedback;
    if (updates.attachments !== undefined) db.attachments = updates.attachments;
    if (updates.planAttachments !== undefined) db.plan_attachments = updates.planAttachments;
    if (updates.intakeMethod !== undefined) db.intake_method = updates.intakeMethod;
    if (updates.requestDate !== undefined) db.request_date = updates.requestDate;
    if (updates.expectedCompletionDate !== undefined) db.expected_completion_date = updates.expectedCompletionDate;
    if (updates.expectedCompletionDelayReason !== undefined) db.expected_completion_delay_reason = updates.expectedCompletionDelayReason;
    if (updates.shortenedDueReason !== undefined) db.shortened_due_reason = updates.shortenedDueReason;
    if (updates.postponeReason !== undefined) db.postpone_reason = updates.postponeReason;
    if (updates.postponeDate !== undefined) db.postpone_date = updates.postponeDate;
    if (updates.rejectionReason !== undefined) db.rejection_reason = updates.rejectionReason;
    return db;
};

export const mapProjectUpdatesToDB = (updates: Partial<Project>): any => {
    const db: any = {};
    if (updates.name !== undefined) db.name = updates.name;
    if (updates.clientId !== undefined) db.client_id = updates.clientId;
    if (updates.customerContactIds !== undefined) db.customer_contact_ids = updates.customerContactIds;
    if (updates.supportStaffIds !== undefined) db.support_staff_ids = updates.supportStaffIds;
    if (updates.startDate !== undefined) db.start_date = updates.startDate;
    if (updates.endDate !== undefined) db.end_date = updates.endDate;
    if (updates.description !== undefined) db.description = updates.description;
    if (updates.status !== undefined) db.status = projectStatusToDB(updates.status);
    if (updates.remarks !== undefined) db.remarks = updates.remarks;
    if (updates.supportTeam !== undefined) db.support_team = updates.supportTeam;
    return db;
};

export const mapUserUpdatesToDB = (updates: Partial<User>): any => {
    const db: any = {};
    if (updates.loginId !== undefined) db.login_id = updates.loginId;
    if (updates.password !== undefined) db.password = updates.password;
    if (updates.name !== undefined) db.name = updates.name;
    if (updates.role !== undefined) db.role = updates.role;
    if (updates.status !== undefined) db.status = userStatusToDB(updates.status);
    if (updates.mobile !== undefined) db.mobile = updates.mobile;
    if (updates.email !== undefined) db.email = updates.email;
    if (updates.phone !== undefined) db.phone = updates.phone;
    if (updates.companyId !== undefined) db.company_id = updates.companyId;
    if (updates.remarks !== undefined) db.remarks = updates.remarks;
    if (updates.team !== undefined) db.support_team_name = updates.team;
    return db;
};

export const mapCompanyUpdatesToDB = (updates: Partial<Company>): any => {
    const db: any = {};
    if (updates.name !== undefined) db.name = updates.name;
    if (updates.businessNumber !== undefined) db.business_number = updates.businessNumber;
    if (updates.representative !== undefined) db.representative = updates.representative;
    if (updates.industry !== undefined) db.industry = updates.industry;
    if (updates.phone !== undefined) db.phone = updates.phone;
    if (updates.zipCode !== undefined) db.zip_code = updates.zipCode;
    if (updates.address !== undefined) db.address = updates.address;
    if (updates.remarks !== undefined) db.remarks = updates.remarks;
    if (updates.status !== undefined) db.status = companyStatusToDB(updates.status);
    return db;
};
