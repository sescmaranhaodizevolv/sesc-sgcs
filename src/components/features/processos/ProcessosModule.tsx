"use client";

import { useMemo, useState } from "react";
import { Calendar, Edit, FileText, Info, LayoutGrid, List, MoreVertical, Search } from "lucide-react";
import { toast } from "sonner";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { useTableSort } from "@/hooks/useTableSort";
import { getBadgeMappingForStatus } from "@/lib/badge-mappings";
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

const compradorLogado = "Joao Santos";

const statusAndamentoPadrao = [
  "RC recebida pelo setor de compras",
  "Análise de RC",
  "Devolvido ao Requisitante",
  "Em cotação",
  "Tramitando para aprovação",
  "Aprovada",
  "Aguardando entrega",
  "Finalizado",
] as const;

const statusKanban = [
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
  const [activeTab, setActiveTab] = useState("diario");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [viewModeConsolidado, setViewModeConsolidado] = useState<ViewMode>("table");

  const [searchTermDiario, setSearchTermDiario] = useState("");
  const [statusFilterDiario, setStatusFilterDiario] = useState("todos");
  const [tipoFilterDiario, setTipoFilterDiario] = useState("todos");

  const [searchTermConsolidado, setSearchTermConsolidado] = useState("");
  const [statusFilterConsolidado, setStatusFilterConsolidado] = useState("todos");
  const [searchTermTRP, setSearchTermTRP] = useState("");
  const [filterTRP, setFilterTRP] = useState("todos");
  const [searchTermContratos, setSearchTermContratos] = useState("");
  const [filterContratos, setFilterContratos] = useState("todos");

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

  const processosDiariosPerfil = useMemo(
    () =>
      perfil === "admin"
        ? processosDiarios
        : processosDiarios.filter((processo) => processo.responsavel === compradorLogado),
    [perfil, processosDiarios],
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

        return matchesSearch && matchesStatus && matchesTipo;
      }),
    [processosDiariosPerfil, searchTermDiario, statusFilterDiario, tipoFilterDiario],
  );

  const {
    items: sortedProcessosDiarios,
    requestSort: requestSortDiario,
    sortConfig: sortConfigDiario,
  } = useTableSort(filteredProcessosDiarios);

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

  const processosConsolidadosPerfil = useMemo(
    () =>
      perfil === "admin"
        ? processosConsolidados
        : processosConsolidados.filter((processo) => processo.responsavel === compradorLogado),
    [perfil, processosConsolidados],
  );

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
      <div>
        <h2 className="text-3xl text-black">Processos</h2>
        <p className="text-gray-600 mt-1">Gerenciamento operacional dos processos de compras</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${perfil === "admin" ? "max-w-5xl grid-cols-5" : "max-w-3xl grid-cols-3"}`}>
          {perfil === "admin" ? (
            <>
              <TabsTrigger value="diario">Processos em Andamento</TabsTrigger>
              <TabsTrigger value="diretas">Contratações Diretas</TabsTrigger>
              <TabsTrigger value="licitacoes">Licitações Homologadas</TabsTrigger>
              <TabsTrigger value="trp">TRP</TabsTrigger>
              <TabsTrigger value="contratos">Contratos</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="atribuidas">Requisições Atribuídas</TabsTrigger>
              <TabsTrigger value="diario">Processos em Andamento</TabsTrigger>
              <TabsTrigger value="consolidado">Processos Consolidados</TabsTrigger>
            </>
          )}
        </TabsList>

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
                      {sortedProcessosDiarios.map((processo) => (
                        <TableRow key={processo.id}>
                          <TableCell className="text-black sticky left-0 z-10 bg-white">
                            {processo.numeroRequisicao ?? "-"}
                          </TableCell>
                          <TableCell className="text-gray-600">{processo.objeto ?? processo.descricao}</TableCell>
                          <TableCell className="text-gray-600">{processo.requisitante ?? "-"}</TableCell>
                          <TableCell className="text-gray-600">{processo.modalidade}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                value={processo.status}
                                onValueChange={(novoStatus) => handleStatusChange(processo.id, novoStatus)}
                              >
                                <SelectTrigger className="w-[220px] h-8">
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
                              <BadgeStatus {...getBadgeMappingForStatus(processo.status)}>{processo.status}</BadgeStatus>
                            </div>
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
                                  <DropdownMenuItem onClick={() => handleEditar(processo)}>Editar</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                        if (draggedProcesso.status !== status) {
                          handleStatusChange(draggedProcesso.id, status);
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
                          processosPorStatus.map((processo) => (
                            <div
                              key={processo.id}
                              className="cursor-grab active:cursor-grabbing"
                              onDragStart={(e) => {
                                e.dataTransfer.setData("processo", JSON.stringify(processo));
                                e.currentTarget.style.opacity = "0.5";
                              }}
                              onDragEnd={(e) => {
                                e.currentTarget.style.opacity = "1";
                              }}
                              draggable
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
                                          <DropdownMenuItem onClick={() => handleEditar(processo)}>Editar</DropdownMenuItem>
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
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {perfil === "comprador" && (
          <TabsContent value="atribuidas" className="space-y-6 mt-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Requisições Atribuídas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  As requisições atribuídas ao comprador são acompanhadas na aba de processos em andamento.
                </p>
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
                  <Card className="border border-gray-200"><CardHeader className="pt-3 pb-1"><CardTitle className="text-xl text-black px-[0px] py-[8px]">Contratações Diretas</CardTitle></CardHeader><CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]"><div className="w-full overflow-x-auto"><Table><TableHeader><TableRow><SortableTableHead label="Número do Processo" onClick={() => sortDiretas("numeroProcesso")} currentDirection={configDiretas.key === "numeroProcesso" ? configDiretas.direction : null} className="sticky left-0 z-10 min-w-[180px] bg-white" /><SortableTableHead label="Empresa" onClick={() => sortDiretas("empresaVencedora")} currentDirection={configDiretas.key === "empresaVencedora" ? configDiretas.direction : null} className="min-w-[220px]" /><SortableTableHead label="Valor" onClick={() => sortDiretas("valor")} currentDirection={configDiretas.key === "valor" ? configDiretas.direction : null} className="min-w-[140px]" /><TableHead className="min-w-[160px]">Fim Vigência</TableHead><SortableTableHead label="Status" onClick={() => sortDiretas("statusContrato")} currentDirection={configDiretas.key === "statusContrato" ? configDiretas.direction : null} className="min-w-[160px]" /><TableHead className="min-w-[140px]">Ações</TableHead></TableRow></TableHeader><TableBody>{sortedDiretas.map((processo) => (<TableRow key={processo.numeroProcesso}><TableCell className="text-black sticky left-0 z-10 bg-white">{processo.numeroProcesso}</TableCell><TableCell className="text-black">{processo.empresaVencedora}</TableCell><TableCell className="text-black">{processo.valor}</TableCell><TableCell className="text-gray-600">{processo.dataFimVigencia}</TableCell><TableCell><BadgeStatus {...getBadgeMappingForStatus(processo.statusContrato === "Em Renovação" ? "Próximo ao Vencimento" : processo.statusContrato)}>{processo.statusContrato}</BadgeStatus></TableCell><TableCell><div className="flex items-center gap-2"><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleVerDetalhes("consolidado", processo)}><Info size={16} className="text-gray-600" /></Button><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedConsolidado(processo); setIsEditConsolidadoModalOpen(true); }}><Edit size={16} className="text-gray-600" /></Button></div></TableCell></TableRow>))}</TableBody></Table></div></CardContent></Card>
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

        {perfil === "admin" && (
        <TabsContent value="diretas" className="space-y-6 mt-6">
          {perfil === "admin" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-gray-200"><CardContent className="p-4"><div className="text-center"><p className="text-2xl text-black">{diretasAdmin.length}</p><p className="text-sm text-gray-600">Total de Contratos</p></div></CardContent></Card>
                <Card className="border border-gray-200"><CardContent className="p-4"><div className="text-center"><p className="text-2xl text-green-600">{diretasAdmin.filter((p) => p.statusContrato === "Ativo").length}</p><p className="text-sm text-gray-600">Ativos</p></div></CardContent></Card>
                <Card className="border border-gray-200"><CardContent className="p-4"><div className="text-center"><p className="text-2xl text-yellow-600">{diretasAdmin.filter((p) => p.statusContrato === "Próximo ao Vencimento").length}</p><p className="text-sm text-gray-600">Próximo ao Vencimento</p></div></CardContent></Card>
                <Card className="border border-gray-200"><CardContent className="p-4"><div className="text-center"><p className="text-2xl text-red-600">{diretasAdmin.filter((p) => p.statusContrato === "Vencido").length}</p><p className="text-sm text-gray-600">Vencidos</p></div></CardContent></Card>
              </div>

              <Card className="border border-gray-200">
                <CardHeader className="pt-3 pb-1"><CardTitle className="text-xl text-black px-[0px] py-[8px]">Contratações Diretas</CardTitle></CardHeader>
                <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px] space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1"><div className="relative"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><Input placeholder="Buscar por número, requisitante ou empresa..." value={searchTermConsolidado} onChange={(e) => setSearchTermConsolidado(e.target.value)} className="pl-10" /></div></div>
                    <div className="w-full md:w-56"><Select value={statusFilterConsolidado} onValueChange={setStatusFilterConsolidado}><SelectTrigger><SelectValue placeholder="Status do Contrato" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Status</SelectItem><SelectItem value="Ativo">Ativo</SelectItem><SelectItem value="Próximo ao Vencimento">Próximo ao Vencimento</SelectItem><SelectItem value="Vencido">Vencido</SelectItem></SelectContent></Select></div>
                  </div>
                  <div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader><TableRow><SortableTableHead label="Número do Processo" onClick={() => sortDiretas("numeroProcesso")} currentDirection={configDiretas.key === "numeroProcesso" ? configDiretas.direction : null} className="sticky left-0 z-10 min-w-[170px] bg-white" /><SortableTableHead label="Requisitante" onClick={() => sortDiretas("requisitante")} currentDirection={configDiretas.key === "requisitante" ? configDiretas.direction : null} className="min-w-[220px]" /><SortableTableHead label="Objeto" onClick={() => sortDiretas("objeto")} currentDirection={configDiretas.key === "objeto" ? configDiretas.direction : null} className="min-w-[320px]" /><TableHead className="min-w-[200px]">Tipo/Modalidade</TableHead><SortableTableHead label="Status" onClick={() => sortDiretas("status")} currentDirection={configDiretas.key === "status" ? configDiretas.direction : null} className="min-w-[140px]" /><TableHead className="min-w-[160px]">Responsável</TableHead><TableHead className="min-w-[140px]">Data Recebimento</TableHead><TableHead className="min-w-[140px]">Data Finalização</TableHead><SortableTableHead label="Empresa Vencedora" onClick={() => sortDiretas("empresaVencedora")} currentDirection={configDiretas.key === "empresaVencedora" ? configDiretas.direction : null} className="min-w-[220px]" /><TableHead className="min-w-[140px]">Data da Entrega</TableHead><SortableTableHead label="Valor" onClick={() => sortDiretas("valor")} currentDirection={configDiretas.key === "valor" ? configDiretas.direction : null} className="min-w-[140px]" /><TableHead className="min-w-[140px]">Ações</TableHead></TableRow></TableHeader>
                      <TableBody>{sortedDiretas.map((processo) => (<TableRow key={processo.numeroProcesso}><TableCell className="text-black sticky left-0 z-10 bg-white">{processo.numeroProcesso}</TableCell><TableCell className="text-gray-600">{processo.requisitante}</TableCell><TableCell className="text-gray-600">{processo.objeto}</TableCell><TableCell className="text-gray-600">{processo.tipo}</TableCell><TableCell><BadgeStatus {...getBadgeMappingForStatus(processo.status)}>{processo.status}</BadgeStatus></TableCell><TableCell className="text-gray-600">{processo.responsavel}</TableCell><TableCell className="text-gray-600">{processo.dataRecebimento}</TableCell><TableCell className="text-gray-600">{processo.dataFinalizacao}</TableCell><TableCell className="text-black">{processo.empresaVencedora ?? "-"}</TableCell><TableCell className="text-gray-600">{processo.dataEntrega ?? "-"}</TableCell><TableCell className="text-black">{processo.valor}</TableCell><TableCell><div className="flex items-center gap-2"><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleVerDetalhes("consolidado", processo)}><Info size={16} className="text-gray-600" /></Button><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedConsolidado(processo); setIsEditConsolidadoModalOpen(true); }}><Edit size={16} className="text-gray-600" /></Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical size={16} className="text-gray-600" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => { setSelectedConsolidado(processo); setIsAditivoModalOpen(true); }}><FileText size={16} className="mr-2" />Registrar Aditivo</DropdownMenuItem><DropdownMenuItem onClick={() => { setSelectedConsolidado(processo); setIsProrrogacaoModalOpen(true); }}><Calendar size={16} className="mr-2" />Prorrogar Contrato</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></TableCell></TableRow>))}</TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-black">{diretasComprador.length}</p><p className="text-xs leading-4 text-[#4a5565]">Total</p></div></CardContent></Card>
                <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-[#22c55e]">{diretasComprador.filter((p) => p.statusContrato === "Ativo").length}</p><p className="text-xs leading-4 text-[#4a5565]">Ativos</p></div></CardContent></Card>
                <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-[#155dfc]">{diretasComprador.filter((p) => p.statusContrato === "Em Renovação").length}</p><p className="text-xs leading-4 text-[#4a5565]">Em Renovação</p></div></CardContent></Card>
                <Card className="border border-gray-200"><CardContent className="flex flex-col items-center justify-center h-full py-6"><div className="flex flex-col gap-1 items-center justify-center text-center"><p className="text-2xl leading-8 text-[#e7000b]">{diretasComprador.filter((p) => p.statusContrato === "Vencido").length}</p><p className="text-xs leading-4 text-[#4a5565]">Vencidos</p></div></CardContent></Card>
              </div>
              <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex flex-col md:flex-row gap-4"><div className="flex-1"><div className="relative"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><Input placeholder="Buscar por ID ou empresa..." value={searchTermConsolidado} onChange={(e) => setSearchTermConsolidado(e.target.value)} className="pl-10" /></div></div><div className="w-full md:w-48"><Select value={statusFilterConsolidado} onValueChange={setStatusFilterConsolidado}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Status</SelectItem><SelectItem value="Ativo">Ativo</SelectItem><SelectItem value="Em Renovação">Em Renovação</SelectItem><SelectItem value="Vencido">Vencido</SelectItem></SelectContent></Select></div><div className="flex gap-1 border border-gray-200 rounded-lg p-1"><Button variant={viewModeConsolidado === "table" ? "default" : "ghost"} size="sm" onClick={() => setViewModeConsolidado("table")} className={viewModeConsolidado === "table" ? "bg-[#003366] hover:bg-[#002244] text-white" : ""}><List size={16} className="mr-2" />Tabela</Button><Button variant={viewModeConsolidado === "kanban" ? "default" : "ghost"} size="sm" onClick={() => setViewModeConsolidado("kanban")} className={viewModeConsolidado === "kanban" ? "bg-[#003366] hover:bg-[#002244] text-white" : ""}><LayoutGrid size={16} className="mr-2" />Kanban</Button></div></div></CardContent></Card>
              {viewModeConsolidado === "table" ? (
                <Card className="border border-gray-200"><CardHeader className="pt-3 pb-1"><CardTitle className="text-xl text-black px-[0px] py-[8px]">Contratações Diretas</CardTitle></CardHeader><CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]"><div className="w-full overflow-x-auto"><Table><TableHeader><TableRow><SortableTableHead label="Número do Processo" onClick={() => sortDiretas("numeroProcesso")} currentDirection={configDiretas.key === "numeroProcesso" ? configDiretas.direction : null} className="sticky left-0 z-10 min-w-[180px] bg-white" /><SortableTableHead label="Empresa" onClick={() => sortDiretas("empresaVencedora")} currentDirection={configDiretas.key === "empresaVencedora" ? configDiretas.direction : null} className="min-w-[220px]" /><SortableTableHead label="Valor" onClick={() => sortDiretas("valor")} currentDirection={configDiretas.key === "valor" ? configDiretas.direction : null} className="min-w-[140px]" /><TableHead className="min-w-[160px]">Fim Vigência</TableHead><SortableTableHead label="Status" onClick={() => sortDiretas("statusContrato")} currentDirection={configDiretas.key === "statusContrato" ? configDiretas.direction : null} className="min-w-[160px]" /><TableHead className="min-w-[140px]">Ações</TableHead></TableRow></TableHeader><TableBody>{sortedDiretas.map((processo) => (<TableRow key={processo.numeroProcesso}><TableCell className="text-black sticky left-0 z-10 bg-white">{processo.numeroProcesso}</TableCell><TableCell className="text-black">{processo.empresaVencedora}</TableCell><TableCell className="text-black">{processo.valor}</TableCell><TableCell className="text-gray-600">{processo.dataFimVigencia}</TableCell><TableCell><BadgeStatus {...getBadgeMappingForStatus(processo.statusContrato === "Em Renovação" ? "Próximo ao Vencimento" : processo.statusContrato)}>{processo.statusContrato}</BadgeStatus></TableCell><TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical size={16} className="text-gray-600" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => { handleVerDetalhes("consolidado", processo); }}>Ver Detalhes</DropdownMenuItem><DropdownMenuItem onClick={() => { setSelectedConsolidado(processo); setIsEditConsolidadoModalOpen(true); }}>Editar</DropdownMenuItem><DropdownMenuItem onClick={() => { setSelectedConsolidado(processo); setIsAditivoModalOpen(true); }}>Registrar Aditivo</DropdownMenuItem><DropdownMenuItem onClick={() => { setSelectedConsolidado(processo); setIsProrrogacaoModalOpen(true); }}>Prorrogar Contrato</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>))}</TableBody></Table></div></CardContent></Card>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4">{statusKanbanConsolidado.map((status) => {const processosPorStatus = diretasComprador.filter((processo) => processo.statusContrato === status);const config = kanbanConsolidadoColumnConfig[status];return (<div key={status} className="flex-1 min-w-[280px]" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {e.preventDefault();const processoData = e.dataTransfer.getData("processo-consolidado");if (!processoData) return;try {const draggedProcesso = JSON.parse(processoData) as ProcessoConsolidado;const draggedStatus = normalizeStatusContratoComprador(draggedProcesso.statusContrato);if (draggedStatus !== status) {handleStatusConsolidadoChange(draggedProcesso.numeroProcesso, status);}} catch {toast.error("Falha ao mover card");}}}><Card className={`border-2 ${config.borderColor} h-full ${config.bgColor}`}><CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className={`text-base ${config.color}`}>{config.displayName}</CardTitle><span className={`text-sm ${config.color} bg-white px-2 py-1 rounded border ${config.borderColor}`}>{processosPorStatus.length}</span></div></CardHeader><CardContent className="space-y-3 min-h-[360px] max-h-[calc(100vh-400px)] overflow-y-auto">{processosPorStatus.length === 0 ? (<p className="text-gray-400 text-center text-sm py-8">Nenhum contrato neste status</p>) : (processosPorStatus.map((processo) => (<div key={processo.numeroProcesso} className="cursor-grab active:cursor-grabbing" onDragStart={(e) => {e.dataTransfer.setData("processo-consolidado", JSON.stringify(processo));e.currentTarget.style.opacity = "0.5";}} onDragEnd={(e) => {e.currentTarget.style.opacity = "1";}} draggable><Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow"><CardContent className="p-4"><div className="space-y-3"><div className="flex items-start justify-between gap-2"><p className="font-medium text-black flex-1">{processo.empresaVencedora}</p><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-6 w-6 p-0"><MoreVertical size={14} className="text-gray-600" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => {handleVerDetalhes("consolidado", processo);}}>Ver Detalhes</DropdownMenuItem><DropdownMenuItem onClick={() => {setSelectedConsolidado(processo);setIsEditConsolidadoModalOpen(true);}}>Editar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div><div className="space-y-2 text-sm"><div><span className="text-gray-500">Número do Processo: </span><span className="text-gray-700">{processo.numeroProcesso}</span></div><div><span className="text-gray-500">Valor: </span><span className="text-gray-700">{processo.valor}</span></div><div><span className="text-gray-500">Fim Vigência: </span><span className="text-gray-700">{processo.dataFimVigencia}</span></div></div><div><BadgeStatus {...getBadgeMappingForStatus(processo.statusContrato === "Em Renovação" ? "Próximo ao Vencimento" : processo.statusContrato)}>{processo.statusContrato}</BadgeStatus></div></div></CardContent></Card></div>)))}</CardContent></Card></div>);})}</div>
              )}
            </>
          )}
        </TabsContent>
        )}

        {perfil === "admin" && (
        <TabsContent value="licitacoes" className="space-y-6 mt-6">
          <Card className="border border-gray-200"><CardHeader className="pt-3 pb-1"><CardTitle className="text-xl text-black px-[0px] py-[8px]">Licitações Homologadas</CardTitle></CardHeader><CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px] space-y-4"><div className="flex flex-col md:flex-row gap-4"><div className="flex-1"><div className="relative"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><Input placeholder="Buscar por número, requisitante ou empresa..." value={searchTermConsolidado} onChange={(e) => setSearchTermConsolidado(e.target.value)} className="pl-10" /></div></div><div className="w-full md:w-56"><Select value={statusFilterConsolidado} onValueChange={setStatusFilterConsolidado}><SelectTrigger><SelectValue placeholder="Status do Contrato" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Status</SelectItem>{perfil === "admin" ? <SelectItem value="Próximo ao Vencimento">Próximo ao Vencimento</SelectItem> : <SelectItem value="Em Renovação">Em Renovação</SelectItem>}<SelectItem value="Ativo">Ativo</SelectItem><SelectItem value="Vencido">Vencido</SelectItem></SelectContent></Select></div></div><div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto border rounded-lg"><Table><TableHeader><TableRow><SortableTableHead label="Número do Processo" onClick={() => sortLicitacoes("numeroProcesso")} currentDirection={configLicitacoes.key === "numeroProcesso" ? configLicitacoes.direction : null} className="sticky left-0 z-10 min-w-[170px] bg-white" /><SortableTableHead label="Requisitante" onClick={() => sortLicitacoes("requisitante")} currentDirection={configLicitacoes.key === "requisitante" ? configLicitacoes.direction : null} className="min-w-[220px]" /><SortableTableHead label="Objeto" onClick={() => sortLicitacoes("objeto")} currentDirection={configLicitacoes.key === "objeto" ? configLicitacoes.direction : null} className="min-w-[320px]" /><TableHead className="min-w-[240px]">Tipo/Modalidade</TableHead><SortableTableHead label="Status" onClick={() => sortLicitacoes("status")} currentDirection={configLicitacoes.key === "status" ? configLicitacoes.direction : null} className="min-w-[140px]" /><TableHead className="min-w-[160px]">Responsável</TableHead><TableHead className="min-w-[140px]">Data Recebimento</TableHead><TableHead className="min-w-[140px]">Data Finalização</TableHead><TableHead className="min-w-[150px]">Data Homologação</TableHead><TableHead className="min-w-[150px]">Tempo Total (Dias)</TableHead><SortableTableHead label="Valor" onClick={() => sortLicitacoes("valor")} currentDirection={configLicitacoes.key === "valor" ? configLicitacoes.direction : null} className="min-w-[140px]" /><TableHead className="min-w-[140px]">Ações</TableHead></TableRow></TableHeader><TableBody>{sortedLicitacoes.map((processo) => (<TableRow key={processo.numeroProcesso}><TableCell className="text-black sticky left-0 z-10 bg-white">{processo.numeroProcesso}</TableCell><TableCell className="text-gray-600">{processo.requisitante}</TableCell><TableCell className="text-gray-600">{processo.objeto}</TableCell><TableCell className="text-gray-600">{processo.tipo}</TableCell><TableCell><BadgeStatus {...getBadgeMappingForStatus(processo.status)}>{processo.status}</BadgeStatus></TableCell><TableCell className="text-gray-600">{processo.responsavel}</TableCell><TableCell className="text-gray-600">{processo.dataRecebimento}</TableCell><TableCell className="text-gray-600">{processo.dataFinalizacao}</TableCell><TableCell className="text-gray-600">{processo.dataHomologacao ?? "-"}</TableCell><TableCell className="text-gray-600">{processo.tempoTotalDias ?? "-"}</TableCell><TableCell className="text-black">{processo.valor}</TableCell><TableCell><div className="flex items-center gap-2"><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleVerDetalhes("consolidado", processo)}><Info size={16} className="text-gray-600" /></Button><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedConsolidado(processo); setIsEditConsolidadoModalOpen(true); }}><Edit size={16} className="text-gray-600" /></Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical size={16} className="text-gray-600" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => { setSelectedConsolidado(processo); setIsAditivoModalOpen(true); }}><FileText size={16} className="mr-2" />Registrar Aditivo</DropdownMenuItem><DropdownMenuItem onClick={() => { setSelectedConsolidado(processo); setIsProrrogacaoModalOpen(true); }}><Calendar size={16} className="mr-2" />Prorrogar Contrato</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></TableCell></TableRow>))}</TableBody></Table></div></CardContent></Card>
        </TabsContent>
        )}

        {perfil === "admin" && (
          <TabsContent value="trp" className="space-y-6 mt-6">
            <Card className="border border-gray-200"><CardHeader className="pt-3 pb-1"><CardTitle className="text-xl text-black px-[0px] py-[8px]">TRP</CardTitle></CardHeader><CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px] space-y-4"><div className="flex flex-col md:flex-row gap-4"><div className="flex-1"><div className="relative"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><Input placeholder="Buscar por empresa, CNPJ ou número..." value={searchTermTRP} onChange={(e) => setSearchTermTRP(e.target.value)} className="pl-10" /></div></div><div className="w-full md:w-48"><Select value={filterTRP} onValueChange={setFilterTRP}><SelectTrigger><SelectValue placeholder="Filtrar Aditivos" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="com-aditivos">Com Aditivos</SelectItem><SelectItem value="sem-aditivos">Sem Aditivos</SelectItem></SelectContent></Select></div></div><div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto border rounded-lg"><Table><TableHeader><TableRow><SortableTableHead label="Empresa Vencedora" onClick={() => sortTRP("empresaVencedora")} currentDirection={configTRP.key === "empresaVencedora" ? configTRP.direction : null} className="min-w-[220px]" /><TableHead className="min-w-[180px]">CNPJ</TableHead><SortableTableHead label="Número do Processo" onClick={() => sortTRP("numeroProcesso")} currentDirection={configTRP.key === "numeroProcesso" ? configTRP.direction : null} className="min-w-[160px]" /><SortableTableHead label="Valor Contratado" onClick={() => sortTRP("valorContratado")} currentDirection={configTRP.key === "valorContratado" ? configTRP.direction : null} className="min-w-[140px]" /><TableHead className="min-w-[120px]">Vigência</TableHead><TableHead className="min-w-[100px]">Aditivos</TableHead><TableHead className="min-w-[100px]">Ações</TableHead></TableRow></TableHeader><TableBody>{sortedTRP.map((trp) => (<TableRow key={trp.numeroProcesso}><TableCell className="text-black">{trp.empresaVencedora}</TableCell><TableCell className="text-gray-600">{trp.cnpj}</TableCell><TableCell className="text-black">{trp.numeroProcesso}</TableCell><TableCell className="text-black">{trp.valorContratado}</TableCell><TableCell className="text-gray-600">{trp.vigencia}</TableCell><TableCell className="text-gray-600">{trp.aditivos}</TableCell><TableCell><div className="flex items-center gap-2"><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleVerDetalhes("consolidado", trp)}><Info size={16} className="text-gray-600" /></Button><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedTRP(trp); setIsEditTRPModalOpen(true); }}><Edit size={16} className="text-gray-600" /></Button></div></TableCell></TableRow>))}</TableBody></Table></div></CardContent></Card>
          </TabsContent>
        )}

        {perfil === "admin" && (
          <TabsContent value="contratos" className="space-y-6 mt-6">
            <Card className="border border-gray-200"><CardHeader className="pt-3 pb-1"><CardTitle className="text-xl text-black px-[0px] py-[8px]">Contratos</CardTitle></CardHeader><CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px] space-y-4"><div className="flex flex-col md:flex-row gap-4"><div className="flex-1"><div className="relative"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><Input placeholder="Buscar por empresa, CNPJ ou número..." value={searchTermContratos} onChange={(e) => setSearchTermContratos(e.target.value)} className="pl-10" /></div></div><div className="w-full md:w-48"><Select value={filterContratos} onValueChange={setFilterContratos}><SelectTrigger><SelectValue placeholder="Filtrar Aditivos" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="com-aditivos">Com Aditivos</SelectItem><SelectItem value="sem-aditivos">Sem Aditivos</SelectItem></SelectContent></Select></div></div><div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto border rounded-lg"><Table><TableHeader><TableRow><SortableTableHead label="Empresa Vencedora" onClick={() => sortContratos("empresaVencedora")} currentDirection={configContratos.key === "empresaVencedora" ? configContratos.direction : null} className="min-w-[220px]" /><TableHead className="min-w-[180px]">CNPJ</TableHead><SortableTableHead label="Número do Processo" onClick={() => sortContratos("numeroProcesso")} currentDirection={configContratos.key === "numeroProcesso" ? configContratos.direction : null} className="min-w-[160px]" /><SortableTableHead label="Valor Contratado" onClick={() => sortContratos("valorContratado")} currentDirection={configContratos.key === "valorContratado" ? configContratos.direction : null} className="min-w-[140px]" /><TableHead className="min-w-[120px]">Vigência</TableHead><TableHead className="min-w-[100px]">Aditivos</TableHead><TableHead className="min-w-[100px]">Ações</TableHead></TableRow></TableHeader><TableBody>{sortedContratos.map((contrato) => (<TableRow key={contrato.numeroProcesso}><TableCell className="text-black">{contrato.empresaVencedora}</TableCell><TableCell className="text-gray-600">{contrato.cnpj}</TableCell><TableCell className="text-black">{contrato.numeroProcesso}</TableCell><TableCell className="text-black">{contrato.valorContratado}</TableCell><TableCell className="text-gray-600">{contrato.vigencia}</TableCell><TableCell className="text-gray-600">{contrato.aditivos}</TableCell><TableCell><div className="flex items-center gap-2"><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleVerDetalhes("consolidado", contrato)}><Info size={16} className="text-gray-600" /></Button><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedContrato(contrato); setIsEditContratoModalOpen(true); }}><Edit size={16} className="text-gray-600" /></Button></div></TableCell></TableRow>))}</TableBody></Table></div></CardContent></Card>
          </TabsContent>
        )}
      </Tabs>

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
                  <Input id="edit-consolidado-id" defaultValue={selectedConsolidado?.numeroProcesso} disabled />
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
                  <Input id="edit-trp-numero" defaultValue={selectedTRP?.numeroProcesso} disabled />
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
                  <Input id="edit-contrato-numero" defaultValue={selectedContrato?.numeroProcesso} disabled />
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
                  <Input id="aditivo-numero" placeholder="001/2024" />
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
                  <Input id="prorrogacao-numero" placeholder="001/2024" />
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
