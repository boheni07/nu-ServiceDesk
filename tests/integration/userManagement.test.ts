import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useServiceDesk } from '../../hooks/useServiceDesk';
import { api } from '../../services/api';
import { UserRole } from '../../types';

// Mock API
vi.mock('../../services/api', () => ({
    api: {
        tickets: {
            getAll: vi.fn(),
        },
        projects: {
            getAll: vi.fn(),
        },
        users: {
            getAll: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        companies: {
            getAll: vi.fn(),
        },
        history: {
            getAll: vi.fn(),
        },
        comments: {
            getAll: vi.fn(),
        },
        agencyInfo: {
            get: vi.fn(),
        }
    }
}));

describe('Integration: User Management Flow', () => {
    const adminUser = {
        id: 'admin1',
        name: 'Admin User',
        role: UserRole.ADMIN,
        loginId: 'admin',
        status: 'ACTIVE' as any,
        companyId: 'c1'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (api.tickets.getAll as any).mockResolvedValue([]);
        (api.projects.getAll as any).mockResolvedValue([]);
        (api.users.getAll as any).mockResolvedValue([adminUser]);
        (api.companies.getAll as any).mockResolvedValue([]);
        (api.history.getAll as any).mockResolvedValue([]);
        (api.comments.getAll as any).mockResolvedValue([]);
        (api.agencyInfo.get as any).mockResolvedValue(null);
    });

    it('should add a new user', async () => {
        const { result } = renderHook(() => useServiceDesk(adminUser));

        await waitFor(() => expect(result.current.loading).toBe(false));

        const newUserInput = {
            id: 'u-temp', // Ignored/Overwritten usually
            name: 'New User',
            role: UserRole.CUSTOMER,
            loginId: 'newuser',
            password: 'password',
            status: 'ACTIVE' as any,
            companyId: 'c1'
        };

        const mockCreatedUser = { ...newUserInput, id: 'u-123' };
        (api.users.create as any).mockResolvedValue(mockCreatedUser);

        await act(async () => {
            await result.current.addUser(newUserInput);
        });

        expect(api.users.create).toHaveBeenCalled();
        expect(result.current.users).toContainEqual(mockCreatedUser);
    });

    it('should update a user', async () => {
        const { result } = renderHook(() => useServiceDesk(adminUser));
        await waitFor(() => expect(result.current.loading).toBe(false));

        const updateData = { name: 'Updated Name' };

        await act(async () => {
            await result.current.updateUser('admin1', updateData);
        });

        // Verify API called
        expect(api.users.update).toHaveBeenCalledWith('admin1', expect.objectContaining({ name: 'Updated Name' }));

        // Verify local state updated
        const updatedUser = result.current.users.find(u => u.id === 'admin1');
        expect(updatedUser?.name).toBe('Updated Name');
    });

    it('should delete a user', async () => {
        const { result } = renderHook(() => useServiceDesk(adminUser));
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.deleteUser('admin1');
        });

        expect(api.users.delete).toHaveBeenCalledWith('admin1');
        expect(result.current.users).toHaveLength(0);
    });
});
