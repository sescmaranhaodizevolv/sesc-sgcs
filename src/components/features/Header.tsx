"use client";

/**
 * Header - Barra superior com notificações, troca de perfil e logout
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Bell,
    Menu,
    Search,
    ChevronDown,
    LogOut,
    User,
    ShieldCheck,
    FileText,
    Eye,
    CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BadgeStatus } from "@/components/ui/badge-status";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile, Notificacao } from "@/types";

/** Notificações mock */
const mockNotificacoes: Notificacao[] = [
    { id: "1", tipo: "critical", titulo: "Penalidade vencida", mensagem: "Penalidade do processo 2024-010 venceu", data: "Há 2 horas", lida: false },
    { id: "2", tipo: "warning", titulo: "Próximo ao vencimento", mensagem: "Contrato SCA-2024-015 vence em 10 dias", data: "Há 4 horas", lida: false },
    { id: "3", tipo: "success", titulo: "Processo aprovado", mensagem: "PROC-2024-001 foi aprovado com sucesso", data: "Há 6 horas", lida: true },
];

const profileConfig: Record<UserProfile, { label: string; icon: React.ReactNode; defaultRoute: string }> = {
    admin: { label: "Administrador", icon: <ShieldCheck size={16} />, defaultRoute: "/admin" },
    comprador: { label: "Comprador/Responsável", icon: <FileText size={16} />, defaultRoute: "/comprador" },
    requisitante: { label: "Requisitante/Visualizador", icon: <Eye size={16} />, defaultRoute: "/requisitante" },
    gestora: { label: "Gestora de Contratos/TRP", icon: <CalendarDays size={16} />, defaultRoute: "/gestora" },
};

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { currentProfile, switchProfile, logout } = useAuth();
    const router = useRouter();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [notifications, setNotifications] = useState(mockNotificacoes);

    const unreadCount = notifications.filter((n) => !n.lida).length;

    const handleProfileChange = (profile: UserProfile) => {
        switchProfile(profile);
        setShowProfileMenu(false);
        router.push(profileConfig[profile].defaultRoute);
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between flex-shrink-0">
            {/* Left: Menu toggle (mobile) + Search */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onMenuClick}
                >
                    <Menu size={20} />
                </Button>

                <div className="hidden md:flex items-center gap-2 relative">
                    <Search size={16} className="absolute left-3 text-gray-400" />
                    <Input
                        placeholder="Buscar..."
                        className="pl-9 w-64 h-9"
                    />
                </div>
            </div>

            {/* Right: Notifications + Profile */}
            <div className="flex items-center gap-3">
                {/* Notificações */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            setShowProfileMenu(false);
                        }}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </Button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                            <div className="p-3 border-b flex items-center justify-between">
                                <h4 className="text-sm font-semibold">Notificações</h4>
                                <button
                                    onClick={markAllRead}
                                    className="text-xs text-sesc-blue hover:underline"
                                >
                                    Marcar todas como lidas
                                </button>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`p-3 border-b last:border-0 hover:bg-gray-50 cursor-pointer ${!n.lida ? "bg-blue-50/50" : ""
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div
                                                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.tipo === "critical"
                                                        ? "bg-red-500"
                                                        : n.tipo === "warning"
                                                            ? "bg-yellow-500"
                                                            : n.tipo === "success"
                                                                ? "bg-green-500"
                                                                : "bg-blue-500"
                                                    }`}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {n.titulo}
                                                </p>
                                                <p className="text-xs text-gray-500">{n.mensagem}</p>
                                                <p className="text-xs text-gray-400 mt-1">{n.data}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Perfil e Troca */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowProfileMenu(!showProfileMenu);
                            setShowNotifications(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="w-8 h-8 bg-sesc-blue rounded-full flex items-center justify-center">
                            <User size={16} className="text-white" />
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-gray-900">
                                {profileConfig[currentProfile].label}
                            </p>
                            <p className="text-xs text-gray-500">SESC Maranhão</p>
                        </div>
                        <ChevronDown size={16} className="text-gray-400" />
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                            <div className="p-2">
                                <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase">
                                    Trocar Perfil
                                </p>
                                {(Object.keys(profileConfig) as UserProfile[]).map((profile) => (
                                    <button
                                        key={profile}
                                        onClick={() => handleProfileChange(profile)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${currentProfile === profile
                                                ? "bg-blue-50 text-sesc-blue font-medium"
                                                : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                    >
                                        {profileConfig[profile].icon}
                                        <span className="flex-1 text-left">
                                            {profileConfig[profile].label}
                                        </span>
                                        {currentProfile === profile && (
                                            <BadgeStatus intent="info" weight="light" size="xs">
                                                Ativo
                                            </BadgeStatus>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="border-t p-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={16} />
                                    <span>Sair do sistema</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
