import React, { useState } from 'react';
import { Company, CompanyStatus, AGENCY_COMPANY_ID, Project, Ticket, User, UserStatus, ProjectStatus } from '../types';
import { Building2, Plus, Edit2, Trash2, X, Search, MapPin, Briefcase, UserCircle, Power, Check, Phone, FileText, Map as MapIcon } from 'lucide-react';
import DeletionAlert from './DeletionAlert';
import StatusChangeAlert from './StatusChangeAlert';
import { formatPhoneNumber } from '../utils';

const formatBusinessNumber = (value: string): string => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length < 4) return cleaned;
  if (cleaned.length < 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 10)}`;
};

interface Props {
  companies: Company[];
  users: User[];
  projects: Project[];
  tickets: Ticket[];
  onAdd: (companyData: Omit<Company, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, companyData: Partial<Company>) => Promise<boolean>;
  onDelete: (id: string) => void;
}

const CompanyManagement: React.FC<Props> = ({ companies, users, projects, tickets, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Deletion State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDependencies, setDeleteDependencies] = useState<any[]>([]);

  // Status Change State
  const [statusChangeId, setStatusChangeId] = useState<string | null>(null);
  const [statusChangeNewStatus, setStatusChangeNewStatus] = useState<CompanyStatus | null>(null);
  const [statusChangeDependencies, setStatusChangeDependencies] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState<Omit<Company, 'id'>>({
    name: '',
    businessNumber: '',
    representative: '',
    industry: '',
    phone: '',
    zipCode: '',
    address: '',
    remarks: '',
    status: CompanyStatus.ACTIVE
  });

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.businessNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.representative?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      businessNumber: '',
      representative: '',
      industry: '',
      phone: '',
      zipCode: '',
      address: '',
      remarks: '',
      status: CompanyStatus.ACTIVE
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      businessNumber: company.businessNumber || '',
      representative: company.representative || '',
      industry: company.industry || '',
      phone: company.phone || '',
      zipCode: company.zipCode || '',
      address: company.address || '',
      remarks: company.remarks || '',
      status: company.status || CompanyStatus.ACTIVE
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('기관명은 필수 입력 사항입니다.');
      return;
    }

    if (editingCompany) {
      const success = await onUpdate(editingCompany.id, formData);
      if (success) {
        setIsModalOpen(false);
      }
      // If success is false, user cancelled the confirm dialog, so we keep modal open
    } else {
      const success = await onAdd(formData);
      if (success) {
        setIsModalOpen(false);
      }
    }
  };

  const toggleStatus = (newStatus: CompanyStatus) => {
    setFormData(prev => ({ ...prev, status: newStatus }));
  };

  const handleRequestDelete = (id: string) => {
    const company = companies.find(c => c.id === id);
    if (!company) return;

    // Calculate dependencies
    const linkedUsers = users.filter(u => u.companyId === id);
    const linkedProjects = projects.filter(p => p.clientId === id);

    const companyUserIds = linkedUsers.map(u => u.id);
    // Tickets: Find tickets where customer is in this company OR project is in this company
    // Note: Tickets may be duplicated if we check both conditions naively, but tickets belong to project usually.
    // Let's filter unique tickets.
    const projectIds = linkedProjects.map(p => p.id);

    const linkedTickets = tickets.filter(t =>
      projectIds.includes(t.projectId) || companyUserIds.includes(t.customerId)
    );

    setDeleteDependencies([
      {
        label: '소속 사용자',
        count: linkedUsers.length,
        items: linkedUsers.map(u => `${u.name} (${u.loginId})`)
      },
      {
        label: '관련 프로젝트',
        count: linkedProjects.length,
        items: linkedProjects.map(p => p.name)
      },
      {
        label: '관련 티켓',
        count: linkedTickets.length,
        // items: linkedTickets.map(t => `#${t.id} ${t.title}`) // Potentially too many, let DeletionAlert handle slice
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

  const handleRequestStatusChange = (id: string, newStatus: CompanyStatus) => {
    const company = companies.find(c => c.id === id);
    if (!company) return;

    if (newStatus === CompanyStatus.INACTIVE) {
      const linkedUsers = users.filter(u => u.companyId === id);
      const linkedProjects = projects.filter(p => p.clientId === id);

      // RULE: All projects must be inactivatable (no non-completed tickets)
      const projectsWithActiveTickets = linkedProjects.filter(p =>
        tickets.some(t => t.projectId === p.id && t.status !== '완료')
      );

      if (projectsWithActiveTickets.length > 0) {
        const projectNames = projectsWithActiveTickets.map(p => `- ${p.name}`).join('\n');
        alert(`[비활성화 불가] 진행 중인 티켓이 있는 프로젝트가 있어 고객사를 비활성화할 수 없습니다. 모든 하위 프로젝트의 티켓을 완료한 후 다시 시도해주세요.\n\n대상 프로젝트:\n${projectNames}`);
        return;
      }

      const userIds = linkedUsers.map(u => u.id);
      const projectIds = linkedProjects.map(p => p.id);
      const linkedTickets = tickets.filter(t => projectIds.includes(t.projectId) || userIds.includes(t.customerId));

      setStatusChangeDependencies([
        {
          label: '비활성화될 사용자',
          count: linkedUsers.length,
          items: linkedUsers.map(u => `${u.name} (${u.loginId})`)
        },
        {
          label: '비활성화될 프로젝트',
          count: linkedProjects.length,
          items: linkedProjects.map(p => p.name)
        },
        {
          label: '영향을 받는 티켓',
          count: linkedTickets.length,
          items: linkedTickets.map(t => `[${t.status}] ${t.title}`)
        }
      ]);
    } else if (newStatus === CompanyStatus.ACTIVE) {
      const linkedUsers = users.filter(u => u.companyId === id && u.status === UserStatus.INACTIVE);
      const linkedProjects = projects.filter(p => p.clientId === id && p.status === ProjectStatus.INACTIVE);

      setStatusChangeDependencies([
        {
          label: '활성화될 사용자',
          count: linkedUsers.length,
          items: linkedUsers.map(u => `${u.name} (${u.loginId})`)
        },
        {
          label: '활성화될 프로젝트',
          count: linkedProjects.length,
          items: linkedProjects.map(p => p.name)
        }
      ]);
    } else {
      setStatusChangeDependencies([]);
    }

    setStatusChangeId(id);
    setStatusChangeNewStatus(newStatus);
  };

  const confirmStatusChange = () => {
    if (statusChangeId && statusChangeNewStatus) {
      onUpdate(statusChangeId, { status: statusChangeNewStatus });
      setStatusChangeId(null);
      setStatusChangeNewStatus(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="기관명, 대표자, 업종 검색..."
            className="pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md"
        >
          <Plus size={18} /> 고객사 추가
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="px-4 py-3 font-semibold">기관명</th>
              <th className="px-4 py-3 font-semibold">사업자번호</th>
              <th className="px-4 py-3 font-semibold">대표자</th>
              <th className="px-4 py-3 font-semibold">업종</th>
              <th className="px-4 py-3 font-semibold">대표전화</th>
              <th className="px-4 py-3 font-semibold">상태</th>
              <th className="px-4 py-3 font-semibold">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              filteredCompanies.map(company => {
                const isActive = company.status === CompanyStatus.ACTIVE;
                return (
                  <tr key={company.id} className={`hover:bg-slate-50 transition-colors group text-sm ${!isActive ? 'bg-slate-50/50 opacity-60' : ''}`}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-blue-50 text-blue-500' : 'bg-slate-200 text-slate-400'}`}>
                          <Building2 size={16} />
                        </div>
                        <span className={`font-bold ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>{company.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 font-mono text-xs">{company.businessNumber || '-'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{company.representative || '-'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{company.industry || '-'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{company.phone || '-'}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-start">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (company.id === AGENCY_COMPANY_ID) {
                              alert('시스템 운영 기관 정보는 [환경 설정]에서 관리하세요.');
                              return;
                            }
                            const newStatus = company.status === CompanyStatus.ACTIVE ? CompanyStatus.INACTIVE : CompanyStatus.ACTIVE;
                            handleRequestStatusChange(company.id, newStatus);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border shadow-sm flex items-center gap-1.5 ${isActive
                            ? 'bg-green-500 text-white border-green-600 hover:bg-green-600'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 active:scale-95'
                            } ${company.id === AGENCY_COMPANY_ID ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={company.id === AGENCY_COMPANY_ID}
                        >
                          <Power size={12} className={isActive ? 'text-white' : 'text-slate-400'} />
                          {isActive ? '활성' : '비활성'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            if (company.id === AGENCY_COMPANY_ID) {
                              alert('시스템 운영 기관 정보는 수정할 수 없습니다.');
                              return;
                            }
                            handleOpenEditModal(company);
                          }}
                          className={`p-1.5 rounded-md transition-colors ${company.id === AGENCY_COMPANY_ID ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                          title="수정"
                          disabled={company.id === AGENCY_COMPANY_ID}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (company.id === AGENCY_COMPANY_ID) return;
                            handleRequestDelete(company.id);
                          }}
                          className={`p-1.5 rounded-md transition-colors ${company.id === AGENCY_COMPANY_ID ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                          title="삭제"
                          disabled={company.id === AGENCY_COMPANY_ID}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800">{editingCompany ? '고객사 정보 수정' : '신규 고객사 등록'}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border shadow-sm flex items-center gap-1.5 ${formData.status === CompanyStatus.ACTIVE
                  ? 'bg-green-500 text-white border-green-600'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                  <Power size={10} className={formData.status === CompanyStatus.ACTIVE ? 'text-white' : 'text-slate-400'} />
                  {formData.status === CompanyStatus.ACTIVE ? '활성' : '비활성'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">기관명 *</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          required
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-shadow"
                          placeholder="기관명"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">사업자등록번호</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-shadow font-mono"
                          placeholder="000-00-00000"
                          maxLength={12}
                          value={formData.businessNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, businessNumber: formatBusinessNumber(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">대표자</label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          placeholder="대표자명"
                          value={formData.representative}
                          onChange={(e) => setFormData(prev => ({ ...prev, representative: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">업종</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          placeholder="업종명"
                          value={formData.industry}
                          onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">대표전화</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="tel"
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          placeholder="02-0000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhoneNumber(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">우편번호</label>
                      <div className="relative">
                        <MapIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                          placeholder="00000"
                          maxLength={6}
                          value={formData.zipCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value.replace(/\D/g, '') }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">주소</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="기관 주소"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">비고</label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none transition-shadow"
                      rows={3}
                      placeholder="기타 참고 사항"
                      value={formData.remarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95"
                >
                  저장하기
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
        targetName={companies.find(c => c.id === deleteId)?.name || ''}
        targetType="고객사"
        dependencies={deleteDependencies}
        canDelete={true}
      />

      <StatusChangeAlert
        isOpen={!!statusChangeId}
        onClose={() => setStatusChangeId(null)}
        onConfirm={confirmStatusChange}
        targetName={companies.find(c => c.id === statusChangeId)?.name || ''}
        newStatus={statusChangeNewStatus || CompanyStatus.ACTIVE}
        dependencies={statusChangeDependencies}
      />
    </div>
  );
};

// Add to return JSX (before close tag)
/*
      <DeletionAlert
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        targetName={companies.find(c => c.id === deleteId)?.name || ''}
        targetType="고객사"
        dependencies={deleteDependencies}
      />
*/
// Actually, I need to insert it correctly in the JSX.
// The file ends with `</div>` then `);` then `};`.
// I will target the last `</div>` of the component return.


export default CompanyManagement;
