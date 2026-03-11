  "use client";

  import { useEffect, useMemo, useState } from "react";
  import { Calendar, Edit, Eye, FileText, Info, LayoutGrid, List, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
  import { toast } from "sonner";
  import { Alert, AlertDescription } from "@/components/ui/alert";
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";
  import { BadgeNew } from "@/components/ui/badge-new";
  import { BadgeStatus } from "@/components/ui/badge-status";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import { FileInput } from "@/components/ui/file-input";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
  } from "@/components/ui/pagination";
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
  import { Switch } from "@/components/ui/switch";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { Textarea } from "@/components/ui/textarea";
  import { SortableTableHead } from "@/components/ui/sortable-table-head";
  import { useTableSort } from "@/hooks/useTableSort";
  import { getBadgeMappingForPrioridade, getBadgeMappingForStatus } from "@/lib/badge-mappings";
  import { useAuth } from "@/contexts/AuthContext";
  import { createClient } from "@/lib/supabase/client";
  import { createContrato, getContratos, type Contrato as ContratoGestao } from "@/services/contratosService";
  import {
    atribuirCompradorRC,
    createProcessoManual,
    createProcessoConsolidado,
    createRequisicao,
    deleteProcesso,
    getCompradores,
    getProcessos,
    getCompradoresNomes,
    getRequisicoesPendentes,
    getRequisitantes,
    iniciarProcesso,
    uploadAnexo,
    registrarAditivo,
    registrarProrrogacao,
    updateProcessoConsolidado,
    updateProcessoDetails,
    updateProcessoStatus,
    updatePrioridade,
    updatePrioridadeRC,
  } from "@/services/processosService";
  import type { Processo } from "@/types";
  import type { ProcessoComDetalhes } from "@/types";
  import { DetalhesProcessoModal } from "./DetalhesProcessoModal";

  type PerfilGestao = "admin" | "comprador";
  type ViewMode = "table" | "kanban";
  type StatusContrato = "Ativo" | "Próximo ao Vencimento" | "Em Renovação" | "Vencido";
  type StatusContratoComprador = "Ativo" | "Em Renovação" | "Vencido";

  interface ProcessoConsolidado {
    id: string;
    numeroProcesso: string;
    requisitante: string;
    objeto: string;
    tipo: string;
    status: string;
    responsavel: string;
    dataRecebimento: string;
    dataFinalizacao: string;
    empresaVencedora?: string;
    dataEntrega?: string;
    dataHomologacao?: string;
    tempoTotalDias?: number;
    valor: string;
    dataFimVigencia: string;
    statusContrato: StatusContrato;
    numero_requisicao?: string | null;
    empresa_vencedora?: string | null;
    observacoes_internas?: string | null;
    data_recebimento?: string | null;
    data_distribuicao?: string | null;
    data_finalizacao?: string | null;
    data_fim?: string | null;
    atualizado_em?: string;
    requisitante_id?: string | null;
    responsavel_id?: string | null;
    fornecedor_id?: string | null;
    modalidade?: string | null;
    requisitante_obj?: { nome: string } | null;
    responsavel_obj?: { nome: string } | null;
    cnpj?: string;
    instrumento?: "Contrato" | "TRP";
    tipoInstrumento?: "Contrato" | "TRP";
  }

  interface RegistroTRP {
    id: string;
    empresaVencedora: string;
    cnpj: string;
    numeroProcesso: string;
    valorContratado: string;
    vigencia: string;
    aditivos: number;
  }

  interface RegistroContrato {
    id: string;
    empresaVencedora: string;
    cnpj: string;
    numeroProcesso: string;
    valorContratado: string;
    vigencia: string;
    aditivos: number;
  }

  type PrioridadeRequisicao = "Alta" | "Média" | "Baixa";

  interface RequisicaoPendente {
    processo_id: string;
    id: string;
    numero_requisicao: string;
    requisitante: string;
    requisitante_nome: string;
    objeto: string;
    responsavel: string;
    responsavel_nome: string;
    prioridade: PrioridadeRequisicao;
    dataRecebimento: string;
    data_recebimento: string;
    dataFinalizacao: string;
    data_finalizacao: string;
    categoria: string;
    regional: string;
    valorEstimado: string;
  }

  const statusAndamentoPadrao = [
    "RC recebida pelo setor de compras",
    "Aguardando atribuição",
    "Análise de RC",
    "Devolvido ao Requisitante",
    "Em cotação",
    "Tramitando para aprovação",
    "Aprovada",
    "Aguardando entrega",
    "Finalizado",
  ] as const;

  const statusKanban = [
    "Aguardando atribuição",
    "Análise de RC",
    "Em cotação",
    "Devolvido ao Requisitante",
    "Tramitando para aprovação",
    "Aprovada",
  ] as const;

  const kanbanColumnConfig: Record<
    (typeof statusKanban)[number],
    { color: string; bgColor: string; borderColor: string; displayName: string }
  > = {
    "Aguardando atribuição": {
      color: "text-slate-700",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-300",
      displayName: "Aguardando atribuição",
    },
    "Análise de RC": {
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      displayName: "Análise de RC",
    },
    "Em cotação": {
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      displayName: "Em cotação",
    },
    "Devolvido ao Requisitante": {
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-300",
      displayName: "Devolvido ao Requisitante",
    },
    "Tramitando para aprovação": {
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      displayName: "Tramitando para aprovação",
    },
    Aprovada: {
      color: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
      displayName: "Aprovada",
    },
  };

  const statusKanbanConsolidado = ["Ativo", "Em Renovação", "Vencido"] as const;

  const kanbanConsolidadoColumnConfig: Record<
    (typeof statusKanbanConsolidado)[number],
    { color: string; bgColor: string; borderColor: string; displayName: string }
  > = {
    Ativo: {
      color: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
      displayName: "Ativo",
    },
    "Em Renovação": {
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      displayName: "Em Renovação",
    },
    Vencido: {
      color: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      displayName: "Vencido",
    },
  };

  const modalidadesSemPregao = ["Dispensa", "Inexigibilidade", "Licitacao (Pesquisa de Preco)"] as const;

  const empresasList = [
    "Empresa ABC Ltda",
    "Fornecedor XYZ S.A",
    "Servicos DEF Eireli",
    "Tecnologia GHI Ltda",
    "Solucoes JKL Corp",
    "Comercio MNO Ltda",
  ];

  const requisitantes = [
    "Carlos Alberto - Alimentacao",
    "Marina Santos - TI",
    "Pedro Oliveira - Manutencao",
    "Julia Fernandes - Infraestrutura",
    "Roberto Lima - Eventos",
    "Fernanda Costa - RH",
  ];

  const objetos = [
    "Aquisicao de equipamentos de cozinha industrial",
    "Contratacao de servico de manutencao de rede",
    "Aquisicao de materiais de limpeza",
    "Reforma de salas administrativas",
    "Locacao de equipamento de som e iluminacao",
    "Contratacao de sistema de gestao",
  ];

  const responsaveis = ["Maria Silva", "Joao Santos", "Ana Costa", "Carlos Oliveira"];

  function formatDate(value?: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("pt-BR");
  }

  function extractObservacaoCampo(observacoes: string | null | undefined, label: string) {
    if (!observacoes) return "";
    const regex = new RegExp(`${label}:\\s*([^|\\n]+)`, "i");
    const match = observacoes.match(regex);
    return match?.[1]?.trim() || "";
  }

  function countObservacaoOcorrencias(observacoes: string | null | undefined, termo: string) {
    if (!observacoes) return 0;
    const matches = observacoes.match(new RegExp(termo, "gi"));
    return matches?.length || 0;
  }

  function parseObservacoes(obs: string | null | undefined) {
    if (!obs) {
      return { tipoInstrumento: "Contrato" as "Contrato" | "TRP", cnpj: "-", observacoes: "" };
    }

    try {
      const parsed = JSON.parse(obs) as {
        tipoInstrumento?: string | null;
        cnpj?: string | null;
        observacoes?: string | null;
      };

      return {
        tipoInstrumento: (parsed.tipoInstrumento === "TRP" ? "TRP" : "Contrato") as "Contrato" | "TRP",
        cnpj: parsed.cnpj || "-",
        observacoes: parsed.observacoes || "",
      };
    } catch {
      return {
        tipoInstrumento:
          ((obs.match(/Instrumento:\s*([^|\]\n]+)/i)?.[1]?.trim() || "Contrato") === "TRP" ? "TRP" : "Contrato") as
            | "Contrato"
            | "TRP",
        cnpj: obs.match(/CNPJ:\s*([^|\n]+)/i)?.[1]?.trim() || "-",
        observacoes: obs,
      };
    }
  }

  function buildInstrumentoObservacoes(cnpj: string, instrumento: string, observacoesAtuais?: string | null) {
    const parsed = parseObservacoes(observacoesAtuais);

    return JSON.stringify({
      tipoInstrumento: instrumento || parsed.tipoInstrumento || "Contrato",
      cnpj: cnpj || parsed.cnpj || "",
      observacoes: parsed.observacoes || "",
    });
  }

  function mapProcessoToRequisicao(processo: ProcessoComDetalhes): RequisicaoPendente {
    const numeroRequisicao = processo.numero_requisicao || processo.id;
    const requisitanteNome = processo.requisitante?.nome || "-";
    const responsavelNome = processo.responsavel?.nome || "Não atribuído";
    const categoria = extractObservacaoCampo(processo.observacoes_internas, "Categoria") || processo.modalidade || "-";
    const regional = extractObservacaoCampo(processo.observacoes_internas, "Regional") || "-";

    return {
      processo_id: processo.id,
      id: numeroRequisicao,
      numero_requisicao: numeroRequisicao,
      requisitante: requisitanteNome,
      requisitante_nome: requisitanteNome,
      objeto: processo.objeto || processo.descricao || "-",
      responsavel: responsavelNome,
      responsavel_nome: responsavelNome,
      prioridade: (processo.prioridade as PrioridadeRequisicao) || "Baixa",
      dataRecebimento: formatDate(processo.data_recebimento || processo.criado_em),
      data_recebimento: processo.data_recebimento || processo.criado_em || "",
      dataFinalizacao: formatDate(processo.data_finalizacao || processo.data_fim),
      data_finalizacao: processo.data_finalizacao || processo.data_fim || "",
      categoria,
      regional,
      valorEstimado: "-",
    };
  }

  function normalizeStatusAndamento(status?: string | null) {
    if (!status) return "Aguardando atribuição";

    const normalized = status.trim().toLowerCase();

    if (normalized === "rc recebida" || normalized === "rc recebida pelo servidor de compras") {
      return "RC recebida pelo setor de compras";
    }
    if (normalized === "em análise" || normalized === "em analise") {
      return "Análise de RC";
    }
    if (normalized === "em cotação" || normalized === "em cotacao" || normalized === "em cotação com fornecedores" || normalized === "em cotacao com fornecedores") {
      return "Em cotação";
    }
    if (normalized === "devolvido" || normalized === "rc devolvida para ajuste") {
      return "Devolvido ao Requisitante";
    }
    if (normalized === "aprovado") {
      return "Aprovada";
    }
    if (normalized === "concluída" || normalized === "concluida") {
      return "Finalizado";
    }

    return status;
  }

  function getStatusOptionsForProcesso(status?: string | null) {
    const statusNormalizado = normalizeStatusAndamento(status);

    if (!statusNormalizado) {
      return [...statusAndamentoPadrao];
    }

    return statusAndamentoPadrao.includes(statusNormalizado as (typeof statusAndamentoPadrao)[number])
      ? [...statusAndamentoPadrao]
      : [statusNormalizado, ...statusAndamentoPadrao];
  }

  function mapProcessoToDiario(processo: ProcessoComDetalhes): Processo {
    const statusNormalizado = normalizeStatusAndamento(processo.status);

    return {
      id: processo.id,
      descricao: processo.descricao || processo.objeto || "-",
      numeroRequisicao: processo.numero_requisicao || "-",
      requisitante: processo.requisitante?.nome || "-",
      objeto: processo.objeto || processo.descricao || "-",
      modalidade: processo.modalidade || "",
      empresa: processo.fornecedor?.razao_social || "-",
      empresaVencedora: processo.empresa_vencedora || undefined,
      status: statusNormalizado as Processo["status"],
      responsavel: processo.responsavel?.nome || "-",
      prioridade: (processo.prioridade as Processo["prioridade"]) || "Baixa",
      dataDistribuicao: formatDate(processo.data_distribuicao),
      dataRecebimento: formatDate(processo.data_recebimento || processo.criado_em),
      dataFinalizacao: formatDate(processo.data_finalizacao || processo.data_fim),
      valor:
        typeof processo.valor === "number"
          ? Number(processo.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : undefined,
      observacoesInternas: processo.observacoes_internas || undefined,
      leadTime: processo.lead_time || undefined,
      justificativaDevolucao: processo.justificativa_devolucao || undefined,
      numero_requisicao: processo.numero_requisicao,
      responsavel_id: processo.responsavel_id,
      requisitante_id: processo.requisitante_id,
      fornecedor_id: processo.fornecedor_id,
      empresa_vencedora: processo.empresa_vencedora,
      observacoes_internas: processo.observacoes_internas,
      lead_time: processo.lead_time,
      justificativa_devolucao: processo.justificativa_devolucao,
      bloquear_envio_automatico: processo.bloquear_envio_automatico,
      data_distribuicao: processo.data_distribuicao,
      data_recebimento: processo.data_recebimento,
      data_finalizacao: processo.data_finalizacao,
      data_inicio: processo.data_inicio,
      data_fim: processo.data_fim,
      criado_em: processo.criado_em,
      atualizado_em: processo.atualizado_em,
    };
  }

  function mapStatusToStatusContrato(status?: string | null): StatusContrato {
    if (status === "Vencido") return "Vencido";
    if (status === "Próximo ao Vencimento" || status === "Em Renovação") return "Próximo ao Vencimento";
    return "Ativo";
  }

  function isModalidadeLicitacao(modalidade?: string | null) {
    const normalized = (modalidade || "").toLowerCase();
    return normalized.includes("licita") || normalized.includes("preg") || normalized.includes("pregao");
  }

  function mapProcessoToConsolidado(processo: ProcessoComDetalhes): ProcessoConsolidado {
    const observacoesParseadas = parseObservacoes(processo.observacoes_internas);
    const cnpj = observacoesParseadas.cnpj || "-";
    const instrumento = observacoesParseadas.tipoInstrumento;

    return {
      id: processo.id,
      numeroProcesso: processo.numero_requisicao || processo.id,
      requisitante: processo.requisitante?.nome || "-",
      objeto: processo.objeto || processo.descricao || "-",
      tipo: processo.modalidade || "Dispensa",
      status: processo.status || "-",
      responsavel: processo.responsavel?.nome || "-",
      dataRecebimento: formatDate(processo.data_recebimento || processo.criado_em),
      dataFinalizacao: formatDate(processo.data_finalizacao),
      empresaVencedora: processo.empresa_vencedora || undefined,
      valor:
        typeof processo.valor === "number"
          ? Number(processo.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : "R$ 0,00",
      dataFimVigencia: formatDate(processo.data_fim),
      statusContrato: mapStatusToStatusContrato(processo.status),
      numero_requisicao: processo.numero_requisicao,
      empresa_vencedora: processo.empresa_vencedora,
      observacoes_internas: processo.observacoes_internas,
      data_recebimento: processo.data_recebimento,
      data_distribuicao: processo.data_distribuicao,
      data_finalizacao: processo.data_finalizacao,
      data_fim: processo.data_fim,
      atualizado_em: processo.atualizado_em,
      requisitante_id: processo.requisitante_id,
      responsavel_id: processo.responsavel_id,
      fornecedor_id: processo.fornecedor_id,
      modalidade: processo.modalidade,
      requisitante_obj: processo.requisitante || null,
      responsavel_obj: processo.responsavel || null,
      cnpj,
      instrumento,
      tipoInstrumento: instrumento,
    };
  }

  function mapConsolidadoToTRP(processo: ProcessoConsolidado): RegistroTRP {
    return {
      id: processo.id,
      empresaVencedora: processo.empresaVencedora || "-",
      cnpj: processo.cnpj || "-",
      numeroProcesso: processo.numeroProcesso,
      valorContratado: processo.valor || "R$ 0,00",
      vigencia: processo.dataFimVigencia || "-",
      aditivos: countObservacaoOcorrencias(processo.observacoes_internas, "Aditivo"),
    };
  }

  function mapConsolidadoToContrato(processo: ProcessoConsolidado): RegistroContrato {
    return {
      id: processo.id,
      empresaVencedora: processo.empresaVencedora || "-",
      cnpj: processo.cnpj || "-",
      numeroProcesso: processo.numeroProcesso,
      valorContratado: processo.valor || "R$ 0,00",
      vigencia: processo.dataFimVigencia || "-",
      aditivos: countObservacaoOcorrencias(processo.observacoes_internas, "Aditivo"),
    };
  }

  function parseCurrencyInput(value: string) {
    const normalized = value.replace(/\s|R\$/g, "").replace(/\./g, "").replace(/,/g, ".").trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? null : parsed;
  }

  function getTodayInputDate() {
    return new Date().toISOString().slice(0, 10);
  }

  function getRequisicaoConfigNumero(requisicao: Processo | RequisicaoPendente | null) {
    if (!requisicao) return "-";
    return "numeroRequisicao" in requisicao ? requisicao.numeroRequisicao ?? requisicao.id : requisicao.numero_requisicao || requisicao.id;
  }

  function getRequisicaoConfigObjeto(requisicao: Processo | RequisicaoPendente | null) {
    if (!requisicao) return "-";
    return "descricao" in requisicao ? requisicao.objeto ?? requisicao.descricao : requisicao.objeto;
  }

  function getRequisicaoConfigModalidade(requisicao: Processo | RequisicaoPendente | null) {
    if (!requisicao) return "Dispensa";
    return "modalidade" in requisicao ? requisicao.modalidade || "Dispensa" : "Dispensa";
  }

  function ModalidadeBadge({ modalidade }: { modalidade?: string | null }) {
    if (!modalidade) {
      return <span className="text-gray-400 italic text-xs">A definir</span>;
    }

    return <span>{modalidade}</span>;
  }

  function DataFinalizacaoFallback({ value }: { value?: string | null }) {
    if (!value || value === "-") {
      return <span className="text-gray-400 italic text-xs">A definir</span>;
    }

    return <span>{value}</span>;
  }

  function formatBrDate(day: number, month: number, year: number) {
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
  }

  function normalizeStatusContratoComprador(status: StatusContrato): StatusContratoComprador {
    if (status === "Ativo" || status === "Vencido") return status;
    return "Em Renovação";
  }

  interface ProcessosModuleProps {
    perfil: PerfilGestao;
  }

  export function ProcessosModule({ perfil }: ProcessosModuleProps) {
    const { currentUser, currentProfile } = useAuth();
    const nomeUsuarioLogado = currentUser?.user_metadata?.name || currentUser?.profile?.nome || "";
    const supabase = useMemo(() => createClient(), []);
    const [activeTab, setActiveTab] = useState(perfil === "admin" ? "requisicoes" : "diario");
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [viewModeConsolidado, setViewModeConsolidado] = useState<ViewMode>("table");
    const [mostrarApenasMeus, setMostrarApenasMeus] = useState(perfil === "comprador");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [searchTermRequisicoes, setSearchTermRequisicoes] = useState("");
    const [prioridadeFilterRequisicoes, setPrioridadeFilterRequisicoes] = useState("todas");
    const [searchTermDiario, setSearchTermDiario] = useState("");
    const [statusFilterDiario, setStatusFilterDiario] = useState("todos");
    const [tipoFilterDiario, setTipoFilterDiario] = useState("todos");

    const [searchTermConsolidado, setSearchTermConsolidado] = useState("");
    const [statusFilterConsolidado, setStatusFilterConsolidado] = useState("todos");
    const [searchTermAtribuidas, setSearchTermAtribuidas] = useState("");
    const [prioridadeFilterAtribuidas, setPrioridadeFilterAtribuidas] = useState("todas");
    const [searchTermTRP, setSearchTermTRP] = useState("");
    const [filterTRP, setFilterTRP] = useState("todos");
    const [searchTermContratos, setSearchTermContratos] = useState("");
    const [filterContratos, setFilterContratos] = useState("todos");
    const [isConfigurarModalOpen, setIsConfigurarModalOpen] = useState(false);
    const [requisicaoParaConfigurar, setRequisicaoParaConfigurar] = useState<Processo | RequisicaoPendente | null>(null);
    const [isNovaDemandaModalOpen, setIsNovaDemandaModalOpen] = useState(false);
    const [isNewProcessModalOpen, setIsNewProcessModalOpen] = useState(false);
    const [isNewConsolidadoModalOpen, setIsNewConsolidadoModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [processoToDelete, setProcessoToDelete] = useState<Processo | RequisicaoPendente | null>(null);
    const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
    const [processoParaMudarStatus, setProcessoParaMudarStatus] = useState<Processo | null>(null);
    const [novoStatus, setNovoStatus] = useState("");
    const [justificativaStatus, setJustificativaStatus] = useState("");
    const [isAtribuirModalOpen, setIsAtribuirModalOpen] = useState(false);
    const [selectedRequisicao, setSelectedRequisicao] = useState<RequisicaoPendente | null>(null);
    const [compradorSelecionado, setCompradorSelecionado] = useState("");
    const [dataInicioDistribuicao, setDataInicioDistribuicao] = useState("");
    const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
    const [reqParaPrioridade, setReqParaPrioridade] = useState<RequisicaoPendente | null>(null);
    const [novaPrioridade, setNovaPrioridade] = useState<PrioridadeRequisicao | "">("");
    const [requisicaoParaDetalhes, setRequisicaoParaDetalhes] = useState<RequisicaoPendente | null>(null);
    const [bloquearEnvioAutomatico, setBloquearEnvioAutomatico] = useState(false);
    const [classificacaoPedido, setClassificacaoPedido] = useState("");
    const [requisicoesPendentes, setRequisicoesPendentes] = useState<any[]>([]);
    const [compradoresDisponiveis, setCompradoresDisponiveis] = useState<string[]>([]);
    const [compradoresOptions, setCompradoresOptions] = useState<{ id: string; nome: string }[]>([]);
    const [requisitantesDisponiveis, setRequisitantesDisponiveis] = useState<{ id: string; nome: string }[]>([]);
    const [processosRaw, setProcessosRaw] = useState<ProcessoComDetalhes[]>([]);
    const [novaDemandaForm, setNovaDemandaForm] = useState({
      numero_requisicao: "",
      data_recebimento: "",
      requisitante_id: "",
      objeto: "",
      prioridade: "Média" as PrioridadeRequisicao,
      categoria: "",
      regional: "",
      valor_estimado: "",
    });
    const [formDataNovoProcesso, setFormDataNovoProcesso] = useState<{
      id: string;
      numeroRequisicao: string;
      requisitante_id: string;
      modalidade: string;
      status: string;
      objeto: string;
    }>({
      id: "",
      numeroRequisicao: "",
      requisitante_id: "",
      modalidade: "Dispensa",
      status: "Análise de RC",
      objeto: "",
    });
    const [formDataConsolidado, setFormDataConsolidado] = useState({
      numeroProcesso: "",
      valor: "",
      empresaVencedora: "",
      requisitante_id: "",
      modalidade: "Dispensa",
      status: "Ativo",
      dataFimVigencia: "",
      objeto: "",
      cnpj: "",
      instrumento: "Contrato",
    });
    const [selectedProcess, setSelectedProcess] = useState<Processo | null>(null);
    const [formDataEdit, setFormDataEdit] = useState({
      modalidade: "Dispensa",
      status: "Análise de RC",
      objeto: "",
      observacoes: "",
      dataFinalizacao: "",
    });
    const [selectedConsolidado, setSelectedConsolidado] = useState<ProcessoConsolidado | null>(null);
    const [formDataEditConsolidado, setFormDataEditConsolidado] = useState({
      valor: "",
      empresaVencedora: "",
      statusContrato: "Ativo",
      dataFimVigencia: "",
      objeto: "",
      cnpj: "",
      instrumento: "Contrato",
    });
    const [selectedTRP, setSelectedTRP] = useState<RegistroTRP | null>(null);
    const [selectedContrato, setSelectedContrato] = useState<RegistroContrato | null>(null);
    const [processoTipo, setProcessoTipo] = useState<"diario" | "consolidado">("diario");

    const [isEditProcessModalOpen, setIsEditProcessModalOpen] = useState(false);
    const [isEditConsolidadoModalOpen, setIsEditConsolidadoModalOpen] = useState(false);
    const [isEditTRPModalOpen, setIsEditTRPModalOpen] = useState(false);
    const [isEditContratoModalOpen, setIsEditContratoModalOpen] = useState(false);
    const [isAditivoModalOpen, setIsAditivoModalOpen] = useState(false);
    const [isProrrogacaoModalOpen, setIsProrrogacaoModalOpen] = useState(false);
    const [configModalidade, setConfigModalidade] = useState<string>("Dispensa");
    const [configStatusInicial, setConfigStatusInicial] = useState<string>(statusAndamentoPadrao[1]);
    const [configComprador, setConfigComprador] = useState("");
    const [formDataAditivo, setFormDataAditivo] = useState({
      numero: "",
      data: "",
      tipo: "",
      valor: "",
      justificativa: "",
      arquivo: null as File | null,
    });
    const [formDataProrrogacao, setFormDataProrrogacao] = useState({
      numero: "",
      data: "",
      novaVigencia: "",
      justificativa: "",
      arquivo: null as File | null,
    });
    const [contratosGestaoRaw, setContratosGestaoRaw] = useState<ContratoGestao[]>([]);
    const [isGeneratingContract, setIsGeneratingContract] = useState(false);

    const loadProcessos = async () => {
      try {
        const [processosData, requisicoesData, compradoresData, contratosData] = await Promise.all([
          getProcessos(),
          getRequisicoesPendentes(),
          getCompradoresNomes(),
          getContratos(),
        ]);
        setProcessosRaw(processosData);
        setRequisicoesPendentes(requisicoesData.map(mapProcessoToRequisicao));
        setCompradoresDisponiveis(compradoresData);
        setContratosGestaoRaw(contratosData);
        const compradoresComId = await getCompradores();
        setCompradoresOptions(compradoresComId);
      } catch (error) {
        toast.error("Erro ao carregar requisições", {
          description: error instanceof Error ? error.message : "Não foi possível carregar os dados.",
        });
      }
    };

    const loadRequisitantes = async () => {
      try {
        const data = await getRequisitantes();
        setRequisitantesDisponiveis(data);
      } catch (error) {
        toast.error("Erro ao carregar requisitantes", {
          description: error instanceof Error ? error.message : "Não foi possível carregar os requisitantes.",
        });
      }
    };

    useEffect(() => {
      void loadProcessos();
      if (perfil === "admin") {
        void loadRequisitantes();
      }
    }, [perfil]);

    useEffect(() => {
      const channel = supabase
        .channel("processos-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "processos",
          },
          () => {
            void loadProcessos();
          }
        )
        .subscribe();

      return () => {
        void supabase.removeChannel(channel);
      };
    }, [supabase]);

    useEffect(() => {
      if (selectedProcess && isEditProcessModalOpen) {
        setFormDataEdit({
          modalidade: selectedProcess.modalidade || "Dispensa",
          status: selectedProcess.status || "Análise de RC",
          objeto: selectedProcess.objeto || selectedProcess.descricao || "",
          observacoes: selectedProcess.observacoesInternas || selectedProcess.observacoes_internas || "",
          dataFinalizacao: selectedProcess.data_finalizacao || "",
        });
      }
    }, [isEditProcessModalOpen, selectedProcess]);

    useEffect(() => {
      if (selectedConsolidado && isEditConsolidadoModalOpen) {
        setFormDataEditConsolidado({
          valor: selectedConsolidado.valor || "R$ 0,00",
          empresaVencedora: selectedConsolidado.empresaVencedora || "-",
          statusContrato: selectedConsolidado.statusContrato || "Ativo",
          dataFimVigencia: selectedConsolidado.data_fim || "",
          objeto: selectedConsolidado.objeto || "",
          cnpj: selectedConsolidado.cnpj || "",
          instrumento: selectedConsolidado.instrumento || "Contrato",
        });
      }
    }, [isEditConsolidadoModalOpen, selectedConsolidado]);

    const handleChangeEdit = (field: "modalidade" | "status" | "objeto" | "observacoes" | "dataFinalizacao", value: string) => {
      setFormDataEdit((prev) => ({ ...prev, [field]: value }));
    };

    const processosDiariosMapped = useMemo(() => processosRaw.map(mapProcessoToDiario), [processosRaw]);

    const processosDiarios = useMemo(
      () =>
        processosDiariosMapped.filter(
          (processo) =>
            ![
              "RC recebida pelo setor de compras",
              "Ativo",
              "Vencido",
              "Próximo ao Vencimento",
              "Em Renovação",
              "Concluído",
              "Homologado",
              "Finalizado",
              "Contrato Ativo",
            ].includes(String(processo.status)),
        ),
      [processosDiariosMapped],
    );

    const processosConsolidadosMapped = useMemo(
      () =>
        processosRaw
          .filter((processo) =>
            [
              "Concluído",
              "Contrato Ativo",
              "Homologado",
              "Finalizado",
              "Ativo",
              "Vencido",
              "Próximo ao Vencimento",
              "Em Renovação",
            ].includes(String(processo.status)),
          )
          .map(mapProcessoToConsolidado),
      [processosRaw],
    );

    const processosDiariosPerfil = useMemo(() => processosDiarios, [processosDiarios]);
    const processosDiariosAtribuidosAoComprador = useMemo(
      () => processosDiarios.filter((processo) => processo.responsavel === nomeUsuarioLogado),
      [nomeUsuarioLogado, processosDiarios],
    );

    const filteredProcessosDiarios = useMemo(
      () =>
        processosDiariosPerfil.filter((processo) => {
          const haystack = [
            processo.id,
            processo.numeroRequisicao ?? "",
            processo.requisitante ?? "",
            processo.objeto ?? processo.descricao,
          ]
            .join(" ")
            .toLowerCase();

          const matchesSearch = haystack.includes(searchTermDiario.toLowerCase());
          const matchesStatus = statusFilterDiario === "todos" || processo.status === statusFilterDiario;
          const matchesTipo = tipoFilterDiario === "todos" || processo.modalidade === tipoFilterDiario;
          const matchesDono = !mostrarApenasMeus || processo.responsavel === nomeUsuarioLogado;

          return matchesSearch && matchesStatus && matchesTipo && matchesDono;
        }),
      [processosDiariosPerfil, searchTermDiario, statusFilterDiario, tipoFilterDiario, mostrarApenasMeus, nomeUsuarioLogado],
    );

    const contratosPorProcessoId = useMemo(
      () => new Set(contratosGestaoRaw.map((contrato) => contrato.processo_id).filter((id): id is string => Boolean(id))),
      [contratosGestaoRaw],
    );

    const canGenerateContract = useMemo(
      () => currentProfile === "admin" || currentProfile === "gestora",
      [currentProfile],
    );

    const selectedConsolidadoJaGerouContrato = useMemo(
      () => (selectedConsolidado ? contratosPorProcessoId.has(selectedConsolidado.id) : false),
      [contratosPorProcessoId, selectedConsolidado],
    );

    const selectedConsolidadoElegivel = useMemo(
      () =>
        selectedConsolidado
          ? ["Finalizado", "Homologado", "Concluído", "Aprovada"].includes(String(selectedConsolidado.status))
          : false,
      [selectedConsolidado],
    );

    const {
      items: sortedProcessosDiarios,
      requestSort: requestSortDiario,
      sortConfig: sortConfigDiario,
    } = useTableSort(filteredProcessosDiarios);

    const totalItemsDiario = sortedProcessosDiarios.length;
    const totalPagesDiario = Math.max(1, Math.ceil(totalItemsDiario / itemsPerPage));
    const startIndexDiario = (currentPage - 1) * itemsPerPage;
    const endIndexDiario = startIndexDiario + itemsPerPage;
    const paginatedProcessosDiarios = sortedProcessosDiarios.slice(startIndexDiario, endIndexDiario);
    const displayStartDiario = totalItemsDiario === 0 ? 0 : startIndexDiario + 1;
    const displayEndDiario = Math.min(endIndexDiario, totalItemsDiario);

    const paginationPagesDiario = useMemo(() => {
      if (totalPagesDiario <= 7) {
        return Array.from({ length: totalPagesDiario }, (_, index) => index + 1);
      }

      const pages: Array<number | "ellipsis-left" | "ellipsis-right"> = [1];
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPagesDiario - 1, currentPage + 1);

      if (startPage > 2) pages.push("ellipsis-left");

      for (let page = startPage; page <= endPage; page += 1) {
        pages.push(page);
      }

      if (endPage < totalPagesDiario - 1) pages.push("ellipsis-right");

      pages.push(totalPagesDiario);
      return pages;
    }, [currentPage, totalPagesDiario]);

    useEffect(() => {
      setCurrentPage(1);
    }, [searchTermDiario, statusFilterDiario, tipoFilterDiario]);

    useEffect(() => {
      if (currentPage > totalPagesDiario) {
        setCurrentPage(totalPagesDiario);
      }
    }, [currentPage, totalPagesDiario]);

    const statusCountsDiario = useMemo(
      () => ({
        total: processosDiariosPerfil.length,
        analise: processosDiariosPerfil.filter((p) => p.status === "Análise de RC").length,
        cotacao: processosDiariosPerfil.filter((p) => p.status === "Em cotação").length,
        devolvida: processosDiariosPerfil.filter((p) => p.status === "Devolvido ao Requisitante").length,
        tramitando: processosDiariosPerfil.filter((p) => p.status === "Tramitando para aprovação").length,
      }),
      [processosDiariosPerfil],
    );

    const requisicoesCounts = useMemo(
      () => ({
        total: requisicoesPendentes.length,
        alta: requisicoesPendentes.filter((req) => req.prioridade === "Alta").length,
        media: requisicoesPendentes.filter((req) => req.prioridade === "Média").length,
        baixa: requisicoesPendentes.filter((req) => req.prioridade === "Baixa").length,
      }),
      [requisicoesPendentes],
    );

    const filteredRequisicoes = useMemo(
      () =>
        requisicoesPendentes.filter((req) => {
          const busca = [req.id, req.requisitante, req.objeto].join(" ").toLowerCase();
          const matchesSearch = busca.includes(searchTermRequisicoes.toLowerCase());
          const matchesPrioridade =
            prioridadeFilterRequisicoes === "todas" || req.prioridade === prioridadeFilterRequisicoes;

          return matchesSearch && matchesPrioridade;
        }),
      [prioridadeFilterRequisicoes, requisicoesPendentes, searchTermRequisicoes],
    );

    const {
      items: sortedRequisicoes,
      requestSort: sortReq,
      sortConfig: configReq,
    } = useTableSort(filteredRequisicoes);

    const requisicoesAtribuidasCounts = useMemo(
      () => ({
        total: processosDiariosAtribuidosAoComprador.length,
        alta: processosDiariosAtribuidosAoComprador.filter((req) => req.prioridade === "Alta").length,
        media: processosDiariosAtribuidosAoComprador.filter((req) => req.prioridade === "Média").length,
        baixa: processosDiariosAtribuidosAoComprador.filter((req) => req.prioridade === "Baixa").length,
      }),
      [processosDiariosAtribuidosAoComprador],
    );

    const filteredRequisicoesAtribuidas = useMemo(
      () =>
        processosDiariosAtribuidosAoComprador.filter((req) => {
          const busca = [req.numeroRequisicao ?? req.id, req.requisitante ?? "", req.objeto ?? req.descricao ?? ""]
            .join(" ")
            .toLowerCase();
          const matchesSearch = busca.includes(searchTermAtribuidas.toLowerCase());
          const matchesPrioridade =
            prioridadeFilterAtribuidas === "todas" || req.prioridade === prioridadeFilterAtribuidas;

          return matchesSearch && matchesPrioridade;
        }),
      [processosDiariosAtribuidosAoComprador, searchTermAtribuidas, prioridadeFilterAtribuidas],
    );

    const processosConsolidadosPerfil = useMemo(() => processosConsolidadosMapped, [processosConsolidadosMapped]);

    const statusCountsConsolidado = useMemo(
      () => ({
        todos: processosConsolidadosPerfil.length,
        ativo: processosConsolidadosPerfil.filter((p) => p.statusContrato === "Ativo").length,
        proximoVencimento: processosConsolidadosPerfil.filter((p) => p.statusContrato === "Próximo ao Vencimento")
          .length,
        vencido: processosConsolidadosPerfil.filter((p) => p.statusContrato === "Vencido").length,
      }),
      [processosConsolidadosPerfil],
    );

    const processosConsolidadosComprador = useMemo(
      () =>
        processosConsolidadosPerfil.map((processo) => ({
          ...processo,
          statusContrato: normalizeStatusContratoComprador(processo.statusContrato),
        })),
      [processosConsolidadosPerfil],
    );

    const statusCountsConsolidadoComprador = useMemo(
      () => ({
        todos: processosConsolidadosComprador.length,
        ativo: processosConsolidadosComprador.filter((p) => p.statusContrato === "Ativo").length,
        emRenovacao: processosConsolidadosComprador.filter((p) => p.statusContrato === "Em Renovação").length,
        vencido: processosConsolidadosComprador.filter((p) => p.statusContrato === "Vencido").length,
      }),
      [processosConsolidadosComprador],
    );

    const filteredProcessosConsolidados = useMemo(
      () =>
        processosConsolidadosPerfil.filter((processo) => {
          const matchesSearch =
            (processo.empresaVencedora ?? "").toLowerCase().includes(searchTermConsolidado.toLowerCase()) ||
            processo.numeroProcesso.toLowerCase().includes(searchTermConsolidado.toLowerCase()) ||
            processo.requisitante.toLowerCase().includes(searchTermConsolidado.toLowerCase());
          const matchesStatus =
            statusFilterConsolidado === "todos" || processo.statusContrato === statusFilterConsolidado;
          return matchesSearch && matchesStatus;
        }),
      [processosConsolidadosPerfil, searchTermConsolidado, statusFilterConsolidado],
    );

    const filteredProcessosConsolidadosComprador = useMemo(
      () =>
        processosConsolidadosComprador.filter((processo) => {
          const matchesSearch =
            (processo.empresaVencedora ?? "").toLowerCase().includes(searchTermConsolidado.toLowerCase()) ||
            processo.numeroProcesso.toLowerCase().includes(searchTermConsolidado.toLowerCase());
          const matchesStatus =
            statusFilterConsolidado === "todos" || processo.statusContrato === statusFilterConsolidado;
          return matchesSearch && matchesStatus;
        }),
      [processosConsolidadosComprador, searchTermConsolidado, statusFilterConsolidado],
    );

    const diretasAdmin = useMemo(
      () => filteredProcessosConsolidados.filter((processo) => !isModalidadeLicitacao(processo.tipo)),
      [filteredProcessosConsolidados],
    );

    const licitacoesAdmin = useMemo(
      () => filteredProcessosConsolidados.filter((processo) => isModalidadeLicitacao(processo.tipo)),
      [filteredProcessosConsolidados],
    );

    const diretasComprador = useMemo(
      () => filteredProcessosConsolidadosComprador.filter((processo) => !isModalidadeLicitacao(processo.tipo)),
      [filteredProcessosConsolidadosComprador],
    );

    const licitacoesComprador = useMemo(
      () => filteredProcessosConsolidadosComprador.filter((processo) => isModalidadeLicitacao(processo.tipo)),
      [filteredProcessosConsolidadosComprador],
    );

    const filteredDiretas = perfil === "admin" ? diretasAdmin : diretasComprador;
    const filteredLicitacoes = perfil === "admin" ? licitacoesAdmin : licitacoesComprador;

    const trpList = useMemo<RegistroTRP[]>(
      () => processosConsolidadosPerfil.filter((processo) => processo.tipoInstrumento === "TRP").map(mapConsolidadoToTRP),
      [processosConsolidadosPerfil],
    );

    const contratosList = useMemo<RegistroContrato[]>(
      () =>
        processosConsolidadosPerfil.filter((processo) => processo.tipoInstrumento === "Contrato").map(mapConsolidadoToContrato),
      [processosConsolidadosPerfil],
    );

    const filteredTRP = useMemo<RegistroTRP[]>(
      () =>
        trpList.filter((trp) => {
          const matchesSearch =
            trp.empresaVencedora.toLowerCase().includes(searchTermTRP.toLowerCase()) ||
            trp.cnpj.includes(searchTermTRP) ||
            trp.numeroProcesso.toLowerCase().includes(searchTermTRP.toLowerCase());
          const matchesFilter =
            filterTRP === "todos" ||
            (filterTRP === "com-aditivos" && trp.aditivos > 0) ||
            (filterTRP === "sem-aditivos" && trp.aditivos === 0);
          return matchesSearch && matchesFilter;
        }),
      [filterTRP, searchTermTRP, trpList],
    );

    const filteredContratos = useMemo<RegistroContrato[]>(
      () =>
        contratosList.filter((contrato) => {
          const matchesSearch =
            contrato.empresaVencedora.toLowerCase().includes(searchTermContratos.toLowerCase()) ||
            contrato.cnpj.includes(searchTermContratos) ||
            contrato.numeroProcesso.toLowerCase().includes(searchTermContratos.toLowerCase());
          const matchesFilter =
            filterContratos === "todos" ||
            (filterContratos === "com-aditivos" && contrato.aditivos > 0) ||
            (filterContratos === "sem-aditivos" && contrato.aditivos === 0);
          return matchesSearch && matchesFilter;
        }),
      [contratosList, filterContratos, searchTermContratos],
    );

    const {
      items: sortedDiretas,
      requestSort: sortDiretas,
      sortConfig: configDiretas,
    } = useTableSort(filteredDiretas);

    const {
      items: sortedLicitacoes,
      requestSort: sortLicitacoes,
      sortConfig: configLicitacoes,
    } = useTableSort(filteredLicitacoes);

    const {
      items: sortedTRP,
      requestSort: sortTRP,
      sortConfig: configTRP,
    } = useTableSort(filteredTRP);

    const {
      items: sortedContratos,
      requestSort: sortContratos,
      sortConfig: configContratos,
    } = useTableSort(filteredContratos);

    const handleStatusChange = async (processoId: string, novoStatus: string) => {
      if (!statusAndamentoPadrao.includes(novoStatus as (typeof statusAndamentoPadrao)[number])) {
        return;
      }

      if (!currentUser?.id || isSubmitting) return;

      const loadingToast = toast.loading("Atualizando status...");
      setIsSubmitting(true);

      try {
        await updateProcessoStatus(processoId, novoStatus, currentUser.id);
        await loadProcessos();
        toast.success("Status atualizado com sucesso!", { id: loadingToast });
      } catch (error) {
        toast.error("Erro ao atualizar status", {
          id: loadingToast,
          description: error instanceof Error ? error.message : "Não foi possível atualizar o status.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleIniciarMudancaStatus = (processo: Processo, statusSelecionado: string) => {
      if (processo.status === statusSelecionado) return;
      if (!statusAndamentoPadrao.includes(statusSelecionado as (typeof statusAndamentoPadrao)[number])) return;

      if (perfil === "admin") {
        setProcessoParaMudarStatus(processo);
        setNovoStatus(statusSelecionado);
        setJustificativaStatus("");
        setIsStatusChangeModalOpen(true);
        return;
      }

      void handleStatusChange(processo.id, statusSelecionado);
    };

    const handleConfirmarMudancaStatus = async () => {
      if (!processoParaMudarStatus || !novoStatus || !currentUser?.id || isSubmitting) return;

      const loadingToast = toast.loading("Atualizando status...");
      setIsSubmitting(true);

      try {
        await updateProcessoStatus(processoParaMudarStatus.id, novoStatus, currentUser.id, justificativaStatus);
        setIsStatusChangeModalOpen(false);
        setProcessoParaMudarStatus(null);
        setNovoStatus("");
        setJustificativaStatus("");
        await loadProcessos();
        toast.success("Status atualizado com sucesso!", { id: loadingToast });
      } catch (error) {
        toast.error("Erro ao atualizar status", {
          id: loadingToast,
          description: error instanceof Error ? error.message : "Não foi possível atualizar o status.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleAtribuirComprador = async () => {
      const dataDistribuicao = dataInicioDistribuicao || getTodayInputDate();

      if (!selectedRequisicao || !compradorSelecionado || isSubmitting) return;

      setIsSubmitting(true);
      try {
        await atribuirCompradorRC(selectedRequisicao.processo_id, compradorSelecionado, dataDistribuicao);
        toast.success("Requisição distribuída com sucesso!");
        setIsAtribuirModalOpen(false);
        setSelectedRequisicao(null);
        setCompradorSelecionado("");
        setDataInicioDistribuicao("");
        await loadProcessos();
      } catch (error) {
        toast.error("Erro ao distribuir requisição", {
          description: error instanceof Error ? error.message : "Não foi possível distribuir a requisição.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleCadastrarNovaDemanda = async () => {
      if (isSubmitting) return;

      setIsSubmitting(true);
      try {
        await createRequisicao({
          numero_requisicao: novaDemandaForm.numero_requisicao,
          data_recebimento: novaDemandaForm.data_recebimento,
          requisitante_id: novaDemandaForm.requisitante_id,
          objeto: novaDemandaForm.objeto,
          prioridade: novaDemandaForm.prioridade,
          categoria: novaDemandaForm.categoria,
          regional: novaDemandaForm.regional,
          valor: parseCurrencyInput(novaDemandaForm.valor_estimado),
        });
        toast.success("Demanda cadastrada com sucesso!");
        setIsNovaDemandaModalOpen(false);
        setNovaDemandaForm({
          numero_requisicao: "",
          data_recebimento: "",
          requisitante_id: "",
          objeto: "",
          prioridade: "Média",
          categoria: "",
          regional: "",
          valor_estimado: "",
        });
        await loadProcessos();
      } catch (error) {
        toast.error("Erro ao cadastrar demanda", {
          description: error instanceof Error ? error.message : "Não foi possível cadastrar a demanda.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleSalvarPrioridade = async () => {
      if (!reqParaPrioridade || !novaPrioridade || isSubmitting) return;

      setIsSubmitting(true);
      try {
        await updatePrioridade(reqParaPrioridade.processo_id, novaPrioridade);
        toast.success("Prioridade alterada com sucesso!");
        setIsPriorityModalOpen(false);
        setReqParaPrioridade(null);
        setNovaPrioridade("");
        await loadProcessos();
      } catch (error) {
        toast.error("Erro ao alterar prioridade", {
          description: error instanceof Error ? error.message : "Não foi possível alterar a prioridade.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const resetNovoProcessoForm = () => {
      setFormDataNovoProcesso({
        id: "",
        numeroRequisicao: "",
        requisitante_id: "",
        modalidade: "Dispensa",
        status: "Análise de RC",
        objeto: "",
      });
      setBloquearEnvioAutomatico(false);
      setClassificacaoPedido("");
    };

    const resetConsolidadoForm = () => {
      setFormDataConsolidado({
        numeroProcesso: "",
        valor: "",
        empresaVencedora: "",
        requisitante_id: "",
        modalidade: "Dispensa",
        status: "Ativo",
        dataFimVigencia: "",
        objeto: "",
        cnpj: "",
        instrumento: "Contrato",
      });
    };

    const resetAditivoForm = () => {
      setFormDataAditivo({
        numero: "",
        data: "",
        tipo: "",
        valor: "",
        justificativa: "",
        arquivo: null,
      });
    };

    const resetProrrogacaoForm = () => {
      setFormDataProrrogacao({
        numero: "",
        data: "",
        novaVigencia: "",
        justificativa: "",
        arquivo: null,
      });
    };

    const handleCadastrarNovoProcesso = async () => {
      if (!currentUser?.id || isSubmitting) return;

      setIsSubmitting(true);

      try {
        await createProcessoManual({
          numero_processo: formDataNovoProcesso.id,
          descricao: formDataNovoProcesso.objeto,
          numero_requisicao: formDataNovoProcesso.id || null,
          objeto: formDataNovoProcesso.objeto,
          modalidade: formDataNovoProcesso.modalidade,
          status: formDataNovoProcesso.status,
          responsavel_id: currentUser.id,
          requisitante_id: formDataNovoProcesso.requisitante_id || null,
          bloquear_envio_automatico: bloquearEnvioAutomatico,
          observacoes_internas: [
            formDataNovoProcesso.numeroRequisicao ? `ID Requisição: ${formDataNovoProcesso.numeroRequisicao}` : "",
            bloquearEnvioAutomatico && classificacaoPedido ? `Classificação do Pedido: ${classificacaoPedido}` : "",
          ].filter(Boolean).join(" | ") || null,
        });

        toast.success("Processo cadastrado com sucesso!");
        setIsNewProcessModalOpen(false);
        resetNovoProcessoForm();
        await loadProcessos();
      } catch (error) {
        toast.error("Erro ao cadastrar processo", {
          description: error instanceof Error ? error.message : "Não foi possível cadastrar o processo.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleCadastrarConsolidado = async () => {
      if (isSubmitting) return;

      setIsSubmitting(true);

      try {
        await createProcessoConsolidado({
          numero_requisicao: formDataConsolidado.numeroProcesso,
          valor: parseCurrencyInput(formDataConsolidado.valor),
          empresa_vencedora: formDataConsolidado.empresaVencedora,
          requisitante_id: formDataConsolidado.requisitante_id || null,
          data_fim: formDataConsolidado.dataFimVigencia || null,
          modalidade: formDataConsolidado.modalidade,
          status: formDataConsolidado.status,
          objeto: formDataConsolidado.objeto,
          observacoes_internas: buildInstrumentoObservacoes(
            formDataConsolidado.cnpj,
            formDataConsolidado.instrumento,
            formDataConsolidado.objeto,
          ),
          cnpj: formDataConsolidado.cnpj,
          tipoInstrumento: formDataConsolidado.instrumento as "Contrato" | "TRP",
        });

        toast.success("Processo consolidado cadastrado com sucesso!");
        setIsNewConsolidadoModalOpen(false);
        resetConsolidadoForm();
        await loadProcessos();
      } catch (error) {
        toast.error("Erro ao cadastrar consolidado", {
          description: error instanceof Error ? error.message : "Não foi possível cadastrar o processo consolidado.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleRegistrarAditivo = async () => {
      if (!selectedConsolidado || !currentUser?.id || isSubmitting) return;

      setIsSubmitting(true);

      try {
        if (formDataAditivo.arquivo) {
          await uploadAnexo(selectedConsolidado.id, formDataAditivo.arquivo, currentUser.id);
        }

        await registrarAditivo(selectedConsolidado.id, {
          ...formDataAditivo,
          valor: parseCurrencyInput(formDataAditivo.valor),
        });
        toast.success("Aditivo registrado com sucesso!");
        setIsAditivoModalOpen(false);
        setSelectedConsolidado(null);
        resetAditivoForm();
        await loadProcessos();
      } catch (error) {
        toast.error("Erro ao registrar aditivo", {
          description: error instanceof Error ? error.message : "Não foi possível registrar o aditivo.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleRegistrarProrrogacao = async () => {
      if (!selectedConsolidado || !currentUser?.id || isSubmitting) return;

      setIsSubmitting(true);

      try {
        if (formDataProrrogacao.arquivo) {
          await uploadAnexo(selectedConsolidado.id, formDataProrrogacao.arquivo, currentUser.id);
        }

        await registrarProrrogacao(
          selectedConsolidado.id,
          formDataProrrogacao.novaVigencia,
          [
            formDataProrrogacao.numero ? `Prorrogação ${formDataProrrogacao.numero}` : "",
            formDataProrrogacao.data ? `Data: ${formDataProrrogacao.data}` : "",
            formDataProrrogacao.justificativa,
          ].filter(Boolean).join(" | "),
        );
        toast.success("Prorrogação registrada com sucesso!");
        setIsProrrogacaoModalOpen(false);
        setSelectedConsolidado(null);
        resetProrrogacaoForm();
        await loadProcessos();
      } catch (error) {
        toast.error("Erro ao registrar prorrogação", {
          description: error instanceof Error ? error.message : "Não foi possível registrar a prorrogação.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleSalvarEdicaoProcesso = async () => {
      if (!selectedProcess || isSubmitting) return;

      setIsSubmitting(true);

      try {
        await updateProcessoDetails(selectedProcess.id, {
          modalidade: formDataEdit.modalidade,
          status: formDataEdit.status,
          objeto: formDataEdit.objeto,
          descricao: formDataEdit.objeto,
          observacoes_internas: formDataEdit.observacoes || null,
          data_finalizacao: formDataEdit.dataFinalizacao || null,
        });

        toast.success("Processo atualizado com sucesso!");
        setIsEditProcessModalOpen(false);
        setSelectedProcess(null);
        await loadProcessos();
      } catch (error) {
        toast.error("Erro ao atualizar processo", {
          description: error instanceof Error ? error.message : "Não foi possível atualizar o processo.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleSalvarEdicaoConsolidado = async () => {
      if (!selectedConsolidado || isSubmitting) return;

      setIsSubmitting(true);

      try {
        await updateProcessoConsolidado(selectedConsolidado.id, {
          valor: parseCurrencyInput(formDataEditConsolidado.valor),
          empresa_vencedora: formDataEditConsolidado.empresaVencedora,
          status: formDataEditConsolidado.statusContrato,
          data_fim: formDataEditConsolidado.dataFimVigencia || null,
          objeto: formDataEditConsolidado.objeto,
          descricao: formDataEditConsolidado.objeto,
          cnpj: formDataEditConsolidado.cnpj,
          tipoInstrumento: formDataEditConsolidado.instrumento,
          observacoes_internas: buildInstrumentoObservacoes(
            formDataEditConsolidado.cnpj,
            formDataEditConsolidado.instrumento,
            selectedConsolidado.observacoes_internas,
          ),
        });

        toast.success("Processo consolidado atualizado com sucesso!");
        setIsEditConsolidadoModalOpen(false);
        setSelectedConsolidado(null);
        await loadProcessos();
      } catch (error) {
        toast.error("Erro ao atualizar consolidado", {
          description: error instanceof Error ? error.message : "Não foi possível atualizar o processo consolidado.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleGerarContrato = async () => {
      if (!selectedConsolidado || !currentUser?.id || isGeneratingContract) return;

      if (!selectedConsolidadoElegivel) {
        toast.error("Somente processos finalizados ou homologados podem gerar contrato.");
        return;
      }

      if (selectedConsolidadoJaGerouContrato) {
        toast.info("Este processo ja possui um contrato vinculado.");
        return;
      }

      setIsGeneratingContract(true);

      try {
        const numeroContrato = selectedConsolidado.numero_requisicao || selectedConsolidado.numeroProcesso || selectedConsolidado.id;
        const dataFim = selectedConsolidado.data_fim || null;
        const valorAnual = parseCurrencyInput(selectedConsolidado.valor || "") || 0;

        await createContrato({
          processo_id: selectedConsolidado.id,
          fornecedor_id: selectedConsolidado.fornecedor_id || null,
          numero_contrato: numeroContrato,
          objeto: selectedConsolidado.objeto || "-",
          valor_anual: valorAnual,
          data_inicio: selectedConsolidado.data_finalizacao || selectedConsolidado.data_recebimento || null,
          data_fim_original: dataFim,
          data_fim_atual: dataFim,
          status: selectedConsolidado.statusContrato === "Em Renovação" ? "Próximo ao Vencimento" : selectedConsolidado.statusContrato,
          responsavel_id: currentUser.id,
          quantidade_aditivos: 0,
        });

        await updateProcessoStatus(
          selectedConsolidado.id,
          "Ativo",
          currentUser.id,
          `Contrato ${numeroContrato} gerado para a fase de gestão.`
        );

        toast.success("Contrato gerado com sucesso!");
        await loadProcessos();
      } catch (error) {
        toast.error("Erro ao gerar contrato", {
          description: error instanceof Error ? error.message : "Nao foi possivel consolidar o contrato.",
        });
      } finally {
        setIsGeneratingContract(false);
      }
    };

    const handleStatusConsolidadoChange = (
      numeroProcesso: string,
      novoStatus: StatusContratoComprador,
    ) => {
      setProcessosRaw((prev) =>
        prev.map((processo) =>
          (processo.numero_requisicao || processo.id) === numeroProcesso
            ? {
                ...processo,
                status: (novoStatus === "Em Renovação" ? "Próximo ao Vencimento" : novoStatus) as ProcessoComDetalhes["status"],
              }
            : processo,
        ),
      );

      toast.success("Ação simulada", {
        description: `Status alterado para ${novoStatus}.`,
      });
    };

    const handleVerDetalhes = (tipo: "diario" | "consolidado", item: any) => {
      setProcessoTipo(tipo);
      setSelectedProcess(null);
      setSelectedConsolidado(null);
      setSelectedTRP(null);
      setSelectedContrato(null);

      if (tipo === "diario") {
        setSelectedProcess(item);
      } else {
        setSelectedConsolidado(item);
      }
    };

    const handleEditar = (processo?: Processo) => {
      if (processo) setSelectedProcess(processo);
      setIsEditProcessModalOpen(true);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl text-black">Processos</h2>
            <p className="text-gray-600 mt-1">Gerenciamento operacional dos processos de compras</p>
          </div>
          {perfil === "admin" && (
            <div className="shrink-0">
              {activeTab === "requisicoes" && (
                <Button className="bg-[#003366] hover:bg-[#002244] text-white" onClick={() => setIsNovaDemandaModalOpen(true)}>
                  <Plus size={16} className="mr-2" />
                  Nova Demanda
                </Button>
              )}
              {activeTab === "diario" && (
                <Button className="bg-[#003366] hover:bg-[#002244] text-white" onClick={() => setIsNewProcessModalOpen(true)}>
                  <Plus size={16} className="mr-2" />
                  Cadastrar Processo
                </Button>
              )}
              {activeTab === "consolidado" && (
                <Button className="bg-[#003366] hover:bg-[#002244] text-white" onClick={() => setIsNewConsolidadoModalOpen(true)}>
                  <Plus size={16} className="mr-2" />
                  Novo Processo Consolidado
                </Button>
              )}
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${perfil === "admin" ? "max-w-4xl grid-cols-3" : "max-w-3xl grid-cols-3"}`}>
            {perfil === "admin" ? (
              <>
                <TabsTrigger value="requisicoes">Requisições Pendentes ({requisicoesCounts.total})</TabsTrigger>
                <TabsTrigger value="diario">Processos em Andamento</TabsTrigger>
                <TabsTrigger value="consolidado">Processos Consolidados</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="atribuidas">Requisições Atribuídas</TabsTrigger>
                <TabsTrigger value="diario">Processos em Andamento</TabsTrigger>
                <TabsTrigger value="consolidado">Processos Consolidados</TabsTrigger>
              </>
            )}
          </TabsList>

          {perfil === "admin" && (
            <TabsContent value="requisicoes" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-gray-200">
                  <CardContent className="flex flex-col items-center justify-center h-full py-6">
                    <div className="flex flex-col gap-1 items-center justify-center text-center">
                      <p className="text-2xl leading-8 text-black">{requisicoesCounts.total}</p>
                      <p className="text-xs leading-4 text-[#4a5565]">Total</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200">
                  <CardContent className="flex flex-col items-center justify-center h-full py-6">
                    <div className="flex flex-col gap-1 items-center justify-center text-center">
                      <p className="text-2xl leading-8 text-[#e7000b]">{requisicoesCounts.alta}</p>
                      <p className="text-xs leading-4 text-[#4a5565]">Prioridade Alta</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200">
                  <CardContent className="flex flex-col items-center justify-center h-full py-6">
                    <div className="flex flex-col gap-1 items-center justify-center text-center">
                      <p className="text-2xl leading-8 text-[#f97316]">{requisicoesCounts.media}</p>
                      <p className="text-xs leading-4 text-[#4a5565]">Prioridade Média</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200">
                  <CardContent className="flex flex-col items-center justify-center h-full py-6">
                    <div className="flex flex-col gap-1 items-center justify-center text-center">
                      <p className="text-2xl leading-8 text-[#155dfc]">{requisicoesCounts.baixa}</p>
                      <p className="text-xs leading-4 text-[#4a5565]">Prioridade Baixa</p>
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
                          placeholder="Buscar por ID, requisitante ou objeto..."
                          value={searchTermRequisicoes}
                          onChange={(e) => setSearchTermRequisicoes(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-48">
                      <Select value={prioridadeFilterRequisicoes} onValueChange={setPrioridadeFilterRequisicoes}>
                        <SelectTrigger>
                          <SelectValue placeholder="Prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas as Prioridades</SelectItem>
                          <SelectItem value="Alta">Alta</SelectItem>
                          <SelectItem value="Média">Média</SelectItem>
                          <SelectItem value="Baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader className="pt-3 pb-1">
                  <CardTitle className="text-xl text-black px-[0px] py-[8px]">Requisições Pendentes</CardTitle>
                </CardHeader>
                <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
                  <div className="w-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <SortableTableHead
                            label="ID Requisição"
                            onClick={() => sortReq("numero_requisicao")}
                            currentDirection={configReq.key === "numero_requisicao" ? configReq.direction : null}
                            className="sticky left-0 z-10 min-w-[140px] bg-white"
                          />
                          <SortableTableHead
                            label="Requisitante"
                            onClick={() => sortReq("requisitante_nome")}
                            currentDirection={configReq.key === "requisitante_nome" ? configReq.direction : null}
                            className="min-w-[200px]"
                          />
                          <SortableTableHead
                            label="Objeto"
                            onClick={() => sortReq("objeto")}
                            currentDirection={configReq.key === "objeto" ? configReq.direction : null}
                            className="min-w-[300px]"
                          />
                          <SortableTableHead
                            label="Responsável"
                            onClick={() => sortReq("responsavel_nome")}
                            currentDirection={configReq.key === "responsavel_nome" ? configReq.direction : null}
                            className="min-w-[160px]"
                          />
                          <SortableTableHead
                            label="Prioridade"
                            onClick={() => sortReq("prioridade")}
                            currentDirection={configReq.key === "prioridade" ? configReq.direction : null}
                            className="min-w-[140px]"
                          />
                          <SortableTableHead
                            label="Data Recebimento"
                            onClick={() => sortReq("data_recebimento")}
                            currentDirection={configReq.key === "data_recebimento" ? configReq.direction : null}
                            className="min-w-[140px]"
                          />
                          <SortableTableHead
                            label="Data Finalização"
                            onClick={() => sortReq("data_finalizacao")}
                            currentDirection={configReq.key === "data_finalizacao" ? configReq.direction : null}
                            className="min-w-[140px]"
                          />
                          <TableHead className="min-w-[220px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedRequisicoes.length > 0 ? (
                          sortedRequisicoes.map((requisicao) => (
                            <TableRow key={requisicao.id}>
                              <TableCell className="text-black sticky left-0 z-10 bg-white">{requisicao.id}</TableCell>
                              <TableCell className="text-gray-600">{requisicao.requisitante}</TableCell>
                              <TableCell className="text-gray-600">{requisicao.objeto}</TableCell>
                              <TableCell className="text-gray-600">{requisicao.responsavel}</TableCell>
                              <TableCell>
                                <BadgeNew {...getBadgeMappingForPrioridade(requisicao.prioridade)}>
                                  {requisicao.prioridade}
                                </BadgeNew>
                              </TableCell>
                              <TableCell className="text-gray-600">{requisicao.dataRecebimento}</TableCell>
                              <TableCell className="text-gray-600">{requisicao.dataFinalizacao}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                   <Button
                                     size="sm"
                                     className="bg-[#003366] hover:bg-[#002244] text-white"
                                     onClick={() => {
                                       setRequisicaoParaConfigurar(requisicao);
                                       setConfigModalidade("Dispensa");
                                       setConfigStatusInicial(statusAndamentoPadrao[1]);
                                       setIsConfigurarModalOpen(true);
                                     }}
                                   >
                                    <FileText size={16} className="mr-2" />
                                    Criar Processo
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical size={16} className="text-gray-600" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => setRequisicaoParaDetalhes(requisicao)}>
                                        <Eye size={16} className="mr-2" />
                                        Ver Detalhes
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setReqParaPrioridade(requisicao);
                                          setNovaPrioridade(requisicao.prioridade);
                                          setIsPriorityModalOpen(true);
                                        }}
                                      >
                                        Alterar Prioridade
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedRequisicao(requisicao);
                                          setCompradorSelecionado("");
                                          setDataInicioDistribuicao(getTodayInputDate());
                                          setIsAtribuirModalOpen(true);
                                        }}
                                      >
                                        Atribuir Comprador
                                      </DropdownMenuItem>
                                      {perfil === "admin" && (
                                        <DropdownMenuItem
                                          className="text-red-600"
                                          onClick={() => {
                                            setProcessoToDelete(requisicao);
                                            setIsDeleteDialogOpen(true);
                                          }}
                                        >
                                          <Trash2 size={16} className="mr-2" />
                                          Excluir
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                              Nenhuma requisição pendente encontrada com os filtros aplicados.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="diario" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center h-full py-6">
                  <div className="flex flex-col gap-1 items-center justify-center text-center">
                    <p className="text-2xl leading-8 text-black">{statusCountsDiario.total}</p>
                    <p className="text-xs leading-4 text-[#4a5565]">Total</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center h-full py-6">
                  <div className="flex flex-col gap-1 items-center justify-center text-center">
                    <p className="text-2xl leading-8 text-[#155dfc]">{statusCountsDiario.analise}</p>
                    <p className="text-xs leading-4 text-[#4a5565]">Em Análise</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center h-full py-6">
                  <div className="flex flex-col gap-1 items-center justify-center text-center">
                    <p className="text-2xl leading-8 text-[#10b981]">{statusCountsDiario.cotacao}</p>
                    <p className="text-xs leading-4 text-[#4a5565]">Em Cotação</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center h-full py-6">
                  <div className="flex flex-col gap-1 items-center justify-center text-center">
                    <p className="text-2xl leading-8 text-[#f97316]">{statusCountsDiario.devolvida}</p>
                    <p className="text-xs leading-4 text-[#4a5565]">Devolvidos</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center h-full py-6">
                  <div className="flex flex-col gap-1 items-center justify-center text-center">
                    <p className="text-2xl leading-8 text-[#9810fa]">{statusCountsDiario.tramitando}</p>
                    <p className="text-xs leading-4 text-[#4a5565]">Tramitando</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-gray-200">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-end">
                  <div className="inline-flex rounded-lg border border-gray-200 p-1">
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className={viewMode === "table" ? "bg-[#003366] hover:bg-[#002244] text-white" : ""}
                    >
                      <List size={16} className="mr-2" />
                      Tabela
                    </Button>
                    <Button
                      variant={viewMode === "kanban" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("kanban")}
                      className={viewMode === "kanban" ? "bg-[#003366] hover:bg-[#002244] text-white" : ""}
                    >
                      <LayoutGrid size={16} className="mr-2" />
                      Kanban
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="relative md:col-span-2">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Buscar por ID, requisição, requisitante ou objeto..."
                        value={searchTermDiario}
                        onChange={(e) => setSearchTermDiario(e.target.value)}
                        className="pl-9"
                      />
                    </div>

                    <Select value={tipoFilterDiario} onValueChange={setTipoFilterDiario}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Tipos</SelectItem>
                        <SelectItem value="Dispensa">Dispensa</SelectItem>
                        <SelectItem value="Inexigibilidade">Inexigibilidade</SelectItem>
                        <SelectItem value="Licitacao (Pesquisa de Preco)">Licitacao (Pesquisa de Preco)</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilterDiario} onValueChange={setStatusFilterDiario}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Status</SelectItem>
                        {statusAndamentoPadrao.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {perfil === "comprador" && (
                    <div className="flex items-center space-x-2">
                      <Switch id="filter-meus" checked={mostrarApenasMeus} onCheckedChange={setMostrarApenasMeus} />
                      <Label
                        htmlFor="filter-meus"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Mostrar apenas meus processos
                      </Label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {viewMode === "table" ? (
              <Card className="border border-gray-200">
                <CardHeader className="pt-3 pb-1">
                  <CardTitle className="text-xl text-black px-[0px] py-[8px]">Lista de Processos</CardTitle>
                </CardHeader>
                <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
                  <div className="w-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <SortableTableHead
                            label="ID Requisição"
                            onClick={() => requestSortDiario("id")}
                            currentDirection={sortConfigDiario.key === "id" ? sortConfigDiario.direction : null}
                            className="sticky left-0 z-10 min-w-[170px] bg-white"
                            />
                          <SortableTableHead
                            label="Objeto"
                            onClick={() => requestSortDiario("objeto")}
                            currentDirection={sortConfigDiario.key === "objeto" ? sortConfigDiario.direction : null}
                            className="min-w-[320px]"
                          />
                          <SortableTableHead
                            label="Requisitante"
                            onClick={() => requestSortDiario("requisitante")}
                            currentDirection={
                              sortConfigDiario.key === "requisitante" ? sortConfigDiario.direction : null
                            }
                            className="min-w-[220px]"
                          />
                          <TableHead className="min-w-[190px]">Tipo/Modalidade</TableHead>
                          <SortableTableHead
                            label="Status"
                            onClick={() => requestSortDiario("status")}
                            currentDirection={sortConfigDiario.key === "status" ? sortConfigDiario.direction : null}
                            className="min-w-[260px]"
                          />
                          <TableHead className="min-w-[150px]">Data Recebimento</TableHead>
                          <TableHead className="min-w-[150px]">Data Finalização</TableHead>
                          <TableHead className="min-w-[120px] text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {paginatedProcessosDiarios.map((processo) => {
                          const canEditProcesso = perfil === "admin" || processo.responsavel === nomeUsuarioLogado;

                          return (
                            <TableRow key={processo.id}>
                              <TableCell className="text-black sticky left-0 z-10 bg-white">
                                {processo.numeroRequisicao ?? "-"}
                              </TableCell>
                              <TableCell className="text-gray-600">{processo.objeto ?? processo.descricao}</TableCell>
                              <TableCell className="text-gray-600">{processo.requisitante ?? "-"}</TableCell>
                              <TableCell className="text-gray-600"><ModalidadeBadge modalidade={processo.modalidade} /></TableCell>
                              <TableCell>
                                {canEditProcesso ? (
                                  <Select
                                    value={processo.status}
                                    onValueChange={(novoStatus) => handleIniciarMudancaStatus(processo, novoStatus)}
                                  >
                                    <SelectTrigger className="w-[280px] h-8 overflow-hidden">
                                      <SelectValue className="block max-w-[240px] truncate" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getStatusOptionsForProcesso(processo.status).map((status) => (
                                        <SelectItem key={status} value={status}>
                                          {status}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <BadgeStatus {...getBadgeMappingForStatus(processo.status)}>{processo.status}</BadgeStatus>
                                )}
                              </TableCell>
                              <TableCell className="text-gray-600">{processo.dataRecebimento ?? "-"}</TableCell>
                              <TableCell className="text-gray-600"><DataFinalizacaoFallback value={processo.dataFinalizacao} /></TableCell>
                              <TableCell>
                                <div className="flex justify-center">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical size={16} className="text-gray-600" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          handleVerDetalhes("diario", processo);
                                        }}
                                      >
                                        Ver Detalhes
                                      </DropdownMenuItem>
                                      {canEditProcesso && (
                                        <DropdownMenuItem onClick={() => handleEditar(processo)}>Editar</DropdownMenuItem>
                                      )}
                                      {canEditProcesso && perfil === "admin" && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => {
                                              setProcessoToDelete(processo);
                                              setIsDeleteDialogOpen(true);
                                            }}
                                          >
                                            <Trash2 size={16} className="mr-2" />
                                            Excluir
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                    <p className="text-sm text-gray-600 md:min-w-[280px]">
                      Exibindo de {displayStartDiario} a {displayEndDiario} de {totalItemsDiario} processos
                    </p>

                    <div className="flex-1 flex justify-center">
                      <Pagination className="w-auto">
                        <PaginationContent className="gap-2">
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              size="default"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) setCurrentPage((prev) => prev - 1);
                              }}
                              className={`h-8 w-auto min-w-fit px-3 py-1 whitespace-nowrap rounded-md ${
                                currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                              }`}
                            >
                              Anterior
                            </PaginationLink>
                          </PaginationItem>

                          {paginationPagesDiario.map((page, index) => (
                            <PaginationItem key={`${page}-${index}`}>
                              {typeof page === "number" ? (
                                <PaginationLink
                                  href="#"
                                  size="icon"
                                  isActive={page === currentPage}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(page);
                                  }}
                                  className="h-8 w-8 min-w-8 p-0 flex items-center justify-center rounded-md cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              ) : (
                                <PaginationEllipsis />
                              )}
                            </PaginationItem>
                          ))}

                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              size="default"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPagesDiario) setCurrentPage((prev) => prev + 1);
                              }}
                              className={`h-8 w-auto min-w-fit px-3 py-1 whitespace-nowrap rounded-md ${
                                currentPage === totalPagesDiario ? "pointer-events-none opacity-50" : "cursor-pointer"
                              }`}
                            >
                              Próxima
                            </PaginationLink>
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>

                    <div className="hidden md:block md:min-w-[280px]" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {statusKanban.map((status) => {
                  const processosPorStatus = filteredProcessosDiarios.filter((p) => p.status === status);
                  const config = kanbanColumnConfig[status];

                  return (
                    <div
                      key={status}
                      className="flex-1 min-w-[280px]"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const processoData = e.dataTransfer.getData("processo");
                        if (!processoData) return;

                        try {
                          const draggedProcesso = JSON.parse(processoData) as Processo;
                          const canEditDraggedProcesso =
                            perfil === "admin" || draggedProcesso.responsavel === nomeUsuarioLogado;
                          if (canEditDraggedProcesso && draggedProcesso.status !== status) {
                            handleIniciarMudancaStatus(draggedProcesso, status);
                          }
                        } catch {
                          toast.error("Falha ao mover card");
                        }
                      }}
                    >
                      <Card className={`border-2 ${config.borderColor} h-full ${config.bgColor}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className={`text-base ${config.color}`}>{config.displayName}</CardTitle>
                            <span className={`text-sm ${config.color} bg-white px-2 py-1 rounded border ${config.borderColor}`}>
                              {processosPorStatus.length}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 min-h-[400px] max-h-[calc(100vh-400px)] overflow-y-auto">
                          {processosPorStatus.length === 0 ? (
                            <p className="text-gray-400 text-center text-sm py-8">Nenhum processo neste status</p>
                          ) : (
                            processosPorStatus.map((processo) => {
                              const canEditProcesso = perfil === "admin" || processo.responsavel === nomeUsuarioLogado;

                              return (
                                <div
                                  key={processo.id}
                                  className={canEditProcesso ? "cursor-grab active:cursor-grabbing" : ""}
                                  onDragStart={(e) => {
                                    if (!canEditProcesso) return;
                                    e.dataTransfer.setData("processo", JSON.stringify(processo));
                                    e.currentTarget.style.opacity = "0.5";
                                  }}
                                  onDragEnd={(e) => {
                                    if (!canEditProcesso) return;
                                    e.currentTarget.style.opacity = "1";
                                  }}
                                  draggable={canEditProcesso}
                                >
                                  <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                      <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                          <p className="font-medium text-black flex-1">{processo.requisitante ?? "-"}</p>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                <MoreVertical size={14} className="text-gray-600" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem
                                                onClick={() => {
                                                  handleVerDetalhes("diario", processo);
                                                }}
                                              >
                                                Ver Detalhes
                                              </DropdownMenuItem>
                                              {canEditProcesso && (
                                                <DropdownMenuItem onClick={() => handleEditar(processo)}>Editar</DropdownMenuItem>
                                              )}
                                              {canEditProcesso && perfil === "admin" && (
                                                <>
                                                  <DropdownMenuSeparator />
                                                  <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => {
                                                      setProcessoToDelete(processo);
                                                      setIsDeleteDialogOpen(true);
                                                    }}
                                                  >
                                                    <Trash2 size={16} className="mr-2" />
                                                    Excluir
                                                  </DropdownMenuItem>
                                                </>
                                              )}
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                          <div>
                                            <span className="text-gray-500">ID: </span>
                                            <span className="text-gray-700">{processo.id}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Requisição: </span>
                                            <span className="text-gray-700">{processo.numeroRequisicao ?? "-"}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Tipo: </span>
                                            <span className="text-gray-700">{processo.modalidade}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Responsável: </span>
                                            <span className="text-gray-700">{processo.responsavel}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              );
                            })
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {perfil === "admin" && (
            <TabsContent value="consolidado" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-gray-200">
                  <CardContent className="flex flex-col items-center justify-center h-full py-6">
                    <div className="flex flex-col gap-1 items-center justify-center text-center">
                      <p className="text-2xl leading-8 text-black">{statusCountsConsolidado.todos}</p>
                      <p className="text-xs leading-4 text-[#4a5565]">Total</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200">
                  <CardContent className="flex flex-col items-center justify-center h-full py-6">
                    <div className="flex flex-col gap-1 items-center justify-center text-center">
                      <p className="text-2xl leading-8 text-[#22c55e]">{statusCountsConsolidado.ativo}</p>
                      <p className="text-xs leading-4 text-[#4a5565]">Ativos</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200">
                  <CardContent className="flex flex-col items-center justify-center h-full py-6">
                    <div className="flex flex-col gap-1 items-center justify-center text-center">
                      <p className="text-2xl leading-8 text-[#f59e0b]">{statusCountsConsolidado.proximoVencimento}</p>
                      <p className="text-xs leading-4 text-[#4a5565]">Próx. ao Vencimento</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200">
                  <CardContent className="flex flex-col items-center justify-center h-full py-6">
                    <div className="flex flex-col gap-1 items-center justify-center text-center">
                      <p className="text-2xl leading-8 text-[#e7000b]">{statusCountsConsolidado.vencido}</p>
                      <p className="text-xs leading-4 text-[#4a5565]">Vencidos</p>
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
                          placeholder="Buscar por número, requisitante ou empresa..."
                          value={searchTermConsolidado}
                          onChange={(e) => setSearchTermConsolidado(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-56">
                      <Select value={statusFilterConsolidado} onValueChange={setStatusFilterConsolidado}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status do Contrato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os Status</SelectItem>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Próximo ao Vencimento">Próximo ao Vencimento</SelectItem>
                          <SelectItem value="Vencido">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="diretas" className="w-full">
                <TabsList className="grid w-full max-w-4xl grid-cols-4 mb-4 h-9 p-1 bg-muted rounded-md">
                  <TabsTrigger value="diretas">Contratações Diretas ({filteredDiretas.length})</TabsTrigger>
                  <TabsTrigger value="licitacoes">Licitações Homologadas ({filteredLicitacoes.length})</TabsTrigger>
                  <TabsTrigger value="trp">Lista de TRPs ({filteredTRP.length})</TabsTrigger>
                  <TabsTrigger value="contratos">Lista de Contratos ({filteredContratos.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="diretas" className="mt-0 space-y-4">
                  <Card className="border border-gray-200">
                    <CardHeader className="pt-3 pb-1">
                      <CardTitle className="text-xl text-black px-[0px] py-[8px]">Contratações Diretas</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
                      <div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <SortableTableHead label="ID Processo" onClick={() => sortDiretas("numeroProcesso")} currentDirection={configDiretas.key === "numeroProcesso" ? configDiretas.direction : null} className="sticky left-0 z-10 min-w-[170px] bg-white" />
                              <SortableTableHead label="Requisitante" onClick={() => sortDiretas("requisitante")} currentDirection={configDiretas.key === "requisitante" ? configDiretas.direction : null} className="min-w-[220px]" />
                              <SortableTableHead label="Objeto" onClick={() => sortDiretas("objeto")} currentDirection={configDiretas.key === "objeto" ? configDiretas.direction : null} className="min-w-[320px]" />
                              <SortableTableHead label="Tipo/Modalidade" onClick={() => sortDiretas("tipo")} currentDirection={configDiretas.key === "tipo" ? configDiretas.direction : null} className="min-w-[200px]" />
                              <SortableTableHead label="Status" onClick={() => sortDiretas("status")} currentDirection={configDiretas.key === "status" ? configDiretas.direction : null} className="min-w-[140px]" />
                              <SortableTableHead label="Responsável" onClick={() => sortDiretas("responsavel")} currentDirection={configDiretas.key === "responsavel" ? configDiretas.direction : null} className="min-w-[160px]" />
                              <TableHead className="min-w-[140px]">Data Recebimento</TableHead>
                              <TableHead className="min-w-[140px]">Data Finalização</TableHead>
                              <SortableTableHead label="Empresa Vencedora" onClick={() => sortDiretas("empresaVencedora")} currentDirection={configDiretas.key === "empresaVencedora" ? configDiretas.direction : null} className="min-w-[220px]" />
                              <TableHead className="min-w-[140px]">Data da Entrega</TableHead>
                              <SortableTableHead label="Valor" onClick={() => sortDiretas("valor")} currentDirection={configDiretas.key === "valor" ? configDiretas.direction : null} className="min-w-[140px]" />
                              <TableHead className="min-w-[140px]">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedDiretas.map((processo) => (
                              <TableRow key={processo.numeroProcesso}>
                                <TableCell className="text-black sticky left-0 z-10 bg-white">
                                  <div>{processo.numeroProcesso}</div>
                                  <span className="text-[10px] text-gray-500 font-medium px-1.5 py-0.5 bg-gray-100 rounded">
                                    {processo.tipoInstrumento === "TRP" ? "TRP" : "Contrato"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-gray-600">{processo.requisitante}</TableCell>
                                <TableCell className="text-gray-600">{processo.objeto}</TableCell>
                                <TableCell className="text-gray-600">{processo.tipo}</TableCell>
                                <TableCell><BadgeStatus {...getBadgeMappingForStatus(processo.status)}>{processo.status}</BadgeStatus></TableCell>
                                <TableCell className="text-gray-600">{processo.responsavel}</TableCell>
                                <TableCell className="text-gray-600">{processo.dataRecebimento}</TableCell>
                                <TableCell className="text-gray-600">{processo.dataFinalizacao}</TableCell>
                                <TableCell className="text-black">{processo.empresaVencedora ?? "-"}</TableCell>
                                <TableCell className="text-gray-600">{processo.dataEntrega ?? "-"}</TableCell>
                                <TableCell className="text-black">{processo.valor}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleVerDetalhes("consolidado", processo)}><Eye size={16} className="text-gray-600" /></Button>
                                    {(perfil === "admin" || processo.responsavel === nomeUsuarioLogado) && (
                                      <>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedConsolidado(processo); setIsEditConsolidadoModalOpen(true); }}><Edit size={16} className="text-gray-600" /></Button>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical size={16} className="text-gray-600" /></Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => { setSelectedConsolidado(processo); setIsAditivoModalOpen(true); }}><FileText size={16} className="mr-2" />Registrar Aditivo</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { setSelectedConsolidado(processo); setIsProrrogacaoModalOpen(true); }}><Calendar size={16} className="mr-2" />Prorrogar Contrato</DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </>
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
                </TabsContent>

                <TabsContent value="licitacoes" className="mt-0 space-y-4">
                  <Card className="border border-gray-200">
                    <CardHeader className="pt-3 pb-1">
                      <CardTitle className="text-xl text-black px-[0px] py-[8px]">Licitações Homologadas</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
                      <div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <SortableTableHead label="ID Processo" onClick={() => sortLicitacoes("numeroProcesso")} currentDirection={configLicitacoes.key === "numeroProcesso" ? configLicitacoes.direction : null} className="sticky left-0 z-10 min-w-[170px] bg-white" />
                              <SortableTableHead label="Requisitante" onClick={() => sortLicitacoes("requisitante")} currentDirection={configLicitacoes.key === "requisitante" ? configLicitacoes.direction : null} className="min-w-[220px]" />
                              <SortableTableHead label="Objeto" onClick={() => sortLicitacoes("objeto")} currentDirection={configLicitacoes.key === "objeto" ? configLicitacoes.direction : null} className="min-w-[320px]" />
                              <SortableTableHead label="Tipo/Modalidade" onClick={() => sortLicitacoes("tipo")} currentDirection={configLicitacoes.key === "tipo" ? configLicitacoes.direction : null} className="min-w-[200px]" />
                              <SortableTableHead label="Status" onClick={() => sortLicitacoes("status")} currentDirection={configLicitacoes.key === "status" ? configLicitacoes.direction : null} className="min-w-[140px]" />
                              <SortableTableHead label="Responsável" onClick={() => sortLicitacoes("responsavel")} currentDirection={configLicitacoes.key === "responsavel" ? configLicitacoes.direction : null} className="min-w-[160px]" />
                              <TableHead className="min-w-[140px]">Data Recebimento</TableHead>
                              <TableHead className="min-w-[140px]">Data Finalização</TableHead>
                              <TableHead className="min-w-[150px]">Data Homologação</TableHead>
                              <TableHead className="min-w-[150px]">Tempo Total (Dias)</TableHead>
                              <SortableTableHead label="Valor" onClick={() => sortLicitacoes("valor")} currentDirection={configLicitacoes.key === "valor" ? configLicitacoes.direction : null} className="min-w-[140px]" />
                              <TableHead className="min-w-[140px]">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedLicitacoes.map((processo) => (
                              <TableRow key={processo.numeroProcesso}>
                                <TableCell className="text-black sticky left-0 z-10 bg-white">
                                  <div>{processo.numeroProcesso}</div>
                                  <span className="text-[10px] text-gray-500 font-medium px-1.5 py-0.5 bg-gray-100 rounded">
                                    {processo.tipoInstrumento === "TRP" ? "TRP" : "Contrato"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-gray-600">{processo.requisitante}</TableCell>
                                <TableCell className="text-gray-600">{processo.objeto}</TableCell>
                                <TableCell className="text-gray-600">{processo.tipo}</TableCell>
                                <TableCell><BadgeStatus {...getBadgeMappingForStatus(processo.status)}>{processo.status}</BadgeStatus></TableCell>
                                <TableCell className="text-gray-600">{processo.responsavel}</TableCell>
                                <TableCell className="text-gray-600">{processo.dataRecebimento}</TableCell>
                                <TableCell className="text-gray-600">{processo.dataFinalizacao}</TableCell>
                                <TableCell className="text-gray-600">{processo.dataHomologacao ?? "-"}</TableCell>
                                <TableCell className="text-gray-600">{processo.tempoTotalDias ?? "-"}</TableCell>
                                <TableCell className="text-black">{processo.valor}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleVerDetalhes("consolidado", processo)}><Eye size={16} className="text-gray-600" /></Button>
                                    {(perfil === "admin" || processo.responsavel === nomeUsuarioLogado) && (
                                      <>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedConsolidado(processo); setIsEditConsolidadoModalOpen(true); }}><Edit size={16} className="text-gray-600" /></Button>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical size={16} className="text-gray-600" /></Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => { setSelectedConsolidado(processo); setIsAditivoModalOpen(true); }}><FileText size={16} className="mr-2" />Registrar Aditivo</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { setSelectedConsolidado(processo); setIsProrrogacaoModalOpen(true); }}><Calendar size={16} className="mr-2" />Prorrogar Contrato</DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </>
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
                </TabsContent>

                <TabsContent value="trp" className="mt-0 space-y-4">
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                              placeholder="Buscar por empresa, CNPJ ou número..."
                              value={searchTermTRP}
                              onChange={(e) => setSearchTermTRP(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="w-full md:w-48">
                          <Select value={filterTRP} onValueChange={setFilterTRP}>
                            <SelectTrigger>
                              <SelectValue placeholder="Filtrar Aditivos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todos">Todos</SelectItem>
                              <SelectItem value="com-aditivos">Com Aditivos</SelectItem>
                              <SelectItem value="sem-aditivos">Sem Aditivos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader className="pt-3 pb-1">
                      <CardTitle className="text-xl text-black px-[0px] py-[8px]">Lista de TRPs</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
                      <div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <SortableTableHead label="Empresa Vencedora" onClick={() => sortTRP("empresaVencedora")} currentDirection={configTRP.key === "empresaVencedora" ? configTRP.direction : null} className="min-w-[220px]" />
                              <TableHead className="min-w-[180px]">CNPJ</TableHead>
                              <SortableTableHead label="Número do Processo" onClick={() => sortTRP("numeroProcesso")} currentDirection={configTRP.key === "numeroProcesso" ? configTRP.direction : null} className="min-w-[160px]" />
                              <SortableTableHead label="Valor Contratado" onClick={() => sortTRP("valorContratado")} currentDirection={configTRP.key === "valorContratado" ? configTRP.direction : null} className="min-w-[140px]" />
                              <TableHead className="min-w-[120px]">Vigência</TableHead>
                              <TableHead className="min-w-[100px]">Aditivos</TableHead>
                              <TableHead className="min-w-[100px]">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedTRP.map((trp) => (
                              <TableRow key={trp.numeroProcesso}>
                                <TableCell className="text-black">{trp.empresaVencedora}</TableCell>
                                <TableCell className="text-gray-600">{trp.cnpj}</TableCell>
                                <TableCell className="text-black">{trp.numeroProcesso}</TableCell>
                                <TableCell className="text-black">{trp.valorContratado}</TableCell>
                                <TableCell className="text-gray-600">{trp.vigencia}</TableCell>
                                <TableCell className="text-gray-600">{trp.aditivos}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleVerDetalhes("consolidado", trp)}><Eye size={16} className="text-gray-600" /></Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedTRP(trp); setIsEditTRPModalOpen(true); }}><Edit size={16} className="text-gray-600" /></Button>
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

                <TabsContent value="contratos" className="mt-0 space-y-4">
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                              placeholder="Buscar por empresa, CNPJ ou número..."
                              value={searchTermContratos}
                              onChange={(e) => setSearchTermContratos(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="w-full md:w-48">
                          <Select value={filterContratos} onValueChange={setFilterContratos}>
                            <SelectTrigger>
                              <SelectValue placeholder="Filtrar Aditivos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todos">Todos</SelectItem>
                              <SelectItem value="com-aditivos">Com Aditivos</SelectItem>
                              <SelectItem value="sem-aditivos">Sem Aditivos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader className="pt-3 pb-1">
                      <CardTitle className="text-xl text-black px-[0px] py-[8px]">Lista de Contratos</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
                      <div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <SortableTableHead label="Empresa Vencedora" onClick={() => sortContratos("empresaVencedora")} currentDirection={configContratos.key === "empresaVencedora" ? configContratos.direction : null} className="min-w-[220px]" />
                              <TableHead className="min-w-[180px]">CNPJ</TableHead>
                              <SortableTableHead label="Número do Processo" onClick={() => sortContratos("numeroProcesso")} currentDirection={configContratos.key === "numeroProcesso" ? configContratos.direction : null} className="min-w-[160px]" />
                              <SortableTableHead label="Valor Contratado" onClick={() => sortContratos("valorContratado")} currentDirection={configContratos.key === "valorContratado" ? configContratos.direction : null} className="min-w-[140px]" />
                              <TableHead className="min-w-[120px]">Vigência</TableHead>
                              <TableHead className="min-w-[100px]">Aditivos</TableHead>
                              <TableHead className="min-w-[100px]">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedContratos.map((contrato) => (
                              <TableRow key={contrato.numeroProcesso}>
                                <TableCell className="text-black">{contrato.empresaVencedora}</TableCell>
                                <TableCell className="text-gray-600">{contrato.cnpj}</TableCell>
                                <TableCell className="text-black">{contrato.numeroProcesso}</TableCell>
                                <TableCell className="text-black">{contrato.valorContratado}</TableCell>
                                <TableCell className="text-gray-600">{contrato.vigencia}</TableCell>
                                <TableCell className="text-gray-600">{contrato.aditivos}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleVerDetalhes("consolidado", contrato)}><Eye size={16} className="text-gray-600" /></Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedContrato(contrato); setIsEditContratoModalOpen(true); }}><Edit size={16} className="text-gray-600" /></Button>
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
            </TabsContent>
          )}

          {perfil === "comprador" && (
            <TabsContent value="atribuidas" className="space-y-6 mt-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Revise as requisições atribuídas e inicie o processo para configurar modalidade, responsável e fluxo.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-gray-200">
                  <CardContent className="flex flex-col items-center justify-center h-full py-6">
                    <div className="flex flex-col gap-1 items-center justify-center text-center">
                      <p className="text-2xl leading-8 text-black">{requisicoesAtribuidasCounts.total}</p>
                      <p className="text-xs leading-4 text-[#4a5565]">Total</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200">
                  <CardContent className="flex flex-col items-center justify-center h-full py-6">
                    <div className="flex flex-col gap-1 items-center justify-center text-center">
                      <p className="text-2xl leading-8 text-[#e7000b]">{requisicoesAtribuidasCounts.alta}</p>
                      <p className="text-xs leading-4 text-[#4a5565]">Prioridade Alta</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200">
                  <CardContent className="flex flex-col items-center justify-center h-full py-6">
                    <div className="flex flex-col gap-1 items-center justify-center text-center">
                      <p className="text-2xl leading-8 text-[#f97316]">{requisicoesAtribuidasCounts.media}</p>
                      <p className="text-xs leading-4 text-[#4a5565]">Prioridade Média</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200">
                  <CardContent className="flex flex-col items-center justify-center h-full py-6">
                    <div className="flex flex-col gap-1 items-center justify-center text-center">
                      <p className="text-2xl leading-8 text-[#155dfc]">{requisicoesAtribuidasCounts.baixa}</p>
                      <p className="text-xs leading-4 text-[#4a5565]">Prioridade Baixa</p>
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
                          placeholder="Buscar por ID, requisitante ou objeto..."
                          value={searchTermAtribuidas}
                          onChange={(e) => setSearchTermAtribuidas(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-48">
                      <Select value={prioridadeFilterAtribuidas} onValueChange={setPrioridadeFilterAtribuidas}>
                        <SelectTrigger>
                          <SelectValue placeholder="Prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas as Prioridades</SelectItem>
                          <SelectItem value="Alta">Alta</SelectItem>
                          <SelectItem value="Média">Média</SelectItem>
                          <SelectItem value="Baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader className="pt-3 pb-1">
                  <CardTitle className="text-xl text-black px-[0px] py-[8px]">Requisições Atribuídas a Você</CardTitle>
                </CardHeader>
                <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
                  <div className="w-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 z-10 min-w-[140px] bg-white">ID Requisição</TableHead>
                          <TableHead className="min-w-[200px]">Requisitante</TableHead>
                          <TableHead className="min-w-[300px]">Objeto</TableHead>
                          <TableHead className="min-w-[160px]">Responsável</TableHead>
                          <TableHead className="min-w-[140px]">Prioridade</TableHead>
                          <TableHead className="min-w-[190px]">Status</TableHead>
                          <TableHead className="min-w-[140px]">Data Finalização</TableHead>
                          <TableHead className="min-w-[200px] text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequisicoesAtribuidas.length > 0 ? (
                          filteredRequisicoesAtribuidas.map((requisicao) => (
                            <TableRow key={requisicao.id}>
                              <TableCell className="text-black sticky left-0 z-10 bg-white">
                                {requisicao.numeroRequisicao ?? requisicao.id}
                              </TableCell>
                              <TableCell className="text-gray-600">{requisicao.requisitante ?? "-"}</TableCell>
                              <TableCell className="text-gray-600">{requisicao.objeto ?? requisicao.descricao}</TableCell>
                              <TableCell className="text-gray-600">{requisicao.responsavel}</TableCell>
                              <TableCell>
                                <BadgeNew {...getBadgeMappingForPrioridade(requisicao.prioridade ?? "Baixa")}>
                                  {requisicao.prioridade ?? "Baixa"}
                                </BadgeNew>
                              </TableCell>
                              <TableCell>
                                <BadgeNew intent="warning" weight="heavy" size="md">
                                  Aguardando Configuração
                                </BadgeNew>
                              </TableCell>
                              <TableCell className="text-gray-600"><DataFinalizacaoFallback value={requisicao.dataFinalizacao} /></TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center">
                                  <Button
                                    size="sm"
                                    className="bg-[#003366] hover:bg-[#002244] text-white"
                                    onClick={() => {
                                      setRequisicaoParaConfigurar(requisicao);
                                      setIsConfigurarModalOpen(true);
                                    }}
                                  >
                                    <FileText size={16} className="mr-2" />
                                    Iniciar Processo
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                              Nenhuma requisição atribuída encontrada com os filtros aplicados.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {perfil === "comprador" && (
            <TabsContent value="consolidado" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-black">{statusCountsConsolidadoComprador.todos}</p><p className="text-xs leading-4 text-[#4a5565]">Total</p></div></CardContent></Card>
                <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-[#22c55e]">{statusCountsConsolidadoComprador.ativo}</p><p className="text-xs leading-4 text-[#4a5565]">Ativos</p></div></CardContent></Card>
                <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-[#155dfc]">{statusCountsConsolidadoComprador.emRenovacao}</p><p className="text-xs leading-4 text-[#4a5565]">Em Renovação</p></div></CardContent></Card>
                <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-[#e7000b]">{statusCountsConsolidadoComprador.vencido}</p><p className="text-xs leading-4 text-[#4a5565]">Vencidos</p></div></CardContent></Card>
              </div>

              <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex flex-col md:flex-row gap-4"><div className="flex-1"><div className="relative"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><Input placeholder="Buscar por ID ou empresa..." value={searchTermConsolidado} onChange={(e) => setSearchTermConsolidado(e.target.value)} className="pl-10" /></div></div><div className="w-full md:w-48"><Select value={statusFilterConsolidado} onValueChange={setStatusFilterConsolidado}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Status</SelectItem><SelectItem value="Ativo">Ativo</SelectItem><SelectItem value="Em Renovação">Em Renovação</SelectItem><SelectItem value="Vencido">Vencido</SelectItem></SelectContent></Select></div><div className="flex gap-1 border border-gray-200 rounded-lg p-1"><Button variant={viewModeConsolidado === "table" ? "default" : "ghost"} size="sm" onClick={() => setViewModeConsolidado("table")} className={viewModeConsolidado === "table" ? "bg-[#003366] hover:bg-[#002244] text-white" : ""}><List size={16} className="mr-2" />Tabela</Button><Button variant={viewModeConsolidado === "kanban" ? "default" : "ghost"} size="sm" onClick={() => setViewModeConsolidado("kanban")} className={viewModeConsolidado === "kanban" ? "bg-[#003366] hover:bg-[#002244] text-white" : ""}><LayoutGrid size={16} className="mr-2" />Kanban</Button></div></div></CardContent></Card>

              <Tabs defaultValue="diretas" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="diretas">Contratações Diretas ({filteredDiretas.length})</TabsTrigger>
                  <TabsTrigger value="licitacoes">Licitações Homologadas ({filteredLicitacoes.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="diretas" className="mt-0 space-y-4">
                  {viewModeConsolidado === "table" ? (
                    <Card className="border border-gray-200"><CardHeader className="pt-3 pb-1"><CardTitle className="text-xl text-black px-[0px] py-[8px]">Contratações Diretas</CardTitle></CardHeader><CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]"><div className="w-full overflow-x-auto"><Table><TableHeader><TableRow><SortableTableHead label="Número do Processo" onClick={() => sortDiretas("numeroProcesso")} currentDirection={configDiretas.key === "numeroProcesso" ? configDiretas.direction : null} className="sticky left-0 z-10 min-w-[180px] bg-white" /><SortableTableHead label="Empresa" onClick={() => sortDiretas("empresaVencedora")} currentDirection={configDiretas.key === "empresaVencedora" ? configDiretas.direction : null} className="min-w-[220px]" /><SortableTableHead label="Valor" onClick={() => sortDiretas("valor")} currentDirection={configDiretas.key === "valor" ? configDiretas.direction : null} className="min-w-[140px]" /><TableHead className="min-w-[160px]">Fim Vigência</TableHead><SortableTableHead label="Status" onClick={() => sortDiretas("statusContrato")} currentDirection={configDiretas.key === "statusContrato" ? configDiretas.direction : null} className="min-w-[160px]" /><TableHead className="min-w-[140px]">Ações</TableHead></TableRow></TableHeader><TableBody>{sortedDiretas.map((processo) => (<TableRow key={processo.numeroProcesso}><TableCell className="text-black sticky left-0 z-10 bg-white">{processo.numeroProcesso}</TableCell><TableCell className="text-black">{processo.empresaVencedora}</TableCell><TableCell className="text-black">{processo.valor}</TableCell><TableCell className="text-gray-600">{processo.dataFimVigencia}</TableCell><TableCell><BadgeStatus {...getBadgeMappingForStatus(processo.statusContrato === "Em Renovação" ? "Próximo ao Vencimento" : processo.statusContrato)}>{processo.statusContrato}</BadgeStatus></TableCell><TableCell><div className="flex items-center gap-2"><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleVerDetalhes("consolidado", processo)}><Info size={16} className="text-gray-600" /></Button>{processo.responsavel === nomeUsuarioLogado && (<Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedConsolidado(processo); setIsEditConsolidadoModalOpen(true); }}><Edit size={16} className="text-gray-600" /></Button>)}</div></TableCell></TableRow>))}</TableBody></Table></div></CardContent></Card>
                  ) : (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {statusKanbanConsolidado.map((status) => {
                        const processosPorStatus = diretasComprador.filter((processo) => processo.statusContrato === status);
                        const config = kanbanConsolidadoColumnConfig[status];
                        return (
                          <div key={status} className="flex-1 min-w-[280px]" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const processoData = e.dataTransfer.getData("processo-consolidado"); if (!processoData) return; try { const draggedProcesso = JSON.parse(processoData) as ProcessoConsolidado; const draggedStatus = normalizeStatusContratoComprador(draggedProcesso.statusContrato); if (draggedStatus !== status) { handleStatusConsolidadoChange(draggedProcesso.numeroProcesso, status); } } catch { toast.error("Falha ao mover card"); } }}>
                            <Card className={`border-2 ${config.borderColor} h-full ${config.bgColor}`}><CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className={`text-base ${config.color}`}>{config.displayName}</CardTitle><span className={`text-sm ${config.color} bg-white px-2 py-1 rounded border ${config.borderColor}`}>{processosPorStatus.length}</span></div></CardHeader><CardContent className="space-y-3 min-h-[360px] max-h-[calc(100vh-400px)] overflow-y-auto">{processosPorStatus.length === 0 ? (<p className="text-gray-400 text-center text-sm py-8">Nenhum contrato neste status</p>) : (processosPorStatus.map((processo) => (<Card key={processo.numeroProcesso} className="border border-gray-200 bg-white"><CardContent className="p-4"><p className="font-medium text-black">{processo.empresaVencedora}</p><p className="text-sm text-gray-600 mt-1">{processo.numeroProcesso}</p></CardContent></Card>)))}</CardContent></Card>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="licitacoes" className="mt-0 space-y-4">
                  <Card className="border border-gray-200"><CardHeader className="pt-3 pb-1"><CardTitle className="text-xl text-black px-[0px] py-[8px]">Licitações Homologadas</CardTitle></CardHeader><CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px] space-y-4"><div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto border rounded-lg"><Table><TableHeader><TableRow><SortableTableHead label="Número do Processo" onClick={() => sortLicitacoes("numeroProcesso")} currentDirection={configLicitacoes.key === "numeroProcesso" ? configLicitacoes.direction : null} className="sticky left-0 z-10 min-w-[170px] bg-white" /><SortableTableHead label="Requisitante" onClick={() => sortLicitacoes("requisitante")} currentDirection={configLicitacoes.key === "requisitante" ? configLicitacoes.direction : null} className="min-w-[220px]" /><SortableTableHead label="Objeto" onClick={() => sortLicitacoes("objeto")} currentDirection={configLicitacoes.key === "objeto" ? configLicitacoes.direction : null} className="min-w-[320px]" /><TableHead className="min-w-[200px]">Tipo/Modalidade</TableHead><SortableTableHead label="Status" onClick={() => sortLicitacoes("status")} currentDirection={configLicitacoes.key === "status" ? configLicitacoes.direction : null} className="min-w-[140px]" /><TableHead className="min-w-[160px]">Responsável</TableHead><TableHead className="min-w-[140px]">Data Recebimento</TableHead><TableHead className="min-w-[140px]">Data Finalização</TableHead><TableHead className="min-w-[140px]">Data Homologação</TableHead><TableHead className="min-w-[100px]">Tempo Total</TableHead><SortableTableHead label="Valor" onClick={() => sortLicitacoes("valor")} currentDirection={configLicitacoes.key === "valor" ? configLicitacoes.direction : null} className="min-w-[140px]" /><TableHead className="min-w-[140px]">Ações</TableHead></TableRow></TableHeader><TableBody>{sortedLicitacoes.map((processo) => (<TableRow key={processo.numeroProcesso}><TableCell className="text-black sticky left-0 z-10 bg-white">{processo.numeroProcesso}</TableCell><TableCell className="text-gray-600">{processo.requisitante}</TableCell><TableCell className="text-gray-600">{processo.objeto}</TableCell><TableCell className="text-gray-600">{processo.tipo}</TableCell><TableCell><BadgeStatus {...getBadgeMappingForStatus(processo.status)}>{processo.status}</BadgeStatus></TableCell><TableCell className="text-gray-600">{processo.responsavel}</TableCell><TableCell className="text-gray-600">{processo.dataRecebimento}</TableCell><TableCell className="text-gray-600">{processo.dataFinalizacao}</TableCell><TableCell className="text-gray-600">{processo.dataHomologacao ?? "-"}</TableCell><TableCell className="text-gray-600">{processo.tempoTotalDias ? `${processo.tempoTotalDias} dias` : "-"}</TableCell><TableCell className="text-black">{processo.valor}</TableCell><TableCell><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleVerDetalhes("consolidado", processo)}><Info size={16} className="text-gray-600" /></Button></TableCell></TableRow>))}</TableBody></Table></div></CardContent></Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
          )}

        </Tabs>

        <Dialog open={isNovaDemandaModalOpen} onOpenChange={setIsNovaDemandaModalOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Cadastrar Nova Demanda (RC)</DialogTitle>
                <DialogDescription>Registre manualmente uma nova Requisição de Compra.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 pb-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Após o cadastro, você poderá distribuir esta demanda para um comprador.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nova-rc-numero">Número da RC</Label>
                    <Input
                      id="nova-rc-numero"
                      placeholder="Ex: RC 123/2026"
                      value={novaDemandaForm.numero_requisicao}
                      onChange={(e) => setNovaDemandaForm((prev) => ({ ...prev, numero_requisicao: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="nova-rc-data">Data de Recebimento</Label>
                    <Input
                      id="nova-rc-data"
                      type="date"
                      value={novaDemandaForm.data_recebimento}
                      onChange={(e) => setNovaDemandaForm((prev) => ({ ...prev, data_recebimento: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nova-rc-requisitante">Requisitante</Label>
                  <Select
                    value={novaDemandaForm.requisitante_id}
                    onValueChange={(value) => setNovaDemandaForm((prev) => ({ ...prev, requisitante_id: value }))}
                  >
                    <SelectTrigger id="nova-rc-requisitante">
                      <SelectValue placeholder="Selecione o requisitante" />
                    </SelectTrigger>
                    <SelectContent>
                      {requisitantesDisponiveis.map((requisitante) => (
                        <SelectItem key={requisitante.id} value={requisitante.id}>
                          {requisitante.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nova-rc-objeto">Objeto da Compra</Label>
                  <Textarea
                    id="nova-rc-objeto"
                    rows={3}
                    placeholder="Descreva o objeto da requisição..."
                    value={novaDemandaForm.objeto}
                    onChange={(e) => setNovaDemandaForm((prev) => ({ ...prev, objeto: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nova-rc-prioridade">Prioridade</Label>
                    <Select
                      value={novaDemandaForm.prioridade}
                      onValueChange={(value) =>
                        setNovaDemandaForm((prev) => ({ ...prev, prioridade: value as PrioridadeRequisicao }))
                      }
                    >
                      <SelectTrigger id="nova-rc-prioridade">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="nova-rc-categoria">Categoria</Label>
                    <Input
                      id="nova-rc-categoria"
                      placeholder="Equipamentos / Serviços / Materiais"
                      value={novaDemandaForm.categoria}
                      onChange={(e) => setNovaDemandaForm((prev) => ({ ...prev, categoria: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nova-rc-regional">Regional</Label>
                    <Input
                      id="nova-rc-regional"
                      placeholder="São Luís"
                      value={novaDemandaForm.regional}
                      onChange={(e) => setNovaDemandaForm((prev) => ({ ...prev, regional: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="nova-rc-valor">Valor Estimado</Label>
                    <Input
                      id="nova-rc-valor"
                      placeholder="R$ 0,00"
                      value={novaDemandaForm.valor_estimado}
                      onChange={(e) => setNovaDemandaForm((prev) => ({ ...prev, valor_estimado: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1" onClick={() => setIsNovaDemandaModalOpen(false)}>
                Cancelar
              </Button>
                <Button
                  className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                  onClick={() => void handleCadastrarNovaDemanda()}
                  disabled={isSubmitting}
                >
                  Cadastrar Demanda
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isNewProcessModalOpen}
          onOpenChange={(open) => {
            setIsNewProcessModalOpen(open);
            if (!open) {
              resetNovoProcessoForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Cadastrar Novo Processo</DialogTitle>
                <DialogDescription>Crie um novo processo operacional de compras.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-proc-id">ID do Processo</Label>
                    <Input
                      id="novo-proc-id"
                      placeholder="Ex: 0029/26-PG ou 0005/26-CC"
                      value={formDataNovoProcesso.id}
                      onChange={(e) => setFormDataNovoProcesso((prev) => ({ ...prev, id: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-proc-rc">ID Requisição</Label>
                    <Input
                      id="novo-proc-rc"
                      placeholder="Ex: RC 123/2026"
                      value={formDataNovoProcesso.numeroRequisicao}
                      onChange={(e) => setFormDataNovoProcesso((prev) => ({ ...prev, numeroRequisicao: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-proc-modalidade">Tipo/Modalidade</Label>
                    <Select
                      value={formDataNovoProcesso.modalidade}
                      onValueChange={(value) => setFormDataNovoProcesso((prev) => ({ ...prev, modalidade: value }))}
                    >
                      <SelectTrigger id="novo-proc-modalidade">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dispensa">Dispensa</SelectItem>
                        <SelectItem value="Inexigibilidade">Inexigibilidade</SelectItem>
                        <SelectItem value="Licitacao (Pesquisa de Preco)">Licitação (Pesquisa de Preço)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-proc-status">Status Inicial</Label>
                    <Select
                      value={formDataNovoProcesso.status}
                      onValueChange={(value) => setFormDataNovoProcesso((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger id="novo-proc-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusAndamentoPadrao.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="novo-proc-requisitante">Requisitante</Label>
                  <Select
                    value={formDataNovoProcesso.requisitante_id}
                    onValueChange={(value) => setFormDataNovoProcesso((prev) => ({ ...prev, requisitante_id: value }))}
                  >
                    <SelectTrigger id="novo-proc-requisitante">
                      <SelectValue placeholder="Selecione o requisitante" />
                    </SelectTrigger>
                    <SelectContent>
                      {requisitantesDisponiveis.map((requisitante) => (
                        <SelectItem key={requisitante.id} value={requisitante.id}>
                          {requisitante.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="novo-proc-objeto">Objeto</Label>
                  <Textarea
                    id="novo-proc-objeto"
                    rows={2}
                    placeholder="Descreva o objeto do processo..."
                    value={formDataNovoProcesso.objeto}
                    onChange={(e) => setFormDataNovoProcesso((prev) => ({ ...prev, objeto: e.target.value }))}
                  />
                </div>
                <div className="grid gap-3 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-black">Bloquear envio automático de notificação</p>
                      <p className="text-xs text-gray-500">Use para manter o envio sob controle manual.</p>
                    </div>
                    <Switch checked={bloquearEnvioAutomatico} onCheckedChange={setBloquearEnvioAutomatico} />
                  </div>
                  {bloquearEnvioAutomatico && (
                    <div className="space-y-1.5">
                      <Label htmlFor="classificacao-pedido">Classificação do Pedido</Label>
                      <Select value={classificacaoPedido} onValueChange={setClassificacaoPedido}>
                        <SelectTrigger id="classificacao-pedido">
                          <SelectValue placeholder="Selecione a classificação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgente">Urgente</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="planejado">Planejado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1" onClick={() => setIsNewProcessModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => void handleCadastrarNovoProcesso()}
                disabled={isSubmitting}
              >
                Cadastrar Processo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isNewConsolidadoModalOpen}
          onOpenChange={(open) => {
            setIsNewConsolidadoModalOpen(open);
            if (!open) {
              resetConsolidadoForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Cadastrar Processo Consolidado</DialogTitle>
                <DialogDescription>Registre um novo processo consolidado para gestão de contratos.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-cons-numero">Número do Processo</Label>
                    <Input
                      id="novo-cons-numero"
                      placeholder="Ex: SESC-MA-2026-CS-001"
                      value={formDataConsolidado.numeroProcesso}
                      onChange={(e) => setFormDataConsolidado((prev) => ({ ...prev, numeroProcesso: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-cons-valor">Valor</Label>
                    <Input
                      id="novo-cons-valor"
                      placeholder="R$ 0,00"
                      value={formDataConsolidado.valor}
                      onChange={(e) => setFormDataConsolidado((prev) => ({ ...prev, valor: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="novo-cons-empresa">Empresa Vencedora</Label>
                  <Input
                    id="novo-cons-empresa"
                    placeholder="Razão social da empresa"
                    value={formDataConsolidado.empresaVencedora}
                    onChange={(e) => setFormDataConsolidado((prev) => ({ ...prev, empresaVencedora: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="novo-cons-requisitante">Requisitante</Label>
                  <Select
                    value={formDataConsolidado.requisitante_id}
                    onValueChange={(value) => setFormDataConsolidado((prev) => ({ ...prev, requisitante_id: value }))}
                  >
                    <SelectTrigger id="novo-cons-requisitante">
                      <SelectValue placeholder="Selecione o requisitante" />
                    </SelectTrigger>
                    <SelectContent>
                      {requisitantesDisponiveis.map((requisitante) => (
                        <SelectItem key={requisitante.id} value={requisitante.id}>
                          {requisitante.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="novo-cons-modalidade">Modalidade</Label>
                  <Select
                    value={formDataConsolidado.modalidade}
                    onValueChange={(value) => setFormDataConsolidado((prev) => ({ ...prev, modalidade: value }))}
                  >
                    <SelectTrigger id="novo-cons-modalidade">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dispensa">Dispensa</SelectItem>
                      <SelectItem value="Inexigibilidade">Inexigibilidade</SelectItem>
                      <SelectItem value="Licitação">Licitação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-cons-cnpj">CNPJ</Label>
                    <Input
                      id="novo-cons-cnpj"
                      placeholder="00.000.000/0000-00"
                      value={formDataConsolidado.cnpj}
                      onChange={(e) => setFormDataConsolidado((prev) => ({ ...prev, cnpj: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-cons-instrumento">Tipo de Instrumento</Label>
                    <Select
                      value={formDataConsolidado.instrumento}
                      onValueChange={(value) => setFormDataConsolidado((prev) => ({ ...prev, instrumento: value }))}
                    >
                      <SelectTrigger id="novo-cons-instrumento">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contrato">Contrato</SelectItem>
                        <SelectItem value="TRP">TRP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-cons-status">Status do Contrato</Label>
                    <Select
                      value={formDataConsolidado.status}
                      onValueChange={(value) => setFormDataConsolidado((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger id="novo-cons-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Próximo ao Vencimento">Próximo ao Vencimento</SelectItem>
                        <SelectItem value="Vencido">Vencido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-cons-vigencia">Fim de Vigência</Label>
                    <Input
                      id="novo-cons-vigencia"
                      type="date"
                      value={formDataConsolidado.dataFimVigencia}
                      onChange={(e) => setFormDataConsolidado((prev) => ({ ...prev, dataFimVigencia: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="novo-cons-objeto">Objeto do Contrato</Label>
                  <Textarea
                    id="novo-cons-objeto"
                    value={formDataConsolidado.objeto}
                    onChange={(e) => setFormDataConsolidado((prev) => ({ ...prev, objeto: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1" onClick={() => setIsNewConsolidadoModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => void handleCadastrarConsolidado()}
                disabled={isSubmitting}
              >
                Cadastrar Consolidado
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o processo <strong>{processoToDelete?.id}</strong>? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProcessoToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  if (!processoToDelete) return;
                  void (async () => {
                    try {
                      const idToDelete = "processo_id" in processoToDelete ? processoToDelete.processo_id : processoToDelete.id;
                      await deleteProcesso(idToDelete);
                      toast.success(`Processo ${processoToDelete.id} excluído com sucesso!`);
                      setIsDeleteDialogOpen(false);
                      setProcessoToDelete(null);
                      await loadProcessos();
                    } catch (error) {
                      toast.error("Erro ao excluir processo", {
                        description: error instanceof Error ? error.message : "Não foi possível excluir o processo.",
                      });
                    }
                  })();
                }}
              >
                Excluir Processo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isStatusChangeModalOpen} onOpenChange={setIsStatusChangeModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Alterar Status do Processo</DialogTitle>
              <DialogDescription>
                Você está alterando o status de <strong>{processoParaMudarStatus?.id}</strong> para <strong>{novoStatus}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="justificativa-status">Justificativa / Observação (opcional)</Label>
              <Textarea
                id="justificativa-status"
                rows={4}
                value={justificativaStatus}
                onChange={(e) => setJustificativaStatus(e.target.value)}
                placeholder="Digite uma justificativa para esta mudança de status..."
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsStatusChangeModalOpen(false);
                  setProcessoParaMudarStatus(null);
                  setNovoStatus("");
                  setJustificativaStatus("");
                }}
              >
                Cancelar
              </Button>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white" onClick={handleConfirmarMudancaStatus}>
                Confirmar Alteração
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isAtribuirModalOpen}
          onOpenChange={(open) => {
            setIsAtribuirModalOpen(open);
            if (!open) {
              setSelectedRequisicao(null);
              setCompradorSelecionado("");
              setDataInicioDistribuicao("");
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Distribuir Requisição</DialogTitle>
              <DialogDescription>Atribua um comprador e defina a data de início para cálculo de Lead Time.</DialogDescription>
            </DialogHeader>
            {selectedRequisicao && (
              <div className="space-y-4 py-4">
                <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm"><span className="text-black">ID:</span> <span className="text-gray-600">{selectedRequisicao.id}</span></p>
                  <p className="text-sm"><span className="text-black">Requisitante:</span> <span className="text-gray-600">{selectedRequisicao.requisitante}</span></p>
                  <p className="text-sm"><span className="text-black">Objeto:</span> <span className="text-gray-600">{selectedRequisicao.objeto}</span></p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="atribuir-comprador">Comprador Responsável</Label>
                  <Select value={compradorSelecionado} onValueChange={setCompradorSelecionado}>
                    <SelectTrigger id="atribuir-comprador">
                      <SelectValue placeholder="Selecione o comprador" />
                    </SelectTrigger>
                    <SelectContent>
                      {compradoresDisponiveis.map((comprador) => (
                        <SelectItem key={comprador} value={comprador}>
                          {comprador}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="atribuir-inicio">Data de Início</Label>
                  <Input
                    id="atribuir-inicio"
                    type="date"
                    value={dataInicioDistribuicao}
                    onChange={(e) => setDataInicioDistribuicao(e.target.value)}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAtribuirModalOpen(false);
                  setSelectedRequisicao(null);
                  setCompradorSelecionado("");
                  setDataInicioDistribuicao("");
                }}
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => void handleAtribuirComprador()}
                disabled={!compradorSelecionado || isSubmitting}
              >
                Distribuir Requisição
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isConfigurarModalOpen}
          onOpenChange={(open) => {
            setIsConfigurarModalOpen(open);
            if (!open) {
              setRequisicaoParaConfigurar(null);
              setConfigComprador("");
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Iniciar Processo - Configuração de Governança</DialogTitle>
                <DialogDescription>
                  Transforme esta requisição em um processo ativo preenchendo os dados obrigatórios.
                </DialogDescription>
              </DialogHeader>
              {requisicaoParaConfigurar && (
                <div className="space-y-4 py-4 pb-6">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-1">
                    <p className="text-sm text-blue-900"><strong>Requisição:</strong> {getRequisicaoConfigNumero(requisicaoParaConfigurar)}</p>
                    <p className="text-sm text-blue-900"><strong>Requisitante:</strong> {requisicaoParaConfigurar.requisitante}</p>
                    <p className="text-sm text-blue-900"><strong>Objeto:</strong> {getRequisicaoConfigObjeto(requisicaoParaConfigurar)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="config-modalidade">Modalidade</Label>
                      <Select value={configModalidade} onValueChange={setConfigModalidade}>
                        <SelectTrigger id="config-modalidade">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dispensa">Dispensa</SelectItem>
                          <SelectItem value="Inexigibilidade">Inexigibilidade</SelectItem>
                          <SelectItem value="Licitacao (Pesquisa de Preco)">Licitação (Pesquisa de Preço)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="config-comprador">Comprador Responsável (Opcional)</Label>
                      <Select value={configComprador} onValueChange={setConfigComprador}>
                        <SelectTrigger id="config-comprador">
                          <SelectValue placeholder="Selecione o comprador" />
                        </SelectTrigger>
                        <SelectContent>
                          {compradoresDisponiveis.map((comprador) => (
                            <SelectItem key={comprador} value={comprador}>
                              {comprador}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="config-status">Status Inicial</Label>
                      <Select value={configStatusInicial} onValueChange={(value) => setConfigStatusInicial(value)}>
                        <SelectTrigger id="config-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusAndamentoPadrao
                            .filter((status) => status !== "RC recebida pelo setor de compras")
                            .map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsConfigurarModalOpen(false);
                  setRequisicaoParaConfigurar(null);
                  setConfigComprador("");
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => {
                  if (!requisicaoParaConfigurar || isSubmitting) return;
                  void (async () => {
                    setIsSubmitting(true);
                    try {
                      const processoId = "processo_id" in requisicaoParaConfigurar ? requisicaoParaConfigurar.processo_id : requisicaoParaConfigurar.id;
                      const compradorSelecionadoConfig = compradoresOptions.find((comprador) => comprador.nome === configComprador);
                      await iniciarProcesso(
                        processoId,
                        configModalidade,
                        configStatusInicial,
                        compradorSelecionadoConfig?.id,
                      );
                      toast.success("Processo iniciado com sucesso!");
                      setIsConfigurarModalOpen(false);
                      setRequisicaoParaConfigurar(null);
                      setConfigComprador("");
                      await loadProcessos();
                    } catch (error) {
                      toast.error("Erro ao iniciar processo", {
                        description: error instanceof Error ? error.message : "Não foi possível iniciar o processo.",
                      });
                    } finally {
                      setIsSubmitting(false);
                    }
                  })();
                }}
                disabled={isSubmitting}
              >
                Iniciar Processo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isPriorityModalOpen}
          onOpenChange={(open) => {
            setIsPriorityModalOpen(open);
            if (!open) {
              setReqParaPrioridade(null);
              setNovaPrioridade("");
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Alterar Prioridade</DialogTitle>
              <DialogDescription>Defina a nova prioridade para a requisição {reqParaPrioridade?.id}.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={novaPrioridade} onValueChange={(value) => setNovaPrioridade(value as PrioridadeRequisicao)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPriorityModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => void handleSalvarPrioridade()}
                disabled={isSubmitting}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {requisicaoParaDetalhes && (
          <Dialog open={!!requisicaoParaDetalhes} onOpenChange={(open) => !open && setRequisicaoParaDetalhes(null)}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
              <div className="flex-1 overflow-y-auto px-6">
                <DialogHeader className="pt-6">
                  <DialogTitle>Detalhes da Requisição</DialogTitle>
                  <DialogDescription>Informações completas da requisição {requisicaoParaDetalhes.id}.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4 pb-6">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">ID Requisição</Label>
                    <p className="text-black">{requisicaoParaDetalhes.id}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Data de Recebimento</Label>
                    <p className="text-black">{requisicaoParaDetalhes.dataRecebimento}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Requisitante</Label>
                    <p className="text-black">{requisicaoParaDetalhes.requisitante}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Regional</Label>
                    <p className="text-black">{requisicaoParaDetalhes.regional}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Categoria</Label>
                    <p className="text-black">{requisicaoParaDetalhes.categoria}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Valor Estimado</Label>
                    <p className="text-black">{requisicaoParaDetalhes.valorEstimado}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs text-gray-500">Objeto</Label>
                    <p className="text-black">{requisicaoParaDetalhes.objeto}</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 rounded-t-[0px] rounded-b-[8px]">
                <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" onClick={() => setRequisicaoParaDetalhes(null)}>
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal de Detalhes do Processo */}
        <DetalhesProcessoModal
          isOpen={!!selectedProcess || !!selectedConsolidado}
          onClose={() => {
            setSelectedProcess(null);
            setSelectedConsolidado(null);
            setSelectedTRP(null);
            setSelectedContrato(null);
          }}
          processo={selectedProcess || selectedConsolidado || selectedTRP || selectedContrato}
          tipo={processoTipo}
          canGenerateContract={canGenerateContract}
          isGeneratingContract={isGeneratingContract}
          onGenerateContract={() => void handleGerarContrato()}
          contractAlreadyGenerated={selectedConsolidadoJaGerouContrato}
        />

        <Dialog
          open={isEditProcessModalOpen}
          onOpenChange={(open) => {
            setIsEditProcessModalOpen(open);
            if (!open) {
              setSelectedProcess(null);
              setFormDataEdit({
                modalidade: "Dispensa",
                status: "Análise de RC",
                objeto: "",
                observacoes: "",
                dataFinalizacao: "",
              });
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Editar Processo</DialogTitle>
                <DialogDescription>Atualize os dados do processo {selectedProcess?.id}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-processo-id">ID do Processo</Label>
                    <Input id="edit-processo-id" defaultValue={selectedProcess?.id} disabled />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-processo-rc">ID Requisição</Label>
                    <Input id="edit-processo-rc" defaultValue={selectedProcess?.numeroRequisicao} disabled />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-processo-tipo">Tipo/Modalidade</Label>
                    <Select value={formDataEdit.modalidade} onValueChange={(value) => handleChangeEdit("modalidade", value)}>
                      <SelectTrigger id="edit-processo-tipo">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dispensa">Dispensa</SelectItem>
                        <SelectItem value="Inexigibilidade">Inexigibilidade</SelectItem>
                        <SelectItem value="Licitacao (Pesquisa de Preco)">Licitação (Pesquisa de Preço)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-processo-status">Status</Label>
                    <Select value={formDataEdit.status} onValueChange={(value) => handleChangeEdit("status", value)}>
                      <SelectTrigger id="edit-processo-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusAndamentoPadrao.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-processo-data-fim">Data Finalização</Label>
                    <Input
                      id="edit-processo-data-fim"
                      type="date"
                      value={formDataEdit.dataFinalizacao || ""}
                      onChange={(e) => handleChangeEdit("dataFinalizacao", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-processo-objeto">Objeto</Label>
                  <Textarea
                    id="edit-processo-objeto"
                    value={formDataEdit.objeto}
                    onChange={(e) => handleChangeEdit("objeto", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-processo-observacoes">Observações</Label>
                  <Textarea
                    id="edit-processo-observacoes"
                    placeholder="Observações adicionais"
                    rows={2}
                    value={formDataEdit.observacoes}
                    onChange={(e) => handleChangeEdit("observacoes", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1" onClick={() => setIsEditProcessModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => void handleSalvarEdicaoProcesso()}
                disabled={isSubmitting}
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isEditConsolidadoModalOpen}
          onOpenChange={(open) => {
            setIsEditConsolidadoModalOpen(open);
            if (!open) {
              setSelectedConsolidado(null);
              setFormDataEditConsolidado({
                valor: "",
                empresaVencedora: "",
                statusContrato: "Ativo",
                dataFimVigencia: "",
                objeto: "",
                cnpj: "",
                instrumento: "Contrato",
              });
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Editar Processo Consolidado</DialogTitle>
                <DialogDescription>
                  Atualize os dados do contrato {selectedConsolidado?.numeroProcesso}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-3 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-consolidado-id">Número do Processo</Label>
                    <Input
                      id="edit-consolidado-id"
                      defaultValue={selectedConsolidado?.numeroProcesso}
                      placeholder="Ex: SESC-MA-2026-CS-001"
                      disabled
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-consolidado-valor">Valor (R$)</Label>
                    <Input id="edit-consolidado-valor" value={formDataEditConsolidado.valor} onChange={(e) => setFormDataEditConsolidado((prev) => ({ ...prev, valor: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-consolidado-empresa">Empresa Vencedora</Label>
                  <Input id="edit-consolidado-empresa" value={formDataEditConsolidado.empresaVencedora} onChange={(e) => setFormDataEditConsolidado((prev) => ({ ...prev, empresaVencedora: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-consolidado-cnpj">CNPJ</Label>
                    <Input id="edit-consolidado-cnpj" value={formDataEditConsolidado.cnpj} onChange={(e) => setFormDataEditConsolidado((prev) => ({ ...prev, cnpj: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-consolidado-instrumento">Tipo de Instrumento</Label>
                    <Select value={formDataEditConsolidado.instrumento} onValueChange={(value) => setFormDataEditConsolidado((prev) => ({ ...prev, instrumento: value }))}>
                      <SelectTrigger id="edit-consolidado-instrumento">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contrato">Contrato</SelectItem>
                        <SelectItem value="TRP">TRP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-consolidado-status">Status do Contrato</Label>
                    <Select value={formDataEditConsolidado.statusContrato} onValueChange={(value) => setFormDataEditConsolidado((prev) => ({ ...prev, statusContrato: value as StatusContrato }))}>
                      <SelectTrigger id="edit-consolidado-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Próximo ao Vencimento">Próximo ao Vencimento</SelectItem>
                        <SelectItem value="Vencido">Vencido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-consolidado-data">Data Fim da Vigência</Label>
                    <Input id="edit-consolidado-data" type="date" value={formDataEditConsolidado.dataFimVigencia} onChange={(e) => setFormDataEditConsolidado((prev) => ({ ...prev, dataFimVigencia: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-consolidado-objeto">Objeto do Contrato</Label>
                  <Textarea id="edit-consolidado-objeto" value={formDataEditConsolidado.objeto} onChange={(e) => setFormDataEditConsolidado((prev) => ({ ...prev, objeto: e.target.value }))} rows={2} />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1" onClick={() => setIsEditConsolidadoModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => void handleSalvarEdicaoConsolidado()}
                disabled={isSubmitting}
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isEditTRPModalOpen}
          onOpenChange={(open) => {
            setIsEditTRPModalOpen(open);
            if (!open) setSelectedTRP(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Editar TRP</DialogTitle>
                <DialogDescription>
                  Atualize os dados do Termo de Referência de Preço {selectedTRP?.numeroProcesso}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-3 pb-6">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-trp-empresa">Empresa Vencedora</Label>
                  <Input id="edit-trp-empresa" defaultValue={selectedTRP?.empresaVencedora} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-trp-cnpj">CNPJ</Label>
                    <Input id="edit-trp-cnpj" defaultValue={selectedTRP?.cnpj} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-trp-numero">Número do Processo</Label>
                    <Input
                      id="edit-trp-numero"
                      defaultValue={selectedTRP?.numeroProcesso}
                      placeholder="Ex: 0029/26-PG SRP"
                      disabled
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-trp-valor">Valor Contratado</Label>
                    <Input id="edit-trp-valor" defaultValue={selectedTRP?.valorContratado} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-trp-vigencia">Vigência</Label>
                    <Input id="edit-trp-vigencia" defaultValue={selectedTRP?.vigencia} placeholder="Ex: 12 meses" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-trp-aditivos">Número de Aditivos</Label>
                  <Input id="edit-trp-aditivos" type="number" defaultValue={selectedTRP?.aditivos} min="0" />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1" onClick={() => setIsEditTRPModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => {
                  toast.success(`TRP ${selectedTRP?.numeroProcesso} atualizado com sucesso!`);
                  setIsEditTRPModalOpen(false);
                  setSelectedTRP(null);
                }}
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isEditContratoModalOpen}
          onOpenChange={(open) => {
            setIsEditContratoModalOpen(open);
            if (!open) setSelectedContrato(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Editar Contrato</DialogTitle>
                <DialogDescription>Atualize os dados do Contrato {selectedContrato?.numeroProcesso}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-3 pb-6">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-contrato-empresa">Empresa Vencedora</Label>
                  <Input id="edit-contrato-empresa" defaultValue={selectedContrato?.empresaVencedora} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-contrato-cnpj">CNPJ</Label>
                    <Input id="edit-contrato-cnpj" defaultValue={selectedContrato?.cnpj} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-contrato-numero">Número do Processo</Label>
                    <Input
                      id="edit-contrato-numero"
                      defaultValue={selectedContrato?.numeroProcesso}
                      placeholder="Ex: SESC-MA-2026-CS-001"
                      disabled
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-contrato-valor">Valor Contratado</Label>
                    <Input id="edit-contrato-valor" defaultValue={selectedContrato?.valorContratado} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-contrato-vigencia">Vigência</Label>
                    <Input
                      id="edit-contrato-vigencia"
                      defaultValue={selectedContrato?.vigencia}
                      placeholder="Ex: 12 meses"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-contrato-aditivos">Número de Aditivos</Label>
                  <Input id="edit-contrato-aditivos" type="number" defaultValue={selectedContrato?.aditivos} min="0" />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1" onClick={() => setIsEditContratoModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => {
                  toast.success(`Contrato ${selectedContrato?.numeroProcesso} atualizado com sucesso!`);
                  setIsEditContratoModalOpen(false);
                  setSelectedContrato(null);
                }}
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isAditivoModalOpen}
          onOpenChange={(open) => {
            setIsAditivoModalOpen(open);
            if (!open) {
              setSelectedConsolidado(null);
              resetAditivoForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Registrar Aditivo</DialogTitle>
                <DialogDescription>
                  Registre um aditivo para o contrato {selectedConsolidado?.numeroProcesso}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-3 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="aditivo-numero">Número do Aditivo</Label>
                    <Input id="aditivo-numero" placeholder="Ex: 01/2026" value={formDataAditivo.numero} onChange={(e) => setFormDataAditivo((prev) => ({ ...prev, numero: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="aditivo-data">Data do Aditivo</Label>
                    <Input id="aditivo-data" type="date" value={formDataAditivo.data} onChange={(e) => setFormDataAditivo((prev) => ({ ...prev, data: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="aditivo-tipo">Tipo de Aditivo</Label>
                  <Select value={formDataAditivo.tipo} onValueChange={(value) => setFormDataAditivo((prev) => ({ ...prev, tipo: value }))}>
                    <SelectTrigger id="aditivo-tipo">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="valor">Aditivo de Valor</SelectItem>
                      <SelectItem value="prazo">Aditivo de Prazo</SelectItem>
                      <SelectItem value="escopo">Aditivo de Escopo</SelectItem>
                      <SelectItem value="misto">Aditivo Misto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="aditivo-valor">Valor do Aditivo (R$)</Label>
                  <Input id="aditivo-valor" placeholder="R$ 0,00" value={formDataAditivo.valor} onChange={(e) => setFormDataAditivo((prev) => ({ ...prev, valor: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="aditivo-justificativa">Justificativa</Label>
                  <Textarea id="aditivo-justificativa" placeholder="Descrição da justificativa" rows={2} value={formDataAditivo.justificativa} onChange={(e) => setFormDataAditivo((prev) => ({ ...prev, justificativa: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="aditivo-arquivo">Anexar Documento</Label>
                  <FileInput id="aditivo-arquivo" accept=".pdf,.doc,.docx" onFileChange={(file) => setFormDataAditivo((prev) => ({ ...prev, arquivo: file }))} />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1" onClick={() => setIsAditivoModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => void handleRegistrarAditivo()}
                disabled={isSubmitting}
              >
                Registrar Aditivo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isProrrogacaoModalOpen}
          onOpenChange={(open) => {
            setIsProrrogacaoModalOpen(open);
            if (!open) {
              setSelectedConsolidado(null);
              resetProrrogacaoForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Registrar Prorrogação</DialogTitle>
                <DialogDescription>
                  Registre uma prorrogação para o contrato {selectedConsolidado?.numeroProcesso}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-3 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="prorrogacao-numero">Número da Prorrogação</Label>
                    <Input id="prorrogacao-numero" placeholder="Ex: 01/2026" value={formDataProrrogacao.numero} onChange={(e) => setFormDataProrrogacao((prev) => ({ ...prev, numero: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prorrogacao-data">Data da Prorrogação</Label>
                    <Input id="prorrogacao-data" type="date" value={formDataProrrogacao.data} onChange={(e) => setFormDataProrrogacao((prev) => ({ ...prev, data: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="prorrogacao-vigencia-atual">Vigência Atual</Label>
                    <Input
                      id="prorrogacao-vigencia-atual"
                      value={selectedConsolidado?.dataFimVigencia || ""}
                      disabled
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prorrogacao-nova-vigencia">Nova Vigência</Label>
                    <Input id="prorrogacao-nova-vigencia" type="date" value={formDataProrrogacao.novaVigencia} onChange={(e) => setFormDataProrrogacao((prev) => ({ ...prev, novaVigencia: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prorrogacao-justificativa">Justificativa</Label>
                  <Textarea id="prorrogacao-justificativa" placeholder="Descreva a justificativa" rows={3} value={formDataProrrogacao.justificativa} onChange={(e) => setFormDataProrrogacao((prev) => ({ ...prev, justificativa: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prorrogacao-documento">Documento Comprobatório</Label>
                  <FileInput id="prorrogacao-documento" accept=".pdf,.doc,.docx" onFileChange={(file) => setFormDataProrrogacao((prev) => ({ ...prev, arquivo: file }))} />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1" onClick={() => setIsProrrogacaoModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => void handleRegistrarProrrogacao()}
                disabled={isSubmitting}
              >
                Registrar Prorrogação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
