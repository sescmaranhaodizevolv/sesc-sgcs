"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BadgeStatus } from '@/components/ui/badge-status';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  GraduationCap, 
  LifeBuoy, 
  Plus, 
  HelpCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Upload,
  Search,
  X,
  FileText,
  Download,
  Edit,
  Trash2
} from 'lucide-react';
import { FileInput } from '@/components/ui/file-input';
import { getBadgeMappingForPrioridade } from '@/lib/badge-mappings';
import { createFaq, deleteFaq, getFaqs, updateFaq, type FaqItem } from '@/services/faqService';
import { toast } from "sonner";
import { getDocumentos } from "@/services/documentosService";
import type { DocumentoItem } from "@/services/documentosService";
import { useAuth } from "@/contexts/AuthContext";
import { atualizarStatusChamado, criarChamado, getChamados, type Chamado } from "@/services/suporteService";
import { createClient } from "@/lib/supabase/client";

interface CentralAjudaSuporteProps {
  onNavigateToChamado?: (chamadoId: string) => void;
  currentProfile?: 'admin' | 'comprador' | 'requisitante' | 'gestora';
}

export function CentralAjudaSuporte({ onNavigateToChamado = () => {}, currentProfile = 'admin' }: CentralAjudaSuporteProps) {
  const { currentUser } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [activeTab, setActiveTab] = useState(currentProfile === 'requisitante' ? 'faq' : 'chamados');
  const [chamadoAberto, setChamadoAberto] = useState(false);
  const [isUploadDocumentoOpen, setIsUploadDocumentoOpen] = useState(false);
  const [documentoUploadando, setDocumentoUploadando] = useState(false);
  const [respostaDialogAberto, setRespostaDialogAberto] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<any>(null);
  const [isCriarTreinamentoOpen, setIsCriarTreinamentoOpen] = useState(false);
  const [treinamentoCriando, setTreinamentoCriando] = useState(false);
  const [searchFaqRequisitante, setSearchFaqRequisitante] = useState('');
  const [searchChamadosRequisitante, setSearchChamadosRequisitante] = useState('');
  const [searchDocumentosRequisitante, setSearchDocumentosRequisitante] = useState('');
  const [documentos, setDocumentos] = useState<DocumentoItem[]>([]);
  const [isLoadingDocumentos, setIsLoadingDocumentos] = useState(false);
  const [isNovoFaqOpen, setIsNovoFaqOpen] = useState(false);
  const [novaPergunta, setNovaPergunta] = useState('');
  const [novaResposta, setNovaResposta] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [faqEmEdicao, setFaqEmEdicao] = useState<string | null>(null);
  const [isDeleteFaqDialogOpen, setIsDeleteFaqDialogOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [novoChamadoForm, setNovoChamadoForm] = useState({ categoria: "", prioridade: "", rc: "", descricao: "", titulo: "" });

  // Filtros da tabela
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroBusca, setFiltroBusca] = useState('');

  // Verificar permissões baseadas no perfil
  const podeAbrirChamado = currentProfile === 'requisitante' || currentProfile === 'comprador';
  const podeResponderChamado = currentProfile === 'admin' || currentProfile === 'comprador';
  const podeGerenciarFaq: boolean = currentProfile === 'admin';
  const usuarioLogado = currentProfile === 'requisitante' ? 'Usuário autenticado' : currentProfile === 'comprador' ? 'Comprador' : currentProfile === 'gestora' ? 'Gestora' : 'Admin';

  const [faqs, setFaqs] = useState<(FaqItem & { visualizacoes: number })[]>([]);

  useEffect(() => {
    const loadDocumentos = async () => {
      setIsLoadingDocumentos(true);
      try {
        const data = await getDocumentos();
        setDocumentos(data);
      } catch (error) {
        toast.error('Erro ao carregar documentos', {
          description: error instanceof Error ? error.message : 'Não foi possível carregar os documentos institucionais.',
        });
      } finally {
        setIsLoadingDocumentos(false);
      }
    };

    void loadDocumentos();
  }, []);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const data = await getFaqs();
        setFaqs(data.map((item) => ({ ...item, visualizacoes: 0 })));
      } catch (error) {
        toast.error('Erro ao carregar FAQ', {
          description: error instanceof Error ? error.message : 'Não foi possível carregar a base de conhecimento.',
        });
      }
    };

    void loadFaqs();
  }, []);

  useEffect(() => {
    const loadChamados = async () => {
      try {
        setChamados(await getChamados());
      } catch (error) {
        toast.error('Erro ao carregar chamados', {
          description: error instanceof Error ? error.message : 'Não foi possível carregar os chamados de suporte.',
        });
      }
    };

    void loadChamados();

    const channel = supabase
      .channel('chamados-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chamados' }, () => {
        void loadChamados();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const chamadosRecentes = useMemo(
    () => chamados.map((chamado) => ({
      id: chamado.id,
      numero: `CHA-${chamado.id.slice(0, 8).toUpperCase()}`,
      titulo: chamado.assunto,
      categoria: chamado.categoria || 'Geral',
      prioridade: chamado.prioridade,
      status: chamado.status,
      dataAbertura: new Date(chamado.criado_em).toLocaleString('pt-BR'),
      responsavel: chamado.responsavel?.nome || 'Suporte',
      usuarioRequisitante: chamado.usuario?.nome || usuarioLogado,
      perfilRequisitante: currentProfile === 'requisitante' ? 'Requisitante' : currentProfile === 'comprador' ? 'Comprador' : currentProfile === 'gestora' ? 'Gestora' : 'Administrador',
      descricao: chamado.descricao,
      ultimaAtualizacao: new Date(chamado.atualizado_em).toLocaleString('pt-BR'),
    })),
    [chamados, currentProfile, usuarioLogado],
  );

  const meusChamados = useMemo(
    () => chamados.filter((chamado) => !currentUser?.id || chamado.usuario_id === currentUser.id).map((chamado) => ({
      id: chamado.id,
      titulo: chamado.assunto,
      categoria: chamado.categoria || 'Geral',
      prioridade: chamado.prioridade,
      status: chamado.status,
      dataAbertura: new Date(chamado.criado_em).toLocaleDateString('pt-BR'),
      ultimaAtualizacao: new Date(chamado.atualizado_em).toLocaleDateString('pt-BR'),
    })),
    [chamados, currentUser?.id],
  );

  const estatisticasSuporte = {
    chamadosAbertos: chamadosRecentes.filter(c => c.status !== 'Resolvido').length,
    chamadosResolvidos: chamadosRecentes.filter(c => c.status === 'Resolvido').length,
    tempoMedioResolucao: '2.5 horas',
    satisfacaoUsuario: '4.8/5.0'
  };

  const getStatusBadge = (status: string) => {
    const mappings: Record<string, { intent: 'danger' | 'warning' | 'info' | 'purple' | 'success'; weight: 'medium' }> = {
      'Aberto': { intent: 'danger', weight: 'medium' },
      'Em Andamento': { intent: 'warning', weight: 'medium' },
      'Aguardando TI': { intent: 'info', weight: 'medium' },
      'Aguardando Usuário': { intent: 'purple', weight: 'medium' },
      'Resolvido': { intent: 'success', weight: 'medium' }
    };
    return mappings[status] || { intent: 'neutral' as const, weight: 'medium' as const };
  };

  const getPrioridadeBadge = (prioridade: string) => {
    // Usando a função padrão do sistema para prioridades
    return getBadgeMappingForPrioridade(prioridade);
  };

  const abrirChamado = async () => {
    if (!novoChamadoForm.descricao.trim() || !novoChamadoForm.categoria || !novoChamadoForm.prioridade) {
      toast.error('Preencha categoria, prioridade e descrição do chamado.');
      return;
    }

    setChamadoAberto(true);
    try {
      const assunto = novoChamadoForm.titulo.trim() || `${novoChamadoForm.categoria} - ${novoChamadoForm.rc || 'Solicitação de suporte'}`;
      const chamado = await criarChamado({
        assunto,
        descricao: novoChamadoForm.descricao,
        categoria: novoChamadoForm.categoria,
        prioridade: novoChamadoForm.prioridade,
        processo_referencia: novoChamadoForm.rc || null,
      });
      setNovoChamadoForm({ categoria: '', prioridade: '', rc: '', descricao: '', titulo: '' });
      toast.success('Chamado aberto com sucesso!', {
        description: `Identificador: CHA-${chamado.id.slice(0, 8).toUpperCase()}`,
      });
    } catch (error) {
      toast.error('Erro ao abrir chamado', {
        description: error instanceof Error ? error.message : 'Não foi possível registrar o chamado.',
      });
    } finally {
      setChamadoAberto(false);
    }
  };

  const abrirDetalhesChamado = (chamado: (typeof chamadosRecentes)[number]) => {
    onNavigateToChamado(chamado.id);
  };

  // Função para filtrar chamados
  const chamadosFiltrados = chamadosRecentes.filter(chamado => {
    const matchStatus = filtroStatus === 'todos' || chamado.status === filtroStatus;
    const matchPrioridade = filtroPrioridade === 'todos' || chamado.prioridade === filtroPrioridade;
    const matchCategoria = filtroCategoria === 'todos' || chamado.categoria === filtroCategoria;
    const matchBusca = filtroBusca === '' || 
      chamado.titulo.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      chamado.numero.toLowerCase().includes(filtroBusca.toLowerCase());
    
    return matchStatus && matchPrioridade && matchCategoria && matchBusca;
  });

  const limparFiltros = () => {
    setFiltroStatus('todos');
    setFiltroPrioridade('todos');
    setFiltroCategoria('todos');
    setFiltroBusca('');
  };

  const uploadDocumento = () => {
    setDocumentoUploadando(true);
    setDocumentoUploadando(false);
    setIsUploadDocumentoOpen(false);
    toast.success('Documento institucional adicionado com sucesso!');
  };

  const criarTreinamento = () => {
    setTreinamentoCriando(true);
    setTreinamentoCriando(false);
    setIsCriarTreinamentoOpen(false);
    toast.success('Treinamento criado com sucesso!');
  };

  const filteredFaqRequisitante = faqs.filter((item) =>
    item.pergunta.toLowerCase().includes(searchFaqRequisitante.toLowerCase()) ||
    item.resposta.toLowerCase().includes(searchFaqRequisitante.toLowerCase())
  );

  const filteredChamadosRequisitante = meusChamados.filter(chamado =>
    chamado.titulo.toLowerCase().includes(searchChamadosRequisitante.toLowerCase()) ||
    chamado.id.toLowerCase().includes(searchChamadosRequisitante.toLowerCase())
  );

  const formatDocumentSize = (size?: number | null) => {
    if (!size || Number.isNaN(size)) return '0 KB';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDocumentDate = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR');
  };

  const documentosInstitucionais = documentos
    .filter((doc) =>
      currentProfile === 'requisitante'
        ? doc.acesso_publico
        : doc.categoria === 'Institucional' || doc.acesso_publico
    )
    .map((doc) => ({
      id: doc.id,
      titulo: doc.titulo || doc.nome_arquivo,
      tipo: doc.tipo || 'Documento',
      categoria: doc.categoria || 'Geral',
      dataPublicacao: formatDocumentDate(doc.criado_em),
      tamanho: formatDocumentSize(doc.tamanho_bytes),
      versao: doc.periodo || '-',
      urlAssinada: doc.url_assinada,
    }));

  const filteredDocumentosRequisitante = documentosInstitucionais.filter((doc) =>
    doc.titulo.toLowerCase().includes(searchDocumentosRequisitante.toLowerCase()) ||
    doc.tipo.toLowerCase().includes(searchDocumentosRequisitante.toLowerCase()) ||
    doc.categoria.toLowerCase().includes(searchDocumentosRequisitante.toLowerCase())
  );

  const getStatusBadgeRequisitante = (status: string) => {
    const statusMap: Record<string, { intent: 'info' | 'warning' | 'success' | 'neutral'; weight: 'medium' }> = {
      'Em Análise': { intent: 'info', weight: 'medium' },
      'Respondido': { intent: 'warning', weight: 'medium' },
      'Resolvido': { intent: 'success', weight: 'medium' },
      'Cancelado': { intent: 'neutral', weight: 'medium' }
    };

    return statusMap[status] || { intent: 'neutral' as const, weight: 'medium' as const };
  };

  const getTipoBadgeClass = (tipo: string) => {
    const tipoMap: Record<string, string> = {
      Manual: 'bg-blue-100 text-blue-800',
      Procedimento: 'bg-green-100 text-green-800',
      Normativa: 'bg-purple-100 text-purple-800',
      Guia: 'bg-orange-100 text-orange-800',
      Tutorial: 'bg-yellow-100 text-yellow-800',
      Modelo: 'bg-pink-100 text-pink-800'
    };

    return tipoMap[tipo] || 'bg-gray-100 text-gray-800';
  };

  const salvarNovoFaq = async () => {
    if (!podeGerenciarFaq) return;
    if (!novaPergunta.trim() || !novaResposta.trim() || !novaCategoria) return;

    try {
      if (faqEmEdicao !== null) {
        const faqAtualizado = await updateFaq(faqEmEdicao, {
          pergunta: novaPergunta.trim(),
          resposta: novaResposta.trim(),
          categoria: novaCategoria,
          palavras_chave: [novaCategoria.toLowerCase(), ...novaPergunta.trim().toLowerCase().split(/\s+/)].slice(0, 8),
        });

        setFaqs((prev) => prev.map((faq) => (faq.id === faqEmEdicao ? { ...faqAtualizado, visualizacoes: faq.visualizacoes } : faq)));
        toast.success("FAQ atualizado com sucesso!");
      } else {
        const novoFaq = await createFaq({
          pergunta: novaPergunta.trim(),
          resposta: novaResposta.trim(),
          categoria: novaCategoria,
          palavras_chave: [novaCategoria.toLowerCase(), ...novaPergunta.trim().toLowerCase().split(/\s+/)].slice(0, 8),
        });

        setFaqs((prev) => [{ ...novoFaq, visualizacoes: 0 }, ...prev]);
        toast.success("FAQ cadastrado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao salvar FAQ", {
        description: error instanceof Error ? error.message : "Não foi possível salvar a pergunta frequente.",
      });
      return;
    }

    setFaqEmEdicao(null);
    setNovaPergunta('');
    setNovaResposta('');
    setNovaCategoria('');
    setIsNovoFaqOpen(false);
  };

  const abrirModalNovoFaq = () => {
    if (!podeGerenciarFaq) return;
    setFaqEmEdicao(null);
    setNovaPergunta('');
    setNovaResposta('');
    setNovaCategoria('');
    setIsNovoFaqOpen(true);
  };

  const abrirModalEdicao = (faq: FaqItem) => {
    if (!podeGerenciarFaq) return;
    setFaqEmEdicao(faq.id);
    setNovaPergunta(faq.pergunta);
    setNovaResposta(faq.resposta);
    setNovaCategoria(faq.categoria);
    setIsNovoFaqOpen(true);
  };

  const excluirFaq = async (id: string) => {
    if (!podeGerenciarFaq) return;
    try {
      await deleteFaq(id);
      setFaqs((prev) => prev.filter((faq) => faq.id !== id));
      toast.success("FAQ excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir FAQ", {
        description: error instanceof Error ? error.message : "Não foi possível excluir a pergunta frequente.",
      });
    }
  };

  if (currentProfile === 'requisitante') {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl text-black">Ajuda e Suporte</h2>
            <p className="text-gray-600 mt-1">Tire suas dúvidas, abra chamados e converse com nosso assistente</p>
          </div>

          {activeTab === 'chamados' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                  <Plus size={20} className="mr-2" />
                  Abrir Chamado
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
                <div className="flex-1 overflow-y-auto px-6">
                  <DialogHeader className="pt-6">
                    <DialogTitle>Abrir Novo Chamado</DialogTitle>
                    <DialogDescription>
                      Descreva seu problema ou dúvida e nossa equipe entrará em contato
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="chamado-categoria">Categoria *</Label>
                        <Select value={novoChamadoForm.categoria} onValueChange={(value) => setNovoChamadoForm((prev) => ({ ...prev, categoria: value }))}>
                          <SelectTrigger id="chamado-categoria">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="duvida">Dúvida</SelectItem>
                            <SelectItem value="processo-parado">Processo Parado</SelectItem>
                            <SelectItem value="cancelamento">Cancelamento</SelectItem>
                            <SelectItem value="alteracao">Alteração de RC</SelectItem>
                            <SelectItem value="problema-tecnico">Problema Técnico</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="chamado-prioridade">Prioridade *</Label>
                        <Select value={novoChamadoForm.prioridade} onValueChange={(value) => setNovoChamadoForm((prev) => ({ ...prev, prioridade: value }))}>
                          <SelectTrigger id="chamado-prioridade">
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="chamado-rc">RC Relacionada (Opcional)</Label>
                      <Input id="chamado-rc" placeholder="Informe o número da RC, se houver" value={novoChamadoForm.rc} onChange={(e) => setNovoChamadoForm((prev) => ({ ...prev, rc: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="chamado-titulo">Título do Chamado</Label>
                      <Input id="chamado-titulo" placeholder="Resumo do chamado" value={novoChamadoForm.titulo} onChange={(e) => setNovoChamadoForm((prev) => ({ ...prev, titulo: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="chamado-descricao">Descrição Detalhada *</Label>
                      <Textarea
                        id="chamado-descricao"
                        placeholder="Descreva em detalhes o problema ou dúvida..."
                        rows={6}
                        value={novoChamadoForm.descricao}
                        onChange={(e) => setNovoChamadoForm((prev) => ({ ...prev, descricao: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                  <Button variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                    onClick={abrirChamado}
                    disabled={chamadoAberto}
                  >
                    {chamadoAberto ? 'Abrindo...' : 'Abrir Chamado'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="chamados">Chamados</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="chamados" className="space-y-6 mt-6">
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por título ou ID do chamado..."
                    value={searchChamadosRequisitante}
                    onChange={(e) => setSearchChamadosRequisitante(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="pt-3 pb-1">
                <CardTitle className="text-xl text-black px-[0px] py-[8px]">Meus Chamados</CardTitle>
              </CardHeader>
              <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[140px]">ID</TableHead>
                        <TableHead className="min-w-[280px]">Título</TableHead>
                        <TableHead className="min-w-[160px]">Categoria</TableHead>
                        <TableHead className="min-w-[120px]">Prioridade</TableHead>
                        <TableHead className="min-w-[140px]">Status</TableHead>
                        <TableHead className="min-w-[140px]">Data Abertura</TableHead>
                        <TableHead className="min-w-[140px]">Última Atualização</TableHead>
                        <TableHead className="min-w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredChamadosRequisitante.map((chamado, index) => (
                        <TableRow key={chamado.id}>
                          <TableCell className="text-black">{chamado.id}</TableCell>
                          <TableCell className="text-black">{chamado.titulo}</TableCell>
                          <TableCell className="text-gray-600">{chamado.categoria}</TableCell>
                          <TableCell>
                            <BadgeStatus {...getPrioridadeBadge(chamado.prioridade)} size="sm">
                              {chamado.prioridade}
                            </BadgeStatus>
                          </TableCell>
                          <TableCell>
                            <BadgeStatus {...getStatusBadgeRequisitante(chamado.status)} size="sm">
                              {chamado.status}
                            </BadgeStatus>
                          </TableCell>
                          <TableCell className="text-gray-600">{chamado.dataAbertura}</TableCell>
                          <TableCell className="text-gray-600">{chamado.ultimaAtualizacao}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onNavigateToChamado(chamado.id)}
                            >
                              <Eye size={16} className="mr-1" />
                              Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos" className="space-y-4 mt-6">
            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                  <HelpCircle size={20} className="text-[#003366]" />
                  Downloads Institucionais
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
                <Alert className="mt-6 mb-4 border-blue-200 bg-blue-50">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Consulte os documentos institucionais publicados e os materiais públicos disponíveis para apoio às rotinas do sistema.
                  </AlertDescription>
                </Alert>

                <div className="mb-4 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por título, tipo ou categoria..."
                    value={searchDocumentosRequisitante}
                    onChange={(e) => setSearchDocumentosRequisitante(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-3">
                  {isLoadingDocumentos ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-600">Carregando documentos...</p>
                    </div>
                  ) : filteredDocumentosRequisitante.map((doc) => (
                    <Card key={doc.id} className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="bg-blue-100 p-3 rounded-lg">
                              <FileText size={24} className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-black">{doc.titulo}</h3>
                              <p className="text-sm text-gray-600 mt-1">{doc.categoria}</p>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getTipoBadgeClass(doc.tipo)}`}>
                                  {doc.tipo}
                                </span>
                                <span className="text-xs text-gray-500">{doc.tamanho}</span>
                                <span className="text-xs text-gray-500">{doc.versao}</span>
                                <span className="text-xs text-gray-500">Publicado em {doc.dataPublicacao}</span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => window.open(doc.urlAssinada, '_blank', 'noopener,noreferrer')}>
                            <Download size={16} className="mr-2" />
                            Baixar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6 mt-6">
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar no FAQ..."
                    value={searchFaqRequisitante}
                    onChange={(e) => setSearchFaqRequisitante(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="pt-3 pb-1">
                <CardTitle className="text-xl text-black px-[0px] py-[8px] flex items-center gap-2">
                  <HelpCircle size={20} className="text-[#003366]" />
                  Perguntas Frequentes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {filteredFaqRequisitante.length > 0 ? (
                  <Accordion type="single" collapsible className="mt-4 space-y-2">
                    {filteredFaqRequisitante.map((item) => (
                      <AccordionItem
                        key={item.id}
                        value={item.id}
                        className="border border-gray-200 rounded-lg px-4"
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <span className="text-left text-black">{item.pergunta}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 pb-4">
                          {item.resposta}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="p-8 text-center">
                    <Search size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">Nenhuma pergunta encontrada</p>
                    <p className="text-sm text-gray-500 mt-1">Tente buscar com outras palavras-chave</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Ajuda e Suporte</h2>
          <p className="text-gray-600 mt-1">Central de ajuda com chatbot, treinamento e abertura de chamados</p>
        </div>
        {activeTab === 'chamados' && podeAbrirChamado && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                <Plus size={20} className="mr-2" />
                Abrir Chamado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
              {/* Área scrollável */}
              <div className="flex-1 overflow-y-auto px-6">
                <DialogHeader className="pt-6">
                  <DialogTitle>Abrir Novo Chamado</DialogTitle>
                  <DialogDescription>
                    Abra um chamado de suporte técnico para resolver sua questão.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 pb-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select value={novoChamadoForm.categoria} onValueChange={(value) => setNovoChamadoForm((prev) => ({ ...prev, categoria: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sistema">Problema no Sistema</SelectItem>
                        <SelectItem value="duvida">Dúvida</SelectItem>
                        <SelectItem value="acesso">Problema de Acesso</SelectItem>
                        <SelectItem value="relatorio">Relatórios</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select value={novoChamadoForm.prioridade} onValueChange={(value) => setNovoChamadoForm((prev) => ({ ...prev, prioridade: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="titulo">Título do Chamado</Label>
                    <Input id="titulo" placeholder="Descreva brevemente o problema" value={novoChamadoForm.titulo} onChange={(e) => setNovoChamadoForm((prev) => ({ ...prev, titulo: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="descricao">Descrição Detalhada</Label>
                    <Textarea id="descricao" placeholder="Descreva o problema em detalhes..." rows={4} value={novoChamadoForm.descricao} onChange={(e) => setNovoChamadoForm((prev) => ({ ...prev, descricao: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Footer fixo */}
              <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                <Button variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                  onClick={abrirChamado}
                  disabled={chamadoAberto}
                >
                  {chamadoAberto ? 'Abrindo...' : 'Abrir Chamado'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Estatísticas de Suporte */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chamados Abertos</p>
                <p className="text-2xl text-red-600">{estatisticasSuporte.chamadosAbertos}</p>
              </div>
              <AlertTriangle size={32} className="text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chamados Resolvidos</p>
                <p className="text-2xl text-green-600">{estatisticasSuporte.chamadosResolvidos}</p>
              </div>
              <CheckCircle size={32} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Médio</p>
                <p className="text-2xl text-blue-600">{estatisticasSuporte.tempoMedioResolucao}</p>
              </div>
              <Clock size={32} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfação</p>
                <p className="text-2xl text-green-600">{estatisticasSuporte.satisfacaoUsuario}</p>
              </div>
              <CheckCircle size={32} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="treinamento">Treinamento</TabsTrigger>
          <TabsTrigger value="manuais">Manuais e Documentos</TabsTrigger>
          <TabsTrigger value="chamados">Chamados</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* Tab: Treinamento */}
        <TabsContent value="treinamento" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                  <GraduationCap size={20} className="text-[#003366]" />
                  Materiais de Treinamento
                </CardTitle>
                {currentProfile === 'admin' && (
                  <Dialog open={isCriarTreinamentoOpen} onOpenChange={setIsCriarTreinamentoOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                        <Plus size={20} className="mr-2" />
                        Criar Novo Treinamento
                      </Button>
                    </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
              {/* Área scrollável */}
              <div className="flex-1 overflow-y-auto px-6">
                <DialogHeader className="pt-6">
                  <DialogTitle>Criar Novo Treinamento</DialogTitle>
                  <DialogDescription>
                    Crie um novo material de treinamento para os usuários do sistema
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 pb-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="treinamento-titulo">Título do Treinamento *</Label>
                    <Input 
                      id="treinamento-titulo" 
                      placeholder="Ex: Guia de Início Rápido para Administradores"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="treinamento-categoria">Categoria *</Label>
                    <Select>
                      <SelectTrigger id="treinamento-categoria">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="regulamento">Regulamento</SelectItem>
                        <SelectItem value="procedimento">Procedimento</SelectItem>
                        <SelectItem value="fluxograma">Fluxograma</SelectItem>
                        <SelectItem value="template">Template/Modelo</SelectItem>
                        <SelectItem value="legislacao">Legislação</SelectItem>
                        <SelectItem value="tabela">Tabela de Referência</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="treinamento-descricao">Descrição</Label>
                    <Textarea 
                      id="treinamento-descricao" 
                      placeholder="Breve descrição sobre o conteúdo do treinamento..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="treinamento-data">Data de Criação *</Label>
                    <Input 
                      id="treinamento-data" 
                      type="date"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="treinamento-arquivo">Arquivo do Treinamento *</Label>
                    <FileInput id="treinamento-arquivo" accept=".pdf,.doc,.docx,.zip" />
                    <p className="text-xs text-gray-500">
                      Formatos aceitos: PDF, DOC, DOCX, ZIP (máx. 20MB)
                    </p>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Importante:</strong> Este treinamento ficará disponível para todos os usuários do sistema, incluindo requisitantes. Certifique-se de que o conteúdo é adequado para visualização pública.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Footer fixo */}
              <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsCriarTreinamentoOpen(false)}
                  disabled={treinamentoCriando}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                  onClick={criarTreinamento}
                  disabled={treinamentoCriando}
                >
                  {treinamentoCriando ? (
                    <>
                      <Upload size={16} className="mr-2 animate-pulse" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      Criar Treinamento
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-[24px] py-[0px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <GraduationCap size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-black">Guia de Início Rápido</h3>
                        <p className="text-sm text-gray-600 mt-1">Aprenda o básico do sistema em 15 minutos</p>
                        <BadgeStatus intent="info" weight="medium" className="mt-2">PDF • 2.5 MB</BadgeStatus>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <GraduationCap size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-black">Gestão de Processos</h3>
                        <p className="text-sm text-gray-600 mt-1">Tutorial completo sobre processos licitatórios</p>
                        <BadgeStatus intent="success" weight="medium" className="mt-2">Vídeo • 25 min</BadgeStatus>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <GraduationCap size={24} className="text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-black">Relatórios e Análises</h3>
                        <p className="text-sm text-gray-600 mt-1">Como gerar e interpretar relatórios</p>
                        <BadgeStatus intent="purple" weight="medium" className="mt-2">PDF • 1.8 MB</BadgeStatus>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <GraduationCap size={24} className="text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-black">Gestão de Fornecedores</h3>
                        <p className="text-sm text-gray-600 mt-1">Cadastro e controle de fornecedores</p>
                        <BadgeStatus intent="orange" weight="medium" className="mt-2">Vídeo • 18 min</BadgeStatus>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Manuais e Documentos Institucionais */}
        <TabsContent value="manuais" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                  <HelpCircle size={20} className="text-[#003366]" />
                  Downloads Institucionais
                </CardTitle>
                {currentProfile === 'admin' && (
                  <Dialog open={isUploadDocumentoOpen} onOpenChange={setIsUploadDocumentoOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                        <Plus size={20} className="mr-2" />
                        Adicionar Documento Institucional
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
                      {/* Área scrollável */}
                      <div className="flex-1 overflow-y-auto px-6">
                        <DialogHeader className="pt-6">
                          <DialogTitle>Adicionar Documento Institucional</DialogTitle>
                          <DialogDescription>
                            Faça o upload de um novo documento institucional e preencha os metadados
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 pb-6">
                          <div className="space-y-1.5">
                            <Label htmlFor="doc-titulo">Título do Documento *</Label>
                            <Input 
                              id="doc-titulo" 
                              placeholder="Ex: Manual de Compras e Licitações SESC 2024"
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <Label htmlFor="doc-categoria">Categoria *</Label>
                            <Select>
                              <SelectTrigger id="doc-categoria">
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manual">Manual</SelectItem>
                                <SelectItem value="regulamento">Regulamento</SelectItem>
                                <SelectItem value="procedimento">Procedimento</SelectItem>
                                <SelectItem value="fluxograma">Fluxograma</SelectItem>
                                <SelectItem value="template">Template/Modelo</SelectItem>
                                <SelectItem value="legislacao">Legislação</SelectItem>
                                <SelectItem value="tabela">Tabela de Referência</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="doc-descricao">Descrição</Label>
                            <Textarea 
                              id="doc-descricao" 
                              placeholder="Breve descrição sobre o conteúdo do documento..."
                              rows={3}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="doc-data">Data de Atualização *</Label>
                            <Input 
                              id="doc-data" 
                              type="date"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="doc-arquivo">Arquivo do Documento *</Label>
                            <FileInput id="doc-arquivo" accept=".pdf,.doc,.docx,.zip" />
                            <p className="text-xs text-gray-500">
                              Formatos aceitos: PDF, DOC, DOCX, ZIP (máx. 20MB)
                            </p>
                          </div>

                          <Alert className="border-blue-200 bg-blue-50">
                            <HelpCircle className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800 text-sm">
                              <strong>Importante:</strong> Este documento ficará disponível para todos os usuários do sistema, incluindo requisitantes. Certifique-se de que o conteúdo é adequado para visualização pública.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>

                      {/* Footer fixo */}
                      <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setIsUploadDocumentoOpen(false)}
                          disabled={documentoUploadando}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                          onClick={uploadDocumento}
                          disabled={documentoUploadando}
                        >
                          {documentoUploadando ? (
                            <>
                              <Upload size={16} className="mr-2 animate-pulse" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Upload size={16} className="mr-2" />
                              Adicionar Documento
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Consulte os manuais, regulamentos e documentos institucionais do setor de compras. Estes documentos estão disponíveis para todos os usuários, incluindo requisitantes.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {isLoadingDocumentos ? (
                  <div className="p-8 text-center text-gray-600">Carregando downloads institucionais...</div>
                ) : filteredDocumentosRequisitante.length > 0 ? (
                  filteredDocumentosRequisitante.map((doc) => (
                    <Card key={doc.id} className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="bg-blue-100 p-3 rounded-lg">
                              <HelpCircle size={24} className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-black">{doc.titulo}</h3>
                              <p className="text-sm text-gray-600 mt-1">{doc.categoria}</p>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getTipoBadgeClass(doc.tipo)}`}>
                                  {doc.tipo}
                                </span>
                                <span className="text-xs text-gray-500">{doc.tamanho}</span>
                                <span className="text-xs text-gray-500">{doc.versao}</span>
                                <span className="text-xs text-gray-500">Publicado em {doc.dataPublicacao}</span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => window.open(doc.urlAssinada, '_blank', 'noopener,noreferrer')}>
                            <Download size={16} className="mr-2" />
                            Baixar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    Nenhum download institucional disponível no momento.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Chamados */}
        <TabsContent value="chamados" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                <LifeBuoy size={20} className="text-[#003366]" />
                Chamados de Suporte
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
              {/* Filtros */}
              <Card className="border border-gray-200 mb-4">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Buscar por número ou título..."
                          value={filtroBusca}
                          onChange={(e) => setFiltroBusca(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-48">
                      <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                        <SelectTrigger>
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas as Categorias</SelectItem>
                          <SelectItem value="Sistema">Sistema</SelectItem>
                          <SelectItem value="Dúvida">Dúvida</SelectItem>
                          <SelectItem value="Acesso/Perfil">Acesso/Perfil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full md:w-48">
                      <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
                        <SelectTrigger>
                          <SelectValue placeholder="Prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas as Prioridades</SelectItem>
                          <SelectItem value="Urgente">Urgente</SelectItem>
                          <SelectItem value="Alta">Alta</SelectItem>
                          <SelectItem value="Média">Média</SelectItem>
                          <SelectItem value="Baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full md:w-48">
                      <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os Status</SelectItem>
                          <SelectItem value="Aberto">Aberto</SelectItem>
                          <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                          <SelectItem value="Aguardando TI">Aguardando TI</SelectItem>
                          <SelectItem value="Aguardando Usuário">Aguardando Usuário</SelectItem>
                          <SelectItem value="Resolvido">Resolvido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(filtroBusca || filtroCategoria !== 'todos' || filtroPrioridade !== 'todos' || filtroStatus !== 'todos') && (
                      <Button 
                        variant="outline" 
                        onClick={limparFiltros}
                        className="w-full md:w-auto"
                      >
                        <X size={16} className="mr-2" />
                        Limpar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de Chamados */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#003366] sticky top-0">
                    <TableRow>
                      <TableHead className="text-white">Número</TableHead>
                      <TableHead className="text-white">Título</TableHead>
                      <TableHead className="text-white">Categoria</TableHead>
                      <TableHead className="text-white">Prioridade</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Data Abertura</TableHead>
                      <TableHead className="text-white">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chamadosFiltrados.length > 0 ? (
                      chamadosFiltrados.map(chamado => (
                        <TableRow key={chamado.id}>
                          <TableCell className="text-gray-600">{chamado.numero}</TableCell>
                          <TableCell className="text-gray-600">{chamado.titulo}</TableCell>
                          <TableCell className="text-gray-600">{chamado.categoria}</TableCell>
                          <TableCell>
                            <BadgeStatus {...getPrioridadeBadge(chamado.prioridade)}>
                              {chamado.prioridade}
                            </BadgeStatus>
                          </TableCell>
                          <TableCell>
                            <BadgeStatus {...getStatusBadge(chamado.status)}>
                              {chamado.status}
                            </BadgeStatus>
                          </TableCell>
                          <TableCell className="text-gray-600">{chamado.dataAbertura}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => abrirDetalhesChamado(chamado)}
                            >
                              <Eye size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Nenhum chamado encontrado com os filtros aplicados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: FAQ */}
        <TabsContent value="faq" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                  <HelpCircle size={20} className="text-[#003366]" />
                  Perguntas Frequentes (FAQ)
                </CardTitle>
                {podeGerenciarFaq && (
                  <Button className="bg-[#003366] hover:bg-[#002244] text-white" onClick={abrirModalNovoFaq}>
                    <Plus size={16} className="mr-2" />
                    Cadastrar FAQ
                  </Button>
                )}
              </div>
            </CardHeader>
            <Dialog open={isNovoFaqOpen} onOpenChange={setIsNovoFaqOpen}>
              <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
                <div className="flex-1 overflow-y-auto px-6">
                  <DialogHeader className="pt-6">
                    <DialogTitle>{faqEmEdicao !== null ? 'Editar Pergunta (FAQ)' : 'Cadastrar Nova Pergunta (FAQ)'}</DialogTitle>
                    <DialogDescription>
                      Adicione uma nova pergunta e resposta para a base de conhecimento.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 pb-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="faq-pergunta">Pergunta *</Label>
                      <Input
                        id="faq-pergunta"
                        placeholder="Digite a pergunta frequente"
                        value={novaPergunta}
                        onChange={(e) => setNovaPergunta(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="faq-resposta">Resposta *</Label>
                      <Textarea
                        id="faq-resposta"
                        rows={3}
                        placeholder="Digite a resposta da FAQ"
                        value={novaResposta}
                        onChange={(e) => setNovaResposta(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="faq-categoria">Categoria *</Label>
                      <Select value={novaCategoria} onValueChange={setNovaCategoria}>
                        <SelectTrigger id="faq-categoria">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Processos">Processos</SelectItem>
                          <SelectItem value="Penalidades">Penalidades</SelectItem>
                          <SelectItem value="Relatórios">Relatórios</SelectItem>
                          <SelectItem value="Contratos">Contratos</SelectItem>
                          <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                          <SelectItem value="Sistema">Sistema</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setFaqEmEdicao(null);
                      setNovaPergunta('');
                      setNovaResposta('');
                      setNovaCategoria('');
                      setIsNovoFaqOpen(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                    onClick={() => void salvarNovoFaq()}
                    disabled={!novaPergunta.trim() || !novaResposta.trim() || !novaCategoria}
                  >
                    {faqEmEdicao !== null ? 'Salvar Alterações' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <CardContent className="pt-[16px] pr-[24px] pb-[24px] pl-[24px]">
              <Accordion type="multiple" className="mt-2 space-y-2">
                {faqs.map(item => (
                  <AccordionItem key={item.id} value={`item-${item.id}`} className="border border-gray-200 rounded-lg px-4 bg-gray-50">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-start justify-between gap-3 flex-1 text-left">
                        <span className="text-black">{item.pergunta}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-2">
                      <p className="text-sm text-gray-600 mb-3">{item.resposta}</p>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <BadgeStatus intent="info" weight="light">{item.categoria}</BadgeStatus>
                          <span className="text-xs text-gray-500">{item.visualizacoes} visualizações</span>
                        </div>
                        {podeGerenciarFaq && (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => abrirModalEdicao(item)}>
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFaqToDelete(item.id);
                                setIsDeleteFaqDialogOpen(true);
                              }}
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={isDeleteFaqDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteFaqDialogOpen(open);
          if (!open) {
            setFaqToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta pergunta do FAQ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFaqToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (faqToDelete !== null) {
                  void excluirFaq(faqToDelete);
                }
                setIsDeleteFaqDialogOpen(false);
                setFaqToDelete(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
