import React, { useState, useMemo, useEffect } from 'react';
import { Ticket, TicketStatus, User, Project, HistoryEntry, Comment, UserRole } from '../types';
import { addBusinessDays } from '../utils';
import { format, isAfter, startOfDay } from 'date-fns';
import {
  CalendarDays,
  CheckCircle,
  CheckCircle2
} from 'lucide-react';
import { Star } from 'lucide-react';

import Modal from './Modal';
import TicketHeader from './ticket-detail/TicketHeader';
import TicketRequestSection from './ticket-detail/TicketRequestSection';
import TicketPlanSection from './ticket-detail/TicketPlanSection';
import TicketContextBanner from './ticket-detail/TicketContextBanner';
import TicketDiscussionSection from './ticket-detail/TicketDiscussionSection';
import TicketSidebar from './ticket-detail/TicketSidebar';
import ActionButtons from './ticket-detail/ActionButtons';

interface Props {
  ticket: Ticket;
  project: Project;
  users: User[];
  history: HistoryEntry[];
  comments: Comment[];
  currentUser: User;
  onStatusUpdate: (ticketId: string, status: TicketStatus, updates?: Partial<Ticket>, note?: string) => void;
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onBack: () => void;
}

const ALLOWED_EXTENSIONS = ".pdf,.doc,.docx,.xlsx,.xls,.pptx,.ppt,.png,.jpg,.jpeg,.gif,.webp,.hwp,.txt";

