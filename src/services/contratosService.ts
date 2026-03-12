import { createClient } from "@/lib/supabase/client";
import { enviarNotificacao } from "@/services/notificacoesService";

function getErrorMessage(error: { message?: string | null; details?: string | null }) {
  return error.details || error.message || "Ocorreu um erro ao processar a solicitacao";
}

const CONTRATOS_SELECT = `
  *,
  processo:processos(numero_requisicao,objeto,modalidade,observacoes_internas),
  fornecedor:fornecedores(razao_social,cnpj),
  responsavel:profiles!contratos_responsavel_id_fkey(nome)
`;

const PRORROGACOES_SELECT = `
  *,
  contrato:contratos(numero_contrato),
  responsavel:profiles!prorrogacoes_responsavel_id_fkey(nome)
`;

const REALINHAMENTOS_SELECT = `
  *,
  contrato:contratos(numero_contrato,fornecedor:fornecedores(razao_social,cnpj)),
  responsavel:profiles!realinhamentos_responsavel_id_fkey(nome)
`;

const HISTORICO_PRORROGACOES_SELECT = `
  *,
  prorrogacao:prorrogacoes(contrato_id,nova_data_fim,status)
`;

export interface Contrato {
  id: string;
  processo_id: string | null;
  fornecedor_id: string | null;
  numero_contrato: string;
  objeto: string;
  valor_anual: number;
  data_inicio: string | null;
  data_fim_original: string | null;
  data_fim_atual: string | null;
  quantidade_aditivos: number | null;
  status: string | null;
  responsavel_id: string | null;
  criado_em: string;
  processo?: {
    numero_requisicao: string | null;
    objeto: string | null;
    modalidade: string | null;
    observacoes_internas: string | null;
  } | null;
  fornecedor?: { razao_social: string | null; cnpj: string | null } | null;
  responsavel?: { nome: string | null } | null;
}

export interface Prorrogacao {
  id: string;
  contrato_id: string | null;
  nova_data_fim: string;
  motivo: string | null;
  status: string | null;
  data_solicitacao: string;
  responsavel_id: string | null;
  contrato?: { numero_contrato: string | null } | null;
  responsavel?: { nome: string | null } | null;
}

export interface HistoricoProrrogacao {
  id: string;
  prorrogacao_id: string | null;
  aditivo: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  observacoes: string | null;
  criado_em: string;
  prorrogacao?: { contrato_id: string | null; nova_data_fim: string | null; status: string | null } | null;
}

export interface Realinhamento {
  id: string;
  contrato_id: string | null;
  item: string;
  valor_original: number;
  valor_solicitado: number;
  variacao_percentual: number;
  justificativa: string | null;
  parecer_gestao: string | null;
  status: string | null;
  data_solicitacao: string;
  responsavel_id: string | null;
  contrato?: {
    numero_contrato: string | null;
    fornecedor?: { razao_social: string | null; cnpj: string | null } | null;
  } | null;
  responsavel?: { nome: string | null } | null;
}

export interface CreateContratoPayload {
  processo_id?: string | null;
  fornecedor_id?: string | null;
  numero_contrato: string;
  objeto: string;
  valor_anual: number;
  data_inicio?: string | null;
  data_fim_original?: string | null;
  data_fim_atual?: string | null;
  quantidade_aditivos?: number;
  status?: string | null;
  responsavel_id?: string | null;
}

export interface CreateProrrogacaoPayload {
  contrato_id: string;
  nova_data_fim: string;
  motivo?: string | null;
  status?: string | null;
  responsavel_id?: string | null;
}

export interface CreateRealinhamentoPayload {
  contrato_id: string;
  item: string;
  valor_original: number;
  valor_solicitado: number;
  justificativa?: string | null;
  responsavel_id?: string | null;
}

export async function getContratos(): Promise<Contrato[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("contratos")
    .select(CONTRATOS_SELECT)
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as Contrato[];
}

export async function getContratoById(id: string): Promise<Contrato> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("contratos")
    .select(CONTRATOS_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Contrato;
}

export async function createContrato(dados: CreateContratoPayload): Promise<Contrato> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("contratos")
    .insert(dados)
    .select(CONTRATOS_SELECT)
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Contrato;
}

export async function updateContrato(id: string, dados: Partial<CreateContratoPayload>): Promise<Contrato> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("contratos")
    .update(dados)
    .eq("id", id)
    .select(CONTRATOS_SELECT)
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Contrato;
}

