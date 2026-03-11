import { createClient } from "@/lib/supabase/client";

function getErrorMessage(error: { message?: string | null; details?: string | null }) {
  return error.details || error.message || "Ocorreu um erro ao processar a solicitacao";
}

export interface Notificacao {
  id: string;
  usuario_id: string;
  tipo: "critical" | "warning" | "success" | "info";
  titulo: string;
  mensagem: string;
  lida: boolean;
  referencia_tipo: string | null;
  referencia_id: string | null;
  criado_em: string;
}

export interface EnviarNotificacaoPayload {
  usuario_id: string;
  tipo: Notificacao["tipo"];
  titulo: string;
  mensagem: string;
  referencia_tipo?: string | null;
  referencia_id?: string | null;
}

function getDaysUntil(value?: string | null) {
  if (!value) return null;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  return Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
}

async function notificacaoJaExiste(
  usuarioId: string,
  referenciaTipo: string,
  referenciaId: string
): Promise<boolean> {
  const supabase = createClient();

  const inicioHoje = new Date();
  inicioHoje.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("notificacoes")
    .select("id")
    .eq("usuario_id", usuarioId)
    .eq("referencia_tipo", referenciaTipo)
    .eq("referencia_id", referenciaId)
    .gte("criado_em", inicioHoje.toISOString())
    .limit(1);

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []).length > 0;
}

export async function getNotificacoes(limit?: number): Promise<Notificacao[]> {
  const supabase = createClient();

  let query = supabase
    .from("notificacoes")
    .select("*")
    .order("criado_em", { ascending: false });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as Notificacao[];
}

export async function marcarComoLida(id: string): Promise<Notificacao> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Notificacao;
}

export async function enviarNotificacao(payload: EnviarNotificacaoPayload): Promise<Notificacao> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notificacoes")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Notificacao;
}

export async function processarAlertasVencimento(): Promise<{ contratos: number; certificados: number }> {
  const supabase = createClient();
  const marcos = new Set([30, 15, 5]);
  let contratosNotificados = 0;
  let certificadosNotificados = 0;

  const { data: contratos, error: contratosError } = await supabase
    .from("contratos")
    .select("id, numero_contrato, data_fim_atual, data_fim_original, responsavel_id")
    .not("responsavel_id", "is", null);

  if (contratosError) {
    throw new Error(getErrorMessage(contratosError));
  }

  for (const contrato of contratos ?? []) {
    const dias = getDaysUntil((contrato.data_fim_atual as string | null) ?? (contrato.data_fim_original as string | null));
    if (dias === null || !marcos.has(dias) || !contrato.responsavel_id) continue;

    const referenciaTipo = `contrato_vencimento_${dias}`;
    const jaExiste = await notificacaoJaExiste(contrato.responsavel_id as string, referenciaTipo, contrato.id as string);
    if (jaExiste) continue;

    await enviarNotificacao({
      usuario_id: contrato.responsavel_id as string,
      tipo: "critical",
      titulo: `Contrato vence em ${dias} dias`,
      mensagem: `O contrato ${contrato.numero_contrato || contrato.id} atinge o vencimento em ${dias} dias e requer providências imediatas.`,
      referencia_tipo: referenciaTipo,
      referencia_id: contrato.id as string,
    });
    contratosNotificados += 1;
  }

  const { data: perfisOperacionais, error: perfisError } = await supabase
    .from("profiles")
    .select("id, perfil")
    .in("perfil", ["admin", "comprador"])
    .eq("ativo", true);

  if (perfisError) {
    throw new Error(getErrorMessage(perfisError));
  }

  const { data: atestados, error: atestadosError } = await supabase
    .from("atestados_fornecedor")
    .select("id, fornecedor_id, nome_arquivo, validade, enviado_por, fornecedor:fornecedores(razao_social)")
    .not("validade", "is", null);

  if (atestadosError) {
    throw new Error(getErrorMessage(atestadosError));
  }

  for (const atestado of atestados ?? []) {
    const dias = getDaysUntil(atestado.validade as string | null);
    if (dias === null || !marcos.has(dias)) continue;

    const destinatarios = new Set<string>();
    if (atestado.enviado_por) {
      destinatarios.add(atestado.enviado_por as string);
    }

    for (const perfil of perfisOperacionais ?? []) {
      destinatarios.add(perfil.id as string);
    }

    for (const usuarioId of Array.from(destinatarios)) {
      const referenciaTipo = `certificado_vencimento_${dias}`;
      const jaExiste = await notificacaoJaExiste(usuarioId, referenciaTipo, atestado.id as string);
      if (jaExiste) continue;

      const fornecedor = atestado.fornecedor as { razao_social?: string | null } | null;

      await enviarNotificacao({
        usuario_id: usuarioId,
        tipo: "warning",
        titulo: `Certificado vence em ${dias} dias`,
        mensagem: `O certificado ${atestado.nome_arquivo || atestado.id} do fornecedor ${fornecedor?.razao_social || atestado.fornecedor_id || "-"} vence em ${dias} dias.`,
        referencia_tipo: referenciaTipo,
        referencia_id: atestado.id as string,
      });
      certificadosNotificados += 1;
    }
  }

  return { contratos: contratosNotificados, certificados: certificadosNotificados };
}
