"use client";

import { useMemo, useState } from "react";
import {
    AlertTriangle,
    Calendar,
    Edit,
    FileText,
    Search,
} from "lucide-react";
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
import { prorrogacoes } from "@/lib/dados-sistema";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTableHead } from "@/components/ui/sortable-table-head";

interface TrpAtivo {
    id: number;
    termo: string;
    objeto: string;
    fornecedor: string;
    vigencia: string;
    status: "Vigente" | "Próximo Venc." | "Vencendo";
    aditivos: number;
}

const trpAtivosMock: TrpAtivo[] = [
    {
        id: 1,
        termo: "TRP-2024-001",
        objeto: "Aquisição de equipamentos de TI para unidades administrativas",
        fornecedor: "Fornecedor XYZ S.A",
        vigencia: "Jan/2024 - Jan/2025",
        status: "Vigente",
        aditivos: 1,
    },
    {
        id: 2,
        termo: "TRP-2024-007",
        objeto: "Materiais de escritório para ressuprimento institucional",
        fornecedor: "Comércio JKL Ltda",
        vigencia: "Mar/2024 - Mar/2025",
        status: "Próximo Venc.",
        aditivos: 0,
    },
    {
        id: 3,
        termo: "TRP-2023-045",
        objeto: "Contratação de serviços de manutenção de climatização",
        fornecedor: "Empresa ABC Ltda",
        vigencia: "Dez/2023 - Mar/2026",
        status: "Vencendo",
        aditivos: 2,
    },
];

function getContratoBadge(status: string) {
    if (status === "Vencendo") {
        return { intent: "danger" as const, weight: "heavy" as const };
    }

    if (status === "Próximo ao Vencimento") {
        return { intent: "warning" as const, weight: "heavy" as const };
    }

    return getBadgeMappingForStatus(status);
}

function getTrpBadge(status: TrpAtivo["status"]) {
    if (status === "Vencendo") {
        return { intent: "danger" as const, weight: "heavy" as const };
    }

    if (status === "Próximo Venc.") {
        return { intent: "warning" as const, weight: "heavy" as const };
    }

    return { intent: "success" as const, weight: "light" as const };
}

