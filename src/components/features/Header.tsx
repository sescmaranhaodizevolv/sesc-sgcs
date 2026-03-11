"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BadgeStatus } from "@/components/ui/badge-status";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getNotificacoes, marcarComoLida, type Notificacao } from "@/services/notificacoesService";
import type { UserProfile } from "@/types";

const profileConfig: Record<UserProfile, { label: string }> = {
  admin: { label: "Administrador" },
  comprador: { label: "Comprador/Responsável" },
  requisitante: { label: "Requisitante/Visualizador" },
  gestora: { label: "Gestora de Contratos/TRP" },
};

interface HeaderProps {
  onMenuClick?: () => void;
}

function formatRelativeDate(value: string) {
  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) return "Agora";

  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Agora";
  if (diffMinutes < 60) return `Há ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Há ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  return `Há ${diffDays}d`;
}

function getNotificationBadge(tipo: Notificacao["tipo"]) {
  if (tipo === "critical") return { intent: "danger", label: "Crítica" } as const;
  if (tipo === "warning") return { intent: "warning", label: "Aviso" } as const;
  if (tipo === "success") return { intent: "success", label: "Sucesso" } as const;
  return { intent: "info", label: "Info" } as const;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { currentProfile, currentUser, logout } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notificacao[]>([]);

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.lida).length, [notifications]);

  const loadNotifications = async () => {
    if (!currentUser?.id) {
      setNotifications([]);
      return;
    }

    try {
      const data = await getNotificacoes(10);
      setNotifications(data);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = supabase
      .channel(`header-notificacoes-${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notificacoes",
          filter: `usuario_id=eq.${currentUser.id}`,
        },
        () => {
          void loadNotifications();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUser?.id, supabase]);

  const handleLogout = () => {
    void logout();
  };

  const handleOpenNotification = async (notification: Notificacao) => {
    if (!notification.lida) {
      await marcarComoLida(notification.id);
      setNotifications((prev) => prev.map((item) => (item.id === notification.id ? { ...item, lida: true } : item)));
    }
  };

  const markAllRead = async () => {
    const unreadNotifications = notifications.filter((notification) => !notification.lida);
    await Promise.all(unreadNotifications.map((notification) => marcarComoLida(notification.id)));
    setNotifications((prev) => prev.map((notification) => ({ ...notification, lida: true })));
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu size={20} />
        </Button>

        <div className="hidden md:flex items-center gap-2 relative">
          <Search size={16} className="absolute left-3 text-gray-400" />
          <Input placeholder="Buscar..." className="pl-9 w-64 h-9" />
        </div>
      </div>

      <div className="flex items-center gap-3">
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
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
              <div className="p-3 border-b flex items-center justify-between">
                <h4 className="text-sm font-semibold">Notificações</h4>
                <button onClick={() => void markAllRead()} className="text-xs text-sesc-blue hover:underline" disabled={unreadCount === 0}>
                  Marcar todas como lidas
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-gray-500">
                    Você não tem notificações no momento
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const badge = getNotificationBadge(notification.tipo);

                    return (
                      <button
                        key={notification.id}
                        className={`w-full p-3 border-b last:border-0 hover:bg-gray-50 text-left ${!notification.lida ? "bg-blue-50/50" : ""}`}
                        onClick={() => void handleOpenNotification(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="pt-0.5">
                            <BadgeStatus intent={badge.intent} weight="medium" size="sm">
                              {badge.label}
                            </BadgeStatus>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{notification.titulo}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{notification.mensagem}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatRelativeDate(notification.criado_em)}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

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
              <p className="text-sm font-medium text-gray-900">{currentUser?.profile?.nome ?? profileConfig[currentProfile].label}</p>
              <p className="text-xs text-gray-500">{profileConfig[currentProfile].label}</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{currentUser?.profile?.nome ?? "Usuário"}</p>
                <p className="text-xs text-gray-500 mt-1">{currentUser?.email ?? ""}</p>
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
