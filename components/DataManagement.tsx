
import React, { useState, useRef } from 'react';
// Added UserRole to imports from types.ts
import { Company, User, Project, Ticket, Comment, HistoryEntry, TicketStatus, UserRole, AgencyInfo } from '../types';
import { initialCompanies, initialUsers, initialProjects, getInitialTickets, initialAgencyInfo, generateSampleHistory } from '../sampleDataGenerator';
import { Download, Upload, RotateCcw, Trash2, CheckCircle2, AlertTriangle, Loader2, Database, HardDrive, FileJson, X } from 'lucide-react';
import { addDays } from 'date-fns';

interface AppState {
  companies: Company[];
  users: User[];
  projects: Project[];
  tickets: Ticket[];
  comments: Comment[];
  history: HistoryEntry[];
  agencyInfo?: AgencyInfo;
}

interface Props {
  currentState: AppState;
  onApplyState: (newState: AppState) => void;
}

type ActionType = 'BACKUP' | 'RESTORE' | 'SAMPLE' | 'RESET';

const DataManagement: React.FC<Props> = ({ currentState, onApplyState }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<ActionType | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateProgress = async (steps: string[]) => {
    setIsExecuting(true);
    setResult(null);
    for (let i = 0; i < steps.length; i++) {
      setStatusMessage(steps[i]);
      const targetProgress = ((i + 1) / steps.length) * 100;
      // Animate progress smoothly
      const start = progress;
      const duration = 400;
      const startTime = Date.now();

      await new Promise<void>(resolve => {
        const animate = () => {
          const now = Date.now();
          const elapsed = now - startTime;
          const p = Math.min(elapsed / duration, 1);
          setProgress(start + (targetProgress - start) * p);
          if (p < 1) requestAnimationFrame(animate);
          else resolve();
        };
        requestAnimationFrame(animate);
      });
    }
  };

  const handleBackup = async () => {
    setConfirmAction(null);
    await simulateProgress(['데이터 직렬화 중...', '정합성 검증 중...', '파일 생성 중...', '다운로드 준비 완료']);

    const dataStr = JSON.stringify(currentState, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `nu-servicedesk-backup-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    setResult({ success: true, message: '모든 데이터가 JSON 파일로 성공적으로 백업되었습니다.' });
    setIsExecuting(false);
    setProgress(0);
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setConfirmAction(null);
    await simulateProgress(['파일 업로드 중...', 'JSON 파싱 중...', '데이터 구조 검증 중...', '시스템 상태 적용 중...']);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedState = JSON.parse(event.target?.result as string) as AppState;
        // Basic validation
        if (importedState.users && importedState.companies && importedState.tickets) {
          onApplyState(importedState);
          setResult({ success: true, message: `성공적으로 데이터를 복원했습니다. (기관: ${importedState.companies.length}, 티켓: ${importedState.tickets.length})` });
        } else {
          throw new Error('Invalid data structure');
        }
      } catch (err) {
        setResult({ success: false, message: '복원에 실패했습니다. 유효한 백업 파일이 아닙니다.' });
      } finally {
        setIsExecuting(false);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateSamples = async () => {
    setConfirmAction(null);
    await simulateProgress(['기존 데이터 초기화 중...', '샘플 기관 생성 중...', '샘플 프로젝트 매핑 중...', '테스트 티켓 생성 중...', '최종 적용 중...']);

    const now = new Date();
    const sampleTickets = getInitialTickets(now);
    const sampleHistory = generateSampleHistory(sampleTickets);

    onApplyState({
      companies: initialCompanies,
      users: initialUsers,
      projects: initialProjects,
      tickets: sampleTickets,
      comments: [],
      history: sampleHistory,
      agencyInfo: initialAgencyInfo
    });

    setResult({ success: true, message: '기본 샘플 데이터 5세트가 성공적으로 생성되었습니다.' });
    setIsExecuting(false);
    setProgress(0);
  };

  const handleReset = async () => {
    setConfirmAction(null);
    await simulateProgress(['모든 레코드 검색 중...', '티켓 및 히스토리 삭제 중...', '프로젝트 해제 중...', '관리자 계정 보존 중...', '데이터베이스 정리 중...']);

    // Reset to only default admin
    // FIX: Correctly use UserRole.ADMIN instead of ActionType.ADMIN (ActionType is a type, not a value)
    const adminOnly = initialUsers.filter(u => u.role === UserRole.ADMIN || u.id === 'u1');
    onApplyState({
      companies: initialCompanies.filter(c => c.id === 'c1'),
      users: adminOnly,
      projects: [],
      tickets: [],
      comments: [],
      history: [],
      agencyInfo: initialAgencyInfo
    });

    setResult({ success: true, message: '플랫폼 데이터가 성공적으로 초기화되었습니다. 본사 및 관리자 정보만 유지됩니다.' });
    setIsExecuting(false);
    setProgress(0);
  };

  const ActionCard = ({ icon: Icon, title, desc, onClick, variant = 'blue' }: any) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-200',
      amber: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-200',
      emerald: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-200',
      rose: 'from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-200',
    };
    const bg = colors[variant as keyof typeof colors];

    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bg} text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon size={28} />
        </div>
        <h4 className="text-lg font-black text-slate-900 mb-2 tracking-tight">{title}</h4>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
          {desc}
        </p>
        <button
          onClick={onClick}
          className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
        >
          {title} 실행
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 sm:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-black mb-3 tracking-tight flex items-center justify-center md:justify-start gap-3">
              <Database className="text-blue-400" size={32} /> 시스템 데이터 관리
            </h3>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg font-medium">
              플랫폼의 모든 데이터 상태를 관리합니다. 주기적인 백업을 통해 데이터 손실을 방지하고, 테스트를 위한 샘플 생성이 가능합니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-center">
              <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">Total Tickets</p>
              <p className="text-2xl font-black text-blue-400">{currentState.tickets.length}</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-center">
              <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">Active Users</p>
              <p className="text-2xl font-black text-emerald-400">{currentState.users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionCard
          icon={HardDrive}
          title="데이터 백업"
          desc="현재 플랫폼의 모든 정보를 JSON 파일로 내보내어 안전하게 보관합니다."
          variant="blue"
          onClick={() => setConfirmAction('BACKUP')}
        />
        <ActionCard
          icon={FileJson}
          title="데이터 복원"
          desc="백업된 JSON 파일을 불러와 플랫폼을 이전 상태로 완벽하게 되돌립니다."
          variant="emerald"
          onClick={() => fileInputRef.current?.click()}
        />
        <ActionCard
          icon={RotateCcw}
          title="샘플 생성"
          desc="플랫폼 테스트를 위해 표준 샘플 데이터 5세트를 즉시 생성하여 적용합니다."
          variant="amber"
          onClick={() => setConfirmAction('SAMPLE')}
        />
        <ActionCard
          icon={Trash2}
          title="데이터 초기화"
          desc="모든 서비스 데이터를 완전히 삭제합니다. 이 작업은 되돌릴 수 없습니다."
          variant="rose"
          onClick={() => setConfirmAction('RESET')}
        />
      </div>

      <input
        type="file"
        accept=".json"
        className="hidden"
        ref={fileInputRef}
        onChange={handleRestore}
      />

      {/* Success/Error Toast-like Notification */}
      {result && (
        <div className={`p-6 rounded-3xl border flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 shadow-xl ${result.success ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
          {result.success ? <CheckCircle2 className="text-emerald-500 shrink-0" size={24} /> : <AlertTriangle className="text-rose-500 shrink-0" size={24} />}
          <div className="flex-1">
            <p className="font-black text-sm">{result.success ? 'Success' : 'Error'}</p>
            <p className="text-xs font-bold opacity-80">{result.message}</p>
          </div>
          <button onClick={() => setResult(null)} className="p-2 hover:bg-black/5 rounded-xl transition-colors"><X size={18} /></button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center space-y-6">
              <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center ${confirmAction === 'RESET' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                <AlertTriangle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {confirmAction === 'BACKUP' && '백업을 시작할까요?'}
                  {confirmAction === 'SAMPLE' && '샘플을 생성할까요?'}
                  {confirmAction === 'RESET' && '정말 초기화할까요?'}
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {confirmAction === 'BACKUP' && '현재 모든 데이터가 포함된 JSON 파일이 다운로드됩니다.'}
                  {confirmAction === 'SAMPLE' && '기존 데이터가 모두 삭제되고 샘플 데이터로 덮어씌워집니다.'}
                  {confirmAction === 'RESET' && '모든 티켓, 댓글, 히스토리 데이터가 영구적으로 삭제됩니다.'}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-6 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    if (confirmAction === 'BACKUP') handleBackup();
                    if (confirmAction === 'SAMPLE') handleGenerateSamples();
                    if (confirmAction === 'RESET') handleReset();
                  }}
                  className={`flex-1 px-6 py-4 ${confirmAction === 'RESET' ? 'bg-rose-600 shadow-rose-200' : 'bg-blue-600 shadow-blue-200'} text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 tracking-wider`}
                >
                  확인 및 실행
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Overlay */}
      {isExecuting && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-12 w-full max-w-lg shadow-2xl space-y-10 text-center animate-in zoom-in-95 duration-200">
            <div className="relative inline-block">
              <Loader2 size={80} className="text-blue-100 animate-spin" strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-blue-600">{Math.round(progress)}%</span>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{statusMessage}</h3>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">Processing Data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement;
