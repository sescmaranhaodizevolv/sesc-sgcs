// Mapeamento de status do sistema para intenções e pesos dos badges
// Seguindo o guia global de Badges (Heavy / Medium / Light)

export type BadgeIntent = 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'purple' | 'orange';
export type BadgeWeight = 'heavy' | 'medium' | 'light';

export interface BadgeMapping {
  intent: BadgeIntent;
  weight: BadgeWeight;
}

// Mapeamento de status de processos
export const statusProcessoMapping: Record<string, BadgeMapping> = {
  // Success - Estados positivos/concluídos
  'Finalizado': { intent: 'success', weight: 'heavy' },  // Fim de ciclo - destaque máximo
  'Concluída': { intent: 'success', weight: 'heavy' },    // Fim de ciclo - destaque máximo
  'Aprovado': { intent: 'success', weight: 'heavy' },     // DECISÃO POSITIVA FINAL - destaque máximo
  'Aprovada': { intent: 'success', weight: 'heavy' },     // DECISÃO POSITIVA FINAL - destaque máximo
  'Ativo': { intent: 'success', weight: 'light' },        // Estado informativo positivo (leve)
  'Enviado Automaticamente': { intent: 'success', weight: 'medium' },
  'Quitada': { intent: 'success', weight: 'medium' },     // Penalidade quitada
  
  // Info - Estados em andamento/neutros
  'RC recebida': { intent: 'info', weight: 'light' },  // Recebimento inicial
  'RC recebida pelo servidor de compras': { intent: 'info', weight: 'light' },  // Recebimento inicial (compatibilidade)
  'Análise de RC': { intent: 'info', weight: 'medium' },     // Progresso principal - análise técnica
  'Em cotação': { intent: 'purple', weight: 'medium' },   // Cotação com fornecedores (roxo - destaque especial)
  'Em Análise': { intent: 'info', weight: 'medium' },     // Progresso principal - análise técnica (compatibilidade)
  'Em Cotação': { intent: 'purple', weight: 'medium' },   // Cotação com fornecedores (roxo - destaque especial) (compatibilidade)
  'Em Cotação com Fornecedores': { intent: 'purple', weight: 'medium' },
  'Tramitando para aprovação': { intent: 'warning', weight: 'medium' },  // Aguardando aprovação final
  'Aguardando Documentação': { intent: 'info', weight: 'light' },  // Informativo leve
  'Aguardando Próxima Execução': { intent: 'info', weight: 'light' },
  'Em Andamento': { intent: 'warning', weight: 'medium' },   // Trabalho ativo em progresso (amarelo)
  'Pendente': { intent: 'info', weight: 'light' },        // Informativo leve
  'Em Contestação': { intent: 'info', weight: 'medium' }, // Penalidade em disputa
  'Criação de contrato pendente': { intent: 'warning', weight: 'medium' },  // Aguardando criação de contrato
  
  // Orange - Estados que precisam de atenção moderada
  'RC devolvida para ajuste': { intent: 'orange', weight: 'medium' },  // RC devolvida para correção
  'Devolvido ao Requisitante': { intent: 'orange', weight: 'medium' },
  'Devolvido': { intent: 'orange', weight: 'medium' },
  'Devolvido ao Administrador': { intent: 'warning', weight: 'medium' },  // Comprador devolveu - requer decisão do Admin
  'Em Recurso': { intent: 'orange', weight: 'medium' },
  'Registrada': { intent: 'orange', weight: 'medium' },   // Desistência registrada
  
  // Warning - Estados que requerem atenção urgente
  'Próximo ao Vencimento': { intent: 'warning', weight: 'heavy' },  // Alerta crítico!
  'Vencendo': { intent: 'warning', weight: 'heavy' },               // Alerta crítico!
  'Pausada': { intent: 'warning', weight: 'medium' },
  'Suspenso': { intent: 'warning', weight: 'medium' },
  'Suspensa': { intent: 'warning', weight: 'medium' },
  
  // Danger - Estados críticos/negativos
  'Urgente': { intent: 'danger', weight: 'heavy' },        // Crítico!
  'Rejeitado': { intent: 'danger', weight: 'heavy' },      // DECISÃO NEGATIVA FINAL - destaque máximo
  'Rejeitada': { intent: 'danger', weight: 'heavy' },      // DECISÃO NEGATIVA FINAL - destaque máximo
  'Vencido': { intent: 'danger', weight: 'light' },        // Vencido mas leve para não sobrecarregar
  'Vencida': { intent: 'danger', weight: 'light' },        // Vencido mas leve para não sobrecarregar
  'Bloqueado por Exceção': { intent: 'danger', weight: 'heavy' },
  'Falha': { intent: 'danger', weight: 'heavy' },
  'Aplicada': { intent: 'danger', weight: 'medium' },      // Penalidade aplicada
  
  // Neutral - Estados meta/desabilitados
  'Cancelado': { intent: 'neutral', weight: 'medium' },
  'Inativo': { intent: 'neutral', weight: 'light' },       // Discreto (leve)
  'Válido': { intent: 'success', weight: 'light' },        // Status positivo mas discreto
};

