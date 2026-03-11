"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, Search, Clock, CheckCircle, AlertCircle, CalendarDays, X } from "lucide-react";
import { getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getFornecedores } from "@/services/fornecedoresService";
import {
  aprovarProrrogacao,
  getContratos,
  getHistoricoProrrogacoes,
  getProrrogacoes,
  rejeitarProrrogacao,
  solicitarProrrogacao,
  type Contrato,
  type HistoricoProrrogacao,
  type Prorrogacao,
} from "@/services/contratosService";
import type { Fornecedor } from "@/types";

interface NovaProrrogacao {
  aditivo: string;
  dataInicio: string;
  dataFim: string;
  observacoes: string;
}

interface TrpReal {
  id: string;
  numeroTrp: string;
  objeto: string;
  fornecedor: string;
  vigencia: string;
  status: string;
  aditivos: number;
}

interface ContratoTabela {
  id: string;
  contratoId: string;
  prorrogacaoId: string | null;
  contrato: string;
  objetoContrato: string;
  empresa: string;
  cnpjCpf: string;
  numeroProcesso: string;
  valorContratadoAnual: string;
  dataInicio: string;
  dataFimOriginal: string;
  quantidadeAditivos: number;
  prazoProrrogacao: string;
  passivelProrrogar: boolean;
  responsavel: string;
  status: string;
  novaDataFim: string | null;
  motivo: string;
  historicoProrrogacoes: HistoricoProrrogacaoTabela[];
}

interface HistoricoProrrogacaoTabela {
  aditivo: string;
  dataInicio: string;
  dataFim: string;
  observacoes: string;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number") return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calculateMonthsDifference(start?: string | null, end?: string | null) {
  if (!start || !end) return "-";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return "-";
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  return `${Math.max(0, months)} meses`;
}

function mapProrrogacaoStatus(status?: string | null, contratoStatus?: string | null) {
  if (status === "Aprovada" || status === "Rejeitada" || status === "Pendente") return status;
  if (status === "Em Análise") return status;
  if (contratoStatus === "Próximo ao Vencimento" || contratoStatus === "Vencido") return "Vencendo";
  return "Pendente";
}

