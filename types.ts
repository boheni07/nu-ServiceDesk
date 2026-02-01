
export enum UserRole {
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
  SUPPORT_LEAD = 'SUPPORT_LEAD',
  CUSTOMER = 'CUSTOMER'
}

export enum TicketStatus {
  WAITING = '대기',
  RECEIVED = '접수',
  IN_PROGRESS = '처리중',
  DELAYED = '지연중',
  POSTPONE_REQUESTED = '연기요청중',
  COMPLETION_REQUESTED = '완료요청중',
  COMPLETED = '완료'
}

export enum ProjectStatus {
  ACTIVE = '활성',
  INACTIVE = '비활성'
}

export enum UserStatus {
  ACTIVE = '활성',
  INACTIVE = '비활성'
}

export enum CompanyStatus {
  ACTIVE = '활성',
  INACTIVE = '비활성'
}

export enum IntakeMethod {
  PHONE = '전화',
  EMAIL = '메일',
  DISCOVERY = '발견',
  OTHER = '기타'
}

export interface Company {
  id: string;
  name: string;
  businessNumber?: string;
  representative?: string;
  industry?: string;
  phone?: string;
  zipCode?: string;
  address?: string;
  remarks?: string;
  status: CompanyStatus;
}

export interface User {
  id: string;
  loginId: string;
  password?: string;
  name: string;
  phone?: string;
  mobile?: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  companyId?: string;
  team?: string; // Support team name
  remarks?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  customerContactIds: string[]; // Multiple customer contacts
  supportStaffIds: string[]; // Multiple support staff, index 0 is PM
  startDate?: string;
  endDate?: string;
  description: string;
  supportTeam?: string; // Team responsible for this project
  remarks?: string;
  status: ProjectStatus;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface HistoryEntry {
  id: string;
  ticketId: string;
  status: TicketStatus;
  changedBy: string;
  timestamp: string;
  note?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  plan?: string;
  status: TicketStatus;
  customerId: string;
  customerName: string;
  supportId?: string;
  supportName?: string;
  projectId: string;
  createdAt: string;
  originalDueDate?: string;
  dueDate: string;
  shortenedDueReason?: string;
  postponeReason?: string;
  postponeDate?: string;
  rejectionReason?: string;
  satisfaction?: number;
  completionFeedback?: string;
  attachments?: string[];
  planAttachments?: string[];
  intakeMethod?: IntakeMethod;
  requestDate?: string;
  expectedCompletionDate?: string;
  expectedCompletionDelayReason?: string;
}

export interface AgencyInfo {
  name: string; // Agency Name*
  registrationNumber?: string;
  ceoName: string; // CEO*
  industry?: string;
  phoneNumber?: string;
  zipCode?: string;
  address?: string;
  notes?: string;
  supportTeam1?: string;
  supportTeam2?: string;
  supportTeam3?: string;
}

export const AGENCY_COMPANY_ID = 'agency-root-company';

export interface ProjectOperationInfo {
  projectId: string;
  hardwareInfo?: string;
  softwareInfo?: string;
  accountInfo?: string;
  notes?: string;
}
