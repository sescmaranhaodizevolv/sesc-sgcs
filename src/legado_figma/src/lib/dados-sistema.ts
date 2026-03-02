// Dados compartilhados do sistema para cálculos em tempo real

export const penalidades = [
  {
    id: 1,
    empresa: 'Empresa ABC Ltda',
    processo: '2024-001',
    penalidade: 'Atraso na entrega',
    multa: 'R$ 12.500,00',
    valor: 'R$ 12.500,00',
    notificacoes: 2,
    status: 'Ativa',
    dataOcorrencia: '15/01/2024',
    dataAplicacao: '20/01/2024',
    dataVencimento: '20/03/2025',
    responsavel: 'Maria Silva'
  },
  {
    id: 2,
    empresa: 'Serviços DEF Eireli',
    processo: '2024-003',
    penalidade: 'Abandono de serviço',
    multa: 'R$ 45.200,00',
    valor: 'R$ 45.200,00',
    notificacoes: 3,
    status: 'Ativa',
    dataOcorrencia: '08/01/2024',
    dataAplicacao: '10/01/2024',
    dataVencimento: '10/04/2025',
    responsavel: 'Ana Costa'
  },
  {
    id: 3,
    empresa: 'Tecnologia GHI Ltda',
    processo: '2024-005',
    penalidade: 'Descumprimento contratual',
    multa: 'R$ 28.300,00',
    valor: 'R$ 28.300,00',
    notificacoes: 1,
    status: 'Ativa',
    dataOcorrencia: '22/02/2024',
    dataAplicacao: '25/02/2024',
    dataVencimento: '25/05/2025',
    responsavel: 'Carlos Oliveira'
  },
  {
    id: 4,
    empresa: 'Comércio JKL Ltda',
    processo: '2023-075',
    penalidade: 'Atraso na entrega',
    multa: 'R$ 15.300,00',
    valor: 'R$ 15.300,00',
    notificacoes: 2,
    status: 'Aplicada',
    dataOcorrencia: '10/12/2023',
    dataAplicacao: '15/12/2023',
    dataVencimento: '15/12/2024',
    dataEncerramento: '20/12/2024',
    responsavel: 'Pedro Alves'
  },
  {
    id: 5,
    empresa: 'Distribuidora MNO S.A',
    processo: '2023-082',
    penalidade: 'Produto fora de especificação',
    multa: 'R$ 9.800,00',
    valor: 'R$ 9.800,00',
    notificacoes: 1,
    status: 'Aplicada',
    dataOcorrencia: '20/11/2023',
    dataAplicacao: '25/11/2023',
    dataVencimento: '25/11/2024',
    dataEncerramento: '30/11/2024',
    responsavel: 'Fernanda Lima'
  },
  {
    id: 6,
    empresa: 'Fornecedor XYZ S.A',
    processo: '2024-008',
    penalidade: 'Qualidade inadequada',
    multa: 'R$ 18.500,00',
    valor: 'R$ 18.500,00',
    notificacoes: 2,
    status: 'Ativa',
    dataOcorrencia: '10/03/2024',
    dataAplicacao: '15/03/2024',
    dataVencimento: '15/06/2025',
    responsavel: 'João Santos'
  },
  {
    id: 7,
    empresa: 'Construções PQR Ltda',
    processo: '2024-010',
    penalidade: 'Atraso na entrega',
    multa: 'R$ 22.000,00',
    valor: 'R$ 22.000,00',
    notificacoes: 3,
    status: 'Vencida',
    dataOcorrencia: '01/06/2024',
    dataAplicacao: '05/06/2024',
    dataVencimento: '15/12/2024',
    responsavel: 'Ricardo Sousa'
  },
  {
    id: 8,
    empresa: 'Alimentos STU S.A',
    processo: '2024-012',
    penalidade: 'Produto fora de especificação',
    multa: 'R$ 31.700,00',
    valor: 'R$ 31.700,00',
    notificacoes: 2,
    status: 'Vencida',
    dataOcorrencia: '10/07/2024',
    dataAplicacao: '15/07/2024',
    dataVencimento: '15/01/2025',
    responsavel: 'Paula Mendes'
  }
];

