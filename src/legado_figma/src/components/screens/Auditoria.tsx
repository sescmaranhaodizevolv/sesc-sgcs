import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BadgeNew } from '../ui/badge-new';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  FileText,
  Filter,
  Download,
  Search,
  Calendar,
  Check,
  Trash2
} from 'lucide-react';

interface AuditoriaProps {
  currentProfile?: 'admin' | 'comprador' | 'requisitante';
}

export function Auditoria({ currentProfile = 'admin' }: AuditoriaProps) {
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const todasNotificacoes = [
    {
      id: 1,
      tipo: 'critical',
      titulo: 'Contrato Vencendo em 15 dias',
      descricao: 'Contrato C-2024-001 com Empresa ABC Ltda vence em 15 dias',
      data: '25/01/2024 14:30',
      status: 'Não Lida',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 2,
      tipo: 'warning',
      titulo: 'Penalidade Contestada',
      descricao: 'Fornecedor XYZ S.A contestou penalidade aplicada no processo PROC-2024-005',
      data: '25/01/2024 09:15',
      status: 'Não Lida',
      icon: Clock,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 3,
      tipo: 'success',
      titulo: 'Processo Aprovado',
      descricao: 'PROC-2024-008 foi aprovado e está pronto para prosseguir',
      data: '24/01/2024 16:45',
      status: 'Não Lida',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 4,
      tipo: 'info',
      titulo: 'Envio Automático Realizado',
      descricao: 'Pedido enviado automaticamente para Tecnologia GHI Ltda',
      data: '23/01/2024 08:00',
      status: 'Lida',
      icon: FileText,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 5,
      tipo: 'critical',
      titulo: 'Prorrogação Pendente',
      descricao: 'Solicitação de prorrogação do processo PROC-2023-142 aguarda análise',
      data: '22/01/2024 11:20',
      status: 'Lida',
      icon: Clock,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 6,
      tipo: 'critical',
      titulo: 'Contrato Vencendo em 30 dias',
      descricao: 'Contrato C-2023-089 com Fornecedor XYZ S.A vence em 30 dias',
      data: '21/01/2024 14:30',
      status: 'Lida',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 7,
      tipo: 'success',
      titulo: 'Processo Rejeitado',
      descricao: 'PROC-2024-003 foi rejeitado. Verifique os motivos e tome as ações necessárias',
      data: '20/01/2024 10:15',
      status: 'Lida',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 8,
      tipo: 'warning',
      titulo: 'Realinhamento de Preços Solicitado',
      descricao: 'Empresa ABC Ltda solicitou realinhamento de preços no processo PROC-2023-098',
      data: '19/01/2024 15:40',
      status: 'Lida',
      icon: Clock,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 9,
      tipo: 'info',
      titulo: 'Backup Automático Concluído',
      descricao: 'Backup automático do sistema foi concluído com sucesso',
      data: '19/01/2024 02:00',
      status: 'Lida',
      icon: FileText,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 10,
      tipo: 'success',
      titulo: 'Novo Fornecedor Cadastrado',
      descricao: 'Serviços DEF Ltda foi cadastrado com sucesso no sistema',
      data: '18/01/2024 13:25',
      status: 'Lida',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  const filteredNotificacoes = todasNotificacoes.filter(notif => {
    const matchesSearch = notif.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === 'todos' || notif.tipo === tipoFilter;
    const matchesStatus = statusFilter === 'todos' || 
                         (statusFilter === 'lida' && notif.status === 'Lida') ||
                         (statusFilter === 'nao-lida' && notif.status === 'Não Lida');
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const stats = {
    total: todasNotificacoes.length,
    naoLidas: todasNotificacoes.filter(n => n.status === 'Não Lida').length,
    criticas: todasNotificacoes.filter(n => n.tipo === 'critical').length,
    lidas: todasNotificacoes.filter(n => n.status === 'Lida').length
  };

  const getTipoBadge = (tipo: string): { intent: 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'purple' | 'orange', weight: 'heavy' | 'medium' | 'light', label: string } => {
    const mappings = {
      'critical': { intent: 'danger' as const, weight: 'heavy' as const, label: 'Crítico' },
      'warning': { intent: 'warning' as const, weight: 'medium' as const, label: 'Aviso' },
      'success': { intent: 'success' as const, weight: 'medium' as const, label: 'Sucesso' },
      'info': { intent: 'info' as const, weight: 'medium' as const, label: 'Informação' }
    };
    return mappings[tipo as keyof typeof mappings] || mappings.info;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredNotificacoes.map(n => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleMarcarComoLida = () => {
    // Implementar lógica para marcar como lida
    console.log('Marcar como lida:', selectedIds);
    setSelectedIds([]);
  };

  const handleExcluirSelecionados = () => {
    // Implementar lógica para excluir
    console.log('Excluir:', selectedIds);
    setSelectedIds([]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Auditoria e Logs</h2>
          <p className="text-gray-600 mt-1">Histórico completo de notificações e atividades do sistema</p>
        </div>
        <Button className="bg-[#003366] hover:bg-[#002244] text-white">
          <Download size={16} className="mr-2" />
          Exportar Logs
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Notificações</p>
                <p className="text-2xl text-[#003366]">{stats.total}</p>
              </div>
              <FileText size={32} className="text-[#003366]" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Não Lidas</p>
                <p className="text-2xl text-red-600">{stats.naoLidas}</p>
              </div>
              <AlertCircle size={32} className="text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Críticas</p>
                <p className="text-2xl text-orange-600">{stats.criticas}</p>
              </div>
              <Clock size={32} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lidas</p>
                <p className="text-2xl text-green-600">{stats.lidas}</p>
              </div>
              <CheckCircle size={32} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border border-gray-200">
        <CardHeader className="pt-3 pb-1">
          <CardTitle className="text-xl text-black px-[0px] py-[8px] flex items-center gap-2">
            <Filter size={20} className="text-[#003366]" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input 
                placeholder="Buscar notificação..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="info">Informação</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="nao-lida">Não Lida</SelectItem>
                <SelectItem value="lida">Lida</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setTipoFilter('todos');
              setStatusFilter('todos');
            }}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificações */}
      <Card className="border border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
              <Calendar size={20} className="text-[#003366]" />
              Histórico de Notificações ({filteredNotificacoes.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                className="text-[#003366] border-[#003366] hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleMarcarComoLida}
                disabled={selectedIds.length === 0}
              >
                <Check size={16} className="mr-2" />
                Marcar como Lida ({selectedIds.length})
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedIds.length === 0}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Excluir ({selectedIds.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir <strong>{selectedIds.length}</strong> {selectedIds.length === 1 ? 'notificação selecionada' : 'notificações selecionadas'}? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleExcluirSelecionados}
                    >
                      Excluir Notificações
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#003366] sticky top-0">
                <TableRow>
                  <TableHead className="text-white w-[50px]">
                    <Checkbox 
                      checked={selectedIds.length === filteredNotificacoes.length && filteredNotificacoes.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#003366] data-[state=checked]:border-white"
                    />
                  </TableHead>
                  <TableHead className="text-white min-w-[140px]">Tipo</TableHead>
                  <TableHead className="text-white min-w-[250px]">Título</TableHead>
                  <TableHead className="text-white w-[350px]">Descrição</TableHead>
                  <TableHead className="text-white min-w-[160px]">Data/Hora</TableHead>
                  <TableHead className="text-white min-w-[120px]">Status</TableHead>
                  <TableHead className="text-white min-w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotificacoes.map(notif => {
                  const tipoBadge = getTipoBadge(notif.tipo);
                  const isSelected = selectedIds.includes(notif.id);
                  return (
                    <TableRow key={notif.id} className={notif.status === 'Não Lida' ? 'bg-blue-50/30' : ''}>
                      <TableCell>
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectOne(notif.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <BadgeNew intent={tipoBadge.intent} weight={tipoBadge.weight}>
                          {tipoBadge.label}
                        </BadgeNew>
                      </TableCell>
                      <TableCell className={notif.status === 'Não Lida' ? 'text-black' : 'text-gray-600'}>
                        {notif.titulo}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate max-w-[350px] cursor-help">
                              {notif.descricao}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-md">
                            {notif.descricao}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-gray-600 whitespace-nowrap">
                        {notif.data}
                      </TableCell>
                      <TableCell>
                        <BadgeNew 
                          intent={notif.status === 'Não Lida' ? 'info' : 'neutral'} 
                          weight="light"
                        >
                          {notif.status}
                        </BadgeNew>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            title="Marcar como lida"
                            disabled={notif.status === 'Lida'}
                          >
                            <Check size={16} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                title="Remover"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a notificação <strong>"{notif.titulo}"</strong>? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
                                  Excluir Notificação
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}