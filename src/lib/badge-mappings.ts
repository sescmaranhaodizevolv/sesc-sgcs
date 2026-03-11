/**
 * Badge Mappings - Sistema global de mapeamento de status para cores
 * Garante consistência visual em todas as telas
 */
import type { BadgeMapping, BadgeIntent, BadgeWeight } from "@/types";

export type { BadgeIntent, BadgeWeight };
export type { BadgeMapping };

/** Mapeamento de status de processos para badges */
export const statusProcessoMapping: Record<string, BadgeMapping> = {
  // Success - Estados positivos/concluídos
  Finalizado: { intent: "success", weight: "heavy" },
  Concluída: { intent: "success", weight: "heavy" },
  Aprovado: { intent: "success", weight: "heavy" },
  Aprovada: { intent: "success", weight: "heavy" },
  Ativo: { intent: "success", weight: "light" },
  "Enviado Automaticamente": { intent: "success", weight: "medium" },
  Quitada: { intent: "success", weight: "medium" },

  // Info - Estados em andamento/neutros
  "RC recebida": { intent: "info", weight: "light" },
  "RC recebida pelo setor de compras": { intent: "info", weight: "light" },
  "Aguardando atribuição": { intent: "warning", weight: "medium" },
  "Análise de RC": { intent: "info", weight: "medium" },
  "Em cotação": { intent: "purple", weight: "medium" },
  "Em Análise": { intent: "info", weight: "medium" },
  "Em Cotação": { intent: "purple", weight: "medium" },
  "Em Cotação com Fornecedores": { intent: "purple", weight: "medium" },
  "Tramitando para aprovação": { intent: "warning", weight: "medium" },
  "Aguardando entrega": { intent: "info", weight: "medium" },
  "Aguardando Documentação": { intent: "info", weight: "light" },
  "Aguardando Próxima Execução": { intent: "info", weight: "light" },
  "Em Andamento": { intent: "warning", weight: "medium" },
  Pendente: { intent: "info", weight: "light" },
  "Em Contestação": { intent: "info", weight: "medium" },
  Contestada: { intent: "info", weight: "medium" },
  "Criação de contrato pendente": { intent: "warning", weight: "medium" },

  // Orange - Atenção moderada
  "RC devolvida para ajuste": { intent: "orange", weight: "medium" },
  "Devolvido ao Requisitante": { intent: "orange", weight: "medium" },
  Devolvido: { intent: "orange", weight: "medium" },
  "Devolvido ao Administrador": { intent: "warning", weight: "medium" },
  "Em Recurso": { intent: "orange", weight: "medium" },
  Registrada: { intent: "orange", weight: "medium" },

  // Warning - Atenção urgente
  "Próximo ao Vencimento": { intent: "warning", weight: "heavy" },
  Vencendo: { intent: "warning", weight: "heavy" },
  Pausada: { intent: "warning", weight: "medium" },
  Suspenso: { intent: "warning", weight: "medium" },
  Suspensa: { intent: "warning", weight: "medium" },

  // Danger - Críticos/negativos
  Urgente: { intent: "danger", weight: "heavy" },
  Rejeitado: { intent: "danger", weight: "heavy" },
  Rejeitada: { intent: "danger", weight: "heavy" },
  Vencido: { intent: "danger", weight: "light" },
  Vencida: { intent: "danger", weight: "light" },
  "Bloqueado por Exceção": { intent: "danger", weight: "heavy" },
  Falha: { intent: "danger", weight: "heavy" },
  Aplicada: { intent: "danger", weight: "medium" },

  // Neutral
  Cancelado: { intent: "neutral", weight: "medium" },
  Arquivada: { intent: "neutral", weight: "medium" },
  Inativo: { intent: "neutral", weight: "light" },
  Válido: { intent: "success", weight: "light" },
};

/** Mapeamento de prioridades */
export const prioridadeMapping: Record<string, BadgeMapping> = {
  Urgente: { intent: "danger", weight: "light" },
  Alta: { intent: "danger", weight: "light" },
  Média: { intent: "orange", weight: "light" },
  Baixa: { intent: "neutral", weight: "light" },
};

/** Mapeamento de perfis de usuários */
export const perfilMapping: Record<string, BadgeMapping> = {
  Administrador: { intent: "purple", weight: "medium" },
  "Comprador/Responsável": { intent: "info", weight: "medium" },
  "Requisitante/Visualizador": { intent: "neutral", weight: "light" },
  "Gestor de Contratos": { intent: "orange", weight: "medium" },
  Comprador: { intent: "info", weight: "medium" },
  Responsável: { intent: "info", weight: "light" },
  Requisitante: { intent: "neutral", weight: "light" },
  Visualizador: { intent: "neutral", weight: "light" },
};

/** Mapeamento de tipos de documento */
export const tipoDocumentoMapping: Record<string, BadgeMapping> = {
  Proposta: { intent: "info", weight: "light" },
  RC: { intent: "neutral", weight: "light" },
  Atestado: { intent: "success", weight: "light" },
  Contrato: { intent: "purple", weight: "light" },
  Outro: { intent: "neutral", weight: "light" },
  "Termo Homologado": { intent: "success", weight: "light" },
  Notificação: { intent: "warning", weight: "light" },
  Aditivo: { intent: "info", weight: "light" },
  Desistência: { intent: "danger", weight: "light" },
};

/** Helper: obter mapeamento de status */
export function getBadgeMappingForStatus(status: string): BadgeMapping {
  return statusProcessoMapping[status] ?? { intent: "neutral", weight: "medium" };
}

/** Helper: obter mapeamento de prioridade */
export function getBadgeMappingForPrioridade(prioridade: string): BadgeMapping {
  return prioridadeMapping[prioridade] ?? { intent: "neutral", weight: "medium" };
}

/** Helper: obter mapeamento de perfil */
export function getBadgeMappingForPerfil(perfil: string): BadgeMapping {
  return perfilMapping[perfil] ?? { intent: "neutral", weight: "medium" };
}

/** Helper: obter mapeamento de tipo de documento */
export function getBadgeMappingForTipoDocumento(tipo: string): BadgeMapping {
  return tipoDocumentoMapping[tipo] ?? { intent: "neutral", weight: "light" };
}
