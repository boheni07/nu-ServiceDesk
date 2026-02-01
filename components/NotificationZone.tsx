import React from 'react';
import { Ticket, TicketStatus, Comment, User, Project, HistoryEntry } from '../types';
import { formatDistanceToNow, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    MessageSquare,
    ArrowRight,
    XCircle,
    Bell,
    Check
} from 'lucide-react';

interface NotificationZoneProps {
    tickets: Ticket[];
    comments: Comment[];
    currentUser: User;
    projects: Project[];
    history: HistoryEntry[];
    onSelectTicket: (id: string) => void;
}

const NotificationZone: React.FC<NotificationZoneProps> = ({
    tickets,
    comments,
    currentUser,
    projects,
    history,
    onSelectTicket
}) => {

    // --- Notification Types ---
    type NotificationType = 'POSTPONE_REQ' | 'COMPLETION_REQ' | 'REJECTED' | 'APPROVED_COMPLETION' | 'APPROVED_POSTPONE';

    interface NotificationItem {
        ticket: Ticket;
        type: NotificationType;
        timestamp: Date;
    }

    // --- Zone 1 Logic: Generate Notification Items ---
    const notifications: NotificationItem[] = tickets.reduce((acc, t) => {
        const threeDaysAgo = subDays(new Date(), 3);

        // 1. Requests (Active)
        if (t.status === TicketStatus.POSTPONE_REQUESTED) {
            acc.push({ ticket: t, type: 'POSTPONE_REQ', timestamp: new Date(t.updatedAt || t.createdAt) });
            return acc;
        }
        if (t.status === TicketStatus.COMPLETION_REQUESTED) {
            acc.push({ ticket: t, type: 'COMPLETION_REQ', timestamp: new Date(t.updatedAt || t.createdAt) });
            return acc;
        }

        // 2. Rejections (Active)
        // If it has a rejection reason and is NOT currently in a requested state (which would mean a re-request)
        if (t.rejectionReason && t.status === TicketStatus.IN_PROGRESS) {
            acc.push({ ticket: t, type: 'REJECTED', timestamp: new Date(t.updatedAt || t.createdAt) });
            return acc;
        }

        // 3. Approvals (Recent History)
        // We need to check history for recent relevant transitions
        const ticketHistory = history
            .filter(h => h.ticketId === t.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (ticketHistory.length === 0) {
            // Fallback for Completion if no history (e.g. initial load or migration)
            if (t.status === TicketStatus.COMPLETED) {
                const updated = new Date(t.updatedAt || t.createdAt);
                if (updated > threeDaysAgo) {
                    acc.push({ ticket: t, type: 'APPROVED_COMPLETION', timestamp: updated });
                }
            }
            return acc;
        }

        const latestEntry = ticketHistory[0];
        const latestDate = new Date(latestEntry.timestamp);

        // Only consider recent events
        if (latestDate < threeDaysAgo) return acc;

        // A. Approved Completion
        if (t.status === TicketStatus.COMPLETED && latestEntry.status === TicketStatus.COMPLETED) {
            acc.push({ ticket: t, type: 'APPROVED_COMPLETION', timestamp: latestDate });
            return acc;
        }

        // B. Approved Postpone
        // Current status is active (IN_PROGRESS, etc), NOT Postpone Requested, NO Rejection Reason
        // AND Previous status was POSTPONE_REQUESTED
        if (
            !t.rejectionReason &&
            t.status !== TicketStatus.POSTPONE_REQUESTED &&
            t.status !== TicketStatus.COMPLETED && // Approved Postpone keeps it active
            ticketHistory.length >= 2
        ) {
            const prevEntry = ticketHistory[1];
            if (prevEntry.status === TicketStatus.POSTPONE_REQUESTED) {
                acc.push({ ticket: t, type: 'APPROVED_POSTPONE', timestamp: latestDate });
                return acc;
            }
        }

        return acc;
    }, [] as NotificationItem[]).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());


    const getNotificationStyle = (type: NotificationType) => {
        switch (type) {
            case 'POSTPONE_REQ':
                return { label: '연기 요청', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' };
            case 'COMPLETION_REQ':
                return { label: '완료 요청', icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100' };
            case 'REJECTED':
                return { label: '반려', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100' };
            case 'APPROVED_COMPLETION':
                return { label: '승인(완료)', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' };
            case 'APPROVED_POSTPONE':
                return { label: '승인(연기)', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' };
            default:
                return { label: '알림', icon: Bell, color: 'text-slate-600', bg: 'bg-slate-100' };
        }
    };

    // --- Zone 2 Logic: Informational Items (Comments) ---
    const recentComments = comments
        .filter(c => c.authorId !== currentUser.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 4);

    if (notifications.length === 0 && recentComments.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            {/* Zone 1: Actionable Cards (50% width) */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Bell size={14} />
                    중요 알림 ({notifications.length})
                </h3>

                {notifications.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {notifications.map(({ ticket, type, timestamp }) => {
                            const style = getNotificationStyle(type);
                            const project = projects.find(p => p.id === ticket.projectId);

                            return (
                                <button
                                    key={`${ticket.id}-${type}`}
                                    onClick={() => onSelectTicket(ticket.id)}
                                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left group relative overflow-hidden h-full flex flex-col"
                                >
                                    <div className={`absolute top-0 right-0 p-1.5 rounded-bl-xl ${style.bg} ${style.color}`}>
                                        <style.icon size={12} />
                                    </div>

                                    <div className="mb-2">
                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${style.bg} ${style.color}`}>
                                            {style.label}
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-slate-800 text-xs mb-1 truncate group-hover:text-blue-600 transition-colors w-10/12">
                                        {ticket.title}
                                    </h4>

                                    <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50">
                                        <div className="text-[10px] text-slate-500 font-medium truncate max-w-[50%]">
                                            {project?.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                            {formatDistanceToNow(timestamp, { addSuffix: true, locale: ko })}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white/50 border border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400">
                        <CheckCircle2 size={24} className="mb-2 opacity-50" />
                        <p className="text-xs">확인할 중요 알림이 없습니다.</p>
                    </div>
                )}
            </div>

            {/* Zone 2: Informational Cards (50% width, Card Grid) */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare size={14} />
                    최근 소식
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentComments.length > 0 ? (
                        recentComments.map(comment => {
                            const ticket = tickets.find(t => t.id === comment.ticketId);
                            if (!ticket) return null;

                            return (
                                <button
                                    key={comment.id}
                                    onClick={() => onSelectTicket(ticket.id)}
                                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left group flex flex-col h-full"
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 border border-slate-200">
                                            {comment.authorName[0]}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-bold text-slate-700 truncate">{comment.authorName}</p>
                                            <p className="text-[9px] text-slate-400">
                                                {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true, locale: ko })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex-1 mb-1.5">
                                        <p className="text-[11px] text-slate-600 line-clamp-2 group-hover:text-blue-600 transition-colors leading-relaxed">
                                            {comment.content}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-1.5 border-t border-slate-50">
                                        <p className="text-[9px] text-slate-400 truncate font-medium flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                            {ticket.title}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="col-span-1 sm:col-span-2 bg-white/50 border border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400">
                            <MessageSquare size={24} className="mb-2 opacity-50" />
                            <p className="text-xs">새로운 소식이 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationZone;
