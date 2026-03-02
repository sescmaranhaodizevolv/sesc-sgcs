import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BadgeNew } from '../ui/badge-new';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Search, Building2, FileText, Upload, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { FileInput } from '../ui/file-input';
import { toast } from 'sonner';

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

// Helper para renderizar badges de status de forma consistente
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

export function ContratosEFornecedores() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [categoriaFilter, setCategoriaFilter] = useState('todas');
  const [selectedAtestado, setSelectedAtestado] = useState<typeof atestados[0] | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('fornecedores');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estado para controle de modais de confirmação
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

  const filteredFornecedores = fornecedores.filter(fornecedor => {
    const matchesSearch = fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.cnpj.includes(searchTerm);
    const matchesStatus = statusFilter === 'todos' || fornecedor.status.toLowerCase() === statusFilter;
    const matchesCategoria = categoriaFilter === 'todas' || fornecedor.categoria === categoriaFilter;
    return matchesSearch && matchesStatus && matchesCategoria;
  });

  // Paginação
  const totalPages = Math.ceil(filteredFornecedores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFornecedores = filteredFornecedores.slice(startIndex, endIndex);

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
      {/* Page Header */}
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

      {/* Tabs */}
      <Tabs defaultValue="fornecedores" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-2">
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          <TabsTrigger value="atestados">Atestados de Capacidade Técnica</TabsTrigger>
        </TabsList>

        <TabsContent value="fornecedores" className="space-y-4 mt-8">
          {/* Stats Cards Fornecedores */}
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
          
          {/* Filters */}
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
                        setCurrentPage(1); // Reset para primeira página ao buscar
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

          {/* Fornecedores Table */}
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
                      <TableHead className="sticky left-0 z-10 min-w-[250px]">Nome/Razão Social</TableHead>
                      <TableHead className="min-w-[160px]">CNPJ</TableHead>
                      <TableHead className="min-w-[180px]">Categoria</TableHead>
                      <TableHead className="min-w-[180px]">Status</TableHead>
                      <TableHead className="min-w-[140px]">Data Registro</TableHead>
                      <TableHead className="min-w-[120px]">Atestados</TableHead>
                      <TableHead className="min-w-[160px]">Contato</TableHead>
                      <TableHead className="min-w-[150px] text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFornecedores.length > 0 ? (
                      paginatedFornecedores.map((fornecedor) => (
                        <TableRow key={fornecedor.id}>
                          <TableCell className="text-black sticky left-0 z-10">{fornecedor.nome}</TableCell>
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

              {/* Paginação */}
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
          {/* Upload Section */}
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

          {/* Atestados Table */}
          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black px-[0px] py-[8px]">Atestados Cadastrados</CardTitle>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 z-10 min-w-[200px]">Fornecedor</TableHead>
                      <TableHead className="min-w-[120px]">Processo</TableHead>
                      <TableHead className="min-w-[180px]">Tipo</TableHead>
                      <TableHead className="min-w-[140px]">Data Emissão</TableHead>
                      <TableHead className="min-w-[120px]">Status</TableHead>
                      <TableHead className="min-w-[160px]">Responsável</TableHead>
                      <TableHead className="min-w-[120px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atestados.map((atestado) => (
                      <TableRow key={atestado.id}>
                        <TableCell className="text-black sticky left-0 z-10">{atestado.fornecedor}</TableCell>
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

      {/* Modal de Visualização de Atestado */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Visualização de Atestado - {selectedAtestado?.arquivo}</DialogTitle>
            <DialogDescription>
              Visualizador de documento do atestado de {selectedAtestado?.fornecedor} para o processo {selectedAtestado?.processo}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col h-full">
            {/* Header do Modal */}
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

            {/* Metadados */}
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

            {/* Visualizador de Documento */}
            <div className="flex-1 p-6 bg-white overflow-hidden">
              <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                {/* Simulação de visualizador PDF */}
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

      {/* Modal de Confirmação para Ações Sensíveis */}
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
