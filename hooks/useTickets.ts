import { useState, useCallback, useEffect } from 'react';
import { Ticket, TicketStatus, User, UserRole } from '../types';
import { api } from '../services/api';
import { isOverdue } from '../utils';
import { mapTicketUpdatesToDB } from '../lib/dbMappers';

export const useTickets = (currentUser: User | null) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.tickets.getAll();
            setTickets(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const createTicket = useCallback(async (newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'status'>, projects: any[], users: User[]) => {
        if (!currentUser) return;
        const project = projects.find(p => p.id === newTicketData.projectId);
        const pmId = project?.supportStaffIds[0];
        const pmUser = users.find(u => u.id === pmId);

        const dbTicket = {
            id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
            title: newTicketData.title,
            description: newTicketData.description,
            status: currentUser.role === UserRole.CUSTOMER ? TicketStatus.WAITING : TicketStatus.RECEIVED,
            customer_id: currentUser.id,
            customer_name: currentUser.name,
            support_id: pmId,
            support_name: pmUser?.name,
            project_id: newTicketData.projectId,
            created_at: new Date().toISOString(),
            original_due_date: newTicketData.dueDate,
            due_date: newTicketData.dueDate,
            attachments: newTicketData.attachments
        };

        try {
            const newTicket = await api.tickets.create(dbTicket);
            setTickets(prev => [newTicket, ...prev]);

            // History and Comments handling should ideally be separated or handled via a specialized service/hook composition
            // allowing useTickets to return the new ticket and let the caller handle history?
            // OR useTickets handles history too?
            // Original useServiceDesk handled history creation inside createTicket.
            // For now, let's keep it here or expose a way to add history.
            // However, useTickets shouldn't necessarily know about all history logic.
            // But to keep refactor simple, I might need to import api.history here.

            const historyEntry = {
                id: `h-${Date.now()}`,
                ticketId: newTicket.id,
                status: newTicket.status,
                changedBy: currentUser.name,
                timestamp: new Date().toISOString(),
                note: '티켓이 신규 등록되었습니다.'
            };
            await api.history.create(historyEntry);

            return newTicket;
        } catch (error) {
            console.error("Error creating ticket", error);
        }
    }, [currentUser]);

    const updateTicket = useCallback(async (id: string, updatedData: Partial<Ticket>) => {
        const dbUpdate = mapTicketUpdatesToDB(updatedData);

        try {
            await api.tickets.update(id, dbUpdate);
            setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
        } catch (error) {
            console.error("Error updating ticket", error);
        }
    }, []);

    const updateTicketStatus = useCallback(async (ticketId: string, newStatus: TicketStatus, updates: Partial<Ticket> = {}, note?: string) => {
        if (!currentUser) return;

        const dbUpdate = mapTicketUpdatesToDB({ ...updates, status: newStatus });

        try {
            await api.tickets.update(ticketId, dbUpdate);
            setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updates, status: newStatus } : t));

            // History
            const historyEntry = {
                id: `h-${Date.now()}`,
                ticketId: ticketId,
                status: newStatus,
                changedBy: currentUser.name,
                timestamp: new Date().toISOString(),
                note: note || `상태가 ${newStatus}(으)로 변경되었습니다.`
            };
            await api.history.create(historyEntry);

        } catch (error) {
            console.error("Error updating ticket status", error);
        }
    }, [currentUser]);

    const deleteTicket = useCallback(async (id: string) => {
        try {
            await api.tickets.delete(id);
            setTickets(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error("Error deleting ticket", error);
        }
    }, []);

    // Auto-update overdue status
    useEffect(() => {
        const timer = setInterval(() => {
            setTickets(prev => prev.map(t => {
                if (t.status !== TicketStatus.COMPLETED && t.status !== TicketStatus.DELAYED && isOverdue(t.dueDate)) {
                    return { ...t, status: TicketStatus.DELAYED };
                }
                return t;
            }));
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    return {
        tickets,
        loading,
        fetchTickets,
        createTicket,
        updateTicket,
        updateTicketStatus,
        deleteTicket,
        setTickets // Exposed for specialized usages like restore/reset if needed
    };
};
