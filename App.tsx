import React, { useState, useMemo } from 'react';
import { User, UserRole, Ticket, ProjectStatus } from './types';
import { useServiceDesk } from './hooks/useServiceDesk';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginScreen from './components/LoginScreen';

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
import PerformanceReport from './components/PerformanceReport';
import ProjectPerformance from './components/ProjectPerformance';
import SuccessModal from './components/SuccessModal';

const MainApp: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const data = useServiceDesk(currentUser);

  const {
    companies,
    users,
    projects,
    tickets,
    comments,
    history,
    agencyInfo,
    filteredProjects,
    filteredTickets,
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
    setAgencyInfo,
    resetSystem,
    generateSamples,
    restoreData,
    downloadBackup,
    loading
  } = data;

  const [view, setView] = useState<'dashboard' | 'list' | 'create' | 'edit' | 'detail' | 'companies' | 'users' | 'projects' | 'profile' | 'dataManagement' | 'settings' | 'report' | 'projectReport'>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const selectedTicket = useMemo(() =>
    tickets.find(t => t.id === selectedTicketId), [tickets, selectedTicketId]
  );

  const changeView = (newView: typeof view) => {
    setView(newView);
    setIsSidebarOpen(false);
  };

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

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  // Auto-login logic
  React.useEffect(() => {
    if (!loading && users.length > 0 && !currentUser) {
      const adminUser = users.find(u => u.role === UserRole.ADMIN) || users[0];
      if (adminUser) {
        handleLogin(adminUser);
      }
    }
  }, [loading, users, currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-bold animate-pulse">시스템 접속 중...</p>
      </div>
    );
  }

  return (
    <Layout
      currentUser={currentUser}
      view={view}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      changeView={changeView}
      users={users}
      loading={loading}
      setCurrentUser={setCurrentUser}
      onLogout={() => {
        setCurrentUser(null);
      }}
      agencyInfo={agencyInfo}
    >
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
            {view === 'report' && 'Performance Report'}
            {view === 'projectReport' && 'Project Performance'}
            {view === 'settings' && 'System Configuration'}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-1">안녕하세요, {currentUser.name}님! {view === 'list' && '현재 활성화된 티켓 리스트입니다.'}</p>
        </div>
        {(view === 'detail' || view === 'edit' || view === 'dataManagement' || view === 'settings' || view === 'report' || view === 'projectReport') && (
          <button onClick={() => changeView('list')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm transition-all self-start">
            <span className="flex items-center gap-2">← Back to List</span>
          </button>
        )}
      </div>

      <div className="relative">
        {view === 'dashboard' && <Dashboard tickets={filteredTickets} projects={projects} currentUser={currentUser} comments={comments} history={history} onSelectTicket={(id) => { setSelectedTicketId(id); setView('detail'); }} />}
        {view === 'list' && <TicketList tickets={filteredTickets} projects={projects} currentUser={currentUser} users={users} onSelect={(id) => { setSelectedTicketId(id); setView('detail'); }} onEdit={(ticket) => { setEditingTicket(ticket); setView('edit'); }} onDelete={handleDeleteTicket} />}
        {view === 'create' && <TicketCreate projects={filteredProjects.filter(p => p.status === ProjectStatus.ACTIVE)} currentUser={currentUser} users={users} companies={companies} onSubmit={handleCreateTicket} onCancel={() => changeView('list')} />}
        {view === 'edit' && editingTicket && <TicketCreate projects={filteredProjects.filter(p => p.status === ProjectStatus.ACTIVE)} currentUser={currentUser} users={users} companies={companies} initialData={editingTicket} onSubmit={(data) => handleUpdateTicket(editingTicket.id, data)} onCancel={() => { setEditingTicket(null); changeView('list'); }} />}
        {view === 'detail' && selectedTicket && <TicketDetail ticket={selectedTicket} project={projects.find(p => p.id === selectedTicket.projectId)!} users={users} history={history.filter(h => h.ticketId === selectedTicket.id)} comments={comments.filter(c => c.ticketId === selectedTicket.id)} currentUser={currentUser} onStatusUpdate={updateTicketStatus} onAddComment={addComment} onBack={() => changeView('list')} />}
        {view === 'companies' && currentUser.role === UserRole.ADMIN && <CompanyManagement companies={companies} users={users} projects={projects} tickets={tickets} onAdd={addCompany} onUpdate={updateCompany} onDelete={deleteCompany} />}
        {view === 'users' && currentUser.role === UserRole.ADMIN && <UserManagement users={users} companies={companies} tickets={tickets} projects={projects} agencyName={agencyInfo.name} supportTeams={[agencyInfo.supportTeam1, agencyInfo.supportTeam2, agencyInfo.supportTeam3].filter(Boolean) as string[]} onAdd={addUser} onUpdate={async (id, data) => { await updateUser(id, data); }} onDelete={deleteUser} />}
        {view === 'projects' && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPPORT || currentUser.role === UserRole.SUPPORT_LEAD) && <ProjectManagement projects={filteredProjects} companies={companies} users={users} tickets={tickets} currentUser={currentUser} supportTeams={[agencyInfo.supportTeam1, agencyInfo.supportTeam2, agencyInfo.supportTeam3].filter(Boolean) as string[]} onAdd={addProject} onUpdate={async (id, data) => { await updateProject(id, data); return true; }} onDelete={deleteProject} />}
        {view === 'profile' && <ProfileEdit user={currentUser} companyName={currentUser.companyId ? companies.find(c => c.id === currentUser.companyId)?.name : '본사 (nu)'} onUpdate={(data) => updateUser(currentUser.id, data)} onCancel={() => changeView('list')} />}
        {view === 'dataManagement' && currentUser.role === UserRole.ADMIN && (
          <DataManagement
            currentState={{ companies, users, projects, tickets, comments, history, agencyInfo }}
            onReset={resetSystem}
            onGenerateSamples={generateSamples}
            onRestore={restoreData}
            onBackup={downloadBackup}
          />
        )}
        {view === 'report' && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPPORT_LEAD) && <PerformanceReport tickets={filteredTickets} projects={filteredProjects} users={users} history={history} currentUser={currentUser} companies={companies} />}
        {view === 'projectReport' && <ProjectPerformance tickets={filteredTickets} projects={filteredProjects} users={users} history={history} currentUser={currentUser} companies={companies} />}
        {view === 'settings' && currentUser.role === UserRole.ADMIN && <SystemSettings info={agencyInfo} onSave={async (info) => { await setAgencyInfo(info); setShowSaveSuccess(true); }} />}
      </div>

      <SuccessModal
        isOpen={showSaveSuccess}
        onClose={() => setShowSaveSuccess(false)}
        title="저장 완료"
        message="환경 설정이 성공적으로 저장되었습니다."
      />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;

