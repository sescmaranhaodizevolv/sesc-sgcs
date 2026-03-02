"use client";
import { FormEvent, useState } from "react";
import { Building2, ArrowLeft, Save, AlertCircle, Plus, Search, FileText, Upload, Eye, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeNew } from "@/components/ui/badge-new";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileInput } from "@/components/ui/file-input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTableHead } from "@/components/ui/sortable-table-head";

type FornecedorStatus = 'Ativo' | 'Inativo';

interface Fornecedor {
  id: number;
  nome: string;
  cnpj: string;
  tipo: string;
  categoria: string;
  status: FornecedorStatus;
  dataRegistro: string;
  contatos: string;
  atestados: number;
}

const StatusBadge = ({ status }: { status: FornecedorStatus | 'Válido' | 'Vencido' }) => {
  const mappings = {
    'Ativo': { intent: 'success' as const, weight: 'light' as const },
    'Inativo': { intent: 'neutral' as const, weight: 'light' as const },
    'Válido': { intent: 'success' as const, weight: 'light' as const },
    'Vencido': { intent: 'danger' as const, weight: 'light' as const }
  };

  const mapping = mappings[status] || { intent: 'neutral' as const, weight: 'light' as const };

  return (
    <BadgeNew {...mapping}>
      {status}
    </BadgeNew>
  );
};

