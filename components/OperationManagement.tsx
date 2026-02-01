import React, { useState, useEffect } from 'react';
import { Settings, Info, Server, AppWindow, Users as UsersIcon, BookOpen, Save, CheckCircle, Search, Plus, Trash2, Edit2, X } from 'lucide-react';
import { Project, ProjectOperationInfo, User } from '../types';
import { useServiceDesk } from '../hooks/useServiceDesk';

interface OperationManagementProps {
    currentUser: User;
}

interface HardwareSpec {
    id: string;
    type: string; // 종류
    cpu: string;
    memory: string;
    storage: string; // SSD/HDD
    model: string; // 제조사/모델명
    usage: string; // 용도
    note: string; // 참고사항
}

interface SoftwareSpec {
    id: string;
    type: string; // 종류
    productName: string;
    version: string;
    developer: string;
    usage: string; // 용도
    note: string; // 참고사항
}

interface AccountSpec {
    id: string;
    type: string; // 종류
    accessUrl: string;
    username: string;
    password: string;
    note: string; // 기타
    usage: string; // 용도
    remarks: string; // 참고사항
}

const OperationManagement: React.FC<OperationManagementProps> = ({ currentUser }) => {
    // destructing filteredProjects (projects the user has access to) instead of raw projects 
    const { filteredProjects: accessibleProjects, fetchOperationInfo, saveOperationInfo, loading } = useServiceDesk(currentUser);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [info, setInfo] = useState<ProjectOperationInfo>({
        projectId: '',
        hardwareInfo: '',
        softwareInfo: '',
        accountInfo: '',
        notes: ''
    });

    // Hardware Specs State
    const [hardwareSpecs, setHardwareSpecs] = useState<HardwareSpec[]>([]);
    const [isEditingHardware, setIsEditingHardware] = useState(false);
    const [currentHardware, setCurrentHardware] = useState<HardwareSpec>({
        id: '',
        type: '',
        cpu: '',
        memory: '',
        storage: '',
        model: '',
        usage: '',
        note: ''
    });

    // Software Specs State
    const [softwareSpecs, setSoftwareSpecs] = useState<SoftwareSpec[]>([]);
    const [isEditingSoftware, setIsEditingSoftware] = useState(false);
    const [currentSoftware, setCurrentSoftware] = useState<SoftwareSpec>({
        id: '',
        type: '',
        productName: '',
        version: '',
        developer: '',
        usage: '',
        note: ''
    });

    // Account Specs State
    const [accountSpecs, setAccountSpecs] = useState<AccountSpec[]>([]);
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [currentAccount, setCurrentAccount] = useState<AccountSpec>({
        id: '',
        type: '',
        accessUrl: '',
        username: '',
        password: '',
        note: '', // 기타
        usage: '',
        remarks: '' // 참고사항
    });

    // Validation Errors
    const [hardwareError, setHardwareError] = useState<boolean>(false);
    const [softwareError, setSoftwareError] = useState<boolean>(false);
    const [accountError, setAccountError] = useState<boolean>(false);

    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showSaveMessage, setShowSaveMessage] = useState(false);

    // Load data when project is selected
    useEffect(() => {
        if (selectedProjectId) {
            const loadData = async () => {
                const data = await fetchOperationInfo(selectedProjectId);
                if (data) {
                    setInfo(data);
                    // Parse Hardware Info
                    try {
                        const parsedHw = data.hardwareInfo ? JSON.parse(data.hardwareInfo) : [];
                        setHardwareSpecs(Array.isArray(parsedHw) ? parsedHw : []);
                    } catch (e) { setHardwareSpecs([]); }

                    // Parse Software Info
                    try {
                        const parsedSw = data.softwareInfo ? JSON.parse(data.softwareInfo) : [];
                        setSoftwareSpecs(Array.isArray(parsedSw) ? parsedSw : []);
                    } catch (e) { setSoftwareSpecs([]); }

                    // Parse Account Info
                    try {
                        const parsedAcc = data.accountInfo ? JSON.parse(data.accountInfo) : [];
                        setAccountSpecs(Array.isArray(parsedAcc) ? parsedAcc : []);
                    } catch (e) { setAccountSpecs([]); }

                } else {
                    // Reset if no data found (new)
                    setInfo({
                        projectId: selectedProjectId,
                        hardwareInfo: '',
                        softwareInfo: '',
                        accountInfo: '',
                        notes: ''
                    });
                    setHardwareSpecs([]);
                    setSoftwareSpecs([]);
                    setAccountSpecs([]);
                }
                setHasChanges(false);
            };
            loadData();
        }
    }, [selectedProjectId, fetchOperationInfo]);

    const handleSave = async () => {
        if (!selectedProjectId) return;
        setIsSaving(true);
        try {
            await saveOperationInfo({
                ...info,
                hardwareInfo: JSON.stringify(hardwareSpecs),
                softwareInfo: JSON.stringify(softwareSpecs),
                accountInfo: JSON.stringify(accountSpecs),
                projectId: selectedProjectId
            });
            setHasChanges(false);
            setShowSaveMessage(true);
            setTimeout(() => setShowSaveMessage(false), 3000);
        } catch (error) {
            alert(`저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field: keyof ProjectOperationInfo, value: string) => {
        setInfo(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    // Hardware Handlers
    const handleAddHardware = () => {
        setCurrentHardware({
            id: crypto.randomUUID(),
            type: '',
            cpu: '',
            memory: '',
            storage: '',
            model: '',
            usage: '',
            note: ''
        });
        setHardwareError(false);
        setIsEditingHardware(true);
    };

    const handleEditHardware = (spec: HardwareSpec) => {
        setCurrentHardware(spec);
        setHardwareError(false);
        setIsEditingHardware(true);
    };

    const handleDeleteHardware = (id: string) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            setHardwareSpecs(prev => prev.filter(h => h.id !== id));
            setHasChanges(true);
        }
    };

    const handleSaveHardware = () => {
        if (!currentHardware.type.trim()) {
            setHardwareError(true);
            return;
        }
        setHardwareSpecs(prev => {
            const exists = prev.some(h => h.id === currentHardware.id);
            if (exists) {
                return prev.map(h => h.id === currentHardware.id ? currentHardware : h);
            }
            return [...prev, currentHardware];
        });
        setIsEditingHardware(false);
        setHasChanges(true);
    };

    // Software Handlers
    const handleAddSoftware = () => {
        setCurrentSoftware({
            id: crypto.randomUUID(),
            type: '',
            productName: '',
            version: '',
            developer: '',
            usage: '',
            note: ''
        });
        setSoftwareError(false);
        setIsEditingSoftware(true);
    };

    const handleEditSoftware = (spec: SoftwareSpec) => {
        setCurrentSoftware(spec);
        setSoftwareError(false);
        setIsEditingSoftware(true);
    };

    const handleDeleteSoftware = (id: string) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            setSoftwareSpecs(prev => prev.filter(s => s.id !== id));
            setHasChanges(true);
        }
    };

    const handleSaveSoftware = () => {
        if (!currentSoftware.type.trim()) {
            setSoftwareError(true);
            return;
        }
        setSoftwareSpecs(prev => {
            const exists = prev.some(s => s.id === currentSoftware.id);
            if (exists) {
                return prev.map(s => s.id === currentSoftware.id ? currentSoftware : s);
            }
            return [...prev, currentSoftware];
        });
        setIsEditingSoftware(false);
        setHasChanges(true);
    };

    // Account Handlers
    const handleAddAccount = () => {
        setCurrentAccount({
            id: crypto.randomUUID(),
            type: '',
            accessUrl: '',
            username: '',
            password: '',
            note: '',
            usage: '',
            remarks: ''
        });
        setAccountError(false);
        setIsEditingAccount(true);
    };

    const handleEditAccount = (spec: AccountSpec) => {
        setCurrentAccount(spec);
        setAccountError(false);
        setIsEditingAccount(true);
    };

    const handleDeleteAccount = (id: string) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            setAccountSpecs(prev => prev.filter(a => a.id !== id));
            setHasChanges(true);
        }
    };

    const handleSaveAccount = () => {
        if (!currentAccount.type.trim()) {
            setAccountError(true);
            return;
        }
        setAccountSpecs(prev => {
            const exists = prev.some(a => a.id === currentAccount.id);
            if (exists) {
                return prev.map(a => a.id === currentAccount.id ? currentAccount : a);
            }
            return [...prev, currentAccount];
        });
        setIsEditingAccount(false);
        setHasChanges(true);
    };

    const filteredProjects = accessibleProjects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
            {/* Left Sidebar: Project List */}
            <div className="w-full lg:w-72 bg-white rounded-2xl border border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Settings size={18} /> 프로젝트 선택
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="프로젝트 검색..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredProjects.map(project => (
                        <button
                            key={project.id}
                            onClick={() => setSelectedProjectId(project.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedProjectId === project.id
                                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {project.name}
                        </button>
                    ))}
                    {filteredProjects.length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            검색 결과가 없습니다.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Content: Forms */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col shadow-sm overflow-hidden relative">
                {!selectedProjectId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Info size={32} />
                        </div>
                        <p>좌측 목록에서 프로젝트를 선택해주세요.</p>
                    </div>
                ) : (
                    <>
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    {accessibleProjects.find(p => p.id === selectedProjectId)?.name} 운영정보
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">해당 프로젝트의 시스템 운영 정보를 관리합니다.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {showSaveMessage && (
                                    <span className="text-green-600 text-sm font-bold flex items-center gap-1 animate-fadeIn">
                                        <CheckCircle size={16} /> 저장됨
                                    </span>
                                )}
                                <button
                                    onClick={handleSave}
                                    disabled={!hasChanges || isSaving}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${hasChanges
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Save size={16} />
                                    {isSaving ? '저장 중...' : '저장하기'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="grid grid-cols-1 gap-6 pb-20">
                                {/* Hardware Section (Full Width) */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col">
                                    <div className="flex items-center justify-between mb-3 text-slate-700 font-bold">
                                        <div className="flex items-center gap-2">
                                            <Server size={18} className="text-indigo-500" />
                                            <h3>하드웨어(서버) 사양</h3>
                                        </div>
                                        <button
                                            onClick={handleAddHardware}
                                            className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                                        >
                                            <Plus size={12} /> 추가
                                        </button>
                                    </div>

                                    {/* Hardware List Table */}
                                    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-slate-100/50 text-slate-500 font-medium">
                                                <tr>
                                                    <th className="px-3 py-2">종류</th>
                                                    <th className="px-3 py-2">CPU</th>
                                                    <th className="px-3 py-2">Memory</th>
                                                    <th className="px-3 py-2">SSD/HDD</th>
                                                    <th className="px-3 py-2">제조사/모델명</th>
                                                    <th className="px-3 py-2">용도</th>
                                                    <th className="px-3 py-2">참고사항</th>
                                                    <th className="px-3 py-2 text-right">관리</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {hardwareSpecs.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={8} className="px-3 py-8 text-center text-slate-400">
                                                            등록된 하드웨어 사양이 없습니다.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    hardwareSpecs.map(h => (
                                                        <tr key={h.id} className="hover:bg-slate-50/50">
                                                            <td className="px-3 py-2 font-medium text-slate-700">{h.type}</td>
                                                            <td className="px-3 py-2 text-slate-600">{h.cpu}</td>
                                                            <td className="px-3 py-2 text-slate-600">{h.memory}</td>
                                                            <td className="px-3 py-2 text-slate-600">{h.storage}</td>
                                                            <td className="px-3 py-2 text-slate-600">{h.model}</td>
                                                            <td className="px-3 py-2 text-slate-600">{h.usage}</td>
                                                            <td className="px-3 py-2 text-slate-500">{h.note}</td>
                                                            <td className="px-3 py-2 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button onClick={() => handleEditHardware(h)} className="p-1 text-slate-400 hover:text-blue-500 rounded"><Edit2 size={12} /></button>
                                                                    <button onClick={() => handleDeleteHardware(h.id)} className="p-1 text-slate-400 hover:text-red-500 rounded"><Trash2 size={12} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Software Section (Full Width) */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col">
                                    <div className="flex items-center justify-between mb-3 text-slate-700 font-bold">
                                        <div className="flex items-center gap-2">
                                            <AppWindow size={18} className="text-pink-500" />
                                            <h3>소프트웨어 사양</h3>
                                        </div>
                                        <button
                                            onClick={handleAddSoftware}
                                            className="text-xs bg-pink-50 text-pink-600 hover:bg-pink-100 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                                        >
                                            <Plus size={12} /> 추가
                                        </button>
                                    </div>

                                    {/* Software List Table */}
                                    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-slate-100/50 text-slate-500 font-medium">
                                                <tr>
                                                    <th className="px-3 py-2">종류</th>
                                                    <th className="px-3 py-2">제품명</th>
                                                    <th className="px-3 py-2">버전</th>
                                                    <th className="px-3 py-2">제조(개발)사</th>
                                                    <th className="px-3 py-2">용도</th>
                                                    <th className="px-3 py-2">참고사항</th>
                                                    <th className="px-3 py-2 text-right">관리</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {softwareSpecs.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="px-3 py-8 text-center text-slate-400">
                                                            등록된 소프트웨어 사양이 없습니다.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    softwareSpecs.map(s => (
                                                        <tr key={s.id} className="hover:bg-slate-50/50">
                                                            <td className="px-3 py-2 font-medium text-slate-700">{s.type}</td>
                                                            <td className="px-3 py-2 text-slate-600">{s.productName}</td>
                                                            <td className="px-3 py-2 text-slate-600">{s.version}</td>
                                                            <td className="px-3 py-2 text-slate-600">{s.developer}</td>
                                                            <td className="px-3 py-2 text-slate-500">{s.usage}</td>
                                                            <td className="px-3 py-2 text-slate-500">{s.note}</td>
                                                            <td className="px-3 py-2 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button onClick={() => handleEditSoftware(s)} className="p-1 text-slate-400 hover:text-blue-500 rounded"><Edit2 size={12} /></button>
                                                                    <button onClick={() => handleDeleteSoftware(s.id)} className="p-1 text-slate-400 hover:text-red-500 rounded"><Trash2 size={12} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Account Info Section (Full Width) */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col">
                                    <div className="flex items-center justify-between mb-3 text-slate-700 font-bold">
                                        <div className="flex items-center gap-2">
                                            <UsersIcon size={18} className="text-emerald-500" />
                                            <h3>운영 계정 정보</h3>
                                        </div>
                                        <button
                                            onClick={handleAddAccount}
                                            className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                                        >
                                            <Plus size={12} /> 추가
                                        </button>
                                    </div>

                                    {/* Account List Table */}
                                    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-slate-100/50 text-slate-500 font-medium">
                                                <tr>
                                                    <th className="px-3 py-2">종류</th>
                                                    <th className="px-3 py-2">접근경로</th>
                                                    <th className="px-3 py-2">계정(ID)</th>
                                                    <th className="px-3 py-2">비밀번호</th>
                                                    <th className="px-3 py-2">기타</th>
                                                    <th className="px-3 py-2">용도</th>
                                                    <th className="px-3 py-2">참고사항</th>
                                                    <th className="px-3 py-2 text-right">관리</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {accountSpecs.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={8} className="px-3 py-8 text-center text-slate-400">
                                                            등록된 운영 계정 정보가 없습니다.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    accountSpecs.map(a => (
                                                        <tr key={a.id} className="hover:bg-slate-50/50">
                                                            <td className="px-3 py-2 font-medium text-slate-700">{a.type}</td>
                                                            <td className="px-3 py-2 text-slate-600">{a.accessUrl}</td>
                                                            <td className="px-3 py-2 text-slate-600">{a.username}</td>
                                                            <td className="px-3 py-2 text-slate-600">{a.password}</td>
                                                            <td className="px-3 py-2 text-slate-500">{a.note}</td>
                                                            <td className="px-3 py-2 text-slate-500">{a.usage}</td>
                                                            <td className="px-3 py-2 text-slate-500">{a.remarks}</td>
                                                            <td className="px-3 py-2 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button onClick={() => handleEditAccount(a)} className="p-1 text-slate-400 hover:text-blue-500 rounded"><Edit2 size={12} /></button>
                                                                    <button onClick={() => handleDeleteAccount(a.id)} className="p-1 text-slate-400 hover:text-red-500 rounded"><Trash2 size={12} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Notes Section */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col h-full min-h-[300px]">
                                    <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
                                        <BookOpen size={18} className="text-orange-500" />
                                        <h3>기타 참고사항</h3>
                                    </div>
                                    <textarea
                                        className="flex-1 w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none leading-relaxed text-slate-700"
                                        placeholder="전반적인 프로젝트 운영과 관련된 기타 내용을 입력하세요."
                                        value={info.notes || ''}
                                        onChange={(e) => handleChange('notes', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Hardware Spec Modal */}
                {isEditingHardware && (
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Server size={20} className="text-indigo-600" />
                                    하드웨어 사양 상세
                                </h3>
                                <button onClick={() => setIsEditingHardware(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">종류 *</label>
                                    <input
                                        type="text"
                                        className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${hardwareError
                                            ? 'border-red-500 ring-red-500 focus:ring-red-500'
                                            : 'border-slate-200 focus:ring-indigo-500'
                                            }`}
                                        placeholder="예) 웹서버, DB서버, L4스위치"
                                        value={currentHardware.type}
                                        onChange={(e) => {
                                            setCurrentHardware({ ...currentHardware, type: e.target.value });
                                            if (e.target.value.trim()) setHardwareError(false);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">CPU</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="예) 8 Core"
                                        value={currentHardware.cpu}
                                        onChange={(e) => setCurrentHardware({ ...currentHardware, cpu: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Memory</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="예) 32GB"
                                        value={currentHardware.memory}
                                        onChange={(e) => setCurrentHardware({ ...currentHardware, memory: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">SSD/HDD</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="예) SSD 500GB / HDD 1TB"
                                        value={currentHardware.storage}
                                        onChange={(e) => setCurrentHardware({ ...currentHardware, storage: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">제조사/모델명</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="예) Dell PowerEdge R750"
                                        value={currentHardware.model}
                                        onChange={(e) => setCurrentHardware({ ...currentHardware, model: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">용도</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="주요 용도"
                                        value={currentHardware.usage}
                                        onChange={(e) => setCurrentHardware({ ...currentHardware, usage: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">참고사항</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="기타 비고"
                                        value={currentHardware.note}
                                        onChange={(e) => setCurrentHardware({ ...currentHardware, note: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setIsEditingHardware(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSaveHardware}
                                    className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Software Spec Modal */}
                {isEditingSoftware && (
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <AppWindow size={20} className="text-pink-600" />
                                    소프트웨어 사양 상세
                                </h3>
                                <button onClick={() => setIsEditingSoftware(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">종류 *</label>
                                    <input
                                        type="text"
                                        className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${softwareError
                                            ? 'border-red-500 ring-red-500 focus:ring-red-500'
                                            : 'border-slate-200 focus:ring-pink-500'
                                            }`}
                                        placeholder="예) OS, DBMS, WEB/WAS"
                                        value={currentSoftware.type}
                                        onChange={(e) => {
                                            setCurrentSoftware({ ...currentSoftware, type: e.target.value });
                                            if (e.target.value.trim()) setSoftwareError(false);
                                        }}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">제품명</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        placeholder="예) Ubuntu, PostgreSQL, Nginx"
                                        value={currentSoftware.productName}
                                        onChange={(e) => setCurrentSoftware({ ...currentSoftware, productName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">버전</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        placeholder="예) 22.04 LTS"
                                        value={currentSoftware.version}
                                        onChange={(e) => setCurrentSoftware({ ...currentSoftware, version: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">제조(개발)사</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        placeholder="예) Canonical, Oracle"
                                        value={currentSoftware.developer}
                                        onChange={(e) => setCurrentSoftware({ ...currentSoftware, developer: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">용도</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        placeholder="주요 용도"
                                        value={currentSoftware.usage}
                                        onChange={(e) => setCurrentSoftware({ ...currentSoftware, usage: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">참고사항</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        placeholder="기타 비고"
                                        value={currentSoftware.note}
                                        onChange={(e) => setCurrentSoftware({ ...currentSoftware, note: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setIsEditingSoftware(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSaveSoftware}
                                    className="px-4 py-2 text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl shadow-lg shadow-pink-500/20 transition-all"
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Account Spec Modal */}
                {isEditingAccount && (
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <UsersIcon size={20} className="text-emerald-600" />
                                    운영 계정 상세
                                </h3>
                                <button onClick={() => setIsEditingAccount(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">종류 *</label>
                                    <input
                                        type="text"
                                        className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${accountError
                                                ? 'border-red-500 ring-red-500 focus:ring-red-500'
                                                : 'border-slate-200 focus:ring-emerald-500'
                                            }`}
                                        placeholder="예) 인프라, DB, 어플리케이션"
                                        value={currentAccount.type}
                                        onChange={(e) => {
                                            setCurrentAccount({ ...currentAccount, type: e.target.value });
                                            if (e.target.value.trim()) setAccountError(false);
                                        }}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">접근경로</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="예) 1.1.1.1, https://admin.site.com"
                                        value={currentAccount.accessUrl}
                                        onChange={(e) => setCurrentAccount({ ...currentAccount, accessUrl: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">계정(ID)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="user_id"
                                        value={currentAccount.username}
                                        onChange={(e) => setCurrentAccount({ ...currentAccount, username: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">비밀번호</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="password"
                                        value={currentAccount.password}
                                        onChange={(e) => setCurrentAccount({ ...currentAccount, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">기타</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="기타 정보"
                                        value={currentAccount.note}
                                        onChange={(e) => setCurrentAccount({ ...currentAccount, note: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">용도</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="사용 용도"
                                        value={currentAccount.usage}
                                        onChange={(e) => setCurrentAccount({ ...currentAccount, usage: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">참고사항</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="추가 참고사항"
                                        value={currentAccount.remarks}
                                        onChange={(e) => setCurrentAccount({ ...currentAccount, remarks: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setIsEditingAccount(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSaveAccount}
                                    className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperationManagement;
