import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isSupport: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUserLocal] = useState<User | null>(null);

    // Load user from localStorage on init
    useEffect(() => {
        const savedUser = localStorage.getItem('nu_servicedesk_user');
        if (savedUser) {
            try {
                setCurrentUserLocal(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse saved user', e);
                localStorage.removeItem('nu_servicedesk_user');
            }
        }
    }, []);

    const setCurrentUser = (user: User | null) => {
        setCurrentUserLocal(user);
        if (user) {
            localStorage.setItem('nu_servicedesk_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('nu_servicedesk_user');
        }
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        setCurrentUser,
        logout,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === UserRole.ADMIN,
        isSupport: currentUser?.role === UserRole.SUPPORT || currentUser?.role === UserRole.SUPPORT_LEAD || currentUser?.role === UserRole.ADMIN,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
