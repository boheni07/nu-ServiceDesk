import React, { useRef } from 'react';
import { Comment, User } from '../../types';
import { formatDate } from '../../utils';
import { MessageSquare, Paperclip, X, Send } from 'lucide-react';

interface Props {
    comments: Comment[];
    currentUser: User;
    commentText: string;
    setCommentText: (text: string) => void;
    commentFiles: File[];
    setCommentFiles: (files: File[]) => void;
    onAddComment: () => void;
    allowedExtensions: string;
}

const TicketDiscussionSection: React.FC<Props> = ({
    comments,
    currentUser,
    commentText,
    setCommentText,
    commentFiles,
    setCommentFiles,
    onAddComment,
    allowedExtensions
}) => {
    const commentFileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setCommentFiles([...commentFiles, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index: number) => {
        setCommentFiles(commentFiles.filter((_, i) => i !== index));
    };

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
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-5 sm:p-6 overflow-hidden">
            <h3 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
                <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-md"><MessageSquare size={16} /></div> 의견 나누기
            </h3>
            <div className="mb-6">
                <div className="relative border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all bg-slate-50 shadow-inner">
                    <textarea className="w-full px-5 py-4 outline-none text-sm resize-none min-h-[100px] bg-transparent leading-relaxed" placeholder="추가 의견이나 자료를 공유하세요..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                    {commentFiles.length > 0 && (
                        <div className="px-5 py-2 flex flex-wrap gap-2">
                            {commentFiles.map((f, i) => (
                                <span key={i} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 text-[10px] font-bold text-slate-600 rounded-lg">
                                    <span className="truncate max-w-[100px]">{f.name}</span>
                                    <X size={12} className="cursor-pointer text-slate-400 hover:text-red-500" onClick={() => removeFile(i)} />
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="p-3 bg-white border-t border-slate-100 flex justify-between items-center">
                        <button onClick={() => commentFileInputRef.current?.click()} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors flex items-center gap-2">
                            <Paperclip size={20} /> <span className="text-[10px] font-black uppercase text-slate-400 hidden sm:inline">Attach</span>
                            <input type="file" multiple accept={allowedExtensions} className="hidden" ref={commentFileInputRef} onChange={handleFileChange} />
                        </button>
                        <button onClick={onAddComment} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-blue-700 shadow-lg active:scale-95 transition-all">
                            <Send size={16} /> 전송
                        </button>
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
                                                <button
                                                    key={i}
                                                    onClick={() => handleDownload(f)}
                                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-opacity-80 transition-opacity ${isMine ? 'bg-white/10 text-white border border-white/20' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
                                                >
                                                    <Paperclip size={10} /> {f}
                                                </button>
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
    );
};

export default TicketDiscussionSection;
