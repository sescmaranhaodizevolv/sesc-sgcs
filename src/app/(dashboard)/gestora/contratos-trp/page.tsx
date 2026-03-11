"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Edit,
  FileText,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { getContratos, type Contrato as ContratoService } from "@/services/contratosService";

interface RegistroTabela {
  id: string;
  numeroContrato: string;
  objeto: string;
  fornecedor: string;
  numeroProcesso: string;
  vigencia: string;
  status: string;
  quantidadeAditivos: number;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
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

function deriveStatus(contrato: ContratoService) {
  const baseStatus = contrato.status || "Ativo";
  const dataFimReferencia = contrato.data_fim_atual ?? contrato.data_fim_original;
  const daysUntil = getDaysUntil(dataFimReferencia);

  if (!dataFimReferencia) return "Aguardando Datas";
  if (baseStatus === "Encerrado" || baseStatus === "Suspenso") return baseStatus;
  if (daysUntil !== null && daysUntil < 0) return "Vencido";
  if (daysUntil !== null && daysUntil < 30) return "Próximo ao Vencimento";
  return baseStatus === "Vigente" ? "Ativo" : baseStatus;
}

function parseObservacoes(obs?: string | null) {
  if (!obs) {
    return { tipoInstrumento: "" };
  }

  try {
    const parsed = JSON.parse(obs) as { tipoInstrumento?: string | null };
    return { tipoInstrumento: parsed.tipoInstrumento || "" };
  } catch {
    return {
      tipoInstrumento: obs.match(/Instrumento:\s*([^|\]\n]+)/i)?.[1]?.trim() || "",
    };
  }
}

function isTRP(contrato: ContratoService) {
  const numeroContrato = contrato.numero_contrato.toLowerCase();
  const modalidade = (contrato.processo?.modalidade || "").toLowerCase();
  const tipoInstrumento = parseObservacoes(contrato.processo?.observacoes_internas).tipoInstrumento.toLowerCase();

  return (
    numeroContrato.includes("trp") ||
    numeroContrato.includes("ata") ||
    modalidade.includes("registro de precos") ||
    modalidade.includes("registro de preços") ||
    modalidade.includes("srp") ||
    tipoInstrumento.includes("trp") ||
    tipoInstrumento.includes("ata")
  );
}

function mapContratoToRow(contrato: ContratoService): RegistroTabela {
  return {
    id: contrato.id,
    numeroContrato: formatReadableCode(contrato.numero_contrato, contrato.id, "CTR"),
    objeto: contrato.objeto || contrato.processo?.objeto || "-",
    fornecedor: contrato.fornecedor?.razao_social || "-",
    numeroProcesso: formatReadableCode(contrato.processo?.numero_requisicao, contrato.processo_id, "PROC"),
    vigencia: `${formatDate(contrato.data_inicio)} - ${formatDate(contrato.data_fim_atual ?? contrato.data_fim_original)}`,
    status: deriveStatus(contrato),
    quantidadeAditivos: Number(contrato.quantidade_aditivos || 0),
  };
}