export const prorrogacoes = [
  {
    id: 1,
    empresa: 'Empresa ABC Ltda',
    contrato: 'SCA-2024-001',
    objetoContrato: 'Serviços de Manutenção Predial e Conservação',
    cnpjCpf: '12.345.678/0001-90',
    numeroProcesso: 'PROC-2024-001',
    valorContratadoAnual: 'R$ 250.000,00',
    dataInicio: '15/01/2024',
    dataFimOriginal: '15/07/2024',
    dataFimProrrogada: '15/10/2024',
    prazoOriginal: '6 meses',
    prazoProrrogacao: '9 meses',
    quantidadeAditivos: 1,
    passivelProrrogar: true,
    status: 'Vigente',
    motivo: 'Necessidade de conclusão de etapas pendentes',
    dataSolicitacao: '10/06/2024',
    responsavel: 'Maria Silva',
    historicoProrrogacoes: [
      {
        aditivo: '1º Aditivo',
        dataInicio: '15/07/2024',
        dataFim: '15/10/2024',
        observacoes: 'Necessidade de conclusão de etapas pendentes do projeto de manutenção.'
      }
    ]
  },
  {
    id: 2,
    empresa: 'Fornecedor XYZ S.A',
    contrato: 'SCA-2023-089',
    objetoContrato: 'Fornecimento de Equipamentos de TI e Suporte Técnico',
    cnpjCpf: '98.765.432/0001-10',
    numeroProcesso: 'PROC-2023-089',
    valorContratadoAnual: 'R$ 480.000,00',
    dataInicio: '20/08/2023',
    dataFimOriginal: '20/02/2024',
    dataFimProrrogada: '20/05/2024',
    prazoOriginal: '6 meses',
    prazoProrrogacao: '9 meses',
    quantidadeAditivos: 1,
    passivelProrrogar: false,
    status: 'Encerrado',
    motivo: 'Atraso na entrega de equipamentos',
    dataSolicitacao: '15/01/2024',
    responsavel: 'João Santos',
    historicoProrrogacoes: [
      {
        aditivo: '1º Aditivo',
        dataInicio: '20/02/2024',
        dataFim: '20/05/2024',
        observacoes: 'Prorrogação solicitada devido a atrasos na importação de equipamentos.'
      }
    ]
  },
  {
    id: 3,
    empresa: 'Serviços DEF Eireli',
    contrato: 'SCA-2024-015',
    objetoContrato: 'Prestação de Serviços de Limpeza e Conservação',
    cnpjCpf: '23.456.789/0001-22',
    numeroProcesso: 'PROC-2024-015',
    valorContratadoAnual: 'R$ 180.000,00',
    dataInicio: '01/03/2024',
    dataFimOriginal: '01/09/2024',
    dataFimProrrogada: '01/12/2024',
    prazoOriginal: '6 meses',
    prazoProrrogacao: '9 meses',
    quantidadeAditivos: 1,
    passivelProrrogar: true,
    status: 'Próximo ao Vencimento',
    motivo: 'Bom desempenho do fornecedor',
    dataSolicitacao: '15/08/2024',
    responsavel: 'Ana Costa',
    historicoProrrogacoes: [
      {
        aditivo: '1º Aditivo',
        dataInicio: '01/09/2024',
        dataFim: '01/12/2024',
        observacoes: 'Prorrogação concedida devido ao bom desempenho do fornecedor.'
      }
    ]
  },
  {
    id: 4,
    empresa: 'Tecnologia GHI Ltda',
    contrato: 'SCA-2024-022',
    objetoContrato: 'Licenciamento de Software e Suporte Técnico',
    cnpjCpf: '34.567.890/0001-33',
    numeroProcesso: 'PROC-2024-022',
    valorContratadoAnual: 'R$ 320.000,00',
    dataInicio: '10/04/2024',
    dataFimOriginal: '10/10/2024',
    dataFimProrrogada: '-',
    prazoOriginal: '6 meses',
    prazoProrrogacao: '6 meses',
    quantidadeAditivos: 0,
    passivelProrrogar: true,
    status: 'Vigente',
    motivo: '-',
    dataSolicitacao: '-',
    responsavel: 'Carlos Oliveira',
    historicoProrrogacoes: []
  },
  {
    id: 5,
    empresa: 'Comércio JKL Ltda',
    contrato: 'SCA-2023-105',
    objetoContrato: 'Fornecimento de Materiais de Escritório',
    cnpjCpf: '45.678.901/0001-44',
    numeroProcesso: 'PROC-2023-105',
    valorContratadoAnual: 'R$ 95.000,00',
    dataInicio: '12/10/2023',
    dataFimOriginal: '12/04/2024',
    dataFimProrrogada: '12/10/2024',
    prazoOriginal: '6 meses',
    prazoProrrogacao: '12 meses',
    quantidadeAditivos: 2,
    passivelProrrogar: false,
    status: 'Encerrado',
    motivo: 'Renovação de contrato',
    dataSolicitacao: '01/03/2024',
    responsavel: 'Paula Mendes',
    historicoProrrogacoes: [
      {
        aditivo: '1º Aditivo',
        dataInicio: '12/04/2024',
        dataFim: '12/07/2024',
        observacoes: 'Primeira prorrogação para continuidade do fornecimento.'
      },
      {
        aditivo: '2º Aditivo',
        dataInicio: '12/07/2024',
        dataFim: '12/10/2024',
        observacoes: 'Segunda prorrogação devido à necessidade de novo processo licitatório.'
      }
    ]
  },
  {
    id: 6,
    empresa: 'Distribuidora MNO S.A',
    contrato: 'SCA-2024-031',
    objetoContrato: 'Fornecimento de Equipamentos de Segurança',
    cnpjCpf: '56.789.012/0001-55',
    numeroProcesso: 'PROC-2024-031',
    valorContratadoAnual: 'R$ 420.000,00',
    dataInicio: '01/05/2024',
    dataFimOriginal: '01/11/2024',
    dataFimProrrogada: '-',
    prazoOriginal: '6 meses',
    prazoProrrogacao: '6 meses',
    quantidadeAditivos: 0,
    passivelProrrogar: false,
    status: 'Suspenso',
    motivo: 'Descumprimento contratual',
    dataSolicitacao: '-',
    responsavel: 'Roberto Lima',
    historicoProrrogacoes: []
  },
  {
    id: 7,
    empresa: 'Soluções PQR Corp',
    contrato: 'SCA-2024-042',
    objetoContrato: 'Consultoria em Gestão de Projetos',
    cnpjCpf: '67.890.123/0001-66',
    numeroProcesso: 'PROC-2024-042',
    valorContratadoAnual: 'R$ 350.000,00',
    dataInicio: '15/06/2024',
    dataFimOriginal: '15/12/2024',
    dataFimProrrogada: '15/03/2025',
    prazoOriginal: '6 meses',
    prazoProrrogacao: '9 meses',
    quantidadeAditivos: 1,
    passivelProrrogar: true,
    status: 'Vigente',
    motivo: 'Extensão do escopo do projeto',
    dataSolicitacao: '01/11/2024',
    responsavel: 'Marcos Ferreira',
    historicoProrrogacoes: [
      {
        aditivo: '1º Aditivo',
        dataInicio: '15/12/2024',
        dataFim: '15/03/2025',
        observacoes: 'Prorrogação necessária para conclusão de etapas adicionais do projeto.'
      }
    ]
  },
  {
    id: 8,
    empresa: 'Indústria STU Ltda',
    contrato: 'SCA-2024-055',
    objetoContrato: 'Fornecimento de Materiais de Construção',
    cnpjCpf: '78.901.234/0001-77',
    numeroProcesso: 'PROC-2024-055',
    valorContratadoAnual: 'R$ 560.000,00',
    dataInicio: '20/07/2024',
    dataFimOriginal: '20/01/2025',
    dataFimProrrogada: '20/04/2025',
    prazoOriginal: '6 meses',
    prazoProrrogacao: '9 meses',
    quantidadeAditivos: 1,
    passivelProrrogar: true,
    status: 'Vigente',
    motivo: 'Ampliação do escopo de fornecimento',
    dataSolicitacao: '10/12/2024',
    responsavel: 'Luciana Martins',
    historicoProrrogacoes: [
      {
        aditivo: '1º Aditivo',
        dataInicio: '20/01/2025',
        dataFim: '20/04/2025',
        observacoes: 'Prorrogação aprovada para continuidade do fornecimento de materiais.'
      }
    ]
  }
];

