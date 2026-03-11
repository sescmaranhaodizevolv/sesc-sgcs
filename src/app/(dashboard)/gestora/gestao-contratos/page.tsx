"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Edit, Info, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { getContratos, updateContrato, type Contrato as ContratoService } from "@/services/contratosService";

interface ContratoTabela {
  id: string;
  numeroContrato: string;
  numeroProcesso: string;
  objeto: string;
  fornecedor: string;
  dataInicio: string;
  dataFim: string;
  dataInicioInput: string;
  dataFimInput: string;
  valor: string;
  status: string;
  statusOriginal: string | null;
  gestorTRP: string;
  observacoes?: string;
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR");
}

function toInputDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatReadableCode(primary?: string | null, fallback?: string | null, prefix = "GCON") {
  if (primary && primary.trim()) return primary;
  if (!fallback || !fallback.trim()) return "-";
  if (/^\d+$/.test(fallback.trim())) return `${prefix}-${fallback.padStart(4, "0")}`;
  if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(fallback.trim())) return `${prefix}-${fallback.slice(0, 8).toUpperCase()}`;
  return fallback;
}

function getDaysUntil(endDate?: string | null) {
  if (!endDate) return null;
  const target = new Date(endDate);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  return Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
}

function deriveContratoStatus(contrato: ContratoService) {
  const baseStatus = contrato.status || "Ativo";
  const dataFimReferencia = contrato.data_fim_atual ?? contrato.data_fim_original;
  const daysUntil = getDaysUntil(dataFimReferencia);

  if (!dataFimReferencia) return "Aguardando Datas";
  if (baseStatus === "Encerrado" || baseStatus === "Suspenso") return baseStatus;
  if (daysUntil !== null && daysUntil < 0) return "Vencido";
  if (daysUntil !== null && daysUntil < 30) return "Próximo ao Vencimento";
  return baseStatus === "Vigente" ? "Ativo" : baseStatus;
}

