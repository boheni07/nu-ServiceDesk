import React from 'react';
import { Ticket, TicketStatus, User, Project, UserRole, Comment, HistoryEntry } from '../types';
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
import NotificationZone from './NotificationZone';


interface Props {
    tickets: Ticket[];
    projects: Project[];
    currentUser: User;
    comments: Comment[]; // Added comments prop
    history: HistoryEntry[]; // Added history prop (though not strictly used in NotificationZone yet, might be standard practice or for future ext)
    onSelectTicket: (id: string) => void;
}

const Dashboard: React.FC<Props> = ({ tickets, projects, currentUser, comments, history, onSelectTicket }) => {
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-2xl shadow-slate-900/20">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-2xl sm:text-3xl font-black mb-3 tracking-tight">
                        안녕하세요, {currentUser.name}님! 👋
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed">
                        오늘도 서비스데스크를 통해 차질 없는 업무 수행을 지원해 드립니다.
                        {overdueCount > 0 ? ` 현재 해결이 시급한 티켓이 ${overdueCount}건 있습니다.` : ' 모든 업무가 원활하게 진행되고 있습니다.'}
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center mb-2">{stat.label}</p>
                        <div className="flex items-center justify-center gap-3">
                            <div className={`w-9 h-9 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <stat.icon size={18} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">{stat.count}</h3>
                        </div>
                    </div>
                ))}
            </div>



            {/* Notification Zone */}
            <NotificationZone
                tickets={tickets}
                comments={comments}
                history={history}
                currentUser={currentUser}
                projects={projects}
                onSelectTicket={onSelectTicket}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Urgent Items */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg">
                                <AlertCircle size={16} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">처리가 시급한 티켓</h2>
                        </div>
                    </div>
                    <div className="flex-1 p-3 space-y-2">
                        {urgentTickets.length > 0 ? urgentTickets.map(ticket => (
                            <button
                                key={ticket.id}
                                onClick={() => onSelectTicket(ticket.id)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all group text-left border border-transparent hover:border-slate-100"
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${isOverdue(ticket.dueDate) ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600'}`}>
                                    D-{Math.ceil((new Date(ticket.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">{ticket.title}</h4>
                                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{ticket.id} • {projects.find(p => p.id === ticket.projectId)?.name}</p>
                                </div>
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </button>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                <CheckCircle2 size={32} className="mb-3 text-slate-200" />
                                <p className="font-medium text-sm">시급한 작업이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                <BarChart3 size={16} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">최근 등록 티켓</h2>
                        </div>
                    </div>
                    <div className="flex-1 p-3 space-y-2">
                        {recentTickets.map(ticket => (
                            <button
                                key={ticket.id}
                                onClick={() => onSelectTicket(ticket.id)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all group text-left border border-transparent hover:border-slate-100"
                            >
                                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <BarChart3 size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors tracking-tight uppercase text-sm">{ticket.title}</h4>
                                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{format(new Date(ticket.createdAt), 'MM월 dd일 HH:mm')} 등록</p>
                                </div>
                                <div className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors uppercase">
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
