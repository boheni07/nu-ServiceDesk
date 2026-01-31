import React from 'react';
import { Ticket, TicketStatus, HistoryEntry } from '../../types';
import { formatDate } from '../../utils';
import { CalendarDays, ArrowRight, CheckCircle2, RotateCcw, Star } from 'lucide-react';

interface Props {
    ticket: Ticket;
    history: HistoryEntry[];
}

const TicketContextBanner: React.FC<Props> = ({ ticket, history }) => {
    return (
        <div className="space-y-4 mb-6">
            {/* Postpone Request Context */}
            {ticket.status === TicketStatus.POSTPONE_REQUESTED && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start">
                        <div className="shrink-0 p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <CalendarDays size={20} />
                        </div>
                        <div className="flex-1 space-y-3 w-full">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-orange-900">기한 연기 요청</h4>
                                <span className="text-[10px] font-bold text-orange-600 px-2 py-1 bg-orange-100 rounded-md uppercase tracking-wider">Approval Required</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-white/50 p-3 rounded-lg border border-orange-100/50">
                                <span className="line-through decoration-slate-400/50 text-slate-400">{formatDate(ticket.expectedCompletionDate || ticket.dueDate).split(' ')[0]}</span>
                                <ArrowRight size={14} className="text-orange-400" />
                                <span className="text-orange-600 font-black">{ticket.postponeDate ? formatDate(ticket.postponeDate).split(' ')[0] : '-'}</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-orange-100 text-xs text-slate-600 leading-relaxed">
                                <span className="text-orange-500 font-bold mr-2 uppercase text-[10px] tracking-wide">Reason</span>
                                {ticket.postponeReason}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Completion Request Context */}
            {ticket.status === TicketStatus.COMPLETION_REQUESTED && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start">
                        <div className="shrink-0 p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                            <CheckCircle2 size={20} />
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-emerald-900">완료 보고 접수</h4>
                                <span className="text-[10px] font-bold text-emerald-600 px-2 py-1 bg-emerald-100 rounded-md uppercase tracking-wider">Final Approval</span>
                            </div>
                            <p className="text-sm text-emerald-800/80 font-medium leading-relaxed">
                                지원팀이 모든 작업을 완료하고 최종 승인을 요청했습니다. 결과물을 확인하시고 승인 또는 보완 요청을 진행해 주세요.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection / Feedback Context (Use persistent field first, fallback to history) */}
            {(() => {
                const isRejectionStatus = (ticket.status === TicketStatus.IN_PROGRESS || ticket.status === TicketStatus.DELAYED);
                const hasRejectionReason = !!ticket.rejectionReason;

                // Check history for legacy support or immediate update reflection
                const latestHistory = history[0];
                const note = latestHistory?.note || '';

                const isHistoryRejection = note.includes('[연기 거절]') || note.includes('[완료 거절]') || note.includes('[보완 요청]');
                const isHistoryApproval = note.includes('[연기 승인]');

                if (isRejectionStatus) {
                    if (isHistoryApproval) {
                        const newDate = note.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || '알 수 없음';
                        return (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start">
                                    <div className="shrink-0 p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div className="flex-1 space-y-2 w-full">
                                        <h4 className="text-sm font-black text-blue-900">연기 요청 승인됨</h4>
                                        <div className="bg-white p-3 rounded-lg border border-blue-100 text-xs text-slate-700 leading-relaxed font-medium">
                                            고객이 기한 연기를 승인했습니다. 변경된 마감 기한: <span className="font-bold text-blue-600">{newDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    if (hasRejectionReason || isHistoryRejection) {
                        const isPostponeReject = note.includes('[연기 거절]') || (hasRejectionReason && !note.includes('[완료 거절]') && !note.includes('[보완 요청]'));
                        // Default to 'Review Request' if not explicitly postpone reject
                        const title = isPostponeReject ? '연기 요청 거절됨' : '보완 요청 사항';
                        const icon = isPostponeReject ? <CalendarDays size={20} /> : <RotateCcw size={20} />;
                        const color = 'rose';

                        // Use stored rejectionReason if available, otherwise parse history
                        const reasonContent = ticket.rejectionReason || (note.split('사유: ')[1] || note.split('기록...')[0] || note);

                        return (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <div className={`bg-${color}-50 border border-${color}-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start`}>
                                    <div className={`shrink-0 p-2 bg-${color}-100 text-${color}-600 rounded-lg`}>
                                        {icon}
                                    </div>
                                    <div className="flex-1 space-y-2 w-full">
                                        <h4 className={`text-sm font-black text-${color}-900`}>{title}</h4>
                                        <div className={`bg-white p-3 rounded-lg border border-${color}-100 text-xs text-slate-700 leading-relaxed font-medium`}>
                                            {reasonContent}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                }
                return null;
            })()}

            {/* Completed Feedback Context */}
            {ticket.status === TicketStatus.COMPLETED && ticket.satisfaction !== undefined && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start">
                        <div className="shrink-0 p-2 bg-white text-slate-600 rounded-lg shadow-sm">
                            <Star size={20} fill={ticket.satisfaction >= 4 ? "#fbbf24" : "none"} className={ticket.satisfaction >= 4 ? "text-amber-400" : "text-slate-300"} />
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-slate-900">최종 완료 피드백</h4>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill={s <= (ticket.satisfaction || 0) ? "#fbbf24" : "none"} className={s <= (ticket.satisfaction || 0) ? "text-amber-400" : "text-slate-300"} />)}
                                </div>
                            </div>
                            {ticket.completionFeedback && (
                                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed italic">
                                    "{ticket.completionFeedback}"
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketContextBanner;
