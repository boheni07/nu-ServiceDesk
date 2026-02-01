import React, { useMemo, useState, useEffect } from 'react';
import { Ticket, Project, User, HistoryEntry, TicketStatus, UserRole, Company } from '../types';
import {
    format, subMonths, eachMonthOfInterval, isSameMonth, startOfMonth, endOfMonth, parseISO
} from 'date-fns';
import { ko } from 'date-fns/locale';
import {
    BarChart3, Calendar, ChevronDown, Download,
    TrendingUp, CheckCircle2, AlertCircle, Clock,
    Users, Briefcase, Zap, LayoutList, Building2, Search
} from 'lucide-react';

interface Props {
    tickets: Ticket[];
    projects: Project[];
    users: User[];
    history: HistoryEntry[];
    currentUser: User;
    companies: Company[];
}

const ProjectPerformance: React.FC<Props> = ({ tickets, projects, users, history, currentUser, companies }) => {
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [filterType, setFilterType] = useState<'all' | 'monthly' | 'custom'>('all');
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // 1. Accessibility Filter - Use the projects passed through props (already filtered by App/Hook)
    const accessibleProjects = projects;

    // Auto-select
    useEffect(() => {
        if (accessibleProjects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(accessibleProjects[0].id);
        }
    }, [accessibleProjects]); // Removed selectedProjectId dependency to avoid locked loop if user changes it, but initial load needs it

    const selectedProject = useMemo(() =>
        projects.find(p => p.id === selectedProjectId),
        [selectedProjectId, projects]
    );

    const company = useMemo(() =>
        selectedProject?.clientId ? companies.find(c => c.id === selectedProject.clientId) : null,
        [selectedProject, companies]
    );

    // Helpers
    const pmUser = useMemo(() =>
        selectedProject?.supportStaffIds[0] ? users.find(u => u.id === selectedProject.supportStaffIds[0]) : null,
        [selectedProject, users]
    );

    // 2. Filter Tickets for Project & Date
    const projectTickets = useMemo(() => {
        if (!selectedProjectId) return [];
        let filtered = tickets.filter(t => t.projectId === selectedProjectId);

        let start: Date, end: Date;

        if (filterType === 'all') {
            return filtered;
        } else if (filterType === 'monthly') {
            const date = parseISO(selectedMonth);
            start = startOfMonth(date);
            end = endOfMonth(date);
        } else {
            // custom
            start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
        }

        return filtered.filter(t => {
            const d = new Date(t.createdAt).getTime();
            return d >= start.getTime() && d <= end.getTime();
        });
    }, [tickets, selectedProjectId, filterType, selectedMonth, startDate, endDate]);

    // 3. KPI Calculations
    const kpiData = useMemo(() => {
        const total = projectTickets.length;
        const completed = projectTickets.filter(t => t.status === TicketStatus.COMPLETED).length;
        const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';

        // Avg Resolution Time (Days)
        const resolvedTickets = projectTickets.filter(t => t.status === TicketStatus.COMPLETED);
        const totalResTime = resolvedTickets.reduce((acc, t) => {
            const compEntry = history.find(h => h.ticketId === t.id && h.status === TicketStatus.COMPLETED);
            const end = compEntry ? new Date(compEntry.timestamp).getTime() : new Date().getTime(); // fallback if dirty data
            const start = new Date(t.createdAt).getTime();
            return acc + (end - start);
        }, 0);
        const avgResDays = resolvedTickets.length > 0
            ? (totalResTime / resolvedTickets.length / (1000 * 60 * 60 * 24)).toFixed(1)
            : '-';

        // Avg Satisfaction
        const ratedTickets = resolvedTickets.filter(t => t.satisfaction && t.satisfaction > 0);
        const avgSat = ratedTickets.length > 0
            ? (ratedTickets.reduce((acc, t) => acc + (t.satisfaction || 0), 0) / ratedTickets.length).toFixed(1)
            : '-';

        const pendingCritical = projectTickets.filter(t =>
            t.status !== TicketStatus.COMPLETED &&
            t.status !== TicketStatus.COMPLETION_REQUESTED &&
            // Assuming simplified "Critical" check based on due date proximity for now or custom logic if priority existed
            // Let's use Overdue count as "Critical" proxy for now
            (new Date(t.dueDate) < new Date())
        ).length;

        return { total, completed, completionRate, avgResDays, avgSat, pendingCritical };
    }, [projectTickets, history]);

    // ... (imports remain the same, ensure History, MessageSquare are imported)

    // ... (previous code up to KPI Calculations)

    // 4. Status Counts (New)
    const statusCounts = useMemo(() => {
        const counts = {
            total: projectTickets.length,
            received: 0,
            inProgress: 0,
            completed: 0,
            delayed: 0,
            hold: 0
        };

        projectTickets.forEach(t => {
            if (t.status === TicketStatus.RECEIVED) counts.received++;
            else if (t.status === TicketStatus.IN_PROGRESS) counts.inProgress++;
            else if (t.status === TicketStatus.COMPLETED) counts.completed++;
            else if (t.status === TicketStatus.POSTPONE_REQUESTED || t.status === TicketStatus.DELAYED) counts.hold++; // Grouping delayed/postpone as 'Hold/Issue' or separate? Let's treat Delayed as Overdue logic often.

            // Explicit check for Overdue (regardless of status if not completed)
            if (t.status !== TicketStatus.COMPLETED && new Date(t.dueDate) < new Date()) {
                counts.delayed++;
            }
        });
        return counts;
    }, [projectTickets]);

    // 5. Ticket Activity List (New)
    const ticketActivityList = useMemo(() => {
        return projectTickets.map(t => {
            const completionEntry = history.find(h => h.ticketId === t.id && h.status === TicketStatus.COMPLETED);
            const completedDate = completionEntry ? new Date(completionEntry.timestamp) : (t.status === TicketStatus.COMPLETED ? new Date(t.updatedAt || t.createdAt) : null); // Fallback

            // Count comments/activities (Assuming 'comments' prop, need to pass it or filter from history/comments if available globally? 
            // The constraint suggests "Ticket Activity". Let's use history length for now as a proxy for "Activity" or just list basics.
            // Wait, Props doesn't have comments. I should probably add comments to Props if I want to count them, or just use history count.
            // Let's rely on history count for "Activity Level".
            const activityCount = history.filter(h => h.ticketId === t.id).length;

            return {
                ...t,
                completedAt: completedDate,
                activityCount
            };
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [projectTickets, history]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header and Controls (Keep existing) */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                {/* ... (Keep existing header code) ... */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-600 text-[10px] font-black text-white px-2 py-0.5 rounded uppercase tracking-widest">Project Report</span>
                        <span className="text-slate-400 text-xs font-bold">|</span>
                        <span className="text-slate-500 text-xs font-bold">{format(new Date(), 'yyyy년 MM월 dd일')} 기준</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Briefcase size={28} className="text-slate-700" />
                        <div className="relative group">
                            <select
                                className="appearance-none bg-transparent text-2xl font-black text-slate-900 pr-8 outline-none cursor-pointer hover:text-blue-600 transition-colors max-w-[30vw] truncate"
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                            >
                                {accessibleProjects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-600" size={20} />
                        </div>
                    </div>
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm gap-2">
                    <div className="flex p-1 bg-slate-100 rounded-lg">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === 'all'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            전체
                        </button>
                        <button
                            onClick={() => setFilterType('monthly')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === 'monthly'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            월단위
                        </button>
                        <button
                            onClick={() => setFilterType('custom')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === 'custom'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            기간
                        </button>
                    </div>

                    {filterType === 'monthly' && (
                        <div className="flex items-center gap-2 px-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="relative">
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        </div>
                    )}

                    {filterType === 'custom' && (
                        <div className="flex items-center gap-2 px-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="relative">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                            <span className="text-slate-400 font-bold">~</span>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Project Overview (Keep existing) */}
            {selectedProject && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <LayoutList size={16} />
                        프로젝트 개요
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400 font-bold">프로젝트 기간</p>
                            <p className="text-sm font-bold text-slate-800">
                                {selectedProject.startDate ? format(new Date(selectedProject.startDate), 'yyyy.MM.dd') : '미설정'} ~
                                {selectedProject.endDate ? format(new Date(selectedProject.endDate), 'yyyy.MM.dd') : '미설정'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400 font-bold">고객사</p>
                            <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <Building2 size={14} className="text-slate-400" />
                                {company?.name || '-'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400 font-bold">고객 담당</p>
                            <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <Users size={14} className="text-slate-400" />
                                {users.find(u => u.id === selectedProject.customerContactIds[0])?.name || '-'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400 font-bold">지원 담당 (PM)</p>
                            <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <Briefcase size={14} className="text-slate-400" />
                                {pmUser?.name || '-'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400 font-bold">현재 상태</p>
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${selectedProject.status === '활성' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                {selectedProject.status}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">티켓 완료율</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpiData.completionRate}%</h3>
                        <p className="text-xs font-bold mt-2 text-emerald-600">{kpiData.completed} / {kpiData.total} 완료</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-300 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                        <CheckCircle2 size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">평균 처리 기간</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpiData.avgResDays}일</h3>
                        <p className="text-xs font-bold mt-2 text-indigo-600">접수부터 완료까지</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-300 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                        <Clock size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">평균 고객 만족도</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpiData.avgSat}</h3>
                        <p className="text-xs font-bold mt-2 text-amber-500">5.0 만점 기준</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-300 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                        <TrendingUp size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">지연 / 긴급</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpiData.pendingCritical}건</h3>
                        <p className="text-xs font-bold mt-2 text-rose-500">처리지연 및 긴급</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-300 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                        <AlertCircle size={24} />
                    </div>
                </div>
            </div>

            {/* Ticket Status Overview (New) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-slate-400 uppercase mb-1">전체 티켓</span>
                    <span className="text-2xl font-black text-slate-800">{statusCounts.total}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-blue-500 uppercase mb-1">접수</span>
                    <span className="text-2xl font-black text-blue-600">{statusCounts.received}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-indigo-500 uppercase mb-1">처리중</span>
                    <span className="text-2xl font-black text-indigo-600">{statusCounts.inProgress}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-emerald-500 uppercase mb-1">완료</span>
                    <span className="text-2xl font-black text-emerald-600">{statusCounts.completed}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-rose-500 uppercase mb-1">지연/보류</span>
                    <span className="text-2xl font-black text-rose-600">{statusCounts.hold + statusCounts.delayed}</span>
                </div>
            </div>

            {/* Detailed Ticket Activity List (New) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <LayoutList size={18} className="text-slate-400" />
                        티켓별 상세 처리 실적
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-24">ID</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4 w-32 text-center">Status</th>
                                <th className="px-6 py-4 w-32">Req. Date</th>
                                <th className="px-6 py-4 w-32">Due Date</th>
                                <th className="px-6 py-4 w-32">Comp. Date</th>
                                <th className="px-6 py-4 w-24 text-center">Activity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {ticketActivityList.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-400 font-bold">
                                        {ticket.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-800 truncate max-w-sm">{ticket.title}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${ticket.status === TicketStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            ticket.status === TicketStatus.IN_PROGRESS ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {format(new Date(ticket.createdAt), 'yyyy-MM-dd')}
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <span className={`${new Date(ticket.dueDate) < new Date() && ticket.status !== TicketStatus.COMPLETED ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                            {format(new Date(ticket.dueDate), 'yyyy-MM-dd')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {ticket.completedAt ? format(ticket.completedAt, 'yyyy-MM-dd') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold">
                                            <Clock size={12} />
                                            {ticket.activityCount}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {ticketActivityList.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                                        <Search size={24} className="opacity-50" />
                                        <span className="text-xs">해당 기간 내 티켓 이력이 없습니다.</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default ProjectPerformance;
