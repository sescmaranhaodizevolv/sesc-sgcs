import { createClient } from "@/lib/supabase/client";
import { enviarNotificacao } from "@/services/notificacoesService";
import type { Processo, ProcessoComDetalhes, ProcessoTimeline } from "@/types";

export interface ProcessoAnexo {
  id: string;
  processo_id: string;
  nome_arquivo: string;
  caminho_arquivo: string;
  tamanho_bytes: number | null;
  tipo_conteudo: string | null;
  criado_por: string | null;
  criado_em: string;
  url_publica: string;
  criado_por_nome: string;
}

const PROCESSOS_SELECT = `
  *,
  fornecedor:fornecedores(razao_social),
  responsavel:profiles!processos_responsavel_id_fkey(nome),
  requisitante:profiles!processos_requisitante_id_fkey(nome)
`;

const PROCESSO_TIMELINE_SELECT = `
  *,
  responsavel:profiles!processo_timeline_responsavel_id_fkey(nome)
`;

export interface ProcessoPayload {
  numero_requisicao?: string | null;
  descricao?: string | null;
  objeto?: string | null;
  modalidade?: string | null;
  status?: string | null;
  prioridade?: string | null;
  responsavel_id?: string | null;
  requisitante_id?: string | null;
  fornecedor_id?: string | null;
  empresa_vencedora?: string | null;
  valor?: number | null;
  observacoes_internas?: string | null;
  lead_time?: number | null;
  justificativa_devolucao?: string | null;
  bloquear_envio_automatico?: boolean;
  data_distribuicao?: string | null;
  data_recebimento?: string | null;
  data_finalizacao?: string | null;
  data_inicio?: string | null;
  data_fim?: string | null;
}

export interface CompradorOption {
  id: string;
  nome: string;
}

export interface RequisitanteOption {
  id: string;
  nome: string;
}

interface CreateRequisicaoPayload {
  numero_requisicao?: string | null;
  data_recebimento?: string | null;
  objeto?: string | null;
  prioridade?: string | null;
  categoria?: string | null;
  regional?: string | null;
  valor?: number | null;
  requisitante_id?: string | null;
}

type ProcessoRCPayload = CreateRequisicaoPayload;

interface CreateProcessoManualPayload extends ProcessoPayload {
  numero_processo?: string | null;
}

interface CreateProcessoConsolidadoPayload {
  numero_requisicao?: string | null;
  valor?: string | number | null;
  empresa_vencedora?: string | null;
  requisitante_id?: string | null;
  data_fim?: string | null;
  status?: string | null;
  modalidade?: string | null;
  objeto?: string | null;
  observacoes_internas?: string | null;
  cnpj?: string | null;
  tipoInstrumento?: "Contrato" | "TRP" | null;
}

interface AditivoPayload {
  numero: string;
  data: string;
  tipo: string;
  valor?: string | number | null;
  justificativa: string;
}

type ProcessoTimelineComDetalhes = ProcessoTimeline & {
  responsavel?: { nome: string } | null;
};

type ProcessoAnexoRow = {
  id: string;
  processo_id: string;
  nome_arquivo: string;
  caminho_arquivo: string;
  tamanho_bytes: number | null;
  tipo_conteudo: string | null;
  criado_por: string | null;
  criado_em: string;
};

async function getPerfisPorIds(ids: string[]) {
  if (ids.length === 0) return new Map<string, string>();

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,nome")
    .in("id", ids);

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return new Map((data ?? []).map((perfil) => [perfil.id as string, (perfil.nome as string) || "Sistema"]));
}

function getErrorMessage(error: { message?: string | null; details?: string | null }) {
  return error.details || error.message || "Ocorreu um erro ao processar a solicitacao";
}

