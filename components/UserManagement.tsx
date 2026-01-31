
import React, { useState } from 'react';
import { User, UserRole, Company, UserStatus } from '../types';
import {
  Plus, Edit2, Trash2, X, Search, Shield, User as UserIcon,
  Mail, Phone, Smartphone, Lock, Eye, EyeOff, Building, MessageSquare,
  Power
} from 'lucide-react';

interface Props {
  users: User[];
  companies: Company[];
  onAdd: (userData: Omit<User, 'id'>) => void;
  onUpdate: (id: string, userData: Partial<User>) => void;
  onDelete: (id: string) => void;
  agencyName: string;
}

const UserManagement: React.FC<Props> = ({ users, companies, onAdd, onUpdate, onDelete, agencyName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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

    const submissionData = { ...formData };
    if (formData.role !== UserRole.CUSTOMER) {
      submissionData.companyId = undefined;
    }

    if (editingUser) {
      onUpdate(editingUser.id, submissionData);
    } else {
      onAdd(submissionData);
    }
    setIsModalOpen(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-purple-100 text-purple-700 border-purple-200';
      case UserRole.SUPPORT: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case UserRole.CUSTOMER: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="성명, ID, 역할 검색..."
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md"
        >
          <Plus size={18} /> 회원 추가
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="px-6 py-4 font-semibold">ID / 성명</th>
              <th className="px-6 py-4 font-semibold">종류</th>
              <th className="px-6 py-4 font-semibold">상태</th>
              <th className="px-6 py-4 font-semibold">휴대폰</th>
              <th className="px-6 py-4 font-semibold">소속 고객사</th>
              <th className="px-6 py-4 font-semibold text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map(user => {
              const isActive = user.status === UserStatus.ACTIVE;
              return (
                <tr key={user.id} className={`hover:bg-slate-50 transition-colors group text-sm ${!isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${isActive ? 'bg-slate-100 text-slate-500' : 'bg-slate-200 text-slate-400'}`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-bold ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>{user.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono tracking-tighter">{user.loginId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${getRoleBadge(user.role)}`}>
                      {user.role === UserRole.ADMIN && <Shield size={10} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.mobile || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {user.role === UserRole.CUSTOMER
                      ? companies.find(c => c.id === user.companyId)?.name || 'N/A'
                      : <span className="text-slate-600 font-medium">{agencyName}</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEditModal(user)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="수정">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDelete(user.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="삭제">
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
              <h3 className="text-lg font-bold text-slate-800">{editingUser ? '회원 정보 수정' : '신규 회원 등록'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar">
              <div className="p-6 space-y-6">
                {/* Status Selection */}
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Power size={18} className={formData.status === UserStatus.ACTIVE ? 'text-green-500' : 'text-slate-400'} />
                    <span className="text-sm font-bold text-slate-700">회원 상태 설정</span>
                  </div>
                  <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: UserStatus.ACTIVE })}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${formData.status === UserStatus.ACTIVE ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      활성
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: UserStatus.INACTIVE })}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${formData.status === UserStatus.INACTIVE ? 'bg-slate-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      비활성
                    </button>
                  </div>
                </div>

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
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    >
                      <option value={UserRole.CUSTOMER}>고객담당</option>
                      <option value={UserRole.SUPPORT}>지원담당</option>
                      <option value={UserRole.ADMIN}>관리자</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider ${formData.role === UserRole.CUSTOMER ? 'text-blue-600' : ''}`}>
                      소속 고객사 {formData.role === UserRole.CUSTOMER ? '*' : ''}
                    </label>
                    <div className="relative">
                      <Building className={`absolute left-3 top-1/2 -translate-y-1/2 ${formData.role === UserRole.CUSTOMER ? 'text-blue-400' : 'text-slate-300'}`} size={16} />
                      <select
                        disabled={formData.role !== UserRole.CUSTOMER}
                        className={`w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400`}
                        value={formData.companyId}
                        onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                        required={formData.role === UserRole.CUSTOMER}
                      >
                        <option value="">고객사 선택</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
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
    </div>
  );
};

export default UserManagement;
