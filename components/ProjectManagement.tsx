
import React, { useState } from 'react';
import { Project, Company, User, UserRole, ProjectStatus, Ticket, AGENCY_COMPANY_ID } from '../types';
import {
  Plus, Edit2, Trash2, X, Search, Briefcase, Calendar,
  User as UserIcon, Building, MessageSquare, ShieldCheck,
  Power, Check, AlertCircle
} from 'lucide-react';
import DeletionAlert from './DeletionAlert';
import ProjectDetail from './ProjectDetail';
import { format } from 'date-fns';

interface Props {
  projects: Project[];
  companies: Company[];
  users: User[];
  tickets: Ticket[];
  currentUser: User;
  onAdd: (projectData: Omit<Project, 'id'>) => void;
  onUpdate: (id: string, projectData: Partial<Project>) => boolean;
  onDelete: (id: string) => void;
  supportTeams: string[];
}

const ProjectManagement: React.FC<Props> = ({ projects, companies, users, tickets, currentUser, onAdd, onUpdate, onDelete, supportTeams }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Deletion State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDependencies, setDeleteDependencies] = useState<any[]>([]);

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const canManage = isAdmin || currentUser.role === UserRole.SUPPORT_LEAD;

  // Form State
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    name: '',
    clientId: '',
    customerContactIds: [],
    supportStaffIds: [],
    startDate: '',
    endDate: '',
    description: '',
    remarks: '',
    supportTeam: '',
    status: ProjectStatus.ACTIVE
  });

  // Validation State
  const [errors, setErrors] = useState({
    name: false,
    clientId: false,
    supportStaffIds: false
  });

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const supportUsers = users.filter(u => u.role === UserRole.SUPPORT || u.role === UserRole.SUPPORT_LEAD);
  const customerUsersOfSelectedClient = users.filter(u => u.role === UserRole.CUSTOMER && u.companyId === formData.clientId);

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      clientId: '',
      customerContactIds: [],
      supportStaffIds: currentUser.role === UserRole.ADMIN ? [] : [currentUser.id], // Auto-assign creator if support (not Admin)
      startDate: '',
      endDate: '',
      description: '',
      remarks: '',
      supportTeam: '',
      status: ProjectStatus.ACTIVE
    });
    setErrors({ name: false, clientId: false, supportStaffIds: false });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      clientId: project.clientId,
      customerContactIds: project.customerContactIds,
      supportStaffIds: project.supportStaffIds,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      description: project.description,
      remarks: project.remarks || '',
      supportTeam: project.supportTeam || '',
      status: project.status
    });
    setErrors({ name: false, clientId: false, supportStaffIds: false });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      name: !formData.name.trim(),
      clientId: !formData.clientId,
      supportStaffIds: formData.supportStaffIds.length === 0
    };

    if (Object.values(newErrors).some(v => v)) {
      setErrors(newErrors);
      return;
    }

    // Auto-assign Support Team and Support Leads based on PM
    const pmId = formData.supportStaffIds[0];
    const pmUser = users.find(u => u.id === pmId);
    let finalFormData = { ...formData };

    if (pmUser && pmUser.team) {
      finalFormData.supportTeam = pmUser.team;

      // Find all Support Leads of this team
      const teamLeads = users.filter(u => u.role === UserRole.SUPPORT_LEAD && u.team === pmUser.team).map(u => u.id);

      // Merge Leads into supportStaffIds, ensuring PM remains first and uniqueness
      const uniqueIds = Array.from(new Set([...finalFormData.supportStaffIds, ...teamLeads]));
      // Ensure PM is at index 0 (Set insertion order usually preserves it if it was first, but let's be safe)
      const explicitIds = [pmId, ...uniqueIds.filter(id => id !== pmId)];

      finalFormData.supportStaffIds = explicitIds;
    }

    if (editingProject) {
      const success = onUpdate(editingProject.id, finalFormData);
      if (success) {
        setIsModalOpen(false);
      }
    } else {
      onAdd(finalFormData);
      setIsModalOpen(false);
    }
  };

  const handleRequestDelete = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    // Calculate dependencies
    const linkedTickets = tickets.filter(t => t.projectId === id);

    setDeleteDependencies([
      {
        label: '연결된 티켓',
        count: linkedTickets.length,
        items: linkedTickets.map(t => `[${t.status}] ${t.title}`)
      }
    ]);
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const toggleSelection = (id: string, field: 'customerContactIds' | 'supportStaffIds') => {
    setFormData(prev => {
      const current = prev[field];
      const next = current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id];
      return { ...prev, [field]: next };
    });
  };



  // View swap logic removed. Modal rendered below.

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="프로젝트명 또는 설명 검색..."
            className="pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {canManage && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md"
          >
            <Plus size={18} /> 프로젝트 추가
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="px-3 py-2 font-semibold whitespace-nowrap">프로젝트명</th>
              <th className="px-3 py-2 font-semibold whitespace-nowrap">고객사</th>
              <th className="px-3 py-2 font-semibold whitespace-nowrap">상태</th>
              <th className="px-3 py-2 font-semibold whitespace-nowrap">기간</th>
              <th className="px-3 py-2 font-semibold whitespace-nowrap">담당자 (PM)</th>
              <th className="px-3 py-2 font-semibold whitespace-nowrap">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                  배정된 프로젝트가 없거나 검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              filteredProjects.map(project => {
                const client = companies.find(c => c.id === project.clientId);
                const pm = users.find(u => u.id === project.supportStaffIds[0]);
                const isActive = project.status === ProjectStatus.ACTIVE;
                return (
                  <tr
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className="hover:bg-slate-50 transition-colors group text-sm cursor-pointer"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${isActive ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-100 text-slate-400'}`}>
                          <Briefcase size={18} />
                        </div>
                        <div>
                          <p className={`font-bold ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>{project.name}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{project.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-slate-600 font-medium">{client?.name || '정보 없음'}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // setStatusChangeProject(project); // This line was commented out or removed in the original context, keeping it as is.
                        }}
                        disabled={!isActive && companies.find(c => c.id === project.clientId)?.status === '비활성'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border shadow-sm flex items-center gap-1.5 ${isActive
                          ? 'bg-green-500 text-white border-green-600 hover:bg-green-600'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:bg-slate-100'
                          }`}
                      >
                        <Power size={12} className={isActive ? 'text-white' : 'text-slate-400'} />
                        {isActive ? '활성' : '비활성'}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-slate-500 text-xs whitespace-nowrap">
                      {project.startDate && project.endDate
                        ? `${format(new Date(project.startDate), 'yyyy-MM-dd')} ~ ${format(new Date(project.endDate), 'yyyy-MM-dd')}`
                        : '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {pm ? (
                          <>
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                              {pm.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-700">{pm.name}</span>
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold border border-indigo-100">PM</span>
                          </>
                        ) : '-'}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {canManage && (
                        <div className="flex justify-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(project);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="수정"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestDelete(project.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="삭제"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800">{editingProject ? '프로젝트 정보 수정' : '신규 프로젝트 등록'}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border shadow-sm flex items-center gap-1.5 ${formData.status === ProjectStatus.ACTIVE
                  ? 'bg-green-500 text-white border-green-600'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                  <Power size={10} className={formData.status === ProjectStatus.ACTIVE ? 'text-white' : 'text-slate-400'} />
                  {formData.status === ProjectStatus.ACTIVE ? '활성' : '비활성'}
                </span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar">
              <div className="p-6 space-y-8">
                {/* Basic Info */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="text-sm font-bold text-blue-600 flex items-center gap-2">
                      <Briefcase size={16} /> 기본 정보
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">프로젝트명 *</label>
                      <input
                        required
                        type="text"
                        className={`w-full px-4 py-2 border rounded-lg outline-none text-sm ${errors.name
                          ? 'border-red-500 ring-2 ring-red-500 focus:ring-red-500'
                          : 'border-slate-200 focus:ring-2 focus:ring-blue-500'
                          }`}
                        placeholder="프로젝트 이름을 입력하세요"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (e.target.value.trim()) setErrors(prev => ({ ...prev, name: false }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">시작일</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="date"
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">종료일</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="date"
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Clients & Contacts */}
                <section className="space-y-4">
                  <h4 className="text-sm font-bold text-blue-600 border-b pb-2 flex items-center gap-2">
                    <Building size={16} /> 고객사 및 연락처
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">고객사 선택 *</label>
                      <select
                        required
                        value={formData.clientId}
                        onChange={(e) => {
                          setFormData({ ...formData, clientId: e.target.value, customerContactIds: [] });
                          if (e.target.value) setErrors(prev => ({ ...prev, clientId: false }));
                        }}
                        className={`w-full pl-10 appearance-none bg-slate-50 border rounded-lg focus:bg-white ${errors.clientId
                          ? 'border-red-500 ring-2 ring-red-500 focus:ring-red-500'
                          : 'border-slate-200 focus:border-blue-500'
                          }`}
                      >
                        <option value="">고객사 선택</option>
                        {companies
                          .filter(c => c.id !== AGENCY_COMPANY_ID)
                          .map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">고객담당 (복수 선택)</label>
                      <div className={`p-2 border border-slate-200 rounded-lg max-h-32 overflow-y-auto space-y-1 bg-white ${!formData.clientId ? 'opacity-50' : ''}`}>
                        {customerUsersOfSelectedClient.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic text-center py-2">고객사를 먼저 선택하세요</p>
                        ) : (
                          customerUsersOfSelectedClient.map(user => (
                            <label key={user.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={formData.customerContactIds.includes(user.id)}
                                onChange={() => toggleSelection(user.id, 'customerContactIds')}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs text-slate-700">{user.name}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Support Team */}
                <section className="space-y-4">
                  <h4 className="text-sm font-bold text-blue-600 border-b pb-2 flex items-center gap-2">
                    <ShieldCheck size={16} /> 지원 인력 구성
                  </h4>


                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">지원담당 선택 (복수 선택, 첫 번째 선택자가 PM)</label>
                    <div className={`grid grid-cols-3 gap-3 p-3 border rounded-lg bg-slate-50 ${errors.supportStaffIds
                      ? 'border-red-500 ring-2 ring-red-500'
                      : 'border-slate-200'
                      }`}>
                      {supportUsers.map(user => (
                        <div
                          key={user.id}
                          onClick={() => {
                            toggleSelection(user.id, 'supportStaffIds');
                            // We can't easily check 'length > 0' here because state update is async, 
                            // but we can clear error optimistically if we are adding? 
                            // Or safer: just clear error if user clicks anything, assuming they are trying to fix it.
                            setErrors(prev => ({ ...prev, supportStaffIds: false }));
                          }}
                          className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${formData.supportStaffIds.includes(user.id)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                            }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${formData.supportStaffIds.includes(user.id) ? 'bg-blue-500' : 'bg-slate-100 text-slate-500'}`}>
                            {user.name.charAt(0)}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold truncate">{user.name}</p>
                            {formData.supportStaffIds[0] === user.id && (
                              <p className="text-[9px] uppercase font-bold text-white/80">Project Manager</p>
                            )}
                          </div>
                          {formData.supportStaffIds.includes(user.id) && (
                            <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                              <Check className="text-blue-600" size={10} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Description & Remarks */}
                <section className="space-y-4">
                  <h4 className="text-sm font-bold text-blue-600 border-b pb-2 flex items-center gap-2">
                    <MessageSquare size={16} /> 프로젝트 설명 및 비고
                  </h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">상세 설명</label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                      rows={3}
                      placeholder="프로젝트의 주요 목표와 업무 범위를 입력하세요"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">비고</label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                      rows={2}
                      placeholder="기타 특이사항"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    />
                  </div>
                </section>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                >
                  {editingProject ? '수정 완료' : '프로젝트 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <DeletionAlert
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        targetName={projects.find(p => p.id === deleteId)?.name || ''}
        targetType="프로젝트"
        dependencies={deleteDependencies}
        canDelete={true}
      />

      {/* Project Detail Modal */}
      {selectedProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Briefcase size={20} className="text-blue-600" /> 프로젝트 상세 정보
              </h3>
              <button
                onClick={() => setSelectedProjectId(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar p-6 bg-slate-50/50">
              {(() => {
                const project = projects.find(p => p.id === selectedProjectId);
                if (!project) return null;
                return (
                  <ProjectDetail
                    project={project}
                    company={companies.find(c => c.id === project.clientId)}
                    users={users}
                    tickets={tickets}
                    isModal={true}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