function parseCurrencyValue(value?: string | null) {
  if (!value) return null;
  const normalized = value.replace(/\s|R\$/g, "").replace(/\./g, "").replace(/,/g, ".").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeCurrencyValue(value?: string | number | null) {
  if (typeof value === "number") return value;
  return parseCurrencyValue(value);
}

function parseObservacoesMetadata(observacoes?: string | null) {
  if (!observacoes) {
    return { tipoInstrumento: null as string | null, cnpj: null as string | null, observacoes: "" };
  }

  try {
    const parsed = JSON.parse(observacoes) as {
      tipoInstrumento?: string | null;
      cnpj?: string | null;
      observacoes?: string | null;
    };

    return {
      tipoInstrumento: parsed.tipoInstrumento ?? null,
      cnpj: parsed.cnpj ?? null,
      observacoes: parsed.observacoes ?? "",
    };
  } catch {
    const tipoInstrumento = observacoes.match(/Instrumento:\s*([^|\]\n]+)/i)?.[1]?.trim() ?? null;
    const cnpj = observacoes.match(/CNPJ:\s*([^|\n]+)/i)?.[1]?.trim() ?? null;
    const observacoesLimpas = observacoes
      .replace(/\[?Instrumento:\s*[^|\]]+\]?/gi, "")
      .replace(/CNPJ:\s*[^|\n]+/gi, "")
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean)
      .join(" | ");

    return { tipoInstrumento, cnpj, observacoes: observacoesLimpas };
  }
}

function stringifyObservacoesMetadata(params: {
  tipoInstrumento?: string | null;
  cnpj?: string | null;
  observacoes?: string | null;
}) {
  return JSON.stringify({
    tipoInstrumento: params.tipoInstrumento ?? null,
    cnpj: params.cnpj ?? null,
    observacoes: params.observacoes ?? "",
  });
}

export async function getProcessos(): Promise<ProcessoComDetalhes[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("processos")
    .select(PROCESSOS_SELECT)
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as ProcessoComDetalhes[];
}

export async function getRequisicoesPendentes(): Promise<ProcessoComDetalhes[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("processos")
    .select(PROCESSOS_SELECT)
    .eq("status", "RC recebida pelo setor de compras")
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as ProcessoComDetalhes[];
}

export async function getProcessoById(id: string): Promise<ProcessoComDetalhes> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("processos")
    .select(PROCESSOS_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as ProcessoComDetalhes;
}

export async function createProcesso(dados: ProcessoPayload): Promise<Processo> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("processos")
    .insert(dados)
    .select()
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Processo;
}

export async function createProcessoManual(dados: CreateProcessoManualPayload): Promise<Processo> {
  const { numero_processo, ...restoDados } = dados;

  const observacoes = [
    restoDados.numero_requisicao ? `ID Requisição: ${restoDados.numero_requisicao}` : "",
    restoDados.observacoes_internas ?? "",
  ]
    .filter(Boolean)
    .join(" | ");

  return createProcesso({
    ...restoDados,
    numero_requisicao: numero_processo ?? restoDados.numero_requisicao ?? null,
    observacoes_internas: observacoes || null,
  });
}

export async function createProcessoConsolidado(dados: CreateProcessoConsolidadoPayload): Promise<Processo> {
  const observacoesMetadata = stringifyObservacoesMetadata({
    tipoInstrumento: dados.tipoInstrumento ?? null,
    cnpj: dados.cnpj ?? null,
    observacoes: dados.observacoes_internas ?? dados.objeto ?? "",
  });

  const processo = await createProcesso({
    numero_requisicao: dados.numero_requisicao ?? null,
    valor: normalizeCurrencyValue(dados.valor),
    empresa_vencedora: dados.empresa_vencedora ?? null,
    requisitante_id: dados.requisitante_id ?? null,
    data_fim: dados.data_fim ?? null,
    status: dados.status ?? "Ativo",
    modalidade: dados.modalidade ?? "Dispensa",
    objeto: dados.objeto ?? null,
    descricao: dados.objeto ?? null,
    observacoes_internas: observacoesMetadata,
  });

  const supabase = createClient();
  const { data: gestoras, error: gestorasError } = await supabase
    .from("profiles")
    .select("id")
    .eq("perfil", "gestora")
    .eq("ativo", true);

  if (gestorasError) {
    throw new Error(getErrorMessage(gestorasError));
  }

  await Promise.all(
    (gestoras ?? []).map((gestora) =>
      enviarNotificacao({
        usuario_id: gestora.id as string,
        tipo: "info",
        titulo: "Novo processo consolidado",
        mensagem: `O processo ${processo.numero_requisicao || processo.id} foi consolidado e está pronto para a gestão contratual.`,
        referencia_tipo: "processo",
        referencia_id: processo.id,
      })
    )
  );

  return processo;
}

