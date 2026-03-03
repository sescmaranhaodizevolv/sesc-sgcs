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
import type { Processo } from "@/types";
import { DetalhesProcessoModal } from "./DetalhesProcessoModal";

type PerfilGestao = "admin" | "comprador";
type ViewMode = "table" | "kanban";
type StatusContrato = "Ativo" | "Próximo ao Vencimento" | "Em Renovação" | "Vencido";
type StatusContratoComprador = "Ativo" | "Em Renovação" | "Vencido";

interface ProcessoConsolidado {
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
}

interface RegistroTRP {
  empresaVencedora: string;
  cnpj: string;
  numeroProcesso: string;
  valorContratado: string;
  vigencia: string;
  aditivos: number;
}

interface RegistroContrato {
  empresaVencedora: string;
  cnpj: string;
  numeroProcesso: string;
  valorContratado: string;
  vigencia: string;
  aditivos: number;
}

type PrioridadeRequisicao = "Alta" | "Média" | "Baixa";

interface RequisicaoPendente {
  id: string;
  requisitante: string;
  objeto: string;
  responsavel: string;
  prioridade: PrioridadeRequisicao;
  dataRecebimento: string;
  dataFinalizacao: string;
  categoria: string;
  regional: string;
  valorEstimado: string;
}

const compradorLogado = "Joao Santos";

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

const processosConsolidadosMock: ProcessoConsolidado[] = [
  {
    numeroProcesso: "CONT-2024-001",
    requisitante: "Carlos Alberto - Alimentação",
    objeto: "Aquisição de equipamentos de cozinha industrial",
    tipo: "Dispensa",
    status: "Aprovado",
    responsavel: "Maria Silva",
    dataRecebimento: "05/10/2024",
    dataFinalizacao: "20/10/2024",
    empresaVencedora: "Empresa ABC Ltda",
    dataEntrega: "25/10/2024",
    valor: "R$ 125.000,00",
    dataFimVigencia: "15/12/2024",
    statusContrato: "Ativo",
  },
  {
    numeroProcesso: "CONT-2024-002",
    requisitante: "Marina Santos - TI",
    objeto: "Contratação de serviço de manutenção de rede",
    tipo: "Pregão Eletrônico",
    status: "Aprovado",
    responsavel: "Joao Santos",
    dataRecebimento: "08/09/2024",
    dataFinalizacao: "30/09/2024",
    empresaVencedora: "Fornecedor XYZ S.A",
    dataEntrega: "05/10/2024",
    valor: "R$ 89.500,00",
    dataFimVigencia: "28/02/2025",
    statusContrato: "Próximo ao Vencimento",
  },
  {
    numeroProcesso: "CONT-2023-045",
    requisitante: "Pedro Oliveira - Manutenção",
    objeto: "Aquisição de materiais de limpeza",
    tipo: "Licitação (Pesquisa de Preço)",
    status: "Aprovado",
    responsavel: "Ana Costa",
    dataRecebimento: "15/08/2024",
    dataFinalizacao: "28/08/2024",
    empresaVencedora: "",
    dataEntrega: "",
    dataHomologacao: "30/08/2024",
    tempoTotalDias: 15,
    valor: "R$ 45.200,00",
    dataFimVigencia: "30/11/2024",
    statusContrato: "Próximo ao Vencimento",
  },
  {
    numeroProcesso: "CONT-2023-032",
    requisitante: "Julia Fernandes - Infraestrutura",
    objeto: "Reforma de salas administrativas",
    tipo: "Dispensa",
    status: "Aprovado",
    responsavel: "Carlos Oliveira",
    dataRecebimento: "20/07/2024",
    dataFinalizacao: "05/08/2024",
    empresaVencedora: "Tecnologia GHI Ltda",
    dataEntrega: "10/08/2024",
    valor: "R$ 210.000,00",
    dataFimVigencia: "15/10/2024",
    statusContrato: "Vencido",
  },
  {
    numeroProcesso: "CONT-2024-003",
    requisitante: "Roberto Lima - Eventos",
    objeto: "Locação de equipamento de som e iluminação",
    tipo: "Inexigibilidade",
    status: "Aprovado",
    responsavel: "Paula Mendes",
    dataRecebimento: "10/09/2024",
    dataFinalizacao: "25/09/2024",
    empresaVencedora: "Soluções JKL Corp",
    dataEntrega: "30/09/2024",
    valor: "R$ 156.800,00",
    dataFimVigencia: "20/06/2025",
    statusContrato: "Ativo",
  },
];

