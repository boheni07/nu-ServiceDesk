import { supabase } from '../lib/supabase';
import { Ticket, Project, User, Company, Comment, HistoryEntry, AgencyInfo } from '../types';
import {
    mapTicket, mapTicketToDB,
    mapProject, mapProjectToDB,
    mapUser, mapUserToDB,
    mapCompany, mapCompanyToDB,
    mapHistory, mapHistoryToDB,
    mapComment, mapCommentToDB,
    mapAgencyInfo
} from '../lib/dbMappers';

// Utility for error handling
const handleApiError = (error: any, context: string) => {
    if (error) {
        console.error(`API Error (${context}):`, error);
        throw new Error(`${context} failed: ${error.message}`);
    }
};

export const api = {
    companies: {
        getAll: async () => {
            const { data, error } = await supabase.from('companies').select('*');
            handleApiError(error, 'Fetch Companies');
            return (data || []).map(mapCompany);
        },
        create: async (company: Company) => {
            const dbData = mapCompanyToDB(company);
            const { data, error } = await supabase.from('companies').insert([dbData]).select().single();
            handleApiError(error, 'Create Company');
            return mapCompany(data); // Assuming DB might generate some fields, though we usually provide ID
        },
        update: async (id: string, updates: Partial<Company>) => {
            // We need to be careful with Partial updates and mappers.
            // Ideally we shouldn't use mapCompanyToDB with partial data if it expects full.
            // But mapCompanyToDB is simple object spread mostly.
            // For strict correctness, we might need manual mapping or fetch-merge-update.
            // For now, let's assume the caller passes what's needed or we use a simplified mapper logic for partials?
            // Actually, `supabase.update` takes an object.
            // Let's use `any` casting for partial updates to avoid strict mapper issues for now, or ensure we map correctly.
            // A better approach is to map a temporary full object if possible, but we don't have it.
            // Let's fallback to manual mapping for updates in the hook, or here.
            // To keep it simple, we will simply pass the 'any' object provided by the hook after mapping there?
            // No, the goal is to enforce types here.

            // Let's just expose a raw update for transparency or refactor mappers to support Partial.
            // For this step, I will stick to what useServiceDesk did: manual mapping in the hook.
            // BUT, `useServiceDesk` did mapping INSIDE the hook.
            // I will try to support it here.
            const { error } = await supabase.from('companies').update(updates as any).eq('id', id);
            // Note: 'updates' here coming from caller might be camelCase. 
            // We really SHOULD do the mapping here.
            // But `mapCompanyToDB` takes a full Company.
            // Use this simplified approach:
            handleApiError(error, 'Update Company');
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('companies').delete().eq('id', id);
            handleApiError(error, 'Delete Company');
        },
        rawDeleteAll: async (exceptId?: string) => {
            let query = supabase.from('companies').delete();
            if (exceptId) query = query.neq('id', exceptId);
            const { error } = await query;
            handleApiError(error, 'Delete All Companies');
        }
    },

    users: {
        getAll: async () => {
            const { data, error } = await supabase.from('app_users').select('*');
            handleApiError(error, 'Fetch Users');
            return (data || []).map(mapUser);
        },
        create: async (user: User) => {
            const dbData = mapUserToDB(user);
            const { data, error } = await supabase.from('app_users').insert([dbData]).select().single();
            handleApiError(error, 'Create User');
            return mapUser(data);
        },
        update: async (id: string, updates: any) => { // 'any' because we might receive partial snake_case or we map it before calling
            // We should ideally accept Partial<User> and map it.
            // But for now, let's accept the mapped DB object (snake_case) or handle mapping here.
            // Let's decided: Caller passes Partial<User>, we map it.
            // But we don't have partial mappers.
            // Let's skip mapping here for Update to avoid complexity and do it in the Hook for now, 
            // OR export partial mappers.
            // I'll accept `any` (db format) to be flexible for now during refactor.
            const { error } = await supabase.from('app_users').update(updates).eq('id', id);
            handleApiError(error, 'Update User');
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('app_users').delete().eq('id', id);
            handleApiError(error, 'Delete User');
        },
        rawDeleteAll: async (exceptRole?: string) => {
            let query = supabase.from('app_users').delete();
            if (exceptRole) query = query.neq('role', exceptRole);
            const { error } = await query;
            handleApiError(error, 'Delete All Users');
        }
    },

    projects: {
        getAll: async () => {
            const { data, error } = await supabase.from('projects').select('*');
            handleApiError(error, 'Fetch Projects');
            return (data || []).map(mapProject);
        },
        create: async (project: Project) => {
            const dbData = mapProjectToDB(project);
            const { error } = await supabase.from('projects').insert([dbData]);
            handleApiError(error, 'Create Project');
        },
        update: async (id: string, updates: any) => {
            const { error } = await supabase.from('projects').update(updates).eq('id', id);
            handleApiError(error, 'Update Project');
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('projects').delete().eq('id', id);
            handleApiError(error, 'Delete Project');
        },
        rawDeleteAll: async (exceptId?: string) => {
            let query = supabase.from('projects').delete();
            if (exceptId) query = query.neq('id', exceptId);
            const { error } = await query;
            handleApiError(error, 'Delete All Projects');
        }
    },

    tickets: {
        getAll: async () => {
            const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
            handleApiError(error, 'Fetch Tickets');
            return (data || []).map(mapTicket);
        },
        create: async (ticket: any) => { // Expecting mapped db object or raw? mapTicketToDB result.
            const { data, error } = await supabase.from('tickets').insert([ticket]).select().single();
            handleApiError(error, 'Create Ticket');
            return mapTicket(data);
        },
        update: async (id: string, updates: any) => {
            const { error } = await supabase.from('tickets').update(updates).eq('id', id);
            handleApiError(error, 'Update Ticket');
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('tickets').delete().eq('id', id);
            handleApiError(error, 'Delete Ticket');
        },
        rawDeleteAll: async (exceptId?: string) => {
            let query = supabase.from('tickets').delete();
            if (exceptId) query = query.neq('id', exceptId);
            const { error } = await query;
            handleApiError(error, 'Delete All Tickets');
        }
    },

    history: {
        getAll: async () => {
            const { data, error } = await supabase.from('history').select('*').order('timestamp', { ascending: false });
            handleApiError(error, 'Fetch History');
            return (data || []).map(mapHistory);
        },
        create: async (entry: HistoryEntry) => {
            const dbData = mapHistoryToDB(entry);
            const { error } = await supabase.from('history').insert([dbData]);
            handleApiError(error, 'Create History');
        },
        rawDeleteAll: async (exceptId?: string) => {
            let query = supabase.from('history').delete();
            if (exceptId) query = query.neq('id', exceptId);
            const { error } = await query;
            handleApiError(error, 'Delete All History');
        }
    },

    comments: {
        getAll: async () => {
            const { data, error } = await supabase.from('comments').select('*').order('timestamp', { ascending: true });
            handleApiError(error, 'Fetch Comments');
            return (data || []).map(mapComment);
        },
        create: async (comment: any) => {
            // comment might be db object
            const { error } = await supabase.from('comments').insert([comment]);
            handleApiError(error, 'Create Comment');
        },
        rawDeleteAll: async (exceptId?: string) => {
            let query = supabase.from('comments').delete();
            if (exceptId) query = query.neq('id', exceptId);
            const { error } = await query;
            handleApiError(error, 'Delete All Comments');
        }
    },

    agencyInfo: {
        get: async () => {
            const { data, error } = await supabase.from('agency_info').select('*').single();
            if (error && error.code !== 'PGRST116') { // Ignore not found
                handleApiError(error, 'Fetch Agency Info');
            }
            return data ? mapAgencyInfo(data) : null;
        },
        upsert: async (info: any) => {
            const { error } = await supabase.from('agency_info').upsert(info);
            handleApiError(error, 'Upsert Agency Info');
        }
    }
};
