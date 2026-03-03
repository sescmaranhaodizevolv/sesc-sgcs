"use client";

/**
 * Admin Dashboard - Visão geral com métricas, Lead Time e atividades recentes
 */
import {
    FileText,
    FileCheck,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Calendar,
    TrendingUp,
    TrendingDown,
    Timer,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeStatus } from "@/components/ui/badge-status";
import { DashboardCard } from "@/components/features/DashboardCard";
import { DetalhesProcessoModal } from "@/components/features/processos/DetalhesProcessoModal";
import { getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { calcularLeadTime } from "@/lib/lead-time-helpers";
import {
    calcularAlertasPenalidades,
    calcularAlertasProrrogacoes,
    processosComprador,
} from "@/lib/dados-sistema";
import type { Processo } from "@/types";

/** Atividades recentes */
const recentActivities = [
    { title: "Processo #2024-001 aprovado", time: "Há 2 horas", status: "Aprovado", iconBg: "bg-[#00bc7d]" },
    { title: "Processo #2024-002 em andamento", time: "Há 4 horas", status: "Em Andamento", iconBg: "bg-[#fe9a00]" },
    { title: "Alerta de penalidade - Contrato #C789", time: "Há 6 horas", status: "Em Andamento", iconBg: "bg-[#fb2c36]" },
];

function isModalidadeLicitacao(modalidade: string): boolean {
    const modalidadeNormalizada = modalidade.toLowerCase();
    return (
        modalidadeNormalizada.includes("pregão") ||
        modalidadeNormalizada.includes("pregao") ||
        modalidadeNormalizada.includes("licitação") ||
        modalidadeNormalizada.includes("licitacao") ||
        modalidadeNormalizada.includes("tomada de preços") ||
        modalidadeNormalizada.includes("tomada de precos") ||
        modalidadeNormalizada.includes("concorrência") ||
        modalidadeNormalizada.includes("concorrencia")
    );
}

export default function AdminDashboardPage() {
    const [selectedProcess, setSelectedProcess] = useState<Processo | null>(null);
    const alertasPenalidades = calcularAlertasPenalidades();
    const alertasProrrogacoes = calcularAlertasProrrogacoes();

    const statusFinalizadores = useMemo(() => new Set(["Finalizado", "Aprovado", "Aprovada"]), []);
    const statusRejeicao = useMemo(() => new Set(["Rejeitado", "Rejeitada", "Cancelado"]), []);

    const totalProcessos = processosComprador.length;
    const totalAprovadosFinalizados = processosComprador.filter((p) => statusFinalizadores.has(p.status)).length;
    const totalRejeitados = processosComprador.filter((p) => statusRejeicao.has(p.status)).length;
    const totalEmAndamento = totalProcessos - totalAprovadosFinalizados - totalRejeitados;
    const totalAguardandoDocumentacao = processosComprador.filter(
        (p) => p.status === "Aguardando Documentação"
    ).length;

    const processosComLeadTime = useMemo(() => {
        const statusFinalizados = new Set(["Finalizado", "Aprovado", "Aprovada"]);

        return processosComprador
            .filter((processo) => statusFinalizados.has(processo.status))
            .map((processo) => {
                const dataInicio = processo.dataRecebimento ?? processo.dataDistribuicao;
                const dataFim = processo.dataFinalizacao ?? processo.dataAprovacao;

                if (!dataInicio || !dataFim || dataInicio === "-" || dataFim === "-") {
                    return null;
                }

                const leadTime = calcularLeadTime(dataInicio, dataFim);
                if (leadTime <= 0) {
                    return null;
                }

                return {
                    ...processo,
                    leadTime,
                };
            })
            .filter((processo): processo is Processo & { leadTime: number } => processo !== null);
    }, []);

    const processosLicitacao = useMemo(
        () =>
            processosComLeadTime.filter((p) => {
                const dataInicio = p.dataRecebimento ?? p.dataDistribuicao;
                const dataFim = p.dataFinalizacao ?? p.dataAprovacao;
                const statusFinalizado = ["finalizado", "aprovado", "aprovada"].includes(
                    p.status.toLowerCase()
                );

                return (
                    isModalidadeLicitacao(p.modalidade) &&
                    statusFinalizado &&
                    !!dataInicio &&
                    !!dataFim &&
                    dataInicio !== "-" &&
                    dataFim !== "-"
                );
            }),
        [processosComLeadTime]
    );

    const processosDiretos = useMemo(
        () => processosComLeadTime.filter((p) => !isModalidadeLicitacao(p.modalidade)),
        [processosComLeadTime]
    );

    const calcularMetricasLeadTime = (lista: Array<Processo & { leadTime: number }>) => {
        if (lista.length === 0) {
            return {
                medio: 0,
                maisRapido: 0,
                maisLento: 0,
                procMaisRapido: null as (Processo & { leadTime: number }) | null,
                procMaisLento: null as (Processo & { leadTime: number }) | null,
            };
        }

        const leadTimes = lista.map((p) => p.leadTime);
        const medio = Math.round(leadTimes.reduce((acc, dias) => acc + dias, 0) / leadTimes.length);
        const maisRapido = Math.min(...leadTimes);
        const maisLento = Math.max(...leadTimes);

        return {
            medio,
            maisRapido,
            maisLento,
            procMaisRapido: lista.find((p) => p.leadTime === maisRapido) ?? null,
            procMaisLento: lista.find((p) => p.leadTime === maisLento) ?? null,
        };
    };

    const metricasDiretas = useMemo(() => calcularMetricasLeadTime(processosDiretos), [processosDiretos]);

    const {
        leadTimeMedioLicitacao,
        leadTimeMaisRapidoLicitacao,
        leadTimeMaisLentoLicitacao,
        procMaisRapidoLic,
        procMaisLentoLic,
        hasLicitacao,
    } = useMemo(() => {
        const leadTimesLicitacao = processosLicitacao.map((p) => p.leadTime);
        const hasLicitacao = leadTimesLicitacao.length > 0;

        const leadTimeMedioLicitacao = hasLicitacao
            ? Math.round(
                  leadTimesLicitacao.reduce((acumulador, valorAtual) => acumulador + valorAtual, 0) /
                      leadTimesLicitacao.length
              )
            : 0;
        const leadTimeMaisRapidoLicitacao = hasLicitacao ? Math.min(...leadTimesLicitacao) : 0;
        const leadTimeMaisLentoLicitacao = hasLicitacao ? Math.max(...leadTimesLicitacao) : 0;

        const procMaisRapidoLic = hasLicitacao
            ? processosLicitacao.find((p) => p.leadTime === leadTimeMaisRapidoLicitacao) ?? null
            : null;
        const procMaisLentoLic = hasLicitacao
            ? processosLicitacao.find((p) => p.leadTime === leadTimeMaisLentoLicitacao) ?? null
            : null;

        return {
            leadTimeMedioLicitacao,
            leadTimeMaisRapidoLicitacao,
            leadTimeMaisLentoLicitacao,
            procMaisRapidoLic,
            procMaisLentoLic,
            hasLicitacao,
        };
    }, [processosLicitacao]);

    const leadTimeMaisLentoGeral = useMemo(
        () => Math.max(...processosComLeadTime.map((p) => p.leadTime), 0),
        [processosComLeadTime]
    );

    const mediaPorModalidade = useMemo(() => {
        const leadTimePorModalidade = processosComLeadTime.reduce(
            (acc, proc) => {
                if (!acc[proc.modalidade]) {
                    acc[proc.modalidade] = { total: 0, count: 0 };
                }
                acc[proc.modalidade].total += proc.leadTime;
                acc[proc.modalidade].count += 1;
                return acc;
            },
            {} as Record<string, { total: number; count: number }>
        );

        return Object.entries(leadTimePorModalidade)
            .map(([modalidade, dados]) => ({
                modalidade,
                media: Math.round(dados.total / dados.count),
            }))
            .sort((a, b) => a.media - b.media);
    }, [processosComLeadTime]);

    const processosAprovadosRecentes = useMemo(
        () =>
            [...processosComLeadTime]
                .sort((a, b) => {
                    const dataA = a.dataFinalizacao ?? a.dataAprovacao ?? "01/01/1970";
                    const dataB = b.dataFinalizacao ?? b.dataAprovacao ?? "01/01/1970";
                    const [diaA, mesA, anoA] = dataA.split("/").map(Number);
                    const [diaB, mesB, anoB] = dataB.split("/").map(Number);

                    return (
                        new Date(anoB, mesB - 1, diaB).getTime() -
                        new Date(anoA, mesA - 1, diaA).getTime()
                    );
                })
                .slice(0, 3),
        [processosComLeadTime]
    );

    const processoSelecionadoDetalhes = useMemo(() => {
        if (!selectedProcess) {
            return null;
        }

        return {
            ...selectedProcess,
            tipo: selectedProcess.modalidade,
            dataDistribuicaoRC: selectedProcess.dataDistribuicao,
            dataInicio: selectedProcess.dataRecebimento ?? selectedProcess.dataDistribuicao,
            regional: selectedProcess.requisitante ?? "-",
        };
    }, [selectedProcess]);

    const metrics = [
        { title: "Total de Processos", value: totalProcessos.toString(), subtitle: "Base atual de processos do sistema", icon: <FileText size={20} className="text-white" />, iconBg: "bg-sesc-blue" },
        { title: "Processos em Andamento", value: totalEmAndamento.toString(), subtitle: `${totalAguardandoDocumentacao} aguardando documentação`, icon: <Clock size={20} className="text-white" />, iconBg: "bg-[#fe9a00]" },
        { title: "Processos Aprovados", value: totalAprovadosFinalizados.toString(), subtitle: "Processos aprovados ou finalizados", icon: <CheckCircle size={20} className="text-white" />, iconBg: "bg-[#00bc7d]" },
        { title: "Processos Rejeitados", value: totalRejeitados.toString(), subtitle: "Inclui rejeições e cancelamentos", icon: <XCircle size={20} className="text-white" />, iconBg: "bg-[#fb2c36]" },
        { title: "Alertas de Penalidades", value: alertasPenalidades.total.toString(), subtitle: alertasPenalidades.descricao, icon: <AlertTriangle size={20} className="text-white" />, iconBg: "bg-[#ff6900]" },
        { title: "Prorrogações de Processos", value: alertasProrrogacoes.total.toString(), subtitle: alertasProrrogacoes.descricao, icon: <Calendar size={20} className="text-white" />, iconBg: "bg-[#2b7fff]" },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Título */}
            <div>
                <h2 className="text-3xl text-black mb-2">Dashboard de Processos</h2>
                <p className="text-gray-600">
                    Visão geral do sistema de gestão de contratos e suprimentos
                </p>
            </div>

            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((m, i) => (
                    <DashboardCard key={i} {...m} />
                ))}
            </div>

            {/* Lead Time Header */}
            <div>
                <h3 className="text-2xl text-black mb-2 flex items-center gap-2">
                    <Timer size={24} className="text-sesc-blue" />
                    Lead Time de Processos
                </h3>
                <p className="text-gray-600">
                    Tempo médio entre a Distribuição da RC e a Aprovação Final
                </p>
            </div>

            {/* Lead Time Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Lead Time Médio" value={`${metricasDiretas.medio} dias`} subtitle={`Baseado em ${processosDiretos.length} processos`} icon={<Timer size={20} className="text-white" />} iconBg="bg-sesc-blue" />
                <div className="cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setSelectedProcess(metricasDiretas.procMaisRapido)}>
                    <DashboardCard title="Processo Mais Rápido" value={`${metricasDiretas.maisRapido} dias`} subtitle="Melhor desempenho" icon={<TrendingDown size={20} className="text-white" />} iconBg="bg-[#00bc7d]" />
                </div>
                <div className="cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setSelectedProcess(metricasDiretas.procMaisLento)}>
                    <DashboardCard title="Processo Mais Lento" value={`${metricasDiretas.maisLento} dias`} subtitle="Requer atenção" icon={<TrendingUp size={20} className="text-white" />} iconBg="bg-[#ff6900]" />
                </div>
                <DashboardCard title="Variação" value={`${Math.max(metricasDiretas.maisLento - metricasDiretas.maisRapido, 0)} dias`} subtitle="Amplitude de tempo" icon={<Clock size={20} className="text-white" />} iconBg="bg-[#2b7fff]" />
            </div>

            {/* Lead Time de Licitações Header */}
            <div>
                <h3 className="text-2xl text-black mb-2 flex items-center gap-2">
                    <FileCheck size={24} className="text-sesc-blue" />
                    Performance de Licitações Homologadas
                </h3>
                <p className="text-gray-600">
                    Tempo médio do Recebimento até a Homologação
                </p>
            </div>

            {/* Lead Time de Licitações Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard title="Lead Time Médio" value={`${leadTimeMedioLicitacao} dias`} subtitle={`Baseado em ${processosLicitacao.length} licitações`} icon={<Timer size={20} className="text-white" />} iconBg="bg-sesc-blue" />
                <div
                    className={`transition-transform ${hasLicitacao && procMaisRapidoLic ? "cursor-pointer hover:scale-[1.02]" : "cursor-not-allowed opacity-80"}`}
                    onClick={() => {
                        if (procMaisRapidoLic) {
                            setSelectedProcess(procMaisRapidoLic);
                        }
                    }}
                >
                    <DashboardCard title="Licitação Mais Rápida" value={procMaisRapidoLic ? `${leadTimeMaisRapidoLicitacao} dias` : "N/A"} subtitle="Melhor desempenho" icon={<TrendingDown size={20} className="text-white" />} iconBg="bg-[#00bc7d]" />
                </div>
                <div
                    className={`transition-transform ${hasLicitacao && procMaisLentoLic ? "cursor-pointer hover:scale-[1.02]" : "cursor-not-allowed opacity-80"}`}
                    onClick={() => {
                        if (procMaisLentoLic) {
                            setSelectedProcess(procMaisLentoLic);
                        }
                    }}
                >
                    <DashboardCard title="Licitação Mais Lenta" value={procMaisLentoLic ? `${leadTimeMaisLentoLicitacao} dias` : "N/A"} subtitle="Requer atenção" icon={<TrendingUp size={20} className="text-white" />} iconBg="bg-[#ff6900]" />
                </div>
            </div>

            {/* Lead Time por Modalidade + Processos Recentes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl text-black">Lead Time por Modalidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mediaPorModalidade.map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-black">{item.modalidade}</span>
                                        <span className="text-sm text-black font-medium">{item.media} dias</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-sesc-blue h-2 rounded-full transition-all"
                                            style={{ width: `${(item.media / Math.max(leadTimeMaisLentoGeral, 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl text-black">Processos Aprovados Recentemente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {processosAprovadosRecentes.map((proc, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="text-sm text-black font-medium">{proc.id}</p>
                                        <p className="text-xs text-gray-600">{proc.descricao}</p>
                                        <BadgeStatus intent="neutral" weight="light" size="xs">
                                            {proc.modalidade}
                                        </BadgeStatus>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg text-black font-semibold">{proc.leadTime} dias</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Atividades Recentes */}
            <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl text-black">Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivities.map((activity, i) => {
                            const mapping = getBadgeMappingForStatus(activity.status);
                            return (
                                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className={`p-2 rounded-lg ${activity.iconBg}`}>
                                        {activity.status === "Aprovado" ? (
                                            <CheckCircle size={16} className="text-white" />
                                        ) : activity.status === "Em Andamento" ? (
                                            <Clock size={16} className="text-white" />
                                        ) : (
                                            <AlertTriangle size={16} className="text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-black">{activity.title}</p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                    <BadgeStatus {...mapping}>{activity.status}</BadgeStatus>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <DetalhesProcessoModal
                isOpen={!!selectedProcess}
                onClose={() => setSelectedProcess(null)}
                processo={processoSelecionadoDetalhes}
                tipo="diario"
            />
        </div>
    );
}
