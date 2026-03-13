import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

function getDaysUntil(value?: string | null) {
  if (!value) return null;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  return Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
}

Deno.serve(async (req) => {
  try {
    // Requires SERVICE_ROLE_KEY to bypass RLS and read all profiles
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const marcos = new Set([30, 15, 5]);
    let contratosNotificados = 0;
    let certificadosNotificados = 0;

    // Processar Contratos
    const { data: contratos, error: contratosError } = await supabase
      .from("contratos")
      .select("id, numero_contrato, data_fim_atual, data_fim_original, responsavel_id")
      .not("responsavel_id", "is", null);

    if (contratosError) throw contratosError;

    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);

    for (const contrato of contratos ?? []) {
        const dias = getDaysUntil(contrato.data_fim_atual ?? contrato.data_fim_original);
        if (dias === null || !marcos.has(dias)) continue;

        const referenciaTipo = `contrato_vencimento_${dias}`;
        
        // Verifica se ja existe
        const { data: existente } = await supabase
          .from("notificacoes")
          .select("id")
          .eq("usuario_id", contrato.responsavel_id)
          .eq("referencia_tipo", referenciaTipo)
          .eq("referencia_id", contrato.id)
          .gte("criado_em", inicioHoje.toISOString())
          .limit(1);
          
        if (existente && existente.length > 0) continue;

        await supabase.from("notificacoes").insert({
          usuario_id: contrato.responsavel_id,
          tipo: "critical",
          titulo: `Contrato vence em ${dias} dias`,
          mensagem: `O contrato ${contrato.numero_contrato || contrato.id} atinge o vencimento em ${dias} dias e requer providências imediatas.`,
          referencia_tipo: referenciaTipo,
          referencia_id: contrato.id,
          lida: false
        });
        contratosNotificados++;
    }

    // Processar Certificados / Atestados
    const { data: perfisOperacionais } = await supabase
      .from("profiles")
      .select("id")
      .in("perfil", ["admin", "comprador"])
      .eq("ativo", true);

    const { data: atestados, error: atestadosError } = await supabase
      .from("atestados_fornecedor")
      .select("id, fornecedor_id, nome_arquivo, validade, enviado_por, fornecedor:fornecedores(razao_social)")
      .not("validade", "is", null);

    if (atestadosError) throw atestadosError;

    for (const atestado of atestados ?? []) {
      const dias = getDaysUntil(atestado.validade);
      if (dias === null || !marcos.has(dias)) continue;

      const destinatarios = new Set<string>();
      if (atestado.enviado_por) destinatarios.add(atestado.enviado_por);
      for (const perfil of perfisOperacionais ?? []) {
        destinatarios.add(perfil.id);
      }

      for (const usuarioId of Array.from(destinatarios)) {
        const referenciaTipo = `certificado_vencimento_${dias}`;
        
        const { data: existente } = await supabase
          .from("notificacoes")
          .select("id")
          .eq("usuario_id", usuarioId)
          .eq("referencia_tipo", referenciaTipo)
          .eq("referencia_id", atestado.id)
          .gte("criado_em", inicioHoje.toISOString())
          .limit(1);
          
        if (existente && existente.length > 0) continue;

        const rs = atestado.fornecedor && Array.isArray(atestado.fornecedor) && atestado.fornecedor.length > 0 ? (atestado.fornecedor[0] as any).razao_social : (atestado.fornecedor as any)?.razao_social;
        
        await supabase.from("notificacoes").insert({
          usuario_id: usuarioId,
          tipo: "warning",
          titulo: `Certificado vence em ${dias} dias`,
          mensagem: `O certificado ${atestado.nome_arquivo || atestado.id} do fornecedor ${rs || atestado.fornecedor_id || "-"} vence em ${dias} dias.`,
          referencia_tipo: referenciaTipo,
          referencia_id: atestado.id,
          lida: false
        });
        certificadosNotificados++;
      }
    }

    return new Response(JSON.stringify({ 
        success: true, 
        contratosNotificados, 
        certificadosNotificados 
    }), {
        headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
    });
  }
});
