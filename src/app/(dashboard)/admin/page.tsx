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
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeStatus } from "@/components/ui/badge-status";
import { DashboardCard } from "@/components/features/DashboardCard";
import { DetalhesProcessoModal } from "@/components/features/processos/DetalhesProcessoModal";
import { createClient } from "@/lib/supabase/client";
import { getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { getAtividadesRecentesGlobais, getProcessos } from "@/services/processosService";
import type { Processo, ProcessoComDetalhes, ProcessoTimeline } from "@/types";

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

function formatDateLabel(value: string | null | undefined) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("pt-BR");
}

function mapProcessoDetalhadoParaDashboard(processo: ProcessoComDetalhes): Processo {
    return {
        id: processo.id,
        descricao: processo.descricao || processo.objeto || "-",
        numeroRequisicao: processo.numero_requisicao || undefined,
        requisitante: processo.requisitante?.nome || "-",
        objeto: processo.objeto || processo.descricao || "-",
        modalidade: processo.modalidade || "-",
        empresa: processo.fornecedor?.razao_social || processo.empresa_vencedora || "-",
        empresaVencedora: processo.empresa_vencedora || undefined,
        status: processo.status as Processo["status"],
        responsavel: processo.responsavel?.nome || "-",
        prioridade: (processo.prioridade as Processo["prioridade"]) || "Baixa",
        dataDistribuicao: formatDateLabel(processo.data_distribuicao),
        dataRecebimento: formatDateLabel(processo.data_recebimento),
        dataFinalizacao: formatDateLabel(processo.data_finalizacao),
        dataFim: formatDateLabel(processo.data_fim),
        data_distribuicao: processo.data_distribuicao,
        data_recebimento: processo.data_recebimento,
        data_finalizacao: processo.data_finalizacao,
        data_fim: processo.data_fim,
        valor: typeof processo.valor === "number" ? Number(processo.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : undefined,
        observacoesInternas: processo.observacoes_internas || undefined,
        observacoes_internas: processo.observacoes_internas,
        requisitante_id: processo.requisitante_id,
        responsavel_id: processo.responsavel_id,
        fornecedor_id: processo.fornecedor_id,
        empresa_vencedora: processo.empresa_vencedora,
        numero_requisicao: processo.numero_requisicao,
        criado_em: processo.criado_em,
        atualizado_em: processo.atualizado_em,
    };
}

export default function AdminDashboardPage() {
    const [selectedProcess, setSelectedProcess] = useState<Processo | null>(null);
    const [processosRaw, setProcessosRaw] = useState<ProcessoComDetalhes[]>([]);
    const [atividadesRecentes, setAtividadesRecentes] = useState<ProcessoTimeline[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = useMemo(() => createClient(), []);

    const loadDashboard = async () => {
        setIsLoading(true);

        try {
            const [processosData, atividadesData] = await Promise.all([
                getProcessos(),
                getAtividadesRecentesGlobais(5),
            ]);

            setProcessosRaw(processosData);
            setAtividadesRecentes(atividadesData);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadDashboard();
    }, []);

    useEffect(() => {
        const processosChannel = supabase
            .channel("admin-dashboard-processos")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "processos" },
                () => {
                    void loadDashboard();
                }
            )
            .subscribe();

        const timelineChannel = supabase
            .channel("admin-dashboard-timeline")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "processo_timeline" },
                () => {
                    void loadDashboard();
                }
            )
            .subscribe();

        return () => {
            void supabase.removeChannel(processosChannel);
            void supabase.removeChannel(timelineChannel);
        };
    }, [supabase]);

    const processos = useMemo(() => processosRaw.map(mapProcessoDetalhadoParaDashboard), [processosRaw]);

    const alertasPenalidades = {
        total: 0,
        descricao: "Sem alertas no momento", // TODO: Implementar leitura de alertas complexos futuramente
    };
    const alertasProrrogacoes = {
        total: 0,
        descricao: "Sem alertas no momento", // TODO: Implementar leitura de alertas complexos futuramente
    };

    const statusFinalizadores = useMemo(() => new Set(["Finalizado", "Aprovado", "Aprovada"]), []);
    const statusRejeicao = useMemo(() => new Set(["Rejeitado", "Rejeitada", "Cancelado"]), []);

    const totalProcessos = processos.length;
    const totalAprovadosFinalizados = processos.filter((p) => statusFinalizadores.has(p.status)).length;
    const totalRejeitados = processos.filter((p) => statusRejeicao.has(p.status)).length;
    const totalEmAndamento = totalProcessos - totalAprovadosFinalizados - totalRejeitados;
    const totalAguardandoDocumentacao = processos.filter(
        (p) => p.status === "Aguardando Documentação"
    ).length;

    const processosComLeadTime = useMemo(() => {
        const statusFinalizados = new Set(["Finalizado", "Aprovado", "Aprovada"]);

        return processos
            .filter((processo) => statusFinalizados.has(processo.status))
            .map((processo) => {
                const dataInicio = processo.data_recebimento ?? processo.data_distribuicao;
                const dataFim = processo.data_finalizacao ?? processo.data_fim;

                if (!dataInicio || !dataFim) {
                    return null;
                }

                const inicio = new Date(dataInicio);
                const fim = new Date(dataFim);

                if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
                    return null;
                }

                const diffTime = fim.getTime() - inicio.getTime();
                const leadTime = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                if (leadTime <= 0) {
                    return null;
                }

                return {
                    ...processo,
                    leadTime,
                };
            })
            .filter((processo): processo is Processo & { leadTime: number } => processo !== null);
    }, [processos]);

    const processosLicitacao = useMemo(
        () =>
            processosComLeadTime.filter((p) => {
                const dataInicio = p.data_recebimento ?? p.data_distribuicao;
                const dataFim = p.data_finalizacao ?? p.data_fim;
                const statusFinalizado = ["finalizado", "aprovado", "aprovada"].includes(
                    p.status.toLowerCase()
                );

                return (
                    isModalidadeLicitacao(p.modalidade) &&
                    statusFinalizado &&
                    !!dataInicio &&
                    !!dataFim
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
    const hasProcessosDiretos = processosDiretos.length > 0;

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
        const leadTimeMaisRapidoLicitacao = hasLicitacao && leadTimesLicitacao.length > 0 ? Math.min(...leadTimesLicitacao) : 0;
        const leadTimeMaisLentoLicitacao = hasLicitacao && leadTimesLicitacao.length > 0 ? Math.max(...leadTimesLicitacao) : 0;

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
                    const dataA = a.data_finalizacao ?? a.data_fim;
                    const dataB = b.data_finalizacao ?? b.data_fim;

                    const timestampA = dataA ? new Date(dataA).getTime() : 0;
                    const timestampB = dataB ? new Date(dataB).getTime() : 0;

                    return timestampB - timestampA;
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
            numero_requisicao: selectedProcess.numero_requisicao || selectedProcess.numeroRequisicao || selectedProcess.id,
            tipo: selectedProcess.modalidade,
            dataDistribuicaoRC: selectedProcess.dataDistribuicao,
            dataInicio: selectedProcess.data_recebimento ?? selectedProcess.data_distribuicao,
            regional: selectedProcess.requisitante ?? "-",
        };
    }, [selectedProcess]);

    const numeroProcessoPorId = useMemo(
        () =>
            new Map(
                processosRaw.map((processo) => [processo.id, processo.numero_requisicao || processo.id])
            ),
        [processosRaw]
    );

    const metrics = [
        { title: "Total de Processos", value: totalProcessos.toString(), subtitle: "Base atual de processos do sistema", icon: <FileText size={20} className="text-white" />, iconBg: "bg-sesc-blue" },
        { title: "Processos em Andamento", value: totalEmAndamento.toString(), subtitle: `${totalAguardandoDocumentacao} aguardando documentação`, icon: <Clock size={20} className="text-white" />, iconBg: "bg-[#fe9a00]" },
        { title: "Processos Aprovados", value: totalAprovadosFinalizados.toString(), subtitle: "Processos aprovados ou finalizados", icon: <CheckCircle size={20} className="text-white" />, iconBg: "bg-[#00bc7d]" },
        { title: "Processos Rejeitados", value: totalRejeitados.toString(), subtitle: "Inclui rejeições e cancelamentos", icon: <XCircle size={20} className="text-white" />, iconBg: "bg-[#fb2c36]" },
        { title: "Alertas de Penalidades", value: alertasPenalidades.total.toString(), subtitle: alertasPenalidades.descricao, icon: <AlertTriangle size={20} className="text-white" />, iconBg: "bg-[#ff6900]" },
        { title: "Prorrogações de Processos", value: alertasProrrogacoes.total.toString(), subtitle: alertasProrrogacoes.descricao, icon: <Calendar size={20} className="text-white" />, iconBg: "bg-[#2b7fff]" },
    ];

    if (isLoading) {
        return <div className="p-6" />;
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-3xl text-black mb-2">Dashboard de Processos</h2>
                <p className="text-gray-600">
                    Visão geral do sistema de gestão de contratos e suprimentos
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((m, i) => (
                    <DashboardCard key={i} {...m} />
                ))}
            </div>

            <div>
                <h3 className="text-2xl text-black mb-2 flex items-center gap-2">
                    <Timer size={24} className="text-sesc-blue" />
                    Lead Time de Processos
                </h3>
                <p className="text-gray-600">
                    Tempo médio entre a Distribuição da RC e a Aprovação Final
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Lead Time Médio" value={hasProcessosDiretos ? `${metricasDiretas.medio} dias` : "N/A"} subtitle={`Baseado em ${processosDiretos.length} processos`} icon={<Timer size={20} className="text-white" />} iconBg="bg-sesc-blue" />
                <div className="cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setSelectedProcess(metricasDiretas.procMaisRapido)}>
                    <DashboardCard title="Processo Mais Rápido" value={hasProcessosDiretos ? `${metricasDiretas.maisRapido} dias` : "N/A"} subtitle="Melhor desempenho" icon={<TrendingDown size={20} className="text-white" />} iconBg="bg-[#00bc7d]" />
                </div>
                <div className="cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setSelectedProcess(metricasDiretas.procMaisLento)}>
                    <DashboardCard title="Processo Mais Lento" value={hasProcessosDiretos ? `${metricasDiretas.maisLento} dias` : "N/A"} subtitle="Requer atenção" icon={<TrendingUp size={20} className="text-white" />} iconBg="bg-[#ff6900]" />
                </div>
                <DashboardCard title="Variação" value={hasProcessosDiretos ? `${Math.max(metricasDiretas.maisLento - metricasDiretas.maisRapido, 0)} dias` : "N/A"} subtitle="Amplitude de tempo" icon={<Clock size={20} className="text-white" />} iconBg="bg-[#2b7fff]" />
            </div>

            <div>
                <h3 className="text-2xl text-black mb-2 flex items-center gap-2">
                    <FileCheck size={24} className="text-sesc-blue" />
                    Performance de Licitações Homologadas
                </h3>
                <p className="text-gray-600">
                    Tempo médio do Recebimento até a Homologação
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard title="Lead Time Médio" value={hasLicitacao ? `${leadTimeMedioLicitacao} dias` : "N/A"} subtitle={`Baseado em ${processosLicitacao.length} licitações`} icon={<Timer size={20} className="text-white" />} iconBg="bg-sesc-blue" />
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
                                        <p className="text-sm text-black font-medium">{proc.numero_requisicao || proc.numeroRequisicao || proc.id}</p>
                                        <p className="text-xs text-gray-600">{proc.objeto ?? proc.descricao ?? "-"}</p>
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

            <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl text-black">Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {atividadesRecentes.map((activity, i) => {
                            const statusLabel = activity.status || "Pendente";
                            const mapping = getBadgeMappingForStatus(statusLabel);
                            return (
                                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="p-2 rounded-lg bg-sesc-blue">
                                        <Clock size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-black">{activity.titulo || `Processo ${numeroProcessoPorId.get(activity.processo_id) || activity.processo_id}`}</p>
                                        <p className="text-xs text-gray-500">{activity.mensagem || activity.status || "Atualização registrada"} • {new Date(activity.criado_em).toLocaleDateString("pt-BR")}</p>
                                    </div>
                                    <BadgeStatus {...mapping}>{statusLabel}</BadgeStatus>
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
