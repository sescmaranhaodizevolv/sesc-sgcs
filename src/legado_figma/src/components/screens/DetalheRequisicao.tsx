import React from 'react';
import { ArrowLeft, HelpCircle, CheckCircle, Clock, XCircle, AlertCircle, Building2, Calendar, User, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';

interface DetalheRequisicaoProps {
  rcId?: string;
  onVoltar?: () => void;
  onAbrirSuporte?: () => void;
}

export function DetalheRequisicao({ rcId = 'RC-2024-001', onVoltar, onAbrirSuporte }: DetalheRequisicaoProps) {
  // Dados mockados - substituir por dados reais do backend
  const requisicao = {
    id: rcId,
    objeto: 'Aquisição de Material de Escritório para Departamento Administrativo',
    departamento: 'Administrativo',
    dataRequisicao: '01/11/2025',
    solicitante: 'Pedro Oliveira',
    status: 'Em Análise',
    descricao: 'Solicitação de materiais de escritório incluindo papel A4, canetas, pastas, grampeadores e demais itens para uso do departamento administrativo durante o trimestre.'
  };

  const linhaDoTempo = [
    {
      id: 1,
      etapa: 'RC Criada',
      status: 'Concluído',
      responsavel: 'Pedro Oliveira',
      data: '01/11/2025 09:30',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300'
    },
    {
      id: 2,
      etapa: 'RC Recebida pelo Setor de Compras',
      status: 'Concluído',
      responsavel: 'Sistema',
      data: '01/11/2025 10:00',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300'
    },
    {
      id: 3,
      etapa: 'Análise de RC',
      status: 'Concluído',
      responsavel: 'Maria Costa (Analista)',
      data: '02/11/2025 14:20',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300'
    },
    {
      id: 4,
      etapa: 'Processo em Análise pelo Comprador',
      status: 'Em Andamento',
      responsavel: 'João Silva (Comprador)',
      data: '03/11/2025 11:00',
      icon: Clock,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      mensagem: 'O comprador está analisando a viabilidade e definindo a melhor estratégia de compra. Prazo estimado: 10/11/2025'
    },
    {
      id: 5,
      etapa: 'Tramitando para Aprovação',
      status: 'Pendente',
      responsavel: '-',
      data: '-',
      icon: AlertCircle,
      iconColor: 'text-gray-400',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300'
    },
    {
      id: 6,
      etapa: 'Aprovada',
      status: 'Pendente',
      responsavel: '-',
      data: '-',
      icon: AlertCircle,
      iconColor: 'text-gray-400',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Cotação':
        return 'bg-blue-600 text-white border-blue-700';
      case 'Em Análise':
        return 'bg-amber-500 text-white border-amber-600';
      case 'Aprovado':
        return 'bg-emerald-600 text-white border-emerald-700';
      case 'Devolvido':
      case 'Devolvido ao Requisitante':
        return 'bg-orange-600 text-white border-orange-700';
      case 'Rejeitado':
        return 'bg-red-600 text-white border-red-700';
      case 'Finalizado':
        return 'bg-slate-600 text-white border-slate-700';
      default:
        return 'bg-gray-600 text-white border-gray-700';
    }
  };

  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <button 
            onClick={onVoltar}
            className="hover:text-[#003366] transition-colors"
          >
            Minhas Requisições
          </button>
          <ChevronRight size={16} />
          <span className="text-gray-900">{rcId}</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-black text-[24px]">Requisição {rcId}</h1>
              <Badge className={getStatusColor(requisicao.status)}>
                {requisicao.status}
              </Badge>
            </div>
            <p className="text-gray-600">{requisicao.objeto}</p>
          </div>
          {onVoltar && (
            <Button
              variant="outline"
              onClick={onVoltar}
              className="border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft size={18} className="mr-2" />
              Voltar para Lista
            </Button>
          )}
        </div>

        {/* Informações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Building2 size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Departamento</p>
              <p className="text-sm text-black">{requisicao.departamento}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-green-100 p-2 rounded-lg">
              <Calendar size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Data da Requisição</p>
              <p className="text-sm text-black">{requisicao.dataRequisicao}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-purple-100 p-2 rounded-lg">
              <User size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Solicitante</p>
              <p className="text-sm text-black">{requisicao.solicitante}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-orange-100 p-2 rounded-lg">
              <FileText size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">ID da RC</p>
              <p className="text-sm text-black">{requisicao.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 space-y-6">
        
        {/* Informações da Requisição */}
        <Card className="border border-gray-200">
          <CardHeader className="pt-3 pb-1">
            <CardTitle className="text-xl text-black px-[0px] py-[8px]">Informações da Requisição</CardTitle>
          </CardHeader>
          <CardContent className="pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Objeto da Requisição</p>
                <p className="text-black">{requisicao.objeto}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-600 mb-1">Descrição Detalhada</p>
                <p className="text-gray-700">{requisicao.descricao}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Linha do Tempo / Status do Processo */}
        <Card className="border border-gray-200">
          <CardHeader className="pt-3 pb-1">
            <CardTitle className="text-xl text-black px-[0px] py-[8px]">Histórico de Andamento</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {linhaDoTempo.map((etapa, index) => {
                const Icon = etapa.icon;
                const isLast = index === linhaDoTempo.length - 1;
                
                return (
                  <div key={etapa.id} className="relative">
                    {/* Linha vertical conectora */}
                    {!isLast && (
                      <div className="absolute left-[19px] top-[40px] w-[2px] h-[calc(100%+16px)] bg-gray-200" />
                    )}
                    
                    <div className="flex gap-4">
                      {/* Ícone */}
                      <div className={`flex-shrink-0 w-10 h-10 ${etapa.bgColor} rounded-full flex items-center justify-center border-2 ${etapa.borderColor} relative z-10`}>
                        <Icon size={20} className={etapa.iconColor} />
                      </div>
                      
                      {/* Conteúdo */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-black">{etapa.etapa}</p>
                          <Badge 
                            className={
                              etapa.status === 'Concluído' 
                                ? 'bg-emerald-600 text-white' 
                                : etapa.status === 'Em Andamento'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-600 text-white'
                            }
                          >
                            {etapa.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Responsável: {etapa.responsavel}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {etapa.data}
                        </p>
                        
                        {/* Mensagem informativa */}
                        {etapa.mensagem && (
                          <Alert className="mt-3 bg-blue-50 border-blue-200">
                            <AlertDescription className="text-sm text-gray-700">
                              {etapa.mensagem}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Mensagem de Devolução (se aplicável) */}
        {requisicao.status === 'Devolvido' && (
          <Card className="border border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-black mb-1">Requisição Devolvida</p>
                  <p className="text-sm text-gray-700">
                    Sua requisição foi devolvida pelo setor de compras. 
                    Motivo: Falta de informações sobre a especificação técnica dos itens. 
                    Por favor, complemente os dados necessários e reenvie a requisição.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informativo */}
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <HelpCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-black mb-1">Precisa de ajuda?</p>
                <p className="text-sm text-gray-700">
                  Se você tiver dúvidas sobre o andamento da sua requisição, acesse a 
                  <span 
                    className="text-[#003366] cursor-pointer hover:underline ml-1"
                    onClick={onAbrirSuporte}
                  >
                    Central de Suporte
                  </span> ou clique em "Fale com Suporte" acima.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}