export default function GestoraPage() {
  const supabase = useMemo(() => createClient(), []);
  const [searchContratos, setSearchContratos] = useState("");
  const [statusContratos, setStatusContratos] = useState("todos");
  const [searchTRP, setSearchTRP] = useState("");
  const [statusTRP, setStatusTRP] = useState("todos");
  const [contratosRaw, setContratosRaw] = useState<ContratoService[]>([]);

  const loadContratos = async () => {
    try {
      const data = await getContratos();
      setContratosRaw(data);
    } catch (error) {
      toast.error("Erro ao carregar contratos e TRP", {
        description: error instanceof Error ? error.message : "Nao foi possivel carregar os dados.",
      });
    }
  };

  useEffect(() => {
    void loadContratos();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("contratos-trp-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "contratos" }, () => {
        void loadContratos();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const contratos = useMemo(() => contratosRaw.filter((contrato) => !isTRP(contrato)).map(mapContratoToRow), [contratosRaw]);

  const trps = useMemo(() => contratosRaw.filter((contrato) => isTRP(contrato)).map(mapContratoToRow), [contratosRaw]);

  const filteredContratos = useMemo(() => {
    return contratos.filter((contrato) => {
      const termo = searchContratos.toLowerCase();
      const matchesSearch =
        contrato.fornecedor.toLowerCase().includes(termo) ||
        contrato.numeroContrato.toLowerCase().includes(termo) ||
        contrato.objeto.toLowerCase().includes(termo) ||
        contrato.numeroProcesso.toLowerCase().includes(termo);

      const matchesStatus = statusContratos === "todos" || contrato.status === statusContratos;

      return matchesSearch && matchesStatus;
    });
  }, [contratos, searchContratos, statusContratos]);

  const filteredTRP = useMemo(() => {
    return trps.filter((trp) => {
      const termo = searchTRP.toLowerCase();
      const matchesSearch =
        trp.numeroContrato.toLowerCase().includes(termo) ||
        trp.fornecedor.toLowerCase().includes(termo) ||
        trp.objeto.toLowerCase().includes(termo);
      const matchesStatus = statusTRP === "todos" || trp.status === statusTRP;

      return matchesSearch && matchesStatus;
    });
  }, [searchTRP, statusTRP, trps]);

  const {
    items: sortedContratos,
    requestSort: sortContratos,
    sortConfig: configContratos,
  } = useTableSort(filteredContratos);

  const {
    items: sortedTRP,
    requestSort: sortTRP,
    sortConfig: configTRP,
  } = useTableSort(filteredTRP);

  const statusCounts = useMemo(() => ({
    todos: contratos.length,
    ativo: contratos.filter((contrato) => contrato.status === "Ativo").length,
    proximoVencimento: contratos.filter((contrato) => contrato.status === "Próximo ao Vencimento").length,
    vencido: contratos.filter((contrato) => contrato.status === "Vencido").length,
    encerrado: contratos.filter((contrato) => contrato.status === "Encerrado").length,
    suspenso: contratos.filter((contrato) => contrato.status === "Suspenso").length,
  }), [contratos]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Gestao de Contratos e TRP</h2>
          <p className="text-gray-600 mt-1">
            Alimentacao de datas de vigencia e status contratuais
          </p>
        </div>
        <Button className="bg-[#003366] hover:bg-[#002244] text-white">
          <Calendar size={20} className="mr-2" />
          Novo Contrato
        </Button>
      </div>

      <Tabs defaultValue="contratos" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="trp-ativos">TRP Ativos</TabsTrigger>
        </TabsList>

        <TabsContent value="contratos" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-black">{statusCounts.todos}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-[#10b981]">{statusCounts.ativo}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Ativos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-[#f59e0b]">{statusCounts.proximoVencimento}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Proximo Venc.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-[#e7000b]">{statusCounts.vencido}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Vencidos</p>
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
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center h-full py-6">
                <div className="flex flex-col gap-1 items-center justify-center text-center">
                  <p className="text-2xl leading-8 text-[#9810fa]">{statusCounts.suspenso}</p>
                  <p className="text-xs leading-4 text-[#4a5565]">Suspensos</p>
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
                      placeholder="Buscar por empresa, contrato, objeto ou processo..."
                      value={searchContratos}
                      onChange={(e) => setSearchContratos(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-64">
                  <Select value={statusContratos} onValueChange={setStatusContratos}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Próximo ao Vencimento">Próximo ao Vencimento</SelectItem>
                      <SelectItem value="Vencido">Vencido</SelectItem>
                      <SelectItem value="Encerrado">Encerrado</SelectItem>
                      <SelectItem value="Suspenso">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {statusCounts.vencido > 0 && (
            <Card className="border border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={24} className="text-red-600" />
                  <div>
                    <p className="text-black">
                      <strong>{statusCounts.vencido}</strong>{" "}
                      {statusCounts.vencido === 1 ? "contrato vencido" : "contratos vencidos"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Atualize as datas de vigencia ou status para evitar interrupcoes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black px-[0px] py-[8px]">Contratos</CardTitle>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead
                        label="Contrato/Processo"
                        onClick={() => sortContratos("numeroContrato")}
                        currentDirection={configContratos.key === "numeroContrato" ? configContratos.direction : null}
                        className="sticky left-0 z-10 min-w-[180px] bg-white"
                      />
                      <SortableTableHead
                        label="Objeto"
                        onClick={() => sortContratos("objeto")}
                        currentDirection={configContratos.key === "objeto" ? configContratos.direction : null}
                        className="min-w-[260px]"
                      />
                      <SortableTableHead
                        label="Empresa"
                        onClick={() => sortContratos("fornecedor")}
                        currentDirection={configContratos.key === "fornecedor" ? configContratos.direction : null}
                        className="min-w-[180px]"
                      />
                      <TableHead className="min-w-[150px]">Vigencia</TableHead>
                      <SortableTableHead
                        label="Status"
                        onClick={() => sortContratos("status")}
                        currentDirection={configContratos.key === "status" ? configContratos.direction : null}
                        className="min-w-[140px]"
                      />
                      <TableHead className="min-w-[100px]">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedContratos.map((contrato) => (
                      <TableRow key={contrato.id}>
                        <TableCell className="text-black sticky left-0 z-10 bg-white">
                          <div className="space-y-0.5">
                            <p className="font-medium">{contrato.numeroContrato}</p>
                            <p className="text-xs text-gray-500">{contrato.numeroProcesso}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{contrato.objeto}</TableCell>
                        <TableCell className="text-black">{contrato.fornecedor}</TableCell>
                        <TableCell className="text-gray-600">{contrato.vigencia}</TableCell>
                        <TableCell>
                          <BadgeStatus {...getBadgeMappingForStatus(contrato.status)}>
                            {contrato.status}
                          </BadgeStatus>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit size={16} />
                            </Button>
                            <Button size="sm" variant="outline">
                              <FileText size={16} />
                            </Button>
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

        <TabsContent value="trp-ativos" className="space-y-6 mt-0">
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar por termo, fornecedor ou objeto..."
                      value={searchTRP}
                      onChange={(e) => setSearchTRP(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-64">
                  <Select value={statusTRP} onValueChange={setStatusTRP}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Próximo ao Vencimento">Próximo ao Vencimento</SelectItem>
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
              <CardTitle className="text-xl text-black px-[0px] py-[8px]">TRP Ativos</CardTitle>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead
                        label="TRP"
                        onClick={() => sortTRP("numeroContrato")}
                        currentDirection={configTRP.key === "numeroContrato" ? configTRP.direction : null}
                        className="sticky left-0 z-10 min-w-[130px] bg-white"
                      />
                      <SortableTableHead
                        label="Objeto"
                        onClick={() => sortTRP("objeto")}
                        currentDirection={configTRP.key === "objeto" ? configTRP.direction : null}
                        className="min-w-[260px]"
                      />
                      <SortableTableHead
                        label="Fornecedor"
                        onClick={() => sortTRP("fornecedor")}
                        currentDirection={configTRP.key === "fornecedor" ? configTRP.direction : null}
                        className="min-w-[180px]"
                      />
                      <TableHead className="min-w-[150px]">Vigencia</TableHead>
                      <SortableTableHead
                        label="Status"
                        onClick={() => sortTRP("status")}
                        currentDirection={configTRP.key === "status" ? configTRP.direction : null}
                        className="min-w-[140px]"
                      />
                      <SortableTableHead
                        label="Aditivos"
                        onClick={() => sortTRP("quantidadeAditivos")}
                        currentDirection={configTRP.key === "quantidadeAditivos" ? configTRP.direction : null}
                        className="min-w-[80px]"
                      />
                      <TableHead className="min-w-[100px]">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTRP.map((trp) => (
                      <TableRow key={trp.id}>
                        <TableCell className="text-black font-medium sticky left-0 z-10 bg-white">{trp.numeroContrato}</TableCell>
                        <TableCell className="text-gray-600">{trp.objeto}</TableCell>
                        <TableCell className="text-black">{trp.fornecedor}</TableCell>
                        <TableCell className="text-gray-600">{trp.vigencia}</TableCell>
                        <TableCell>
                          <BadgeStatus {...getBadgeMappingForStatus(trp.status)}>
                            {trp.status}
                          </BadgeStatus>
                        </TableCell>
                        <TableCell className="text-gray-600">{trp.quantidadeAditivos}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit size={16} />
                            </Button>
                            <Button size="sm" variant="outline">
                              <FileText size={16} />
                            </Button>
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
    </div>
  );
}
