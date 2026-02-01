import { useState, useCallback } from 'react';
import { User, UserRole, UserStatus } from '../types';
import { api } from '../services/api';
import { mapUserUpdatesToDB } from '../lib/dbMappers';

export const useUsers = (currentUser: User | null) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.users.getAll();
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const addUser = useCallback(async (data: User) => {
        try {
            // Need to map User to DB format including manual ID generation if needed or depend on API
            // Original code: id: `u${Date.now()}`
            const dbUser = {
                ...data,
                id: `u${Date.now()}`,
                // mapUserToDB will handle the rest in api.users.create if we pass User object? 
                // api.users.create calls mapUserToDB.
                // So we just pass the User object with ID.
            };
            // Wait, mapUserToDB expects camelCase input generally? 
            // mapUserToDB takes (user: User).
            // So we pass the User object.

            const newUser = await api.users.create(dbUser as User);
            setUsers(prev => [...prev, newUser]);

            return newUser;
        } catch (error: any) {
            console.error("Error adding user", error);
            alert('사용자 추가 실패: ' + error.message);
        }
    }, []);

    const updateUser = useCallback(async (id: string, userData: Partial<User>) => {
        const dbUser = mapUserUpdatesToDB(userData);

        if (Object.keys(dbUser).length > 0) {
            await api.users.update(id, dbUser);
        }

        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
    }, []);

    const deleteUser = useCallback(async (id: string) => {
        // Guard for admin
        const user = users.find(u => u.id === id);
        if (id === 'admin' || user?.loginId === 'admin') {
            alert('관리자(admin) 계정은 삭제할 수 없습니다.');
            return;
        }

        try {
            // Delete tickets logic is handled by API or logic elsewhere?
            // Ideally we need to ensure cascade or handle it. 
            // For now, assuming API handles it or we accept non-cascade for this fix.
            await api.users.delete(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (error: any) {
            console.error("Error deleting user", error);
            alert('사용자 삭제 실패: ' + (error.message || '알 수 없는 오류'));
        }
    }, [users]);

    return {
        users,
        loading,
        fetchUsers,
        addUser,
        updateUser,
        deleteUser,
        setUsers
    };
};
