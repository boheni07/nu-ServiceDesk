import React from 'react';
import { Ticket, TicketStatus, User, Project, UserRole } from '../types';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    ArrowRight,
    ShieldAlert,
    Inbox,
    PlayCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { isOverdue } from '../utils';

interface Props {
    tickets: Ticket[];
    projects: Project[];
    currentUser: User;
    onSelectTicket: (id: string) => void;
}

const Dashboard: React.FC<Props> = ({ tickets, projects, currentUser, onSelectTicket }) => {
    const getStat = (status: TicketStatus) => tickets.filter(t => t.status === status).length;
    const overdueCount = tickets.filter(t => t.status !== TicketStatus.COMPLETED && isOverdue(t.dueDate)).length;

    const stats = [
        { label: '대기중', count: getStat(TicketStatus.WAITING), icon: Inbox, color: 'text-slate-500', bg: 'bg-slate-100' },
        { label: '접수됨', count: getStat(TicketStatus.RECEIVED), icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-100' },
        { label: '진행중', count: getStat(TicketStatus.IN_PROGRESS), icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
        { label: '기한경과', count: overdueCount, icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-100' },
        { label: '완료', count: getStat(TicketStatus.COMPLETED), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    ];

    const recentTickets = [...tickets]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    const urgentTickets = tickets
        .filter(t => t.status !== TicketStatus.COMPLETED)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl shadow-slate-900/20">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">
                        안녕하세요, {currentUser.name}님! 👋
                    </h1>
                    <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed">
                        오늘도 서비스데스크를 통해 차질 없는 업무 수행을 지원해 드립니다.
                        {overdueCount > 0 ? ` 현재 해결이 시급한 티켓이 ${overdueCount}건 있습니다.` : ' 모든 업무가 원활하게 진행되고 있습니다.'}
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.count}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Urgent Items */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                                <AlertCircle size={20} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">처리가 시급한 티켓</h2>
                        </div>
                    </div>
                    <div className="flex-1 p-4 space-y-3">
                        {urgentTickets.length > 0 ? urgentTickets.map(ticket => (
                            <button
                                key={ticket.id}
                                onClick={() => onSelectTicket(ticket.id)}
                                className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group text-left border border-transparent hover:border-slate-100"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${isOverdue(ticket.dueDate) ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600'}`}>
                                    D-{Math.ceil((new Date(ticket.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{ticket.title}</h4>
                                    <p className="text-xs text-slate-400 mt-0.5 font-medium">{ticket.id} • {projects.find(p => p.id === ticket.projectId)?.name}</p>
                                </div>
                                <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </button>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <CheckCircle2 size={48} className="mb-4 text-slate-200" />
                                <p className="font-medium">시급한 작업이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                <BarChart3 size={20} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">최근 등록 티켓</h2>
                        </div>
                    </div>
                    <div className="flex-1 p-4 space-y-3">
                        {recentTickets.map(ticket => (
                            <button
                                key={ticket.id}
                                onClick={() => onSelectTicket(ticket.id)}
                                className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group text-left border border-transparent hover:border-slate-100"
                            >
                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <BarChart3 size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors tracking-tight uppercase">{ticket.title}</h4>
                                    <p className="text-xs text-slate-400 mt-0.5 font-medium">{format(new Date(ticket.createdAt), 'MM월 dd일 HH:mm')} 등록</p>
                                </div>
                                <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors uppercase">
                                    {ticket.status}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
