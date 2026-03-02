import React, { useState } from 'react';
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
  Database,
  Send,
  FolderOpen,
  HelpCircle,
  Shield,
  CalendarDays
} from 'lucide-react';
import logoSescSidebar from 'figma:asset/32babfe0c30b35779f3f51d340f17b7d45ece0e5.png';
import type { ScreenType } from '../App';

interface SidebarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  userProfile?: 'admin' | 'comprador' | 'requisitante' | 'gestora';
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  screen?: ScreenType;
  children?: MenuItem[];
}

const menuItemsAdmin: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    screen: 'dashboard'
  },
  {
    id: 'processos',
    label: 'Processos',
    icon: <FileText size={20} />,
    children: [
      {
        id: 'gerenciamento-processos',
        label: 'Gerenciamento de Processos',
        icon: <FileText size={18} />,
        screen: 'processos'
      },
      {
        id: 'envio-automatico',
        label: 'Envio Automático',
        icon: <Send size={18} />,
        screen: 'envio-automatico'
      },
      {
        id: 'historico-desistencias',
        label: 'Histórico de Desistências',
        icon: <TrendingDown size={18} />,
        screen: 'historico-desistencias'
      },
      {
        id: 'realinhamento-precos',
        label: 'Realinhamento de Preços',
        icon: <DollarSign size={18} />,
        screen: 'realinhamento-precos'
      },
      {
        id: 'penalidades',
        label: 'Penalidades',
        icon: <AlertTriangle size={18} />,
        screen: 'penalidades'
      },
      {
        id: 'prorrogacoes-contratos',
        label: 'Prorrogações de Processos',
        icon: <Calendar size={18} />,
        screen: 'prorrogacoes-contratos'
      }
    ]
  },
  {
    id: 'contratos-fornecedores',
    label: 'Fornecedores e Atestados',
    icon: <Building2 size={20} />,
    screen: 'contratos-fornecedores'
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: <BarChart3 size={20} />,
    screen: 'relatorios'
  },
  {
    id: 'usuarios',
    label: 'Usuários',
    icon: <Users size={20} />,
    screen: 'usuarios'
  },
  {
    id: 'auditoria',
    label: 'Auditoria e Logs',
    icon: <Shield size={20} />,
    screen: 'auditoria'
  },
  {
    id: 'documentos',
    label: 'Documentos',
    icon: <FolderOpen size={20} />,
    screen: 'documentos'
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: <Settings size={20} />,
    screen: 'configuracoes'
  },
  {
    id: 'ajuda-suporte',
    label: 'Ajuda e Suporte',
    icon: <HelpCircle size={20} />,
    screen: 'ajuda-suporte'
  }
];

const menuItemsComprador: MenuItem[] = [
  {
    id: 'dashboard-comprador',
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    screen: 'dashboard-comprador'
  },
  {
    id: 'processos-comprador',
    label: 'Processos',
    icon: <FileText size={20} />,
    children: [
      {
        id: 'meus-processos',
        label: 'Meus Processos',
        icon: <FileText size={18} />,
        screen: 'meus-processos'
      },
      {
        id: 'desistencias-comprador',
        label: 'Desistências',
        icon: <TrendingDown size={18} />,
        screen: 'desistencias-comprador'
      },
      {
        id: 'realinhamento-precos-comprador',
        label: 'Realinhamento de Preços',
        icon: <DollarSign size={18} />,
        screen: 'realinhamento-precos'
      },
      {
        id: 'penalidades-comprador',
        label: 'Penalidades',
        icon: <AlertTriangle size={18} />,
        screen: 'penalidades-comprador'
      },
      {
        id: 'prorrogacoes-contratos-comprador',
        label: 'Prorrogações de Processos',
        icon: <Calendar size={18} />,
        screen: 'prorrogacoes-contratos'
      }
    ]
  },
  {
    id: 'fornecedores',
    label: 'Fornecedores',
    icon: <Building2 size={20} />,
    screen: 'contratos-fornecedores'
  },
  {
    id: 'relatorios-comprador',
    label: 'Relatórios',
    icon: <BarChart3 size={20} />,
    screen: 'relatorios-comprador'
  },
  {
    id: 'documentos',
    label: 'Documentos',
    icon: <FolderOpen size={20} />,
    screen: 'documentos'
  },
  {
    id: 'auditoria',
    label: 'Auditoria e Logs',
    icon: <Shield size={20} />,
    screen: 'auditoria'
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: <Settings size={20} />,
    screen: 'configuracoes'
  },
  {
    id: 'ajuda-suporte',
    label: 'Ajuda e Suporte',
    icon: <HelpCircle size={20} />,
    screen: 'ajuda-suporte'
  }
];

