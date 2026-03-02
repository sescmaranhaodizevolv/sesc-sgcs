import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BadgeNew } from '../ui/badge-new';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Calendar, Clock, AlertTriangle, CheckCircle2, XCircle, Search, FileText, Edit, Save, RotateCcw, CalendarDays, AlertCircle } from 'lucide-react';
import { getBadgeMappingForStatus } from '../../lib/badge-mappings';
import { toast } from 'sonner';
import { ComboboxFornecedores } from '../ui/combobox-fornecedores';
import { fornecedoresComCNPJ, prorrogacoes } from '../../lib/dados-sistema';

interface Contrato {
  id: number;
  empresa: string;
  contrato: string;
  objetoContrato: string;
  cnpjCpf: string;
  numeroProcesso: string;
  valorContratadoAnual: string;
  dataInicio: string;
  dataFimOriginal: string;
  dataFimProrrogada: string;
  prazoOriginal: string;
  prazoProrrogacao: string;
  quantidadeAditivos: number;
  passivelProrrogar: boolean;
  status: string;
  responsavel: string;
  observacoes?: string;
}

export function GestoraContratos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [contratos, setContratos] = useState<Contrato[]>(prorrogacoes as Contrato[]);
  const [editandoContrato, setEditandoContrato] = useState<Contrato | null>(null);
  const [detalhesContrato, setDetalhesContrato] = useState<Contrato | null>(null);
  const [selectedFornecedor, setSelectedFornecedor] = useState<string>('');

  // Formulário de edição
  const [formData, setFormData] = useState({
    dataInicio: '',
    dataFimOriginal: '',
    dataFimProrrogada: '',
    status: '',
    observacoes: ''
  });

  const statusCounts = {
    todos: contratos.length,
    vigente: contratos.filter(c => c.status === 'Vigente').length,
    proximoVencimento: contratos.filter(c => c.status === 'Próximo ao Vencimento').length,
    vencendo: contratos.filter(c => c.status === 'Vencendo').length,
    encerrado: contratos.filter(c => c.status === 'Encerrado').length,
    suspenso: contratos.filter(c => c.status === 'Suspenso').length
  };

  const calcularDiasRestantes = (dataFim: string) => {
    if (!dataFim || dataFim === '-') return null;
    
    const [dia, mes, ano] = dataFim.split('/');
    const dataFimObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const hoje = new Date();
    
    const diffTime = dataFimObj.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getAlertaBadge = (dataFim: string, status: string) => {
    if (status === 'Encerrado' || status === 'Suspenso') return null;
    
    const diasRestantes = calcularDiasRestantes(dataFim);
    if (diasRestantes === null) return null;
    
    if (diasRestantes < 0) {
      return <BadgeNew intent="danger" weight="medium" size="sm">Vencido</BadgeNew>;
    } else if (diasRestantes <= 15) {
      return <BadgeNew intent="danger" weight="medium" size="sm">{diasRestantes} dias</BadgeNew>;
    } else if (diasRestantes <= 30) {
      return <BadgeNew intent="warning" weight="medium" size="sm">{diasRestantes} dias</BadgeNew>;
    } else if (diasRestantes <= 60) {
      return <BadgeNew intent="info" weight="light" size="sm">{diasRestantes} dias</BadgeNew>;
    }
    return null;
  };

  const handleEditarClick = (contrato: Contrato) => {
    setEditandoContrato(contrato);
    setFormData({
      dataInicio: contrato.dataInicio,
      dataFimOriginal: contrato.dataFimOriginal,
      dataFimProrrogada: contrato.dataFimProrrogada,
      status: contrato.status,
      observacoes: contrato.observacoes || ''
    });
  };

  const handleSalvarEdicao = () => {
    if (!editandoContrato) return;

    const contratosAtualizados = contratos.map(c => {
      if (c.id === editandoContrato.id) {
        return {
          ...c,
          dataInicio: formData.dataInicio,
          dataFimOriginal: formData.dataFimOriginal,
          dataFimProrrogada: formData.dataFimProrrogada,
          status: formData.status,
          observacoes: formData.observacoes
        };
      }
      return c;
    });

    setContratos(contratosAtualizados);
    setEditandoContrato(null);
    toast.success('Contrato atualizado com sucesso!');
  };

  const filteredContratos = contratos.filter(contrato => {
    const matchesSearch = 
      contrato.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.contrato.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.objetoContrato.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.numeroProcesso.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || contrato.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Converter data de DD/MM/YYYY para YYYY-MM-DD
  const converterParaInputDate = (dataStr: string) => {
    if (!dataStr || dataStr === '-') return '';
    const [dia, mes, ano] = dataStr.split('/');
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  };

  // Converter data de YYYY-MM-DD para DD/MM/YYYY
  const converterParaFormatoBR = (dataStr: string) => {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Gestão de Contratos e TRP</h2>
          <p className="text-gray-600 mt-1">Alimentação de datas de vigência e status contratuais</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#003366] hover:bg-[#002244] text-white">
              <Calendar size={20} className="mr-2" />
              Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Cadastrar Novo Contrato</DialogTitle>
                <DialogDescription>
                  Preencha as informações de vigência e status do contrato/TRP.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 pb-6">
                <div className="space-y-1.5">
                  <Label htmlFor="novo-empresa">Empresa/Fornecedor</Label>
                  <ComboboxFornecedores
                    fornecedores={fornecedoresComCNPJ}
                    value={selectedFornecedor}
                    onValueChange={setSelectedFornecedor}
                    placeholder="Selecione o fornecedor"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-contrato">Número do Contrato</Label>
                    <Input placeholder="Ex: SCA-2024-001" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-processo">Número do Processo</Label>
                    <Input placeholder="Ex: PROC-2024-001" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="novo-objeto">Objeto do Contrato</Label>
                  <Input placeholder="Descrição do objeto contratual" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-valor">Valor Anual</Label>
                    <Input placeholder="R$ 0,00" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-prazo">Prazo Original</Label>
                    <Input placeholder="Ex: 12 meses" />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm text-black mb-3">Datas de Vigência</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="novo-data-inicio">Data de Início</Label>
                      <Input type="date" id="novo-data-inicio" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="novo-data-fim">Data de Fim</Label>
                      <Input type="date" id="novo-data-fim" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="novo-status">Status</Label>
                  <Select defaultValue="Vigente">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vigente">Vigente</SelectItem>
                      <SelectItem value="Próximo ao Vencimento">Próximo ao Vencimento</SelectItem>
                      <SelectItem value="Vencendo">Vencendo</SelectItem>
                      <SelectItem value="Encerrado">Encerrado</SelectItem>
                      <SelectItem value="Suspenso">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="novo-observacoes">Observações</Label>
                  <Textarea 
                    id="novo-observacoes"
                    placeholder="Informações adicionais sobre o contrato..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2">
              <Button variant="outline" className="flex-1">
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => toast.success('Contrato cadastrado com sucesso!')}
              >
                Cadastrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-black">{statusCounts.todos}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#10b981]">{statusCounts.vigente}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Vigentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#f59e0b]">{statusCounts.proximoVencimento}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Próximo Venc.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#e7000b]">{statusCounts.vencendo}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Vencendo</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#6b7280]">{statusCounts.encerrado}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Encerrados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#9810fa]">{statusCounts.suspenso}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Suspensos</p>
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
                  placeholder="Buscar por empresa, contrato, objeto ou processo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="Vigente">Vigente</SelectItem>
                  <SelectItem value="Próximo ao Vencimento">Próximo ao Vencimento</SelectItem>
                  <SelectItem value="Vencendo">Vencendo</SelectItem>
                  <SelectItem value="Encerrado">Encerrado</SelectItem>
                  <SelectItem value="Suspenso">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Vencimento */}
      {statusCounts.vencendo > 0 && (
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-red-600" />
              <div>
                <p className="text-black">
                  <strong>{statusCounts.vencendo}</strong> {statusCounts.vencendo === 1 ? 'contrato vencendo' : 'contratos vencendo'} nos próximos 15 dias
                </p>
                <p className="text-sm text-gray-600">Atualize as datas de vigência ou status para evitar interrupções</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Contratos */}
      <Card className="border border-gray-200">
        <CardHeader className="pt-3 pb-1">
          <CardTitle className="text-xl text-black px-[0px] py-[8px]">Contratos e TRP Ativos</CardTitle>
        </CardHeader>
        <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 min-w-[200px]">Empresa</TableHead>
                  <TableHead className="min-w-[120px]">Contrato</TableHead>
                  <TableHead className="min-w-[250px]">Objeto</TableHead>
                  <TableHead className="min-w-[120px]">Processo</TableHead>
                  <TableHead className="min-w-[120px]">Data Início</TableHead>
                  <TableHead className="min-w-[120px]">Data Fim Original</TableHead>
                  <TableHead className="min-w-[140px]">Data Fim Prorrogada</TableHead>
                  <TableHead className="min-w-[120px]">Alerta</TableHead>
                  <TableHead className="min-w-[140px]">Status</TableHead>
                  <TableHead className="min-w-[160px]">Responsável</TableHead>
                  <TableHead className="min-w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContratos.map((contrato) => (
                  <TableRow key={contrato.id}>
                    <TableCell className="text-black sticky left-0 z-10">{contrato.empresa}</TableCell>
                    <TableCell className="text-black">{contrato.contrato}</TableCell>
                    <TableCell className="text-gray-600">{contrato.objetoContrato}</TableCell>
                    <TableCell className="text-gray-600">{contrato.numeroProcesso}</TableCell>
                    <TableCell className="text-gray-600">{contrato.dataInicio}</TableCell>
                    <TableCell className="text-gray-600">{contrato.dataFimOriginal}</TableCell>
                    <TableCell className="text-gray-600">
                      {contrato.dataFimProrrogada !== '-' ? contrato.dataFimProrrogada : '-'}
                    </TableCell>
                    <TableCell>
                      {getAlertaBadge(
                        contrato.dataFimProrrogada !== '-' ? contrato.dataFimProrrogada : contrato.dataFimOriginal,
                        contrato.status
                      )}
                    </TableCell>
                    <TableCell>
                      <BadgeNew {...getBadgeMappingForStatus(contrato.status)}>
                        {contrato.status}
                      </BadgeNew>
                    </TableCell>
                    <TableCell className="text-gray-600">{contrato.responsavel}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditarClick(contrato)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDetalhesContrato(contrato)}
                        >
                          <FileText size={16} />
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

      {/* Modal de Edição de Vigência */}
      <Dialog open={!!editandoContrato} onOpenChange={(open) => !open && setEditandoContrato(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Atualizar Datas de Vigência e Status</DialogTitle>
            <DialogDescription>
              Atualize as informações de vigência do contrato {editandoContrato?.contrato}
            </DialogDescription>
          </DialogHeader>

          {editandoContrato && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm"><strong>Empresa:</strong> {editandoContrato.empresa}</p>
                <p className="text-sm"><strong>Contrato:</strong> {editandoContrato.contrato}</p>
                <p className="text-sm"><strong>Objeto:</strong> {editandoContrato.objetoContrato}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm text-black mb-3 flex items-center gap-2">
                  <CalendarDays size={16} />
                  Datas de Vigência
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-data-inicio">Data de Início</Label>
                    <Input
                      type="date"
                      id="edit-data-inicio"
                      value={converterParaInputDate(formData.dataInicio)}
                      onChange={(e) => setFormData({
                        ...formData,
                        dataInicio: converterParaFormatoBR(e.target.value)
                      })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-data-fim-original">Data Fim Original</Label>
                    <Input
                      type="date"
                      id="edit-data-fim-original"
                      value={converterParaInputDate(formData.dataFimOriginal)}
                      onChange={(e) => setFormData({
                        ...formData,
                        dataFimOriginal: converterParaFormatoBR(e.target.value)
                      })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-data-fim-prorrogada">Data Fim Prorrogada</Label>
                    <Input
                      type="date"
                      id="edit-data-fim-prorrogada"
                      value={formData.dataFimProrrogada !== '-' ? converterParaInputDate(formData.dataFimProrrogada) : ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        dataFimProrrogada: e.target.value ? converterParaFormatoBR(e.target.value) : '-'
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-status">Status do Contrato</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vigente">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-600" />
                        Vigente
                      </div>
                    </SelectItem>
                    <SelectItem value="Próximo ao Vencimento">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-yellow-600" />
                        Próximo ao Vencimento
                      </div>
                    </SelectItem>
                    <SelectItem value="Vencendo">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-orange-600" />
                        Vencendo
                      </div>
                    </SelectItem>
                    <SelectItem value="Encerrado">
                      <div className="flex items-center gap-2">
                        <XCircle size={16} className="text-gray-600" />
                        Encerrado
                      </div>
                    </SelectItem>
                    <SelectItem value="Suspenso">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-purple-600" />
                        Suspenso
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-observacoes">Observações</Label>
                <Textarea
                  id="edit-observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Adicione observações sobre as alterações..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditandoContrato(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-[#003366] hover:bg-[#002244] text-white"
              onClick={handleSalvarEdicao}
            >
              <Save size={16} className="mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={!!detalhesContrato} onOpenChange={(open) => !open && setDetalhesContrato(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
          <div className="flex-1 overflow-y-auto px-6">
            <DialogHeader className="pt-6 pb-4">
              <DialogTitle>Detalhes do Contrato</DialogTitle>
              <DialogDescription>
                Informações completas sobre o contrato/TRP
              </DialogDescription>
            </DialogHeader>

            {detalhesContrato && (
              <div className="space-y-4 pb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Empresa</Label>
                      <p className="text-black mt-1">{detalhesContrato.empresa}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">CNPJ/CPF</Label>
                      <p className="text-black mt-1">{detalhesContrato.cnpjCpf}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Contrato</Label>
                      <p className="text-black mt-1">{detalhesContrato.contrato}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Processo</Label>
                      <p className="text-black mt-1">{detalhesContrato.numeroProcesso}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-gray-600">Objeto</Label>
                      <p className="text-black mt-1">{detalhesContrato.objetoContrato}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Valor Anual</Label>
                      <p className="text-black mt-1">{detalhesContrato.valorContratadoAnual}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Responsável</Label>
                      <p className="text-black mt-1">{detalhesContrato.responsavel}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vigência e Prazos</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Data de Início</Label>
                      <p className="text-black mt-1">{detalhesContrato.dataInicio}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Prazo Original</Label>
                      <p className="text-black mt-1">{detalhesContrato.prazoOriginal}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Data Fim Original</Label>
                      <p className="text-black mt-1">{detalhesContrato.dataFimOriginal}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Data Fim Prorrogada</Label>
                      <p className="text-black mt-1">{detalhesContrato.dataFimProrrogada}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Quantidade de Aditivos</Label>
                      <p className="text-black mt-1">{detalhesContrato.quantidadeAditivos}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Status Atual</Label>
                      <div className="mt-1">
                        <BadgeNew {...getBadgeMappingForStatus(detalhesContrato.status)}>
                          {detalhesContrato.status}
                        </BadgeNew>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {detalhesContrato.observacoes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Observações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{detalhesContrato.observacoes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6">
            <Button onClick={() => setDetalhesContrato(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
