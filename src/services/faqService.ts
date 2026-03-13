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

export async function getFaqCategories(): Promise<string[]> {
  const faqs = await getFaqs();

  return Array.from(new Set(faqs.map((faq) => faq.categoria).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
}

export async function getQuestionsByCategory(categoria: string): Promise<FaqItem[]> {
  const normalized = categoria.trim();
  if (!normalized) return [];

  const supabase = createClient();

  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .eq("ativo", true)
    .eq("categoria", normalized)
    .order("pergunta", { ascending: true });

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

  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .eq("ativo", true)
    .order("categoria", { ascending: true })
    .limit(50);

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  const faqs = (data ?? []) as FaqItem[];

  const resultados = faqs
    .map((faq) => {
      const pergunta = faq.pergunta.toLowerCase();
      const resposta = faq.resposta.toLowerCase();
      const palavrasChave = faq.palavras_chave.map((item) => item.toLowerCase());

      const score = termos.reduce((acc, item) => {
        if (palavrasChave.includes(item)) return acc + 120;
        if (palavrasChave.some((keyword) => keyword.includes(item) || item.includes(keyword))) return acc + 90;
        if (pergunta.includes(item)) return acc + 60;
        if (resposta.includes(item)) return acc + 20;
        return acc;
      }, 0);

      return { faq, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.faq.pergunta.localeCompare(b.faq.pergunta, "pt-BR"));

  return resultados.map((item) => item.faq);
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
