import { useState, useCallback } from 'react';
import { Project, ProjectStatus } from '../types';
import { api } from '../services/api';
import { mapProjectUpdatesToDB } from '../lib/dbMappers';

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.projects.getAll();
            setProjects(data);
            return data;
        } catch (error) {
            console.error(error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const addProject = useCallback(async (data: Project) => {
        try {
            const projectWithId = { ...data, id: `p${Date.now()}` }; // Client-side ID
            await api.projects.create(projectWithId);
            setProjects(prev => [...prev, projectWithId]);
        } catch (error) {
            console.error("Error adding project", error);
        }
    }, []);

    const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
        const dbUpdate = mapProjectUpdatesToDB(data);

        try {
            await api.projects.update(id, dbUpdate);
            setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
        } catch (error) {
            console.error("Error updating project", error);
        }
    }, []);

    const deleteProject = useCallback(async (id: string) => {
        try {
            // Again, ticket cleanup?
            await api.projects.delete(id);
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting project", error);
            alert('프로젝트 삭제 중 오류가 발생했습니다.');
        }
    }, []);

    return {
        projects,
        loading,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
        setProjects
    };
};
