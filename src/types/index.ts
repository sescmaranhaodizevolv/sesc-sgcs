// ============================================================
// SESC SGCS - Data Schema (Tipagem estrita, sem 'any')
// Interfaces derivadas do PRD e do protótipo Figma Make
// ============================================================

/** Perfis de usuário do sistema */
export type UserProfile = "admin" | "comprador" | "requisitante" | "gestora";

/** Status de processo (mapeamento completo do badge-mappings) */
export type StatusProcesso =
    | "RC recebida"
    | "RC recebida pelo servidor de compras"
    | "Análise de RC"
    | "Em Análise"
    | "Em cotação"
    | "Em Cotação"
    | "Em Cotação com Fornecedores"
    | "Tramitando para aprovação"
    | "Criação de contrato pendente"
    | "Aprovado"
    | "Aprovada"
    | "Rejeitado"
    | "Rejeitada"
    | "Finalizado"
    | "Concluída"
    | "Em Andamento"
    | "Pendente"
    | "Cancelado"
    | "Ativo"
    | "Inativo"
    | "Urgente"
    | "Suspenso"
    | "Suspensa"
    | "Pausada"
    | "Vencido"
    | "Vencida"
    | "Próximo ao Vencimento"
    | "Vencendo"
    | "Bloqueado por Exceção"
    | "Falha"
    | "RC devolvida para ajuste"
    | "Devolvido ao Requisitante"
    | "Devolvido"
    | "Devolvido ao Administrador"
    | "Aguardando Documentação"
    | "Aguardando Próxima Execução"
    | "Enviado Automaticamente"
    | "Em Contestação"
    | "Aplicada"
    | "Quitada"
    | "Em Recurso"
    | "Registrada"
    | "Válido";

/** Prioridade de um processo ou chamado */
export type Prioridade = "Urgente" | "Alta" | "Média" | "Baixa";

/** Intenção visual dos badges */
export type BadgeIntent =
    | "success"
    | "info"
    | "warning"
    | "danger"
    | "neutral"
    | "purple"
    | "orange";

/** Peso visual dos badges */
export type BadgeWeight = "heavy" | "medium" | "light";

/** Mapeamento de badge para renderização */
export interface BadgeMapping {
    intent: BadgeIntent;
    weight: BadgeWeight;
}

// ============================================================
// Entidades do domínio
// ============================================================

/** Usuário do sistema SGCS */
export interface Usuario {
    id: string;
    nome: string;
    email: string;
    perfil: UserProfile;
    ativo: boolean;
    ultimoAcesso: string;
    departamento?: string;
    avatar?: string;
}

/** Processo de compra */
export interface Processo {
    id: string;
    descricao: string;
    numeroRequisicao?: string;
    requisitante?: string;
    objeto?: string;
    modalidade: string;
    empresa: string;
    empresaVencedora?: string;
    cnpj?: string;
    status: StatusProcesso;
    statusContrato?: "Ativo" | "Próximo ao Vencimento" | "Vencido";
    responsavel: string;
    prioridade: Prioridade;
    dataDistribuicao: string;
    dataRecebimento?: string;
    dataFinalizacao?: string;
    dataEntrega?: string;
    dataAprovacao?: string;
    dataInicio?: string;
    dataFim?: string;
    valor?: string;
    observacoesInternas?: string;
    leadTime?: number;
    /** ID da devolução ao admin (quando aplicável) */
    justificativaDevolucao?: string;
}

/** Fornecedor cadastrado */
export interface Fornecedor {
    id: string;
    razaoSocial: string;
    cnpj: string;
    categoria: string;
    email: string;
    telefone?: string;
    endereco?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
    status: "Ativo" | "Inativo";
    dataCadastro?: string;
}

/** Fornecedor para Combobox (formato simplificado) */
export interface FornecedorCombobox {
    value: string;
    label: string;
    cnpj: string;
    categoria: string;
}

/** Penalidade aplicada a um fornecedor */
export interface Penalidade {
    id: number;
    empresa: string;
    processo: string;
    penalidade: string;
    multa: string;
    valor: string;
    notificacoes: number;
    status: StatusProcesso;
    dataOcorrencia: string;
    dataAplicacao: string;
    dataVencimento: string;
    dataEncerramento?: string;
    responsavel: string;
}

/** Realinhamento de preço de contrato */
export interface Realinhamento {
    id: number;
    contrato: string;
    item: string;
    valorOriginal: string;
    valorSolicitado: string;
    justificativa: string;
    data: string;
    status: StatusProcesso;
}

/** Histórico de aditivo de prorrogação */
export interface HistoricoProrrogacao {
    aditivo: string;
    dataInicio: string;
    dataFim: string;
    observacoes: string;
}

/** Prorrogação de contrato */
export interface Prorrogacao {
    id: number;
    empresa: string;
    contrato: string;
    objetoContrato: string;
    cnpjCpf: string;
    numeroProcesso: string;
    valorContratadoAnual: string;
    dataInicio: string;
    dataFimOriginal: string;
    dataFimProrrogada: string;
    prazoOriginal: string;
    prazoProrrogacao: string;
    quantidadeAditivos: number;
    passivelProrrogar: boolean;
    status: string;
    motivo: string;
    dataSolicitacao: string;
    responsavel: string;
    historicoProrrogacoes: HistoricoProrrogacao[];
}

/** Requisição de Compra (perfil Requisitante) */
export interface RequisicaoCompra {
    id: string;
    objeto: string;
    descricao: string;
    dataRequisicao: string;
    status: StatusProcesso;
    responsavelAtual: string;
    departamento: string;
    solicitante: string;
}

/** Etapa da linha do tempo */
export interface EtapaTimeline {
    titulo: string;
    descricao?: string;
    responsavel: string;
    data: string;
    status: "concluido" | "em-andamento" | "pendente";
    mensagem?: string;
}

/** Item de atividade recente */
export interface AtividadeRecente {
    title: string;
    time: string;
    status: string;
    iconBg: string;
}

/** Notificação in-app */
export interface Notificacao {
    id: string;
    tipo: "critical" | "warning" | "success" | "info";
    titulo: string;
    mensagem: string;
    data: string;
    lida: boolean;
}

/** Item de menu da sidebar */
export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    href?: string;
    children?: MenuItem[];
}

/** Métricas do dashboard */
export interface MetricaDashboard {
    title: string;
    value: string;
    change: string;
    iconBg: string;
}
