"use client";

/**
 * AuthContext - Contexto de autenticação (simulado, sem backend)
 * Gerencia estado de login, perfil ativo e logout
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useEffect } from "react";
import type { UserProfile, Usuario } from "@/types";
import { useIdleLogout } from "@/hooks/useIdleLogout";

interface AuthContextData {
    isAuthInitialized: boolean;
    isAuthenticated: boolean;
    currentProfile: UserProfile;
    currentUser: Usuario | null;
    login: (profile?: UserProfile) => void;
    logout: () => void;
    switchProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);
const AUTH_SESSION_KEY = "sgcs_auth_session";

/** Usuário mock para simulação */
const MOCK_USER: Usuario = {
    id: "user-001",
    nome: "Administrador SESC",
    email: "admin@sescma.com.br",
    perfil: "admin",
    ativo: true,
    ultimoAcesso: new Date().toISOString(),
    departamento: "Compras",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthInitialized, setIsAuthInitialized] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentProfile, setCurrentProfile] = useState<UserProfile>("admin");
    const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

    useEffect(() => {
        try {
            const savedSession = sessionStorage.getItem(AUTH_SESSION_KEY);

            if (savedSession) {
                const parsed = JSON.parse(savedSession) as {
                    isAuthenticated?: boolean;
                    currentProfile?: UserProfile;
                    currentUser?: Usuario | null;
                };

                if (parsed.isAuthenticated) {
                    const profile = parsed.currentProfile ?? "admin";
                    setIsAuthenticated(true);
                    setCurrentProfile(profile);
                    setCurrentUser(parsed.currentUser ?? { ...MOCK_USER, perfil: profile });
                }
            }
        } catch {
            sessionStorage.removeItem(AUTH_SESSION_KEY);
        } finally {
            setIsAuthInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (!isAuthInitialized) return;

        if (isAuthenticated) {
            sessionStorage.setItem(
                AUTH_SESSION_KEY,
                JSON.stringify({
                    isAuthenticated: true,
                    currentProfile,
                    currentUser,
                })
            );
        } else {
            sessionStorage.removeItem(AUTH_SESSION_KEY);
        }
    }, [isAuthInitialized, isAuthenticated, currentProfile, currentUser]);

    const login = useCallback((profile: UserProfile = "admin") => {
        setIsAuthenticated(true);
        setCurrentProfile(profile);
        setCurrentUser({ ...MOCK_USER, perfil: profile });
    }, []);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setCurrentProfile("admin");
        setCurrentUser(null);
    }, []);

    const switchProfile = useCallback((profile: UserProfile) => {
        setCurrentProfile(profile);
        if (currentUser) {
            setCurrentUser({ ...currentUser, perfil: profile });
        }
    }, [currentUser]);

    // RNF-004: Logout automático por inatividade (15 min)
    useIdleLogout({
        onIdle: logout,
        enabled: isAuthenticated,
    });

    const value = useMemo(
        () => ({
            isAuthInitialized,
            isAuthenticated,
            currentProfile,
            currentUser,
            login,
            logout,
            switchProfile,
        }),
        [isAuthInitialized, isAuthenticated, currentProfile, currentUser, login, logout, switchProfile]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook para consumir o contexto de autenticação */
export function useAuth(): AuthContextData {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
    }
    return ctx;
}
