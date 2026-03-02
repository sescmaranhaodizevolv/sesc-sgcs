import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BadgeNew } from '../ui/badge-new';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Timer
} from 'lucide-react';
import { getBadgeMappingForStatus } from '../../lib/badge-mappings';
import { calcularAlertasPenalidades, calcularAlertasProrrogacoes } from '../../lib/dados-sistema';

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

// Dados de exemplo de processos com Lead Time
const processosComLeadTime = [
  {
    id: 'PROC-2024-001',
    descricao: 'Aquisição de Equipamentos de TI',
    modalidade: 'Pregão Eletrônico',
    dataDistribuicao: '10/01/2024',
    dataAprovacao: '25/02/2024',
    status: 'Aprovada'
  },
  {
    id: 'PROC-2024-002',
    descricao: 'Contratação de Serviços de Limpeza',
    modalidade: 'Dispensa',
    dataDistribuicao: '15/01/2024',
    dataAprovacao: '05/02/2024',
    status: 'Aprovada'
  },
  {
    id: 'PROC-2024-003',
    descricao: 'Aquisição de Mobiliário',
    modalidade: 'Licitação',
    dataDistribuicao: '20/01/2024',
    dataAprovacao: '15/03/2024',
    status: 'Aprovada'
  },
  {
    id: 'PROC-2024-004',
    descricao: 'Serviços de Consultoria Especializada',
    modalidade: 'Inexigibilidade',
    dataDistribuicao: '25/01/2024',
    dataAprovacao: '10/02/2024',
    status: 'Aprovada'
  },
  {
    id: 'PROC-2024-005',
    descricao: 'Aquisição de Material de Escritório',
    modalidade: 'Dispensa',
    dataDistribuicao: '01/02/2024',
    dataAprovacao: '20/02/2024',
    status: 'Aprovada'
  },
  {
    id: 'PROC-2024-006',
    descricao: 'Contratação de Serviços de Manutenção',
    modalidade: 'Pregão Eletrônico',
    dataDistribuicao: '05/02/2024',
    dataAprovacao: '10/03/2024',
    status: 'Aprovada'
  },
  {
    id: 'PROC-2024-007',
    descricao: 'Locação de Veículos',
    modalidade: 'Licitação',
    dataDistribuicao: '10/02/2024',
    dataAprovacao: '25/03/2024',
    status: 'Aprovada'
  },
  {
    id: 'PROC-2024-008',
    descricao: 'Aquisição de Softwares',
    modalidade: 'Dispensa',
    dataDistribuicao: '15/02/2024',
    dataAprovacao: '05/03/2024',
    status: 'Aprovada'
  }
];

// Calcular Lead Time para cada processo
const processosComDias = processosComLeadTime.map(processo => ({
  ...processo,
  leadTime: calcularDiasEntreDatas(processo.dataDistribuicao, processo.dataAprovacao)
}));

// Calcular estatísticas
const leadTimes = processosComDias.map(p => p.leadTime);
const leadTimeMedio = Math.round(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length);
const leadTimeMaisRapido = Math.min(...leadTimes);
const leadTimeMaisLento = Math.max(...leadTimes);

// Calcular lead time por modalidade
const leadTimePorModalidade = processosComDias.reduce((acc, processo) => {
  if (!acc[processo.modalidade]) {
    acc[processo.modalidade] = { total: 0, count: 0 };
  }
  acc[processo.modalidade].total += processo.leadTime;
  acc[processo.modalidade].count += 1;
  return acc;
}, {} as Record<string, { total: number; count: number }>);

const mediaPorModalidade = Object.entries(leadTimePorModalidade).map(([modalidade, dados]) => ({
  modalidade,
  media: Math.round(dados.total / dados.count)
})).sort((a, b) => a.media - b.media);

