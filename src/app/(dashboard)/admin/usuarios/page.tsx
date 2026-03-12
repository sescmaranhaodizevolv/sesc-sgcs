"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit,
  FileSignature,
  Plus,
  Search,
  Shield,
  ShoppingCart,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BadgeStatus } from "@/components/ui/badge-status";
import { getBadgeMappingForPerfil, getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  criarUsuario,
  deleteUsuario,
  getUsuarios,
  type UsuarioItem,
  type UsuarioRoleUi,
  type UsuarioStatusUi,
  updateUsuario,
} from "@/services/usuariosService";

const permissoesPorPerfil: Record<UsuarioRoleUi, string[]> = {
  Administrador: [
    "Gerenciar todos os processos",
    "Cadastrar e editar usuários",
    "Aplicar penalidades",
    "Gerar relatórios completos",
    "Configurar sistema",
    "Excluir registros",
  ],
  "Comprador/Responsável": [
    "Conduzir processos de compras e cotações",
    "Comparar propostas e registrar decisões",
    "Atualizar etapas operacionais do processo",
    "Gerar relatórios operacionais da área",
    "Interagir com fornecedores e prazos",
  ],
  "Requisitante/Visualizador": [
    "Criar e acompanhar solicitações de compra",
    "Consultar andamento dos processos",
    "Visualizar relatórios básicos e histórico",
    "Anexar e baixar documentos permitidos",
  ],
  "Gestor de Contratos": [
    "Acompanhar vigência de contratos",
    "Registrar aditivos e prorrogações",
    "Controlar marcos e obrigações contratuais",
    "Emitir alertas de vencimento",
    "Consultar indicadores de contratos",
  ],
};

const departamentosDisponiveis = [
  "Diretoria",
  "Tecnologia",
  "Saúde",
  "Eventos",
  "Suprimentos",
  "Gestão de Contratos",
  "Jurídico",
] as const;

const perfisDisponiveis: UsuarioRoleUi[] = [
  "Administrador",
  "Comprador/Responsável",
  "Requisitante/Visualizador",
  "Gestor de Contratos",
];

