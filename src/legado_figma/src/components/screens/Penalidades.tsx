import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BadgeNew } from '../ui/badge-new';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Plus, Search, Archive, RotateCcw, Pencil, Paperclip, Shield, MoreVertical, Eye, Download, Clock, FileText, History, AlertTriangle, XCircle } from 'lucide-react';
import { getBadgeMappingForStatus } from '../../lib/badge-mappings';
import { FileInput } from '../ui/file-input';
import { toast } from 'sonner';
import { ComboboxFornecedores } from '../ui/combobox-fornecedores';
import { fornecedoresComCNPJ, penalidades as penalidadesIniciais } from '../../lib/dados-sistema';

export function Penalidades() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [isNovaPenalidadeModalOpen, setIsNovaPenalidadeModalOpen] = useState(false);
  const [editandoPenalidade, setEditandoPenalidade] = useState<typeof penalidades[0] | null>(null);
  const [contestandoPenalidade, setContestandoPenalidade] = useState<typeof penalidades[0] | null>(null);
  const [penalidadeParaEncerrar, setPenalidadeParaEncerrar] = useState<typeof penalidades[0] | null>(null);
  const [detalhePenalidade, setDetalhePenalidade] = useState<typeof penalidades[0] | null>(null);
  const [penalidades, setPenalidades] = useState(penalidadesIniciais);
  const [selectedFornecedor, setSelectedFornecedor] = useState<string>('');

  const [penalidadesEncerradas, setPenalidadesEncerradas] = useState<typeof penalidades>([]);

  // Função para verificar se uma penalidade está vencida pela data
  const isPenalidadeVencida = (dataVencimento: string): boolean => {
    if (!dataVencimento || dataVencimento === '-') return false;
    
    const [dia, mes, ano] = dataVencimento.split('/');
    const dataVencimentoObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera as horas para comparação exata de dias
    
    return dataVencimentoObj < hoje;
  };

  // useEffect para verificar e encerrar automaticamente penalidades vencidas
  useEffect(() => {
    const verificarPenalidadesVencidas = () => {
      let houveAlteracao = false;
      const penalidadesAtualizadas = [...penalidades];
      const novasEncerradas: typeof penalidades = [];

      penalidadesAtualizadas.forEach((penalidade, index) => {
        // Verifica se a data de vencimento já passou e o status não é "Encerrada"
        if (isPenalidadeVencida(penalidade.dataVencimento) && penalidade.status !== 'Encerrada') {
          // Primeiro, atualiza o status para "Vencida" se ainda não estiver
          if (penalidade.status !== 'Vencida') {
            penalidadesAtualizadas[index] = { ...penalidade, status: 'Vencida' };
            houveAlteracao = true;
          }
        }

        // Se o status é "Vencida", move para encerradas
        if (penalidadesAtualizadas[index].status === 'Vencida') {
          novasEncerradas.push({
            ...penalidadesAtualizadas[index],
            status: 'Encerrada',
            dataEncerramento: new Date().toLocaleDateString('pt-BR')
          });
          houveAlteracao = true;
        }
      });

      // Remove penalidades vencidas do array principal e adiciona às encerradas
      const penalidadesAtivas = penalidadesAtualizadas.filter(p => p.status !== 'Vencida');

      if (houveAlteracao && novasEncerradas.length > 0) {
        setPenalidades(penalidadesAtivas);
        setPenalidadesEncerradas(prev => [...prev, ...novasEncerradas]);
        
        toast.info(
          `${novasEncerradas.length} ${novasEncerradas.length === 1 ? 'penalidade vencida foi encerrada' : 'penalidades vencidas foram encerradas'} automaticamente.`,
          {
            description: 'A penalidade ultrapassou a data de vencimento.',
            duration: 5000
          }
        );
      } else if (houveAlteracao) {
        setPenalidades(penalidadesAtivas);
      }
    };

    // Executa a verificação imediatamente ao montar o componente
    verificarPenalidadesVencidas();

    // Depois executa periodicamente a cada 30 segundos
    const intervalo = setInterval(verificarPenalidadesVencidas, 30000);

    return () => clearInterval(intervalo);
  }, [penalidades]);

  const statusCounts = {
    todas: penalidades.length,
    aplicada: penalidades.filter(p => p.status === 'Aplicada').length,
    contestada: penalidades.filter(p => p.status === 'Contestada').length,
    vencida: penalidades.filter(p => p.status === 'Vencida').length,
    encerradas: penalidadesEncerradas.length
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aplicada':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'Em Análise':
        return <Clock size={16} className="text-yellow-600" />;
      case 'Contestada':
        return <Shield size={16} className="text-blue-600" />;
      case 'Suspensa':
        return <XCircle size={16} className="text-gray-600" />;
      case 'Vencida':
        return <Archive size={16} className="text-purple-600" />;
      default:
        return null;
    }
  };

  const calcularTempoVigencia = (dataOcorrencia: string) => {
    if (!dataOcorrencia || dataOcorrencia === '-') return '-';
    
    const [dia, mes, ano] = dataOcorrencia.split('/');
    const dataOcorrenciaObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const hoje = new Date();
    
    const diffTime = Math.abs(hoje.getTime() - dataOcorrenciaObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} dias`;
    } else if (diffDays < 365) {
      const meses = Math.floor(diffDays / 30);
      return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    } else {
      const anos = Math.floor(diffDays / 365);
      const mesesRestantes = Math.floor((diffDays % 365) / 30);
      if (mesesRestantes > 0) {
        return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${mesesRestantes} ${mesesRestantes === 1 ? 'mês' : 'meses'}`;
      }
      return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    }
  };

  const handleArquivar = (id: number) => {
    const penalidade = penalidades.find(p => p.id === id);
    if (penalidade) {
      setPenalidadesEncerradas([...penalidadesEncerradas, penalidade]);
      setPenalidades(penalidades.filter(p => p.id !== id));
    }
  };

  const handleDesarquivar = (id: number) => {
    const penalidade = penalidadesEncerradas.find(p => p.id === id);
    if (penalidade) {
      setPenalidades([...penalidades, penalidade]);
      setPenalidadesEncerradas(penalidadesEncerradas.filter(p => p.id !== id));
    }
  };

  const filteredPenalidades = penalidades.filter(penalidade => {
    const matchesSearch = penalidade.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         penalidade.processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         penalidade.penalidade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todas' || penalidade.status.toLowerCase().replace(' ', '-') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEncerradas = penalidadesEncerradas.filter(penalidade => {
    const matchesSearch = penalidade.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         penalidade.processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         penalidade.penalidade.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalValor = penalidades
    .filter(p => p.status === 'Aplicada')
    .reduce((sum, p) => sum + parseFloat(p.valor.replace('R$ ', '').replace('.', '').replace(',', '.')), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Penalidades</h2>
          <p className="text-gray-600 mt-1">Gestão e controle de penalidades contratuais</p>
        </div>
        <Button className="bg-[#003366] hover:bg-[#002244] text-white" onClick={() => setIsNovaPenalidadeModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Aplicar Penalidade
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-black">{statusCounts.todas}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#e7000b]">{statusCounts.aplicada}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Aplicadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#155dfc]">{statusCounts.contestada}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Contestadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#9810fa]">{statusCounts.vencida}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Vencidas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-xl leading-8 text-black">R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs leading-4 text-[#4a5565] w-[83px]">Valor Total Aplicado</p>
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
                  placeholder="Buscar por empresa, processo ou tipo de penalidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos os Status</SelectItem>
                  <SelectItem value="aplicada">Aplicada</SelectItem>
                  <SelectItem value="contestada">Contestada</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para Ativas e Arquivadas */}
      <Tabs defaultValue="ativas" className="w-full">
        <TabsList className="grid w-full max-w-[450px] grid-cols-2">
          <TabsTrigger value="ativas">Penalidades Ativas ({statusCounts.todas})</TabsTrigger>
          <TabsTrigger value="encerradas">Encerradas ({statusCounts.encerradas})</TabsTrigger>
        </TabsList>

        {/* Penalidades Ativas */}
        <TabsContent value="ativas">
          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black px-[0px] py-[8px]">Gestão de Controle e controle de penalidades contratuais</CardTitle>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 z-10 min-w-[200px]">Empresa</TableHead>
                      <TableHead className="min-w-[120px]">Processo</TableHead>
                      <TableHead className="min-w-[140px]">Notificações</TableHead>
                      <TableHead className="min-w-[200px]">Penalidade</TableHead>
                      <TableHead className="min-w-[120px]">Multa</TableHead>
                      <TableHead className="min-w-[140px]">Status</TableHead>
                      <TableHead className="min-w-[140px]">Data Ocorrência</TableHead>
                      <TableHead className="min-w-[140px]">Data Aplicação</TableHead>
                      <TableHead className="min-w-[140px]">Tempo de Vigência</TableHead>
                      <TableHead className="min-w-[160px]">Responsável</TableHead>
                      <TableHead className="min-w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPenalidades.map((penalidade) => (
                      <TableRow key={penalidade.id}>
                        <TableCell className="text-black sticky left-0 z-10">{penalidade.empresa}</TableCell>
                        <TableCell className="text-black">{penalidade.processo}</TableCell>
                        <TableCell className="text-center text-gray-600">
                          <BadgeNew intent="info" weight="light">{penalidade.notificacoes || 0}</BadgeNew>
                        </TableCell>
                        <TableCell className="text-gray-600">{penalidade.penalidade}</TableCell>
                        <TableCell className="text-black">{penalidade.multa}</TableCell>
                        <TableCell>
                          <BadgeNew {...getBadgeMappingForStatus(penalidade.status)}>
                            {penalidade.status}
                          </BadgeNew>
                        </TableCell>
                        <TableCell className="text-gray-600">{penalidade.dataOcorrencia}</TableCell>
                        <TableCell className="text-gray-600">{penalidade.dataAplicacao}</TableCell>
                        <TableCell className="text-gray-600">
                          {calcularTempoVigencia(penalidade.dataOcorrencia)}
                        </TableCell>
                        <TableCell className="text-gray-600">{penalidade.responsavel}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical size={16} className="text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setDetalhePenalidade(penalidade)}>
                                <Eye size={16} className="mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setEditandoPenalidade(penalidade)}>
                                Retificar
                              </DropdownMenuItem>
                              {(penalidade.status === 'Aplicada' || penalidade.status === 'Vencida') && (
                                <DropdownMenuItem onClick={() => setContestandoPenalidade(penalidade)}>
                                  Registrar Defesa
                                </DropdownMenuItem>
                              )}
                              {penalidade.status === 'Vencida' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => setPenalidadeParaEncerrar(penalidade)}
                                    className="text-gray-600"
                                  >
                                    Encerrar
                                  </DropdownMenuItem>
                                </>
                              )}
                              {penalidade.status === 'Contestada' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => setPenalidadeParaEncerrar(penalidade)}
                                    className="text-gray-600"
                                  >
                                    Encerrar
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Modals - agora sem triggers, controlados por estado */}
                          <Dialog open={editandoPenalidade?.id === penalidade.id} onOpenChange={(open) => !open && setEditandoPenalidade(null)}>
                              <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
                                <div className="flex-1 overflow-y-auto px-6">
                                  <DialogHeader className="pt-6">
                                    <DialogTitle>Retificar Penalidade</DialogTitle>
                                    <DialogDescription>
                                      Atualize as informações da penalidade aplicada.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4 pb-6">
                                    <div className="space-y-1.5">
                                      <Label htmlFor="edit-empresa">Empresa</Label>
                                      <Select defaultValue={penalidade.empresa}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione a empresa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Empresa ABC Ltda">Empresa ABC Ltda</SelectItem>
                                          <SelectItem value="Fornecedor XYZ S.A">Fornecedor XYZ S.A</SelectItem>
                                          <SelectItem value="Serviços DEF Eireli">Serviços DEF Eireli</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label htmlFor="edit-processo">Número do Processo</Label>
                                      <Input defaultValue={penalidade.processo} placeholder="Ex: 2024-001" />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label htmlFor="edit-tipoPenalidade">Tipo de Penalidade</Label>
                                      <Select defaultValue={penalidade.penalidade}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Atraso na entrega">Atraso na entrega</SelectItem>
                                          <SelectItem value="Descumprimento de especificação">Descumprimento de especificação</SelectItem>
                                          <SelectItem value="Abandono de serviço">Abandono de serviço</SelectItem>
                                          <SelectItem value="Produto fora de especificação">Produto fora de especificação</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label htmlFor="edit-valor">Valor da Penalidade</Label>
                                      <Input defaultValue={penalidade.valor} placeholder="R$ 0,00" />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label htmlFor="edit-status">Status</Label>
                                      <Select defaultValue={penalidade.status}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Aplicada">Aplicada</SelectItem>
                                          <SelectItem value="Contestada">Contestada</SelectItem>
                                          <SelectItem value="Vencida">Vencida</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label htmlFor="edit-justificativa">Observações</Label>
                                      <Textarea placeholder="Adicione observações sobre a penalidade..." rows={3} />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label htmlFor="edit-evidencia">Anexar Evidências (Opcional)</Label>
                                      <FileInput 
                                        id="edit-evidencia" 
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                                      />
                                      <p className="text-xs text-gray-500">
                                        Anexe documentos comprobatórios (PDF, DOC, DOCX, JPG, PNG - máx. 10MB)
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                                  <Button variant="outline" className="flex-1" onClick={() => setEditandoPenalidade(null)}>
                                    Cancelar
                                  </Button>
                                  <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => {
                                    setEditandoPenalidade(null);
                                    toast.success('Penalidade retificada com sucesso!');
                                  }}>
                                    Salvar Alterações
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Dialog open={contestandoPenalidade?.id === penalidade.id} onOpenChange={(open) => !open && setContestandoPenalidade(null)}>
                              <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
                                <div className="flex-1 overflow-y-auto px-6">
                                  <DialogHeader className="pt-6">
                                    <DialogTitle>Registrar Defesa/Contestação</DialogTitle>
                                    <DialogDescription>
                                      Registre argumentos de defesa ou contestação da penalidade aplicada.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4 pb-6">
                                    <div className="space-y-2">
                                      <p className="text-sm"><strong>Empresa:</strong> {penalidade.empresa}</p>
                                      <p className="text-sm"><strong>Processo:</strong> {penalidade.processo}</p>
                                      <p className="text-sm"><strong>Penalidade:</strong> {penalidade.penalidade}</p>
                                      <p className="text-sm"><strong>Valor:</strong> {penalidade.valor}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label htmlFor="tipo-defesa">Tipo de Ação</Label>
                                      <Select defaultValue="contestacao">
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="contestacao">Contestação</SelectItem>
                                          <SelectItem value="defesa">Defesa</SelectItem>
                                          <SelectItem value="recurso">Recurso Administrativo</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label htmlFor="argumentacao">Argumentação</Label>
                                      <Textarea id="argumentacao" placeholder="Descreva os argumentos de defesa..." rows={4} />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label htmlFor="documento-defesa">Documento Comprobatório</Label>
                                      <FileInput 
                                        id="documento-defesa" 
                                        accept=".pdf,.doc,.docx" 
                                      />
                                      <p className="text-xs text-gray-500">
                                        Anexe documentos que fundamentem a defesa (opcional)
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                                  <Button variant="outline" className="flex-1" onClick={() => setContestandoPenalidade(null)}>
                                    Cancelar
                                  </Button>
                                  <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => {
                                    setContestandoPenalidade(null);
                                    toast.success('Defesa registrada com sucesso!');
                                  }}>
                                    Registrar Defesa
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Penalidades Encerradas */}
        <TabsContent value="encerradas">
          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black px-[0px] py-[8px]\">Penalidades Encerradas</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {filteredEncerradas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Archive size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>Nenhuma penalidade encerrada</p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 z-10 min-w-[200px]">Empresa</TableHead>
                        <TableHead className="min-w-[120px]">Processo</TableHead>
                        <TableHead className="min-w-[140px]">Notificações</TableHead>
                        <TableHead className="min-w-[200px]">Penalidade</TableHead>
                        <TableHead className="min-w-[120px]">Multa</TableHead>
                        <TableHead className="min-w-[140px]">Status</TableHead>
                        <TableHead className="min-w-[140px]">Data Ocorrência</TableHead>
                        <TableHead className="min-w-[140px]">Data Aplicação</TableHead>
                        <TableHead className="min-w-[140px]">Tempo de Vigência</TableHead>
                        <TableHead className="min-w-[160px]">Responsável</TableHead>
                        <TableHead className="min-w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEncerradas.map((penalidade) => (
                        <TableRow key={penalidade.id}>
                          <TableCell className="text-black sticky left-0 z-10">{penalidade.empresa}</TableCell>
                          <TableCell className="text-black">{penalidade.processo}</TableCell>
                          <TableCell className="text-center text-gray-600">
                            <BadgeNew intent="info" weight="light">{penalidade.notificacoes || 0}</BadgeNew>
                          </TableCell>
                          <TableCell className="text-gray-600">{penalidade.penalidade}</TableCell>
                          <TableCell className="text-black">{penalidade.multa}</TableCell>
                          <TableCell>
                            <BadgeNew {...getBadgeMappingForStatus(penalidade.status)}>
                              {penalidade.status}
                            </BadgeNew>
                          </TableCell>
                          <TableCell className="text-gray-600">{penalidade.dataOcorrencia}</TableCell>
                          <TableCell className="text-gray-600">{penalidade.dataAplicacao}</TableCell>
                          <TableCell className="text-gray-600">
                            {calcularTempoVigencia(penalidade.dataOcorrencia)}
                          </TableCell>
                          <TableCell className="text-gray-600">{penalidade.responsavel}</TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                                  <RotateCcw size={16} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Restaurar Penalidade</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja restaurar esta penalidade? Ela será movida de volta para a lista de penalidades ativas.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDesarquivar(penalidade.id)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    Restaurar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes da Penalidade */}
      {detalhePenalidade && (
        <Dialog open={!!detalhePenalidade} onOpenChange={(open) => !open && setDetalhePenalidade(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6 pb-4">
                <DialogTitle>Detalhes da Penalidade</DialogTitle>
                <DialogDescription>
                  Informações completas, histórico e documentos da penalidade
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="dados" className="w-full pb-6">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="dados">Dados da Penalidade</TabsTrigger>
                  <TabsTrigger value="historico">Histórico</TabsTrigger>
                  <TabsTrigger value="documentos">Documentos</TabsTrigger>
                </TabsList>

                {/* Aba Dados */}
                <TabsContent value="dados" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informações Gerais</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600">Empresa</Label>
                        <p className="text-black mt-1">{detalhePenalidade.empresa}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Processo</Label>
                        <p className="text-black mt-1">{detalhePenalidade.processo}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Tipo de Penalidade</Label>
                        <p className="text-black mt-1">{detalhePenalidade.penalidade}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Valor da Penalidade</Label>
                        <p className="text-black mt-1">{detalhePenalidade.valor}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Status Atual</Label>
                        <div className="mt-1">
                          <BadgeNew {...getBadgeMappingForStatus(detalhePenalidade.status)}>
                            {detalhePenalidade.status}
                          </BadgeNew>
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-600">Responsável</Label>
                        <p className="text-black mt-1">{detalhePenalidade.responsavel}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Datas e Prazos</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600">Data de Ocorrência</Label>
                        <p className="text-black mt-1">{detalhePenalidade.dataOcorrencia}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Data de Aplicação</Label>
                        <p className="text-black mt-1">{detalhePenalidade.dataAplicacao}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Tempo de Vigência</Label>
                        <p className="text-black mt-1">{calcularTempoVigencia(detalhePenalidade.dataOcorrencia)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Justificativa</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        Descumprimento contratual identificado durante a execução do processo. 
                        A empresa foi notificada sobre as irregularidades encontradas e teve prazo 
                        para apresentar justificativas, conforme previsto em contrato.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba Histórico */}
                <TabsContent value="historico" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <History size={20} />
                        Linha do Tempo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-[#003366]" />
                            <div className="w-0.5 h-full bg-gray-200 mt-2" />
                          </div>
                          <div className="flex-1 pb-8">
                            <p className="text-sm text-gray-500">{detalhePenalidade.dataAplicacao}</p>
                            <p className="mt-1"><strong>Penalidade Aplicada</strong></p>
                            <p className="text-sm text-gray-600 mt-1">
                              Penalidade aplicada por {detalhePenalidade.responsavel}
                            </p>
                          </div>
                        </div>
                        
                        {detalhePenalidade.status === 'Contestada' && (
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-[#155dfc]" />
                              <div className="w-0.5 h-full bg-gray-200 mt-2" />
                            </div>
                            <div className="flex-1 pb-8">
                              <p className="text-sm text-gray-500">10/01/2024</p>
                              <p className="mt-1"><strong>Defesa Registrada</strong></p>
                              <p className="text-sm text-gray-600 mt-1">
                                Empresa apresentou contestação com documentos comprobatórios
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-gray-300" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">{detalhePenalidade.dataOcorrencia}</p>
                            <p className="mt-1"><strong>Ocorrência Registrada</strong></p>
                            <p className="text-sm text-gray-600 mt-1">
                              Identificação do descumprimento contratual: {detalhePenalidade.penalidade}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba Documentos */}
                <TabsContent value="documentos" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText size={20} />
                        Documentos Anexados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Documento 1 - Auto de Infração */}
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText size={40} className="text-[#003366]" />
                            <div>
                              <p className="text-black">Auto_de_Infracao_{detalhePenalidade.processo}.pdf</p>
                              <p className="text-sm text-gray-500">Anexado em {detalhePenalidade.dataAplicacao} • 245 KB</p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toast.success('Download iniciado!')}
                          >
                            <Download size={16} className="mr-2" />
                            Baixar
                          </Button>
                        </div>

                        {/* Documento 2 - Notificação */}
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText size={40} className="text-[#003366]" />
                            <div>
                              <p className="text-black">Notificacao_Empresa_{detalhePenalidade.processo}.pdf</p>
                              <p className="text-sm text-gray-500">Anexado em {detalhePenalidade.dataAplicacao} • 128 KB</p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toast.success('Download iniciado!')}
                          >
                            <Download size={16} className="mr-2" />
                            Baixar
                          </Button>
                        </div>

                        {/* Documento 3 - Evidências (se contestada) */}
                        {detalhePenalidade.status === 'Contestada' && (
                          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText size={40} className="text-[#155dfc]" />
                              <div>
                                <p className="text-black">Defesa_Empresa_{detalhePenalidade.processo}.pdf</p>
                                <p className="text-sm text-gray-500">Anexado em 10/01/2024 • 512 KB</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => toast.success('Download iniciado!')}
                            >
                              <Download size={16} className="mr-2" />
                              Baixar
                            </Button>
                          </div>
                        )}

                        {detalhePenalidade.status === 'Aplicada' && (
                          <div className="text-center py-8 text-gray-500">
                            <FileText size={48} className="mx-auto mb-3 text-gray-300" />
                            <p>Nenhuma defesa ou documento adicional anexado</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6">
              <Button 
                variant="outline" 
                onClick={() => setDetalhePenalidade(null)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Alert Dialog de Confirmação de Encerramento */}
      <AlertDialog open={!!penalidadeParaEncerrar} onOpenChange={(open) => !open && setPenalidadeParaEncerrar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar Penalidade Vencida</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Tem certeza que deseja encerrar esta penalidade? A penalidade será movida para a aba "Encerradas" e não poderá ser restaurada posteriormente.
                </p>
                {penalidadeParaEncerrar && (
                  <div className="space-y-1 pt-2">
                    <p><span className="text-black">Empresa:</span> {penalidadeParaEncerrar.empresa}</p>
                    <p><span className="text-black">Processo:</span> {penalidadeParaEncerrar.processo}</p>
                    <p><span className="text-black">Valor:</span> {penalidadeParaEncerrar.valor}</p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPenalidadeParaEncerrar(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (penalidadeParaEncerrar) {
                  handleArquivar(penalidadeParaEncerrar.id);
                  setPenalidadeParaEncerrar(null);
                  toast.success('Penalidade encerrada com sucesso!');
                }
              }}
              className="bg-[#003366] hover:bg-[#002244]"
            >
              Encerrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Nova Penalidade */}
      <Dialog open={isNovaPenalidadeModalOpen} onOpenChange={setIsNovaPenalidadeModalOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
          {/* Área scrollável */}
          <div className="flex-1 overflow-y-auto px-6">
            <DialogHeader className="pt-6">
              <DialogTitle>Aplicar Nova Penalidade</DialogTitle>
              <DialogDescription>
                Aplique uma penalidade a um fornecedor por descumprimento contratual.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 pb-6">
              <div className="space-y-1.5">
                <Label htmlFor="empresa">Empresa</Label>
                <ComboboxFornecedores
                  fornecedores={fornecedoresComCNPJ}
                  placeholder="Selecione a empresa"
                  onValueChange={(value) => setSelectedFornecedor(value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="processo">Número do Processo</Label>
                <Input placeholder="Ex: 2024-001" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dataAplicacao">Data de Aplicação</Label>
                <Input type="date" id="dataAplicacao" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tipoPenalidade">Tipo de Penalidade</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atraso">Atraso na entrega</SelectItem>
                    <SelectItem value="especificacao">Descumprimento de especificação</SelectItem>
                    <SelectItem value="abandono">Abandono de serviço</SelectItem>
                    <SelectItem value="qualidade">Produto fora de especificação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="valor">Valor da Penalidade</Label>
                <Input placeholder="R$ 0,00" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="justificativa">Justificativa</Label>
                <Textarea placeholder="Descreva a justificativa para a penalidade..." rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="evidencia-aplicacao">Evidência (Opcional)</Label>
                <FileInput 
                  id="evidencia-aplicacao" 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                />
                <p className="text-xs text-gray-500">
                  Anexe documentos comprobatórios (PDF, DOC, DOCX, JPG, PNG - máx. 10MB)
                </p>
              </div>
            </div>
          </div>

          {/* Footer fixo */}
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
            <Button variant="outline" className="flex-1" onClick={() => setIsNovaPenalidadeModalOpen(false)}>
              Cancelar
            </Button>
            <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => {
              setIsNovaPenalidadeModalOpen(false);
              toast.success('Penalidade aplicada com sucesso!');
            }}>
              Aplicar Penalidade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}