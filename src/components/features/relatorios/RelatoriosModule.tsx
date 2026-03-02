"use client";

import { useMemo, useState } from "react";
import { BarChart3, Calendar, DollarSign, FileCheck, FileSpreadsheet, FileText, Filter } from "lucide-react";
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

type TipoRelatorio =
  | "processos"
  | "desistencias"
  | "realinhamento"
  | "penalidades"
  | "prorrogacoes"
  | "fornecedores"
  | "contratos"
  | "trps";

const dadosProcessos = [
  { id: 1, empresa: "Empresa ABC Ltda", processo: "2024-001", tipo: "Pregão Eletrônico", valor: "R$ 125.000,00", status: "Aprovado", dataInicio: "15/01/2024", dataFim: "15/07/2024", responsavel: "Maria Silva" },
  { id: 2, empresa: "Fornecedor XYZ S.A", processo: "2024-002", tipo: "Tomada de Preços", valor: "R$ 89.500,00", status: "Em Análise", dataInicio: "18/01/2024", dataFim: "18/08/2024", responsavel: "João Santos" },
  { id: 3, empresa: "Serviços DEF Eireli", processo: "2024-003", tipo: "Convite", valor: "R$ 45.200,00", status: "Rejeitado", dataInicio: "20/01/2024", dataFim: "20/07/2024", responsavel: "Ana Costa" },
  { id: 4, empresa: "Tecnologia GHI Ltda", processo: "2024-004", tipo: "Pregão Eletrônico", valor: "R$ 210.000,00", status: "Pendente", dataInicio: "22/01/2024", dataFim: "22/10/2024", responsavel: "Carlos Oliveira" },
];

const dadosDesistencias = [
  { id: 101, empresa: "Fornecedor Beta Ltda", processo: "2024-015", motivo: "Preço inviável", dataDesistencia: "10/02/2024", valorEstimado: "R$ 45.000,00", responsavel: "Carlos Oliveira" },
  { id: 102, empresa: "Empresa Gama S.A", processo: "2024-018", motivo: "Não atende requisitos técnicos", dataDesistencia: "15/02/2024", valorEstimado: "R$ 78.500,00", responsavel: "Maria Silva" },
  { id: 103, empresa: "Serviços Delta Eireli", processo: "2024-020", motivo: "Prazo de entrega incompatível", dataDesistencia: "22/02/2024", valorEstimado: "R$ 32.000,00", responsavel: "João Santos" },
];

const dadosRealinhamento = [
  { id: 201, empresa: "Empresa ABC Ltda", processo: "2024-007", valorOriginal: "R$ 125.000,00", valorRealinhado: "R$ 145.000,00", percentualAumento: "+16%", dataRealinhamento: "05/03/2024", justificativa: "Aumento no custo de matéria-prima", status: "Aprovado" },
  { id: 202, empresa: "Tecnologia GHI Ltda", processo: "2024-011", valorOriginal: "R$ 89.000,00", valorRealinhado: "R$ 98.500,00", percentualAumento: "+10.7%", dataRealinhamento: "12/03/2024", justificativa: "Inflação e reajuste salarial", status: "Aprovado" },
  { id: 203, empresa: "Fornecedor XYZ S.A", processo: "2024-013", valorOriginal: "R$ 56.000,00", valorRealinhado: "R$ 62.000,00", percentualAumento: "+10.7%", dataRealinhamento: "18/03/2024", justificativa: "Aumento de combustíveis", status: "Em Análise" },
];

const dadosPenalidades = [
  { id: 301, empresa: "Construtora Epsilon Ltda", processo: "2024-009", tipoPenalidade: "Multa", valor: "R$ 15.000,00", motivo: "Atraso na entrega", dataAplicacao: "08/03/2024", status: "Aplicada" },
  { id: 302, empresa: "Fornecedor Zeta S.A", processo: "2024-012", tipoPenalidade: "Advertência", valor: "-", motivo: "Qualidade do produto abaixo do esperado", dataAplicacao: "15/03/2024", status: "Aplicada" },
  { id: 303, empresa: "Serviços Theta Eireli", processo: "2024-014", tipoPenalidade: "Suspensão Temporária", valor: "-", motivo: "Descumprimento de cláusula contratual", dataAplicacao: "22/03/2024", status: "Em Recurso" },
];

