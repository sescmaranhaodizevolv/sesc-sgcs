import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BadgeNew } from '../ui/badge-new';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Search, Edit, Calendar, Info, FileText } from 'lucide-react';
import { getBadgeMappingForStatus } from '../../lib/badge-mappings';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';

interface Contrato {
  id: string;
  numeroProcesso: string;
  objeto: string;
  fornecedor: string;
  dataInicio: string;
  dataFim: string;
  valor: string;
  status: string;
  gestorTRP: string;
  observacoes?: string;
}

export function GestaoContratos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isNovoContratoModalOpen, setIsNovoContratoModalOpen] = useState(false);
  const [isEditarDatasModalOpen, setIsEditarDatasModalOpen] = useState(false);
  const [contratoSelecionado, setContratoSelecionado] = useState<Contrato | null>(null);

  // Dados de contratos (normalmente viriam do backend)
  const [contratos, setContratos] = useState<Contrato[]>([
    {
      id: 'CONT-2024-001',
      numeroProcesso: 'PROC-2024-015',
      objeto: 'Serviços de Limpeza e Conservação',
      fornecedor: 'Empresa ABC Ltda',
      dataInicio: '01/01/2024',
      dataFim: '31/12/2024',
      valor: 'R$ 145.000,00',
      status: 'Vigente',
      gestorTRP: 'Paula Mendes'
    },
    {
      id: 'CONT-2024-002',
      numeroProcesso: 'PROC-2024-022',
      objeto: 'Fornecimento de Material de Escritório',
      fornecedor: 'Fornecedor XYZ S.A',
      dataInicio: '15/02/2024',
      dataFim: '14/02/2025',
      valor: 'R$ 89.500,00',
      status: 'Vigente',
      gestorTRP: 'Ana Costa'
    },
    {
      id: 'CONT-2024-003',
      numeroProcesso: 'PROC-2024-033',
      objeto: 'Manutenção de Ar-Condicionado',
      fornecedor: 'Serviços DEF Eireli',
      dataInicio: '01/03/2024',
      dataFim: '28/02/2025',
      valor: 'R$ 67.200,00',
      status: 'Vigente',
      gestorTRP: 'Roberto Lima'
    },
    {
      id: 'CONT-2024-004',
      numeroProcesso: 'PROC-2024-045',
      objeto: 'Sistema de Gestão Integrada',
      fornecedor: 'Tecnologia GHI Ltda',
      dataInicio: '',
      dataFim: '',
      valor: 'R$ 250.000,00',
      status: 'Aguardando Datas',
      gestorTRP: 'Carlos Oliveira',
      observacoes: 'Contrato aprovado, pendente de registro de datas'
    },
    {
      id: 'CONT-2024-005',
      numeroProcesso: 'PROC-2024-051',
      objeto: 'Vigilância e Segurança Patrimonial',
      fornecedor: 'Segurança KLM Corp',
      dataInicio: '',
      dataFim: '',
      valor: 'R$ 198.300,00',
      status: 'Aguardando Datas',
      gestorTRP: 'Maria Silva',
      observacoes: 'Aguardando confirmação de início de prestação de serviços'
    },
    {
      id: 'CONT-2023-089',
      numeroProcesso: 'PROC-2023-145',
      objeto: 'Serviços de TI e Suporte Técnico',
      fornecedor: 'TI e Telecom QRS S.A',
      dataInicio: '01/06/2023',
      dataFim: '31/05/2024',
      valor: 'R$ 312.000,00',
      status: 'Encerrado',
      gestorTRP: 'João Santos'
    }
  ]);

  const statusCounts = {
    total: contratos.length,
    vigente: contratos.filter(c => c.status === 'Vigente').length,
    aguardando: contratos.filter(c => c.status === 'Aguardando Datas').length,
    encerrado: contratos.filter(c => c.status === 'Encerrado').length
  };

  const filteredContratos = contratos.filter(contrato => {
    const matchesSearch = searchTerm === '' ||
      contrato.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.numeroProcesso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || contrato.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSalvarDatas = (contratoId: string, dataInicio: string, dataFim: string) => {
    setContratos(prev =>
      prev.map(c =>
        c.id === contratoId
          ? {
              ...c,
              dataInicio,
              dataFim,
              status: 'Vigente'
            }
          : c
      )
    );
    toast.success('Datas do contrato atualizadas com sucesso!');
    setIsEditarDatasModalOpen(false);
    setContratoSelecionado(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Gestão de Contratos</h2>
          <p className="text-gray-600 mt-1">Cadastro manual de datas de vigência contratual (substituição do sistema legado)</p>
        </div>
        <Dialog open={isNovoContratoModalOpen} onOpenChange={setIsNovoContratoModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#003366] hover:bg-[#002244] text-white">
              <Plus size={20} className="mr-2" />
              Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Cadastrar Novo Contrato</DialogTitle>
                <DialogDescription>
                  Registre um novo contrato com suas respectivas datas de vigência
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 pb-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    Estas informações substituem o fluxo automático do sistema legado. As datas registradas serão usadas para controle de vigência e alertas.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cont-id">Número do Contrato *</Label>
                    <Input 
                      id="cont-id" 
                      placeholder="CONT-2024-006" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cont-processo">Número do Processo *</Label>
                    <Input 
                      id="cont-processo" 
                      placeholder="PROC-2024-XXX" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cont-objeto">Objeto do Contrato *</Label>
                  <Textarea 
                    id="cont-objeto" 
                    placeholder="Descreva o objeto do contrato..."
                    rows={2}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cont-fornecedor">Fornecedor/Contratada *</Label>
                  <Input 
                    id="cont-fornecedor" 
                    placeholder="Razão Social da empresa" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cont-data-inicio">Data de Início *</Label>
                    <Input 
                      id="cont-data-inicio" 
                      type="date"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cont-data-fim">Data de Término *</Label>
                    <Input 
                      id="cont-data-fim" 
                      type="date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cont-valor">Valor Total</Label>
                    <Input 
                      id="cont-valor" 
                      placeholder="R$ 0,00" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cont-gestor">Gestor TRP *</Label>
                    <Select>
                      <SelectTrigger id="cont-gestor">
                        <SelectValue placeholder="Selecione o gestor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paula">Paula Mendes</SelectItem>
                        <SelectItem value="ana">Ana Costa</SelectItem>
                        <SelectItem value="roberto">Roberto Lima</SelectItem>
                        <SelectItem value="carlos">Carlos Oliveira</SelectItem>
                        <SelectItem value="maria">Maria Silva</SelectItem>
                        <SelectItem value="joao">João Santos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cont-observacoes">Observações</Label>
                  <Textarea 
                    id="cont-observacoes" 
                    placeholder="Informações adicionais sobre o contrato..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => setIsNovoContratoModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => {
                  toast.success('Contrato cadastrado com sucesso!');
                  setIsNovoContratoModalOpen(false);
                }}
              >
                Cadastrar Contrato
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-black">{statusCounts.total}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Total de Contratos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#00bc7d]">{statusCounts.vigente}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Vigentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#d08700]">{statusCounts.aguardando}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Aguardando Datas</p>
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
      </div>

      {/* Filters */}
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por contrato, processo, objeto ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="Vigente">Vigente</SelectItem>
                  <SelectItem value="Aguardando Datas">Aguardando Datas</SelectItem>
                  <SelectItem value="Encerrado">Encerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contratos Table */}
      <Card className="border border-gray-200">
        <CardHeader className="pt-3 pb-1">
          <CardTitle className="text-xl text-black px-[0px] py-[8px]">Contratos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 min-w-[140px]">Nº Contrato</TableHead>
                  <TableHead className="min-w-[140px]">Nº Processo</TableHead>
                  <TableHead className="min-w-[300px]">Objeto</TableHead>
                  <TableHead className="min-w-[200px]">Fornecedor</TableHead>
                  <TableHead className="min-w-[140px]">Data Início</TableHead>
                  <TableHead className="min-w-[140px]">Data Fim</TableHead>
                  <TableHead className="min-w-[140px]">Valor</TableHead>
                  <TableHead className="min-w-[140px]">Status</TableHead>
                  <TableHead className="min-w-[160px]">Gestor TRP</TableHead>
                  <TableHead className="min-w-[140px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContratos.map((contrato) => (
                  <TableRow key={contrato.id}>
                    <TableCell className="text-black sticky left-0 z-10">{contrato.id}</TableCell>
                    <TableCell className="text-gray-600">{contrato.numeroProcesso}</TableCell>
                    <TableCell className="text-gray-600">{contrato.objeto}</TableCell>
                    <TableCell className="text-gray-600">{contrato.fornecedor}</TableCell>
                    <TableCell className="text-gray-600">
                      {contrato.dataInicio || <span className="text-red-500">Não informada</span>}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {contrato.dataFim || <span className="text-red-500">Não informada</span>}
                    </TableCell>
                    <TableCell className="text-black">{contrato.valor}</TableCell>
                    <TableCell>
                      <BadgeNew {...getBadgeMappingForStatus(contrato.status)}>
                        {contrato.status}
                      </BadgeNew>
                    </TableCell>
                    <TableCell className="text-gray-600">{contrato.gestorTRP}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {contrato.status === 'Aguardando Datas' ? (
                          <Button
                            size="sm"
                            className="bg-[#003366] hover:bg-[#002244] text-white"
                            onClick={() => {
                              setContratoSelecionado(contrato);
                              setIsEditarDatasModalOpen(true);
                            }}
                          >
                            <Calendar size={16} className="mr-2" />
                            Definir Datas
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setContratoSelecionado(contrato);
                              setIsEditarDatasModalOpen(true);
                            }}
                          >
                            <Edit size={16} className="mr-2" />
                            Editar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Editar/Definir Datas */}
      {contratoSelecionado && (
        <Dialog open={isEditarDatasModalOpen} onOpenChange={setIsEditarDatasModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {contratoSelecionado.status === 'Aguardando Datas' ? 'Definir Datas do Contrato' : 'Editar Datas do Contrato'}
              </DialogTitle>
              <DialogDescription>
                Atualize as datas de início e término do contrato para controle de vigência
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert className="bg-yellow-50 border-yellow-200">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-sm text-yellow-800">
                  Estas datas são essenciais para alertas de vencimento e gestão de prorrogações. Certifique-se de que estão corretas.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm"><span className="text-black">Contrato:</span> <span className="text-gray-600">{contratoSelecionado.id}</span></p>
                <p className="text-sm"><span className="text-black">Processo:</span> <span className="text-gray-600">{contratoSelecionado.numeroProcesso}</span></p>
                <p className="text-sm"><span className="text-black">Objeto:</span> <span className="text-gray-600">{contratoSelecionado.objeto}</span></p>
                <p className="text-sm"><span className="text-black">Fornecedor:</span> <span className="text-gray-600">{contratoSelecionado.fornecedor}</span></p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-data-inicio">Data de Início *</Label>
                  <Input 
                    id="edit-data-inicio" 
                    type="date"
                    defaultValue={contratoSelecionado.dataInicio ? 
                      contratoSelecionado.dataInicio.split('/').reverse().join('-') : ''
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-data-fim">Data de Término *</Label>
                  <Input 
                    id="edit-data-fim" 
                    type="date"
                    defaultValue={contratoSelecionado.dataFim ? 
                      contratoSelecionado.dataFim.split('/').reverse().join('-') : ''
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-observacoes">Observações</Label>
                <Textarea 
                  id="edit-observacoes" 
                  placeholder="Informações sobre as datas definidas..."
                  rows={2}
                  defaultValue={contratoSelecionado.observacoes}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsEditarDatasModalOpen(false);
                  setContratoSelecionado(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                className="bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => {
                  const dataInicio = (document.getElementById('edit-data-inicio') as HTMLInputElement).value;
                  const dataFim = (document.getElementById('edit-data-fim') as HTMLInputElement).value;
                  
                  if (dataInicio && dataFim) {
                    const dataInicioFormatada = new Date(dataInicio).toLocaleDateString('pt-BR');
                    const dataFimFormatada = new Date(dataFim).toLocaleDateString('pt-BR');
                    handleSalvarDatas(contratoSelecionado.id, dataInicioFormatada, dataFimFormatada);
                  } else {
                    toast.error('Por favor, preencha ambas as datas');
                  }
                }}
              >
                Salvar Datas
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
