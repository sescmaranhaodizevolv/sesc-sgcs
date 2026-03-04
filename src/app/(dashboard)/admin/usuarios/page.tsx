"use client";

import { useMemo, useState } from "react";
import {
  Edit,
  FileSignature,
  Plus,
  Search,
  Shield,
  ShoppingCart,
  Trash2,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  DialogClose,
  Dialog,
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

type PerfilUsuario =
  | "Administrador"
  | "Comprador/Responsável"
  | "Requisitante/Visualizador"
  | "Gestor de Contratos";
type StatusUsuario = "Ativo" | "Inativo";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  status: StatusUsuario;
  ultimoAcesso: string;
  dataCriacao: string;
  departamento: string;
}

const usuariosIniciais: Usuario[] = [
  {
    id: 1,
    nome: "Maria Silva",
    email: "maria.silva@sesc.com.br",
    perfil: "Administrador",
    status: "Ativo",
    ultimoAcesso: "25/01/2024 14:30",
    dataCriacao: "15/01/2024",
    departamento: "Diretoria",
  },
  {
    id: 2,
    nome: "João Santos",
    email: "joao.santos@sesc.com.br",
    perfil: "Comprador/Responsável",
    status: "Ativo",
    ultimoAcesso: "25/01/2024 09:15",
    dataCriacao: "10/01/2024",
    departamento: "Suprimentos",
  },
  {
    id: 3,
    nome: "Ana Costa",
    email: "ana.costa@sesc.com.br",
    perfil: "Requisitante/Visualizador",
    status: "Ativo",
    ultimoAcesso: "24/01/2024 16:45",
    dataCriacao: "08/01/2024",
    departamento: "Saúde",
  },
  {
    id: 4,
    nome: "Carlos Oliveira",
    email: "carlos.oliveira@sesc.com.br",
    perfil: "Gestor de Contratos",
    status: "Inativo",
    ultimoAcesso: "20/01/2024 11:20",
    dataCriacao: "05/01/2024",
    departamento: "Gestão de Contratos",
  },
  {
    id: 5,
    nome: "Fernanda Lima",
    email: "fernanda.lima@sesc.com.br",
    perfil: "Requisitante/Visualizador",
    status: "Ativo",
    ultimoAcesso: "25/01/2024 13:10",
    dataCriacao: "12/01/2024",
    departamento: "Eventos",
  },
];