const trpListMock: RegistroTRP[] = [
  {
    empresaVencedora: "Empresa ABC Ltda",
    cnpj: "12.345.678/0001-90",
    numeroProcesso: "TRP-2024-001",
    valorContratado: "R$ 125.000,00",
    vigencia: "12 meses",
    aditivos: 0,
  },
  {
    empresaVencedora: "Fornecedor XYZ S.A",
    cnpj: "23.456.789/0001-12",
    numeroProcesso: "TRP-2024-002",
    valorContratado: "R$ 89.500,00",
    vigencia: "18 meses",
    aditivos: 1,
  },
  {
    empresaVencedora: "Serviços DEF Eireli",
    cnpj: "34.567.890/0001-34",
    numeroProcesso: "TRP-2023-045",
    valorContratado: "R$ 45.200,00",
    vigencia: "24 meses",
    aditivos: 2,
  },
];

const contratosListMock: RegistroContrato[] = [
  {
    empresaVencedora: "Tecnologia GHI Ltda",
    cnpj: "45.678.901/0001-56",
    numeroProcesso: "CONT-2023-032",
    valorContratado: "R$ 210.000,00",
    vigencia: "36 meses",
    aditivos: 3,
  },
  {
    empresaVencedora: "Soluções JKL Corp",
    cnpj: "56.789.012/0001-78",
    numeroProcesso: "CONT-2024-003",
    valorContratado: "R$ 156.800,00",
    vigencia: "24 meses",
    aditivos: 1,
  },
  {
    empresaVencedora: "Comércio MNO Ltda",
    cnpj: "67.890.123/0001-90",
    numeroProcesso: "CONT-2024-004",
    valorContratado: "R$ 98.300,00",
    vigencia: "12 meses",
    aditivos: 0,
  },
];

const compradoresDisponiveis = [
  "Maria Silva",
  "Joao Santos",
  "Ana Costa",
  "Carlos Oliveira",
  "Paula Mendes",
  "Roberto Lima",
  "Fernanda Alves",
];

const requisicoesPendentesMock: RequisicaoPendente[] = [
  {
    id: "REQ-2026-089",
    requisitante: "Carlos Alberto - Alimentacao",
    objeto: "Aquisicao de equipamentos de cozinha industrial",
    responsavel: "Maria Silva",
    prioridade: "Alta",
    dataRecebimento: "10/02/2026",
    dataFinalizacao: "25/02/2026",
    categoria: "Equipamentos",
    regional: "Fortaleza",
    valorEstimado: "R$ 180.000,00",
  },
  {
    id: "REQ-2026-090",
    requisitante: "Marina Santos - TI",
    objeto: "Contratacao de servico de manutencao de rede",
    responsavel: "Joao Santos",
    prioridade: "Média",
    dataRecebimento: "10/02/2026",
    dataFinalizacao: "20/02/2026",
    categoria: "Servicos",
    regional: "Fortaleza",
    valorEstimado: "R$ 92.000,00",
  },
  {
    id: "REQ-2026-091",
    requisitante: "Pedro Oliveira - Manutencao",
    objeto: "Aquisicao de materiais de limpeza",
    responsavel: "Ana Costa",
    prioridade: "Baixa",
    dataRecebimento: "11/02/2026",
    dataFinalizacao: "18/02/2026",
    categoria: "Materiais",
    regional: "Fortaleza",
    valorEstimado: "R$ 38.000,00",
  },
  {
    id: "REQ-2026-092",
    requisitante: "Julia Fernandes - Infraestrutura",
    objeto: "Reforma de salas administrativas",
    responsavel: "Carlos Oliveira",
    prioridade: "Alta",
    dataRecebimento: "11/02/2026",
    dataFinalizacao: "28/02/2026",
    categoria: "Obras",
    regional: "Sobral",
    valorEstimado: "R$ 240.000,00",
  },
  {
    id: "REQ-2026-093",
    requisitante: "Roberto Lima - Eventos",
    objeto: "Locacao de equipamento de som e iluminacao",
    responsavel: "Paula Mendes",
    prioridade: "Média",
    dataRecebimento: "12/02/2026",
    dataFinalizacao: "23/02/2026",
    categoria: "Servicos",
    regional: "Juazeiro do Norte",
    valorEstimado: "R$ 134.500,00",
  },
];

