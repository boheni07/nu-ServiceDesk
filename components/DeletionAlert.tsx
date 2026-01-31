import React from 'react';
import Modal from './Modal';
import { AlertTriangle, AlertCircle } from 'lucide-react';

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
}

const DeletionAlert: React.FC<Props> = ({
    isOpen,
    onClose,
    onConfirm,
    targetName,
    targetType,
    dependencies
}) => {
    if (!isOpen) return null;

    const hasDependencies = dependencies.some(d => d.count > 0);

    return (
        <Modal
            onClose={onClose}
            onConfirm={onConfirm}
            confirmText="삭제"
            confirmColor="bg-red-600"
            title={`${targetType} 삭제 확인`}
        >
            <div className="space-y-6">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-4">
                    <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="text-red-700 font-bold text-lg mb-1">경고: 영구 삭제</h4>
                        <p className="text-red-600/80 text-sm leading-relaxed">
                            <span className="font-black text-red-800">{targetName}</span> 항목을 삭제하려고 합니다.<br />
                            삭제된 데이터는 복구할 수 없습니다.
                        </p>
                    </div>
                </div>

                {hasDependencies ? (
                    <div className="space-y-3">
                        <h5 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <AlertCircle size={14} /> 연관된 정보 (함께 삭제되거나 영향 받음)
                        </h5>
                        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                            {dependencies.map((dep, index) => (
                                dep.count > 0 && (
                                    <div key={index} className="flex flex-col bg-white border-b border-slate-100 last:border-0">
                                        <div className="px-5 py-3 flex justify-between items-center">
                                            <span className="text-slate-600 font-medium text-sm">{dep.label}</span>
                                            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-slate-200">
                                                {dep.count.toLocaleString()} 건
                                            </span>
                                        </div>
                                        {dep.items && dep.items.length > 0 && (
                                            <div className="px-5 pb-3">
                                                <div className="bg-slate-50 p-2 rounded-lg text-xs text-slate-500 max-h-24 overflow-y-auto custom-scrollbar border border-slate-200">
                                                    <ul className="list-disc list-inside space-y-0.5">
                                                        {dep.items.slice(0, 10).map((item, i) => (
                                                            <li key={i} className="truncate">{item}</li>
                                                        ))}
                                                        {dep.items.length > 10 && <li className="italic text-slate-400">...외 {dep.items.length - 10}건</li>}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-slate-500 text-sm italic py-2 text-center">
                        연관된 데이터가 없습니다. 안전하게 삭제할 수 있습니다.
                    </div>
                )}

                <div className="text-xs text-slate-400 text-center">
                    정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </div>
            </div>
        </Modal>
    );
};

export default DeletionAlert;