export function Dashboard() {
  // Calcula os alertas em tempo real
  const alertasPenalidades = calcularAlertasPenalidades();
  const alertasProrrogacoes = calcularAlertasProrrogacoes();

  const metrics = [
    {
      title: 'Total de Processos',
      value: '1,247',
      change: '+12% desde o mês passado',
      icon: <FileText size={20} className="text-white" />,
      iconBg: 'bg-[#003366]'
    },
    {
      title: 'Processos em Andamento',
      value: '186',
      change: '23 aguardando documentação',
      icon: <Clock size={20} className="text-white" />,
      iconBg: 'bg-[#fe9a00]'
    },
    {
      title: 'Processos Aprovados',
      value: '892',
      change: '+8% este mês',
      icon: <CheckCircle size={20} className="text-white" />,
      iconBg: 'bg-[#00bc7d]'
    },
    {
      title: 'Processos Rejeitados',
      value: '94',
      change: '45 em recurso',
      icon: <XCircle size={20} className="text-white" />,
      iconBg: 'bg-[#fb2c36]'
    },
    {
      title: 'Alertas de Penalidades',
      value: alertasPenalidades.total.toString(),
      change: alertasPenalidades.descricao,
      icon: <AlertTriangle size={20} className="text-white" />,
      iconBg: 'bg-[#ff6900]'
    },
    {
      title: 'Prorrogações de Processos',
      value: alertasProrrogacoes.total.toString(),
      change: alertasProrrogacoes.descricao,
      icon: <Calendar size={20} className="text-white" />,
      iconBg: 'bg-[#2b7fff]'
    }
  ];

  const recentActivities = [
    {
      title: 'Processo #2024-001 aprovado',
      time: 'Há 2 horas',
      status: 'Aprovado',
      icon: <CheckCircle size={16} className="text-white" />,
      iconBg: 'bg-[#00bc7d]'
    },
    {
      title: 'Processo #2024-002 em andamento',
      time: 'Há 4 horas',
      status: 'Em andamento',
      icon: <Clock size={16} className="text-white" />,
      iconBg: 'bg-[#fe9a00]'
    },
    {
      title: 'Alerta de penalidade - Contrato #C789',
      time: 'Há 6 horas',
      status: 'Em análise',
      icon: <AlertTriangle size={16} className="text-white" />,
      iconBg: 'bg-[#fb2c36]'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-3xl text-black mb-2">Dashboard de Processos</h2>
        <p className="text-gray-600">Visão geral do sistema de gestão de contratos e suprimentos</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">{metric.title}</CardTitle>
                <div className={`p-2 rounded-lg ${metric.iconBg}`}>
                  {metric.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl text-black">{metric.value}</p>
                <p className="text-sm text-gray-500">{metric.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lead Time Section */}
      <div>
        <h3 className="text-2xl text-black mb-4 flex items-center gap-2">
          <Timer size={24} className="text-[#003366]" />
          Lead Time de Processos
        </h3>
        <p className="text-gray-600 mb-4">
          Tempo médio entre a Distribuição da RC e a Aprovação Final
        </p>
      </div>

      {/* Lead Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-600">Lead Time Médio</CardTitle>
              <div className="p-2 rounded-lg bg-[#003366]">
                <Timer size={20} className="text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl text-black">{leadTimeMedio} dias</p>
              <p className="text-sm text-gray-500">Baseado em {processosComDias.length} processos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-600">Processo Mais Rápido</CardTitle>
              <div className="p-2 rounded-lg bg-[#00bc7d]">
                <TrendingDown size={20} className="text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl text-black">{leadTimeMaisRapido} dias</p>
              <p className="text-sm text-gray-500">Melhor desempenho</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-600">Processo Mais Lento</CardTitle>
              <div className="p-2 rounded-lg bg-[#ff6900]">
                <TrendingUp size={20} className="text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl text-black">{leadTimeMaisLento} dias</p>
              <p className="text-sm text-gray-500">Requer atenção</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-600">Variação</CardTitle>
              <div className="p-2 rounded-lg bg-[#2b7fff]">
                <Clock size={20} className="text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl text-black">{leadTimeMaisLento - leadTimeMaisRapido} dias</p>
              <p className="text-sm text-gray-500">Amplitude de tempo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Time por Modalidade e Processos Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Time por Modalidade */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-black">Lead Time por Modalidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mediaPorModalidade.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black">{item.modalidade}</span>
                    <span className="text-sm text-black">{item.media} dias</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#003366] h-2 rounded-full transition-all"
                      style={{ width: `${(item.media / leadTimeMaisLento) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Processos Recentes com Lead Time */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-black">Processos Aprovados Recentemente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processosComDias.slice(0, 3).map((processo, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-black">{processo.id}</p>
                    <p className="text-xs text-gray-600">{processo.descricao}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <BadgeNew intent="neutral" weight="light" size="xs">
                        {processo.modalidade}
                      </BadgeNew>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-black">{processo.leadTime} dias</p>
                    <p className="text-xs text-gray-600">
                      {processo.dataDistribuicao} → {processo.dataAprovacao}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-black">Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${activity.iconBg}`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-black">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <BadgeNew {...getBadgeMappingForStatus(activity.status)}>
                  {activity.status}
                </BadgeNew>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}