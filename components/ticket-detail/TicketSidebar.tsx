import React from 'react';
import { Project, User, HistoryEntry, TicketStatus } from '../../types';
import { formatDate } from '../../utils';
import { Briefcase, Shield, History } from 'lucide-react';

interface Props {
    project: Project;
    users: User[];
    supportStaff: User[];
    history: HistoryEntry[];
}

const TicketSidebar: React.FC<Props> = ({ project, users, supportStaff, history }) => {
    const getActionDetails = (h: HistoryEntry) => {
        const { status, note = '' } = h;
        if (status === TicketStatus.WAITING) return { label: '등록', color: 'bg-slate-700 text-slate-300 border-slate-600' };
        if (status === TicketStatus.RECEIVED) return { label: '접수', color: 'bg-blue-900/30 text-blue-400 border-blue-800' };
        if (status === TicketStatus.POSTPONE_REQUESTED) return { label: '연기 요청', color: 'bg-orange-900/30 text-orange-400 border-orange-800' };
        if (status === TicketStatus.COMPLETION_REQUESTED) return { label: '완료 요청', color: 'bg-emerald-900/30 text-emerald-400 border-emerald-800' };
        if (status === TicketStatus.COMPLETED) return { label: '완료', color: 'bg-slate-800 text-slate-400 border-slate-700' };
        if (status === TicketStatus.IN_PROGRESS) {
            if (note.includes('[연기 승인]')) return { label: '연기 승인', color: 'bg-blue-900/30 text-blue-400 border-blue-800' };
            if (note.includes('[연기 거절]')) return { label: '연기 거절', color: 'bg-rose-900/30 text-rose-400 border-rose-800' };
            if (note.includes('[완료 거절]')) return { label: '보완 요청', color: 'bg-rose-900/30 text-rose-400 border-rose-800' };
            return { label: '처리중', color: 'bg-indigo-900/30 text-indigo-400 border-indigo-800' };
        }
        return { label: status, color: 'bg-slate-800 text-slate-500' };
    };

    return (
        <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-5 space-y-5">
                <section>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><Briefcase size={12} className="text-blue-500" /> Project Detail</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-0.5">Name</p>
                            <p className="text-base font-black text-slate-900 leading-tight">{project.name}</p>
                        </div>

                        {/* Customer Contact Info in Detail View */}
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-2">Customer Contacts</p>
                            {project.customerContactIds.length > 0 ? (
                                <div className="space-y-1.5">
                                    {project.customerContactIds.map(id => {
                                        const contact = users.find(u => u.id === id);
                                        if (!contact) return null;
                                        return (
                                            <div key={id} className="flex items-center gap-2.5 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                                                <div className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                                                    {contact.name[0]}
                                                </div>
                                                <div className="flex items-baseline gap-2 min-w-0">
                                                    <span className="text-xs font-bold text-slate-700">{contact.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium truncate">{contact.phone || contact.mobile || ''}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">No customer contacts assigned.</p>
                            )}
                        </div>
                    </div>
                </section>
                <div className="h-px bg-slate-100" />
                <section>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2.5"><Shield size={14} className="text-indigo-500" /> Support Team</h3>
                    <div className="space-y-1.5">
                        {supportStaff.map((u, idx) => (
                            <div key={u.id} className="flex items-center gap-2.5 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                                <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                    {u.name[0]}
                                </div>
                                <div className="flex items-baseline gap-2 min-w-0">
                                    <span className="text-xs font-bold text-slate-800">{u.name}</span>
                                    <span className="text-[10px] text-slate-400 font-medium truncate">{u.phone || u.mobile || ''}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="bg-slate-900 rounded-2xl shadow-xl p-5 text-slate-100 overflow-hidden relative border border-slate-800">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><History size={14} className="text-blue-400" /> Activity History</h3>
                <div className="space-y-2">
                    {history.map((h) => {
                        const { label, color } = getActionDetails(h);
                        return (
                            <div key={h.id} className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 hover:bg-slate-800/60 transition-colors group">
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${color}`}>{label}</span>
                                    <span className="text-xs font-bold text-slate-300">{h.changedBy}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">{formatDate(h.timestamp)}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium truncate group-hover:text-slate-200 transition-colors" title={h.note || '내용 없음'}>
                                    {h.note || '처리 내용 없음'}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TicketSidebar;
