import { createClient } from "@/lib/supabase/client";
import type { AtestadoFornecedor, Fornecedor, RelatorioFiltros } from "@/types";

const BUCKET_NAME = "documentos-fornecedores";

export type CreateFornecedorInput = Omit<Fornecedor, "id" | "data_cadastro" | "status"> & {
  status?: Fornecedor["status"];
};

function getErrorMessage(error: { message?: string | null; details?: string | null; code?: string | null }) {
  return error.details || error.message || "Ocorreu um erro ao processar a solicitacao";
}

export async function getFornecedores(filtros?: RelatorioFiltros): Promise<Fornecedor[]> {
  const supabase = createClient();

  let query = supabase
    .from("fornecedores")
    .select("*");

  if (filtros) {
    if (filtros.status && filtros.status !== "todos") {
      query = query.eq("status", filtros.status);
    }
    const campoData = filtros.tipoData || "data_cadastro";
    if (filtros.dataInicio) {
      query = query.gte(campoData, filtros.dataInicio);
    }
    if (filtros.dataFim) {
      query = query.lte(campoData, filtros.dataFim);
    }
  }

  const { data, error } = await query.order("data_cadastro", { ascending: false });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as Fornecedor[];
}

export async function createFornecedor(dados: CreateFornecedorInput): Promise<Fornecedor> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("fornecedores")
    .insert(dados)
    .select()
    .single();

  if (error) {
    const isUniqueConstraint =
      error.code === "23505" ||
      /unique constraint|duplicate key/i.test(`${error.message ?? ""} ${error.details ?? ""}`);

    if (isUniqueConstraint) {
      throw new Error("Ja existe um fornecedor cadastrado com este CNPJ");
    }

    throw new Error(getErrorMessage(error));
  }

  return data as Fornecedor;
}

export async function updateFornecedorStatus(
  id: string,
  status: Fornecedor["status"]
): Promise<Fornecedor> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("fornecedores")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as Fornecedor;
}

export async function uploadAtestado(
  fornecedorId: string,
  file: File,
  validade: string | null,
  userId: string
): Promise<AtestadoFornecedor> {
  const supabase = createClient();
  const sanitizedFileName = file.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${fornecedorId}/${Date.now()}_${sanitizedFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(getErrorMessage(uploadError));
  }

  const { data, error } = await supabase
    .from("atestados_fornecedor")
    .insert({
      fornecedor_id: fornecedorId,
      nome_arquivo: sanitizedFileName,
      storage_path: filePath,
      validade,
      enviado_por: userId,
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    throw new Error(getErrorMessage(error));
  }

  return data as AtestadoFornecedor;
}

export async function getAtestados(fornecedorId: string): Promise<AtestadoFornecedor[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("atestados_fornecedor")
    .select("*")
    .eq("fornecedor_id", fornecedorId)
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as AtestadoFornecedor[];
}

export async function getAtestadoUrl(storagePath: string): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, 60);

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data.signedUrl;
}

export async function deleteAtestado(id: string, storagePath: string): Promise<void> {
  const supabase = createClient();

  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath]);

  if (storageError) {
    throw new Error(getErrorMessage(storageError));
  }

  const { error } = await supabase
    .from("atestados_fornecedor")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(getErrorMessage(error));
  }
}
