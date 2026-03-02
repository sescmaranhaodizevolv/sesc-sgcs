import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { RecuperarSenha } from './components/RecuperarSenha';
import { AlterarSenha } from './components/AlterarSenha';
import { Dashboard } from './components/screens/Dashboard';
import { Processos } from './components/screens/Processos';
import { HistoricoDesistencias } from './components/screens/HistoricoDesistencias';
import { RealinhamentoPrecos } from './components/screens/RealinhamentoPrecos';
import { Penalidades } from './components/screens/Penalidades';
import { ProrrogacoesContratos } from './components/screens/ProrrogacoesContratos';
import { ContratosEFornecedores } from './components/screens/ContratosEFornecedores';
import { GestoraContratos } from './components/screens/GestoraContratos';
import { GestaoContratos } from './components/screens/GestaoContratos';
import { Relatorios } from './components/screens/Relatorios';
import { Usuarios } from './components/screens/Usuarios';
import { EnvioAutomatico } from './components/screens/EnvioAutomatico';
import { Documentos } from './components/screens/Documentos';
import { AjudaESuporte } from './components/screens/AjudaESuporte';
import { Configuracoes } from './components/screens/Configuracoes';
import { Auditoria } from './components/screens/Auditoria';
import { DetalheChamado } from './components/screens/DetalheChamado';
import { DashboardComprador } from './components/screens/DashboardComprador';
import { MeusProcessos } from './components/screens/MeusProcessosUpdated';
import { CadastroFornecedor } from './components/screens/CadastroFornecedor';
import { PenalidadesComprador } from './components/screens/PenalidadesComprador';
import { DesistenciasComprador } from './components/screens/DesistenciasComprador';
import { DetalhesProcessoComprador } from './components/screens/DetalhesProcessoComprador';
import { RelatoriosComprador } from './components/screens/RelatoriosComprador';
import { MinhasRequisicoes } from './components/screens/MinhasRequisicoes';
import { DetalheRequisicao } from './components/screens/DetalheRequisicao';
import { CentralSuporte } from './components/screens/CentralSuporte';
import { ConfiguracoesRequisitante } from './components/screens/ConfiguracoesRequisitante';
import { AuditoriaRequisitante } from './components/screens/AuditoriaRequisitante';
import { Toaster } from 'sonner';
import { toast } from './lib/toast-helpers';
import { NotificationProvider } from './contexts/NotificationContext';

