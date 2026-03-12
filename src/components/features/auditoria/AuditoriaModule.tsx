"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Calendar, Download, FileText, Filter, Search } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BadgeStatus } from "@/components/ui/badge-status";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { getLogs, type AuditoriaLog } from "@/services/auditoriaService";

interface AuditoriaModuleProps {
  perfil?: string;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

function getActionBadge(acao: string) {
  if (acao === "INSERT") return { intent: "success", label: "Insert" } as const;
  if (acao === "UPDATE") return { intent: "warning", label: "Update" } as const;
  if (acao === "DELETE") return { intent: "danger", label: "Delete" } as const;
  return { intent: "neutral", label: acao } as const;
}

function prettyJson(value: Record<string, unknown> | null) {
  if (!value) return "Nenhum dado disponível.";
  return JSON.stringify(value, null, 2);
}

export function AuditoriaModule({ perfil }: AuditoriaModuleProps) {
  const { currentProfile } = useAuth();
  const [tableFilter, setTableFilter] = useState("todas");
  const [actionFilter, setActionFilter] = useState("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditoriaLog | null>(null);

  const isAdmin = currentProfile === "admin" || perfil === "admin";

  const loadLogs = useCallback(async () => {
    if (!isAdmin) {
      setLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getLogs({
        tabela: tableFilter === "todas" ? undefined : tableFilter,
        acao: actionFilter === "todas" ? undefined : actionFilter,
      });
      setLogs(data);
    } catch (error) {
      toast.error("Erro ao carregar logs de auditoria", {
        description: error instanceof Error ? error.message : "Não foi possível carregar os registros.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter, isAdmin, tableFilter]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        const termo = searchTerm.toLowerCase();
        return (
          searchTerm === "" ||
          log.tabela.toLowerCase().includes(termo) ||
          log.acao.toLowerCase().includes(termo) ||
          (log.registro_id || "").toLowerCase().includes(termo)
        );
      }),
    [logs, searchTerm]
  );

  const { items: sortedLogs, requestSort: sortLogs, sortConfig: configLogs } = useTableSort(filteredLogs);

  const stats = useMemo(
    () => ({
      total: logs.length,
      inserts: logs.filter((log) => log.acao === "INSERT").length,
      updates: logs.filter((log) => log.acao === "UPDATE").length,
      deletes: logs.filter((log) => log.acao === "DELETE").length,
    }),
    [logs]
  );

  if (!isAdmin) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card className="border border-gray-200">
          <CardContent className="py-10 text-center text-gray-500">
            Esta tela é restrita ao perfil administrador.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6" data-perfil={perfil}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Auditoria e Logs</h2>
          <p className="mt-1 text-gray-600">Histórico completo de mudanças sensíveis do sistema</p>
        </div>
        <Button className="bg-[#003366] text-white hover:bg-[#002244]" onClick={() => toast.success("Exporte os dados usando os filtros atuais.")}>
          <Download className="mr-2" size={16} />
          Exportar Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total de Logs</p><p className="text-2xl text-[#003366]">{stats.total}</p></div><FileText className="text-[#003366]" size={32} /></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Inserções</p><p className="text-2xl text-green-600">{stats.inserts}</p></div><AlertCircle className="text-green-600" size={32} /></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Atualizações</p><p className="text-2xl text-orange-600">{stats.updates}</p></div><Calendar className="text-orange-600" size={32} /></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Exclusões</p><p className="text-2xl text-red-600">{stats.deletes}</p></div><AlertCircle className="text-red-600" size={32} /></div></CardContent></Card>
      </div>

      <Card className="border border-gray-200">
        <CardHeader className="pb-1 pt-3">
          <CardTitle className="flex items-center gap-2 px-0 py-2 text-xl text-black">
            <Filter className="text-[#003366]" size={20} />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-6 pt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input className="pl-10" placeholder="Buscar por tabela, ação ou registro..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger><SelectValue placeholder="Tabela" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Tabelas</SelectItem>
                <SelectItem value="processos">Processos</SelectItem>
                <SelectItem value="contratos">Contratos</SelectItem>
                <SelectItem value="penalidades">Penalidades</SelectItem>
                <SelectItem value="fornecedores">Fornecedores</SelectItem>
                <SelectItem value="profiles">Profiles</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger><SelectValue placeholder="Ação" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Ações</SelectItem>
                <SelectItem value="INSERT">Insert</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setTableFilter("todas"); setActionFilter("todas"); }}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <CardTitle className="flex items-center gap-2 py-2 text-base font-normal">
            <Calendar className="text-[#003366]" size={20} />
            Histórico de Auditoria ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-[#003366]">
                <TableRow>
                  <SortableTableHead label="Ação" onClick={() => sortLogs("acao")} currentDirection={configLogs?.key === "acao" ? configLogs.direction : null} className="min-w-[140px] text-white" />
                  <SortableTableHead label="Tabela" onClick={() => sortLogs("tabela")} currentDirection={configLogs?.key === "tabela" ? configLogs.direction : null} className="min-w-[180px] text-white" />
                  <SortableTableHead label="Registro" onClick={() => sortLogs("registro_id")} currentDirection={configLogs?.key === "registro_id" ? configLogs.direction : null} className="min-w-[220px] text-white" />
                  <TableHead className="min-w-[180px] text-white">Usuário</TableHead>
                  <TableHead className="min-w-[160px] text-white">IP</TableHead>
                  <SortableTableHead label="Data/Hora" onClick={() => sortLogs("criado_em")} currentDirection={configLogs?.key === "criado_em" ? configLogs.direction : null} className="min-w-[180px] text-white" />
                  <TableHead className="min-w-[120px] text-white">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLogs.map((log) => {
                  const badge = getActionBadge(log.acao);
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <BadgeStatus size="sm" intent={badge.intent} weight="medium">
                          {badge.label}
                        </BadgeStatus>
                      </TableCell>
                      <TableCell className="text-black">{log.tabela}</TableCell>
                      <TableCell className="text-gray-600">{log.registro_id || "-"}</TableCell>
                      <TableCell className="text-gray-600">{log.usuario?.nome || log.usuario?.email || log.usuario_id || "Sistema"}</TableCell>
                      <TableCell className="text-gray-600 whitespace-nowrap">{log.ip || "-"}</TableCell>
                      <TableCell className="text-gray-600 whitespace-nowrap">{formatDate(log.criado_em)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => setSelectedLog(log)}>
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!isLoading && sortedLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      Nenhum log encontrado para os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
            <DialogDescription>
              Compare os dados anteriores e os dados novos do registro auditado.
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
                <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Ação</p><p className="text-black mt-1">{selectedLog.acao}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Tabela</p><p className="text-black mt-1">{selectedLog.tabela}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Registro</p><p className="text-black mt-1 break-all">{selectedLog.registro_id || "-"}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Usuário</p><p className="text-black mt-1">{selectedLog.usuario?.nome || selectedLog.usuario?.email || selectedLog.usuario_id || "Sistema"}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-sm text-gray-600">IP</p><p className="text-black mt-1">{selectedLog.ip || "-"}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Data</p><p className="text-black mt-1">{formatDate(selectedLog.criado_em)}</p></CardContent></Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Dados Anteriores</CardTitle></CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-50 border rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">{prettyJson(selectedLog.dados_anteriores)}</pre>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Dados Novos</CardTitle></CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-50 border rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">{prettyJson(selectedLog.dados_novos)}</pre>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