// Lista consolidada de fornecedores com CNPJ para Combobox
export const fornecedoresComCNPJ = [
  { value: 'empresa-abc-ltda', label: 'Empresa ABC Ltda', cnpj: '12.345.678/0001-90', categoria: 'Manutenção' },
  { value: 'fornecedor-xyz-sa', label: 'Fornecedor XYZ S.A', cnpj: '98.765.432/0001-10', categoria: 'Tecnologia' },
  { value: 'servicos-def-eireli', label: 'Serviços DEF Eireli', cnpj: '23.456.789/0001-22', categoria: 'Serviços' },
  { value: 'tecnologia-ghi-ltda', label: 'Tecnologia GHI Ltda', cnpj: '34.567.890/0001-33', categoria: 'Tecnologia' },
  { value: 'comercio-jkl-ltda', label: 'Comércio JKL Ltda', cnpj: '45.678.901/0001-44', categoria: 'Comércio' },
  { value: 'distribuidora-mno-sa', label: 'Distribuidora MNO S.A', cnpj: '56.789.012/0001-55', categoria: 'Distribuição' },
  { value: 'solucoes-pqr-corp', label: 'Soluções PQR Corp', cnpj: '67.890.123/0001-66', categoria: 'Consultoria' },
  { value: 'industria-stu-ltda', label: 'Indústria STU Ltda', cnpj: '78.901.234/0001-77', categoria: 'Indústria' },
  { value: 'construtora-vwx-sa', label: 'Construtora VWX S.A', cnpj: '89.012.345/0001-88', categoria: 'Construção' },
  { value: 'logistica-yza-eireli', label: 'Logística YZA Eireli', cnpj: '90.123.456/0001-99', categoria: 'Logística' },
  { value: 'alimentacao-bcd-ltda', label: 'Alimentação BCD Ltda', cnpj: '01.234.567/0001-11', categoria: 'Alimentação' },
  { value: 'seguranca-efg-corp', label: 'Segurança EFG Corp', cnpj: '11.234.567/0001-22', categoria: 'Segurança' },
  { value: 'limpeza-hij-sa', label: 'Limpeza HIJ S.A', cnpj: '22.345.678/0001-33', categoria: 'Serviços' },
  { value: 'ti-telecom-klm-ltda', label: 'TI e Telecom KLM Ltda', cnpj: '33.456.789/0001-44', categoria: 'Tecnologia' },
  { value: 'mobiliario-nop-eireli', label: 'Mobiliário NOP Eireli', cnpj: '44.567.890/0001-55', categoria: 'Mobiliário' },
  { value: 'eventos-qrs-corp', label: 'Eventos QRS Corp', cnpj: '55.678.901/0001-66', categoria: 'Eventos' },
  { value: 'graficas-tuv-ltda', label: 'Gráficas TUV Ltda', cnpj: '66.789.012/0001-77', categoria: 'Gráfica' },
  { value: 'equipamentos-wxy-sa', label: 'Equipamentos WXY S.A', cnpj: '77.890.123/0001-88', categoria: 'Equipamentos' },
  { value: 'materiais-zab-eireli', label: 'Materiais ZAB Eireli', cnpj: '88.901.234/0001-99', categoria: 'Materiais' },
  { value: 'transporte-cde-ltda', label: 'Transporte CDE Ltda', cnpj: '99.012.345/0001-00', categoria: 'Transporte' }
];

// Função para calcular alertas de penalidades (penalidades vencidas)
export function calcularAlertasPenalidades() {
  const penalidadesVencidas = penalidades.filter(p => p.status === 'Vencida');
  return {
    total: penalidadesVencidas.length,
    descricao: 'Requer atenção imediata'
  };
}

// Função para calcular alertas de prorrogações (contratos vencendo em 30 dias)
export function calcularAlertasProrrogacoes() {
  const contratosVencendo = prorrogacoes.filter(p => p.status === 'Vencendo');
  const totalProrrogacoes = prorrogacoes.length;
  
  return {
    total: totalProrrogacoes,
    vencendoEm30Dias: contratosVencendo.length,
    descricao: `${contratosVencendo.length} vencendo em 30 dias`
  };
}