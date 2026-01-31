
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ticket, TicketStatus, User, Project, HistoryEntry, Comment, UserRole } from '../types';
import { formatDate, addBusinessDays } from '../utils';
import { format, isAfter, startOfDay, differenceInDays } from 'date-fns';
import {
  FileText,
  Send,
  Paperclip,
  History,
  Info,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Briefcase,
  X,
  Shield,
  CalendarDays,
  AlertTriangle,
  PlayCircle,
  CheckCircle,
  RotateCcw,
  ArrowRight
} from 'lucide-react';

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
  const commentFileInputRef = useRef<HTMLInputElement>(null);
  const planFileInputRef = useRef<HTMLInputElement>(null);

  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showRejectCompleteModal, setShowRejectCompleteModal] = useState(false);

  const [postponeDate, setPostponeDate] = useState('');
  const [postponeReason, setPostponeReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [satisfaction, setSatisfaction] = useState(5);
  const [completionFeedback, setCompletionFeedback] = useState('');

  useEffect(() => {
    if (showPostponeModal) {
      // Use saved expectedCompletionDate if available, otherwise dueDate
      const lastDueDate = ticket.expectedCompletionDate || ticket.dueDate;
      const baseDate = new Date(lastDueDate);
      const nextBizDay = addBusinessDays(baseDate, 1);
      setPostponeDate(format(nextBizDay, 'yyyy-MM-dd'));
    }
  }, [showPostponeModal, ticket.expectedCompletionDate, ticket.dueDate]);

  useEffect(() => {
    const isSupportUser = currentUser.role === UserRole.SUPPORT || currentUser.role === UserRole.ADMIN;
    const isPartOfProjectTeam = project.supportStaffIds.includes(currentUser.id) || currentUser.role === UserRole.ADMIN;

    if (isSupportUser && isPartOfProjectTeam && ticket.status === TicketStatus.WAITING) {
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
      dueDate: new Date(expectedCompletionDate).toISOString(), // Plan updates Final Deadline
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
    const note = `[연기 승인] 마감 기한이 ${newDateStr}(으)로 연장되었습니다.`;
    onStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS, {
      dueDate: ticket.postponeDate,
      postponeDate: undefined,
      postponeReason: undefined
    }, note);
  };

  const handleRejectPostpone = () => {
    if (!rejectReason) return;
    const note = `[연기 거절] 사유: ${rejectReason}`;
    onStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS, {
      postponeDate: undefined,
      postponeReason: undefined
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
    onStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS, {}, note);
    setShowRejectCompleteModal(false);
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Main Column */}
      <div className="lg:col-span-8 space-y-6 sm:space-y-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-10 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-xs font-mono font-black text-blue-600 bg-blue-100/50 px-2.5 py-1 rounded-lg shrink-0">{ticket.id}</span>
                <span className={`px-3 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider ${getStatusBadge(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 break-words leading-tight">{ticket.title}</h1>
            </div>
            <div className="flex flex-col items-end gap-0 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto min-w-[150px] relative overflow-visible">
                <div className={`absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-lg border-4 border-slate-50 z-10 
                  ${(() => {
                    const diff = differenceInDays(startOfDay(new Date(ticket.dueDate)), startOfDay(new Date()));
                    if (diff <= 0) return 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-200'; // D-Day or Overdue (Red)
                    if (diff <= 2) return 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-200'; // imminent (Orange)
                    if (diff <= 5) return 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-200'; // Approaching (Blue)
                    return 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-slate-200'; // Safe (Slate)
                  })()}`}>
                  {(() => {
                    const diff = differenceInDays(startOfDay(new Date(ticket.dueDate)), startOfDay(new Date()));
                    if (diff === 0) return 'D-Day';
                    return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
                  })()}
                </div>
                <div className="flex flex-col justify-center h-full pr-2">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">최종 마감기한</p>
                  <p className={`text-xl font-black ${isDelayed ? 'text-rose-600' : 'text-slate-800'}`}>
                    {formatDate(ticket.dueDate).split(' ')[0]}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="p-5 sm:p-6 space-y-6">
              <section>
                <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2.5 uppercase tracking-wider">
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600"><FileText size={16} /></div> 요청 내용
                </h3>
                <div className="text-sm sm:text-base text-slate-600 whitespace-pre-wrap leading-relaxed break-words font-medium">
                  {ticket.description}
                </div>
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-slate-50">

                    <div className="flex flex-wrap gap-2">
                      {ticket.attachments.map((f, i) => (
                        <span key={i} className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 border border-slate-200/50 max-w-full">
                          <Paperclip size={14} className="shrink-0 text-slate-400" /> <span className="truncate">{f}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">등록 처리기한</span>
                  <span className="text-sm font-black text-slate-700">{format(new Date(ticket.originalDueDate || ticket.dueDate), 'yyyy-MM-dd')}</span>
                </div>
              </section>
            </div>

            <div className="p-5 sm:p-6 bg-slate-50/30">
              <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2.5 uppercase tracking-wider">
                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600"><CheckCircle2 size={16} /></div> 처리 계획
              </h3>
              {ticket.plan ? (
                <div className="space-y-6">
                  <div className="text-sm sm:text-base text-slate-600 whitespace-pre-wrap leading-relaxed break-words font-medium italic p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    "{ticket.plan}"
                  </div>
                  {ticket.planAttachments && ticket.planAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {ticket.planAttachments.map((f, i) => (
                        <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">계획 처리기한</span>
                      <span className="text-sm font-black text-blue-600">{format(new Date(ticket.expectedCompletionDate!), 'yyyy-MM-dd')}</span>
                    </div>
                  </div>
                </div>
              ) : currentUser.role === UserRole.SUPPORT ? (
                <div className="space-y-6">
                  <textarea className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none text-sm resize-none bg-white focus:ring-4 focus:ring-blue-500/10" placeholder="처리 방법과 일정을 등록하세요." rows={5} value={planText} onChange={(e) => setPlanText(e.target.value)} />
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">계획 처리기한</label>
                      <input type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-sm font-bold bg-slate-50" value={expectedCompletionDate} onChange={(e) => setExpectedCompletionDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">계획 첨부파일 (선택)</label>
                      <button onClick={() => planFileInputRef.current?.click()} className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                        <span className="flex items-center gap-2"><Paperclip size={14} /> {planFiles.length > 0 ? `${planFiles.length}개 파일 선택됨` : '문서, 엑셀, 이미지 등'}</span>
                        <input type="file" multiple accept={ALLOWED_EXTENSIONS} className="hidden" ref={planFileInputRef} onChange={(e) => e.target.files && setPlanFiles(Array.from(e.target.files))} />
                      </button>
                    </div>
                  </div>
                  <button onClick={handleRegisterPlan} className="w-full py-4 bg-blue-600 text-white text-sm font-black rounded-2xl hover:bg-blue-700 shadow-xl transition-all">계획 등록</button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-300"><Info size={40} /><p className="mt-3 text-xs font-bold italic">담당자의 계획 등록을 기다리는 중입니다.</p></div>
              )}
            </div>
          </div>

          <div className="p-6 bg-slate-900 border-t border-slate-800">
            {ticket.status === TicketStatus.POSTPONE_REQUESTED && (
              <div className="mb-6 animate-in slide-in-from-top-4 duration-500">
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="shrink-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-500 rounded-lg text-white"><CalendarDays size={14} /></div>
                      <span className="text-xs font-black text-orange-600 uppercase tracking-tight">연기 요청</span>
                    </div>
                    <div className="flex items-center gap-2 pl-1">
                      <span className="text-[11px] text-slate-400 line-through decoration-slate-400/50">{formatDate(ticket.expectedCompletionDate || ticket.dueDate).split(' ')[0]}</span>
                      <ArrowRight size={12} className="text-slate-300" />
                      <span className="text-sm font-black text-orange-500">{ticket.postponeDate ? formatDate(ticket.postponeDate).split(' ')[0] : '-'}</span>
                    </div>
                  </div>
                  <div className="flex-1 w-full bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <span className="text-orange-500/70 font-bold mr-2 uppercase text-[10px]">Reason</span>
                    {ticket.postponeReason}
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {currentUser.role === UserRole.SUPPORT && ticket.status === TicketStatus.IN_PROGRESS && (
                <><button disabled={isDelayed} onClick={() => {
                  const nextDay = addBusinessDays(new Date(ticket.dueDate), 1);
                  setPostponeDate(format(nextDay, 'yyyy-MM-dd'));
                  setShowPostponeModal(true);
                }} className={`px-8 py-3.5 rounded-2xl font-black text-sm border ${isDelayed ? 'bg-slate-800 text-slate-600' : 'bg-slate-800 text-orange-400 hover:bg-slate-700'}`}>연기 요청</button><button onClick={() => setShowCompleteModal(true)} className="px-10 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-900/40">완료 보고</button></>
              )}
              {currentUser.role === UserRole.CUSTOMER && ticket.status === TicketStatus.POSTPONE_REQUESTED && (
                <><button onClick={() => setShowRejectModal(true)} className="px-8 py-3.5 bg-slate-800 text-rose-400 rounded-2xl font-black text-sm hover:bg-slate-700">연기 거절</button><button onClick={handleApprovePostpone} className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-900/40">연기 승인</button></>
              )}
              {currentUser.role === UserRole.CUSTOMER && ticket.status === TicketStatus.COMPLETION_REQUESTED && (
                <><button onClick={() => setShowRejectCompleteModal(true)} className="px-8 py-3.5 bg-slate-800 text-rose-400 rounded-2xl font-black text-sm hover:bg-slate-700">보완 요청</button><button onClick={() => setShowFinalizeModal(true)} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-900/40">최종 승인</button></>
              )}
            </div>
          </div>
        </div>

        {/* Chat/Comment Section */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-5 sm:p-6 overflow-hidden">
          <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-3"><div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg"><MessageSquare size={20} /></div> 의견 나누기</h3>
          <div className="mb-6">
            <div className="relative border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all bg-slate-50 shadow-inner">
              <textarea className="w-full px-5 py-4 outline-none text-sm resize-none min-h-[100px] bg-transparent leading-relaxed" placeholder="추가 의견이나 자료를 공유하세요..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
              {commentFiles.length > 0 && (
                <div className="px-5 py-2 flex flex-wrap gap-2">
                  {commentFiles.map((f, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 text-[10px] font-bold text-slate-600 rounded-lg">
                      <span className="truncate max-w-[100px]">{f.name}</span>
                      <X size={12} className="cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setCommentFiles(prev => prev.filter((_, idx) => idx !== i))} />
                    </span>
                  ))}
                </div>
              )}
              <div className="p-3 bg-white border-t border-slate-100 flex justify-between items-center">
                <button onClick={() => commentFileInputRef.current?.click()} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors flex items-center gap-2">
                  <Paperclip size={20} /> <span className="text-[10px] font-black uppercase text-slate-400 hidden sm:inline">Attach</span>
                  <input type="file" multiple accept={ALLOWED_EXTENSIONS} className="hidden" ref={commentFileInputRef} onChange={(e) => e.target.files && setCommentFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
                </button>
                <button onClick={handleAddComment} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-blue-700 shadow-lg active:scale-95 transition-all"><Send size={16} /> 전송</button>
              </div>
            </div>
          </div>
          <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.map((c) => {
              const isMine = c.authorId === currentUser.id;
              return (
                <div key={c.id} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-top-4`}>
                  <div className={`flex items-end gap-3 max-w-[90%] sm:max-w-[80%] ${isMine ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                    <div className="shrink-0 flex flex-col gap-1 pb-1">
                      <span className="text-[11px] font-black text-slate-900">{c.authorName}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{formatDate(c.timestamp)}</span>
                    </div>
                    <div className={`px-5 py-3.5 rounded-2xl text-sm font-medium leading-relaxed border shadow-sm break-words ${isMine ? 'bg-blue-600 border-blue-500 text-white rounded-br-none' : 'bg-white border-slate-200 text-slate-700 rounded-tl-none'}`}>
                      {c.content}
                      {c.attachments && c.attachments.length > 0 && (
                        <div className={`mt-3 pt-3 border-t ${isMine ? 'border-white/20' : 'border-slate-100'} flex flex-wrap gap-2`}>
                          {c.attachments.map((f, i) => (
                            <span key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold ${isMine ? 'bg-white/10 text-white border border-white/20' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                              <Paperclip size={10} /> {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div >

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 space-y-6">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2.5"><Briefcase size={14} className="text-blue-500" /> Project Detail</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Name</p>
                <p className="text-lg font-black text-slate-900 leading-tight">{project.name}</p>
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

        <div className="bg-slate-900 rounded-[2rem] shadow-2xl p-6 text-slate-100 overflow-hidden relative border border-slate-800">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3"><History size={16} className="text-blue-400" /> Activity History</h3>
          <div className="space-y-3">
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


      {
        showPostponeModal && (
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
        )
      }

      {
        showFinalizeModal && (
          <Modal title="최종 완료 승인" onClose={() => setShowFinalizeModal(false)} onConfirm={handleFinalizeTicket} confirmText="승인 및 티켓 종료">
            <div className="space-y-10 py-4 text-center">
              <div className="space-y-6"><div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-100"><CheckCircle size={40} /></div><div><h4 className="text-xl font-black text-slate-900 mb-2">지원이 만족스러우셨나요?</h4><p className="text-sm font-medium text-slate-500">고객님의 승인으로 본 티켓이 공식 종료됩니다.</p></div>
                <div className="flex justify-center gap-3">{[1, 2, 3, 4, 5].map(star => (<button key={star} onClick={() => setSatisfaction(star)} className="transition-all active:scale-90 hover:scale-110"><Star size={48} fill={star <= satisfaction ? '#eab308' : 'none'} className={star <= satisfaction ? 'text-yellow-500' : 'text-slate-200'} strokeWidth={1.5} /></button>))}</div>
              </div>
              <textarea className="w-full px-6 py-5 border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 outline-none text-sm bg-slate-50 resize-none font-medium shadow-inner" rows={3} placeholder="지원팀에게 전달할 메시지 (선택)" value={completionFeedback} onChange={(e) => setCompletionFeedback(e.target.value)} />
            </div>
          </Modal>
        )
      }

      {
        showRejectModal && (
          <Modal title="연기 요청 거절" onClose={() => setShowRejectModal(false)} onConfirm={handleRejectPostpone} confirmText="거절 처리" confirmColor="bg-rose-600">
            <div className="space-y-4"><p className="text-sm font-bold text-slate-600 text-center mb-4">지원팀의 연기 요청을 거절하는 이유를 입력해 주세요.</p><textarea required className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none text-sm font-medium resize-none shadow-sm" rows={4} placeholder="거절 사유..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} /></div>
          </Modal>
        )
      }

      {
        showRejectCompleteModal && (
          <Modal title="보완 요청" onClose={() => setShowRejectCompleteModal(false)} onConfirm={handleRejectCompletion} confirmText="보완 요청 전송" confirmColor="bg-rose-600">
            <div className="space-y-4"><p className="text-sm font-bold text-slate-600 text-center mb-4">보완이 필요한 사항이나 재작업이 필요한 이유를 입력해 주세요.</p><textarea required className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none text-sm font-medium resize-none shadow-sm" rows={5} placeholder="미흡 사항 기록..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} /></div>
          </Modal>
        )
      }

      {
        showCompleteModal && (
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
        )
      }
    </div>
  );
};

const Modal: React.FC<{ title: string; onClose: () => void; onConfirm: () => void; confirmText: string; confirmColor?: string; children: React.ReactNode; }> = ({ title, onClose, onConfirm, confirmText, confirmColor = 'bg-blue-600', children }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[500px] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-100">
      <div className="px-8 pt-8 pb-6 flex justify-between items-center shrink-0">
        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full" /> {title}
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <X size={24} />
        </button>
      </div>
      <div className="px-8 py-2 overflow-y-auto custom-scrollbar flex-1">
        {children}
      </div>
      <div className="px-8 pb-8 pt-6 flex gap-3 shrink-0">
        <button onClick={onClose} className="flex-1 h-14 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all text-sm border border-slate-200">
          취소
        </button>
        <button onClick={onConfirm} className={`flex-[2] h-14 ${confirmColor} text-white font-bold rounded-2xl shadow-md transition-all active:scale-95 text-sm tracking-wide`}>
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

export default TicketDetail;
