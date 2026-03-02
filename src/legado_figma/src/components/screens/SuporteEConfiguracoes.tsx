import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BadgeNew } from '../ui/badge-new';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { getBadgeMappingForPrioridade } from '../../lib/badge-mappings';
import { 
  MessageCircle, 
  GraduationCap, 
  LifeBuoy, 
  Plus, 
  Settings, 
  HelpCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Bell,
  Shield,
  Database,
  Users,
  Eye,
  MessageSquare
} from 'lucide-react';

interface SuporteEConfiguracoesProps {
  currentProfile: 'admin' | 'comprador' | 'requisitante';
}

export function SuporteEConfiguracoes({ currentProfile }: SuporteEConfiguracoesProps) {
  const [chamadoAberto, setChamadoAberto] = useState(false);
  const [respostaDialogAberto, setRespostaDialogAberto] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<any>(null);

  // Simula o usuário logado (requisitante = João Silva)
  const usuarioLogado = currentProfile === 'requisitante' ? 'João Silva' : 'Admin';

  const chamadosRecentes = [
    {
      id: 1,
      numero: 'SUP-2024-001',
      titulo: 'Erro ao exportar relatório em Excel',
      categoria: 'Sistema',
      prioridade: 'Alta',
      status: 'Aberto',
      dataAbertura: '25/01/2024 14:30',
      responsavel: 'Suporte Técnico',
      descricao: 'Usuário relata erro ao tentar exportar relatório...',
      solicitante: 'João Silva'
    },
    {
      id: 2,
      numero: 'SUP-2024-002',
      titulo: 'Dúvida sobre cadastro de fornecedor',
      categoria: 'Dúvida',
      prioridade: 'Média',
      status: 'Resolvido',
      dataAbertura: '24/01/2024 09:15',
      responsavel: 'Ana Costa',
      descricao: 'Como cadastrar fornecedor com CNPJ especial...',
      solicitante: 'João Silva'
    },
    {
      id: 3,
      numero: 'SUP-2024-003',
      titulo: 'Solicitação de novo usuário',
      categoria: 'Acesso',
      prioridade: 'Baixa',
      status: 'Em Andamento',
      dataAbertura: '23/01/2024 16:45',
      responsavel: 'TI',
      descricao: 'Solicitação de criação de usuário para novo funcionário...',
      solicitante: 'Maria Santos'
    }
  ];

  // Filtrar chamados baseado no perfil
  const chamadosFiltrados = currentProfile === 'requisitante' 
    ? chamadosRecentes.filter(c => c.solicitante === usuarioLogado)
    : chamadosRecentes; // Admin e Comprador veem todos

  const faqItems = [
    {
      id: 1,
      pergunta: 'Como cadastrar um novo processo licitatório?',
      resposta: 'Para cadastrar um novo processo, acesse o menu "Processos" > "Gerenciamento de Processos" e clique em "Cadastrar Processo". Preencha todos os campos obrigatórios e anexe os documentos necessários.',
      categoria: 'Processos',
      visualizacoes: 245
    },
    {
      id: 2,
      pergunta: 'Como aplicar uma penalidade a um fornecedor?',
      resposta: 'Acesse "Processos" > "Penalidades" e clique em "Aplicar Penalidade". Selecione a empresa, o processo, o tipo de penalidade e informe a justificativa detalhada.',
      categoria: 'Penalidades',
      visualizacoes: 189
    },
    {
      id: 3,
      pergunta: 'Como gerar relatórios personalizados?',
      resposta: 'No menu "Relatórios", utilize os filtros disponíveis para personalizar o relatório conforme suas necessidades. Você pode filtrar por status, empresa, período e outros critérios.',
      categoria: 'Relatórios',
      visualizacoes: 156
    },
    {
      id: 4,
      pergunta: 'Como alterar minha senha de acesso?',
      resposta: 'Clique no seu perfil no canto superior direito, selecione "Configurações da Conta" e depois "Alterar Senha". Digite a senha atual e a nova senha duas vezes.',
      categoria: 'Conta',
      visualizacoes: 134
    }
  ];

  const configuracoesSistema = [
    {
      categoria: 'Notificações',
      configuracoes: [
        { nome: 'E-mail de alertas de penalidades', ativo: true },
        { nome: 'Notificações de prorrogação de processos', ativo: true },
        { nome: 'Relatórios automáticos semanais', ativo: false },
        { nome: 'Alertas de documentos vencidos', ativo: true }
      ]
    },
    {
      categoria: 'Segurança',
      configuracoes: [
        { nome: 'Autenticação em dois fatores', ativo: false },
        { nome: 'Logout automático por inatividade', ativo: true },
        { nome: 'Log de atividades dos usuários', ativo: true },
        { nome: 'Backup automático diário', ativo: true }
      ]
    },
    {
      categoria: 'Sistema',
      configuracoes: [
        { nome: 'Envio automático para fornecedores', ativo: true },
        { nome: 'Limpeza automática de logs antigos', ativo: true },
        { nome: 'Indexação automática de documentos', ativo: false }
      ]
    }
  ];

  const estatisticasSuporte = {
    chamadosAbertos: chamadosFiltrados.filter(c => c.status === 'Aberto').length,
    chamadosResolvidos: chamadosFiltrados.filter(c => c.status === 'Resolvido').length,
    tempoMedioResolucao: '2.5 horas',
    satisfacaoUsuario: '4.8/5.0'
  };

  const getStatusBadge = (status: string): { intent: 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'purple' | 'orange', weight: 'heavy' | 'medium' | 'light' } => {
    const mappings = {
      'Aberto': { intent: 'danger' as const, weight: 'medium' as const },
      'Em Andamento': { intent: 'warning' as const, weight: 'medium' as const },
      'Resolvido': { intent: 'success' as const, weight: 'medium' as const }
    };
    return mappings[status as keyof typeof mappings] || { intent: 'neutral' as const, weight: 'medium' as const };
  };

  const abrirChamado = () => {
    setChamadoAberto(true);
    setTimeout(() => {
      setChamadoAberto(false);
      alert('Chamado aberto com sucesso! Número: SUP-2024-004');
    }, 1000);
  };

  const abrirDialogResposta = (chamado: any) => {
    setChamadoSelecionado(chamado);
    setRespostaDialogAberto(true);
  };

  const enviarResposta = () => {
    alert('Resposta enviada com sucesso!');
    setRespostaDialogAberto(false);
    setChamadoSelecionado(null);
  };

  // Verificar se o usuário pode abrir chamados
  const podeAbrirChamado = currentProfile === 'requisitante';
  // Verificar se o usuário pode responder chamados
  const podeResponderChamado = currentProfile === 'admin' || currentProfile === 'comprador';

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-black">Suporte e Configurações</h2>
          <p className="text-gray-600 mt-1">
            {podeAbrirChamado 
              ? 'Cards de acesso rápido: Chatbot, Treinamento, Abertura de Chamados'
              : 'Visualize e responda aos chamados de suporte'}
          </p>
        </div>
        {podeAbrirChamado && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#003366] hover:bg-[#002244] text-white" onClick={abrirChamado}>
                <Plus size={20} className="mr-2" />
                Abrir Chamado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Abrir Novo Chamado</DialogTitle>
                <DialogDescription>
                  Abra um chamado de suporte técnico para resolver sua questão.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
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
                <div>
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
                <div>
                  <Label htmlFor="titulo">Título do Chamado</Label>
                  <Input placeholder="Resumo do problema..." />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição Detalhada</Label>
                  <Textarea placeholder="Descreva o problema ou dúvida em detalhes..." rows={4} />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-[#003366] hover:bg-[#002244] text-white">
                    Abrir Chamado
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Cards de Acesso Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageCircle size={32} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl text-black">Chatbot</h3>
                <p className="text-gray-600">Assistente virtual para dúvidas rápidas</p>
                <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                  Iniciar Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <GraduationCap size={32} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl text-black">Treinamento</h3>
                <p className="text-gray-600">Vídeos e manuais do sistema</p>
                <Button className="mt-2 bg-green-600 hover:bg-green-700 text-white">
                  Acessar Materiais
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <LifeBuoy size={32} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl text-black">Suporte Técnico</h3>
                <p className="text-gray-600">
                  {podeAbrirChamado ? 'Contato direto com nossa equipe' : 'Visualizar e responder chamados'}
                </p>
                {podeAbrirChamado ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mt-2 bg-orange-600 hover:bg-orange-700 text-white">
                        Abrir Chamado
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                ) : (
                  <Button className="mt-2 bg-orange-600 hover:bg-orange-700 text-white">
                    Ver Chamados
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas de Suporte */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl text-red-600">{estatisticasSuporte.chamadosAbertos}</p>
                <p className="text-sm text-gray-600">Chamados Abertos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl text-green-600">{estatisticasSuporte.chamadosResolvidos}</p>
                <p className="text-sm text-gray-600">Chamados Resolvidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl text-blue-600">{estatisticasSuporte.tempoMedioResolucao}</p>
                <p className="text-sm text-gray-600">Tempo Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CheckCircle size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl text-yellow-600">{estatisticasSuporte.satisfacaoUsuario}</p>
                <p className="text-sm text-gray-600">Satisfação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="faq" className="space-y-4">
        <TabsList>
          <TabsTrigger value="faq">Perguntas Frequentes</TabsTrigger>
          <TabsTrigger value="chamados">
            {currentProfile === 'requisitante' ? 'Meus Chamados' : 'Todos os Chamados'}
          </TabsTrigger>
          {currentProfile === 'admin' && <TabsTrigger value="configuracoes">Configurações do Sistema</TabsTrigger>}
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl text-black flex items-center gap-2">
                <HelpCircle size={24} />
                Acessar Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg text-black">{item.pergunta}</h3>
                      <div className="flex items-center gap-2">
                        <BadgeNew variant="outline">{item.categoria}</BadgeNew>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Eye size={14} />
                          {item.visualizacoes}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{item.resposta}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chamados" className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl text-black">
                {currentProfile === 'requisitante' ? 'Histórico de Chamados' : 'Todos os Chamados do Sistema'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chamadosFiltrados.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    {currentProfile === 'requisitante' 
                      ? 'Você ainda não possui chamados abertos.'
                      : 'Não há chamados no momento.'}
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Abertura</TableHead>
                      {!podeAbrirChamado && <TableHead>Solicitante</TableHead>}
                      <TableHead>Responsável</TableHead>
                      {podeResponderChamado && <TableHead>Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chamadosFiltrados.map((chamado) => (
                      <TableRow key={chamado.id}>
                        <TableCell className="text-black">{chamado.numero}</TableCell>
                        <TableCell className="text-black">{chamado.titulo}</TableCell>
                        <TableCell className="text-gray-600">{chamado.categoria}</TableCell>
                        <TableCell>
                          <BadgeNew {...getBadgeMappingForPrioridade(chamado.prioridade)}>
                            {chamado.prioridade}
                          </BadgeNew>
                        </TableCell>
                        <TableCell>
                          <BadgeNew {...getStatusBadge(chamado.status)}>
                            {chamado.status}
                          </BadgeNew>
                        </TableCell>
                        <TableCell className="text-gray-600">{chamado.dataAbertura}</TableCell>
                        {!podeAbrirChamado && <TableCell className="text-gray-600">{chamado.solicitante}</TableCell>}
                        <TableCell className="text-gray-600">{chamado.responsavel}</TableCell>
                        {podeResponderChamado && (
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => abrirDialogResposta(chamado)}
                            >
                              <MessageSquare size={16} className="mr-1" />
                              Responder
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {currentProfile === 'admin' && (
          <TabsContent value="configuracoes" className="space-y-4">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl text-black flex items-center gap-2">
                  <Settings size={24} />
                  Área de Configurações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {configuracoesSistema.map((secao, index) => (
                    <div key={index}>
                      <h3 className="text-lg text-black mb-4 flex items-center gap-2">
                        {secao.categoria === 'Notificações' && <Bell size={20} />}
                        {secao.categoria === 'Segurança' && <Shield size={20} />}
                        {secao.categoria === 'Sistema' && <Database size={20} />}
                        {secao.categoria}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {secao.configuracoes.map((config, configIndex) => (
                          <div key={configIndex} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <span className="text-gray-700">{config.nome}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${config.ativo ? 'text-green-600' : 'text-red-600'}`}>
                                {config.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                              <Checkbox 
                                checked={config.ativo}
                                onCheckedChange={() => {}}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Algumas configurações podem afetar o funcionamento do sistema. 
                      Entre em contato com o administrador antes de fazer alterações importantes.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-2">
                    <Button className="bg-[#003366] hover:bg-[#002244] text-white">
                      Salvar Configurações
                    </Button>
                    <Button variant="outline">
                      Restaurar Padrões
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Dialog de Resposta (Admin e Comprador) */}
      {podeResponderChamado && (
        <Dialog open={respostaDialogAberto} onOpenChange={setRespostaDialogAberto}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Responder Chamado: {chamadoSelecionado?.numero}</DialogTitle>
              <DialogDescription>
                Envie uma resposta ao solicitante do chamado.
              </DialogDescription>
            </DialogHeader>
            {chamadoSelecionado && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-black">{chamadoSelecionado.titulo}</h4>
                    <BadgeNew {...getStatusBadge(chamadoSelecionado.status)}>
                      {chamadoSelecionado.status}
                    </BadgeNew>
                  </div>
                  <p className="text-sm text-gray-600"><strong>Solicitante:</strong> {chamadoSelecionado.solicitante}</p>
                  <p className="text-sm text-gray-600"><strong>Categoria:</strong> {chamadoSelecionado.categoria}</p>
                  <p className="text-sm text-gray-600"><strong>Descrição:</strong> {chamadoSelecionado.descricao}</p>
                </div>
                
                <div>
                  <Label htmlFor="resposta">Sua Resposta</Label>
                  <Textarea 
                    id="resposta"
                    placeholder="Digite sua resposta ao chamado..." 
                    rows={6}
                  />
                </div>
                
                <div>
                  <Label htmlFor="alterarStatus">Alterar Status do Chamado</Label>
                  <Select defaultValue={chamadoSelecionado.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aberto">Aberto</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Resolvido">Resolvido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-[#003366] hover:bg-[#002244] text-white"
                    onClick={enviarResposta}
                  >
                    Enviar Resposta
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setRespostaDialogAberto(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}