export async function getProrrogacoes(contratoId?: string): Promise<Prorrogacao[]> {
  const supabase = createClient();

  let query = supabase
    .from("prorrogacoes")
    .select(PRORROGACOES_SELECT)
    .order("data_solicitacao", { ascending: false });

  if (contratoId) {
    query = query.eq("contrato_id", contratoId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as Prorrogacao[];
}

export async function solicitarProrrogacao(dados: CreateProrrogacaoPayload): Promise<Prorrogacao> {
  const supabase = createClient();

  const payload = {
    ...dados,
    status: dados.status ?? "Pendente",
  };

  const { data, error } = await supabase
    .from("prorrogacoes")
    .insert(payload)
    .select(PRORROGACOES_SELECT)
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Prorrogacao;
}

export async function aprovarProrrogacao(
  prorrogacaoId: string,
  contratoId: string,
  novaDataFim: string,
  userId: string,
  aditivo?: string,
  observacoes?: string
): Promise<void> {
  const supabase = createClient();

  const { error: prorrogacaoError } = await supabase
    .from("prorrogacoes")
    .update({ status: "Aprovada" })
    .eq("id", prorrogacaoId);

  if (prorrogacaoError) {
    throw new Error(getErrorMessage(prorrogacaoError));
  }

  const { data: contratoAtual, error: contratoFetchError } = await supabase
    .from("contratos")
    .select("data_fim_atual, quantidade_aditivos, numero_contrato, responsavel_id")
    .eq("id", contratoId)
    .single();

  if (contratoFetchError) {
    throw new Error(getErrorMessage(contratoFetchError));
  }

  const quantidadeAtual = Number(contratoAtual.quantidade_aditivos || 0);

  const { error: contratoUpdateError } = await supabase
    .from("contratos")
    .update({
      data_fim_atual: novaDataFim,
      quantidade_aditivos: quantidadeAtual + 1,
      responsavel_id: userId,
    })
    .eq("id", contratoId);

  if (contratoUpdateError) {
    throw new Error(getErrorMessage(contratoUpdateError));
  }

  const { error: historicoError } = await supabase
    .from("historico_prorrogacoes")
    .insert({
      prorrogacao_id: prorrogacaoId,
      aditivo: aditivo || `Aditivo ${quantidadeAtual + 1}`,
      data_inicio: contratoAtual.data_fim_atual,
      data_fim: novaDataFim,
      observacoes: observacoes || "Prorrogação aprovada",
    });

  if (historicoError) {
    throw new Error(getErrorMessage(historicoError));
  }

  if (contratoAtual.responsavel_id) {
    await enviarNotificacao({
      usuario_id: contratoAtual.responsavel_id,
      tipo: "success",
      titulo: "Prorrogação aprovada",
      mensagem: `A prorrogação do contrato ${contratoAtual.numero_contrato || contratoId} foi aprovada com vigência até ${novaDataFim}.`,
      referencia_tipo: "contrato",
      referencia_id: contratoId,
    });
  }
}

export async function rejeitarProrrogacao(prorrogacaoId: string): Promise<Prorrogacao> {
  const supabase = createClient();

  const { data: prorrogacaoAtual, error: prorrogacaoAtualError } = await supabase
    .from("prorrogacoes")
    .select("id, contrato_id, contrato:contratos(numero_contrato,responsavel_id)")
    .eq("id", prorrogacaoId)
    .single();

  if (prorrogacaoAtualError) {
    throw new Error(getErrorMessage(prorrogacaoAtualError));
  }

  const { data, error } = await supabase
    .from("prorrogacoes")
    .update({ status: "Rejeitada" })
    .eq("id", prorrogacaoId)
    .select(PRORROGACOES_SELECT)
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  const contrato = prorrogacaoAtual.contrato as { numero_contrato?: string | null; responsavel_id?: string | null } | null;

  if (contrato?.responsavel_id && prorrogacaoAtual.contrato_id) {
    await enviarNotificacao({
      usuario_id: contrato.responsavel_id,
      tipo: "warning",
      titulo: "Prorrogação rejeitada",
      mensagem: `A solicitação de prorrogação do contrato ${contrato.numero_contrato || prorrogacaoAtual.contrato_id} foi rejeitada e precisa de revisão.`,
      referencia_tipo: "contrato",
      referencia_id: prorrogacaoAtual.contrato_id,
    });
  }

  return data as Prorrogacao;
}

export async function getHistoricoProrrogacoes(contratoId?: string): Promise<HistoricoProrrogacao[]> {
  const supabase = createClient();

  let query = supabase
    .from("historico_prorrogacoes")
    .select(HISTORICO_PRORROGACOES_SELECT)
    .order("criado_em", { ascending: false });

  if (contratoId) {
    query = query.eq("prorrogacao.contrato_id", contratoId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as HistoricoProrrogacao[];
}

export async function getRealinhamentos(contratoId?: string): Promise<Realinhamento[]> {
  const supabase = createClient();

  let query = supabase
    .from("realinhamentos")
    .select(REALINHAMENTOS_SELECT)
    .order("data_solicitacao", { ascending: false });

  if (contratoId) {
    query = query.eq("contrato_id", contratoId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as Realinhamento[];
}

export async function solicitarRealinhamento(dados: CreateRealinhamentoPayload): Promise<Realinhamento> {
  const supabase = createClient();

  const payload = {
    ...dados,
    status: "Pendente",
  };

  const { data, error } = await supabase
    .from("realinhamentos")
    .insert(payload)
    .select(REALINHAMENTOS_SELECT)
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Realinhamento;
}

export async function updateRealinhamentoStatus(
  id: string,
  status: "Aprovado" | "Rejeitado",
  parecerGestao?: string | null
): Promise<Realinhamento> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("realinhamentos")
    .update({ status, parecer_gestao: parecerGestao ?? null })
    .eq("id", id)
    .select(REALINHAMENTOS_SELECT)
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Realinhamento;
}