const menuItemsRequisitante: MenuItem[] = [
  {
    id: 'minhas-requisicoes',
    label: 'Minhas Requisições',
    icon: <FileText size={20} />,
    screen: 'minhas-requisicoes'
  },
  {
    id: 'auditoria-requisitante',
    label: 'Auditoria e Logs',
    icon: <Shield size={20} />,
    screen: 'auditoria-requisitante'
  },
  {
    id: 'configuracoes-requisitante',
    label: 'Configurações',
    icon: <Settings size={20} />,
    screen: 'configuracoes-requisitante'
  },
  {
    id: 'central-suporte',
    label: 'Ajuda e Suporte',
    icon: <HelpCircle size={20} />,
    screen: 'central-suporte'
  }
];

// Menu para Gestora de Contratos/TRP (baseado no Comprador com foco em contratos)
const menuItemsGestora: MenuItem[] = [
  {
    id: 'dashboard-comprador',
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    screen: 'dashboard-comprador'
  },
  {
    id: 'gestora-contratos',
    label: 'Gestão de Contratos e TRP',
    icon: <Calendar size={20} />,
    screen: 'gestora-contratos'
  },
  {
    id: 'gestao-contratos',
    label: 'Cadastro de Datas (Manual)',
    icon: <CalendarDays size={20} />,
    screen: 'gestao-contratos'
  },
  {
    id: 'prorrogacoes-contratos-gestora',
    label: 'Prorrogações de Processos',
    icon: <CalendarDays size={20} />,
    screen: 'prorrogacoes-contratos'
  },
  {
    id: 'fornecedores-gestora',
    label: 'Fornecedores e Atestados',
    icon: <Building2 size={20} />,
    screen: 'contratos-fornecedores'
  },
  {
    id: 'relatorios-gestora',
    label: 'Relatórios',
    icon: <BarChart3 size={20} />,
    screen: 'relatorios-comprador'
  },
  {
    id: 'documentos-gestora',
    label: 'Documentos',
    icon: <FolderOpen size={20} />,
    screen: 'documentos'
  },
  {
    id: 'auditoria-gestora',
    label: 'Auditoria e Logs',
    icon: <Shield size={20} />,
    screen: 'auditoria'
  },
  {
    id: 'configuracoes-gestora',
    label: 'Configurações',
    icon: <Settings size={20} />,
    screen: 'configuracoes'
  },
  {
    id: 'ajuda-suporte-gestora',
    label: 'Ajuda e Suporte',
    icon: <HelpCircle size={20} />,
    screen: 'ajuda-suporte'
  }
];

export function Sidebar({ currentScreen, onNavigate, userProfile = 'admin' }: SidebarProps) {
  const menuItems = userProfile === 'admin' 
    ? menuItemsAdmin 
    : userProfile === 'comprador' 
    ? menuItemsComprador 
    : userProfile === 'gestora'
    ? menuItemsGestora
    : menuItemsRequisitante;
  
  const defaultExpandedItems = userProfile === 'admin' 
    ? ['processos', 'integracoes'] 
    : userProfile === 'comprador'
    ? ['processos-comprador']
    : [];
  
  const [expandedItems, setExpandedItems] = useState<string[]>(defaultExpandedItems);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (screen?: ScreenType) => screen === currentScreen;

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isItemActive = isActive(item.screen);

    return (
      <div key={item.id} className={level > 0 ? 'ml-6' : ''}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else if (item.screen) {
              onNavigate(item.screen);
            }
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isItemActive 
              ? 'bg-[#001f3f] text-white' 
              : 'text-white hover:bg-[#004080] hover:text-white'
          }`}
        >
          <span className="text-gray-300">{item.icon}</span>
          <span className="flex-1 text-left text-sm">{item.label}</span>
          {hasChildren && (
            <span className="text-gray-300 flex-shrink-0">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
        </button>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-[#003366] text-white flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-[#004080] flex-shrink-0">
        <div className="flex items-center justify-center">
          <img src={logoSescSidebar} alt="SESC Logo" className="w-32 h-auto object-contain" />
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#004080] flex-shrink-0">
        <p className="text-xs text-gray-300 text-center">
          © 2025 SESC. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}