"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTableSort } from "@/hooks/useTableSort";
import {
  createFornecedor,
  deleteAtestado,
  getAtestadoUrl,
  getAtestados,
  getFornecedores,
  updateFornecedorStatus,
  uploadAtestado,
} from "@/services/fornecedoresService";
import { getDesistencias, getPenalidades, type Desistencia, type Penalidade as PenalidadeFornecedor } from "@/services/penalidadesService";
import type {
  AtestadoFornecedor,
  Fornecedor,
} from "@/types";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileInput } from "@/components/ui/file-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type FornecedorStatus = Fornecedor["status"];
type AtestadoStatus = AtestadoFornecedor["status"];

type FornecedorListItem = Fornecedor & {
  atestados_count: number;
};

type AtestadoListItem = AtestadoFornecedor & {
  fornecedor_nome: string;
  signed_url?: string;
};

type RiscoFornecedorItem = {
  fornecedorId: string;
  razaoSocial: string;
  totalPenalidades: number;
  penalidadesAtivas: number;
  totalDesistencias: number;
  ultimaOcorrencia: string;
};

type CadastroFornecedorFormData = {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  categoria: string;
  telefone: string;
  email: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  contatoNome: string;
  contatoCargo: string;
  contatoTelefone: string;
  contatoEmail: string;
  observacoes: string;
};

const initialCadastroFornecedorFormData: CadastroFornecedorFormData = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  inscricaoEstadual: "",
  categoria: "",
  telefone: "",
  email: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  contatoNome: "",
  contatoCargo: "",
  contatoTelefone: "",
  contatoEmail: "",
  observacoes: "",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("pt-BR");
}

const StatusBadge = ({ status }: { status: FornecedorStatus | AtestadoStatus }) => {
  const mappings = {
    Ativo: { intent: "success" as const, weight: "light" as const },
    Inativo: { intent: "neutral" as const, weight: "light" as const },
    Válido: { intent: "success" as const, weight: "light" as const },
    Vencido: { intent: "danger" as const, weight: "light" as const },
  };

  const mapping = mappings[status] || { intent: "neutral" as const, weight: "light" as const };

  return <BadgeNew {...mapping}>{status}</BadgeNew>;
};

interface ContratosEFornecedoresProps {
  refreshToken: number;
  onCadastrarNovo: () => void;
}

