"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeNew } from "@/components/ui/badge-new";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  TrendingUp,
  Upload,
  X,
  Search,
  Download,
  FileText,
  Paperclip,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { FileInput } from "@/components/ui/file-input";
import { getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { useAuth } from "@/contexts/AuthContext";
import {
  deleteAnexoRealinhamento,
  getContratos,
  getRealinhamentoAnexos,
  getRealinhamentos,
  solicitarRealinhamento,
  uploadAnexoRealinhamento,
  updateRealinhamentoStatus,
  type Contrato,
  type Realinhamento,
  type RealinhamentoAnexo,
} from "@/services/contratosService";

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
  urlAssinada: string;
}

interface RealinhamentoData {
  id: string;
  contratoId: string;
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
  parecerGestao: string;
  documentoAnexado: boolean;
  nomeDocumento: string | null;
  anexos: AnexoDocumento[];
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}

function parseCurrencyInput(value: string) {
  const normalized = value.replace(/\s|R\$/g, "").replace(/\./g, "").replace(/,/g, ".").trim();
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatReadableCode(primary?: string | null, fallback?: string | null, prefix = "CTR") {
  if (primary && primary.trim()) return primary;
  if (!fallback || !fallback.trim()) return "-";
  if (/^\d+$/.test(fallback.trim())) return `${prefix}-${fallback.padStart(4, "0")}`;
  if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(fallback.trim())) return `${prefix}-${fallback.slice(0, 8).toUpperCase()}`;
  return fallback;
}

