import React, { useState } from 'react';
import { Bell, User, Menu, Settings, LogOut, HelpCircle, UserCircle, AlertCircle, Clock, CheckCircle, FileText, RefreshCw } from 'lucide-react';
import { BadgeNew } from './ui/badge-new';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { getBadgeMappingForPerfil } from '../lib/badge-mappings';
import { useNotifications } from '../contexts/NotificationContext';

interface HeaderProps {
  onMenuClick?: () => void;
  onNavigate?: (screen: any, tab?: string) => void;
  currentProfile?: 'admin' | 'comprador' | 'requisitante' | 'gestora';
  onProfileChange?: (profile: 'admin' | 'comprador' | 'requisitante' | 'gestora') => void;
  onLogout?: () => void;
}

export function Header({ onMenuClick, onNavigate, currentProfile = 'admin', onProfileChange, onLogout }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const handleViewAll = () => {
    setNotificationsOpen(false);
    onNavigate?.('auditoria');
  };

  // Mapear ícones para cada tipo
  const getIconForType = (type: string) => {
    switch (type) {
      case 'critical':
        return { Icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' };
      case 'warning':
        return { Icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'success':
        return { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
      default:
        return { Icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' };
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          
          <div>
            <h1 className="text-xl lg:text-2xl text-black">Sistema de Gestão de Contratos e Suprimentos</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">
              {currentProfile === 'admin' 
                ? 'Administrador e Supervisor - SGCS' 
                : currentProfile === 'comprador' 
                ? 'Comprador/Responsável - SGCS'
                : currentProfile === 'requisitante' 
                ? 'Requisitante/Visualizador - SGCS'
                : 'Gestora de Contratos - SGCS'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Profile Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-300 hover:bg-gray-50 hidden md:flex items-center gap-2">
                <RefreshCw size={16} className="text-gray-600" />
                <span className="text-sm text-black">Trocar Perfil</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
              <DropdownMenuLabel>Selecione o Perfil</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={`cursor-pointer ${currentProfile === 'admin' ? 'bg-blue-50' : ''}`}
                onClick={() => onProfileChange?.('admin')}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`w-2 h-2 rounded-full ${currentProfile === 'admin' ? 'bg-blue-600' : 'bg-transparent'}`} />
                  <div>
                    <p className="text-sm text-black">Administrador</p>
                    <p className="text-xs text-gray-600">Acesso completo ao sistema</p>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={`cursor-pointer ${currentProfile === 'comprador' ? 'bg-blue-50' : ''}`}
                onClick={() => onProfileChange?.('comprador')}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`w-2 h-2 rounded-full ${currentProfile === 'comprador' ? 'bg-blue-600' : 'bg-transparent'}`} />
                  <div>
                    <p className="text-sm text-black">Comprador/Responsável</p>
                    <p className="text-xs text-gray-600">Gerenciar meus processos</p>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={`cursor-pointer ${currentProfile === 'requisitante' ? 'bg-blue-50' : ''}`}
                onClick={() => onProfileChange?.('requisitante')}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`w-2 h-2 rounded-full ${currentProfile === 'requisitante' ? 'bg-blue-600' : 'bg-transparent'}`} />
                  <div>
                    <p className="text-sm text-black">Requisitante/Visualizador</p>
                    <p className="text-xs text-gray-600">Acompanhar minhas RCs</p>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={`cursor-pointer ${currentProfile === 'gestora' ? 'bg-blue-50' : ''}`}
                onClick={() => onProfileChange?.('gestora')}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`w-2 h-2 rounded-full ${currentProfile === 'gestora' ? 'bg-blue-600' : 'bg-transparent'}`} />
                  <div>
                    <p className="text-sm text-black">Gestora de Contratos</p>
                    <p className="text-xs text-gray-600">Gerenciar contratos</p>
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Notifications Dropdown */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <BadgeNew className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500 hover:bg-red-500 flex items-center justify-center p-0 text-[rgb(255,255,255)]">
                    {unreadCount}
                  </BadgeNew>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <DropdownMenuLabel className="p-0 m-0">Notificações</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 text-xs text-[#003366] hover:text-[#002244] hover:bg-transparent"
                    onClick={markAllAsRead}
                  >
                    Marcar todas como lidas
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[400px]">
                <div className="p-2">
                  {notifications.map((notification) => {
                    const { Icon, color, bg } = getIconForType(notification.type);
                    return (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`px-3 py-3 rounded-lg mb-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
                            <Icon size={20} className={color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm ${!notification.read ? 'text-black' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">{notification.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="border-t border-gray-200 p-3">
                <Button 
                  variant="ghost" 
                  className="w-full text-[#003366] hover:text-[#002244] hover:bg-gray-100"
                  size="sm"
                  onClick={handleViewAll}
                >
                  Ver Todas as Notificações
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 lg:gap-3 bg-gray-100 hover:bg-gray-200 rounded-full px-2 lg:px-3 py-2 transition-colors">
                <div className="w-8 h-8 bg-[#003366] rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-sm text-black">
                    {currentProfile === 'admin' 
                      ? 'Administrador' 
                      : currentProfile === 'comprador' 
                      ? 'Comprador' 
                      : currentProfile === 'requisitante' 
                      ? 'Requisitante'
                      : 'Gestora'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {currentProfile === 'admin' 
                      ? 'Gerente de Processos' 
                      : currentProfile === 'comprador' 
                      ? 'Setor de Suprimentos'
                      : currentProfile === 'requisitante' 
                      ? 'Visualizador'
                      : 'Gestora de Contratos'}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
              <div className="px-2 py-2">
                <p className="text-sm text-black">Administrador</p>
                <p className="text-xs text-gray-600">admin@sesc.com.br</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => onNavigate?.('configuracoes', 'perfil')}
              >
                <UserCircle size={16} className="mr-2" />
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => onNavigate?.('configuracoes', 'sistema')}
              >
                <Settings size={16} className="mr-2" />
                Configurações do Sistema
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => onNavigate?.('ajuda-suporte')}
              >
                <HelpCircle size={16} className="mr-2" />
                Ajuda e Suporte
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" onClick={onLogout}>
                <LogOut size={16} className="mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}