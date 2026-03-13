import { createClient } from "@/lib/supabase/client";

function getErrorMessage(error: { message?: string | null; details?: string | null }) {
  return error.details || error.message || "Ocorreu um erro ao processar a solicitacao";
}

export interface AuditoriaLog {
  id: string;
  usuario_id: string | null;
  acao: string;
  tabela: string;
  registro_id: string | null;
  dados_anteriores: Record<string, unknown> | null;
  dados_novos: Record<string, unknown> | null;
  ip: string | null;
  criado_em: string;
  usuario?: {
    nome: string | null;
    email: string | null;
  } | null;
}

export interface AuditoriaLogFilters {
  tabela?: string;
  acao?: string;
  dataInicio?: string;
  dataFim?: string;
}

export async function getLogs(filters?: AuditoriaLogFilters): Promise<AuditoriaLog[]> {
  const supabase = createClient();

  let query = supabase
    .from("auditoria_logs")
    .select("*, usuario:profiles(nome,email)")
    .order("criado_em", { ascending: false });

  if (filters?.tabela) {
    query = query.eq("tabela", filters.tabela);
  }

  if (filters?.acao) {
    query = query.eq("acao", filters.acao);
  }

  if (filters?.dataInicio) {
    query = query.gte("criado_em", filters.dataInicio);
  }

  if (filters?.dataFim) {
    query = query.lte("criado_em", filters.dataFim);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as AuditoriaLog[];
}