export function RealinhamentoPrecosModule() {
  const { currentUser, currentProfile } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [searchTerm, setSearchTerm] = useState("");
  const [empresaFilter, setEmpresaFilter] = useState("todas");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itens, setItens] = useState<ItemRealinhamento[]>([
    { itemId: "", descricaoItem: "", quantidade: "", valorOriginal: "", valorSolicitado: "", variacao: "" },
  ]);
  const [contratosRaw, setContratosRaw] = useState<Contrato[]>([]);
  const [realinhamentosRaw, setRealinhamentosRaw] = useState<Realinhamento[]>([]);
  const [selectedRealinhamento, setSelectedRealinhamento] = useState<RealinhamentoData | null>(null);
  const [approvalReason, setApprovalReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [formData, setFormData] = useState({
    contratoId: "",
    justificativa: "",
    arquivo: null as File | null,
  });

  const canManageDecisions = currentProfile === "admin" || currentProfile === "gestora";

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [contratos, realinhamentos] = await Promise.all([getContratos(), getRealinhamentos()]);
      const anexosPorRealinhamento = await Promise.all(
        realinhamentos.map(async (realinhamento) => ({
          id: realinhamento.id,
          anexos: await getRealinhamentoAnexos(realinhamento.id),
        })),
      );
      const anexosMap = new Map(anexosPorRealinhamento.map((item) => [item.id, item.anexos]));
      setContratosRaw(
        contratos.filter((contrato) => contrato.status === "Ativo" || contrato.status === "Próximo ao Vencimento"),
      );
      setRealinhamentosRaw(realinhamentos.map((realinhamento) => ({ ...realinhamento, anexos: anexosMap.get(realinhamento.id) || [] })));
    } catch (error) {
      toast.error("Erro ao carregar realinhamentos", {
        description: error instanceof Error ? error.message : "Não foi possível carregar os dados.",
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
      .channel("realinhamentos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "realinhamentos" }, () => {
        void loadData();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const realinhamentosItemizados = useMemo<RealinhamentoData[]>(
    () =>
      realinhamentosRaw.map((realinhamento) => ({
        id: realinhamento.id,
        contratoId: realinhamento.contrato_id || "",
        empresa: realinhamento.contrato?.fornecedor?.razao_social || "-",
        contrato: formatReadableCode(realinhamento.contrato?.numero_contrato, realinhamento.contrato_id, "CTR"),
        item: realinhamento.item,
        descricaoItem: realinhamento.item,
        quantidade: "-",
        valorOriginal: formatCurrency(realinhamento.valor_original),
        valorSolicitado: formatCurrency(realinhamento.valor_solicitado),
        percentual: `${realinhamento.variacao_percentual >= 0 ? "+" : ""}${Number(realinhamento.variacao_percentual || 0).toFixed(2)}%`,
        status: realinhamento.status || "Pendente",
        dataSolicitacao: formatDate(realinhamento.data_solicitacao),
        responsavel: realinhamento.responsavel?.nome || "-",
        parecerGestao: realinhamento.parecer_gestao || "",
        documentoAnexado: ((realinhamento as Realinhamento & { anexos?: RealinhamentoAnexo[] }).anexos || []).length > 0,
        nomeDocumento: ((realinhamento as Realinhamento & { anexos?: RealinhamentoAnexo[] }).anexos || [])[0]?.nome || null,
        anexos: (((realinhamento as Realinhamento & { anexos?: RealinhamentoAnexo[] }).anexos || []).map((anexo) => ({
          id: anexo.id,
          nome: anexo.nome,
          tipo: anexo.tipo,
          tamanho: anexo.tamanho,
          dataUpload: anexo.data_upload,
          urlAssinada: anexo.url_assinada,
        }))),
      })),
    [realinhamentosRaw],
  );

  const statusCounts = useMemo(
    () => ({
      total: realinhamentosItemizados.length,
      analise: realinhamentosItemizados.filter((item) => item.status === "Pendente").length,
      aprovado: realinhamentosItemizados.filter((item) => item.status === "Aprovado").length,
      rejeitado: realinhamentosItemizados.filter((item) => item.status === "Rejeitado").length,
    }),
    [realinhamentosItemizados],
  );

  const empresas = useMemo(
    () => Array.from(new Set(realinhamentosItemizados.map((item) => item.empresa).filter(Boolean))),
    [realinhamentosItemizados],
  );

  const filteredRealinhamentos = useMemo(
    () =>
      realinhamentosItemizados.filter((realinhamento) => {
        const matchesSearch =
          searchTerm === "" ||
          realinhamento.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          realinhamento.contrato.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEmpresa = empresaFilter === "todas" || realinhamento.empresa === empresaFilter;
        return matchesSearch && matchesEmpresa;
      }),
    [empresaFilter, realinhamentosItemizados, searchTerm],
  );

  const {
    items: sortedRealinhamentos,
    requestSort: sortRealinhamentos,
    sortConfig: configRealinhamentos,
  } = useTableSort(filteredRealinhamentos);

  const calcularVariacao = (original: string, solicitado: string) => {
    const valorOrig = parseCurrencyInput(original);
    const valorSolic = parseCurrencyInput(solicitado);
    if (valorOrig > 0 && valorSolic > 0) {
      const percentual = ((valorSolic - valorOrig) / valorOrig) * 100;
      return `${percentual >= 0 ? "+" : ""}${percentual.toFixed(1)}%`;
    }
    return "";
  };

  const handleItemChange = (index: number, field: keyof ItemRealinhamento, value: string) => {
    const novosItens = [...itens];
    novosItens[index][field] = value;
    if (field === "valorOriginal" || field === "valorSolicitado") {
      const item = novosItens[index];
      if (item.valorOriginal && item.valorSolicitado) {
        novosItens[index].variacao = calcularVariacao(item.valorOriginal, item.valorSolicitado);
      }
    }
    setItens(novosItens);
  };

  const adicionarItem = () => {
    setItens([...itens, { itemId: "", descricaoItem: "", quantidade: "", valorOriginal: "", valorSolicitado: "", variacao: "" }]);
  };

  const removerItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, itemIndex) => itemIndex !== index));
    }
  };

  const resetFormulario = () => {
    setItens([{ itemId: "", descricaoItem: "", quantidade: "", valorOriginal: "", valorSolicitado: "", variacao: "" }]);
    setFormData({ contratoId: "", justificativa: "", arquivo: null });
  };

  const handleSubmit = async () => {
    if (!currentUser?.id || !formData.contratoId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const itensValidos = itens.filter((item) => item.itemId && item.valorOriginal && item.valorSolicitado);
      
      let documentoId: string | undefined;

      // Se houver arquivo, fazemos o upload uma única vez e pegamos o ID gerado
      if (formData.arquivo) {
        const tempRealinhamentoId = `temp-${formData.contratoId}-${Date.now()}`;
        const anexoCriado = await uploadAnexoRealinhamento(tempRealinhamentoId, formData.arquivo, currentUser.id);
        documentoId = anexoCriado.id;
      }

      for (const item of itensValidos) {
        await solicitarRealinhamento({
          contrato_id: formData.contratoId,
          documento_id: documentoId || null,
          item: `${item.itemId} - ${item.descricaoItem || item.itemId}`,
          valor_original: parseCurrencyInput(item.valorOriginal),
          valor_solicitado: parseCurrencyInput(item.valorSolicitado),
          justificativa: formData.justificativa,
          responsavel_id: currentUser.id,
        });
      }
      
      toast.success("Realinhamento registrado com sucesso!");
      setIsDialogOpen(false);
      resetFormulario();
      await loadData();
    } catch (error) {
      toast.error("Erro ao registrar realinhamento", {
        description: error instanceof Error ? error.message : "Não foi possível registrar o realinhamento.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenApproveDialog = (realinhamento: RealinhamentoData) => {
    setSelectedRealinhamento(realinhamento);
    setApprovalReason(realinhamento.parecerGestao || "Aprovado pela gestora após análise do reajuste.");
    setIsApproveDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRealinhamento || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateRealinhamentoStatus(selectedRealinhamento.id, "Aprovado", approvalReason.trim() || null);
      toast.success(`Realinhamento do contrato ${selectedRealinhamento.contrato} aprovado com sucesso!`);
      setIsApproveDialogOpen(false);
      setSelectedRealinhamento(null);
      setApprovalReason("");
    } catch (error) {
      toast.error("Erro ao aprovar realinhamento", {
        description: error instanceof Error ? error.message : "Não foi possível concluir a aprovação.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRejectDialog = (realinhamento: RealinhamentoData) => {
    setSelectedRealinhamento(realinhamento);
    setRejectionReason(realinhamento.parecerGestao || "");
    setIsRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedRealinhamento || !rejectionReason.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateRealinhamentoStatus(selectedRealinhamento.id, "Rejeitado", rejectionReason.trim());
      toast.success(`Realinhamento do contrato ${selectedRealinhamento.contrato} rejeitado.`, {
        description: `Justificativa registrada: ${rejectionReason.trim()}`,
      });
      setIsRejectDialogOpen(false);
      setSelectedRealinhamento(null);
      setRejectionReason("");
    } catch (error) {
      toast.error("Erro ao rejeitar realinhamento", {
        description: error instanceof Error ? error.message : "Não foi possível concluir a rejeição.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadAnexo = async (realinhamentoId: string, arquivo: File) => {
    if (!currentUser?.id) return;

    await toast.promise(uploadAnexoRealinhamento(realinhamentoId, arquivo, currentUser.id), {
      loading: `Enviando ${arquivo.name}...`,
      success: async () => {
        await loadData();
        return "Anexo enviado com sucesso!";
      },
      error: (error) => (error instanceof Error ? error.message : "Não foi possível enviar o anexo."),
    });
  };

  const handleDownloadAnexo = (anexo: AnexoDocumento) => {
    window.open(anexo.urlAssinada, "_blank", "noopener,noreferrer");
    toast.success(`Download iniciado: ${anexo.nome}`);
  };

  const handleRemoverAnexo = async (_realinhamentoId: string, anexoId: string) => {
    await toast.promise(deleteAnexoRealinhamento(anexoId), {
      loading: "Removendo anexo...",
      success: async () => {
        await loadData();
        return "Anexo removido com sucesso!";
      },
      error: (error) => (error instanceof Error ? error.message : "Não foi possível remover o anexo."),
    });
  };

  const getAnexoIcon = (tipo: string) => {
    if (tipo === "PDF") return <FileText size={16} className="text-red-600" />;
    if (tipo === "Excel" || tipo === "XLSX" || tipo === "XLS") return <FileText size={16} className="text-green-600" />;
    return <FileText size={16} className="text-gray-600" />;
  };

  if (isLoading) {
    return <div className="p-6 space-y-6" />;
  }

  return (
    <div className="p-6 space-y-6">
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
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Registrar Realinhamento de Preços</DialogTitle>
                <DialogDescription>Registre o realinhamento de preços com os itens do contrato</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="empresa">Empresa/Fornecedor</Label>
                    <Select value={formData.contratoId} onValueChange={(value) => setFormData((prev) => ({ ...prev, contratoId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {contratosRaw.map((contrato) => (
                          <SelectItem key={contrato.id} value={contrato.id}>
                            {contrato.fornecedor?.razao_social || contrato.numero_contrato}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contrato">Número do Contrato</Label>
                    <Input
                      placeholder="Ex: C-2024-001"
                      value={contratosRaw.find((contrato) => contrato.id === formData.contratoId)?.numero_contrato || ""}
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-3 border-t pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Itens do Contrato</Label>
                    <Button type="button" variant="outline" size="sm" onClick={adicionarItem}>
                      <Plus size={16} className="mr-1" />Adicionar Item
                    </Button>
                  </div>

                  {itens.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-2.5 relative">
                      {itens.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => removerItem(index)}>
                          <X size={16} />
                        </Button>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`item-${index}`}>Número do Item</Label>
                          <Input id={`item-${index}`} placeholder="Ex: Item 01" value={item.itemId} onChange={(event) => handleItemChange(index, "itemId", event.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`descricao-${index}`}>Descrição do Item</Label>
                          <Input id={`descricao-${index}`} placeholder="Ex: Serviços de Manutenção" value={item.descricaoItem} onChange={(event) => handleItemChange(index, "descricaoItem", event.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`quantidade-${index}`}>Quantidade</Label>
                        <Input id={`quantidade-${index}`} placeholder="Ex: 12 meses, 500 unidades" value={item.quantidade} onChange={(event) => handleItemChange(index, "quantidade", event.target.value)} />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`valorOriginal-${index}`}>Valor Original</Label>
                          <Input id={`valorOriginal-${index}`} placeholder="R$ 0,00" value={item.valorOriginal} onChange={(event) => handleItemChange(index, "valorOriginal", event.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`valorSolicitado-${index}`}>Valor Solicitado</Label>
                          <Input id={`valorSolicitado-${index}`} placeholder="R$ 0,00" value={item.valorSolicitado} onChange={(event) => handleItemChange(index, "valorSolicitado", event.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Variação (%)</Label>
                          <div className="h-10 flex items-center px-3 border border-gray-300 rounded-md bg-gray-50">
                            {item.variacao && (
                              <div className="flex items-center gap-1">
                                <TrendingUp size={16} className={item.variacao.startsWith("+") ? "text-red-500" : "text-green-500"} />
                                <span className={item.variacao.startsWith("+") ? "text-red-600" : "text-green-600"}>{item.variacao}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="justificativa">Justificativa do Realinhamento</Label>
                  <Textarea id="justificativa" placeholder="Justifique a necessidade do realinhamento de preços..." rows={3} value={formData.justificativa} onChange={(event) => setFormData((prev) => ({ ...prev, justificativa: event.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="arquivo">Ofício Escaneado (Documento de Solicitação)</Label>
                  <FileInput id="arquivo" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onFileChange={(file) => setFormData((prev) => ({ ...prev, arquivo: file }))} />
                  <p className="text-xs text-gray-500 mt-1">Formatos aceitos: PDF, DOC, DOCX, JPG, PNG</p>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1" onClick={() => { setIsDialogOpen(false); resetFormulario(); }}>Cancelar</Button>
              <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => void handleSubmit()} disabled={isSubmitting}>Registrar Realinhamento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-black">{statusCounts.total}</p><p className="text-xs leading-4 text-[#4a5565]">Total de Itens</p></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-[#d08700]">{statusCounts.analise}</p><p className="text-xs leading-4 text-[#4a5565]">Em Análise</p></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-[#22c55e]">{statusCounts.aprovado}</p><p className="text-xs leading-4 text-[#4a5565]">Aprovados</p></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-[#e7000b]">{statusCounts.rejeitado}</p><p className="text-xs leading-4 text-[#4a5565]">Rejeitados</p></div></CardContent></Card>
      </div>

      <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex flex-col md:flex-row gap-4"><div className="flex-1"><div className="relative"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><Input placeholder="Buscar por empresa ou processo/contrato..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-10" /></div></div><div className="w-full md:w-64"><Select value={empresaFilter} onValueChange={setEmpresaFilter}><SelectTrigger><SelectValue placeholder="Filtrar por empresa" /></SelectTrigger><SelectContent><SelectItem value="todas">Todas as Empresas</SelectItem>{empresas.map((empresa) => (<SelectItem key={empresa} value={empresa}>{empresa}</SelectItem>))}</SelectContent></Select></div></div></CardContent></Card>

      <Card className="border border-gray-200"><CardHeader className="pt-3 pb-1"><CardTitle className="text-xl text-black px-[0px] py-[8px]">Histórico de Realinhamentos por Item</CardTitle></CardHeader><CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]"><div className="w-full overflow-x-auto"><Table><TableHeader><TableRow>
        <SortableTableHead label="Contrato" onClick={() => sortRealinhamentos("contrato")} currentDirection={configRealinhamentos?.key === "contrato" ? configRealinhamentos.direction : null} className="sticky left-0 z-10 min-w-[160px] bg-white" />
        <SortableTableHead label="Empresa" onClick={() => sortRealinhamentos("empresa")} currentDirection={configRealinhamentos?.key === "empresa" ? configRealinhamentos.direction : null} className="min-w-[200px]" />
        <SortableTableHead label="Item" onClick={() => sortRealinhamentos("item")} currentDirection={configRealinhamentos?.key === "item" ? configRealinhamentos.direction : null} className="min-w-[100px]" />
        <SortableTableHead label="Descrição do Item" onClick={() => sortRealinhamentos("descricaoItem")} currentDirection={configRealinhamentos?.key === "descricaoItem" ? configRealinhamentos.direction : null} className="min-w-[250px]" />
        <SortableTableHead label="Quantidade" onClick={() => sortRealinhamentos("quantidade")} currentDirection={configRealinhamentos?.key === "quantidade" ? configRealinhamentos.direction : null} className="min-w-[140px]" />
        <SortableTableHead label="Valor Original" onClick={() => sortRealinhamentos("valorOriginal")} currentDirection={configRealinhamentos?.key === "valorOriginal" ? configRealinhamentos.direction : null} className="min-w-[140px]" />
        <SortableTableHead label="Valor Solicitado" onClick={() => sortRealinhamentos("valorSolicitado")} currentDirection={configRealinhamentos?.key === "valorSolicitado" ? configRealinhamentos.direction : null} className="min-w-[140px]" />
        <TableHead className="min-w-[100px]">Variação</TableHead>
        <SortableTableHead label="Status" onClick={() => sortRealinhamentos("status")} currentDirection={configRealinhamentos?.key === "status" ? configRealinhamentos.direction : null} className="min-w-[140px]" />
        <SortableTableHead label="Data" onClick={() => sortRealinhamentos("dataSolicitacao")} currentDirection={configRealinhamentos?.key === "dataSolicitacao" ? configRealinhamentos.direction : null} className="min-w-[120px]" />
        <TableHead className="min-w-[140px]">Anexo</TableHead>
        <SortableTableHead label="Responsável" onClick={() => sortRealinhamentos("responsavel")} currentDirection={configRealinhamentos?.key === "responsavel" ? configRealinhamentos.direction : null} className="min-w-[160px]" />
        {canManageDecisions && <TableHead className="min-w-[180px]">Ações</TableHead>}
      </TableRow></TableHeader><TableBody>
        {sortedRealinhamentos.map((realinhamento) => (
          <TableRow key={realinhamento.id}>
            <TableCell className="text-black sticky left-0 z-10 bg-white font-medium">{realinhamento.contrato}</TableCell>
            <TableCell className="text-black">{realinhamento.empresa}</TableCell>
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
              <BadgeNew {...getBadgeMappingForStatus(realinhamento.status)}>{realinhamento.status}</BadgeNew>
            </TableCell>
            <TableCell className="text-gray-600">{realinhamento.dataSolicitacao}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <Paperclip size={16} />
                    {realinhamento.anexos.length > 0 ? (
                      <span>{realinhamento.anexos.length} {realinhamento.anexos.length === 1 ? "arquivo" : "arquivos"}</span>
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
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            handleUploadAnexo(realinhamento.id, file);
                          }
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>
                  {realinhamento.anexos.length > 0 ? (
                    realinhamento.anexos.map((anexo) => (
                      <div key={anexo.id}>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-2 space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">{getAnexoIcon(anexo.tipo)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-black truncate">{anexo.nome}</p>
                              <p className="text-xs text-gray-500">{anexo.tamanho} • {anexo.dataUpload}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                             <DropdownMenuItem className="flex-1 cursor-pointer" onClick={() => handleDownloadAnexo(anexo)}>
                              <Download size={14} className="mr-2" />Baixar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex-1 cursor-pointer text-red-600 focus:text-red-600" onClick={() => handleRemoverAnexo(realinhamento.id, anexo.id)}>
                              <Trash2 size={14} className="mr-2" />Remover
                            </DropdownMenuItem>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-4 text-sm text-gray-500 text-center">Nenhum anexo cadastrado para este item.</div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
            <TableCell className="text-gray-600">{realinhamento.responsavel}</TableCell>
            {canManageDecisions && (
              <TableCell>
                <div className="flex items-center gap-2">
                  {realinhamento.status === "Pendente" ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[#16a34a] border-[#16a34a] hover:bg-[#16a34a] hover:text-white"
                            disabled={isSubmitting}
                            onClick={() => handleOpenApproveDialog(realinhamento)}
                          >
                            <CheckCircle size={14} className="mr-2" />Aprovar
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Confirma o pedido e mantém o item disponível para reajuste.</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[#dc2626] border-[#dc2626] hover:bg-[#dc2626] hover:text-white"
                            disabled={isSubmitting}
                            onClick={() => handleOpenRejectDialog(realinhamento)}
                          >
                            <XCircle size={14} className="mr-2" />Rejeitar
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Abre a justificativa para recusar o pedido de realinhamento.</TooltipContent>
                      </Tooltip>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Sem ações pendentes</span>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody></Table></div></CardContent></Card>

      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aprovar Realinhamento</DialogTitle>
            <DialogDescription>
              Registre o parecer da gestão para aprovar o realinhamento do contrato {selectedRealinhamento?.contrato || "-"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-4">
            <Label htmlFor="realinhamento-aprovacao">Parecer da Gestão</Label>
            <Textarea
              id="realinhamento-aprovacao"
              rows={4}
              value={approvalReason}
              onChange={(event) => setApprovalReason(event.target.value)}
              placeholder="Descreva o motivo da aprovação..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsApproveDialogOpen(false); setSelectedRealinhamento(null); setApprovalReason(""); }}>Cancelar</Button>
            <Button className="bg-[#003366] hover:bg-[#002244] text-white" disabled={isSubmitting} onClick={() => void handleApprove()}>
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rejeitar Realinhamento</DialogTitle>
            <DialogDescription>
              Informe o parecer da gestão para rejeitar o realinhamento do contrato {selectedRealinhamento?.contrato || "-"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-4">
            <Label htmlFor="realinhamento-rejeicao">Parecer da Gestão</Label>
            <Textarea id="realinhamento-rejeicao" rows={4} value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Descreva o motivo da rejeição..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsRejectDialogOpen(false); setSelectedRealinhamento(null); setRejectionReason(""); }}>Cancelar</Button>
            <Button className="bg-[#dc2626] hover:bg-[#b91c1c] text-white" disabled={!rejectionReason.trim() || isSubmitting} onClick={() => void handleReject()}>
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
