import { createClient } from "@/lib/supabase/client";
import { getProcessos, updateProcesso } from "@/services/processosService";

export interface ProcessoEnvioAutomatico {
  id: string;
  id_processo: string;
  empresa: string;
  valor_total: string;
  status_aprovacao: string;
  status_envio: "Enviado Automaticamente" | "Aguardando Próxima Execução" | "Bloqueado por Exceção";
  data_envio?: string;
  responsavel: string;
  observacoes: string;
  tipo: string;
  classificacao: "normal" | "pre-contrato";
  motivo_bloqueio?: string;
  data_bloqueio?: string;
  data_aprovacao?: string;
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateTime(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function getStatusEnvio(params: { bloquear: boolean; status?: string | null; observacoes?: string | null }) {
  if (params.bloquear) return "Bloqueado por Exceção" as const;

  const observacoes = (params.observacoes || "").toLowerCase();
  if (observacoes.includes("envio manual") || observacoes.includes("enviado ao fornecedor")) {
    return "Enviado Automaticamente" as const;
  }

  return "Aguardando Próxima Execução" as const;
}

export async function getProcessosEnvioAutomatico(): Promise<ProcessoEnvioAutomatico[]> {
  const supabase = createClient();

  const { data: processosRaw, error } = await supabase
    .from("processos")
    .select(`
      *,
      fornecedor:fornecedores(razao_social),
      responsavel:profiles!processos_responsavel_id_fkey(nome)
    `)
    .or("bloquear_envio_automatico.eq.true,status.in.(Aprovado,Aprovada,Próximo ao Vencimento,Vencido),observacoes_internas.ilike.*envio manual*,observacoes_internas.ilike.*enviado ao fornecedor*")
    .order("atualizado_em", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const processos = processosRaw || [];

  return processos.map((processo) => {
    const statusEnvio = getStatusEnvio({
      bloquear: Boolean(processo.bloquear_envio_automatico),
      status: processo.status,
      observacoes: processo.observacoes_internas,
    });

    return {
      id: processo.id,
      id_processo: processo.numero_processo || processo.numero_requisicao || "Não informado",
      empresa: processo.fornecedor?.razao_social || processo.empresa_vencedora || "Não definida",
      valor_total: formatCurrency(typeof processo.valor === "number" ? processo.valor : null),
      status_aprovacao: processo.status || "Pendente",
      status_envio: statusEnvio,
      data_envio: formatDateTime(processo.atualizado_em),
      responsavel: processo.responsavel?.nome || "Não atribuído",
      observacoes: processo.observacoes_internas || "Sem observações registradas.",
      tipo: processo.modalidade || "Não definida",
      classificacao: Boolean(processo.bloquear_envio_automatico) ? "pre-contrato" : "normal",
      motivo_bloqueio: processo.bloquear_envio_automatico ? "Pré-Contrato" : undefined,
      data_bloqueio: processo.bloquear_envio_automatico ? formatDateTime(processo.atualizado_em) : undefined,
      data_aprovacao: formatDateTime(processo.data_finalizacao || processo.atualizado_em),
    };
  });
}

export async function desbloquearEnvioAutomatico(processoId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await updateProcesso(processoId, { bloquear_envio_automatico: false });
  await supabase.from("automacao_historico").insert({
    processo_id: processoId,
    acao: "desbloqueio_fluxo_automatico",
    status_envio: "Aguardando Próxima Execução",
    detalhes: "Fluxo automático liberado manualmente.",
    executado_por: user?.id ?? null,
  });
}

export async function registrarEnvioManual(processoId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: processo, error: processoError } = await supabase
    .from("processos")
    .select("id, observacoes_internas")
    .eq("id", processoId)
    .single();

  if (processoError) {
    throw new Error(processoError.message || "Não foi possível localizar o processo para envio manual.");
  }

  const registro = `Envio manual registrado em ${new Date().toISOString()}`;
  const observacoes = [processo.observacoes_internas, registro].filter(Boolean).join(" | ");

  await updateProcesso(processoId, {
    bloquear_envio_automatico: false,
    observacoes_internas: observacoes,
  });

  await supabase.from("automacao_historico").insert({
    processo_id: processoId,
    acao: "envio_manual",
    status_envio: "Enviado Automaticamente",
    detalhes: registro,
    executado_por: user?.id ?? null,
  });
}
