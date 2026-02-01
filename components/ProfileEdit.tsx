
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import {
  User as UserIcon, Mail, Phone, Smartphone, Lock,
  Eye, EyeOff, Building, MessageSquare, Check, Shield
} from 'lucide-react';
import { formatPhoneNumber, getRoleLabel } from '../utils';

interface Props {
  user: User;
  companyName?: string;
  onUpdate: (userData: Partial<User>) => void;
  onCancel: () => void;
}

const ProfileEdit: React.FC<Props> = ({ user, companyName, onUpdate, onCancel }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: user.name,
    password: user.password || '',
    phone: user.phone || '',
    mobile: user.mobile || '',
    email: user.email || '',
    remarks: user.remarks || ''
  });

  const [errors, setErrors] = useState({ name: false, password: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      name: !formData.name,
      password: !formData.password
    };

    if (newErrors.name || newErrors.password) {
      setErrors(newErrors);
      return;
    }
    onUpdate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 sm:px-0">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-slate-900 px-6 py-10 sm:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] bg-blue-600 flex items-center justify-center text-5xl font-black shadow-2xl border-4 border-slate-800 transform rotate-3 sm:rotate-6">
              {user.name[0]}
            </div>
            <div className="text-center sm:text-left pt-2">
              <h3 className="text-3xl font-black tracking-tight">{user.name}</h3>
              <p className="text-blue-400 font-mono text-sm mt-1">{user.loginId}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-xl text-[10px] font-black border border-slate-700 uppercase tracking-[0.2em]">
                  {getRoleLabel(user.role)}
                </span>
                <span className="px-3 py-1 bg-green-900/40 text-green-400 rounded-xl text-[10px] font-black border border-green-800/40 uppercase tracking-[0.2em]">
                  {user.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-12 space-y-10">
          {/* Account Section */}
          <section className="space-y-6">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-6">
              <Shield size={14} className="text-blue-500" /> Account Security
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">성명 *</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="text"
                    className={`w-full pl-12 pr-4 py-3.5 border rounded-2xl outline-none text-sm bg-slate-50 font-medium transition-all ${errors.name
                      ? 'border-red-500 ring-4 ring-red-500/10'
                      : 'border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'
                      }`}
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (e.target.value) setErrors(prev => ({ ...prev, name: false }));
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">비밀번호 *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-12 pr-12 py-3.5 border rounded-2xl outline-none text-sm bg-slate-50 font-medium transition-all ${errors.password
                      ? 'border-red-500 ring-4 ring-red-500/10'
                      : 'border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'
                      }`}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (e.target.value) setErrors(prev => ({ ...prev, password: false }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider opacity-60 text-[10px]">로그인 ID (수정불가)</label>
                <div className="px-5 py-3.5 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-sm text-slate-400 font-mono italic">
                  {user.loginId}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider opacity-60 text-[10px]">소속 고객사 (수정불가)</label>
                <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-sm text-slate-400 italic">
                  <Building size={16} className="text-slate-300" />
                  {companyName}
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="space-y-6 pt-10 border-t border-slate-100">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-6">
              <Smartphone size={14} className="text-indigo-500" /> Contact Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">휴대폰 번호</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="tel"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm bg-slate-50 font-medium transition-all"
                    placeholder="010-XXXX-XXXX"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: formatPhoneNumber(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">일반 전화번호</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="tel"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm bg-slate-50 font-medium transition-all"
                    placeholder="02-XXX-XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">이메일 주소</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm bg-slate-50 font-medium transition-all"
                  placeholder="example@nu.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">자기소개 / 비고</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea
                  className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm bg-slate-50 font-medium transition-all resize-none leading-relaxed"
                  rows={4}
                  placeholder="추가 정보를 입력하세요."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all text-sm"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm uppercase tracking-widest"
            >
              <Check size={20} /> 정보 업데이트
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
