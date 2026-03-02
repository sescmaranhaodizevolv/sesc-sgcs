import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { BadgeNew } from '../ui/badge-new';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { CheckCircle, Clock, Ban, Send, Eye, FileText, Settings, Search, Info, AlertCircle, DollarSign, Edit } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getBadgeMappingForStatus } from '../../lib/badge-mappings';

export function EnvioAutomatico() {
  const [activeTab, setActiveTab] = useState('monitoramento');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusEnvioFilter, setStatusEnvioFilter] = useState('todos');
  const [processoSelecionado, setProcessoSelecionado] = useState<typeof todosProcessos[0] | null>(null);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [isConfirmacaoEnvioOpen, setIsConfirmacaoEnvioOpen] = useState(false);
  const [processoParaEnviar, setProcessoParaEnviar] = useState<typeof todosProcessos[0] | null>(null);
  const [tipoEnvio, setTipoEnvio] = useState<'manual' | 'liberar'>('manual');

  // Todos os processos que se enquadram na regra de envio automático
  const todosProcessos = [
    // Processos enviados automaticamente
    {
      id: 1,
      idProcesso: 'PROC-2024-005',
      empresa: 'Empresa ABC Ltda',
      valorTotal: 'R$ 28.500,00',
      statusAprovacao: 'Aprovada',
      statusEnvio: 'Enviado Automaticamente',
      dataEnvio: '25/01/2024 08:00',
      responsavel: 'Sistema Automático',
      observacoes: 'Processo enviado automaticamente ao fornecedor conforme configuração.',
      tipo: 'Dispensa',
      classificacao: 'normal'
    },
    {
      id: 2,
      idProcesso: 'PROC-2024-008',
      empresa: 'Tecnologia GHI Ltda',
      valorTotal: 'R$ 35.200,00',
      statusAprovacao: 'Aprovada',
      statusEnvio: 'Enviado Automaticamente',
      dataEnvio: '25/01/2024 08:00',
      responsavel: 'Sistema Automático',
      observacoes: 'Envio automático executado com sucesso.',
      tipo: 'Inexigibilidade',
      classificacao: 'normal'
    },
    {
      id: 3,
      idProcesso: 'PROC-2024-010',
      empresa: 'Soluções JKL Corp',
      valorTotal: 'R$ 42.800,00',
      statusAprovacao: 'Aprovada',
      statusEnvio: 'Enviado Automaticamente',
      dataEnvio: '24/01/2024 08:00',
      responsavel: 'Sistema Automático',
      observacoes: 'Processo enviado automaticamente.',
      tipo: 'Licitação (Pesquisa de Preço)',
      classificacao: 'normal'
    },
    // Processos aguardando próxima execução
    {
      id: 4,
      idProcesso: 'PROC-2024-032',
      empresa: 'Fornecedor XYZ S.A',
      valorTotal: 'R$ 31.400,00',
      statusAprovacao: 'Aprovada',
      statusEnvio: 'Aguardando Próxima Execução',
      dataEnvio: '26/01/2024 08:00',
      responsavel: 'João Santos',
      observacoes: 'Processo aprovado hoje. Será enviado na próxima execução automática às 08:00.',
      tipo: 'Dispensa',
      classificacao: 'normal'
    },
    {
      id: 5,
      idProcesso: 'PROC-2024-033',
      empresa: 'Comércio MNO Ltda',
      valorTotal: 'R$ 27.900,00',
      statusAprovacao: 'Aprovada',
      statusEnvio: 'Aguardando Próxima Execução',
      dataEnvio: '26/01/2024 08:00',
      responsavel: 'Maria Silva',
      observacoes: 'Aguardando próxima execução automática.',
      tipo: 'Dispensa',
      classificacao: 'normal'
    },
    // Processos bloqueados por exceção - APENAS PRÉ-CONTRATO
    {
      id: 6,
      idProcesso: 'PROC-2024-018',
      empresa: 'Construção JKL Ltda',
      valorTotal: 'R$ 38.500,00',
      statusAprovacao: 'Aprovada',
      statusEnvio: 'Bloqueado por Exceção',
      motivoBloqueio: 'Pré-Contrato',
      dataBloqueio: '18/01/2024',
      dataAprovacao: '12/01/2024',
      responsavel: 'João Santos',
      observacoes: 'Criação de contrato pendente. Aguardando definição de cláusulas específicas antes do envio ao fornecedor.',
      tipo: 'Inexigibilidade',
      classificacao: 'pre-contrato'
    },
    {
      id: 7,
      idProcesso: 'PROC-2024-027',
      empresa: 'Serviços ABC Ltda',
      valorTotal: 'R$ 42.300,00',
      statusAprovacao: 'Aprovada',
      statusEnvio: 'Bloqueado por Exceção',
      motivoBloqueio: 'Pré-Contrato',
      dataBloqueio: '22/01/2024',
      dataAprovacao: '16/01/2024',
      responsavel: 'Carlos Oliveira',
      observacoes: 'Processo aguardando assinatura de contrato formal antes do envio automático.',
      tipo: 'Licitação (Pesquisa de Preço)',
      classificacao: 'pre-contrato'
    },
    {
      id: 8,
      idProcesso: 'PROC-2024-031',
      empresa: 'Limpeza XYZ Eireli',
      valorTotal: 'R$ 35.600,00',
      statusAprovacao: 'Aprovada',
      statusEnvio: 'Bloqueado por Exceção',
      motivoBloqueio: 'Pré-Contrato',
      dataBloqueio: '24/01/2024',
      dataAprovacao: '20/01/2024',
      responsavel: 'Paula Mendes',
      observacoes: 'Processo aguardando formalização de contrato antes do envio.',
      tipo: 'Dispensa',
      classificacao: 'pre-contrato'
    },
    {
      id: 9,
      idProcesso: 'PROC-2024-035',
      empresa: 'Consultoria MNO Ltda',
      valorTotal: 'R$ 48.200,00',
      statusAprovacao: 'Aprovada',
      statusEnvio: 'Bloqueado por Exceção',
      motivoBloqueio: 'Pré-Contrato',
      dataBloqueio: '23/01/2024',
      dataAprovacao: '18/01/2024',
      responsavel: 'Ricardo Costa',
      observacoes: 'Aguardando assinatura do contrato de prestação de serviços.',
      tipo: 'Inexigibilidade',
      classificacao: 'pre-contrato'
    },
    {
      id: 10,
      idProcesso: 'PROC-2024-038',
      empresa: 'Tecnologia RST S.A',
      valorTotal: 'R$ 41.900,00',
      statusAprovacao: 'Em Análise',
      statusEnvio: 'Bloqueado por Exceção',
      motivoBloqueio: 'Pré-Contrato',
      dataBloqueio: '25/01/2024',
      dataAprovacao: '-',
      responsavel: 'Fernanda Lima',
      observacoes: 'Processo em análise jurídica. Contrato em elaboração.',
      tipo: 'Dispensa',
      classificacao: 'pre-contrato'
    }
  ];

  const configuracoes = {
    envioAutomaticoHabilitado: true,
    valorPadrao: 'R$ 50.000,00',
    horarioEnvio: '08:00',
    frequenciaEnvio: 'Diário',
    ultimaExecucao: '25/01/2024 08:00',
    proximaExecucao: '26/01/2024 08:00'
  };

  // Processos apenas bloqueados
  const processosBloqueados = todosProcessos.filter(p => p.statusEnvio === 'Bloqueado por Exceção');
  
  // Processos para a aba de monitoramento (todos os processos)
  const processosMonitoramento = todosProcessos;

  const estatisticas = {
    totalProcessos: processosMonitoramento.length,
    enviadosAutomaticamente: processosMonitoramento.filter(p => p.statusEnvio === 'Enviado Automaticamente').length,
    aguardandoExecucao: processosMonitoramento.filter(p => p.statusEnvio === 'Aguardando Próxima Execução').length,
    bloqueados: processosBloqueados.length,
    preContratos: processosBloqueados.filter(p => p.classificacao === 'pre-contrato').length,
    valorTotalBloqueado: 'R$ 206.500,00'
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'Aprovado': 'bg-emerald-600 text-white',
      'Em Análise': 'bg-amber-500 text-white',
      'Rejeitado': 'bg-red-600 text-white'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-600 text-white';
  };

  const getStatusEnvioBadge = (status: string) => {
    const styles = {
      'Enviado Automaticamente': 'bg-emerald-600 text-white',
      'Aguardando Próxima Execução': 'bg-blue-600 text-white',
      'Bloqueado por Exceção': 'bg-red-600 text-white'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-600 text-white';
  };

  const getMotivoBadge = (motivo: string) => {
    if (motivo?.includes('Almoxarifado')) {
      return 'bg-orange-100 text-orange-800';
    } else if (motivo?.includes('Pré-Contrato')) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getIconForStatusEnvio = (status: string) => {
    switch(status) {
      case 'Enviado Automaticamente':
        return <CheckCircle size={12} className="mr-1" />;
      case 'Aguardando Próxima Execução':
        return <Clock size={12} className="mr-1" />;
      case 'Bloqueado por Exceção':
        return <Ban size={12} className="mr-1" />;
      default:
        return null;
    }
  };

  // Determinar qual lista usar baseado na aba ativa
  // Na aba de monitoramento, excluímos os processos bloqueados por exceção
  const processosMonitoramentoFiltrados = processosMonitoramento.filter(
    processo => processo.statusEnvio !== 'Bloqueado por Exceção'
  );
  
  const currentProcessos = activeTab === 'monitoramento' ? processosMonitoramentoFiltrados : processosBloqueados;

  const filteredProcessos = currentProcessos.filter(processo => {
    const matchesSearch = processo.idProcesso.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         processo.empresa.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtros específicos para a aba de monitoramento
    if (activeTab === 'monitoramento') {
      const matchesStatus = statusEnvioFilter === 'todos' || processo.statusEnvio === statusEnvioFilter;
      return matchesSearch && matchesStatus;
    }
    
    // Filtros específicos para a aba de bloqueados
    if (activeTab === 'bloqueados') {
      const matchesMotivo = statusEnvioFilter === 'todos' || 
                            (statusEnvioFilter === 'pre-contrato' && processo.classificacao === 'pre-contrato');
      return matchesSearch && matchesMotivo;
    }
    
    return matchesSearch;
  });

  const abrirDetalhes = (processo: typeof todosProcessos[0]) => {
    setProcessoSelecionado(processo);
    setIsDetalhesModalOpen(true);
  };

  const desbloquearProcesso = () => {
    console.log('Desbloqueando processo:', processoSelecionado?.idProcesso);
    alert(`Processo ${processoSelecionado?.idProcesso} desbloqueado! O envio automático está agora habilitado.`);
    setIsDetalhesModalOpen(false);
  };

  const abrirConfirmacaoEnvio = (processo: typeof todosProcessos[0], tipo: 'manual' | 'liberar') => {
    setProcessoParaEnviar(processo);
    setTipoEnvio(tipo);
    setIsConfirmacaoEnvioOpen(true);
  };

  const confirmarEnvio = () => {
    if (!processoParaEnviar) return;

    if (tipoEnvio === 'manual') {
      enviarManualmente(processoParaEnviar);
    } else {
      liberarEnvioManual(processoParaEnviar);
    }

    setIsConfirmacaoEnvioOpen(false);
    setProcessoParaEnviar(null);
  };

  const enviarManualmente = (processo: typeof todosProcessos[0]) => {
    console.log('Enviando manualmente processo:', processo.idProcesso);
    
    toast.success('Envio manual realizado com sucesso!', {
      description: `O processo ${processo.idProcesso} foi enviado manualmente ao fornecedor.`
    });
  };

  const liberarEnvioManual = (processo: typeof todosProcessos[0]) => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const usuarioAtual = 'Maria Silva'; // Em produção, viria do contexto de autenticação
    
    console.log('Liberando envio manual do processo:', processo.idProcesso);
    console.log('Data/Hora:', `${dataAtual} ${horaAtual}`);
    console.log('Usuário:', usuarioAtual);
    
    toast.success('Envio Manual Liberado!', {
      description: `O processo ${processo.idProcesso} foi enviado ao fornecedor. Registro: ${dataAtual} ${horaAtual} por ${usuarioAtual}.`
    });
  };

  const podeEnviarManualmente = (statusEnvio: string) => {
    return statusEnvio === 'Enviado Automaticamente' || statusEnvio === 'Aguardando Próxima Execução';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Envio Automático</h2>
          <p className="text-gray-600 mt-1">Monitoramento do fluxo de automação de processos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#003366] hover:bg-[#002244] text-white">
              <Settings size={20} className="mr-2" />
              Configurações Gerais
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configurações do Envio Automático</DialogTitle>
              <DialogDescription>
                Configure os parâmetros globais do sistema de envio automático.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Valor Padrão Global</Label>
                <Input defaultValue="50.000,00" />
              </div>
              <div className="space-y-2">
                <Label>Horário de Envio</Label>
                <Input type="time" defaultValue="08:00" />
              </div>
              <div className="space-y-2">
                <Label>Frequência</Label>
                <select className="w-full p-2 border rounded">
                  <option value="diario">Diário</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox defaultChecked />
                <Label>Habilitar envio automático</Label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white">
                  Salvar Configurações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerta Informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Regra de Automação:</strong> Processos aprovados com valor abaixo de R$ 50.000,00 são enviados automaticamente ao fornecedor todos os dias às 08:00, exceto aqueles bloqueados por exceção de pré-contratos.
        </AlertDescription>
      </Alert>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl text-blue-600">{estatisticas.totalProcessos}</p>
                <p className="text-sm text-gray-600">Total em Monitoramento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl text-green-600">{estatisticas.enviadosAutomaticamente}</p>
                <p className="text-sm text-gray-600">Enviados Automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl text-blue-600">{estatisticas.aguardandoExecucao}</p>
                <p className="text-sm text-gray-600">Aguardando Execução</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Ban size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl text-red-600">{estatisticas.bloqueados}</p>
                <p className="text-sm text-gray-600">Bloqueados por Exceção</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xl text-purple-600">{estatisticas.valorTotalBloqueado}</p>
                <p className="text-sm text-gray-600">Valor Total Bloqueado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status do Sistema */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl text-black flex items-center gap-2">
            <Settings size={24} />
            Status do Sistema Automático
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Sistema de envio automático está <strong>ATIVO</strong>
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Limite:</span>
                  <span className="text-black">{configuracoes.valorPadrao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Horário de Envio:</span>
                  <span className="text-black">{configuracoes.horarioEnvio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frequência:</span>
                  <span className="text-black">{configuracoes.frequenciaEnvio}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Última Execução:</span>
                <span className="text-black">{configuracoes.ultimaExecucao}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Próxima Execução:</span>
                <span className="text-blue-600">{configuracoes.proximaExecucao}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <BadgeNew intent="success" weight="light">
                  Funcionando
                </BadgeNew>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abas de Visualização */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monitoramento">Envios em Monitoramento</TabsTrigger>
          <TabsTrigger value="bloqueados">Bloqueados por Exceção (Ação Manual Requerida)</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoramento" className="space-y-4">
          {/* Filtros - Aba Monitoramento */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar por ID do processo ou empresa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-64">
                  <Select value={statusEnvioFilter} onValueChange={setStatusEnvioFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por status de envio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="Enviado Automaticamente">Enviado Automaticamente</SelectItem>
                      <SelectItem value="Aguardando Próxima Execução">Aguardando Execução</SelectItem>
                      <SelectItem value="Bloqueado por Exceção">Bloqueado por Exceção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Processos em Monitoramento */}
          <Card className="border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-black">Processos em Monitoramento</CardTitle>
                <span className="text-sm text-gray-600">
                  {filteredProcessos.length} processos listados
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">ID do Processo</TableHead>
                      <TableHead className="min-w-[200px]">Empresa</TableHead>
                      <TableHead className="min-w-[130px]">Valor Total</TableHead>
                      <TableHead className="min-w-[140px]">Status Aprovação</TableHead>
                      <TableHead className="min-w-[200px]">Status do Envio</TableHead>
                      <TableHead className="min-w-[150px]">Data/Previsão</TableHead>
                      <TableHead className="min-w-[150px]">Responsável</TableHead>
                      <TableHead className="min-w-[140px] text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProcessos.map((processo) => (
                      <TableRow key={processo.id}>
                        <TableCell className="text-black">{processo.idProcesso}</TableCell>
                        <TableCell className="text-black">{processo.empresa}</TableCell>
                        <TableCell className="text-black">{processo.valorTotal}</TableCell>
                        <TableCell>
                          <BadgeNew {...getBadgeMappingForStatus(processo.statusAprovacao)}>
                            {processo.statusAprovacao}
                          </BadgeNew>
                        </TableCell>
                        <TableCell>
                          <BadgeNew {...getBadgeMappingForStatus(processo.statusEnvio)}>
                            {processo.statusEnvio}
                          </BadgeNew>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {processo.dataEnvio || processo.dataBloqueio || '-'}
                        </TableCell>
                        <TableCell className="text-gray-600">{processo.responsavel}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            {podeEnviarManualmente(processo.statusEnvio) && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => abrirConfirmacaoEnvio(processo, 'manual')}
                                title="Enviar manualmente ao fornecedor"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                              >
                                <Send size={16} />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => abrirDetalhes(processo)}
                              title="Ver detalhes"
                            >
                              <Eye size={16} />
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

        <TabsContent value="bloqueados" className="space-y-4">
          {/* Aviso de Segurança */}
          <Alert className="border-orange-300 bg-orange-50">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <AlertDescription className="text-orange-900">
              <strong>Atenção - Processos Bloqueados pela Automação:</strong> Estes processos foram impedidos de serem enviados automaticamente devido a regras de exceção configuradas. O envio manual só deve ser realizado após validação da Diretoria/Jurídico, conforme a política estabelecida para cada tipo de exceção.
            </AlertDescription>
          </Alert>

          {/* Filtros - Aba Bloqueados */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar por ID do processo ou empresa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-64">
                  <Select value={statusEnvioFilter} onValueChange={setStatusEnvioFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Motivos</SelectItem>
                      <SelectItem value="pre-contrato">Pré-Contrato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Processos Bloqueados */}
          <Card className="border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-black">Processos Bloqueados por Exceção</CardTitle>
                <span className="text-sm text-gray-600">
                  {filteredProcessos.length} processos bloqueados
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">ID do Processo</TableHead>
                      <TableHead className="min-w-[200px]">Empresa</TableHead>
                      <TableHead className="min-w-[130px]">Valor Total</TableHead>
                      <TableHead className="min-w-[140px]">Status do Processo</TableHead>
                      <TableHead className="min-w-[140px]">Data de Aprovação</TableHead>
                      <TableHead className="min-w-[200px]">Motivo da Exceção</TableHead>
                      <TableHead className="min-w-[150px]">Responsável</TableHead>
                      <TableHead className="min-w-[160px] text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProcessos.map((processo) => (
                      <TableRow key={processo.id}>
                        <TableCell className="text-black">{processo.idProcesso}</TableCell>
                        <TableCell className="text-black">{processo.empresa}</TableCell>
                        <TableCell className="text-black">{processo.valorTotal}</TableCell>
                        <TableCell>
                          <BadgeNew {...getBadgeMappingForStatus(processo.statusAprovacao)}>
                            {processo.statusAprovacao}
                          </BadgeNew>
                        </TableCell>
                        <TableCell className="text-gray-600">{processo.dataAprovacao}</TableCell>
                        <TableCell>
                          <BadgeNew intent="purple" weight="medium">
                            {processo.motivoBloqueio}
                          </BadgeNew>
                        </TableCell>
                        <TableCell className="text-gray-600">{processo.responsavel}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            {processo.statusAprovacao === 'Aprovada' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => abrirConfirmacaoEnvio(processo, 'liberar')}
                                title="Liberar Envio Manual"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                              >
                                <Send size={16} />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => abrirDetalhes(processo)}
                              title="Ver detalhes"
                            >
                              <Eye size={16} />
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

          {/* Informações Adicionais - Apenas na aba de bloqueados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-black flex items-center gap-2">
                  <DollarSign size={20} />
                  Configuração de Valores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Limite para Envio Automático:</span>
                    <span className="text-xl text-black">R$ 50.000,00</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Processos abaixo deste valor são enviados automaticamente, exceto os bloqueados por exceção.
                  </div>
                  <Button variant="outline" className="w-full">
                    <Edit size={16} className="mr-2" />
                    Alterar Limite
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-black flex items-center gap-2">
                  <AlertCircle size={20} />
                  Resumo de Bloqueios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Processos bloqueados:</span>
                      <span className="text-black">{estatisticas.bloqueados}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pré-Contratos:</span>
                      <span className="text-purple-600">{estatisticas.preContratos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Já aprovados (aguardando gestão):</span>
                      <span className="text-green-600">{processosBloqueados.filter(p => p.statusAprovacao === 'Aprovada').length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes do Processo */}
      <Dialog open={isDetalhesModalOpen} onOpenChange={setIsDetalhesModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
          {/* Área scrollável */}
          <div className="flex-1 overflow-y-auto px-6">
            <DialogHeader className="pt-6">
              <DialogTitle>Detalhes do Processo</DialogTitle>
              <DialogDescription>
                Informações completas sobre {processoSelecionado?.idProcesso}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 pb-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600 mb-1">ID do Processo</p>
                  <p className="text-black">{processoSelecionado?.idProcesso}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Tipo</p>
                  <p className="text-black">{processoSelecionado?.tipo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Empresa</p>
                  <p className="text-black">{processoSelecionado?.empresa}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Valor Total</p>
                  <p className="text-black">{processoSelecionado?.valorTotal}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Status da Aprovação</p>
                  <BadgeNew {...getBadgeMappingForStatus(processoSelecionado?.statusAprovacao || '')}>
                    {processoSelecionado?.statusAprovacao}
                  </BadgeNew>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Status do Envio</p>
                  <BadgeNew {...getBadgeMappingForStatus(processoSelecionado?.statusEnvio || '')}>
                    {processoSelecionado?.statusEnvio}
                  </BadgeNew>
                </div>
              </div>

              {processoSelecionado?.motivoBloqueio && (
                <div className="space-y-1.5">
                  <Label>Motivo do Bloqueio</Label>
                  <BadgeNew intent="purple" weight="medium" size="lg">
                    {processoSelecionado?.motivoBloqueio}
                  </BadgeNew>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Observações</Label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
                  {processoSelecionado?.observacoes}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Responsável</Label>
                <p className="text-black">{processoSelecionado?.responsavel}</p>
              </div>

              {processoSelecionado?.statusEnvio === 'Bloqueado por Exceção' && (
                <Alert className="border-orange-200 bg-orange-50">
                  <Ban className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Processo Bloqueado:</strong> Este processo não será enviado automaticamente ao fornecedor. Para liberar o envio automático, clique em "Desbloquear Envio".
                  </AlertDescription>
                </Alert>
              )}

              {processoSelecionado?.statusEnvio === 'Enviado Automaticamente' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Envio Concluído:</strong> Este processo foi enviado automaticamente ao fornecedor em {processoSelecionado?.dataEnvio}.
                  </AlertDescription>
                </Alert>
              )}

              {processoSelecionado?.statusEnvio === 'Aguardando Próxima Execução' && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Aguardando Execução:</strong> Este processo será enviado automaticamente na próxima execução agendada para {processoSelecionado?.dataEnvio}.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Footer fixo */}
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsDetalhesModalOpen(false)}
            >
              Fechar
            </Button>
            {processoSelecionado?.statusEnvio === 'Bloqueado por Exceção' && (
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={desbloquearProcesso}
              >
                Desbloquear Envio Automático
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Envio */}
      <AlertDialog open={isConfirmacaoEnvioOpen} onOpenChange={setIsConfirmacaoEnvioOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tipoEnvio === 'manual' ? 'Confirmar Envio Manual' : 'Confirmar Liberação de Envio'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tipoEnvio === 'manual' ? (
                <>
                  Você está prestes a enviar manualmente o processo <strong>{processoParaEnviar?.idProcesso}</strong> para o fornecedor <strong>{processoParaEnviar?.empresa}</strong>.
                  <br /><br />
                  Esta ação não pode ser desfeita. O fornecedor receberá a notificação imediatamente.
                </>
              ) : (
                <>
                  Você está prestes a liberar o envio manual do processo <strong>{processoParaEnviar?.idProcesso}</strong> para o fornecedor <strong>{processoParaEnviar?.empresa}</strong>.
                  <br /><br />
                  <span className="text-orange-600">⚠️ Este processo estava bloqueado por exceção ({processoParaEnviar?.motivoBloqueio}). Certifique-se de que a validação da Diretoria/Jurídico foi realizada.</span>
                  <br /><br />
                  O sistema registrará a data, hora e usuário responsável pelo envio.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmarEnvio}
              className="bg-[#003366] hover:bg-[#002244] text-white"
            >
              Confirmar Envio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}