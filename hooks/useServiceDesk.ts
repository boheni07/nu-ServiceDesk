import { useState, useEffect, useMemo, useCallback } from 'react';
import { UserRole, Ticket, TicketStatus, User, Project, Company, Comment, HistoryEntry, AgencyInfo } from '../types';
import { isOverdue } from '../utils';
import { initialCompanies, initialUsers, initialProjects, getInitialTickets, initialAgencyInfo, generateSampleHistory } from '../sampleDataGenerator';

export const useServiceDesk = () => {
    const [currentUser, setCurrentUser] = useState<User>(initialUsers[1]);
    const [companies, setCompanies] = useState<Company[]>(initialCompanies);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [agencyInfo, setAgencyInfo] = useState<AgencyInfo>(initialAgencyInfo);

    // Initial Data Load
    useEffect(() => {
        const now = new Date();
        const sampleTickets = getInitialTickets(now);
        const sampleHistory = generateSampleHistory(sampleTickets);

        setTickets(sampleTickets);
        setHistory(sampleHistory);
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

    // Filtered Data based on permissions
    const filteredProjects = useMemo(() => {
        if (currentUser.role === UserRole.ADMIN) return projects;
        if (currentUser.role === UserRole.SUPPORT) {
            return projects.filter(p => p.supportStaffIds.includes(currentUser.id));
        }
        return projects.filter(p => p.customerContactIds.includes(currentUser.id));
    }, [projects, currentUser]);

    const filteredTickets = useMemo(() => {
        if (currentUser.role === UserRole.ADMIN) return tickets;
        const accessibleProjectIds = filteredProjects.map(p => p.id);
        return tickets.filter(t => accessibleProjectIds.includes(t.projectId));
    }, [tickets, filteredProjects, currentUser]);

    // Actions
    const createTicket = useCallback((newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'status'>) => {
        const project = projects.find(p => p.id === newTicketData.projectId);
        const pmId = project?.supportStaffIds[0];
        const pmUser = users.find(u => u.id === pmId);

        const ticket: Ticket = {
            ...newTicketData,
            id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
            createdAt: new Date().toISOString(),
            status: currentUser.role === UserRole.CUSTOMER ? TicketStatus.WAITING : TicketStatus.RECEIVED,
            supportId: pmId,
            supportName: pmUser?.name,
        };

        setTickets(prev => [ticket, ...prev]);
        setHistory(prev => [{
            id: `h-${Date.now()}`,
            ticketId: ticket.id,
            status: ticket.status,
            changedBy: currentUser.name,
            timestamp: new Date().toISOString(),
            note: '티켓이 신규 등록되었습니다.'
        }, ...prev]);

        return ticket;
    }, [projects, users, currentUser]);

    const updateTicket = useCallback((id: string, updatedData: Partial<Ticket>) => {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
        setHistory(prev => [{
            id: `h-${Date.now()}`,
            ticketId: id,
            status: tickets.find(t => t.id === id)?.status || TicketStatus.WAITING,
            changedBy: currentUser.name,
            timestamp: new Date().toISOString(),
            note: '티켓 정보가 수정되었습니다.'
        }, ...prev]);
    }, [tickets, currentUser]);

    const deleteTicket = useCallback((id: string) => {
        setTickets(prev => prev.filter(t => t.id !== id));
        setHistory(prev => prev.filter(h => h.ticketId !== id));
        setComments(prev => prev.filter(c => c.ticketId !== id));
    }, []);

    const updateTicketStatus = useCallback((ticketId: string, newStatus: TicketStatus, updates: Partial<Ticket> = {}, note?: string) => {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updates, status: newStatus } : t));
        setHistory(prev => [{
            id: `h-${Date.now()}`,
            ticketId,
            status: newStatus,
            changedBy: currentUser.name,
            timestamp: new Date().toISOString(),
            note: note || `상태가 ${newStatus}(으)로 변경되었습니다.`
        }, ...prev]);
    }, [currentUser]);

    const addComment = useCallback((commentData: Omit<Comment, 'id' | 'timestamp'>) => {
        setComments(prev => [{ ...commentData, id: `c-${Date.now()}`, timestamp: new Date().toISOString() }, ...prev]);
    }, []);

    const updateUser = useCallback((id: string, userData: Partial<User>) => {
        setUsers(prev => {
            const updated = prev.map(u => u.id === id ? { ...u, ...userData } : u);
            if (id === currentUser.id) {
                // Need to update current user ref if it's the one being edited, 
                // but setState is async. We'll handle this sidebar effect in the component or via a separate effect if strictly needed.
                // For now, simpler to just update the local state too if we want immediate reflection, 
                // BUT 'currentUser' state in hook might get stale if we just depend on 'users' state update.
                // Actually, we should explicitely update currentUser state here if needed.
                return updated;
            }
            return updated;
        });

        if (id === currentUser.id) {
            setCurrentUser(prev => ({ ...prev, ...userData }));
        }
    }, [currentUser]);

    const applyState = useCallback((newState: {
        companies: Company[];
        users: User[];
        projects: Project[];
        tickets: Ticket[];
        comments: Comment[];
        history: HistoryEntry[];
        agencyInfo?: AgencyInfo;
    }) => {
        setCompanies(newState.companies);
        setUsers(newState.users);
        setProjects(newState.projects);
        setTickets(newState.tickets);
        setComments(newState.comments);
        setHistory(newState.history);
        if (newState.agencyInfo) setAgencyInfo(newState.agencyInfo);

        const foundUser = newState.users.find(u => u.id === currentUser.id) || newState.users[0];
        setCurrentUser(foundUser);
    }, [currentUser]);

    // Setters for direct manipulation (admin mostly)
    const addCompany = useCallback((data: Company) => setCompanies(prev => [...prev, { ...data, id: `c${Date.now()}` }]), []);
    const updateCompany = useCallback((id: string, data: Partial<Company>) => setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...data } : c)), []);
    const deleteCompany = useCallback((id: string) => setCompanies(prev => prev.filter(c => c.id !== id)), []);

    const addUser = useCallback((data: User) => setUsers(prev => [...prev, { ...data, id: `u${Date.now()}` }]), []);
    const deleteUser = useCallback((id: string) => setUsers(prev => prev.filter(u => u.id !== id)), []);

    const addProject = useCallback((data: Project) => setProjects(prev => [...prev, { ...data, id: `p${Date.now()}` }]), []);
    const updateProject = useCallback((id: string, data: Partial<Project>) => setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p)), []);
    const deleteProject = useCallback((id: string) => setProjects(prev => prev.filter(p => p.id !== id)), []);

    return {
        // State
        currentUser,
        companies,
        users,
        projects,
        tickets,
        comments,
        history,
        agencyInfo,
        // Derived
        filteredProjects,
        filteredTickets,
        // Actions
        setCurrentUser,
        createTicket,
        updateTicket,
        deleteTicket,
        updateTicketStatus,
        addComment,
        updateUser,
        addUser,
        deleteUser,
        addCompany,
        updateCompany,
        deleteCompany,
        addProject,
        updateProject,
        deleteProject,
        applyState,
        setAgencyInfo
    };
};
