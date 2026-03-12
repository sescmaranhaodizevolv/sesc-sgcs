"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, FileText, Clock, CheckCircle, AlertTriangle, Eye, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeStatus } from "@/components/ui/badge-status";
import { getBadgeMappingForStatus } from "@/lib/badge-mappings";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getProcessos } from "@/services/processosService";
import type { ProcessoComDetalhes } from "@/types";

interface RequisicaoResumo {
  id: string;
  status: string;
  statusOriginal: string;
  objeto: string;
  dataRequisicao: string;
  responsavelAtual: string;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}

function normalizeRequisitanteStatus(status?: string | null) {
  const normalized = (status || "").trim().toLowerCase();

  if (!normalized || normalized === "rc recebida pelo setor de compras" || normalized === "rc recebida") {
    return "Aguardando Atribuição";
  }

  if (["ativo", "finalizado", "concluído", "concluido", "homologado", "contrato ativo"].includes(normalized)) {
    return "Finalizado";
  }

  if (normalized === "devolvido ao requisitante" || normalized === "rc devolvida para ajuste") {
    return "Devolvido ao Requisitante";
  }

  if (normalized === "em análise" || normalized === "em analise") {
    return "Em Análise";
  }

    return status || "Aguardando Atribuição";
}

function toResumo(processo: ProcessoComDetalhes): RequisicaoResumo {
  return {
    id: processo.numero_requisicao || processo.id,
    status: normalizeRequisitanteStatus(processo.status),
    statusOriginal: processo.status || "",
    objeto: processo.objeto || processo.descricao || "-",
    dataRequisicao: formatDate(processo.data_recebimento || processo.criado_em),
    responsavelAtual: processo.responsavel?.nome || "Aguardando atribuição",
  };
}

export default function MinhasRequisicoesPage() {
  const { currentUser } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [busca, setBusca] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [processos, setProcessos] = useState<ProcessoComDetalhes[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProcessos = async () => {
      if (!currentUser?.id) {
        setProcessos([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getProcessos();
        setProcessos(data.filter((processo) => processo.requisitante_id === currentUser.id));
      } finally {
        setIsLoading(false);
      }
    };

    void loadProcessos();

    if (!currentUser?.id) return;

    const channel = supabase
      .channel(`requisitante-processos-${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "processos",
          filter: `requisitante_id=eq.${currentUser.id}`,
        },
        () => {
          void loadProcessos();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUser?.id, supabase]);

  const requisicoes = useMemo(() => processos.map(toResumo), [processos]);

  const filtered = useMemo(
    () =>
      requisicoes.filter((requisicao) => {
        const term = busca.toLowerCase();
        const matchesSearch =
          requisicao.objeto.toLowerCase().includes(term) ||
          requisicao.id.toLowerCase().includes(term);

        const matchesStatus =
          statusFilter === "todos" ||
          (statusFilter === "em-analise" && requisicao.status === "Em Análise") ||
          (statusFilter === "aguardando-atribuicao" && requisicao.status === "Aguardando Atribuição") ||
          (statusFilter === "aprovado" && ["Aprovado", "Aprovada"].includes(requisicao.status)) ||
          (statusFilter === "devolvido-requisitante" && requisicao.status === "Devolvido ao Requisitante") ||
          (statusFilter === "finalizado" && requisicao.status === "Finalizado");

        return matchesSearch && matchesStatus;
      }),
    [busca, requisicoes, statusFilter]
  );

  const total = requisicoes.length;
  const emAndamento = requisicoes.filter(
    (requisicao) => !["Finalizado", "Aprovado", "Aprovada"].includes(requisicao.status)
  ).length;
  const concluidos = requisicoes.filter((requisicao) => ["Finalizado", "Aprovado", "Aprovada"].includes(requisicao.status)).length;
  const devolvidos = requisicoes.filter((requisicao) => requisicao.status === "Devolvido ao Requisitante").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-3xl text-black">Minhas Requisições</h2>
          <p className="text-gray-600">Acompanhe o status real das suas requisições de compra</p>
        </div>
        <Button variant="outline" className="border-gray-300 hover:bg-gray-50" asChild>
          <Link href="/requisitante/suporte"><HelpCircle size={18} className="mr-2" />Central de Suporte</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <FileText size={20} className="mx-auto mb-1 text-sesc-blue" />
          <p className="text-2xl font-bold text-sesc-blue">{total}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4 text-center">
          <Clock size={20} className="mx-auto mb-1 text-yellow-600" />
          <p className="text-2xl font-bold text-yellow-600">{emAndamento}</p>
          <p className="text-xs text-gray-600">Em Andamento</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <CheckCircle size={20} className="mx-auto mb-1 text-green-600" />
          <p className="text-2xl font-bold text-green-600">{concluidos}</p>
          <p className="text-xs text-gray-600">Concluídos</p>
        </div>
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <AlertTriangle size={20} className="mx-auto mb-1 text-red-600" />
          <p className="text-2xl font-bold text-red-600">{devolvidos}</p>
          <p className="text-xs text-gray-600">Devolvidas</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative max-w-md flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Buscar por objeto ou ID..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[260px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="aguardando-atribuicao">Aguardando Atribuição</SelectItem>
            <SelectItem value="em-analise">Em Análise</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="devolvido-requisitante">Devolvido ao Requisitante</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6 text-sm text-gray-600">Carregando requisições...</CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6 text-sm text-gray-600">Nenhuma requisição encontrada para os filtros selecionados.</CardContent>
          </Card>
        ) : (
          filtered.map((req) => {
            const mapping = getBadgeMappingForStatus(req.status);
            const isDevolvida = req.status === "Devolvido ao Requisitante";

            return (
              <Card key={req.id} className={`border shadow-sm transition-shadow hover:shadow-md ${isDevolvida ? "border-red-200 bg-red-50/50" : "border-gray-200"}`}>
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <p className="text-sm font-semibold text-sesc-blue">{req.id}</p>
                        <BadgeStatus {...mapping}>{req.status}</BadgeStatus>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{req.objeto}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>📅 {req.dataRequisicao}</span>
                        <span>👤 Responsável: {req.responsavelAtual}</span>
                      </div>

                      {isDevolvida && (
                        <div className="mt-3 rounded border border-red-200 bg-red-100 p-2 text-xs text-red-700">
                          <strong>⚠️ Requisição devolvida:</strong> sua RC precisa de ajustes antes de seguir no fluxo.
                        </div>
                      )}

                      <div className="mt-3 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                        ℹ️ Esta visão não exibe valores financeiros, fornecedores ou observações internas.
                      </div>
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
          })
        )}
      </div>
    </div>
  );
}
