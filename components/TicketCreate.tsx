import React, { useState, useMemo } from 'react';
import { Project, User, Ticket, UserRole, IntakeMethod, Company } from '../types';
import { addBusinessDays } from '../utils';
import { Paperclip, Calendar, X, Check, Phone, HelpCircle, FileText, Building2, User as UserIcon, Mail } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';

interface Props {
  projects: Project[];
  currentUser: User;
  users: User[];
  companies: Company[];
  initialData?: Ticket;
  onSubmit: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'status'>) => void;
  onCancel: () => void;
}

const ALLOWED_EXTENSIONS = ".pdf,.doc,.docx,.xlsx,.xls,.pptx,.ppt,.png,.jpg,.jpeg,.gif,.webp,.hwp,.txt";

const TicketCreate: React.FC<Props> = ({ projects, currentUser, users, companies, initialData, onSubmit, onCancel }) => {
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isSupport = currentUser.role === UserRole.SUPPORT;

  const filteredProjects = useMemo(() => {
    if (isAdmin) return projects;
    if (isSupport) {
      return projects.filter(p => p.supportStaffIds.includes(currentUser.id));
    }
    return projects.filter(p => p.customerContactIds.includes(currentUser.id));
  }, [projects, currentUser, isAdmin, isSupport]);

  const defaultDueDate = useMemo(() => addBusinessDays(new Date(), 5), []);
  const normalizedDefault = startOfDay(defaultDueDate);

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [projectId, setProjectId] = useState(initialData?.projectId || filteredProjects[0]?.id || '');
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate ? format(new Date(initialData.dueDate), 'yyyy-MM-dd') : format(defaultDueDate, 'yyyy-MM-dd')
  );
  const [dueReason, setDueReason] = useState(initialData?.shortenedDueReason || '');
  const [files, setFiles] = useState<File[]>([]);

  const [intakeMethod, setIntakeMethod] = useState<IntakeMethod>(initialData?.intakeMethod || IntakeMethod.PHONE);
  const [requestDate, setRequestDate] = useState(
    initialData?.requestDate ? format(new Date(initialData.requestDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );

  const selectedProjectDetails = useMemo(() => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    const company = companies.find(c => c.id === project.clientId);
    const contacts = project.customerContactIds.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];

    return { project, company, contacts };
  }, [projectId, projects, companies, users]);

  const isShortened = useMemo(() => {
    const selected = startOfDay(new Date(dueDate));
    return isBefore(selected, normalizedDefault);
  }, [dueDate, normalizedDefault]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !projectId || (isShortened && !dueReason)) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    const payload: Omit<Ticket, 'id' | 'createdAt' | 'status'> = {
      title,
      description,
      projectId,
      customerId: initialData?.customerId || currentUser.id,
      customerName: initialData?.customerName || currentUser.name,
      dueDate: new Date(dueDate).toISOString(),
      originalDueDate: new Date(dueDate).toISOString(),
      shortenedDueReason: isShortened ? dueReason : undefined,
      attachments: files.length > 0 ? files.map(f => f.name) : initialData?.attachments,
    };

    if (isSupport || isAdmin) {
      payload.intakeMethod = intakeMethod;
      payload.requestDate = new Date(requestDate).toISOString();
    }

    onSubmit(payload);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-5 sm:p-8 lg:p-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">프로젝트 선택 *</label>
              <select
                className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-slate-50 transition-all text-sm font-medium"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
              >
                <option value="">프로젝트를 선택하세요</option>
                {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              {/* Selected Project Info */}
              {selectedProjectDetails && (
                <div className="mt-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        <Building2 size={12} className="text-blue-500" /> 고객사
                      </h4>
                      <p className="text-sm font-bold text-slate-700">
                        {selectedProjectDetails.company?.name || '정보 없음'}
                      </p>
                    </div>
                    <div>
                      <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        <UserIcon size={12} className="text-indigo-500" /> 고객 담당자
                      </h4>
                      {selectedProjectDetails.contacts.length > 0 ? (
                        <div className="space-y-3">
                          {selectedProjectDetails.contacts.map(contact => (
                            <div key={contact.id} className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-700">{contact.name}</span>
                                {contact.role === UserRole.CUSTOMER && <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-600 font-bold">고객</span>}
                              </div>
                              <div className="flex flex-col gap-0.5 text-xs text-slate-500 font-medium pl-0.5">
                                {(contact.mobile || contact.phone) && (
                                  <div className="flex items-center gap-1.5">
                                    <Phone size={10} className="shrink-0 opacity-70" /> {contact.mobile || contact.phone}
                                  </div>
                                )}
                                {contact.email && (
                                  <div className="flex items-center gap-1.5">
                                    <Mail size={10} className="shrink-0 opacity-70" /> {contact.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">지정된 담당자 없음</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">제목 *</label>
              <input
                type="text"
                placeholder="요청 제목을 입력하세요"
                className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-slate-50 transition-all text-sm font-medium"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">요청 상세 *</label>
              <div className="relative border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all bg-slate-50">
                <textarea
                  rows={8}
                  placeholder="요청 내용을 상세히 기재해주세요."
                  className="w-full px-5 py-4 bg-transparent outline-none resize-none text-sm leading-relaxed"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <div className="p-4 bg-white/50 border-t border-slate-200/50">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText size={14} /> 첨부 파일 (문서, PR, 엑셀, 그림)
                    </p>
                    <label className="px-4 py-2 bg-white hover:bg-slate-50 rounded-xl cursor-pointer transition-colors border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Paperclip size={14} />
                      <span>파일 선택</span>
                      <input type="file" multiple accept={ALLOWED_EXTENSIONS} className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
                      {files.map((f, i) => (
                        <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-xl border border-blue-100 shadow-sm">
                          <span className="max-w-[150px] truncate">{f.name}</span>
                          <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => removeFile(i)} />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:space-y-8">
            {(isSupport || isAdmin) && (
              <div className="bg-indigo-50/50 p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-sm">
                <h3 className="text-sm font-bold text-indigo-800 mb-6 flex items-center gap-2.5">
                  <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600"><Phone size={16} /></div> 지원 정보
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-indigo-400 mb-2.5 uppercase tracking-widest">접수 방법 *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(IntakeMethod).map((method) => (
                        <button key={method} type="button" onClick={() => setIntakeMethod(method)} className={`px-3 py-3 rounded-xl text-xs font-bold border transition-all ${intakeMethod === method ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-indigo-400 border-indigo-100'}`}>{method}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600"><Calendar size={16} /></div> 기한 설정
              </h3>
              <div className="space-y-6">
                <input type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none bg-white text-sm font-medium" value={dueDate} min={format(new Date(), 'yyyy-MM-dd')} onChange={(e) => setDueDate(e.target.value)} />
                {isShortened && (
                  <textarea rows={3} placeholder="기한 단축 사유를 입력하세요." className="w-full px-4 py-3 border border-rose-200 rounded-xl text-xs bg-white resize-none" value={dueReason} onChange={(e) => setDueReason(e.target.value)} />
                )}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-blue-600 text-white text-[11px] flex gap-4">
              <HelpCircle className="shrink-0 opacity-80" size={20} />
              <div className="font-medium">
                <p className="font-black mb-1.5 uppercase tracking-wider opacity-80">안내사항</p>
                <p className="opacity-90 leading-relaxed">등록된 티켓은 지원팀 검토 후 '접수' 상태로 전환됩니다. 모든 대화 이력과 파일은 안전하게 보존됩니다.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-8 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-8 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all text-sm">취소</button>
          <button type="submit" className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl transition-all flex items-center gap-2 text-sm uppercase tracking-widest leading-none"><Check size={20} /> 티켓 등록 완료</button>
        </div>
      </form>
    </div>
  );
};

export default TicketCreate;
