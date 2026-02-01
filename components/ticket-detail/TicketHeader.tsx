import React from 'react';
import { Ticket, TicketStatus } from '../../types';
import { formatDate } from '../../utils';
import { differenceInDays, startOfDay } from 'date-fns';

interface Props {
    ticket: Ticket;
}

const TicketHeader: React.FC<Props> = ({ ticket }) => {
    const isDelayed = ticket.status === TicketStatus.DELAYED;

    const getStatusBadge = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.WAITING: return 'bg-amber-50 text-amber-700 border-amber-200';
            case TicketStatus.RECEIVED: return 'bg-blue-50 text-blue-700 border-blue-200';
            case TicketStatus.IN_PROGRESS: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case TicketStatus.DELAYED: return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
            case TicketStatus.POSTPONE_REQUESTED: return 'bg-orange-50 text-orange-700 border-orange-200';
            case TicketStatus.COMPLETION_REQUESTED: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case TicketStatus.COMPLETED: return 'bg-slate-50 text-slate-500 border-slate-200';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    const finalDate = ticket.expectedCompletionDate ? new Date(ticket.expectedCompletionDate) : new Date(ticket.dueDate);
    const dueDiff = differenceInDays(startOfDay(finalDate), startOfDay(new Date()));

    const getDueBadgeColor = () => {
        if (ticket.status === TicketStatus.COMPLETED) return 'bg-gradient-to-br from-slate-500 to-slate-600 shadow-slate-200';
        if (dueDiff <= 0) return 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-200'; // D-Day or Overdue
        if (dueDiff <= 2) return 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-200'; // Imminent
        if (dueDiff <= 5) return 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-200'; // Approaching
        return 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-slate-200'; // Safe
    };

    const getDueBadgeText = () => {
        if (ticket.status === TicketStatus.COMPLETED) return '완료';
        if (dueDiff === 0) return 'D-Day';
        return dueDiff > 0 ? `D-${dueDiff}` : `D+${Math.abs(dueDiff)}`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono font-black text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded-md shrink-0">{ticket.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusBadge(ticket.status)}`}>
                            {ticket.status}
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 break-words leading-tight">{ticket.title}</h1>
                </div>
                <div className="flex flex-col items-end gap-0 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm w-full sm:w-auto min-w-[120px] relative overflow-visible">
                        <div className={`absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg border-4 border-slate-50 z-10 ${getDueBadgeColor()}`}>
                            {getDueBadgeText()}
                        </div>
                        <div className="flex flex-col justify-center h-full pr-2">
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-0.5">최종 마감기한</p>
                            <p className={`text-lg font-black ${isDelayed ? 'text-rose-600' : 'text-slate-800'}`}>
                                {formatDate(finalDate.toISOString()).split(' ')[0]}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketHeader;