function ContratosEFornecedores({ refreshToken, onCadastrarNovo }: ContratosEFornecedoresProps) {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categoriaFilter, setCategoriaFilter] = useState("todas");
  const [selectedAtestado, setSelectedAtestado] = useState<AtestadoListItem | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("fornecedores");
  const [currentPage, setCurrentPage] = useState(1);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [atestados, setAtestados] = useState<AtestadoListItem[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFornecedorId, setUploadFornecedorId] = useState("");
  const [uploadValidade, setUploadValidade] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [penalidades, setPenalidades] = useState<PenalidadeFornecedor[]>([]);
  const [desistencias, setDesistencias] = useState<Desistencia[]>([]);
  const [selectedRiskFornecedorId, setSelectedRiskFornecedorId] = useState("");

  const itemsPerPage = 10;

  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    type: "desativar" | "ativar" | null;
    fornecedor: Fornecedor | null;
  }>({ open: false, type: null, fornecedor: null });
  const [confirmDeleteAtestado, setConfirmDeleteAtestado] = useState<{
    open: boolean;
    atestado: AtestadoListItem | null;
  }>({ open: false, atestado: null });

  const loadFornecedores = async () => {
    try {
      const data = await getFornecedores();
      setFornecedores(data);
    } catch (error) {
      toast.error("Erro ao carregar fornecedores", {
        description: error instanceof Error ? error.message : "Nao foi possivel buscar os fornecedores.",
      });
    }
  };

  const loadRiscos = async () => {
    try {
      const [penalidadesData, desistenciasData] = await Promise.all([getPenalidades(), getDesistencias()]);
      setPenalidades(penalidadesData);
      setDesistencias(desistenciasData);
    } catch (error) {
      toast.error("Erro ao carregar histórico de riscos", {
        description: error instanceof Error ? error.message : "Nao foi possivel buscar riscos do fornecedor.",
      });
    }
  };

  const loadAtestados = async (fornecedoresBase: Fornecedor[]) => {
    if (fornecedoresBase.length === 0) {
      setAtestados([]);
      return;
    }

    try {
      const atestadosPorFornecedor = await Promise.all(
        fornecedoresBase.map(async (fornecedor) => {
          const fornecedorAtestados = await getAtestados(fornecedor.id);
          return fornecedorAtestados.map((atestado) => ({
            ...atestado,
            fornecedor_nome: fornecedor.razao_social,
          }));
        })
      );

      setAtestados(atestadosPorFornecedor.flat());
    } catch (error) {
      toast.error("Erro ao carregar atestados", {
        description: error instanceof Error ? error.message : "Nao foi possivel buscar os atestados.",
      });
    }
  };

  useEffect(() => {
    void loadFornecedores();
  }, [refreshToken]);

  useEffect(() => {
    void loadRiscos();
  }, [refreshToken]);

  useEffect(() => {
    void loadAtestados(fornecedores);
  }, [fornecedores]);

  const fornecedoresComAtestados = useMemo<FornecedorListItem[]>(() => {
    const atestadosCountMap = atestados.reduce<Record<string, number>>((acc, atestado) => {
      acc[atestado.fornecedor_id] = (acc[atestado.fornecedor_id] ?? 0) + 1;
      return acc;
    }, {});

    return fornecedores.map((fornecedor) => ({
      ...fornecedor,
      atestados_count: atestadosCountMap[fornecedor.id] ?? 0,
    }));
  }, [atestados, fornecedores]);

  useEffect(() => {
    if (!selectedRiskFornecedorId && fornecedores.length > 0) {
      setSelectedRiskFornecedorId(fornecedores[0].id);
    }
  }, [fornecedores, selectedRiskFornecedorId]);

  const riscosFornecedores = useMemo<RiscoFornecedorItem[]>(() => {
    return fornecedores.map((fornecedor) => {
      const penalidadesFornecedor = penalidades.filter((item) => item.fornecedor_id === fornecedor.id);
      const desistenciasFornecedor = desistencias.filter((item) => item.fornecedor_id === fornecedor.id);
      const datas = [
        ...penalidadesFornecedor.map((item) => item.data_ocorrencia),
        ...desistenciasFornecedor.map((item) => item.criado_em),
      ].filter(Boolean);

      return {
        fornecedorId: fornecedor.id,
        razaoSocial: fornecedor.razao_social,
        totalPenalidades: penalidadesFornecedor.filter((item) => item.status === "Aplicada").length,
        penalidadesAtivas: penalidadesFornecedor.filter((item) => ["Registrada", "Aplicada", "Contestada"].includes(item.status)).length,
        totalDesistencias: desistenciasFornecedor.length,
        ultimaOcorrencia: datas.length > 0 ? formatDate(datas.sort().reverse()[0]) : "-",
      };
    });
  }, [desistencias, fornecedores, penalidades]);

  const riscoSelecionado = useMemo(() => riscosFornecedores.find((item) => item.fornecedorId === selectedRiskFornecedorId) || null, [riscosFornecedores, selectedRiskFornecedorId]);

  const historicoRiscosFornecedor = useMemo(() => {
    if (!selectedRiskFornecedorId) return [] as Array<{ tipo: string; descricao: string; data: string; status: string }>;

    const penalidadesFornecedor = penalidades
      .filter((item) => item.fornecedor_id === selectedRiskFornecedorId)
      .map((item) => ({
        tipo: "Penalidade",
        descricao: item.tipo_penalidade,
        data: formatDate(item.data_ocorrencia),
        status: item.status,
      }));

    const desistenciasFornecedor = desistencias
      .filter((item) => item.fornecedor_id === selectedRiskFornecedorId)
      .map((item) => ({
        tipo: "Desistência",
        descricao: item.motivo,
        data: formatDate(item.criado_em),
        status: item.status,
      }));

    return [...penalidadesFornecedor, ...desistenciasFornecedor];
  }, [desistencias, penalidades, selectedRiskFornecedorId]);

  const filteredFornecedores = fornecedoresComAtestados.filter((fornecedor) => {
    const matchesSearch =
      fornecedor.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fornecedor.cnpj.includes(searchTerm);
    const matchesStatus = statusFilter === "todos" || fornecedor.status.toLowerCase() === statusFilter;
    const matchesCategoria = categoriaFilter === "todas" || fornecedor.categoria === categoriaFilter;
    return matchesSearch && matchesStatus && matchesCategoria;
  });

  const { items: sortedFornecedores, requestSort: sortFornecedores, sortConfig: configFornecedores } =
    useTableSort(filteredFornecedores);
  const { items: sortedAtestados, requestSort: sortAtestados, sortConfig: configAtestados } = useTableSort(atestados);

  const totalPages = Math.ceil(sortedFornecedores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFornecedores = sortedFornecedores.slice(startIndex, endIndex);

  const fornecedorStats = {
    total: fornecedores.length,
    ativos: fornecedores.filter((fornecedor) => fornecedor.status === "Ativo").length,
    inativos: fornecedores.filter((fornecedor) => fornecedor.status === "Inativo").length,
    atestadosValidos: atestados.filter((atestado) => atestado.status === "Válido").length,
  };

  const handleViewAtestado = async (atestado: AtestadoListItem) => {
    const loadingToastId = toast.loading("Carregando visualizacao...");

    try {
      const signedUrl = await getAtestadoUrl(atestado.storage_path);
      setSelectedAtestado({ ...atestado, signed_url: signedUrl });
      setIsViewerOpen(true);
      toast.success("Documento carregado", { id: loadingToastId });
    } catch (error) {
      toast.error("Erro ao abrir atestado", {
        id: loadingToastId,
        description: error instanceof Error ? error.message : "Nao foi possivel abrir o documento.",
      });
    }
  };

  const handleDownloadAtestado = async (atestado: AtestadoListItem) => {
    const loadingToastId = toast.loading("Carregando documento...");

    try {
      const url = await getAtestadoUrl(atestado.storage_path);
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success("Download iniciado", { id: loadingToastId });
    } catch (error) {
      toast.error("Erro ao baixar atestado", {
        id: loadingToastId,
        description: error instanceof Error ? error.message : "Nao foi possivel gerar o link do documento.",
      });
    }
  };

  const openDeleteAtestadoDialog = (atestado: AtestadoListItem) => {
    setConfirmDeleteAtestado({ open: true, atestado });
  };

  const closeDeleteAtestadoDialog = () => {
    setConfirmDeleteAtestado({ open: false, atestado: null });
  };

  const handleDeleteAtestado = async () => {
    const atestado = confirmDeleteAtestado.atestado;

    if (!atestado) return;

    const loadingToastId = toast.loading("Excluindo atestado...");

    try {
      await deleteAtestado(atestado.id, atestado.storage_path);
      setAtestados((prev) => prev.filter((item) => item.id !== atestado.id));
      if (selectedAtestado?.id === atestado.id) {
        setSelectedAtestado(null);
        setIsViewerOpen(false);
      }
      toast.success("Atestado excluido com sucesso", { id: loadingToastId });
      closeDeleteAtestadoDialog();
    } catch (error) {
      toast.error("Erro ao excluir atestado", {
        id: loadingToastId,
        description: error instanceof Error ? error.message : "Nao foi possivel excluir o atestado.",
      });
    }
  };

  const openConfirmDialog = (type: "desativar" | "ativar", fornecedor: Fornecedor) => {
    setConfirmAction({ open: true, type, fornecedor });
  };

  const closeConfirmDialog = () => {
    setConfirmAction({ open: false, type: null, fornecedor: null });
  };

  const executeAction = async () => {
    if (!confirmAction.fornecedor || !confirmAction.type) return;

    const novoStatus: FornecedorStatus = confirmAction.type === "desativar" ? "Inativo" : "Ativo";
    const mensagem =
      confirmAction.type === "desativar"
        ? "Fornecedor desativado com sucesso. Ele nao podera mais participar de novos processos."
        : "Fornecedor ativado com sucesso. Ele pode participar de processos novamente.";

    const loadingToastId = toast.loading("Atualizando fornecedor...");

    try {
      await updateFornecedorStatus(confirmAction.fornecedor.id, novoStatus);
      await loadFornecedores();
      toast.success("Acao executada!", {
        id: loadingToastId,
        description: mensagem,
      });
      closeConfirmDialog();
    } catch (error) {
      toast.error("Erro ao atualizar fornecedor", {
        id: loadingToastId,
        description: error instanceof Error ? error.message : "Nao foi possivel atualizar o status.",
      });
    }
  };

  const handleUploadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!uploadFornecedorId || !uploadFile || !currentUser?.id) {
      toast.error("Dados incompletos para upload", {
        description: "Selecione um fornecedor, escolha um arquivo e confirme seu usuario autenticado.",
      });
      return;
    }

    const loadingToastId = toast.loading("Carregando atestado...");

    try {
      await uploadAtestado(uploadFornecedorId, uploadFile, uploadValidade || null, currentUser.id);
      await loadAtestados(fornecedores);
      setUploadFornecedorId("");
      setUploadValidade("");
      setUploadFile(null);
      setIsUploadDialogOpen(false);
      toast.success("Atestado enviado com sucesso", { id: loadingToastId });
    } catch (error) {
      toast.error("Erro no upload do atestado", {
        id: loadingToastId,
        description: error instanceof Error ? error.message : "Nao foi possivel concluir o upload.",
      });
    }
  };

  const getActionDescription = () => {
    if (!confirmAction.type || !confirmAction.fornecedor) return "";

    const descriptions = {
      desativar:
        "O fornecedor sera marcado como Inativo e nao podera mais participar de novos processos de compra. Seus atestados e historico serao preservados.",
      ativar:
        "O fornecedor sera marcado como Ativo e podera participar de processos de compra novamente. Certifique-se de que a documentacao esta atualizada.",
    };

    return descriptions[confirmAction.type];
  };

  const getActionTitle = () => {
    if (!confirmAction.type) return "";

    const titles = {
      desativar: "Confirmar Desativacao",
      ativar: "Confirmar Ativacao",
    };

    return titles[confirmAction.type];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Fornecedores e Atestados</h2>
          <p className="text-gray-600 mt-1">Cadastro, listagem e gestao de fornecedores e atestados</p>
        </div>
        {activeTab === "fornecedores" && (
          <Button className="bg-[#003366] hover:bg-[#002244] text-white" onClick={onCadastrarNovo}>
            <Plus size={20} className="mr-2" />
            Cadastrar Fornecedor
          </Button>
        )}
      </div>

      <Tabs defaultValue="fornecedores" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-3xl grid-cols-3">
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          <TabsTrigger value="atestados">Atestados de Capacidade Tecnica</TabsTrigger>
          <TabsTrigger value="riscos">Histórico de Riscos</TabsTrigger>
        </TabsList>

        <TabsContent value="fornecedores" className="space-y-4 mt-8">
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
                    <p className="text-sm text-gray-600">Atestados Validos</p>
                  </div>
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
                      placeholder="Buscar por nome ou CNPJ..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                  >
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
                  <Select
                    value={categoriaFilter}
                    onValueChange={(value) => {
                      setCategoriaFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Categorias</SelectItem>
                      {Array.from(new Set(fornecedores.map((fornecedor) => fornecedor.categoria).filter(Boolean))).map(
                        (categoria) => (
                          <SelectItem key={categoria} value={categoria ?? "-"}>
                            {categoria}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-black px-[0px] py-[8px]">Cadastro e Listagem de Fornecedores</CardTitle>
                <p className="text-sm text-gray-600">
                  Mostrando {filteredFornecedores.length === 0 ? 0 : startIndex + 1}-
                  {Math.min(endIndex, filteredFornecedores.length)} de {filteredFornecedores.length} fornecedores
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead
                        label="Nome/Razao Social"
                        onClick={() => sortFornecedores("razao_social")}
                        currentDirection={configFornecedores?.key === "razao_social" ? configFornecedores.direction : null}
                        className="sticky left-0 z-10 min-w-[250px] bg-white"
                      />
                      <SortableTableHead
                        label="CNPJ"
                        onClick={() => sortFornecedores("cnpj")}
                        currentDirection={configFornecedores?.key === "cnpj" ? configFornecedores.direction : null}
                        className="min-w-[160px]"
                      />
                      <SortableTableHead
                        label="Categoria"
                        onClick={() => sortFornecedores("categoria")}
                        currentDirection={configFornecedores?.key === "categoria" ? configFornecedores.direction : null}
                        className="min-w-[180px]"
                      />
                      <SortableTableHead
                        label="Status"
                        onClick={() => sortFornecedores("status")}
                        currentDirection={configFornecedores?.key === "status" ? configFornecedores.direction : null}
                        className="min-w-[180px]"
                      />
                      <SortableTableHead
                        label="Data Cadastro"
                        onClick={() => sortFornecedores("data_cadastro")}
                        currentDirection={configFornecedores?.key === "data_cadastro" ? configFornecedores.direction : null}
                        className="min-w-[140px]"
                      />
                      <SortableTableHead
                        label="Atestados"
                        onClick={() => sortFornecedores("atestados_count")}
                        currentDirection={configFornecedores?.key === "atestados_count" ? configFornecedores.direction : null}
                        className="min-w-[120px]"
                      />
                      <TableHead className="min-w-[160px]">Contato</TableHead>
                      <TableHead className="min-w-[150px] text-center">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFornecedores.length > 0 ? (
                      paginatedFornecedores.map((fornecedor) => (
                        <TableRow key={fornecedor.id}>
                          <TableCell className="text-black sticky left-0 z-10 bg-white">{fornecedor.razao_social}</TableCell>
                          <TableCell className="text-gray-600">{fornecedor.cnpj}</TableCell>
                          <TableCell className="text-gray-600">{fornecedor.categoria ?? "-"}</TableCell>
                          <TableCell>
                            <StatusBadge status={fornecedor.status} />
                          </TableCell>
                          <TableCell className="text-gray-600">{formatDate(fornecedor.data_cadastro)}</TableCell>
                          <TableCell className="text-center">
                            <span className="text-blue-600">{fornecedor.atestados_count}</span>
                          </TableCell>
                          <TableCell className="text-gray-600">{fornecedor.email ?? "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              {fornecedor.status === "Ativo" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openConfirmDialog("desativar", fornecedor)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                  title="Desativar fornecedor"
                                >
                                  Desativar
                                </Button>
                              )}
                              {fornecedor.status === "Inativo" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openConfirmDialog("ativar", fornecedor)}
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

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">Pagina {currentPage} de {totalPages}</div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Proxima
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atestados" className="space-y-4 mt-8">
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl text-black">Upload de Atestados de Capacidade Tecnica</h3>
                  <p className="text-sm text-gray-600 mt-1">Consulta vinculada aos fornecedores cadastrados</p>
                </div>
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                      <Upload size={20} className="mr-2" />
                      Upload Atestado
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload de Atestado</DialogTitle>
                      <DialogDescription>Faca o upload do atestado de capacidade tecnica do fornecedor.</DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleUploadSubmit}>
                      <div className="space-y-1.5">
                        <Label htmlFor="fornecedor">Fornecedor</Label>
                        <Select value={uploadFornecedorId} onValueChange={setUploadFornecedorId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o fornecedor" />
                          </SelectTrigger>
                          <SelectContent>
                            {fornecedores
                              .filter((fornecedor) => fornecedor.status === "Ativo")
                              .map((fornecedor) => (
                                <SelectItem key={fornecedor.id} value={fornecedor.id}>
                                  {fornecedor.razao_social}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="validade">Validade</Label>
                        <Input id="validade" type="date" value={uploadValidade} onChange={(e) => setUploadValidade(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="arquivo">Arquivo do Atestado</Label>
                        <FileInput id="arquivo" accept=".pdf,.doc,.docx" onFileChange={setUploadFile} />
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setIsUploadDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" className="flex-1 bg-[#003366] hover:bg-[#002244] text-white">
                          Fazer Upload
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black px-[0px] py-[8px]">Atestados Cadastrados</CardTitle>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead
                        label="Fornecedor"
                        onClick={() => sortAtestados("fornecedor_nome")}
                        currentDirection={configAtestados?.key === "fornecedor_nome" ? configAtestados.direction : null}
                        className="sticky left-0 z-10 min-w-[200px] bg-white"
                      />
                      <SortableTableHead
                        label="Arquivo"
                        onClick={() => sortAtestados("nome_arquivo")}
                        currentDirection={configAtestados?.key === "nome_arquivo" ? configAtestados.direction : null}
                        className="min-w-[220px]"
                      />
                      <SortableTableHead
                        label="Criado em"
                        onClick={() => sortAtestados("criado_em")}
                        currentDirection={configAtestados?.key === "criado_em" ? configAtestados.direction : null}
                        className="min-w-[140px]"
                      />
                      <SortableTableHead
                        label="Validade"
                        onClick={() => sortAtestados("validade")}
                        currentDirection={configAtestados?.key === "validade" ? configAtestados.direction : null}
                        className="min-w-[140px]"
                      />
                      <SortableTableHead
                        label="Status"
                        onClick={() => sortAtestados("status")}
                        currentDirection={configAtestados?.key === "status" ? configAtestados.direction : null}
                        className="min-w-[120px]"
                      />
                      <TableHead className="min-w-[160px]">Enviado por</TableHead>
                      <TableHead className="min-w-[120px]">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAtestados.length > 0 ? (
                      sortedAtestados.map((atestado) => (
                        <TableRow key={atestado.id}>
                          <TableCell className="text-black sticky left-0 z-10 bg-white">{atestado.fornecedor_nome}</TableCell>
                          <TableCell className="text-gray-600">{atestado.nome_arquivo}</TableCell>
                          <TableCell className="text-gray-600">{formatDate(atestado.criado_em)}</TableCell>
                          <TableCell className="text-gray-600">{formatDate(atestado.validade)}</TableCell>
                          <TableCell>
                            <StatusBadge status={atestado.status} />
                          </TableCell>
                          <TableCell className="text-gray-600">{atestado.enviado_por ?? "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => void handleViewAtestado(atestado)}>
                                <Eye size={16} />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => void handleDownloadAtestado(atestado)}>
                                <Download size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openDeleteAtestadoDialog(atestado)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          Nenhum atestado encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="riscos" className="space-y-4 mt-8">
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-1">
                  <Label htmlFor="fornecedor-risco">Fornecedor</Label>
                  <Select value={selectedRiskFornecedorId} onValueChange={setSelectedRiskFornecedorId}>
                    <SelectTrigger id="fornecedor-risco">
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {fornecedores.map((fornecedor) => (
                        <SelectItem key={fornecedor.id} value={fornecedor.id}>{fornecedor.razao_social}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Card className="border border-gray-200"><CardContent className="p-4"><p className="text-2xl text-black">{riscoSelecionado?.totalPenalidades ?? 0}</p><p className="text-sm text-gray-600">Penalidades Aplicadas</p></CardContent></Card>
                <Card className="border border-gray-200"><CardContent className="p-4"><p className="text-2xl text-black">{riscoSelecionado?.totalDesistencias ?? 0}</p><p className="text-sm text-gray-600">Desistências Registradas</p></CardContent></Card>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-gray-200"><CardContent className="p-4"><p className="text-2xl text-[#e7000b]">{riscoSelecionado?.penalidadesAtivas ?? 0}</p><p className="text-sm text-gray-600">Penalidades Ativas</p></CardContent></Card>
            <Card className="border border-gray-200"><CardContent className="p-4"><p className="text-2xl text-black">{riscoSelecionado?.ultimaOcorrencia ?? "-"}</p><p className="text-sm text-gray-600">Última Ocorrência</p></CardContent></Card>
          </div>

          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black px-[0px] py-[8px]">Ocorrências do Fornecedor</CardTitle>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">Tipo</TableHead>
                      <TableHead className="min-w-[320px]">Descrição</TableHead>
                      <TableHead className="min-w-[140px]">Data</TableHead>
                      <TableHead className="min-w-[140px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historicoRiscosFornecedor.length > 0 ? (
                      historicoRiscosFornecedor.map((item, index) => (
                        <TableRow key={`${item.tipo}-${index}`}>
                          <TableCell className="text-black">{item.tipo}</TableCell>
                          <TableCell className="text-gray-600">{item.descricao}</TableCell>
                          <TableCell className="text-gray-600">{item.data}</TableCell>
                          <TableCell><StatusBadge status={item.status as FornecedorStatus | AtestadoStatus} /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">Nenhum risco registrado para este fornecedor.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Visualizacao de Atestado - {selectedAtestado?.nome_arquivo}</DialogTitle>
            <DialogDescription>
              Visualizador de documento do atestado de {selectedAtestado?.fornecedor_nome}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="text-xl text-black">Visualizacao de Atestado</h3>
                <p className="text-sm text-gray-600 mt-1 truncate">{selectedAtestado?.nome_arquivo}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => selectedAtestado && void handleDownloadAtestado(selectedAtestado)}
                className="flex-shrink-0"
              >
                <Download size={16} className="mr-2" />
                Baixar Documento
              </Button>
            </div>

            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 mb-1">Fornecedor</p>
                  <p className="text-sm text-black truncate">{selectedAtestado?.fornecedor_nome ?? "-"}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 mb-1">Criado em</p>
                  <p className="text-sm text-black">{formatDate(selectedAtestado?.criado_em)}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 mb-1">Enviado por</p>
                  <p className="text-sm text-black truncate">{selectedAtestado?.enviado_por ?? "-"}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 mb-1">Validade</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-black whitespace-nowrap">{formatDate(selectedAtestado?.validade)}</p>
                    {selectedAtestado?.status && <StatusBadge status={selectedAtestado.status} />}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 bg-white overflow-hidden">
              {selectedAtestado?.signed_url ? (
                <iframe
                  title={selectedAtestado.nome_arquivo}
                  src={selectedAtestado.signed_url}
                  className="w-full h-full rounded-lg border border-gray-200"
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <FileText size={64} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Pre-visualizacao indisponivel</p>
                    <p className="text-sm text-gray-500">{selectedAtestado?.nome_arquivo}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmAction.open} onOpenChange={closeConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getActionTitle()}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  <span className="text-black">Fornecedor:</span> {confirmAction.fornecedor?.razao_social}
                </p>
                <p className="text-gray-700">{getActionDescription()}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirmDialog}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void executeAction()} className="bg-[#003366] hover:bg-[#002244] text-white">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDeleteAtestado.open} onOpenChange={closeDeleteAtestadoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusao do atestado</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  <span className="text-black">Arquivo:</span> {confirmDeleteAtestado.atestado?.nome_arquivo}
                </p>
                <p>
                  <span className="text-black">Fornecedor:</span> {confirmDeleteAtestado.atestado?.fornecedor_nome}
                </p>
                <p className="text-gray-700">
                  Esta acao remove permanentemente o arquivo do Storage e o registro do banco de dados.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteAtestadoDialog}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteAtestado()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface CadastroFornecedorProps {
  onVoltar?: () => void;
  onSuccess?: () => void;
}

function CadastroFornecedor({ onVoltar, onSuccess }: CadastroFornecedorProps) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState(initialCadastroFornecedorFormData);

  const handleChange = (field: keyof CadastroFornecedorFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 14);

    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return numbers.replace(/(\d{2})(\d+)/, "$1.$2");
    if (numbers.length <= 8) return numbers.replace(/(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
    if (numbers.length <= 12) return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");

    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  const handleCNPJChange = (value: string) => {
    handleChange("cnpj", formatCNPJ(value));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.razaoSocial || !formData.cnpj || !formData.email || !formData.categoria) {
      toast.error("Campos obrigatorios nao preenchidos", {
        description: "Por favor, preencha todos os campos obrigatorios.",
      });
      return;
    }

    if (!currentUser?.id) {
      toast.error("Usuario nao autenticado", {
        description: "Faca login novamente para cadastrar fornecedores.",
      });
      return;
    }

    const enderecoCompleto = [
      formData.endereco,
      formData.numero,
      formData.complemento,
      formData.bairro,
    ]
      .filter(Boolean)
      .join(", ");

    const loadingToastId = toast.loading("Salvando fornecedor...");

    try {
      await createFornecedor({
        razao_social: formData.razaoSocial,
        cnpj: formData.cnpj,
        categoria: formData.categoria || null,
        email: formData.email || null,
        telefone: formData.telefone || formData.contatoTelefone || null,
        endereco: enderecoCompleto || null,
        cidade: formData.cidade || null,
        uf: formData.estado || null,
        cep: formData.cep || null,
        criado_por: currentUser.id,
        status: "Ativo",
      });

      toast.success("Fornecedor cadastrado com sucesso!", {
        id: loadingToastId,
        description: `${formData.razaoSocial} foi adicionado ao sistema.`,
      });

      setFormData(initialCadastroFornecedorFormData);
      onSuccess?.();
      onVoltar?.();
    } catch (error) {
      toast.error("Erro ao cadastrar fornecedor", {
        id: loadingToastId,
        description: error instanceof Error ? error.message : "Nao foi possivel cadastrar o fornecedor.",
      });
    }
  };

  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Fornecedores</span>
            <span className="text-gray-400">/</span>
            <span className="text-black">Novo Cadastro</span>
          </div>
          {onVoltar && (
            <Button onClick={onVoltar} variant="outline" className="border-gray-300 hover:bg-gray-50">
              <ArrowLeft className="mr-2" size={18} />
              Voltar
            </Button>
          )}
        </div>

        <div>
          <h1 className="text-black">Cadastro de Fornecedor</h1>
          <p className="text-gray-600 mt-1">Preencha os dados do fornecedor para cadastra-lo no sistema</p>
        </div>
      </div>

      <div className="px-8 py-6">
        <form onSubmit={handleSubmit}>
          <div className="max-w-4xl space-y-6">
            <Alert className="border-blue-200 bg-blue-50 flex items-center justify-start text-left gap-2 p-4">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <AlertDescription className="text-blue-800 text-sm m-0">
                <p className="inline-block">
                  Campos marcados com <span className="text-red-600 font-bold px-1">*</span> são obrigatórios.
                </p>
              </AlertDescription>
            </Alert>

            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                  <Building2 size={20} className="text-[#003366]" />
                  Dados da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="razaoSocial" className="text-sm text-gray-700 mb-2 block">
                      Razao Social <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="razaoSocial"
                      value={formData.razaoSocial}
                      onChange={(e) => handleChange("razaoSocial", e.target.value)}
                      placeholder="Digite a razao social"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="nomeFantasia" className="text-sm text-gray-700 mb-2 block">
                      Nome Fantasia
                    </Label>
                    <Input
                      id="nomeFantasia"
                      value={formData.nomeFantasia}
                      onChange={(e) => handleChange("nomeFantasia", e.target.value)}
                      placeholder="Digite o nome fantasia"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cnpj" className="text-sm text-gray-700 mb-2 block">
                      CNPJ <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => handleCNPJChange(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="inscricaoEstadual" className="text-sm text-gray-700 mb-2 block">
                      Inscricao Estadual
                    </Label>
                    <Input
                      id="inscricaoEstadual"
                      value={formData.inscricaoEstadual}
                      onChange={(e) => handleChange("inscricaoEstadual", e.target.value)}
                      placeholder="Digite a inscricao estadual"
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoria" className="text-sm text-gray-700 mb-2 block">
                      Categoria <span className="text-red-600">*</span>
                    </Label>
                    <Select value={formData.categoria} onValueChange={(value) => handleChange("categoria", value)}>
                      <SelectTrigger id="categoria">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="material-escritorio">Material de Escritorio</SelectItem>
                        <SelectItem value="informatica">Informatica</SelectItem>
                        <SelectItem value="limpeza">Limpeza</SelectItem>
                        <SelectItem value="construcao">Construcao</SelectItem>
                        <SelectItem value="servicos">Servicos</SelectItem>
                        <SelectItem value="mobiliario">Mobiliario</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="telefone" className="text-sm text-gray-700 mb-2 block">
                      Telefone
                    </Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleChange("telefone", e.target.value)}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm text-gray-700 mb-2 block">
                      E-mail <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="email@empresa.com.br"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-normal text-[16px] py-[8px]">Endereco</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="cep" className="text-sm text-gray-700 mb-2 block">
                      CEP
                    </Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleChange("cep", e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="endereco" className="text-sm text-gray-700 mb-2 block">
                      Endereco
                    </Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => handleChange("endereco", e.target.value)}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="numero" className="text-sm text-gray-700 mb-2 block">
                      Numero
                    </Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => handleChange("numero", e.target.value)}
                      placeholder="No"
                    />
                  </div>

                  <div>
                    <Label htmlFor="complemento" className="text-sm text-gray-700 mb-2 block">
                      Complemento
                    </Label>
                    <Input
                      id="complemento"
                      value={formData.complemento}
                      onChange={(e) => handleChange("complemento", e.target.value)}
                      placeholder="Sala, Andar, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="bairro" className="text-sm text-gray-700 mb-2 block">
                      Bairro
                    </Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => handleChange("bairro", e.target.value)}
                      placeholder="Bairro"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cidade" className="text-sm text-gray-700 mb-2 block">
                      Cidade
                    </Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => handleChange("cidade", e.target.value)}
                      placeholder="Cidade"
                    />
                  </div>

                  <div>
                    <Label htmlFor="estado" className="text-sm text-gray-700 mb-2 block">
                      Estado
                    </Label>
                    <Select value={formData.estado} onValueChange={(value) => handleChange("estado", value)}>
                      <SelectTrigger id="estado">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SP">SP</SelectItem>
                        <SelectItem value="RJ">RJ</SelectItem>
                        <SelectItem value="MG">MG</SelectItem>
                        <SelectItem value="ES">ES</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-normal text-[16px] py-[8px]">Contato Principal</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contatoNome" className="text-sm text-gray-700 mb-2 block">
                      Nome do Contato
                    </Label>
                    <Input
                      id="contatoNome"
                      value={formData.contatoNome}
                      onChange={(e) => handleChange("contatoNome", e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contatoCargo" className="text-sm text-gray-700 mb-2 block">
                      Cargo
                    </Label>
                    <Input
                      id="contatoCargo"
                      value={formData.contatoCargo}
                      onChange={(e) => handleChange("contatoCargo", e.target.value)}
                      placeholder="Cargo do contato"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contatoTelefone" className="text-sm text-gray-700 mb-2 block">
                      Telefone do Contato
                    </Label>
                    <Input
                      id="contatoTelefone"
                      value={formData.contatoTelefone}
                      onChange={(e) => handleChange("contatoTelefone", e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contatoEmail" className="text-sm text-gray-700 mb-2 block">
                      E-mail do Contato
                    </Label>
                    <Input
                      id="contatoEmail"
                      type="email"
                      value={formData.contatoEmail}
                      onChange={(e) => handleChange("contatoEmail", e.target.value)}
                      placeholder="contato@empresa.com.br"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-normal text-[16px] py-[8px]">Observacoes</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleChange("observacoes", e.target.value)}
                  placeholder="Informacoes adicionais sobre o fornecedor..."
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end pt-4">
              {onVoltar && (
                <Button type="button" variant="outline" className="border-gray-300 hover:bg-gray-50" onClick={onVoltar}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" className="bg-[#003366] hover:bg-[#002244] text-white">
                <Save size={18} className="mr-2" />
                Salvar Fornecedor
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function FornecedoresModule() {
  const [activePageTab, setActivePageTab] = useState<"fornecedores-atestados" | "cadastro-fornecedor">("fornecedores-atestados");
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Tabs
        value={activePageTab}
        onValueChange={(value) => setActivePageTab(value as "fornecedores-atestados" | "cadastro-fornecedor")}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-[560px] grid-cols-2">
          <TabsTrigger value="fornecedores-atestados">Fornecedores e Atestados</TabsTrigger>
          <TabsTrigger value="cadastro-fornecedor">Cadastro de Fornecedor</TabsTrigger>
        </TabsList>
        <TabsContent value="fornecedores-atestados" className="mt-4">
          <ContratosEFornecedores
            refreshToken={refreshToken}
            onCadastrarNovo={() => setActivePageTab("cadastro-fornecedor")}
          />
        </TabsContent>
        <TabsContent value="cadastro-fornecedor" className="mt-4">
          <CadastroFornecedor
            onVoltar={() => setActivePageTab("fornecedores-atestados")}
            onSuccess={() => setRefreshToken((value) => value + 1)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
