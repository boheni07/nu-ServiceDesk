import React, { useMemo } from 'react';
import { Ticket, TicketStatus, User, Project, UserRole, HistoryEntry, Company } from '../types';
import {
    BarChart3,
    TrendingUp,
    CheckCircle2,
    Clock,
    User as UserIcon,
    Briefcase,
    Calendar,
    Download,
    AlertCircle,
    LayoutList,
    Building2,
    Search
} from 'lucide-react';
import { format, subDays, isAfter, startOfMonth, endOfMonth, parseISO } from 'date-fns';

interface Props {
    tickets: Ticket[];
    projects: Project[];
    users: User[];
    history: HistoryEntry[];
    currentUser: User;
    companies: Company[];
}

const PerformanceReport: React.FC<Props> = ({ tickets, projects, users, history, currentUser, companies }) => {
    const [filterType, setFilterType] = React.useState<'all' | 'monthly' | 'custom'>('all');
    const [selectedMonth, setSelectedMonth] = React.useState(format(new Date(), 'yyyy-MM'));
    const [startDate, setStartDate] = React.useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));

    // Filter tickets based on date range
    const filteredTickets = useMemo(() => {
        if (filterType === 'all') return tickets;

        let start: Date, end: Date;

        if (filterType === 'monthly') {
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

        return tickets.filter(t => {
            const date = new Date(t.createdAt);
            return date >= start && date <= end;
        });
    }, [tickets, filterType, selectedMonth, startDate, endDate]);

    // 1. Overall Stats
    const totalTickets = filteredTickets.length;
    const completedTickets = filteredTickets.filter(t => t.status === TicketStatus.COMPLETED).length;
    const completionRate = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0;

    // Average Satisfaction
    const ratedTickets = filteredTickets.filter(t => t.satisfaction && t.satisfaction > 0);
    const avgSatisfaction = ratedTickets.length > 0
        ? (ratedTickets.reduce((acc, t) => acc + (t.satisfaction || 0), 0) / ratedTickets.length).toFixed(1)
        : '0.0';

    // SLA Adherence (On-time Completion)
    const onTimeTickets = filteredTickets.filter(t => {
        if (t.status !== TicketStatus.COMPLETED || !t.dueDate) return false;
        const compEntry = history.find(h => h.ticketId === t.id && h.status === TicketStatus.COMPLETED);
        if (!compEntry) return false;
        return new Date(compEntry.timestamp).getTime() <= new Date(t.dueDate).getTime();
    }).length;
    const slaRate = completedTickets > 0 ? Math.round((onTimeTickets / completedTickets) * 100) : 0;

    // Average Resolution Time (Days)
    const resTimes = filteredTickets
        .filter(t => t.status === TicketStatus.COMPLETED)
        .map(t => {
            const compEntry = history.find(h => h.ticketId === t.id && h.status === TicketStatus.COMPLETED);
            if (!compEntry) return null;
            return (new Date(compEntry.timestamp).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        })
        .filter((val): val is number => val !== null);

    const avgResTime = resTimes.length > 0
        ? (resTimes.reduce((acc, val) => acc + val, 0) / resTimes.length).toFixed(1)
        : '-';

    // Status Counts
    const statusCounts = useMemo(() => {
        const counts = {
            total: totalTickets,
            received: 0,
            inProgress: 0,
            completed: 0,
            delayed: 0,
            hold: 0
        };

        filteredTickets.forEach(t => {
            if (t.status === TicketStatus.RECEIVED) counts.received++;
            else if (t.status === TicketStatus.IN_PROGRESS) counts.inProgress++;
            else if (t.status === TicketStatus.COMPLETED) counts.completed++;
            else if (t.status === TicketStatus.POSTPONE_REQUESTED || t.status === TicketStatus.DELAYED) counts.hold++;

            if (t.status !== TicketStatus.COMPLETED && new Date(t.dueDate) < new Date()) {
                counts.delayed++;
            }
        });
        return counts;
    }, [filteredTickets, totalTickets]);


    // 2. User Performance (Support Team)
    const supportPerformance = useMemo(() => {
        let supportUsers = users.filter(u => u.role === UserRole.SUPPORT || u.role === UserRole.SUPPORT_LEAD);

        // If customer, only show staff who have at least one ticket assigned in their projects
        if (currentUser.role === UserRole.CUSTOMER) {
            const supportStaffIdsInProjects = projects.flatMap(p => p.supportStaffIds);
            supportUsers = supportUsers.filter(u => supportStaffIdsInProjects.includes(u.id));
        }

        return supportUsers.map(user => {
            const assigned = filteredTickets.filter(t => t.supportId === user.id);
            const completedCount = assigned.filter(t => t.status === TicketStatus.COMPLETED).length;
            const inProgressCount = assigned.filter(t => t.status === TicketStatus.IN_PROGRESS).length;
            const userRated = assigned.filter(t => t.status === TicketStatus.COMPLETED && t.satisfaction && t.satisfaction > 0);
            const userAvgSat = userRated.length > 0
                ? (userRated.reduce((acc, t) => acc + (t.satisfaction || 0), 0) / userRated.length).toFixed(1)
                : '-';

            return {
                user,
                assignedCount: assigned.length,
                completedCount,
                inProgressCount,
                satisfaction: userAvgSat
            };
        }).sort((a, b) => b.completedCount - a.completedCount);
    }, [users, filteredTickets, projects, currentUser]);

    // 3. Project Performance
    const projectPerformance = useMemo(() => {
        return projects.map(project => {
            const projectTickets = filteredTickets.filter(t => t.projectId === project.id);
            const compCount = projectTickets.filter(t => t.status === TicketStatus.COMPLETED).length;
            const rate = projectTickets.length > 0 ? Math.round((compCount / projectTickets.length) * 100) : 0;
            return {
                project,
                total: projectTickets.length,
                completed: compCount,
                rate
            };
        }).sort((a, b) => b.total - a.total);
    }, [projects, filteredTickets]);

    // 4. Client (Company) Performance
    const companyPerformance = useMemo(() => {
        return companies.map(company => {
            // Find projects belonging to this company
            const companyProjectIds = projects.filter(p => p.clientId === company.id).map(p => p.id);
            const companyTickets = filteredTickets.filter(t => companyProjectIds.includes(t.projectId));

            const compCount = companyTickets.filter(t => t.status === TicketStatus.COMPLETED).length;
            const rate = companyTickets.length > 0 ? Math.round((compCount / companyTickets.length) * 100) : 0;

            return {
                company,
                total: companyTickets.length,
                completed: compCount,
                rate
            };
        }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
    }, [companies, projects, filteredTickets]);

    // 5. Detailed Ticket List
    const detailedList = useMemo(() => {
        return filteredTickets.map(t => {
            const project = projects.find(p => p.id === t.projectId);
            const company = project ? companies.find(c => c.id === project.clientId) : null;
            const assignee = users.find(u => u.id === t.supportId);

            // Calculate activity count (proxy)
            const activityCount = history.filter(h => h.ticketId === t.id).length;

            const completionEntry = history.find(h => h.ticketId === t.id && h.status === TicketStatus.COMPLETED);
            const completedDate = completionEntry ? new Date(completionEntry.timestamp) : (t.status === TicketStatus.COMPLETED ? new Date(t.updatedAt || t.createdAt) : null);

            return {
                ...t,
                projectName: project?.name || '-',
                companyName: company?.name || '-',
                assigneeName: assignee?.name || '-',
                activityCount,
                completedAt: completedDate
            };
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [filteredTickets, projects, companies, users, history]);


    const StatCard = ({ icon: Icon, title, value, subtext, color }: any) => (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between group hover:shadow-md transition-all">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
                <p className={`text-xs font-bold mt-2 ${color}`}>{subtext}</p>
            </div>
            <div className={`p-3 rounded-xl bg-slate-50 text-slate-300 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300`}>
                <Icon size={24} />
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-600 text-[10px] font-black text-white px-2 py-0.5 rounded uppercase tracking-widest">Analytics</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">종합 실적 및 성과</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">전체 프로젝트의 운영 성과와 효율성을 분석합니다.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {/* ... (Date Filters keep existing) ... */}
                    <div className="flex p-1 bg-slate-100 rounded-lg">
                        <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>전체</button>
                        <button onClick={() => setFilterType('monthly')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>월단위</button>
                        <button onClick={() => setFilterType('custom')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === 'custom' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>기간</button>
                    </div>
                    {filterType === 'monthly' && (
                        <div className="flex items-center gap-2 px-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="relative">
                                <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        </div>
                    )}
                    {filterType === 'custom' && (
                        <div className="flex items-center gap-2 px-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="relative">
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                            <span className="text-slate-400 font-bold">~</span>
                            <div className="relative">
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={CheckCircle2} title="티켓 완료율" value={`${completionRate}%`} subtext={`${completedTickets} / ${totalTickets} 완료`} color="text-emerald-600" />
                <StatCard icon={Clock} title="평균 처리 기간" value={`${avgResTime}일`} subtext="접수부터 완료까지" color="text-indigo-600" />
                <StatCard icon={UserIcon} title="평균 고객 만족도" value={avgSatisfaction} subtext="5.0 만점 기준" color="text-amber-500" />
                <StatCard icon={AlertCircle} title="지연 / 긴급" value={`${statusCounts.delayed}건`} subtext="처리지연 및 긴급" color="text-rose-500" />
            </div>

            {/* Status Overview */}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Company & Project Performance */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Projects */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <Briefcase size={18} className="text-slate-400" /> 프로젝트별 현황
                            </h3>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto max-h-[400px] custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs text-slate-400 uppercase font-black tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th className="pb-3">프로젝트명</th>
                                        <th className="pb-3 text-right">총 티켓</th>
                                        <th className="pb-3 text-right">완료</th>
                                        <th className="pb-3 text-right">진행률</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {projectPerformance.map(({ project, total, completed, rate }) => (
                                        <tr key={project.id} className="group">
                                            <td className="py-3 font-bold text-slate-700">{project.name}</td>
                                            <td className="py-3 text-right text-slate-600">{total}</td>
                                            <td className="py-3 text-right text-emerald-600 font-bold">{completed}</td>
                                            <td className="py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-xs font-bold">{rate}%</span>
                                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${rate === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${rate}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Companies */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <Building2 size={18} className="text-slate-400" /> 고객사별 현황
                            </h3>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto max-h-[400px] custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs text-slate-400 uppercase font-black tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th className="pb-3">고객사</th>
                                        <th className="pb-3 text-right">총 티켓</th>
                                        <th className="pb-3 text-right">완료</th>
                                        <th className="pb-3 text-right">진행률</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {companyPerformance.map(({ company, total, completed, rate }) => (
                                        <tr key={company.id} className="group">
                                            <td className="py-3 font-bold text-slate-700">{company.name}</td>
                                            <td className="py-3 text-right text-slate-600">{total}</td>
                                            <td className="py-3 text-right text-emerald-600 font-bold">{completed}</td>
                                            <td className="py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-xs font-bold">{rate}%</span>
                                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${rate === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${rate}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Support Team Performance */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:col-span-1">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <UserIcon size={18} className="text-slate-400" /> 지원팀 성과
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs">
                                <tr>
                                    <th className="px-4 py-3">담당자</th>
                                    <th className="px-4 py-3 text-center">완료</th>
                                    <th className="px-4 py-3 text-center">평점</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {supportPerformance.map(({ user, completedCount, satisfaction }) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                {user.name.charAt(0)}
                                            </div>
                                            {user.name}
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-emerald-600">{completedCount}</td>
                                        <td className="px-4 py-3 text-center font-bold text-amber-500">{satisfaction}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detailed Ticket List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <LayoutList size={18} className="text-slate-400" />
                        상세 업무처리 실적
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-20">ID</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Project / Client</th>
                                <th className="px-6 py-4 w-28 text-center">Status</th>
                                <th className="px-6 py-4 w-28">Assignee</th>
                                <th className="px-6 py-4 w-28">Req. Date</th>
                                <th className="px-6 py-4 w-28">Comp. Date</th>
                                <th className="px-6 py-4 w-20 text-center">Act.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {detailedList.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-400 font-bold">{t.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-800 truncate max-w-xs">{t.title}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-slate-700">{t.projectName}</p>
                                        <p className="text-[10px] text-slate-400">{t.companyName}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${t.status === TicketStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            t.status === TicketStatus.IN_PROGRESS ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">{t.assigneeName}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500">{format(new Date(t.createdAt), 'yyyy-MM-dd')}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500">{t.completedAt ? format(t.completedAt, 'yyyy-MM-dd') : '-'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold">
                                            <Clock size={12} />
                                            {t.activityCount}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {detailedList.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 flex flex-col items-center gap-2">
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

export default PerformanceReport;
