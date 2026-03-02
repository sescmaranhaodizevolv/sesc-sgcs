"use client";

/**
 * Sidebar - Menu lateral adaptativo por perfil de usuário
 * Renderiza menus distintos para admin, comprador, requisitante e gestora
 */
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Users,
    BarChart3,
    Settings,
    ChevronDown,
    ChevronRight,
    TrendingDown,
    DollarSign,
    AlertTriangle,
    Calendar,
    Building2,
    Send,
    FolderOpen,
    HelpCircle,
    Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types";
import logoSesc from "@/assets/logo_sesc.png";

interface SidebarNavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    children?: SidebarNavItem[];
}

/** Menu do Administrador */
const menuAdmin: SidebarNavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin" },
    {
        id: "processos",
        label: "Processos",
        icon: <FileText size={20} />,
        children: [
            { id: "gerenciamento", label: "Gerenciamento de Processos", icon: <FileText size={18} />, href: "/admin/processos" },
            { id: "envio-auto", label: "Envio Automático", icon: <Send size={18} />, href: "/admin/envio-automatico" }, 
            { id: "desistencias", label: "Histórico de Desistências", icon: <TrendingDown size={18} />, href: "/admin/desistencias" },
            { id: "realinhamento", label: "Realinhamento de Preços", icon: <DollarSign size={18} />, href: "/admin/realinhamento" },
            { id: "penalidades", label: "Penalidades", icon: <AlertTriangle size={18} />, href: "/admin/penalidades" },
            { id: "prorrogacoes", label: "Prorrogações de Processos", icon: <Calendar size={18} />, href: "/admin/prorrogacoes" },
        ],
    },
    { id: "fornecedores", label: "Fornecedores e Atestados", icon: <Building2 size={20} />, href: "/admin/fornecedores" },
    { id: "relatorios", label: "Relatórios", icon: <BarChart3 size={20} />, href: "/admin/relatorios" },
    { id: "usuarios", label: "Usuários", icon: <Users size={20} />, href: "/admin/usuarios" },
    { id: "auditoria", label: "Auditoria e Logs", icon: <Shield size={20} />, href: "/admin/auditoria" },
    { id: "documentos", label: "Documentos", icon: <FolderOpen size={20} />, href: "/admin/documentos" },
    { id: "configuracoes", label: "Configurações", icon: <Settings size={20} />, href: "/admin/configuracoes" },
    { id: "ajuda", label: "Ajuda e Suporte", icon: <HelpCircle size={20} />, href: "/admin/ajuda" },
];

/** Menu do Comprador */
const menuComprador: SidebarNavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/comprador" },
    {
        id: "processos",
        label: "Processos",
        icon: <FileText size={20} />,
        children: [
            { id: "meus-processos", label: "Meus Processos", icon: <FileText size={18} />, href: "/comprador/meus-processos" },
            { id: "desistencias", label: "Desistências", icon: <TrendingDown size={18} />, href: "/comprador/historico-desistencias" },
            { id: "realinhamento", label: "Realinhamento de Preços", icon: <DollarSign size={18} />, href: "/comprador/realinhamento-precos" },
            { id: "penalidades", label: "Penalidades", icon: <AlertTriangle size={18} />, href: "/comprador/penalidades" },
            { id: "prorrogacoes", label: "Prorrogações de Processos", icon: <Calendar size={18} />, href: "/comprador/prorrogacoes-contratos" },
        ],
    },
    { id: "fornecedores", label: "Fornecedores", icon: <Building2 size={20} />, href: "/comprador/fornecedores" },
    { id: "relatorios", label: "Relatórios", icon: <BarChart3 size={20} />, href: "/comprador/relatorios" },
    { id: "documentos", label: "Documentos", icon: <FolderOpen size={20} />, href: "/comprador/documentos" },
    { id: "auditoria", label: "Auditoria e Logs", icon: <Shield size={20} />, href: "/comprador/auditoria" },
    { id: "configuracoes", label: "Configurações", icon: <Settings size={20} />, href: "/comprador/configuracoes" },
    { id: "ajuda", label: "Ajuda e Suporte", icon: <HelpCircle size={20} />, href: "/comprador/ajuda" },
];

