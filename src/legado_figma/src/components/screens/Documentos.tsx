import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BadgeNew } from '../ui/badge-new';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Upload, Search, Eye, Download, FileText, Filter, FolderOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { FileInput } from '../ui/file-input';
import { Alert, AlertDescription } from '../ui/alert';
import { getBadgeMappingForTipoDocumento } from '../../lib/badge-mappings';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { EmptyState } from '../EmptyState';

export function Documentos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [empresaFilter, setEmpresaFilter] = useState('todas');
  const [processoFilter, setProcessoFilter] = useState('todos');
  const [palavraChave, setPalavraChave] = useState('');

  // Dados seguindo o padrão de nomenclatura: "Tipo – Categoria – Período – Fornecedor"
  const documentos = [
    {
      id: 1,
      nome: 'Termo Homologado – Não Perecíveis – 2024-01 – Empresa ABC Ltda.pdf',
      descricao: 'Termo de homologação do processo de não perecíveis',
      empresa: 'Empresa ABC Ltda',
      processo: '2024-001',
      tipo: 'Termo Homologado',
      categoria: 'Não Perecíveis',
      tamanho: '2.5 MB',
      dataUpload: '25/01/2024',
      uploadPor: 'Maria Silva (Administrador)',
      palavrasChave: ['homologação', 'não perecíveis', 'termo']
    },
    {
      id: 2,
      nome: 'Notificação – Serviços de TI – 2024-02 – Tecnologia GHI Ltda.pdf',
      descricao: 'Notificação de atraso na entrega de serviços',
      empresa: 'Tecnologia GHI Ltda',
      processo: '2024-002',
      tipo: 'Notificação',
      categoria: 'Serviços de TI',
      tamanho: '1.2 MB',
      dataUpload: '15/02/2024',
      uploadPor: 'João Santos (Administrador)',
      palavrasChave: ['notificação', 'atraso', 'serviços']
    },
    {
      id: 3,
      nome: 'Aditivo – Limpeza e Conservação – 2024-03 – Fornecedor XYZ SA.pdf',
      descricao: 'Primeiro termo aditivo do contrato de limpeza',
      empresa: 'Fornecedor XYZ S.A',
      processo: '2024-003',
      tipo: 'Aditivo',
      categoria: 'Limpeza e Conservação',
      tamanho: '1.8 MB',
      dataUpload: '10/03/2024',
      uploadPor: 'Maria Silva (Administrador)',
      palavrasChave: ['aditivo', 'limpeza', 'prorrogação']
    },
    {
      id: 4,
      nome: 'Desistência – Material de Escritório – 2024-04 – Serviços DEF Eireli.pdf',
      descricao: 'Termo de desistência do fornecedor',
      empresa: 'Serviços DEF Eireli',
      processo: '2024-004',
      tipo: 'Desistência',
      categoria: 'Material de Escritório',
      tamanho: '0.9 MB',
      dataUpload: '05/03/2024',
      uploadPor: 'Carlos Oliveira (Administrador)',
      palavrasChave: ['desistência', 'material', 'escritório']
    },
    {
      id: 5,
      nome: 'Termo Homologado – Construção Civil – 2024-05 – Construtora PQR SA.pdf',
      descricao: 'Termo de homologação para obra civil',
      empresa: 'Construtora PQR S.A',
      processo: '2024-005',
      tipo: 'Termo Homologado',
      categoria: 'Construção Civil',
      tamanho: '3.2 MB',
      dataUpload: '20/02/2024',
      uploadPor: 'Ana Costa (Administrador)',
      palavrasChave: ['homologação', 'construção', 'obra']
    },
    {
      id: 6,
      nome: 'Notificação – Não Perecíveis – 2024-01 – Empresa ABC Ltda.pdf',
      descricao: 'Notificação sobre qualidade dos produtos',
      empresa: 'Empresa ABC Ltda',
      processo: '2024-001',
      tipo: 'Notificação',
      categoria: 'Não Perecíveis',
      tamanho: '1.1 MB',
      dataUpload: '28/02/2024',
      uploadPor: 'João Santos (Administrador)',
      palavrasChave: ['notificação', 'qualidade', 'produtos']
    },
    {
      id: 7,
      nome: 'Aditivo – Serviços de TI – 2024-02 – Tecnologia GHI Ltda.pdf',
      descricao: 'Termo aditivo de reajuste de valores',
      empresa: 'Tecnologia GHI Ltda',
      processo: '2024-002',
      tipo: 'Aditivo',
      categoria: 'Serviços de TI',
      tamanho: '2.0 MB',
      dataUpload: '12/03/2024',
      uploadPor: 'Maria Silva (Administrador)',
      palavrasChave: ['aditivo', 'reajuste', 'valores']
    },
    {
      id: 8,
      nome: 'Termo Homologado – Limpeza e Conservação – 2024-03 – Fornecedor XYZ SA.pdf',
      descricao: 'Termo de homologação do processo licitatório',
      empresa: 'Fornecedor XYZ S.A',
      processo: '2024-003',
      tipo: 'Termo Homologado',
      categoria: 'Limpeza e Conservação',
      tamanho: '2.8 MB',
      dataUpload: '05/02/2024',
      uploadPor: 'Carlos Oliveira (Administrador)',
      palavrasChave: ['homologação', 'limpeza', 'licitação']
    }
  ];

  const estatisticas = {
    totalDocumentos: documentos.length,
    tamanhoTotal: documentos.reduce((sum, doc) => {
      const tamanho = parseFloat(doc.tamanho.replace(' MB', ''));
      return sum + tamanho;
    }, 0),
    porTipo: {
      'Termo Homologado': documentos.filter(d => d.tipo === 'Termo Homologado').length,
      'Notificação': documentos.filter(d => d.tipo === 'Notificação').length,
      'Aditivo': documentos.filter(d => d.tipo === 'Aditivo').length,
      'Desistência': documentos.filter(d => d.tipo === 'Desistência').length
    },
    uploadsHoje: 2,
    processos: [...new Set(documentos.map(d => d.processo))].length
  };

  const empresas = [...new Set(documentos.map(d => d.empresa))];
  const processos = [...new Set(documentos.map(d => d.processo))];
  const tipos = ['Notificação', 'Aditivo', 'Desistência', 'Termo Homologado'];

  // Filtro para documentos homologados
  const documentosHomologados = documentos.filter(d => d.tipo === 'Termo Homologado');

  const filteredDocumentos = documentos.filter(documento => {
    const matchesSearch = documento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         documento.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === 'todos' || documento.tipo === tipoFilter;
    const matchesEmpresa = empresaFilter === 'todas' || documento.empresa === empresaFilter;
    const matchesProcesso = processoFilter === 'todos' || documento.processo === processoFilter;
    const matchesPalavraChave = palavraChave === '' || 
                               documento.palavrasChave.some(palavra => 
                                 palavra.toLowerCase().includes(palavraChave.toLowerCase()));
    
    return matchesSearch && matchesTipo && matchesEmpresa && matchesProcesso && matchesPalavraChave;
  });

  const visualizarDocumento = (documentoId: number) => {
    console.log(`Visualizar documento ${documentoId}`);
    alert('Abrindo visualizador de documento...');
  };

  const baixarDocumento = (documentoId: number) => {
    console.log(`Baixar documento ${documentoId}`);
    alert('Download iniciado!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Documentos</h2>
          <p className="text-gray-600 mt-1">Envie e consulte documentos relacionados aos processos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#003366] hover:bg-[#002244] text-white">
              <Upload size={20} className="mr-2" />
              Enviar Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
            {/* Área scrollável */}
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Enviar Novo Documento</DialogTitle>
                <DialogDescription>
                  Faça o upload de um documento final (apenas PDF). Perfil Requisitante: somente leitura.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 pb-6">
                <div className="space-y-1.5">
                  <Label htmlFor="empresa">Empresa</Label>
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
                  <Label htmlFor="processo">Nº do Processo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o processo" />
                    </SelectTrigger>
                    <SelectContent>
                      {processos.map(processo => (
                        <SelectItem key={processo} value={processo}>{processo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tipo">Tipo de Documento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notificacao">Notificação</SelectItem>
                      <SelectItem value="aditivo">Aditivo</SelectItem>
                      <SelectItem value="desistencia">Desistência</SelectItem>
                      <SelectItem value="termo-homologado">Termo Homologado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input placeholder="Ex: Não Perecíveis, Serviços de TI, etc." />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="periodo">Período</Label>
                  <Input placeholder="Ex: 2024-03" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="arquivo">Arquivo (apenas PDF)</Label>
                  <FileInput id="arquivo" accept=".pdf" />
                  <p className="text-xs text-gray-500">* Arquivos ZIP não são aceitos. Envie apenas documentos finais em PDF.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="palavras-chave">Palavras-chave</Label>
                  <Input placeholder="Ex: homologação, limpeza, termo (separadas por vírgula)" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea placeholder="Descrição do documento..." rows={3} />
                </div>
              </div>
            </div>

            {/* Footer fixo */}
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1">
                Cancelar
              </Button>
              <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white">
                <Upload size={16} className="mr-2" />
                Enviar Documento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderOpen size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl text-black">{estatisticas.totalDocumentos}</p>
                <p className="text-sm text-gray-600">Total de Documentos</p>
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
                <p className="text-2xl text-black">{estatisticas.tamanhoTotal.toFixed(1)} MB</p>
                <p className="text-sm text-gray-600">Tamanho Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Upload size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl text-purple-600">{estatisticas.uploadsHoje}</p>
                <p className="text-sm text-gray-600">Uploads Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-2xl text-orange-600">{estatisticas.processos}</p>
                <p className="text-sm text-gray-600">Processos com Docs</p>
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
                <p className="text-2xl text-green-600">{documentosHomologados.length}</p>
                <p className="text-sm text-gray-600">Termos Homologados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Documentos */}
      <div className="space-y-4">
          {/* Filtros */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-black flex items-center gap-2">
                <Filter size={20} />
                Filtros de Busca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar documentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
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
                
                <div>
                  <Select value={processoFilter} onValueChange={setProcessoFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nº do processo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Processos</SelectItem>
                      {processos.map(processo => (
                        <SelectItem key={processo} value={processo}>{processo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de documento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Tipos</SelectItem>
                      {tipos.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Input
                    placeholder="Palavra-chave..."
                    value={palavraChave}
                    onChange={(e) => setPalavraChave(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setTipoFilter('todos');
                    setEmpresaFilter('todas');
                    setProcessoFilter('todos');
                    setPalavraChave('');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Documentos */}
          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black px-[0px] py-[8px]">Lista de Documentos</CardTitle>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
              {filteredDocumentos.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 z-10 min-w-[300px]">Nome do Documento</TableHead>
                      <TableHead className="min-w-[160px]">Empresa</TableHead>
                      <TableHead className="min-w-[100px]">Processo</TableHead>
                      <TableHead className="min-w-[140px]">Tipo</TableHead>
                      <TableHead className="min-w-[100px]">Tamanho</TableHead>
                      <TableHead className="min-w-[120px]">Data Upload</TableHead>
                      <TableHead className="min-w-[180px]">Upload Por</TableHead>
                      <TableHead className="min-w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocumentos.map((documento) => (
                      <TableRow key={documento.id}>
                        <TableCell className="text-black sticky left-0 z-10">
                          <div>
                            <p className="truncate">{documento.nome}</p>
                            <p className="text-sm text-gray-500 truncate">{documento.descricao}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{documento.empresa}</TableCell>
                        <TableCell className="text-black">{documento.processo}</TableCell>
                        <TableCell>
                          <BadgeNew {...getBadgeMappingForTipoDocumento(documento.tipo)}>
                            {documento.tipo}
                          </BadgeNew>
                        </TableCell>
                        <TableCell className="text-gray-600">{documento.tamanho}</TableCell>
                        <TableCell className="text-gray-600">{documento.dataUpload}</TableCell>
                        <TableCell className="text-gray-600">{documento.uploadPor}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => visualizarDocumento(documento.id)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => baixarDocumento(documento.id)}
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
              ) : (
                <EmptyState
                  icon={FolderOpen}
                  title="Nenhum documento encontrado"
                  description="Tente ajustar os filtros de busca ou faça o upload de novos documentos."
                  variant="compact"
                />
              )}
            </CardContent>
          </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black">Documentos por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(estatisticas.porTipo).map(([tipo, count]) => (
                <div key={tipo} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      tipo === 'Termo Homologado' ? 'bg-green-500' :
                      tipo === 'Notificação' ? 'bg-yellow-500' :
                      tipo === 'Aditivo' ? 'bg-blue-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-gray-600">{tipo}:</span>
                  </div>
                  <span className="text-black">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black">Padrão de Nomenclatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong className="text-black">Formato:</strong></p>
              <p>Tipo – Categoria – Período – Fornecedor</p>
              <p className="text-xs text-gray-500 mt-2">
                Ex: "Notificação – Não Perecíveis – 2024-03 – Fornecedor XYZ"
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black">Tipos Aceitos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-gray-600">PDF (Documentos finais)</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600" />
                <span className="text-gray-600">ZIP não aceito</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-black">Upload hoje: {estatisticas.uploadsHoje} documentos</p>
                <p className="text-gray-600">Total: {estatisticas.totalDocumentos} documentos</p>
              </div>
              <div className="text-sm">
                <p className="text-black">Último upload:</p>
                <p className="text-gray-600 text-xs">{documentos[0]?.nome}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}