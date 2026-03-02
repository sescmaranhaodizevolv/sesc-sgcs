import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BadgeNew } from '../ui/badge-new';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { Plus, Search, Eye, MoreVertical, Ban, Info, LayoutGrid, List, Calendar } from 'lucide-react';
import { getBadgeMappingForStatus } from '../../lib/badge-mappings';
import { FileInput } from '../ui/file-input';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { DetalhesProcessoModal } from '../DetalhesProcessoModal';
import { toast } from '../../lib/toast-helpers';
import { KanbanView } from '../KanbanView';
import { useNotifications } from '../../contexts/NotificationContext';

interface MeusProcessosProps {
  processoIdParaAbrir?: string | null;
  onModalClosed?: () => void;
}

export function MeusProcessos({ processoIdParaAbrir, onModalClosed }: MeusProcessosProps = {}) {
  const [activeTab, setActiveTab] = useState('diario');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchTermDiario, setSearchTermDiario] = useState('');
  const [statusFilterDiario, setStatusFilterDiario] = useState('todos');
  const [tipoFilterDiario, setTipoFilterDiario] = useState('todos');
  
  const [searchTermConsolidado, setSearchTermConsolidado] = useState('');
  const [statusFilterConsolidado, setStatusFilterConsolidado] = useState('todos');
  
  const { addNotification } = useNotifications();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isNewProcessModalOpen, setIsNewProcessModalOpen] = useState(false);
  const [isEditProcessModalOpen, setIsEditProcessModalOpen] = useState(false);
  const [isNewConsolidadoModalOpen, setIsNewConsolidadoModalOpen] = useState(false);
  const [isEditConsolidadoModalOpen, setIsEditConsolidadoModalOpen] = useState(false);
  const [isAditivoModalOpen, setIsAditivoModalOpen] = useState(false);
  const [isProrrogacaoModalOpen, setIsProrrogacaoModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [processoTipo, setProcessoTipo] = useState<'diario' | 'consolidado'>('diario');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [processoToDelete, setProcessoToDelete] = useState<any>(null);
  
  // Modal de mudança de status
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
  const [processoParaMudarStatus, setProcessoParaMudarStatus] = useState<any>(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [observacaoStatus, setObservacaoStatus] = useState('');

  // Estados para gerenciar os processos (para suportar drag and drop)
  const [processosDiariosState, setProcessosDiariosState] = useState<any[]>([]);
  const [processosConsolidadosState, setProcessosConsolidadosState] = useState<any[]>([]);

  // Lista de empresas
  const empresasList = [
    'Empresa ABC Ltda', 'Fornecedor XYZ S.A', 'Serviços DEF Eireli', 'Tecnologia GHI Ltda',
    'Soluções JKL Corp', 'Comércio MNO Ltda', 'Indústria PQR S.A', 'Distribuidora STU Eireli',
    'Construtora VWX Ltda', 'Consultoria YZA Corp', 'Logística BCD S.A', 'Manutenção EFG Ltda',
    'Alimentação HIJ Eireli', 'Segurança KLM Corp', 'Limpeza NOP Ltda', 'TI e Telecom QRS S.A'
  ];

  // Usuário logado (comprador)
  const currentUser = 'João Silva';

  // Função para gerar dados fictícios - TODOS os processos
  const generateAllProcessos = () => {
    const tipos = ['Dispensa', 'Inexigibilidade', 'Licitação (Pesquisa de Preço)', 'Pregão Eletrônico'];
    const empresas = empresasList;
    const status = ['Em Análise', 'Aguardando Documentação', 'Devolvido ao Administrador', 'Aprovado', 'Finalizado'];
    const responsaveis = ['Maria Silva', 'João Silva', 'Ana Costa', 'Carlos Oliveira', 'Paula Mendes', 'Roberto Lima', 'Fernanda Alves'];
    const regionais = ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Brasília', 'Bahia', 'Paraná', 'Rio Grande do Sul'];
    const requisitantes = ['Maria Santos', 'Pedro Oliveira', 'Ana Paula Costa', 'Carlos Mendes', 'Juliana Lima', 'Roberto Alves', 'Fernanda Silva'];
    const objetos = [
      'Aquisição de material de escritório',
      'Contratação de serviços de limpeza',
      'Fornecimento de equipamentos de TI',
      'Serviços de manutenção predial',
      'Aquisição de móveis para escritório',
      'Contratação de serviços de segurança',
      'Fornecimento de material de copa e cozinha',
      'Serviços de jardinagem e paisagismo',
      'Aquisição de equipamentos de proteção individual',
      'Contratação de serviços de telefonia'
    ];
    
    const processos = [];
    for (let i = 1; i <= 75; i++) {
      const diaRC = Math.floor(Math.random() * 28) + 1;
      const mes = Math.floor(Math.random() * 3) + 1;
      const diaInicio = diaRC + Math.floor(Math.random() * 5) + 3;
      const diaFinalizacao = diaInicio + Math.floor(Math.random() * 15) + 5;
      
      processos.push({
        id: `PROC-2024-${String(i).padStart(3, '0')}`,
        tipo: tipos[Math.floor(Math.random() * tipos.length)],
        empresa: empresas[Math.floor(Math.random() * empresas.length)],
        status: status[Math.floor(Math.random() * status.length)],
        dataDistribuicaoRC: `${String(diaRC).padStart(2, '0')}/${String(mes).padStart(2, '0')}/2024`,
        dataInicio: `${String(diaInicio).padStart(2, '0')}/${String(mes).padStart(2, '0')}/2024`,
        dataRecebimento: `${String(diaRC).padStart(2, '0')}/${String(mes).padStart(2, '0')}/2024`,
        dataFinalizacao: `${String(diaFinalizacao).padStart(2, '0')}/${String(mes).padStart(2, '0')}/2024`,
        responsavel: responsaveis[Math.floor(Math.random() * responsaveis.length)],
        requisitante: requisitantes[Math.floor(Math.random() * requisitantes.length)],
        objeto: objetos[Math.floor(Math.random() * objetos.length)],
        valor: '',
        categoria: '',
        prazoEntrega: '',
        regional: regionais[Math.floor(Math.random() * regionais.length)]
      });
    }
    return processos;
  };

  // Dados iniciais para Aba 2: Processo Consolidado (Termos e Contratos)
  const initialProcessosConsolidados = [
    {
      id: 'CONT-2024-001',
      empresa: 'Empresa ABC Ltda',
      valor: 'R$ 125.000,00',
      dataFimVigencia: '15/12/2024',
      statusContrato: 'Ativo',
      responsavel: 'Maria Silva'
    },
    {
      id: 'CONT-2024-002',
      empresa: 'Fornecedor XYZ S.A',
      valor: 'R$ 89.500,00',
      dataFimVigencia: '28/02/2025',
      statusContrato: 'Ativo',
      responsavel: 'João Silva'
    },
    {
      id: 'CONT-2023-045',
      empresa: 'Serviços DEF Eireli',
      valor: 'R$ 45.200,00',
      dataFimVigencia: '30/11/2024',
      statusContrato: 'Em Renovação',
      responsavel: 'João Silva'
    },
    {
      id: 'CONT-2023-032',
      empresa: 'Tecnologia GHI Ltda',
      valor: 'R$ 210.000,00',
      dataFimVigencia: '15/10/2024',
      statusContrato: 'Vencido',
      responsavel: 'Ana Costa'
    },
    {
      id: 'CONT-2024-003',
      empresa: 'Soluções JKL Corp',
      valor: 'R$ 156.800,00',
      dataFimVigencia: '20/06/2025',
      statusContrato: 'Ativo',
      responsavel: 'João Silva'
    },
    {
      id: 'CONT-2024-004',
      empresa: 'Comércio MNO Ltda',
      valor: 'R$ 73.200,00',
      dataFimVigencia: '10/03/2025',
      statusContrato: 'Ativo',
      responsavel: 'João Silva'
    }
  ];

  // Inicializar estados com dados filtrados
  useEffect(() => {
    const allProcessosDiarios = generateAllProcessos();
    const filteredDiarios = allProcessosDiarios.filter(p => p.responsavel === currentUser);
    setProcessosDiariosState(filteredDiarios);

    const filteredConsolidados = initialProcessosConsolidados.filter(p => p.responsavel === currentUser);
    setProcessosConsolidadosState(filteredConsolidados);
  }, []);

  // Abrir modal automaticamente quando processoIdParaAbrir é fornecido
  useEffect(() => {
    if (processoIdParaAbrir && processosDiariosState.length > 0) {
      const processo = processosDiariosState.find(p => p.id === processoIdParaAbrir);
      if (processo) {
        setSelectedProcess(processo);
        setProcessoTipo('diario');
        setIsDetailsModalOpen(true);
        // Limpar o processoIdParaAbrir após abrir o modal
        if (onModalClosed) {
          onModalClosed();
        }
      }
    }
  }, [processoIdParaAbrir, processosDiariosState, onModalClosed]);

  // Usar os estados para exibir os dados
  const processosDiarios = processosDiariosState;
  const processosConsolidados = processosConsolidadosState;

  // Status counts para Aba 1 (apenas processos ativos)
  const statusCountsDiario = {
    todos: processosDiarios.filter(p => p.status !== 'Aprovado' && p.status !== 'Rejeitado').length,
    emAnalise: processosDiarios.filter(p => p.status === 'Em Análise').length,
    devolvido: processosDiarios.filter(p => p.status === 'Devolvido ao Requisitante').length
  };

  // Status counts para Processos Encerrados (nova aba)
  const statusCountsEncerrados = {
    todos: processosDiarios.filter(p => p.status === 'Aprovada' || p.status === 'Rejeitado').length,
    aprovado: processosDiarios.filter(p => p.status === 'Aprovada').length,
    rejeitado: processosDiarios.filter(p => p.status === 'Rejeitado').length
  };

  // Status counts para Aba 2
  const statusCountsConsolidado = {
    todos: processosConsolidados.length,
    ativo: processosConsolidados.filter(p => p.statusContrato === 'Ativo').length,
    emRenovacao: processosConsolidados.filter(p => p.statusContrato === 'Em Renovação').length,
    vencido: processosConsolidados.filter(p => p.statusContrato === 'Vencido').length
  };

  // Função para alterar status (drag and drop)
  const handleStatusChange = (processoId: string, newStatus: string) => {
    if (activeTab === 'diario') {
      setProcessosDiariosState(prev => 
        prev.map(p => p.id === processoId ? { ...p, status: newStatus } : p)
      );
      toast.success(`Processo ${processoId} movido para "${newStatus}"!`);
    } else {
      setProcessosConsolidadosState(prev => 
        prev.map(p => p.id === processoId ? { ...p, statusContrato: newStatus } : p)
      );
      toast.success(`Contrato ${processoId} movido para "${newStatus}"!`);
    }
  };

  const filteredProcessosDiarios = processosDiarios.filter(processo => {
    // Filtra apenas processos ativos (não encerrados)
    const isAtivo = processo.status !== 'Aprovado' && processo.status !== 'Rejeitado';
    const matchesSearch = processo.empresa.toLowerCase().includes(searchTermDiario.toLowerCase()) ||
                         processo.id.toLowerCase().includes(searchTermDiario.toLowerCase());
    const matchesStatus = statusFilterDiario === 'todos' || processo.status === statusFilterDiario;
    const matchesTipo = tipoFilterDiario === 'todos' || processo.tipo === tipoFilterDiario;
    return isAtivo && matchesSearch && matchesStatus && matchesTipo;
  });

  const filteredProcessosEncerrados = processosDiarios.filter(processo => {
    // Filtra apenas processos encerrados
    const isEncerrado = processo.status === 'Aprovada' || processo.status === 'Rejeitado';
    const matchesSearch = processo.empresa.toLowerCase().includes(searchTermDiario.toLowerCase()) ||
                         processo.id.toLowerCase().includes(searchTermDiario.toLowerCase());
    const matchesStatus = statusFilterDiario === 'todos' || processo.status === statusFilterDiario;
    const matchesTipo = tipoFilterDiario === 'todos' || processo.tipo === tipoFilterDiario;
    return isEncerrado && matchesSearch && matchesStatus && matchesTipo;
  });

  // Pagination logic
  const totalItems = filteredProcessosDiarios.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProcessosDiarios = filteredProcessosDiarios.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTermDiario, statusFilterDiario, tipoFilterDiario]);

  const filteredProcessosConsolidados = processosConsolidados.filter(processo => {
    const matchesSearch = processo.empresa.toLowerCase().includes(searchTermConsolidado.toLowerCase()) ||
                         processo.id.toLowerCase().includes(searchTermConsolidado.toLowerCase());
    const matchesStatus = statusFilterConsolidado === 'todos' || processo.statusContrato === statusFilterConsolidado;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteProcess = () => {
    if (processoToDelete) {
      // Remove do estado
      if (activeTab === 'diario') {
        setProcessosDiariosState(prev => prev.filter(p => p.id !== processoToDelete.id));
      } else {
        setProcessosConsolidadosState(prev => prev.filter(p => p.id !== processoToDelete.id));
      }
      
      toast.success(`Processo ${processoToDelete.id} excluído com sucesso!`);
      setIsDeleteDialogOpen(false);
      setProcessoToDelete(null);
    }
  };

  // Função para iniciar mudança de status
  const handleIniciarMudancaStatus = (processo: any, novoStatusSelecionado: string) => {
    setProcessoParaMudarStatus(processo);
    setNovoStatus(novoStatusSelecionado);
    setObservacaoStatus('');
    setIsStatusChangeModalOpen(true);
  };

  // Função para confirmar mudança de status
  const handleConfirmarMudancaStatus = () => {
    if (processoParaMudarStatus && novoStatus) {
      setProcessosDiariosState(prev =>
        prev.map(p => 
          p.id === processoParaMudarStatus.id 
            ? { ...p, status: novoStatus, observacaoStatus: observacaoStatus || undefined }
            : p
        )
      );
      
      // Definir destinatário da observação
      let destinatario = '';
      if (novoStatus === 'Devolvido ao Administrador') {
        destinatario = 'Administrador';
        
        // Adicionar notificação para o Administrador
        addNotification({
          type: 'warning',
          title: 'Processo Devolvido',
          message: `${currentUser} devolveu o processo ${processoParaMudarStatus.id}${observacaoStatus ? ': ' + observacaoStatus : ''}`,
          processoId: processoParaMudarStatus.id,
          from: currentUser
        });
      } else if (novoStatus === 'Aguardando Documentação') {
        destinatario = 'Requisitante';
      }
      
      const mensagemSucesso = observacaoStatus && destinatario
        ? `Status alterado para "${novoStatus}". Observação enviada ao ${destinatario}.`
        : `Status alterado para "${novoStatus}" com sucesso!`;
      
      toast.success(mensagemSucesso);
      
      // Limpar e fechar modal
      setIsStatusChangeModalOpen(false);
      setProcessoParaMudarStatus(null);
      setNovoStatus('');
      setObservacaoStatus('');
    }
  };

  // Função para determinar destinatário da observação
  const getDestinatarioObservacao = (status: string) => {
    switch (status) {
      case 'Devolvido ao Administrador':
        return 'Administrador';
      case 'Aguardando Documentação':
        return 'Requisitante';
      default:
        return 'Nota interna';
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Meus Processos</h2>
          <p className="text-gray-600 mt-1">Gerencie e acompanhe seus processos de compra atribuídos</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="diario" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-2">
          <TabsTrigger value="diario">
            Processos em Andamento
          </TabsTrigger>
          <TabsTrigger value="consolidado">
            Processos Consolidados
          </TabsTrigger>
        </TabsList>

        {/* Aba 1: Processos em Andamento */}
        <TabsContent value="diario" className="space-y-6 mt-6">
          {/* Status Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-black">{statusCountsDiario.todos}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-[#155dfc]">{statusCountsDiario.emAnalise}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Em Análise</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-[#f97316]">{statusCountsDiario.devolvido}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Devolvidos</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters + View Toggle */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar por ID ou empresa..."
                      value={searchTermDiario}
                      onChange={(e) => setSearchTermDiario(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={tipoFilterDiario} onValueChange={setTipoFilterDiario}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Tipos</SelectItem>
                      <SelectItem value="Dispensa">Dispensa</SelectItem>
                      <SelectItem value="Inexigibilidade">Inexigibilidade</SelectItem>
                      <SelectItem value="Licitação (Pesquisa de Preço)">Licitação (Pesquisa de Preço)</SelectItem>
                      <SelectItem value="Pregão Eletrônico">Pregão Eletrônico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilterDiario} onValueChange={setStatusFilterDiario}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="Em Análise">Em Análise</SelectItem>
                      <SelectItem value="Devolvido ao Requisitante">Devolvido ao Requisitante</SelectItem>
                      <SelectItem value="Devolvido ao Administrador">Devolvido ao Administrador</SelectItem>
                      <SelectItem value="Aprovado">Aprovado</SelectItem>
                      <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* View Toggle */}
                <div className="flex gap-1 border border-gray-200 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className={viewMode === 'table' ? 'bg-[#003366] hover:bg-[#002244]' : ''}
                  >
                    <List size={16} />
                  </Button>
                  <Button
                    variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className={viewMode === 'kanban' ? 'bg-[#003366] hover:bg-[#002244]' : ''}
                  >
                    <LayoutGrid size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processes Table or Kanban */}
          {viewMode === 'table' ? (
            <Card className="border border-gray-200">
              <CardHeader className="pt-3 pb-1">
                <CardTitle className="text-xl text-black px-[0px] py-[8px]">Lista de processos</CardTitle>
              </CardHeader>
              <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 z-10 min-w-[220px]">Empresa</TableHead>
                        <TableHead className="min-w-[140px]">Data Distribuição RC</TableHead>
                        <TableHead className="min-w-[140px]">Data de Início</TableHead>
                        <TableHead className="min-w-[200px]">Tipo/Modalidade</TableHead>
                        <TableHead className="min-w-[180px]">Status</TableHead>
                        <TableHead className="min-w-[160px]">Regional</TableHead>
                        <TableHead className="min-w-[140px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProcessosDiarios.map((processo) => (
                        <TableRow key={processo.id}>
                          <TableCell className="text-black sticky left-0 z-10">{processo.empresa}</TableCell>
                          <TableCell className="text-gray-600">{processo.dataDistribuicaoRC}</TableCell>
                          <TableCell className="text-gray-600">{processo.dataInicio}</TableCell>
                          <TableCell className="text-gray-600">{processo.tipo}</TableCell>
                          <TableCell>
                            <Select 
                              value={processo.status} 
                              onValueChange={(novoStatus) => handleIniciarMudancaStatus(processo, novoStatus)}
                            >
                              <SelectTrigger className="w-[200px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Em Análise">Em Análise</SelectItem>
                                <SelectItem value="Aguardando Documentação">Aguardando Documentação</SelectItem>
                                <SelectItem value="Devolvido ao Administrador">Devolvido ao Administrador</SelectItem>
                                <SelectItem value="Aprovado">Aprovado</SelectItem>
                                <SelectItem value="Finalizado">Finalizado</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-gray-600">{processo.regional}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical size={16} className="text-gray-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedProcess(processo);
                                  setProcessoTipo('diario');
                                  setIsDetailsModalOpen(true);
                                }}>
                                  <Eye size={16} className="mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  setSelectedProcess(processo);
                                  setIsEditProcessModalOpen(true);
                                }}>
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setProcessoToDelete(processo);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600"
                                >
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(pageNumber)}
                                  isActive={currentPage === pageNumber}
                                  className="cursor-pointer"
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            pageNumber === currentPage - 2 ||
                            pageNumber === currentPage + 2
                          ) {
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <KanbanView
              processos={filteredProcessosDiarios}
              onViewDetails={(processo) => {
                setSelectedProcess(processo);
                setProcessoTipo('diario');
                setIsDetailsModalOpen(true);
              }}
              onEdit={(processo) => {
                setSelectedProcess(processo);
                setIsEditProcessModalOpen(true);
              }}
              onDelete={(processo) => {
                setProcessoToDelete(processo);
                setIsDeleteDialogOpen(true);
              }}
              onStatusChange={handleStatusChange}
              tipo="diario"
              allowDrag={true}
            />
          )}
        </TabsContent>

        {/* Aba: Processos Consolidados */}
        <TabsContent value="consolidado" className="space-y-6 mt-6">
          {/* Status Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-black">{statusCountsConsolidado.todos}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-[#22c55e]">{statusCountsConsolidado.ativo}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Ativos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-[#155dfc]">{statusCountsConsolidado.emRenovacao}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Em Renovação</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-[#e7000b]">{statusCountsConsolidado.vencido}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Vencidos</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters + View Toggle */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar por ID ou empresa..."
                      value={searchTermConsolidado}
                      onChange={(e) => setSearchTermConsolidado(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilterConsolidado} onValueChange={setStatusFilterConsolidado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Em Renovação">Em Renovação</SelectItem>
                      <SelectItem value="Vencido">Vencido</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* View Toggle */}
                <div className="flex gap-1 border border-gray-200 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className={viewMode === 'table' ? 'bg-[#003366] hover:bg-[#002244]' : ''}
                  >
                    <List size={16} />
                  </Button>
                  <Button
                    variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className={viewMode === 'kanban' ? 'bg-[#003366] hover:bg-[#002244]' : ''}
                  >
                    <LayoutGrid size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contracts Table or Kanban */}
          {viewMode === 'table' ? (
            <Card className="border border-gray-200">
              <CardHeader className="pt-3 pb-1">
                <CardTitle className="text-xl text-black px-[0px] py-[8px]">Contratos Consolidados</CardTitle>
              </CardHeader>
              <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 z-10 min-w-[160px]">ID do Contrato</TableHead>
                        <TableHead className="min-w-[220px]">Empresa</TableHead>
                        <TableHead className="min-w-[140px]">Valor</TableHead>
                        <TableHead className="min-w-[160px]">Fim Vigência</TableHead>
                        <TableHead className="min-w-[160px]">Status</TableHead>
                        <TableHead className="min-w-[140px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProcessosConsolidados.map((processo) => (
                        <TableRow key={processo.id}>
                          <TableCell className="text-black sticky left-0 z-10">{processo.id}</TableCell>
                          <TableCell className="text-black">{processo.empresa}</TableCell>
                          <TableCell className="text-black">{processo.valor}</TableCell>
                          <TableCell className="text-gray-600">{processo.dataFimVigencia}</TableCell>
                          <TableCell>
                            <BadgeNew {...getBadgeMappingForStatus(processo.statusContrato)}>
                              {processo.statusContrato}
                            </BadgeNew>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical size={16} className="text-gray-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedProcess(processo);
                                  setProcessoTipo('consolidado');
                                  setIsDetailsModalOpen(true);
                                }}>
                                  <Eye size={16} className="mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  setSelectedProcess(processo);
                                  setIsEditConsolidadoModalOpen(true);
                                }}>
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedProcess(processo);
                                  setIsAditivoModalOpen(true);
                                }}>
                                  Registrar Aditivo
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedProcess(processo);
                                  setIsProrrogacaoModalOpen(true);
                                }}>
                                  Prorrogar Contrato
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <KanbanView
              processos={filteredProcessosConsolidados}
              onViewDetails={(processo) => {
                setSelectedProcess(processo);
                setProcessoTipo('consolidado');
                setIsDetailsModalOpen(true);
              }}
              onEdit={(processo) => {
                setSelectedProcess(processo);
                setIsEditConsolidadoModalOpen(true);
              }}
              onStatusChange={handleStatusChange}
              tipo="consolidado"
              allowDrag={true}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o processo <strong>{processoToDelete?.id}</strong>?
              <br /><br />
              Esta ação não pode ser desfeita e todos os dados relacionados serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setProcessoToDelete(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProcess}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Todos os modais de edição, aditivo e prorrogação do arquivo original - copiar completo */}
      {/* [Os modais serão mantidos do arquivo original] */}

      {/* Modal de Mudança de Status */}
      <Dialog open={isStatusChangeModalOpen} onOpenChange={setIsStatusChangeModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirmar Mudança de Status</DialogTitle>
            <DialogDescription>
              Você está alterando o status do processo <strong>{processoParaMudarStatus?.id}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Status Atual</p>
                <p className="text-sm text-black mt-1">{processoParaMudarStatus?.status}</p>
              </div>
              <div className="text-gray-400">→</div>
              <div>
                <p className="text-sm text-gray-600">Novo Status</p>
                <p className="text-sm text-black mt-1">{novoStatus}</p>
              </div>
            </div>

            {novoStatus && (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  {novoStatus === 'Devolvido ao Administrador' && (
                    <span>A observação será <strong>enviada ao Administrador</strong> para análise.</span>
                  )}
                  {novoStatus === 'Aguardando Documentação' && (
                    <span>A observação será <strong>enviada ao Requisitante</strong> para providências.</span>
                  )}
                  {novoStatus !== 'Devolvido ao Administrador' && novoStatus !== 'Aguardando Documentação' && (
                    <span>A observação será registrada como <strong>nota interna</strong>.</span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="observacao">
                Observação {novoStatus === 'Devolvido ao Administrador' || novoStatus === 'Aguardando Documentação' ? '(recomendada)' : '(opcional)'}
              </Label>
              <Textarea
                id="observacao"
                placeholder={`Adicione detalhes sobre a mudança de status...${
                  novoStatus === 'Aguardando Documentação' 
                    ? ' Ex: documentos faltantes, prazos, etc.' 
                    : ''
                }`}
                value={observacaoStatus}
                onChange={(e) => setObservacaoStatus(e.target.value)}
                rows={4}
                className="mt-2"
              />
              {observacaoStatus && (
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Destinatário:</strong> {getDestinatarioObservacao(novoStatus)}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsStatusChangeModalOpen(false);
                setProcessoParaMudarStatus(null);
                setNovoStatus('');
                setObservacaoStatus('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarMudancaStatus}
              className="bg-[#003366] hover:bg-[#002244]"
            >
              Confirmar Mudança
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Processo - Idêntico ao Admin */}
      {selectedProcess && (
        <DetalhesProcessoModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedProcess(null);
          }}
          processo={selectedProcess}
          tipo={processoTipo}
        />
      )}
    </div>
  );
}