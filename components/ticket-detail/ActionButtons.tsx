import React from 'react';
import { Ticket, TicketStatus, User, UserRole } from '../../types';
import { addBusinessDays } from '../../utils';
import { format } from 'date-fns';

interface Props {
    ticket: Ticket;
    currentUser: User;
    isDelayed: boolean;
    setPostponeDate: (date: string) => void;
    setShowPostponeModal: (show: boolean) => void;
    setShowCompleteModal: (show: boolean) => void;
    setShowRejectModal: (show: boolean) => void;
    handleApprovePostpone: () => void;
    setShowRejectCompleteModal: (show: boolean) => void;
    setShowFinalizeModal: (show: boolean) => void;
}

const ActionButtons: React.FC<Props> = ({
    ticket,
    currentUser,
    isDelayed,
    setPostponeDate,
    setShowPostponeModal,
    setShowCompleteModal,
    setShowRejectModal,
    handleApprovePostpone,
    setShowRejectCompleteModal,
    setShowFinalizeModal
}) => {
    return (
        <div className="flex flex-col sm:flex-row justify-center gap-3">
            {(currentUser.role === UserRole.SUPPORT || currentUser.role === UserRole.SUPPORT_LEAD || currentUser.role === UserRole.ADMIN) && (ticket.status === TicketStatus.IN_PROGRESS || ticket.status === TicketStatus.DELAYED) && (
                <>
                    <button disabled={isDelayed} onClick={() => {
                        setShowPostponeModal(true);
                    }} className={`px-6 py-3 rounded-xl font-black text-xs border transition-all active:scale-95 ${isDelayed ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300'}`}>
                        연기 요청
                    </button>
                    <button onClick={() => setShowCompleteModal(true)} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 transition-all active:scale-95">
                        완료 보고
                    </button>
                </>
            )}
            {((currentUser.role === UserRole.CUSTOMER || currentUser.role === UserRole.ADMIN) && (ticket.status === TicketStatus.POSTPONE_REQUESTED || (ticket.status === TicketStatus.DELAYED && ticket.postponeDate && ticket.postponeReason))) && (
                <>
                    <button onClick={() => setShowRejectModal(true)} className="px-6 py-3 bg-white border border-rose-200 text-rose-600 rounded-xl font-black text-xs hover:bg-rose-50 transition-all active:scale-95">
                        연기 거절
                    </button>
                    <button onClick={handleApprovePostpone} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all active:scale-95">
                        연기 승인
                    </button>
                </>
            )}
            {(currentUser.role === UserRole.CUSTOMER || currentUser.role === UserRole.ADMIN) && ticket.status === TicketStatus.COMPLETION_REQUESTED && (
                <>
                    <button onClick={() => setShowRejectCompleteModal(true)} className="px-6 py-3 bg-white border border-rose-200 text-rose-600 rounded-xl font-black text-xs hover:bg-rose-50 transition-all active:scale-95">
                        보완 요청
                    </button>
                    <button onClick={() => setShowFinalizeModal(true)} className="px-10 py-3.5 bg-blue-600 text-white rounded-xl font-black text-xs hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all active:scale-95">
                        최종 승인
                    </button>
                </>
            )}
        </div>
    );
};

export default ActionButtons;
