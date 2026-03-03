"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BadgeStatus } from '@/components/ui/badge-status';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  MessageCircle, 
  Bot,
  GraduationCap, 
  LifeBuoy, 
  Plus, 
  HelpCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Send,
  Upload,
  Search,
  User,
  X,
  FileText,
  Download
} from 'lucide-react';
import { FileInput } from '@/components/ui/file-input';
import { getBadgeMappingForPrioridade } from '@/lib/badge-mappings';
import { toast } from "sonner";

interface CentralAjudaSuporteProps {
  onNavigateToChamado?: (chamadoId: number) => void;
  currentProfile?: 'admin' | 'comprador' | 'requisitante' | 'gestora';
}

interface ChatMessage {
  id: number;
  type: 'bot' | 'user';
  message: string;
  time: string;
}

export function CentralAjudaSuporte({ onNavigateToChamado = () => {}, currentProfile = 'admin' }: CentralAjudaSuporteProps) {
  const [activeTab, setActiveTab] = useState(currentProfile === 'requisitante' ? 'chatbot' : 'chamados');
  const [chamadoAberto, setChamadoAberto] = useState(false);
  const [isUploadDocumentoOpen, setIsUploadDocumentoOpen] = useState(false);
  const [documentoUploadando, setDocumentoUploadando] = useState(false);
  const [respostaDialogAberto, setRespostaDialogAberto] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<any>(null);
  const [isCriarTreinamentoOpen, setIsCriarTreinamentoOpen] = useState(false);
  const [treinamentoCriando, setTreinamentoCriando] = useState(false);
  const [searchFaqRequisitante, setSearchFaqRequisitante] = useState('');
  const [searchChamadosRequisitante, setSearchChamadosRequisitante] = useState('');
  const [searchDocumentosRequisitante, setSearchDocumentosRequisitante] = useState('');
  const [isNovoFaqOpen, setIsNovoFaqOpen] = useState(false);
  const [novaPergunta, setNovaPergunta] = useState('');
  const [novaResposta, setNovaResposta] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'bot' as const,
      message: 'Olá! Sou o assistente virtual do SGCS. Como posso ajudá-lo hoje?',
      time: '14:30'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Filtros da tabela
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroBusca, setFiltroBusca] = useState('');

  // Verificar permissões baseadas no perfil
  const podeAbrirChamado = currentProfile === 'requisitante' || currentProfile === 'comprador';
  const podeResponderChamado = currentProfile === 'admin' || currentProfile === 'comprador';
  const usuarioLogado = currentProfile === 'requisitante' ? 'João Silva' : currentProfile === 'comprador' ? 'Comprador' : currentProfile === 'gestora' ? 'Gestora' : 'Admin';

  const chamadosRecentes = [
    {
      id: 1,
      numero: 'SUP-2024-001',
      titulo: 'Erro ao Exportar Relatório de Processos',
      categoria: 'Sistema',
      prioridade: 'Alta',
      status: 'Em Andamento',
      dataAbertura: '25/01/2024 14:30',
      responsavel: 'Suporte TI',
      usuarioRequisitante: 'João Silva',
      perfilRequisitante: 'Comprador',
      descricao: 'Ao tentar exportar o relatório de processos em formato Excel, o sistema apresenta erro 500 e não gera o arquivo.'
    },
    {
      id: 2,
      numero: 'SUP-2024-002',
      titulo: 'Dúvida sobre Prorrogação de Contrato',
      categoria: 'Dúvida',
      prioridade: 'Média',
      status: 'Aguardando Usuário',
      dataAbertura: '24/01/2024 10:15',
      responsavel: 'Ana Costa',
      usuarioRequisitante: 'Maria Santos',
      perfilRequisitante: 'Gestor de Contratos',
      descricao: 'Preciso prorrogar o contrato CT-2023-045 com a empresa XYZ Ltda. Qual o procedimento correto no sistema?'
    },
    {
      id: 3,
      numero: 'SUP-2024-003',
      titulo: 'Solicitação de Novo Usuário',
      categoria: 'Acesso/Perfil',
      prioridade: 'Baixa',
      status: 'Resolvido',
      dataAbertura: '22/01/2024 09:00',
      responsavel: 'Suporte TI',
      usuarioRequisitante: 'Pedro Oliveira',
      perfilRequisitante: 'Administrador',
      descricao: 'Solicito criação de usuário para o novo funcionário Carlos Mendes.'
    }
  ];

  const faqItemsIniciais = [
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
  const [faqs, setFaqs] = useState(faqItemsIniciais);

  const faqItemsRequisitante = [
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

  const documentosRequisitante = [
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

  const estatisticasSuporte = {
    chamadosAbertos: chamadosRecentes.filter(c => c.status !== 'Resolvido').length,
    chamadosResolvidos: chamadosRecentes.filter(c => c.status === 'Resolvido').length,
    tempoMedioResolucao: '2.5 horas',
    satisfacaoUsuario: '4.8/5.0'
  };

  const getStatusBadge = (status: string) => {
    const mappings: Record<string, { intent: 'danger' | 'warning' | 'info' | 'purple' | 'success'; weight: 'medium' }> = {
      'Aberto': { intent: 'danger', weight: 'medium' },
      'Em Andamento': { intent: 'warning', weight: 'medium' },
      'Aguardando TI': { intent: 'info', weight: 'medium' },
      'Aguardando Usuário': { intent: 'purple', weight: 'medium' },
      'Resolvido': { intent: 'success', weight: 'medium' }
    };
    return mappings[status] || { intent: 'neutral' as const, weight: 'medium' as const };
  };

  const getPrioridadeBadge = (prioridade: string) => {
    // Usando a função padrão do sistema para prioridades
    return getBadgeMappingForPrioridade(prioridade);
  };

  const abrirChamado = () => {
    setChamadoAberto(true);
    setTimeout(() => {
      setChamadoAberto(false);
      alert('Chamado aberto com sucesso! Número: SUP-2024-004');
    }, 1000);
  };

  const abrirDetalhesChamado = (chamado: typeof chamadosRecentes[0]) => {
    onNavigateToChamado(chamado.id);
  };

  // Função para filtrar chamados
  const chamadosFiltrados = chamadosRecentes.filter(chamado => {
    const matchStatus = filtroStatus === 'todos' || chamado.status === filtroStatus;
    const matchPrioridade = filtroPrioridade === 'todos' || chamado.prioridade === filtroPrioridade;
    const matchCategoria = filtroCategoria === 'todos' || chamado.categoria === filtroCategoria;
    const matchBusca = filtroBusca === '' || 
      chamado.titulo.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      chamado.numero.toLowerCase().includes(filtroBusca.toLowerCase());
    
    return matchStatus && matchPrioridade && matchCategoria && matchBusca;
  });

  const limparFiltros = () => {
    setFiltroStatus('todos');
    setFiltroPrioridade('todos');
    setFiltroCategoria('todos');
    setFiltroBusca('');
  };

  const uploadDocumento = () => {
    setDocumentoUploadando(true);
    setTimeout(() => {
      setDocumentoUploadando(false);
      setIsUploadDocumentoOpen(false);
      alert('Documento institucional adicionado com sucesso!');
    }, 1500);
  };

  const criarTreinamento = () => {
    setTreinamentoCriando(true);
    setTimeout(() => {
      setTreinamentoCriando(false);
      setIsCriarTreinamentoOpen(false);
      alert('Treinamento criado com sucesso!');
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      message: inputMessage,
      time: agora
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: chatMessages.length + 2,
        type: 'bot',
        message: 'Obrigado pela sua mensagem! Um atendente entrará em contato em breve. Enquanto isso, você pode consultar nosso FAQ para respostas rápidas.',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const filteredFaqRequisitante = faqItemsRequisitante.filter(item =>
    item.pergunta.toLowerCase().includes(searchFaqRequisitante.toLowerCase()) ||
    item.resposta.toLowerCase().includes(searchFaqRequisitante.toLowerCase())
  );

  const filteredChamadosRequisitante = meusChamados.filter(chamado =>
    chamado.titulo.toLowerCase().includes(searchChamadosRequisitante.toLowerCase()) ||
    chamado.id.toLowerCase().includes(searchChamadosRequisitante.toLowerCase())
  );

  const filteredDocumentosRequisitante = documentosRequisitante.filter(doc =>
    doc.titulo.toLowerCase().includes(searchDocumentosRequisitante.toLowerCase()) ||
    doc.tipo.toLowerCase().includes(searchDocumentosRequisitante.toLowerCase()) ||
    doc.categoria.toLowerCase().includes(searchDocumentosRequisitante.toLowerCase())
  );

  const getStatusBadgeRequisitante = (status: string) => {
    const statusMap: Record<string, { intent: 'info' | 'warning' | 'success' | 'neutral'; weight: 'medium' }> = {
      'Em Análise': { intent: 'info', weight: 'medium' },
      'Respondido': { intent: 'warning', weight: 'medium' },
      'Resolvido': { intent: 'success', weight: 'medium' },
      'Cancelado': { intent: 'neutral', weight: 'medium' }
    };

    return statusMap[status] || { intent: 'neutral' as const, weight: 'medium' as const };
  };

  const getTipoBadgeClass = (tipo: string) => {
    const tipoMap: Record<string, string> = {
      Manual: 'bg-blue-100 text-blue-800',
      Procedimento: 'bg-green-100 text-green-800',
      Normativa: 'bg-purple-100 text-purple-800',
      Guia: 'bg-orange-100 text-orange-800',
      Tutorial: 'bg-yellow-100 text-yellow-800',
      Modelo: 'bg-pink-100 text-pink-800'
    };

    return tipoMap[tipo] || 'bg-gray-100 text-gray-800';
  };

  const salvarNovoFaq = () => {
    if (!novaPergunta.trim() || !novaResposta.trim() || !novaCategoria) return;

    const novoFaq = {
      id: Date.now(),
      pergunta: novaPergunta.trim(),
      resposta: novaResposta.trim(),
      categoria: novaCategoria,
      visualizacoes: 0
    };

    setFaqs(prev => [novoFaq, ...prev]);
    toast.success("FAQ cadastrado com sucesso!");
    setNovaPergunta('');
    setNovaResposta('');
    setNovaCategoria('');
    setIsNovoFaqOpen(false);
  };

  if (currentProfile === 'requisitante') {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl text-black">Ajuda e Suporte</h2>
            <p className="text-gray-600 mt-1">Tire suas dúvidas, abra chamados e converse com nosso assistente</p>
          </div>

          {activeTab === 'chamados' && (
            <Dialog>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Button variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                    onClick={abrirChamado}
                    disabled={chamadoAberto}
                  >
                    {chamadoAberto ? 'Abrindo...' : 'Abrir Chamado'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
            <TabsTrigger value="chamados">Chamados</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="chatbot" className="space-y-6 mt-6">
            <Card className="border border-gray-200">
              <CardHeader className="pt-3 pb-1">
                <CardTitle className="text-xl text-black px-[0px] py-[8px] flex items-center gap-2">
                  <Bot size={20} className="text-[#003366]" />
                  Assistente Virtual
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[400px] rounded-lg border border-gray-200 p-4 mb-4 overflow-y-auto">
                  <div className="space-y-4">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.type === 'bot' && (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-[#003366] shrink-0">
                            <Bot size={16} />
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] rounded-2xl p-3 ${
                            msg.type === 'user'
                              ? 'bg-[#003366] text-white rounded-br-none'
                              : 'bg-gray-100 text-black rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                            {msg.time}
                          </p>
                        </div>
                        {msg.type === 'user' && (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 shrink-0">
                            <User size={16} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                  />
                  <Button onClick={handleSendMessage} className="bg-[#003366] hover:bg-[#002244] text-white">
                    <Send size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chamados" className="space-y-6 mt-6">
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por título ou ID do chamado..."
                    value={searchChamadosRequisitante}
                    onChange={(e) => setSearchChamadosRequisitante(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

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
                      {filteredChamadosRequisitante.map((chamado, index) => (
                        <TableRow key={chamado.id}>
                          <TableCell className="text-black">{chamado.id}</TableCell>
                          <TableCell className="text-black">{chamado.titulo}</TableCell>
                          <TableCell className="text-gray-600">{chamado.categoria}</TableCell>
                          <TableCell>
                            <BadgeStatus {...getPrioridadeBadge(chamado.prioridade)} size="sm">
                              {chamado.prioridade}
                            </BadgeStatus>
                          </TableCell>
                          <TableCell>
                            <BadgeStatus {...getStatusBadgeRequisitante(chamado.status)} size="sm">
                              {chamado.status}
                            </BadgeStatus>
                          </TableCell>
                          <TableCell className="text-gray-600">{chamado.dataAbertura}</TableCell>
                          <TableCell className="text-gray-600">{chamado.ultimaAtualizacao}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onNavigateToChamado(index + 1)}
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

          <TabsContent value="documentos" className="space-y-4 mt-6">
            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                  <HelpCircle size={20} className="text-[#003366]" />
                  Manuais e Documentos Institucionais para Requisitantes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
                <Alert className="mt-6 mb-4 border-blue-200 bg-blue-50">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Consulte os manuais, guias e documentos institucionais para auxiliar no processo de requisições de compra.
                  </AlertDescription>
                </Alert>

                <div className="mb-4 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por título, tipo ou categoria..."
                    value={searchDocumentosRequisitante}
                    onChange={(e) => setSearchDocumentosRequisitante(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-3">
                  {filteredDocumentosRequisitante.map((doc) => (
                    <Card key={doc.id} className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="bg-blue-100 p-3 rounded-lg">
                              <FileText size={24} className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-black">{doc.titulo}</h3>
                              <p className="text-sm text-gray-600 mt-1">{doc.categoria}</p>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getTipoBadgeClass(doc.tipo)}`}>
                                  {doc.tipo}
                                </span>
                                <span className="text-xs text-gray-500">{doc.tamanho}</span>
                                <span className="text-xs text-gray-500">{doc.versao}</span>
                                <span className="text-xs text-gray-500">Publicado em {doc.dataPublicacao}</span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download size={16} className="mr-2" />
                            Baixar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6 mt-6">
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar no FAQ..."
                    value={searchFaqRequisitante}
                    onChange={(e) => setSearchFaqRequisitante(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="pt-3 pb-1">
                <CardTitle className="text-xl text-black px-[0px] py-[8px] flex items-center gap-2">
                  <HelpCircle size={20} className="text-[#003366]" />
                  Perguntas Frequentes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {filteredFaqRequisitante.length > 0 ? (
                  <Accordion type="single" collapsible className="space-y-2">
                    {filteredFaqRequisitante.map((item) => (
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

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Ajuda e Suporte</h2>
          <p className="text-gray-600 mt-1">Central de ajuda com chatbot, treinamento e abertura de chamados</p>
        </div>
        {activeTab === 'chamados' && podeAbrirChamado && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                <Plus size={20} className="mr-2" />
                Abrir Chamado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
              {/* Área scrollável */}
              <div className="flex-1 overflow-y-auto px-6">
                <DialogHeader className="pt-6">
                  <DialogTitle>Abrir Novo Chamado</DialogTitle>
                  <DialogDescription>
                    Abra um chamado de suporte técnico para resolver sua questão.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 pb-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sistema">Problema no Sistema</SelectItem>
                        <SelectItem value="duvida">Dúvida</SelectItem>
                        <SelectItem value="acesso">Problema de Acesso</SelectItem>
                        <SelectItem value="relatorio">Relatórios</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="titulo">Título do Chamado</Label>
                    <Input id="titulo" placeholder="Descreva brevemente o problema" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="descricao">Descrição Detalhada</Label>
                    <Textarea id="descricao" placeholder="Descreva o problema em detalhes..." rows={4} />
                  </div>
                </div>
              </div>

              {/* Footer fixo */}
              <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                <Button variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                  onClick={abrirChamado}
                  disabled={chamadoAberto}
                >
                  {chamadoAberto ? 'Abrindo...' : 'Abrir Chamado'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Estatísticas de Suporte */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chamados Abertos</p>
                <p className="text-2xl text-red-600">{estatisticasSuporte.chamadosAbertos}</p>
              </div>
              <AlertTriangle size={32} className="text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chamados Resolvidos</p>
                <p className="text-2xl text-green-600">{estatisticasSuporte.chamadosResolvidos}</p>
              </div>
              <CheckCircle size={32} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Médio</p>
                <p className="text-2xl text-blue-600">{estatisticasSuporte.tempoMedioResolucao}</p>
              </div>
              <Clock size={32} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfação</p>
                <p className="text-2xl text-green-600">{estatisticasSuporte.satisfacaoUsuario}</p>
              </div>
              <CheckCircle size={32} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
          <TabsTrigger value="treinamento">Treinamento</TabsTrigger>
          <TabsTrigger value="manuais">Manuais e Documentos</TabsTrigger>
          <TabsTrigger value="chamados">Chamados</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* Tab: Chatbot */}
        <TabsContent value="chatbot" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                <MessageCircle size={20} className="text-[#003366]" />
                Assistente Virtual - Chatbot
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[400px] rounded-lg border border-gray-200 p-4 mb-4 overflow-y-auto">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.type === 'bot' && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-[#003366] shrink-0">
                          <Bot size={16} />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl p-3 ${
                          msg.type === 'user'
                            ? 'bg-[#003366] text-white rounded-br-none'
                            : 'bg-gray-100 text-black rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                          {msg.time}
                        </p>
                      </div>
                      {msg.type === 'user' && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 shrink-0">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                />
                <Button onClick={handleSendMessage} className="bg-[#003366] hover:bg-[#002244] text-white">
                  <Send size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Treinamento */}
        <TabsContent value="treinamento" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                  <GraduationCap size={20} className="text-[#003366]" />
                  Materiais de Treinamento
                </CardTitle>
                {currentProfile === 'admin' && (
                  <Dialog open={isCriarTreinamentoOpen} onOpenChange={setIsCriarTreinamentoOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                        <Plus size={20} className="mr-2" />
                        Criar Novo Treinamento
                      </Button>
                    </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
              {/* Área scrollável */}
              <div className="flex-1 overflow-y-auto px-6">
                <DialogHeader className="pt-6">
                  <DialogTitle>Criar Novo Treinamento</DialogTitle>
                  <DialogDescription>
                    Crie um novo material de treinamento para os usuários do sistema
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 pb-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="treinamento-titulo">Título do Treinamento *</Label>
                    <Input 
                      id="treinamento-titulo" 
                      placeholder="Ex: Guia de Início Rápido para Administradores"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="treinamento-categoria">Categoria *</Label>
                    <Select>
                      <SelectTrigger id="treinamento-categoria">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="regulamento">Regulamento</SelectItem>
                        <SelectItem value="procedimento">Procedimento</SelectItem>
                        <SelectItem value="fluxograma">Fluxograma</SelectItem>
                        <SelectItem value="template">Template/Modelo</SelectItem>
                        <SelectItem value="legislacao">Legislação</SelectItem>
                        <SelectItem value="tabela">Tabela de Referência</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="treinamento-descricao">Descrição</Label>
                    <Textarea 
                      id="treinamento-descricao" 
                      placeholder="Breve descrição sobre o conteúdo do treinamento..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="treinamento-data">Data de Criação *</Label>
                    <Input 
                      id="treinamento-data" 
                      type="date"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="treinamento-arquivo">Arquivo do Treinamento *</Label>
                    <FileInput id="treinamento-arquivo" accept=".pdf,.doc,.docx,.zip" />
                    <p className="text-xs text-gray-500">
                      Formatos aceitos: PDF, DOC, DOCX, ZIP (máx. 20MB)
                    </p>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Importante:</strong> Este treinamento ficará disponível para todos os usuários do sistema, incluindo requisitantes. Certifique-se de que o conteúdo é adequado para visualização pública.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Footer fixo */}
              <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsCriarTreinamentoOpen(false)}
                  disabled={treinamentoCriando}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                  onClick={criarTreinamento}
                  disabled={treinamentoCriando}
                >
                  {treinamentoCriando ? (
                    <>
                      <Upload size={16} className="mr-2 animate-pulse" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      Criar Treinamento
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-[24px] py-[0px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <GraduationCap size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-black">Guia de Início Rápido</h3>
                        <p className="text-sm text-gray-600 mt-1">Aprenda o básico do sistema em 15 minutos</p>
                        <BadgeStatus intent="info" weight="medium" className="mt-2">PDF • 2.5 MB</BadgeStatus>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <GraduationCap size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-black">Gestão de Processos</h3>
                        <p className="text-sm text-gray-600 mt-1">Tutorial completo sobre processos licitatórios</p>
                        <BadgeStatus intent="success" weight="medium" className="mt-2">Vídeo • 25 min</BadgeStatus>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <GraduationCap size={24} className="text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-black">Relatórios e Análises</h3>
                        <p className="text-sm text-gray-600 mt-1">Como gerar e interpretar relatórios</p>
                        <BadgeStatus intent="purple" weight="medium" className="mt-2">PDF • 1.8 MB</BadgeStatus>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <GraduationCap size={24} className="text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-black">Gestão de Fornecedores</h3>
                        <p className="text-sm text-gray-600 mt-1">Cadastro e controle de fornecedores</p>
                        <BadgeStatus intent="orange" weight="medium" className="mt-2">Vídeo • 18 min</BadgeStatus>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Manuais e Documentos Institucionais */}
        <TabsContent value="manuais" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                  <HelpCircle size={20} className="text-[#003366]" />
                  Manuais e Documentos Institucionais do Setor de Compras
                </CardTitle>
                {currentProfile === 'admin' && (
                  <Dialog open={isUploadDocumentoOpen} onOpenChange={setIsUploadDocumentoOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                        <Plus size={20} className="mr-2" />
                        Adicionar Documento Institucional
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
                      {/* Área scrollável */}
                      <div className="flex-1 overflow-y-auto px-6">
                        <DialogHeader className="pt-6">
                          <DialogTitle>Adicionar Documento Institucional</DialogTitle>
                          <DialogDescription>
                            Faça o upload de um novo documento institucional e preencha os metadados
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 pb-6">
                          <div className="space-y-1.5">
                            <Label htmlFor="doc-titulo">Título do Documento *</Label>
                            <Input 
                              id="doc-titulo" 
                              placeholder="Ex: Manual de Compras e Licitações SESC 2024"
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <Label htmlFor="doc-categoria">Categoria *</Label>
                            <Select>
                              <SelectTrigger id="doc-categoria">
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manual">Manual</SelectItem>
                                <SelectItem value="regulamento">Regulamento</SelectItem>
                                <SelectItem value="procedimento">Procedimento</SelectItem>
                                <SelectItem value="fluxograma">Fluxograma</SelectItem>
                                <SelectItem value="template">Template/Modelo</SelectItem>
                                <SelectItem value="legislacao">Legislação</SelectItem>
                                <SelectItem value="tabela">Tabela de Referência</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="doc-descricao">Descrição</Label>
                            <Textarea 
                              id="doc-descricao" 
                              placeholder="Breve descrição sobre o conteúdo do documento..."
                              rows={3}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="doc-data">Data de Atualização *</Label>
                            <Input 
                              id="doc-data" 
                              type="date"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="doc-arquivo">Arquivo do Documento *</Label>
                            <FileInput id="doc-arquivo" accept=".pdf,.doc,.docx,.zip" />
                            <p className="text-xs text-gray-500">
                              Formatos aceitos: PDF, DOC, DOCX, ZIP (máx. 20MB)
                            </p>
                          </div>

                          <Alert className="border-blue-200 bg-blue-50">
                            <HelpCircle className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800 text-sm">
                              <strong>Importante:</strong> Este documento ficará disponível para todos os usuários do sistema, incluindo requisitantes. Certifique-se de que o conteúdo é adequado para visualização pública.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>

                      {/* Footer fixo */}
                      <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setIsUploadDocumentoOpen(false)}
                          disabled={documentoUploadando}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                          onClick={uploadDocumento}
                          disabled={documentoUploadando}
                        >
                          {documentoUploadando ? (
                            <>
                              <Upload size={16} className="mr-2 animate-pulse" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Upload size={16} className="mr-2" />
                              Adicionar Documento
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Consulte os manuais, regulamentos e documentos institucionais do setor de compras. Estes documentos estão disponíveis para todos os usuários, incluindo requisitantes.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
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
                            <BadgeStatus intent="danger" weight="medium">PDF • 5.2 MB</BadgeStatus>
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
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <HelpCircle size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-black">Procedimentos para Requisitantes</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Guia prático para abertura e acompanhamento de solicitações de compra
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <BadgeStatus intent="info" weight="medium">PDF • 1.8 MB</BadgeStatus>
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
                        <div className="bg-green-100 p-3 rounded-lg">
                          <HelpCircle size={24} className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-black">Tabela de Alçadas e Limites</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Valores de alçada para aprovação de processos por modalidade
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <BadgeStatus intent="success" weight="medium">PDF • 0.5 MB</BadgeStatus>
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
                        <div className="bg-purple-100 p-3 rounded-lg">
                          <HelpCircle size={24} className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-black">Fluxograma de Processos de Compra</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Visualização do fluxo completo desde a requisição até a entrega
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <BadgeStatus intent="purple" weight="medium">PDF • 0.8 MB</BadgeStatus>
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
                            Modelos padronizados para requisições, justificativas e termos
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <BadgeStatus intent="warning" weight="medium">ZIP • 3.2 MB</BadgeStatus>
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
                        <div className="bg-orange-100 p-3 rounded-lg">
                          <HelpCircle size={24} className="text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-black">Legislação e Normativas Aplicáveis</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Compilação de leis, decretos e normativas que regem as compras públicas
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <BadgeStatus intent="orange" weight="medium">PDF • 8.5 MB</BadgeStatus>
                            <span className="text-xs text-gray-500">Atualizado em 01/01/2024</span>
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

        {/* Tab: Chamados */}
        <TabsContent value="chamados" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                <LifeBuoy size={20} className="text-[#003366]" />
                Chamados de Suporte
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
              {/* Filtros */}
              <Card className="border border-gray-200 mb-4">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Buscar por número ou título..."
                          value={filtroBusca}
                          onChange={(e) => setFiltroBusca(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-48">
                      <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                        <SelectTrigger>
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas as Categorias</SelectItem>
                          <SelectItem value="Sistema">Sistema</SelectItem>
                          <SelectItem value="Dúvida">Dúvida</SelectItem>
                          <SelectItem value="Acesso/Perfil">Acesso/Perfil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full md:w-48">
                      <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
                        <SelectTrigger>
                          <SelectValue placeholder="Prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas as Prioridades</SelectItem>
                          <SelectItem value="Urgente">Urgente</SelectItem>
                          <SelectItem value="Alta">Alta</SelectItem>
                          <SelectItem value="Média">Média</SelectItem>
                          <SelectItem value="Baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full md:w-48">
                      <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os Status</SelectItem>
                          <SelectItem value="Aberto">Aberto</SelectItem>
                          <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                          <SelectItem value="Aguardando TI">Aguardando TI</SelectItem>
                          <SelectItem value="Aguardando Usuário">Aguardando Usuário</SelectItem>
                          <SelectItem value="Resolvido">Resolvido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(filtroBusca || filtroCategoria !== 'todos' || filtroPrioridade !== 'todos' || filtroStatus !== 'todos') && (
                      <Button 
                        variant="outline" 
                        onClick={limparFiltros}
                        className="w-full md:w-auto"
                      >
                        <X size={16} className="mr-2" />
                        Limpar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de Chamados */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#003366] sticky top-0">
                    <TableRow>
                      <TableHead className="text-white">Número</TableHead>
                      <TableHead className="text-white">Título</TableHead>
                      <TableHead className="text-white">Categoria</TableHead>
                      <TableHead className="text-white">Prioridade</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Data Abertura</TableHead>
                      <TableHead className="text-white">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chamadosFiltrados.length > 0 ? (
                      chamadosFiltrados.map(chamado => (
                        <TableRow key={chamado.id}>
                          <TableCell className="text-gray-600">{chamado.numero}</TableCell>
                          <TableCell className="text-gray-600">{chamado.titulo}</TableCell>
                          <TableCell className="text-gray-600">{chamado.categoria}</TableCell>
                          <TableCell>
                            <BadgeStatus {...getPrioridadeBadge(chamado.prioridade)}>
                              {chamado.prioridade}
                            </BadgeStatus>
                          </TableCell>
                          <TableCell>
                            <BadgeStatus {...getStatusBadge(chamado.status)}>
                              {chamado.status}
                            </BadgeStatus>
                          </TableCell>
                          <TableCell className="text-gray-600">{chamado.dataAbertura}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => abrirDetalhesChamado(chamado)}
                            >
                              <Eye size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Nenhum chamado encontrado com os filtros aplicados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: FAQ */}
        <TabsContent value="faq" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 font-normal text-[16px] py-[8px]">
                  <HelpCircle size={20} className="text-[#003366]" />
                  Perguntas Frequentes (FAQ)
                </CardTitle>
                <Button className="bg-[#003366] hover:bg-[#002244] text-white" onClick={() => setIsNovoFaqOpen(true)}>
                  <Plus size={16} className="mr-2" />
                  Cadastrar FAQ
                </Button>
              </div>
            </CardHeader>
            <Dialog open={isNovoFaqOpen} onOpenChange={setIsNovoFaqOpen}>
              <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
                <div className="flex-1 overflow-y-auto px-6">
                  <DialogHeader className="pt-6">
                    <DialogTitle>Cadastrar Nova Pergunta (FAQ)</DialogTitle>
                    <DialogDescription>
                      Adicione uma nova pergunta e resposta para a base de conhecimento.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 pb-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="faq-pergunta">Pergunta *</Label>
                      <Input
                        id="faq-pergunta"
                        placeholder="Digite a pergunta frequente"
                        value={novaPergunta}
                        onChange={(e) => setNovaPergunta(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="faq-resposta">Resposta *</Label>
                      <Textarea
                        id="faq-resposta"
                        rows={3}
                        placeholder="Digite a resposta da FAQ"
                        value={novaResposta}
                        onChange={(e) => setNovaResposta(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="faq-categoria">Categoria *</Label>
                      <Select value={novaCategoria} onValueChange={setNovaCategoria}>
                        <SelectTrigger id="faq-categoria">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Processos">Processos</SelectItem>
                          <SelectItem value="Penalidades">Penalidades</SelectItem>
                          <SelectItem value="Relatórios">Relatórios</SelectItem>
                          <SelectItem value="Contratos">Contratos</SelectItem>
                          <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                          <SelectItem value="Sistema">Sistema</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter className="border-t bg-white pt-4 pb-4 px-6 flex gap-2 rounded-t-[0px] rounded-b-[8px]">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setNovaPergunta('');
                      setNovaResposta('');
                      setNovaCategoria('');
                      setIsNovoFaqOpen(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                    onClick={salvarNovoFaq}
                    disabled={!novaPergunta.trim() || !novaResposta.trim() || !novaCategoria}
                  >
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <CardContent className="pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
              <Accordion type="multiple" className="space-y-2">
                {faqs.map(item => (
                  <AccordionItem key={item.id} value={`item-${item.id}`} className="border border-gray-200 rounded-lg px-4 bg-gray-50">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-start justify-between gap-3 flex-1 text-left">
                        <span className="text-black">{item.pergunta}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-2">
                      <p className="text-sm text-gray-600 mb-3">{item.resposta}</p>
                      <div className="flex items-center gap-2">
                        <BadgeStatus intent="info" weight="light">{item.categoria}</BadgeStatus>
                        <span className="text-xs text-gray-500">{item.visualizacoes} visualizações</span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