// Mapeamento de prioridades
export const prioridadeMapping: Record<string, BadgeMapping> = {
  'Urgente': { intent: 'danger', weight: 'light' },   // Vermelho claro
  'Alta': { intent: 'danger', weight: 'light' },      // Vermelho claro - chamados
  'Média': { intent: 'orange', weight: 'light' },     // Laranja claro - atenção moderada
  'Baixa': { intent: 'neutral', weight: 'light' },    // Cinza leve - baixo ruído
};

// Mapeamento de perfis de usuários
export const perfilMapping: Record<string, BadgeMapping> = {
  'Administrador': { intent: 'purple', weight: 'medium' },  // Roxo - perfil especial
  'Comprador': { intent: 'info', weight: 'medium' },        // Azul - operacional
  'Responsável': { intent: 'info', weight: 'light' },       // Azul leve
  'Requisitante': { intent: 'neutral', weight: 'light' },   // Cinza leve
  'Visualizador': { intent: 'neutral', weight: 'light' },   // Cinza leve
};

// Mapeamento de tipos de documento (Light - baixo ruído visual)
export const tipoDocumentoMapping: Record<string, BadgeMapping> = {
  'Proposta': { intent: 'info', weight: 'light' },
  'RC': { intent: 'neutral', weight: 'light' },
  'Atestado': { intent: 'success', weight: 'light' },
  'Contrato': { intent: 'purple', weight: 'light' },
  'Outro': { intent: 'neutral', weight: 'light' },
  
  // Tipos de documentos finais (tela Documentos)
  'Termo Homologado': { intent: 'success', weight: 'light' },
  'Notificação': { intent: 'warning', weight: 'light' },
  'Aditivo': { intent: 'info', weight: 'light' },
  'Desistência': { intent: 'danger', weight: 'light' },
};

// Função helper para obter mapeamento de status
export function getBadgeMappingForStatus(status: string): BadgeMapping {
  return statusProcessoMapping[status] || { intent: 'neutral', weight: 'medium' };
}

// Função helper para obter mapeamento de prioridade
export function getBadgeMappingForPrioridade(prioridade: string): BadgeMapping {
  return prioridadeMapping[prioridade] || { intent: 'neutral', weight: 'medium' };
}

// Função helper para obter mapeamento de perfil
export function getBadgeMappingForPerfil(perfil: string): BadgeMapping {
  return perfilMapping[perfil] || { intent: 'neutral', weight: 'medium' };
}

// Função helper para obter mapeamento de tipo de documento
export function getBadgeMappingForTipoDocumento(tipo: string): BadgeMapping {
  return tipoDocumentoMapping[tipo] || { intent: 'neutral', weight: 'light' };
}