export async function registrarAditivo(id: string, dadosAditivo: AditivoPayload): Promise<Processo> {
  const supabase = createClient();

  const { data: processoAtual, error: processoAtualError } = await supabase
    .from("processos")
    .select("id, valor, observacoes_internas")
    .eq("id", id)
    .single();

  if (processoAtualError) {
    throw new Error(getErrorMessage(processoAtualError));
  }

  const valorAditivo = normalizeCurrencyValue(dadosAditivo.valor);
  const atualizaValor = dadosAditivo.tipo === "valor" || dadosAditivo.tipo === "misto";
  const observacaoAditivo = [
    `Aditivo ${dadosAditivo.numero}`,
    dadosAditivo.data ? `Data: ${dadosAditivo.data}` : "",
    dadosAditivo.tipo ? `Tipo: ${dadosAditivo.tipo}` : "",
    dadosAditivo.justificativa ? `Justificativa: ${dadosAditivo.justificativa}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  const { data, error } = await supabase
    .from("processos")
    .update({
      ...(atualizaValor
        ? { valor: Number(processoAtual.valor || 0) + Number(valorAditivo || 0) }
        : {}),
      observacoes_internas: stringifyObservacoesMetadata({
        tipoInstrumento: parseObservacoesMetadata(processoAtual.observacoes_internas).tipoInstrumento,
        cnpj: parseObservacoesMetadata(processoAtual.observacoes_internas).cnpj,
        observacoes: [parseObservacoesMetadata(processoAtual.observacoes_internas).observacoes, observacaoAditivo]
          .filter(Boolean)
          .join(" | "),
      }),
    })
    .eq("id", processoAtual.id)
    .select()
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Processo;
}

export async function registrarProrrogacao(id: string, novaDataFim: string, justificativa: string): Promise<Processo> {
  const supabase = createClient();

  const { data: processoAtual, error: processoAtualError } = await supabase
    .from("processos")
    .select("id, observacoes_internas")
    .eq("id", id)
    .single();

  if (processoAtualError) {
    throw new Error(getErrorMessage(processoAtualError));
  }

  const observacaoProrrogacao = [
    `Prorrogação de vigência para ${novaDataFim}`,
    justificativa ? `Justificativa: ${justificativa}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  const { data, error } = await supabase
    .from("processos")
    .update({
      data_fim: novaDataFim,
      observacoes_internas: stringifyObservacoesMetadata({
        tipoInstrumento: parseObservacoesMetadata(processoAtual.observacoes_internas).tipoInstrumento,
        cnpj: parseObservacoesMetadata(processoAtual.observacoes_internas).cnpj,
        observacoes: [parseObservacoesMetadata(processoAtual.observacoes_internas).observacoes, observacaoProrrogacao]
          .filter(Boolean)
          .join(" | "),
      }),
    })
    .eq("id", processoAtual.id)
    .select()
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Processo;
}

export async function updateProcessoStatus(
  processoId: string,
  novoStatus: string,
  responsavelId: string | null,
  mensagem?: string
): Promise<void> {
  const supabase = createClient();

  let observacoesInternas: string | null | undefined;

  if (mensagem) {
    const { data: processoAtual, error: processoAtualError } = await supabase
      .from("processos")
      .select("observacoes_internas")
      .eq("id", processoId)
      .single();

    if (processoAtualError) {
      throw new Error(getErrorMessage(processoAtualError));
    }

    const registroJustificativa = `Justificativa de status (${novoStatus}): ${mensagem}`;
    observacoesInternas = [processoAtual?.observacoes_internas, registroJustificativa].filter(Boolean).join(" | ");
  }

  const { error: updateError } = await supabase
    .from("processos")
    .update({
      status: novoStatus,
      ...(mensagem ? { observacoes_internas: observacoesInternas || null } : {}),
    })
    .eq("id", processoId);

  if (updateError) {
    throw new Error(getErrorMessage(updateError));
  }

  const { error: timelineError } = await supabase
    .from("processo_timeline")
    .insert({
      processo_id: processoId,
      titulo: "Mudança de Status",
      status: novoStatus,
      mensagem: mensagem || `Status atualizado para ${novoStatus}`,
      responsavel_id: responsavelId,
    });

  if (timelineError) {
    throw new Error(getErrorMessage(timelineError));
  }
}

export async function updateProcesso(id: string, dados: Partial<ProcessoPayload>): Promise<Processo> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("processos")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Processo;
}

export async function updateProcessoDetails(id: string, dados: Partial<ProcessoPayload>): Promise<Processo> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("processos")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Processo;
}

