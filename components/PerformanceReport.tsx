import React, { useMemo } from 'react';
import { Ticket, TicketStatus, User, Project, UserRole, HistoryEntry } from '../types';
import {
    BarChart3,
    TrendingUp,
    CheckCircle2,
    Clock,
    User as UserIcon,
    Briefcase,
    Calendar,
    Download
} from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';

interface Props {
    tickets: Ticket[];
    projects: Project[];
    users: User[];
    history: HistoryEntry[];
    currentUser: User;
}

const PerformanceReport: React.FC<Props> = ({ tickets, projects, users, history, currentUser }) => {
    const [dateRange, setDateRange] = React.useState<'week' | 'month' | 'quarter' | 'all'>('month');

    // Filter tickets based on date range
    const filteredTickets = useMemo(() => {
        if (dateRange === 'all') return tickets;
        const now = new Date();
        let days = 30;
        if (dateRange === 'week') days = 7;
        if (dateRange === 'quarter') days = 90;
        const cutoff = subDays(now, days);
        return tickets.filter(t => isAfter(new Date(t.createdAt), cutoff));
    }, [tickets, dateRange]);

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

    // 2. User Performance (Support Team)
    const supportPerformance = useMemo(() => {
        let supportUsers = users.filter(u => u.role === UserRole.SUPPORT || u.role === UserRole.ADMIN);

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
    }, [users, filteredTickets]);

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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-600 text-[10px] font-black text-white px-2 py-0.5 rounded uppercase tracking-widest">Analytics</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">실적 관리 및 분석</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">서비스 운영 성과와 인력별 효율성을 정량적으로 모니터링합니다.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center">
                        {(['week', 'month', 'quarter', 'all'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setDateRange(r)}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${dateRange === r ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {r === 'week' ? '1주' : r === 'month' ? '1개월' : r === 'quarter' ? '3개월' : '전체'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={CheckCircle2}
                    title="티켓 완료율"
                    value={`${completionRate}%`}
                    subtext={`${completedTickets} / ${totalTickets} 완료`}
                    color="text-emerald-600"
                />
                <StatCard
                    icon={Clock}
                    title="SLA 준수율"
                    value={`${slaRate}%`}
                    subtext="기한 내 처리 비중"
                    color="text-blue-600"
                />
                <StatCard
                    icon={TrendingUp}
                    title="평균 처리 기간"
                    value={`${avgResTime}일`}
                    subtext="접수부터 완료까지"
                    color="text-indigo-600"
                />
                <StatCard
                    icon={UserIcon}
                    title="평균 고객 만족도"
                    value={avgSatisfaction}
                    subtext="5.0 만점 기준"
                    color="text-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Support Team Performance */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <UserIcon size={18} className="text-slate-400" /> {currentUser.role === UserRole.CUSTOMER ? '우리 프로젝트 담당자' : '지원팀 성과 (Support Team)'}
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">담당자</th>
                                    <th className="px-6 py-4 text-center">배정됨</th>
                                    <th className="px-6 py-4 text-center">완료함</th>
                                    <th className="px-6 py-4 text-center">진행중</th>
                                    <th className="px-6 py-4 text-center">만족도</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {supportPerformance.map(({ user, assignedCount, completedCount, inProgressCount, satisfaction }) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {user.name.charAt(0)}
                                            </div>
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-600">{assignedCount}</td>
                                        <td className="px-6 py-4 text-center font-bold text-emerald-600 bg-emerald-50/50">{completedCount}</td>
                                        <td className="px-6 py-4 text-center text-blue-600">{inProgressCount}</td>
                                        <td className="px-6 py-4 text-center font-bold text-amber-500">{satisfaction}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Project Status */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <Briefcase size={18} className="text-slate-400" /> 프로젝트 현황
                        </h3>
                    </div>
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[500px] custom-scrollbar">
                        {projectPerformance.map(({ project, total, completed, rate }) => (
                            <div key={project.id} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-slate-700 text-sm">{project.name}</p>
                                    <p className="text-xs font-bold text-slate-400">{completed}/{total} 완료 ({rate}%)</p>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${rate === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                        style={{ width: `${rate}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceReport;
