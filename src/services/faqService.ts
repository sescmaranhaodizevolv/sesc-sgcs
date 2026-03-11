import { createClient } from "@/lib/supabase/client";

function getErrorMessage(error: { message?: string | null; details?: string | null }) {
  return error.details || error.message || "Ocorreu um erro ao processar a solicitacao";
}

export interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
  palavras_chave: string[];
  categoria: string;
  ativo: boolean;
  criado_em: string;
}

export interface FaqPayload {
  pergunta: string;
  resposta: string;
  palavras_chave?: string[];
  categoria: string;
  ativo?: boolean;
}

export async function getFaqs(): Promise<FaqItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .eq("ativo", true)
    .order("categoria", { ascending: true })
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return (data ?? []) as FaqItem[];
}

export async function buscarFaqPorTermo(termo: string): Promise<FaqItem[]> {
  const normalized = termo.trim().toLowerCase();
  if (!normalized) return [];

  const supabase = createClient();
  const termos = normalized.split(/\s+/).filter(Boolean);

  let query = supabase
    .from("faq")
    .select("*")
    .eq("ativo", true)
    .or(`pergunta.ilike.%${normalized}%,resposta.ilike.%${normalized}%`)
    .order("categoria", { ascending: true })
    .limit(20);

  const { data, error } = await query;

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  const faqs = (data ?? []) as FaqItem[];

  return faqs.filter((faq) => {
    const pergunta = faq.pergunta.toLowerCase();
    const resposta = faq.resposta.toLowerCase();
    const palavrasChave = faq.palavras_chave.map((item) => item.toLowerCase());

    return termos.some(
      (item) => pergunta.includes(item) || resposta.includes(item) || palavrasChave.some((keyword) => keyword.includes(item) || item.includes(keyword))
    );
  });
}

export async function createFaq(payload: FaqPayload): Promise<FaqItem> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("faq")
    .insert({
      ...payload,
      palavras_chave: payload.palavras_chave ?? [],
      ativo: payload.ativo ?? true,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as FaqItem;
}

export async function updateFaq(id: string, payload: Partial<FaqPayload>): Promise<FaqItem> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("faq")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return data as FaqItem;
}

export async function deleteFaq(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("faq").delete().eq("id", id);

  if (error) {
    throw new Error(getErrorMessage(error));
  }
}
