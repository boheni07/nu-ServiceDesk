import React, { useRef } from 'react';
import { Ticket, User, UserRole } from '../../types';
import { format } from 'date-fns';
import { CheckCircle2, Paperclip, Info } from 'lucide-react';

interface Props {
    ticket: Ticket;
    currentUser: User;
    planText: string;
    setPlanText: (text: string) => void;
    expectedCompletionDate: string;
    setExpectedCompletionDate: (date: string) => void;
    planFiles: File[];
    setPlanFiles: (files: File[]) => void;
    onRegisterPlan: () => void;
    allowedExtensions: string;
}

const TicketPlanSection: React.FC<Props> = ({
    ticket,
    currentUser,
    planText,
    setPlanText,
    expectedCompletionDate,
    setExpectedCompletionDate,
    planFiles,
    setPlanFiles,
    onRegisterPlan,
    allowedExtensions
}) => {
    const planFileInputRef = useRef<HTMLInputElement>(null);

    const handleDownload = (fileName: string) => {
        const content = "This is a sample content for " + fileName;
        const blob = new Blob([content], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="p-5 md:p-6 bg-slate-50/50 flex flex-col h-full gap-4">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider shrink-0">
                <div className="p-1 bg-emerald-100 rounded text-emerald-600"><CheckCircle2 size={14} /></div> 처리 계획
            </h3>
            {ticket.plan ? (
                <>
                    <div className="flex-1 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed break-words font-medium italic p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                        "{ticket.plan}"
                    </div>
                    {ticket.planAttachments && ticket.planAttachments.length > 0 && (
                        <div className="pt-4 border-t border-slate-200/50 shrink-0">
                            <div className="flex flex-wrap gap-2">
                                {ticket.planAttachments.map((f, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleDownload(f)}
                                        className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 flex items-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer"
                                    >
                                        <Paperclip size={12} className="shrink-0" />
                                        <span className="truncate max-w-[150px]">{f}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center shrink-0 mt-auto">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">계획 처리기한</span>
                        <span className="text-xs font-black text-blue-600">{format(new Date(ticket.expectedCompletionDate!), 'yyyy-MM-dd')}</span>
                    </div>
                </>
            ) : (currentUser.role === UserRole.SUPPORT || currentUser.role === UserRole.SUPPORT_LEAD || currentUser.role === UserRole.ADMIN) ? (
                <div className="flex flex-col h-full gap-4">
                    <textarea className="flex-1 w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-sm resize-none bg-white focus:ring-4 focus:ring-blue-500/10 min-h-[100px]" placeholder="처리 방법과 일정을 등록하세요." rows={5} value={planText} onChange={(e) => setPlanText(e.target.value)} />
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm shrink-0">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">계획 처리기한</label>
                            <input type="date" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg outline-none text-sm font-bold bg-slate-50" value={expectedCompletionDate} onChange={(e) => setExpectedCompletionDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">계획 첨부파일 (선택)</label>
                            <button onClick={() => planFileInputRef.current?.click()} className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                                <span className="flex items-center gap-2"><Paperclip size={12} /> {planFiles.length > 0 ? `${planFiles.length}개 파일 선택됨` : '문서, 엑셀, 이미지 등'}</span>
                                <input type="file" multiple accept={allowedExtensions} className="hidden" ref={planFileInputRef} onChange={(e) => e.target.files && setPlanFiles(Array.from(e.target.files))} />
                            </button>
                        </div>
                    </div>
                    <button onClick={onRegisterPlan} className="w-full py-3 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 shadow-lg transition-all shrink-0">계획 등록</button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-300"><Info size={32} /><p className="mt-2 text-xs font-bold italic">계획 등록 대기 중</p></div>
            )}
        </div>
    );
};

export default TicketPlanSection;