const dadosProrrogacoes = [
  { id: 401, empresa: "Empresa ABC Ltda", processo: "CONT-2023-045", dataVencimentoOriginal: "30/03/2024", novaDataVencimento: "30/09/2024", prazoAdicional: "6 meses", dataSolicitacao: "10/02/2024", justificativa: "Continuidade do serviço essencial", status: "Aprovada" },
  { id: 402, empresa: "Tecnologia GHI Ltda", processo: "CONT-2023-032", dataVencimentoOriginal: "15/04/2024", novaDataVencimento: "15/10/2024", prazoAdicional: "6 meses", dataSolicitacao: "20/02/2024", justificativa: "Necessidade de manutenção contínua", status: "Aprovada" },
  { id: 403, empresa: "Fornecedor XYZ S.A", processo: "CONT-2024-001", dataVencimentoOriginal: "30/05/2024", novaDataVencimento: "30/08/2024", prazoAdicional: "3 meses", dataSolicitacao: "05/03/2024", justificativa: "Processo licitatório substituto em andamento", status: "Em Análise" },
];

const dadosContratos = [
  { id: 501, numeroContrato: "CONT-2024-001", empresa: "Empresa ABC Ltda", objeto: "Fornecimento de Material de Escritório", valor: "R$ 125.000,00", dataInicio: "01/01/2024", dataTermino: "31/12/2024", status: "Ativo", tipo: "Fornecimento" },
  { id: 502, numeroContrato: "CONT-2024-002", empresa: "Tecnologia GHI Ltda", objeto: "Manutenção de Sistema de TI", valor: "R$ 210.000,00", dataInicio: "15/01/2024", dataTermino: "15/01/2025", status: "Ativo", tipo: "Serviço" },
  { id: 503, numeroContrato: "CONT-2023-045", empresa: "Fornecedor XYZ S.A", objeto: "Limpeza e Conservação", valor: "R$ 89.500,00", dataInicio: "01/06/2023", dataTermino: "31/05/2024", status: "Ativo", tipo: "Serviço" },
  { id: 504, numeroContrato: "CONT-2023-032", empresa: "Serviços DEF Eireli", objeto: "Segurança Patrimonial", valor: "R$ 156.000,00", dataInicio: "01/03/2023", dataTermino: "28/02/2024", status: "Inativo", tipo: "Serviço" },
];

const dadosTRPs = [
  { id: 701, numeroTRP: "TRP-2024-001", empresa: "Empresa ABC Ltda", cnpj: "12.345.678/0001-90", numeroProcesso: "PROC-2024-021", valorContratado: "R$ 315.000,00", vigencia: "12 meses", status: "Ativo", aditivos: 1 },
  { id: 702, numeroTRP: "TRP-2024-002", empresa: "Tecnologia GHI Ltda", cnpj: "55.444.333/0001-22", numeroProcesso: "PROC-2024-017", valorContratado: "R$ 420.000,00", vigencia: "18 meses", status: "Ativo", aditivos: 0 },
  { id: 703, numeroTRP: "TRP-2023-011", empresa: "Fornecedor XYZ S.A", cnpj: "98.765.432/0001-10", numeroProcesso: "PROC-2023-198", valorContratado: "R$ 167.000,00", vigencia: "24 meses", status: "Em Análise", aditivos: 2 },
  { id: 704, numeroTRP: "TRP-2023-006", empresa: "Serviços DEF Eireli", cnpj: "11.222.333/0001-44", numeroProcesso: "PROC-2023-144", valorContratado: "R$ 98.000,00", vigencia: "12 meses", status: "Inativo", aditivos: 1 },
];

const dadosFornecedores = [
  { id: 601, nome: "Empresa ABC Ltda", cnpj: "12.345.678/0001-90", categoria: "Produtos", totalContratos: 3, valorTotal: "R$ 315.000,00", status: "Ativo", dataRegistro: "15/01/2023", atestados: 5 },
  { id: 602, nome: "Tecnologia GHI Ltda", cnpj: "55.444.333/0001-22", categoria: "Tecnologia", totalContratos: 2, valorTotal: "R$ 420.000,00", status: "Ativo", dataRegistro: "10/10/2022", atestados: 8 },
  { id: 603, nome: "Fornecedor XYZ S.A", cnpj: "98.765.432/0001-10", categoria: "Serviços", totalContratos: 4, valorTotal: "R$ 567.000,00", status: "Ativo", dataRegistro: "20/12/2022", atestados: 6 },
  { id: 604, nome: "Serviços DEF Eireli", cnpj: "11.222.333/0001-44", categoria: "Serviços", totalContratos: 1, valorTotal: "R$ 156.000,00", status: "Inativo", dataRegistro: "05/11/2022", atestados: 3 },
];

