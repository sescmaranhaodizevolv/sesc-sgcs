import React from 'react';
import { FileText, Clock, AlertTriangle, CheckCircle, TrendingUp, Calendar, Timer, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BadgeNew } from '../ui/badge-new';
import { getBadgeMappingForStatus } from '../../lib/badge-mappings';
import { getBadgeMappingForPrioridade } from '../../lib/badge-mappings';

// Função para calcular dias entre duas datas
const calcularDiasEntreDatas = (dataInicio: string, dataFim: string): number => {
  const [diaI, mesI, anoI] = dataInicio.split('/');
  const [diaF, mesF, anoF] = dataFim.split('/');
  
  const dataInicioObj = new Date(parseInt(anoI), parseInt(mesI) - 1, parseInt(diaI));
  const dataFimObj = new Date(parseInt(anoF), parseInt(mesF) - 1, parseInt(diaF));
  
  const diffTime = dataFimObj.getTime() - dataInicioObj.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Dados de processos do comprador com Lead Time
const meusProcessosComLeadTime = [
  {
    id: 'PROC-2024-142',
    descricao: 'Mobiliário para Escritório',
    modalidade: 'Pregão Eletrônico',
    dataDistribuicao: '15/09/2024',
    dataAprovacao: '25/10/2024',
    status: 'Aprovado'
  },
  {
    id: 'PROC-2024-139',
    descricao: 'Material de Escritório',
    modalidade: 'Dispensa',
    dataDistribuicao: '20/09/2024',
    dataAprovacao: '05/10/2024',
    status: 'Aprovado'
  },
  {
    id: 'PROC-2024-135',
    descricao: 'Equipamentos de TI',
    modalidade: 'Licitação',
    dataDistribuicao: '10/09/2024',
    dataAprovacao: '30/10/2024',
    status: 'Aprovado'
  },
  {
    id: 'PROC-2024-128',
    descricao: 'Serviços de Manutenção',
    modalidade: 'Pregão Eletrônico',
    dataDistribuicao: '05/09/2024',
    dataAprovacao: '20/10/2024',
    status: 'Aprovado'
  },
  {
    id: 'PROC-2024-121',
    descricao: 'Material de Limpeza',
    modalidade: 'Dispensa',
    dataDistribuicao: '01/09/2024',
    dataAprovacao: '15/09/2024',
    status: 'Aprovado'
  }
];

// Calcular Lead Time para cada processo
const meusProcessosComDias = meusProcessosComLeadTime.map(processo => ({
  ...processo,
  leadTime: calcularDiasEntreDatas(processo.dataDistribuicao, processo.dataAprovacao)
}));

// Calcular estatísticas
const meusLeadTimes = meusProcessosComDias.map(p => p.leadTime);
const meuLeadTimeMedio = Math.round(meusLeadTimes.reduce((a, b) => a + b, 0) / meusLeadTimes.length);
const meuLeadTimeMaisRapido = Math.min(...meusLeadTimes);
const meuLeadTimeMaisLento = Math.max(...meusLeadTimes);

interface DashboardCompradorProps {
  onNavigateToProcessos?: (processoId?: string) => void;
  onNavigateToDetalhes?: (processoId: string) => void;
}

export function DashboardComprador({ onNavigateToProcessos, onNavigateToDetalhes }: DashboardCompradorProps) {
  const stats = [
    {
      title: 'Total de Processos',
      value: '24',
      subtitle: 'Sob minha responsabilidade',
      icon: FileText,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+3 este mês'
    },
    {
      title: 'Aprovados',
      value: '12',
      subtitle: 'Processos concluídos',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+4 neste mês'
    },
    {
      title: 'Aguardando Documentação',
      value: '5',
      subtitle: 'Requerem atenção',
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: 'Revisar hoje'
    },
    {
      title: 'Próximo a Vencer',
      value: '3',
      subtitle: 'Contratos e prazos',
      icon: Calendar,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: 'Nos próximos 30 dias'
    }
  ];

  const processosRecentes = [
    {
      id: 'PROC-2024-156',
      titulo: 'Aquisição de Material de Escritório',
      status: 'Em Análise',
      prazo: '15/11/2025',
      fornecedores: 3
    },
    {
      id: 'PROC-2024-148',
      titulo: 'Contratação de Serviços de Limpeza',
      status: 'Aguardando Documentação',
      prazo: '12/11/2025',
      fornecedores: 5
    },
    {
      id: 'PROC-2024-142',
      titulo: 'Equipamentos de Informática',
      status: 'Em Análise',
      prazo: '20/11/2025',
      fornecedores: 4
    },
    {
      id: 'PROC-2024-139',
      titulo: 'Mobiliário para Escritório',
      status: 'Finalizado',
      prazo: '08/11/2025',
      fornecedores: 2
    }
  ];

  const acoesPendentes = [
    {
      id: 1,
      tipo: 'Documentação',
      descricao: 'Enviar documentação complementar - PROC-2024-148',
      prioridade: 'Alta',
      prazo: 'Hoje'
    },
    {
      id: 2,
      tipo: 'Análise',
      descricao: 'Finalizar análise de propostas - PROC-2024-156',
      prioridade: 'Média',
      prazo: 'Amanhã'
    },
    {
      id: 3,
      tipo: 'Aprovação',
      descricao: 'Aguardando aprovação superior - PROC-2024-142',
      prioridade: 'Baixa',
      prazo: '15/11/2025'
    }
  ];

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta':
        return 'bg-red-100 text-red-800';
      case 'Média':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baixa':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleClickProcesso = (processoId: string) => {
    if (onNavigateToProcessos) {
      onNavigateToProcessos(processoId);
    }
  };

  const handleClickMeusProcessos = () => {
    if (onNavigateToProcessos) {
      onNavigateToProcessos();
    }
  };

  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div>
          <h1 className="text-black">Dashboard do Comprador</h1>
          <p className="text-gray-600 mt-1">
            Visão geral dos seus processos e atividades
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 space-y-6">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1 text-[16px]">{stat.title}</p>
                      <p className="text-black mb-1 font-bold text-[20px] font-normal">{stat.value}</p>
                      <p className="text-xs text-gray-500 text-[14px]">{stat.subtitle}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon size={24} className={stat.iconColor} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-green-600" />
                      <span className="text-xs text-green-700 text-[14px] font-normal">{stat.trend}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Processos Recentes */}
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-[16px] rounded-b-[0px] p-[24px]">
              <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                <FileText size={20} className="text-[#003366]" />
                Processos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
              <div className="space-y-4">
                {processosRecentes.map((processo) => (
                  <div 
                    key={processo.id} 
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleClickProcesso(processo.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-black">{processo.id}</span>
                          <BadgeNew {...getBadgeMappingForStatus(processo.status)}>
                            {processo.status}
                          </BadgeNew>
                        </div>
                        <p className="text-sm text-gray-700">{processo.titulo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>Prazo: {processo.prazo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText size={12} />
                        <span>{processo.fornecedores} fornecedores</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações Pendentes */}
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200 rounded-t-[16px] rounded-b-[0px]">
              <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                <AlertTriangle size={20} className="text-[#003366]" />
                Ações Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
              <div className="space-y-4">
                {acoesPendentes.map((acao) => (
                  <div 
                    key={acao.id} 
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BadgeNew intent="info" weight="light" size="sm">
                            {acao.tipo}
                          </BadgeNew>
                          <BadgeNew {...getBadgeMappingForPrioridade(acao.prioridade)} size="sm">
                            {acao.prioridade}
                          </BadgeNew>
                        </div>
                        <p className="text-sm text-gray-700">{acao.descricao}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                      <Clock size={12} />
                      <span>Prazo: {acao.prazo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lead Time Section */}
        <div>
          <h3 className="text-2xl text-black mb-2 flex items-center gap-2">
            <Timer size={24} className="text-[#003366]" />
            Meu Lead Time de Processos
          </h3>
          <p className="text-gray-600 mb-4">
            Tempo médio dos meus processos entre Distribuição da RC e Aprovação Final
          </p>
        </div>

        {/* Lead Time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">Meu Lead Time Médio</CardTitle>
                <div className="p-2 rounded-lg bg-[#003366]">
                  <Timer size={20} className="text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl text-black">{meuLeadTimeMedio} dias</p>
                <p className="text-sm text-gray-500">Baseado em {meusProcessosComDias.length} processos aprovados</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">Meu Melhor Tempo</CardTitle>
                <div className="p-2 rounded-lg bg-[#00bc7d]">
                  <TrendingDown size={20} className="text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl text-black">{meuLeadTimeMaisRapido} dias</p>
                <p className="text-sm text-gray-500">Processo mais eficiente</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">Tempo Mais Longo</CardTitle>
                <div className="p-2 rounded-lg bg-[#ff6900]">
                  <TrendingUp size={20} className="text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl text-black">{meuLeadTimeMaisLento} dias</p>
                <p className="text-sm text-gray-500">Processo mais complexo</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meus Processos Aprovados com Lead Time */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-black">Meus Processos Aprovados (Histórico de Lead Time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meusProcessosComDias.map((processo, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleClickProcesso(processo.id)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-black">{processo.id}</p>
                      <BadgeNew intent="neutral" weight="light" size="xs">
                        {processo.modalidade}
                      </BadgeNew>
                    </div>
                    <p className="text-xs text-gray-600">{processo.descricao}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {processo.dataDistribuicao} → {processo.dataAprovacao}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-black">{processo.leadTime} dias</p>
                    <p className="text-xs text-gray-600">Lead Time</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Avisos Importantes */}
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-black mb-1">Avisos Importantes</p>
                <p className="text-sm text-gray-700">
                  Você tem <strong>2 processos com prazo de análise vencendo nos próximos 3 dias</strong>. 
                  Acesse <span 
                    className="text-[#003366] cursor-pointer hover:underline"
                    onClick={handleClickMeusProcessos}
                  >Meus Processos</span> para visualizar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}