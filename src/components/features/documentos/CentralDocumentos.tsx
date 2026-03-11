"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BadgeStatus } from '@/components/ui/badge-status';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Search, Eye, Download, FileText, Filter, FolderOpen, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { FileInput } from '@/components/ui/file-input';
import { getBadgeMappingForTipoDocumento } from '@/lib/badge-mappings';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/features/EmptyState';
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { deleteDocumento, getDocumentos, uploadDocumento } from "@/services/documentosService";
import { getFornecedores } from "@/services/fornecedoresService";
import { getProcessos } from "@/services/processosService";
import type { DocumentoItem } from "@/services/documentosService";
import type { Fornecedor, ProcessoComDetalhes } from "@/types";

function formatBytes(size?: number | null) {
  if (!size || Number.isNaN(size)) return "0 KB";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}

export function CentralDocumentos() {
  const { currentUser } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [empresaFilter, setEmpresaFilter] = useState('todas');
  const [processoFilter, setProcessoFilter] = useState('todos');
  const [palavraChave, setPalavraChave] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [documentosRaw, setDocumentosRaw] = useState<DocumentoItem[]>([]);
  const [fornecedoresRaw, setFornecedoresRaw] = useState<Fornecedor[]>([]);
  const [processosRaw, setProcessosRaw] = useState<ProcessoComDetalhes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    empresa: '',
    processo: '',
    tipo: '',
    categoria: '',
    periodo: '',
    palavrasChave: '',
    descricao: '',
    acessoPublico: false,
    arquivo: null as File | null,
  });

  const loadDocumentos = async () => {
    setIsLoading(true);
    try {
      const data = await getDocumentos();
      setDocumentosRaw(data);
    } catch (error) {
      toast.error('Erro ao carregar documentos', {
        description: error instanceof Error ? error.message : 'Não foi possível carregar os documentos.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDocumentos();
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [fornecedoresData, processosData] = await Promise.all([
          getFornecedores(),
          getProcessos(),
        ]);
        setFornecedoresRaw(fornecedoresData);
        setProcessosRaw(processosData);
      } catch (error) {
        toast.error('Erro ao carregar empresas e processos', {
          description: error instanceof Error ? error.message : 'Não foi possível carregar as opções do formulário.',
        });
      }
    };

    void loadOptions();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('central-documentos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documentos' }, () => {
        void loadDocumentos();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const documentos = useMemo(() => documentosRaw.map((documento) => ({
    ...documento,
    nome: documento.nome_arquivo,
    empresa: documento.empresa || '-',
    processo: documento.processo || '-',
    tipo: documento.tipo || '-',
    categoria: documento.categoria || '-',
    tamanho: formatBytes(documento.tamanho_bytes),
    dataUpload: formatDate(documento.criado_em),
    uploadPor: documento.criado_por_nome,
    palavrasChave: documento.palavras_chave || [],
    descricao: documento.descricao || '-',
  })), [documentosRaw]);

  const empresas = useMemo(
    () => {
      const fromFornecedores = fornecedoresRaw.map((fornecedor) => fornecedor.razao_social).filter(Boolean);
      const fromDocumentos = documentos.map((d) => d.empresa).filter((empresa) => empresa && empresa !== '-');
      return Array.from(new Set([...fromFornecedores, ...fromDocumentos]));
    },
    [documentos, fornecedoresRaw]
  );
  const processos = useMemo(
    () => {
      const fromProcessos = processosRaw
        .map((processo) => processo.numero_requisicao || processo.id)
        .filter(Boolean);
      const fromDocumentos = documentos.map((d) => d.processo).filter((processo) => processo && processo !== '-');
      return Array.from(new Set([...fromProcessos, ...fromDocumentos]));
    },
    [documentos, processosRaw]
  );
  const tipos = useMemo(
    () => Array.from(new Set(documentos.map((d) => d.tipo).filter((tipo) => tipo && tipo !== '-'))),
    [documentos]
  );

  const estatisticas = useMemo(() => {
    const totalBytes = documentosRaw.reduce((sum, doc) => sum + (doc.tamanho_bytes || 0), 0);
    const porTipo = tipos.reduce<Record<string, number>>((acc, tipo) => {
      acc[tipo] = documentos.filter((documento) => documento.tipo === tipo).length;
      return acc;
    }, {});

    const hoje = new Date().toLocaleDateString('pt-BR');
    return {
      totalDocumentos: documentos.length,
      tamanhoTotal: totalBytes,
      porTipo,
      uploadsHoje: documentos.filter((documento) => documento.dataUpload === hoje).length,
      processos: processos.length,
    };
  }, [documentos, documentosRaw, processos.length, tipos]);

  const documentosHomologados = useMemo(
    () => documentos.filter((d) => d.tipo === 'Termo Homologado'),
    [documentos]
  );

  const filteredDocumentos = useMemo(
    () => documentos.filter((documento) => {
      const matchesSearch = documento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         documento.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTipo = tipoFilter === 'todos' || documento.tipo === tipoFilter;
      const matchesEmpresa = empresaFilter === 'todas' || documento.empresa === empresaFilter;
      const matchesProcesso = processoFilter === 'todos' || documento.processo === processoFilter;
      const matchesPalavraChave = palavraChave === '' ||
                               documento.palavrasChave.some((palavra) =>
                                 palavra.toLowerCase().includes(palavraChave.toLowerCase()));

      return matchesSearch && matchesTipo && matchesEmpresa && matchesProcesso && matchesPalavraChave;
    }),
    [documentos, empresaFilter, palavraChave, processoFilter, searchTerm, tipoFilter]
  );

  const { items: sortedDocumentos, requestSort: sortDocumentos, sortConfig: configDocumentos } = useTableSort(filteredDocumentos);

  const resetForm = () => {
    setFormData({
      empresa: '',
      processo: '',
      tipo: '',
      categoria: '',
      periodo: '',
      palavrasChave: '',
      descricao: '',
      acessoPublico: false,
      arquivo: null,
    });
  };

  const fornecedorSelecionado = useMemo(
    () => fornecedoresRaw.find((fornecedor) => fornecedor.id === formData.empresa) || null,
    [fornecedoresRaw, formData.empresa]
  );

  const processoSelecionado = useMemo(
    () => processosRaw.find((processo) => processo.id === formData.processo) || null,
    [processosRaw, formData.processo]
  );

  const handleUpload = async () => {
    if (!currentUser?.id || !formData.arquivo || isUploading) return;

    setIsUploading(true);
    try {
      await uploadDocumento(
        formData.arquivo,
        {
          fornecedor_id: formData.empresa || null,
          processo_id: formData.processo || null,
          empresa: fornecedorSelecionado?.razao_social || '',
          processo: processoSelecionado?.numero_requisicao || processoSelecionado?.id || '',
          tipo: formData.tipo,
          categoria: formData.categoria,
          periodo: formData.periodo,
          palavras_chave: formData.palavrasChave.split(',').map((item) => item.trim()).filter(Boolean),
          descricao: formData.descricao,
          titulo: [formData.tipo, formData.categoria, formData.periodo, fornecedorSelecionado?.razao_social].filter(Boolean).join(' – '),
          acesso_publico: formData.acessoPublico,
        },
        currentUser.id
      );

      toast.success('Documento enviado com sucesso!');
      resetForm();
      setIsUploadDialogOpen(false);
      await loadDocumentos();
    } catch (error) {
      toast.error('Erro ao enviar documento', {
        description: error instanceof Error ? error.message : 'Não foi possível enviar o documento.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const visualizarDocumento = (url: string) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const baixarDocumento = async (url: string, nomeArquivo: string) => {
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return <div className="p-6 space-y-6" />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Documentos</h2>
          <p className="text-gray-600 mt-1">Envie e consulte documentos relacionados aos processos</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#003366] hover:bg-[#002244] text-white">
              <Upload size={20} className="mr-2" />
              Enviar Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
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
                  <Select value={formData.empresa} onValueChange={(value) => setFormData((prev) => ({ ...prev, empresa: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {fornecedoresRaw.map(empresa => (
                        <SelectItem key={empresa.id} value={empresa.id}>{empresa.razao_social}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="processo">Nº do Processo</Label>
                  <Select value={formData.processo} onValueChange={(value) => setFormData((prev) => ({ ...prev, processo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o processo" />
                    </SelectTrigger>
                    <SelectContent>
                      {processosRaw.map(processo => (
                        <SelectItem key={processo.id} value={processo.id}>{processo.numero_requisicao || processo.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tipo">Tipo de Documento</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData((prev) => ({ ...prev, tipo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Notificação">Notificação</SelectItem>
                      <SelectItem value="Aditivo">Aditivo</SelectItem>
                      <SelectItem value="Desistência">Desistência</SelectItem>
                      <SelectItem value="Termo Homologado">Termo Homologado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input placeholder="Ex: Não Perecíveis, Serviços de TI, etc." value={formData.categoria} onChange={(e) => setFormData((prev) => ({ ...prev, categoria: e.target.value }))} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="periodo">Período</Label>
                  <Input placeholder="Ex: 2024-03" value={formData.periodo} onChange={(e) => setFormData((prev) => ({ ...prev, periodo: e.target.value }))} />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="acesso-publico">Acesso Público (Tornar visível para Requisitantes)</Label>
                    <Switch id="acesso-publico" checked={formData.acessoPublico} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, acessoPublico: checked }))} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="arquivo">Arquivo (apenas PDF)</Label>
                  <FileInput id="arquivo" accept=".pdf" onFileChange={(file) => setFormData((prev) => ({ ...prev, arquivo: file }))} />
                  <p className="text-xs text-gray-500">* Arquivos ZIP não são aceitos. Envie apenas documentos finais em PDF.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="palavras-chave">Palavras-chave</Label>
                  <Input placeholder="Ex: homologação, limpeza, termo (separadas por vírgula)" value={formData.palavrasChave} onChange={(e) => setFormData((prev) => ({ ...prev, palavrasChave: e.target.value }))} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea placeholder="Descrição do documento..." rows={3} value={formData.descricao} onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))} />
                </div>
              </div>
            </div>

            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1" onClick={() => setIsUploadDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => void handleUpload()} disabled={isUploading || !formData.arquivo}>
                <Upload size={16} className="mr-2" />
                {isUploading ? 'Enviando...' : 'Enviar Documento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><FolderOpen size={20} className="text-blue-600" /></div><div><p className="text-2xl text-black">{estatisticas.totalDocumentos}</p><p className="text-sm text-gray-600">Total de Documentos</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><FileText size={20} className="text-green-600" /></div><div><p className="text-2xl text-black">{formatBytes(estatisticas.tamanhoTotal)}</p><p className="text-sm text-gray-600">Tamanho Total</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><Upload size={20} className="text-purple-600" /></div><div><p className="text-2xl text-purple-600">{estatisticas.uploadsHoje}</p><p className="text-sm text-gray-600">Uploads Hoje</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><FileText size={20} className="text-orange-600" /></div><div><p className="text-2xl text-orange-600">{estatisticas.processos}</p><p className="text-sm text-gray-600">Processos com Docs</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><CheckCircle size={20} className="text-green-600" /></div><div><p className="text-2xl text-green-600">{documentosHomologados.length}</p><p className="text-sm text-gray-600">Termos Homologados</p></div></div></CardContent></Card>
      </div>

      <div className="space-y-4">
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
                    <Input placeholder="Buscar documentos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div><Select value={empresaFilter} onValueChange={setEmpresaFilter}><SelectTrigger><SelectValue placeholder="Filtrar por empresa" /></SelectTrigger><SelectContent><SelectItem value="todas">Todas as Empresas</SelectItem>{empresas.map(empresa => (<SelectItem key={empresa} value={empresa}>{empresa}</SelectItem>))}</SelectContent></Select></div>
                <div><Select value={processoFilter} onValueChange={setProcessoFilter}><SelectTrigger><SelectValue placeholder="Nº do processo" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Processos</SelectItem>{processos.map(processo => (<SelectItem key={processo} value={processo}>{processo}</SelectItem>))}</SelectContent></Select></div>
                <div><Select value={tipoFilter} onValueChange={setTipoFilter}><SelectTrigger><SelectValue placeholder="Tipo de documento" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Tipos</SelectItem>{tipos.map(tipo => (<SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>))}</SelectContent></Select></div>
                <div><Input placeholder="Palavra-chave..." value={palavraChave} onChange={(e) => setPalavraChave(e.target.value)} /></div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => { setSearchTerm(''); setTipoFilter('todos'); setEmpresaFilter('todas'); setProcessoFilter('todos'); setPalavraChave(''); }}>
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

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
                      <SortableTableHead label="Nome do Documento" onClick={() => sortDocumentos('nome')} currentDirection={configDocumentos?.key === 'nome' ? configDocumentos.direction : null} className="sticky left-0 z-10 min-w-[300px] bg-white" />
                      <SortableTableHead label="Empresa" onClick={() => sortDocumentos('empresa')} currentDirection={configDocumentos?.key === 'empresa' ? configDocumentos.direction : null} className="min-w-[160px]" />
                      <SortableTableHead label="Processo" onClick={() => sortDocumentos('processo')} currentDirection={configDocumentos?.key === 'processo' ? configDocumentos.direction : null} className="min-w-[100px]" />
                      <SortableTableHead label="Tipo" onClick={() => sortDocumentos('tipo')} currentDirection={configDocumentos?.key === 'tipo' ? configDocumentos.direction : null} className="min-w-[140px]" />
                      <SortableTableHead label="Tamanho" onClick={() => sortDocumentos('tamanho')} currentDirection={configDocumentos?.key === 'tamanho' ? configDocumentos.direction : null} className="min-w-[100px]" />
                      <SortableTableHead label="Data Upload" onClick={() => sortDocumentos('dataUpload')} currentDirection={configDocumentos?.key === 'dataUpload' ? configDocumentos.direction : null} className="min-w-[120px]" />
                      <SortableTableHead label="Upload Por" onClick={() => sortDocumentos('uploadPor')} currentDirection={configDocumentos?.key === 'uploadPor' ? configDocumentos.direction : null} className="min-w-[180px]" />
                      <TableHead className="min-w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDocumentos.map((documento) => (
                      <TableRow key={documento.id}>
                        <TableCell className="text-black sticky left-0 z-10 bg-white"><div><p className="truncate">{documento.nome}</p><p className="text-sm text-gray-500 truncate">{documento.descricao}</p></div></TableCell>
                        <TableCell className="text-gray-600">{documento.empresa}</TableCell>
                        <TableCell className="text-black">{documento.processo}</TableCell>
                        <TableCell><BadgeStatus {...getBadgeMappingForTipoDocumento(documento.tipo)}>{documento.tipo}</BadgeStatus></TableCell>
                        <TableCell className="text-gray-600">{documento.tamanho}</TableCell>
                        <TableCell className="text-gray-600">{documento.dataUpload}</TableCell>
                        <TableCell className="text-gray-600">{documento.uploadPor}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => visualizarDocumento(documento.url_assinada)}><Eye size={16} /></Button>
                            <Button size="sm" variant="outline" onClick={() => void baixarDocumento(documento.url_assinada, documento.nome)}><Download size={16} /></Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => void deleteDocumento(documento.id).then(loadDocumentos).then(() => toast.success('Documento excluído com sucesso!')).catch((error) => toast.error('Erro ao excluir documento', { description: error instanceof Error ? error.message : 'Não foi possível excluir o documento.' }))}><Trash2 size={16} /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              ) : (
                <EmptyState icon={<FolderOpen size={48} />} title="Nenhum documento encontrado" description="Tente ajustar os filtros de busca ou faça o upload de novos documentos." />
              )}
            </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200"><CardHeader><CardTitle className="text-lg text-black">Documentos por Tipo</CardTitle></CardHeader><CardContent><div className="space-y-2">{Object.entries(estatisticas.porTipo).map(([tipo, count]) => (<div key={tipo} className="flex justify-between items-center"><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${tipo === 'Termo Homologado' ? 'bg-green-500' : tipo === 'Notificação' ? 'bg-yellow-500' : tipo === 'Aditivo' ? 'bg-blue-500' : 'bg-red-500'}`}></div><span className="text-gray-600">{tipo}:</span></div><span className="text-black">{count}</span></div>))}</div></CardContent></Card>
        <Card className="border border-gray-200"><CardHeader><CardTitle className="text-lg text-black">Padrão de Nomenclatura</CardTitle></CardHeader><CardContent><div className="space-y-2 text-sm text-gray-600"><p><strong className="text-black">Formato:</strong></p><p>Tipo – Categoria – Período – Fornecedor</p><p className="text-xs text-gray-500 mt-2">Ex: "Notificação – Não Perecíveis – 2024-03 – Fornecedor XYZ"</p></div></CardContent></Card>
        <Card className="border border-gray-200"><CardHeader><CardTitle className="text-lg text-black">Tipos Aceitos</CardTitle></CardHeader><CardContent><div className="space-y-2 text-sm"><div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-600" /><span className="text-gray-600">PDF (Documentos finais)</span></div><div className="flex items-center gap-2"><AlertCircle size={16} className="text-red-600" /><span className="text-gray-600">ZIP não aceito</span></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardHeader><CardTitle className="text-lg text-black">Atividade Recente</CardTitle></CardHeader><CardContent><div className="space-y-3"><div className="text-sm"><p className="text-black">Upload hoje: {estatisticas.uploadsHoje} documentos</p><p className="text-gray-600">Total: {estatisticas.totalDocumentos} documentos</p></div><div className="text-sm"><p className="text-black">Último upload:</p><p className="text-gray-600 text-xs">{documentos[0]?.nome || '-'}</p></div></div></CardContent></Card>
      </div>
    </div>
  );
}
