import React, { useState } from 'react';
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
import { Plus, Search, Edit, Trash2, Filter, FileText, CalendarPlus, Ban, Info, Eye, MoreVertical, LayoutGrid, List, Calendar } from 'lucide-react';
import { getBadgeMappingForStatus, getBadgeMappingForPrioridade } from '../../lib/badge-mappings';
import { FileInput } from '../ui/file-input';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { DetalhesProcessoModal } from '../DetalhesProcessoModal';
import { toast } from '../../lib/toast-helpers';

interface ProcessosProps {
  currentProfile?: 'admin' | 'comprador' | 'requisitante';
}

export function Processos({ currentProfile = 'admin' }: ProcessosProps) {
  const [activeTab, setActiveTab] = useState(currentProfile === 'comprador' ? 'atribuidas' : 'requisicoes');
  const [searchTermRequisicoes, setSearchTermRequisicoes] = useState('');
  const [prioridadeFilterRequisicoes, setPrioridadeFilterRequisicoes] = useState('todas');
  const [searchTermAtribuidas, setSearchTermAtribuidas] = useState('');
  const [prioridadeFilterAtribuidas, setPrioridadeFilterAtribuidas] = useState('todas');
  const [searchTermDiario, setSearchTermDiario] = useState('');
  const [statusFilterDiario, setStatusFilterDiario] = useState('todos');
  const [tipoFilterDiario, setTipoFilterDiario] = useState('todos');
  
  const [searchTermConsolidado, setSearchTermConsolidado] = useState('');
  const [statusFilterConsolidado, setStatusFilterConsolidado] = useState('todos');
  
  // Estados para TRP
  const [searchTermTRP, setSearchTermTRP] = useState('');
  const [filterTRP, setFilterTRP] = useState('todos');
  
  // Estados para Contratos
  const [searchTermContratos, setSearchTermContratos] = useState('');
  const [filterContratos, setFilterContratos] = useState('todos');
  
  // Estados para modais de TRP e Contratos
  const [isEditTRPModalOpen, setIsEditTRPModalOpen] = useState(false);
  const [isEditContratoModalOpen, setIsEditContratoModalOpen] = useState(false);
  const [isDetailsTRPModalOpen, setIsDetailsTRPModalOpen] = useState(false);
  const [isDetailsContratoModalOpen, setIsDetailsContratoModalOpen] = useState(false);
  const [selectedTRP, setSelectedTRP] = useState<any>(null);
  const [selectedContrato, setSelectedContrato] = useState<any>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isAtribuirModalOpen, setIsAtribuirModalOpen] = useState(false);
  const [selectedRequisicao, setSelectedRequisicao] = useState<any>(null);
  const [compradorSelecionado, setCompradorSelecionado] = useState('');
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
  const [requisicaoParaDetalhes, setRequisicaoParaDetalhes] = useState<any>(null);
  
  // Estados para configuração de requisição (Comprador)
  const [isConfigurarModalOpen, setIsConfigurarModalOpen] = useState(false);
  const [requisicaoParaConfigurar, setRequisicaoParaConfigurar] = useState<any>(null);
  
  // Estado para controle de envio automático (usado no modal de processos diários)
  const [bloquearEnvioAutomatico, setBloquearEnvioAutomatico] = useState(false);
  const [classificacaoPedido, setClassificacaoPedido] = useState('');

  // Estados para visualização Kanban e mudança de status
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
  const [processoParaMudarStatus, setProcessoParaMudarStatus] = useState<any>(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [justificativaStatus, setJustificativaStatus] = useState('');

  // Estados para Modal de Nova Demanda
  const [isNovaDemandaModalOpen, setIsNovaDemandaModalOpen] = useState(false);
  const [isDistribuirModalOpen, setIsDistribuirModalOpen] = useState(false);
  const [requisicaoParaDistribuir, setRequisicaoParaDistribuir] = useState<any>(null);
  const [dataInicioDistribuicao, setDataInicioDistribuicao] = useState('');

  // Usuário logado (comprador)
  const currentUser = 'João Santos';

  // Lista de compradores disponíveis
  const compradores = [
    'Maria Silva',
    'João Santos', 
    'Ana Costa',
    'Carlos Oliveira',
    'Paula Mendes',
    'Roberto Lima',
    'Fernanda Alves'
  ];

  // Lista de empresas
  const empresasList = [
    'Empresa ABC Ltda', 'Fornecedor XYZ S.A', 'Serviços DEF Eireli', 'Tecnologia GHI Ltda',
    'Soluções JKL Corp', 'Comércio MNO Ltda', 'Indústria PQR S.A', 'Distribuidora STU Eireli',
    'Construtora VWX Ltda', 'Consultoria YZA Corp', 'Logística BCD S.A', 'Manutenção EFG Ltda',
    'Alimentação HIJ Eireli', 'Segurança KLM Corp', 'Limpeza NOP Ltda', 'TI e Telecom QRS S.A'
  ];

  // Função para gerar dados fictícios
  const generateMockProcessos = () => {
    const tipos = ['Dispensa', 'Inexigibilidade', 'Licitação (Pesquisa de Preço)', 'Pregão Eletrônico'];
    const empresas = empresasList;
    const status = ['RC recebida', 'Análise de RC', 'Em cotação', 'RC devolvida para ajuste', 'Tramitando para aprovação', 'Aprovada'];
    const responsaveis = ['Maria Silva', 'João Santos', 'Ana Costa', 'Carlos Oliveira', 'Paula Mendes', 'Roberto Lima', 'Fernanda Alves'];
    const requisitantes = [
      'Carlos Alberto - Alimentação', 'Marina Santos - TI', 'Pedro Oliveira - Manutenção',
      'Julia Fernandes - Infraestrutura', 'Roberto Lima - Eventos', 'Fernanda Costa - RH',
      'Paulo Henrique - Infraestrutura', 'Luciana Dias - Eventos'
    ];
    const objetos = [
      'Aquisição de equipamentos de cozinha industrial', 'Contratação de serviço de manutenção de rede',
      'Aquisição de materiais de limpeza', 'Reforma de salas administrativas',
      'Locação de equipamento de som e iluminação', 'Contratação de sistema de gestão',
      'Aquisição de mobiliário para escritório', 'Serviço de buffet para eventos'
    ];
    
    const processos = [];
    for (let i = 1; i <= 75; i++) {
      const diaRC = Math.floor(Math.random() * 28) + 1;
      const mes = Math.floor(Math.random() * 3) + 1;
      const diaInicio = diaRC + Math.floor(Math.random() * 5) + 3;
      const diaFim = diaInicio + Math.floor(Math.random() * 15) + 5;
      const statusAtual = i === 5 ? 'Devolvido ao Administrador' : status[Math.floor(Math.random() * status.length)];
      
      processos.push({
        id: `PROC-2024-${String(i).padStart(3, '0')}`,
        numeroRequisicao: `RC-2024-${String(i).padStart(3, '0')}`,
        requisitante: requisitantes[Math.floor(Math.random() * requisitantes.length)],
        objeto: objetos[Math.floor(Math.random() * objetos.length)],
        tipo: tipos[Math.floor(Math.random() * tipos.length)],
        status: statusAtual,
        responsavel: responsaveis[Math.floor(Math.random() * responsaveis.length)],
        dataRecebimento: `${String(diaRC).padStart(2, '0')}/${String(mes).padStart(2, '0')}/2024`,
        dataFinalizacao: statusAtual === 'Aprovada' || statusAtual === 'Finalizado' 
          ? `${String(diaFim).padStart(2, '0')}/${String(mes).padStart(2, '0')}/2024` 
          : '-',
        empresaVencedora: statusAtual === 'Aprovada' || statusAtual === 'Finalizado' 
          ? empresas[Math.floor(Math.random() * empresas.length)]
          : '-',
        dataDistribuicaoRC: `${String(diaRC).padStart(2, '0')}/${String(mes).padStart(2, '0')}/2024`,
        dataInicio: `${String(diaInicio).padStart(2, '0')}/${String(mes).padStart(2, '0')}/2024`,
        empresa: empresas[Math.floor(Math.random() * empresas.length)],
        valor: '',
        categoria: '',
        prazoEntrega: '',
        regional: 'São Paulo',
        justificativaDevolucao: i === 5 ? 'Documentação técnica incompleta. Faltam certificações obrigatórias dos equipamentos e comprovação de capacidade técnica do fornecedor.' : undefined
      });
    }
    return processos;
  };

  // Dados para Requisições Pendentes
  const requisicoesPendentes = [
    {
      id: 'REQ-2024-089',
      requisitante: 'Carlos Alberto - Alimentação',
      objeto: 'Aquisição de equipamentos de cozinha industrial',
      responsavel: 'Maria Silva',
      prioridade: 'Alta',
      dataRecebimento: '10/11/2024',
      dataFinalizacao: '25/11/2024',
      categoria: 'Equipamentos'
    },
    {
      id: 'REQ-2024-090',
      requisitante: 'Marina Santos - TI',
      objeto: 'Contratação de serviço de manutenção de rede',
      responsavel: 'João Santos',
      prioridade: 'Média',
      dataRecebimento: '10/11/2024',
      dataFinalizacao: '20/11/2024',
      categoria: 'Serviços'
    },
    {
      id: 'REQ-2024-091',
      requisitante: 'Pedro Oliveira - Manutenção',
      objeto: 'Aquisição de materiais de limpeza',
      responsavel: 'Ana Costa',
      prioridade: 'Baixa',
      dataRecebimento: '11/11/2024',
      dataFinalizacao: '18/11/2024',
      categoria: 'Materiais'
    },
    {
      id: 'REQ-2024-092',
      requisitante: 'Julia Fernandes - Infraestrutura',
      objeto: 'Reforma de salas administrativas',
      responsavel: 'Carlos Oliveira',
      prioridade: 'Alta',
      dataRecebimento: '11/11/2024',
      dataFinalizacao: '30/11/2024',
      categoria: 'Obras'
    },
    {
      id: 'REQ-2024-093',
      requisitante: 'Roberto Lima - Eventos',
      objeto: 'Locação de equipamento de som e iluminação',
      responsavel: 'Paula Mendes',
      prioridade: 'Média',
      dataRecebimento: '11/11/2024',
      dataFinalizacao: '22/11/2024',
      categoria: 'Serviços'
    }
  ];

  // Requisições Atribuídas ao Comprador (simulação de requisições que o admin atribuiu)
  // Todas as requisições disponíveis no sistema
  const todasRequisicoesAtribuidas = [
    {
      id: 'REQ-2024-085',
      requisitante: 'Fernanda Costa - RH',
      objeto: 'Contratação de sistema de gestão de pessoal',
      responsavel: 'João Santos',
      prioridade: 'Alta',
      dataRecebimento: '08/11/2024',
      dataAtribuicao: '09/11/2024',
      dataFinalizacao: '28/11/2024',
      categoria: 'Software',
      atribuidoPor: 'Admin - Maria Silva',
      compradorResponsavel: 'João Santos'
    },
    {
      id: 'REQ-2024-086',
      requisitante: 'Paulo Henrique - Infraestrutura',
      objeto: 'Aquisição de mobiliário para escritório',
      responsavel: 'João Santos',
      prioridade: 'Média',
      dataRecebimento: '09/11/2024',
      dataAtribuicao: '10/11/2024',
      dataFinalizacao: '24/11/2024',
      categoria: 'Mobiliário',
      atribuidoPor: 'Admin - Maria Silva',
      compradorResponsavel: 'João Santos'
    },
    {
      id: 'REQ-2024-087',
      requisitante: 'Luciana Dias - Eventos',
      objeto: 'Serviço de buffet para eventos corporativos',
      responsavel: 'João Santos',
      prioridade: 'Baixa',
      dataRecebimento: '10/11/2024',
      dataAtribuicao: '11/11/2024',
      dataFinalizacao: '20/11/2024',
      categoria: 'Serviços',
      atribuidoPor: 'Admin - Maria Silva',
      compradorResponsavel: 'João Santos'
    },
    {
      id: 'REQ-2024-088',
      requisitante: 'Marina Santos - TI',
      objeto: 'Renovação de licenças de software',
      responsavel: 'Ana Costa',
      prioridade: 'Alta',
      dataRecebimento: '11/11/2024',
      dataAtribuicao: '12/11/2024',
      dataFinalizacao: '25/11/2024',
      categoria: 'Software',
      atribuidoPor: 'Admin - Carlos Silva',
      compradorResponsavel: 'Ana Costa'
    },
    {
      id: 'REQ-2024-089',
      requisitante: 'Pedro Oliveira - Manutenção',
      objeto: 'Compra de ferramentas elétricas',
      responsavel: 'Maria Silva',
      prioridade: 'Média',
      dataRecebimento: '10/11/2024',
      dataAtribuicao: '11/11/2024',
      dataFinalizacao: '22/11/2024',
      categoria: 'Equipamentos',
      atribuidoPor: 'Admin - Carlos Silva',
      compradorResponsavel: 'Maria Silva'
    }
  ];

  // Filtrar apenas requisições atribuídas ao comprador logado
  const requisicoesAtribuidas = currentProfile === 'comprador' 
    ? todasRequisicoesAtribuidas.filter(req => req.compradorResponsavel === currentUser)
    : todasRequisicoesAtribuidas;

  // Dados para Aba 2: Gerenciamento de Processos (Dia a Dia)
  const processosDiarios = generateMockProcessos();

  // Dados para Aba 3: Processo Consolidado (Termos e Contratos)
  const processosConsolidados = [
    {
      id: 'CONT-2024-001',
      requisitante: 'Carlos Alberto - Alimentação',
      objeto: 'Aquisição de equipamentos de cozinha industrial',
      tipo: 'Dispensa',
      status: 'Aprovado',
      responsavel: 'Maria Silva',
      dataRecebimento: '05/10/2024',
      dataFinalizacao: '20/10/2024',
      empresaVencedora: 'Empresa ABC Ltda',
      dataEntrega: '25/10/2024',
      valor: 'R$ 125.000,00',
      dataFimVigencia: '15/12/2024',
      statusContrato: 'Ativo'
    },
    {
      id: 'CONT-2024-002',
      requisitante: 'Marina Santos - TI',
      objeto: 'Contratação de serviço de manutenção de rede',
      tipo: 'Pregão Eletrônico',
      status: 'Aprovado',
      responsavel: 'João Santos',
      dataRecebimento: '08/09/2024',
      dataFinalizacao: '30/09/2024',
      empresaVencedora: 'Fornecedor XYZ S.A',
      dataEntrega: '05/10/2024',
      valor: 'R$ 89.500,00',
      dataFimVigencia: '28/02/2025',
      statusContrato: 'Ativo'
    },
    {
      id: 'CONT-2023-045',
      requisitante: 'Pedro Oliveira - Manutenção',
      objeto: 'Aquisição de materiais de limpeza',
      tipo: 'Licitação (Pesquisa de Preço)',
      status: 'Aprovado',
      responsavel: 'Ana Costa',
      dataRecebimento: '15/08/2024',
      dataFinalizacao: '28/08/2024',
      empresaVencedora: 'Serviços DEF Eireli',
      dataEntrega: '02/09/2024',
      valor: 'R$ 45.200,00',
      dataFimVigencia: '30/11/2024',
      statusContrato: 'Próximo ao Vencimento'
    },
    {
      id: 'CONT-2023-032',
      requisitante: 'Julia Fernandes - Infraestrutura',
      objeto: 'Reforma de salas administrativas',
      tipo: 'Dispensa',
      status: 'Aprovado',
      responsavel: 'Carlos Oliveira',
      dataRecebimento: '20/07/2024',
      dataFinalizacao: '05/08/2024',
      empresaVencedora: 'Tecnologia GHI Ltda',
      dataEntrega: '10/08/2024',
      valor: 'R$ 210.000,00',
      dataFimVigencia: '15/10/2024',
      statusContrato: 'Vencido'
    },
    {
      id: 'CONT-2024-003',
      requisitante: 'Roberto Lima - Eventos',
      objeto: 'Locação de equipamento de som e iluminação',
      tipo: 'Inexigibilidade',
      status: 'Aprovado',
      responsavel: 'Paula Mendes',
      dataRecebimento: '10/09/2024',
      dataFinalizacao: '25/09/2024',
      empresaVencedora: 'Soluções JKL Corp',
      dataEntrega: '30/09/2024',
      valor: 'R$ 156.800,00',
      dataFimVigencia: '20/06/2025',
      statusContrato: 'Ativo'
    }
  ];

  // Dados para TRP (Termo de Referência de Preço)
  const trpList = [
    {
      empresaVencedora: 'Empresa ABC Ltda',
      cnpj: '12.345.678/0001-90',
      numeroProcesso: 'TRP-2024-001',
      valorContratado: 'R$ 125.000,00',
      vigencia: '12 meses',
      aditivos: 0
    },
    {
      empresaVencedora: 'Fornecedor XYZ S.A',
      cnpj: '23.456.789/0001-12',
      numeroProcesso: 'TRP-2024-002',
      valorContratado: 'R$ 89.500,00',
      vigencia: '18 meses',
      aditivos: 1
    },
    {
      empresaVencedora: 'Serviços DEF Eireli',
      cnpj: '34.567.890/0001-34',
      numeroProcesso: 'TRP-2023-045',
      valorContratado: 'R$ 45.200,00',
      vigencia: '24 meses',
      aditivos: 2
    }
  ];

  // Dados para Contratos
  const contratosList = [
    {
      empresaVencedora: 'Tecnologia GHI Ltda',
      cnpj: '45.678.901/0001-56',
      numeroProcesso: 'CONT-2023-032',
      valorContratado: 'R$ 210.000,00',
      vigencia: '36 meses',
      aditivos: 3
    },
    {
      empresaVencedora: 'Soluções JKL Corp',
      cnpj: '56.789.012/0001-78',
      numeroProcesso: 'CONT-2024-003',
      valorContratado: 'R$ 156.800,00',
      vigencia: '24 meses',
      aditivos: 1
    },
    {
      empresaVencedora: 'Comércio MNO Ltda',
      cnpj: '67.890.123/0001-90',
      numeroProcesso: 'CONT-2024-004',
      valorContratado: 'R$ 98.300,00',
      vigencia: '12 meses',
      aditivos: 0
    }
  ];

  // Contadores para Requisições Pendentes
  const requisicoesCounts = {
    total: requisicoesPendentes.length,
    alta: requisicoesPendentes.filter(r => r.prioridade === 'Alta').length,
    media: requisicoesPendentes.filter(r => r.prioridade === 'Média').length,
    baixa: requisicoesPendentes.filter(r => r.prioridade === 'Baixa').length
  };

  // Contadores para Requisições Atribuídas (Comprador)
  const requisicoesAtribuidasCounts = {
    total: requisicoesAtribuidas.length,
    alta: requisicoesAtribuidas.filter(r => r.prioridade === 'Alta').length,
    media: requisicoesAtribuidas.filter(r => r.prioridade === 'Média').length,
    baixa: requisicoesAtribuidas.filter(r => r.prioridade === 'Baixa').length
  };

  // Status counts para Aba 2 (apenas processos ativos)
  const statusCountsDiario = {
    todos: processosDiarios.filter(p => p.status !== 'Aprovada').length,
    rcRecebida: processosDiarios.filter(p => p.status === 'RC recebida pelo servidor de compras').length,
    analise: processosDiarios.filter(p => p.status === 'Análise de RC').length,
    cotacao: processosDiarios.filter(p => p.status === 'Em cotação').length,
    devolvida: processosDiarios.filter(p => p.status === 'RC devolvida para ajuste').length,
    tramitando: processosDiarios.filter(p => p.status === 'Tramitando para aprovação').length
  };

  // Status counts para Processos Encerrados (nova aba)
  // Status counts para Aba 3
  const statusCountsConsolidado = {
    todos: processosConsolidados.length,
    ativo: processosConsolidados.filter(p => p.statusContrato === 'Ativo').length,
    proximoVencimento: processosConsolidados.filter(p => p.statusContrato === 'Próximo ao Vencimento').length,
    vencido: processosConsolidados.filter(p => p.statusContrato === 'Vencido').length
  };



  const filteredRequisicoes = requisicoesPendentes.filter(req => {
    const matchesSearch = req.requisitante.toLowerCase().includes(searchTermRequisicoes.toLowerCase()) ||
                         req.id.toLowerCase().includes(searchTermRequisicoes.toLowerCase()) ||
                         req.objeto.toLowerCase().includes(searchTermRequisicoes.toLowerCase());
    const matchesPrioridade = prioridadeFilterRequisicoes === 'todas' || req.prioridade === prioridadeFilterRequisicoes;
    return matchesSearch && matchesPrioridade;
  });

  const filteredRequisicoesAtribuidas = requisicoesAtribuidas.filter(req => {
    const matchesSearch = req.requisitante.toLowerCase().includes(searchTermAtribuidas.toLowerCase()) ||
                         req.id.toLowerCase().includes(searchTermAtribuidas.toLowerCase()) ||
                         req.objeto.toLowerCase().includes(searchTermAtribuidas.toLowerCase());
    const matchesPrioridade = prioridadeFilterAtribuidas === 'todas' || req.prioridade === prioridadeFilterAtribuidas;
    return matchesSearch && matchesPrioridade;
  });

  const filteredProcessosDiarios = processosDiarios.filter(processo => {
    // Filtra apenas processos ativos (não encerrados)
    const isAtivo = processo.status !== 'Aprovado' && processo.status !== 'Rejeitado';
    const matchesSearch = processo.empresa.toLowerCase().includes(searchTermDiario.toLowerCase()) ||
                         processo.id.toLowerCase().includes(searchTermDiario.toLowerCase());
    const matchesStatus = statusFilterDiario === 'todos' || processo.status === statusFilterDiario;
    const matchesTipo = tipoFilterDiario === 'todos' || processo.tipo === tipoFilterDiario;
    return isAtivo && matchesSearch && matchesStatus && matchesTipo;
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
    const matchesSearch = processo.empresaVencedora.toLowerCase().includes(searchTermConsolidado.toLowerCase()) ||
                         processo.id.toLowerCase().includes(searchTermConsolidado.toLowerCase()) ||
                         processo.requisitante.toLowerCase().includes(searchTermConsolidado.toLowerCase());
    const matchesStatus = statusFilterConsolidado === 'todos' || processo.statusContrato === statusFilterConsolidado;
    return matchesSearch && matchesStatus;
  });

  // Filtragem para TRP
  const filteredTRP = trpList.filter(trp => {
    const matchesSearch = trp.empresaVencedora.toLowerCase().includes(searchTermTRP.toLowerCase()) ||
                         trp.cnpj.includes(searchTermTRP) ||
                         trp.numeroProcesso.toLowerCase().includes(searchTermTRP.toLowerCase());
    const matchesFilter = filterTRP === 'todos' || 
                         (filterTRP === 'com-aditivos' && trp.aditivos > 0) ||
                         (filterTRP === 'sem-aditivos' && trp.aditivos === 0);
    return matchesSearch && matchesFilter;
  });

  // Filtragem para Contratos
  const filteredContratos = contratosList.filter(contrato => {
    const matchesSearch = contrato.empresaVencedora.toLowerCase().includes(searchTermContratos.toLowerCase()) ||
                         contrato.cnpj.includes(searchTermContratos) ||
                         contrato.numeroProcesso.toLowerCase().includes(searchTermContratos.toLowerCase());
    const matchesFilter = filterContratos === 'todos' || 
                         (filterContratos === 'com-aditivos' && contrato.aditivos > 0) ||
                         (filterContratos === 'sem-aditivos' && contrato.aditivos === 0);
    return matchesSearch && matchesFilter;
  });

  const handleAtribuirComprador = () => {
    if (selectedRequisicao && compradorSelecionado && dataInicioDistribuicao) {
      const dataFormatada = new Date(dataInicioDistribuicao).toLocaleDateString('pt-BR');
      toast.success(`Requisição ${selectedRequisicao.id} distribuída para ${compradorSelecionado} com data de início em ${dataFormatada}!`);
      setIsAtribuirModalOpen(false);
      setSelectedRequisicao(null);
      setCompradorSelecionado('');
      setDataInicioDistribuicao('');
    }
  };

  // Função para iniciar mudança de status
  const handleIniciarMudancaStatus = (processo: any, novoStatusSelecionado: string) => {
    setProcessoParaMudarStatus(processo);
    setNovoStatus(novoStatusSelecionado);
    setJustificativaStatus('');
    setIsStatusChangeModalOpen(true);
  };

  // Função para confirmar mudança de status
  const handleConfirmarMudancaStatus = () => {
    if (processoParaMudarStatus) {
      // Aqui você atualizaria o status no backend/estado
      toast.success(`Status do processo alterado para "${novoStatus}" com sucesso!`);
      setIsStatusChangeModalOpen(false);
      setProcessoParaMudarStatus(null);
      setNovoStatus('');
      setJustificativaStatus('');
    }
  };

  // Status disponíveis para o Kanban
  const statusKanban = [
    'Em Análise',
    'Aguardando Documentação',
    'Devolvido ao Administrador',
    'Aprovado',
    'Finalizado'
  ];

  // Cores e configurações para cada coluna do Kanban
  const kanbanColumnConfig: Record<string, { color: string; bgColor: string; borderColor: string; displayName: string }> = {
    'Em Análise': {
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      displayName: 'Em Análise'
    },
    'Aguardando Documentação': {
      color: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-300',
      displayName: 'Aguardando Documentação'
    },
    'Devolvido ao Administrador': {
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      displayName: 'Devolvido ao Admin'
    },
    'Aprovado': {
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      displayName: 'Aprovado'
    },
    'Finalizado': {
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      displayName: 'Finalizado'
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Gerenciamento de Processos</h2>
          <p className="text-gray-600 mt-1">Controle centralizado de processos de compra, acompanhamento de status e vigência.</p>
        </div>
        
        {/* Botão dinâmico baseado na aba ativa - APENAS para Admin */}
        {currentProfile === 'admin' && (activeTab === 'requisicoes' ? (
          <Dialog open={isNovaDemandaModalOpen} onOpenChange={setIsNovaDemandaModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                <Plus size={20} className="mr-2" />
                Nova Demanda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
              {/* Área scrollável */}
              <div className="flex-1 overflow-y-auto px-6">
                <DialogHeader className="pt-6">
                  <DialogTitle>Cadastrar Nova Demanda (RC)</DialogTitle>
                  <DialogDescription>
                    Registre manualmente uma nova Requisição de Compra
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 pb-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-800">
                      Após o cadastro, você poderá distribuir esta demanda para um comprador.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="rc-numero">Número da RC *</Label>
                      <Input 
                        id="rc-numero" 
                        placeholder="REQ-2024-094" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rc-data">Data de Recebimento *</Label>
                      <Input 
                        id="rc-data" 
                        type="date"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="rc-requisitante">Requisitante *</Label>
                    <Select>
                      <SelectTrigger id="rc-requisitante">
                        <SelectValue placeholder="Selecione o requisitante" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carlos-alimentacao">Carlos Alberto - Alimentação</SelectItem>
                        <SelectItem value="marina-ti">Marina Santos - TI</SelectItem>
                        <SelectItem value="pedro-manutencao">Pedro Oliveira - Manutenção</SelectItem>
                        <SelectItem value="julia-infraestrutura">Julia Fernandes - Infraestrutura</SelectItem>
                        <SelectItem value="roberto-eventos">Roberto Lima - Eventos</SelectItem>
                        <SelectItem value="fernanda-rh">Fernanda Costa - RH</SelectItem>
                        <SelectItem value="paulo-infraestrutura">Paulo Henrique - Infraestrutura</SelectItem>
                        <SelectItem value="luciana-eventos">Luciana Dias - Eventos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="rc-objeto">Objeto da Compra *</Label>
                    <Textarea 
                      id="rc-objeto" 
                      placeholder="Descreva o objeto da requisição de compra..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="rc-categoria">Categoria</Label>
                      <Select>
                        <SelectTrigger id="rc-categoria">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equipamentos">Equipamentos</SelectItem>
                          <SelectItem value="servicos">Serviços</SelectItem>
                          <SelectItem value="materiais">Materiais</SelectItem>
                          <SelectItem value="obras">Obras</SelectItem>
                          <SelectItem value="software">Software</SelectItem>
                          <SelectItem value="mobiliario">Mobiliário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rc-prioridade">Prioridade *</Label>
                      <Select>
                        <SelectTrigger id="rc-prioridade">
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="rc-data-finalizacao">Data de Finalização Prevista</Label>
                    <Input 
                      id="rc-data-finalizacao" 
                      type="date"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="rc-anexo">Documento da RC (Opcional)</Label>
                    <FileInput 
                      id="rc-anexo" 
                      accept=".pdf,.doc,.docx"
                    />
                    <p className="text-xs text-gray-500">Formatos aceitos: PDF, DOC, DOCX</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="rc-observacoes">Observações</Label>
                    <Textarea 
                      id="rc-observacoes" 
                      placeholder="Informações adicionais sobre a requisição..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Footer fixo */}
              <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2">
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsNovaDemandaModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                  onClick={() => {
                    toast.success('Demanda cadastrada com sucesso!');
                    setIsNovaDemandaModalOpen(false);
                  }}
                >
                  Cadastrar Demanda
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : activeTab === 'diario' ? (
          <Dialog open={isNewProcessModalOpen} onOpenChange={setIsNewProcessModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                <Plus size={20} className="mr-2" />
                Cadastrar Processo
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            {/* Área scrollável */}
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Cadastrar Novo Processo</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo processo de compra
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="processo-id">ID do Processo</Label>
                  <Input id="processo-id" placeholder="PROC-2024-006" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="processo-tipo">Tipo (Modalidade)</Label>
                  <Select>
                    <SelectTrigger id="processo-tipo">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dispensa">Dispensa</SelectItem>
                      <SelectItem value="inexigibilidade">Inexigibilidade</SelectItem>
                      <SelectItem value="licitacao">Licitação (Pesquisa de Preço)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="processo-empresa">Empresa</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresasList.map((empresa) => (
                      <SelectItem key={empresa} value={empresa}>
                        {empresa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="processo-status">Status</Label>
                  <Select>
                    <SelectTrigger id="processo-status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analise">Em Análise</SelectItem>
                      <SelectItem value="devolvido">Devolvido ao Requisitante</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="rejeitado">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="processo-responsavel">Responsável</Label>
                  <Input id="processo-responsavel" placeholder="Nome do responsável" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="processo-data-rc">Data Distribuição RC</Label>
                  <Input id="processo-data-rc" type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="processo-data">Data de Início</Label>
                  <Input id="processo-data" type="date" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="processo-classificacao">Classificação do Pedido</Label>
                <Select onValueChange={(value) => {
                  setClassificacaoPedido(value);
                  // Bloqueia automaticamente se for pré-contrato
                  if (value === 'pre-contrato') {
                    setBloquearEnvioAutomatico(true);
                  } else if (value === 'normal') {
                    setBloquearEnvioAutomatico(false);
                  }
                }}>
                  <SelectTrigger id="processo-classificacao">
                    <SelectValue placeholder="Selecione a classificação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="pre-contrato">Pré-Contrato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3 p-4 border-2 border-dashed border-orange-300 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Ban size={18} className="text-orange-600" />
                      <Label className="text-base text-black">Bloquear Envio Automático</Label>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Impede o envio automático mesmo se aprovado e abaixo do limite (R$ 50.000,00)
                    </p>
                  </div>
                  <Switch 
                    checked={bloquearEnvioAutomatico}
                    onCheckedChange={setBloquearEnvioAutomatico}
                  />
                </div>
                
                {bloquearEnvioAutomatico && (
                  <Alert className="border-orange-200 bg-orange-100">
                    <Info className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 text-xs">
                      <strong>Atenção:</strong> Este processo não será enviado automaticamente. Use esta opção para pré-contratos que precisam de gestão manual.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="processo-observacoes">Observações</Label>
                <Textarea id="processo-observacoes" placeholder="Observações adicionais" rows={2} />
              </div>
              </div>
            </div>

            {/* Footer fixo */}
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1" onClick={() => setIsNewProcessModalOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => setIsNewProcessModalOpen(false)}>
                Cadastrar Processo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        ) : activeTab === 'consolidado' ? (
          <Dialog open={isNewConsolidadoModalOpen} onOpenChange={setIsNewConsolidadoModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                <Plus size={20} className="mr-2" />
                Novo Processo Consolidado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
              {/* Área scrollável */}
              <div className="flex-1 overflow-y-auto px-6">
                <DialogHeader className="pt-6">
                  <DialogTitle>Cadastrar Processo Consolidado</DialogTitle>
                  <DialogDescription>
                    Registre um novo contrato ou processo homologado
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-3 pb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="consolidado-id-header">ID do Contrato/Processo</Label>
                      <Input id="consolidado-id-header" placeholder="CONT-2024-006" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="consolidado-valor-header">Valor (R$) *</Label>
                      <Input id="consolidado-valor-header" placeholder="R$ 0,00" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="consolidado-empresa-header">Empresa</Label>
                    <Input id="consolidado-empresa-header" placeholder="Nome da empresa" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="consolidado-status-header">Status do Contrato</Label>
                      <Select>
                        <SelectTrigger id="consolidado-status-header">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="proximo-vencimento">Próximo ao Vencimento</SelectItem>
                          <SelectItem value="vencido">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="consolidado-data-header">Data Fim da Vigência</Label>
                      <Input id="consolidado-data-header" type="date" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="consolidado-objeto-header">Objeto do Contrato</Label>
                    <Textarea id="consolidado-objeto-header" placeholder="Descrição do objeto" rows={2} />
                  </div>
                </div>
              </div>

              {/* Footer fixo */}
              <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                <Button variant="outline" className="flex-1" onClick={() => setIsNewConsolidadoModalOpen(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => setIsNewConsolidadoModalOpen(false)}>
                  Cadastrar Contrato
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null)}
      </div>

      {/* Tabs */}
      <Tabs 
        defaultValue={currentProfile === 'comprador' ? 'atribuidas' : 'requisicoes'} 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        {currentProfile === 'admin' ? (
          <TabsList className="grid w-full max-w-4xl grid-cols-3">
            <TabsTrigger value="requisicoes">
              Requisições Pendentes ({requisicoesCounts.total})
            </TabsTrigger>
            <TabsTrigger value="diario">
              Processos em Andamento
            </TabsTrigger>
            <TabsTrigger value="consolidado">
              Processos Consolidados
            </TabsTrigger>
          </TabsList>
        ) : (
          <TabsList className="grid w-full max-w-4xl grid-cols-3">
            <TabsTrigger value="atribuidas">
              Requisições Atribuídas ({requisicoesAtribuidasCounts.total})
            </TabsTrigger>
            <TabsTrigger value="diario">
              Processos em Andamento
            </TabsTrigger>
            <TabsTrigger value="consolidado">
              Processos Consolidados
            </TabsTrigger>
          </TabsList>
        )}

        {/* Aba: Requisições Atribuídas (Comprador) */}
        {currentProfile === 'comprador' && (
          <TabsContent value="atribuidas" className="space-y-6 mt-6">
            {/* Alert Informativo */}
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Ação necessária:</strong> Configure as requisições abaixo clicando no botão "Iniciar Processo". 
                Você precisa definir o tipo, classificação e dados de governança antes de iniciar o trabalho.
              </AlertDescription>
            </Alert>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center h-full py-6">
                  <div className="flex flex-col gap-1 items-center justify-center text-center">
                    <p className="text-2xl leading-8 text-black">{requisicoesAtribuidasCounts.total}</p>
                    <p className="text-xs leading-4 text-[#4a5565]">Total</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center h-full py-6">
                  <div className="flex flex-col gap-1 items-center justify-center text-center">
                    <p className="text-2xl leading-8 text-[#e7000b]">{requisicoesAtribuidasCounts.alta}</p>
                    <p className="text-xs leading-4 text-[#4a5565]">Prioridade Alta</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center h-full py-6">
                  <div className="flex flex-col gap-1 items-center justify-center text-center">
                    <p className="text-2xl leading-8 text-[#ffa500]">{requisicoesAtribuidasCounts.media}</p>
                    <p className="text-xs leading-4 text-[#4a5565]">Prioridade Média</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center h-full py-6">
                  <div className="flex flex-col gap-1 items-center justify-center text-center">
                    <p className="text-2xl leading-8 text-[#155dfc]">{requisicoesAtribuidasCounts.baixa}</p>
                    <p className="text-xs leading-4 text-[#4a5565]">Prioridade Baixa</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Buscar por ID, requisitante ou objeto..."
                        value={searchTermAtribuidas}
                        onChange={(e) => setSearchTermAtribuidas(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Select value={prioridadeFilterAtribuidas} onValueChange={setPrioridadeFilterAtribuidas}>
                      <SelectTrigger>
                        <SelectValue placeholder="Prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas as Prioridades</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requisições Atribuídas Table */}
            <Card className="border border-gray-200">
              <CardHeader className="pt-3 pb-1">
                <CardTitle className="text-xl text-black px-[0px] py-[8px]">Requisições Atribuídas a Você</CardTitle>
              </CardHeader>
              <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 z-10 min-w-[140px]">ID Requisição</TableHead>
                        <TableHead className="min-w-[200px]">Requisitante</TableHead>
                        <TableHead className="min-w-[300px]">Objeto</TableHead>
                        <TableHead className="min-w-[160px]">Responsável</TableHead>
                        <TableHead className="min-w-[140px]">Prioridade</TableHead>
                        <TableHead className="min-w-[160px]">Status</TableHead>
                        <TableHead className="min-w-[140px]">Data Finalização</TableHead>
                        <TableHead className="min-w-[200px] text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequisicoesAtribuidas.map((requisicao) => (
                        <TableRow key={requisicao.id}>
                          <TableCell className="text-black sticky left-0 z-10">{requisicao.id}</TableCell>
                          <TableCell className="text-gray-600">{requisicao.requisitante}</TableCell>
                          <TableCell className="text-gray-600">{requisicao.objeto}</TableCell>
                          <TableCell className="text-gray-600">{requisicao.responsavel}</TableCell>
                          <TableCell>
                            <BadgeNew {...getBadgeMappingForPrioridade(requisicao.prioridade)}>
                              {requisicao.prioridade}
                            </BadgeNew>
                          </TableCell>
                          <TableCell>
                            <BadgeNew intention="warning" weight="bold" size="md">
                              Aguardando Configuração
                            </BadgeNew>
                          </TableCell>
                          <TableCell className="text-gray-600">{requisicao.dataFinalizacao}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <Button 
                                size="sm"
                                className="bg-[#003366] hover:bg-[#002244] text-white"
                                onClick={() => {
                                  setRequisicaoParaConfigurar(requisicao);
                                  setIsConfigurarModalOpen(true);
                                }}
                              >
                                <FileText size={16} className="mr-2" />
                                Iniciar Processo
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Aba 1: Requisições Pendentes (Admin) */}
        <TabsContent value="requisicoes" className="space-y-6 mt-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-black">{requisicoesCounts.total}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-[#e7000b]">{requisicoesCounts.alta}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Prioridade Alta</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-[#f97316]">{requisicoesCounts.media}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Prioridade Média</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-[#155dfc]">{requisicoesCounts.baixa}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Prioridade Baixa</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar por ID, requisitante ou objeto..."
                      value={searchTermRequisicoes}
                      onChange={(e) => setSearchTermRequisicoes(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={prioridadeFilterRequisicoes} onValueChange={setPrioridadeFilterRequisicoes}>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Prioridades</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requisições Table */}
          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black px-[0px] py-[8px]">Requisições Pendentes</CardTitle>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 z-10 min-w-[140px]">ID Requisição</TableHead>
                      <TableHead className="min-w-[200px]">Requisitante</TableHead>
                      <TableHead className="min-w-[300px]">Objeto</TableHead>
                      <TableHead className="min-w-[160px]">Responsável</TableHead>
                      <TableHead className="min-w-[140px]">Prioridade</TableHead>
                      <TableHead className="min-w-[140px]">Data Recebimento</TableHead>
                      <TableHead className="min-w-[140px]">Data Finalização</TableHead>
                      <TableHead className="min-w-[200px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequisicoes.map((requisicao) => (
                      <TableRow key={requisicao.id}>
                        <TableCell className="text-black sticky left-0 z-10">{requisicao.id}</TableCell>
                        <TableCell className="text-gray-600">{requisicao.requisitante}</TableCell>
                        <TableCell className="text-gray-600">{requisicao.objeto}</TableCell>
                        <TableCell className="text-gray-600">{requisicao.responsavel}</TableCell>
                        <TableCell>
                          <BadgeNew {...getBadgeMappingForPrioridade(requisicao.prioridade)}>
                            {requisicao.prioridade}
                          </BadgeNew>
                        </TableCell>
                        <TableCell className="text-gray-600">{requisicao.dataRecebimento}</TableCell>
                        <TableCell className="text-gray-600">{requisicao.dataFinalizacao}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm"
                              className="bg-[#003366] hover:bg-[#002244] text-white"
                              onClick={() => {
                                toast.success('Processo criado com sucesso!', {
                                  description: `Processo criado a partir da requisição ${requisicao.id}`
                                });
                              }}
                            >
                              <FileText size={16} className="mr-2" />
                              Criar Processo
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical size={16} className="text-gray-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setRequisicaoParaDetalhes(requisicao);
                                }}>
                                  <Eye size={16} className="mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  setSelectedRequisicao(requisicao);
                                  setIsAtribuirModalOpen(true);
                                }}>
                                  Atribuir Comprador
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 2: Processos em Andamento */}
        <TabsContent value="diario" className="space-y-6 mt-6">
          {/* Status Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  <p className="text-2xl leading-8 text-[#155dfc]">{statusCountsDiario.analise}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Em Análise</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-[#10b981]">{statusCountsDiario.cotacao}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Em Cotação</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-[#f97316]">{statusCountsDiario.devolvida}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Devolvidos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-[#9810fa]">{statusCountsDiario.tramitando}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Tramitando</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and View Toggle */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* View Toggle */}
                <div className="flex justify-end">
                  <div className="inline-flex rounded-lg border border-gray-200 p-1">
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className={viewMode === 'table' ? 'bg-[#003366] hover:bg-[#002244] text-white' : ''}
                    >
                      <List size={16} className="mr-2" />
                      Tabela
                    </Button>
                    <Button
                      variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('kanban')}
                      className={viewMode === 'kanban' ? 'bg-[#003366] hover:bg-[#002244] text-white' : ''}
                    >
                      <LayoutGrid size={16} className="mr-2" />
                      Kanban
                    </Button>
                  </div>
                </div>
                
                {/* Filters */}
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
                        <SelectItem value="RC recebida pelo servidor de compras">RC recebida pelo servidor de compras</SelectItem>
                        <SelectItem value="Análise de RC">Análise de RC</SelectItem>
                        <SelectItem value="Em cotação">Em cotação</SelectItem>
                        <SelectItem value="RC devolvida para ajuste">RC devolvida para ajuste</SelectItem>
                        <SelectItem value="Tramitando para aprovação">Tramitando para aprovação</SelectItem>
                        <SelectItem value="Aprovada">Aprovada</SelectItem>
                        <SelectItem value="Criação de contrato pendente">Criação de contrato pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                        <TableHead className="sticky left-0 z-10 min-w-[140px]">ID Processo</TableHead>
                        <TableHead className="min-w-[160px]">Nº da Requisição</TableHead>
                        <TableHead className="min-w-[200px]">Requisitante</TableHead>
                        <TableHead className="min-w-[300px]">Objeto</TableHead>
                        <TableHead className="min-w-[200px]">Tipo/Modalidade</TableHead>
                        <TableHead className="min-w-[220px]">Status</TableHead>
                        <TableHead className="min-w-[160px]">Responsável</TableHead>
                        <TableHead className="min-w-[140px]">Data Recebimento</TableHead>
                        <TableHead className="min-w-[140px]">Data Finalização</TableHead>
                        <TableHead className="min-w-[200px]">Empresa Vencedora</TableHead>
                        <TableHead className="min-w-[140px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProcessosDiarios.map((processo) => (
                        <TableRow key={processo.id}>
                          <TableCell className="text-black sticky left-0 z-10">{processo.id}</TableCell>
                          <TableCell className="text-gray-600">{processo.numeroRequisicao}</TableCell>
                          <TableCell className="text-gray-600">{processo.requisitante}</TableCell>
                          <TableCell className="text-gray-600">{processo.objeto}</TableCell>
                          <TableCell className="text-gray-600">{processo.tipo}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select 
                                value={processo.status} 
                                onValueChange={(novoStatus) => handleIniciarMudancaStatus(processo, novoStatus)}
                              >
                                <SelectTrigger className="w-[200px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="RC recebida pelo servidor de compras">RC recebida pelo servidor de compras</SelectItem>
                                  <SelectItem value="Análise de RC">Análise de RC</SelectItem>
                                  <SelectItem value="Em cotação">Em cotação</SelectItem>
                                  <SelectItem value="RC devolvida para ajuste">RC devolvida para ajuste</SelectItem>
                                  <SelectItem value="Tramitando para aprovação">Tramitando para aprovação</SelectItem>
                                  <SelectItem value="Aprovada">Aprovada</SelectItem>
                                  <SelectItem value="Criação de contrato pendente">Criação de contrato pendente</SelectItem>
                                </SelectContent>
                              </Select>
                              {processo.status === 'Devolvido ao Administrador' && processo.justificativaDevolucao && (
                                <Info 
                                  size={16} 
                                  className="text-yellow-600 cursor-help" 
                                  title="Processo devolvido pelo comprador. Clique em Ver Detalhes para ler a justificativa."
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">{processo.responsavel}</TableCell>
                          <TableCell className="text-gray-600">{processo.dataRecebimento}</TableCell>
                          <TableCell className="text-gray-600">{processo.dataFinalizacao}</TableCell>
                          <TableCell className="text-gray-600">{processo.empresaVencedora || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setSelectedProcess(processo);
                                  setProcessoTipo('diario');
                                  setIsDetailsModalOpen(true);
                                }}
                              >
                                <Eye size={16} className="text-gray-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setSelectedProcess(processo);
                                  setIsEditProcessModalOpen(true);
                                }}
                              >
                                <Edit size={16} className="text-gray-600" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical size={16} className="text-gray-600" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setProcessoToDelete(processo);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 size={16} className="mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Exibindo {startIndex + 1}–{Math.min(endIndex, totalItems)} de {totalItems} processos
                </p>
                <div className="flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="cursor-pointer"
                        >
                          Anterior
                        </Button>
                      </PaginationItem>
                      
                      {currentPage > 2 && (
                        <>
                          <PaginationItem>
                            <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">
                              1
                            </PaginationLink>
                          </PaginationItem>
                          {currentPage > 3 && <PaginationEllipsis />}
                        </>
                      )}
                      
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationLink onClick={() => setCurrentPage(currentPage - 1)} className="cursor-pointer">
                            {currentPage - 1}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationLink isActive className="cursor-pointer">
                          {currentPage}
                        </PaginationLink>
                      </PaginationItem>
                      
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationLink onClick={() => setCurrentPage(currentPage + 1)} className="cursor-pointer">
                            {currentPage + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {currentPage < totalPages - 1 && (
                        <>
                          {currentPage < totalPages - 2 && <PaginationEllipsis />}
                          <PaginationItem>
                            <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer">
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}
                      
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="cursor-pointer"
                        >
                          Próxima
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </CardContent>
          </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
                {statusKanban.map((status) => {
                  const processosPorStatus = filteredProcessosDiarios.filter(p => p.status === status);
                  const config = kanbanColumnConfig[status];
                  return (
                    <div 
                      key={status} 
                      className="flex-1 min-w-[280px]"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const processoData = e.dataTransfer.getData('processo');
                        if (!processoData) return; // Proteção contra dados vazios
                        
                        try {
                          const draggedProcesso = JSON.parse(processoData);
                          if (draggedProcesso.status !== status) {
                            handleIniciarMudancaStatus(draggedProcesso, status);
                          }
                        } catch (error) {
                          console.error('Erro ao fazer parse do processo:', error);
                        }
                      }}
                    >
                      <Card className={`border-2 ${config.borderColor} h-full ${config.bgColor}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className={`text-base ${config.color}`}>{config.displayName}</CardTitle>
                            <span className={`text-sm ${config.color} bg-white px-2 py-1 rounded border ${config.borderColor}`}>
                              {processosPorStatus.length}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 min-h-[400px] max-h-[calc(100vh-400px)] overflow-y-auto">
                          {processosPorStatus.length === 0 ? (
                            <p className="text-gray-400 text-center text-sm py-8">
                              Nenhum processo neste status
                            </p>
                          ) : (
                            processosPorStatus.map((processo) => (
                              <div
                                key={processo.id}
                                className={currentProfile === 'admin' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
                                onDragStart={(e) => {
                                  if (currentProfile === 'admin') {
                                    e.dataTransfer.setData('processo', JSON.stringify(processo));
                                    e.currentTarget.style.opacity = '0.5';
                                  }
                                }}
                                onDragEnd={(e) => {
                                  e.currentTarget.style.opacity = '1';
                                }}
                                draggable={currentProfile === 'admin'}
                              >
                                <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="space-y-3">
                                      {/* Header com requisitante e ações */}
                                      <div className="flex items-start justify-between gap-2">
                                        <p className="font-medium text-black flex-1">{processo.requisitante}</p>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                              <MoreVertical size={14} className="text-gray-600" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => {
                                              setSelectedProcess(processo);
                                              setProcessoTipo('diario');
                                              setIsDetailsModalOpen(true);
                                            }}>
                                              <Eye size={14} className="mr-2" />
                                              Ver Detalhes
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => {
                                              setSelectedProcess(processo);
                                              setIsEditProcessModalOpen(true);
                                            }}>
                                              Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                              setProcessoToDelete(processo);
                                              setIsDeleteDialogOpen(true);
                                            }} className="text-red-600">
                                              Excluir
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>

                                      {/* Informações do processo */}
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <span className="text-gray-500">ID: </span>
                                          <span className="text-gray-700">{processo.id}</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Requisitante: </span>
                                          <span className="text-gray-700">{processo.requisitante}</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Tipo: </span>
                                          <span className="text-gray-700">{processo.tipo}</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Responsável: </span>
                                          <span className="text-gray-700">{processo.responsavel}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
          )}
        </TabsContent>
        
        {/* Dialog de Edição de Processo Diário - Movido para fora da estrutura da tabela */}
        <Dialog open={isEditProcessModalOpen} onOpenChange={(open) => {
          setIsEditProcessModalOpen(open);
          if (!open) setSelectedProcess(null);
        }}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            {selectedProcess && (
              <>
                {/* Área scrollável */}
                <div className="flex-1 overflow-y-auto px-6">
                  <DialogHeader className="pt-6">
                    <DialogTitle>Editar Processo</DialogTitle>
                    <DialogDescription>
                      Atualize os dados do processo {selectedProcess.id}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 pb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-processo-id">ID do Processo</Label>
                        <Input id="edit-processo-id" defaultValue={selectedProcess.id} disabled />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-processo-tipo">Tipo (Modalidade)</Label>
                        <Select defaultValue={selectedProcess.tipo}>
                          <SelectTrigger id="edit-processo-tipo">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dispensa">Dispensa</SelectItem>
                            <SelectItem value="Inexigibilidade">Inexigibilidade</SelectItem>
                            <SelectItem value="Licitação (Pesquisa de Preço)">Licitação (Pesquisa de Preço)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-processo-empresa">Empresa</Label>
                      <Select defaultValue={selectedProcess.empresa}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {empresasList.map((empresa) => (
                            <SelectItem key={empresa} value={empresa}>
                              {empresa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-processo-status">Status</Label>
                        <Select defaultValue={selectedProcess.status}>
                          <SelectTrigger id="edit-processo-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RC recebida pelo servidor de compras">RC recebida pelo servidor de compras</SelectItem>
                            <SelectItem value="Análise de RC">Análise de RC</SelectItem>
                            <SelectItem value="Em cotação">Em cotação</SelectItem>
                            <SelectItem value="RC devolvida para ajuste">RC devolvida para ajuste</SelectItem>
                            <SelectItem value="Tramitando para aprovação">Tramitando para aprovação</SelectItem>
                            <SelectItem value="Aprovada">Aprovada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-processo-responsavel">Responsável</Label>
                        <Input id="edit-processo-responsavel" defaultValue={selectedProcess.responsavel} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-processo-data-rc">Data Distribuição RC</Label>
                        <Input id="edit-processo-data-rc" type="date" defaultValue="2024-01-10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-processo-data">Data de Início</Label>
                        <Input id="edit-processo-data" type="date" defaultValue="2024-01-15" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-processo-classificacao">Classificação do Pedido</Label>
                      <Select onValueChange={(value) => {
                        setClassificacaoPedido(value);
                        if (value === 'pre-contrato' || value === 'almoxarifado') {
                          setBloquearEnvioAutomatico(true);
                        } else if (value === 'normal') {
                          setBloquearEnvioAutomatico(false);
                        }
                      }}>
                        <SelectTrigger id="edit-processo-classificacao">
                          <SelectValue placeholder="Selecione a classificação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="pre-contrato">Pré-Contrato</SelectItem>
                          <SelectItem value="almoxarifado">Almoxarifado (Fracionado)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3 p-4 border-2 border-dashed border-orange-300 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Ban size={18} className="text-orange-600" />
                            <Label className="text-base text-black">Bloquear Envio Automático</Label>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Impede o envio automático mesmo se aprovado e abaixo do limite (R$ 50.000,00)
                          </p>
                        </div>
                        <Switch 
                          checked={bloquearEnvioAutomatico}
                          onCheckedChange={setBloquearEnvioAutomatico}
                        />
                      </div>
                      
                      {bloquearEnvioAutomatico && (
                        <Alert className="border-orange-200 bg-orange-100">
                          <Info className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-orange-800 text-xs">
                            <strong>Atenção:</strong> Este processo não será enviado automaticamente. Use esta opção para itens de almoxarifado (consumo fracionado) ou pré-contratos que precisam de gestão manual.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-processo-observacoes">Observações</Label>
                      <Textarea id="edit-processo-observacoes" placeholder="Observações adicionais" rows={2} />
                    </div>
                  </div>
                </div>

                {/* Footer fixo */}
                <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setIsEditProcessModalOpen(false);
                    setSelectedProcess(null);
                  }}>
                    Cancelar
                  </Button>
                  <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => {
                    setIsEditProcessModalOpen(false);
                    setSelectedProcess(null);
                  }}>
                    Salvar Alterações
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Dialog de Edição de Processo Consolidado - Movido para fora da estrutura da tabela */}
        <Dialog open={isEditConsolidadoModalOpen} onOpenChange={(open) => {
          setIsEditConsolidadoModalOpen(open);
          if (!open) setSelectedProcess(null);
        }}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            {selectedProcess && (
              <>
                {/* Área scrollável */}
                <div className="flex-1 overflow-y-auto px-6">
                  <DialogHeader className="pt-6">
                    <DialogTitle>Editar Processo Consolidado</DialogTitle>
                    <DialogDescription>
                      Atualize os dados do contrato {selectedProcess.id}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 py-3 pb-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-consolidado-id">ID do Contrato/Processo</Label>
                        <Input id="edit-consolidado-id" defaultValue={selectedProcess.id} disabled />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-consolidado-valor">Valor (R$) *</Label>
                        <Input id="edit-consolidado-valor" defaultValue={selectedProcess.valor} required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-consolidado-empresa">Empresa Vencedora</Label>
                      <Input id="edit-consolidado-empresa" defaultValue={selectedProcess.empresaVencedora} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-consolidado-status">Status do Contrato</Label>
                        <Select defaultValue={selectedProcess.statusContrato}>
                          <SelectTrigger id="edit-consolidado-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ativo">Ativo</SelectItem>
                            <SelectItem value="Próximo ao Vencimento">Próximo ao Vencimento</SelectItem>
                            <SelectItem value="Vencido">Vencido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-consolidado-data">Data Fim da Vigência</Label>
                        <Input id="edit-consolidado-data" type="date" defaultValue="2024-12-15" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-consolidado-objeto">Objeto do Contrato</Label>
                      <Textarea id="edit-consolidado-objeto" placeholder="Descrição do objeto" rows={2} />
                    </div>
                  </div>
                </div>

                {/* Footer fixo */}
                <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setIsEditConsolidadoModalOpen(false);
                    setSelectedProcess(null);
                  }}>
                    Cancelar
                  </Button>
                  <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => {
                    setIsEditConsolidadoModalOpen(false);
                    setSelectedProcess(null);
                  }}>
                    Salvar Alterações
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Aba: Processos Consolidados */}
        <TabsContent value="consolidado" className="space-y-6 mt-6">
          {/* Status Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl text-black">{statusCountsConsolidado.todos}</p>
                  <p className="text-sm text-gray-600">Total de Contratos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl text-green-600">{statusCountsConsolidado.ativo}</p>
                  <p className="text-sm text-gray-600">Ativos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl text-yellow-600">{statusCountsConsolidado.proximoVencimento}</p>
                  <p className="text-sm text-gray-600">Próximo ao Vencimento</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl text-red-600">{statusCountsConsolidado.vencido}</p>
                  <p className="text-sm text-gray-600">Vencidos</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gerenciamento de Contratos com Sub-Tabs */}
          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black px-[0px] py-[8px]">Gerenciamento de Contratos</CardTitle>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
              {/* Sub-tabs para organizar as três tabelas */}
              <Tabs defaultValue="processos" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="processos">
                    Processos Homologados ({filteredProcessosConsolidados.length})
                  </TabsTrigger>
                  <TabsTrigger value="trp">
                    TRP ({filteredTRP.length})
                  </TabsTrigger>
                  <TabsTrigger value="contratos">
                    Contratos ({filteredContratos.length})
                  </TabsTrigger>
                </TabsList>

                {/* Aba: Processos Homologados */}
                <TabsContent value="processos" className="mt-0 space-y-4">
                  {/* Filtros para Processos Homologados */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Buscar por ID, requisitante ou empresa..."
                          value={searchTermConsolidado}
                          onChange={(e) => setSearchTermConsolidado(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-48">
                      <Select value={statusFilterConsolidado} onValueChange={setStatusFilterConsolidado}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status do Contrato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os Status</SelectItem>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Próximo ao Vencimento">Próximo ao Vencimento</SelectItem>
                          <SelectItem value="Vencido">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 z-10 min-w-[140px] bg-white">ID Processo</TableHead>
                          <TableHead className="min-w-[200px]">Requisitante</TableHead>
                          <TableHead className="min-w-[300px]">Objeto</TableHead>
                          <TableHead className="min-w-[200px]">Tipo/Modalidade</TableHead>
                          <TableHead className="min-w-[160px]">Status</TableHead>
                          <TableHead className="min-w-[160px]">Responsável</TableHead>
                          <TableHead className="min-w-[140px]">Data Recebimento</TableHead>
                          <TableHead className="min-w-[140px]">Data Finalização</TableHead>
                          <TableHead className="min-w-[220px]">Empresa Vencedora</TableHead>
                          <TableHead className="min-w-[140px]">Data da Entrega</TableHead>
                          <TableHead className="min-w-[140px]">Valor</TableHead>
                          <TableHead className="min-w-[140px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProcessosConsolidados.map((processo) => (
                          <TableRow key={processo.id}>
                            <TableCell className="text-black sticky left-0 z-10 bg-white">{processo.id}</TableCell>
                            <TableCell className="text-gray-600">{processo.requisitante}</TableCell>
                            <TableCell className="text-gray-600">{processo.objeto}</TableCell>
                            <TableCell className="text-gray-600">{processo.tipo}</TableCell>
                            <TableCell>
                              <BadgeNew {...getBadgeMappingForStatus(processo.status)}>
                                {processo.status}
                              </BadgeNew>
                            </TableCell>
                            <TableCell className="text-gray-600">{processo.responsavel}</TableCell>
                            <TableCell className="text-gray-600">{processo.dataRecebimento}</TableCell>
                            <TableCell className="text-gray-600">{processo.dataFinalizacao}</TableCell>
                            <TableCell className="text-black">{processo.empresaVencedora}</TableCell>
                            <TableCell className="text-gray-600">{processo.dataEntrega}</TableCell>
                            <TableCell className="text-black">{processo.valor}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedProcess(processo);
                                    setProcessoTipo('consolidado');
                                    setIsDetailsModalOpen(true);
                                  }}
                                >
                                  <Eye size={16} className="text-gray-600" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedProcess(processo);
                                    setIsEditConsolidadoModalOpen(true);
                                  }}
                                >
                                  <Edit size={16} className="text-gray-600" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical size={16} className="text-gray-600" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedProcess(processo);
                                      setIsAditivoModalOpen(true);
                                    }}>
                                      <FileText size={16} className="mr-2" />
                                      Registrar Aditivo
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedProcess(processo);
                                      setIsProrrogacaoModalOpen(true);
                                    }}>
                                      <Calendar size={16} className="mr-2" />
                                      Prorrogar Contrato
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Aba: TRP */}
                <TabsContent value="trp" className="mt-0 space-y-4">
                  {/* Filtros para TRP */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Buscar por empresa, CNPJ ou número..."
                          value={searchTermTRP}
                          onChange={(e) => setSearchTermTRP(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-48">
                      <Select value={filterTRP} onValueChange={setFilterTRP}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar Aditivos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="com-aditivos">Com Aditivos</SelectItem>
                          <SelectItem value="sem-aditivos">Sem Aditivos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[220px]">Empresa Vencedora</TableHead>
                          <TableHead className="min-w-[180px]">CNPJ</TableHead>
                          <TableHead className="min-w-[160px]">Número do Processo</TableHead>
                          <TableHead className="min-w-[140px]">Valor Contratado</TableHead>
                          <TableHead className="min-w-[120px]">Vigência</TableHead>
                          <TableHead className="min-w-[100px]">Aditivos</TableHead>
                          <TableHead className="min-w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTRP.map((trp) => (
                          <TableRow key={trp.numeroProcesso}>
                            <TableCell className="text-black">{trp.empresaVencedora}</TableCell>
                            <TableCell className="text-gray-600">{trp.cnpj}</TableCell>
                            <TableCell className="text-black">{trp.numeroProcesso}</TableCell>
                            <TableCell className="text-black">{trp.valorContratado}</TableCell>
                            <TableCell className="text-gray-600">{trp.vigencia}</TableCell>
                            <TableCell className="text-gray-600">{trp.aditivos}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedTRP(trp);
                                    setIsDetailsTRPModalOpen(true);
                                  }}
                                >
                                  <Eye size={16} className="text-gray-600" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedTRP(trp);
                                    setIsEditTRPModalOpen(true);
                                  }}
                                >
                                  <Edit size={16} className="text-gray-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Aba: Contratos */}
                <TabsContent value="contratos" className="mt-0 space-y-4">
                  {/* Filtros para Contratos */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Buscar por empresa, CNPJ ou número..."
                          value={searchTermContratos}
                          onChange={(e) => setSearchTermContratos(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-48">
                      <Select value={filterContratos} onValueChange={setFilterContratos}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar Aditivos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="com-aditivos">Com Aditivos</SelectItem>
                          <SelectItem value="sem-aditivos">Sem Aditivos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[220px]">Empresa Vencedora</TableHead>
                          <TableHead className="min-w-[180px]">CNPJ</TableHead>
                          <TableHead className="min-w-[160px]">Número do Processo</TableHead>
                          <TableHead className="min-w-[140px]">Valor Contratado</TableHead>
                          <TableHead className="min-w-[120px]">Vigência</TableHead>
                          <TableHead className="min-w-[100px]">Aditivos</TableHead>
                          <TableHead className="min-w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredContratos.map((contrato) => (
                          <TableRow key={contrato.numeroProcesso}>
                            <TableCell className="text-black">{contrato.empresaVencedora}</TableCell>
                            <TableCell className="text-gray-600">{contrato.cnpj}</TableCell>
                            <TableCell className="text-black">{contrato.numeroProcesso}</TableCell>
                            <TableCell className="text-black">{contrato.valorContratado}</TableCell>
                            <TableCell className="text-gray-600">{contrato.vigencia}</TableCell>
                            <TableCell className="text-gray-600">{contrato.aditivos}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedContrato(contrato);
                                    setIsDetailsContratoModalOpen(true);
                                  }}
                                >
                                  <Eye size={16} className="text-gray-600" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedContrato(contrato);
                                    setIsEditContratoModalOpen(true);
                                  }}
                                >
                                  <Edit size={16} className="text-gray-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes do Processo */}
      <DetalhesProcessoModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedProcess(null);
        }}
        processo={selectedProcess}
        tipo={processoTipo}
      />

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o processo <strong>{processoToDelete?.id}</strong> do requisitante <strong>{processoToDelete?.requisitante}</strong>?
              <br /><br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProcessoToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                // Aqui seria implementada a lógica de exclusão
                console.log('Excluindo processo:', processoToDelete);
                
                // Mostrar toast de sucesso
                toast.success(`Processo ${processoToDelete?.id} excluído com sucesso!`);
                
                setIsDeleteDialogOpen(false);
                setProcessoToDelete(null);
              }}
            >
              Excluir Processo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Mudança de Status com Justificativa */}
      <Dialog open={isStatusChangeModalOpen} onOpenChange={setIsStatusChangeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Status do Processo</DialogTitle>
            <DialogDescription>
              Você está alterando o status de <strong>{processoParaMudarStatus?.empresa}</strong> para <strong>{novoStatus}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="justificativa-status">Justificativa / Observação (opcional)</Label>
              <Textarea
                id="justificativa-status"
                placeholder="Digite uma justificativa ou observação sobre esta mudança de status..."
                value={justificativaStatus}
                onChange={(e) => setJustificativaStatus(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Esta informação será registrada na linha do tempo e ficará visível para o requisitante.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsStatusChangeModalOpen(false);
                setProcessoParaMudarStatus(null);
                setNovoStatus('');
                setJustificativaStatus('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#003366] hover:bg-[#002244] text-white"
              onClick={handleConfirmarMudancaStatus}
            >
              Confirmar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Registro de Aditivo */}
      <Dialog open={isAditivoModalOpen} onOpenChange={(open) => {
        setIsAditivoModalOpen(open);
        if (!open) setSelectedProcess(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
          {/* Área scrollável */}
          <div className="flex-1 overflow-y-auto px-6">
            <DialogHeader className="pt-6">
              <DialogTitle>Registrar Aditivo</DialogTitle>
              <DialogDescription>
                Registre um aditivo para o contrato {selectedProcess?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 pb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="aditivo-numero">Número do Aditivo</Label>
                  <Input id="aditivo-numero" placeholder="001/2024" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="aditivo-data">Data do Aditivo</Label>
                  <Input id="aditivo-data" type="date" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="aditivo-tipo">Tipo de Aditivo</Label>
                <Select>
                  <SelectTrigger id="aditivo-tipo">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="valor">Aditivo de Valor</SelectItem>
                    <SelectItem value="prazo">Aditivo de Prazo</SelectItem>
                    <SelectItem value="escopo">Aditivo de Escopo</SelectItem>
                    <SelectItem value="misto">Aditivo Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="aditivo-valor">Valor do Aditivo (R$)</Label>
                <Input id="aditivo-valor" placeholder="R$ 0,00" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="aditivo-justificativa">Justificativa</Label>
                <Textarea id="aditivo-justificativa" placeholder="Descrição da justificativa" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="aditivo-arquivo">Anexar Documento</Label>
                <FileInput id="aditivo-arquivo" accept=".pdf,.doc,.docx" />
              </div>
            </div>
          </div>

          {/* Footer fixo */}
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
            <Button variant="outline" className="flex-1" onClick={() => {
              setIsAditivoModalOpen(false);
              setSelectedProcess(null);
            }}>
              Cancelar
            </Button>
            <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => {
              setIsAditivoModalOpen(false);
              setSelectedProcess(null);
            }}>
              Registrar Aditivo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Registro de Prorrogação */}
      <Dialog open={isProrrogacaoModalOpen} onOpenChange={(open) => {
        setIsProrrogacaoModalOpen(open);
        if (!open) setSelectedProcess(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
          {/* Área scrollável */}
          <div className="flex-1 overflow-y-auto px-6">
            <DialogHeader className="pt-6">
              <DialogTitle>Registrar Prorrogação</DialogTitle>
              <DialogDescription>
                Registre uma prorrogação para o contrato {selectedProcess?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 pb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prorrogacao-numero">Número da Prorrogação</Label>
                  <Input id="prorrogacao-numero" placeholder="001/2024" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prorrogacao-data">Data da Prorrogação</Label>
                  <Input id="prorrogacao-data" type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prorrogacao-vigencia-atual">Vigência Atual</Label>
                  <Input id="prorrogacao-vigencia-atual" type="date" defaultValue={selectedProcess?.dataFimVigencia} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prorrogacao-nova-vigencia">Nova Vigência</Label>
                  <Input id="prorrogacao-nova-vigencia" type="date" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prorrogacao-prazo">Prazo da Prorrogação</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input id="prorrogacao-prazo" placeholder="12" type="number" />
                  <Select defaultValue="meses">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dias">Dias</SelectItem>
                      <SelectItem value="meses">Meses</SelectItem>
                      <SelectItem value="anos">Anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prorrogacao-justificativa">Justificativa</Label>
                <Textarea id="prorrogacao-justificativa" placeholder="Descrição da justificativa para prorrogação" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prorrogacao-arquivo">Anexar Documento</Label>
                <FileInput id="prorrogacao-arquivo" accept=".pdf,.doc,.docx" />
              </div>
            </div>
          </div>

          {/* Footer fixo */}
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
            <Button variant="outline" className="flex-1" onClick={() => {
              setIsProrrogacaoModalOpen(false);
              setSelectedProcess(null);
            }}>
              Cancelar
            </Button>
            <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => {
              setIsProrrogacaoModalOpen(false);
              setSelectedProcess(null);
            }}>
              Registrar Prorrogação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Distribuir Requisição (Atribuir Comprador + Data de Início) */}
      <Dialog open={isAtribuirModalOpen} onOpenChange={setIsAtribuirModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Distribuir Requisição</DialogTitle>
            <DialogDescription>
              Atribua um comprador e defina a data de início para cálculo de Lead Time
            </DialogDescription>
          </DialogHeader>
          {selectedRequisicao && (
            <div className="space-y-4 py-4">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  A "Data de Início" será usada para calcular o Lead Time no relatório de tempos.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm"><span className="text-black">ID:</span> <span className="text-gray-600">{selectedRequisicao.id}</span></p>
                <p className="text-sm"><span className="text-black">Requisitante:</span> <span className="text-gray-600">{selectedRequisicao.requisitante}</span></p>
                <p className="text-sm"><span className="text-black">Objeto:</span> <span className="text-gray-600">{selectedRequisicao.objeto}</span></p>
                <p className="text-sm">
                  <span className="text-black">Prioridade:</span>{' '}
                  <BadgeNew {...getBadgeMappingForPrioridade(selectedRequisicao.prioridade)}>
                    {selectedRequisicao.prioridade}
                  </BadgeNew>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="comprador">Comprador Responsável *</Label>
                <Select value={compradorSelecionado} onValueChange={setCompradorSelecionado}>
                  <SelectTrigger id="comprador">
                    <SelectValue placeholder="Selecione o comprador" />
                  </SelectTrigger>
                  <SelectContent>
                    {compradores.map((comprador) => (
                      <SelectItem key={comprador} value={comprador}>
                        {comprador}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="data-inicio">Data de Início (para Lead Time) *</Label>
                <Input 
                  id="data-inicio" 
                  type="date"
                  value={dataInicioDistribuicao}
                  onChange={(e) => setDataInicioDistribuicao(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Esta data marca o início do processo e será usada para calcular o tempo até aprovação.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAtribuirModalOpen(false);
                setSelectedRequisicao(null);
                setCompradorSelecionado('');
                setDataInicioDistribuicao('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#003366] hover:bg-[#002244] text-white"
              onClick={handleAtribuirComprador}
              disabled={!compradorSelecionado || !dataInicioDistribuicao}
            >
              Distribuir Requisição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Configurar Requisição (Comprador) */}
      <Dialog open={isConfigurarModalOpen} onOpenChange={setIsConfigurarModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
          {/* Área scrollável */}
          <div className="flex-1 overflow-y-auto px-6">
            <DialogHeader className="pt-6">
              <DialogTitle>Iniciar Processo - Configuração de Governança</DialogTitle>
              <DialogDescription>
                Transforme esta requisição em um processo ativo preenchendo os dados necessários de tipo, classificação e controles de risco
              </DialogDescription>
            </DialogHeader>
            {requisicaoParaConfigurar && (
              <div className="grid gap-4 py-4 pb-6">
                {/* Dados da Requisição - Read Only */}
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={18} className="text-blue-600" />
                    <Label className="text-base text-black">Dados da Requisição</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">ID Requisição</Label>
                      <p className="text-black">{requisicaoParaConfigurar.id}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Valor Estimado</Label>
                      <p className="text-black">{requisicaoParaConfigurar.valorEstimado}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs text-gray-500">Requisitante</Label>
                      <p className="text-black">{requisicaoParaConfigurar.requisitante}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs text-gray-500">Objeto</Label>
                      <p className="text-gray-600">{requisicaoParaConfigurar.objeto}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Regional</Label>
                      <p className="text-gray-600">{requisicaoParaConfigurar.regional}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Categoria</Label>
                      <p className="text-gray-600">{requisicaoParaConfigurar.categoria}</p>
                    </div>
                  </div>
                </div>

                {/* Campos para Configurar - Editáveis */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={18} className="text-gray-600" />
                    <Label className="text-base text-black">Dados de Governança e Risco</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="config-tipo">Tipo (Modalidade) *</Label>
                      <Select>
                        <SelectTrigger id="config-tipo">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dispensa">Dispensa</SelectItem>
                          <SelectItem value="inexigibilidade">Inexigibilidade</SelectItem>
                          <SelectItem value="licitacao">Licitação (Pesquisa de Preço)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="config-status">Status Inicial *</Label>
                      <Select defaultValue="analise">
                        <SelectTrigger id="config-status">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="analise">Em Análise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="config-data-rc">Data Distribuição RC *</Label>
                      <Input id="config-data-rc" type="date" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="config-data-inicio">Data de Início *</Label>
                      <Input id="config-data-inicio" type="date" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="config-classificacao">Classificação do Pedido *</Label>
                    <Select onValueChange={(value) => {
                      setClassificacaoPedido(value);
                      // Bloqueia automaticamente se for pré-contrato
                      if (value === 'pre-contrato') {
                        setBloquearEnvioAutomatico(true);
                      } else if (value === 'normal') {
                        setBloquearEnvioAutomatico(false);
                      }
                    }}>
                      <SelectTrigger id="config-classificacao">
                        <SelectValue placeholder="Selecione a classificação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="pre-contrato">Pré-Contrato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 p-4 border-2 border-dashed border-orange-300 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Ban size={18} className="text-orange-600" />
                          <Label className="text-base text-black">Bloquear Envio Automático</Label>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Impede o envio automático mesmo se aprovado e abaixo do limite (R$ 50.000,00)
                        </p>
                      </div>
                      <Switch 
                        checked={bloquearEnvioAutomatico}
                        onCheckedChange={setBloquearEnvioAutomatico}
                      />
                    </div>
                    
                    {bloquearEnvioAutomatico && (
                      <Alert className="border-orange-200 bg-orange-100">
                        <Info className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800 text-xs">
                          <strong>Atenção:</strong> Este processo não será enviado automaticamente. Use esta opção para pré-contratos que precisam de gestão manual.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="config-observacoes">Observações</Label>
                    <Textarea id="config-observacoes" placeholder="Observações adicionais sobre a configuração" rows={2} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer fixo */}
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => {
                setIsConfigurarModalOpen(false);
                setRequisicaoParaConfigurar(null);
                setBloquearEnvioAutomatico(false);
                setClassificacaoPedido('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" 
              onClick={() => {
                toast.success(`✓ Processo ${requisicaoParaConfigurar?.id} iniciado com sucesso! Agora você pode gerenciá-lo em "Processos em Andamento".`);
                setIsConfigurarModalOpen(false);
                setRequisicaoParaConfigurar(null);
                setBloquearEnvioAutomatico(false);
                setClassificacaoPedido('');
                // Redirecionar para aba de processos em andamento
                setActiveTab('diario');
              }}
            >
              <FileText size={16} className="mr-2" />
              Confirmar e Iniciar Processo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes da Requisição */}
      {requisicaoParaDetalhes && (
        <Dialog open={!!requisicaoParaDetalhes} onOpenChange={(open) => !open && setRequisicaoParaDetalhes(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Requisição</DialogTitle>
              <DialogDescription>
                Informações completas da requisição {requisicaoParaDetalhes.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">ID da Requisição</Label>
                  <p className="text-black">{requisicaoParaDetalhes.id}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Data de Recebimento</Label>
                  <p className="text-black">{requisicaoParaDetalhes.dataRecebimento}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Requisitante</Label>
                  <p className="text-black">{requisicaoParaDetalhes.requisitante}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Regional</Label>
                  <p className="text-black">{requisicaoParaDetalhes.regional}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Categoria</Label>
                  <p className="text-black">{requisicaoParaDetalhes.categoria}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Valor Estimado</Label>
                  <p className="text-black">{requisicaoParaDetalhes.valorEstimado}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs text-gray-500">Prioridade</Label>
                  <div>
                    <BadgeNew {...getBadgeMappingForPrioridade(requisicaoParaDetalhes.prioridade)}>
                      {requisicaoParaDetalhes.prioridade}
                    </BadgeNew>
                  </div>
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs text-gray-500">Objeto</Label>
                  <p className="text-black">{requisicaoParaDetalhes.objeto}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setRequisicaoParaDetalhes(null)}
              >
                Fechar
              </Button>
              <Button 
                className="bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => {
                  setSelectedRequisicao(requisicaoParaDetalhes);
                  setRequisicaoParaDetalhes(null);
                  setIsAtribuirModalOpen(true);
                }}
              >
                Atribuir Comprador
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Edição de TRP */}
      <Dialog open={isEditTRPModalOpen} onOpenChange={(open) => {
        setIsEditTRPModalOpen(open);
        if (!open) setSelectedTRP(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
          <div className="flex-1 overflow-y-auto px-6">
            <DialogHeader className="pt-6">
              <DialogTitle>Editar TRP</DialogTitle>
              <DialogDescription>
                Atualize os dados do Termo de Referência de Preço {selectedTRP?.numeroProcesso}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 pb-6">
              <div className="space-y-1.5">
                <Label htmlFor="edit-trp-empresa">Empresa Vencedora</Label>
                <Input id="edit-trp-empresa" defaultValue={selectedTRP?.empresaVencedora} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-trp-cnpj">CNPJ</Label>
                  <Input id="edit-trp-cnpj" defaultValue={selectedTRP?.cnpj} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-trp-numero">Número do Processo</Label>
                  <Input id="edit-trp-numero" defaultValue={selectedTRP?.numeroProcesso} disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-trp-valor">Valor Contratado</Label>
                  <Input id="edit-trp-valor" defaultValue={selectedTRP?.valorContratado} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-trp-vigencia">Vigência</Label>
                  <Input id="edit-trp-vigencia" defaultValue={selectedTRP?.vigencia} placeholder="Ex: 12 meses" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-trp-aditivos">Número de Aditivos</Label>
                <Input id="edit-trp-aditivos" type="number" defaultValue={selectedTRP?.aditivos} min="0" />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
            <Button variant="outline" className="flex-1" onClick={() => {
              setIsEditTRPModalOpen(false);
              setSelectedTRP(null);
            }}>
              Cancelar
            </Button>
            <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => {
              toast.success(`TRP ${selectedTRP?.numeroProcesso} atualizado com sucesso!`);
              setIsEditTRPModalOpen(false);
              setSelectedTRP(null);
            }}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Contrato */}
      <Dialog open={isEditContratoModalOpen} onOpenChange={(open) => {
        setIsEditContratoModalOpen(open);
        if (!open) setSelectedContrato(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
          <div className="flex-1 overflow-y-auto px-6">
            <DialogHeader className="pt-6">
              <DialogTitle>Editar Contrato</DialogTitle>
              <DialogDescription>
                Atualize os dados do Contrato {selectedContrato?.numeroProcesso}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 pb-6">
              <div className="space-y-1.5">
                <Label htmlFor="edit-contrato-empresa">Empresa Vencedora</Label>
                <Input id="edit-contrato-empresa" defaultValue={selectedContrato?.empresaVencedora} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-contrato-cnpj">CNPJ</Label>
                  <Input id="edit-contrato-cnpj" defaultValue={selectedContrato?.cnpj} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-contrato-numero">Número do Processo</Label>
                  <Input id="edit-contrato-numero" defaultValue={selectedContrato?.numeroProcesso} disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-contrato-valor">Valor Contratado</Label>
                  <Input id="edit-contrato-valor" defaultValue={selectedContrato?.valorContratado} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-contrato-vigencia">Vigência</Label>
                  <Input id="edit-contrato-vigencia" defaultValue={selectedContrato?.vigencia} placeholder="Ex: 12 meses" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-contrato-aditivos">Número de Aditivos</Label>
                <Input id="edit-contrato-aditivos" type="number" defaultValue={selectedContrato?.aditivos} min="0" />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
            <Button variant="outline" className="flex-1" onClick={() => {
              setIsEditContratoModalOpen(false);
              setSelectedContrato(null);
            }}>
              Cancelar
            </Button>
            <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => {
              toast.success(`Contrato ${selectedContrato?.numeroProcesso} atualizado com sucesso!`);
              setIsEditContratoModalOpen(false);
              setSelectedContrato(null);
            }}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização de TRP */}
      <Dialog open={isDetailsTRPModalOpen} onOpenChange={(open) => {
        setIsDetailsTRPModalOpen(open);
        if (!open) setSelectedTRP(null);
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
          <div className="flex-1 overflow-y-auto px-6">
            <DialogHeader className="pt-6">
              <DialogTitle>Detalhes do TRP</DialogTitle>
              <DialogDescription>
                Informações completas do Termo de Referência de Preço
              </DialogDescription>
            </DialogHeader>
            {selectedTRP && (
              <div className="space-y-6 py-4 pb-6">
                {/* Informações da Empresa */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Informações da Empresa</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Empresa Vencedora</Label>
                      <p className="text-black">{selectedTRP.empresaVencedora}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">CNPJ</Label>
                      <p className="text-gray-600">{selectedTRP.cnpj}</p>
                    </div>
                  </div>
                </div>

                {/* Informações do Processo */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Informações do Processo</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Número do Processo</Label>
                      <p className="text-black">{selectedTRP.numeroProcesso}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Valor Contratado</Label>
                      <p className="text-black text-lg">{selectedTRP.valorContratado}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Vigência</Label>
                      <p className="text-gray-600">{selectedTRP.vigencia}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Número de Aditivos</Label>
                      <div className="flex items-center gap-2">
                        <p className="text-black">{selectedTRP.aditivos}</p>
                        {selectedTRP.aditivos > 0 && (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            Com aditivos
                          </span>
                        )}
                        {selectedTRP.aditivos === 0 && (
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            Sem aditivos
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Informações Adicionais</h3>
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Termo de Referência de Preço (TRP):</strong> Documento que estabelece os preços de referência para futuras contratações, 
                      servindo como base para processos de compras similares.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 rounded-t-[0px] rounded-b-[8px]">
            <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => {
              setIsDetailsTRPModalOpen(false);
              setSelectedTRP(null);
            }}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização de Contrato */}
      <Dialog open={isDetailsContratoModalOpen} onOpenChange={(open) => {
        setIsDetailsContratoModalOpen(open);
        if (!open) setSelectedContrato(null);
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
          <div className="flex-1 overflow-y-auto px-6">
            <DialogHeader className="pt-6">
              <DialogTitle>Detalhes do Contrato</DialogTitle>
              <DialogDescription>
                Informações completas do Contrato
              </DialogDescription>
            </DialogHeader>
            {selectedContrato && (
              <div className="space-y-6 py-4 pb-6">
                {/* Informações da Empresa */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Informações da Empresa</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Empresa Contratada</Label>
                      <p className="text-black">{selectedContrato.empresaVencedora}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">CNPJ</Label>
                      <p className="text-gray-600">{selectedContrato.cnpj}</p>
                    </div>
                  </div>
                </div>

                {/* Informações do Contrato */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Informações do Contrato</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Número do Processo</Label>
                      <p className="text-black">{selectedContrato.numeroProcesso}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Valor Contratado</Label>
                      <p className="text-black text-lg">{selectedContrato.valorContratado}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Vigência</Label>
                      <p className="text-gray-600">{selectedContrato.vigencia}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Número de Aditivos</Label>
                      <div className="flex items-center gap-2">
                        <p className="text-black">{selectedContrato.aditivos}</p>
                        {selectedContrato.aditivos > 0 && (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            Com aditivos
                          </span>
                        )}
                        {selectedContrato.aditivos === 0 && (
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            Sem aditivos
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gestão do Contrato */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Gestão do Contrato</h3>
                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="text-sm text-green-800">
                      <strong>Status:</strong> Contrato ativo e em vigência. Utilize os botões de ação para registrar aditivos, 
                      prorrogações ou outras modificações contratuais conforme necessário.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setIsDetailsContratoModalOpen(false);
                        setSelectedProcess(selectedContrato);
                        setIsAditivoModalOpen(true);
                      }}
                    >
                      <FileText size={16} className="mr-2" />
                      Registrar Aditivo
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setIsDetailsContratoModalOpen(false);
                        setSelectedProcess(selectedContrato);
                        setIsProrrogacaoModalOpen(true);
                      }}
                    >
                      <Calendar size={16} className="mr-2" />
                      Registrar Prorrogação
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 rounded-t-[0px] rounded-b-[8px]">
            <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => {
              setIsDetailsContratoModalOpen(false);
              setSelectedContrato(null);
            }}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
