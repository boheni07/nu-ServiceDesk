import React from 'react';
import Modal from './Modal';
import { CheckCircle } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

const SuccessModal: React.FC<Props> = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <Modal
            title={title}
            onClose={onClose}
            onConfirm={onClose}
            confirmText="확인"
            showConfirm={false} // Use Close button as the primary action
        >
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2 shadow-sm animate-in zoom-in duration-300">
                    <CheckCircle size={40} strokeWidth={3} />
                </div>
                <h4 className="text-xl font-black text-slate-800">{title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed whitespace-pre-wrap">
                    {message}
                </p>
                <p className="text-xs text-slate-400 pt-4 font-bold uppercase tracking-widest">
                    성공적으로 처리되었습니다
                </p>
            </div>
        </Modal>
    );
};

export default SuccessModal;
