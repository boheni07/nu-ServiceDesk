import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useServiceDesk } from '../../hooks/useServiceDesk';
import { api } from '../../services/api';
import { TicketStatus, UserRole } from '../../types';

// Mock the API
vi.mock('../../services/api', () => ({
    api: {
        tickets: {
            getAll: vi.fn(),
            create: vi.fn(),
        },
        projects: {
            getAll: vi.fn(),
        },
        users: {
            getAll: vi.fn(),
        },
        companies: {
            getAll: vi.fn(),
        },
        history: {
            getAll: vi.fn(),
            create: vi.fn(),
        },
        comments: {
            getAll: vi.fn(),
        },
        agencyInfo: {
            get: vi.fn(),
        }
    }
}));

describe('Integration: Ticket Creation Flow', () => {
    const mockUser = {
        id: 'user1',
        name: 'Test User',
        role: UserRole.CUSTOMER,
        userId: 'testuser',
        email: 'test@test.com',
        loginId: 'testuser',
        status: 'ACTIVE' as any
    };

    const mockProject = {
        id: 'p1',
        name: 'Project 1',
        clientId: 'c1',
        customerContactIds: ['user1'],
        supportStaffIds: ['staff1'],
        description: 'Desc',
        status: 'ACTIVE' as any
    };

    const mockStaff = {
        id: 'staff1',
        name: 'Staff One',
        role: UserRole.SUPPORT,
        userId: 'staff1',
        loginId: 'staff1',
        status: 'ACTIVE' as any
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock returns
        (api.tickets.getAll as any).mockResolvedValue([]);
        (api.projects.getAll as any).mockResolvedValue([mockProject]);
        (api.users.getAll as any).mockResolvedValue([mockUser, mockStaff]);
        (api.companies.getAll as any).mockResolvedValue([]);
        (api.history.getAll as any).mockResolvedValue([]);
        (api.comments.getAll as any).mockResolvedValue([]);
        (api.agencyInfo.get as any).mockResolvedValue(null);
    });

    it('should create a ticket and update local state', async () => {
        const { result } = renderHook(() => useServiceDesk(mockUser));

        // Wait for initial load
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const newTicketData = {
            title: 'New Issue',
            description: 'Help needed',
            projectId: 'p1',
            dueDate: '2023-12-31',
            attachments: []
        };

        const mockCreatedTicket = {
            ...newTicketData,
            id: 'T-1234',
            status: TicketStatus.WAITING,
            customerId: 'user1',
            customerName: 'Test User',
            createdAt: '2023-01-01',
            supportId: 'staff1',
            supportName: 'Staff One'
        };

        (api.tickets.create as any).mockResolvedValue(mockCreatedTicket);

        await act(async () => {
            await result.current.createTicket(newTicketData);
        });

        // Verify API was called with correct data
        expect(api.tickets.create).toHaveBeenCalled();
        const callArgs = (api.tickets.create as any).mock.calls[0][0];
        expect(callArgs.title).toBe('New Issue');
        // Check inferred fields logic (e.g. support_id from project)
        expect(callArgs.support_id).toBe('staff1');

        // Verify local state updated
        // Note: useTickets updates state via setTickets(prev => [new, ...prev])
        expect(result.current.tickets).toHaveLength(1);
        expect(result.current.tickets[0].id).toBe('T-1234');

        // Verify history was fetched (sync)
        expect(api.history.getAll).toHaveBeenCalled();
    });
});