export function RelatoriosModule() {
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>("processos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [, setEmpresaFilter] = useState("todas");
  const [categoriaFilter, setCategoriaFilter] = useState("todas");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const normalizarTexto = (valor: string) =>
    valor
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const normalizarStatus = (valor: string) => normalizarTexto(valor).replace(/[\s_]+/g, "-");

  const parseData = (valor?: string): Date | null => {
    if (!valor) return null;
    if (valor.includes("/")) {
      const [dia, mes, ano] = valor.split("/").map(Number);
      if (!dia || !mes || !ano) return null;
      return new Date(ano, mes - 1, dia);
    }
    if (valor.includes("-")) {
      const [ano, mes, dia] = valor.split("-").map(Number);
      if (!dia || !mes || !ano) return null;
      return new Date(ano, mes - 1, dia);
    }
    return null;
  };

  const getDataReferencia = (item: Record<string, unknown>, tipo: TipoRelatorio): string | undefined => {
    switch (tipo) {
      case "processos":
      case "contratos":
        return item.dataInicio as string | undefined;
      case "desistencias":
        return item.dataDesistencia as string | undefined;
      case "realinhamento":
        return item.dataRealinhamento as string | undefined;
      case "penalidades":
        return item.dataAplicacao as string | undefined;
      case "prorrogacoes":
        return item.dataSolicitacao as string | undefined;
      case "fornecedores":
        return item.dataRegistro as string | undefined;
      default:
        return undefined;
    }
  };

  const filtrarDadosPorTipo = <T extends Record<string, unknown>>(dados: T[], tipo: TipoRelatorio): T[] => {
    return dados.filter((item) => {
      const matchesStatus =
        statusFilter === "todos" ||
        !("status" in item) ||
        (typeof item.status === "string" && normalizarStatus(item.status) === normalizarStatus(statusFilter));

      const matchesCategoria =
        categoriaFilter === "todas" ||
        !("categoria" in item) ||
        (typeof item.categoria === "string" && normalizarTexto(item.categoria) === normalizarTexto(categoriaFilter));

      const dataReferencia = getDataReferencia(item, tipo);
      const dataItem = parseData(dataReferencia);
      const dataInicioFiltro = parseData(dataInicio);
      const dataFimFiltro = parseData(dataFim);

      const matchesDataInicio = !dataInicio || !dataItem || !dataInicioFiltro || dataItem >= dataInicioFiltro;
      const matchesDataFim = !dataFim || !dataItem || !dataFimFiltro || dataItem <= dataFimFiltro;

      return matchesStatus && matchesCategoria && matchesDataInicio && matchesDataFim;
    });
  };

  const dadosProcessosFiltrados = useMemo(() => filtrarDadosPorTipo(dadosProcessos, "processos"), [statusFilter, categoriaFilter, dataInicio, dataFim]);
  const dadosDesistenciasFiltrados = useMemo(() => filtrarDadosPorTipo(dadosDesistencias, "desistencias"), [statusFilter, categoriaFilter, dataInicio, dataFim]);
  const dadosRealinhamentoFiltrados = useMemo(() => filtrarDadosPorTipo(dadosRealinhamento, "realinhamento"), [statusFilter, categoriaFilter, dataInicio, dataFim]);
  const dadosPenalidadesFiltrados = useMemo(() => filtrarDadosPorTipo(dadosPenalidades, "penalidades"), [statusFilter, categoriaFilter, dataInicio, dataFim]);
  const dadosProrrogacoesFiltrados = useMemo(() => filtrarDadosPorTipo(dadosProrrogacoes, "prorrogacoes"), [statusFilter, categoriaFilter, dataInicio, dataFim]);
  const dadosContratosFiltrados = useMemo(() => filtrarDadosPorTipo(dadosContratos, "contratos"), [statusFilter, categoriaFilter, dataInicio, dataFim]);
  const dadosTRPsFiltrados = useMemo(() => filtrarDadosPorTipo(dadosTRPs, "trps"), [statusFilter, categoriaFilter, dataInicio, dataFim]);
  const dadosFornecedoresFiltrados = useMemo(() => filtrarDadosPorTipo(dadosFornecedores, "fornecedores"), [statusFilter, categoriaFilter, dataInicio, dataFim]);

  const { items: sortedProcessos, requestSort: sortProcessos, sortConfig: configProcessos } = useTableSort(dadosProcessosFiltrados);
  const { items: sortedDesistencias, requestSort: sortDesistencias, sortConfig: configDesistencias } = useTableSort(dadosDesistenciasFiltrados);
  const { items: sortedRealinhamento, requestSort: sortRealinhamento, sortConfig: configRealinhamento } = useTableSort(dadosRealinhamentoFiltrados);
  const { items: sortedPenalidades, requestSort: sortPenalidades, sortConfig: configPenalidades } = useTableSort(dadosPenalidadesFiltrados);
  const { items: sortedProrrogacoes, requestSort: sortProrrogacoes, sortConfig: configProrrogacoes } = useTableSort(dadosProrrogacoesFiltrados);
  const { items: sortedContratos, requestSort: sortContratos, sortConfig: configContratos } = useTableSort(dadosContratosFiltrados);
  const { items: sortedTRPs, requestSort: sortTRPs, sortConfig: configTRPs } = useTableSort(dadosTRPsFiltrados);
  const { items: sortedFornecedores, requestSort: sortFornecedores, sortConfig: configFornecedores } = useTableSort(dadosFornecedoresFiltrados);

  const resumoEstatisticas = useMemo(
    () => ({
      totalProcessos: dadosProcessos.length,
      totalDesistencias: dadosDesistencias.length,
      totalRealinhamentos: dadosRealinhamento.length,
      totalPenalidades: dadosPenalidades.length,
      totalProrrogacoes: dadosProrrogacoes.length,
      totalContratos: dadosContratos.length,
      totalTRPs: dadosTRPs.length,
      totalFornecedores: dadosFornecedores.length,
    }),
    [],
  );

  const getDadosPorTipo = () => {
    switch (tipoRelatorio) {
      case "desistencias": return dadosDesistenciasFiltrados;
      case "realinhamento": return dadosRealinhamentoFiltrados;
      case "penalidades": return dadosPenalidadesFiltrados;
      case "prorrogacoes": return dadosProrrogacoesFiltrados;
      case "contratos": return dadosContratosFiltrados;
      case "trps": return dadosTRPsFiltrados;
      case "fornecedores": return dadosFornecedoresFiltrados;
      default: return dadosProcessosFiltrados;
    }
  };

  const filteredData = useMemo(() => getDadosPorTipo(), [
    tipoRelatorio,
    dadosProcessosFiltrados,
    dadosDesistenciasFiltrados,
    dadosRealinhamentoFiltrados,
    dadosPenalidadesFiltrados,
    dadosProrrogacoesFiltrados,
    dadosContratosFiltrados,
    dadosTRPsFiltrados,
    dadosFornecedoresFiltrados,
  ]);

  const tipoNome = {
    processos: "Processos",
    desistencias: "Histórico de Desistências",
    realinhamento: "Realinhamento de Preços",
    penalidades: "Penalidades",
    prorrogacoes: "Prorrogações de Processos",
    contratos: "Contratos",
    trps: "TRPs",
    fornecedores: "Fornecedores",
  }[tipoRelatorio];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl text-black">Relatórios</h2>
          <p className="mt-1 text-gray-600">Área de filtros, resultados e exportação de relatórios de todos os módulos</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Button className="bg-green-600 text-white hover:bg-green-700" onClick={() => toast.success(`Relatório "${tipoNome}" exportado para Excel com sucesso!`, { description: `${filteredData.length} registros foram exportados com base nos filtros aplicados.` })}>
              <FileSpreadsheet className="mr-2" size={20} />
              Exportar Excel
            </Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => toast.success(`Relatório "${tipoNome}" exportado para PDF com sucesso!`, { description: `${filteredData.length} registros foram exportados com base nos filtros aplicados.` })}>
              <FileText className="mr-2" size={20} />
              Exportar PDF
            </Button>
          </div>
          <p className="text-xs text-gray-500">* Exporta todos os registros conforme filtros aplicados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2"><BarChart3 className="text-blue-600" size={20} /></div><div><p className="text-2xl text-black">{resumoEstatisticas.totalProcessos}</p><p className="text-sm text-gray-600">Total de Processos</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-green-100 p-2"><FileCheck className="text-green-600" size={20} /></div><div><p className="text-2xl text-green-600">{resumoEstatisticas.totalContratos}</p><p className="text-sm text-gray-600">Contratos</p></div></div></CardContent></Card>
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
                  <SelectItem value="contratos">Contratos</SelectItem>
                  <SelectItem value="trps">TRPs</SelectItem>
                  <SelectItem value="fornecedores">Fornecedores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {tipoRelatorio === "processos" && (
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5"><Label>Status</Label><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Status</SelectItem><SelectItem value="aprovado">Aprovado</SelectItem><SelectItem value="em-análise">Em Análise</SelectItem><SelectItem value="rejeitado">Rejeitado</SelectItem><SelectItem value="pendente">Pendente</SelectItem></SelectContent></Select></div>
              <div className="space-y-1.5"><Label>Data Início</Label><Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Data Fim</Label><Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} /></div>
            </div>
          )}

          {(tipoRelatorio === "desistencias" || tipoRelatorio === "realinhamento" || tipoRelatorio === "penalidades" || tipoRelatorio === "prorrogacoes" || tipoRelatorio === "contratos") && (
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5"><Label>Data Início</Label><Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Data Fim</Label><Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} /></div>
            </div>
          )}

          {tipoRelatorio === "trps" && (
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5"><Label>Status</Label><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Status</SelectItem><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="em-analise">Em Análise</SelectItem><SelectItem value="inativo">Inativo</SelectItem></SelectContent></Select></div>
              <div className="space-y-1.5"><Label>Data Início</Label><Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Data Fim</Label><Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} /></div>
            </div>
          )}

          {tipoRelatorio === "fornecedores" && (
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5"><Label>Categoria</Label><Select value={categoriaFilter} onValueChange={setCategoriaFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todas">Todas as Categorias</SelectItem><SelectItem value="produtos">Produtos</SelectItem><SelectItem value="servicos">Serviços</SelectItem><SelectItem value="tecnologia">Tecnologia</SelectItem><SelectItem value="construcao">Construção</SelectItem></SelectContent></Select></div>
              <div className="space-y-1.5"><Label>Status</Label><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os Status</SelectItem><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="inativo">Inativo</SelectItem></SelectContent></Select></div>
              <div className="space-y-1.5"><Label>Data Registro</Label><Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /></div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button className="bg-[#003366] text-white hover:bg-[#002244]"><Filter className="mr-2" size={16} />Aplicar Filtros</Button>
            <Button variant="outline" onClick={() => { setStatusFilter("todos"); setEmpresaFilter("todas"); setCategoriaFilter("todas"); setDataInicio(""); setDataFim(""); toast.info("Filtros limpos"); }}>Limpar Filtros</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader className="pb-1 pt-3"><div className="flex items-center justify-between"><CardTitle className="text-xl text-black">{`Relatório de ${tipoNome}`}</CardTitle><span className="text-sm text-gray-600">{filteredData.length} registros</span></div></CardHeader>
        <CardContent className="p-4">
          <div className="w-full overflow-x-auto">
            {tipoRelatorio === "processos" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead label="Empresa" onClick={() => sortProcessos("empresa")} currentDirection={configProcessos?.key === "empresa" ? configProcessos.direction : null} className="sticky left-0 z-10 min-w-[200px] bg-white" />
                    <SortableTableHead label="Processo" onClick={() => sortProcessos("processo")} currentDirection={configProcessos?.key === "processo" ? configProcessos.direction : null} />
                    <SortableTableHead label="Tipo" onClick={() => sortProcessos("tipo")} currentDirection={configProcessos?.key === "tipo" ? configProcessos.direction : null} />
                    <SortableTableHead label="Valor" onClick={() => sortProcessos("valor")} currentDirection={configProcessos?.key === "valor" ? configProcessos.direction : null} />
                    <SortableTableHead label="Status" onClick={() => sortProcessos("status")} currentDirection={configProcessos?.key === "status" ? configProcessos.direction : null} />
                    <SortableTableHead label="Data Início" onClick={() => sortProcessos("dataInicio")} currentDirection={configProcessos?.key === "dataInicio" ? configProcessos.direction : null} />
                    <SortableTableHead label="Data Fim" onClick={() => sortProcessos("dataFim")} currentDirection={configProcessos?.key === "dataFim" ? configProcessos.direction : null} />
                    <SortableTableHead label="Responsável" onClick={() => sortProcessos("responsavel")} currentDirection={configProcessos?.key === "responsavel" ? configProcessos.direction : null} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProcessos.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="text-black sticky left-0 z-10 bg-white">{i.empresa}</TableCell>
                      <TableCell className="text-black">{i.processo}</TableCell>
                      <TableCell className="text-gray-600">{i.tipo}</TableCell>
                      <TableCell className="text-black">{i.valor}</TableCell>
                      <TableCell>
                        <BadgeStatus size="sm" {...getBadgeMappingForStatus(i.status)}>{i.status}</BadgeStatus>
                      </TableCell>
                      <TableCell className="text-gray-600">{i.dataInicio}</TableCell>
                      <TableCell className="text-gray-600">{i.dataFim}</TableCell>
                      <TableCell className="text-gray-600">{i.responsavel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {tipoRelatorio === "desistencias" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead label="Empresa" onClick={() => sortDesistencias("empresa")} currentDirection={configDesistencias?.key === "empresa" ? configDesistencias.direction : null} className="sticky left-0 z-10 min-w-[200px] bg-white" />
                    <SortableTableHead label="Processo" onClick={() => sortDesistencias("processo")} currentDirection={configDesistencias?.key === "processo" ? configDesistencias.direction : null} />
                    <SortableTableHead label="Motivo" onClick={() => sortDesistencias("motivo")} currentDirection={configDesistencias?.key === "motivo" ? configDesistencias.direction : null} />
                    <SortableTableHead label="Data Desistência" onClick={() => sortDesistencias("dataDesistencia")} currentDirection={configDesistencias?.key === "dataDesistencia" ? configDesistencias.direction : null} />
                    <SortableTableHead label="Valor Estimado" onClick={() => sortDesistencias("valorEstimado")} currentDirection={configDesistencias?.key === "valorEstimado" ? configDesistencias.direction : null} />
                    <SortableTableHead label="Responsável" onClick={() => sortDesistencias("responsavel")} currentDirection={configDesistencias?.key === "responsavel" ? configDesistencias.direction : null} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDesistencias.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="text-black sticky left-0 z-10 bg-white">{i.empresa}</TableCell>
                      <TableCell className="text-black">{i.processo}</TableCell>
                      <TableCell className="text-gray-600">{i.motivo}</TableCell>
                      <TableCell className="text-gray-600">{i.dataDesistencia}</TableCell>
                      <TableCell className="text-black">{i.valorEstimado}</TableCell>
                      <TableCell className="text-gray-600">{i.responsavel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {tipoRelatorio === "realinhamento" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead label="Empresa" onClick={() => sortRealinhamento("empresa")} currentDirection={configRealinhamento?.key === "empresa" ? configRealinhamento.direction : null} className="sticky left-0 z-10 min-w-[200px] bg-white" />
                    <SortableTableHead label="Processo" onClick={() => sortRealinhamento("processo")} currentDirection={configRealinhamento?.key === "processo" ? configRealinhamento.direction : null} />
                    <SortableTableHead label="Valor Original" onClick={() => sortRealinhamento("valorOriginal")} currentDirection={configRealinhamento?.key === "valorOriginal" ? configRealinhamento.direction : null} />
                    <SortableTableHead label="Valor Realinhado" onClick={() => sortRealinhamento("valorRealinhado")} currentDirection={configRealinhamento?.key === "valorRealinhado" ? configRealinhamento.direction : null} />
                    <SortableTableHead label="Percentual" onClick={() => sortRealinhamento("percentualAumento")} currentDirection={configRealinhamento?.key === "percentualAumento" ? configRealinhamento.direction : null} />
                    <SortableTableHead label="Data" onClick={() => sortRealinhamento("dataRealinhamento")} currentDirection={configRealinhamento?.key === "dataRealinhamento" ? configRealinhamento.direction : null} />
                    <SortableTableHead label="Justificativa" onClick={() => sortRealinhamento("justificativa")} currentDirection={configRealinhamento?.key === "justificativa" ? configRealinhamento.direction : null} />
                    <SortableTableHead label="Status" onClick={() => sortRealinhamento("status")} currentDirection={configRealinhamento?.key === "status" ? configRealinhamento.direction : null} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRealinhamento.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="text-black sticky left-0 z-10 bg-white">{i.empresa}</TableCell>
                      <TableCell className="text-black">{i.processo}</TableCell>
                      <TableCell className="text-gray-600">{i.valorOriginal}</TableCell>
                      <TableCell className="text-black">{i.valorRealinhado}</TableCell>
                      <TableCell className="text-red-600">{i.percentualAumento}</TableCell>
                      <TableCell className="text-gray-600">{i.dataRealinhamento}</TableCell>
                      <TableCell className="text-gray-600">{i.justificativa}</TableCell>
                      <TableCell>
                        <BadgeStatus size="sm" {...getBadgeMappingForStatus(i.status)}>{i.status}</BadgeStatus>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {tipoRelatorio === "penalidades" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead label="Empresa" onClick={() => sortPenalidades("empresa")} currentDirection={configPenalidades?.key === "empresa" ? configPenalidades.direction : null} className="sticky left-0 z-10 min-w-[200px] bg-white" />
                    <SortableTableHead label="Processo" onClick={() => sortPenalidades("processo")} currentDirection={configPenalidades?.key === "processo" ? configPenalidades.direction : null} />
                    <SortableTableHead label="Tipo de Penalidade" onClick={() => sortPenalidades("tipoPenalidade")} currentDirection={configPenalidades?.key === "tipoPenalidade" ? configPenalidades.direction : null} />
                    <SortableTableHead label="Valor" onClick={() => sortPenalidades("valor")} currentDirection={configPenalidades?.key === "valor" ? configPenalidades.direction : null} />
                    <SortableTableHead label="Motivo" onClick={() => sortPenalidades("motivo")} currentDirection={configPenalidades?.key === "motivo" ? configPenalidades.direction : null} />
                    <SortableTableHead label="Data Aplicação" onClick={() => sortPenalidades("dataAplicacao")} currentDirection={configPenalidades?.key === "dataAplicacao" ? configPenalidades.direction : null} />
                    <SortableTableHead label="Status" onClick={() => sortPenalidades("status")} currentDirection={configPenalidades?.key === "status" ? configPenalidades.direction : null} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPenalidades.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="text-black sticky left-0 z-10 bg-white">{i.empresa}</TableCell>
                      <TableCell className="text-black">{i.processo}</TableCell>
                      <TableCell className="text-gray-600">{i.tipoPenalidade}</TableCell>
                      <TableCell className="text-black">{i.valor}</TableCell>
                      <TableCell className="text-gray-600">{i.motivo}</TableCell>
                      <TableCell className="text-gray-600">{i.dataAplicacao}</TableCell>
                      <TableCell>
                        <BadgeStatus size="sm" {...getBadgeMappingForStatus(i.status)}>{i.status}</BadgeStatus>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {tipoRelatorio === "prorrogacoes" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead label="Empresa" onClick={() => sortProrrogacoes("empresa")} currentDirection={configProrrogacoes?.key === "empresa" ? configProrrogacoes.direction : null} className="sticky left-0 z-10 min-w-[200px] bg-white" />
                    <SortableTableHead label="Contrato" onClick={() => sortProrrogacoes("processo")} currentDirection={configProrrogacoes?.key === "processo" ? configProrrogacoes.direction : null} />
                    <SortableTableHead label="Vencimento Original" onClick={() => sortProrrogacoes("dataVencimentoOriginal")} currentDirection={configProrrogacoes?.key === "dataVencimentoOriginal" ? configProrrogacoes.direction : null} />
                    <SortableTableHead label="Nova Data" onClick={() => sortProrrogacoes("novaDataVencimento")} currentDirection={configProrrogacoes?.key === "novaDataVencimento" ? configProrrogacoes.direction : null} />
                    <SortableTableHead label="Prazo Adicional" onClick={() => sortProrrogacoes("prazoAdicional")} currentDirection={configProrrogacoes?.key === "prazoAdicional" ? configProrrogacoes.direction : null} />
                    <SortableTableHead label="Data Solicitação" onClick={() => sortProrrogacoes("dataSolicitacao")} currentDirection={configProrrogacoes?.key === "dataSolicitacao" ? configProrrogacoes.direction : null} />
                    <SortableTableHead label="Justificativa" onClick={() => sortProrrogacoes("justificativa")} currentDirection={configProrrogacoes?.key === "justificativa" ? configProrrogacoes.direction : null} />
                    <SortableTableHead label="Status" onClick={() => sortProrrogacoes("status")} currentDirection={configProrrogacoes?.key === "status" ? configProrrogacoes.direction : null} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProrrogacoes.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="text-black sticky left-0 z-10 bg-white">{i.empresa}</TableCell>
                      <TableCell className="text-black">{i.processo}</TableCell>
                      <TableCell className="text-gray-600">{i.dataVencimentoOriginal}</TableCell>
                      <TableCell className="text-black">{i.novaDataVencimento}</TableCell>
                      <TableCell className="text-gray-600">{i.prazoAdicional}</TableCell>
                      <TableCell className="text-gray-600">{i.dataSolicitacao}</TableCell>
                      <TableCell className="text-gray-600">{i.justificativa}</TableCell>
                      <TableCell>
                        <BadgeStatus size="sm" {...getBadgeMappingForStatus(i.status)}>{i.status}</BadgeStatus>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {tipoRelatorio === "contratos" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead label="Número Contrato" onClick={() => sortContratos("numeroContrato")} currentDirection={configContratos?.key === "numeroContrato" ? configContratos.direction : null} className="sticky left-0 z-10 min-w-[190px] bg-white" />
                    <SortableTableHead label="Empresa" onClick={() => sortContratos("empresa")} currentDirection={configContratos?.key === "empresa" ? configContratos.direction : null} className="min-w-[220px]" />
                    <SortableTableHead label="Objeto" onClick={() => sortContratos("objeto")} currentDirection={configContratos?.key === "objeto" ? configContratos.direction : null} className="min-w-[260px]" />
                    <SortableTableHead label="Tipo" onClick={() => sortContratos("tipo")} currentDirection={configContratos?.key === "tipo" ? configContratos.direction : null} />
                    <SortableTableHead label="Valor" onClick={() => sortContratos("valor")} currentDirection={configContratos?.key === "valor" ? configContratos.direction : null} />
                    <SortableTableHead label="Início" onClick={() => sortContratos("dataInicio")} currentDirection={configContratos?.key === "dataInicio" ? configContratos.direction : null} />
                    <SortableTableHead label="Término" onClick={() => sortContratos("dataTermino")} currentDirection={configContratos?.key === "dataTermino" ? configContratos.direction : null} />
                    <SortableTableHead label="Status" onClick={() => sortContratos("status")} currentDirection={configContratos?.key === "status" ? configContratos.direction : null} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedContratos.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="text-black sticky left-0 z-10 bg-white">{i.numeroContrato}</TableCell>
                      <TableCell className="text-black">{i.empresa}</TableCell>
                      <TableCell className="text-gray-600">{i.objeto}</TableCell>
                      <TableCell className="text-gray-600">{i.tipo}</TableCell>
                      <TableCell className="text-black">{i.valor}</TableCell>
                      <TableCell className="text-gray-600">{i.dataInicio}</TableCell>
                      <TableCell className="text-gray-600">{i.dataTermino}</TableCell>
                      <TableCell>
                        <BadgeStatus size="sm" {...getBadgeMappingForStatus(i.status)}>{i.status}</BadgeStatus>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {tipoRelatorio === "trps" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead label="Número TRP" onClick={() => sortTRPs("numeroTRP")} currentDirection={configTRPs?.key === "numeroTRP" ? configTRPs.direction : null} className="sticky left-0 z-10 min-w-[180px] bg-white" />
                    <SortableTableHead label="Empresa" onClick={() => sortTRPs("empresa")} currentDirection={configTRPs?.key === "empresa" ? configTRPs.direction : null} className="min-w-[220px]" />
                    <SortableTableHead label="CNPJ" onClick={() => sortTRPs("cnpj")} currentDirection={configTRPs?.key === "cnpj" ? configTRPs.direction : null} />
                    <SortableTableHead label="Vigência" onClick={() => sortTRPs("vigencia")} currentDirection={configTRPs?.key === "vigencia" ? configTRPs.direction : null} />
                    <SortableTableHead label="Valor" onClick={() => sortTRPs("valorContratado")} currentDirection={configTRPs?.key === "valorContratado" ? configTRPs.direction : null} />
                    <SortableTableHead label="Status" onClick={() => sortTRPs("status")} currentDirection={configTRPs?.key === "status" ? configTRPs.direction : null} />
                    <SortableTableHead label="Aditivos" onClick={() => sortTRPs("aditivos")} currentDirection={configTRPs?.key === "aditivos" ? configTRPs.direction : null} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTRPs.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="text-black sticky left-0 z-10 bg-white">{i.numeroTRP}</TableCell>
                      <TableCell className="text-black">{i.empresa}</TableCell>
                      <TableCell className="text-gray-600">{i.cnpj}</TableCell>
                      <TableCell className="text-gray-600">{i.vigencia}</TableCell>
                      <TableCell className="text-black">{i.valorContratado}</TableCell>
                      <TableCell>
                        <BadgeStatus size="sm" {...getBadgeMappingForStatus(i.status)}>{i.status}</BadgeStatus>
                      </TableCell>
                      <TableCell className="text-gray-600">{i.aditivos}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {tipoRelatorio === "fornecedores" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead label="Nome/Razão Social" onClick={() => sortFornecedores("nome")} currentDirection={configFornecedores?.key === "nome" ? configFornecedores.direction : null} className="sticky left-0 z-10 min-w-[200px] bg-white" />
                    <SortableTableHead label="CNPJ" onClick={() => sortFornecedores("cnpj")} currentDirection={configFornecedores?.key === "cnpj" ? configFornecedores.direction : null} />
                    <SortableTableHead label="Categoria" onClick={() => sortFornecedores("categoria")} currentDirection={configFornecedores?.key === "categoria" ? configFornecedores.direction : null} />
                    <SortableTableHead label="Total Contratos" onClick={() => sortFornecedores("totalContratos")} currentDirection={configFornecedores?.key === "totalContratos" ? configFornecedores.direction : null} />
                    <SortableTableHead label="Valor Total" onClick={() => sortFornecedores("valorTotal")} currentDirection={configFornecedores?.key === "valorTotal" ? configFornecedores.direction : null} />
                    <SortableTableHead label="Atestados" onClick={() => sortFornecedores("atestados")} currentDirection={configFornecedores?.key === "atestados" ? configFornecedores.direction : null} />
                    <SortableTableHead label="Status" onClick={() => sortFornecedores("status")} currentDirection={configFornecedores?.key === "status" ? configFornecedores.direction : null} />
                    <SortableTableHead label="Data Registro" onClick={() => sortFornecedores("dataRegistro")} currentDirection={configFornecedores?.key === "dataRegistro" ? configFornecedores.direction : null} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFornecedores.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="text-black sticky left-0 z-10 bg-white">{i.nome}</TableCell>
                      <TableCell className="text-black">{i.cnpj}</TableCell>
                      <TableCell className="text-gray-600">{i.categoria}</TableCell>
                      <TableCell className="text-gray-600">{i.totalContratos}</TableCell>
                      <TableCell className="text-black">{i.valorTotal}</TableCell>
                      <TableCell className="text-gray-600">{i.atestados}</TableCell>
                      <TableCell>
                        <BadgeStatus size="sm" {...getBadgeMappingForStatus(i.status)}>{i.status}</BadgeStatus>
                      </TableCell>
                      <TableCell className="text-gray-600">{i.dataRegistro}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
