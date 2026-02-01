import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { AlertTriangle, AlertCircle, CheckCircle, Power } from 'lucide-react';

interface DependencyItem {
    label: string;
    count: number;
    items?: string[]; // List of names (e.g., specific projects, users)
    description?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    targetName: string;
    targetType: string; // e.g., 'Company', 'User', 'Project'
    dependencies: DependencyItem[];
    canDelete?: boolean;
    onInactivate?: () => void;
    inactivateText?: string;
}

const DeletionAlert: React.FC<Props> = ({
    isOpen,
    onClose,
    onConfirm,
    targetName,
    targetType,
    dependencies,
    canDelete = true,
    onInactivate,
    inactivateText = '비활성화 상태로 변경'
}) => {
    const [consentConfirmed, setConsentConfirmed] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setConsentConfirmed(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const hasDependencies = dependencies.some(d => d.count > 0);
    const isActuallyBlocked = !canDelete && hasDependencies;
    const requiresConsent = hasDependencies && canDelete;

    return (
        <Modal
            onClose={onClose}
            onConfirm={onConfirm}
            confirmText={isActuallyBlocked ? "" : (hasDependencies ? "일괄 삭제" : "삭제")}
            confirmColor="bg-red-600"
            title={isActuallyBlocked ? `${targetType} 삭제 불가` : `${targetType} 삭제 확인`}
            showConfirm={!isActuallyBlocked}
            disabledConfirm={requiresConsent && !consentConfirmed}
        >
            <div className="space-y-6">
                <div className={`${isActuallyBlocked ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'} p-5 rounded-2xl border flex items-start gap-4 transition-colors`}>
                    <div className={`${isActuallyBlocked ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'} p-2.5 rounded-xl shrink-0`}>
                        {isActuallyBlocked ? <AlertCircle size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div>
                        <h4 className={`${isActuallyBlocked ? 'text-amber-800' : 'text-red-700'} font-black text-lg mb-1`}>
                            {isActuallyBlocked ? '삭제할 수 없습니다' : (requiresConsent ? '주의: 연관 데이터 포함 삭제' : '경고: 영구 삭제')}
                        </h4>
                        <p className={`${isActuallyBlocked ? 'text-amber-700/80' : 'text-red-600/80'} text-sm leading-relaxed font-medium`}>
                            <span className={`font-black ${isActuallyBlocked ? 'text-amber-900' : 'text-red-800'}`}>{targetName}</span>
                            {isActuallyBlocked
                                ? ' 항목에 연결된 데이터가 남아있어 삭제가 제한됩니다.'
                                : requiresConsent
                                    ? ' 항목을 삭제하면 아래의 모든 연관 데이터도 처리됩니다.'
                                    : ' 항목을 삭제하려고 합니다. 삭제 후 복구는 불가능합니다.'}
                        </p>
                    </div>
                </div>

                {hasDependencies && (
                    <div className="space-y-3">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 pl-1">
                            연관된 데이터 현황
                        </h5>
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-inner">
                            {dependencies.map((dep, index) => (
                                dep.count > 0 && (
                                    <div key={index} className="flex flex-col bg-white/50 backdrop-blur-sm">
                                        <div className="px-5 py-3.5 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                <span className="text-slate-600 font-bold text-sm tracking-tight">{dep.label}</span>
                                            </div>
                                            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${isActuallyBlocked ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                {dep.count.toLocaleString()}
                                            </span>
                                        </div>
                                        {dep.items && dep.items.length > 0 && (
                                            <div className="px-5 pb-3.5">
                                                <div className="bg-slate-50/50 p-3 rounded-xl text-[11px] text-slate-500 max-h-24 overflow-y-auto custom-scrollbar border border-slate-100 font-medium">
                                                    <ul className="space-y-1.5">
                                                        {dep.items.slice(0, 5).map((item, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <span className="text-slate-300 mt-1">•</span>
                                                                <span className="truncate">{item}</span>
                                                            </li>
                                                        ))}
                                                        {dep.items.length > 5 && <li className="pl-3 italic text-slate-400 text-[10px]">...외 {dep.items.length - 5}건 더 있음</li>}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {requiresConsent && (
                    <div
                        onClick={() => setConsentConfirmed(!consentConfirmed)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${consentConfirmed ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200 group hover:border-slate-300'}`}
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${consentConfirmed ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 group-hover:border-slate-400'}`}>
                            {consentConfirmed && <CheckCircle size={18} />}
                        </div>
                        <span className={`text-sm font-bold ${consentConfirmed ? 'text-blue-700' : 'text-slate-500'}`}>
                            연관된 모든 정보가 영구적으로 삭제됨을 이해하였으며, 이에 동의합니다.
                        </span>
                    </div>
                )}

                {!hasDependencies && (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 text-sm font-bold flex items-center gap-3 justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        연관된 데이터가 없어 안전하게 삭제할 수 있습니다.
                    </div>
                )}

                {!isActuallyBlocked && (
                    <div className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest pt-2">
                        정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </div>
                )}

                {onInactivate && (
                    <div className="pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-3">또는 안전한 방법을 선택하세요</p>
                        <button
                            onClick={onInactivate}
                            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all active:scale-[0.98] border border-slate-200 flex items-center justify-center gap-2"
                        >
                            <Power size={18} className="text-slate-400" />
                            {inactivateText}
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default DeletionAlert;
