import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "documentos-processos";

export interface DocumentoPayload {
  fornecedor_id?: string | null;
  processo_id?: string | null;
  empresa: string;
  processo: string;
  tipo: string;
  categoria: string;
  periodo: string;
  palavras_chave: string[];
  descricao: string;
  titulo?: string;
  acesso_publico?: boolean;
}

export interface DocumentoItem {
  id: string;
  titulo: string | null;
  nome_arquivo: string;
  caminho_arquivo: string;
  fornecedor_id: string | null;
  processo_id: string | null;
  empresa: string | null;
  processo: string | null;
  tipo: string | null;
  categoria: string | null;
  periodo: string | null;
  palavras_chave: string[];
  descricao: string | null;
  tamanho_bytes: number | null;
  tipo_conteudo: string | null;
  acesso_publico: boolean;
  criado_por: string | null;
  criado_em: string;
  url_assinada: string;
  criado_por_nome: string;
}

type DocumentoRow = Omit<DocumentoItem, "url_assinada" | "criado_por_nome">;

export interface DocumentoFilters {
  processo_id?: string;
  fornecedor_id?: string;
  tipo?: string;
  categoria?: string;
}

function getErrorMessage(error: { message?: string | null; details?: string | null }) {
  return error.details || error.message || "Ocorreu um erro ao processar a solicitação";
}

async function getPerfisPorIds(ids: string[]) {
  if (ids.length === 0) return new Map<string, string>();

  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("id,nome").in("id", ids);

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return new Map((data ?? []).map((perfil) => [perfil.id as string, (perfil.nome as string) || "Sistema"]));
}

export async function uploadDocumento(file: File, payload: DocumentoPayload, userId: string): Promise<DocumentoItem> {
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const processFolder = (payload.processo || "sem-processo").replace(/[^a-zA-Z0-9._-]/g, "_");
  const caminhoArquivo = `${processFolder}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(caminhoArquivo, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (uploadError) {
    throw new Error(getErrorMessage(uploadError));
  }

  const { data, error } = await supabase
    .from("documentos")
    .insert({
      titulo: payload.titulo ?? [payload.tipo, payload.categoria, payload.periodo, payload.empresa].filter(Boolean).join(" – "),
      nome_arquivo: file.name,
      caminho_arquivo: caminhoArquivo,
      fornecedor_id: payload.fornecedor_id ?? null,
      processo_id: payload.processo_id ?? null,
      empresa: payload.empresa,
      processo: payload.processo,
      tipo: payload.tipo,
      categoria: payload.categoria,
      periodo: payload.periodo,
      palavras_chave: payload.palavras_chave,
      descricao: payload.descricao,
      tamanho_bytes: file.size,
      tipo_conteudo: file.type || null,
      acesso_publico: payload.acesso_publico ?? false,
      criado_por: userId,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from(BUCKET_NAME).remove([caminhoArquivo]);
    throw new Error(getErrorMessage(error));
  }

  const row = data as DocumentoRow;
  const { data: signed } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(caminhoArquivo, 60 * 60);
  const perfisMap = await getPerfisPorIds(row.criado_por ? [row.criado_por] : []);

  return {
    ...row,
    url_assinada: signed?.signedUrl || "",
    criado_por_nome: row.criado_por ? perfisMap.get(row.criado_por) || "Sistema" : "Sistema",
  };
}

export async function getDocumentos(filters?: DocumentoFilters): Promise<DocumentoItem[]> {
  const supabase = createClient();

  let query = supabase.from("documentos").select("*").order("criado_em", { ascending: false });

  if (filters?.processo_id) {
    query = query.eq("processo_id", filters.processo_id);
  }

  if (filters?.fornecedor_id) {
    query = query.eq("fornecedor_id", filters.fornecedor_id);
  }

  if (filters?.tipo) {
    query = query.eq("tipo", filters.tipo);
  }

  if (filters?.categoria) {
    query = query.eq("categoria", filters.categoria);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  const rows = (data ?? []) as DocumentoRow[];
  const perfisMap = await getPerfisPorIds(Array.from(new Set(rows.map((row) => row.criado_por).filter((value): value is string => Boolean(value)))));

  const documentos = await Promise.all(
    rows.map(async (row) => {
      const { data: signed } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(row.caminho_arquivo, 60 * 60);
      return {
        ...row,
        url_assinada: signed?.signedUrl || "",
        criado_por_nome: row.criado_por ? perfisMap.get(row.criado_por) || "Sistema" : "Sistema",
      };
    })
  );

  return documentos;
}

export async function deleteDocumento(documentoId: string): Promise<void> {
  const supabase = createClient();

  const { data: documento, error: fetchError } = await supabase
    .from("documentos")
    .select("caminho_arquivo")
    .eq("id", documentoId)
    .single();

  if (fetchError) {
    throw new Error(getErrorMessage(fetchError));
  }

  const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([documento.caminho_arquivo as string]);

  if (storageError) {
    throw new Error(getErrorMessage(storageError));
  }

  const { error } = await supabase.from("documentos").delete().eq("id", documentoId);

  if (error) {
    throw new Error(getErrorMessage(error));
  }
}
