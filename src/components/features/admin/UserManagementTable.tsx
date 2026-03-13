"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Edit, Trash2 } from "lucide-react";
import { getBadgeMappingForPerfil } from "@/lib/badge-mappings";
import type { Usuario } from "@/types";

interface UserManagementTableProps {
    users: Usuario[];
    onEdit: (user: Usuario) => void;
    onDelete?: (userId: string) => void;
}

const perfilLabels: Record<string, string> = {
    admin: "Administrador",
    comprador: "Comprador",
    requisitante: "Requisitante",
    gestora: "Gestora",
};

export function UserManagementTable({
    users,
    onEdit,
    onDelete,
}: UserManagementTableProps) {
    return (
        <div className="rounded-md border border-gray-200 shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow>
                        <TableHead className="font-medium text-gray-600">Nome</TableHead>
                        <TableHead className="font-medium text-gray-600">E-mail</TableHead>
                        <TableHead className="font-medium text-gray-600">Perfil</TableHead>
                        <TableHead className="font-medium text-gray-600">Departamento</TableHead>
                        <TableHead className="font-medium text-gray-600">Status</TableHead>
                        <TableHead className="font-medium text-gray-600">Último Acesso</TableHead>
                        <TableHead className="text-right font-medium text-gray-600">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                Nenhum usuário encontrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => {
                            const perfilMapping = getBadgeMappingForPerfil(
                                perfilLabels[user.perfil] || user.perfil
                            );
                            return (
                                <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <TableCell className="font-medium text-gray-900">{user.nome}</TableCell>
                                    <TableCell className="text-gray-600">{user.email}</TableCell>
                                    <TableCell>
                                        <BadgeStatus {...perfilMapping}>
                                            {perfilLabels[user.perfil] || user.perfil}
                                        </BadgeStatus>
                                    </TableCell>
                                    <TableCell className="text-gray-600">{user.departamento}</TableCell>
                                    <TableCell>
                                        <BadgeStatus
                                            intent={user.ativo ? "success" : "neutral"}
                                            weight="light"
                                        >
                                            {user.ativo ? "Ativo" : "Inativo"}
                                        </BadgeStatus>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{user.ultimoAcesso}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(user)}
                                            title="Editar Usuário"
                                        >
                                            <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                                        </Button>
                                        {onDelete && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(user.id)}
                                                title="Remover Usuário"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
