"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Filter,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { BadgeStatus } from "@/components/ui/badge-status";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type TipoNotificacao = "critical" | "warning" | "success" | "info";
type StatusNotificacao = "Lida" | "Não Lida";

interface Notificacao {
  id: number;
  tipo: TipoNotificacao;
  titulo: string;
  descricao: string;
  data: string;
  status: StatusNotificacao;
}

const todasNotificacoes: Notificacao[] = [
  { id: 1, tipo: "critical", titulo: "Contrato Vencendo em 15 dias", descricao: "Contrato C-2024-001 com Empresa ABC Ltda vence em 15 dias", data: "25/01/2024 14:30", status: "Não Lida" },
  { id: 2, tipo: "warning", titulo: "Penalidade Contestada", descricao: "Fornecedor XYZ S.A contestou penalidade aplicada no processo PROC-2024-005", data: "25/01/2024 09:15", status: "Não Lida" },
  { id: 3, tipo: "success", titulo: "Processo Aprovado", descricao: "PROC-2024-008 foi aprovado e está pronto para prosseguir", data: "24/01/2024 16:45", status: "Não Lida" },
  { id: 4, tipo: "info", titulo: "Envio Automático Realizado", descricao: "Pedido enviado automaticamente para Tecnologia GHI Ltda", data: "23/01/2024 08:00", status: "Lida" },
  { id: 5, tipo: "critical", titulo: "Prorrogação Pendente", descricao: "Solicitação de prorrogação do processo PROC-2023-142 aguarda análise", data: "22/01/2024 11:20", status: "Lida" },
  { id: 6, tipo: "critical", titulo: "Contrato Vencendo em 30 dias", descricao: "Contrato C-2023-089 com Fornecedor XYZ S.A vence em 30 dias", data: "21/01/2024 14:30", status: "Lida" },
  { id: 7, tipo: "success", titulo: "Processo Rejeitado", descricao: "PROC-2024-003 foi rejeitado. Verifique os motivos e tome as ações necessárias", data: "20/01/2024 10:15", status: "Lida" },
  { id: 8, tipo: "warning", titulo: "Realinhamento de Preços Solicitado", descricao: "Empresa ABC Ltda solicitou realinhamento de preços no processo PROC-2023-098", data: "19/01/2024 15:40", status: "Lida" },
  { id: 9, tipo: "info", titulo: "Backup Automático Concluído", descricao: "Backup automático do sistema foi concluído com sucesso", data: "19/01/2024 02:00", status: "Lida" },
  { id: 10, tipo: "success", titulo: "Novo Fornecedor Cadastrado", descricao: "Serviços DEF Ltda foi cadastrado com sucesso no sistema", data: "18/01/2024 13:25", status: "Lida" },
];

interface AuditoriaModuleProps {
  perfil?: string;
}