export default function GestaoContratosPage() {
  const supabase = useMemo(() => createClient(), []);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isNovoContratoModalOpen, setIsNovoContratoModalOpen] = useState(false);
  const [isEditarDatasModalOpen, setIsEditarDatasModalOpen] = useState(false);
  const [contratoSelecionado, setContratoSelecionado] = useState<ContratoTabela | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contratosRaw, setContratosRaw] = useState<ContratoService[]>([]);
  const itensPorPagina = 5;

  const loadContratos = async () => {
    setIsLoading(true);
    try {
      const data = await getContratos();
      setContratosRaw(data);
    } catch (error) {
      toast.error("Erro ao carregar contratos", {
        description: error instanceof Error ? error.message : "Nao foi possivel carregar os contratos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadContratos();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("gestao-contratos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "contratos" }, () => {
        void loadContratos();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const contratos = useMemo<ContratoTabela[]>(() => {
    return contratosRaw.map((contrato) => ({
      id: contrato.id,
      numeroContrato: formatReadableCode(contrato.numero_contrato, contrato.id, "CTR"),
      numeroProcesso: formatReadableCode(contrato.processo?.numero_requisicao, contrato.processo_id, "PROC"),
      objeto: contrato.objeto || contrato.processo?.objeto || "-",
      fornecedor: contrato.fornecedor?.razao_social || "-",
      dataInicio: formatDate(contrato.data_inicio),
      dataFim: formatDate(contrato.data_fim_atual ?? contrato.data_fim_original),
      dataInicioInput: toInputDate(contrato.data_inicio),
      dataFimInput: toInputDate(contrato.data_fim_atual ?? contrato.data_fim_original),
      valor: formatCurrency(contrato.valor_anual),
      status: deriveContratoStatus(contrato),
      statusOriginal: contrato.status,
      gestorTRP: contrato.responsavel?.nome || "-",
      observacoes: contrato.processo?.observacoes_internas || undefined,
    }));
  }, [contratosRaw]);

  const statusCounts = useMemo(
    () => ({
      total: contratos.length,
      ativo: contratos.filter((contrato) => contrato.status === "Ativo").length,
      aguardando: contratos.filter((contrato) => contrato.status === "Aguardando Datas").length,
      encerrado: contratos.filter((contrato) => contrato.status === "Encerrado").length,
    }),
    [contratos]
  );

  const filteredContratos = useMemo(() => {
    return contratos.filter((contrato) => {
      const termo = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        contrato.numeroContrato.toLowerCase().includes(termo) ||
        contrato.numeroProcesso.toLowerCase().includes(termo) ||
        contrato.objeto.toLowerCase().includes(termo) ||
        contrato.fornecedor.toLowerCase().includes(termo);

      const matchesStatus = statusFilter === "todos" || contrato.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contratos, searchTerm, statusFilter]);

  const {
    items: sortedContratos,
    requestSort: sortContratos,
    sortConfig: configContratos,
  } = useTableSort(filteredContratos);

  const totalPaginas = Math.max(1, Math.ceil(filteredContratos.length / itensPorPagina));

  useEffect(() => {
    setPaginaAtual((prev) => Math.min(prev, totalPaginas));
  }, [totalPaginas]);

  const contratosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return sortedContratos.slice(inicio, inicio + itensPorPagina);
  }, [sortedContratos, paginaAtual]);

  const handleSalvarDatas = async (contrato: ContratoTabela, dataInicio: string, dataFim: string) => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      const contratoAtualizado = await updateContrato(contrato.id, {
        data_inicio: dataInicio || null,
        data_fim_atual: dataFim,
        data_fim_original: contrato.dataFimInput ? undefined : dataFim,
        status: contrato.statusOriginal === "Encerrado" || contrato.statusOriginal === "Suspenso"
          ? contrato.statusOriginal
          : "Ativo",
      });

      setContratosRaw((prev) => prev.map((item) => (item.id === contrato.id ? contratoAtualizado : item)));
      toast.success("Datas do contrato atualizadas com sucesso!");
      setIsEditarDatasModalOpen(false);
      setContratoSelecionado(null);
    } catch (error) {
      toast.error("Erro ao salvar datas", {
        description: error instanceof Error ? error.message : "Nao foi possivel atualizar a vigencia.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Gestao de Contratos</h2>
          <p className="text-gray-600 mt-1">Cadastro manual de datas de vigencia contratual (substituicao do sistema legado)</p>
        </div>
        <Dialog open={isNovoContratoModalOpen} onOpenChange={setIsNovoContratoModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#003366] hover:bg-[#002244] text-white">
              <Plus size={20} className="mr-2" />
              Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Cadastrar Novo Contrato</DialogTitle>
                <DialogDescription>Registre um novo contrato com suas respectivas datas de vigencia</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 pb-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    Estas informacoes substituem o fluxo automatico do sistema legado. As datas registradas serao usadas para controle de vigencia e alertas.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cont-id">Numero do Contrato *</Label>
                    <Input id="cont-id" placeholder="CONT-2024-006" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cont-processo">Numero do Processo *</Label>
                    <Input id="cont-processo" placeholder="PROC-2024-XXX" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cont-objeto">Objeto do Contrato *</Label>
                  <Textarea id="cont-objeto" placeholder="Descreva o objeto do contrato..." rows={2} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cont-fornecedor">Fornecedor/Contratada *</Label>
                  <Input id="cont-fornecedor" placeholder="Razao Social da empresa" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cont-data-inicio">Data de Inicio *</Label>
                    <Input id="cont-data-inicio" type="date" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cont-data-fim">Data de Termino *</Label>
                    <Input id="cont-data-fim" type="date" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cont-valor">Valor Total</Label>
                    <Input id="cont-valor" placeholder="R$ 0,00" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cont-gestor">Gestor TRP *</Label>
                    <Select>
                      <SelectTrigger id="cont-gestor">
                        <SelectValue placeholder="Selecione o gestor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paula">Paula Mendes</SelectItem>
                        <SelectItem value="ana">Ana Costa</SelectItem>
                        <SelectItem value="roberto">Roberto Lima</SelectItem>
                        <SelectItem value="carlos">Carlos Oliveira</SelectItem>
                        <SelectItem value="maria">Maria Silva</SelectItem>
                        <SelectItem value="joao">Joao Santos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cont-observacoes">Observacoes</Label>
                  <Textarea id="cont-observacoes" placeholder="Informacoes adicionais sobre o contrato..." rows={2} />
                </div>
              </div>
            </div>

            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsNovoContratoModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                onClick={() => {
                  toast.info("O cadastro manual ainda depende da etapa de integracao do formulario.");
                  setIsNovoContratoModalOpen(false);
                }}
              >
                Cadastrar Contrato
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-black">{statusCounts.total}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Total de Contratos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#00bc7d]">{statusCounts.ativo}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#d08700]">{statusCounts.aguardando}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Aguardando Datas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col gap-1 items-center justify-center text-center">
              <p className="text-2xl leading-8 text-[#6b7280]">{statusCounts.encerrado}</p>
              <p className="text-xs leading-4 text-[#4a5565]">Encerrados</p>
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
                  placeholder="Buscar por contrato, processo, objeto ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPaginaAtual(1);
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
                  setPaginaAtual(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Próximo ao Vencimento">Próximo ao Vencimento</SelectItem>
                  <SelectItem value="Aguardando Datas">Aguardando Datas</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                  <SelectItem value="Encerrado">Encerrado</SelectItem>
                  <SelectItem value="Suspenso">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader className="pt-3 pb-1">
          <CardTitle className="text-xl text-black px-[0px] py-[8px]">Contratos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    label="Nº Contrato"
                    onClick={() => sortContratos("numeroContrato")}
                    currentDirection={configContratos.key === "numeroContrato" ? configContratos.direction : null}
                    className="sticky left-0 z-10 min-w-[140px] bg-white"
                  />
                  <SortableTableHead
                    label="Nº Processo"
                    onClick={() => sortContratos("numeroProcesso")}
                    currentDirection={configContratos.key === "numeroProcesso" ? configContratos.direction : null}
                    className="min-w-[140px]"
                  />
                  <SortableTableHead
                    label="Objeto"
                    onClick={() => sortContratos("objeto")}
                    currentDirection={configContratos.key === "objeto" ? configContratos.direction : null}
                    className="min-w-[300px]"
                  />
                  <SortableTableHead
                    label="Fornecedor"
                    onClick={() => sortContratos("fornecedor")}
                    currentDirection={configContratos.key === "fornecedor" ? configContratos.direction : null}
                    className="min-w-[200px]"
                  />
                  <TableHead className="min-w-[140px]">Data Inicio</TableHead>
                  <TableHead className="min-w-[140px]">Data Fim</TableHead>
                  <SortableTableHead
                    label="Valor"
                    onClick={() => sortContratos("valor")}
                    currentDirection={configContratos.key === "valor" ? configContratos.direction : null}
                    className="min-w-[140px]"
                  />
                  <SortableTableHead
                    label="Status"
                    onClick={() => sortContratos("status")}
                    currentDirection={configContratos.key === "status" ? configContratos.direction : null}
                    className="min-w-[140px]"
                  />
                  <SortableTableHead
                    label="Gestor TRP"
                    onClick={() => sortContratos("gestorTRP")}
                    currentDirection={configContratos.key === "gestorTRP" ? configContratos.direction : null}
                    className="min-w-[160px]"
                  />
                  <TableHead className="min-w-[140px] text-center">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contratosPaginados.map((contrato) => (
                  <TableRow key={contrato.id}>
                    <TableCell className="text-black sticky left-0 z-10 bg-white">{contrato.numeroContrato}</TableCell>
                    <TableCell className="text-gray-600">{contrato.numeroProcesso}</TableCell>
                    <TableCell className="text-gray-600">{contrato.objeto}</TableCell>
                    <TableCell className="text-gray-600">{contrato.fornecedor}</TableCell>
                    <TableCell className="text-gray-600">
                      {contrato.dataInicio || <span className="text-red-500">Nao informada</span>}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {contrato.dataFim || <span className="text-red-500">Nao informada</span>}
                    </TableCell>
                    <TableCell className="text-black">{contrato.valor}</TableCell>
                    <TableCell>
                      <BadgeStatus {...getBadgeMappingForStatus(contrato.status)}>
                        {contrato.status}
                      </BadgeStatus>
                    </TableCell>
                    <TableCell className="text-gray-600">{contrato.gestorTRP}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {contrato.status === "Aguardando Datas" ? (
                          <Button
                            size="sm"
                            className="bg-[#003366] hover:bg-[#002244] text-white"
                            onClick={() => {
                              setContratoSelecionado(contrato);
                              setIsEditarDatasModalOpen(true);
                            }}
                          >
                            <Calendar size={16} className="mr-2" />
                            Definir Datas
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setContratoSelecionado(contrato);
                              setIsEditarDatasModalOpen(true);
                            }}
                          >
                            <Edit size={16} className="mr-2" />
                            Editar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && contratosPaginados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                      Nenhum contrato encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              {filteredContratos.length > 0
                ? `Mostrando ${(paginaAtual - 1) * itensPorPagina + 1} a ${Math.min(paginaAtual * itensPorPagina, filteredContratos.length)} de ${filteredContratos.length} contratos`
                : "Mostrando 0 de 0 contratos"}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPaginaAtual((prev) => Math.max(1, prev - 1))}
                disabled={paginaAtual === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Pagina {totalPaginas === 0 ? 0 : paginaAtual} de {totalPaginas}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPaginaAtual((prev) => Math.min(totalPaginas, prev + 1))}
                disabled={paginaAtual === totalPaginas || filteredContratos.length === 0}
              >
                Proxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {contratoSelecionado && (
        <Dialog open={isEditarDatasModalOpen} onOpenChange={setIsEditarDatasModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {contratoSelecionado.status === "Aguardando Datas" ? "Definir Datas do Contrato" : "Editar Datas do Contrato"}
              </DialogTitle>
              <DialogDescription>
                Atualize as datas de inicio e termino do contrato para controle de vigencia
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert className="bg-yellow-50 border-yellow-200">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-sm text-yellow-800">
                  Estas datas sao essenciais para alertas de vencimento e gestao de prorrogacoes. Certifique-se de que estao corretas.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm"><span className="text-black">Contrato:</span> <span className="text-gray-600">{contratoSelecionado.numeroContrato}</span></p>
                <p className="text-sm"><span className="text-black">Processo:</span> <span className="text-gray-600">{contratoSelecionado.numeroProcesso}</span></p>
                <p className="text-sm"><span className="text-black">Objeto:</span> <span className="text-gray-600">{contratoSelecionado.objeto}</span></p>
                <p className="text-sm"><span className="text-black">Fornecedor:</span> <span className="text-gray-600">{contratoSelecionado.fornecedor}</span></p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-data-inicio">Data de Inicio *</Label>
                  <Input
                    id="edit-data-inicio"
                    type="date"
                    defaultValue={contratoSelecionado.dataInicioInput}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-data-fim">Data de Termino *</Label>
                  <Input
                    id="edit-data-fim"
                    type="date"
                    defaultValue={contratoSelecionado.dataFimInput}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-observacoes">Observacoes</Label>
                <Textarea
                  id="edit-observacoes"
                  placeholder="Informacoes sobre as datas definidas..."
                  rows={2}
                  defaultValue={contratoSelecionado.observacoes}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditarDatasModalOpen(false);
                  setContratoSelecionado(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#003366] hover:bg-[#002244] text-white"
                disabled={isSaving}
                onClick={() => {
                  const dataInicio = (document.getElementById("edit-data-inicio") as HTMLInputElement).value;
                  const dataFim = (document.getElementById("edit-data-fim") as HTMLInputElement).value;

                  if (dataInicio && dataFim) {
                    void handleSalvarDatas(contratoSelecionado, dataInicio, dataFim);
                  } else {
                    toast.error("Por favor, preencha ambas as datas");
                  }
                }}
              >
                Salvar Datas
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
