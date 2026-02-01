import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    title: string;
    onClose: () => void;
    onConfirm: () => void;
    confirmText: string;
    confirmColor?: string;
    children: React.ReactNode;
    showConfirm?: boolean;
    disabledConfirm?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    title,
    onClose,
    onConfirm,
    confirmText,
    confirmColor = 'bg-blue-600',
    children,
    showConfirm = true,
    disabledConfirm = false
}) => (
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
                    {showConfirm ? '취소' : '닫기'}
                </button>
                {showConfirm && (
                    <button
                        disabled={disabledConfirm}
                        onClick={onConfirm}
                        className={`flex-[2] h-14 ${confirmColor} text-white font-bold rounded-2xl shadow-md transition-all active:scale-95 text-sm tracking-wide disabled:opacity-50 disabled:grayscale-[0.5] disabled:cursor-not-allowed disabled:active:scale-100`}
                    >
                        {confirmText}
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default Modal;
