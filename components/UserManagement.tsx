
import React, { useState } from 'react';
import { User, UserRole, Company, UserStatus, Ticket, Project, AGENCY_COMPANY_ID } from '../types';
import {
  Plus, Edit2, Trash2, X, Search, Shield, User as UserIcon,
  Mail, Phone, Smartphone, Lock, Eye, EyeOff, Building, MessageSquare,
  Power, Users
} from 'lucide-react';
import { formatPhoneNumber, getRoleLabel } from '../utils';
import DeletionAlert from './DeletionAlert';

interface Props {
  users: User[];
  companies: Company[];
  tickets: Ticket[];
  projects: Project[];
  onAdd: (userData: Omit<User, 'id'>) => void;
  onUpdate: (id: string, userData: Partial<User>) => void;
  onDelete: (id: string) => void;
  agencyName: string;
  supportTeams: string[];
}

const UserManagement: React.FC<Props> = ({ users, companies, tickets, projects, onAdd, onUpdate, onDelete, agencyName, supportTeams }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Deletion State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDependencies, setDeleteDependencies] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    loginId: '',
    password: '',
    name: '',
    phone: '',
    mobile: '',
    email: '',
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    companyId: '',
    team: '',
    remarks: ''
  });

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.loginId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      loginId: '',
      password: '',
      name: '',
      phone: '',
      mobile: '',
      email: '',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      companyId: '',
      team: '',
      remarks: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      loginId: user.loginId,
      password: user.password || '',
      name: user.name,
      phone: user.phone || '',
      mobile: user.mobile || '',
      email: user.email || '',
      role: user.role,
      status: user.status,
      companyId: user.companyId || '',
      team: user.team || '',
      remarks: user.remarks || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.loginId || !formData.password || !formData.name) {
      alert('ID, 비밀번호, 성명은 필수 항목입니다.');
      return;
    }
    if (formData.role === UserRole.CUSTOMER && !formData.companyId) {
      alert('고객담당인 경우 고객사 선택은 필수입니다.');
      return;
    }
    if ((formData.role === UserRole.SUPPORT || formData.role === UserRole.SUPPORT_LEAD) && !formData.team) {
      alert('지원담당 또는 지원책임인 경우 소속 지원팀 선택은 필수입니다.');
      return;
    }

    const submissionData = { ...formData };
    if (formData.role !== UserRole.CUSTOMER) {
      // Auto-link to Agency Company
      const agencyCompany = companies.find(c => c.name === agencyName);
      if (agencyCompany) {
        submissionData.companyId = agencyCompany.id;
      } else {
        // Fallback or warning? For now, keep it undefined if not found, but it should exist.
        submissionData.companyId = undefined;
      }
    }

    if (editingUser) {
      onUpdate(editingUser.id, submissionData);
    } else {
      onAdd(submissionData);
    }
    setIsModalOpen(false);
  };

  const handleRequestDelete = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    // Calculate dependencies
    // Calculate dependencies
    const requestedTickets = tickets.filter(t => t.customerId === id);
    const assignedTickets = tickets.filter(t => t.supportId === id);

    // Check if PM of any active project
    const managedProjects = projects.filter(p => p.supportStaffIds[0] === id);

    setDeleteDependencies([
      ...(user.role === UserRole.ADMIN ? [{
        label: '시스템 관리자 권한',
        count: 1,
        items: ['최상위 관리자 계정은 삭제할 수 없습니다.']
      }] : []),
      {
        label: '요청한 티켓',
        count: requestedTickets.length,
        items: requestedTickets.map(t => `[${t.status}] ${t.title}`)
      },
      {
        label: '담당 중인 티켓',
        count: assignedTickets.length,
        items: assignedTickets.map(t => `[${t.status}] ${t.title}`)
      },
      {
        label: '관리 중인 프로젝트 (PM)',
        count: managedProjects.length,
        items: managedProjects.map(p => p.name)
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

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-purple-100 text-purple-700 border-purple-200';
      case UserRole.SUPPORT_LEAD: return 'bg-amber-100 text-amber-700 border-amber-200';
      case UserRole.SUPPORT: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case UserRole.CUSTOMER: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };



  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="성명, ID, 역할 검색..."
            className="pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md"
        >
          <Plus size={18} /> 회원 추가
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">성명</th>
              <th className="px-4 py-3 font-semibold">종류</th>
              <th className="px-4 py-3 font-semibold">상태</th>
              <th className="px-4 py-3 font-semibold">휴대폰</th>
              <th className="px-4 py-3 font-semibold">이메일</th>
              <th className="px-4 py-3 font-semibold">소속 고객사</th>
              <th className="px-4 py-3 font-semibold">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map(user => {
              const isActive = user.status === UserStatus.ACTIVE;
              return (
                <tr key={user.id} className={`hover:bg-slate-50 transition-colors group text-sm ${!isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  <td className="px-4 py-2.5">
                    <span className="text-sm text-slate-500 font-mono tracking-tighter">{user.loginId}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isActive ? 'bg-slate-100 text-slate-500' : 'bg-slate-200 text-slate-400'}`}>
                        {user.name.charAt(0)}
                      </div>
                      <span className={`font-bold ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${getRoleBadge(user.role)}`}>
                      {user.role === UserRole.ADMIN && <Shield size={10} />}
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;

                        // RULE: Activation - Company must be ACTIVE (only for CUSTOMER role)
                        if (newStatus === UserStatus.ACTIVE && user.role === UserRole.CUSTOMER) {
                          const userCompany = companies.find(c => c.id === user.companyId);
                          if (userCompany && userCompany.status === '비활성') {
                            alert(`[활성화 불가] 소속 고객사(${userCompany.name})가 비활성 상태입니다. 고객사를 먼저 활성화해주세요.`);
                            return;
                          }
                        }

                        onUpdate(user.id, { status: newStatus });
                      }}
                      disabled={!isActive && user.role === UserRole.CUSTOMER && companies.find(c => c.id === user.companyId)?.status === '비활성'}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border shadow-sm flex items-center gap-1.5 ${isActive
                        ? 'bg-green-500 text-white border-green-600 hover:bg-green-600'
                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:bg-slate-100'
                        }`}
                    >
                      <Power size={12} className={isActive ? 'text-white' : 'text-slate-400'} />
                      {isActive ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{user.mobile || '-'}</td>
                  <td className="px-4 py-2.5 text-slate-600 truncate max-w-[150px]" title={user.email}>{user.email || '-'}</td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {user.role === UserRole.CUSTOMER
                      ? companies.find(c => c.id === user.companyId)?.name || 'N/A'
                      : <span className="text-slate-600 font-medium">{user.team || agencyName}</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEditModal(user)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="수정">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (user.role === UserRole.ADMIN) return;
                          handleRequestDelete(user.id);
                        }}
                        className={`p-1.5 rounded-md transition-colors ${user.role === UserRole.ADMIN ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                        title={user.role === UserRole.ADMIN ? "관리자 계정은 삭제할 수 없습니다" : "삭제"}
                        disabled={user.role === UserRole.ADMIN}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800">{editingUser ? '회원 정보 수정' : '신규 회원 등록'}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border shadow-sm flex items-center gap-1.5 ${formData.status === UserStatus.ACTIVE
                  ? 'bg-green-500 text-white border-green-600'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                  <Power size={10} className={formData.status === UserStatus.ACTIVE ? 'text-white' : 'text-slate-400'} />
                  {formData.status === UserStatus.ACTIVE ? '활성' : '비활성'}
                </span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar">
              <div className="p-6 space-y-6">

                {/* ID & Password Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ID * (영문숫자 조합)</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        required
                        pattern="[a-zA-Z0-9]+"
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="영문, 숫자만 입력"
                        value={formData.loginId}
                        onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">비밀번호 *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="비밀번호"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>



                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">성명 *</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="성명"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">이메일</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="email"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="example@nu.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">전화번호</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="tel"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="02-XXX-XXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">휴대폰</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="tel"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="010-XXXX-XXXX"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: formatPhoneNumber(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                {/* Role & Company */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">종류 (역할)</label>
                    <select
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                      value={formData.role}
                      onChange={(e) => {
                        const newRole = e.target.value as UserRole;
                        let newTeam = formData.team;
                        // Auto-select first team if switching to Support/Lead and no team selected
                        if ((newRole === UserRole.SUPPORT || newRole === UserRole.SUPPORT_LEAD) && !newTeam && supportTeams.length > 0) {
                          newTeam = supportTeams[0];
                        }
                        setFormData({ ...formData, role: newRole, team: newTeam });
                      }}
                    >
                      <option value={UserRole.CUSTOMER}>고객담당</option>
                      <option value={UserRole.SUPPORT}>지원담당</option>
                      <option value={UserRole.SUPPORT_LEAD}>지원책임</option>
                      <option value={UserRole.ADMIN}>관리자</option>
                    </select>
                  </div>
                  <div>
                    {formData.role === UserRole.CUSTOMER ? (
                      <>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider text-blue-600">
                          소속 고객사 *
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                          <select
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                            value={formData.companyId}
                            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                            required
                          >
                            <option value="">고객사 선택</option>
                            {companies
                              .filter(c => c.id !== AGENCY_COMPANY_ID)
                              .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                      </>
                    ) : (formData.role === UserRole.SUPPORT || formData.role === UserRole.SUPPORT_LEAD) ? (
                      <>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider text-indigo-600">
                          소속 지원팀
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={16} />
                          <select
                            required
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                            value={formData.team}
                            onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                          >
                            {supportTeams.map((team, idx) => <option key={idx} value={team}>{team}</option>)}
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                          소속
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input
                            type="text"
                            disabled
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm"
                            value={agencyName}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">비고</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-slate-400" size={16} />
                    <textarea
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                      rows={3}
                      placeholder="회원 관련 특이사항 기록"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    />
                  </div>
                </div>
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
                  {editingUser ? '수정 완료' : '회원 등록'}
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
        onInactivate={() => {
          if (deleteId) {
            onUpdate(deleteId, { status: UserStatus.INACTIVE });
            setDeleteId(null);
          }
        }}
        targetName={users.find(u => u.id === deleteId)?.name || ''}
        targetType="사용자"
        dependencies={deleteDependencies}
        canDelete={
          !deleteDependencies.some(d => d.count > 0) &&
          users.find(u => u.id === deleteId)?.role !== UserRole.ADMIN
        }
      />
    </div>
  );
};

export default UserManagement;
