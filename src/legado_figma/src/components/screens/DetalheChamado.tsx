import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { BadgeNew } from '../ui/badge-new';
import { ArrowLeft, MessageCircle, Clock, User, Tag, AlertCircle, Send, ChevronRight, CheckCircle } from 'lucide-react';
import { toast } from '../../lib/toast-helpers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

interface DetalheChamadoProps {
  chamadoId: string;
  onBack: () => void;
  currentProfile?: 'admin' | 'comprador' | 'requisitante';
}

export function DetalheChamado({ chamadoId, onBack, currentProfile = 'requisitante' }: DetalheChamadoProps) {
  const [novaResposta, setNovaResposta] = useState('');
  const [status, setStatus] = useState('Em Análise');
  const [prioridade, setPrioridade] = useState('Alta');

  // Mock data - em produção viria de uma API
  const chamado = {
    id: 'CH-2025-045',
    titulo: 'RC-2024-1234 parada há 15 dias',
    categoria: 'Processo Parado',
    prioridade: 'Alta',
    status: 'Em Análise',
    dataAbertura: '01/11/2025 - 14:30',
    ultimaAtualizacao: '03/11/2025 - 10:15',
    requisitante: 'João Silva',
    email: 'joao.silva@sesc.com.br',
    rcRelacionada: 'RC-2024-1234',
    descricao: 'A requisição de compra RC-2024-1234 está parada há 15 dias úteis sem movimentação. Verificando o histórico, o processo está na etapa de "Análise de Cotações" desde o dia 15/10/2025. Gostaria de saber se há algum problema ou impedimento, pois a compra é urgente para o departamento.',
    historico: [
      {
        id: 1,
        tipo: 'abertura',
        usuario: 'João Silva',
        perfil: 'Requisitante',
        data: '01/11/2025 - 14:30',
        mensagem: 'Chamado aberto: RC-2024-1234 parada há 15 dias'
      },
      {
        id: 2,
        tipo: 'resposta',
        usuario: 'Maria Santos',
        perfil: 'Suporte - Nível 1',
        data: '02/11/2025 - 09:45',
        mensagem: 'Olá João, obrigado pelo contato. Verifiquei o processo RC-2024-1234 e identifiquei que está aguardando aprovação do orçamento pela diretoria financeira. Encaminhei o chamado para o setor de compras para providências.'
      },
      {
        id: 3,
        tipo: 'atualizacao',
        usuario: 'Carlos Oliveira',
        perfil: 'Comprador',
        data: '03/11/2025 - 10:15',
        mensagem: 'Processo em análise. Entramos em contato com a diretoria financeira para agilizar a aprovação. Previsão de retorno: 05/11/2025.'
      }
    ]
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { intent: any, weight: any } } = {
      'Em Análise': { intent: 'info', weight: 'medium' },
      'Respondido': { intent: 'warning', weight: 'medium' },
      'Resolvido': { intent: 'success', weight: 'medium' },
      'Cancelado': { intent: 'neutral', weight: 'medium' }
    };

    return statusMap[status] || { intent: 'neutral', weight: 'medium' };
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeMap: { [key: string]: { intent: any, weight: any } } = {
      'Alta': { intent: 'danger', weight: 'medium' },
      'Média': { intent: 'warning', weight: 'medium' },
      'Baixa': { intent: 'neutral', weight: 'medium' }
    };

    return prioridadeMap[prioridade] || { intent: 'neutral', weight: 'medium' };
  };

  const handleEnviarResposta = () => {
    if (!novaResposta.trim()) {
      toast.error('Digite uma mensagem');
      return;
    }

    toast.success('Resposta enviada com sucesso!', {
      description: 'Nossa equipe recebeu sua mensagem.'
    });
    setNovaResposta('');
  };

  const handleResolverChamado = () => {
    toast.success('Chamado resolvido com sucesso!', {
      description: 'O status foi atualizado e o requisitante foi notificado.'
    });
    setTimeout(() => {
      onBack();
    }, 1500);
  };

  const handleAtualizarStatusPrioridade = () => {
    toast.success('Status e prioridade atualizados!', {
      description: 'As alterações foram salvas com sucesso.'
    });
  };

  return (
    <div className="p-6 space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <button 
          onClick={onBack}
          className="hover:text-[#003366] transition-colors"
        >
          Ajuda e Suporte
        </button>
        <ChevronRight size={16} />
        <button 
          onClick={onBack}
          className="hover:text-[#003366] transition-colors"
        >
          Chamados
        </button>
        <ChevronRight size={16} />
        <span className="text-black">{chamado.id}</span>
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl text-black">{chamado.titulo}</h2>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-gray-600">Chamado {chamado.id}</p>
            <BadgeNew {...getPrioridadeBadge(chamado.prioridade)} size="md">
              {chamado.prioridade}
            </BadgeNew>
            <BadgeNew {...getStatusBadge(chamado.status)} size="md">
              {chamado.status}
            </BadgeNew>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={onBack}
        >
          <ArrowLeft size={18} className="mr-2" />
          Voltar
        </Button>
      </div>

      {/* Informações do Chamado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <User size={20} className="text-[#003366]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Requisitante</p>
                <p className="text-black truncate">{chamado.requisitante}</p>
                <p className="text-sm text-gray-600 truncate">{chamado.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Clock size={20} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Data de Abertura</p>
                <p className="text-black">{chamado.dataAbertura}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Última atualização: {chamado.ultimaAtualizacao}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Tag size={20} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Categoria</p>
                <p className="text-black">{chamado.categoria}</p>
                {chamado.rcRelacionada && (
                  <p className="text-sm text-gray-600 mt-1">
                    RC: {chamado.rcRelacionada}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Descrição do Problema */}
      <Card className="border border-gray-200">
        <CardHeader className="pt-3 pb-1">
          <CardTitle className="text-xl text-black px-[0px] py-[8px] flex items-center gap-2">
            <AlertCircle size={20} className="text-[#003366]" />
            Descrição do Problema
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
          <p className="text-gray-700 whitespace-pre-line">{chamado.descricao}</p>
        </CardContent>
      </Card>

      {/* Histórico de Atendimento */}
      <Card className="border border-gray-200">
        <CardHeader className="pt-3 pb-1">
          <CardTitle className="text-xl text-black px-[0px] py-[8px] flex items-center gap-2">
            <MessageCircle size={20} className="text-[#003366]" />
            Histórico de Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {chamado.historico.map((item, index) => (
              <div key={item.id} className="relative">
                {/* Linha de conexão */}
                {index < chamado.historico.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
                )}

                <div className="flex gap-4">
                  {/* Avatar/Ícone */}
                  <div className="relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.tipo === 'abertura' ? 'bg-blue-100' :
                      item.tipo === 'resposta' ? 'bg-green-100' :
                      'bg-yellow-100'
                    }`}>
                      <MessageCircle size={16} className={
                        item.tipo === 'abertura' ? 'text-blue-600' :
                        item.tipo === 'resposta' ? 'text-green-600' :
                        'text-yellow-600'
                      } />
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-black">{item.usuario}</p>
                          <p className="text-sm text-gray-600">{item.perfil}</p>
                        </div>
                        <p className="text-sm text-gray-500">{item.data}</p>
                      </div>
                      <p className="text-gray-700 mt-2">{item.mensagem}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Responder ao Chamado */}
      {chamado.status !== 'Resolvido' && chamado.status !== 'Cancelado' && (
        <Card className="border border-gray-200">
          <CardHeader className="pt-3 pb-1">
            <CardTitle className="text-xl text-black px-[0px] py-[8px]">
              Adicionar Comentário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
            <Textarea
              placeholder="Digite sua mensagem para a equipe de suporte..."
              value={novaResposta}
              onChange={(e) => setNovaResposta(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleEnviarResposta}
                className="bg-[#003366] hover:bg-[#002244] text-white"
              >
                <Send size={18} className="mr-2" />
                Enviar Resposta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gerenciamento do Chamado - APENAS para Administrador */}
      {currentProfile === 'admin' && chamado.status !== 'Resolvido' && chamado.status !== 'Cancelado' && (
        <Card className="border border-gray-200">
          <CardHeader className="pt-3 pb-1">
            <CardTitle className="text-xl text-black px-[0px] py-[8px]">
              Gerenciar Chamado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Em Análise">Em Análise</SelectItem>
                    <SelectItem value="Respondido">Respondido</SelectItem>
                    <SelectItem value="Resolvido">Resolvido</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select value={prioridade} onValueChange={setPrioridade}>
                  <SelectTrigger id="prioridade">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleAtualizarStatusPrioridade}
                variant="outline"
              >
                Atualizar Status/Prioridade
              </Button>
              <Button
                onClick={handleResolverChamado}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle size={18} className="mr-2" />
                Resolver Chamado
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}