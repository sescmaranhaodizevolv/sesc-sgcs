export interface FaqItem {
  id: number;
  pergunta: string;
  resposta: string;
  categoria: string;
  visualizacoes: number;
}

export const faqItemsIniciais: FaqItem[] = [
  {
    id: 1,
    pergunta: 'Como cadastrar um novo processo licitatório?',
    resposta: 'Para cadastrar um novo processo, acesse o menu "Processos" > "Gerenciamento de Processos" e clique em "Cadastrar Processo". Preencha todos os campos obrigatórios como modalidade, objeto, valor estimado e anexe os documentos necessários (termo de referência, edital, etc.). O sistema validará automaticamente as informações antes de salvar.',
    categoria: 'Processos',
    visualizacoes: 245
  },
  {
    id: 2,
    pergunta: 'Como aplicar uma penalidade a um fornecedor?',
    resposta: 'Acesse "Processos" > "Penalidades" e clique em "Aplicar Penalidade". Selecione a empresa fornecedora, o processo relacionado, o tipo de penalidade (advertência, multa, suspensão ou impedimento) e informe a justificativa detalhada com base legal. Anexe os documentos comprobatórios da infração.',
    categoria: 'Penalidades',
    visualizacoes: 189
  },
  {
    id: 3,
    pergunta: 'Como gerar relatórios personalizados?',
    resposta: 'No menu "Relatórios", utilize os filtros disponíveis para personalizar o relatório conforme suas necessidades. Você pode filtrar por período, modalidade, status, fornecedor e outros critérios. Após aplicar os filtros, clique em "Gerar Relatório" e escolha o formato de exportação (PDF, Excel ou CSV).',
    categoria: 'Relatórios',
    visualizacoes: 156
  },
  {
    id: 4,
    pergunta: 'Como registrar uma desistência de processo?',
    resposta: 'Acesse "Processos" > "Histórico de Desistências" e clique em "Registrar Desistência". Selecione o processo, informe o motivo da desistência (categoria), descreva a justificativa detalhada e anexe os documentos comprobatórios. O sistema registrará automaticamente a data e o responsável pelo registro.',
    categoria: 'Processos',
    visualizacoes: 132
  },
  {
    id: 5,
    pergunta: 'Como solicitar prorrogação de processo?',
    resposta: 'No menu "Processos" > "Prorrogações de Processos", clique em "Solicitar Prorrogação". Busque o contrato desejado, informe o novo prazo, o motivo da prorrogação e anexe a justificativa técnica ou jurídica. A solicitação seguirá o fluxo de aprovação conforme as alçadas definidas no sistema.',
    categoria: 'Contratos',
    visualizacoes: 178
  },
  {
    id: 6,
    pergunta: 'Como realizar realinhamento de preços?',
    resposta: 'Acesse "Processos" > "Realinhamento de Preços" e clique em "Registrar Realinhamento". Selecione o contrato, informe os novos valores, o percentual de variação, o índice utilizado (IPCA, IGPM, etc.) e anexe os documentos comprobatórios como tabelas de preços e memórias de cálculo. O sistema calculará automaticamente o impacto financeiro.',
    categoria: 'Contratos',
    visualizacoes: 143
  },
  {
    id: 7,
    pergunta: 'Como cadastrar um novo fornecedor no sistema?',
    resposta: 'No menu "Contratos e Fornecedores", clique em "Cadastrar Fornecedor". Preencha os dados da empresa (CNPJ, razão social, endereço, contatos) e anexe os documentos de habilitação (certidões negativas, balanço patrimonial, contrato social). O sistema validará o CNPJ automaticamente na Receita Federal.',
    categoria: 'Fornecedores',
    visualizacoes: 201
  },
  {
    id: 8,
    pergunta: 'Como criar novos usuários e atribuir permissões?',
    resposta: 'Acesse o menu "Usuários" e clique em "Criar Usuário". Preencha nome completo, e-mail institucional, departamento e selecione o perfil de acesso (Administrador, Responsável ou Visualizador). Cada perfil possui permissões específicas pré-definidas. O usuário receberá um e-mail com instruções para primeiro acesso.',
    categoria: 'Sistema',
    visualizacoes: 167
  },
  {
    id: 9,
    pergunta: 'Qual a diferença entre os perfis de usuário?',
    resposta: 'O sistema possui 3 perfis: Administrador (acesso total, gerencia usuários e configurações), Responsável (gerencia processos de sua área, solicita prorrogações e registra desistências) e Visualizador (apenas consulta processos e relatórios básicos). As permissões são detalhadas na tela de criação de usuário.',
    categoria: 'Sistema',
    visualizacoes: 194
  },
  {
    id: 10,
    pergunta: 'Como acessar documentos institucionais e manuais?',
    resposta: 'Na aba "Documentação" desta tela de Ajuda e Suporte, você encontra todos os manuais, regulamentos, procedimentos, templates e legislação aplicável. Clique em "Abrir" ou "Baixar" para visualizar o documento. Os documentos são atualizados periodicamente pela área de Gestão de Contratos.',
    categoria: 'Documentação',
    visualizacoes: 221
  },
  {
    id: 11,
    pergunta: 'Como funciona o envio automático de processos?',
    resposta: 'Acesse "Integrações" > "Envio Automático" para configurar o envio automático de processos para fornecedores. Configure as regras de envio, limites de valor e destinatários. O sistema enviará automaticamente os processos conforme as condições estabelecidas.',
    categoria: 'Integrações',
    visualizacoes: 98
  },
  {
    id: 12,
    pergunta: 'Como funciona o envio automático de relatórios?',
    resposta: 'Em "Integrações" > "Envio Automático", configure agendamentos para envio de relatórios por e-mail. Defina o tipo de relatório, destinatários, frequência (diária, semanal ou mensal), horário e formato. Os relatórios serão enviados automaticamente conforme a programação definida.',
    categoria: 'Integrações',
    visualizacoes: 112
  }
];
