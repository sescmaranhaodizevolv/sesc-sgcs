import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Search, MessageCircle, Send, Bot, HelpCircle, Plus, Eye, FileText, Download } from 'lucide-react';
import { BadgeNew } from '../ui/badge-new';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';

interface CentralSuporteProps {
  onNavigateToChamado?: (chamadoId: string) => void;
}

export function CentralSuporte({ onNavigateToChamado }: CentralSuporteProps) {
  const [activeTab, setActiveTab] = useState('chatbot');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchChamados, setSearchChamados] = useState('');
  const [searchDocumentos, setSearchDocumentos] = useState('');
  
  // Chatbot states
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot' as const,
      message: 'Olá! Sou o assistente virtual do SGCS. Como posso ajudá-lo hoje?',
      time: '14:30'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Modal state
  const [isNewChamadoModalOpen, setIsNewChamadoModalOpen] = useState(false);

  // FAQ - Perguntas e Respostas
  const faqItems = [
    {
      id: 'faq-1',
      pergunta: 'Como acompanhar o status da minha requisição de compra?',
      resposta: 'Para acompanhar o status da sua RC, acesse o menu "Minhas Requisições" no sistema. Lá você encontrará todas as suas solicitações com o status atualizado em tempo real. Clique em "Detalhar" para ver o histórico completo de andamento.'
    },
    {
      id: 'faq-2',
      pergunta: 'O que significa quando minha RC está com status "Devolvido"?',
      resposta: 'Status "Devolvido" significa que o setor de compras identificou alguma pendência ou necessidade de complementação de informações na sua requisição. Acesse o detalhe da RC para ver a mensagem do setor de compras e faça os ajustes necessários.'
    },
    {
      id: 'faq-3',
      pergunta: 'Quanto tempo leva para processar uma requisição de compra?',
      resposta: 'O prazo varia conforme o tipo de processo: Dispensa (até 15 dias), Inexigibilidade (até 10 dias), Licitação (30 a 60 dias) e Pregão Eletrônico (20 a 45 dias). Estes prazos podem variar dependendo da complexidade e da disponibilidade de fornecedores.'
    },
    {
      id: 'faq-4',
      pergunta: 'Posso cancelar uma requisição que já foi enviada?',
      resposta: 'Sim, mas apenas enquanto a RC estiver em status "Em Análise". Após iniciar a cotação com fornecedores, o cancelamento deve ser solicitado formalmente entrando em contato com o setor de compras.'
    },
    {
      id: 'faq-5',
      pergunta: 'Como faço para alterar informações de uma RC já enviada?',
      resposta: 'Se a RC ainda estiver em análise, você pode fazer alterações diretamente no sistema. Caso já tenha sido iniciado o processo de cotação, é necessário aguardar a devolução da RC pelo setor de compras ou solicitar a alteração através da Central de Suporte.'
    },
    {
      id: 'faq-6',
      pergunta: 'O que fazer se minha RC estiver parada há muito tempo?',
      resposta: 'Verifique primeiro o histórico de andamento no detalhe da RC. Se houver algum bloqueio identificado, entre em contato com o responsável atual listado no sistema. Caso não consiga resolver, abra um chamado na Central de Suporte.'
    },
    {
      id: 'faq-7',
      pergunta: 'Onde encontro os manuais e procedimentos de compras?',
      resposta: 'Todos os documentos institucionais, manuais e procedimentos estão disponíveis na aba "Documentos" desta Central de Suporte. Você pode fazer o download dos arquivos em PDF.'
    },
    {
      id: 'faq-8',
      pergunta: 'Preciso anexar documentos à minha requisição?',
      resposta: 'Dependendo do tipo de aquisição, sim. Documentos como especificações técnicas, orçamentos prévios ou justificativas devem ser anexados no momento da criação da RC. Consulte o Manual de Requisições para mais detalhes.'
    }
  ];

  // Chamados do usuário
  const meusChamados = [
    {
      id: 'CH-2025-045',
      titulo: 'RC-2024-1234 parada há 15 dias',
      categoria: 'Processo Parado',
      prioridade: 'Alta',
      status: 'Em Análise',
      dataAbertura: '01/11/2025',
      ultimaAtualizacao: '03/11/2025'
    },
    {
      id: 'CH-2025-032',
      titulo: 'Dúvida sobre anexo de especificação técnica',
      categoria: 'Dúvida',
      prioridade: 'Média',
      status: 'Respondido',
      dataAbertura: '28/10/2025',
      ultimaAtualizacao: '30/10/2025'
    },
    {
      id: 'CH-2025-018',
      titulo: 'Solicitação de cancelamento RC-2024-987',
      categoria: 'Cancelamento',
      prioridade: 'Média',
      status: 'Resolvido',
      dataAbertura: '20/10/2025',
      ultimaAtualizacao: '22/10/2025'
    },
    {
      id: 'CH-2025-009',
      titulo: 'Erro ao visualizar histórico da RC',
      categoria: 'Problema Técnico',
      prioridade: 'Baixa',
      status: 'Resolvido',
      dataAbertura: '15/10/2025',
      ultimaAtualizacao: '16/10/2025'
    }
  ];

  // Documentos e Manuais Institucionais
  const documentos = [
    {
      id: 1,
      titulo: 'Manual de Requisições de Compra',
      tipo: 'Manual',
      categoria: 'Guia do Usuário',
      dataPublicacao: '15/10/2025',
      tamanho: '2.5 MB',
      versao: 'v3.2'
    },
    {
      id: 2,
      titulo: 'Fluxograma do Processo de Compras',
      tipo: 'Procedimento',
      categoria: 'Processo',
      dataPublicacao: '20/09/2025',
      tamanho: '1.2 MB',
      versao: 'v2.0'
    },
    {
      id: 3,
      titulo: 'Política de Aquisições do SESC',
      tipo: 'Normativa',
      categoria: 'Política',
      dataPublicacao: '01/09/2025',
      tamanho: '3.8 MB',
      versao: 'v5.1'
    },
    {
      id: 4,
      titulo: 'FAQ - Perguntas Frequentes sobre RCs',
      tipo: 'Guia',
      categoria: 'Guia do Usuário',
      dataPublicacao: '10/10/2025',
      tamanho: '850 KB',
      versao: 'v1.8'
    },
    {
      id: 5,
      titulo: 'Tutorial: Como Criar uma Requisição de Compra',
      tipo: 'Tutorial',
      categoria: 'Treinamento',
      dataPublicacao: '05/11/2025',
      tamanho: '4.1 MB',
      versao: 'v2.3'
    },
    {
      id: 6,
      titulo: 'Modelo de Especificação Técnica',
      tipo: 'Modelo',
      categoria: 'Template',
      dataPublicacao: '22/08/2025',
      tamanho: '650 KB',
      versao: 'v1.5'
    },
    {
      id: 7,
      titulo: 'Guia de Classificação de Pedidos',
      tipo: 'Guia',
      categoria: 'Procedimento',
      dataPublicacao: '12/09/2025',
      tamanho: '1.7 MB',
      versao: 'v2.1'
    },
    {
      id: 8,
      titulo: 'Procedimento de Cancelamento de RC',
      tipo: 'Procedimento',
      categoria: 'Processo',
      dataPublicacao: '30/09/2025',
      tamanho: '980 KB',
      versao: 'v1.3'
    }
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Adiciona mensagem do usuário
    const userMessage = {
      id: chatMessages.length + 1,
      type: 'user' as const,
      message: inputMessage,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([...chatMessages, userMessage]);

    // Simula resposta do bot
    setTimeout(() => {
      const botResponse = {
        id: chatMessages.length + 2,
        type: 'bot' as const,
        message: 'Obrigado pela sua mensagem! Um atendente entrará em contato em breve. Enquanto isso, você pode consultar nosso FAQ para respostas rápidas.',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);

    setInputMessage('');
  };

  const filteredFaq = faqItems.filter(item =>
    item.pergunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.resposta.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChamados = meusChamados.filter(chamado =>
    chamado.titulo.toLowerCase().includes(searchChamados.toLowerCase()) ||
    chamado.id.toLowerCase().includes(searchChamados.toLowerCase())
  );

  const filteredDocumentos = documentos.filter(doc =>
    doc.titulo.toLowerCase().includes(searchDocumentos.toLowerCase()) ||
    doc.tipo.toLowerCase().includes(searchDocumentos.toLowerCase()) ||
    doc.categoria.toLowerCase().includes(searchDocumentos.toLowerCase())
  );

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

  const getTipoBadge = (tipo: string) => {
    const tipoMap: { [key: string]: string } = {
      'Manual': 'bg-blue-100 text-blue-800',
      'Procedimento': 'bg-green-100 text-green-800',
      'Normativa': 'bg-purple-100 text-purple-800',
      'Guia': 'bg-orange-100 text-orange-800',
      'Tutorial': 'bg-yellow-100 text-yellow-800',
      'Modelo': 'bg-pink-100 text-pink-800'
    };

    return tipoMap[tipo] || 'bg-gray-100 text-gray-800';
  };

  const handleDownload = (titulo: string) => {
    toast.success('Download iniciado', {
      description: `O documento "${titulo}" está sendo baixado.`
    });
  };

  return (
    <div className="p-6 space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Ajuda e Suporte</h2>
          <p className="text-gray-600 mt-1">Tire suas dúvidas, abra chamados e converse com nosso assistente</p>
        </div>
        
        {/* Botão de Novo Chamado - Visível apenas na aba Chamados */}
        {activeTab === 'chamados' && (
          <Dialog open={isNewChamadoModalOpen} onOpenChange={setIsNewChamadoModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                <Plus size={20} className="mr-2" />
                Abrir Chamado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
              <div className="flex-1 overflow-y-auto px-6">
                <DialogHeader className="pt-6">
                  <DialogTitle>Abrir Novo Chamado</DialogTitle>
                  <DialogDescription>
                    Descreva seu problema ou dúvida e nossa equipe entrará em contato
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 pb-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="chamado-titulo">Título do Chamado *</Label>
                    <Input id="chamado-titulo" placeholder="Descreva brevemente o problema" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="chamado-categoria">Categoria *</Label>
                      <Select>
                        <SelectTrigger id="chamado-categoria">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="duvida">Dúvida</SelectItem>
                          <SelectItem value="processo-parado">Processo Parado</SelectItem>
                          <SelectItem value="cancelamento">Cancelamento</SelectItem>
                          <SelectItem value="alteracao">Alteração de RC</SelectItem>
                          <SelectItem value="problema-tecnico">Problema Técnico</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="chamado-prioridade">Prioridade *</Label>
                      <Select>
                        <SelectTrigger id="chamado-prioridade">
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="chamado-rc">RC Relacionada (Opcional)</Label>
                    <Input id="chamado-rc" placeholder="Ex: RC-2024-1234" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="chamado-descricao">Descrição Detalhada *</Label>
                    <Textarea 
                      id="chamado-descricao" 
                      placeholder="Descreva em detalhes o problema ou dúvida..."
                      rows={6}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                <Button variant="outline" className="flex-1" onClick={() => setIsNewChamadoModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-[#003366] hover:bg-[#002244] text-white" 
                  onClick={() => {
                    setIsNewChamadoModalOpen(false);
                    toast.success('Chamado aberto com sucesso!', {
                      description: 'Nossa equipe entrará em contato em breve.'
                    });
                  }}
                >
                  Abrir Chamado
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="chatbot" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="chatbot">
            Chatbot
          </TabsTrigger>
          <TabsTrigger value="chamados">
            Chamados
          </TabsTrigger>
          <TabsTrigger value="documentos">
            Documentos
          </TabsTrigger>
          <TabsTrigger value="faq">
            FAQ
          </TabsTrigger>
        </TabsList>

        {/* Aba 1: Chatbot */}
        <TabsContent value="chatbot" className="space-y-6 mt-6">
          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black px-[0px] py-[8px] flex items-center gap-2">
                <Bot size={20} className="text-[#003366]" />
                Assistente Virtual
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Chat Messages */}
              <ScrollArea className="h-[400px] rounded-lg border border-gray-200 p-4 mb-4">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.type === 'user'
                            ? 'bg-[#003366] text-white'
                            : 'bg-gray-100 text-black'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input de Mensagem */}
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  className="bg-[#003366] hover:bg-[#002244] text-white"
                >
                  <Send size={18} />
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                💡 <strong>Dica:</strong> Para questões mais complexas, abra um chamado na aba "Chamados".
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 2: Chamados */}
        <TabsContent value="chamados" className="space-y-6 mt-6">
          {/* Filtro */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por título ou ID do chamado..."
                  value={searchChamados}
                  onChange={(e) => setSearchChamados(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Chamados */}
          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black px-[0px] py-[8px]">Meus Chamados</CardTitle>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[16px] pb-[24px] pl-[16px]">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">ID</TableHead>
                      <TableHead className="min-w-[280px]">Título</TableHead>
                      <TableHead className="min-w-[160px]">Categoria</TableHead>
                      <TableHead className="min-w-[120px]">Prioridade</TableHead>
                      <TableHead className="min-w-[140px]">Status</TableHead>
                      <TableHead className="min-w-[140px]">Data Abertura</TableHead>
                      <TableHead className="min-w-[140px]">Última Atualização</TableHead>
                      <TableHead className="min-w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredChamados.map((chamado) => (
                      <TableRow key={chamado.id}>
                        <TableCell className="text-black">{chamado.id}</TableCell>
                        <TableCell className="text-black">{chamado.titulo}</TableCell>
                        <TableCell className="text-gray-600">{chamado.categoria}</TableCell>
                        <TableCell>
                          <BadgeNew {...getPrioridadeBadge(chamado.prioridade)} size="sm">
                            {chamado.prioridade}
                          </BadgeNew>
                        </TableCell>
                        <TableCell>
                          <BadgeNew {...getStatusBadge(chamado.status)} size="sm">
                            {chamado.status}
                          </BadgeNew>
                        </TableCell>
                        <TableCell className="text-gray-600">{chamado.dataAbertura}</TableCell>
                        <TableCell className="text-gray-600">{chamado.ultimaAtualizacao}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              if (onNavigateToChamado) {
                                onNavigateToChamado(chamado.id);
                              }
                            }}
                          >
                            <Eye size={16} className="mr-1" />
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 3: Documentos */}
        <TabsContent value="documentos" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                  <HelpCircle size={20} className="text-[#003366]" />
                  Manuais e Documentos Institucionais para Requisitantes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Consulte os manuais, guias e documentos institucionais para auxiliar no processo de requisições de compra.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <HelpCircle size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-black">Procedimentos para Requisitantes</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Guia prático para abertura e acompanhamento de solicitações de compra
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <BadgeNew className="bg-blue-100 text-blue-800">PDF • 1.8 MB</BadgeNew>
                            <span className="text-xs text-gray-500">Atualizado em 15/01/2024</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye size={16} className="mr-2" />
                        Abrir
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-purple-100 p-3 rounded-lg">
                          <HelpCircle size={24} className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-black">Fluxograma de Processos de Compra</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Visualização do fluxo completo desde a requisição até a entrega
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <BadgeNew className="bg-purple-100 text-purple-800">PDF • 0.8 MB</BadgeNew>
                            <span className="text-xs text-gray-500">Atualizado em 20/12/2023</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye size={16} className="mr-2" />
                        Abrir
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-yellow-100 p-3 rounded-lg">
                          <HelpCircle size={24} className="text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="text-black">Modelos de Documentos e Templates</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Modelos padronizados para requisições, justificativas e especificações técnicas
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <BadgeNew className="bg-yellow-100 text-yellow-800">ZIP • 3.2 MB</BadgeNew>
                            <span className="text-xs text-gray-500">Atualizado em 08/01/2024</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye size={16} className="mr-2" />
                        Baixar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <HelpCircle size={24} className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-black">Tabela de Alçadas e Limites</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Valores de alçada para aprovação de processos e limites por modalidade
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <BadgeNew className="bg-green-100 text-green-800">PDF • 0.5 MB</BadgeNew>
                            <span className="text-xs text-gray-500">Atualizado em 05/01/2024</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye size={16} className="mr-2" />
                        Abrir
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-red-100 p-3 rounded-lg">
                          <HelpCircle size={24} className="text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-black">Manual de Compras e Licitações SESC</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Regulamento completo para processos de compra e licitações
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <BadgeNew className="bg-red-100 text-red-800">PDF • 5.2 MB</BadgeNew>
                            <span className="text-xs text-gray-500">Atualizado em 10/01/2024</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye size={16} className="mr-2" />
                        Abrir
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-orange-100 p-3 rounded-lg">
                          <HelpCircle size={24} className="text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-black">FAQ - Perguntas Frequentes sobre RCs</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Respostas para as dúvidas mais comuns sobre requisições de compra
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <BadgeNew className="bg-orange-100 text-orange-800">PDF • 1.1 MB</BadgeNew>
                            <span className="text-xs text-gray-500">Atualizado em 18/01/2024</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye size={16} className="mr-2" />
                        Abrir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 4: FAQ */}
        <TabsContent value="faq" className="space-y-6 mt-6">
          {/* Filtro */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar no FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Accordion */}
          <Card className="border border-gray-200">
            <CardHeader className="pt-3 pb-1">
              <CardTitle className="text-xl text-black px-[0px] py-[8px] flex items-center gap-2">
                <HelpCircle size={20} className="text-[#003366]" />
                Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {filteredFaq.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredFaq.map((item) => (
                    <AccordionItem 
                      key={item.id} 
                      value={item.id}
                      className="border border-gray-200 rounded-lg px-4"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <span className="text-left text-black">{item.pergunta}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 pb-4">
                        {item.resposta}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="p-8 text-center">
                  <Search size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600">Nenhuma pergunta encontrada</p>
                  <p className="text-sm text-gray-500 mt-1">Tente buscar com outras palavras-chave</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}