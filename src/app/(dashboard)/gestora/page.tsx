"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { DashboardCard } from "@/components/features/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeStatus } from "@/components/ui/badge-status";
import { createClient } from "@/lib/supabase/client";
import {
  getContratos,
  getHistoricoProrrogacoes,
  getProrrogacoes,
  type Contrato,
  type HistoricoProrrogacao,
  type Prorrogacao,
} from "@/services/contratosService";

function formatDateLabel(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("pt-BR");
}

function formatReadableCode(primary?: string | null, fallback?: string | null, prefix = "GCON") {
  if (primary && primary.trim()) return primary;
  if (!fallback || !fallback.trim()) return "-";
  if (/^\d+$/.test(fallback.trim())) return `${prefix}-${fallback.padStart(4, "0")}`;
  if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(fallback.trim())) return `${prefix}-${fallback.slice(0, 8).toUpperCase()}`;
  return fallback;
}

function getDaysUntil(endDate?: string | null) {
  if (!endDate) return null;

  const target = new Date(endDate);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  return Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
}

function deriveStatus(contrato: Contrato) {
  const baseStatus = contrato.status || "Ativo";
  const dataFimReferencia = contrato.data_fim_atual ?? contrato.data_fim_original;
  const daysUntil = getDaysUntil(dataFimReferencia);

  if (!dataFimReferencia) return "Aguardando Datas";
  if (baseStatus === "Encerrado" || baseStatus === "Suspenso") return baseStatus;
  if (daysUntil !== null && daysUntil < 0) return "Vencido";
  if (daysUntil !== null && daysUntil < 30) return "Próximo ao Vencimento";
  return baseStatus === "Vigente" ? "Ativo" : baseStatus;
}

export default function GestoraDashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [contratosRaw, setContratosRaw] = useState<Contrato[]>([]);
  const [prorrogacoesRaw, setProrrogacoesRaw] = useState<Prorrogacao[]>([]);
  const [historicosRaw, setHistoricosRaw] = useState<HistoricoProrrogacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);

    try {
      const [contratos, prorrogacoes, historicos] = await Promise.all([
        getContratos(),
        getProrrogacoes(),
        getHistoricoProrrogacoes(),
      ]);

      setContratosRaw(contratos);
      setProrrogacoesRaw(prorrogacoes);
      setHistoricosRaw(historicos);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const contratosChannel = supabase
      .channel("gestora-dashboard-contratos")
      .on("postgres_changes", { event: "*", schema: "public", table: "contratos" }, () => {
        void loadData();
      })
      .subscribe();

    const prorrogacoesChannel = supabase
      .channel("gestora-dashboard-prorrogacoes")
      .on("postgres_changes", { event: "*", schema: "public", table: "prorrogacoes" }, () => {
        void loadData();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(contratosChannel);
      void supabase.removeChannel(prorrogacoesChannel);
    };
  }, [supabase]);

  const contratos = useMemo(
    () =>
      contratosRaw.map((contrato) => {
        const vigencia = contrato.data_fim_atual ?? contrato.data_fim_original;

        return {
          id: contrato.id,
          numeroContrato: formatReadableCode(contrato.numero_contrato, contrato.id, "CTR"),
          numeroProcesso: formatReadableCode(contrato.processo?.numero_requisicao, contrato.processo_id, "PROC"),
          objeto: contrato.objeto || contrato.processo?.objeto || "-",
          empresa: contrato.fornecedor?.razao_social || "-",
          cnpj: contrato.fornecedor?.cnpj || "-",
          status: deriveStatus(contrato),
          vigencia,
          vigenciaLabel: formatDateLabel(vigencia),
        };
      }),
    [contratosRaw],
  );

  const contratosAtivos = useMemo(
    () => contratos.filter((contrato) => contrato.status === "Ativo").length,
    [contratos],
  );

  const prorrogacoesPendentes = useMemo(
    () => prorrogacoesRaw.filter((prorrogacao) => prorrogacao.status === "Pendente" || prorrogacao.status === "Em Análise").length,
    [prorrogacoesRaw],
  );

  const contratosProrrogados = useMemo(() => historicosRaw.length, [historicosRaw]);

  const vencendoEm30Dias = useMemo(
    () => contratos.filter((contrato) => contrato.status === "Próximo ao Vencimento").length,
    [contratos],
  );

  const proximosContratos = useMemo(
    () =>
      [...contratos]
        .filter((contrato) => contrato.vigencia)
        .sort((a, b) => {
          const dataA = a.vigencia ? new Date(a.vigencia).getTime() : Number.MAX_SAFE_INTEGER;
          const dataB = b.vigencia ? new Date(b.vigencia).getTime() : Number.MAX_SAFE_INTEGER;
          return dataA - dataB;
        })
        .slice(0, 5),
    [contratos],
  );

  const metrics = [
    {
      title: "Contratos Ativos",
      value: contratosAtivos.toString(),
      subtitle: `${vencendoEm30Dias} proximos ao vencimento`,
      icon: <FileText size={20} className="text-white" />,
      iconBg: "bg-sesc-blue",
    },
    {
      title: "Prorrogações Pendentes",
      value: prorrogacoesPendentes.toString(),
      subtitle: "Requerem análise",
      icon: <Calendar size={20} className="text-white" />,
      iconBg: "bg-[#fe9a00]",
    },
    {
      title: "Contratos Prorrogados",
      value: contratosProrrogados.toString(),
      subtitle: `${contratosProrrogados} registrados no historico`,
      icon: <CheckCircle size={20} className="text-white" />,
      iconBg: "bg-[#00bc7d]",
    },
    {
      title: "Vencendo em 30 dias",
      value: vencendoEm30Dias.toString(),
      subtitle: "Ação necessária",
      icon: <AlertTriangle size={20} className="text-white" />,
      iconBg: "bg-[#fb2c36]",
    },
  ];

  if (isLoading) {
    return <div className="p-6 space-y-6" />;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl text-black">Dashboard da Gestora de Contratos</h2>
        <p className="text-gray-600">Visao geral de contratos, prorrogacoes e TRP</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <DashboardCard key={index} {...metric} />
        ))}
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-black">Prorrogações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {proximosContratos.map((contrato) => (
              <div key={contrato.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-sesc-blue/10 rounded-lg">
                  <Calendar size={20} className="text-sesc-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{contrato.numeroContrato}</p>
                  <p className="text-xs text-gray-600 truncate">{contrato.objeto}</p>
                  <p className="text-xs text-gray-500">
                    {contrato.empresa} · {contrato.cnpj}
                  </p>
                </div>
                <div className="text-right">
                  <BadgeStatus
                    intent={
                      contrato.status === "Ativo"
                        ? "success"
                        : contrato.status === "Próximo ao Vencimento"
                          ? "warning"
                          : contrato.status === "Vencido"
                            ? "danger"
                            : "neutral"
                    }
                    weight="medium"
                  >
                    {contrato.status}
                  </BadgeStatus>
                  <p className="text-xs text-gray-400 mt-1">Vence: {contrato.vigenciaLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
