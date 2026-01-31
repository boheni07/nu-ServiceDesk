
import React, { useMemo, useState, useEffect } from 'react';
import { Ticket, Project, User, HistoryEntry, TicketStatus, UserRole } from '../types';
import {
    format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
    eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval,
    isSameDay, isSameWeek, isSameMonth, subMonths, addDays, getWeek
} from 'date-fns';
import {
    BarChart3, Calendar, ChevronDown, Download,
    TrendingUp, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';

interface Props {
    tickets: Ticket[];
    projects: Project[];
    users: User[];
    history: HistoryEntry[];
    currentUser: User;
}

type Period = 'daily' | 'weekly' | 'monthly';

const ProjectPerformance: React.FC<Props> = ({ tickets, projects, users, history, currentUser }) => {
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [period, setPeriod] = useState<Period>('daily');

    // 1. Filter accessible projects
    const accessibleProjects = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === UserRole.ADMIN) return projects;
        if (currentUser.role === UserRole.SUPPORT) {
            return projects.filter(p => p.supportStaffIds.includes(currentUser.id));
        }
        return projects.filter(p => p.customerContactIds.includes(currentUser.id));
    }, [projects, currentUser]);

    // Auto-select first project
    useEffect(() => {
        if (accessibleProjects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(accessibleProjects[0].id);
        }
    }, [accessibleProjects]);

    const selectedProjectName = useMemo(() =>
        projects.find(p => p.id === selectedProjectId)?.name || 'Projects'
        , [selectedProjectId, projects]);

    // 2. Filter tickets for selected project
    const projectTickets = useMemo(() => {
        if (!selectedProjectId) return [];
        return tickets.filter(t => t.projectId === selectedProjectId);
    }, [tickets, selectedProjectId]);

    // 3. Generate Time Series Data
    const timeSeriesData = useMemo(() => {
        const now = new Date();
        let interval: { start: Date, end: Date };
        let dates: Date[] = [];
        let dateFormat = '';
        let confirmSame: (d1: Date, d2: Date) => boolean;

        if (period === 'daily') {
            const start = subDays(now, 29); // Last 30 days
            interval = { start, end: now };
            dates = eachDayOfInterval(interval);
            dateFormat = 'MM-dd';
            confirmSame = isSameDay;
        } else if (period === 'weekly') {
            const start = subDays(now, 84); // Approx 12 weeks
            interval = { start: startOfWeek(start), end: endOfWeek(now) };
            dates = eachWeekOfInterval(interval);
            dateFormat = 'M월 w주'; // Custom format needed
            confirmSame = isSameWeek;
        } else { // monthly
            const start = subMonths(now, 11); // Last 12 months
            interval = { start: startOfMonth(start), end: endOfMonth(now) };
            dates = eachMonthOfInterval(interval);
            dateFormat = 'yyyy-MM';
            confirmSame = isSameMonth;
        }

        // Reverse to show newest first? Or oldest first (chart style)? Let's do Oldest -> Newest for chart flow
        // But for table list, maybe specific order. Let's build the array standard first.

        return dates.map(date => {
            // Incoming (Created)
            const received = projectTickets.filter(t => confirmSame(new Date(t.createdAt), date)).length;

            // Completed (Based on history or status+updatedAt if strictly status check)
            // Using history for accuracy of WHEN it was completed
            const completed = projectTickets.filter(t => {
                if (t.status !== TicketStatus.COMPLETED) return false;
                // Find completion event
                const entry = history.find(h => h.ticketId === t.id && h.status === TicketStatus.COMPLETED);
                const compDate = entry ? new Date(entry.timestamp) : new Date(t.createdAt); // Fallback to created if no history (shouldn't happen)
                return confirmSame(compDate, date);
            }).length;

            // Rate calculation for this period
            const rated = projectTickets.filter(t => {
                if (!t.satisfaction) return false;
                const entry = history.find(h => h.ticketId === t.id && h.status === TicketStatus.COMPLETED);
                const d = entry ? new Date(entry.timestamp) : new Date(t.createdAt);
                return confirmSame(d, date);
            });
            const avgSat = rated.length > 0
                ? (rated.reduce((sum, t) => sum + (t.satisfaction || 0), 0) / rated.length).toFixed(1)
                : '-';

            return {
                date,
                label: period === 'weekly' ? `${format(date, 'M')}월 ${getWeek(date, { weekStartsOn: 1 }) % 5 + 1}주차` : format(date, dateFormat),
                received,
                completed,
                satisfaction: avgSat
            };
        });
    }, [period, projectTickets, history]);

    // Totals for the View
    const totalReceivedInPeriod = timeSeriesData.reduce((acc, d) => acc + d.received, 0);
    const totalCompletedInPeriod = timeSeriesData.reduce((acc, d) => acc + d.completed, 0);
    const avgSatInPeriod = (() => {
        const valid = timeSeriesData.filter(d => d.satisfaction !== '-');
        if (valid.length === 0) return '0.0';
        return (valid.reduce((acc, d) => acc + parseFloat(d.satisfaction as string), 0) / valid.length).toFixed(1);
    })();


    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="bg-indigo-600 text-[10px] font-black text-white px-2 py-0.5 rounded uppercase tracking-widest">Project Analytics</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">프로젝트 실적 상세</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">프로젝트별 상세 운영 지표 및 기간별 추이를 분석합니다.</p>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <select
                            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                        >
                            {accessibleProjects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                    {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${period === p
                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {p === 'daily' ? '일간' : p === 'weekly' ? '주간' : '월간'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Period Received</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{totalReceivedInPeriod}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <AlertCircle size={20} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Period Completed</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCompletedInPeriod}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <CheckCircle2 size={20} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Satisfaction</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{avgSatInPeriod}</h3>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                        <TrendingUp size={20} />
                    </div>
                </div>
            </div>

            {/* Time Series Table/Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Calendar size={18} className="text-slate-400" />
                        기간별 상세 실적 ({period === 'daily' ? '최근 30일' : period === 'weekly' ? '최근 12주' : '최근 12개월'})
                    </h3>
                    <button className="text-slate-400 hover:text-slate-600">
                        <Download size={18} />
                    </button>
                </div>

                {/* Visualization Bar (Simple implementation) */}
                <div className="px-6 pt-6 pb-2 h-40 flex items-end gap-2 overflow-x-auto custom-scrollbar">
                    {timeSeriesData.map((data, idx) => {
                        const maxVal = Math.max(...timeSeriesData.map(d => Math.max(d.received, d.completed))) || 1;
                        const hRec = Math.max((data.received / maxVal) * 100, 4); // min 4%
                        const hCom = Math.max((data.completed / maxVal) * 100, 4);

                        return (
                            <div key={idx} className="flex flex-col justify-end items-center gap-1 group min-w-[30px] w-full">
                                <div className="flex items-end gap-1 h-full w-full justify-center">
                                    <div
                                        style={{ height: `${hRec}%` }}
                                        className="w-2 md:w-3 bg-blue-200 rounded-t-sm group-hover:bg-blue-300 transition-colors relative"
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            접수: {data.received}
                                        </div>
                                    </div>
                                    <div
                                        style={{ height: `${hCom}%` }}
                                        className="w-2 md:w-3 bg-emerald-400 rounded-t-sm group-hover:bg-emerald-500 transition-colors relative"
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            완료: {data.completed}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[9px] text-slate-400 -rotate-45 origin-left translate-y-2 whitespace-nowrap mb-2">{data.label}</span>
                            </div>
                        )
                    })}
                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 whitespace-nowrap">기간</th>
                                <th className="px-6 py-3 text-center whitespace-nowrap">신규 접수</th>
                                <th className="px-6 py-3 text-center whitespace-nowrap">처리 완료</th>
                                <th className="px-6 py-3 text-center whitespace-nowrap">만족도</th>
                                <th className="px-6 py-3 text-center whitespace-nowrap">상태</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[...timeSeriesData].reverse().map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-700 whitespace-nowrap">{row.label}</td>
                                    <td className="px-6 py-3 text-center text-blue-600 font-bold">{row.received}</td>
                                    <td className="px-6 py-3 text-center text-emerald-600 font-bold bg-emerald-50/30">{row.completed}</td>
                                    <td className="px-6 py-3 text-center text-amber-500 font-bold">{row.satisfaction}</td>
                                    <td className="px-6 py-3 text-center">
                                        {row.completed >= row.received && row.received > 0 ? (
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Good</span>
                                        ) : row.received > row.completed ? (
                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Backlog</span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {timeSeriesData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">데이터가 없습니다.</td>
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
