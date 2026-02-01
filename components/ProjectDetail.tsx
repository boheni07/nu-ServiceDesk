import React from 'react';
import { Project, Company, User, Ticket, ProjectStatus } from '../types';
import {
    X, Briefcase, Building, Calendar, Users as UsersIcon,
    ShieldCheck, MessageSquare, ArrowLeft, BarChart3,
    Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface Props {
    project: Project;
    company: Company | undefined;
    users: User[];
    tickets: Ticket[];
    onBack?: () => void;
    isModal?: boolean;
}

const ProjectDetail: React.FC<Props> = ({ project, company, users, tickets, onBack, isModal = false }) => {
    const pm = users.find(u => u.id === project.supportStaffIds[0]);
    const supportStaff = project.supportStaffIds.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];
    const customerContacts = project.customerContactIds.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];
    const projectTickets = tickets.filter(t => t.projectId === project.id);

    const stats = {
        total: projectTickets.length,
        completed: projectTickets.filter(t => t.status === 'COMPLETED').length,
        inProgress: projectTickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'RECEIVED').length,
        waiting: projectTickets.filter(t => t.status === 'WAITING').length
    };

    const isActive = project.status === ProjectStatus.ACTIVE;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                {!isModal && onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm"
                    >
                        <ArrowLeft size={18} /> 목록으로 돌아가기
                    </button>
                )}
                {isModal && <div />} {/* Spacer if modal */}

                <div className={`px-3 py-1 rounded-full text-xs font-black border ${isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {project.status}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-start gap-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${isActive ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-200 text-slate-500'}`}>
                                <Briefcase size={32} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-2xl font-black text-slate-900 mb-2 truncate">{project.name}</h2>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <Building size={16} className="text-slate-400" />
                                        <span className="text-slate-800 font-bold">{company?.name || '정보 없음'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={16} className="text-slate-400" />
                                        <span>
                                            {project.startDate && project.endDate
                                                ? `${format(new Date(project.startDate), 'yyyy.MM.dd')} ~ ${format(new Date(project.endDate), 'yyyy.MM.dd')}`
                                                : '기간 미설정'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare size={14} /> 프로젝트 설명
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                    {project.description || '상세 설명이 등록되지 않았습니다.'}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle size={14} /> 특이사항 및 비고
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap italic">
                                    {project.remarks || '등록된 비고 사항이 없습니다.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">전체 티켓</p>
                            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">처리 완료</p>
                            <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">진행 중</p>
                            <p className="text-2xl font-black text-blue-600">{stats.inProgress}</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">대기 중</p>
                            <p className="text-2xl font-black text-orange-600">{stats.waiting}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: People */}
                <div className="space-y-6">
                    {/* Support Team */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h4 className="font-black text-slate-900 flex items-center gap-2">
                                <ShieldCheck size={18} className="text-indigo-600" /> 지원 인력
                            </h4>
                            <span className="text-xs font-bold text-slate-400">{supportStaff.length}명</span>
                        </div>
                        <div className="p-6 space-y-4">
                            {supportStaff.map((user, idx) => (
                                <div key={user.id} className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${idx === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                                            {idx === 0 && (
                                                <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">PM</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium">{user.team || '지원팀'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Contacts */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h4 className="font-black text-slate-900 flex items-center gap-2">
                                <UsersIcon size={18} className="text-blue-600" /> 고객사 담당자
                            </h4>
                            <span className="text-xs font-bold text-slate-400">{customerContacts.length}명</span>
                        </div>
                        <div className="p-6 space-y-4">
                            {customerContacts.length === 0 ? (
                                <p className="text-xs text-slate-400 italic text-center py-2">등록된 담당자 없음</p>
                            ) : (
                                customerContacts.map(user => (
                                    <div key={user.id} className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm shadow-sm">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
