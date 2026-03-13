import { createClient } from "@/lib/supabase/client";
import { enviarNotificacao } from "@/services/notificacoesService";
import type { RelatorioFiltros } from "@/types";
import { deleteDocumento, getDocumentos, uploadDocumento, type DocumentoItem } from "@/services/documentosService";

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
  documento_id?: string | null;
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

export interface RealinhamentoAnexo {
  id: string;
  nome: string;
  tamanho: string;
  data_upload: string;
  tipo: string;
  url_assinada: string;
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
  documento_id?: string | null;
  item: string;
  valor_original: number;
  valor_solicitado: number;
  justificativa?: string | null;
  responsavel_id?: string | null;
}

export async function getContratos(filtros?: RelatorioFiltros): Promise<Contrato[]> {
  const supabase = createClient();

  let query = supabase
    .from("contratos")
    .select(CONTRATOS_SELECT);

  if (filtros) {
    if (filtros.status && filtros.status !== "todos") {
      query = query.eq("status", filtros.status);
    }
    const campoData = filtros.tipoData || "criado_em";
    if (filtros.dataInicio) {
      query = query.gte(campoData, filtros.dataInicio);
    }
    if (filtros.dataFim) {
      query = query.lte(campoData, filtros.dataFim);
    }
  }

  const { data, error } = await query.order("criado_em", { ascending: false });

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

export async function getProrrogacoes(contratoId?: string, filtros?: RelatorioFiltros): Promise<Prorrogacao[]> {
  const supabase = createClient();

  let query = supabase
    .from("prorrogacoes")
    .select(PRORROGACOES_SELECT);

  if (contratoId) {
    query = query.eq("contrato_id", contratoId);
  }

  if (filtros) {
    if (filtros.status && filtros.status !== "todos") {
      query = query.eq("status", filtros.status);
    }
    const campoData = filtros.tipoData || "data_solicitacao";
    if (filtros.dataInicio) {
      query = query.gte(campoData, filtros.dataInicio);
    }
    if (filtros.dataFim) {
      query = query.lte(campoData, filtros.dataFim);
    }
  }

  const { data, error } = await query.order("data_solicitacao", { ascending: false });

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

  let prorrogacaoIds: string[] | null = null;

  if (contratoId) {
    const { data: prorrogacoes, error: prorrogacoesError } = await supabase
      .from("prorrogacoes")
      .select("id")
      .eq("contrato_id", contratoId);

    if (prorrogacoesError) {
      throw new Error(getErrorMessage(prorrogacoesError));
    }

    prorrogacaoIds = (prorrogacoes ?? []).map((item) => item.id as string);
    if (prorrogacaoIds.length === 0) {
      return [];
    }
  }

  let query = supabase
    .from("historico_prorrogacoes")
    .select("*")
    .order("criado_em", { ascending: false });

  if (prorrogacaoIds) {
    query = query.in("prorrogacao_id", prorrogacaoIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  const rows = (data ?? []) as HistoricoProrrogacao[];
  const ids = Array.from(new Set(rows.map((row) => row.prorrogacao_id).filter((value): value is string => Boolean(value))));

  if (ids.length === 0) {
    return rows;
  }

  const { data: prorrogacoesRelacionadas, error: relaciondasError } = await supabase
    .from("prorrogacoes")
    .select("id, contrato_id, nova_data_fim, status")
    .in("id", ids);

  if (relaciondasError) {
    throw new Error(getErrorMessage(relaciondasError));
  }

  const prorrogacoesMap = new Map(
    (prorrogacoesRelacionadas ?? []).map((item) => [
      item.id as string,
      {
        contrato_id: item.contrato_id as string | null,
        nova_data_fim: item.nova_data_fim as string | null,
        status: item.status as string | null,
      },
    ]),
  );

  return rows.map((row) => ({
    ...row,
    prorrogacao: row.prorrogacao_id ? prorrogacoesMap.get(row.prorrogacao_id) || null : null,
  }));
}

export async function getRealinhamentos(contratoId?: string, filtros?: RelatorioFiltros): Promise<Realinhamento[]> {
  const supabase = createClient();

  let query = supabase
    .from("realinhamentos")
    .select(REALINHAMENTOS_SELECT);

  if (contratoId) {
    query = query.eq("contrato_id", contratoId);
  }

  if (filtros) {
    if (filtros.status && filtros.status !== "todos") {
      query = query.eq("status", filtros.status);
    }
    const campoData = filtros.tipoData || "data_solicitacao";
    if (filtros.dataInicio) {
      query = query.gte(campoData, filtros.dataInicio);
    }
    if (filtros.dataFim) {
      query = query.lte(campoData, filtros.dataFim);
    }
  }

  const { data, error } = await query.order("data_solicitacao", { ascending: false });

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

function formatDocumentSize(size?: number | null) {
  if (!size || Number.isNaN(size)) return "0 KB";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getRealinhamentoDocumentTag(realinhamentoId: string) {
  return `[realinhamento:${realinhamentoId}]`;
}

export async function getRealinhamentoAnexos(realinhamentoId: string): Promise<RealinhamentoAnexo[]> {
  const documentos = await getDocumentos({ tipo: "Realinhamento" });

  return documentos
    .filter((documento) => documento.descricao?.includes(getRealinhamentoDocumentTag(realinhamentoId)))
    .map((documento) => ({
      id: documento.id,
      nome: documento.nome_arquivo,
      tamanho: formatDocumentSize(documento.tamanho_bytes),
      data_upload: new Date(documento.criado_em).toLocaleDateString("pt-BR"),
      tipo: documento.tipo_conteudo || documento.tipo || "Arquivo",
      url_assinada: documento.url_assinada,
    }));
}

export async function uploadAnexoRealinhamento(realinhamentoId: string, file: File, userId: string): Promise<RealinhamentoAnexo> {
  const supabase = createClient();
  const { data: realinhamento, error } = await supabase
    .from("realinhamentos")
    .select("id, contrato_id, contrato:contratos(numero_contrato, processo_id, fornecedor_id, fornecedor:fornecedores(razao_social))")
    .eq("id", realinhamentoId)
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  const contrato = realinhamento.contrato as {
    numero_contrato?: string | null;
    processo_id?: string | null;
    fornecedor_id?: string | null;
    fornecedor?: { razao_social?: string | null } | null;
  } | null;

  const documento = await uploadDocumento(
    file,
    {
      fornecedor_id: contrato?.fornecedor_id ?? null,
      processo_id: contrato?.processo_id ?? null,
      empresa: contrato?.fornecedor?.razao_social || "Fornecedor não identificado",
      processo: contrato?.numero_contrato || realinhamentoId,
      tipo: "Realinhamento",
      categoria: "Realinhamento",
      periodo: new Date().toISOString().slice(0, 7),
      palavras_chave: ["realinhamento", contrato?.numero_contrato || realinhamentoId],
      descricao: `${getRealinhamentoDocumentTag(realinhamentoId)} Documento anexado ao realinhamento`,
      titulo: `Realinhamento ${contrato?.numero_contrato || realinhamentoId}`,
    },
    userId,
  );

  const { error: updateError } = await supabase
    .from("realinhamentos")
    .update({ documento_id: documento.id })
    .eq("id", realinhamentoId);

  if (updateError) {
    throw new Error(getErrorMessage(updateError));
  }

  return {
    id: documento.id,
    nome: documento.nome_arquivo,
    tamanho: formatDocumentSize(documento.tamanho_bytes),
    data_upload: new Date(documento.criado_em).toLocaleDateString("pt-BR"),
    tipo: documento.tipo_conteudo || documento.tipo || "Arquivo",
    url_assinada: documento.url_assinada,
  };
}

export async function deleteAnexoRealinhamento(anexoId: string): Promise<void> {
  await deleteDocumento(anexoId);
}
