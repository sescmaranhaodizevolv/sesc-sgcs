"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Timer,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeStatus } from "@/components/ui/badge-status";
import { getBadgeMappingForPrioridade, getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { DetalhesProcessoModal } from "@/components/features/processos/DetalhesProcessoModal";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getProcessos } from "@/services/processosService";
import type { Processo, ProcessoComDetalhes } from "@/types";

function formatDateLabel(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("pt-BR");
}

function isProcessoFinalizado(status: string | null | undefined) {
  return ["Finalizado", "Aprovado", "Aprovada"].includes(status || "");
}

function isProcessoAndamento(status: string | null | undefined) {
  return status === "Em Andamento";
}

export default function CompradorDashboardPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const nomeUsuarioLogado = currentUser?.user_metadata?.name || currentUser?.profile?.nome || "";
  const [selectedProcess, setSelectedProcess] = useState<Processo | null>(null);
  const [processosRaw, setProcessosRaw] = useState<ProcessoComDetalhes[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProcessos = async () => {
    setIsLoading(true);

    try {
      const data = await getProcessos();
      setProcessosRaw(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProcessos();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("comprador-dashboard-processos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "processos" },
        () => {
          void loadProcessos();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const meusProcessos = useMemo(() => {
    if (!currentUser?.id && !nomeUsuarioLogado) return [];

    return processosRaw.filter(
      (processo) =>
        processo.responsavel_id === currentUser?.id ||
        processo.responsavel?.nome === nomeUsuarioLogado
    );
  }, [currentUser?.id, nomeUsuarioLogado, processosRaw]);

  const meusProcessosComLeadTime = useMemo(() => {
    return meusProcessos
      .filter((processo) => isProcessoFinalizado(processo.status))
      .map((processo) => {
        const dataInicio = processo.data_recebimento ?? processo.data_distribuicao;
        const dataFim = processo.data_finalizacao ?? processo.data_fim;

        if (!dataInicio || !dataFim) return null;

        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);

        if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
          return null;
        }

        const diffTime = fim.getTime() - inicio.getTime();
        const leadTime = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        return {
          id: processo.id,
          numeroRequisicao: processo.numero_requisicao || processo.id,
          descricao: processo.objeto || processo.descricao || "-",
          modalidade: processo.modalidade || "-",
          dataDistribuicao: formatDateLabel(processo.data_distribuicao || processo.data_recebimento),
          dataAprovacao: formatDateLabel(processo.data_finalizacao || processo.data_fim),
          leadTime,
        };
      })
      .filter((processo): processo is {
        id: string;
        numeroRequisicao: string;
        descricao: string;
        modalidade: string;
        dataDistribuicao: string;
        dataAprovacao: string;
        leadTime: number;
      } => processo !== null);
  }, [meusProcessos]);

  const meusLeadTimes = useMemo(() => meusProcessosComLeadTime.map((p) => p.leadTime), [meusProcessosComLeadTime]);

  const meuLeadTimeMedio = useMemo(() => {
    if (meusLeadTimes.length === 0) return null;
    return Math.round(meusLeadTimes.reduce((a, b) => a + b, 0) / meusLeadTimes.length);
  }, [meusLeadTimes]);

  const meuLeadTimeMaisRapido = useMemo(() => {
    if (meusLeadTimes.length === 0) return null;
    return Math.min(...meusLeadTimes);
  }, [meusLeadTimes]);

  const meuLeadTimeMaisLento = useMemo(() => {
    if (meusLeadTimes.length === 0) return null;
    return Math.max(...meusLeadTimes);
  }, [meusLeadTimes]);

  const totalAprovados = meusProcessos.filter((processo) => isProcessoFinalizado(processo.status)).length;
  const totalAguardandoDocumentacao = meusProcessos.filter(
    (processo) => processo.status === "Aguardando Documentação"
  ).length;

  const totalProximoVencer = useMemo(() => {
    const now = new Date();
    const limite = new Date();
    limite.setDate(now.getDate() + 30);

    return meusProcessos.filter((processo) => {
      if (!processo.data_fim) return false;
      const dataFim = new Date(processo.data_fim);
      if (Number.isNaN(dataFim.getTime())) return false;
      return dataFim >= now && dataFim <= limite;
    }).length;
  }, [meusProcessos]);

  const stats = [
    {
      title: "Total de Processos",
      value: String(meusProcessos.length),
      subtitle: "Sob minha responsabilidade",
      icon: FileText,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: `${meusProcessos.length} no total`,
    },
    {
      title: "Aprovados",
      value: String(totalAprovados),
      subtitle: "Processos concluídos",
      icon: CheckCircle,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      trend: `${totalAprovados} concluídos`,
    },
    {
      title: "Aguardando Documentação",
      value: String(totalAguardandoDocumentacao),
      subtitle: "Requerem atenção",
      icon: AlertTriangle,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: totalAguardandoDocumentacao > 0 ? "Revisar hoje" : "Sem pendências",
    },
    {
      title: "Próximo a Vencer",
      value: String(totalProximoVencer),
      subtitle: "Contratos e prazos",
      icon: Calendar,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "Nos próximos 30 dias",
    },
  ];

  const processosRecentes = useMemo(() => {
    return [...meusProcessos]
      .sort((a, b) => {
        const dataA = a.criado_em || a.data_recebimento || a.data_distribuicao;
        const dataB = b.criado_em || b.data_recebimento || b.data_distribuicao;
        const timestampA = dataA ? new Date(dataA).getTime() : 0;
        const timestampB = dataB ? new Date(dataB).getTime() : 0;
        return timestampB - timestampA;
      })
      .slice(0, 4)
      .map((processo) => ({
        id: processo.numero_requisicao || processo.id,
        processoId: processo.id,
        titulo: processo.objeto || processo.descricao || "-",
        status: processo.status || "-",
        prazo: formatDateLabel(processo.data_fim || processo.data_finalizacao || processo.data_recebimento || processo.criado_em),
        fornecedores: processo.fornecedor ? 1 : 0,
      }));
  }, [meusProcessos]);

  const processoMaisRapido = useMemo(() => {
    if (meusProcessosComLeadTime.length === 0 || meuLeadTimeMaisRapido === null) return null;
    return meusProcessos.find((processo) => {
      const dataInicio = processo.data_recebimento ?? processo.data_distribuicao;
      const dataFim = processo.data_finalizacao ?? processo.data_fim;
      if (!dataInicio || !dataFim) return false;
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) return false;
      const diffTime = fim.getTime() - inicio.getTime();
      const leadTime = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      return leadTime === meuLeadTimeMaisRapido;
    }) || null;
  }, [meuLeadTimeMaisRapido, meusProcessos, meusProcessosComLeadTime.length]);

  const processoMaisLento = useMemo(() => {
    if (meusProcessosComLeadTime.length === 0 || meuLeadTimeMaisLento === null) return null;
    return meusProcessos.find((processo) => {
      const dataInicio = processo.data_recebimento ?? processo.data_distribuicao;
      const dataFim = processo.data_finalizacao ?? processo.data_fim;
      if (!dataInicio || !dataFim) return false;
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) return false;
      const diffTime = fim.getTime() - inicio.getTime();
      const leadTime = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      return leadTime === meuLeadTimeMaisLento;
    }) || null;
  }, [meuLeadTimeMaisLento, meusProcessos, meusProcessosComLeadTime.length]);

  const processoSelecionadoDetalhes = useMemo(() => {
    if (!selectedProcess) return null;

    return {
      ...selectedProcess,
      numero_requisicao: selectedProcess.numero_requisicao || selectedProcess.numeroRequisicao || selectedProcess.id,
      tipo: selectedProcess.modalidade,
      dataInicio: selectedProcess.data_recebimento ?? selectedProcess.data_distribuicao,
      regional: selectedProcess.requisitante ?? "-",
    };
  }, [selectedProcess]);

  const acoesPendentes = [
    // TODO: Implementar leitura de alertas reais no futuro.
    {
      id: 1,
      tipo: "Documentação",
      descricao: "Enviar documentação complementar - PROC-2024-148",
      prioridade: "Alta",
      prazo: "Hoje",
    },
    {
      id: 2,
      tipo: "Análise",
      descricao: "Finalizar análise de propostas - PROC-2024-156",
      prioridade: "Média",
      prazo: "Amanhã",
    },
    {
      id: 3,
      tipo: "Aprovação",
      descricao: "Aguardando aprovação superior - PROC-2024-142",
      prioridade: "Baixa",
      prazo: "15/11/2025",
    },
  ];

  const handleClickProcesso = (processoId: string) => {
    router.push(`/comprador/meus-processos?processoId=${processoId}`);
  };

  const handleClickMeusProcessos = () => {
    router.push("/comprador/meus-processos");
  };

  if (isLoading) {
    return <div className="min-h-full bg-white" />;
  }

  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div>
          <h1 className="text-black">Dashboard do Comprador</h1>
          <p className="text-gray-600 mt-1">Visão geral dos seus processos e atividades</p>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1 text-[16px]">{stat.title}</p>
                      <p className="text-black mb-1 font-bold text-[20px] font-normal">{stat.value}</p>
                      <p className="text-xs text-gray-500 text-[14px]">{stat.subtitle}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon size={24} className={stat.iconColor} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-green-600" />
                      <span className="text-xs text-green-700 text-[14px] font-normal">{stat.trend}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-[16px] rounded-b-[0px] p-[24px]">
              <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                <FileText size={20} className="text-[#003366]" />
                Processos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-[24px] pr-[24px] pb-[24px] pl-[24px]">
              <div className="space-y-4">
                {processosRecentes.map((processo) => (
                  <div
                    key={processo.processoId}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleClickProcesso(processo.processoId)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-black">{processo.id}</span>
                          <BadgeStatus {...getBadgeMappingForStatus(processo.status)}>
                            {processo.status}
                          </BadgeStatus>
                        </div>
                        <p className="text-sm text-gray-700">{processo.titulo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>Prazo: {processo.prazo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText size={12} />
                        <span>{processo.fornecedores} fornecedores</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-[16px] rounded-b-[0px]">
              <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                <AlertTriangle size={20} className="text-[#003366]" />
                Ações Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-[24px] pr-[24px] pb-[24px] pl-[24px]">
              <div className="space-y-4">
                {acoesPendentes.map((acao) => (
                  <div key={acao.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BadgeStatus intent="info" weight="light" size="sm">
                            {acao.tipo}
                          </BadgeStatus>
                          <BadgeStatus {...getBadgeMappingForPrioridade(acao.prioridade)} size="sm">
                            {acao.prioridade}
                          </BadgeStatus>
                        </div>
                        <p className="text-sm text-gray-700">{acao.descricao}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                      <Clock size={12} />
                      <span>Prazo: {acao.prazo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-2xl text-black mb-2 flex items-center gap-2">
            <Timer size={24} className="text-[#003366]" />
            Meu Lead Time de Processos
          </h3>
          <p className="text-gray-600 mb-4">
            Tempo médio dos meus processos entre Distribuição da RC e Aprovação Final
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">Meu Lead Time Médio</CardTitle>
                <div className="p-2 rounded-lg bg-[#003366]">
                  <Timer size={20} className="text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl text-black">{meuLeadTimeMedio !== null ? `${meuLeadTimeMedio} dias` : "N/A"}</p>
                <p className="text-sm text-gray-500">Baseado em {meusProcessosComLeadTime.length} processos aprovados</p>
              </div>
            </CardContent>
          </Card>

          <div className={`transition-transform ${processoMaisRapido ? "cursor-pointer hover:scale-[1.02]" : "cursor-not-allowed opacity-80"}`} onClick={() => processoMaisRapido && setSelectedProcess({
            id: processoMaisRapido.id,
            descricao: processoMaisRapido.descricao || processoMaisRapido.objeto || "-",
            numeroRequisicao: processoMaisRapido.numero_requisicao || undefined,
            requisitante: processoMaisRapido.requisitante?.nome || "-",
            objeto: processoMaisRapido.objeto || processoMaisRapido.descricao || "-",
            modalidade: processoMaisRapido.modalidade || "-",
            empresa: processoMaisRapido.fornecedor?.razao_social || processoMaisRapido.empresa_vencedora || "-",
            empresaVencedora: processoMaisRapido.empresa_vencedora || undefined,
            status: (processoMaisRapido.status || "Pendente") as Processo["status"],
            responsavel: processoMaisRapido.responsavel?.nome || "-",
            prioridade: (processoMaisRapido.prioridade as Processo["prioridade"]) || "Baixa",
            dataDistribuicao: formatDateLabel(processoMaisRapido.data_distribuicao),
            dataRecebimento: formatDateLabel(processoMaisRapido.data_recebimento),
            dataFinalizacao: formatDateLabel(processoMaisRapido.data_finalizacao),
            dataFim: formatDateLabel(processoMaisRapido.data_fim),
            numero_requisicao: processoMaisRapido.numero_requisicao,
            responsavel_id: processoMaisRapido.responsavel_id,
            requisitante_id: processoMaisRapido.requisitante_id,
            fornecedor_id: processoMaisRapido.fornecedor_id,
            empresa_vencedora: processoMaisRapido.empresa_vencedora,
            observacoes_internas: processoMaisRapido.observacoes_internas,
            data_distribuicao: processoMaisRapido.data_distribuicao,
            data_recebimento: processoMaisRapido.data_recebimento,
            data_finalizacao: processoMaisRapido.data_finalizacao,
            data_fim: processoMaisRapido.data_fim,
            criado_em: processoMaisRapido.criado_em,
            atualizado_em: processoMaisRapido.atualizado_em,
          })}>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">Meu Melhor Tempo</CardTitle>
                <div className="p-2 rounded-lg bg-[#00bc7d]">
                  <TrendingDown size={20} className="text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl text-black">{meuLeadTimeMaisRapido !== null ? `${meuLeadTimeMaisRapido} dias` : "N/A"}</p>
                <p className="text-sm text-gray-500">Processo mais eficiente</p>
              </div>
            </CardContent>
          </Card>
          </div>

          <div className={`transition-transform ${processoMaisLento ? "cursor-pointer hover:scale-[1.02]" : "cursor-not-allowed opacity-80"}`} onClick={() => processoMaisLento && setSelectedProcess({
            id: processoMaisLento.id,
            descricao: processoMaisLento.descricao || processoMaisLento.objeto || "-",
            numeroRequisicao: processoMaisLento.numero_requisicao || undefined,
            requisitante: processoMaisLento.requisitante?.nome || "-",
            objeto: processoMaisLento.objeto || processoMaisLento.descricao || "-",
            modalidade: processoMaisLento.modalidade || "-",
            empresa: processoMaisLento.fornecedor?.razao_social || processoMaisLento.empresa_vencedora || "-",
            empresaVencedora: processoMaisLento.empresa_vencedora || undefined,
            status: (processoMaisLento.status || "Pendente") as Processo["status"],
            responsavel: processoMaisLento.responsavel?.nome || "-",
            prioridade: (processoMaisLento.prioridade as Processo["prioridade"]) || "Baixa",
            dataDistribuicao: formatDateLabel(processoMaisLento.data_distribuicao),
            dataRecebimento: formatDateLabel(processoMaisLento.data_recebimento),
            dataFinalizacao: formatDateLabel(processoMaisLento.data_finalizacao),
            dataFim: formatDateLabel(processoMaisLento.data_fim),
            numero_requisicao: processoMaisLento.numero_requisicao,
            responsavel_id: processoMaisLento.responsavel_id,
            requisitante_id: processoMaisLento.requisitante_id,
            fornecedor_id: processoMaisLento.fornecedor_id,
            empresa_vencedora: processoMaisLento.empresa_vencedora,
            observacoes_internas: processoMaisLento.observacoes_internas,
            data_distribuicao: processoMaisLento.data_distribuicao,
            data_recebimento: processoMaisLento.data_recebimento,
            data_finalizacao: processoMaisLento.data_finalizacao,
            data_fim: processoMaisLento.data_fim,
            criado_em: processoMaisLento.criado_em,
            atualizado_em: processoMaisLento.atualizado_em,
          })}>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">Tempo Mais Longo</CardTitle>
                <div className="p-2 rounded-lg bg-[#ff6900]">
                  <TrendingUp size={20} className="text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl text-black">{meuLeadTimeMaisLento !== null ? `${meuLeadTimeMaisLento} dias` : "N/A"}</p>
                <p className="text-sm text-gray-500">Processo mais complexo</p>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-black">Meus Processos Aprovados (Histórico de Lead Time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meusProcessosComLeadTime.map((processo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleClickProcesso(processo.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-black">{processo.numeroRequisicao || processo.id}</p>
                      <BadgeStatus intent="neutral" weight="light" size="xs">
                        {processo.modalidade}
                      </BadgeStatus>
                    </div>
                    <p className="text-xs text-gray-600">{processo.descricao}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {processo.dataDistribuicao} → {processo.dataAprovacao}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-black">{`${processo.leadTime} dias`}</p>
                    <p className="text-xs text-gray-600">Lead Time</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-black mb-1">Avisos Importantes</p>
                <p className="text-sm text-gray-700">
                  Você tem <strong>2 processos com prazo de análise vencendo na próxima 1 semana</strong>. Acesse{" "}
                  <span className="text-[#003366] cursor-pointer hover:underline" onClick={handleClickMeusProcessos}>
                    Meus Processos
                  </span>{" "}
                  para visualizar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <DetalhesProcessoModal
        isOpen={!!selectedProcess}
        onClose={() => setSelectedProcess(null)}
        processo={processoSelecionadoDetalhes}
        tipo="diario"
      />
    </div>
  );
}