export function ProrrogacoesModule() {
  const { currentUser, currentProfile } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [periodoFilter, setPeriodoFilter] = useState("todos");
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<ContratoTabela | null>(null);
  const [novasProrrogacoes, setNovasProrrogacoes] = useState<NovaProrrogacao[]>([{ aditivo: "", dataInicio: "", dataFim: "", observacoes: "" }]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contratosRaw, setContratosRaw] = useState<Contrato[]>([]);
  const [fornecedoresRaw, setFornecedoresRaw] = useState<Fornecedor[]>([]);
  const [prorrogacoesRaw, setProrrogacoesRaw] = useState<Prorrogacao[]>([]);
  const [historicosRaw, setHistoricosRaw] = useState<HistoricoProrrogacao[]>([]);
  const [novaSolicitacao, setNovaSolicitacao] = useState({
    fornecedorId: "",
    contratoId: "",
    numeroContrato: "",
    objetoContrato: "",
    dataAtual: "",
    novaData: "",
    motivo: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [contratos, fornecedores, prorrogacoes, historicos] = await Promise.all([
        getContratos(),
        getFornecedores(),
        getProrrogacoes(),
        getHistoricoProrrogacoes(),
      ]);
      setContratosRaw(contratos);
      setFornecedoresRaw(fornecedores);
      setProrrogacoesRaw(prorrogacoes);
      setHistoricosRaw(historicos);
    } catch (error) {
      toast.error("Erro ao carregar prorrogações", {
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
      .channel("prorrogacoes-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "prorrogacoes" }, () => {
        void loadData();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const contratosTabela = useMemo<ContratoTabela[]>(() => {
    return contratosRaw.map((contrato) => {
      const prorrogacoesContrato = prorrogacoesRaw
        .filter((prorrogacao) => prorrogacao.contrato_id === contrato.id)
        .sort((a, b) => new Date(b.data_solicitacao).getTime() - new Date(a.data_solicitacao).getTime());
      const ultimaProrrogacao = prorrogacoesContrato[0] || null;
      const historicoProrrogacoes = historicosRaw
        .filter((historico) => historico.prorrogacao?.contrato_id === contrato.id)
        .map((historico) => ({
          aditivo: historico.aditivo || "-",
          dataInicio: formatDate(historico.data_inicio),
          dataFim: formatDate(historico.data_fim),
          observacoes: historico.observacoes || "-",
        }));

      return {
        id: contrato.id,
        contratoId: contrato.id,
        prorrogacaoId: ultimaProrrogacao?.id || null,
        contrato: contrato.numero_contrato,
        objetoContrato: contrato.objeto,
        empresa: contrato.fornecedor?.razao_social || "-",
        cnpjCpf: contrato.fornecedor?.cnpj || "-",
        numeroProcesso: contrato.processo?.numero_requisicao || contrato.processo_id || "-",
        valorContratadoAnual: formatCurrency(contrato.valor_anual),
        dataInicio: formatDate(contrato.data_inicio),
        dataFimOriginal: formatDate(contrato.data_fim_original),
        quantidadeAditivos: Number(contrato.quantidade_aditivos || 0),
        prazoProrrogacao: calculateMonthsDifference(contrato.data_inicio, contrato.data_fim_atual || contrato.data_fim_original),
        passivelProrrogar: contrato.status === "Ativo" || contrato.status === "Próximo ao Vencimento",
        responsavel: contrato.responsavel?.nome || "-",
        status: mapProrrogacaoStatus(ultimaProrrogacao?.status, contrato.status),
        novaDataFim: ultimaProrrogacao?.nova_data_fim || null,
        motivo: ultimaProrrogacao?.motivo || "",
        historicoProrrogacoes,
      };
    });
  }, [contratosRaw, historicosRaw, prorrogacoesRaw]);

  const trps = useMemo<TrpReal[]>(() => {
    return contratosRaw
      .filter((contrato) => contrato.numero_contrato.toUpperCase().includes("TRP"))
      .map((contrato) => ({
        id: contrato.id,
        numeroTrp: contrato.numero_contrato,
        objeto: contrato.objeto,
        fornecedor: contrato.fornecedor?.razao_social || "-",
        vigencia: `${formatDate(contrato.data_inicio)} - ${formatDate(contrato.data_fim_atual || contrato.data_fim_original)}`,
        status: contrato.status || "-",
        aditivos: Number(contrato.quantidade_aditivos || 0),
      }));
  }, [contratosRaw]);

  const statusCounts = useMemo(
    () => ({
      todos: contratosTabela.length,
      aprovada: contratosTabela.filter((p) => p.status === "Aprovada").length,
      analise: contratosTabela.filter((p) => p.status === "Em Análise").length,
      pendente: contratosTabela.filter((p) => p.status === "Pendente").length,
      vencendo: contratosTabela.filter((p) => p.status === "Vencendo").length,
    }),
    [contratosTabela]
  );

  const empresas = useMemo(() => Array.from(new Set(contratosTabela.map((p) => p.empresa).filter(Boolean))), [contratosTabela]);

  const handleProrrogacaoChange = (index: number, field: keyof NovaProrrogacao, value: string) => {
    const novasPrors = [...novasProrrogacoes];
    novasPrors[index][field] = value;
    setNovasProrrogacoes(novasPrors);
  };

  const adicionarProrrogacao = () => {
    setNovasProrrogacoes([...novasProrrogacoes, { aditivo: "", dataInicio: "", dataFim: "", observacoes: "" }]);
  };

  const removerProrrogacao = (index: number) => {
    if (novasProrrogacoes.length > 1) {
      setNovasProrrogacoes(novasProrrogacoes.filter((_, i) => i !== index));
    }
  };

  const resetFormularioProrrogacoes = () => {
    setNovasProrrogacoes([{ aditivo: "", dataInicio: "", dataFim: "", observacoes: "" }]);
  };

  const resetNovaSolicitacao = () => {
    setNovaSolicitacao({ fornecedorId: "", contratoId: "", numeroContrato: "", objetoContrato: "", dataAtual: "", novaData: "", motivo: "" });
  };

  const filteredProrrogacoes = useMemo(
    () =>
      contratosTabela.filter((prorrogacao) => {
        const matchesSearch = prorrogacao.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prorrogacao.contrato.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "todos" || prorrogacao.status.toLowerCase().replace(/\s+/g, "-") === statusFilter;
        const matchesPeriodo = periodoFilter === "todos" ||
          (periodoFilter === "30-dias" && prorrogacao.status === "Vencendo") ||
          (periodoFilter === "60-dias" && (prorrogacao.status === "Vencendo" || prorrogacao.status === "Pendente"));
        return matchesSearch && matchesStatus && matchesPeriodo;
      }),
    [contratosTabela, periodoFilter, searchTerm, statusFilter]
  );

  const { items: sortedProrrogacoes, requestSort: sortProrrogacoes, sortConfig: configProrrogacoes } = useTableSort(filteredProrrogacoes);
  const { items: sortedTrps, requestSort: sortTrps, sortConfig: configTrps } = useTableSort(trps);

  const contratosDisponiveisSolicitacao = useMemo(
    () => contratosRaw.filter((contrato) => contrato.status === "Ativo" || contrato.status === "Próximo ao Vencimento"),
    [contratosRaw]
  );

  const contratosDoFornecedorSelecionado = useMemo(
    () =>
      contratosDisponiveisSolicitacao.filter(
        (contrato) => !novaSolicitacao.fornecedorId || contrato.fornecedor_id === novaSolicitacao.fornecedorId
      ),
    [contratosDisponiveisSolicitacao, novaSolicitacao.fornecedorId]
  );

  const handleSelecionarFornecedor = (fornecedorId: string) => {
    setNovaSolicitacao({
      fornecedorId,
      contratoId: "",
      numeroContrato: "",
      objetoContrato: "",
      dataAtual: "",
      novaData: "",
      motivo: "",
    });
  };

  useEffect(() => {
    if (!novaSolicitacao.numeroContrato) return;

    const contrato = contratosDisponiveisSolicitacao.find((item) => {
      const sameNumero = item.numero_contrato.toLowerCase() === novaSolicitacao.numeroContrato.toLowerCase();
      const sameFornecedor = !novaSolicitacao.fornecedorId || item.fornecedor_id === novaSolicitacao.fornecedorId;
      return sameNumero && sameFornecedor;
    });

    if (!contrato) return;

    setNovaSolicitacao((prev) => ({
      ...prev,
      contratoId: contrato.id,
      objetoContrato: contrato.objeto || "",
      dataAtual: contrato.data_fim_atual || contrato.data_fim_original || "",
    }));
  }, [contratosDisponiveisSolicitacao, novaSolicitacao.fornecedorId, novaSolicitacao.numeroContrato]);

  const handleSolicitarProrrogacao = async () => {
    if (!currentUser?.id || !novaSolicitacao.contratoId || !novaSolicitacao.novaData || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await solicitarProrrogacao({
        contrato_id: novaSolicitacao.contratoId,
        nova_data_fim: novaSolicitacao.novaData,
        motivo: novaSolicitacao.motivo,
        status: currentProfile === "comprador" ? "Em Análise" : "Pendente",
        responsavel_id: currentUser.id,
      });
      toast.success("Solicitação de prorrogação enviada com sucesso!");
      setIsCreateModalOpen(false);
      resetNovaSolicitacao();
      await loadData();
    } catch (error) {
      toast.error("Erro ao solicitar prorrogação", {
        description: error instanceof Error ? error.message : "Não foi possível solicitar a prorrogação.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSalvarProrrogacoes = async () => {
    if (!selectedContrato || !currentUser?.id || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (currentProfile === "admin" || currentProfile === "gestora") {
        const prorrogacao = novasProrrogacoes[0];
        if (!selectedContrato.prorrogacaoId || !prorrogacao.dataFim) {
          throw new Error("Preencha a nova data de fim para aprovar a prorrogação.");
        }

        await aprovarProrrogacao(
          selectedContrato.prorrogacaoId,
          selectedContrato.contratoId,
          prorrogacao.dataFim,
          currentUser.id,
          prorrogacao.aditivo || undefined,
          prorrogacao.observacoes || undefined,
        );
        toast.success("Prorrogação aprovada com sucesso!");
      } else {
        const prorrogacao = novasProrrogacoes[0];
        if (!prorrogacao.dataFim) {
          throw new Error("Preencha a data de fim da prorrogação.");
        }

        await solicitarProrrogacao({
          contrato_id: selectedContrato.contratoId,
          nova_data_fim: prorrogacao.dataFim,
          motivo: prorrogacao.observacoes,
          status: "Em Análise",
          responsavel_id: currentUser.id,
        });
        toast.success("Prorrogação registrada com sucesso!");
      }

      setIsManageModalOpen(false);
      resetFormularioProrrogacoes();
      await loadData();
    } catch (error) {
      toast.error("Erro ao salvar prorrogação", {
        description: error instanceof Error ? error.message : "Não foi possível salvar a prorrogação.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejeitar = async (prorrogacaoId: string | null) => {
    if (!prorrogacaoId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await rejeitarProrrogacao(prorrogacaoId);
      toast.success("Prorrogação rejeitada com sucesso!");
      await loadData();
    } catch (error) {
      toast.error("Erro ao rejeitar prorrogação", {
        description: error instanceof Error ? error.message : "Não foi possível rejeitar a prorrogação.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl text-black">Prorrogações de Processos</h2>
            <p className="text-gray-600 mt-1">Gestão de prorrogações e extensões contratuais</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                <Plus size={20} className="mr-2" />
                Solicitar Prorrogação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
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
                    <Select value={novaSolicitacao.fornecedorId} onValueChange={handleSelecionarFornecedor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {fornecedoresRaw.map((fornecedor) => (
                          <SelectItem key={fornecedor.id} value={fornecedor.id}>{fornecedor.razao_social}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contrato">Número do Contrato</Label>
                    <Select value={novaSolicitacao.numeroContrato} onValueChange={(value) => setNovaSolicitacao((prev) => ({ ...prev, numeroContrato: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o contrato" />
                      </SelectTrigger>
                      <SelectContent>
                        {contratosDoFornecedorSelecionado.map((contrato) => (
                          <SelectItem key={contrato.id} value={contrato.numero_contrato}>{contrato.numero_contrato}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="objetoContrato">Objeto do Contrato</Label>
                    <Input placeholder="Ex: Serviços de Manutenção Predial..." value={novaSolicitacao.objetoContrato} readOnly />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="dataAtual">Data de Fim Atual</Label>
                      <Input type="date" value={novaSolicitacao.dataAtual} readOnly />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="novaData">Nova Data de Fim</Label>
                      <Input type="date" value={novaSolicitacao.novaData} onChange={(e) => setNovaSolicitacao((prev) => ({ ...prev, novaData: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="motivo">Motivo da Prorrogação</Label>
                    <Textarea placeholder="Justifique a necessidade da prorrogação..." rows={3} value={novaSolicitacao.motivo} onChange={(e) => setNovaSolicitacao((prev) => ({ ...prev, motivo: e.target.value }))} />
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                <Button variant="outline" className="flex-1" onClick={() => { setIsCreateModalOpen(false); resetNovaSolicitacao(); }}>
                  Cancelar
                </Button>
                <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => void handleSolicitarProrrogacao()} disabled={isSubmitting}>
                  Solicitar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><CalendarDays size={20} className="text-blue-600" /></div><div><p className="text-2xl text-black">{statusCounts.todos}</p><p className="text-sm text-gray-600">Total</p></div></div></CardContent></Card>
          <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><CheckCircle size={20} className="text-green-600" /></div><div><p className="text-2xl text-green-600">{statusCounts.aprovada}</p><p className="text-sm text-gray-600">Aprovadas</p></div></div></CardContent></Card>
          <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-yellow-100 rounded-lg"><Clock size={20} className="text-yellow-600" /></div><div><p className="text-2xl text-yellow-600">{statusCounts.analise}</p><p className="text-sm text-gray-600">Em Análise</p></div></div></CardContent></Card>
          <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Calendar size={20} className="text-blue-600" /></div><div><p className="text-2xl text-blue-600">{statusCounts.pendente}</p><p className="text-sm text-gray-600">Pendentes</p></div></div></CardContent></Card>
          <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-red-100 rounded-lg"><AlertCircle size={20} className="text-red-600" /></div><div><p className="text-2xl text-red-600">{statusCounts.vencendo}</p><p className="text-sm text-gray-600">Vencendo em 30 dias</p></div></div></CardContent></Card>
        </div>

        <Tabs defaultValue="contratos" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="contratos">Lista de Contratos</TabsTrigger>
            <TabsTrigger value="trps">Lista de TRPs</TabsTrigger>
          </TabsList>

          <TabsContent value="contratos" className="mt-0 space-y-4">
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1"><div className="relative"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><Input placeholder="Buscar por empresa ou número do contrato..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div>
                  <div className="w-full md:w-48"><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="Filtrar por status" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Status</SelectItem><SelectItem value="aprovada">Aprovada</SelectItem><SelectItem value="em-análise">Em Análise</SelectItem><SelectItem value="pendente">Pendente</SelectItem><SelectItem value="vencendo">Vencendo</SelectItem></SelectContent></Select></div>
                  <div className="w-full md:w-48"><Select value={periodoFilter} onValueChange={setPeriodoFilter}><SelectTrigger><SelectValue placeholder="Filtrar por período" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Períodos</SelectItem><SelectItem value="30-dias">Vencendo em 30 dias</SelectItem><SelectItem value="60-dias">Vencendo em 60 dias</SelectItem></SelectContent></Select></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="pt-3 pb-1"><CardTitle className="text-xl text-black px-[0px] py-[8px]">Lista de Contratos</CardTitle></CardHeader>
              <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
                <div className="w-full overflow-x-auto"><Table><TableHeader><TableRow>
                  <SortableTableHead label="Contrato SCA" onClick={() => sortProrrogacoes("contrato")} currentDirection={configProrrogacoes?.key === "contrato" ? configProrrogacoes.direction : null} className="sticky left-0 z-10 min-w-[140px] bg-white" />
                  <SortableTableHead label="Objeto" onClick={() => sortProrrogacoes("objetoContrato")} currentDirection={configProrrogacoes?.key === "objetoContrato" ? configProrrogacoes.direction : null} className="min-w-[320px]" />
                  <SortableTableHead label="Contratada" onClick={() => sortProrrogacoes("empresa")} currentDirection={configProrrogacoes?.key === "empresa" ? configProrrogacoes.direction : null} className="min-w-[200px]" />
                  <SortableTableHead label="CNPJ/CPF" onClick={() => sortProrrogacoes("cnpjCpf")} currentDirection={configProrrogacoes?.key === "cnpjCpf" ? configProrrogacoes.direction : null} className="min-w-[160px]" />
                  <SortableTableHead label="Nº processo" onClick={() => sortProrrogacoes("numeroProcesso")} currentDirection={configProrrogacoes?.key === "numeroProcesso" ? configProrrogacoes.direction : null} className="min-w-[140px]" />
                  <SortableTableHead label="Valor contratado anual" onClick={() => sortProrrogacoes("valorContratadoAnual")} currentDirection={configProrrogacoes?.key === "valorContratadoAnual" ? configProrrogacoes.direction : null} className="min-w-[180px]" />
                  <SortableTableHead label="Início" onClick={() => sortProrrogacoes("dataInicio")} currentDirection={configProrrogacoes?.key === "dataInicio" ? configProrrogacoes.direction : null} className="min-w-[120px]" />
                  <SortableTableHead label="Término" onClick={() => sortProrrogacoes("dataFimOriginal")} currentDirection={configProrrogacoes?.key === "dataFimOriginal" ? configProrrogacoes.direction : null} className="min-w-[120px]" />
                  <SortableTableHead label="Qnt aditivos" onClick={() => sortProrrogacoes("quantidadeAditivos")} currentDirection={configProrrogacoes?.key === "quantidadeAditivos" ? configProrrogacoes.direction : null} className="min-w-[130px]" />
                  <SortableTableHead label="Prazo total em meses" onClick={() => sortProrrogacoes("prazoProrrogacao")} currentDirection={configProrrogacoes?.key === "prazoProrrogacao" ? configProrrogacoes.direction : null} className="min-w-[170px]" />
                  <SortableTableHead label="Passível de prorrogar" onClick={() => sortProrrogacoes("passivelProrrogar")} currentDirection={configProrrogacoes?.key === "passivelProrrogar" ? configProrrogacoes.direction : null} className="min-w-[180px]" />
                  <SortableTableHead label="Responsável" onClick={() => sortProrrogacoes("responsavel")} currentDirection={configProrrogacoes?.key === "responsavel" ? configProrrogacoes.direction : null} className="min-w-[160px]" />
                  <SortableTableHead label="Status" onClick={() => sortProrrogacoes("status")} currentDirection={configProrrogacoes?.key === "status" ? configProrrogacoes.direction : null} className="min-w-[200px]" />
                  <TableHead className="min-w-[150px]">Ações</TableHead>
                </TableRow></TableHeader><TableBody>
                  {sortedProrrogacoes.map((prorrogacao) => {
                    const passivelProrrogar = prorrogacao.passivelProrrogar;
                    return (
                      <TableRow key={prorrogacao.id}>
                        <TableCell className="text-black sticky left-0 z-10 bg-white">{prorrogacao.contrato}</TableCell>
                        <TableCell className="text-gray-600">{prorrogacao.objetoContrato}</TableCell>
                        <TableCell className="text-black">{prorrogacao.empresa}</TableCell>
                        <TableCell className="text-gray-600">{prorrogacao.cnpjCpf || "00.000.000/0000-00"}</TableCell>
                        <TableCell className="text-gray-600">{prorrogacao.numeroProcesso || "N/A"}</TableCell>
                        <TableCell className="text-black">{prorrogacao.valorContratadoAnual || "R$ 0,00"}</TableCell>
                        <TableCell className="text-gray-600">{prorrogacao.dataInicio}</TableCell>
                        <TableCell className="text-gray-600">{prorrogacao.dataFimOriginal}</TableCell>
                        <TableCell className="text-center text-gray-600">{prorrogacao.quantidadeAditivos || "0"}</TableCell>
                        <TableCell className="text-gray-600">{prorrogacao.prazoProrrogacao}</TableCell>
                        <TableCell>{passivelProrrogar ? (<BadgeStatus intent="success" weight="light">SIM</BadgeStatus>) : (<BadgeStatus intent="warning" weight="light">NÃO</BadgeStatus>)}</TableCell>
                        <TableCell className="text-gray-600">{prorrogacao.responsavel}</TableCell>
                        <TableCell><BadgeStatus {...getBadgeMappingForStatus(prorrogacao.status)}>{prorrogacao.status}</BadgeStatus></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {passivelProrrogar && (
                              <Button variant="outline" size="sm" onClick={() => { setSelectedContrato(prorrogacao); resetFormularioProrrogacoes(); setIsManageModalOpen(true); }} className="text-sm text-[#003366] border-[#003366] hover:bg-[#003366] hover:text-white">Prorrogar</Button>
                            )}
                            {(currentProfile === "admin" || currentProfile === "gestora") && prorrogacao.prorrogacaoId && prorrogacao.status !== "Aprovada" && prorrogacao.status !== "Rejeitada" && (
                              <Button variant="outline" size="sm" onClick={() => void handleRejeitar(prorrogacao.prorrogacaoId)}>Rejeitar</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody></Table></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trps" className="mt-0">
            <Card className="border border-gray-200"><CardHeader className="pt-3 pb-1"><CardTitle className="text-xl text-black px-[0px] py-[8px]">Lista de TRPs</CardTitle></CardHeader><CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]"><div className="w-full overflow-x-auto"><Table><TableHeader><TableRow>
              <SortableTableHead label="Número TRP" onClick={() => sortTrps("numeroTrp")} currentDirection={configTrps?.key === "numeroTrp" ? configTrps.direction : null} className="sticky left-0 z-10 min-w-[160px] bg-white" />
              <SortableTableHead label="Objeto" onClick={() => sortTrps("objeto")} currentDirection={configTrps?.key === "objeto" ? configTrps.direction : null} className="min-w-[320px]" />
              <SortableTableHead label="Fornecedor" onClick={() => sortTrps("fornecedor")} currentDirection={configTrps?.key === "fornecedor" ? configTrps.direction : null} className="min-w-[220px]" />
              <SortableTableHead label="Vigência" onClick={() => sortTrps("vigencia")} currentDirection={configTrps?.key === "vigencia" ? configTrps.direction : null} className="min-w-[180px]" />
              <SortableTableHead label="Status" onClick={() => sortTrps("status")} currentDirection={configTrps?.key === "status" ? configTrps.direction : null} className="min-w-[160px]" />
              <SortableTableHead label="Aditivos" onClick={() => sortTrps("aditivos")} currentDirection={configTrps?.key === "aditivos" ? configTrps.direction : null} className="min-w-[120px]" />
            </TableRow></TableHeader><TableBody>
              {sortedTrps.map((trp) => (
                <TableRow key={trp.id}><TableCell className="text-black sticky left-0 z-10 bg-white">{trp.numeroTrp}</TableCell><TableCell className="text-gray-600">{trp.objeto}</TableCell><TableCell className="text-black">{trp.fornecedor}</TableCell><TableCell className="text-gray-600">{trp.vigencia}</TableCell><TableCell><BadgeStatus {...(trp.status === "Vigente" ? { intent: "success" as const, weight: "medium" as const } : getBadgeMappingForStatus(trp.status))}>{trp.status}</BadgeStatus></TableCell><TableCell className="text-gray-600">{trp.aditivos}</TableCell></TableRow>
              ))}
            </TableBody></Table></div></CardContent></Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isManageModalOpen} onOpenChange={(open) => { setIsManageModalOpen(open); if (!open) resetFormularioProrrogacoes(); }}>
          <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Prorrogações do Contrato</DialogTitle>
                <DialogDescription>
                  Contrato {selectedContrato?.contrato} - {selectedContrato?.empresa}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4 pb-6">
                {selectedContrato?.historicoProrrogacoes && selectedContrato.historicoProrrogacoes.length > 0 && (
                  <div className="space-y-3 pb-3 border-b">
                    <Label className="text-base">Histórico de Prorrogações</Label>
                    {selectedContrato.historicoProrrogacoes.map((prorrogacao, index) => (
                      <Card key={index} className="border border-gray-200"><CardContent className="p-4"><div className="flex items-start justify-between"><div className="flex-1 space-y-2"><div className="flex items-center gap-2"><BadgeStatus intent="info" weight="medium">{prorrogacao.aditivo}</BadgeStatus></div><div className="grid grid-cols-2 gap-4 mt-3"><div><p className="text-xs text-gray-600">Período Prorrogado</p><p className="text-black mt-1">{prorrogacao.dataInicio} até {prorrogacao.dataFim}</p></div></div><div className="mt-2"><p className="text-xs text-gray-600">Observações</p><p className="text-sm text-gray-800 mt-1">{prorrogacao.observacoes}</p></div></div></div></CardContent></Card>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between"><Label className="text-base">Adicionar Prorrogações</Label><Button type="button" variant="outline" size="sm" onClick={adicionarProrrogacao}><Plus size={16} className="mr-1" />Adicionar Prorrogação</Button></div>

                  {novasProrrogacoes.map((prorrogacao, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-2.5 relative">
                      {novasProrrogacoes.length > 1 && (<Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => removerProrrogacao(index)}><X size={16} /></Button>)}
                      <div className="space-y-1.5"><Label htmlFor={`aditivo-${index}`}>Número do Aditivo</Label><Input id={`aditivo-${index}`} placeholder="Ex: 1º Aditivo, 2º Aditivo..." value={prorrogacao.aditivo} onChange={(e) => handleProrrogacaoChange(index, "aditivo", e.target.value)} /></div>
                      <div className="space-y-1.5"><Label htmlFor={`objeto-${index}`}>Objeto do Contrato</Label><Input id={`objeto-${index}`} value={selectedContrato?.objetoContrato || ""} readOnly /></div>
                      <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label htmlFor={`dataInicio-${index}`}>Data de Início</Label><Input id={`dataInicio-${index}`} type="date" value={prorrogacao.dataInicio} onChange={(e) => handleProrrogacaoChange(index, "dataInicio", e.target.value)} /></div><div className="space-y-1.5"><Label htmlFor={`dataFim-${index}`}>Data de Fim</Label><Input id={`dataFim-${index}`} type="date" value={prorrogacao.dataFim} onChange={(e) => handleProrrogacaoChange(index, "dataFim", e.target.value)} /></div></div>
                      <div className="space-y-1.5"><Label htmlFor={`observacoes-${index}`}>Observações</Label><Textarea id={`observacoes-${index}`} placeholder="Justificativa e observações sobre esta prorrogação..." rows={3} value={prorrogacao.observacoes} onChange={(e) => handleProrrogacaoChange(index, "observacoes", e.target.value)} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1" onClick={() => { setIsManageModalOpen(false); resetFormularioProrrogacoes(); }}>Cancelar</Button>
              <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => void handleSalvarProrrogacoes()} disabled={isSubmitting}>Salvar Prorrogações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
