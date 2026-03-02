"use client";

/**
 * Requisitante - Minhas Requisições (leitura apenas, RN-VIS-001)
 * Sem acesso a dados financeiros, observações internas ou fornecedores
 */
import { useState } from "react";
import { Search, FileText, Clock, CheckCircle, AlertTriangle, Eye, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeStatus } from "@/components/ui/badge-status";
import { getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { requisicoesCompra } from "@/lib/dados-sistema";

export default function MinhasRequisicoesPage() {
    const [busca, setBusca] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");

    const filtered = requisicoesCompra.filter((r) => {
        const matchesSearch =
            r.objeto.toLowerCase().includes(busca.toLowerCase()) ||
            r.id.toLowerCase().includes(busca.toLowerCase());

        const matchesStatus =
            statusFilter === "todos" ||
            (statusFilter === "em-analise" && r.status === "Em Análise") ||
            (statusFilter === "aguardando-atribuicao" &&
                (r.status === "Aguardando Atribuição" || r.status === "Em Cotação")) ||
            (statusFilter === "aprovado" && r.status === "Aprovado") ||
            (statusFilter === "devolvido-requisitante" &&
                (r.status === "Devolvido ao Requisitante" || r.status === "RC devolvida para ajuste")) ||
            (statusFilter === "finalizado" && r.status === "Finalizado");

        return matchesSearch && matchesStatus;
    });

    const total = filtered.length;
    const emAndamento = filtered.filter(
        (r) => !["Finalizado", "Aprovado", "Concluída"].includes(r.status)
    ).length;
    const concluidos = filtered.filter(
        (r) => ["Finalizado", "Aprovado", "Concluída"].includes(r.status)
    ).length;
    const devolvidos = filtered.filter(
        (r) => r.status === "RC devolvida para ajuste"
    ).length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-3xl text-black">Minhas Requisições</h2>
                    <p className="text-gray-600">
                        Acompanhe o status das suas requisições de compra
                    </p>
                </div>
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50" asChild>
                    <Link href="/requisitante/suporte"><HelpCircle size={18} className="mr-2" />Central de Suporte</Link>
                </Button>
            </div>

            {/* Cards resumo (sem dados financeiros - RN-VIS-001) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <FileText size={20} className="mx-auto mb-1 text-sesc-blue" />
                    <p className="text-2xl font-bold text-sesc-blue">{total}</p>
                    <p className="text-xs text-gray-600">Total</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <Clock size={20} className="mx-auto mb-1 text-yellow-600" />
                    <p className="text-2xl font-bold text-yellow-600">{emAndamento}</p>
                    <p className="text-xs text-gray-600">Em Andamento</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                    <CheckCircle size={20} className="mx-auto mb-1 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">{concluidos}</p>
                    <p className="text-xs text-gray-600">Concluídos</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                    <AlertTriangle size={20} className="mx-auto mb-1 text-red-600" />
                    <p className="text-2xl font-bold text-red-600">{devolvidos}</p>
                    <p className="text-xs text-gray-600">Devolvidas</p>
                </div>
            </div>

            {/* Busca e filtro */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative max-w-md flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Buscar por objeto ou ID..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[260px]">
                        <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos os Status</SelectItem>
                        <SelectItem value="em-analise">Em Análise</SelectItem>
                        <SelectItem value="aguardando-atribuicao">Aguardando Atribuição</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="devolvido-requisitante">Devolvido ao Requisitante</SelectItem>
                        <SelectItem value="finalizado">Finalizado</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Lista de Requisições */}
            <div className="space-y-3">
                {filtered.map((req) => {
                    const mapping = getBadgeMappingForStatus(req.status);
                    const isDevolvida = req.status === "RC devolvida para ajuste";

                    return (
                        <Card
                            key={req.id}
                            className={`border shadow-sm hover:shadow-md transition-shadow ${isDevolvida ? "border-red-200 bg-red-50/50" : "border-gray-200"
                                }`}
                        >
                            <CardContent className="p-5">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-semibold text-sesc-blue">
                                                {req.id}
                                            </p>
                                            <BadgeStatus {...mapping}>{req.status}</BadgeStatus>
                                        </div>
                                        <p className="text-sm text-gray-900 font-medium">
                                            {req.objeto}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                                            <span>📅 {req.dataRequisicao}</span>
                                            <span>👤 Responsável: {req.responsavelAtual}</span>
                                            <span>🏢 {req.departamento}</span>
                                        </div>

                                        {isDevolvida && (
                                            <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
                                                <strong>⚠️ Requisição devolvida:</strong> Sua RC foi
                                                devolvida para ajustes. Verifique as observações.
                                            </div>
                                        )}
                                    </div>

                                    <Link href={`/requisitante/requisicao/${req.id}`}>
                                        <Button variant="outline" size="sm" className="flex-shrink-0">
                                            <Eye size={14} className="mr-1" /> Ver Detalhes
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
