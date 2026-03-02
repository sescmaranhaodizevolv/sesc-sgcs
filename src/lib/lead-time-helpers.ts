// Funções auxiliares para cálculo de Lead Time de processos

/**
 * Calcula o Lead Time (tempo decorrido) entre duas datas
 * @param dataInicio - Data inicial no formato DD/MM/YYYY
 * @param dataFim - Data final no formato DD/MM/YYYY
 * @returns Número de dias úteis ou calendário entre as datas
 */
export function calcularLeadTime(dataInicio: string, dataFim: string): number {
  if (!dataInicio || !dataFim || dataInicio === '-' || dataFim === '-') {
    return 0;
  }

  try {
    const [diaInicio, mesInicio, anoInicio] = dataInicio.split('/').map(Number);
    const [diaFim, mesFim, anoFim] = dataFim.split('/').map(Number);

    const inicio = new Date(anoInicio, mesInicio - 1, diaInicio);
    const fim = new Date(anoFim, mesFim - 1, diaFim);

    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    console.error('Erro ao calcular lead time:', error);
    return 0;
  }
}

/**
 * Formata o Lead Time em dias para uma string legível
 * @param dias - Número de dias
 * @returns String formatada (ex: "5 dias", "2 meses", "1 ano")
 */
export function formatarLeadTime(dias: number): string {
  if (dias === 0) return '-';
  
  if (dias === 1) return '1 dia';
  if (dias < 30) return `${dias} dias`;
  
  if (dias < 365) {
    const meses = Math.floor(dias / 30);
    const diasRestantes = dias % 30;
    if (diasRestantes === 0) {
      return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    }
    return `${meses} ${meses === 1 ? 'mês' : 'meses'} e ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`;
  }
  
  const anos = Math.floor(dias / 365);
  const mesesRestantes = Math.floor((dias % 365) / 30);
  if (mesesRestantes === 0) {
    return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
  }
  return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${mesesRestantes} ${mesesRestantes === 1 ? 'mês' : 'meses'}`;
}

/**
 * Calcula o Lead Time médio de uma lista de processos
 * @param processos - Array de processos com dataRecebimento e dataFinalizacao
 * @returns Lead time médio em dias
 */
export function calcularLeadTimeMedio(processos: Array<{ dataRecebimento: string; dataFinalizacao: string }>): number {
  const processosComDatas = processos.filter(
    p => p.dataRecebimento && p.dataFinalizacao && 
         p.dataRecebimento !== '-' && p.dataFinalizacao !== '-'
  );

  if (processosComDatas.length === 0) return 0;

  const totalDias = processosComDatas.reduce((acc, processo) => {
    return acc + calcularLeadTime(processo.dataRecebimento, processo.dataFinalizacao);
  }, 0);

  return Math.round(totalDias / processosComDatas.length);
}

/**
 * Agrupa processos por tipo e calcula Lead Time médio para cada tipo
 * @param processos - Array de processos com tipo, dataRecebimento e dataFinalizacao
 * @returns Objeto com lead time médio por tipo de processo
 */
export function calcularLeadTimePorTipo(
  processos: Array<{ tipo: string; dataRecebimento: string; dataFinalizacao: string }>
): Record<string, { quantidade: number; leadTimeMedio: number; leadTimeMedioFormatado: string }> {
  const agrupados: Record<string, Array<{ dataRecebimento: string; dataFinalizacao: string }>> = {};

  // Agrupar por tipo
  processos.forEach(processo => {
    if (!agrupados[processo.tipo]) {
      agrupados[processo.tipo] = [];
    }
    agrupados[processo.tipo].push({
      dataRecebimento: processo.dataRecebimento,
      dataFinalizacao: processo.dataFinalizacao
    });
  });

  // Calcular média para cada tipo
  const resultado: Record<string, { quantidade: number; leadTimeMedio: number; leadTimeMedioFormatado: string }> = {};
  
  Object.keys(agrupados).forEach(tipo => {
    const processosDoTipo = agrupados[tipo];
    const leadTimeMedio = calcularLeadTimeMedio(processosDoTipo);
    
    resultado[tipo] = {
      quantidade: processosDoTipo.filter(
        p => p.dataRecebimento !== '-' && p.dataFinalizacao !== '-'
      ).length,
      leadTimeMedio,
      leadTimeMedioFormatado: formatarLeadTime(leadTimeMedio)
    };
  });

  return resultado;
}

/**
 * Calcula indicadores de performance (KPIs) de Lead Time
 * @param processos - Array de processos finalizados
 * @returns Objeto com KPIs calculados
 */
export function calcularKPIsLeadTime(
  processos: Array<{ dataRecebimento: string; dataFinalizacao: string }>
): {
  media: number;
  mediana: number;
  minimo: number;
  maximo: number;
  mediaFormatada: string;
  medianaFormatada: string;
  minimoFormatado: string;
  maximoFormatado: string;
} {
  const leadTimes = processos
    .filter(p => p.dataRecebimento !== '-' && p.dataFinalizacao !== '-')
    .map(p => calcularLeadTime(p.dataRecebimento, p.dataFinalizacao))
    .sort((a, b) => a - b);

  if (leadTimes.length === 0) {
    return {
      media: 0,
      mediana: 0,
      minimo: 0,
      maximo: 0,
      mediaFormatada: '-',
      medianaFormatada: '-',
      minimoFormatado: '-',
      maximoFormatado: '-'
    };
  }

  const media = Math.round(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length);
  const mediana = leadTimes.length % 2 === 0
    ? Math.round((leadTimes[leadTimes.length / 2 - 1] + leadTimes[leadTimes.length / 2]) / 2)
    : leadTimes[Math.floor(leadTimes.length / 2)];
  const minimo = leadTimes[0];
  const maximo = leadTimes[leadTimes.length - 1];

  return {
    media,
    mediana,
    minimo,
    maximo,
    mediaFormatada: formatarLeadTime(media),
    medianaFormatada: formatarLeadTime(mediana),
    minimoFormatado: formatarLeadTime(minimo),
    maximoFormatado: formatarLeadTime(maximo)
  };
}
