import { createClient } from "@/lib/supabase/client";

export interface Chamado {
  id: string;
  usuario_id: string;
  responsavel_id: string | null;
  assunto: string;
  descricao: string;
  categoria: string | null;
  prioridade: string;
  status: string;
  processo_referencia: string | null;
  criado_em: string;
  atualizado_em: string;
  usuario?: { nome: string | null } | null;
  responsavel?: { nome: string | null } | null;
}

export interface CriarChamadoPayload {
  assunto: string;
  descricao: string;
  categoria?: string | null;
  prioridade: string;
  processo_referencia?: string | null;
}

function getErrorMessage(error: { message?: string | null; details?: string | null }) {
  return error.details || error.message || "Ocorreu um erro ao processar a solicitação";
}

async function getCurrentUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário autenticado não encontrado.");
  }

  return user.id;
}

export async function getChamados(): Promise<Chamado[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chamados")
    .select("*, usuario:profiles!chamados_usuario_id_fkey(nome), responsavel:profiles!chamados_responsavel_id_fkey(nome)")
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as Chamado[];
}

export async function criarChamado(payload: CriarChamadoPayload): Promise<Chamado> {
  const supabase = createClient();
  const usuarioId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("chamados")
    .insert({
      usuario_id: usuarioId,
      assunto: payload.assunto,
      descricao: payload.descricao,
      categoria: payload.categoria ?? null,
      prioridade: payload.prioridade,
      processo_referencia: payload.processo_referencia ?? null,
      status: "Aberto",
    })
    .select("*, usuario:profiles!chamados_usuario_id_fkey(nome), responsavel:profiles!chamados_responsavel_id_fkey(nome)")
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Chamado;
}

export async function atualizarStatusChamado(id: string, status: string, responsavel_id?: string | null): Promise<Chamado> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chamados")
    .update({ status, responsavel_id: responsavel_id ?? null })
    .eq("id", id)
    .select("*, usuario:profiles!chamados_usuario_id_fkey(nome), responsavel:profiles!chamados_responsavel_id_fkey(nome)")
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Chamado;
}
