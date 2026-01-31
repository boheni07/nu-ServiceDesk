import React, { useState, useEffect } from 'react';
import { AgencyInfo } from '../types';
import { Building2, Save, User } from 'lucide-react';

interface Props {
    info: AgencyInfo;
    onSave: (info: AgencyInfo) => void;
}

const SystemSettings: React.FC<Props> = ({ info, onSave }) => {
    const [formData, setFormData] = useState<AgencyInfo>(info);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setFormData(info);
        setIsDirty(false);
    }, [info]);

    const formatBusinessNumber = (value: string) => {
        const nums = value.replace(/[^0-9]/g, '');
        if (nums.length <= 3) return nums;
        if (nums.length <= 5) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
        return `${nums.slice(0, 3)}-${nums.slice(3, 5)}-${nums.slice(5, 10)}`;
    };

    const formatPhoneNumber = (value: string) => {
        const nums = value.replace(/[^0-9]/g, '');
        if (nums.startsWith('02')) {
            if (nums.length <= 2) return nums;
            if (nums.length <= 5) return `${nums.slice(0, 2)}-${nums.slice(2)}`;
            if (nums.length <= 9) return `${nums.slice(0, 2)}-${nums.slice(2, 5)}-${nums.slice(5)}`; // 02-123-4567
            return `${nums.slice(0, 2)}-${nums.slice(2, 6)}-${nums.slice(6, 10)}`; // 02-1234-5678
        }
        if (nums.length <= 3) return nums;
        if (nums.length <= 6) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
        if (nums.length <= 10) return `${nums.slice(0, 3)}-${nums.slice(3, 6)}-${nums.slice(6)}`; // 010-123-4567
        return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`; // 010-1234-5678
    };

    const formatZipCode = (value: string) => {
        return value.replace(/[^0-9]/g, '').slice(0, 5);
    };

    const handleChange = (field: keyof AgencyInfo, value: string) => {
        let formattedValue = value;
        if (field === 'registrationNumber') formattedValue = formatBusinessNumber(value);
        if (field === 'phoneNumber') formattedValue = formatPhoneNumber(value);
        if (field === 'zipCode') formattedValue = formatZipCode(value);

        setFormData(prev => ({ ...prev, [field]: formattedValue }));
        setIsDirty(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.ceoName) {
            alert('기관명과 대표자명은 필수 입력 항목입니다.');
            return;
        }
        onSave(formData);
        setIsDirty(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">환경 설정</h1>
                    <p className="text-slate-500 mt-1 font-medium">시스템 운영 및 기관 정보를 관리합니다.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={!isDirty}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all shadow-lg ${isDirty ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-blue-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                    <Save size={18} /> 설정 저장
                </button>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900">사용 기관 정보</h2>
                        <p className="text-sm font-medium text-slate-500">관리자 및 지원 담당자가 소속된 운영 기관의 정보입니다.</p>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1">기관명 <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                placeholder="예: 누비즈"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1">사업자등록번호</label>
                            <input
                                type="text"
                                value={formData.registrationNumber || ''}
                                onChange={(e) => handleChange('registrationNumber', e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 focus:bg-white focus:border-blue-500 transition-all"
                                placeholder="000-00-00000"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1">업종</label>
                            <input
                                type="text"
                                value={formData.industry || ''}
                                onChange={(e) => handleChange('industry', e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 focus:bg-white focus:border-blue-500 transition-all"
                                placeholder="예: 소프트웨어 자문 및 개발 공급업"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1">전화번호</label>
                            <input
                                type="text"
                                value={formData.phoneNumber || ''}
                                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 focus:bg-white focus:border-blue-500 transition-all"
                                placeholder="02-0000-0000"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1">대표자명 <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.ceoName}
                                    onChange={(e) => handleChange('ceoName', e.target.value)}
                                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="대표자 성명"
                                />
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1">우편번호</label>
                            <input
                                type="text"
                                value={formData.zipCode || ''}
                                onChange={(e) => handleChange('zipCode', e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 focus:bg-white focus:border-blue-500 transition-all"
                                placeholder="00000"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1">주소</label>
                            <input
                                type="text"
                                value={formData.address || ''}
                                onChange={(e) => handleChange('address', e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-800 focus:bg-white focus:border-blue-500 transition-all"
                                placeholder="기본 주소 및 상세 주소"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1">참고사항</label>
                            <textarea
                                value={formData.notes || ''}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium text-slate-700 text-sm focus:bg-white focus:border-blue-500 resize-none h-[140px] transition-all"
                                placeholder="기타 비고 사항..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