function ContratosEFornecedores() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [categoriaFilter, setCategoriaFilter] = useState('todas');
  const [selectedAtestado, setSelectedAtestado] = useState<typeof atestados[0] | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('fornecedores');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    type: 'desativar' | 'ativar' | null;
    fornecedor: Fornecedor | null;
  }>({ open: false, type: null, fornecedor: null });

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([
    {
      id: 1,
      nome: 'Empresa ABC Ltda',
      cnpj: '12.345.678/0001-90',
      tipo: 'Pessoa Jurídica',
      categoria: 'Serviços',
      status: 'Ativo',
      dataRegistro: '15/01/2024',
      contatos: 'contato@empresaabc.com',
      atestados: 3
    },
    {
      id: 2,
      nome: 'Fornecedor XYZ S.A',
      cnpj: '98.765.432/0001-10',
      tipo: 'Pessoa Jurídica',
      categoria: 'Produtos',
      status: 'Ativo',
      dataRegistro: '20/12/2023',
      contatos: 'comercial@fornecedorxyz.com',
      atestados: 5
    },
    {
      id: 3,
      nome: 'Serviços DEF Eireli',
      cnpj: '11.222.333/0001-44',
      tipo: 'Pessoa Jurídica',
      categoria: 'Serviços',
      status: 'Inativo',
      dataRegistro: '05/11/2023',
      contatos: 'def@servicosdef.com.br',
      atestados: 2
    },
    {
      id: 4,
      nome: 'Tecnologia GHI Ltda',
      cnpj: '55.444.333/0001-22',
      tipo: 'Pessoa Jurídica',
      categoria: 'Tecnologia',
      status: 'Ativo',
      dataRegistro: '10/10/2023',
      contatos: 'vendas@techghi.com',
      atestados: 4
    },
    {
      id: 5,
      nome: 'Soluções PQR Eireli',
      cnpj: '44.555.666/0001-77',
      tipo: 'Pessoa Jurídica',
      categoria: 'Tecnologia',
      status: 'Ativo',
      dataRegistro: '22/07/2023',
      contatos: 'contato@pqr.com',
      atestados: 6
    },
    {
      id: 6,
      nome: 'Produtos STU Ltda',
      cnpj: '55.666.777/0001-88',
      tipo: 'Pessoa Jurídica',
      categoria: 'Produtos',
      status: 'Inativo',
      dataRegistro: '10/06/2023',
      contatos: 'stu@produtos.com.br',
      atestados: 2
    }
  ]);

  const atestados = [
    {
      id: 1,
      fornecedor: 'Empresa ABC Ltda',
      processo: '2024-001',
      tipoAtestado: 'Capacidade Técnica',
      dataEmissao: '15/01/2024',
      validade: '15/01/2025',
      status: 'Válido',
      arquivo: 'atestado_abc_001.pdf',
      responsavel: 'Maria Silva'
    },
    {
      id: 2,
      fornecedor: 'Fornecedor XYZ S.A',
      processo: '2023-089',
      tipoAtestado: 'Capacidade Técnica',
      dataEmissao: '20/12/2023',
      validade: '20/12/2024',
      status: 'Válido',
      arquivo: 'atestado_xyz_089.pdf',
      responsavel: 'João Santos'
    },
    {
      id: 3,
      fornecedor: 'Tecnologia GHI Ltda',
      processo: '2024-004',
      tipoAtestado: 'Capacidade Técnica',
      dataEmissao: '10/10/2023',
      validade: '10/10/2024',
      status: 'Vencido',
      arquivo: 'atestado_ghi_004.pdf',
      responsavel: 'Ana Costa'
    }
  ];

  const { items: sortedAtestados, requestSort: sortAtestados, sortConfig: configAtestados } = useTableSort(atestados);

  const filteredFornecedores = fornecedores.filter(fornecedor => {
    const matchesSearch = fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fornecedor.cnpj.includes(searchTerm);
    const matchesStatus = statusFilter === 'todos' || fornecedor.status.toLowerCase() === statusFilter;
    const matchesCategoria = categoriaFilter === 'todas' || fornecedor.categoria === categoriaFilter;
    return matchesSearch && matchesStatus && matchesCategoria;
  });

  const { items: sortedFornecedores, requestSort: sortFornecedores, sortConfig: configFornecedores } = useTableSort(filteredFornecedores);

  const totalPages = Math.ceil(sortedFornecedores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFornecedores = sortedFornecedores.slice(startIndex, endIndex);

  const fornecedorStats = {
    total: fornecedores.length,
    ativos: fornecedores.filter(f => f.status === 'Ativo').length,
    inativos: fornecedores.filter(f => f.status === 'Inativo').length,
    atestadosValidos: atestados.filter(a => a.status === 'Válido').length
  };

  const handleViewAtestado = (atestado: typeof atestados[0]) => {
    setSelectedAtestado(atestado);
    setIsViewerOpen(true);
  };

  const handleDownloadAtestado = (atestado: typeof atestados[0]) => {
    toast.success('Download iniciado', {
      description: `Baixando arquivo: ${atestado.arquivo}`
    });
  };

  const openConfirmDialog = (type: 'desativar' | 'ativar', fornecedor: Fornecedor) => {
    setConfirmAction({ open: true, type, fornecedor });
  };

  const closeConfirmDialog = () => {
    setConfirmAction({ open: false, type: null, fornecedor: null });
  };

  const executeAction = () => {
    if (!confirmAction.fornecedor || !confirmAction.type) return;

    const fornecedorId = confirmAction.fornecedor.id;
    let novoStatus: FornecedorStatus;
    let mensagem = '';

    switch (confirmAction.type) {
      case 'desativar':
        novoStatus = 'Inativo';
        mensagem = 'Fornecedor desativado com sucesso. Ele não poderá mais participar de novos processos.';
        break;
      case 'ativar':
        novoStatus = 'Ativo';
        mensagem = 'Fornecedor ativado com sucesso. Ele pode participar de processos novamente.';
        break;
    }

    setFornecedores(prevFornecedores =>
      prevFornecedores.map(fornecedor =>
        fornecedor.id === fornecedorId
          ? { ...fornecedor, status: novoStatus }
          : fornecedor
      )
    );

    toast.success('Ação executada!', {
      description: mensagem
    });

    closeConfirmDialog();
  };

  const getActionDescription = () => {
    if (!confirmAction.type || !confirmAction.fornecedor) return '';

    const descriptions = {
      'desativar': 'O fornecedor será marcado como Inativo e não poderá mais participar de novos processos de compra. Seus atestados e histórico serão preservados.',
      'ativar': 'O fornecedor será marcado como Ativo e poderá participar de processos de compra novamente. Certifique-se de que a documentação está atualizada.'
    };

    return descriptions[confirmAction.type];
  };

  const getActionTitle = () => {
    if (!confirmAction.type) return '';

    const titles = {
      'desativar': 'Confirmar Desativação',
      'ativar': 'Confirmar Ativação'
    };

    return titles[confirmAction.type];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Fornecedores e Atestados</h2>
          <p className="text-gray-600 mt-1">Cadastro, listagem e gestão de fornecedores e atestados</p>
        </div>
        {activeTab === 'fornecedores' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                <Plus size={20} className="mr-2" />
                Cadastrar Fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Fornecedor</DialogTitle>
                <DialogDescription>
                  Preencha os dados para cadastrar um novo fornecedor no sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Nome/Razão Social</Label>
                  <Input placeholder="Nome da empresa" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input placeholder="00.000.000/0000-00" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="produtos">Produtos</SelectItem>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="construcao">Construção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contato">E-mail de Contato</Label>
                  <Input placeholder="contato@empresa.com" type="email" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                  <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white">
                    Cadastrar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="fornecedores" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-2">
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          <TabsTrigger value="atestados">Atestados de Capacidade Técnica</TabsTrigger>
        </TabsList>

        <TabsContent value="fornecedores" className="space-y-4 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl text-black">{fornecedorStats.total}</p>
                    <p className="text-sm text-gray-600">Total de Fornecedores</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Building2 size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl text-green-600">{fornecedorStats.ativos}</p>
                    <p className="text-sm text-gray-600">Fornecedores Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Building2 size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-2xl text-gray-600">{fornecedorStats.inativos}</p>
                    <p className="text-sm text-gray-600">Fornecedores Inativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl text-green-600">{fornecedorStats.atestadosValidos}</p>
                    <p className="text-sm text-gray-600">Atestados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome ou CNPJ..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-48">
                  <Select value={categoriaFilter} onValueChange={(value) => {
                    setCategoriaFilter(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Categorias</SelectItem>
                      <SelectItem value="Serviços">Serviços</SelectItem>
                      <SelectItem value="Produtos">Produtos</SelectItem>
                      <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="Construção">Construção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-black px-[0px] py-[8px]">Cadastro e Listagem de Fornecedores</CardTitle>
                <p className="text-sm text-gray-600">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, filteredFornecedores.length)} de {filteredFornecedores.length} fornecedores
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead
                        label="Nome/Razão Social"
                        onClick={() => sortFornecedores('nome')}
                        currentDirection={configFornecedores?.key === 'nome' ? configFornecedores.direction : null}
                        className="sticky left-0 z-10 min-w-[250px] bg-white"
                      />
                      <SortableTableHead
                        label="CNPJ"
                        onClick={() => sortFornecedores('cnpj')}
                        currentDirection={configFornecedores?.key === 'cnpj' ? configFornecedores.direction : null}
                        className="min-w-[160px]"
                      />
                      <SortableTableHead
                        label="Categoria"
                        onClick={() => sortFornecedores('categoria')}
                        currentDirection={configFornecedores?.key === 'categoria' ? configFornecedores.direction : null}
                        className="min-w-[180px]"
                      />
                      <SortableTableHead
                        label="Status"
                        onClick={() => sortFornecedores('status')}
                        currentDirection={configFornecedores?.key === 'status' ? configFornecedores.direction : null}
                        className="min-w-[180px]"
                      />
                      <SortableTableHead
                        label="Data Registro"
                        onClick={() => sortFornecedores('dataRegistro')}
                        currentDirection={configFornecedores?.key === 'dataRegistro' ? configFornecedores.direction : null}
                        className="min-w-[140px]"
                      />
                      <SortableTableHead
                        label="Atestados"
                        onClick={() => sortFornecedores('atestados')}
                        currentDirection={configFornecedores?.key === 'atestados' ? configFornecedores.direction : null}
                        className="min-w-[120px]"
                      />
                      <TableHead className="min-w-[160px]">Contato</TableHead>
                      <TableHead className="min-w-[150px] text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFornecedores.length > 0 ? (
                      paginatedFornecedores.map((fornecedor) => (
                        <TableRow key={fornecedor.id}>
                          <TableCell className="text-black sticky left-0 z-10 bg-white">{fornecedor.nome}</TableCell>
                          <TableCell className="text-gray-600">{fornecedor.cnpj}</TableCell>
                          <TableCell className="text-gray-600">{fornecedor.categoria}</TableCell>
                          <TableCell>
                            <StatusBadge status={fornecedor.status} />
                          </TableCell>
                          <TableCell className="text-gray-600">{fornecedor.dataRegistro}</TableCell>
                          <TableCell className="text-center">
                            <span className="text-blue-600">{fornecedor.atestados}</span>
                          </TableCell>
                          <TableCell className="text-gray-600">{fornecedor.contatos}</TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              {fornecedor.status === 'Ativo' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openConfirmDialog('desativar', fornecedor)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                  title="Desativar fornecedor"
                                >
                                  Desativar
                                </Button>
                              )}
                              {fornecedor.status === 'Inativo' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openConfirmDialog('ativar', fornecedor)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                  title="Ativar fornecedor"
                                >
                                  Ativar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                          Nenhum fornecedor encontrado com os filtros aplicados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atestados" className="space-y-4 mt-8">
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl text-black">Upload de Atestados de Capacidade Técnica</h3>
                  <p className="text-sm text-gray-600 mt-1">Consulta vinculada aos processos</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                      <Upload size={20} className="mr-2" />
                      Upload Atestado
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload de Atestado</DialogTitle>
                      <DialogDescription>
                        Faça o upload do atestado de capacidade técnica do fornecedor.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="fornecedor">Fornecedor</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o fornecedor" />
                          </SelectTrigger>
                          <SelectContent>
                            {fornecedores
                              .filter(f => f.status === 'Ativo')
                              .map(fornecedor => (
                                <SelectItem key={fornecedor.id} value={fornecedor.nome}>
                                  {fornecedor.nome}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="processo">Processo Vinculado</Label>
                        <Input placeholder="Ex: 2024-001" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="arquivo">Arquivo do Atestado</Label>
                        <FileInput id="arquivo" accept=".pdf,.doc,.docx" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          Cancelar
                        </Button>
                        <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white">
                          Fazer Upload
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black px-[0px] py-[8px]">Atestados Cadastrados</CardTitle>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead
                        label="Fornecedor"
                        onClick={() => sortAtestados('fornecedor')}
                        currentDirection={configAtestados?.key === 'fornecedor' ? configAtestados.direction : null}
                        className="sticky left-0 z-10 min-w-[200px] bg-white"
                      />
                      <SortableTableHead
                        label="Processo"
                        onClick={() => sortAtestados('processo')}
                        currentDirection={configAtestados?.key === 'processo' ? configAtestados.direction : null}
                        className="min-w-[120px]"
                      />
                      <SortableTableHead
                        label="Tipo"
                        onClick={() => sortAtestados('tipoAtestado')}
                        currentDirection={configAtestados?.key === 'tipoAtestado' ? configAtestados.direction : null}
                        className="min-w-[180px]"
                      />
                      <SortableTableHead
                        label="Data Emissão"
                        onClick={() => sortAtestados('dataEmissao')}
                        currentDirection={configAtestados?.key === 'dataEmissao' ? configAtestados.direction : null}
                        className="min-w-[140px]"
                      />
                      <SortableTableHead
                        label="Status"
                        onClick={() => sortAtestados('status')}
                        currentDirection={configAtestados?.key === 'status' ? configAtestados.direction : null}
                        className="min-w-[120px]"
                      />
                      <SortableTableHead
                        label="Responsável"
                        onClick={() => sortAtestados('responsavel')}
                        currentDirection={configAtestados?.key === 'responsavel' ? configAtestados.direction : null}
                        className="min-w-[160px]"
                      />
                      <TableHead className="min-w-[120px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAtestados.map((atestado) => (
                      <TableRow key={atestado.id}>
                        <TableCell className="text-black sticky left-0 z-10 bg-white">{atestado.fornecedor}</TableCell>
                        <TableCell className="text-black">{atestado.processo}</TableCell>
                        <TableCell className="text-gray-600">{atestado.tipoAtestado}</TableCell>
                        <TableCell className="text-gray-600">{atestado.dataEmissao}</TableCell>
                        <TableCell>
                          <StatusBadge status={atestado.status as 'Válido' | 'Vencido'} />
                        </TableCell>
                        <TableCell className="text-gray-600">{atestado.responsavel}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewAtestado(atestado)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadAtestado(atestado)}
                            >
                              <Download size={16} />
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
      </Tabs>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Visualização de Atestado - {selectedAtestado?.arquivo}</DialogTitle>
            <DialogDescription>
              Visualizador de documento do atestado de {selectedAtestado?.fornecedor} para o processo {selectedAtestado?.processo}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="text-xl text-black">Visualização de Atestado</h3>
                <p className="text-sm text-gray-600 mt-1 truncate">{selectedAtestado?.arquivo}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => selectedAtestado && handleDownloadAtestado(selectedAtestado)}
                className="flex-shrink-0"
              >
                <Download size={16} className="mr-2" />
                Baixar Documento
              </Button>
            </div>

            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 mb-1">Fornecedor</p>
                  <p className="text-sm text-black truncate">{selectedAtestado?.fornecedor}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 mb-1">Processo</p>
                  <p className="text-sm text-black">{selectedAtestado?.processo}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 mb-1">Responsável</p>
                  <p className="text-sm text-black truncate">{selectedAtestado?.responsavel}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 mb-1">Validade</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-black whitespace-nowrap">{selectedAtestado?.validade}</p>
                    {selectedAtestado?.status && (
                      <StatusBadge status={selectedAtestado.status as 'Válido' | 'Vencido'} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 bg-white overflow-hidden">
              <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <FileText size={64} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Pré-visualização do documento</p>
                  <p className="text-sm text-gray-500">{selectedAtestado?.arquivo}</p>
                  <p className="text-xs text-gray-400 mt-4">
                    (Visualizador de PDF/Imagem seria renderizado aqui)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmAction.open} onOpenChange={closeConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getActionTitle()}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  <span className="text-black">Fornecedor:</span> {confirmAction.fornecedor?.nome}
                </p>
                <p className="text-gray-700">
                  {getActionDescription()}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirmDialog}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeAction}
              className="bg-[#003366] hover:bg-[#002244] text-white"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface CadastroFornecedorProps {
  onVoltar?: () => void;
}

function CadastroFornecedor({ onVoltar }: CadastroFornecedorProps) {
  const [formData, setFormData] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    categoria: '',
    telefone: '',
    email: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    contatoNome: '',
    contatoCargo: '',
    contatoTelefone: '',
    contatoEmail: '',
    observacoes: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    handleChange('cnpj', formatted);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.razaoSocial || !formData.cnpj || !formData.email || !formData.categoria) {
      toast.error('Campos obrigatórios não preenchidos', {
        description: 'Por favor, preencha todos os campos obrigatórios.'
      });
      return;
    }

    toast.success('Fornecedor cadastrado com sucesso!', {
      description: `${formData.razaoSocial} foi adicionado ao sistema.`
    });

    setFormData({
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      inscricaoEstadual: '',
      categoria: '',
      telefone: '',
      email: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      contatoNome: '',
      contatoCargo: '',
      contatoTelefone: '',
      contatoEmail: '',
      observacoes: ''
    });
  };

  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Fornecedores</span>
            <span className="text-gray-400">/</span>
            <span className="text-black">Novo Cadastro</span>
          </div>
          {onVoltar && (
            <Button
              onClick={onVoltar}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2" size={18} />
              Voltar
            </Button>
          )}
        </div>

        <div>
          <h1 className="text-black">Cadastro de Fornecedor</h1>
          <p className="text-gray-600 mt-1">
            Preencha os dados do fornecedor para cadastrá-lo no sistema
          </p>
        </div>
      </div>

      <div className="px-8 py-6">
        <form onSubmit={handleSubmit}>
          <div className="max-w-4xl space-y-6">

            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                Campos marcados com <span className="text-red-600">*</span> são obrigatórios
              </AlertDescription>
            </Alert>

            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                  <Building2 size={20} className="text-[#003366]" />
                  Dados da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="razaoSocial" className="text-sm text-gray-700 mb-2 block">
                      Razão Social <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="razaoSocial"
                      value={formData.razaoSocial}
                      onChange={(e) => handleChange('razaoSocial', e.target.value)}
                      placeholder="Digite a razão social"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="nomeFantasia" className="text-sm text-gray-700 mb-2 block">
                      Nome Fantasia
                    </Label>
                    <Input
                      id="nomeFantasia"
                      value={formData.nomeFantasia}
                      onChange={(e) => handleChange('nomeFantasia', e.target.value)}
                      placeholder="Digite o nome fantasia"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cnpj" className="text-sm text-gray-700 mb-2 block">
                      CNPJ <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => handleCNPJChange(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="inscricaoEstadual" className="text-sm text-gray-700 mb-2 block">
                      Inscrição Estadual
                    </Label>
                    <Input
                      id="inscricaoEstadual"
                      value={formData.inscricaoEstadual}
                      onChange={(e) => handleChange('inscricaoEstadual', e.target.value)}
                      placeholder="Digite a inscrição estadual"
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoria" className="text-sm text-gray-700 mb-2 block">
                      Categoria <span className="text-red-600">*</span>
                    </Label>
                    <Select value={formData.categoria} onValueChange={(value) => handleChange('categoria', value)}>
                      <SelectTrigger id="categoria">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="material-escritorio">Material de Escritório</SelectItem>
                        <SelectItem value="informatica">Informática</SelectItem>
                        <SelectItem value="limpeza">Limpeza</SelectItem>
                        <SelectItem value="construcao">Construção</SelectItem>
                        <SelectItem value="servicos">Serviços</SelectItem>
                        <SelectItem value="mobiliario">Mobiliário</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="telefone" className="text-sm text-gray-700 mb-2 block">
                      Telefone
                    </Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleChange('telefone', e.target.value)}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm text-gray-700 mb-2 block">
                      E-mail <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="email@empresa.com.br"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-normal text-[16px] py-[8px]">Endereço</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="cep" className="text-sm text-gray-700 mb-2 block">
                      CEP
                    </Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleChange('cep', e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="endereco" className="text-sm text-gray-700 mb-2 block">
                      Endereço
                    </Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => handleChange('endereco', e.target.value)}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="numero" className="text-sm text-gray-700 mb-2 block">
                      Número
                    </Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => handleChange('numero', e.target.value)}
                      placeholder="Nº"
                    />
                  </div>

                  <div>
                    <Label htmlFor="complemento" className="text-sm text-gray-700 mb-2 block">
                      Complemento
                    </Label>
                    <Input
                      id="complemento"
                      value={formData.complemento}
                      onChange={(e) => handleChange('complemento', e.target.value)}
                      placeholder="Sala, Andar, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="bairro" className="text-sm text-gray-700 mb-2 block">
                      Bairro
                    </Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => handleChange('bairro', e.target.value)}
                      placeholder="Bairro"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cidade" className="text-sm text-gray-700 mb-2 block">
                      Cidade
                    </Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => handleChange('cidade', e.target.value)}
                      placeholder="Cidade"
                    />
                  </div>

                  <div>
                    <Label htmlFor="estado" className="text-sm text-gray-700 mb-2 block">
                      Estado
                    </Label>
                    <Select value={formData.estado} onValueChange={(value) => handleChange('estado', value)}>
                      <SelectTrigger id="estado">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SP">SP</SelectItem>
                        <SelectItem value="RJ">RJ</SelectItem>
                        <SelectItem value="MG">MG</SelectItem>
                        <SelectItem value="ES">ES</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-normal text-[16px] py-[8px]">Contato Principal</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contatoNome" className="text-sm text-gray-700 mb-2 block">
                      Nome do Contato
                    </Label>
                    <Input
                      id="contatoNome"
                      value={formData.contatoNome}
                      onChange={(e) => handleChange('contatoNome', e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contatoCargo" className="text-sm text-gray-700 mb-2 block">
                      Cargo
                    </Label>
                    <Input
                      id="contatoCargo"
                      value={formData.contatoCargo}
                      onChange={(e) => handleChange('contatoCargo', e.target.value)}
                      placeholder="Cargo do contato"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contatoTelefone" className="text-sm text-gray-700 mb-2 block">
                      Telefone do Contato
                    </Label>
                    <Input
                      id="contatoTelefone"
                      value={formData.contatoTelefone}
                      onChange={(e) => handleChange('contatoTelefone', e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contatoEmail" className="text-sm text-gray-700 mb-2 block">
                      E-mail do Contato
                    </Label>
                    <Input
                      id="contatoEmail"
                      type="email"
                      value={formData.contatoEmail}
                      onChange={(e) => handleChange('contatoEmail', e.target.value)}
                      placeholder="contato@empresa.com.br"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-normal text-[16px] py-[8px]">Observações</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleChange('observacoes', e.target.value)}
                  placeholder="Informações adicionais sobre o fornecedor..."
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end pt-4">
              {onVoltar && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                  onClick={onVoltar}
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                className="bg-[#003366] hover:bg-[#002244] text-white"
              >
                <Save size={18} className="mr-2" />
                Salvar Fornecedor
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function FornecedoresModule() {
  const [activePageTab, setActivePageTab] = useState<"fornecedores-atestados" | "cadastro-fornecedor">("fornecedores-atestados");

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Tabs value={activePageTab} onValueChange={(value) => setActivePageTab(value as "fornecedores-atestados" | "cadastro-fornecedor")} className="w-full">
        <TabsList className="grid w-full max-w-[560px] grid-cols-2">
          <TabsTrigger value="fornecedores-atestados">Fornecedores e Atestados</TabsTrigger>
          <TabsTrigger value="cadastro-fornecedor">Cadastro de Fornecedor</TabsTrigger>
        </TabsList>
        <TabsContent value="fornecedores-atestados" className="mt-4">
          <ContratosEFornecedores />
        </TabsContent>
        <TabsContent value="cadastro-fornecedor" className="mt-4">
          <CadastroFornecedor onVoltar={() => setActivePageTab("fornecedores-atestados")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
