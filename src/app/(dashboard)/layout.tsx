"use client";

/**
 * Dashboard Layout - Layout compartilhado para todos os perfis autenticados
 * Inclui Sidebar adaptativa e Header com notificações
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/features/Sidebar";
import { Header } from "@/components/features/Header";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthInitialized, isAuthenticated, currentProfile } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Redirecionar para login se não autenticado
    useEffect(() => {
        if (isAuthInitialized && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthInitialized, isAuthenticated, router]);

    if (!isAuthInitialized || !isAuthenticated) {
        return null; // Evita flash de conteúdo antes do redirect
    }

    return (
        <div className="h-screen flex bg-white overflow-hidden">
            {/* Desktop Sidebar (fixa) */}
            <div className="hidden lg:block w-[250px] flex-shrink-0">
                <Sidebar profile={currentProfile} />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-[250px] z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <Sidebar profile={currentProfile} />
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
