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
import { Plus, Calendar, Search, Clock, CheckCircle, AlertCircle, CalendarDays, FileText, X } from 'lucide-react';
import { getBadgeMappingForStatus } from '../../lib/badge-mappings';
import { prorrogacoes as prorrogacoesIniciais } from '../../lib/dados-sistema';

interface NovaProrrogacao {
  aditivo: string;
  dataInicio: string;
  dataFim: string;
  observacoes: string;
}

export function ProrrogacoesContratos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [periodoFilter, setPeriodoFilter] = useState('todos');
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<any>(null);
  const [novasProrrogacoes, setNovasProrrogacoes] = useState<NovaProrrogacao[]>([
    { aditivo: '', dataInicio: '', dataFim: '', observacoes: '' }
  ]);

  const prorrogacoes = prorrogacoesIniciais;

  const statusCounts = {
    todos: prorrogacoes.length,
    aprovada: prorrogacoes.filter(p => p.status === 'Aprovada').length,
    analise: prorrogacoes.filter(p => p.status === 'Em Análise').length,
    pendente: prorrogacoes.filter(p => p.status === 'Pendente').length,
    vencendo: prorrogacoes.filter(p => p.status === 'Vencendo').length
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'Aprovada': 'bg-emerald-600 text-white',
      'Em Análise': 'bg-amber-500 text-white',
      'Pendente': 'bg-blue-600 text-white',
      'Vencendo': 'bg-red-600 text-white'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-600 text-white';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aprovada':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'Em Análise':
        return <Clock size={16} className="text-yellow-600" />;
      case 'Pendente':
        return <Calendar size={16} className="text-blue-600" />;
      case 'Vencendo':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const empresas = [...new Set(prorrogacoes.map(p => p.empresa))];

  const handleProrrogacaoChange = (index: number, field: keyof NovaProrrogacao, value: string) => {
    const novasPrors = [...novasProrrogacoes];
    novasPrors[index][field] = value;
    setNovasProrrogacoes(novasPrors);
  };

  const adicionarProrrogacao = () => {
    setNovasProrrogacoes([...novasProrrogacoes, { aditivo: '', dataInicio: '', dataFim: '', observacoes: '' }]);
  };

  const removerProrrogacao = (index: number) => {
    if (novasProrrogacoes.length > 1) {
      const novasPrors = novasProrrogacoes.filter((_, i) => i !== index);
      setNovasProrrogacoes(novasPrors);
    }
  };

  const resetFormularioProrrogacoes = () => {
    setNovasProrrogacoes([{ aditivo: '', dataInicio: '', dataFim: '', observacoes: '' }]);
  };

  const filteredProrrogacoes = prorrogacoes.filter(prorrogacao => {
    const matchesSearch = prorrogacao.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prorrogacao.contrato.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || prorrogacao.status.toLowerCase().replace(' ', '-') === statusFilter;
    const matchesPeriodo = periodoFilter === 'todos' || 
      (periodoFilter === '30-dias' && prorrogacao.status === 'Vencendo') ||
      (periodoFilter === '60-dias' && (prorrogacao.status === 'Vencendo' || prorrogacao.status === 'Pendente'));
    
    return matchesSearch && matchesStatus && matchesPeriodo;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Prorrogações de Processos</h2>
          <p className="text-gray-600 mt-1">Gestão de prorrogações e extensões contratuais</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#003366] hover:bg-[#002244] text-white">
              <Plus size={20} className="mr-2" />
              Solicitar Prorrogação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
            {/* Área scrollável */}
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Solicitar Prorrogação de Processo</DialogTitle>
                <DialogDescription>
                  Solicite a prorrogação de um contrato existente.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">
                <div className="space-y-1.5">
                  <Label htmlFor="empresa">Empresa/Fornecedor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map(empresa => (
                        <SelectItem key={empresa} value={empresa}>{empresa}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contrato">Número do Contrato</Label>
                  <Input placeholder="Ex: C-2024-001" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="objetoContrato">Objeto do Contrato</Label>
                  <Input placeholder="Ex: Serviços de Manutenção Predial..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dataAtual">Data de Fim Atual</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="novaData">Nova Data de Fim</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="motivo">Motivo da Prorrogação</Label>
                  <Textarea placeholder="Justifique a necessidade da prorrogação..." rows={3} />
                </div>
              </div>
            </div>

            {/* Footer fixo */}
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1">
                Cancelar
              </Button>
              <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white">
                Solicitar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarDays size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl text-black">{statusCounts.todos}</p>
                <p className="text-sm text-gray-600">Total</p>
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
                <p className="text-2xl text-green-600">{statusCounts.aprovada}</p>
                <p className="text-sm text-gray-600">Aprovadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl text-yellow-600">{statusCounts.analise}</p>
                <p className="text-sm text-gray-600">Em Análise</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl text-blue-600">{statusCounts.pendente}</p>
                <p className="text-sm text-gray-600">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl text-red-600">{statusCounts.vencendo}</p>
                <p className="text-sm text-gray-600">Vencendo em 30 dias</p>
              </div>
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
                  placeholder="Buscar por empresa ou número do contrato..."
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
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="em-análise">Em Análise</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="vencendo">Vencendo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Períodos</SelectItem>
                  <SelectItem value="30-dias">Vencendo em 30 dias</SelectItem>
                  <SelectItem value="60-dias">Vencendo em 60 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prorrogações Table */}
      <Card className="border border-gray-200">
        <CardHeader className="pt-3 pb-1">
          <CardTitle className="text-xl text-black px-[0px] py-[8px]">Lista de Contratos</CardTitle>
        </CardHeader>
        <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
          <div className="w-full overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 min-w-[140px]">Contrato SCA</TableHead>
                <TableHead className="min-w-[320px]">Objeto</TableHead>
                <TableHead className="min-w-[200px]">Contratada</TableHead>
                <TableHead className="min-w-[160px]">CNPJ/CPF</TableHead>
                <TableHead className="min-w-[140px]">Nº processo</TableHead>
                <TableHead className="min-w-[180px]">Valor contratado anual</TableHead>
                <TableHead className="min-w-[120px]">Início</TableHead>
                <TableHead className="min-w-[120px]">Término</TableHead>
                <TableHead className="min-w-[130px]">Qnt aditivos</TableHead>
                <TableHead className="min-w-[170px]">Prazo total em meses</TableHead>
                <TableHead className="min-w-[180px]">Passível de prorrogar</TableHead>
                <TableHead className="min-w-[160px]">Responsável</TableHead>
                <TableHead className="min-w-[200px]">Status</TableHead>
                <TableHead className="min-w-[150px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProrrogacoes.map((prorrogacao) => (
                <TableRow key={prorrogacao.id}>
                  <TableCell className="text-black sticky left-0 z-10">{prorrogacao.contrato}</TableCell>
                  <TableCell className="text-gray-600">{prorrogacao.objetoContrato}</TableCell>
                  <TableCell className="text-black">{prorrogacao.empresa}</TableCell>
                  <TableCell className="text-gray-600">{prorrogacao.cnpjCpf || '00.000.000/0000-00'}</TableCell>
                  <TableCell className="text-gray-600">{prorrogacao.numeroProcesso || 'N/A'}</TableCell>
                  <TableCell className="text-black">{prorrogacao.valorContratadoAnual || 'R$ 0,00'}</TableCell>
                  <TableCell className="text-gray-600">{prorrogacao.dataInicio}</TableCell>
                  <TableCell className="text-gray-600">{prorrogacao.dataFimOriginal}</TableCell>
                  <TableCell className="text-center text-gray-600">{prorrogacao.quantidadeAditivos || '0'}</TableCell>
                  <TableCell className="text-gray-600">{prorrogacao.prazoProrrogacao}</TableCell>
                  <TableCell>
                    {prorrogacao.passivelProrrogar === true || prorrogacao.passivelProrrogar === 'SIM' ? (
                      <BadgeNew intent="success" weight="light">SIM</BadgeNew>
                    ) : (
                      <BadgeNew intent="warning" weight="light">NÃO</BadgeNew>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">{prorrogacao.responsavel}</TableCell>
                  <TableCell>
                    <BadgeNew {...getBadgeMappingForStatus(prorrogacao.status)}>
                      {prorrogacao.status}
                    </BadgeNew>
                  </TableCell>
                  <TableCell>
                    {prorrogacao.passivelProrrogar && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedContrato(prorrogacao);
                          resetFormularioProrrogacoes();
                          setIsManageModalOpen(true);
                        }}
                        className="text-sm text-[#003366] border-[#003366] hover:bg-[#003366] hover:text-white"
                      >
                        Prorrogar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Gerenciamento de Prorrogações */}
      <Dialog open={isManageModalOpen} onOpenChange={(open) => {
        setIsManageModalOpen(open);
        if (!open) resetFormularioProrrogacoes();
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
          {/* Área scrollável */}
          <div className="flex-1 overflow-y-auto px-6">
            <DialogHeader className="pt-6">
              <DialogTitle>Prorrogações do Contrato</DialogTitle>
              <DialogDescription>
                Contrato {selectedContrato?.contrato} - {selectedContrato?.empresa}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 pb-6">
              {/* Histórico de Prorrogações Existentes */}
              {selectedContrato?.historicoProrrogacoes && selectedContrato.historicoProrrogacoes.length > 0 && (
                <div className="space-y-3 pb-3 border-b">
                  <Label className="text-base">Histórico de Prorrogações</Label>
                  {selectedContrato.historicoProrrogacoes.map((prorrogacao: any, index: number) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <BadgeNew intention="info" weight="medium" size="sm">
                                {prorrogacao.aditivo}
                              </BadgeNew>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <p className="text-xs text-gray-600">Período Prorrogado</p>
                                <p className="text-black mt-1">
                                  {prorrogacao.dataInicio} até {prorrogacao.dataFim}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs text-gray-600">Observações</p>
                              <p className="text-sm text-gray-800 mt-1">{prorrogacao.observacoes}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Adicionar Novas Prorrogações */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Adicionar Prorrogações</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={adicionarProrrogacao}
                  >
                    <Plus size={16} className="mr-1" />
                    Adicionar Prorrogação
                  </Button>
                </div>

                {novasProrrogacoes.map((prorrogacao, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-2.5 relative">
                    {novasProrrogacoes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removerProrrogacao(index)}
                      >
                        <X size={16} />
                      </Button>
                    )}
                    
                    <div className="space-y-1.5">
                      <Label htmlFor={`aditivo-${index}`}>Número do Aditivo</Label>
                      <Input 
                        id={`aditivo-${index}`}
                        placeholder="Ex: 1º Aditivo, 2º Aditivo..." 
                        value={prorrogacao.aditivo}
                        onChange={(e) => handleProrrogacaoChange(index, 'aditivo', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor={`dataInicio-${index}`}>Data de Início</Label>
                        <Input 
                          id={`dataInicio-${index}`}
                          type="date" 
                          value={prorrogacao.dataInicio}
                          onChange={(e) => handleProrrogacaoChange(index, 'dataInicio', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`dataFim-${index}`}>Data de Fim</Label>
                        <Input 
                          id={`dataFim-${index}`}
                          type="date"
                          value={prorrogacao.dataFim}
                          onChange={(e) => handleProrrogacaoChange(index, 'dataFim', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`observacoes-${index}`}>Observações</Label>
                      <Textarea 
                        id={`observacoes-${index}`}
                        placeholder="Justificativa e observações sobre esta prorrogação..." 
                        rows={3}
                        value={prorrogacao.observacoes}
                        onChange={(e) => handleProrrogacaoChange(index, 'observacoes', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer fixo */}
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsManageModalOpen(false);
                resetFormularioProrrogacoes();
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
              onClick={() => {
                setIsManageModalOpen(false);
                resetFormularioProrrogacoes();
              }}
            >
              Salvar Prorrogações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}