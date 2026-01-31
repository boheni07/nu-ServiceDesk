
import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, Ticket, TicketStatus, User, Project, Company, Comment, HistoryEntry, ProjectStatus, UserStatus, CompanyStatus, IntakeMethod, AgencyInfo } from './types';
import { addBusinessDays, isOverdue } from './utils';
import {
  PlusCircle,
  Building2,
  Users as UsersIcon,
  Briefcase,
  Ticket as TicketIcon,
  LayoutDashboard,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Database
} from 'lucide-react';
import { addDays } from 'date-fns';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import TicketCreate from './components/TicketCreate';
import CompanyManagement from './components/CompanyManagement';
import UserManagement from './components/UserManagement';
import ProjectManagement from './components/ProjectManagement';
import ProfileEdit from './components/ProfileEdit';
import DataManagement from './components/DataManagement';
import SystemSettings from './components/SystemSettings';
import Dashboard from './components/Dashboard';

// 1. Initial Sample Companies
export const initialCompanies: Company[] = [
  { id: 'c1', name: '누테크놀로지', representative: '누대표', industry: 'IT 서비스', address: '서울시 강남구', remarks: '본사', status: CompanyStatus.ACTIVE },
  { id: 'c2', name: '(주)미래제조', representative: '김미래', industry: '제조업', address: '경기도 판교', remarks: '핵심 고객사', status: CompanyStatus.ACTIVE },
  { id: 'c3', name: '글로벌유통', representative: '이유통', industry: '유통업', address: '부산시 해운대구', remarks: '전략적 파트너', status: CompanyStatus.ACTIVE },
  { id: 'c4', name: '한국금융솔루션', representative: '박금융', industry: '금융업', address: '서울시 여의도', status: CompanyStatus.ACTIVE },
  { id: 'c5', name: '공공데이터센터', representative: '최공공', industry: '공공기관', address: '세종특별자치시', status: CompanyStatus.ACTIVE },
];

// 2. Initial Sample Users
export const initialUsers: User[] = [
  { id: 'u1', loginId: 'admin1', password: 'password123', name: '홍길동 관리자', role: UserRole.ADMIN, status: UserStatus.ACTIVE, mobile: '010-1111-2222', email: 'admin@nu.com' },
  { id: 'u2', loginId: 'support1', password: 'password123', name: '이지원 지원팀장', role: UserRole.SUPPORT, status: UserStatus.ACTIVE, mobile: '010-3333-4444', email: 'support1@nu.com' },
  { id: 'u3', loginId: 'support2', password: 'password123', name: '박기술 엔지니어', role: UserRole.SUPPORT, status: UserStatus.ACTIVE, mobile: '010-7777-8888', email: 'support2@nu.com' },
  { id: 'u4', loginId: 'customer1', password: 'password123', name: '김고객 과장', role: UserRole.CUSTOMER, status: UserStatus.ACTIVE, companyId: 'c2', phone: '02-123-4567', mobile: '010-5555-6666', email: 'customer1@mirai.com' },
  { id: 'u5', loginId: 'customer2', password: 'password123', name: '최협력 대리', role: UserRole.CUSTOMER, status: UserStatus.ACTIVE, companyId: 'c3', phone: '051-987-6543', mobile: '010-9999-0000', email: 'customer2@global.com' },
];

// 3. Initial Sample Projects
export const initialProjects: Project[] = [
  { id: 'p1', name: 'ERP 시스템 고도화', clientId: 'c2', customerContactIds: ['u4'], supportStaffIds: ['u2', 'u3'], description: '기존 ERP 성능 향상 및 모바일 대응', startDate: '2024-01-01', endDate: '2024-12-31', status: ProjectStatus.ACTIVE },
  { id: 'p2', name: '클라우드 마이그레이션', clientId: 'c3', customerContactIds: ['u5'], supportStaffIds: ['u3'], description: '온프레미스 서버의 AWS 전환', startDate: '2024-03-01', endDate: '2024-09-30', status: ProjectStatus.ACTIVE },
  { id: 'p3', name: '차세대 뱅킹 보안 강화', clientId: 'c4', customerContactIds: [], supportStaffIds: ['u1', 'u2'], description: '금융권 보안 가이드라인 준수 작업', startDate: '2024-05-15', endDate: '2025-05-14', status: ProjectStatus.ACTIVE },
  { id: 'p4', name: '대시보드 모바일화', clientId: 'c5', customerContactIds: [], supportStaffIds: ['u2'], description: '공공 데이터 시각화 앱 개발', startDate: '2024-02-01', endDate: '2024-06-30', status: ProjectStatus.ACTIVE },
  { id: 'p5', name: 'AI 기반 수요예측 시스템', clientId: 'c2', customerContactIds: ['u4'], supportStaffIds: ['u1', 'u3'], description: '제조 공정 최적화를 위한 AI 도입', startDate: '2024-06-01', endDate: '2024-11-30', status: ProjectStatus.ACTIVE },
];