/** Menu do Requisitante (minimalista) */
const menuRequisitante: SidebarNavItem[] = [
    { id: "requisicoes", label: "Minhas Requisições", icon: <FileText size={20} />, href: "/requisitante" },
    { id: "auditoria", label: "Auditoria e Logs", icon: <Shield size={20} />, href: "/requisitante/auditoria" },
    { id: "configuracoes", label: "Configurações", icon: <Settings size={20} />, href: "/requisitante/configuracoes" },
    { id: "suporte", label: "Ajuda e Suporte", icon: <HelpCircle size={20} />, href: "/requisitante/suporte" },
];

/** Menu da Gestora de Contratos */
const menuGestora: SidebarNavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/gestora" },
    { id: "contratos-trp", label: "Contratos e TRP", icon: <FileText size={20} />, href: "/gestora/contratos-trp" },
    { id: "gestao-contratos", label: "Cadastro de Datas (Manual)", icon: <Calendar size={20} />, href: "/gestora/gestao-contratos" },
    { id: "prorrogacoes", label: "Prorrogações de processos", icon: <Calendar size={20} />, href: "/gestora/prorrogacoes" },
    { id: "fornecedores", label: "Fornecedores e atestados", icon: <Building2 size={20} />, href: "/gestora/fornecedores" },
    { id: "relatorios", label: "Relatórios", icon: <BarChart3 size={20} />, href: "/gestora/relatorios" },
    { id: "documentos", label: "Documentos", icon: <FolderOpen size={20} />, href: "/gestora/documentos" },
    { id: "auditoria", label: "Auditoria e Logs", icon: <Shield size={20} />, href: "/gestora/auditoria" },
    { id: "configuracoes", label: "Configurações", icon: <Settings size={20} />, href: "/gestora/configuracoes" },
    { id: "ajuda", label: "Ajuda e Suporte", icon: <HelpCircle size={20} />, href: "/gestora/ajuda" },
];

/** Mapa de menus por perfil */
const menuByProfile: Record<UserProfile, SidebarNavItem[]> = {
    admin: menuAdmin,
    comprador: menuComprador,
    requisitante: menuRequisitante,
    gestora: menuGestora,
};

interface SidebarProps {
    profile: UserProfile;
}

export function Sidebar({ profile }: SidebarProps) {
    const pathname = usePathname();
    const items = menuByProfile[profile];

    const defaultExpanded = profile === "admin"
        ? ["processos"]
        : profile === "comprador"
            ? ["processos"]
            : [];

    const [expanded, setExpanded] = useState<string[]>(defaultExpanded);

    const toggleExpanded = (id: string) => {
        setExpanded((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const isActive = (href?: string) => {
        if (!href) return false;
        return pathname === href || pathname.startsWith(href + "/");
    };

    const renderItem = (item: SidebarNavItem, level = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExp = expanded.includes(item.id);
        const active = isActive(item.href);

        return (
            <div key={item.id} className={level > 0 ? "ml-6" : ""}>
                {hasChildren ? (
                    <button
                        onClick={() => toggleExpanded(item.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-white hover:bg-sesc-blue-light"
                    >
                        <span className="text-gray-300">{item.icon}</span>
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                        <span className="text-gray-300 flex-shrink-0">
                            {isExp ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                    </button>
                ) : (
                    <Link
                        href={item.href ?? "#"}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                            active
                                ? "bg-[#001f3f] text-white"
                                : "text-white hover:bg-sesc-blue-light"
                        )}
                    >
                        <span className="text-gray-300">{item.icon}</span>
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                    </Link>
                )}

                {hasChildren && isExp && (
                    <div className="mt-1 space-y-1">
                        {item.children!.map((child) => renderItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full h-full bg-sesc-blue text-white flex flex-col overflow-hidden">
            {/* Logo SESC */}
            <div className="p-6 border-b border-sesc-blue-light flex-shrink-0">
                <div className="flex items-center justify-center">
                    <div className="text-center">
                        <Image
                            src={logoSesc}
                            alt="Logo SESC"
                            width={140}
                            height={44}
                            className="mx-auto h-auto"
                            priority
                        />
                        <p className="text-xs text-gray-300 mt-1">Maranhão</p>
                    </div>
                </div>
            </div>

            {/* Itens do menu */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                {items.map((item) => renderItem(item))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-sesc-blue-light flex-shrink-0">
                <p className="text-xs text-gray-300 text-center">
                    © 2025 SESC. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}
