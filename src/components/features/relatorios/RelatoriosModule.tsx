"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Calendar, DollarSign, FileSpreadsheet, FileText, Filter } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { BadgeStatus } from "@/components/ui/badge-status";
import { getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { getProcessos } from "@/services/processosService";
import { getFornecedores } from "@/services/fornecedoresService";
import { getDesistencias, getPenalidades } from "@/services/penalidadesService";
import { getContratos, getProrrogacoes, getRealinhamentos } from "@/services/contratosService";
import type { ProcessoComDetalhes } from "@/types";

type TipoRelatorio =
  | "processos"
  | "desistencias"
  | "realinhamento"
  | "penalidades"
  | "prorrogacoes"
  | "fornecedores"
  | "trps";

type ProcessoRelatorio = {
  id: string;
  empresa: string;
  processo: string;
  tipo: string;
  valor: string;
  status: string;
  dataInicio: string;
  dataFim: string;
  responsavel: string;
};

type DesistenciaRelatorio = {
  id: string;
  empresa: string;
  processo: string;
  motivo: string;
  dataDesistencia: string;
  valorEstimado: string;
  responsavel: string;
};

type RealinhamentoRelatorio = {
  id: string;
  empresa: string;
  processo: string;
  valorOriginal: string;
  valorRealinhado: string;
  percentualAumento: string;
  dataRealinhamento: string;
  justificativa: string;
  status: string;
};

type PenalidadeRelatorio = {
  id: string;
  empresa: string;
  processo: string;
  tipoPenalidade: string;
  valor: string;
  motivo: string;
  dataAplicacao: string;
  status: string;
};

type ProrrogacaoRelatorio = {
  id: string;
  empresa: string;
  processo: string;
  dataVencimentoOriginal: string;
  novaDataVencimento: string;
  prazoAdicional: string;
  dataSolicitacao: string;
  justificativa: string;
  status: string;
};

type TRPRelatorio = {
  id: string;
  numeroTRP: string;
  empresa: string;
  cnpj: string;
  numeroProcesso: string;
  valorContratado: string;
  vigencia: string;
  status: string;
  aditivos: number;
};

type FornecedorRelatorio = {
  id: string;
  nome: string;
  cnpj: string;
  categoria: string;
  totalContratos: number;
  valorTotal: string;
  status: string;
  dataRegistro: string;
  atestados: number;
};

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

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function normalizeStatus(value: string) {
  return normalizeText(value).replace(/[\s_]+/g, "-");
}

function parseDate(value?: string) {
  if (!value || value === "-") return null;
  if (value.includes("/")) {
    const [day, month, year] = value.split("/").map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  }
  if (value.includes("-")) {
    const [year, month, day] = value.split("-").map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  }
  return null;
}

function diffDays(start?: string | null, end?: string | null) {
  if (!start || !end) return "-";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return "-";
  const total = Math.max(0, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
  return `${total} dias`;
}

function parseInstrumento(observacoes?: string | null) {
  if (!observacoes) return null;
  try {
    const parsed = JSON.parse(observacoes) as { tipoInstrumento?: string | null };
    return parsed.tipoInstrumento ?? null;
  } catch {
    const match = observacoes.match(/Instrumento:\s*([^|\]\n]+)/i);
    return match?.[1]?.trim() ?? null;
  }
}

export function RelatoriosModule() {
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>("processos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [, setEmpresaFilter] = useState("todas");
  const [categoriaFilter, setCategoriaFilter] = useState("todas");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [processosRaw, setProcessosRaw] = useState<ProcessoComDetalhes[]>([]);
  const [desistenciasRaw, setDesistenciasRaw] = useState<any[]>([]);
  const [realinhamentosRaw, setRealinhamentosRaw] = useState<any[]>([]);
  const [penalidadesRaw, setPenalidadesRaw] = useState<any[]>([]);
  const [prorrogacoesRaw, setProrrogacoesRaw] = useState<any[]>([]);
  const [fornecedoresRaw, setFornecedoresRaw] = useState<any[]>([]);
  const [contratosRaw, setContratosRaw] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      let fDataInicio: string | undefined;
      let fDataFim: string | undefined;
      if (dataInicio) fDataInicio = new Date(dataInicio).toISOString();
      if (dataFim) {
        const d = new Date(dataFim);
        d.setHours(23, 59, 59, 999);
        fDataFim = d.toISOString();
      }

      const f = {
        status: statusFilter,
        categoria: categoriaFilter,
        dataInicio: fDataInicio,
        dataFim: fDataFim,
      };

      const [processos, desistencias, realinhamentos, penalidades, prorrogacoes, fornecedores, contratos] = await Promise.all([
        getProcessos(f),
        getDesistencias(f),
        getRealinhamentos(undefined, f),
        getPenalidades(f),
        getProrrogacoes(undefined, f),
        getFornecedores(f),
        getContratos(f),
      ]);

      setProcessosRaw(processos);
      setDesistenciasRaw(desistencias);
      setRealinhamentosRaw(realinhamentos);
      setPenalidadesRaw(penalidades);
      setProrrogacoesRaw(prorrogacoes);
      setFornecedoresRaw(fornecedores);
      setContratosRaw(contratos);
    } catch (error) {
      toast.error("Erro ao carregar relatórios", {
        description: error instanceof Error ? error.message : "Não foi possível carregar os dados reais dos relatórios.",
      });
    }
  }, [categoriaFilter, dataFim, dataInicio, statusFilter]);

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contratosMap = useMemo(() => new Map(contratosRaw.map((contrato) => [contrato.id, contrato])), [contratosRaw]);

  const dadosProcessos = useMemo<ProcessoRelatorio[]>(
    () =>
      processosRaw.map((processo) => ({
        id: processo.id,
        empresa: processo.fornecedor?.razao_social || processo.empresa_vencedora || "Não definida",
        processo: processo.numero_processo || processo.numero_requisicao || "Não informado",
        tipo: processo.modalidade || "Não definida",
        valor: formatCurrency(typeof processo.valor === "number" ? processo.valor : null),
        status: processo.status || "Pendente",
        dataInicio: formatDate(processo.data_recebimento || processo.data_distribuicao),
        dataFim: formatDate(processo.data_fim || processo.data_finalizacao),
        responsavel: processo.responsavel?.nome || "Não atribuído",
      })),
    [processosRaw],
  );

  const dadosDesistencias = useMemo<DesistenciaRelatorio[]>(
    () =>
      desistenciasRaw.map((item) => ({
        id: item.id,
        empresa: item.fornecedor?.razao_social || "Não definida",
        processo: item.processo?.numero_requisicao || item.processo_id || "Não informado",
        motivo: item.motivo,
        dataDesistencia: formatDate(item.criado_em),
        valorEstimado: "-",
        responsavel: item.registrado_por_profile?.nome || "Sistema",
      })),
    [desistenciasRaw],
  );

  const dadosRealinhamento = useMemo<RealinhamentoRelatorio[]>(
    () =>
      realinhamentosRaw.map((item) => ({
        id: item.id,
        empresa: item.contrato?.fornecedor?.razao_social || "Não definida",
        processo: item.contrato?.numero_contrato || item.contrato_id || "Não informado",
        valorOriginal: formatCurrency(item.valor_original),
        valorRealinhado: formatCurrency(item.valor_solicitado),
        percentualAumento: `${Number(item.variacao_percentual || 0) >= 0 ? "+" : ""}${Number(item.variacao_percentual || 0).toFixed(2)}%`,
        dataRealinhamento: formatDate(item.data_solicitacao),
        justificativa: item.justificativa || "-",
        status: item.status || "Pendente",
      })),
    [realinhamentosRaw],
  );

  const dadosPenalidades = useMemo<PenalidadeRelatorio[]>(
    () =>
      penalidadesRaw.map((item) => ({
        id: item.id,
        empresa: item.fornecedor?.razao_social || "Não definida",
        processo: item.processo?.numero_requisicao || item.processo_id || "Não informado",
        tipoPenalidade: item.tipo_penalidade,
        valor: formatCurrency(item.valor),
        motivo: item.parecer_tecnico || "-",
        dataAplicacao: formatDate(item.data_aplicacao || item.data_ocorrencia),
        status: item.status,
      })),
    [penalidadesRaw],
  );

  const dadosProrrogacoes = useMemo<ProrrogacaoRelatorio[]>(
    () =>
      prorrogacoesRaw.map((item) => {
        const contrato = contratosMap.get(item.contrato_id);
        return {
          id: item.id,
          empresa: contrato?.fornecedor?.razao_social || "Não definida",
          processo: contrato?.numero_contrato || item.contrato?.numero_contrato || item.contrato_id || "Não informado",
          dataVencimentoOriginal: formatDate(contrato?.data_fim_original),
          novaDataVencimento: formatDate(item.nova_data_fim),
          prazoAdicional: diffDays(contrato?.data_fim_atual || contrato?.data_fim_original, item.nova_data_fim),
          dataSolicitacao: formatDate(item.data_solicitacao),
          justificativa: item.motivo || "-",
          status: item.status || "Pendente",
        };
      }),
    [contratosMap, prorrogacoesRaw],
  );

  const dadosTRPs = useMemo<TRPRelatorio[]>(
    () =>
      processosRaw
        .filter((processo) => parseInstrumento(processo.observacoes_internas) === "TRP")
        .map((processo) => ({
          id: processo.id,
          numeroTRP: processo.numero_processo || processo.numero_requisicao || "Não informado",
          empresa: processo.empresa_vencedora || processo.fornecedor?.razao_social || "Não definida",
          cnpj: "-",
          numeroProcesso: processo.numero_processo || processo.numero_requisicao || "Não informado",
          valorContratado: formatCurrency(typeof processo.valor === "number" ? processo.valor : null),
          vigencia: processo.data_fim ? formatDate(processo.data_fim) : "-",
          status: processo.status || "Ativo",
          aditivos: ((processo.observacoes_internas || "").match(/Aditivo/gi) || []).length,
        })),
    [processosRaw],
  );

  const dadosFornecedores = useMemo<FornecedorRelatorio[]>(
    () =>
      fornecedoresRaw.map((item) => {
        const contratosFornecedor = contratosRaw.filter((contrato) => contrato.fornecedor_id === item.id);
        return {
          id: item.id,
          nome: item.razao_social,
          cnpj: item.cnpj,
          categoria: item.categoria || "Não informada",
          totalContratos: contratosFornecedor.length,
          valorTotal: formatCurrency(
            contratosFornecedor.reduce((acc, contrato) => acc + Number(contrato.valor_anual || 0), 0),
          ),
          status: item.status || "Ativo",
          dataRegistro: formatDate(item.data_cadastro),
          atestados: 0,
        };
      }),
    [contratosRaw, fornecedoresRaw],
  );

  const dadosProcessosFiltrados = dadosProcessos;
  const dadosDesistenciasFiltrados = dadosDesistencias;
  const dadosRealinhamentoFiltrados = dadosRealinhamento;
  const dadosPenalidadesFiltrados = dadosPenalidades;
  const dadosProrrogacoesFiltrados = dadosProrrogacoes;
  const dadosTRPsFiltrados = dadosTRPs;
  const dadosFornecedoresFiltrados = dadosFornecedores;

  const { items: sortedProcessos, requestSort: sortProcessos, sortConfig: configProcessos } = useTableSort(dadosProcessosFiltrados);
  const { items: sortedDesistencias, requestSort: sortDesistencias, sortConfig: configDesistencias } = useTableSort(dadosDesistenciasFiltrados);
  const { items: sortedRealinhamento, requestSort: sortRealinhamento, sortConfig: configRealinhamento } = useTableSort(dadosRealinhamentoFiltrados);
  const { items: sortedPenalidades, requestSort: sortPenalidades, sortConfig: configPenalidades } = useTableSort(dadosPenalidadesFiltrados);
  const { items: sortedProrrogacoes, requestSort: sortProrrogacoes, sortConfig: configProrrogacoes } = useTableSort(dadosProrrogacoesFiltrados);
  const { items: sortedTRPs, requestSort: sortTRPs, sortConfig: configTRPs } = useTableSort(dadosTRPsFiltrados);
  const { items: sortedFornecedores, requestSort: sortFornecedores, sortConfig: configFornecedores } = useTableSort(dadosFornecedoresFiltrados);

  const resumoEstatisticas = useMemo(
    () => ({
      totalProcessos: dadosProcessos.length,
      totalDesistencias: dadosDesistencias.length,
      totalRealinhamentos: dadosRealinhamento.length,
      totalPenalidades: dadosPenalidades.length,
      totalProrrogacoes: dadosProrrogacoes.length,
      totalTRPs: dadosTRPs.length,
      totalFornecedores: dadosFornecedores.length,
    }),
    [dadosDesistencias.length, dadosFornecedores.length, dadosPenalidades.length, dadosProcessos.length, dadosProrrogacoes.length, dadosRealinhamento.length, dadosTRPs.length],
  );

  const filteredData = useMemo(() => {
    switch (tipoRelatorio) {
      case "desistencias": return dadosDesistenciasFiltrados;
      case "realinhamento": return dadosRealinhamentoFiltrados;
      case "penalidades": return dadosPenalidadesFiltrados;
      case "prorrogacoes": return dadosProrrogacoesFiltrados;
      case "trps": return dadosTRPsFiltrados;
      case "fornecedores": return dadosFornecedoresFiltrados;
      default: return dadosProcessosFiltrados;
    }
  }, [dadosDesistenciasFiltrados, dadosFornecedoresFiltrados, dadosPenalidadesFiltrados, dadosProcessosFiltrados, dadosProrrogacoesFiltrados, dadosRealinhamentoFiltrados, dadosTRPsFiltrados, tipoRelatorio]);

  const tipoNome = {
    processos: "Processos",
    desistencias: "Histórico de Desistências",
    realinhamento: "Realinhamento de Preços",
    penalidades: "Penalidades",
    prorrogacoes: "Prorrogações de Processos",
    trps: "TRPs",
    fornecedores: "Fornecedores",
  }[tipoRelatorio];

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl text-black">Relatórios</h2>
          <p className="mt-1 text-gray-600">Área de filtros, resultados e exportação de relatórios de todos os módulos</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Button className="bg-green-600 text-white hover:bg-green-700" onClick={() => toast.success(`Relatório "${tipoNome}" exportado para Excel com sucesso!`, { description: `${filteredData.length} registros foram exportados com base nos filtros aplicados.` })}><FileSpreadsheet className="mr-2" size={20} />Exportar Excel</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => toast.success(`Relatório "${tipoNome}" exportado para PDF com sucesso!`, { description: `${filteredData.length} registros foram exportados com base nos filtros aplicados.` })}><FileText className="mr-2" size={20} />Exportar PDF</Button>
          </div>
          <p className="text-xs text-gray-500">* Exporta todos os registros conforme filtros aplicados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2"><BarChart3 className="text-blue-600" size={20} /></div><div><p className="text-2xl text-black">{resumoEstatisticas.totalProcessos}</p><p className="text-sm text-gray-600">Total de Processos</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-cyan-100 p-2"><FileText className="text-cyan-600" size={20} /></div><div><p className="text-2xl text-cyan-600">{resumoEstatisticas.totalTRPs}</p><p className="text-sm text-gray-600">TRPs</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-purple-100 p-2"><DollarSign className="text-purple-600" size={20} /></div><div><p className="text-2xl text-purple-600">{resumoEstatisticas.totalRealinhamentos}</p><p className="text-sm text-gray-600">Realinhamentos</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-orange-100 p-2"><Calendar className="text-orange-600" size={20} /></div><div><p className="text-2xl text-orange-600">{resumoEstatisticas.totalProrrogacoes}</p><p className="text-sm text-gray-600">Prorrogações</p></div></div></CardContent></Card>
      </div>

      <Card className="border border-gray-200">
        <CardHeader className="pb-0 pt-6"><CardTitle className="flex items-center gap-2 text-xl text-black"><Filter size={20} />Filtros de Pesquisa</CardTitle></CardHeader>
        <CardContent className="pt-4">
          <div className="mb-4 grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tipo-relatorio">Tipo de Relatório</Label>
              <Select value={tipoRelatorio} onValueChange={(v) => setTipoRelatorio(v as TipoRelatorio)}>
                <SelectTrigger id="tipo-relatorio"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="processos">Processos</SelectItem>
                  <SelectItem value="desistencias">Histórico de Desistências</SelectItem>
                  <SelectItem value="realinhamento">Realinhamento de Preços</SelectItem>
                  <SelectItem value="penalidades">Penalidades</SelectItem>
                  <SelectItem value="prorrogacoes">Prorrogações de Processos</SelectItem>
                  <SelectItem value="trps">TRPs</SelectItem>
                  <SelectItem value="fornecedores">Fornecedores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(tipoRelatorio === "processos" || tipoRelatorio === "trps" || tipoRelatorio === "fornecedores" || tipoRelatorio === "desistencias" || tipoRelatorio === "realinhamento" || tipoRelatorio === "penalidades" || tipoRelatorio === "prorrogacoes") && (
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5"><Label>Status</Label><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Status</SelectItem><SelectItem value="aprovado">Aprovado</SelectItem><SelectItem value="aprovada">Aprovada</SelectItem><SelectItem value="em-analise">Em Análise</SelectItem><SelectItem value="rejeitado">Rejeitado</SelectItem><SelectItem value="pendente">Pendente</SelectItem><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="inativo">Inativo</SelectItem></SelectContent></Select></div>
              <div className="space-y-1.5"><Label>Data Início</Label><Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Data Fim</Label><Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} /></div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button className="bg-[#003366] text-white hover:bg-[#002244]" onClick={() => void loadData()}><Filter className="mr-2" size={16} />Aplicar Filtros</Button>
            <Button variant="outline" onClick={() => { setStatusFilter("todos"); setEmpresaFilter("todas"); setCategoriaFilter("todas"); setDataInicio(""); setDataFim(""); loadData(); toast.info("Filtros limpos"); }}>Limpar Filtros</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader className="pb-1 pt-3"><div className="flex items-center justify-between"><CardTitle className="text-xl text-black">{`Relatório de ${tipoNome}`}</CardTitle><span className="text-sm text-gray-600">{filteredData.length} registros</span></div></CardHeader>
        <CardContent className="p-4">
          <div className="w-full overflow-x-auto">
            {tipoRelatorio === "processos" && <Table><TableHeader><TableRow><SortableTableHead label="Empresa" onClick={() => sortProcessos("empresa")} currentDirection={configProcessos?.key === "empresa" ? configProcessos.direction : null} className="sticky left-0 z-10 min-w-[200px] bg-white" /><SortableTableHead label="Processo" onClick={() => sortProcessos("processo")} currentDirection={configProcessos?.key === "processo" ? configProcessos.direction : null} /><SortableTableHead label="Tipo" onClick={() => sortProcessos("tipo")} currentDirection={configProcessos?.key === "tipo" ? configProcessos.direction : null} /><SortableTableHead label="Valor" onClick={() => sortProcessos("valor")} currentDirection={configProcessos?.key === "valor" ? configProcessos.direction : null} /><SortableTableHead label="Status" onClick={() => sortProcessos("status")} currentDirection={configProcessos?.key === "status" ? configProcessos.direction : null} /><SortableTableHead label="Data Início" onClick={() => sortProcessos("dataInicio")} currentDirection={configProcessos?.key === "dataInicio" ? configProcessos.direction : null} /><SortableTableHead label="Data Fim" onClick={() => sortProcessos("dataFim")} currentDirection={configProcessos?.key === "dataFim" ? configProcessos.direction : null} /><SortableTableHead label="Responsável" onClick={() => sortProcessos("responsavel")} currentDirection={configProcessos?.key === "responsavel" ? configProcessos.direction : null} /></TableRow></TableHeader><TableBody>{sortedProcessos.map((i) => <TableRow key={i.id}><TableCell className="text-black sticky left-0 z-10 bg-white">{i.empresa}</TableCell><TableCell className="text-black">{i.processo}</TableCell><TableCell className="text-gray-600">{i.tipo}</TableCell><TableCell className="text-black">{i.valor}</TableCell><TableCell><BadgeStatus size="sm" {...getBadgeMappingForStatus(i.status)}>{i.status}</BadgeStatus></TableCell><TableCell className="text-gray-600">{i.dataInicio}</TableCell><TableCell className="text-gray-600">{i.dataFim}</TableCell><TableCell className="text-gray-600">{i.responsavel}</TableCell></TableRow>)}</TableBody></Table>}
            {tipoRelatorio === "desistencias" && <Table><TableHeader><TableRow><SortableTableHead label="Empresa" onClick={() => sortDesistencias("empresa")} currentDirection={configDesistencias?.key === "empresa" ? configDesistencias.direction : null} className="sticky left-0 z-10 min-w-[200px] bg-white" /><SortableTableHead label="Processo" onClick={() => sortDesistencias("processo")} currentDirection={configDesistencias?.key === "processo" ? configDesistencias.direction : null} /><SortableTableHead label="Motivo" onClick={() => sortDesistencias("motivo")} currentDirection={configDesistencias?.key === "motivo" ? configDesistencias.direction : null} /><SortableTableHead label="Data Desistência" onClick={() => sortDesistencias("dataDesistencia")} currentDirection={configDesistencias?.key === "dataDesistencia" ? configDesistencias.direction : null} /><SortableTableHead label="Valor Estimado" onClick={() => sortDesistencias("valorEstimado")} currentDirection={configDesistencias?.key === "valorEstimado" ? configDesistencias.direction : null} /><SortableTableHead label="Responsável" onClick={() => sortDesistencias("responsavel")} currentDirection={configDesistencias?.key === "responsavel" ? configDesistencias.direction : null} /></TableRow></TableHeader><TableBody>{sortedDesistencias.map((i) => <TableRow key={i.id}><TableCell className="text-black sticky left-0 z-10 bg-white">{i.empresa}</TableCell><TableCell className="text-black">{i.processo}</TableCell><TableCell className="text-gray-600">{i.motivo}</TableCell><TableCell className="text-gray-600">{i.dataDesistencia}</TableCell><TableCell className="text-black">{i.valorEstimado}</TableCell><TableCell className="text-gray-600">{i.responsavel}</TableCell></TableRow>)}</TableBody></Table>}
            {tipoRelatorio === "realinhamento" && <Table><TableHeader><TableRow><SortableTableHead label="Empresa" onClick={() => sortRealinhamento("empresa")} currentDirection={configRealinhamento?.key === "empresa" ? configRealinhamento.direction : null} className="sticky left-0 z-10 min-w-[200px] bg-white" /><SortableTableHead label="Processo" onClick={() => sortRealinhamento("processo")} currentDirection={configRealinhamento?.key === "processo" ? configRealinhamento.direction : null} /><SortableTableHead label="Valor Original" onClick={() => sortRealinhamento("valorOriginal")} currentDirection={configRealinhamento?.key === "valorOriginal" ? configRealinhamento.direction : null} /><SortableTableHead label="Valor Realinhado" onClick={() => sortRealinhamento("valorRealinhado")} currentDirection={configRealinhamento?.key === "valorRealinhado" ? configRealinhamento.direction : null} /><SortableTableHead label="Percentual" onClick={() => sortRealinhamento("percentualAumento")} currentDirection={configRealinhamento?.key === "percentualAumento" ? configRealinhamento.direction : null} /><SortableTableHead label="Data" onClick={() => sortRealinhamento("dataRealinhamento")} currentDirection={configRealinhamento?.key === "dataRealinhamento" ? configRealinhamento.direction : null} /><SortableTableHead label="Justificativa" onClick={() => sortRealinhamento("justificativa")} currentDirection={configRealinhamento?.key === "justificativa" ? configRealinhamento.direction : null} /><SortableTableHead label="Status" onClick={() => sortRealinhamento("status")} currentDirection={configRealinhamento?.key === "status" ? configRealinhamento.direction : null} /></TableRow></TableHeader><TableBody>{sortedRealinhamento.map((i) => <TableRow key={i.id}><TableCell className="text-black sticky left-0 z-10 bg-white">{i.empresa}</TableCell><TableCell className="text-black">{i.processo}</TableCell><TableCell className="text-gray-600">{i.valorOriginal}</TableCell><TableCell className="text-black">{i.valorRealinhado}</TableCell><TableCell className="text-red-600">{i.percentualAumento}</TableCell><TableCell className="text-gray-600">{i.dataRealinhamento}</TableCell><TableCell className="text-gray-600">{i.justificativa}</TableCell><TableCell><BadgeStatus size="sm" {...getBadgeMappingForStatus(i.status)}>{i.status}</BadgeStatus></TableCell></TableRow>)}</TableBody></Table>}
            {tipoRelatorio === "penalidades" && <Table><TableHeader><TableRow><SortableTableHead label="Empresa" onClick={() => sortPenalidades("empresa")} currentDirection={configPenalidades?.key === "empresa" ? configPenalidades.direction : null} className="sticky left-0 z-10 min-w-[200px] bg-white" /><SortableTableHead label="Processo" onClick={() => sortPenalidades("processo")} currentDirection={configPenalidades?.key === "processo" ? configPenalidades.direction : null} /><SortableTableHead label="Tipo de Penalidade" onClick={() => sortPenalidades("tipoPenalidade")} currentDirection={configPenalidades?.key === "tipoPenalidade" ? configPenalidades.direction : null} /><SortableTableHead label="Valor" onClick={() => sortPenalidades("valor")} currentDirection={configPenalidades?.key === "valor" ? configPenalidades.direction : null} /><SortableTableHead label="Motivo" onClick={() => sortPenalidades("motivo")} currentDirection={configPenalidades?.key === "motivo" ? configPenalidades.direction : null} /><SortableTableHead label="Data Aplicação" onClick={() => sortPenalidades("dataAplicacao")} currentDirection={configPenalidades?.key === "dataAplicacao" ? configPenalidades.direction : null} /><SortableTableHead label="Status" onClick={() => sortPenalidades("status")} currentDirection={configPenalidades?.key === "status" ? configPenalidades.direction : null} /></TableRow></TableHeader><TableBody>{sortedPenalidades.map((i) => <TableRow key={i.id}><TableCell className="text-black sticky left-0 z-10 bg-white">{i.empresa}</TableCell><TableCell className="text-black">{i.processo}</TableCell><TableCell className="text-gray-600">{i.tipoPenalidade}</TableCell><TableCell className="text-black">{i.valor}</TableCell><TableCell className="text-gray-600">{i.motivo}</TableCell><TableCell className="text-gray-600">{i.dataAplicacao}</TableCell><TableCell><BadgeStatus size="sm" {...getBadgeMappingForStatus(i.status)}>{i.status}</BadgeStatus></TableCell></TableRow>)}</TableBody></Table>}
            {tipoRelatorio === "prorrogacoes" && <Table><TableHeader><TableRow><SortableTableHead label="Empresa" onClick={() => sortProrrogacoes("empresa")} currentDirection={configProrrogacoes?.key === "empresa" ? configProrrogacoes.direction : null} className="sticky left-0 z-10 min-w-[200px] bg-white" /><SortableTableHead label="Contrato" onClick={() => sortProrrogacoes("processo")} currentDirection={configProrrogacoes?.key === "processo" ? configProrrogacoes.direction : null} /><SortableTableHead label="Vencimento Original" onClick={() => sortProrrogacoes("dataVencimentoOriginal")} currentDirection={configProrrogacoes?.key === "dataVencimentoOriginal" ? configProrrogacoes.direction : null} /><SortableTableHead label="Nova Data" onClick={() => sortProrrogacoes("novaDataVencimento")} currentDirection={configProrrogacoes?.key === "novaDataVencimento" ? configProrrogacoes.direction : null} /><SortableTableHead label="Prazo Adicional" onClick={() => sortProrrogacoes("prazoAdicional")} currentDirection={configProrrogacoes?.key === "prazoAdicional" ? configProrrogacoes.direction : null} /><SortableTableHead label="Data Solicitação" onClick={() => sortProrrogacoes("dataSolicitacao")} currentDirection={configProrrogacoes?.key === "dataSolicitacao" ? configProrrogacoes.direction : null} /><SortableTableHead label="Justificativa" onClick={() => sortProrrogacoes("justificativa")} currentDirection={configProrrogacoes?.key === "justificativa" ? configProrrogacoes.direction : null} /><SortableTableHead label="Status" onClick={() => sortProrrogacoes("status")} currentDirection={configProrrogacoes?.key === "status" ? configProrrogacoes.direction : null} /></TableRow></TableHeader><TableBody>{sortedProrrogacoes.map((i) => <TableRow key={i.id}><TableCell className="text-black sticky left-0 z-10 bg-white">{i.empresa}</TableCell><TableCell className="text-black">{i.processo}</TableCell><TableCell className="text-gray-600">{i.dataVencimentoOriginal}</TableCell><TableCell className="text-black">{i.novaDataVencimento}</TableCell><TableCell className="text-gray-600">{i.prazoAdicional}</TableCell><TableCell className="text-gray-600">{i.dataSolicitacao}</TableCell><TableCell className="text-gray-600">{i.justificativa}</TableCell><TableCell><BadgeStatus size="sm" {...getBadgeMappingForStatus(i.status)}>{i.status}</BadgeStatus></TableCell></TableRow>)}</TableBody></Table>}
            {tipoRelatorio === "trps" && <Table><TableHeader><TableRow><SortableTableHead label="Número TRP" onClick={() => sortTRPs("numeroTRP")} currentDirection={configTRPs?.key === "numeroTRP" ? configTRPs.direction : null} className="sticky left-0 z-10 min-w-[180px] bg-white" /><SortableTableHead label="Empresa" onClick={() => sortTRPs("empresa")} currentDirection={configTRPs?.key === "empresa" ? configTRPs.direction : null} className="min-w-[220px]" /><SortableTableHead label="CNPJ" onClick={() => sortTRPs("cnpj")} currentDirection={configTRPs?.key === "cnpj" ? configTRPs.direction : null} /><SortableTableHead label="Vigência" onClick={() => sortTRPs("vigencia")} currentDirection={configTRPs?.key === "vigencia" ? configTRPs.direction : null} /><SortableTableHead label="Valor" onClick={() => sortTRPs("valorContratado")} currentDirection={configTRPs?.key === "valorContratado" ? configTRPs.direction : null} /><SortableTableHead label="Status" onClick={() => sortTRPs("status")} currentDirection={configTRPs?.key === "status" ? configTRPs.direction : null} /><SortableTableHead label="Aditivos" onClick={() => sortTRPs("aditivos")} currentDirection={configTRPs?.key === "aditivos" ? configTRPs.direction : null} /></TableRow></TableHeader><TableBody>{sortedTRPs.map((i) => <TableRow key={i.id}><TableCell className="text-black sticky left-0 z-10 bg-white">{i.numeroTRP}</TableCell><TableCell className="text-black">{i.empresa}</TableCell><TableCell className="text-gray-600">{i.cnpj}</TableCell><TableCell className="text-gray-600">{i.vigencia}</TableCell><TableCell className="text-black">{i.valorContratado}</TableCell><TableCell><BadgeStatus size="sm" {...getBadgeMappingForStatus(i.status)}>{i.status}</BadgeStatus></TableCell><TableCell className="text-gray-600">{i.aditivos}</TableCell></TableRow>)}</TableBody></Table>}
            {tipoRelatorio === "fornecedores" && <Table><TableHeader><TableRow><SortableTableHead label="Nome/Razão Social" onClick={() => sortFornecedores("nome")} currentDirection={configFornecedores?.key === "nome" ? configFornecedores.direction : null} className="sticky left-0 z-10 min-w-[200px] bg-white" /><SortableTableHead label="CNPJ" onClick={() => sortFornecedores("cnpj")} currentDirection={configFornecedores?.key === "cnpj" ? configFornecedores.direction : null} /><SortableTableHead label="Categoria" onClick={() => sortFornecedores("categoria")} currentDirection={configFornecedores?.key === "categoria" ? configFornecedores.direction : null} /><SortableTableHead label="Total Contratos" onClick={() => sortFornecedores("totalContratos")} currentDirection={configFornecedores?.key === "totalContratos" ? configFornecedores.direction : null} /><SortableTableHead label="Valor Total" onClick={() => sortFornecedores("valorTotal")} currentDirection={configFornecedores?.key === "valorTotal" ? configFornecedores.direction : null} /><SortableTableHead label="Atestados" onClick={() => sortFornecedores("atestados")} currentDirection={configFornecedores?.key === "atestados" ? configFornecedores.direction : null} /><SortableTableHead label="Status" onClick={() => sortFornecedores("status")} currentDirection={configFornecedores?.key === "status" ? configFornecedores.direction : null} /><SortableTableHead label="Data Registro" onClick={() => sortFornecedores("dataRegistro")} currentDirection={configFornecedores?.key === "dataRegistro" ? configFornecedores.direction : null} /></TableRow></TableHeader><TableBody>{sortedFornecedores.map((i) => <TableRow key={i.id}><TableCell className="text-black sticky left-0 z-10 bg-white">{i.nome}</TableCell><TableCell className="text-black">{i.cnpj}</TableCell><TableCell className="text-gray-600">{i.categoria}</TableCell><TableCell className="text-gray-600">{i.totalContratos}</TableCell><TableCell className="text-black">{i.valorTotal}</TableCell><TableCell className="text-gray-600">{i.atestados}</TableCell><TableCell><BadgeStatus size="sm" {...getBadgeMappingForStatus(i.status)}>{i.status}</BadgeStatus></TableCell><TableCell className="text-gray-600">{i.dataRegistro}</TableCell></TableRow>)}</TableBody></Table>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
