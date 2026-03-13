"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeNew } from "@/components/ui/badge-new";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Archive, MoreVertical, Eye, History, FileText, Download, Upload } from "lucide-react";
import { getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { FileInput } from "@/components/ui/file-input";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getFornecedores } from "@/services/fornecedoresService";
import { getProcessos } from "@/services/processosService";
import { getDocumentos, uploadDocumento, type DocumentoItem } from "@/services/documentosService";
import { aplicarPenalidade, getPenalidades, updatePenalidadeStatus, type AplicarPenalidadePayload, type Penalidade } from "@/services/penalidadesService";
import type { Fornecedor, ProcessoComDetalhes } from "@/types";

interface GerenciadorPenalidadesProps {
  viewMode: "admin" | "comprador";
}

interface PenalidadeTabela {
  id: string;
  fornecedorId: string;
  processoId: string | null;
  empresa: string;
  processo: string;
  notificacoes: number;
  penalidade: string;
  valorNumero: number;
  valor: string;
  status: Penalidade["status"];
  dataOcorrencia: string;
  dataAplicacao: string;
  dataOcorrenciaRaw: string | null;
  dataAplicacaoRaw: string | null;
  responsavel: string;
  parecerTecnico: string;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcularTempoVigencia(dataOcorrencia?: string | null) {
  if (!dataOcorrencia) return "-";

  const dataOcorrenciaObj = new Date(dataOcorrencia);
  if (Number.isNaN(dataOcorrenciaObj.getTime())) return "-";

  const hoje = new Date();
  const diffTime = Math.abs(hoje.getTime() - dataOcorrenciaObj.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) return `${diffDays} dias`;
  if (diffDays < 365) {
    const meses = Math.floor(diffDays / 30);
    return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  }

  const anos = Math.floor(diffDays / 365);
  const mesesRestantes = Math.floor((diffDays % 365) / 30);
  if (mesesRestantes > 0) {
    return `${anos} ${anos === 1 ? "ano" : "anos"} e ${mesesRestantes} ${mesesRestantes === 1 ? "mês" : "meses"}`;
  }
  return `${anos} ${anos === 1 ? "ano" : "anos"}`;
}

export function GerenciadorPenalidades({ viewMode }: GerenciadorPenalidadesProps) {
  const { currentProfile, currentUser } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const isAdminView = viewMode === "admin";
  const canApplyPenalidade = isAdminView || currentProfile === "comprador";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [detalhePenalidade, setDetalhePenalidade] = useState<PenalidadeTabela | null>(null);
  const [contestandoPenalidade, setContestandoPenalidade] = useState<PenalidadeTabela | null>(null);
  const [penalidadeParaEncerrar, setPenalidadeParaEncerrar] = useState<PenalidadeTabela | null>(null);
  const [penalidadesRaw, setPenalidadesRaw] = useState<Penalidade[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [processos, setProcessos] = useState<ProcessoComDetalhes[]>([]);
  const [documentosPenalidade, setDocumentosPenalidade] = useState<DocumentoItem[]>([]);
  const [isLoadingDocumentos, setIsLoadingDocumentos] = useState(false);
  const [uploadDocumentoFile, setUploadDocumentoFile] = useState<File | null>(null);
  const [parecerContestacao, setParecerContestacao] = useState("");
  const [formData, setFormData] = useState({
    fornecedorId: "",
    processoId: "",
    dataAplicacao: "",
    tipoPenalidade: "",
    valor: "",
    justificativa: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [penalidades, fornecedoresData, processosData] = await Promise.all([
        getPenalidades(),
        getFornecedores(),
        getProcessos(),
      ]);
      setPenalidadesRaw(penalidades);
      setFornecedores(fornecedoresData);
      setProcessos(processosData);
    } catch (error) {
      toast.error("Erro ao carregar penalidades", {
        description: error instanceof Error ? error.message : "Não foi possível carregar o módulo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("penalidades-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "penalidades" }, () => {
        void loadData();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    const loadDocumentosPenalidade = async () => {
      if (!detalhePenalidade?.processoId) {
        setDocumentosPenalidade([]);
        setUploadDocumentoFile(null);
        return;
      }

      setIsLoadingDocumentos(true);
      try {
        const documentos = await getDocumentos({ processo_id: detalhePenalidade.processoId, tipo: "Penalidade" });
        setDocumentosPenalidade(documentos);
      } catch (error) {
        toast.error("Erro ao carregar documentos da penalidade", {
          description: error instanceof Error ? error.message : "Não foi possível listar os documentos vinculados.",
        });
      } finally {
        setIsLoadingDocumentos(false);
      }
    };

    void loadDocumentosPenalidade();
  }, [detalhePenalidade]);

  const penalidades = useMemo<PenalidadeTabela[]>(
    () =>
      penalidadesRaw.map((penalidade) => ({
        id: penalidade.id,
        fornecedorId: penalidade.fornecedor_id,
        processoId: penalidade.processo_id,
        empresa: penalidade.fornecedor?.razao_social || "-",
        processo: penalidade.processo?.numero_requisicao || "-",
        notificacoes: penalidade.notificacoes_enviadas || 0,
        penalidade: penalidade.tipo_penalidade,
        valorNumero: Number(penalidade.valor || 0),
        valor: formatCurrency(penalidade.valor),
        status: penalidade.status,
        dataOcorrencia: formatDate(penalidade.data_ocorrencia),
        dataAplicacao: formatDate(penalidade.data_aplicacao),
        dataOcorrenciaRaw: penalidade.data_ocorrencia,
        dataAplicacaoRaw: penalidade.data_aplicacao,
        responsavel: penalidade.responsavel?.nome || "-",
        parecerTecnico: penalidade.parecer_tecnico || "",
      })),
    [penalidadesRaw]
  );

  const penalidadesAtivas = useMemo(
    () => penalidades.filter((item) => ["Registrada", "Aplicada", "Contestada"].includes(item.status)),
    [penalidades]
  );

  const penalidadesArquivadas = useMemo(
    () => penalidades.filter((item) => ["Quitada", "Arquivada"].includes(item.status)),
    [penalidades]
  );

  const statusCounts = useMemo(
    () => ({
      todas: penalidadesAtivas.length,
      aplicada: penalidadesAtivas.filter((p) => p.status === "Aplicada").length,
      contestada: penalidadesAtivas.filter((p) => p.status === "Contestada").length,
      vencida: penalidadesArquivadas.filter((p) => p.status === "Quitada" || p.status === "Arquivada").length,
      encerradas: penalidadesArquivadas.length,
    }),
    [penalidadesArquivadas, penalidadesAtivas]
  );

  const filteredPenalidades = useMemo(
    () =>
      penalidadesAtivas.filter((penalidade) => {
        const termo = searchTerm.toLowerCase();
        const matchesSearch =
          penalidade.empresa.toLowerCase().includes(termo) ||
          penalidade.processo.toLowerCase().includes(termo) ||
          penalidade.penalidade.toLowerCase().includes(termo);
        const matchesStatus = statusFilter === "todas" || penalidade.status.toLowerCase().replace(/\s+/g, "-") === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [penalidadesAtivas, searchTerm, statusFilter]
  );

  const filteredEncerradas = useMemo(
    () =>
      penalidadesArquivadas.filter((penalidade) => {
        const termo = searchTerm.toLowerCase();
        return (
          penalidade.empresa.toLowerCase().includes(termo) ||
          penalidade.processo.toLowerCase().includes(termo) ||
          penalidade.penalidade.toLowerCase().includes(termo)
        );
      }),
    [penalidadesArquivadas, searchTerm]
  );

  const { items: sortedPenalidades, requestSort: sortPenalidades, sortConfig: configPenalidades } = useTableSort(filteredPenalidades);
  const { items: sortedEncerradas, requestSort: sortEncerradas, sortConfig: configEncerradas } = useTableSort(filteredEncerradas);

  const totalValor = useMemo(
    () => penalidadesAtivas.filter((p) => p.status === "Aplicada").reduce((sum, p) => sum + p.valorNumero, 0),
    [penalidadesAtivas]
  );

  const resetForm = () => {
    setFormData({
      fornecedorId: "",
      processoId: "",
      dataAplicacao: "",
      tipoPenalidade: "",
      valor: "",
      justificativa: "",
    });
  };

  const handleAplicarPenalidade = async () => {
    if (!currentUser?.id || isSubmitting) return;

    const payload: AplicarPenalidadePayload = {
      fornecedor_id: formData.fornecedorId,
      processo_id: formData.processoId || null,
      tipo_penalidade: formData.tipoPenalidade,
      valor: formData.valor ? Number(formData.valor.replace(/\./g, "").replace(",", ".")) : 0,
      data_aplicacao: formData.dataAplicacao || null,
      data_ocorrencia: formData.dataAplicacao || new Date().toISOString().slice(0, 10),
      parecer_tecnico: formData.justificativa || null,
      status: "Aplicada",
      responsavel_id: currentUser.id,
    };

    if (!payload.fornecedor_id || !payload.tipo_penalidade) {
      toast.error("Preencha empresa e tipo de penalidade.");
      return;
    }

    setIsSubmitting(true);
    try {
      await aplicarPenalidade(payload);
      toast.success("Penalidade aplicada com sucesso!");
      setIsApplyModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao aplicar penalidade", {
        description: error instanceof Error ? error.message : "Não foi possível salvar a penalidade.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistrarDefesa = async () => {
    if (!contestandoPenalidade || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updatePenalidadeStatus(contestandoPenalidade.id, "Contestada", parecerContestacao || "Defesa registrada no módulo de penalidades.");
      toast.success("Defesa registrada com sucesso!");
      setContestandoPenalidade(null);
      setParecerContestacao("");
    } catch (error) {
      toast.error("Erro ao registrar defesa", {
        description: error instanceof Error ? error.message : "Não foi possível atualizar a penalidade.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEncerrar = async () => {
    if (!penalidadeParaEncerrar || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updatePenalidadeStatus(
        penalidadeParaEncerrar.id,
        "Quitada",
        penalidadeParaEncerrar.parecerTecnico || "Penalidade encerrada manualmente no módulo operacional."
      );
      toast.success("Penalidade encerrada com sucesso!");
      setPenalidadeParaEncerrar(null);
    } catch (error) {
      toast.error("Erro ao encerrar penalidade", {
        description: error instanceof Error ? error.message : "Não foi possível concluir o encerramento.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadDocumentoPenalidade = async () => {
    if (!detalhePenalidade || !detalhePenalidade.processoId || !uploadDocumentoFile || !currentUser?.id || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await uploadDocumento(
        uploadDocumentoFile,
        {
          fornecedor_id: detalhePenalidade.fornecedorId,
          processo_id: detalhePenalidade.processoId,
          empresa: detalhePenalidade.empresa,
          processo: detalhePenalidade.processo,
          tipo: "Penalidade",
          categoria: "Penalidade",
          periodo: new Date().getFullYear().toString(),
          palavras_chave: ["penalidade", detalhePenalidade.empresa, detalhePenalidade.processo],
          descricao: `Documento vinculado à penalidade ${detalhePenalidade.penalidade}`,
          titulo: `${detalhePenalidade.penalidade} - ${detalhePenalidade.processo}`,
          acesso_publico: false,
        },
        currentUser.id
      );

      const documentosAtualizados = await getDocumentos({ processo_id: detalhePenalidade.processoId, tipo: "Penalidade" });
      setDocumentosPenalidade(documentosAtualizados);
      setUploadDocumentoFile(null);
      toast.success("Documento anexado com sucesso!");
    } catch (error) {
      toast.error("Erro ao anexar documento", {
        description: error instanceof Error ? error.message : "Não foi possível enviar o arquivo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Penalidades</h2>
          <p className="text-gray-600 mt-1">Gestão e controle de penalidades contratuais</p>
        </div>
        {canApplyPenalidade && (
          <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                <Plus size={20} className="mr-2" />
                Aplicar Penalidade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
              <div className="flex-1 overflow-y-auto px-6">
                <DialogHeader className="pt-6">
                  <DialogTitle>Aplicar Nova Penalidade</DialogTitle>
                  <DialogDescription>Aplique uma penalidade a um fornecedor por descumprimento contratual.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 pb-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Select value={formData.fornecedorId} onValueChange={(value) => setFormData((prev) => ({ ...prev, fornecedorId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {fornecedores.map((fornecedor) => (
                          <SelectItem key={fornecedor.id} value={fornecedor.id}>{fornecedor.razao_social}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="processo">Número do Processo</Label>
                    <Select value={formData.processoId} onValueChange={(value) => setFormData((prev) => ({ ...prev, processoId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o processo" />
                      </SelectTrigger>
                      <SelectContent>
                        {processos.map((processo) => (
                          <SelectItem key={processo.id} value={processo.id}>{processo.numero_requisicao || processo.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dataAplicacao">Data de Aplicação</Label>
                    <Input type="date" id="dataAplicacao" value={formData.dataAplicacao} onChange={(e) => setFormData((prev) => ({ ...prev, dataAplicacao: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tipoPenalidade">Tipo de Penalidade</Label>
                    <Select value={formData.tipoPenalidade} onValueChange={(value) => setFormData((prev) => ({ ...prev, tipoPenalidade: value }))}>
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
                    <Label htmlFor="valor">Valor da Penalidade</Label>
                    <Input id="valor" placeholder="R$ 0,00" value={formData.valor} onChange={(e) => setFormData((prev) => ({ ...prev, valor: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="justificativa">Justificativa</Label>
                    <Textarea id="justificativa" placeholder="Descreva a justificativa para a penalidade..." rows={3} value={formData.justificativa} onChange={(e) => setFormData((prev) => ({ ...prev, justificativa: e.target.value }))} />
                  </div>
                </div>
              </div>
              <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                <Button variant="outline" className="flex-1" onClick={() => setIsApplyModalOpen(false)}>Cancelar</Button>
                <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" disabled={isSubmitting} onClick={() => void handleAplicarPenalidade()}>
                  Aplicar Penalidade
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-black">{statusCounts.todas}</p><p className="text-xs leading-4 text-[#4a5565]">Ativas</p></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-[#e7000b]">{statusCounts.aplicada}</p><p className="text-xs leading-4 text-[#4a5565]">Aplicadas</p></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-[#155dfc]">{statusCounts.contestada}</p><p className="text-xs leading-4 text-[#4a5565]">Contestadas</p></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-[#9810fa]">{statusCounts.vencida}</p><p className="text-xs leading-4 text-[#4a5565]">Encerradas</p></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-xl leading-8 text-black">{formatCurrency(totalValor)}</p><p className="text-xs leading-4 text-[#4a5565] w-[83px]">Valor Total Aplicado</p></div></CardContent></Card>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1"><div className="relative"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><Input placeholder="Buscar por empresa, processo ou tipo de penalidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div>
            <div className="w-full md:w-48"><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="Filtrar por status" /></SelectTrigger><SelectContent><SelectItem value="todas">Todos os Status</SelectItem><SelectItem value="registrada">Registrada</SelectItem><SelectItem value="aplicada">Aplicada</SelectItem><SelectItem value="contestada">Contestada</SelectItem></SelectContent></Select></div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ativas" className="w-full">
        <TabsList className="grid w-full max-w-[450px] grid-cols-2">
          <TabsTrigger value="ativas">Penalidades Ativas ({statusCounts.todas})</TabsTrigger>
          <TabsTrigger value="encerradas">Encerradas ({statusCounts.encerradas})</TabsTrigger>
        </TabsList>

        <TabsContent value="ativas">
          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1"><CardTitle className="text-xl text-black px-[0px] py-[8px]">Histórico Completo</CardTitle></CardHeader>
            <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader><TableRow>
                    <SortableTableHead label="Empresa" onClick={() => sortPenalidades("empresa")} currentDirection={configPenalidades?.key === "empresa" ? configPenalidades.direction : null} className="sticky left-0 z-10 min-w-[200px] bg-white" />
                    <SortableTableHead label="Processo" onClick={() => sortPenalidades("processo")} currentDirection={configPenalidades?.key === "processo" ? configPenalidades.direction : null} className="min-w-[120px]" />
                    <SortableTableHead label="Notificações" onClick={() => sortPenalidades("notificacoes")} currentDirection={configPenalidades?.key === "notificacoes" ? configPenalidades.direction : null} className="min-w-[120px]" />
                    <SortableTableHead label="Penalidade" onClick={() => sortPenalidades("penalidade")} currentDirection={configPenalidades?.key === "penalidade" ? configPenalidades.direction : null} className="min-w-[200px]" />
                    <SortableTableHead label="Multa" onClick={() => sortPenalidades("valorNumero")} currentDirection={configPenalidades?.key === "valorNumero" ? configPenalidades.direction : null} className="min-w-[120px]" />
                    <SortableTableHead label="Status" onClick={() => sortPenalidades("status")} currentDirection={configPenalidades?.key === "status" ? configPenalidades.direction : null} className="min-w-[140px]" />
                    <SortableTableHead label="Data Ocorrência" onClick={() => sortPenalidades("dataOcorrenciaRaw")} currentDirection={configPenalidades?.key === "dataOcorrenciaRaw" ? configPenalidades.direction : null} className="min-w-[140px]" />
                    <SortableTableHead label="Data Aplicação" onClick={() => sortPenalidades("dataAplicacaoRaw")} currentDirection={configPenalidades?.key === "dataAplicacaoRaw" ? configPenalidades.direction : null} className="min-w-[140px]" />
                    <TableHead className="min-w-[140px]">Tempo de Vigência</TableHead>
                    {isAdminView && <SortableTableHead label="Responsável" onClick={() => sortPenalidades("responsavel")} currentDirection={configPenalidades?.key === "responsavel" ? configPenalidades.direction : null} className="min-w-[160px]" />}
                    <TableHead className="min-w-[100px]">Ações</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {sortedPenalidades.map((penalidade) => (
                      <TableRow key={penalidade.id}>
                        <TableCell className="text-black sticky left-0 z-10 bg-white">{penalidade.empresa}</TableCell>
                        <TableCell className="text-black">{penalidade.processo}</TableCell>
                        <TableCell className="text-gray-600">{penalidade.notificacoes}</TableCell>
                        <TableCell className="text-gray-600">{penalidade.penalidade}</TableCell>
                        <TableCell className="text-black">{penalidade.valor}</TableCell>
                        <TableCell><BadgeNew {...getBadgeMappingForStatus(penalidade.status)}>{penalidade.status}</BadgeNew></TableCell>
                        <TableCell className="text-gray-600">{penalidade.dataOcorrencia}</TableCell>
                        <TableCell className="text-gray-600">{penalidade.dataAplicacao}</TableCell>
                        <TableCell className="text-gray-600">{calcularTempoVigencia(penalidade.dataOcorrenciaRaw)}</TableCell>
                        {isAdminView && <TableCell className="text-gray-600">{penalidade.responsavel}</TableCell>}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical size={16} className="text-gray-600" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setDetalhePenalidade(penalidade)}><Eye size={16} className="mr-2" />Ver Detalhes</DropdownMenuItem>
                              {canApplyPenalidade && (
                                <>
                                  <DropdownMenuSeparator />
                                  {(penalidade.status === "Aplicada" || penalidade.status === "Registrada") && (
                                    <DropdownMenuItem onClick={() => { setContestandoPenalidade(penalidade); setParecerContestacao(penalidade.parecerTecnico); }}>
                                      Registrar Defesa
                                    </DropdownMenuItem>
                                  )}
                                  {(penalidade.status === "Aplicada" || penalidade.status === "Contestada" || penalidade.status === "Registrada") && (
                                    <DropdownMenuItem onClick={() => setPenalidadeParaEncerrar(penalidade)} className="text-gray-600">Encerrar</DropdownMenuItem>
                                  )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && sortedPenalidades.length === 0 && (
                      <TableRow><TableCell colSpan={isAdminView ? 11 : 10} className="text-center text-gray-500 py-8">Nenhuma penalidade ativa encontrada.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encerradas">
          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1"><CardTitle className="text-xl text-black px-[0px] py-[8px]">Penalidades Encerradas</CardTitle></CardHeader>
            <CardContent className="p-4">
              {filteredEncerradas.length === 0 ? (
                <div className="text-center py-8 text-gray-500"><Archive size={48} className="mx-auto mb-3 text-gray-300" /><p>Nenhuma penalidade encerrada</p></div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <SortableTableHead label="Empresa" onClick={() => sortEncerradas("empresa")} currentDirection={configEncerradas?.key === "empresa" ? configEncerradas.direction : null} className="sticky left-0 z-10 min-w-[200px] bg-white" />
                      <SortableTableHead label="Processo" onClick={() => sortEncerradas("processo")} currentDirection={configEncerradas?.key === "processo" ? configEncerradas.direction : null} className="min-w-[120px]" />
                      <SortableTableHead label="Notificações" onClick={() => sortEncerradas("notificacoes")} currentDirection={configEncerradas?.key === "notificacoes" ? configEncerradas.direction : null} className="min-w-[120px]" />
                      <SortableTableHead label="Penalidade" onClick={() => sortEncerradas("penalidade")} currentDirection={configEncerradas?.key === "penalidade" ? configEncerradas.direction : null} className="min-w-[200px]" />
                      <SortableTableHead label="Multa" onClick={() => sortEncerradas("valorNumero")} currentDirection={configEncerradas?.key === "valorNumero" ? configEncerradas.direction : null} className="min-w-[120px]" />
                      <SortableTableHead label="Status" onClick={() => sortEncerradas("status")} currentDirection={configEncerradas?.key === "status" ? configEncerradas.direction : null} className="min-w-[140px]" />
                      <SortableTableHead label="Data Ocorrência" onClick={() => sortEncerradas("dataOcorrenciaRaw")} currentDirection={configEncerradas?.key === "dataOcorrenciaRaw" ? configEncerradas.direction : null} className="min-w-[140px]" />
                      <SortableTableHead label="Data Aplicação" onClick={() => sortEncerradas("dataAplicacaoRaw")} currentDirection={configEncerradas?.key === "dataAplicacaoRaw" ? configEncerradas.direction : null} className="min-w-[140px]" />
                      <TableHead className="min-w-[140px]">Tempo de Vigência</TableHead>
                      {isAdminView && <SortableTableHead label="Responsável" onClick={() => sortEncerradas("responsavel")} currentDirection={configEncerradas?.key === "responsavel" ? configEncerradas.direction : null} className="min-w-[160px]" />}
                      <TableHead className="min-w-[100px]">Ações</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {sortedEncerradas.map((penalidade) => (
                        <TableRow key={penalidade.id}>
                          <TableCell className="text-black sticky left-0 z-10 bg-white">{penalidade.empresa}</TableCell>
                          <TableCell className="text-black">{penalidade.processo}</TableCell>
                          <TableCell className="text-gray-600">{penalidade.notificacoes}</TableCell>
                          <TableCell className="text-gray-600">{penalidade.penalidade}</TableCell>
                          <TableCell className="text-black">{penalidade.valor}</TableCell>
                          <TableCell><BadgeNew {...getBadgeMappingForStatus(penalidade.status)}>{penalidade.status}</BadgeNew></TableCell>
                          <TableCell className="text-gray-600">{penalidade.dataOcorrencia}</TableCell>
                          <TableCell className="text-gray-600">{penalidade.dataAplicacao}</TableCell>
                          <TableCell className="text-gray-600">{calcularTempoVigencia(penalidade.dataOcorrenciaRaw)}</TableCell>
                          {isAdminView && <TableCell className="text-gray-600">{penalidade.responsavel}</TableCell>}
                          <TableCell><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDetalhePenalidade(penalidade)}><Eye size={16} className="text-gray-600" /></Button></TableCell>
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

      {detalhePenalidade && (
        <Dialog open={!!detalhePenalidade} onOpenChange={(open) => !open && setDetalhePenalidade(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6 pb-4"><DialogTitle>Detalhes da Penalidade</DialogTitle><DialogDescription>Informações completas, histórico e documentos da penalidade</DialogDescription></DialogHeader>
              <Tabs defaultValue="dados" className="w-full pb-6">
                <TabsList className="grid w-full grid-cols-3 mb-4"><TabsTrigger value="dados">Dados da Penalidade</TabsTrigger><TabsTrigger value="historico">Histórico</TabsTrigger><TabsTrigger value="documentos">Documentos</TabsTrigger></TabsList>
                <TabsContent value="dados" className="space-y-4">
                  <Card><CardHeader><CardTitle className="text-lg">Informações Gerais</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-4"><div><Label className="text-gray-600">Empresa</Label><p className="text-black mt-1">{detalhePenalidade.empresa}</p></div><div><Label className="text-gray-600">Processo</Label><p className="text-black mt-1">{detalhePenalidade.processo}</p></div><div><Label className="text-gray-600">Tipo de Penalidade</Label><p className="text-black mt-1">{detalhePenalidade.penalidade}</p></div><div><Label className="text-gray-600">Valor da Penalidade</Label><p className="text-black mt-1">{detalhePenalidade.valor}</p></div><div><Label className="text-gray-600">Status Atual</Label><div className="mt-1"><BadgeNew {...getBadgeMappingForStatus(detalhePenalidade.status)}>{detalhePenalidade.status}</BadgeNew></div></div><div><Label className="text-gray-600">Responsável</Label><p className="text-black mt-1">{detalhePenalidade.responsavel}</p></div></CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-lg">Datas e Prazos</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-4"><div><Label className="text-gray-600">Data de Ocorrência</Label><p className="text-black mt-1">{detalhePenalidade.dataOcorrencia}</p></div><div><Label className="text-gray-600">Data de Aplicação</Label><p className="text-black mt-1">{detalhePenalidade.dataAplicacao}</p></div><div><Label className="text-gray-600">Tempo de Vigência</Label><p className="text-black mt-1">{calcularTempoVigencia(detalhePenalidade.dataOcorrenciaRaw)}</p></div></CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-lg">Parecer Técnico</CardTitle></CardHeader><CardContent><p className="text-gray-600">{detalhePenalidade.parecerTecnico || "Nenhum parecer técnico registrado."}</p></CardContent></Card>
                </TabsContent>
                <TabsContent value="historico" className="space-y-4"><Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><History size={20} />Linha do Tempo</CardTitle></CardHeader><CardContent><div className="space-y-4"><div className="flex gap-4"><div className="flex flex-col items-center"><div className="w-3 h-3 rounded-full bg-[#003366]" /></div><div className="flex-1"><p className="text-sm text-gray-500">{detalhePenalidade.dataAplicacao}</p><p className="mt-1"><strong>Última atualização</strong></p><p className="text-sm text-gray-600 mt-1">Status atual: {detalhePenalidade.status}</p></div></div><div className="flex gap-4"><div className="flex flex-col items-center"><div className="w-3 h-3 rounded-full bg-gray-300" /></div><div className="flex-1"><p className="text-sm text-gray-500">{detalhePenalidade.dataOcorrencia}</p><p className="mt-1"><strong>Ocorrência Registrada</strong></p><p className="text-sm text-gray-600 mt-1">Identificação do descumprimento contratual: {detalhePenalidade.penalidade}</p></div></div></div></CardContent></Card></TabsContent>
                <TabsContent value="documentos" className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText size={20} />Documentos Anexados</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600 space-y-3">
                        <FileInput id="penalidade-documento" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onFileChange={setUploadDocumentoFile} />
                        <div className="flex justify-end">
                          <Button size="sm" className="bg-[#003366] hover:bg-[#002244] text-white" onClick={() => void handleUploadDocumentoPenalidade()} disabled={!uploadDocumentoFile || isSubmitting || !detalhePenalidade?.processoId}>
                            <Upload size={16} className="mr-2" />Anexar
                          </Button>
                        </div>
                      </div>

                      {isLoadingDocumentos ? (
                        <div className="text-center py-8 text-gray-500">Carregando documentos...</div>
                      ) : documentosPenalidade.length > 0 ? (
                        <div className="space-y-3">
                          {documentosPenalidade.map((documento) => (
                            <div key={documento.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <FileText size={40} className="text-[#003366]" />
                                <div>
                                  <p className="text-black">{documento.nome_arquivo}</p>
                                  <p className="text-sm text-gray-500">Anexado em {formatDate(documento.criado_em)} • {documento.criado_por_nome}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => window.open(documento.url_assinada, "_blank", "noopener,noreferrer")}>
                                <Download size={16} className="mr-2" />Baixar
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500"><FileText size={48} className="mx-auto mb-3 text-gray-300" /><p>Nenhum documento vinculado a esta penalidade.</p></div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6"><Button variant="outline" onClick={() => setDetalhePenalidade(null)}>Fechar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={!!contestandoPenalidade} onOpenChange={(open) => !open && setContestandoPenalidade(null)}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
          <div className="flex-1 overflow-y-auto px-6">
            <DialogHeader className="pt-6"><DialogTitle>Registrar Defesa/Contestação</DialogTitle><DialogDescription>Registre argumentos de defesa ou contestação da penalidade aplicada.</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4 pb-6">
              <div className="space-y-2">
                <p className="text-sm"><strong>Empresa:</strong> {contestandoPenalidade?.empresa}</p>
                <p className="text-sm"><strong>Processo:</strong> {contestandoPenalidade?.processo}</p>
                <p className="text-sm"><strong>Penalidade:</strong> {contestandoPenalidade?.penalidade}</p>
                <p className="text-sm"><strong>Valor:</strong> {contestandoPenalidade?.valor}</p>
              </div>
              <div className="space-y-1.5"><Label htmlFor="argumentacao">Argumentação</Label><Textarea id="argumentacao" placeholder="Descreva os argumentos de defesa..." rows={4} value={parecerContestacao} onChange={(e) => setParecerContestacao(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]"><Button variant="outline" className="flex-1" onClick={() => setContestandoPenalidade(null)}>Cancelar</Button><Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" disabled={isSubmitting} onClick={() => void handleRegistrarDefesa()}>Registrar Defesa</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!penalidadeParaEncerrar} onOpenChange={(open) => !open && setPenalidadeParaEncerrar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar Penalidade</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3"><p>Tem certeza que deseja encerrar esta penalidade? A ação é manual e a penalidade será movida para a aba &quot;Encerradas&quot;.</p>{penalidadeParaEncerrar && (<div className="space-y-1 pt-2"><p><span className="text-black">Empresa:</span> {penalidadeParaEncerrar.empresa}</p><p><span className="text-black">Processo:</span> {penalidadeParaEncerrar.processo}</p><p><span className="text-black">Valor:</span> {penalidadeParaEncerrar.valor}</p></div>)}</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setPenalidadeParaEncerrar(null)}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => void handleEncerrar()} className="bg-[#003366] hover:bg-[#002244]">Encerrar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default GerenciadorPenalidades;