const TicketDetail: React.FC<Props> = ({
  ticket,
  project,
  users,
  history,
  comments,
  currentUser,
  onStatusUpdate,
  onAddComment,
  onBack
}) => {
  const [planText, setPlanText] = useState('');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(format(new Date(ticket.dueDate), 'yyyy-MM-dd'));
  const [delayReason, setDelayReason] = useState('');
  const [planFiles, setPlanFiles] = useState<File[]>([]);

  const [commentText, setCommentText] = useState('');
  const [commentFiles, setCommentFiles] = useState<File[]>([]);

  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showRejectCompleteModal, setShowRejectCompleteModal] = useState(false);

  const [postponeDate, setPostponeDate] = useState('');
  const [postponeReason, setPostponeReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [satisfaction, setSatisfaction] = useState(3);
  const [completionFeedback, setCompletionFeedback] = useState('');

  useEffect(() => {
    if (showPostponeModal) {
      const lastDueDate = ticket.expectedCompletionDate || ticket.dueDate;
      const baseDate = new Date(lastDueDate);
      const nextBizDay = addBusinessDays(baseDate, 1);
      setPostponeDate(format(nextBizDay, 'yyyy-MM-dd'));
    }
  }, [showPostponeModal, ticket.expectedCompletionDate, ticket.dueDate]);

  // Use a ref to prevent double-firing in StrictMode or re-renders
  const hasUpdatedStatus = React.useRef(false);

  useEffect(() => {
    // Reset ref when ticket changes
    hasUpdatedStatus.current = false;
  }, [ticket.id]);

  useEffect(() => {
    const isSupportUser = currentUser.role === UserRole.SUPPORT || currentUser.role === UserRole.SUPPORT_LEAD || currentUser.role === UserRole.ADMIN;
    const isPartOfProjectTeam = project.supportStaffIds.includes(currentUser.id) || currentUser.role === UserRole.ADMIN;

    if (
      !hasUpdatedStatus.current &&
      isSupportUser &&
      isPartOfProjectTeam &&
      ticket.status === TicketStatus.WAITING
    ) {
      hasUpdatedStatus.current = true;
      onStatusUpdate(
        ticket.id,
        TicketStatus.RECEIVED,
        {},
        `지원팀 티켓 접수 및 검토 시작`
      );
    }
  }, [ticket.id, ticket.status, currentUser.id, project.supportStaffIds, onStatusUpdate]);

  const isDelayed = ticket.status === TicketStatus.DELAYED;

  const isCompletionDelayed = useMemo(() => {
    const expected = startOfDay(new Date(expectedCompletionDate));
    const originalDue = startOfDay(new Date(ticket.dueDate));
    return isAfter(expected, originalDue);
  }, [expectedCompletionDate, ticket.dueDate]);

  const supportStaff = useMemo(() => {
    return project.supportStaffIds.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];
  }, [project.supportStaffIds, users]);

  const handleRegisterPlan = () => {
    if (!planText) { alert('처리 계획을 입력해주세요.'); return; }
    // Date Validation
    const selectedDate = new Date(expectedCompletionDate);
    const maxDate = addBusinessDays(new Date(ticket.dueDate), 3);
    const minDate = startOfDay(new Date(ticket.createdAt));
    if (isAfter(selectedDate, maxDate)) {
      alert('계획시 처리기한은 요청시 처리기한(등록된 기한)보다 3근무일을 초과할 수 없습니다.');
      return;
    }
    if (selectedDate < minDate) {
      alert('처리 기한은 등록일보다 이전일 수 없습니다.');
      return;
    }

    const fileListStr = planFiles.length > 0 ? ` (첨부파일: ${planFiles.map(f => f.name).join(', ')})` : '';
    const note = `처리 계획 등록: ${planText} (최종 처리기한: ${format(new Date(expectedCompletionDate), 'yyyy-MM-dd')})${fileListStr}`;
    onStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS, {
      plan: planText,
      expectedCompletionDate: new Date(expectedCompletionDate).toISOString(),
      dueDate: new Date(expectedCompletionDate).toISOString(),
      expectedCompletionDelayReason: isCompletionDelayed ? delayReason : undefined,
      planAttachments: planFiles.map(f => f.name)
    }, note);
    setPlanFiles([]);
  };

  const handleAddComment = () => {
    if (!commentText.trim() && commentFiles.length === 0) return;
    onAddComment({
      ticketId: ticket.id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      content: commentText,
      attachments: commentFiles.map(f => f.name)
    });
    setCommentText('');
    setCommentFiles([]);
  };

  const handlePostponeRequest = () => {
    if (!postponeDate || !postponeReason) { alert('연기 희망일과 사유를 모두 입력해주세요.'); return; }
    const originalDateStr = format(new Date(ticket.dueDate), 'yyyy-MM-dd');
    const note = `[기한 연기 요청]\n당초 기한: ${originalDateStr}\n요청 기한: ${postponeDate}\n요청 사유: ${postponeReason}`;
    onStatusUpdate(ticket.id, TicketStatus.POSTPONE_REQUESTED, {
      postponeDate: new Date(postponeDate).toISOString(),
      postponeReason
    }, note);
    setShowPostponeModal(false);
  };

  const handleApprovePostpone = () => {
    const newDateStr = ticket.postponeDate ? format(new Date(ticket.postponeDate), 'yyyy-MM-dd') : '알 수 없음';
    const note = `[연기 승인] 고객이 연기 요청을 승인하여 마감 기한이 ${newDateStr}(으)로 변경되었습니다.`;
    onStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS, {
      dueDate: ticket.postponeDate,
      expectedCompletionDate: ticket.postponeDate,
      postponeDate: undefined,
      postponeReason: undefined,
      rejectionReason: undefined
    }, note);
  };

  const handleRejectPostpone = () => {
    if (!rejectReason) return;
    const note = `[연기 거절] 사유: ${rejectReason}`;
    onStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS, {
      postponeDate: undefined,
      postponeReason: undefined,
      rejectionReason: rejectReason
    }, note);
    setShowRejectModal(false);
  };

  const handleCompleteRequest = () => {
    const note = `[완료 보고] 모든 지원 작업이 완료되어 고객 검토를 요청했습니다.`;
    onStatusUpdate(ticket.id, TicketStatus.COMPLETION_REQUESTED, {}, note);
    setShowCompleteModal(false);
  };

  const handleFinalizeTicket = () => {
    const note = `[최종 승인] 서비스 만족도: ${satisfaction}점\n피드백: ${completionFeedback || '없음'}`;
    onStatusUpdate(ticket.id, TicketStatus.COMPLETED, { satisfaction, completionFeedback }, note);
    setShowFinalizeModal(false);
  };

  const handleRejectCompletion = () => {
    if (!rejectReason) return;
    const note = `[완료 거절/재작업 요청] 사유: ${rejectReason}`;
    onStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS, { rejectionReason: rejectReason }, note);
    setShowRejectCompleteModal(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-8 space-y-5 sm:space-y-6">
        <TicketHeader ticket={ticket} />

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <TicketRequestSection ticket={ticket} />
          <TicketPlanSection
            ticket={ticket}
            currentUser={currentUser}
            planText={planText}
            setPlanText={setPlanText}
            expectedCompletionDate={expectedCompletionDate}
            setExpectedCompletionDate={setExpectedCompletionDate}
            planFiles={planFiles}
            setPlanFiles={setPlanFiles}
            onRegisterPlan={handleRegisterPlan}
            allowedExtensions={ALLOWED_EXTENSIONS}
          />
        </div>

        <div className="bg-slate-50 border-t border-slate-200 p-5 sm:p-6 rounded-2xl">
          <TicketContextBanner ticket={ticket} history={history} />
          <ActionButtons
            ticket={ticket}
            currentUser={currentUser}
            isDelayed={isDelayed}
            setPostponeDate={setPostponeDate}
            setShowPostponeModal={setShowPostponeModal}
            setShowCompleteModal={setShowCompleteModal}
            setShowRejectModal={setShowRejectModal}
            handleApprovePostpone={handleApprovePostpone}
            setShowRejectCompleteModal={setShowRejectCompleteModal}
            setShowFinalizeModal={setShowFinalizeModal}
          />
        </div>

        <TicketDiscussionSection
          comments={comments}
          currentUser={currentUser}
          commentText={commentText}
          setCommentText={setCommentText}
          commentFiles={commentFiles}
          setCommentFiles={setCommentFiles}
          onAddComment={handleAddComment}
          allowedExtensions={ALLOWED_EXTENSIONS}
        />
      </div>

      <TicketSidebar
        project={project}
        users={users}
        supportStaff={supportStaff}
        history={history}
      />

      {/* Modals */}
      {showPostponeModal && (
        <Modal title="기한 연기 요청" onClose={() => setShowPostponeModal(false)} onConfirm={handlePostponeRequest} confirmText="연기 요청 전송" confirmColor="bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30">
          <div className="space-y-6">
            <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100 flex gap-4 items-start">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-500 shrink-0"><CalendarDays size={20} /></div>
              <div>
                <p className="text-xs font-black text-orange-800 uppercase tracking-widest mb-1">안내사항</p>
                <p className="text-xs text-orange-600 font-medium leading-relaxed">마감 기한 연기는 고객의 승인이 필요합니다. 상세 사유를 입력해주세요.</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">연기 희망일</label>
              <input type="date" min={format(addBusinessDays(new Date(ticket.dueDate), 1), 'yyyy-MM-dd')} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:border-orange-500 transition-colors" value={postponeDate} onChange={(e) => setPostponeDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">구체적 연기 사유</label>
              <textarea className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm resize-none focus:bg-white focus:border-orange-500 transition-colors" rows={4} placeholder="지연 원인과 향후 일정을 상세히 입력하세요." value={postponeReason} onChange={(e) => setPostponeReason(e.target.value)} />
            </div>
          </div>
        </Modal>
      )}

      {showFinalizeModal && (
        <Modal title="최종 완료 승인" onClose={() => setShowFinalizeModal(false)} onConfirm={handleFinalizeTicket} confirmText="승인 및 티켓 종료">
          <div className="space-y-10 py-4 text-center">
            <div className="space-y-6"><div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-100"><CheckCircle size={40} /></div><div><h4 className="text-xl font-black text-slate-900 mb-2">지원이 만족스러우셨나요?</h4><p className="text-sm font-medium text-slate-500">고객님의 승인으로 본 티켓이 공식 종료됩니다.</p></div>
              <div className="flex justify-center gap-3">{[1, 2, 3, 4, 5].map(star => (<button key={star} onClick={() => setSatisfaction(star)} className="transition-all active:scale-90 hover:scale-110"><Star size={48} fill={star <= satisfaction ? '#eab308' : 'none'} className={star <= satisfaction ? 'text-yellow-500' : 'text-slate-200'} strokeWidth={1.5} /></button>))}</div>
            </div>
            <textarea className="w-full px-6 py-5 border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 outline-none text-sm bg-slate-50 resize-none font-medium shadow-inner" rows={3} placeholder="지원팀에게 전달할 메시지 (선택)" value={completionFeedback} onChange={(e) => setCompletionFeedback(e.target.value)} />
          </div>
        </Modal>
      )}

      {showRejectModal && (
        <Modal title="연기 요청 거절" onClose={() => setShowRejectModal(false)} onConfirm={handleRejectPostpone} confirmText="거절 처리" confirmColor="bg-rose-600">
          <div className="space-y-4"><p className="text-sm font-bold text-slate-600 text-center mb-4">지원팀의 연기 요청을 거절하는 이유를 입력해 주세요.</p><textarea required className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none text-sm font-medium resize-none shadow-sm" rows={4} placeholder="거절 사유..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} /></div>
        </Modal>
      )}

      {showRejectCompleteModal && (
        <Modal title="보완 요청" onClose={() => setShowRejectCompleteModal(false)} onConfirm={handleRejectCompletion} confirmText="보완 요청 전송" confirmColor="bg-rose-600">
          <div className="space-y-4"><p className="text-sm font-bold text-slate-600 text-center mb-4">보완이 필요한 사항이나 재작업이 필요한 이유를 입력해 주세요.</p><textarea required className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none text-sm font-medium resize-none shadow-sm" rows={5} placeholder="미흡 사항 기록..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} /></div>
        </Modal>
      )}

      {showCompleteModal && (
        <Modal title="완료 보고 요청" onClose={() => setShowCompleteModal(false)} onConfirm={handleCompleteRequest} confirmText="완료 보고 전송" confirmColor="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30">
          <div className="text-center space-y-8 py-6">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black text-slate-800">모든 작업이 완료되었나요?</h4>
              <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-xs mx-auto">
                고객에게 완료 보고를 전송합니다.<br />고객이 최종 승인하면 티켓이 종료됩니다.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TicketDetail;
