import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BadgeNew } from '../ui/badge-new';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Plus, Search, Edit, Trash2, Users, UserCheck, UserX, Shield } from 'lucide-react';
import { getBadgeMappingForStatus, getBadgeMappingForPerfil } from '../../lib/badge-mappings';

export function Usuarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [perfilFilter, setPerfilFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  const usuarios = [
    {
      id: 1,
      nome: 'Maria Silva',
      email: 'maria.silva@sesc.com.br',
      perfil: 'Administrador',
      status: 'Ativo',
      ultimoAcesso: '25/01/2024 14:30',
      dataCriacao: '15/01/2024',
      departamento: 'Gestão de Contratos'
    },
    {
      id: 2,
      nome: 'João Santos',
      email: 'joao.santos@sesc.com.br',
      perfil: 'Responsável',
      status: 'Ativo',
      ultimoAcesso: '25/01/2024 09:15',
      dataCriacao: '10/01/2024',
      departamento: 'Suprimentos'
    },
    {
      id: 3,
      nome: 'Ana Costa',
      email: 'ana.costa@sesc.com.br',
      perfil: 'Visualizador',
      status: 'Ativo',
      ultimoAcesso: '24/01/2024 16:45',
      dataCriacao: '08/01/2024',
      departamento: 'Auditoria'
    },
    {
      id: 4,
      nome: 'Carlos Oliveira',
      email: 'carlos.oliveira@sesc.com.br',
      perfil: 'Responsável',
      status: 'Inativo',
      ultimoAcesso: '20/01/2024 11:20',
      dataCriacao: '05/01/2024',
      departamento: 'Tecnologia'
    },
    {
      id: 5,
      nome: 'Fernanda Lima',
      email: 'fernanda.lima@sesc.com.br',
      perfil: 'Visualizador',
      status: 'Ativo',
      ultimoAcesso: '25/01/2024 13:10',
      dataCriacao: '12/01/2024',
      departamento: 'Jurídico'
    }
  ];

  const permissoesPorPerfil = {
    'Administrador': [
      'Gerenciar todos os processos',
      'Cadastrar e editar usuários',
      'Aplicar penalidades',
      'Gerar relatórios completos',
      'Configurar sistema',
      'Excluir registros'
    ],
    'Responsável': [
      'Gerenciar processos de sua área',
      'Visualizar relatórios',
      'Registrar desistências',
      'Solicitar prorrogações',
      'Upload de documentos'
    ],
    'Visualizador': [
      'Visualizar processos',
      'Consultar relatórios básicos',
      'Baixar documentos'
    ]
  };

  const statusCounts = {
    todos: usuarios.length,
    administrador: usuarios.filter(u => u.perfil === 'Administrador').length,
    responsavel: usuarios.filter(u => u.perfil === 'Responsável').length,
    visualizador: usuarios.filter(u => u.perfil === 'Visualizador').length,
    ativos: usuarios.filter(u => u.status === 'Ativo').length,
    inativos: usuarios.filter(u => u.status === 'Inativo').length
  };

  const getPerfilIcon = (perfil: string) => {
    switch (perfil) {
      case 'Administrador':
        return <Shield size={16} className="text-red-600" />;
      case 'Responsável':
        return <UserCheck size={16} className="text-blue-600" />;
      case 'Visualizador':
        return <Users size={16} className="text-gray-600" />;
      default:
        return <Users size={16} className="text-gray-600" />;
    }
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.departamento.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPerfil = perfilFilter === 'todos' || usuario.perfil.toLowerCase() === perfilFilter;
    const matchesStatus = statusFilter === 'todos' || usuario.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesPerfil && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Usuários</h2>
          <p className="text-gray-600 mt-1">Gestão de usuários e permissões do sistema</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#003366] hover:bg-[#002244] text-white">
              <Plus size={20} className="mr-2" />
              Criar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
            {/* Área scrollável */}
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
                  <Input placeholder="Nome do usuário" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input placeholder="usuario@sesc.com.br" type="email" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="perfil">Perfil de Acesso</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="responsavel">Responsável</SelectItem>
                      <SelectItem value="visualizador">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gestao-contratos">Gestão de Contratos</SelectItem>
                      <SelectItem value="suprimentos">Suprimentos</SelectItem>
                      <SelectItem value="auditoria">Auditoria</SelectItem>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="juridico">Jurídico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Footer fixo */}
            <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
              <Button variant="outline" className="flex-1">
                Cancelar
              </Button>
              <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white">
                Criar Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl text-black">{statusCounts.todos}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl text-red-600">{statusCounts.administrador}</p>
                <p className="text-sm text-gray-600">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl text-blue-600">{statusCounts.responsavel}</p>
                <p className="text-sm text-gray-600">Responsáveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users size={20} className="text-gray-600" />
              </div>
              <div>
                <p className="text-2xl text-gray-600">{statusCounts.visualizador}</p>
                <p className="text-sm text-gray-600">Visualizadores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl text-green-600">{statusCounts.ativos}</p>
                <p className="text-sm text-gray-600">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl text-red-600">{statusCounts.inativos}</p>
                <p className="text-sm text-gray-600">Inativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, e-mail ou departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
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
                  <SelectItem value="responsável">Responsável</SelectItem>
                  <SelectItem value="visualizador">Visualizador</SelectItem>
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

      {/* Users Table */}
      <Card className="border border-gray-200">
        <CardHeader className="pt-3 pb-1">
          <CardTitle className="text-xl text-black px-[0px] py-[8px]">
            Lista de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 min-w-[180px]">Nome</TableHead>
                  <TableHead className="min-w-[220px]">E-mail</TableHead>
                  <TableHead className="min-w-[140px]">Perfil</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[160px]">Departamento</TableHead>
                  <TableHead className="min-w-[160px]">Último Acesso</TableHead>
                  <TableHead className="min-w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="text-black sticky left-0 z-10">{usuario.nome}</TableCell>
                  <TableCell className="text-gray-600">{usuario.email}</TableCell>
                  <TableCell>
                    <BadgeNew {...getBadgeMappingForPerfil(usuario.perfil)}>
                      {usuario.perfil}
                    </BadgeNew>
                  </TableCell>
                  <TableCell>
                    <BadgeNew {...getBadgeMappingForStatus(usuario.status)}>
                      {usuario.status}
                    </BadgeNew>
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
                        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0">
                          {/* Área scrollável */}
                          <div className="flex-1 overflow-y-auto px-6">
                            <DialogHeader className="pt-6">
                              <DialogTitle>Editar Permissões - {usuario.nome}</DialogTitle>
                              <DialogDescription>
                                Edite o perfil e permissões do usuário selecionado.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 pb-6">
                              <div className="space-y-1.5">
                                <Label>Perfil Atual: {usuario.perfil}</Label>
                                <Select defaultValue={usuario.perfil.toLowerCase()}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="administrador">Administrador</SelectItem>
                                    <SelectItem value="responsável">Responsável</SelectItem>
                                    <SelectItem value="visualizador">Visualizador</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-1.5">
                                <Label>Permissões do Perfil {usuario.perfil}:</Label>
                                <div className="mt-2 space-y-2">
                                  {permissoesPorPerfil[usuario.perfil as keyof typeof permissoesPorPerfil]?.map((permissao, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      {permissao}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Footer fixo */}
                          <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                            <Button variant="outline" className="flex-1">
                              Cancelar
                            </Button>
                            <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white">
                              Salvar Alterações
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o usuário <strong>{usuario.nome}</strong>? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
                              Excluir Usuário
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}