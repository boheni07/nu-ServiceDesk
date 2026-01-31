import React from 'react';
import { Ticket } from '../../types';
import { format } from 'date-fns';
import { FileText, Paperclip } from 'lucide-react';

interface Props {
    ticket: Ticket;
}

const TicketRequestSection: React.FC<Props> = ({ ticket }) => {
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
        <div className="p-5 md:p-6 flex flex-col h-full gap-4">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider shrink-0">
                <div className="p-1 bg-blue-100 rounded text-blue-600"><FileText size={14} /></div> 요청 내용
            </h3>
            <div className="flex-1 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed break-words font-medium">
                {ticket.description}
            </div>
            {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="pt-4 border-t border-slate-100 shrink-0">
                    <div className="flex flex-wrap gap-2">
                        {ticket.attachments.map((f, i) => (
                            <button
                                key={i}
                                onClick={() => handleDownload(f)}
                                className="px-2.5 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-1.5 border border-slate-200/50 max-w-full hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                                <Paperclip size={12} className="shrink-0 text-slate-400" /> <span className="truncate">{f}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {ticket.shortenedDueReason && (
                <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 mb-2">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> 긴급/단축 요청 사유
                    </p>
                    <p className="text-xs font-bold text-rose-700 leading-relaxed">
                        "{ticket.shortenedDueReason}"
                    </p>
                </div>
            )}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center shrink-0 mt-auto">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">등록 처리기한</span>
                <span className="text-xs font-black text-slate-700">{format(new Date(ticket.originalDueDate || ticket.dueDate), 'yyyy-MM-dd')}</span>
            </div>
        </div>
    );
};

export default TicketRequestSection;