const permissoesPorPerfil: Record<PerfilUsuario, string[]> = {
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

const normalizar = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function UsuariosPage() {
  const [usuariosList, setUsuariosList] = useState<Usuario[]>(usuariosIniciais);
  const [searchTerm, setSearchTerm] = useState("");
  const [perfilFilter, setPerfilFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [perfilEdicaoPorUsuario, setPerfilEdicaoPorUsuario] = useState<Record<number, PerfilUsuario>>({});
  const [departamentoEdicaoPorUsuario, setDepartamentoEdicaoPorUsuario] = useState<Record<number, string>>({});
  const [statusEdicaoPorUsuario, setStatusEdicaoPorUsuario] = useState<Record<number, StatusUsuario>>({});

  const handleSalvarAlteracoes = (id: number) => {
    setUsuariosList((prev) =>
      prev.map((usuario) =>
        usuario.id === id
          ? {
              ...usuario,
              perfil: perfilEdicaoPorUsuario[id] ?? usuario.perfil,
              departamento: departamentoEdicaoPorUsuario[id] ?? usuario.departamento,
              status: statusEdicaoPorUsuario[id] ?? usuario.status,
            }
          : usuario,
      ),
    );

    toast.success("Usuário atualizado com sucesso!");
  };

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
    [usuariosList],
  );

  const filteredUsuarios = usuariosList.filter((usuario) => {
    const matchesSearch =
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.departamento.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPerfil = perfilFilter === "todos" || normalizar(usuario.perfil) === normalizar(perfilFilter);
    const matchesStatus = statusFilter === "todos" || normalizar(usuario.status) === normalizar(statusFilter);
    return matchesSearch && matchesPerfil && matchesStatus;
  });

  const { items: sortedUsuarios, requestSort: sortUsuarios, sortConfig: configUsuarios } = useTableSort(filteredUsuarios);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl text-black">Usuários</h2>
          <p className="mt-1 text-gray-600">Gestão de usuários e permissões do sistema</p>
        </div>
        <Dialog>
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
                <DialogDescription>
                  Crie um novo usuário e defina suas permissões no sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 pb-6">
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" placeholder="Nome do usuário" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" placeholder="usuario@sesc.com.br" type="email" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="perfil">Perfil de Acesso</Label>
                  <Select>
                    <SelectTrigger id="perfil">
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="comprador/responsavel">Comprador/Responsável</SelectItem>
                      <SelectItem value="requisitante/visualizador">Requisitante/Visualizador</SelectItem>
                      <SelectItem value="gestor de contratos">Gestor de Contratos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Select>
                    <SelectTrigger id="departamento">
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diretoria">Diretoria</SelectItem>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="saude">Saúde</SelectItem>
                      <SelectItem value="eventos">Eventos</SelectItem>
                      <SelectItem value="suprimentos">Suprimentos</SelectItem>
                      <SelectItem value="gestao-contratos">Gestão de Contratos</SelectItem>
                      <SelectItem value="juridico">Jurídico</SelectItem>
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
              <Button className="flex-1 bg-[#003366] text-white hover:bg-[#002244]">
                Criar Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-lg bg-blue-100 p-2">
                <Users className="text-blue-600" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl text-black">{statusCounts.todos}</p>
                <p className="truncate text-sm text-gray-600" title="Total">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-lg bg-red-100 p-2">
                <Shield className="text-red-600" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl text-red-600">{statusCounts.administrador}</p>
                <p className="truncate text-sm text-gray-600" title="Administradores">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-lg bg-blue-100 p-2">
                <ShoppingCart className="text-blue-600" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl text-blue-600">{statusCounts.compradorResponsavel}</p>
                <p className="truncate text-sm text-gray-600" title="Comprador/Responsável">Comprador/Responsável</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-lg bg-gray-100 p-2">
                <Users className="text-gray-600" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl text-gray-600">{statusCounts.requisitanteVisualizador}</p>
                <p className="truncate text-sm text-gray-600" title="Requisitante/Visualizador">Requisitante/Visualizador</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-lg bg-purple-100 p-2">
                <FileSignature className="text-purple-600" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl text-purple-600">{statusCounts.gestorContratos}</p>
                <p className="truncate text-sm text-gray-600" title="Gestor de Contratos">Gestor de Contratos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-lg bg-green-100 p-2">
                <UserCheck className="text-green-600" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl text-green-600">{statusCounts.ativos}</p>
                <p className="truncate text-sm text-gray-600" title="Ativos">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-lg bg-red-100 p-2">
                <UserX className="text-red-600" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl text-red-600">{statusCounts.inativos}</p>
                <p className="truncate text-sm text-gray-600" title="Inativos">Inativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  className="pl-10"
                  placeholder="Buscar por nome, e-mail ou departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={perfilFilter} onValueChange={setPerfilFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por perfil" />
                </SelectTrigger>
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
                  <SortableTableHead
                    label="Nome"
                    onClick={() => sortUsuarios("nome")}
                    currentDirection={configUsuarios?.key === "nome" ? configUsuarios.direction : null}
                    className="sticky left-0 z-10 min-w-[180px] bg-white"
                  />
                  <SortableTableHead
                    label="E-mail"
                    onClick={() => sortUsuarios("email")}
                    currentDirection={configUsuarios?.key === "email" ? configUsuarios.direction : null}
                    className="min-w-[220px]"
                  />
                  <SortableTableHead
                    label="Perfil"
                    onClick={() => sortUsuarios("perfil")}
                    currentDirection={configUsuarios?.key === "perfil" ? configUsuarios.direction : null}
                    className="min-w-[140px]"
                  />
                  <SortableTableHead
                    label="Status"
                    onClick={() => sortUsuarios("status")}
                    currentDirection={configUsuarios?.key === "status" ? configUsuarios.direction : null}
                    className="min-w-[100px]"
                  />
                  <SortableTableHead
                    label="Departamento"
                    onClick={() => sortUsuarios("departamento")}
                    currentDirection={configUsuarios?.key === "departamento" ? configUsuarios.direction : null}
                    className="min-w-[160px]"
                  />
                  <SortableTableHead
                    label="Último Acesso"
                    onClick={() => sortUsuarios("ultimoAcesso")}
                    currentDirection={configUsuarios?.key === "ultimoAcesso" ? configUsuarios.direction : null}
                    className="min-w-[160px]"
                  />
                  <TableHead className="min-w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsuarios.map((usuario) => {
                  const perfilSelecionado = perfilEdicaoPorUsuario[usuario.id] ?? usuario.perfil;
                  const departamentoSelecionado = departamentoEdicaoPorUsuario[usuario.id] ?? usuario.departamento;
                  const statusSelecionado = statusEdicaoPorUsuario[usuario.id] ?? usuario.status;

                  return (
                  <TableRow key={usuario.id}>
                    <TableCell className="sticky left-0 z-10 text-black bg-white">{usuario.nome}</TableCell>
                    <TableCell className="text-gray-600">{usuario.email}</TableCell>
                    <TableCell>
                      <BadgeStatus size="sm" {...getBadgeMappingForPerfil(usuario.perfil)}>
                        {usuario.perfil}
                      </BadgeStatus>
                    </TableCell>
                    <TableCell>
                      <BadgeStatus size="sm" {...getBadgeMappingForStatus(usuario.status)}>
                        {usuario.status}
                      </BadgeStatus>
                    </TableCell>
                    <TableCell className="text-gray-600">{usuario.departamento}</TableCell>
                    <TableCell className="text-gray-600">{usuario.ultimoAcesso}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Edit size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[85vh] max-w-lg p-0">
                            <div className="flex-1 overflow-y-auto px-6">
                              <DialogHeader className="pt-6">
                                <DialogTitle>Editar Usuário - {usuario.nome}</DialogTitle>
                                <DialogDescription>
                                  Edite o perfil e permissões do usuário selecionado.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4 pb-6">
                                <div className="space-y-1.5">
                                  <Label>Perfil de Acesso</Label>
                                  <Select
                                    value={perfilSelecionado}
                                    onValueChange={(value) =>
                                      setPerfilEdicaoPorUsuario((prev) => ({ ...prev, [usuario.id]: value as PerfilUsuario }))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Administrador">Administrador</SelectItem>
                                      <SelectItem value="Comprador/Responsável">Comprador/Responsável</SelectItem>
                                      <SelectItem value="Requisitante/Visualizador">Requisitante/Visualizador</SelectItem>
                                      <SelectItem value="Gestor de Contratos">Gestor de Contratos</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1.5">
                                  <Label>Departamento</Label>
                                  <Select
                                    value={departamentoSelecionado}
                                    onValueChange={(value) =>
                                      setDepartamentoEdicaoPorUsuario((prev) => ({ ...prev, [usuario.id]: value }))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
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
                                <div className="space-y-1.5">
                                  <Label>Status</Label>
                                  <Select
                                    value={statusSelecionado}
                                    onValueChange={(value) =>
                                      setStatusEdicaoPorUsuario((prev) => ({ ...prev, [usuario.id]: value as StatusUsuario }))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Ativo">Ativo</SelectItem>
                                      <SelectItem value="Inativo">Inativo</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1.5">
                                  <Label>Permissões do Perfil {perfilSelecionado}:</Label>
                                  <div className="mt-2 space-y-2">
                                    {permissoesPorPerfil[perfilSelecionado].map((permissao) => (
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
                                <Button className="flex-1" variant="outline">
                                  Cancelar
                                </Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button
                                  className="flex-1 bg-[#003366] text-white hover:bg-[#002244]"
                                  onClick={() => handleSalvarAlteracoes(usuario.id)}
                                >
                                  Salvar Alterações
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              size="sm"
                              variant="outline"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o usuário <strong>{usuario.nome}</strong>? Esta ação
                                não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700">
                                Excluir Usuário
                              </AlertDialogAction>
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
