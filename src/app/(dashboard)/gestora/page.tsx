"use client";

/**
 * Gestora de Contratos - Dashboard
 */
import {
    Calendar,
    FileText,
    AlertTriangle,
    CheckCircle,
} from "lucide-react";
import { DashboardCard } from "@/components/features/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeStatus } from "@/components/ui/badge-status";
import { prorrogacoes } from "@/lib/dados-sistema";

export default function GestoraDashboardPage() {
    const metrics = [
        {
            title: "Contratos Ativos",
            value: "42",
            subtitle: "8 próximos ao vencimento",
            icon: <FileText size={20} className="text-white" />,
            iconBg: "bg-sesc-blue",
        },
        {
            title: "Prorrogações Pendentes",
            value: prorrogacoes.length.toString(),
            subtitle: "Requerem análise",
            icon: <Calendar size={20} className="text-white" />,
            iconBg: "bg-[#fe9a00]",
        },
        {
            title: "Contratos Prorrogados",
            value: "18",
            subtitle: "+3 este mês",
            icon: <CheckCircle size={20} className="text-white" />,
            iconBg: "bg-[#00bc7d]",
        },
        {
            title: "Vencendo em 30 dias",
            value: "5",
            subtitle: "Ação necessária",
            icon: <AlertTriangle size={20} className="text-white" />,
            iconBg: "bg-[#fb2c36]",
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-3xl text-black">Dashboard da Gestora de Contratos</h2>
                <p className="text-gray-600">Visão geral de contratos, prorrogações e TRP</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <DashboardCard key={i} {...m} />
                ))}
            </div>

            <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl text-black">Prorrogações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {prorrogacoes.map((p) => (
                            <div key={p.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="p-2 bg-sesc-blue/10 rounded-lg">
                                    <Calendar size={20} className="text-sesc-blue" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{p.contrato}</p>
                                    <p className="text-xs text-gray-600 truncate">{p.objetoContrato}</p>
                                    <p className="text-xs text-gray-500">
                                        {p.empresa} · {p.cnpjCpf}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <BadgeStatus
                                        intent={
                                            p.status === "Vigente"
                                                ? "success"
                                                : p.status === "Próximo ao Vencimento"
                                                  ? "warning"
                                                  : "neutral"
                                        }
                                        weight="medium"
                                    >
                                        {p.status}
                                    </BadgeStatus>
                                    <p className="text-xs text-gray-400 mt-1">Vence: {p.dataFimProrrogada}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
