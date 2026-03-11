import { createClient } from "@/lib/supabase/client";
import { enviarNotificacao } from "@/services/notificacoesService";

function getErrorMessage(error: { message?: string | null; details?: string | null }) {
  return error.details || error.message || "Ocorreu um erro ao processar a solicitacao";
}

const PENALIDADES_SELECT = `
  *,
  fornecedor:fornecedores(razao_social),
  processo:processos(numero_requisicao),
  responsavel:profiles!penalidades_responsavel_id_fkey(nome)
`;

const DESISTENCIAS_SELECT = `
  *,
  fornecedor:fornecedores(razao_social,cnpj),
  processo:processos(numero_requisicao,objeto,modalidade),
  registrado_por_profile:profiles!desistencias_registrado_por_fkey(nome)
`;

export interface Penalidade {
  id: string;
  fornecedor_id: string;
  processo_id: string | null;
  tipo_penalidade: string;
  valor: number | null;
  notificacoes_enviadas: number;
  status: "Registrada" | "Aplicada" | "Contestada" | "Quitada" | "Arquivada";
  data_ocorrencia: string;
  data_aplicacao: string | null;
  parecer_tecnico: string | null;
  responsavel_id: string | null;
  criado_em: string;
  atualizado_em: string;
  fornecedor?: { razao_social: string | null } | null;
  processo?: { numero_requisicao: string | null } | null;
  responsavel?: { nome: string | null } | null;
}

export interface AplicarPenalidadePayload {
  fornecedor_id: string;
  processo_id?: string | null;
  tipo_penalidade: string;
  valor?: number | null;
  notificacoes_enviadas?: number;
  status?: Penalidade["status"];
  data_ocorrencia?: string;
  data_aplicacao?: string | null;
  parecer_tecnico?: string | null;
  responsavel_id?: string | null;
}

export interface Desistencia {
  id: string;
  processo_id: string;
  fornecedor_id: string | null;
  motivo: string;
  status: string;
  documento_path: string | null;
  registrado_por: string | null;
  criado_em: string;
  atualizado_em: string;
  fornecedor?: { razao_social: string | null; cnpj: string | null } | null;
  processo?: { numero_requisicao: string | null; objeto: string | null; modalidade: string | null } | null;
  registrado_por_profile?: { nome: string | null } | null;
}

export interface RegistrarDesistenciaPayload {
  processo_id: string;
  fornecedor_id?: string | null;
  motivo: string;
  status?: string;
  documento_path?: string | null;
  registrado_por?: string | null;
}

export async function getPenalidades(): Promise<Penalidade[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("penalidades")
    .select(PENALIDADES_SELECT)
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as Penalidade[];
}

export async function aplicarPenalidade(payload: AplicarPenalidadePayload): Promise<Penalidade> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("penalidades")
    .insert({
      ...payload,
      notificacoes_enviadas: payload.notificacoes_enviadas ?? 0,
      status: payload.status ?? "Aplicada",
    })
    .select(PENALIDADES_SELECT)
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  if (payload.processo_id) {
    const { data: processo, error: processoError } = await supabase
      .from("processos")
      .select("id, numero_requisicao, responsavel_id")
      .eq("id", payload.processo_id)
      .single();

    if (processoError) {
      throw new Error(getErrorMessage(processoError));
    }

    if (processo?.responsavel_id) {
      await enviarNotificacao({
        usuario_id: processo.responsavel_id,
        tipo: "critical",
        titulo: "Nova penalidade aplicada",
        mensagem: `Uma penalidade do tipo ${payload.tipo_penalidade} foi registrada para o processo ${processo.numero_requisicao || payload.processo_id}.`,
        referencia_tipo: "penalidade",
        referencia_id: data.id,
      });
    }
  }

  return data as Penalidade;
}

export async function updatePenalidadeStatus(
  id: string,
  status: Penalidade["status"],
  parecer_tecnico?: string | null
): Promise<Penalidade> {
  const supabase = createClient();

  const { data: penalidadeAtual, error: penalidadeAtualError } = await supabase
    .from("penalidades")
    .select("id, processo_id, tipo_penalidade, processo:processos(numero_requisicao)")
    .eq("id", id)
    .single();

  if (penalidadeAtualError) {
    throw new Error(getErrorMessage(penalidadeAtualError));
  }

  const updatePayload: Partial<Penalidade> & { parecer_tecnico?: string | null } = {
    status,
    parecer_tecnico: parecer_tecnico ?? null,
  };

  if (status === "Aplicada" || status === "Quitada" || status === "Arquivada") {
    updatePayload.data_aplicacao = new Date().toISOString().slice(0, 10);
  }

  const { data, error } = await supabase
    .from("penalidades")
    .update(updatePayload)
    .eq("id", id)
    .select(PENALIDADES_SELECT)
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  if (status === "Contestada") {
    const { data: admins, error: adminsError } = await supabase
      .from("profiles")
      .select("id")
      .eq("perfil", "admin")
      .eq("ativo", true);

    if (adminsError) {
      throw new Error(getErrorMessage(adminsError));
    }

    const processo = penalidadeAtual.processo as { numero_requisicao?: string | null } | null;

    await Promise.all(
      (admins ?? []).map((admin) =>
        enviarNotificacao({
          usuario_id: admin.id as string,
          tipo: "warning",
          titulo: "Nova Defesa Registrada",
          mensagem: `A penalidade ${penalidadeAtual.tipo_penalidade} vinculada ao processo ${processo?.numero_requisicao || penalidadeAtual.processo_id || penalidadeAtual.id} recebeu uma contestação.`,
          referencia_tipo: "penalidade",
          referencia_id: penalidadeAtual.id as string,
        })
      )
    );
  }

  return data as Penalidade;
}

export async function vincularDocumentoPenalidade(penalidadeId: string, storagePath: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("documentos")
    .update({ caminho_arquivo: storagePath })
    .eq("id", penalidadeId);

  if (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getDesistencias(): Promise<Desistencia[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("desistencias")
    .select(DESISTENCIAS_SELECT)
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as Desistencia[];
}

export async function registrarDesistencia(payload: RegistrarDesistenciaPayload): Promise<Desistencia> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("desistencias")
    .insert({
      ...payload,
      status: payload.status ?? "Registrada",
    })
    .select(DESISTENCIAS_SELECT)
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Desistencia;
}
