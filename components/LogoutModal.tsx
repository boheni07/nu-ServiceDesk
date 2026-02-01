import React from 'react';
import { LogOut, X, AlertCircle } from 'lucide-react';

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                <div className="px-6 py-8 text-center">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <LogOut size={24} className="text-red-500" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-1">로그아웃 하시겠습니까?</h3>
                    <p className="text-slate-500 text-xs mb-6 leading-relaxed">
                        현재 세션이 종료되며<br />
                        로그인 화면으로 이동합니다.
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all"
                        >
                            취소
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-200 active:scale-[0.98]"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