function formatBrDate(day: number, month: number, year: number) {
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

function generateMockProcessos(): Processo[] {
  const processos: Processo[] = [];

  for (let i = 1; i <= 32; i += 1) {
    const diaRecebimento = (i % 27) + 1;
    const mes = 2;
    const status = statusAndamentoPadrao[i % statusAndamentoPadrao.length];
    const modalidade = modalidadesSemPregao[i % modalidadesSemPregao.length];
    const finalizado = status === "Aprovada" || status === "Finalizado";

    processos.push({
      id: `PROC-2026-${String(i).padStart(3, "0")}`,
      numeroRequisicao: `RC-2026-${String(100 + i).padStart(3, "0")}`,
      requisitante: requisitantes[i % requisitantes.length],
      objeto: objetos[i % objetos.length],
      descricao: objetos[i % objetos.length],
      modalidade,
      status: status as Processo["status"],
      responsavel: responsaveis[i % responsaveis.length],
      prioridade: (["Alta", "Média", "Baixa"] as const)[i % 3],
      empresa: empresasList[i % empresasList.length],
      empresaVencedora: finalizado ? empresasList[i % empresasList.length] : "-",
      dataDistribuicao: formatBrDate(diaRecebimento, mes, 2026),
      dataRecebimento: formatBrDate(diaRecebimento, mes, 2026),
      dataFinalizacao: finalizado ? formatBrDate(((diaRecebimento + 8) % 28) + 1, mes, 2026) : "-",
    });
  }

  return processos;
}

function normalizeStatusContratoComprador(status: StatusContrato): StatusContratoComprador {
  if (status === "Ativo" || status === "Vencido") return status;
  return "Em Renovação";
}

interface ProcessosModuleProps {
  perfil: PerfilGestao;
}

export function ProcessosModule({ perfil }: ProcessosModuleProps) {
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
  const [requisicaoParaConfigurar, setRequisicaoParaConfigurar] = useState<Processo | null>(null);
  const [isNovaDemandaModalOpen, setIsNovaDemandaModalOpen] = useState(false);
  const [isNewProcessModalOpen, setIsNewProcessModalOpen] = useState(false);
  const [isNewConsolidadoModalOpen, setIsNewConsolidadoModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [processoToDelete, setProcessoToDelete] = useState<Processo | null>(null);
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

  const [requisicoesPendentes] = useState<RequisicaoPendente[]>(requisicoesPendentesMock);
  const [processosDiarios, setProcessosDiarios] = useState<Processo[]>(() => generateMockProcessos());
  const [processosConsolidados, setProcessosConsolidados] = useState<ProcessoConsolidado[]>(processosConsolidadosMock);
  const [trpList] = useState<RegistroTRP[]>(trpListMock);
  const [contratosList] = useState<RegistroContrato[]>(contratosListMock);

  const [selectedProcess, setSelectedProcess] = useState<Processo | null>(null);
  const [selectedConsolidado, setSelectedConsolidado] = useState<ProcessoConsolidado | null>(null);
  const [selectedTRP, setSelectedTRP] = useState<RegistroTRP | null>(null);
  const [selectedContrato, setSelectedContrato] = useState<RegistroContrato | null>(null);
  const [processoTipo, setProcessoTipo] = useState<"diario" | "consolidado">("diario");

  const [isEditProcessModalOpen, setIsEditProcessModalOpen] = useState(false);
  const [isEditConsolidadoModalOpen, setIsEditConsolidadoModalOpen] = useState(false);
  const [isEditTRPModalOpen, setIsEditTRPModalOpen] = useState(false);
  const [isEditContratoModalOpen, setIsEditContratoModalOpen] = useState(false);
  const [isAditivoModalOpen, setIsAditivoModalOpen] = useState(false);
  const [isProrrogacaoModalOpen, setIsProrrogacaoModalOpen] = useState(false);

  const processosDiariosPerfil = useMemo(() => processosDiarios, [processosDiarios]);
  const processosDiariosAtribuidosAoComprador = useMemo(
    () => processosDiarios.filter((processo) => processo.responsavel === compradorLogado),
    [processosDiarios],
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
        const matchesDono = !mostrarApenasMeus || processo.responsavel === compradorLogado;

        return matchesSearch && matchesStatus && matchesTipo && matchesDono;
      }),
    [processosDiariosPerfil, searchTermDiario, statusFilterDiario, tipoFilterDiario, mostrarApenasMeus],
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

  const processosConsolidadosPerfil = useMemo(() => processosConsolidados, [processosConsolidados]);

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
    () => filteredProcessosConsolidados.filter((processo) => processo.tipo !== "Licitação (Pesquisa de Preço)"),
    [filteredProcessosConsolidados],
  );

  const licitacoesAdmin = useMemo(
    () => filteredProcessosConsolidados.filter((processo) => processo.tipo === "Licitação (Pesquisa de Preço)"),
    [filteredProcessosConsolidados],
  );

  const diretasComprador = useMemo(
    () =>
      filteredProcessosConsolidadosComprador.filter(
        (processo) => processo.tipo !== "Licitação (Pesquisa de Preço)",
      ),
    [filteredProcessosConsolidadosComprador],
  );

  const licitacoesComprador = useMemo(
    () =>
      filteredProcessosConsolidadosComprador.filter(
        (processo) => processo.tipo === "Licitação (Pesquisa de Preço)",
      ),
    [filteredProcessosConsolidadosComprador],
  );

  const filteredDiretas = perfil === "admin" ? diretasAdmin : diretasComprador;
  const filteredLicitacoes = perfil === "admin" ? licitacoesAdmin : licitacoesComprador;

  const filteredTRP = useMemo(
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

  const filteredContratos = useMemo(
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

  const handleStatusChange = (processoId: string, novoStatus: string) => {
    if (!statusAndamentoPadrao.includes(novoStatus as (typeof statusAndamentoPadrao)[number])) {
      return;
    }

    setProcessosDiarios((prev) =>
      prev.map((processo) =>
        processo.id === processoId ? { ...processo, status: novoStatus as Processo["status"] } : processo,
      ),
    );

    toast.success("Ação simulada", {
      description: `Status alterado para ${novoStatus}.`,
    });
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

    handleStatusChange(processo.id, statusSelecionado);
  };

  const handleConfirmarMudancaStatus = () => {
    if (!processoParaMudarStatus || !novoStatus) return;

    handleStatusChange(processoParaMudarStatus.id, novoStatus);
    setIsStatusChangeModalOpen(false);
    setProcessoParaMudarStatus(null);
    setNovoStatus("");
    setJustificativaStatus("");
  };

  const handleAtribuirComprador = () => {
    if (!selectedRequisicao || !compradorSelecionado || !dataInicioDistribuicao) return;

    const dataFormatada = new Date(dataInicioDistribuicao).toLocaleDateString("pt-BR");
    toast.success("Requisição distribuída com sucesso!", {
      description: `${selectedRequisicao.id} atribuída para ${compradorSelecionado} com início em ${dataFormatada}.`,
    });

    setIsAtribuirModalOpen(false);
    setSelectedRequisicao(null);
    setCompradorSelecionado("");
    setDataInicioDistribuicao("");
  };

  const handleStatusConsolidadoChange = (
    numeroProcesso: string,
    novoStatus: StatusContratoComprador,
  ) => {
    setProcessosConsolidados((prev) =>
      prev.map((processo) =>
        processo.numeroProcesso === numeroProcesso
          ? {
              ...processo,
              statusContrato: novoStatus === "Em Renovação" ? "Próximo ao Vencimento" : novoStatus,
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
                          onClick={() => sortReq("id")}
                          currentDirection={configReq.key === "id" ? configReq.direction : null}
                          className="sticky left-0 z-10 min-w-[140px] bg-white"
                        />
                        <SortableTableHead
                          label="Requisitante"
                          onClick={() => sortReq("requisitante")}
                          currentDirection={configReq.key === "requisitante" ? configReq.direction : null}
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
                          onClick={() => sortReq("responsavel")}
                          currentDirection={configReq.key === "responsavel" ? configReq.direction : null}
                          className="min-w-[160px]"
                        />
                        <SortableTableHead
                          label="Prioridade"
                          onClick={() => sortReq("prioridade")}
                          currentDirection={configReq.key === "prioridade" ? configReq.direction : null}
                          className="min-w-[140px]"
                        />
                        <TableHead className="min-w-[140px]">Data Recebimento</TableHead>
                        <TableHead className="min-w-[140px]">Data Finalização</TableHead>
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
                                    toast.success("Processo criado com sucesso!", {
                                      description: `Processo gerado a partir da requisição ${requisicao.id}.`,
                                    });
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
                                        setIsAtribuirModalOpen(true);
                                      }}
                                    >
                                      Atribuir Comprador
                                    </DropdownMenuItem>
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
                        const canEditProcesso = perfil === "admin" || processo.responsavel === compradorLogado;

                        return (
                          <TableRow key={processo.id}>
                            <TableCell className="text-black sticky left-0 z-10 bg-white">
                              {processo.numeroRequisicao ?? "-"}
                            </TableCell>
                            <TableCell className="text-gray-600">{processo.objeto ?? processo.descricao}</TableCell>
                            <TableCell className="text-gray-600">{processo.requisitante ?? "-"}</TableCell>
                            <TableCell className="text-gray-600">{processo.modalidade}</TableCell>
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
                                    {statusAndamentoPadrao.map((status) => (
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
                            <TableCell className="text-gray-600">{processo.dataFinalizacao ?? "-"}</TableCell>
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
                          perfil === "admin" || draggedProcesso.responsavel === compradorLogado;
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
                            const canEditProcesso = perfil === "admin" || processo.responsavel === compradorLogado;

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
                              <TableCell className="text-black sticky left-0 z-10 bg-white">{processo.numeroProcesso}</TableCell>
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
                                  {(perfil === "admin" || processo.responsavel === compradorLogado) && (
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
                              <TableCell className="text-black sticky left-0 z-10 bg-white">{processo.numeroProcesso}</TableCell>
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
                                  {(perfil === "admin" || processo.responsavel === compradorLogado) && (
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
                            <TableCell className="text-gray-600">{requisicao.dataFinalizacao ?? "-"}</TableCell>
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
                  <Card className="border border-gray-200"><CardHeader className="pt-3 pb-1"><CardTitle className="text-xl text-black px-[0px] py-[8px]">Contratações Diretas</CardTitle></CardHeader><CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]"><div className="w-full overflow-x-auto"><Table><TableHeader><TableRow><SortableTableHead label="Número do Processo" onClick={() => sortDiretas("numeroProcesso")} currentDirection={configDiretas.key === "numeroProcesso" ? configDiretas.direction : null} className="sticky left-0 z-10 min-w-[180px] bg-white" /><SortableTableHead label="Empresa" onClick={() => sortDiretas("empresaVencedora")} currentDirection={configDiretas.key === "empresaVencedora" ? configDiretas.direction : null} className="min-w-[220px]" /><SortableTableHead label="Valor" onClick={() => sortDiretas("valor")} currentDirection={configDiretas.key === "valor" ? configDiretas.direction : null} className="min-w-[140px]" /><TableHead className="min-w-[160px]">Fim Vigência</TableHead><SortableTableHead label="Status" onClick={() => sortDiretas("statusContrato")} currentDirection={configDiretas.key === "statusContrato" ? configDiretas.direction : null} className="min-w-[160px]" /><TableHead className="min-w-[140px]">Ações</TableHead></TableRow></TableHeader><TableBody>{sortedDiretas.map((processo) => (<TableRow key={processo.numeroProcesso}><TableCell className="text-black sticky left-0 z-10 bg-white">{processo.numeroProcesso}</TableCell><TableCell className="text-black">{processo.empresaVencedora}</TableCell><TableCell className="text-black">{processo.valor}</TableCell><TableCell className="text-gray-600">{processo.dataFimVigencia}</TableCell><TableCell><BadgeStatus {...getBadgeMappingForStatus(processo.statusContrato === "Em Renovação" ? "Próximo ao Vencimento" : processo.statusContrato)}>{processo.statusContrato}</BadgeStatus></TableCell><TableCell><div className="flex items-center gap-2"><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleVerDetalhes("consolidado", processo)}><Info size={16} className="text-gray-600" /></Button>{processo.responsavel === compradorLogado && (<Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedConsolidado(processo); setIsEditConsolidadoModalOpen(true); }}><Edit size={16} className="text-gray-600" /></Button>)}</div></TableCell></TableRow>))}</TableBody></Table></div></CardContent></Card>
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
                  <Input id="nova-rc-numero" placeholder="Ex: RC 123/2026" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nova-rc-data">Data de Recebimento</Label>
                  <Input id="nova-rc-data" type="date" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nova-rc-objeto">Objeto da Compra</Label>
                <Textarea id="nova-rc-objeto" rows={3} placeholder="Descreva o objeto da requisição..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nova-rc-prioridade">Prioridade</Label>
                  <Select defaultValue="Média">
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
                  <Input id="nova-rc-categoria" placeholder="Equipamentos / Serviços / Materiais" />
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
              onClick={() => {
                toast.success("Demanda cadastrada com sucesso!");
                setIsNovaDemandaModalOpen(false);
              }}
            >
              Cadastrar Demanda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewProcessModalOpen} onOpenChange={setIsNewProcessModalOpen}>
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
                  <Input id="novo-proc-id" placeholder="Ex: 0029/26-PG ou 0005/26-CC" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="novo-proc-rc">ID Requisição</Label>
                  <Input id="novo-proc-rc" placeholder="Ex: RC 123/2026" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="novo-proc-modalidade">Tipo/Modalidade</Label>
                  <Select defaultValue="Dispensa">
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
                  <Select defaultValue={statusAndamentoPadrao[0]}>
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
                <Label htmlFor="novo-proc-objeto">Objeto</Label>
                <Textarea id="novo-proc-objeto" rows={2} placeholder="Descreva o objeto do processo..." />
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
              onClick={() => {
                toast.success("Processo cadastrado com sucesso!");
                setIsNewProcessModalOpen(false);
                setBloquearEnvioAutomatico(false);
                setClassificacaoPedido("");
              }}
            >
              Cadastrar Processo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewConsolidadoModalOpen} onOpenChange={setIsNewConsolidadoModalOpen}>
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
                  <Input id="novo-cons-numero" placeholder="Ex: SESC-MA-2026-CS-001" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="novo-cons-valor">Valor</Label>
                  <Input id="novo-cons-valor" placeholder="R$ 0,00" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="novo-cons-empresa">Empresa Vencedora</Label>
                <Input id="novo-cons-empresa" placeholder="Razão social da empresa" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="novo-cons-status">Status do Contrato</Label>
                  <Select defaultValue="Ativo">
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
                  <Input id="novo-cons-vigencia" type="date" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
            <Button variant="outline" className="flex-1" onClick={() => setIsNewConsolidadoModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
              onClick={() => {
                toast.success("Processo consolidado cadastrado com sucesso!");
                setIsNewConsolidadoModalOpen(false);
              }}
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
                if (processoToDelete) {
                  toast.success(`Processo ${processoToDelete.id} excluído com sucesso!`);
                }
                setIsDeleteDialogOpen(false);
                setProcessoToDelete(null);
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

      <Dialog open={isAtribuirModalOpen} onOpenChange={setIsAtribuirModalOpen}>
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
              onClick={handleAtribuirComprador}
              disabled={!compradorSelecionado || !dataInicioDistribuicao}
            >
              Distribuir Requisição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfigurarModalOpen} onOpenChange={setIsConfigurarModalOpen}>
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
                  <p className="text-sm text-blue-900"><strong>Requisição:</strong> {requisicaoParaConfigurar.numeroRequisicao ?? requisicaoParaConfigurar.id}</p>
                  <p className="text-sm text-blue-900"><strong>Requisitante:</strong> {requisicaoParaConfigurar.requisitante}</p>
                  <p className="text-sm text-blue-900"><strong>Objeto:</strong> {requisicaoParaConfigurar.objeto ?? requisicaoParaConfigurar.descricao}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="config-modalidade">Modalidade</Label>
                    <Select defaultValue={requisicaoParaConfigurar.modalidade}>
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
                    <Label htmlFor="config-status">Status Inicial</Label>
                    <Select defaultValue={statusAndamentoPadrao[0]}>
                      <SelectTrigger id="config-status">
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
              }}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
              onClick={() => {
                toast.success("Processo iniciado com sucesso!");
                setIsConfigurarModalOpen(false);
                setRequisicaoParaConfigurar(null);
              }}
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
              onClick={() => {
                toast.success("Prioridade alterada com sucesso!");
                setIsPriorityModalOpen(false);
                setReqParaPrioridade(null);
                setNovaPrioridade("");
              }}
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
      />

      <Dialog
        open={isEditProcessModalOpen}
        onOpenChange={(open) => {
          setIsEditProcessModalOpen(open);
          if (!open) setSelectedProcess(null);
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
                  <Select defaultValue={selectedProcess?.modalidade ?? "Dispensa"}>
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
                  <Select defaultValue={selectedProcess?.status ?? "Análise de RC"}>
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
              <div className="space-y-1.5">
                <Label htmlFor="edit-processo-objeto">Objeto</Label>
                <Textarea
                  id="edit-processo-objeto"
                  defaultValue={selectedProcess?.objeto ?? selectedProcess?.descricao}
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-processo-observacoes">Observações</Label>
                <Textarea id="edit-processo-observacoes" placeholder="Observações adicionais" rows={2} />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditProcessModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
              onClick={() => {
                toast.success("Processo atualizado com sucesso!");
                setIsEditProcessModalOpen(false);
                setSelectedProcess(null);
              }}
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
          if (!open) setSelectedConsolidado(null);
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
                  <Input id="edit-consolidado-valor" defaultValue={selectedConsolidado?.valor} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-consolidado-empresa">Empresa Vencedora</Label>
                <Input id="edit-consolidado-empresa" defaultValue={selectedConsolidado?.empresaVencedora} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-consolidado-status">Status do Contrato</Label>
                  <Select defaultValue={selectedConsolidado?.statusContrato ?? "Ativo"}>
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
                  <Input id="edit-consolidado-data" type="date" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-consolidado-objeto">Objeto do Contrato</Label>
                <Textarea id="edit-consolidado-objeto" defaultValue={selectedConsolidado?.objeto} rows={2} />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditConsolidadoModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
              onClick={() => {
                toast.success("Processo consolidado atualizado com sucesso!");
                setIsEditConsolidadoModalOpen(false);
                setSelectedConsolidado(null);
              }}
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
          if (!open) setSelectedConsolidado(null);
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
                  <Input id="aditivo-numero" placeholder="Ex: 01/2026" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="aditivo-data">Data do Aditivo</Label>
                  <Input id="aditivo-data" type="date" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="aditivo-tipo">Tipo de Aditivo</Label>
                <Select>
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
                <Input id="aditivo-valor" placeholder="R$ 0,00" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="aditivo-justificativa">Justificativa</Label>
                <Textarea id="aditivo-justificativa" placeholder="Descrição da justificativa" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="aditivo-arquivo">Anexar Documento</Label>
                <FileInput id="aditivo-arquivo" accept=".pdf,.doc,.docx" />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
            <Button variant="outline" className="flex-1" onClick={() => setIsAditivoModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
              onClick={() => {
                toast.success("Aditivo registrado com sucesso!");
                setIsAditivoModalOpen(false);
                setSelectedConsolidado(null);
              }}
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
          if (!open) setSelectedConsolidado(null);
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
                  <Input id="prorrogacao-numero" placeholder="Ex: 01/2026" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prorrogacao-data">Data da Prorrogação</Label>
                  <Input id="prorrogacao-data" type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prorrogacao-vigencia-atual">Vigência Atual</Label>
                  <Input
                    id="prorrogacao-vigencia-atual"
                    defaultValue={selectedConsolidado?.dataFimVigencia}
                    disabled
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prorrogacao-nova-vigencia">Nova Vigência</Label>
                  <Input id="prorrogacao-nova-vigencia" type="date" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prorrogacao-justificativa">Justificativa</Label>
                <Textarea id="prorrogacao-justificativa" placeholder="Descreva a justificativa" rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prorrogacao-documento">Documento Comprobatório</Label>
                <FileInput id="prorrogacao-documento" accept=".pdf,.doc,.docx" />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
            <Button variant="outline" className="flex-1" onClick={() => setIsProrrogacaoModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
              onClick={() => {
                toast.success("Prorrogação registrada com sucesso!");
                setIsProrrogacaoModalOpen(false);
                setSelectedConsolidado(null);
              }}
            >
              Registrar Prorrogação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
