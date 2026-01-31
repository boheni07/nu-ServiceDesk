import React, { useState, useMemo } from 'react';
import { UserRole, Ticket, TicketStatus, User, Project, Company, Comment, HistoryEntry, ProjectStatus, AgencyInfo } from './types';
import { useServiceDesk } from './hooks/useServiceDesk';
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

const App: React.FC = () => {
  const {
    currentUser,
    companies,
    users,
    projects,
    tickets,
    comments,
    history,
    agencyInfo,
    filteredProjects,
    filteredTickets,
    setCurrentUser,
    createTicket,
    updateTicket,
    deleteTicket,
    updateTicketStatus,
    addComment,
    updateUser,
    addUser,
    deleteUser,
    addCompany,
    updateCompany,
    deleteCompany,
    addProject,
    updateProject,
    deleteProject,
    applyState,
    setAgencyInfo
  } = useServiceDesk();

  const [view, setView] = useState<'dashboard' | 'list' | 'create' | 'edit' | 'detail' | 'companies' | 'users' | 'projects' | 'profile' | 'dataManagement' | 'settings'>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const selectedTicket = useMemo(() =>
    tickets.find(t => t.id === selectedTicketId), [tickets, selectedTicketId]
  );

  const changeView = (newView: typeof view) => {
    setView(newView);
    setIsSidebarOpen(false);
  };

  // UI Handlers that wrap hook actions
  const handleCreateTicket = (newTicket: Omit<Ticket, 'id' | 'createdAt' | 'status'>) => {
    createTicket(newTicket);
    changeView('list');
  };

  const handleUpdateTicket = (id: string, updatedData: Partial<Ticket>) => {
    updateTicket(id, updatedData);
    changeView('list');
    setEditingTicket(null);
  };

  const handleDeleteTicket = (id: string) => {
    if (window.confirm('정말 이 티켓을 삭제하시겠습니까?')) {
      deleteTicket(id);
      if (selectedTicketId === id) setSelectedTicketId(null);
    }
  };

  // Sidebar Component
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
            {view === 'list' && <TicketList tickets={filteredTickets} currentUser={currentUser} users={users} onSelect={(id) => { setSelectedTicketId(id); setView('detail'); }} onEdit={(ticket) => { setEditingTicket(ticket); setView('edit'); }} onDelete={handleDeleteTicket} />}
            {view === 'create' && <TicketCreate projects={filteredProjects.filter(p => p.status === ProjectStatus.ACTIVE)} currentUser={currentUser} users={users} companies={companies} onSubmit={handleCreateTicket} onCancel={() => changeView('list')} />}
            {view === 'edit' && editingTicket && <TicketCreate projects={filteredProjects.filter(p => p.status === ProjectStatus.ACTIVE)} currentUser={currentUser} users={users} companies={companies} initialData={editingTicket} onSubmit={(data) => handleUpdateTicket(editingTicket.id, data)} onCancel={() => { setEditingTicket(null); changeView('list'); }} />}
            {view === 'detail' && selectedTicket && <TicketDetail ticket={selectedTicket} project={projects.find(p => p.id === selectedTicket.projectId)!} users={users} history={history.filter(h => h.ticketId === selectedTicket.id)} comments={comments.filter(c => c.ticketId === selectedTicket.id)} currentUser={currentUser} onStatusUpdate={updateTicketStatus} onAddComment={addComment} onBack={() => changeView('list')} />}
            {view === 'companies' && currentUser.role === UserRole.ADMIN && <CompanyManagement companies={companies} onAdd={addCompany} onUpdate={(id, data) => { updateCompany(id, data); return true; }} onDelete={deleteCompany} />}
            {view === 'users' && currentUser.role === UserRole.ADMIN && <UserManagement users={users} companies={companies} agencyName={agencyInfo.name} onAdd={addUser} onUpdate={(id, data) => updateUser(id, data)} onDelete={deleteUser} />}
            {view === 'projects' && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPPORT) && <ProjectManagement projects={filteredProjects} companies={companies} users={users} currentUser={currentUser} onAdd={addProject} onUpdate={(id, data) => { updateProject(id, data); return true; }} onDelete={deleteProject} />}
            {view === 'profile' && <ProfileEdit user={currentUser} companyName={currentUser.companyId ? companies.find(c => c.id === currentUser.companyId)?.name : '본사 (nu)'} onUpdate={(data) => updateUser(currentUser.id, data)} onCancel={() => changeView('list')} />}
            {view === 'dataManagement' && currentUser.role === UserRole.ADMIN && (
              <DataManagement
                currentState={{ companies, users, projects, tickets, comments, history, agencyInfo }}
                onApplyState={applyState}
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