export const getInitialTickets = (now: Date): Ticket[] => [
  { id: 'T-1001', title: '로그인 페이지 간헐적 튕김 현상', description: '특정 모바일 브라우저에서 로그인 시도 시 세션이 유지되지 않고 메인으로 돌아갑니다.', status: TicketStatus.WAITING, customerId: 'u4', customerName: '김고객 과장', projectId: 'p1', createdAt: addDays(now, -1).toISOString(), originalDueDate: addBusinessDays(now, 4).toISOString(), dueDate: addBusinessDays(now, 4).toISOString() },
  { id: 'T-1002', title: '신규 사용자 권한 일괄 등록 요청', description: '인사 이동으로 인한 50명의 사용자 권한을 엑셀 기반으로 등록 요청합니다.', status: TicketStatus.RECEIVED, customerId: 'u5', customerName: '최협력 대리', supportId: 'u3', supportName: '박기술 엔지니어', projectId: 'p2', createdAt: addDays(now, -2).toISOString(), originalDueDate: addBusinessDays(now, 3).toISOString(), dueDate: addBusinessDays(now, 3).toISOString() },
  { id: 'T-1003', title: '실시간 데이터 동기화 지연 문의', description: '어제 오후 3시부터 금융 데이터 동기화 주기가 10분 이상 지연되고 있습니다.', status: TicketStatus.IN_PROGRESS, customerId: 'u4', customerName: '김고객 과장', supportId: 'u2', supportName: '이지원 지원팀장', projectId: 'p3', plan: '서버 로그 분석 후 DB 인덱스 재구성 예정', expectedCompletionDate: addDays(now, 1).toISOString(), createdAt: addDays(now, -1).toISOString(), originalDueDate: addBusinessDays(now, 2).toISOString(), dueDate: addBusinessDays(now, 2).toISOString() },
  { id: 'T-1004', title: '공공 API 인터페이스 사양 변경 대응', description: '정부 API 버전 업그레이드에 따른 연동 모듈 수정이 필요합니다.', status: TicketStatus.DELAYED, customerId: 'u4', customerName: '김고객 과장', supportId: 'u3', supportName: '박기술 엔지니어', projectId: 'p4', createdAt: addDays(now, -7).toISOString(), originalDueDate: addDays(now, -1).toISOString(), dueDate: addDays(now, -1).toISOString() },
  { id: 'T-1005', title: '수요예측 대시보드 UI 레이아웃 개선', description: '사용자 피드백을 반영하여 메인 차트 크기를 키우고 필터를 상단으로 이동했습니다.', status: TicketStatus.COMPLETED, customerId: 'u5', customerName: '최협력 대리', supportId: 'u2', supportName: '이지원 지원팀장', projectId: 'p5', satisfaction: 5, completionFeedback: '요청한 대로 깔끔하게 반영되었습니다. 감사합니다!', createdAt: addDays(now, -10).toISOString(), originalDueDate: addDays(now, -5).toISOString(), dueDate: addDays(now, -5).toISOString() }
];