export async function updateProcessoConsolidado(
  id: string,
  dados: Omit<Partial<ProcessoPayload>, "valor"> & {
    valor?: string | number | null;
    cnpj?: string | null;
    tipoInstrumento?: string | null;
  }
): Promise<Processo> {
  const supabase = createClient();

  const metadataAtual = parseObservacoesMetadata(dados.observacoes_internas);

  const payload: Partial<ProcessoPayload> = {
    ...dados,
    valor: typeof dados.valor === "string" ? parseCurrencyValue(dados.valor) : (dados.valor ?? null),
    observacoes_internas: stringifyObservacoesMetadata({
      tipoInstrumento: dados.tipoInstrumento ?? metadataAtual.tipoInstrumento,
      cnpj: dados.cnpj ?? metadataAtual.cnpj,
      observacoes: metadataAtual.observacoes,
    }),
  };

  const { data, error } = await supabase
    .from("processos")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Processo;
}

export async function getProcessoTimeline(processoId: string): Promise<ProcessoTimelineComDetalhes[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("processo_timeline")
    .select(PROCESSO_TIMELINE_SELECT)
    .eq("processo_id", processoId)
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as ProcessoTimelineComDetalhes[];
}

export async function getAtividadesRecentesGlobais(limite = 5): Promise<ProcessoTimelineComDetalhes[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("processo_timeline")
    .select(PROCESSO_TIMELINE_SELECT)
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as ProcessoTimelineComDetalhes[];
}

export async function uploadAnexo(processoId: string, file: File, userId: string): Promise<ProcessoAnexo> {
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const caminhoArquivo = `${processoId}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("anexos")
    .upload(caminhoArquivo, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(getErrorMessage(uploadError));
  }

  const { data, error } = await supabase
    .from("processo_anexos")
    .insert({
      processo_id: processoId,
      nome_arquivo: file.name,
      caminho_arquivo: caminhoArquivo,
      tamanho_bytes: file.size,
      tipo_conteudo: file.type || null,
      criado_por: userId,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from("anexos").remove([caminhoArquivo]);
    throw new Error(getErrorMessage(error));
  }

  const { data: publicUrlData } = supabase.storage.from("anexos").getPublicUrl(caminhoArquivo);
  const row = data as ProcessoAnexoRow;
  const perfisMap = await getPerfisPorIds(row.criado_por ? [row.criado_por] : []);

  const { error: timelineError } = await supabase
    .from("processo_timeline")
    .insert({
      processo_id: processoId,
      titulo: "Novo Documento Anexado",
      status: "Documentação",
      mensagem: `O arquivo "${file.name}" foi anexado ao processo.`,
      responsavel_id: userId,
    });

  if (timelineError) {
    console.error("Erro ao registrar timeline de anexo:", timelineError);
  }

  return {
    ...row,
    url_publica: publicUrlData.publicUrl,
    criado_por_nome: row.criado_por ? perfisMap.get(row.criado_por) || "Sistema" : "Sistema",
  };
}

export async function getAnexos(processoId: string): Promise<ProcessoAnexo[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("processo_anexos")
    .select("*")
    .eq("processo_id", processoId)
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  const rows = (data ?? []) as ProcessoAnexoRow[];
  const perfisMap = await getPerfisPorIds(
    Array.from(new Set(rows.map((row) => row.criado_por).filter((value): value is string => Boolean(value))))
  );

  return rows.map((row) => {
    const { data: publicUrlData } = supabase.storage.from("anexos").getPublicUrl(row.caminho_arquivo);

    return {
      ...row,
      url_publica: publicUrlData.publicUrl,
      criado_por_nome: row.criado_por ? perfisMap.get(row.criado_por) || "Sistema" : "Sistema",
    };
  });
}

export async function deleteAnexo(anexoId: string, caminhoArquivo: string, processoId: string, userId: string): Promise<void> {
  const supabase = createClient();

  const { error: storageError } = await supabase.storage.from("anexos").remove([caminhoArquivo]);

  if (storageError) {
    throw new Error(getErrorMessage(storageError));
  }

  const { error } = await supabase
    .from("processo_anexos")
    .delete()
    .eq("id", anexoId);

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  const nomeArquivo = caminhoArquivo.split("/").pop()?.split("_").slice(1).join("_") || "anexo";
  const { error: timelineError } = await supabase
    .from("processo_timeline")
    .insert({
      processo_id: processoId,
      titulo: "Documento Excluído",
      mensagem: `Um anexo foi removido do processo. (${nomeArquivo})`,
      responsavel_id: userId,
    });

  if (timelineError) {
    console.error("Erro ao registrar timeline de exclusão de anexo:", timelineError);
  }
}

export async function deleteProcesso(id: string): Promise<void> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("processos")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  if (!data || data.length === 0) {
    throw new Error("Nenhum processo foi excluido. Verifique as permissoes de acesso.");
  }
}

export async function getCompradores(): Promise<CompradorOption[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,nome")
      .eq("perfil", "comprador")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao buscar compradores em profiles:", error);
      throw new Error(getErrorMessage(error));
    }

    return (data ?? []).map((item) => ({ id: item.id as string, nome: (item.nome as string) || "Sem nome" }));
  } catch (error) {
    console.error("Falha inesperada ao carregar compradores:", error);
    throw error;
  }
}

export async function getCompradoresNomes(): Promise<string[]> {
  const compradores = await getCompradores();
  return compradores.map((comprador) => comprador.nome);
}

export async function getRequisitantes(): Promise<RequisitanteOption[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id,nome")
    .eq("perfil", "requisitante")
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []).map((item) => ({ id: item.id as string, nome: (item.nome as string) || "Sem nome" }));
}

export async function createProcessoRC(dados: ProcessoRCPayload): Promise<Processo> {
  const supabase = createClient();

  const observacoes = [
    dados.regional ? `Regional: ${dados.regional}` : "",
    dados.categoria ? `Categoria: ${dados.categoria}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  const payload: ProcessoPayload = {
    numero_requisicao: dados.numero_requisicao ?? null,
    data_recebimento: dados.data_recebimento ?? null,
    objeto: dados.objeto ?? null,
    descricao: dados.objeto ?? null,
    prioridade: dados.prioridade ?? "Média",
    valor: dados.valor ?? null,
    requisitante_id: dados.requisitante_id ?? null,
    status: "RC recebida pelo setor de compras",
    observacoes_internas: observacoes || null,
  };

  const { data, error } = await supabase
    .from("processos")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Processo;
}

