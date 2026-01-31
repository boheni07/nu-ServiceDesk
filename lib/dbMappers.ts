import { Ticket, Project, User, Company, Comment, HistoryEntry, AgencyInfo } from '../types';

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
    expectedCompletionDelayReason: data.expected_completion_delay_reason
});

export const mapProject = (data: any): Project => ({
    ...data,
    clientId: data.client_id,
    customerContactIds: data.customer_contact_ids || [],
    supportStaffIds: data.support_staff_ids || [],
    startDate: data.start_date,
    endDate: data.end_date
});

export const mapUser = (data: any): User => ({
    ...data,
    loginId: data.login_id,
    companyId: data.company_id
});

export const mapHistory = (data: any): HistoryEntry => ({
    ...data,
    ticketId: data.ticket_id,
    changedBy: data.changed_by
});

export const mapCompany = (data: any): Company => ({
    ...data,
    // Most fields match, but being explicit strictly if needed.
    // Currently Company matches DB largely (id, name, representative, industry, address, remarks, status)
    // representative matches representative? Schema usually snake_case but let's assume simple match for now or update if we find db schema differs.
    // In seed: name, representative, industry... seem same.
});

export const mapAgencyInfo = (data: any): AgencyInfo => ({
    ...data,
    ceoName: data.ceo_name,
    registrationNumber: data.registration_number,
    phoneNumber: data.phone_number,
    zipCode: data.zip_code
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
    status: ticket.status,
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
    status: project.status,
    remarks: project.remarks || null
});

export const mapUserToDB = (user: User) => ({
    id: user.id,
    login_id: user.loginId,
    password: user.password || 'password123', // Default or existing
    name: user.name,
    role: user.role,
    status: user.status,
    mobile: user.mobile || null,
    email: user.email || null,
    phone: user.phone || null,
    company_id: user.companyId || null,
    remarks: user.remarks || null
});

export const mapHistoryToDB = (history: HistoryEntry) => ({
    id: history.id,
    ticket_id: history.ticketId,
    status: history.status,
    changed_by: history.changedBy,
    timestamp: history.timestamp,
    note: history.note || null
});

export const mapCompanyToDB = (company: Company) => ({
    // Assuming keys match for now based on useServiceDesk seed
    id: company.id,
    name: company.name,
    representative: company.representative || null,
    industry: company.industry || null,
    address: company.address || null,
    remarks: company.remarks || null,
    status: company.status
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