export const initialAgencyInfo: AgencyInfo = {
  name: 'NuBiz',
  ceoName: '이누비',
  industry: '소프트웨어 자문, 개발 및 공급',
  phoneNumber: '02-1234-5678',
  zipCode: '06242',
  address: '서울시 강남구 테헤란로 123 누비즈타워 10층',
  notes: '시스템 운영 및 유지보수 전담 기관입니다.'
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[1]);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [view, setView] = useState<'dashboard' | 'list' | 'create' | 'edit' | 'detail' | 'companies' | 'users' | 'projects' | 'profile' | 'dataManagement' | 'settings'>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState<AgencyInfo>(initialAgencyInfo);



  useEffect(() => {
    const now = new Date();
    const sampleTickets = getInitialTickets(now);
    const sampleHistory: HistoryEntry[] = [];
    sampleTickets.forEach(t => {
      sampleHistory.push({ id: `h-${t.id}-init`, ticketId: t.id, status: TicketStatus.WAITING, changedBy: t.customerName, timestamp: t.createdAt, note: '티켓이 신규 등록되었습니다.' });
      if (t.status !== TicketStatus.WAITING) {
        sampleHistory.push({ id: `h-${t.id}-received`, ticketId: t.id, status: TicketStatus.RECEIVED, changedBy: t.supportName || '시스템', timestamp: addDays(new Date(t.createdAt), 1).toISOString(), note: '티켓이 접수되었습니다.' });
      }
    });
    setTickets(sampleTickets);
    setHistory(sampleHistory);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickets(prev => prev.map(t => {
        if (t.status !== TicketStatus.COMPLETED && t.status !== TicketStatus.DELAYED && isOverdue(t.dueDate)) {
          return { ...t, status: TicketStatus.DELAYED };
        }
        return t;
      }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // PERMISSION FILTERING
  const filteredProjects = useMemo(() => {
    if (currentUser.role === UserRole.ADMIN) return projects;
    if (currentUser.role === UserRole.SUPPORT) {
      return projects.filter(p => p.supportStaffIds.includes(currentUser.id));
    }
    return projects.filter(p => p.customerContactIds.includes(currentUser.id));
  }, [projects, currentUser]);

  const filteredTickets = useMemo(() => {
    if (currentUser.role === UserRole.ADMIN) return tickets;
    const accessibleProjectIds = filteredProjects.map(p => p.id);
    return tickets.filter(t => accessibleProjectIds.includes(t.projectId));
  }, [tickets, filteredProjects, currentUser]);

  const selectedTicket = useMemo(() =>
    tickets.find(t => t.id === selectedTicketId), [tickets, selectedTicketId]
  );

  const changeView = (newView: typeof view) => {
    setView(newView);
    setIsSidebarOpen(false);
  };

  // HANDLERS
  const handleCreateTicket = (newTicket: Omit<Ticket, 'id' | 'createdAt' | 'status'>) => {
    const project = projects.find(p => p.id === newTicket.projectId);
    const pmId = project?.supportStaffIds[0];
    const pmUser = users.find(u => u.id === pmId);
    const ticket: Ticket = {
      ...newTicket,
      id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
      createdAt: new Date().toISOString(),
      status: currentUser.role === UserRole.CUSTOMER ? TicketStatus.WAITING : TicketStatus.RECEIVED,
      supportId: pmId,
      supportName: pmUser?.name,
    };
    setTickets([ticket, ...tickets]);
    setHistory([{ id: `h-${Date.now()}`, ticketId: ticket.id, status: ticket.status, changedBy: currentUser.name, timestamp: new Date().toISOString(), note: '티켓이 신규 등록되었습니다.' }, ...history]);
    changeView('list');
  };

  const handleUpdateTicket = (id: string, updatedData: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
    setHistory([{ id: `h-${Date.now()}`, ticketId: id, status: tickets.find(t => t.id === id)?.status || TicketStatus.WAITING, changedBy: currentUser.name, timestamp: new Date().toISOString(), note: '티켓 정보가 수정되었습니다.' }, ...history]);
    changeView('list');
    setEditingTicket(null);
  };

  const handleDeleteTicket = (id: string) => {
    if (window.confirm('정말 이 티켓을 삭제하시겠습니까?')) {
      setTickets(prev => prev.filter(t => t.id !== id));
      setHistory(prev => prev.filter(h => h.ticketId !== id));
      setComments(prev => prev.filter(c => c.ticketId !== id));
      if (selectedTicketId === id) setSelectedTicketId(null);
    }
  };

  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus, updates: Partial<Ticket> = {}, note?: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updates, status: newStatus } : t));
    setHistory([{ id: `h-${Date.now()}`, ticketId, status: newStatus, changedBy: currentUser.name, timestamp: new Date().toISOString(), note: note || `상태가 ${newStatus}(으)로 변경되었습니다.` }, ...history]);
  };

  const addComment = (commentData: Omit<Comment, 'id' | 'timestamp'>) => {
    setComments([{ ...commentData, id: `c-${Date.now()}`, timestamp: new Date().toISOString() }, ...comments]);
  };

  const handleUpdateUser = (id: string, userData: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === id ? { ...u, ...userData } : u);
    setUsers(updatedUsers);
    if (id === currentUser.id) {
      setCurrentUser(updatedUsers.find(u => u.id === id)!);
    }
  };

  const handleApplyState = (newState: {
    companies: Company[];
    users: User[];
    projects: Project[];
    tickets: Ticket[];
    comments: Comment[];
    history: HistoryEntry[];
    agencyInfo?: AgencyInfo;
  }) => {
    setCompanies(newState.companies);
    setUsers(newState.users);
    setProjects(newState.projects);
    setTickets(newState.tickets);
    setComments(newState.comments);
    setHistory(newState.history);
    if (newState.agencyInfo) {
      setAgencyInfo(newState.agencyInfo);
    }
    // Find current user in new state to maintain role consistency or default to first user
    const foundUser = newState.users.find(u => u.id === currentUser.id) || newState.users[0];
    setCurrentUser(foundUser);
  };

  const NavItem = ({ icon: Icon, label, targetView, adminOnly = false, supportOrAdmin = false }: any) => {
    if (adminOnly && currentUser.role !== UserRole.ADMIN) return null;
    if (supportOrAdmin && (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPPORT)) return null;
    return (
      <button
        onClick={() => changeView(targetView)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${view === targetView ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
      >
        <Icon size={20} />
        <span className="text-sm">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2 cursor-pointer" onClick={() => changeView('list')}>
            <span className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">nu</span>
            ServiceDesk
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg"><X size={20} /></button>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem icon={LayoutDashboard} label="대시보드" targetView="dashboard" />
          <NavItem icon={PlusCircle} label="New Ticket" targetView="create" />
          <NavItem icon={TicketIcon} label="티켓 관리" targetView="list" />
          <div className="pt-8 pb-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Management</div>
          <NavItem icon={Briefcase} label="프로젝트 관리" targetView="projects" supportOrAdmin />
          <NavItem icon={Building2} label="고객사 관리" targetView="companies" adminOnly />
          <NavItem icon={UsersIcon} label="회원 관리" targetView="users" adminOnly />
          <div className="pt-8 pb-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">System</div>
          <NavItem icon={Settings} label="환경 설정" targetView="settings" adminOnly />
          <NavItem icon={Database} label="데이터 관리" targetView="dataManagement" adminOnly />
          <div className="px-4 pt-4">
            <label className="block text-[10px] text-slate-500 mb-2 uppercase font-bold">Role Simulator</label>
            <select className="bg-slate-800 text-xs rounded-lg p-2.5 w-full border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-300" value={currentUser.id} onChange={(e) => setCurrentUser(users.find(u => u.id === e.target.value)!)}>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
        </nav>
        <div onClick={() => changeView('profile')} className={`p-4 bg-slate-800/50 m-6 rounded-2xl cursor-pointer hover:bg-slate-800 transition-all border border-slate-700/30 group ${view === 'profile' ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold shrink-0 shadow-lg group-hover:scale-105 transition-transform text-lg">{currentUser.name[0]}</div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold truncate text-slate-100">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{currentUser.role}</p>
            </div>
            <Settings size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col lg:ml-72 min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 lg:hidden flex justify-between items-center">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><Menu size={24} /></button>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><span className="bg-blue-600 p-1.5 rounded-lg text-white text-xs">nu</span>ServiceDesk</h2>
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold" onClick={() => changeView('profile')}>{currentUser.name[0]}</div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1440px] w-full mx-auto">
          <div className="mb-6 lg:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {view === 'dashboard' && 'Service Overview'}
                {view === 'list' && 'Tickets Overview'}
                {view === 'create' && 'Create New Ticket'}
                {view === 'edit' && 'Edit Ticket'}
                {view === 'detail' && `Ticket ${selectedTicketId}`}
                {view === 'companies' && 'Company Management'}
                {view === 'users' && 'User Management'}
                {view === 'projects' && 'Project Management'}
                {view === 'profile' && 'My Account Settings'}
                {view === 'dataManagement' && 'Data Management'}
                {view === 'settings' && 'System Configuration'}
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-1">안녕하세요, {currentUser.name}님! {view === 'list' && '현재 활성화된 티켓 리스트입니다.'}</p>
            </div>
            {(view === 'detail' || view === 'edit' || view === 'dataManagement' || view === 'settings') && <button onClick={() => changeView('list')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm transition-all self-start"><ChevronLeft size={20} /> Back to List</button>}
          </div>

          <div className="relative">
            {view === 'dashboard' && <Dashboard tickets={filteredTickets} projects={projects} currentUser={currentUser} onSelectTicket={(id) => { setSelectedTicketId(id); setView('detail'); }} />}
            {view === 'list' && <TicketList tickets={filteredTickets} currentUser={currentUser} onSelect={(id) => { setSelectedTicketId(id); setView('detail'); }} onEdit={(ticket) => { setEditingTicket(ticket); setView('edit'); }} onDelete={handleDeleteTicket} />}
            {view === 'create' && <TicketCreate projects={filteredProjects.filter(p => p.status === ProjectStatus.ACTIVE)} currentUser={currentUser} users={users} companies={companies} onSubmit={handleCreateTicket} onCancel={() => changeView('list')} />}
            {view === 'edit' && editingTicket && <TicketCreate projects={filteredProjects.filter(p => p.status === ProjectStatus.ACTIVE)} currentUser={currentUser} users={users} companies={companies} initialData={editingTicket} onSubmit={(data) => handleUpdateTicket(editingTicket.id, data)} onCancel={() => { setEditingTicket(null); changeView('list'); }} />}
            {view === 'detail' && selectedTicket && <TicketDetail ticket={selectedTicket} project={projects.find(p => p.id === selectedTicket.projectId)!} users={users} history={history.filter(h => h.ticketId === selectedTicket.id)} comments={comments.filter(c => c.ticketId === selectedTicket.id)} currentUser={currentUser} onStatusUpdate={updateTicketStatus} onAddComment={addComment} onBack={() => changeView('list')} />}
            {view === 'companies' && currentUser.role === UserRole.ADMIN && <CompanyManagement companies={companies} onAdd={(data) => setCompanies([...companies, { ...data, id: `c${Date.now()}` }])} onUpdate={(id, data) => { setCompanies(companies.map(c => c.id === id ? { ...c, ...data } : c)); return true; }} onDelete={(id) => setCompanies(companies.filter(c => c.id !== id))} />}
            {view === 'users' && currentUser.role === UserRole.ADMIN && <UserManagement users={users} companies={companies} agencyName={agencyInfo.name} onAdd={(data) => setUsers([...users, { ...data, id: `u${Date.now()}` }])} onUpdate={handleUpdateUser} onDelete={(id) => setUsers(users.filter(u => u.id !== id))} />}
            {view === 'projects' && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPPORT) && <ProjectManagement projects={filteredProjects} companies={companies} users={users} currentUser={currentUser} onAdd={(data) => setProjects([...projects, { ...data, id: `p${Date.now()}` }])} onUpdate={(id, data) => { setProjects(projects.map(p => p.id === id ? { ...p, ...data } : p)); return true; }} onDelete={(id) => setProjects(projects.filter(p => p.id !== id))} />}
            {view === 'profile' && <ProfileEdit user={currentUser} companyName={currentUser.companyId ? companies.find(c => c.id === currentUser.companyId)?.name : '본사 (nu)'} onUpdate={(data) => handleUpdateUser(currentUser.id, data)} onCancel={() => changeView('list')} />}
            {view === 'dataManagement' && currentUser.role === UserRole.ADMIN && (
              <DataManagement
                currentState={{ companies, users, projects, tickets, comments, history, agencyInfo }}
                onApplyState={handleApplyState}
              />
            )}

            {view === 'settings' && currentUser.role === UserRole.ADMIN && <SystemSettings info={agencyInfo} onSave={(info) => { setAgencyInfo(info); alert('환경 설정이 저장되었습니다.'); }} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