const normalizar = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function UsuariosPage() {
  const supabase = useMemo(() => createClient(), []);
  const { currentUser, currentProfile } = useAuth();

  const [usuariosList, setUsuariosList] = useState<UsuarioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [perfilFilter, setPerfilFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioItem | null>(null);
  const [perfilEdicao, setPerfilEdicao] = useState<UsuarioRoleUi>("Requisitante/Visualizador");
  const [departamentoEdicao, setDepartamentoEdicao] = useState("");
  const [statusEdicao, setStatusEdicao] = useState<UsuarioStatusUi>("Ativo");
  const [novoUsuario, setNovoUsuario] = useState({ nome: "", email: "", perfil: "", departamento: "" });

  const loadUsuarios = async () => {
    setIsLoading(true);
    try {
      const data = await getUsuarios({ orderBy: "full_name", ascending: true });
      setUsuariosList(data);
    } catch (error) {
      toast.error("Erro ao carregar usuários", {
        description: error instanceof Error ? error.message : "Não foi possível carregar os perfis reais do Supabase.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsuarios();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-usuarios-profiles")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        void loadUsuarios();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const statusCounts = useMemo(
    () => ({
      todos: usuariosList.length,
      administrador: usuariosList.filter((u) => u.perfil === "Administrador").length,
      compradorResponsavel: usuariosList.filter((u) => u.perfil === "Comprador/Responsável").length,
      requisitanteVisualizador: usuariosList.filter((u) => u.perfil === "Requisitante/Visualizador").length,
      gestorContratos: usuariosList.filter((u) => u.perfil === "Gestor de Contratos").length,
      ativos: usuariosList.filter((u) => u.status === "Ativo").length,
      inativos: usuariosList.filter((u) => u.status === "Inativo").length,
    }),
    [usuariosList]
  );

  const filteredUsuarios = useMemo(
    () =>
      usuariosList.filter((usuario) => {
        const matchesSearch =
          usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          usuario.departamento.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPerfil = perfilFilter === "todos" || normalizar(usuario.perfil) === normalizar(perfilFilter);
        const matchesStatus = statusFilter === "todos" || normalizar(usuario.status) === normalizar(statusFilter);
        return matchesSearch && matchesPerfil && matchesStatus;
      }),
    [perfilFilter, searchTerm, statusFilter, usuariosList]
  );

  const { items: sortedUsuarios, requestSort: sortUsuarios, sortConfig: configUsuarios } = useTableSort(filteredUsuarios);

  const openEditDialog = (usuario: UsuarioItem) => {
    setSelectedUsuario(usuario);
    setPerfilEdicao(usuario.perfil);
    setDepartamentoEdicao(usuario.departamento);
    setStatusEdicao(usuario.status);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (usuario: UsuarioItem) => {
    setSelectedUsuario(usuario);
    setIsDeleteDialogOpen(true);
  };

  const handleSalvarAlteracoes = async () => {
    if (!selectedUsuario) return;

    const promise = updateUsuario(selectedUsuario.id, {
      perfil: perfilEdicao,
      departamento: departamentoEdicao,
      status: statusEdicao,
    });

    await toast.promise(promise, {
      loading: "Salvando alterações do usuário...",
      success: "Usuário atualizado com sucesso!",
      error: (error) => (error instanceof Error ? error.message : "Não foi possível atualizar o usuário."),
    });

    setIsEditDialogOpen(false);
    setSelectedUsuario(null);
    await loadUsuarios();
  };

  const handleDeleteUsuario = async () => {
    if (!selectedUsuario) return;

    const promise = deleteUsuario(selectedUsuario.id);

    await toast.promise(promise, {
      loading: "Inativando usuário...",
      success: "Usuário inativado com sucesso!",
      error: (error) => (error instanceof Error ? error.message : "Não foi possível inativar o usuário."),
    });

    setIsDeleteDialogOpen(false);
    setSelectedUsuario(null);
    await loadUsuarios();
  };

  const handleCriarUsuario = () => {
    const perfilSelecionado = novoUsuario.perfil as UsuarioRoleUi;

    const promise = criarUsuario({
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      perfil: perfilSelecionado,
      departamento: novoUsuario.departamento,
    });

    void toast.promise(promise, {
      loading: "Criando usuário no ACompra...",
      success: ({ usuario, temporaryPassword }) => {
        setUsuariosList((prev) => {
          const next = [usuario, ...prev.filter((item) => item.id !== usuario.id)];
          return next;
        });
        setNovoUsuario({ nome: "", email: "", perfil: "", departamento: "" });
        setIsCreateDialogOpen(false);
        return `Usuário ${usuario.nome} liberado. Senha temporária: ${temporaryPassword}`;
      },
      error: (error) => {
        if (error instanceof Error) {
          return error.message;
        }

        return "Não foi possível criar o usuário.";
      },
    });
  };

  const isSelfSelected = selectedUsuario?.id === currentUser?.id;
  const shouldBlockRoleChange = isSelfSelected && currentProfile !== "admin" && perfilEdicao === "Administrador";

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl text-black">Usuários</h2>
          <p className="mt-1 text-gray-600">Gestão de usuários e permissões do sistema</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#003366] text-white hover:bg-[#002244]">
              <Plus className="mr-2" size={20} />
              Criar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] max-w-md p-0">
            <div className="flex-1 overflow-y-auto px-6">
              <DialogHeader className="pt-6">
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>Registre a criação do usuário e alinhe o convite no Auth do Supabase.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 pb-6">
                <div className="space-y-1.5">
                  <Label htmlFor="novo-nome">Nome Completo</Label>
                  <Input id="novo-nome" placeholder="Nome do usuário" value={novoUsuario.nome} onChange={(e) => setNovoUsuario((prev) => ({ ...prev, nome: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="novo-email">E-mail</Label>
                  <Input id="novo-email" placeholder="usuario@sesc.com.br" type="email" value={novoUsuario.email} onChange={(e) => setNovoUsuario((prev) => ({ ...prev, email: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="novo-perfil">Perfil de Acesso</Label>
                  <Select value={novoUsuario.perfil} onValueChange={(value) => setNovoUsuario((prev) => ({ ...prev, perfil: value }))}>
                    <SelectTrigger id="novo-perfil">
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      {perfisDisponiveis.map((perfil) => (
                        <SelectItem key={perfil} value={perfil}>
                          {perfil}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="novo-departamento">Departamento</Label>
                  <Select value={novoUsuario.departamento} onValueChange={(value) => setNovoUsuario((prev) => ({ ...prev, departamento: value }))}>
                    <SelectTrigger id="novo-departamento">
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentosDisponiveis.map((departamento) => (
                        <SelectItem key={departamento} value={departamento}>
                          {departamento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2 rounded-b-[8px] border-t bg-white px-6 pb-4 pt-4">
              <DialogClose asChild>
                <Button className="flex-1" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                className="flex-1 bg-[#003366] text-white hover:bg-[#002244]"
                onClick={handleCriarUsuario}
                disabled={!novoUsuario.nome.trim() || !novoUsuario.email.trim() || !novoUsuario.perfil || !novoUsuario.departamento}
              >
                Criar Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="shrink-0 rounded-lg bg-blue-100 p-2"><Users className="text-blue-600" size={20} /></div><div className="min-w-0 flex-1"><p className="text-2xl text-black">{statusCounts.todos}</p><p className="truncate text-sm text-gray-600">Total</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="shrink-0 rounded-lg bg-red-100 p-2"><Shield className="text-red-600" size={20} /></div><div className="min-w-0 flex-1"><p className="text-2xl text-red-600">{statusCounts.administrador}</p><p className="truncate text-sm text-gray-600">Administradores</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="shrink-0 rounded-lg bg-blue-100 p-2"><ShoppingCart className="text-blue-600" size={20} /></div><div className="min-w-0 flex-1"><p className="text-2xl text-blue-600">{statusCounts.compradorResponsavel}</p><p className="truncate text-sm text-gray-600">Comprador/Responsável</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="shrink-0 rounded-lg bg-gray-100 p-2"><Users className="text-gray-600" size={20} /></div><div className="min-w-0 flex-1"><p className="text-2xl text-gray-600">{statusCounts.requisitanteVisualizador}</p><p className="truncate text-sm text-gray-600">Requisitante/Visualizador</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="shrink-0 rounded-lg bg-purple-100 p-2"><FileSignature className="text-purple-600" size={20} /></div><div className="min-w-0 flex-1"><p className="text-2xl text-purple-600">{statusCounts.gestorContratos}</p><p className="truncate text-sm text-gray-600">Gestor de Contratos</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="shrink-0 rounded-lg bg-green-100 p-2"><UserCheck className="text-green-600" size={20} /></div><div className="min-w-0 flex-1"><p className="text-2xl text-green-600">{statusCounts.ativos}</p><p className="truncate text-sm text-gray-600">Ativos</p></div></div></CardContent></Card>
        <Card className="border border-gray-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="shrink-0 rounded-lg bg-red-100 p-2"><UserX className="text-red-600" size={20} /></div><div className="min-w-0 flex-1"><p className="text-2xl text-red-600">{statusCounts.inativos}</p><p className="truncate text-sm text-gray-600">Inativos</p></div></div></CardContent></Card>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input className="pl-10" placeholder="Buscar por nome, e-mail ou departamento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={perfilFilter} onValueChange={setPerfilFilter}>
                <SelectTrigger><SelectValue placeholder="Filtrar por perfil" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Perfis</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="comprador/responsavel">Comprador/Responsável</SelectItem>
                  <SelectItem value="requisitante/visualizador">Requisitante/Visualizador</SelectItem>
                  <SelectItem value="gestor de contratos">Gestor de Contratos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader className="pb-1 pt-3">
          <CardTitle className="px-0 py-2 text-xl text-black">Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-6 pt-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead label="Nome" onClick={() => sortUsuarios("nome")} currentDirection={configUsuarios?.key === "nome" ? configUsuarios.direction : null} className="sticky left-0 z-10 min-w-[180px] bg-white" />
                  <SortableTableHead label="E-mail" onClick={() => sortUsuarios("email")} currentDirection={configUsuarios?.key === "email" ? configUsuarios.direction : null} className="min-w-[220px]" />
                  <SortableTableHead label="Perfil" onClick={() => sortUsuarios("perfil")} currentDirection={configUsuarios?.key === "perfil" ? configUsuarios.direction : null} className="min-w-[140px]" />
                  <SortableTableHead label="Status" onClick={() => sortUsuarios("status")} currentDirection={configUsuarios?.key === "status" ? configUsuarios.direction : null} className="min-w-[100px]" />
                  <SortableTableHead label="Departamento" onClick={() => sortUsuarios("departamento")} currentDirection={configUsuarios?.key === "departamento" ? configUsuarios.direction : null} className="min-w-[160px]" />
                  <SortableTableHead label="Último Acesso" onClick={() => sortUsuarios("ultimoAcesso")} currentDirection={configUsuarios?.key === "ultimoAcesso" ? configUsuarios.direction : null} className="min-w-[160px]" />
                  <TableHead className="min-w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-gray-500">Carregando usuários reais do Supabase...</TableCell>
                  </TableRow>
                ) : sortedUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-gray-500">Nenhum usuário encontrado para os filtros selecionados.</TableCell>
                  </TableRow>
                ) : (
                  sortedUsuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="sticky left-0 z-10 bg-white text-black">{usuario.nome}</TableCell>
                      <TableCell className="text-gray-600">{usuario.email}</TableCell>
                      <TableCell><BadgeStatus size="sm" {...getBadgeMappingForPerfil(usuario.perfil)}>{usuario.perfil}</BadgeStatus></TableCell>
                      <TableCell><BadgeStatus size="sm" {...getBadgeMappingForStatus(usuario.status)}>{usuario.status}</BadgeStatus></TableCell>
                      <TableCell className="text-gray-600">{usuario.departamento}</TableCell>
                      <TableCell className="text-gray-600">{usuario.ultimoAcesso}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(usuario)}>
                            <Edit size={16} />
                          </Button>
                          <Button className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" size="sm" variant="outline" onClick={() => openDeleteDialog(usuario)}>
                            <UserX size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg p-0">
          <div className="flex-1 overflow-y-auto px-6">
            <DialogHeader className="pt-6">
              <DialogTitle>Editar Usuário - {selectedUsuario?.nome}</DialogTitle>
              <DialogDescription>Edite o perfil e permissões do usuário selecionado.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 pb-6">
              <div className="space-y-1.5">
                <Label>Perfil de Acesso</Label>
                <Select value={perfilEdicao} onValueChange={(value) => setPerfilEdicao(value as UsuarioRoleUi)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {perfisDisponiveis.map((perfil) => (
                      <SelectItem key={perfil} value={perfil} disabled={selectedUsuario?.id === currentUser?.id && perfil === "Administrador" && currentProfile !== "admin"}>
                        {perfil}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {shouldBlockRoleChange && <p className="text-xs text-red-600">Não é permitido elevar o próprio usuário para administrador.</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Departamento</Label>
                <Select value={departamentoEdicao} onValueChange={setDepartamentoEdicao}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {departamentosDisponiveis.map((departamento) => (
                      <SelectItem key={departamento} value={departamento}>{departamento}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={statusEdicao} onValueChange={(value) => setStatusEdicao(value as UsuarioStatusUi)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Permissões do Perfil {perfilEdicao}:</Label>
                <div className="mt-2 space-y-2">
                  {permissoesPorPerfil[perfilEdicao].map((permissao) => (
                    <div key={permissao} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      {permissao}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2 rounded-b-[8px] border-t bg-white px-6 pb-4 pt-4">
            <DialogClose asChild>
              <Button className="flex-1" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button className="flex-1 bg-[#003366] text-white hover:bg-[#002244]" onClick={() => void handleSalvarAlteracoes()} disabled={shouldBlockRoleChange}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Inativação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja inativar o usuário <strong>{selectedUsuario?.nome}</strong>? O perfil será mantido para histórico e joins, mas deixará de aparecer como ativo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => void handleDeleteUsuario()}>
              Inativar Usuário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