export async function createRequisicao(dados: CreateRequisicaoPayload): Promise<Processo> {
  const supabase = createClient();

  const observacoes = [
    dados.categoria ? `Categoria: ${dados.categoria}` : "",
    dados.data_recebimento ? `Data Recebimento: ${dados.data_recebimento}` : "",
    dados.regional ? `Regional: ${dados.regional}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  const payload: ProcessoPayload = {
    numero_requisicao: dados.numero_requisicao ?? null,
    data_recebimento: dados.data_recebimento ?? null,
    objeto: dados.objeto ?? null,
    descricao: dados.objeto ?? null,
    prioridade: dados.prioridade ?? "Média",
    valor: dados.valor ?? null,
    requisitante_id: dados.requisitante_id ?? null,
    status: "RC recebida pelo setor de compras",
    observacoes_internas: observacoes || null,
  };

  const { data, error } = await supabase
    .from("processos")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Processo;
}

export async function atribuirCompradorRC(
  idProcesso: string,
  nomeComprador: string,
  dataDistribuicao: string
): Promise<void> {
  const supabase = createClient();

  const { data: comprador, error: compradorError } = await supabase
    .from("profiles")
    .select("id")
    .eq("perfil", "comprador")
    .eq("nome", nomeComprador)
    .maybeSingle();

  if (compradorError) {
    throw new Error(getErrorMessage(compradorError));
  }

  if (!comprador?.id) {
    throw new Error("Comprador nao encontrado.");
  }

  const { error } = await supabase
    .from("processos")
    .update({
      responsavel_id: comprador.id as string,
      data_distribuicao: dataDistribuicao,
      status: "Análise de RC",
    })
    .eq("id", idProcesso);

  if (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updatePrioridadeRC(idProcesso: string, prioridade: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("processos")
    .update({ prioridade })
    .eq("id", idProcesso);

  if (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updatePrioridade(idProcesso: string, prioridade: string): Promise<void> {
  await updatePrioridadeRC(idProcesso, prioridade);
}

export async function iniciarProcesso(
  id: string,
  modalidade: string,
  status: string,
  responsavelId?: string
): Promise<void> {
  const supabase = createClient();

  const payload: Partial<ProcessoPayload> = { modalidade, status };

  if (responsavelId) {
    payload.responsavel_id = responsavelId;
    payload.data_distribuicao = new Date().toISOString();
  }

  const { error } = await supabase
    .from("processos")
    .update(payload)
    .eq("id", id);

  if (error) {
    throw new Error(getErrorMessage(error));
  }
}