export type ScreenType = 
  | 'dashboard'
  | 'processos'
  | 'historico-desistencias'
  | 'realinhamento-precos'
  | 'penalidades'
  | 'prorrogacoes-contratos'
  | 'contratos-fornecedores'
  | 'gestora-contratos'
  | 'gestao-contratos'
  | 'relatorios'
  | 'usuarios'
  | 'envio-automatico'
  | 'documentos'
  | 'ajuda-suporte'
  | 'configuracoes'
  | 'auditoria'
  | 'detalhe-chamado'
  | 'dashboard-comprador'
  | 'meus-processos'
  | 'cadastro-fornecedor'
  | 'penalidades-comprador'
  | 'desistencias-comprador'
  | 'detalhes-processo-comprador'
  | 'relatorios-comprador'
  | 'minhas-requisicoes'
  | 'detalhe-requisicao'
  | 'central-suporte'
  | 'configuracoes-requisitante'
  | 'auditoria-requisitante';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [configuracoesTab, setConfiguracoesTab] = useState<string>('perfil');
  const [chamadoSelecionadoId, setChamadoSelecionadoId] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<'admin' | 'comprador' | 'requisitante' | 'gestora'>('admin');
  const [selectedRcId, setSelectedRcId] = useState<string | null>(null);
  const [selectedProcessoId, setSelectedProcessoId] = useState<string | null>(null);
  const [processoIdParaAbrir, setProcessoIdParaAbrir] = useState<string | null>(null);
  
  // Estados para fluxo de recuperação de senha
  const [authScreen, setAuthScreen] = useState<'login' | 'recuperar' | 'alterar'>('login');
  const [emailRecuperacao, setEmailRecuperacao] = useState<string>('');

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setAuthScreen('login');
    toast.success('Login realizado com sucesso!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentProfile('admin');
    setCurrentScreen('dashboard');
    setAuthScreen('login');
    toast.success('Logout realizado com sucesso!');
  };

  const handleEsqueciSenha = () => {
    setAuthScreen('recuperar');
  };

  const handleVoltarLogin = () => {
    setAuthScreen('login');
  };

  const handleRedirecionarAlteracao = (email: string) => {
    setEmailRecuperacao(email);
    setAuthScreen('alterar');
  };

  const handleSenhaAlterada = () => {
    setAuthScreen('login');
    setEmailRecuperacao('');
    toast.success('Senha alterada com sucesso! Faça login com a nova senha.');
  };

  const handleNavigate = (screen: ScreenType, tab?: string) => {
    setCurrentScreen(screen);
    if (screen === 'configuracoes' && tab) {
      setConfiguracoesTab(tab);
    }
  };

  const handleNavigateToChamado = (chamadoId: number) => {
    setChamadoSelecionadoId(chamadoId.toString());
    setCurrentScreen('detalhe-chamado');
  };

  const handleVoltarParaChamados = () => {
    setCurrentScreen('ajuda-suporte');
    setChamadoSelecionadoId(null);
  };

  const handleNavigateToChamadoRequisitante = (chamadoId: string) => {
    setChamadoSelecionadoId(chamadoId);
    setCurrentScreen('detalhe-chamado');
  };

  const handleVoltarParaSuporte = () => {
    setCurrentScreen('central-suporte');
    setChamadoSelecionadoId(null);
  };

  const handleProfileChange = (profile: 'admin' | 'comprador' | 'requisitante' | 'gestora') => {
    setCurrentProfile(profile);
    // Navegar para a tela inicial correspondente
    if (profile === 'admin') {
      setCurrentScreen('dashboard');
    } else if (profile === 'comprador') {
      setCurrentScreen('dashboard-comprador');
    } else if (profile === 'gestora') {
      setCurrentScreen('gestora-contratos');
    } else {
      setCurrentScreen('minhas-requisicoes');
    }
    
    const profileNames = {
      admin: 'Administrador',
      comprador: 'Comprador/Responsável',
      requisitante: 'Requisitante/Visualizador',
      gestora: 'Gestora de Contratos/TRP'
    };
    
    toast.success(`Perfil alterado para ${profileNames[profile]}`);
  };

  const handleDetalharRequisicao = (rcId: string) => {
    setSelectedRcId(rcId);
    setCurrentScreen('detalhe-requisicao');
  };

  const handleVoltarParaRequisicoes = () => {
    setCurrentScreen('minhas-requisicoes');
    setSelectedRcId(null);
  };

  const handleNavigateToDetalhesProcesso = (processoId: string) => {
    setSelectedProcessoId(processoId);
    setCurrentScreen('detalhes-processo-comprador');
  };

  const handleVoltarParaMeusProcessos = () => {
    setCurrentScreen('meus-processos');
    setSelectedProcessoId(null);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'processos':
        return <Processos currentProfile={currentProfile} />;
      case 'historico-desistencias':
        return <HistoricoDesistencias />;
      case 'realinhamento-precos':
        return <RealinhamentoPrecos />;
      case 'penalidades':
        return <Penalidades />;
      case 'prorrogacoes-contratos':
        return <ProrrogacoesContratos />;
      case 'contratos-fornecedores':
        return <ContratosEFornecedores />;
      case 'gestora-contratos':
        return <GestoraContratos />;
      case 'gestao-contratos':
        return <GestaoContratos />;
      case 'relatorios':
        return <Relatorios />;
      case 'usuarios':
        return <Usuarios />;
      case 'envio-automatico':
        return <EnvioAutomatico />;
      case 'documentos':
        return <Documentos />;
      case 'ajuda-suporte':
        return <AjudaESuporte onNavigateToChamado={handleNavigateToChamado} currentProfile={currentProfile} />;
      case 'detalhe-chamado':
        if (currentProfile === 'requisitante' && chamadoSelecionadoId) {
          return <DetalheChamado chamadoId={chamadoSelecionadoId} onBack={handleVoltarParaSuporte} currentProfile={currentProfile} />;
        } else if (chamadoSelecionadoId) {
          return <DetalheChamado chamadoId={chamadoSelecionadoId} onBack={handleVoltarParaChamados} currentProfile={currentProfile} />;
        } else {
          return currentProfile === 'requisitante' ? 
            <CentralSuporte onNavigateToChamado={handleNavigateToChamadoRequisitante} /> : 
            <AjudaESuporte onNavigateToChamado={handleNavigateToChamado} currentProfile={currentProfile} />;
        }
      case 'configuracoes':
        return <Configuracoes activeTab={configuracoesTab} onTabChange={setConfiguracoesTab} currentProfile={currentProfile} />;
      case 'auditoria':
        return <Auditoria currentProfile={currentProfile} />;
      case 'dashboard-comprador':
        return <DashboardComprador 
          onNavigateToProcessos={(processoId?: string) => {
            setProcessoIdParaAbrir(processoId || null);
            setCurrentScreen('meus-processos');
          }}
          onNavigateToDetalhes={handleNavigateToDetalhesProcesso}
        />;
      case 'meus-processos':
        return <MeusProcessos processoIdParaAbrir={processoIdParaAbrir} onModalClosed={() => setProcessoIdParaAbrir(null)} />;
      case 'cadastro-fornecedor':
        return <CadastroFornecedor onVoltar={() => setCurrentScreen('meus-processos')} />;
      case 'penalidades-comprador':
        return <PenalidadesComprador />;
      case 'desistencias-comprador':
        return <DesistenciasComprador />;
      case 'detalhes-processo-comprador':
        return <DetalhesProcessoComprador 
          processoId={selectedProcessoId || undefined}
          onVoltar={handleVoltarParaMeusProcessos} 
        />;
      case 'relatorios-comprador':
        return <RelatoriosComprador />;
      case 'minhas-requisicoes':
        return <MinhasRequisicoes onDetalhar={handleDetalharRequisicao} onNavigateToSuporte={() => setCurrentScreen('central-suporte')} />;
      case 'detalhe-requisicao':
        return <DetalheRequisicao 
          rcId={selectedRcId || undefined} 
          onVoltar={handleVoltarParaRequisicoes}
          onAbrirSuporte={() => setCurrentScreen('central-suporte')}
        />;
      case 'central-suporte':
        return <CentralSuporte onNavigateToChamado={handleNavigateToChamadoRequisitante} />;
      case 'configuracoes-requisitante':
        return <ConfiguracoesRequisitante />;
      case 'auditoria-requisitante':
        return <AuditoriaRequisitante />;
      default:
        if (currentProfile === 'admin') return <Dashboard />;
        if (currentProfile === 'comprador') return <DashboardComprador 
          onNavigateToProcessos={(processoId?: string) => {
            setProcessoIdParaAbrir(processoId || null);
            setCurrentScreen('meus-processos');
          }}
          onNavigateToDetalhes={handleNavigateToDetalhesProcesso}
        />;
        return <MinhasRequisicoes onDetalhar={handleDetalharRequisicao} />;
    }
  };

  return (
    <NotificationProvider>
      {!isAuthenticated ? (
        <>
          {authScreen === 'login' && (
            <Login 
              onLoginSuccess={handleLoginSuccess} 
              onEsqueciSenha={handleEsqueciSenha}
            />
          )}
          {authScreen === 'recuperar' && (
            <RecuperarSenha 
              onVoltar={handleVoltarLogin}
              onRedirecionarAlteracao={handleRedirecionarAlteracao}
            />
          )}
          {authScreen === 'alterar' && (
            <AlterarSenha 
              email={emailRecuperacao}
              onSenhaAlterada={handleSenhaAlterada}
            />
          )}
        </>
      ) : (
        <div className="h-screen flex bg-white overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-[250px] flex-shrink-0">
            <Sidebar currentScreen={currentScreen} onNavigate={setCurrentScreen} userProfile={currentProfile} />
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
            className={`fixed top-0 left-0 h-full w-[250px] z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar 
              currentScreen={currentScreen} 
              onNavigate={(screen) => {
                setCurrentScreen(screen);
                setIsSidebarOpen(false);
              }}
              userProfile={currentProfile}
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <Header 
              onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              onNavigate={handleNavigate}
              currentProfile={currentProfile}
              onProfileChange={handleProfileChange}
              onLogout={handleLogout}
            />
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              {renderScreen()}
            </main>
          </div>
        </div>
      )}
      <Toaster 
        position="top-right"
        richColors
        closeButton
        expand={false}
        toastOptions={{
          style: {
            margin: '8px',
          },
          className: 'toast-custom',
        }}
      />
    </NotificationProvider>
  );
}
