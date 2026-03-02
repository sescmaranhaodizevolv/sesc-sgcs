"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeNew } from "@/components/ui/badge-new";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, TrendingUp, Clock, CheckCircle, XCircle, Upload, X, Search, Download, FileText, Paperclip, Trash2 } from "lucide-react";
import { FileInput } from "@/components/ui/file-input";
import { getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTableHead } from "@/components/ui/sortable-table-head";

interface ItemRealinhamento {
  itemId: string;
  descricaoItem: string;
  quantidade: string;
  valorOriginal: string;
  valorSolicitado: string;
  variacao: string;
}

interface AnexoDocumento {
  id: string;
  nome: string;
  tipo: string;
  tamanho: string;
  dataUpload: string;
}

interface RealinhamentoData {
  id: number;
  empresa: string;
  contrato: string;
  item: string;
  descricaoItem: string;
  quantidade: string;
  valorOriginal: string;
  valorSolicitado: string;
  percentual: string;
  status: string;
  dataSolicitacao: string;
  responsavel: string;
  documentoAnexado: boolean;
  nomeDocumento: string | null;
  anexos: AnexoDocumento[];
}

function RealinhamentoPrecos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [empresaFilter, setEmpresaFilter] = useState('todas');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<number | null>(null);
  const [anexosDialogOpen, setAnexosDialogOpen] = useState<number | null>(null);
  
  // Estados para o formulário
  const [itens, setItens] = useState<ItemRealinhamento[]>([
    { itemId: '', descricaoItem: '', quantidade: '', valorOriginal: '', valorSolicitado: '', variacao: '' }
  ]);

  // Dados itemizados - cada linha representa um item específico
  const [realinhamentosItemizados, setRealinhamentosItemizados] = useState<RealinhamentoData[]>([
    {
      id: 1,
      empresa: 'Empresa ABC Ltda',
      contrato: 'C-2024-001',
      item: 'Item 01',
      descricaoItem: 'Serviços de Manutenção Predial',
      quantidade: '12 meses',
      valorOriginal: 'R$ 85.000,00',
      valorSolicitado: 'R$ 98.000,00',
      percentual: '+15,3%',
      status: 'Em Análise',
      dataSolicitacao: '22/01/2024',
      responsavel: 'Maria Silva',
      documentoAnexado: true,
      nomeDocumento: 'justificativa_realinhamento_ABC_item01.pdf',
      anexos: [
        {
          id: '1-1',
          nome: 'justificativa_realinhamento_ABC_item01.pdf',
          tipo: 'PDF',
          tamanho: '2.4 MB',
          dataUpload: '22/01/2024 10:30'
        },
        {
          id: '1-2',
          nome: 'planilha_custos_detalhada.xlsx',
          tipo: 'Excel',
          tamanho: '1.8 MB',
          dataUpload: '22/01/2024 11:15'
        }
      ]
    },
    {
      id: 2,
      empresa: 'Empresa ABC Ltda',
      contrato: 'C-2024-001',
      item: 'Item 02',
      descricaoItem: 'Fornecimento de Material de Limpeza',
      quantidade: '500 unidades',
      valorOriginal: 'R$ 40.000,00',
      valorSolicitado: 'R$ 47.000,00',
      percentual: '+17,5%',
      status: 'Em Análise',
      dataSolicitacao: '22/01/2024',
      responsavel: 'Maria Silva',
      documentoAnexado: true,
      nomeDocumento: 'justificativa_realinhamento_ABC_item02.pdf',
      anexos: [
        {
          id: '2-1',
          nome: 'justificativa_realinhamento_ABC_item02.pdf',
          tipo: 'PDF',
          tamanho: '1.5 MB',
          dataUpload: '22/01/2024 10:45'
        }
      ]
    },
    {
      id: 3,
      empresa: 'Fornecedor XYZ S.A',
      contrato: 'C-2023-089',
      item: 'Item 01',
      descricaoItem: 'Serviços de TI e Suporte Técnico',
      quantidade: '12 meses',
      valorOriginal: 'R$ 89.500,00',
      valorSolicitado: 'R$ 98.000,00',
      percentual: '+9,5%',
      status: 'Aprovado',
      dataSolicitacao: '15/01/2024',
      responsavel: 'João Santos',
      documentoAnexado: true,
      nomeDocumento: 'comprovacao_custos_XYZ_2024.pdf',
      anexos: [
        {
          id: '3-1',
          nome: 'comprovacao_custos_XYZ_2024.pdf',
          tipo: 'PDF',
          tamanho: '3.2 MB',
          dataUpload: '15/01/2024 14:20'
        },
        {
          id: '3-2',
          nome: 'ata_reuniao_negociacao.pdf',
          tipo: 'PDF',
          tamanho: '890 KB',
          dataUpload: '15/01/2024 15:10'
        },
        {
          id: '3-3',
          nome: 'comparativo_mercado.xlsx',
          tipo: 'Excel',
          tamanho: '2.1 MB',
          dataUpload: '15/01/2024 16:00'
        }
      ]
    },
    {
      id: 4,
      empresa: 'Serviços DEF Eireli',
      contrato: 'C-2024-003',
      item: 'Item 01',
      descricaoItem: 'Vigilância e Segurança Patrimonial',
      quantidade: '24 meses',
      valorOriginal: 'R$ 30.200,00',
      valorSolicitado: 'R$ 35.000,00',
      percentual: '+15,9%',
      status: 'Rejeitado',
      dataSolicitacao: '10/01/2024',
      responsavel: 'Ana Costa',
      documentoAnexado: false,
      nomeDocumento: null,
      anexos: []
    },
    {
      id: 5,
      empresa: 'Serviços DEF Eireli',
      contrato: 'C-2024-003',
      item: 'Item 02',
      descricaoItem: 'Monitoramento Eletrônico 24h',
      quantidade: '10 câmeras',
      valorOriginal: 'R$ 15.000,00',
      valorSolicitado: 'R$ 17.000,00',
      percentual: '+13,3%',
      status: 'Rejeitado',
      dataSolicitacao: '10/01/2024',
      responsavel: 'Ana Costa',
      documentoAnexado: false,
      nomeDocumento: null,
      anexos: []
    }
  ]);

  const statusCounts = {
    total: realinhamentosItemizados.length,
    analise: realinhamentosItemizados.filter(r => r.status === 'Em Análise').length,
    aprovado: realinhamentosItemizados.filter(r => r.status === 'Aprovado').length,
    rejeitado: realinhamentosItemizados.filter(r => r.status === 'Rejeitado').length
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'Em Análise':
        return <Clock size={16} className="text-yellow-600" />;
      case 'Rejeitado':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const empresas = realinhamentosItemizados
    .map((r) => r.empresa)
    .filter((empresa, index, array) => array.indexOf(empresa) === index);

  const filteredRealinhamentos = realinhamentosItemizados.filter(realinhamento => {
    const matchesSearch = searchTerm === '' || 
                         realinhamento.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         realinhamento.contrato.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmpresa = empresaFilter === 'todas' || realinhamento.empresa === empresaFilter;
    return matchesSearch && matchesEmpresa;
  });

  const { items: sortedRealinhamentos, requestSort: sortRealinhamentos, sortConfig: configRealinhamentos } = useTableSort(filteredRealinhamentos);

  const parseValor = (valor: string): number => {
    return parseFloat(valor.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
  };

  const calcularVariacao = (original: string, solicitado: string): string => {
    const valorOrig = parseValor(original);
    const valorSolic = parseValor(solicitado);
    
    if (valorOrig > 0 && valorSolic > 0) {
      const percentual = ((valorSolic - valorOrig) / valorOrig) * 100;
      return `${percentual >= 0 ? '+' : ''}${percentual.toFixed(1)}%`;
    }
    return '';
  };

  const handleItemChange = (index: number, field: keyof ItemRealinhamento, value: string) => {
    const novosItens = [...itens];
    novosItens[index][field] = value;
    
    // Calcular variação automaticamente quando valores são alterados
    if (field === 'valorOriginal' || field === 'valorSolicitado') {
      const item = novosItens[index];
      if (item.valorOriginal && item.valorSolicitado) {
        novosItens[index].variacao = calcularVariacao(item.valorOriginal, item.valorSolicitado);
      }
    }
    
    setItens(novosItens);
  };

  const adicionarItem = () => {
    setItens([...itens, { itemId: '', descricaoItem: '', quantidade: '', valorOriginal: '', valorSolicitado: '', variacao: '' }]);
  };

  const removerItem = (index: number) => {
    if (itens.length > 1) {
      const novosItens = itens.filter((_, i) => i !== index);
      setItens(novosItens);
    }
  };

  const resetFormulario = () => {
    setItens([{ itemId: '', descricaoItem: '', quantidade: '', valorOriginal: '', valorSolicitado: '', variacao: '' }]);
  };

  // Funções para manipulação de anexos
  const handleUploadAnexo = (realinhamentoId: number, arquivo: File) => {
    const novoAnexo: AnexoDocumento = {
      id: `${realinhamentoId}-${Date.now()}`,
      nome: arquivo.name,
      tipo: arquivo.name.split('.').pop()?.toUpperCase() || 'FILE',
      tamanho: `${(arquivo.size / 1024 / 1024).toFixed(2)} MB`,
      dataUpload: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setRealinhamentosItemizados(prev =>
      prev.map(item =>
        item.id === realinhamentoId
          ? {
              ...item,
              anexos: [...item.anexos, novoAnexo],
              documentoAnexado: true,
              nomeDocumento: item.nomeDocumento || novoAnexo.nome
            }
          : item
      )
    );

    toast.success(`Documento "${arquivo.name}" anexado com sucesso!`);
    setUploadDialogOpen(null);
  };

  const handleDownloadAnexo = (nomeArquivo: string) => {
    toast.success(`Download iniciado: ${nomeArquivo}`);
  };

  const handleRemoverAnexo = (realinhamentoId: number, anexoId: string) => {
    setRealinhamentosItemizados(prev =>
      prev.map(item => {
        if (item.id === realinhamentoId) {
          const novosAnexos = item.anexos.filter(a => a.id !== anexoId);
          return {
            ...item,
            anexos: novosAnexos,
            documentoAnexado: novosAnexos.length > 0,
            nomeDocumento: novosAnexos.length > 0 ? novosAnexos[0].nome : null
          };
        }
        return item;
      })
    );

    toast.info('Documento removido com sucesso!');
  };

  const getAnexoIcon = (tipo: string) => {
    if (tipo === 'PDF') return <FileText size={16} className="text-red-600" />;
    if (tipo === 'Excel' || tipo === 'XLSX' || tipo === 'XLS') return <FileText size={16} className="text-green-600" />;
    return <FileText size={16} className="text-gray-600" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Realinhamento de Preços</h2>
          <p className="text-gray-600 mt-1">Solicitações e acompanhamento de reajustes contratuais por item</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#003366] hover:bg-[#002244] text-white">
              <Plus size={20} className="mr-2" />
              Registrar Realinhamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
            {/* Área scrollável */}
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Registrar Realinhamento de Preços</DialogTitle>
                <DialogDescription>
                  Registre o realinhamento de preços com os itens do contrato
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4 pb-6">
                {/* Informações Gerais */}
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                {/* Itens do Realinhamento */}
                <div className="space-y-3 border-t pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Itens do Contrato</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={adicionarItem}
                    >
                      <Plus size={16} className="mr-1" />
                      Adicionar Item
                    </Button>
                  </div>

                  {itens.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-2.5 relative">
                      {itens.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removerItem(index)}
                        >
                          <X size={16} />
                        </Button>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`item-${index}`}>Número do Item</Label>
                          <Input 
                            id={`item-${index}`}
                            placeholder="Ex: Item 01" 
                            value={item.itemId}
                            onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`descricao-${index}`}>Descrição do Item</Label>
                          <Input 
                            id={`descricao-${index}`}
                            placeholder="Ex: Serviços de Manutenção" 
                            value={item.descricaoItem}
                            onChange={(e) => handleItemChange(index, 'descricaoItem', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor={`quantidade-${index}`}>Quantidade</Label>
                        <Input 
                          id={`quantidade-${index}`}
                          placeholder="Ex: 12 meses, 500 unidades" 
                          value={item.quantidade}
                          onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`valorOriginal-${index}`}>Valor Original</Label>
                          <Input 
                            id={`valorOriginal-${index}`}
                            placeholder="R$ 0,00" 
                            value={item.valorOriginal}
                            onChange={(e) => handleItemChange(index, 'valorOriginal', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`valorSolicitado-${index}`}>Valor Solicitado</Label>
                          <Input 
                            id={`valorSolicitado-${index}`}
                            placeholder="R$ 0,00"
                            value={item.valorSolicitado}
                            onChange={(e) => handleItemChange(index, 'valorSolicitado', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Variação (%)</Label>
                          <div className="h-10 flex items-center px-3 border border-gray-300 rounded-md bg-gray-50">
                            {item.variacao && (
                              <div className="flex items-center gap-1">
                                <TrendingUp size={16} className={item.variacao.startsWith('+') ? "text-red-500" : "text-green-500"} />
                                <span className={item.variacao.startsWith('+') ? 'text-red-600' : 'text-green-600'}>
                                  {item.variacao}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Justificativa */}
                <div className="space-y-1.5">
                  <Label htmlFor="justificativa">Justificativa do Realinhamento</Label>
                  <Textarea 
                    id="justificativa"
                    placeholder="Justifique a necessidade do realinhamento de preços..." 
                    rows={3} 
                  />
                </div>

                {/* Upload de Arquivo */}
                <div className="space-y-1.5">
                  <Label htmlFor="arquivo">Ofício Escaneado (Documento de Solicitação)</Label>
                  <FileInput 
                    id="arquivo"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">Formatos aceitos: PDF, DOC, DOCX, JPG, PNG</p>
                </div>
              </div>
            </div>

            {/* Footer fixo */}
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetFormulario();
                }}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetFormulario();
                }}
              >
                Registrar Realinhamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-black">{statusCounts.total}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Total de Itens</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#d08700]">{statusCounts.analise}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Em Análise</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#22c55e]">{statusCounts.aprovado}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Aprovados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#e7000b]">{statusCounts.rejeitado}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Rejeitados</p>
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
                  placeholder="Buscar por empresa ou processo/contrato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Empresas</SelectItem>
                  {empresas.map(empresa => (
                    <SelectItem key={empresa} value={empresa}>{empresa}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Realinhamentos Table - Itemizada */}
      <Card className="border border-gray-200">
        <CardHeader className="pt-3 pb-1">
          <CardTitle className="text-xl text-black px-[0px] py-[8px]">Histórico de Realinhamentos por Item</CardTitle>
        </CardHeader>
        <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    label="Empresa"
                    onClick={() => sortRealinhamentos('empresa')}
                    currentDirection={configRealinhamentos?.key === 'empresa' ? configRealinhamentos.direction : null}
                    className="sticky left-0 z-10 min-w-[200px] bg-white"
                  />
                  <SortableTableHead
                    label="Contrato"
                    onClick={() => sortRealinhamentos('contrato')}
                    currentDirection={configRealinhamentos?.key === 'contrato' ? configRealinhamentos.direction : null}
                    className="min-w-[120px]"
                  />
                  <SortableTableHead
                    label="Item"
                    onClick={() => sortRealinhamentos('item')}
                    currentDirection={configRealinhamentos?.key === 'item' ? configRealinhamentos.direction : null}
                    className="min-w-[100px]"
                  />
                  <SortableTableHead
                    label="Descrição do Item"
                    onClick={() => sortRealinhamentos('descricaoItem')}
                    currentDirection={configRealinhamentos?.key === 'descricaoItem' ? configRealinhamentos.direction : null}
                    className="min-w-[250px]"
                  />
                  <SortableTableHead
                    label="Quantidade"
                    onClick={() => sortRealinhamentos('quantidade')}
                    currentDirection={configRealinhamentos?.key === 'quantidade' ? configRealinhamentos.direction : null}
                    className="min-w-[140px]"
                  />
                  <SortableTableHead
                    label="Valor Original"
                    onClick={() => sortRealinhamentos('valorOriginal')}
                    currentDirection={configRealinhamentos?.key === 'valorOriginal' ? configRealinhamentos.direction : null}
                    className="min-w-[140px]"
                  />
                  <SortableTableHead
                    label="Valor Solicitado"
                    onClick={() => sortRealinhamentos('valorSolicitado')}
                    currentDirection={configRealinhamentos?.key === 'valorSolicitado' ? configRealinhamentos.direction : null}
                    className="min-w-[140px]"
                  />
                  <TableHead className="min-w-[100px]">Variação</TableHead>
                  <SortableTableHead
                    label="Status"
                    onClick={() => sortRealinhamentos('status')}
                    currentDirection={configRealinhamentos?.key === 'status' ? configRealinhamentos.direction : null}
                    className="min-w-[140px]"
                  />
                  <SortableTableHead
                    label="Data"
                    onClick={() => sortRealinhamentos('dataSolicitacao')}
                    currentDirection={configRealinhamentos?.key === 'dataSolicitacao' ? configRealinhamentos.direction : null}
                    className="min-w-[120px]"
                  />
                  <TableHead className="min-w-[140px]">Anexo</TableHead>
                  <SortableTableHead
                    label="Responsável"
                    onClick={() => sortRealinhamentos('responsavel')}
                    currentDirection={configRealinhamentos?.key === 'responsavel' ? configRealinhamentos.direction : null}
                    className="min-w-[160px]"
                  />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRealinhamentos.map((realinhamento) => (
                  <TableRow key={realinhamento.id}>
                    <TableCell className="text-black sticky left-0 z-10 bg-white">{realinhamento.empresa}</TableCell>
                    <TableCell className="text-black">{realinhamento.contrato}</TableCell>
                    <TableCell className="text-black">{realinhamento.item}</TableCell>
                    <TableCell className="text-gray-600">{realinhamento.descricaoItem}</TableCell>
                    <TableCell className="text-gray-600">{realinhamento.quantidade}</TableCell>
                    <TableCell className="text-gray-600">{realinhamento.valorOriginal}</TableCell>
                    <TableCell className="text-black">{realinhamento.valorSolicitado}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={16} className="text-red-500" />
                        <span className="text-red-600">{realinhamento.percentual}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <BadgeNew {...getBadgeMappingForStatus(realinhamento.status)}>
                        {realinhamento.status}
                      </BadgeNew>
                    </TableCell>
                    <TableCell className="text-gray-600">{realinhamento.dataSolicitacao}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Paperclip size={16} />
                            {realinhamento.anexos.length > 0 ? (
                              <span>{realinhamento.anexos.length} {realinhamento.anexos.length === 1 ? 'arquivo' : 'arquivos'}</span>
                            ) : (
                              <span>Gerenciar</span>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                          <div className="px-2 py-1.5">
                            <p className="text-sm font-semibold text-black">Documentos Anexados</p>
                            <p className="text-xs text-gray-500">Gerencie os anexos deste realinhamento</p>
                          </div>
                          <DropdownMenuSeparator />
                          
                          {/* Upload de novo arquivo */}
                          <div className="px-2 py-2">
                            <label className="cursor-pointer">
                              <div className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 transition-colors">
                                <Upload size={16} className="text-blue-600" />
                                <span className="text-sm text-blue-600">Anexar novo documento</span>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleUploadAnexo(realinhamento.id, file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                          
                          <DropdownMenuSeparator />
                          
                          {/* Lista de anexos existentes */}
                          {realinhamento.anexos.length > 0 ? (
                            <div className="max-h-64 overflow-y-auto">
                              {realinhamento.anexos.map((anexo) => (
                                <div key={anexo.id} className="px-2 py-2">
                                  <div className="flex items-start gap-2 p-2 rounded hover:bg-gray-50">
                                    <div className="flex-shrink-0 mt-0.5">
                                      {getAnexoIcon(anexo.tipo)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-black truncate">{anexo.nome}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-500">{anexo.tamanho}</span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500">{anexo.dataUpload}</span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                                          onClick={() => handleDownloadAnexo(anexo.nome)}
                                        >
                                          <Download size={14} className="mr-1" />
                                          Baixar
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                                          onClick={() => handleRemoverAnexo(realinhamento.id, anexo.id)}
                                        >
                                          <Trash2 size={14} className="mr-1" />
                                          Remover
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-6 text-center">
                              <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                              <p className="text-sm text-gray-500">Nenhum documento anexado</p>
                              <p className="text-xs text-gray-400 mt-1">Use o botão acima para anexar</p>
                            </div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-gray-600">{realinhamento.responsavel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default function Page() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <RealinhamentoPrecos />
    </div>
  );
}
