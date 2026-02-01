import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, LogIn, ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginScreenProps {
    users: User[];
    loading: boolean;
    onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, loading, onLogin }) => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setIsSubmitting(true);

        setTimeout(() => {
            if (!loginId || !password) {
                setLoginError('아이디와 비밀번호를 입력해주세요.');
                setIsSubmitting(false);
                return;
            }

            // Find User
            let user = users.find(u => u.loginId === loginId && u.password === password);

            // Bootstrap Fallback: If DB is empty, allow hardcoded Admin to login so they can seed data
            if (!user && users.length === 0 && loginId === 'admin1' && password === 'password123') {
                user = {
                    id: 'u1',
                    loginId: 'admin1',
                    password: 'password123',
                    name: '관리자(Admin)',
                    role: 'ADMIN' as any,
                    status: 'ACTIVE' as any,
                    mobile: '010-0000-0000',
                    email: 'admin@nu.com',
                    companyId: 'c1'
                } as User;
            }

            if (user) {
                if (user.status !== 'ACTIVE') {
                    setLoginError('비활성화된 계정입니다. 관리자에게 문의하세요.');
                    setIsSubmitting(false);
                    return;
                }
                onLogin(user);
            } else {
                setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.');
                setIsSubmitting(false);
            }
        }, 500); // Small delay for UX
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <Loader2 className="animate-spin mb-4" size={32} />
                <span className="font-bold tracking-widest uppercase text-xs opacity-50">System Loading...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />

            <div className="w-full max-w-md z-10">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-8 pb-4 text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">nu ServiceDesk</h1>
                        <p className="text-slate-400 text-sm font-medium">서비스 데스크 통합 관리 시스템</p>
                    </div>

                    <form onSubmit={handleLogin} className="p-8 space-y-5">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Admin ID</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    className="w-full bg-slate-800/50 border border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none rounded-2xl py-3.5 pl-12 pr-4 text-white font-medium transition-all placeholder:text-slate-600"
                                    placeholder="아이디를 입력하세요"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-slate-800/50 border border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none rounded-2xl py-3.5 pl-12 pr-12 text-white font-medium transition-all placeholder:text-slate-600"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {loginError && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold rounded-2xl animate-shake">
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    <span>로그인</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="p-8 pt-0 text-center">
                        <div className="h-px bg-white/10 w-full mb-6" />
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            관리자 권한이 필요합니다.<br />
                            초기 계정 정보: <span className="text-blue-400">admin1 / password123</span>
                        </p>
                    </div>
                </div>
                <p className="mt-8 text-center text-slate-600 text-[11px] font-bold uppercase tracking-[0.2em]">
                    © 2026 NuBiz Technology Corporate
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;