export function AuditoriaModule({ perfil }: AuditoriaModuleProps) {
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const filteredNotificacoes = todasNotificacoes.filter((notif) => {
    const matchesSearch =
      notif.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === "todos" || notif.tipo === tipoFilter;
    const matchesStatus =
      statusFilter === "todos" ||
      (statusFilter === "lida" && notif.status === "Lida") ||
      (statusFilter === "nao-lida" && notif.status === "Não Lida");
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const { items: sortedNotificacoes, requestSort: sortNotificacoes, sortConfig: configNotificacoes } = useTableSort(filteredNotificacoes);

  const stats = useMemo(
    () => ({
      total: todasNotificacoes.length,
      naoLidas: todasNotificacoes.filter((n) => n.status === "Não Lida").length,
      criticas: todasNotificacoes.filter((n) => n.tipo === "critical").length,
      lidas: todasNotificacoes.filter((n) => n.status === "Lida").length,
    }),
    [],
  );

  const getTipoBadge = (tipo: TipoNotificacao) => {
    if (tipo === "critical") return { intent: "danger", weight: "heavy", label: "Crítico" } as const;
    if (tipo === "warning") return { intent: "warning", weight: "medium", label: "Aviso" } as const;
    if (tipo === "success") return { intent: "success", weight: "medium", label: "Sucesso" } as const;
    return { intent: "info", weight: "medium", label: "Informação" } as const;
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredNotificacoes.map((n) => n.id) : []);
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) setSelectedIds((prev) => [...prev, id]);
    else setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
  };

  const handleMarcarComoLida = () => {
    toast.success(`${selectedIds.length} notificações marcadas como lidas.`);
    setSelectedIds([]);
  };

  const handleExcluirSelecionados = () => {
    toast.success(`${selectedIds.length} notificações excluídas.`);
    setSelectedIds([]);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6" data-perfil={perfil}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Auditoria e Logs</h2>
          <p className="mt-1 text-gray-600">Histórico completo de notificações e atividades do sistema</p>
        </div>
        <Button className="bg-[#003366] text-white hover:bg-[#002244]" onClick={() => toast.success("Logs exportados")}>
          <Download className="mr-2" size={16} />
          Exportar Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total de Notificações</p><p className="text-2xl text-[#003366]">{stats.total}</p></div><FileText className="text-[#003366]" size={32} /></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Não Lidas</p><p className="text-2xl text-red-600">{stats.naoLidas}</p></div><AlertCircle className="text-red-600" size={32} /></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Críticas</p><p className="text-2xl text-orange-600">{stats.criticas}</p></div><Clock className="text-orange-600" size={32} /></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Lidas</p><p className="text-2xl text-green-600">{stats.lidas}</p></div><CheckCircle className="text-green-600" size={32} /></div></CardContent></Card>
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
              <Input className="pl-10" placeholder="Buscar notificação..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="info">Informação</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="nao-lida">Não Lida</SelectItem>
                <SelectItem value="lida">Lida</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setTipoFilter("todos"); setStatusFilter("todos"); }}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 py-2 text-base font-normal">
              <Calendar className="text-[#003366]" size={20} />
              Histórico de Notificações ({filteredNotificacoes.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-[#003366] text-[#003366] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleMarcarComoLida}
                disabled={selectedIds.length === 0}
              >
                <Check className="mr-2" size={16} />
                Marcar como Lida ({selectedIds.length})
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={selectedIds.length === 0}
                  >
                    <Trash2 className="mr-2" size={16} />
                    Excluir ({selectedIds.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir <strong>{selectedIds.length}</strong>{" "}
                      {selectedIds.length === 1 ? "notificação selecionada" : "notificações selecionadas"}? Esta ação
                      não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={handleExcluirSelecionados}>
                      Excluir Notificações
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-[#003366]">
                <TableRow>
                  <TableHead className="w-[50px] text-white">
                    <Checkbox
                      checked={selectedIds.length === filteredNotificacoes.length && filteredNotificacoes.length > 0}
                      onCheckedChange={(v) => handleSelectAll(v as boolean)}
                      className="border-white data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-[#003366]"
                    />
                  </TableHead>
                  <SortableTableHead
                    label="Tipo"
                    onClick={() => sortNotificacoes("tipo")}
                    currentDirection={configNotificacoes?.key === "tipo" ? configNotificacoes.direction : null}
                    className="min-w-[140px] text-white"
                  />
                  <SortableTableHead
                    label="Título"
                    onClick={() => sortNotificacoes("titulo")}
                    currentDirection={configNotificacoes?.key === "titulo" ? configNotificacoes.direction : null}
                    className="min-w-[250px] text-white"
                  />
                  <SortableTableHead
                    label="Descrição"
                    onClick={() => sortNotificacoes("descricao")}
                    currentDirection={configNotificacoes?.key === "descricao" ? configNotificacoes.direction : null}
                    className="w-[350px] text-white"
                  />
                  <SortableTableHead
                    label="Data/Hora"
                    onClick={() => sortNotificacoes("data")}
                    currentDirection={configNotificacoes?.key === "data" ? configNotificacoes.direction : null}
                    className="min-w-[160px] text-white"
                  />
                  <SortableTableHead
                    label="Status"
                    onClick={() => sortNotificacoes("status")}
                    currentDirection={configNotificacoes?.key === "status" ? configNotificacoes.direction : null}
                    className="min-w-[120px] text-white"
                  />
                  <TableHead className="min-w-[120px] text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedNotificacoes.map((notif) => {
                  const tipoBadge = getTipoBadge(notif.tipo);
                  const isSelected = selectedIds.includes(notif.id);
                  return (
                    <TableRow key={notif.id} className={notif.status === "Não Lida" ? "bg-blue-50/30" : ""}>
                      <TableCell>
                        <Checkbox checked={isSelected} onCheckedChange={(v) => handleSelectOne(notif.id, v as boolean)} />
                      </TableCell>
                      <TableCell>
                        <BadgeStatus size="sm" intent={tipoBadge.intent} weight={tipoBadge.weight}>
                          {tipoBadge.label}
                        </BadgeStatus>
                      </TableCell>
                      <TableCell className={notif.status === "Não Lida" ? "text-black" : "text-gray-600"}>{notif.titulo}</TableCell>
                      <TableCell className="text-gray-600">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[350px] cursor-help truncate">{notif.descricao}</div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md" side="top">{notif.descricao}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-gray-600">{notif.data}</TableCell>
                      <TableCell>
                        <BadgeStatus size="sm" intent={notif.status === "Não Lida" ? "info" : "neutral"} weight="light">
                          {notif.status}
                        </BadgeStatus>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Marcar como lida" disabled={notif.status === "Lida"}>
                            <Check size={16} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="h-8 w-8 border-red-200 p-0 text-red-600 hover:bg-red-50 hover:text-red-700" title="Remover">
                                <Trash2 size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a notificação <strong>"{notif.titulo}"</strong>? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700">Excluir Notificação</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
