import { useState, useCallback } from 'react';
import { Company, CompanyStatus } from '../types';
import { api } from '../services/api';
import { mapCompanyUpdatesToDB } from '../lib/dbMappers';

export const useCompanies = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.companies.getAll();
            setCompanies(data);
            return data;
        } catch (error) {
            console.error(error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const addCompany = useCallback(async (data: Company) => {
        try {
            const newId = `c${Date.now()}`;
            const companyWithId = { ...data, id: newId };
            // api.companies.create maps it.
            // Note: api.companies.create calls insert and returns mapped data.
            // But we already set ID. 
            await api.companies.create(companyWithId);
            setCompanies(prev => [...prev, companyWithId]);
            return true;
        } catch (error) {
            console.error('Error adding company:', error);
            alert('고객사 등록 중 오류가 발생했습니다.');
            return false;
        }
    }, []);

    const updateCompany = useCallback(async (id: string, data: Partial<Company>) => {
        try {
            const dbUpdate = mapCompanyUpdatesToDB(data);

            await api.companies.update(id, dbUpdate);
            setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
            return true;
        } catch (error: any) {
            console.error('Error updating company:', error);
            alert(`고객사 정보 수정 실패: ${error.message || '알 수 없는 오류'}`);
            return false;
        }
    }, []);

    const deleteCompany = useCallback(async (id: string) => {
        try {
            await api.companies.delete(id);
            setCompanies(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting company:', error);
            alert('고객사 삭제 중 오류가 발생했습니다.');
        }
    }, []);

    return {
        companies,
        loading,
        fetchCompanies,
        addCompany,
        updateCompany,
        deleteCompany,
        setCompanies
    };
};
