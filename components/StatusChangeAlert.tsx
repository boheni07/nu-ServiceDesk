import React from 'react';
import Modal from './Modal';
import { AlertCircle, CheckCircle, Power, Users, Briefcase, MessageSquare } from 'lucide-react';
import { CompanyStatus, UserStatus, ProjectStatus } from '../types';

interface DependencyItem {
    label: string;
    count: number;
    items?: string[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    targetName: string;
    newStatus: CompanyStatus | UserStatus | ProjectStatus;
    dependencies: DependencyItem[];
}

const StatusChangeAlert: React.FC<Props> = ({
    isOpen,
    onClose,
    onConfirm,
    targetName,
    newStatus,
    dependencies
}) => {
    if (!isOpen) return null;

    const isInactive = newStatus === 'INACTIVE';
    const hasDependencies = dependencies.some(d => d.count > 0);

    return (
        <Modal
            onClose={onClose}
            onConfirm={onConfirm}
            confirmText={isInactive ? "상태변경 (비활성)" : "상태변경 (활성)"}
            confirmColor={isInactive ? "bg-amber-600" : "bg-blue-600"}
            title="상태 변경 확인"
            showConfirm={true}
        >
            <div className="space-y-6">
                <div className={`${isInactive ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'} p-5 rounded-2xl border flex items-start gap-4`}>
                    <div className={`${isInactive ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'} p-2.5 rounded-xl shrink-0`}>
                        {isInactive ? <Power size={24} /> : <CheckCircle size={24} />}
                    </div>
                    <div>
                        <h4 className={`${isInactive ? 'text-amber-800' : 'text-blue-800'} font-black text-lg mb-1`}>
                            {isInactive ? '고객사 비활성화 확인' : '고객사 활성화 확인'}
                        </h4>
                        <p className={`${isInactive ? 'text-amber-700/80' : 'text-blue-700/80'} text-sm leading-relaxed font-medium`}>
                            {isInactive ? (
                                <>
                                    <span className="font-black text-slate-900">{targetName}</span> 고객사를 비활성화하시겠습니까?
                                    <br />소속 사용자 및 프로젝트가 모두 <span className="text-amber-900 font-bold">비활성 상태</span>로 변경됩니다.
                                </>
                            ) : (
                                <>
                                    <span className="font-black text-slate-900">{targetName}</span> 고객사를 다시 활성화하시겠습니까?
                                    <br /><span className="text-blue-900 font-bold text-[11px] opacity-80 mt-1 block">* 소속 사용자 및 프로젝트는 개별적으로 활성화해야 합니다.</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {hasDependencies && (
                    <div className="space-y-3">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 pl-1">
                            {isInactive ? '함께 비활성화될 데이터 현황' : '함께 활성화될 데이터 현황'}
                        </h5>
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-inner">
                            {dependencies.map((dep, index) => (
                                dep.count > 0 && (
                                    <div key={index} className="flex flex-col bg-white/50 backdrop-blur-sm">
                                        <div className="px-5 py-3.5 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                {dep.label.includes('사용자') ? (
                                                    <Users size={14} className="text-slate-400" />
                                                ) : dep.label.includes('프로젝트') ? (
                                                    <Briefcase size={14} className="text-slate-400" />
                                                ) : (
                                                    <MessageSquare size={14} className="text-slate-400" />
                                                )}
                                                <span className="text-slate-600 font-bold text-sm tracking-tight">{dep.label}</span>
                                            </div>
                                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black border bg-slate-100 text-slate-600 border-slate-200">
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

                <div className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest pt-2">
                    진행하시려면 아래 버튼을 눌러주세요.
                </div>
            </div>
        </Modal>
    );
};

export default StatusChangeAlert;