export default function GestoraPage() {
    const [searchContratos, setSearchContratos] = useState("");
    const [statusContratos, setStatusContratos] = useState("todos");
    const [searchTRP, setSearchTRP] = useState("");
    const [statusTRP, setStatusTRP] = useState("todos");

    const contratos = prorrogacoes;

    const filteredContratos = useMemo(() => {
        return contratos.filter((contrato) => {
            const termo = searchContratos.toLowerCase();
            const matchesSearch =
                contrato.empresa.toLowerCase().includes(termo) ||
                contrato.contrato.toLowerCase().includes(termo) ||
                contrato.objetoContrato.toLowerCase().includes(termo) ||
                contrato.numeroProcesso.toLowerCase().includes(termo);

            const matchesStatus =
                statusContratos === "todos" || contrato.status === statusContratos;

            return matchesSearch && matchesStatus;
        });
    }, [contratos, searchContratos, statusContratos]);

    const filteredTRP = useMemo(() => {
        return trpAtivosMock.filter((trp) => {
            const termo = searchTRP.toLowerCase();
            const matchesSearch =
                trp.termo.toLowerCase().includes(termo) ||
                trp.fornecedor.toLowerCase().includes(termo) ||
                trp.objeto.toLowerCase().includes(termo);
            const matchesStatus = statusTRP === "todos" || trp.status === statusTRP;

            return matchesSearch && matchesStatus;
        });
    }, [searchTRP, statusTRP]);

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

    const statusCounts = {
        todos: contratos.length,
        vigente: contratos.filter((c) => c.status === "Vigente").length,
        proximoVencimento: contratos.filter((c) => c.status === "Próximo ao Vencimento").length,
        vencendo: contratos.filter((c) => c.status === "Vencendo").length,
        encerrado: contratos.filter((c) => c.status === "Encerrado").length,
        suspenso: contratos.filter((c) => c.status === "Suspenso").length,
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl text-black">Gestão de Contratos e TRP</h2>
                    <p className="text-gray-600 mt-1">
                        Alimentação de datas de vigência e status contratuais
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
                                    <p className="text-2xl leading-8 text-[#10b981]">{statusCounts.vigente}</p>
                                    <p className="text-xs leading-4 text-[#4a5565]">Vigentes</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border border-gray-200">
                            <CardContent className="flex flex-col items-center justify-center h-full py-6">
                                <div className="flex flex-col gap-1 items-center justify-center text-center">
                                    <p className="text-2xl leading-8 text-[#f59e0b]">{statusCounts.proximoVencimento}</p>
                                    <p className="text-xs leading-4 text-[#4a5565]">Próximo Venc.</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border border-gray-200">
                            <CardContent className="flex flex-col items-center justify-center h-full py-6">
                                <div className="flex flex-col gap-1 items-center justify-center text-center">
                                    <p className="text-2xl leading-8 text-[#e7000b]">{statusCounts.vencendo}</p>
                                    <p className="text-xs leading-4 text-[#4a5565]">Vencendo</p>
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
                                            <SelectItem value="Vigente">Vigente</SelectItem>
                                            <SelectItem value="Próximo ao Vencimento">Próximo ao Vencimento</SelectItem>
                                            <SelectItem value="Vencendo">Vencendo</SelectItem>
                                            <SelectItem value="Encerrado">Encerrado</SelectItem>
                                            <SelectItem value="Suspenso">Suspenso</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {statusCounts.vencendo > 0 && (
                        <Card className="border border-red-200 bg-red-50">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={24} className="text-red-600" />
                                    <div>
                                        <p className="text-black">
                                            <strong>{statusCounts.vencendo}</strong>{" "}
                                            {statusCounts.vencendo === 1 ? "contrato vencendo" : "contratos vencendo"} nos próximos 15 dias
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Atualize as datas de vigência ou status para evitar interrupções
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
                                                onClick={() => sortContratos("contrato")}
                                                currentDirection={configContratos.key === "contrato" ? configContratos.direction : null}
                                                className="sticky left-0 z-10 min-w-[180px] bg-white"
                                            />
                                            <SortableTableHead
                                                label="Objeto"
                                                onClick={() => sortContratos("objetoContrato")}
                                                currentDirection={configContratos.key === "objetoContrato" ? configContratos.direction : null}
                                                className="min-w-[260px]"
                                            />
                                            <SortableTableHead
                                                label="Empresa"
                                                onClick={() => sortContratos("empresa")}
                                                currentDirection={configContratos.key === "empresa" ? configContratos.direction : null}
                                                className="min-w-[180px]"
                                            />
                                            <TableHead className="min-w-[150px]">Vigência</TableHead>
                                            <SortableTableHead
                                                label="Status"
                                                onClick={() => sortContratos("status")}
                                                currentDirection={configContratos.key === "status" ? configContratos.direction : null}
                                                className="min-w-[140px]"
                                            />
                                            <TableHead className="min-w-[100px]">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedContratos.map((contrato) => {
                                            const vigenciaFim =
                                                contrato.dataFimProrrogada !== "-" ? contrato.dataFimProrrogada : contrato.dataFimOriginal;
                                            const badge = getContratoBadge(contrato.status);

                                            return (
                                                <TableRow key={contrato.id}>
                                                    <TableCell className="text-black sticky left-0 z-10 bg-white">
                                                        <div className="space-y-0.5">
                                                            <p className="font-medium">{contrato.contrato}</p>
                                                            <p className="text-xs text-gray-500">{contrato.numeroProcesso}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">{contrato.objetoContrato}</TableCell>
                                                    <TableCell className="text-black">{contrato.empresa}</TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {contrato.dataInicio} - {vigenciaFim}
                                                    </TableCell>
                                                    <TableCell>
                                                        <BadgeStatus intent={badge.intent} weight={badge.weight}>
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
                                            );
                                        })}
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
                                            <SelectItem value="Vigente">Vigente</SelectItem>
                                            <SelectItem value="Próximo Venc.">Próximo Venc.</SelectItem>
                                            <SelectItem value="Vencendo">Vencendo</SelectItem>
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
                                                onClick={() => sortTRP("termo")}
                                                currentDirection={configTRP.key === "termo" ? configTRP.direction : null}
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
                                            <TableHead className="min-w-[150px]">Vigência</TableHead>
                                            <SortableTableHead
                                                label="Status"
                                                onClick={() => sortTRP("status")}
                                                currentDirection={configTRP.key === "status" ? configTRP.direction : null}
                                                className="min-w-[140px]"
                                            />
                                            <SortableTableHead
                                                label="Aditivos"
                                                onClick={() => sortTRP("aditivos")}
                                                currentDirection={configTRP.key === "aditivos" ? configTRP.direction : null}
                                                className="min-w-[80px]"
                                            />
                                            <TableHead className="min-w-[100px]">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedTRP.map((trp) => {
                                            const badge = getTrpBadge(trp.status);

                                            return (
                                                <TableRow key={trp.id}>
                                                    <TableCell className="text-black font-medium sticky left-0 z-10 bg-white">{trp.termo}</TableCell>
                                                    <TableCell className="text-gray-600">{trp.objeto}</TableCell>
                                                    <TableCell className="text-black">{trp.fornecedor}</TableCell>
                                                    <TableCell className="text-gray-600">{trp.vigencia}</TableCell>
                                                    <TableCell>
                                                        <BadgeStatus intent={badge.intent} weight={badge.weight}>
                                                            {trp.status}
                                                        </BadgeStatus>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">{trp.aditivos}</TableCell>
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
                                            );
                                        })}
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
