import React from 'react';
import {
    Menu, X, LayoutDashboard, PlusCircle, Ticket as TicketIcon,
    BarChartBig, Briefcase, Building2, Users as UsersIcon,
    Settings, Database, LogOut
} from 'lucide-react';
import { User, UserRole } from '../types';
import { getRoleLabel } from '../utils';
import LogoutModal from './LogoutModal';

interface LayoutProps {
    currentUser: User;
    view: string;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    changeView: (view: any) => void;
    users: User[];
    loading: boolean;
    setCurrentUser: (user: User) => void;
    onLogout: () => void;
    agencyInfo: any;
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
    currentUser,
    view,
    isSidebarOpen,
    setIsSidebarOpen,
    changeView,
    users,
    loading,
    setCurrentUser,
    onLogout,
    agencyInfo,
    children
}) => {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

    const NavItem = ({ icon: Icon, label, targetView, adminOnly = false, supportOrAdmin = false }: any) => {
        if (adminOnly && currentUser.role !== UserRole.ADMIN) return null;
        if (supportOrAdmin && (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPPORT && currentUser.role !== UserRole.SUPPORT_LEAD)) return null;
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

                <nav className="flex-1 min-h-0 p-6 space-y-2 overflow-y-auto custom-scrollbar pb-24">
                    <NavItem icon={LayoutDashboard} label="대시보드" targetView="dashboard" />
                    <NavItem icon={PlusCircle} label="New Ticket" targetView="create" />
                    <NavItem icon={TicketIcon} label="티켓 관리" targetView="list" />

                    <div className="pt-8 pb-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Report</div>
                    {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPPORT_LEAD) && <NavItem icon={BarChartBig} label="종합 실적" targetView="report" />}
                    <NavItem icon={Briefcase} label="프로젝트 실적" targetView="projectReport" />

                    <div className="pt-8 pb-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Management</div>
                    <NavItem icon={Briefcase} label="프로젝트 관리" targetView="projects" supportOrAdmin />
                    <NavItem icon={Building2} label="고객사 관리" targetView="companies" adminOnly />
                    <NavItem icon={UsersIcon} label="회원 관리" targetView="users" adminOnly />

                    <div className="pt-8 pb-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">System</div>
                    <NavItem icon={Settings} label="환경 설정" targetView="settings" adminOnly />
                    <NavItem icon={Database} label="데이터 관리" targetView="dataManagement" adminOnly />

                    <div className="px-4 pt-4">
                        <label className="block text-[10px] text-slate-500 mb-2 uppercase font-bold">Role Simulator</label>
                        <select
                            className="bg-slate-800 text-xs rounded-lg p-2.5 w-full border-none focus:ring-2 focus:ring-blue-500 outline-none text-white appearance-none cursor-pointer hover:bg-slate-700 transition-colors"
                            value={currentUser.id}
                            onChange={(e) => {
                                const selectedUser = users.find(u => u.id === e.target.value);
                                if (selectedUser) {
                                    setCurrentUser(selectedUser);
                                    setTimeout(() => changeView('dashboard'), 0);
                                }
                            }}
                        >
                            {loading && <option disabled>데이터 로딩 중...</option>}
                            {!loading && users.length === 0 && <option disabled>사용자 데이터 없음 (샘플 생성 필요)</option>}
                            {users.map(u => (
                                <option key={u.id} value={u.id} className="text-slate-900 bg-white">
                                    {u.name} ({u.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="px-4 pt-4 border-t border-slate-800 mt-4">
                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                            <LogOut size={20} />
                            <span className="text-sm">로그아웃</span>
                        </button>
                    </div>
                </nav>

                <LogoutModal
                    isOpen={isLogoutModalOpen}
                    onClose={() => setIsLogoutModalOpen(false)}
                    onConfirm={() => {
                        setIsLogoutModalOpen(false);
                        onLogout();
                    }}
                />

                <div onClick={() => changeView('profile')} className={`p-4 bg-slate-800/50 m-6 rounded-2xl cursor-pointer hover:bg-slate-800 transition-all border border-slate-700/30 group ${view === 'profile' ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold shrink-0 shadow-lg group-hover:scale-105 transition-transform text-lg">
                            {currentUser.name[0]}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-bold truncate text-slate-100">{currentUser.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{getRoleLabel(currentUser.role)}</p>
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

                <main className="flex-1 p-4 sm:p-5 lg:p-8 max-w-[1440px] w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
